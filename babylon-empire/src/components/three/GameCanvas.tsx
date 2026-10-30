"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { SeasonalGround } from "./SeasonalGround";
import { Ziggurat } from "./buildings/Ziggurat";
import { Palace } from "./buildings/Palace";
import { BuildingMesh } from "./buildings/BuildingMesh";
import { Villagers } from "./Villagers";
import { SkyDome } from "./SkyDome";
import { RainParticles } from "./RainParticles";
import { EventEffects } from "./EventEffects";
import { useGame } from "@/state/gameStore";
import * as THREE from "three";

const GOLD = "#d4a017";

function BuildingsLayer() {
  const buildings = useGame((s) => s.state.buildings);
  return <>{buildings.map((b) => <BuildingMesh key={b.id} building={b} />)}</>;
}

function GroundTileHighlight() {
  const buildMode = useGame((s) => s.buildMode);
  const placeAt = useGame((s) => s.placeAt);
  if (!buildMode.active) return null;
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.06, 0]}
      onClick={(e) => {
        e.stopPropagation();
        placeAt(Math.round(e.point.x), Math.round(e.point.z));
      }}
    >
      <planeGeometry args={[60, 60]} />
      <meshBasicMaterial color={GOLD} transparent opacity={0.18} depthWrite={false} />
    </mesh>
  );
}

export function GameCanvas() {
  const quality = useGame((s) => s.quality);
  const shadows = quality !== "low";

  return (
    <Canvas
      shadows={shadows}
      camera={{ position: [22, 22, 26], fov: 50 }}
      gl={{ antialias: quality === "high" }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        scene.fog = new THREE.Fog("#c9a86a", 60, 160);
      }}
    >
      <Suspense fallback={null}>
        <SkyDome />
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[30, 40, 20]}
          intensity={1.4}
          castShadow={shadows}
          shadow-mapSize={[quality === "high" ? 2048 : 1024, quality === "high" ? 2048 : 1024]}
          shadow-camera-left={-40}
          shadow-camera-right={40}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
        />
        <SeasonalGround />
        <Ziggurat position={[-8, 0, -10]} />
        <Palace position={[8, 0, -12]} />
        <BuildingsLayer />
        <Villagers />
        <RainParticles />
        <EventEffects />
        <GroundTileHighlight />
        <OrbitControls
          makeDefault
          maxPolarAngle={Math.PI / 2.15}
          minDistance={6}
          maxDistance={100}
          enablePan
          panSpeed={0.8}
          target={[0, 0, 0]}
        />
      </Suspense>
    </Canvas>
  );
}