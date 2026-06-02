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
      { label: "Normal Portraits", price: "GHS 300" },
      { label: "Model Portraits", price: "GHS 400–500" },
      { label: "Nude / Artistic", price: "GHS 600", note: "By arrangement" },
    ],
  },
  {
    category: "Graduation",
    featured: true,
    items: [
      { label: "Photo Only", price: "GHS 300" },
      { label: "Photo + Video", price: "GHS 500" },
    ],
  },
  {
    category: "Shop Videography",
    items: [
      { label: "Small Production", price: "GHS 300" },
      { label: "Full Production", price: "GHS 500" },
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
      gsap.fromTo(
        ".investment-heading",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".investment-heading",
            start: "top 85%",
          },
        }
      );

      gsap.fromTo(
        ".pricing-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".pricing-grid",
            start: "top 80%",
          },
        }
      );

      // ScrollTrigger placeholder for Phase 2 camera dolly
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom center",
        scrub: true,
        onUpdate: (self) => {
          console.log("[Investment ScrollTrigger] progress:", self.progress.toFixed(3));
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="investment"
      ref={sectionRef}
      className="relative min-h-screen py-32 px-8 md:px-16"
    >
      {/* Gradient backdrop — the 3D camera sits on the right at this scroll
          state (posX: 2.0, showing its metallic back). The gradient keeps
          the pricing cards on the left legible while the right side stays
          transparent so the camera is unobstructed through the canvas. */}
      <div
        className="absolute inset-0 -z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,11,20,0.92) 0%, rgba(5,11,20,0.92) 55%, rgba(5,11,20,0.35) 80%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <hr className="hr-accent mb-24" />

      {/* Heading */}
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
          All prices are in Ghanaian Cedi (GHS).
        </p>
      </div>

      {/* Pricing grid */}
      <div className="pricing-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pricingData.map((tier) => (
          <div
            key={tier.category}
            className={`pricing-card relative border p-8 transition-all duration-500 group ${
              tier.featured
                ? "border-accent/40 bg-accent/[0.04]"
                : "border-white/8 bg-white/[0.02] hover:border-white/20"
            }`}
          >
            {tier.featured && (
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            )}

            {/* Category */}
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-mono text-xs tracking-ultra uppercase text-white/60">
                {tier.category}
              </h3>
              {tier.featured && (
                <span className="font-mono text-[10px] tracking-widest uppercase text-accent border border-accent/30 px-2 py-0.5">
                  Popular
                </span>
              )}
            </div>

            {/* Items */}
            <ul className="space-y-5">
              {tier.items.map((item) => (
                <li key={item.label} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-sans text-sm text-white/70">{item.label}</p>
                    {item.note && (
                      <p className="font-mono text-[10px] tracking-widest uppercase text-white/25 mt-1">
                        {item.note}
                      </p>
                    )}
                  </div>
                  <span
                    className={`font-serif font-bold text-lg whitespace-nowrap ${
                      tier.featured ? "text-accent" : "text-white"
                    }`}
                  >
                    {item.price}
                  </span>
                </li>
              ))}
            </ul>

            {/* Bottom CTA */}
            <div className="mt-10 pt-8 border-t border-white/8">
              <a
                href="#connect"
                className={`flex items-center gap-2 font-mono text-xs tracking-widest uppercase transition-colors duration-300 ${
                  tier.featured
                    ? "text-accent hover:text-white"
                    : "text-white/30 hover:text-accent"
                }`}
              >
                Book this package
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M1 6h10M6 1l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="font-mono text-[11px] tracking-widest uppercase text-white/20 mt-12 text-center">
        Prices may vary based on location, duration, and specific requirements.
        Contact for a custom quote.
      </p>
    </section>
  );
}
