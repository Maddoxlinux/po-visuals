"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Connect() {
  const sectionRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  const PHONE = "+233 XX XXX XXXX";
  const EMAIL = "povisuals@gmail.com";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".connect-heading",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".connect-heading",
            start: "top 85%",
          },
        }
      );

      gsap.fromTo(
        ".connect-item",
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".connect-items",
            start: "top 80%",
          },
        }
      );

      gsap.fromTo(
        ".connect-cta",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".connect-cta",
            start: "top 85%",
          },
        }
      );

      // ScrollTrigger placeholder for Phase 2 final camera rest pose
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          console.log("[Connect ScrollTrigger] progress:", self.progress.toFixed(3));
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="connect"
      ref={sectionRef}
      className="relative z-[10] min-h-screen py-32 px-8 md:px-16 flex flex-col justify-between"
    >
      {/* Dark semi-transparent fill — sits below section content but above the
          fixed canvas (z-[5]). At ~80% opacity the abstract cyan lens glow
          pulses through from behind at roughly 20% apparent intensity,
          creating an ethereal atmospheric backlight for the contact section. */}
      {/* Reduced to /62 — phone screen glow (Stage 4 screenGlow) pulses      */}
      {/* through at roughly 38% intensity, creating an ambient cyan haze      */}
      {/* behind the contact elements rather than a flat black wall.           */}
      <div
        className="absolute inset-0 -z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,7,18,0.62) 0%, rgba(8,17,37,0.68) 60%, rgba(2,6,23,0.72) 100%)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
        aria-hidden="true"
      />

      <hr className="hr-accent mb-24" />

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-20">
        {/* Left — heading + contacts */}
        <div className="flex-1 max-w-2xl">
          <div className="connect-heading">
            <p className="font-mono text-xs tracking-ultra uppercase text-accent mb-6 flex items-center gap-3">
              <span className="accent-dot" />
              Connect
            </p>
            <h2 className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] font-black text-white leading-none uppercase mb-8">
              Let&apos;s Create
              <br />
              <span className="italic text-white/40">Something.</span>
            </h2>
            <p className="font-sans text-sm text-white/30 max-w-sm leading-relaxed">
              Ready to book a session or discuss a custom package? Reach out
              directly — no contact forms, no waiting rooms.
            </p>
          </div>

          {/* Contact lines */}
          <div className="connect-items mt-14 space-y-6">
            {/* WhatsApp / Phone */}
            <button
              className="connect-item group flex items-center justify-between w-full border-b border-white/8 pb-6 hover:border-accent/40 transition-colors duration-300 text-left"
              onClick={() => handleCopy(PHONE)}
              aria-label="Copy phone number"
            >
              <div className="flex items-center gap-5">
                <span className="font-mono text-[10px] tracking-ultra uppercase text-white/20 w-20">
                  WhatsApp
                </span>
                <span className="font-serif text-xl text-white group-hover:text-accent transition-colors duration-300">
                  {PHONE}
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-widest uppercase text-white/20 group-hover:text-accent transition-colors duration-300">
                {copied ? "Copied!" : "Copy"}
              </span>
            </button>

            {/* Email */}
            <a
              href={`mailto:${EMAIL}`}
              className="connect-item group flex items-center justify-between w-full border-b border-white/8 pb-6 hover:border-accent/40 transition-colors duration-300"
            >
              <div className="flex items-center gap-5">
                <span className="font-mono text-[10px] tracking-ultra uppercase text-white/20 w-20">
                  Email
                </span>
                <span className="font-serif text-xl text-white group-hover:text-accent transition-colors duration-300">
                  {EMAIL}
                </span>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="text-white/20 group-hover:text-accent transition-colors duration-300"
              >
                <path
                  d="M1 7h12M7 1l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/povisuals"
              target="_blank"
              rel="noopener noreferrer"
              className="connect-item group flex items-center justify-between w-full border-b border-white/8 pb-6 hover:border-accent/40 transition-colors duration-300"
            >
              <div className="flex items-center gap-5">
                <span className="font-mono text-[10px] tracking-ultra uppercase text-white/20 w-20">
                  Instagram
                </span>
                <span className="font-serif text-xl text-white group-hover:text-accent transition-colors duration-300">
                  @povisuals
                </span>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="text-white/20 group-hover:text-accent transition-colors duration-300"
              >
                <path
                  d="M1 7h12M7 1l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Right — big CTA */}
        <div className="connect-cta lg:pt-32 flex flex-col items-start lg:items-end gap-8">
          <a
            href={`https://wa.me/233XXXXXXXXX`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-4 bg-accent text-canvas font-mono text-sm tracking-widest uppercase px-10 py-5 hover:bg-white transition-colors duration-300 overflow-hidden"
          >
            <span className="relative z-10">Book a Session</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="relative z-10 group-hover:translate-x-1 transition-transform duration-300"
            >
              <path
                d="M1 8h14M8 1l7 7-7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          <p className="font-mono text-[10px] tracking-widest uppercase text-white/20 max-w-[200px] text-right">
            Typically responds within 24 hours
          </p>
        </div>
      </div>

      {/* Footer bar */}
      <div className="mt-32 pt-8 border-t border-white/8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="accent-dot" />
          <span className="font-mono text-xs tracking-ultra uppercase text-white/30">
            P.O Visuals
          </span>
        </div>
        <p className="font-mono text-xs text-white/20">
          &copy; {new Date().getFullYear()} P.O Visuals. All rights reserved.
        </p>
        <p className="font-mono text-xs tracking-widest uppercase text-white/20">
          Ghana
        </p>
      </div>
    </section>
  );
}
