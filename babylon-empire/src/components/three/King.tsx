"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Procedural Babylonian king: robed figure with crown, staff, cape and beard.
// Idle breathing + royal gesture animation driven by game conditions
// (gesture raises when prosperity is high, slumps during famine).
const ROBE = "#8a2a5a";    // royal purple-red
const GOLD = "#d4a017";
const SKIN = "#c8a080";
const BEARD = "#2a1a10";

export function King({ position = [0, 0, 2] as [number, number, number], mood }: { position?: [number, number, number]; mood: "prosper" | "normal" | "trouble" }) {
  const group = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (group.current) {
      // idle breathing
      group.current.scale.y = 1 + Math.sin(t * 1.4) * 0.01;
    }
    if (arm.current) {
      // royal gesture: raised staff on prosperity, lowered in trouble
      const target = mood === "prosper" ? -0.5 : mood === "trouble" ? 0.15 : 0;
      arm.current.rotation.x += (target - arm.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={group} position={position} scale={1.35}>
      {/* robe body */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <coneGeometry args={[0.42, 1.1, 10]} />
        <meshStandardMaterial color={ROBE} roughness={0.8} />
      </mesh>
      {/* torso */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.3, 0.55, 10]} />
        <meshStandardMaterial color={ROBE} roughness={0.8} />
      </mesh>
      {/* gold belt */}
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.31, 0.31, 0.1, 10]} />
        <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.78, 0]} castShadow>
        <sphereGeometry args={[0.21, 16, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>
      {/* curled beard */}
      <mesh position={[0, 1.62, 0.08]}>
        <cylinderGeometry args={[0.12, 0.09, 0.3, 8]} />
        <meshStandardMaterial color={BEARD} roughness={0.9} />
      </mesh>
      {/* crown — horned Babylonian tiara */}
      <mesh position={[0, 1.98, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.24, 0.18, 10]} />
        <meshStandardMaterial color={GOLD} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 2.12, 0]}>
        <coneGeometry args={[0.12, 0.22, 10]} />
        <meshStandardMaterial color={GOLD} metalness={0.7} roughness={0.25} />
      </mesh>
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} position={[x, 2.02, 0]} rotation={[0, 0, x > 0 ? -0.4 : 0.4]}>
          <coneGeometry args={[0.05, 0.18, 6]} />
          <meshStandardMaterial color={GOLD} metalness={0.7} />
        </mesh>
      ))}
      {/* staff arm (animated) */}
      <mesh ref={arm} position={[0.34, 1.15, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.7, 8]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      {/* staff */}
      <mesh position={[0.36, 1.0, 0.02]}>
        <cylinderGeometry args={[0.025, 0.03, 1.7, 6]} />
        <meshStandardMaterial color="#5a4526" roughness={0.9} />
      </mesh>
      <mesh position={[0.36, 1.85, 0.02]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color={GOLD} metalness={0.8} />
      </mesh>
      {/* cape */}
      <mesh position={[0, 1.1, -0.18]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.5, 0.9, 0.06]} />
        <meshStandardMaterial color="#5a1a3a" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}