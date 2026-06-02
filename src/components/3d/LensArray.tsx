"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame }                    from "@react-three/fiber";
import { MeshTransmissionMaterial, Html } from "@react-three/drei";
import * as THREE                       from "three";
import {
  componentPositions,
  componentRotations,
  sceneState,
  mouseSmooth,
  hoverState,
}                from "@/lib/componentPositions";
import {
  makeSpringVec3,
  tickSpring,
  SPRING_PRESETS,
  type SpringVec3,
}                from "@/lib/springPhysics";

// Parallax depth multipliers — front ring has most parallax for depth illusion
const PARALLAX   = { ring: 1.0, lens1: 0.82, lens2: 0.68, sensor: 0.52 };
const FLOAT_PHASE = { ring: 0, lens1: 1.05, lens2: 2.30, sensor: 0.55 };

// Traverse up an object's parent chain looking for userData.componentId
function getComponentId(obj: THREE.Object3D): string | null {
  let cur: THREE.Object3D | null = obj;
  while (cur) {
    if (cur.userData.componentId) return cur.userData.componentId as string;
    cur = cur.parent;
  }
  return null;
}

export function LensArray() {
  // ── Group refs ─────────────────────────────────────────────────────────────
  const ringRef   = useRef<THREE.Group>(null);
  const lens1Ref  = useRef<THREE.Group>(null);
  const lens2Ref  = useRef<THREE.Group>(null);
  const sensorRef = useRef<THREE.Group>(null);

  // Mesh refs for MeshTransmissionMaterial emissive access
  const lens1MeshRef = useRef<THREE.Mesh>(null);
  const lens2MeshRef = useRef<THREE.Mesh>(null);

  // ── Glow overlay material refs + lens PointLight ───────────────────────────
  const overlay1Ref  = useRef<THREE.MeshBasicMaterial>(null);
  const overlay2Ref  = useRef<THREE.MeshBasicMaterial>(null);
  const lensLightRef = useRef<THREE.PointLight>(null);

  // ── Spring physics state — one per component (initialized at Stage 1) ──────
  const sprRing   = useRef<SpringVec3>(makeSpringVec3(-4.0,  1.8,  0.5));
  const sprLens1  = useRef<SpringVec3>(makeSpringVec3( 3.5, -0.5,  1.8));
  const sprLens2  = useRef<SpringVec3>(makeSpringVec3( 0.8,  3.0, -0.5));
  const sprSensor = useRef<SpringVec3>(makeSpringVec3(-1.8, -2.8, -1.2));

  // ── Raycasting ────────────────────────────────────────────────────────────
  const pointer    = useRef(new THREE.Vector2());
  const mouse      = useRef({ x: 0, y: 0 });
  const pageVisible = useRef(true);

  // ── Tooltip DOM refs — written directly from useFrame (no state updates) ──
  const tipRingRef   = useRef<HTMLDivElement>(null);
  const tipLens1Ref  = useRef<HTMLDivElement>(null);
  const tipLens2Ref  = useRef<HTMLDivElement>(null);
  const tipSensorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
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

  // ── Materials ──────────────────────────────────────────────────────────────
  const mat = useMemo(() => {
    const ring = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color("#24242e"),
      roughness:          0.15,
      metalness:          0.95,
      reflectivity:       1,
      clearcoat:          0.7,
      clearcoatRoughness: 0.06,
      envMapIntensity:    4.0,
      emissive:           new THREE.Color(0x000000),
      emissiveIntensity:  0,
    });
    const ringInner = new THREE.MeshPhysicalMaterial({
      color:           new THREE.Color("#12121a"),
      roughness:       0.28,
      metalness:       0.88,
      envMapIntensity: 1.8,
      emissive:        new THREE.Color(0x000000),
      emissiveIntensity: 0,
    });
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
      emissive:        new THREE.Color(0x000000),
      emissiveIntensity: 0,
    });
    return { ring, ringInner, sealMetal, sensor };
  }, []);

  // ── Biconvex lens LatheGeometry profiles ──────────────────────────────────
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

  // ── Canvas textures ─────────────────────────────────────────────────────────
  const sensorTex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#06080f";
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "#161d2e"; ctx.lineWidth = 0.6;
    for (let i = 0; i < 512; i += 6) {
      ctx.beginPath(); ctx.moveTo(i, 0);   ctx.lineTo(i, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i);   ctx.lineTo(512, i); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(0,229,255,0.45)"; ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, 468, 468);
    ([
      [22,22,1,1],[490,22,-1,1],[22,490,1,-1],[490,490,-1,-1],
    ] as [number,number,number,number][]).forEach(([cx,cy,sx,sy]) => {
      ctx.strokeStyle = "#00E5FF"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+sx*28,cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx,cy+sy*28); ctx.stroke();
    });
    return new THREE.CanvasTexture(c);
  }, []);

  const overlayTex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(256,256,0, 256,256,256);
    g.addColorStop(0,   "rgba(0,229,255,0.55)");
    g.addColorStop(0.35,"rgba(0,160,255,0.25)");
    g.addColorStop(0.75,"rgba(0,60,150,0.06)");
    g.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0,0,512,512);
    for (let r = 40; r < 248; r += 26) {
      const alpha = ((248-r)/248)*0.28;
      ctx.strokeStyle = `rgba(0,229,255,${alpha})`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(256,256,r,0,Math.PI*2); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(0,229,255,0.12)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0,256);   ctx.lineTo(512,256); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(256,0);   ctx.lineTo(256,512); ctx.stroke();
    return new THREE.CanvasTexture(c);
  }, []);

  // ── useFrame ────────────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    if (!pageVisible.current) return;

    const { camera, raycaster } = state;
    const t  = state.clock.getElapsedTime();
    const mi = sceneState.mouseInfluence;
    const g  = sceneState.lensGlow;

    // 1. Update shared mouse smooth
    mouseSmooth.x += (mouse.current.x * 0.18 * mi - mouseSmooth.x) * 0.042;
    mouseSmooth.y += (mouse.current.y * 0.15 * mi - mouseSmooth.y) * 0.042;
    const mx = mouseSmooth.x;
    const my = mouseSmooth.y;

    // 2. Advance spring physics toward GSAP targets
    tickSpring(sprRing.current,   componentPositions.ring,   SPRING_PRESETS.ring.stiffness,   SPRING_PRESETS.ring.damping,   delta);
    tickSpring(sprLens1.current,  componentPositions.lens1,  SPRING_PRESETS.lens1.stiffness,  SPRING_PRESETS.lens1.damping,  delta);
    tickSpring(sprLens2.current,  componentPositions.lens2,  SPRING_PRESETS.lens2.stiffness,  SPRING_PRESETS.lens2.damping,  delta);
    tickSpring(sprSensor.current, componentPositions.sensor, SPRING_PRESETS.sensor.stiffness, SPRING_PRESETS.sensor.damping, delta);

    // 3. Idle float — organic per-component phase offsets (fades with mi)
    const amp  = 0.058 * mi;
    const fRing   = Math.sin(t * 0.62 + FLOAT_PHASE.ring)   * amp;
    const fLens1  = Math.sin(t * 0.71 + FLOAT_PHASE.lens1)  * amp;
    const fLens2  = Math.sin(t * 0.57 + FLOAT_PHASE.lens2)  * amp * 0.9;
    const fSensor = Math.sin(t * 0.78 + FLOAT_PHASE.sensor) * amp * 0.7;

    // 4. Hover raycasting (only when mouse influence is meaningful)
    let newHovered: string | null = null;
    if (mi > 0.15) {
      pointer.current.set(mouse.current.x, mouse.current.y);
      raycaster.setFromCamera(pointer.current, camera);
      const candidates: THREE.Object3D[] = [];
      [ringRef, lens1Ref, lens2Ref, sensorRef].forEach(r => {
        r.current?.traverse(c => { if ((c as THREE.Mesh).isMesh) candidates.push(c); });
      });
      const hits = raycaster.intersectObjects(candidates, false);
      if (hits.length > 0) newHovered = getComponentId(hits[0].object);
    }

    // Update hover state + tooltip visibility (only when hover changes)
    if (newHovered !== hoverState.active) {
      hoverState.active = newHovered;
      const tips: Record<string, React.RefObject<HTMLDivElement | null>> = {
        ring: tipRingRef, lens1: tipLens1Ref, lens2: tipLens2Ref, sensor: tipSensorRef,
      };
      Object.entries(tips).forEach(([id, ref]) => {
        if (ref.current) ref.current.style.opacity = id === newHovered ? "1" : "0";
      });
    }

    // 5. Apply spring positions to groups + parallax + float
    if (ringRef.current) {
      ringRef.current.position.set(
        sprRing.current.pos.x + mx * 0.22 * PARALLAX.ring,
        sprRing.current.pos.y + my * 0.22 * PARALLAX.ring + fRing,
        sprRing.current.pos.z,
      );
      // Smooth damp on rotations (no overshoot — wobbling rotation looks wrong)
      ringRef.current.rotation.x = THREE.MathUtils.damp(ringRef.current.rotation.x, componentRotations.ring.x, 12, delta);
      ringRef.current.rotation.y = THREE.MathUtils.damp(ringRef.current.rotation.y, componentRotations.ring.y, 12, delta);
      ringRef.current.rotation.z = THREE.MathUtils.damp(ringRef.current.rotation.z, componentRotations.ring.z, 12, delta);
    }
    if (lens1Ref.current) {
      lens1Ref.current.position.set(
        sprLens1.current.pos.x + mx * 0.22 * PARALLAX.lens1,
        sprLens1.current.pos.y + my * 0.22 * PARALLAX.lens1 + fLens1,
        sprLens1.current.pos.z,
      );
      lens1Ref.current.rotation.x = THREE.MathUtils.damp(lens1Ref.current.rotation.x, componentRotations.lens1.x, 12, delta);
      lens1Ref.current.rotation.y = THREE.MathUtils.damp(lens1Ref.current.rotation.y, componentRotations.lens1.y, 12, delta);
      lens1Ref.current.rotation.z = THREE.MathUtils.damp(lens1Ref.current.rotation.z, componentRotations.lens1.z, 12, delta);
    }
    if (lens2Ref.current) {
      lens2Ref.current.position.set(
        sprLens2.current.pos.x + mx * 0.22 * PARALLAX.lens2,
        sprLens2.current.pos.y + my * 0.22 * PARALLAX.lens2 + fLens2,
        sprLens2.current.pos.z,
      );
      lens2Ref.current.rotation.x = THREE.MathUtils.damp(lens2Ref.current.rotation.x, componentRotations.lens2.x, 12, delta);
      lens2Ref.current.rotation.y = THREE.MathUtils.damp(lens2Ref.current.rotation.y, componentRotations.lens2.y, 12, delta);
      lens2Ref.current.rotation.z = THREE.MathUtils.damp(lens2Ref.current.rotation.z, componentRotations.lens2.z, 12, delta);
    }
    if (sensorRef.current) {
      sensorRef.current.position.set(
        sprSensor.current.pos.x + mx * 0.22 * PARALLAX.sensor,
        sprSensor.current.pos.y + my * 0.22 * PARALLAX.sensor + fSensor,
        sprSensor.current.pos.z,
      );
      sensorRef.current.rotation.x = THREE.MathUtils.damp(sensorRef.current.rotation.x, componentRotations.sensor.x, 12, delta);
      sensorRef.current.rotation.y = THREE.MathUtils.damp(sensorRef.current.rotation.y, componentRotations.sensor.y, 12, delta);
      sensorRef.current.rotation.z = THREE.MathUtils.damp(sensorRef.current.rotation.z, componentRotations.sensor.z, 12, delta);
    }

    // 6. Hover emissive flash — damp toward target intensity
    const ringTarget   = hoverState.active === "ring"   ? 1.8 : 0;
    const sensorTarget = hoverState.active === "sensor" ? 1.6 : 0;
    mat.ring.emissiveIntensity   = THREE.MathUtils.damp(mat.ring.emissiveIntensity,   ringTarget,   hoverState.active === "ring"   ? 12 : 6, delta);
    mat.sensor.emissiveIntensity = THREE.MathUtils.damp(mat.sensor.emissiveIntensity, sensorTarget, hoverState.active === "sensor" ? 12 : 6, delta);
    if (ringTarget > 0.01) mat.ring.emissive.setHex(0x00E5FF);

    // Lens emissive via mesh ref (MeshTransmissionMaterial extends MeshPhysicalMaterial)
    for (const [meshRef, id] of [[lens1MeshRef, "lens1"],[lens2MeshRef, "lens2"]] as const) {
      if (meshRef.current) {
        const m = meshRef.current.material as THREE.MeshPhysicalMaterial;
        if (m) {
          const tgt = hoverState.active === id ? 1.4 : 0;
          m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, tgt, hoverState.active === id ? 12 : 6, delta);
          if (tgt > 0.01) m.emissive.setHex(0x00E5FF);
        }
      }
    }
    if (mat.sensor) mat.sensor.emissive.setHex(hoverState.active === "sensor" ? 0x00E5FF : 0x000000);

    // 7. Lens glow overlays + lens PointLight
    if (overlay1Ref.current) overlay1Ref.current.opacity = g * 0.88;
    if (overlay2Ref.current) overlay2Ref.current.opacity = g * 0.72;
    if (lensLightRef.current) lensLightRef.current.intensity = g * 7;
  });

  const { ring, ringInner, sealMetal, sensor } = mat;

  return (
    <>
      {/* ── OUTER RING ──────────────────────────────────────────────────── */}
      <group ref={ringRef} userData={{ componentId: "ring" }}>
        <mesh material={ring} castShadow>
          <torusGeometry args={[0.54, 0.068, 24, 96]} />
        </mesh>
        <mesh material={ringInner} castShadow>
          <torusGeometry args={[0.46, 0.042, 16, 96]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={ringInner}>
          <cylinderGeometry args={[0.408, 0.408, 0.065, 96]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={ring}>
          <torusGeometry args={[0.54, 0.012, 8, 96]} />
        </mesh>
        {/* Tooltip — positioned to the right of the ring */}
        <Html position={[0.75, 0.45, 0]} distanceFactor={5} zIndexRange={[100, 0]}>
          <div ref={tipRingRef} className="tooltip-3d" style={{ opacity: 0 }}>
            Titanium Lens Ring
            <span className="tooltip-tag">F-Mount Bayonet</span>
          </div>
        </Html>
      </group>

      {/* ── LENS 1 — Front element ──────────────────────────────────────── */}
      <group ref={lens1Ref} userData={{ componentId: "lens1" }}>
        {/* Enhanced MeshTransmissionMaterial: ior:1.4, chromaticAberration:0.6 */}
        <mesh ref={lens1MeshRef} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <latheGeometry args={[lens1Points, 96]} />
          <MeshTransmissionMaterial
            samples={6}
            resolution={512}
            transmission={0.95}
            thickness={1.5}
            ior={1.4}
            chromaticAberration={0.6}
            distortion={0.40}
            distortionScale={0.45}
            temporalDistortion={0.1}
            roughness={0.08}
            color="#040c18"
            attenuationColor="#00C8FF"
            attenuationDistance={1.4}
            iridescence={0.90}
            iridescenceIOR={1.38}
            iridescenceThicknessRange={[80, 440] as [number, number]}
            envMapIntensity={6}
            backside={false}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={sealMetal}>
          <torusGeometry args={[0.285, 0.018, 8, 96]} />
        </mesh>
        {/* Projection glow overlay */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.072]}>
          <circleGeometry args={[0.287, 64]} />
          <meshBasicMaterial ref={overlay1Ref} map={overlayTex} transparent opacity={0} depthWrite={false} side={THREE.FrontSide} />
        </mesh>
        {/* Lens-axis PointLight */}
        <pointLight ref={lensLightRef} color="#00E5FF" intensity={0} position={[0, 0, 0.18]} distance={6} decay={2} />
        {/* Tooltip */}
        <Html position={[0.45, 0.4, 0]} distanceFactor={5} zIndexRange={[100, 0]}>
          <div ref={tipLens1Ref} className="tooltip-3d" style={{ opacity: 0 }}>
            Biconvex Glass Element
            <span className="tooltip-tag">ior 1.4 · Iridescent Coating</span>
          </div>
        </Html>
      </group>

      {/* ── LENS 2 — Rear element ───────────────────────────────────────── */}
      <group ref={lens2Ref} userData={{ componentId: "lens2" }}>
        <mesh ref={lens2MeshRef} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <latheGeometry args={[lens2Points, 96]} />
          <MeshTransmissionMaterial
            samples={6}
            resolution={512}
            transmission={0.95}
            thickness={1.2}
            ior={1.4}
            chromaticAberration={0.5}
            distortion={0.30}
            distortionScale={0.38}
            temporalDistortion={0.07}
            roughness={0.1}
            color="#030a14"
            attenuationColor="#0080CC"
            attenuationDistance={1.2}
            iridescence={0.75}
            iridescenceIOR={1.32}
            iridescenceThicknessRange={[100, 400] as [number, number]}
            envMapIntensity={5}
            backside={false}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={sealMetal}>
          <torusGeometry args={[0.252, 0.016, 8, 96]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.054]}>
          <circleGeometry args={[0.254, 64]} />
          <meshBasicMaterial ref={overlay2Ref} map={overlayTex} transparent opacity={0} depthWrite={false} side={THREE.FrontSide} />
        </mesh>
        {/* Tooltip */}
        <Html position={[0.38, -0.38, 0]} distanceFactor={5} zIndexRange={[100, 0]}>
          <div ref={tipLens2Ref} className="tooltip-3d" style={{ opacity: 0 }}>
            Rear Corrective Lens
            <span className="tooltip-tag">Aspherical · Anti-Reflective</span>
          </div>
        </Html>
      </group>

      {/* ── SENSOR PLATE ────────────────────────────────────────────────── */}
      <group ref={sensorRef} userData={{ componentId: "sensor" }}>
        <mesh material={sensor} castShadow>
          <boxGeometry args={[0.56, 0.56, 0.044]} />
        </mesh>
        <mesh position={[0, 0, 0.024]}>
          <planeGeometry args={[0.54, 0.54]} />
          <meshStandardMaterial map={sensorTex} transparent opacity={0.92} roughness={0.2} metalness={0.8} />
        </mesh>
        {([[-0.23,-0.23],[0.23,-0.23],[-0.23,0.23],[0.23,0.23]] as [number,number][]).map(([sx,sy],i) => (
          <mesh key={i} position={[sx, sy, 0.026]} material={ring}>
            <cylinderGeometry args={[0.018, 0.018, 0.006, 12]} />
          </mesh>
        ))}
        {/* Tooltip */}
        <Html position={[0.4, 0.38, 0]} distanceFactor={5} zIndexRange={[100, 0]}>
          <div ref={tipSensorRef} className="tooltip-3d" style={{ opacity: 0 }}>
            Sony CMOS Sensor
            <span className="tooltip-tag">12MP · Back-Illuminated</span>
          </div>
        </Html>
      </group>
    </>
  );
}
