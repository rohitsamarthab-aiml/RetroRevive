"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { ThroneRoom } from "../three/ThroneRoom";
import { useGame } from "@/state/gameStore";
import { advise } from "@/sim/advisor";

// Throne room overlay: enter the palace, see the King and Vizier,
// and receive the kingdom report from real game state.
export function ThroneRoomOverlay({ onClose }: { onClose: () => void }) {
  const state = useGame((s) => s.state);
  const advice = advise(state);

  return (
    <div className="absolute inset-0 z-50 bg-black/90 flex">
      <div className="relative flex-1">
        <Canvas shadows camera={{ position: [0, 2.2, 3], fov: 55 }}>
          <color attach="background" args={["#241505"]} />
          <fog attach="fog" args={["#241505", 10, 30]} />
          <ThroneRoom />
          <ContactShadows position={[0, 0.01, 0]} opacity={0.6} scale={20} blur={2.4} />
          <OrbitControls
            target={[0, 1.4, -4]}
            minDistance={3}
            maxDistance={12}
            maxPolarAngle={Math.PI / 2.05}
            enablePan={false}
          />
        </Canvas>
        <button
          className="btn-royal absolute top-4 right-4 z-10"
          onClick={onClose}
        >
          ✕ Leave Throne Room
        </button>
      </div>
      <div className="w-[380px] panel m-3 p-6 overflow-y-auto pointer-events-auto">
        <h2 className="text-xl text-[#d4a017] mb-1">Audience with the King</h2>
        <p className="text-xs text-[#8a7a5a] mb-4">
          Year {state.year} · {state.season} · Turn {state.turn} · Population {state.population.total}
        </p>
        <p className="text-sm text-[#b8a888] mb-4 italic">
          &ldquo;My kingdom stands at {state.resources.grain} grain, {state.resources.gold} gold,
          {" "}{state.resources.land} acres, and {state.population.total} loyal souls.
          My Grand Vizier advises:&rdquo;
        </p>
        <ul className="text-sm space-y-2">
          {advice.map((a, i) => (
            <li key={i} className={
              a.severity === "critical" ? "text-red-400" : a.severity === "warning" ? "text-amber-400" : "text-[#b8a888]"
            }>
              • <b>{a.topic}:</b> {a.message}
            </li>
          ))}
        </ul>
        <div className="mt-6 text-xs text-[#8a7a5a]">
          Drag to look around the throne room. The King&apos;s bearing reflects the realm:
          proud in prosperity, bowed in crisis.
        </div>
      </div>
    </div>
  );
}