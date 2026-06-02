"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const collections = [
  {
    index: "01",
    title: "Portraits & Models",
    desc: "Studio and location-based portrait sessions — editorial, commercial, and artistic.",
    tag: "Photography",
  },
  {
    index: "02",
    title: "Conventions",
    desc: "Fast-paced event coverage with precision framing and instant delivery.",
    tag: "Events",
  },
  {
    index: "03",
    title: "Graduations",
    desc: "Milestone moments captured with elegance. Single and group packages available.",
    tag: "Milestones",
  },
  {
    index: "04",
    title: "Weddings",
    desc: "Full-day coverage, cinematic video, and premium album production.",
    tag: "Weddings",
  },
  {
    index: "05",
    title: "Shop & Brand Videos",
    desc: "Short-form product and brand cinematography engineered to convert.",
    tag: "Videography",
  },
  {
    index: "06",
    title: "Party & Social Events",
    desc: "High-energy event photography and recap reels for any occasion.",
    tag: "Events",
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section heading reveal
      gsap.fromTo(
        ".services-heading",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".services-heading",
            start: "top 85%",
          },
        }
      );

      // Cards stagger
      gsap.fromTo(
        ".service-card",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".services-grid",
            start: "top 80%",
          },
        }
      );

      // Heading parallax — drifts up at 60% of scroll speed (lighter than 3D)
      gsap.to(".services-heading", {
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.8,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative min-h-screen py-32 px-8 md:px-16 section-transparent"
    >
      <hr className="hr-accent mb-24" />

      {/* Heading block */}
      <div className="services-heading max-w-3xl mb-20">
        <p className="font-mono text-xs tracking-ultra uppercase text-accent mb-6 flex items-center gap-3">
          <span className="accent-dot" />
          Services &amp; Collections
        </p>
        <h2 className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] font-black text-white leading-none uppercase">
          Every Frame,
          <br />
          <span className="italic text-white/40">Intentional.</span>
        </h2>
      </div>

      {/* Grid */}
      <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((item) => (
          <div
            key={item.index}
            className="service-card glass-card group relative p-10 transition-all duration-500 cursor-pointer overflow-hidden"
          >
            {/* Hover accent line */}
            <div className="absolute top-0 left-0 w-0 group-hover:w-full h-px bg-accent transition-all duration-500" />

            {/* Index */}
            <span className="font-mono text-xs text-white/20 tracking-widest block mb-8">
              {item.index}
            </span>

            {/* Gallery placeholder */}
            <div
              className="w-full aspect-[4/3] mb-8 border border-white/5 group-hover:border-accent/20 transition-colors duration-500 flex items-center justify-center"
              data-gallery-slot={item.index}
              aria-label={`Gallery placeholder for ${item.title}`}
            >
              <div className="text-center">
                <div className="w-8 h-8 border border-white/10 rotate-45 mx-auto mb-3 group-hover:border-accent/30 transition-colors duration-500" />
                <span className="font-mono text-[10px] tracking-widest uppercase text-white/15">
                  Gallery Slot
                </span>
              </div>
            </div>

            {/* Tag */}
            <span className="inline-block font-mono text-[10px] tracking-ultra uppercase text-accent/60 border border-accent/20 px-3 py-1 mb-4">
              {item.tag}
            </span>

            {/* Title */}
            <h3 className="font-serif text-xl font-bold text-white mb-3 group-hover:text-accent transition-colors duration-300">
              {item.title}
            </h3>

            {/* Description */}
            <p className="font-sans text-sm text-white/40 leading-relaxed">{item.desc}</p>

            {/* Arrow */}
            <div className="mt-6 flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-white/20 group-hover:text-accent transition-colors duration-300">
              <span>View</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 6h10M6 1l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
