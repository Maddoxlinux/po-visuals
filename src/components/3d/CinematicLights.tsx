"use client";

/**
 * Cinematic lighting pass for the exploded lens array / smartphone scene.
 *
 * Light hierarchy:
 *  1. Lens-axis spotlight  — narrow cone directed down the optical axis;
 *     catches internal reflections in the glass transmission layers and
 *     creates the "light shining through optics" caustic feel.
 *  2. Blue key light       — electric directional from top-left, the
 *     signature luxury photography-studio tone from Phase 1.
 *  3. Soft white rim       — backlight from behind, edge-separates the
 *     metallic chassis from the dark background.
 *  4. Cyan accent fill     — low point light from viewer-side low, makes
 *     the iridescent glass lens coatings pop.
 *  5. Warm under-fill      — prevents the underside of the phone chassis
 *     from going fully black; keeps the form readable.
 *  6. Ambient              — intentionally dark; we want dramatic shadows.
 */
export function CinematicLights() {
  return (
    <>
      {/* ── 1. Lens-axis spotlight ────────────────────────────────────────
          Positioned slightly in front of the scene, aimed at origin.
          Narrow angle + penumbra creates the "spotlight through glass" feel.
          castShadow lets the metallic ring cast a disc-shadow through
          the glass elements, hinting at internal barrel reflections. */}
      <spotLight
        color="#fff8f0"
        intensity={12}
        angle={Math.PI / 11}
        penumbra={0.45}
        position={[0, 0.3, 5.5]}
        target-position={[0, 0, 0]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
      />

      {/* ── 2. Electric blue key — directional from top-left ───────────── */}
      <directionalLight
        color="#1a4fff"
        intensity={5.5}
        position={[-5, 6, 3]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* ── 3. Soft white rim — from behind, edge separation ────────────── */}
      <directionalLight
        color="#d0e8ff"
        intensity={3.5}
        position={[3, 1, -7]}
      />

      {/* ── 4. Cyan accent fill — iridescence & glass pop ───────────────── */}
      <pointLight
        color="#00E5FF"
        intensity={2.8}
        position={[1.8, -0.8, 4]}
        distance={9}
        decay={2}
      />

      {/* ── 5. Warm under-fill — form readability ───────────────────────── */}
      <pointLight
        color="#0a1830"
        intensity={2.0}
        position={[0, -5, 2]}
        distance={12}
        decay={2}
      />

      {/* ── 6. Right-side silver fill — chassis highlights ──────────────── */}
      <directionalLight
        color="#a0b8e0"
        intensity={1.8}
        position={[6, 0, 2]}
      />

      {/* ── 7. Wide cyan side light — the key integration light ─────────────
          This is the light that bleeds across the HTML section boundaries.
          It's wide-angle, low-height, and throws the characteristic deep-teal
          haze across the glass iridescence + satin-chrome surfaces.
          Positioned from the RIGHT so it rakes across the lens faces and       */}
      <directionalLight
        color="#00E5FF"
        intensity={2.2}
        position={[5, -0.5, 3]}
      />

      {/* ── 8. Counter cyan from left — fills shadows with navy-teal ──────── */}
      <directionalLight
        color="#003c5a"
        intensity={1.4}
        position={[-5, 0.8, 1]}
      />

      {/* ── 9. Ambient ───────────────────────────────────────────────────── */}
      <ambientLight color="#04091a" intensity={7} />
    </>
  );
}
