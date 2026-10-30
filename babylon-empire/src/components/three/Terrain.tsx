"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Low-poly displaced terrain: a single plane with deterministic vertex noise.
// Keeps draw calls at 1 — cheap on student laptops.
export function Terrain() {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(80, 80, 40, 40);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    // Deterministic pseudo-noise (no RNG state shared with the simulation)
    let s = 12345;
    const noise = () => {
      s = (s * 16807) % 2147483647;
      return (s / 2147483647) * 2 - 1;
    };
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

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#c2a265" roughness={0.95} metalness={0} />
    </mesh>
  );
}