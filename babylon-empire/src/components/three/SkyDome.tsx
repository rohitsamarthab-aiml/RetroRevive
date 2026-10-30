"use client";

// Sky, day/night tinting and weather-driven atmosphere.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "@/state/gameStore";

const COLOR_DAY = new THREE.Color("#87b7e0");
const COLOR_SUNSET = new THREE.Color("#e08a4a");
const COLOR_NIGHT = new THREE.Color("#131b2e");
const COLOR_STORM = new THREE.Color("#5a6470");

export function SkyDome() {
  const state = useGame((s) => s.state);
  const skyRef = useRef<THREE.Color>(null!);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  // Day/night cycle driven by turn count (one full cycle per 8 turns, animated in-frame)
  const cycleT = (state.turn % 8) / 8;

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.01 + cycleT) % 1; // slow continuous drift
    const sunAngle = t * Math.PI * 2;
    const sunHeight = Math.sin(sunAngle);
    if (sunRef.current) {
      sunRef.current.position.set(Math.cos(sunAngle) * 60, sunHeight * 50, 20);
      sunRef.current.intensity = Math.max(0.05, sunHeight) * 1.3;
    }
    if (matRef.current) {
      const c = new THREE.Color();
      if (sunHeight > 0.25) c.copy(COLOR_DAY);
      else if (sunHeight > -0.1) c.copy(COLOR_SUNSET).lerp(COLOR_DAY, (sunHeight + 0.1) / 0.35);
      else c.copy(COLOR_NIGHT);
      if (state.weather.kind === "storm" || state.weather.kind === "rain") c.lerp(COLOR_STORM, 0.6);
      if (state.weather.kind === "drought") c.lerp(new THREE.Color("#c9a05a"), 0.5);
      matRef.current.color.copy(c);
    }
  });

  return (
    <>
      <mesh>
        <sphereGeometry args={[180, 16, 16]} />
        <meshBasicMaterial ref={matRef} side={THREE.BackSide} fog={false} />
      </mesh>
      <directionalLight ref={sunRef} position={[30, 40, 20]} intensity={1.3} />
    </>
  );
}