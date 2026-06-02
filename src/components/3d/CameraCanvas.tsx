"use client";

import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, AdaptiveDpr, Environment, AdaptiveEvents } from "@react-three/drei";
import * as THREE from "three";
import { CameraModel } from "./CameraModel";
import { SceneLights } from "./SceneLights";

function Loader() {
  return (
    <Html center>
      <p
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: "0.35em",
          color: "rgba(0,229,255,0.35)",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        Initialising
      </p>
    </Html>
  );
}

/**
 * Fixed full-screen WebGL overlay — z-[5] sits above section content
 * (heroes, services) but below the Connect section (z-[10]) so the final
 * state "abstract glow" pulses through the semi-transparent Connect backdrop.
 *
 * frameloop switches to "never" when the browser tab is hidden, pausing
 * all GPU work until the user returns.
 */
export default function CameraCanvas() {
  const [frameloop, setFrameloop] =
    useState<"always" | "demand" | "never">("always");

  useEffect(() => {
    const onChange = () =>
      setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[5] pointer-events-none"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0.2, 5], fov: 38, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        frameloop={frameloop}
        dpr={[1, 2]}
        shadows
        style={{ background: "transparent" }}
      >
        {/* Drop DPR under GPU load to hold 60 fps */}
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        <Suspense fallback={<Loader />}>
          <SceneLights />
          <CameraModel />
          {/* HDR env-map for metallic / glass reflections.
              Inner Suspense isolates CDN load failures from the model. */}
          <Suspense fallback={null}>
            <Environment preset="studio" background={false} />
          </Suspense>
        </Suspense>
      </Canvas>
    </div>
  );
}
