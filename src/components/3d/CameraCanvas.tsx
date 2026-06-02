"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, AdaptiveDpr, Environment, AdaptiveEvents } from "@react-three/drei";
import * as THREE from "three";
import { CameraModel } from "./CameraModel";
import { SceneLights } from "./SceneLights";

function Loader() {
  return (
    <Html center>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: "0.35em",
          color: "rgba(0,229,255,0.35)",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            display: "inline-block",
            animation: "pulse 1.4s ease-in-out infinite",
          }}
        >
          Initialising
        </span>
      </div>
    </Html>
  );
}

export default function CameraCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0.2, 5], fov: 38, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, 2]}
        shadows
        style={{ background: "transparent" }}
      >
        {/* Adaptive pixel ratio drops DPR under load to maintain 60fps */}
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        <Suspense fallback={<Loader />}>
          <SceneLights />
          <CameraModel />
          {/*
            Environment provides HDR reflections for metallic + glass materials.
            background={false} so it doesn't override our dark canvas bg.
            Wrapped in its own Suspense so a CDN miss doesn't kill the whole scene.
          */}
          <Suspense fallback={null}>
            <Environment preset="studio" background={false} />
          </Suspense>
        </Suspense>
      </Canvas>
    </div>
  );
}
