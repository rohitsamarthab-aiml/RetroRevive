"use client";

// Lightweight WebAudio ambience + event sounds. No asset downloads needed:
// sounds are synthesized (wind, rain noise, bell/harvest chime, alarm).
// Volume + mute controls exposed via the store.
import { useEffect, useRef } from "react";
import { useGame } from "@/state/gameStore";

type Node = { ctx: AudioContext; gain: GainNode; stop: () => void };

function makeNoise(ctx: AudioContext, gainVal: number): Node {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 500;
  const gain = ctx.createGain();
  gain.gain.value = gainVal;
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
  return { ctx, gain, stop: () => src.stop() };
}

function chime(ctx: AudioContext, freq: number, dur = 0.5, vol = 0.2) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.frequency.value = freq;
  osc.type = "sine";
  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur);
}

export function GameAudio() {
  const weather = useGame((s) => s.state.weather);
  const lastChronicleLen = useGame((s) => s.state.chronicle.length);
  const quality = useGame((s) => s.quality);
  const ambientRef = useRef<Node | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useMuteState();

  useEffect(() => {
    if (muted) {
      ambientRef.current?.stop();
      ambientRef.current = null;
      return;
    }
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    const ctx = ctxRef.current;
    ambientRef.current?.stop();
    if (weather.kind === "rain" || weather.kind === "storm") {
      ambientRef.current = makeNoise(ctx, quality === "low" ? 0.04 : 0.09);
    } else if (weather.kind === "clear") {
      ambientRef.current = makeNoise(ctx, 0.015); // gentle wind
    } else {
      ambientRef.current = null;
    }
    return () => { ambientRef.current?.stop(); ambientRef.current = null; };
  }, [weather.kind, muted, quality]);

  // event sounds on new chronicle entries
  const lastLenRef = useRef(0);
  useEffect(() => {
    if (lastLenRef.current === lastChronicleLen) return;
    const isNew = lastChronicleLen > lastLenRef.current;
    lastLenRef.current = lastChronicleLen;
    if (!isNew || muted || !ctxRef.current) return;
    const last = useGame.getState().state.chronicle.at(-1);
    if (!last) return;
    if (last.kind === "good") chime(ctxRef.current, 880, 0.4, 0.15);
    if (last.kind === "crisis") chime(ctxRef.current, 160, 0.8, 0.25);
    if (last.kind === "bad") chime(ctxRef.current, 320, 0.5, 0.15);
  }, [lastChronicleLen, muted]);

  return (
    <button
      className="absolute top-3 right-3 z-50 btn-stone pointer-events-auto"
      onClick={() => setMuted(!muted)}
      title="Toggle sound"
    >
      {muted ? "🔇 Muted" : "🔊 Sound"}
    </button>
  );
}

function useMuteState(): [boolean, (v: boolean) => void] {
  const [muted, setMuted] = useMutedStore();
  return [muted, setMuted];
}

import { create } from "zustand";
const useMutedStore = create<{ muted: boolean; set: (v: boolean) => void }>((set) => ({
  muted: false,
  set: (v) => set({ muted: v }),
}));
function useMutedStoreRef() { return useMutedStore; }