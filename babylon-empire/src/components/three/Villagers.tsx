"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "@/state/gameStore";
import { countComplete } from "@/sim/engine";

interface Agent {
  x: number; z: number;
  speed: number;
  phase: number;
  kind: "farmer" | "citizen" | "soldier";
  target: { x: number; z: number };
}

const FARMER_COLOR = "#c9b088";
const CITIZEN_COLOR = "#d8c9a8";
const SOLDIER_COLOR = "#8a2a2a";

// Simple animated agent crowd. Farmers congregate near farms, soldiers near
// barracks/walls, citizens wander the town center. Counts scale with the
// simulation population so the world reflects game state.
export function Villagers() {
  const state = useGame((s) => s.state);
  const agents = useMemo<Agent[]>(() => {
    const nFarmers = Math.min(state.population.farmers, 16);
    const nCitizens = Math.min(state.population.citizens + state.population.merchants, 14);
    const nSoldiers = Math.min(state.population.soldiers, 8);
    const list: Agent[] = [];
    let i = 0;
    const mk = (kind: Agent["kind"], cx: number, cz: number) => ({
      x: cx + Math.cos(i) * 2, z: cz + Math.sin(i) * 2,
      speed: 0.8 + (i % 5) * 0.12, phase: i * 1.7, kind,
      target: { x: cx, z: cz },
    });
    const farms = state.buildings.filter(b => b.type === "farm");
    for (let f = 0; f < nFarmers; f++, i++) {
      const home = farms.length ? farms[f % farms.length] : { x: -2, z: 2 };
      list.push({ ...mk("farmer", home.x * 4 + 3, home.z * 4 + 3) });
    }
    for (let c = 0; c < nCitizens; c++, i++) list.push(mk("citizen", (c % 5) * 3 - 6, 4 + (c % 3) * 2));
    for (let sIdx = 0; sIdx < nSoldiers; sIdx++, i++) list.push(mk("soldier", -12 + sIdx * 2, -6));
    return list;
  }, [state.population.farmers, state.population.citizens, state.population.merchants, state.population.soldiers, state.buildings]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }, dt) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.elapsedTime;
    g.children.forEach((child, i) => {
      const a = agents[i];
      if (!a) return;
      // wander around target
      const wx = a.target.x + Math.sin(t * a.speed * 0.5 + a.phase) * 3;
      const wz = a.target.z + Math.cos(t * a.speed * 0.4 + a.phase) * 3;
      child.position.x += (wx - child.position.x) * Math.min(1, dt * a.speed);
      child.position.z += (wz - child.position.z) * Math.min(1, dt * a.speed);
      // bobbing walk animation
      child.position.y = Math.abs(Math.sin(t * 6 * a.speed + a.phase)) * 0.12;
      const dir = Math.atan2(wx - child.position.x, wz - child.position.z);
      child.rotation.y = dir;
    });
  });

  const famine = state.happiness < 35;

  return (
    <group ref={groupRef}>
      {agents.map((a, i) => (
        <group key={i} position={[a.x, 0, a.z]}>
          {/* body */}
          <mesh position={[0, 0.55, 0]}>
            <capsuleGeometry args={[0.22, 0.6, 4, 8]} />
            <meshStandardMaterial
              color={famine ? "#9a8868" : a.kind === "soldier" ? SOLDIER_COLOR : a.kind === "farmer" ? FARMER_COLOR : CITIZEN_COLOR}
            />
          </mesh>
          {/* head */}
          <mesh position={[0, 1.05, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#c8a080" />
          </mesh>
          {/* soldier spear */}
          {a.kind === "soldier" && (
            <mesh position={[0.3, 0.9, 0]} rotation={[0, 0, 0.15]}>
              <cylinderGeometry args={[0.02, 0.02, 1.6, 4]} />
              <meshStandardMaterial color="#5a4526" />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}