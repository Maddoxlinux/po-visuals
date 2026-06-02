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
      {/* ── Layer 0: fixed dark canvas background ─────────────────────
          Sits below the WebGL canvas (z-[5]) so the transparent R3F
          canvas alpha regions don't expose the browser chrome. */}
      <div className="fixed inset-0 z-0 bg-canvas" aria-hidden="true" />

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
