/**
 * Frame-rate independent mass-spring-damper simulation.
 *
 * Models F = -stiffness*(x - target) - damping*v  (mass = 1)
 * Chosen over THREE.MathUtils.damp because:
 *  - damp() is exponential decay only (no overshoot)
 *  - This model can be underdamped → natural micro-bounce on state changes
 *
 * Critical damping threshold: damping = 2 * sqrt(stiffness)
 *   stiffness:180, crit ≈ 26.8  →  damping:14 = underdamped ≈ 20% overshoot
 *   stiffness:220, crit ≈ 29.7  →  damping:16 = underdamped ≈ 15% overshoot
 *
 * Usage:
 *   const spr = { pos:{x:0,y:0,z:0}, vel:{x:0,y:0,z:0} };
 *   // every frame:
 *   tickSpring(spr, target, 180, 14, delta);
 *   mesh.position.set(spr.pos.x, spr.pos.y, spr.pos.z);
 */

export interface SpringVec3 {
  pos: { x: number; y: number; z: number };
  vel: { x: number; y: number; z: number };
}

export function makeSpringVec3(x = 0, y = 0, z = 0): SpringVec3 {
  return {
    pos: { x, y, z },
    vel: { x: 0, y: 0, z: 0 },
  };
}

/** Advance the spring by `dt` seconds toward `target`. */
export function tickSpring(
  s: SpringVec3,
  target: { x: number; y: number; z: number },
  stiffness: number,
  damping: number,
  dt: number,
): void {
  // Clamp dt to prevent instability on large frame gaps (e.g., tab switch)
  const d = Math.min(dt, 0.032);
  for (const k of ["x", "y", "z"] as const) {
    const disp = s.pos[k] - target[k];
    const force = -stiffness * disp - damping * s.vel[k];
    s.vel[k] += force * d;
    s.pos[k] += s.vel[k] * d;
  }
}

// ── Tuning presets ────────────────────────────────────────────────────────────
// Lower stiffness + lower damping = slower, bouncier (heavy)
// Higher stiffness + higher damping = faster, stiffer (snappy)

export const SPRING_PRESETS = {
  /** Outer ring: snappy with subtle overshoot */
  ring:   { stiffness: 185, damping: 14 },
  /** Front glass lens: floatier, more bounce */
  lens1:  { stiffness: 155, damping: 11 },
  /** Rear glass lens: slightly stiffer */
  lens2:  { stiffness: 165, damping: 12 },
  /** Sensor plate: heavy, minimal bounce */
  sensor: { stiffness: 210, damping: 17 },
  /** Smartphone: largest mass, most dramatic overshoot */
  phone:  { stiffness: 115, damping: 10 },
} as const;
