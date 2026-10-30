"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "@/state/gameStore";

// Smooth camera presets with lerp transitions:
// strategic (default), throne, king-follow, building-inspect.
export const CAMERA_PRESETS = {
  strategic: { pos: [22, 22, 26], target: [0, 0, 0] },
  throne: { pos: [0, 2.2, 3], target: [0, 1.5, -4.5] },
  king: { pos: [3, 2.5, -1.5], target: [1.4, 1.4, -3.6] },
  overview: { pos: [40, 34, 46], target: [0, 0, 0] },
} as const;

export type PresetName = keyof typeof CAMERA_PRESETS;

const _p = new THREE.Vector3();
const _t = new THREE.Vector3();

export function CameraRig({ preset }: { preset: PresetName }) {
  const { camera, controls } = useThree() as unknown as { camera: THREE.PerspectiveCamera; controls: { target: THREE.Vector3; update: () => void } | null };
  const selectedId = useGame((s) => s.selectedBuildingId);
  const buildings = useGame((s) => s.state.buildings);

  useEffect(() => {
    let goal = CAMERA_PRESETS[preset];
    if (preset === "king") goal = CAMERA_PRESETS.king;
    if (preset === "strategic" && selectedId) {
      const b = buildings.find((x) => x.id === selectedId);
      if (b) goal = { pos: [b.x * 4 + 8, 9, b.z * 4 + 8], target: [b.x * 4, 1.5, b.z * 4] };
    }
    _p.set(goal.pos[0], goal.pos[1], goal.pos[2]);
    _t.set(goal.target[0], goal.target[1], goal.target[2]);
    // animate over ~0.8s
    let t = 0;
    const start = camera.position.clone();
    const startT = controls ? controls.target.clone() : new THREE.Vector3();
    let raf = 0;
    const step = () => {
      t += 0.03;
      const k = Math.min(1, t);
      const e = 1 - Math.pow(1 - k, 3); // easeOutCubic
      camera.position.lerpVectors(start, _p, e);
      if (controls) {
        controls.target.lerpVectors(startT, _t, e);
        controls.update();
      }
      camera.lookAt(controls ? controls.target : _t);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [preset, selectedId, buildings, camera, controls]);

  return null;
}