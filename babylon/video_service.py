"""RetroRevive: The Living Empire -- video service adapter.

An HONEST adapter for an external text-to-video generation service.

Design rules (hard constraints):
- If no endpoint/api key is configured, ``available`` is False and every
  generation attempt fails with a clear, non-fabricated error. The UI must
  show "video generation unavailable", never a fake success.
- Non-blocking: jobs run on a worker thread; the game loop is never blocked
  (hard project rule).
- The adapter speaks a generic HTTP polling protocol so that any real
  provider (Runway, Luma, a future service in another repo, etc.) can be
  wired in by implementing one small private method.
- Nothing is written to game state; generated references are metadata only.

Environment configuration (user action required):
    set BABYLON_VIDEO_API_URL=https://your-video-service.example/api
    set BABYLON_VIDEO_API_KEY=your-secret-key
    set BABYLON_VIDEO_MODEL=your-model-name        (optional)

Windows (persistent, PowerShell as Administrator):
    [Environment]::SetEnvironmentVariable('BABYLON_VIDEO_API_URL', '...', 'User')
    [Environment]::SetEnvironmentVariable('BABYLON_VIDEO_API_KEY', '...', 'User')
"""
from __future__ import annotations

import json
import os
import queue
import threading
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from typing import Callable, Optional

# ---------------------------------------------------------------------------
# Job model
# ---------------------------------------------------------------------------

@dataclass
class VideoJob:
    prompt: str
    scene_id: str                     # cinematic id this video is associated with
    job_id: str = ""
    status: str = "queued"            # queued|running|succeeded|failed|unavailable
    progress: float = 0.0
    video_url: str = ""
    error: str = ""
    created_at: float = field(default_factory=time.time)
    metadata: dict = field(default_factory=dict)


class VideoService:
    """Real HTTP adapter. Fails loudly when unconfigured; never fakes output."""

    def __init__(self, api_url: str | None = None, api_key: str | None = None,
                 model: str | None = None, timeout: float = 20.0):
        self.api_url = api_url or os.environ.get("BABYLON_VIDEO_API_URL", "")
        self.api_key = api_key or os.environ.get("BABYLON_VIDEO_API_KEY", "")
        self.model = model or os.environ.get("BABYLON_VIDEO_MODEL", "")
        self.timeout = timeout
        self._jobs: dict[str, VideoJob] = {}
        self._queue: "queue.Queue[VideoJob]" = queue.Queue()
        self._lock = threading.Lock()
        self._worker: threading.Thread | None = None
        self._stop = threading.Event()

    # -- public surface -----------------------------------------------------

    @property
    def available(self) -> bool:
        return bool(self.api_url)

    def status_line(self) -> str:
        if self.available:
            return f"Video service configured: {self.api_url}"
        return ("Video generation unavailable: set BABYLON_VIDEO_API_URL and "
                "BABYLON_VIDEO_API_KEY environment variables.")

    def submit(self, prompt: str, scene_id: str, metadata: dict | None = None) -> VideoJob:
        job = VideoJob(prompt=prompt, scene_id=scene_id,
                       metadata=dict(metadata or {}))
        if not self.available:
            job.status = "unavailable"
            job.error = self.status_line()
            with self._lock:
                self._jobs[job.job_id or id(job)] = job
            return job
        with self._lock:
            self._jobs[job.job_id] = job
        self._ensure_worker()
        self._queue.put(job)
        return job

    def get_job(self, job_id: str) -> Optional[VideoJob]:
        with self._lock:
            return self._jobs.get(job_id)

    def poll(self) -> list[VideoJob]:
        """Non-blocking snapshot of all jobs (safe to call from the game loop)."""
        with self._lock:
            return list(self._jobs.values())

    def shutdown(self) -> None:
        self._stop.set()

    # -- internals -----------------------------------------------------------

    def _ensure_worker(self) -> None:
        if self._worker and self._worker.is_alive():
            return
        self._stop.clear()
        self._worker = threading.Thread(target=self._run, daemon=True)
        self._worker.start()

    def _run(self) -> None:
        while not self._stop.is_set():
            try:
                job = self._queue.get(timeout=0.5)
            except queue.Empty:
                continue
            try:
                self._execute(job)
            except Exception as exc:            # noqa: BLE001 - jobs must not crash the worker
                job.status = "failed"
                job.error = f"Generation failed: {exc}"

    def _execute(self, job: VideoJob) -> None:
        job.status = "running"
        url, headers = self._submit_request(job)
        try:
            with urllib.request.urlopen(
                urllib.request.Request(url, data=json.dumps(
                    {"prompt": job.prompt,
                     "model": self.model} if self.model else {"prompt": job.prompt}
                ).encode(), headers=headers, method="POST"), timeout=self.timeout
            ) as resp:
                payload = json.loads(resp.read().decode())
        except urllib.error.HTTPError as exc:
            job.status = "failed"
            job.error = f"Service returned HTTP {exc.code}."
            return
        except (urllib.error.URLError, TimeoutError, OSError, ValueError) as exc:
            job.status = "failed"
            job.error = f"Could not reach video service: {exc}"
            return
        job.job_id = str(payload.get("id") or payload.get("job_id") or "")
        job.metadata["provider_payload_keys"] = sorted(payload.keys())
        # Poll until terminal state; keeps the game thread free.
        deadline = time.time() + 600
        while time.time() < deadline and not self._stop.is_set():
            if self._poll_once(job, payload):
                return
            time.sleep(2.0)
        job.status = "failed"
        job.error = "Generation timed out after 10 minutes."

    def _submit_request(self, job: VideoJob) -> tuple[str, dict]:
        base = self.api_url.rstrip("/")
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return base + "/generations", headers

    def _poll_once(self, job: VideoJob, first_payload: dict) -> bool:
        """Advance one polling step; returns True when the job is terminal."""
        if first_payload.get("status") in ("succeeded", "completed", "done"):
            job.status = "succeeded"
            job.video_url = (first_payload.get("video_url")
                             or first_payload.get("url") or "")
            if not job.video_url:
                job.status = "failed"
                job.error = "Service reported success but returned no video URL."
            return True
        if first_payload.get("status") in ("failed", "error"):
            job.status = "failed"
            job.error = str(first_payload.get("error") or "Provider reported failure.")
            return True
        # Long-running provider: poll the status endpoint.
        if job.job_id:
            base = self.api_url.rstrip("/")
            headers = {}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"
            try:
                with urllib.request.urlopen(urllib.request.Request(
                    f"{base}/generations/{job.job_id}", headers=headers
                ), timeout=self.timeout) as resp:
                    payload = json.loads(resp.read().decode())
            except (urllib.error.URLError, OSError, ValueError) as exc:
                job.error = f"Polling failed: {exc}"
                return False
            first_payload.update(payload)
        return False


def open_video_in_browser(url: str) -> bool:
    """Best-effort playback of a generated video via the OS default player."""
    if not url:
        return False
    import webbrowser
    return webbrowser.open(url) is not False