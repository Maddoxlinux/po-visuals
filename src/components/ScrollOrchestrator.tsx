"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  componentPositions as pos,
  componentRotations as rot,
  sceneState,
} from "@/lib/componentPositions";

gsap.registerPlugin(ScrollTrigger);

/**
 * Null-rendering client component — owns the single unified GSAP timeline
 * that drives all five 3D component transforms across the four scroll stages.
 *
 * Pattern: GSAP animates plain { x, y, z } objects; R3F useFrame reads
 * them each animation frame at 60fps. Zero React state, zero re-renders.
 *
 * Timeline layout (total duration 10 → maps to 0–100% page scroll):
 *   0  → 3   (30%): Stage 1→2  Exploded  → Magnetic assembly
 *   3  → 6   (30%): Stage 2→3  Assembling → Perfect alignment + lens glow
 *   6  → 10  (40%): Stage 3→4  Assembled  → Phone reveal + screen glow
 *
 * scrub: 1.5  smooths both trackpad micro-jitter and scroll-wheel steps.
 * invalidateOnRefresh re-measures on resize so the timeline stays accurate.
 */
export default function ScrollOrchestrator() {
  useEffect(() => {

    // ── Seed Stage 1 (Hero) — Fully Exploded ──────────────────────────────
    gsap.set(pos.ring,   { x: -4.0, y:  1.8, z:  0.5 });
    gsap.set(pos.lens1,  { x:  3.5, y: -0.5, z:  1.8 });
    gsap.set(pos.lens2,  { x:  0.8, y:  3.0, z: -0.5 });
    gsap.set(pos.sensor, { x: -1.8, y: -2.8, z: -1.2 });
    gsap.set(pos.phone,  { x:  0,   y:  0,   z: -4.0 });

    gsap.set(rot.ring,   { x:  0.40, y: -0.80, z:  1.20 });
    gsap.set(rot.lens1,  { x: -0.50, y:  2.10, z:  0.30 });
    gsap.set(rot.lens2,  { x:  1.00, y: -1.30, z: -0.60 });
    gsap.set(rot.sensor, { x: -0.80, y:  1.50, z:  0.90 });
    gsap.set(rot.phone,  { x:  0.20, y:  0.30, z: -0.10 });

    gsap.set(sceneState, { lensGlow: 0, screenGlow: 0, mouseInfluence: 1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger:            document.documentElement,
        start:              "top top",
        end:                "bottom bottom",
        scrub:              1.5,
        invalidateOnRefresh:true,
      },
    });

    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 1 → 2  (scroll 0 → 30%, timeline pos 0 → 3)
    // MAGNETIC ASSEMBLY — components fly from the exploded scatter toward
    // a loose convergence cluster. Rotations align to zero.
    // The phone begins rotating toward showing its back (camera module).
    // ═══════════════════════════════════════════════════════════════════════

    const S1_EASE = "power2.inOut";

    tl.to(pos.ring,   { x: -1.0, y:  0.2, z:  0.6, ease: S1_EASE, duration: 3 }, 0)
      .to(pos.lens1,  { x: -0.1, y:  0.0, z:  0.9, ease: S1_EASE, duration: 3 }, 0)
      .to(pos.lens2,  { x: -0.1, y:  0.0, z:  0.4, ease: S1_EASE, duration: 3 }, 0)
      .to(pos.sensor, { x:  0.1, y:  0.0, z: -0.1, ease: S1_EASE, duration: 3 }, 0)
      .to(pos.phone,  { x:  1.5, y:  0.0, z: -1.5, ease: S1_EASE, duration: 3 }, 0)

      .to(rot.ring,   { x: 0, y:  0.10, z:  0,    ease: S1_EASE, duration: 3 }, 0)
      .to(rot.lens1,  { x: 0, y:  0.05, z:  0,    ease: S1_EASE, duration: 3 }, 0)
      .to(rot.lens2,  { x: 0, y:  0.05, z:  0,    ease: S1_EASE, duration: 3 }, 0)
      .to(rot.sensor, { x: 0, y:  0,    z:  0,    ease: S1_EASE, duration: 3 }, 0)
      .to(rot.phone,  { x: 0, y: Math.PI * 0.5, z: 0, ease: S1_EASE, duration: 3 }, 0)

      .to(sceneState, { mouseInfluence: 0.5, ease: "none", duration: 3 }, 0);

    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 2 → 3  (scroll 30 → 60%, timeline pos 3 → 6)
    // PERFECT ALIGNMENT — lens elements snap into optical axis. The ring
    // frames the glass stack at Z=1.1. The phone slides behind the assembly
    // and completes its rotation to show the camera module (Y = π).
    // lensGlow ramps to 1 → projection overlay activates on both glass surfaces.
    // ═══════════════════════════════════════════════════════════════════════

    const S2_EASE = "power3.inOut";

    tl.to(pos.ring,   { x:  0, y:  0, z:  1.10, ease: S2_EASE, duration: 3 }, 3)
      .to(pos.lens1,  { x:  0, y:  0, z:  0.60, ease: S2_EASE, duration: 3 }, 3)
      .to(pos.lens2,  { x:  0, y:  0, z:  0.15, ease: S2_EASE, duration: 3 }, 3)
      .to(pos.sensor, { x:  0, y:  0, z: -0.25, ease: S2_EASE, duration: 3 }, 3)
      .to(pos.phone,  { x:  0, y:  0, z: -1.20, ease: S2_EASE, duration: 3 }, 3)

      .to(rot.ring,   { x: 0, y: 0,           z: 0, ease: S2_EASE, duration: 3 }, 3)
      .to(rot.lens1,  { x: 0, y: 0,           z: 0, ease: S2_EASE, duration: 3 }, 3)
      .to(rot.lens2,  { x: 0, y: 0,           z: 0, ease: S2_EASE, duration: 3 }, 3)
      .to(rot.sensor, { x: 0, y: 0,           z: 0, ease: S2_EASE, duration: 3 }, 3)
      .to(rot.phone,  { x: 0, y: Math.PI,     z: 0, ease: S2_EASE, duration: 3 }, 3)

      .to(sceneState, { lensGlow: 1, mouseInfluence: 0.15, ease: "power2.out", duration: 3 }, 3);

    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 3 → 4  (scroll 60 → 100%, timeline pos 6 → 10)
    // PHONE REVEAL — lens elements scatter back into space as the phone
    // takes centre stage. It completes a full 360° rotation (π → 2π)
    // to show the glowing screen UI. screenGlow ramps to 1, lensGlow fades.
    // ═══════════════════════════════════════════════════════════════════════

    const S3_EASE = "power3.inOut";

    tl.to(pos.ring,   { x: -2.2, y:  1.0, z:  0.5, ease: S3_EASE, duration: 4 }, 6)
      .to(pos.lens1,  { x:  2.5, y: -0.4, z:  1.0, ease: S3_EASE, duration: 4 }, 6)
      .to(pos.lens2,  { x: -1.3, y: -1.5, z:  0.5, ease: S3_EASE, duration: 4 }, 6)
      .to(pos.sensor, { x:  1.5, y:  1.2, z:  0.0, ease: S3_EASE, duration: 4 }, 6)
      .to(pos.phone,  { x:  0,   y:  0.1, z:  0.0, ease: S3_EASE, duration: 4 }, 6)

      .to(rot.ring,   { x:  0.30, y:  1.50, z:  0.20, ease: S3_EASE, duration: 4 }, 6)
      .to(rot.lens1,  { x: -0.25, y: -1.20, z:  0.12, ease: S3_EASE, duration: 4 }, 6)
      .to(rot.lens2,  { x:  0.40, y:  2.10, z: -0.28, ease: S3_EASE, duration: 4 }, 6)
      .to(rot.sensor, { x: -0.38, y:  0.85, z:  0.22, ease: S3_EASE, duration: 4 }, 6)
      // Phone completes 360° total: from π (back) → 2π (screen facing again)
      .to(rot.phone,  { x: 0, y: Math.PI * 2, z: 0, ease: "power2.inOut", duration: 4 }, 6)

      .to(sceneState, {
        lensGlow:       0,
        screenGlow:     1,
        mouseInfluence: 0,
        ease: "power2.inOut",
        duration: 4,
      }, 6);

    return () => { tl.kill(); };
  }, []);

  return null;
}
