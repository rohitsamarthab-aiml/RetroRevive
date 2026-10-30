"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { HUD } from "@/components/ui/HUD";
import { useGame } from "@/state/gameStore";

// Canvas must be client-only (WebGL).
const GameCanvas = dynamic(() => import("@/components/three/GameCanvas").then((m) => m.GameCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <p className="text-[#d4a017] animate-pulse">Loading the plains of Mesopotamia…</p>
    </div>
  ),
});

export default function PlayPage() {
  const loadLocal = useGame((s) => s.loadLocal);
  useEffect(() => { loadLocal(); }, [loadLocal]);

  return (
    <main className="fixed inset-0">
      <GameCanvas />
      <HUD />
    </main>
  );
}