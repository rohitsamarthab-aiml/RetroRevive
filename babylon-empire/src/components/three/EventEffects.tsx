"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "@/state/gameStore";
import type { BuildingInstance } from "@/sim/types";
import { BUILDINGS } from "@/sim/buildings";

// Event-driven visual effects layer.
// Harvest celebration: firework-like sparks when chronicle reports a good harvest.
// Famine: dark vignette + urgent pulsing beacon over the granary.
export function EventEffects() {
  const state = useGame((s) => s.state);
  const lastTurn = useRef(-1);
  const celebrateRef = useRef<THREE.Group>(null);
  const famineRef = useRef<THREE.Mesh>(null);

  const last = state.chronicle[state.chronicle.length - 1];
  const celebrate = last?.kind === "good" && /settlers arrive|completed/.test(last.text) && last.turn !== lastTurn.current;
  const famine = state.resources.grain < state.population.total * 5;

  useFrame(({ clock }) => {
    if (celebrate && celebrateRef.current) {
      lastTurn.current = last.turn;
      celebrateRef.current.rotation.y = clock.elapsedTime * 2;
    }
    if (famineRef.current) {
      const m = famineRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.25 + Math.sin(clock.elapsedTime * 6) * 0.2;
    }
  });

  const granary = state.buildings.find((b) => b.type === "granary");

  return (
    <group>
      {famine && granary && (
        <mesh ref={famineRef} position={[granary.x * 4, 4, granary.z * 4]}>
          <sphereGeometry args={[1.4, 12, 12]} />
          <meshBasicMaterial color="#ff3020" transparent opacity={0.3} />
        </mesh>
      )}
      {celebrate && (
        <group ref={celebrateRef} position={[0, 6, 0]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[Math.cos(i * 1.256) * 2, Math.sin(i * 1.9) * 1.2, Math.sin(i * 1.256) * 2]}>
              <sphereGeometry args={[0.22, 8, 8]} />
              <meshBasicMaterial color={i % 2 ? "#ffd700" : "#e0662a"} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}