"use client";

import { useEffect, useRef, lazy, Suspense } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState } from "@/lib/scrollState";

gsap.registerPlugin(ScrollTrigger);

// Lazy-load so the heavy Three.js bundle doesn't block first paint
const CameraCanvas = lazy(() => import("@/components/3d/CameraCanvas"));

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Entrance animation ──────────────────────────────────────────
      const tl = gsap.timeline({ delay: 0.3 });
      tl.fromTo(".hero-eyebrow",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" })
        .fromTo(".hero-title-line",
          { opacity: 0, y: 65 },
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.14, ease: "power4.out" },
          "-=0.5")
        .fromTo(".hero-sub",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
          "-=0.4")
        .fromTo(".hero-meta",
          { opacity: 0 },
          { opacity: 1, duration: 1, ease: "power2.out" },
          "-=0.3");

      // ── Master scroll tracker ───────────────────────────────────────
      // Covers the entire page; R3F useFrame reads scrollState.progress
      // on every animation frame — zero React state overhead.
      ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          scrollState.progress = self.progress;
          console.log("[Master ScrollTrigger] progress:", self.progress.toFixed(3));
        },
      });

      // ── Hero-local parallax on content ─────────────────────────────
      gsap.to(".hero-content", {
        y: "12%",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-end pb-20 px-8 md:px-16 overflow-hidden"
    >
      {/* ── WebGL Canvas ─────────────────────────────────────────────── */}
      {/*
        Sits absolute behind all text. pointer-events-none on the wrapper
        means scroll / click passes through to normal DOM elements.
        The Canvas itself can still raycast internally if needed.
      */}
      <Suspense fallback={null}>
        <CameraCanvas />
      </Suspense>

      {/* Subtle grid overlay — sits above canvas, below text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,229,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial vignette to ground the scene */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(5,11,20,0.7) 100%)",
        }}
      />

      {/* ── Text content ─────────────────────────────────────────────── */}
      <div className="hero-content relative z-10 max-w-7xl w-full">

        {/* Eyebrow */}
        <p className="hero-eyebrow font-mono text-xs tracking-ultra uppercase text-accent mb-8 flex items-center gap-3">
          <span className="accent-dot" />
          Visual Storytelling Since 2020
        </p>

        {/* Main title */}
        <h1 className="font-serif leading-none mb-8" aria-label="The Visual Essence">
          <span className="hero-title-line block text-[clamp(3.5rem,10vw,9rem)] font-black text-white uppercase tracking-tight">
            The
          </span>
          <span className="hero-title-line block text-[clamp(3.5rem,10vw,9rem)] font-black italic text-accent uppercase tracking-tight -mt-2">
            Visual
          </span>
          <span className="hero-title-line block text-[clamp(3.5rem,10vw,9rem)] font-black text-white uppercase tracking-tight -mt-2">
            Essence
          </span>
        </h1>

        {/* Sub-line */}
        <p className="hero-sub font-sans text-sm md:text-base text-white/40 max-w-md leading-relaxed mb-12">
          Premium photography &amp; cinematography — conventions, portraits,
          graduations, events, and weddings — crafted with intent.
        </p>

        {/* CTA row */}
        <div className="hero-meta flex flex-wrap items-center gap-8">
          <a
            href="#services"
            className="inline-flex items-center gap-3 bg-accent text-canvas font-mono text-xs tracking-widest uppercase px-8 py-4 hover:bg-white transition-colors duration-300"
          >
            Explore Work
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 7h12M7 1l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <div className="h-px w-12 bg-white/20" />
          <span className="font-mono text-xs tracking-widest uppercase text-white/30">
            Scroll to explore
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 md:right-16 flex flex-col items-center gap-2 pointer-events-none">
        <div
          className="w-px h-16 origin-top"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,229,255,0.6), transparent)",
          }}
        />
        <span className="font-mono text-[10px] tracking-ultra uppercase text-white/20 rotate-90 translate-y-8">
          Scroll
        </span>
      </div>
    </section>
  );
}
