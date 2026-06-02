"use client";

import { useRef, useMemo } from "react";
import { useFrame }        from "@react-three/fiber";
import * as THREE          from "three";
import { componentPositions, sceneState } from "@/lib/componentPositions";

/**
 * A flat plane mesh positioned INSIDE the 3D scene, directly between Lens 1
 * and Lens 2 in the assembled Stage 3 configuration.
 *
 * Because this geometry exists in WebGL-space, MeshTransmissionMaterial's
 * refraction buffer captures it — pricing text is physically rendered through
 * the glass, bent and RGB-split by ior:1.4 and chromaticAberration:0.6.
 *
 * The plane follows the midpoint of lens1+lens2 positions so it moves with
 * the assembly during Stage 2→3, and recedes with the lens elements in Stage 4.
 * Opacity is driven by sceneState.lensGlow.
 */
export function PricingPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef  = useRef<THREE.MeshBasicMaterial>(null);

  // Canvas texture — pricing summary in the site's design language
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;

    const W = 768, H = 512;
    const cv  = document.createElement("canvas");
    cv.width  = W; cv.height = H;
    const ctx = cv.getContext("2d")!;

    // Background — very dark, mostly transparent when on the plane
    ctx.fillStyle = "rgba(3,7,18,0.0)";
    ctx.fillRect(0, 0, W, H);

    // Header rule
    ctx.strokeStyle = "rgba(0,229,255,0.4)";
    ctx.lineWidth   = 1.5;
    ctx.beginPath(); ctx.moveTo(40, 52); ctx.lineTo(W - 40, 52); ctx.stroke();

    // Wordmark
    ctx.fillStyle = "rgba(0,229,255,0.85)";
    ctx.font      = "bold 18px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("P.O VISUALS — INVESTMENT", W / 2, 36);

    // Pricing data rows
    const rows = [
      ["Convention",       "GHS 50"],
      ["Normal Portraits", "GHS 300"],
      ["Model Portraits",  "GHS 400–500"],
      ["Graduation",       "GHS 300–500"],
      ["Shop Video",       "GHS 300–500"],
      ["Party / Events",   "GHS 1,000–2,000"],
      ["Wedding",          "GHS 4,000–5,000"],
    ];

    rows.forEach(([label, price], i) => {
      const y     = 95 + i * 58;
      const isAlt = i % 2 === 0;

      // Subtle row tint
      ctx.fillStyle = isAlt ? "rgba(0,229,255,0.03)" : "transparent";
      ctx.fillRect(40, y - 26, W - 80, 44);

      // Label
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font      = "16px 'Courier New', monospace";
      ctx.textAlign = "left";
      ctx.fillText(label, 52, y);

      // Separator dots
      ctx.fillStyle = "rgba(0,229,255,0.25)";
      for (let d = 260; d < W - 180; d += 14) {
        ctx.fillRect(d, y - 3, 3, 3);
      }

      // Price — accent colour, bold
      ctx.fillStyle = i === 6 || i === 5 ? "#00E5FF" : "rgba(255,255,255,0.9)";
      ctx.font      = "bold 18px 'Courier New', monospace";
      ctx.textAlign = "right";
      ctx.fillText(price, W - 52, y);
    });

    // Footer rule
    ctx.strokeStyle = "rgba(0,229,255,0.3)";
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(40, H - 38); ctx.lineTo(W - 40, H - 38); ctx.stroke();
    ctx.fillStyle   = "rgba(255,255,255,0.3)";
    ctx.font        = "11px 'Courier New', monospace";
    ctx.textAlign   = "center";
    ctx.fillText("All prices in GHS  ·  povisuals.com", W / 2, H - 18);

    const texture        = new THREE.CanvasTexture(cv);
    texture.needsUpdate  = true;
    return texture;
  }, []);

  useFrame(() => {
    if (!meshRef.current || !matRef.current) return;

    const g = sceneState.lensGlow;

    // Follow the midpoint of lens1 + lens2 (assembled: ~0 0 0.375)
    // then step a bit behind them so they're between the glass elements
    meshRef.current.position.set(
      (componentPositions.lens1.x + componentPositions.lens2.x) * 0.5,
      (componentPositions.lens1.y + componentPositions.lens2.y) * 0.5,
      (componentPositions.lens1.z + componentPositions.lens2.z) * 0.5 - 0.38,
    );

    matRef.current.opacity = g * 0.82;
  });

  return (
    <mesh ref={meshRef}>
      {/* Sized to approximately fill the lens aperture at assembly distance */}
      <planeGeometry args={[1.32, 0.88]} />
      <meshBasicMaterial
        ref={matRef}
        map={tex}
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
