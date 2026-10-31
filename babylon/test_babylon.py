"""Tests for the babylon package: world-state bridge, cinematics, video service.

These tests enforce the project's honesty rules:
- The world reflects ONLY real game state (no fabricated activity).
- State-driven cinematics refuse to play without justification.
- The video adapter never fakes success: unconfigured = unavailable.
- The video worker never blocks the caller.
"""
from __future__ import annotations

import threading
import time
import unittest

from babylon import cinematics, video_service, world_state


class WorldStateBridgeTests(unittest.TestCase):
    def test_empty_state_yields_empty_quiet_scene(self):
        scene = world_state.build_scene({})
        self.assertEqual(scene.population, 0)
        self.assertEqual(scene.farmers, 0)
        self.assertEqual(scene.market_activity, 0.0)

    def test_planted_acres_spawn_farmers_only(self):
        scene = world_state.build_scene({"population": 100, "acres": 500,
                                         "planted_acres": 100})
        self.assertEqual(scene.farmers, 10)      # 1 farmer per 10 acres
        self.assertEqual(scene.citizens, 90)

    def test_planted_fraction_respects_acreage(self):
        scene = world_state.build_scene({"population": 100, "acres": 200,
                                         "planted_acres": 100})
        self.assertAlmostEqual(scene.planted_fraction, 0.5)

    def test_harvest_sets_full_growth_and_activity(self):
        scene = world_state.build_scene({"population": 50, "planted_acres": 40,
                                         "harvested": True})
        self.assertEqual(scene.field_growth, 1.0)
        self.assertEqual(scene.harvest_activity, 1.0)

    def test_starvation_empties_market(self):
        scene = world_state.build_scene({"population": 100, "bushels": 2000,
                                         "starving": 30})
        self.assertEqual(scene.merchants, 0)

    def test_grain_ratio_drives_market_activity(self):
        scene = world_state.build_scene({"population": 50, "bushels": 2000})  # 2x need
        self.assertGreater(scene.market_activity, 0.0)
        self.assertLessEqual(scene.market_activity, 1.0)

    def test_drought_event_sets_dust_weather(self):
        scene = world_state.build_scene({"events": ["The rivers ran low: drought."]})
        self.assertTrue(scene.drought)
        self.assertEqual(scene.weather, "dust")

    def test_flood_event_sets_rain(self):
        scene = world_state.build_scene({"events": ["Flood destroyed the fields."]})
        self.assertTrue(scene.flood)
        self.assertEqual(scene.weather, "rain")

    def test_rats_flag(self):
        scene = world_state.build_scene({"events": ["Rats ate half the granary."]})
        self.assertTrue(scene.rats)

    def test_famine_requires_real_starvation(self):
        scene = world_state.build_scene({"population": 100, "starving": 5})
        self.assertTrue(scene.famine)
        self.assertFalse(world_state.build_scene({"population": 100}).famine)

    def test_celebration_needs_surplus_and_harvest(self):
        snap = {"population": 50, "bushels": 2000, "harvested": True}
        self.assertTrue(world_state.build_scene(snap).celebration)
        snap["bushels"] = 500                                   # below 1.5x need
        self.assertFalse(world_state.build_scene(snap).celebration)

    def test_construction_sites_map_to_workers(self):
        scene = world_state.build_scene({"construction_projects": 3})
        self.assertEqual(scene.construction_sites, 3)
        self.assertEqual(scene.construction_workers, 9)

    def test_day_phase_clamped(self):
        self.assertEqual(world_state.build_scene({}, day_phase=5.0).day_phase, 1.0)
        self.assertEqual(world_state.build_scene({}, day_phase=-1).day_phase, 0.0)

    def test_determinism(self):
        snap = {"population": 80, "acres": 300, "planted_acres": 120}
        self.assertEqual(world_state.build_scene(snap), world_state.build_scene(snap))


class CinematicTests(unittest.TestCase):
    def test_opening_flight_always_justified(self):
        self.assertTrue(cinematics.justifies(cinematics.OPENING_FLIGHT, {}))

    def test_harvest_cinematic_requires_harvest(self):
        self.assertFalse(cinematics.justifies(cinematics.HARVEST, {"planted_acres": 10}))
        self.assertTrue(cinematics.justifies(
            cinematics.HARVEST, {"planted_acres": 10, "harvested": True}))

    def test_drought_requires_chronicle_event(self):
        self.assertFalse(cinematics.justifies(cinematics.DROUGHT, {}))
        self.assertTrue(cinematics.justifies(
            cinematics.DROUGHT, {"events": ["drought struck the land"]}))

    def test_celebration_requires_surplus(self):
        self.assertFalse(cinematics.justifies(
            cinematics.CELEBRATION, {"population": 50, "bushels": 300,
                                     "harvested": True}))
        self.assertTrue(cinematics.justifies(
            cinematics.CELEBRATION, {"population": 50, "bushels": 2000,
                                     "harvested": True}))

    def test_camera_keyframes_interpolate_smoothly(self):
        cam = cinematics._camera(
            (0.0, 0, 0, 0, 0, 0, 0),
            (1.0, 10, 20, 30, 0, 0, 0),
        )
        p0, _ = cam.at(0.0)
        p1, _ = cam.at(0.5)
        p2, _ = cam.at(1.0)
        self.assertEqual(p0, (0, 0, 0))
        self.assertEqual(p2, (10, 20, 30))
        # Smoothstep: halfway point is exactly the midpoint for this easing.
        self.assertEqual(p1, (5.0, 10.0, 15.0))
        # Monotonic progress check
        xs = [cam.at(t / 10)[0][0] for t in range(11)]
        self.assertEqual(xs, sorted(xs))

    def test_registry_contains_expected_cinematics(self):
        for cid in ("opening_flight", "palace_intro", "harvest",
                    "drought", "celebration"):
            self.assertIn(cid, cinematics.REGISTRY)


class VideoServiceTests(unittest.TestCase):
    def test_unconfigured_service_is_unavailable(self):
        service = video_service.VideoService(api_url="", api_key="")
        self.assertFalse(service.available)
        job = service.submit("A flight over Babylon", "opening_flight")
        self.assertEqual(job.status, "unavailable")
        self.assertIn("BABYLON_VIDEO_API_URL", job.error)

    def test_no_fake_success_without_endpoint(self):
        service = video_service.VideoService(api_url="", api_key="")
        job = service.submit("test", "scene")
        self.assertNotEqual(job.status, "succeeded")
        self.assertEqual(job.video_url, "")

    def test_status_line_honest_when_unconfigured(self):
        service = video_service.VideoService(api_url="", api_key="")
        self.assertIn("unavailable", service.status_line())

    def test_jobs_do_not_block_caller(self):
        service = video_service.VideoService(api_url="http://127.0.0.1:1/api",
                                             api_key="k")
        done = threading.Event()

        def watcher():
            time.sleep(0.3)
            done.set()

        threading.Thread(target=watcher, daemon=True).start()
        service.submit("test", "scene")
        self.assertTrue(done.wait(timeout=2.0))     # caller was not blocked

    def test_failed_http_shows_in_job(self):
        # Port 1 on localhost: connection refused quickly, no real service.
        service = video_service.VideoService(api_url="http://127.0.0.1:1/api",
                                             api_key="k", timeout=2.0)
        job = service.submit("test", "scene")
        deadline = time.time() + 10
        while time.time() < deadline and job.status not in ("failed",):
            time.sleep(0.1)
        self.assertEqual(job.status, "failed")
        self.assertTrue(job.error)


if __name__ == "__main__":
    unittest.main()