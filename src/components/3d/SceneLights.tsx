"use client";

export function SceneLights() {
  return (
    <>
      {/* Key light — intense electric blue, top-left */}
      <directionalLight
        color="#1a4fff"
        intensity={6}
        position={[-4, 5, 3]}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Rim light — soft white from behind, creates edge separation */}
      <directionalLight
        color="#d8e8ff"
        intensity={3}
        position={[3, 1, -6]}
      />

      {/* Accent fill — cyan point to catch the lens glass */}
      <pointLight
        color="#00E5FF"
        intensity={2.5}
        position={[1.5, -0.5, 3.5]}
        distance={8}
        decay={2}
      />

      {/* Subtle warm fill from below — prevents total black on underside */}
      <pointLight
        color="#0a1a2e"
        intensity={1.5}
        position={[0, -4, 2]}
        distance={10}
        decay={2}
      />

      {/* Ambient — keep deep but not pure black */}
      <ambientLight color="#050a14" intensity={5} />
    </>
  );
}
