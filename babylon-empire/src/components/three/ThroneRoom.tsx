"use client";

import { useMemo } from "react";
import { King } from "./King";
import { useGame } from "@/state/gameStore";

// Throne room: interior scene viewable via a "Throne" camera preset.
// Contains the King, the advisor figure, throne dais, columns and braziers.
const GOLD = "#d4a017";

function Column({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.5, 0.6, 6, 10]} />
        <meshStandardMaterial color="#b0824a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.1, 0]}>
        <boxGeometry args={[1.6, 0.4, 1.6]} />
        <meshStandardMaterial color="#9a6f3c" roughness={0.85} />
      </mesh>
      <mesh position={[0, -3.1, 0]}>
        <boxGeometry args={[1.7, 0.4, 1.7]} />
        <meshStandardMaterial color="#9a6f3c" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Brazier({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.35, 0.25, 0.9, 8]} />
        <meshStandardMaterial color="#5a4526" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.28, 10, 10]} />
        <meshStandardMaterial color="#e0662a" emissive="#d45a1a" emissiveIntensity={1.4} />
      </mesh>
      <pointLight position={[0, 1, 0]} color="#ff8a3a" intensity={4} distance={9} />
    </group>
  );
}

export function ThroneRoom() {
  const state = useGame((s) => s.state);
  const mood: "prosper" | "normal" | "trouble" =
    state.happiness >= 70 && state.resources.grain > state.population.total * 10
      ? "prosper"
      : state.happiness < 40 || state.resources.grain < state.population.total * 5
        ? "trouble"
        : "normal";

  const columns = useMemo(() => {
    const list: [number, number, number][] = [];
    for (const x of [-6, -2, 2, 6]) for (const z of [-4, 4]) list.push([x, 3, z]);
    return list;
  }, []);

  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 16]} />
        <meshStandardMaterial color="#7a5a34" roughness={0.85} />
      </mesh>
      {/* back wall with gold relief band */}
      <mesh position={[0, 3, -6.5]} receiveShadow>
        <boxGeometry args={[20, 6, 0.5]} />
        <meshStandardMaterial color="#8a6234" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.6, -6.2]}>
        <boxGeometry args={[20, 0.8, 0.15]} />
        <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.3} />
      </mesh>
      {columns.map((p, i) => <Column key={i} position={p} />)}
      {/* throne dais */}
      <mesh position={[0, 0.3, -4.5]} receiveShadow>
        <boxGeometry args={[6, 0.6, 3]} />
        <meshStandardMaterial color="#9a723e" roughness={0.85} />
      </mesh>
      {/* throne */}
      <mesh position={[0, 1.2, -4.8]} castShadow>
        <boxGeometry args={[1.2, 1.6, 0.8]} />
        <meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* The King stands beside the throne */}
      <King position={[1.4, 0.6, -3.6]} mood={mood} />
      {/* Grand Vizier — robed, smaller, at the foot of the dais */}
      <group position={[-1.8, 0, -1.5]} scale={1.15}>
        <mesh position={[0, 0.7, 0]} castShadow>
          <coneGeometry args={[0.4, 1.05, 10]} />
          <meshStandardMaterial color="#1e5bb8" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.35, 0]}>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshStandardMaterial color="#c8a080" />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.16, 0.19, 0.12, 8]} />
          <meshStandardMaterial color="#e8dcc3" />
        </mesh>
      </group>
      <Brazier position={[-5, 0, -1]} />
      <Brazier position={[5, 0, -1]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 5, 0]} intensity={20} color="#ffd9a0" distance={18} />
    </group>
  );
}