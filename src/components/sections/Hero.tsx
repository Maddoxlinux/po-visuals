"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animation
      const tl = gsap.timeline({ delay: 0.2 });

      tl.fromTo(
        ".hero-eyebrow",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }
      )
        .fromTo(
          ".hero-title-line",
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.15, ease: "power4.out" },
          "-=0.5"
        )
        .fromTo(
          ".hero-sub",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
          "-=0.4"
        )
        .fromTo(
          ".hero-meta",
          { opacity: 0 },
          { opacity: 1, duration: 1, ease: "power2.out" },
          "-=0.3"
        );

      // ScrollTrigger placeholder — wires up to WebGL camera state in Phase 2
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          console.log("[Hero ScrollTrigger] progress:", self.progress.toFixed(3));
        },
      });

      // Parallax on the WebGL container placeholder
      gsap.to(canvasRef.current, {
        y: "20%",
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
      {/* WebGL Canvas placeholder — Phase 2 mounts <Canvas> here */}
      <div
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        data-webgl-canvas
        aria-hidden="true"
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Central glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(0,229,255,0.07) 0%, rgba(0,229,255,0.02) 40%, transparent 70%)",
          }}
        />

        {/* Camera silhouette placeholder text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="border border-accent/10 px-12 py-8 text-center">
            <p className="font-mono text-xs tracking-ultra uppercase text-accent/20">
              [ 3D Camera — Phase 2 ]
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl w-full">
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
          Premium photography & cinematography — conventions, portraits, graduations,
          events, and weddings — crafted with intent.
        </p>

        {/* Meta row */}
        <div className="hero-meta flex flex-wrap items-center gap-8">
          <a
            href="#services"
            className="inline-flex items-center gap-3 bg-accent text-canvas font-mono text-xs tracking-widest uppercase px-8 py-4 hover:bg-white transition-colors duration-300"
          >
            Explore Work
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <div className="h-px w-12 bg-white/20" />

          <span className="font-mono text-xs tracking-widest uppercase text-white/30">
            Scroll to explore
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 md:right-16 flex flex-col items-center gap-2">
        <div
          className="w-px h-16 origin-top"
          style={{
            background: "linear-gradient(to bottom, rgba(0,229,255,0.6), transparent)",
          }}
        />
        <span className="font-mono text-[10px] tracking-ultra uppercase text-white/20 rotate-90 translate-y-8">
          Scroll
        </span>
      </div>
    </section>
  );
}
