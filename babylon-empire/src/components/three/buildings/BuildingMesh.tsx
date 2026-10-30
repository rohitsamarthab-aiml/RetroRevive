"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { BuildingInstance } from "@/sim/types";
import { BUILDINGS } from "@/sim/buildings";
import { useGame } from "@/state/gameStore";

// Renders one simulation building at its grid cell. Construction sites show a
// rising scaffold effect proportional to build progress.
export function BuildingMesh({ building }: { building: BuildingInstance }) {
  const select = useGame((s) => s.selectBuilding);
  const selected = useGame((s) => s.selectedBuildingId === building.id);
  const spec = BUILDINGS[building.type];
  const scale = building.underConstruction ? Math.max(0.15, building.progress / 100) : 1;
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current && selected) {
      ref.current.position.y = Math.sin(clock.elapsedTime * 3) * 0.05;
    }
  });

  const color: Record<string, string> = {
    farm: "#8a9a3c", granary: "#b8955a", house: "#c9a86a", market: "#c46a2a",
    barracks: "#8a5a2a", watchtower: "#a08050", wall: "#b09a6a", well: "#909090",
    palace: "#c9a35f", ziggurat: "#b0824a",
  };

  const height: Record<string, number> = {
    farm: 0.4, granary: 2.2, house: 1.6, market: 1.2, barracks: 1.8,
    watchtower: 3.4, wall: 2.4, well: 0.8, palace: 4, ziggurat: 7,
  };

  return (
    <group position={[building.x * 4, 0, building.z * 4]}>
      <group ref={ref} scale={[scale, scale, scale]} onClick={(e) => { e.stopPropagation(); select(building.id); }}>
        <mesh position={[0, (height[building.type] ?? 1.5) / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, height[building.type] ?? 1.5, 3.2]} />
          <meshStandardMaterial color={color[building.type] ?? "#c9a86a"} roughness={0.9} />
        </mesh>
        {building.type !== "farm" && (
          <mesh position={[0, (height[building.type] ?? 1.5) + 0.2, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[2.4, 1, 4]} />
            <meshStandardMaterial color="#7a5a30" roughness={0.9} />
          </mesh>
        )}
        {building.underConstruction && (
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[2.2, 2.2, 0.3, 4]} />
            <meshBasicMaterial color="#d4a017" transparent opacity={0.5} />
          </mesh>
        )}
        {selected && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
            <ringGeometry args={[2.4, 2.8, 24]} />
            <meshBasicMaterial color="#d4a017" />
          </mesh>
        )}
      </group>
      {/* level pips */}
      {Array.from({ length: building.level }).map((_, i) => (
        <mesh key={i} position={[(i - (building.level - 1) / 2) * 0.6, (height[building.type] ?? 1.5) + 1.4, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#ffd700" />
        </mesh>
      ))}
      <group visible={false}>{/* spec kept for tooltip future use */}{spec.name}</group>
    </group>
  );
}