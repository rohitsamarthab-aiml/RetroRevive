"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { HUD } from "@/components/ui/HUD";
import { useGame } from "@/state/gameStore";
import { GAMES } from "@/data/games";

const GameCanvas = dynamic(() => import("@/components/three/GameCanvas").then((m) => m.GameCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <p className="text-[#d4a017] animate-pulse">Loading the plains of Mesopotamia…</p>
    </div>
  ),
});

export default function HammurabiPlayPage() {
  const loadLocal = useGame((s) => s.loadLocal);
  useEffect(() => {
    loadLocal();
    // record "recently played" for the homepage
    try {
      const rec: string[] = JSON.parse(localStorage.getItem("rr-recent") ?? "[]").filter((x: string) => x !== "hammurabi");
      localStorage.setItem("rr-recent", JSON.stringify(["hammurabi", ...rec].slice(0, 3)));
    } catch { /* ignore */ }
  }, [loadLocal]);

  return (
    <main className="fixed inset-0">
      <GameCanvas />
      <HUD />
      <link rel="prefetch" href="/games/hammurabi" />
      <span className="hidden">{GAMES.length}</span>
    </main>
  );
}