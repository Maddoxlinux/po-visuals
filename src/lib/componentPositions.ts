/**
 * Single source of truth for all 3D component transforms.
 *
 * GSAP ScrollTrigger (ScrollOrchestrator) writes x/y/z into these plain
 * objects on every scroll tick. R3F useFrame reads them each animation frame
 * and copies the values to the Three.js meshes. Zero React state = zero
 * re-render overhead on scroll.
 *
 * Initial values represent Stage 1 (Hero) — fully exploded.
 * GSAP gsap.set() in ScrollOrchestrator re-seeds them on mount so a
 * browser refresh always starts from the correct pose.
 */

// ── Positions ───────────────────────────────────────────────────────────────

export const componentPositions = {
  ring:   { x: -4.0, y:  1.8, z:  0.5 },   // upper-left, partially off-screen
  lens1:  { x:  3.5, y: -0.5, z:  1.8 },   // far right, close to viewer
  lens2:  { x:  0.8, y:  3.0, z: -0.5 },   // above viewport, back
  sensor: { x: -1.8, y: -2.8, z: -1.2 },   // lower-left, behind
  phone:  { x:  0,   y:  0,   z: -4.0 },   // centre, very far back
};

// ── Rotations (euler angles in radians) ─────────────────────────────────────

export const componentRotations = {
  ring:   { x:  0.40, y: -0.80, z:  1.20 },
  lens1:  { x: -0.50, y:  2.10, z:  0.30 },
  lens2:  { x:  1.00, y: -1.30, z: -0.60 },
  sensor: { x: -0.80, y:  1.50, z:  0.90 },
  phone:  { x:  0.20, y:  0.30, z: -0.10 },
};

// ── Scene-wide state ─────────────────────────────────────────────────────────

export const sceneState = {
  /** 0 → 1  Lens projection overlay + front point light (Stage 3) */
  lensGlow: 0,
  /** 0 → 1  Phone screen canvas emissive (Stage 4) */
  screenGlow: 0,
  /** 0 → 1  Scales mouse parallax + idle float amplitude */
  mouseInfluence: 1,
};

// ── Shared smoothed mouse offset ─────────────────────────────────────────────
// LensArray updates this; SmartphoneFrame reads it. One listener, two users.

export const mouseSmooth = { x: 0, y: 0 };
