"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "@/state/gameStore";

// GPU point-cloud rain/storm/drought-dust particles.
export function RainParticles() {
  const weather = useGame((s) => s.state.weather);
  const count = 800;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 60;
      arr[i * 3 + 1] = Math.random() * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return arr;
  }, []);

  const active = weather.kind === "rain" || weather.kind === "storm" || weather.kind === "drought";

  useFrame((_, dt) => {
    if (!ref.current || !active) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const speed = weather.kind === "drought" ? 2 : 22;
    const drift = weather.kind === "drought" ? 4 : 1.5;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= speed * dt;
      arr[i * 3] += drift * dt;
      if (arr[i * 3 + 1] < 0) {
        arr[i * 3 + 1] = 25;
        arr[i * 3] = (Math.random() - 0.5) * 60;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 60;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={weather.kind === "drought" ? 0.25 : 0.09}
        color={weather.kind === "drought" ? "#c9a05a" : "#9fc4e8"}
        transparent
        opacity={0.65}
      />
    </points>
  );
}