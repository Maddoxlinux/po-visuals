"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const navLinks = ["Work", "Services", "Investment", "Connect"];

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".header-item",
        { opacity: 0, y: -12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.4,
        }
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id.toLowerCase());
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-6"
      style={{ background: "linear-gradient(to bottom, rgba(5,11,20,0.95), transparent)" }}
    >
      {/* Logo / Wordmark */}
      <div className="header-item flex items-center gap-3">
        <span className="accent-dot" />
        <span className="font-mono text-xs tracking-ultra uppercase text-white/80">
          P.O Visuals
        </span>
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-10">
        {navLinks.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            onClick={(e) => handleNavClick(e, link)}
            className="header-item nav-link font-mono text-xs tracking-widest uppercase text-white/50 hover:text-accent transition-colors duration-300"
          >
            {link}
          </a>
        ))}
      </nav>

      {/* CTA */}
      <a
        href="#connect"
        onClick={(e) => handleNavClick(e, "Connect")}
        className="header-item hidden md:inline-flex items-center gap-2 border border-accent/40 hover:border-accent px-5 py-2 font-mono text-xs tracking-widest uppercase text-accent hover:bg-accent-dim transition-all duration-300"
      >
        Book Now
      </a>
    </header>
  );
}
