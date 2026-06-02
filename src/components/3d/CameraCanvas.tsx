"use client";

import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, AdaptiveDpr, Environment, AdaptiveEvents } from "@react-three/drei";
import * as THREE from "three";
import { LensArray }       from "./LensArray";
import { SmartphoneFrame } from "./SmartphoneFrame";
import { CinematicLights } from "./CinematicLights";
import { PricingPlane }    from "./PricingPlane";
import { AtmosphereRing }  from "./AtmosphereRing";

function Loader() {
  return (
    <Html center>
      <p style={{
        fontFamily: "monospace",
        fontSize: 10,
        letterSpacing: "0.35em",
        color: "rgba(0,229,255,0.35)",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}>
        Initialising
      </p>
    </Html>
  );
}

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
        camera={{ position: [0, 0.2, 5], fov: 38, near: 0.05, far: 120 }}
        gl={{
          antialias:          true,
          alpha:              true,
          toneMapping:        THREE.ACESFilmicToneMapping,
          toneMappingExposure:1.2,
          outputColorSpace:   THREE.SRGBColorSpace,
        }}
        frameloop={frameloop}
        dpr={[1, 2]}
        shadows
        style={{ background: "transparent" }}
      >
        {/* Subtle atmospheric depth fog — starts well beyond Stage 3 assembly */}
        <fog attach="fog" args={["#020a1a", 14, 28]} />

        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        <Suspense fallback={<Loader />}>
          {/* Background first so depth buffer is correct */}
          <AtmosphereRing />

          <CinematicLights />
          <LensArray />
          <SmartphoneFrame />

          {/*
            PricingPlane: a canvas-texture mesh that sits in 3D space between
            Lens 1 and Lens 2. MeshTransmissionMaterial's refraction buffer
            captures it, so the pricing text is physically bent, magnified,
            and RGB-split when viewed through the glass in Stage 3.
          */}
          <PricingPlane />

          {/* HDR environment for metallic + glass reflections */}
          <Suspense fallback={null}>
            <Environment preset="studio" background={false} />
          </Suspense>
        </Suspense>
      </Canvas>
    </div>
  );
}
