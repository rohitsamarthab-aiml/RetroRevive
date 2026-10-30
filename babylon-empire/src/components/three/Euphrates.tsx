"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Animated river strip following the terrain's river valley.
export function Euphrates() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(80, 5, 60, 1);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      pos.setY(i, Math.exp(-Math.pow((x + 6 - z * 0.08) / 6, 2)) * -1.2 + 0.08);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (matRef.current) {
      // subtle shimmer by animating roughness-driven specular response
      matRef.current.roughness = 0.15 + 0.06 * Math.sin(clock.elapsedTime * 1.2);
    }
  });

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        ref={matRef}
        color="#2a6fbd"
        metalness={0.35}
        roughness={0.18}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}