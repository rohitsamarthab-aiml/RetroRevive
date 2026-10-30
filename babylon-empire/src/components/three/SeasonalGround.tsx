"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "@/state/gameStore";
import type { SeasonKind } from "@/sim/types";

// Seasonal ground: color shifts with the sim season, water level reacts to
// drought/flood, farm plots show crop growth tied to the season.
const SEASON_COLORS: Record<SeasonKind, string> = {
  spring: "#8fa64e",
  summer: "#c2a265",
  autumn: "#a8894a",
  winter: "#8a7a5a",
};

export function SeasonalGround() {
  const season = useGame((s) => s.state.season);
  const weather = useGame((s) => s.state.weather);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const waterRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(80, 80, 40, 40);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    let s = 12345;
    const noise = () => { s = (s * 16807) % 2147483647; return (s / 2147483647) * 2 - 1; };
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const d = Math.sqrt(x * x + z * z);
      const riverBend = Math.exp(-Math.pow((x + 6 - z * 0.08) / 6, 2)) * -1.2;
      const hills = Math.max(0, d - 26) * 0.16;
      const wobble = noise() * 0.08 * Math.min(1, d / 10);
      pos.setY(i, riverBend + hills + wobble);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame((_, dt) => {
    if (matRef.current) {
      const target = new THREE.Color(SEASON_COLORS[season]);
      matRef.current.color.lerp(target, Math.min(1, dt * 0.8));
    }
    if (waterRef.current) {
      // flood raises water, drought lowers it
      const base = 0.08;
      const target =
        weather.kind === "flood" ? 0.55 :
        weather.kind === "drought" ? -0.35 :
        weather.kind === "rain" || weather.kind === "storm" ? 0.25 : base;
      const cur = waterRef.current.position.y;
      waterRef.current.position.y = cur + (target - cur) * Math.min(1, dt * 1.2);
    }
  });

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial ref={matRef} color={SEASON_COLORS[season]} roughness={0.95} />
      </mesh>
      {/* dynamic river plane (height reacts to weather) */}
      <mesh ref={waterRef} position={[0, 0.08, 0]}>
        <planeGeometry args={[70, 4.6]} />
        <meshStandardMaterial color="#2a6fbd" metalness={0.35} roughness={0.18} transparent opacity={0.92} />
      </mesh>
    </group>
  );
}