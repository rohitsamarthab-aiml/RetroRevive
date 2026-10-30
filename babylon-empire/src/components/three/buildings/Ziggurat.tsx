"use client";

// Procedural ziggurat — stepped temple tower with grand staircase.
export function Ziggurat({ position }: { position: [number, number, number] }) {
  const tiers = [
    { w: 14, h: 2.2 },
    { w: 10, h: 2.0 },
    { w: 7, h: 1.8 },
    { w: 4.5, h: 1.6 },
  ];
  let y = 0;
  return (
    <group position={position}>
      {tiers.map((t, i) => {
        const el = (
          <mesh key={i} position={[0, y + t.h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[t.w, t.h, t.w]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#b0824a" : "#9a6f3c"} roughness={0.9} />
          </mesh>
        );
        y += t.h;
        return el;
      })}
      {/* Grand staircase */}
      <mesh position={[0, 1.6, tiers[0].w / 2 + 0.6]} rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[2, 0.4, 4.5]} />
        <meshStandardMaterial color="#c49a5e" roughness={0.85} />
      </mesh>
      {/* Shrine on top */}
      <mesh position={[0, y + 0.9, 0]} castShadow>
        <boxGeometry args={[2.4, 1.8, 2.4]} />
        <meshStandardMaterial color="#7d5a30" roughness={0.85} />
      </mesh>
    </group>
  );
}