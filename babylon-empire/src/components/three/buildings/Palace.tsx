"use client";

// Royal Palace: main mass, courtyard wall, towers and banner poles.
export function Palace({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 4, 8]} />
        <meshStandardMaterial color="#c9a35f" roughness={0.85} />
      </mesh>
      {/* crenellated parapet */}
      <mesh position={[0, 4.35, 0]} castShadow>
        <boxGeometry args={[10.4, 0.7, 8.4]} />
        <meshStandardMaterial color="#a37c3e" roughness={0.9} />
      </mesh>
      {[-4, 4].map((x) => (
        <mesh key={x} position={[x, 3.2, 3.2]} castShadow>
          <cylinderGeometry args={[1.1, 1.3, 6.4, 8]} />
          <meshStandardMaterial color="#b8904f" roughness={0.85} />
        </mesh>
      ))}
      {/* throne-hall gate */}
      <mesh position={[0, 1.4, 4.05]}>
        <boxGeometry args={[3, 2.8, 0.3]} />
        <meshStandardMaterial color="#1e5bb8" roughness={0.5} metalness={0.15} />
      </mesh>
      {/* banner poles */}
      {[-3, 3].map((x) => (
        <mesh key={`p${x}`} position={[x, 5.4, 3.6]}>
          <cylinderGeometry args={[0.08, 0.08, 2.4, 6]} />
          <meshStandardMaterial color="#5a4526" />
        </mesh>
      ))}
    </group>
  );
}