"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cameraTarget } from "@/lib/cameraTarget";

gsap.registerPlugin(ScrollTrigger);

/**
 * Null-rendering client component that owns the single unified GSAP timeline
 * for the 3D camera scroll journey. Mount it once at page root.
 *
 * Timeline structure (total duration 10, maps to full page scroll 0–100%):
 *   0 → 3   (30%): Hero  → Services   barrel tunnel
 *   3 → 6   (30%): Services → Pricing  metallic-back reveal on right
 *   6 → 10  (40%): Pricing  → Contact  abstract glowing lens recession
 *
 * scrub: 1.5  — GSAP eases toward the scroll target over 1.5 s, ensuring
 * buttery interpolation on both trackpad and scroll-wheel input. No
 * additional lerp in useFrame for the scroll values (double-smoothing
 * would create noticeable lag). Mouse-parallax is lerped separately in R3F.
 */
export default function ScrollOrchestrator() {
  useEffect(() => {
    // Seed the shared object so the R3F scene starts in the right pose
    // before any scroll has happened.
    gsap.set(cameraTarget, {
      posX: 0, posY: 0, posZ: 0,
      rotX: 0, rotY: 0.35, rotZ: 0,
      scale: 1,
      lensGlow: 0,
      mouseInfluence: 1,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
        invalidateOnRefresh: true,
      },
    });

    // ── State 1 → State 2: Hero to Services (0 → 30%) ───────────────────
    // Camera centres on viewer, then scales to 2× — barrel ring clips the
    // viewport edges creating the "tunnel" framing effect.
    tl.to(cameraTarget, {
      posX: 0,
      posY: 0,
      posZ: 0.5,
      rotX: 0,
      rotY: 0,           // dead-on: lens faces straight at viewer
      rotZ: 0,
      scale: 2.0,
      lensGlow: 0.25,
      mouseInfluence: 0.3,
      ease: "power2.inOut",
      duration: 3,
    }, 0);

    // ── State 2 → State 3: Services to Pricing (30% → 60%) ──────────────
    // Camera pulls back slightly and swings right, rotating π (180°) to
    // reveal the sleek metallic back panel. Left side of screen is clear
    // for the pricing tables to occupy.
    tl.to(cameraTarget, {
      posX: 2.0,
      posY: 0,
      posZ: -0.5,
      rotX: 0.12,
      rotY: Math.PI,     // back of camera faces viewer
      rotZ: 0,
      scale: 1.0,
      lensGlow: 0.05,
      mouseInfluence: 0.1,
      ease: "power2.inOut",
      duration: 3,
    });

    // ── State 3 → State 4: Pricing to Contact (60% → 100%) ──────────────
    // Camera recedes deep into the Z axis while continuing to spin past
    // 2π, shrinking to ~⅓ of its size. The lens glow ramps to full,
    // turning the camera into a small abstract cyan light source that
    // pulses through the semi-transparent Connect section overlay.
    tl.to(cameraTarget, {
      posX: 0,
      posY: 0.3,
      posZ: -4.5,
      rotX: 0.35,
      rotY: Math.PI * 2 + 0.5,   // continues spinning: ends slightly past front
      rotZ: 0.05,
      scale: 0.32,
      lensGlow: 1,
      mouseInfluence: 0,
      ease: "power3.inOut",
      duration: 4,
    });

    return () => {
      tl.kill();
    };
  }, []);

  return null;
}
