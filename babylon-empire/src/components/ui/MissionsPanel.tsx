"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/state/gameStore";
import { missionsFor, achievementsFor } from "@/state/missions";

export function MissionsPanel() {
  const state = useGame((s) => s.state);
  const [missions, setMissions] = useState(() => missionsFor(state));
  const [achievements, setAchievements] = useState(() => achievementsFor(state));

  useEffect(() => {
    const m = missionsFor(state);
    const a = achievementsFor(state);
    setMissions(m);
    setAchievements(a);
    // persist newly unlocked achievements
    try {
      const stored: string[] = JSON.parse(localStorage.getItem("rr-achievements") ?? "[]");
      const newly = a.filter((x) => x.unlocked && !stored.includes(x.id)).map((x) => x.id);
      if (newly.length) localStorage.setItem("rr-achievements", JSON.stringify([...stored, ...newly]));
    } catch { /* ignore */ }
  }, [state]);

  return (
    <div className="space-y-4">
      <section>
        <h3 className="text-[#d4a017] mb-2">Royal Missions</h3>
        {missions.map((m) => (
          <div key={m.id} className="mb-3">
            <div className="flex justify-between text-sm">
              <span>{m.title} {m.done && <span className="text-emerald-400">✓</span>}</span>
              <span className="text-xs text-[#8a7a5a]">{Math.round(m.progress * 100)}%</span>
            </div>
            <p className="text-xs text-[#8a7a5a] mb-1">{m.description}</p>
            <div className="h-1.5 bg-[#241c10] rounded">
              <div className="h-full bg-[#d4a017] rounded" style={{ width: `${m.progress * 100}%` }} />
            </div>
          </div>
        ))}
      </section>
      <section>
        <h3 className="text-[#d4a017] mb-2">Achievements</h3>
        <div className="grid grid-cols-2 gap-2">
          {achievements.map((a) => (
            <div key={a.id} className={`panel p-2 text-xs ${a.unlocked ? "border-[#d4a017]" : "opacity-40"}`}>
              <b>{a.title}</b>
              <p className="text-[#8a7a5a]">{a.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}