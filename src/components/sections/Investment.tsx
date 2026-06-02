"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type PricingTier = {
  category: string;
  items: { label: string; price: string; note?: string }[];
  featured?: boolean;
};

const pricingData: PricingTier[] = [
  {
    category: "Convention",
    items: [{ label: "Event Coverage", price: "GHS 50" }],
  },
  {
    category: "Photography",
    items: [
      { label: "Normal Portraits",  price: "GHS 300" },
      { label: "Model Portraits",   price: "GHS 400–500" },
      { label: "Nude / Artistic",   price: "GHS 600", note: "By arrangement" },
    ],
  },
  {
    category: "Graduation",
    featured: true,
    items: [
      { label: "Photo Only",        price: "GHS 300" },
      { label: "Photo + Video",     price: "GHS 500" },
    ],
  },
  {
    category: "Shop Videography",
    items: [
      { label: "Small Production",  price: "GHS 300" },
      { label: "Full Production",   price: "GHS 500" },
    ],
  },
  {
    category: "Party / Events",
    items: [{ label: "Event Package", price: "GHS 1,000–2,000" }],
  },
  {
    category: "Wedding",
    featured: true,
    items: [{ label: "Full-Day Package", price: "GHS 4,000–5,000", note: "Premium coverage" }],
  },
];

export default function Investment() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Heading entrance ──────────────────────────────────────────────
      gsap.fromTo(
        ".investment-heading",
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: ".investment-heading", start: "top 85%" },
        }
      );

      // ── Card entrance — stagger from centre outward ───────────────────
      gsap.fromTo(
        ".pricing-card",
        { opacity: 0, y: 44, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.75, stagger: { amount: 0.5, from: "center" },
          ease: "power3.out",
          scrollTrigger: { trigger: ".pricing-grid", start: "top 78%" },
        }
      );

      // ── LENS DISTORTION — the centrepiece effect ──────────────────────
      //
      // Stage 3 (scroll ~50–65%): the assembled lens array is centred over
      // the Investment section. Two GSAP tweens create a bell-curve:
      //   Phase IN  — price values blur, hue-shift, and magnify slightly
      //               as the glass lens "drifts over" them.
      //   Phase OUT — they snap back to crisp focus as the lens passes.
      //
      // stagger from:"center" means the middle column feels the full distortion
      // first; outer cards feel it later — mimicking a real lens field.
      const distortIn = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 50%",
          end: "center center",
          scrub: 1.2,
        },
      });

      distortIn
        .to(".lens-distort", {
          filter: "blur(0.85px) hue-rotate(20deg) brightness(1.20) saturate(1.5)",
          scale: 1.08,
          ease: "sine.inOut",
          stagger: { amount: 0.35, from: "center" },
        });

      const distortOut = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "center center",
          end: "bottom 50%",
          scrub: 1.2,
        },
      });

      distortOut
        .to(".lens-distort", {
          filter: "blur(0px) hue-rotate(0deg) brightness(1) saturate(1)",
          scale: 1,
          ease: "sine.inOut",
          stagger: { amount: 0.35, from: "center" },
        });

      // ── Card parallax — outer cards drift at a different rate to center ─
      // Gives the subtle impression the lens is curving / warping space.
      gsap.to(".pricing-card:nth-child(odd)", {
        y: -18,
        ease: "none",
        scrollTrigger: {
          trigger: ".pricing-grid",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
      gsap.to(".pricing-card:nth-child(even)", {
        y: 18,
        ease: "none",
        scrollTrigger: {
          trigger: ".pricing-grid",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="investment"
      ref={sectionRef}
      className="relative min-h-screen py-32 px-8 md:px-16 section-transparent"
    >
      {/*
        No solid backdrop here — the WebGL canvas (z-[5]) and the navy
        gradient (z-0) are the background. Cards use .glass-card backdrop-
        filter so text stays legible while the lens elements show through.
      */}

      <hr className="hr-accent mb-24" />

      {/* ── Heading ───────────────────────────────────────────────────── */}
      <div className="investment-heading max-w-3xl mb-20">
        <p className="font-mono text-xs tracking-ultra uppercase text-accent mb-6 flex items-center gap-3">
          <span className="accent-dot" />
          Investment
        </p>
        <h2 className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] font-black text-white leading-none uppercase">
          Transparent
          <br />
          <span className="italic text-white/40">Pricing.</span>
        </h2>
        <p className="font-sans text-sm text-white/30 mt-6 max-w-md leading-relaxed">
          Every package is a direct investment in imagery that lasts forever.
          All prices are in Ghanaian Cedi (GHS). Scroll to see them through the lens.
        </p>
      </div>

      {/* ── Pricing grid ───────────────────────────────────────────────── */}
      <div className="pricing-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pricingData.map((tier) => (
          <div
            key={tier.category}
            className={`pricing-card relative p-8 transition-all duration-500 group ${
              tier.featured ? "glass-card-featured" : "glass-card"
            }`}
          >
            {/* Lens-pass shimmer line — visible when lensGlow peaks */}
            {tier.featured && (
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-70" />
            )}

            {/* Lens-pass light-leak overlay — subtle cyan blush on the card */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(0,229,255,0.04), transparent)",
              }}
              aria-hidden="true"
            />

            {/* Category header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="font-mono text-xs tracking-ultra uppercase text-white/55">
                {tier.category}
              </h3>
              {tier.featured && (
                <span className="font-mono text-[10px] tracking-widest uppercase text-accent border border-accent/30 px-2 py-0.5">
                  Popular
                </span>
              )}
            </div>

            {/* Price items */}
            <ul className="space-y-5 relative z-10">
              {tier.items.map((item) => (
                <li key={item.label} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-sans text-sm text-white/65">{item.label}</p>
                    {item.note && (
                      <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mt-1">
                        {item.note}
                      </p>
                    )}
                  </div>
                  {/*
                    .lens-distort marks price values as distortion targets.
                    GSAP writes `filter` + `transform` directly to these
                    spans during the scroll window, simulating the chromatic
                    magnification of a biconvex glass passing overhead.
                  */}
                  <span
                    className={`lens-distort font-serif font-bold text-lg whitespace-nowrap ${
                      tier.featured ? "text-accent" : "text-white"
                    }`}
                  >
                    {item.price}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-10 pt-8 border-t border-white/[0.07] relative z-10">
              <a
                href="#connect"
                className={`flex items-center gap-2 font-mono text-xs tracking-widest uppercase transition-colors duration-300 ${
                  tier.featured ? "text-accent hover:text-white" : "text-white/28 hover:text-accent"
                }`}
              >
                Book this package
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 6h10M6 1l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="font-mono text-[11px] tracking-widest uppercase text-white/18 mt-12 text-center">
        Prices may vary based on location, duration, and specific requirements. Contact for a custom quote.
      </p>
    </section>
  );
}
