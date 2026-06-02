"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import {
  componentPositions,
  componentRotations,
  sceneState,
  mouseSmooth,
} from "@/lib/componentPositions";

// Parallax depth coefficients — ring is frontmost so gets full parallax,
// sensor/phone get progressively less to sell the layered depth.
const PARALLAX = { ring: 1.0, lens1: 0.82, lens2: 0.68, sensor: 0.52 };

// Per-component float phase offsets for organic scatter animation in Stage 1
const FLOAT_PHASE = { ring: 0, lens1: 1.05, lens2: 2.30, sensor: 0.55 };

export function LensArray() {
  const ringRef   = useRef<THREE.Group>(null);
  const lens1Ref  = useRef<THREE.Group>(null);
  const lens2Ref  = useRef<THREE.Group>(null);
  const sensorRef = useRef<THREE.Group>(null);

  // Lens glow overlay materials — BasicMaterial so they emit pure colour
  // regardless of scene lighting, simulating light projected through optics
  const overlay1Ref = useRef<THREE.MeshBasicMaterial>(null);
  const overlay2Ref = useRef<THREE.MeshBasicMaterial>(null);
  // Lens-axis point light — activates in Stage 3
  const lensLightRef = useRef<THREE.PointLight>(null);

  const mouse        = useRef({ x: 0, y: 0 });
  const pageVisible  = useRef(true);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onVis = () => { pageVisible.current = !document.hidden; };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // ── Materials ─────────────────────────────────────────────────────────────

  const mat = useMemo(() => {
    // Liquid titanium / satin-chrome — reflects the dark-navy background
    // and the cyan light leaks from CinematicLights
    const ring = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color("#24242e"),   // slightly lighter, more reflective
      roughness:          0.15,
      metalness:          0.95,
      reflectivity:       1,
      clearcoat:          0.7,
      clearcoatRoughness: 0.06,
      envMapIntensity:    4.0,
    });

    const ringInner = new THREE.MeshPhysicalMaterial({
      color:           new THREE.Color("#12121a"),
      roughness:       0.28,
      metalness:       0.88,
      envMapIntensity: 1.8,
    });

    // Note: glass is now inline <MeshTransmissionMaterial> in JSX for proper
    // refraction buffer — kept here only for the edge-seal torus references
    const sealMetal = new THREE.MeshPhysicalMaterial({
      color:           new THREE.Color("#20202a"),
      roughness:       0.12,
      metalness:       0.98,
      envMapIntensity: 3.5,
    });

    const sensor = new THREE.MeshPhysicalMaterial({
      color:           new THREE.Color("#0a0e1c"),
      roughness:       0.13,
      metalness:       0.94,
      reflectivity:    0.9,
      envMapIntensity: 2.8,
    });

    return { ring, ringInner, sealMetal, sensor };
  }, []);

  // ── Biconvex lens profiles (LatheGeometry points) ─────────────────────────
  // Points are in [radius, height] form; LatheGeometry rotates around Y,
  // so we then rotate the mesh 90° on X to make the lens face +Z.

  const lens1Points = useMemo(() => [
    new THREE.Vector2(0.000, -0.068),
    new THREE.Vector2(0.060, -0.064),
    new THREE.Vector2(0.130, -0.053),
    new THREE.Vector2(0.200, -0.034),
    new THREE.Vector2(0.255, -0.012),
    new THREE.Vector2(0.285,  0.000),
    new THREE.Vector2(0.255,  0.012),
    new THREE.Vector2(0.200,  0.034),
    new THREE.Vector2(0.130,  0.053),
    new THREE.Vector2(0.060,  0.064),
    new THREE.Vector2(0.000,  0.068),
  ], []);

  const lens2Points = useMemo(() => [
    new THREE.Vector2(0.000, -0.050),
    new THREE.Vector2(0.055, -0.047),
    new THREE.Vector2(0.120, -0.038),
    new THREE.Vector2(0.185, -0.021),
    new THREE.Vector2(0.235, -0.005),
    new THREE.Vector2(0.252,  0.000),
    new THREE.Vector2(0.235,  0.005),
    new THREE.Vector2(0.185,  0.021),
    new THREE.Vector2(0.120,  0.038),
    new THREE.Vector2(0.055,  0.047),
    new THREE.Vector2(0.000,  0.050),
  ], []);

  // ── Canvas textures ───────────────────────────────────────────────────────

  const sensorTex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c   = document.createElement("canvas");
    c.width   = c.height = 512;
    const ctx = c.getContext("2d")!;

    ctx.fillStyle = "#06080f";
    ctx.fillRect(0, 0, 512, 512);

    // Photosite grid (6 px pitch — represents 3.7 µm sensor pixels at scale)
    ctx.strokeStyle = "#161d2e";
    ctx.lineWidth   = 0.6;
    for (let i = 0; i < 512; i += 6) {
      ctx.beginPath(); ctx.moveTo(i, 0);   ctx.lineTo(i, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i);   ctx.lineTo(512, i); ctx.stroke();
    }

    // Active area border
    ctx.strokeStyle = "rgba(0,229,255,0.45)";
    ctx.lineWidth   = 2;
    ctx.strokeRect(22, 22, 468, 468);

    // Corner bracket marks
    const b = 28;
    ([
      [22, 22, 1, 1], [490, 22, -1, 1], [22, 490, 1, -1], [490, 490, -1, -1],
    ] as [number,number,number,number][]).forEach(([cx, cy, sx, sy]) => {
      ctx.strokeStyle = "#00E5FF";
      ctx.lineWidth   = 2.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + sx * b, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + sy * b); ctx.stroke();
    });

    // Center micro-lens array hint
    ctx.fillStyle = "rgba(0,200,255,0.05)";
    ctx.beginPath();
    ctx.arc(256, 256, 140, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(c);
  }, []);

  // Lens projection overlay — diffraction rings + cyan radial glow
  const overlayTex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c   = document.createElement("canvas");
    c.width   = c.height = 512;
    const ctx = c.getContext("2d")!;

    const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    g.addColorStop(0,   "rgba(0,229,255,0.55)");
    g.addColorStop(0.35,"rgba(0,160,255,0.25)");
    g.addColorStop(0.75,"rgba(0,60,150,0.06)");
    g.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);

    // Airy-disk style diffraction rings
    for (let r = 40; r < 248; r += 26) {
      const alpha = ((248 - r) / 248) * 0.28;
      ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
      ctx.lineWidth   = 1.2;
      ctx.beginPath();
      ctx.arc(256, 256, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Cross flare lines
    ctx.strokeStyle = "rgba(0,229,255,0.12)";
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(0,   256); ctx.lineTo(512, 256); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(256, 0);   ctx.lineTo(256, 512); ctx.stroke();

    return new THREE.CanvasTexture(c);
  }, []);

  // ── useFrame ──────────────────────────────────────────────────────────────

  useFrame(({ clock }) => {
    if (!pageVisible.current) return;

    const t  = clock.getElapsedTime();
    const mi = sceneState.mouseInfluence;
    const g  = sceneState.lensGlow;

    // Update shared mouse smooth (SmartphoneFrame reads this)
    mouseSmooth.x += (mouse.current.x * 0.18 * mi - mouseSmooth.x) * 0.042;
    mouseSmooth.y += (mouse.current.y * 0.15 * mi - mouseSmooth.y) * 0.042;

    const mx = mouseSmooth.x;
    const my = mouseSmooth.y;

    // Per-component idle float (organic, phase-offset sine waves)
    const amp  = 0.058 * mi;
    const fRing   = Math.sin(t * 0.62 + FLOAT_PHASE.ring)   * amp;
    const fLens1  = Math.sin(t * 0.71 + FLOAT_PHASE.lens1)  * amp;
    const fLens2  = Math.sin(t * 0.57 + FLOAT_PHASE.lens2)  * amp * 0.9;
    const fSensor = Math.sin(t * 0.78 + FLOAT_PHASE.sensor) * amp * 0.7;

    if (ringRef.current) {
      ringRef.current.position.set(
        componentPositions.ring.x + mx * 0.22 * PARALLAX.ring,
        componentPositions.ring.y + my * 0.22 * PARALLAX.ring + fRing,
        componentPositions.ring.z,
      );
      ringRef.current.rotation.set(
        componentRotations.ring.x,
        componentRotations.ring.y,
        componentRotations.ring.z,
      );
    }

    if (lens1Ref.current) {
      lens1Ref.current.position.set(
        componentPositions.lens1.x + mx * 0.22 * PARALLAX.lens1,
        componentPositions.lens1.y + my * 0.22 * PARALLAX.lens1 + fLens1,
        componentPositions.lens1.z,
      );
      lens1Ref.current.rotation.set(
        componentRotations.lens1.x,
        componentRotations.lens1.y,
        componentRotations.lens1.z,
      );
    }

    if (lens2Ref.current) {
      lens2Ref.current.position.set(
        componentPositions.lens2.x + mx * 0.22 * PARALLAX.lens2,
        componentPositions.lens2.y + my * 0.22 * PARALLAX.lens2 + fLens2,
        componentPositions.lens2.z,
      );
      lens2Ref.current.rotation.set(
        componentRotations.lens2.x,
        componentRotations.lens2.y,
        componentRotations.lens2.z,
      );
    }

    if (sensorRef.current) {
      sensorRef.current.position.set(
        componentPositions.sensor.x + mx * 0.22 * PARALLAX.sensor,
        componentPositions.sensor.y + my * 0.22 * PARALLAX.sensor + fSensor,
        componentPositions.sensor.z,
      );
      sensorRef.current.rotation.set(
        componentRotations.sensor.x,
        componentRotations.sensor.y,
        componentRotations.sensor.z,
      );
    }

    // Lens projection overlay — activates in Stage 3
    if (overlay1Ref.current) overlay1Ref.current.opacity = g * 0.88;
    if (overlay2Ref.current) overlay2Ref.current.opacity = g * 0.72;
    if (lensLightRef.current) lensLightRef.current.intensity = g * 7;
  });

  const { ring, ringInner, sealMetal, sensor } = mat;

  return (
    <>
      {/* Lens-axis PointLight — inside lens1 group so it follows assembly */}
      {/* Its intensity is driven by lensGlow in useFrame above */}

      {/* ── OUTER RING ───────────────────────────────────────────────── */}
      <group ref={ringRef}>
        {/* Main bevelled outer torus */}
        <mesh material={ring} castShadow>
          <torusGeometry args={[0.54, 0.068, 24, 96]} />
        </mesh>
        {/* Inner shoulder step */}
        <mesh material={ringInner} castShadow>
          <torusGeometry args={[0.46, 0.042, 16, 96]} />
        </mesh>
        {/* Inner barrel — cylindrical bore */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={ringInner}>
          <cylinderGeometry args={[0.408, 0.408, 0.065, 96]} />
        </mesh>
        {/* Retention groove */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={ring}>
          <torusGeometry args={[0.54, 0.012, 8, 96]} />
        </mesh>
      </group>

      {/* ── LENS 1 — Front element (larger, biconvex) ────────────────── */}
      <group ref={lens1Ref}>
        {/* Biconvex glass element — MeshTransmissionMaterial creates a live
            refraction buffer so 3D content behind the glass is properly
            bent by ior:1.3 and RGB-split by chromaticAberration:0.5.     */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <latheGeometry args={[lens1Points, 96]} />
          <MeshTransmissionMaterial
            samples={4}
            resolution={512}
            transmission={1}
            thickness={1.5}
            ior={1.3}
            chromaticAberration={0.5}
            distortion={0.38}
            distortionScale={0.42}
            temporalDistortion={0.08}
            roughness={0.1}
            color="#040c18"
            attenuationColor="#00C8FF"
            attenuationDistance={1.5}
            iridescence={0.85}
            iridescenceIOR={1.35}
            iridescenceThicknessRange={[80, 420] as [number, number]}
            envMapIntensity={5}
            backside={false}
          />
        </mesh>
        {/* Edge seal ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={sealMetal}>
          <torusGeometry args={[0.285, 0.018, 8, 96]} />
        </mesh>
        {/* Projection glow overlay (flat disc, in front of glass) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.072]}>
          <circleGeometry args={[0.287, 64]} />
          <meshBasicMaterial
            ref={overlay1Ref}
            map={overlayTex}
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </mesh>
        {/* Lens-axis point light — follows this group */}
        <pointLight
          ref={lensLightRef}
          color="#00E5FF"
          intensity={0}
          position={[0, 0, 0.18]}
          distance={6}
          decay={2}
        />
      </group>

      {/* ── LENS 2 — Rear element (smaller, different profile) ───────── */}
      <group ref={lens2Ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <latheGeometry args={[lens2Points, 96]} />
          <MeshTransmissionMaterial
            samples={4}
            resolution={512}
            transmission={1}
            thickness={1.2}
            ior={1.3}
            chromaticAberration={0.4}
            distortion={0.28}
            distortionScale={0.35}
            temporalDistortion={0.06}
            roughness={0.1}
            color="#030a14"
            attenuationColor="#0080CC"
            attenuationDistance={1.2}
            iridescence={0.7}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[100, 380] as [number, number]}
            envMapIntensity={4.5}
            backside={false}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={sealMetal}>
          <torusGeometry args={[0.252, 0.016, 8, 96]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.054]}>
          <circleGeometry args={[0.254, 64]} />
          <meshBasicMaterial
            ref={overlay2Ref}
            map={overlayTex}
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </mesh>
      </group>

      {/* ── SENSOR PLATE ─────────────────────────────────────────────── */}
      <group ref={sensorRef}>
        {/* Metallic plate body */}
        <mesh material={sensor} castShadow>
          <boxGeometry args={[0.56, 0.56, 0.044]} />
        </mesh>
        {/* Photosite grid texture on front face */}
        <mesh position={[0, 0, 0.024]}>
          <planeGeometry args={[0.54, 0.54]} />
          <meshStandardMaterial
            map={sensorTex}
            transparent
            opacity={0.92}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        {/* Corner retention screws (4 tiny cylinders) */}
        {([[-0.23, -0.23],[0.23,-0.23],[-0.23,0.23],[0.23,0.23]] as [number,number][])
          .map(([sx, sy], i) => (
            <mesh key={i} position={[sx, sy, 0.026]} material={ring}>
              <cylinderGeometry args={[0.018, 0.018, 0.006, 12]} />
            </mesh>
          ))
        }
      </group>
    </>
  );
}
