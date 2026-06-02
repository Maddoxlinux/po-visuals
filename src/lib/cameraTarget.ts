/**
 * Shared mutable object — the single source of truth for the 3D camera's
 * intended transform at any point in the scroll journey.
 *
 * GSAP ScrollTrigger writes to this object on every scroll tick.
 * R3F `useFrame` reads it every animation frame and applies the values
 * directly to the Three.js Group — no React state, no re-renders.
 *
 * Having two writers (GSAP for scroll states, useFrame for mouse/float)
 * is safe because useFrame adds its offsets on top of the GSAP values
 * rather than writing back into this object.
 */
export const cameraTarget = {
  posX: 0,
  posY: 0,
  posZ: 0,
  rotX: 0,
  rotY: 0.35,
  rotZ: 0,
  scale: 1,
  /**
   * 0 → 1  Drives the lens point-light intensity and glow-disc opacity.
   * At 0 the lens is cold/dark; at 1 it pulses as an abstract cyan element.
   */
  lensGlow: 0,
  /**
   * 0 → 1  Scales mouse-parallax amplitude and idle-float amplitude.
   * Fades out so the tightly scripted scroll states aren't disturbed by
   * the pointer during services/pricing/contact.
   */
  mouseInfluence: 1,
};
