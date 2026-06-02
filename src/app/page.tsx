import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Investment from "@/components/sections/Investment";
import Connect from "@/components/sections/Connect";
import ScrollOrchestrator from "@/components/ScrollOrchestrator";
import CameraLayer from "@/components/CameraLayer";

export default function Home() {
  return (
    <>
      {/* ── Layer 0: rich luminous gradient backdrop ──────────────────
          Replaces the flat #050B14 to give the WebGL canvas a living,
          light-leaking environment to reflect from. The gradient is on
          <html> in globals.css; this div reinforces it as a fixed layer
          so it doesn't scroll or clip behind sections. */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, #030712 0%, #081125 28%, #0a1530 58%, #020617 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Layer 5: WebGL camera (fixed, client-only) ────────────────
          CameraLayer wraps next/dynamic(ssr:false) in a client component
          since Server Components cannot use ssr:false directly. */}
      <CameraLayer />

      {/* ── Scroll orchestrator — null-rendering, drives GSAP timeline ── */}
      <ScrollOrchestrator />

      {/* ── Layer 2: scrollable page content ──────────────────────────
          Transparent section backgrounds mean the fixed canvas shows
          through wherever there is no text / card content. */}
      <main className="relative z-[2] text-white">
        <Header />
        <Hero />
        <Services />
        <Investment />
        <Connect />
      </main>
    </>
  );
}
