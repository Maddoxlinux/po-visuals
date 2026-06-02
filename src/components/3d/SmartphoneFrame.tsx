"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { componentPositions, componentRotations, sceneState, mouseSmooth } from "@/lib/componentPositions";

// Phone parallax is shallower than the lens elements (it's the background element)
const PARALLAX_PHONE = 0.30;
const FLOAT_PHASE_PHONE = 3.50;

export function SmartphoneFrame() {
  const phoneRef     = useRef<THREE.Group>(null);
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const screenLightRef = useRef<THREE.PointLight>(null);

  // ── Materials ─────────────────────────────────────────────────────────────

  const mat = useMemo(() => {
    const chassis = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color("#111118"),
      roughness:          0.10,
      metalness:          0.96,
      reflectivity:       1,
      clearcoat:          0.8,
      clearcoatRoughness: 0.06,
      envMapIntensity:    3.0,
    });

    const frontGlass = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color("#040810"),
      roughness:          0,
      metalness:          0,
      transmission:       0.5,
      thickness:          0.08,
      ior:                1.52,
      transparent:        true,
      opacity:            1,
      clearcoat:          1,
      clearcoatRoughness: 0,
      envMapIntensity:    4,
      reflectivity:       0.7,
    });

    const backGlass = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color("#0a0a14"),
      roughness:          0.02,
      metalness:          0,
      transmission:       0.15,
      thickness:          0.06,
      ior:                1.52,
      transparent:        true,
      opacity:            1,
      clearcoat:          1,
      clearcoatRoughness: 0,
      envMapIntensity:    3.5,
    });

    const cameraBump = new THREE.MeshPhysicalMaterial({
      color:           new THREE.Color("#0d0d14"),
      roughness:       0.18,
      metalness:       0.92,
      envMapIntensity: 2.5,
    });

    const camLens = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color("#030810"),
      roughness:          0.05,
      metalness:          0,
      transmission:       0.7,
      thickness:          0.5,
      ior:                1.65,
      transparent:        true,
      opacity:            1,
      envMapIntensity:    4.5,
      attenuationColor:   new THREE.Color("#001122"),
      attenuationDistance:0.5,
    });

    const sideButton = new THREE.MeshPhysicalMaterial({
      color:           new THREE.Color("#1a1a22"),
      roughness:       0.12,
      metalness:       0.95,
      envMapIntensity: 2.0,
    });

    const notchMat = new THREE.MeshStandardMaterial({
      color:     new THREE.Color("#020408"),
      roughness: 0.5,
      metalness: 0.1,
    });

    return { chassis, frontGlass, backGlass, cameraBump, camLens, sideButton, notchMat };
  }, []);

  // ── Screen canvas texture — camera app UI ─────────────────────────────────

  const screenTex = useMemo(() => {
    if (typeof document === "undefined") return null;

    const W = 430, H = 932;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#020912");
    bg.addColorStop(1, "#050e22");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // ── Status bar ──────────────────────────────────────────────────
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "bold 22px 'Courier New', monospace";
    ctx.fillText("9:41", 28, 50);

    // Signal bars
    [10, 14, 18, 22].forEach((h, i) => {
      ctx.fillStyle = i < 3 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)";
      ctx.fillRect(338 + i * 11, 38 - h + 22, 8, h);
    });

    // Battery outline + fill
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(383, 34, 28, 14);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillRect(384, 35, 20, 12); // 74% fill
    ctx.fillRect(411, 38, 3, 6);   // terminal nub

    // ── Viewfinder area ─────────────────────────────────────────────
    const cx = W / 2, cy = H / 2 - 20;

    // Outer boundary circle
    ctx.strokeStyle = "rgba(0,229,255,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 205, 0, Math.PI * 2); ctx.stroke();

    // Tick marks on outer circle (every 10°, majors every 30°)
    for (let i = 0; i < 36; i++) {
      const angle  = (i / 36) * Math.PI * 2;
      const isMaj  = i % 3 === 0;
      const inner  = isMaj ? 190 : 198;
      ctx.strokeStyle = isMaj ? "rgba(0,229,255,0.65)" : "rgba(0,229,255,0.25)";
      ctx.lineWidth   = isMaj ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
      ctx.lineTo(cx + Math.cos(angle) * 205,   cy + Math.sin(angle) * 205);
      ctx.stroke();
    }

    // Inner focus ring
    ctx.strokeStyle = "rgba(0,229,255,0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, 155, 0, Math.PI * 2); ctx.stroke();

    // Rule-of-thirds grid
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 0.8;
    [cy - 68, cy + 68].forEach(y => {
      ctx.beginPath(); ctx.moveTo(cx - 205, y); ctx.lineTo(cx + 205, y); ctx.stroke();
    });
    [cx - 68, cx + 68].forEach(x => {
      ctx.beginPath(); ctx.moveTo(x, cy - 205); ctx.lineTo(x, cy + 205); ctx.stroke();
    });

    // Corner brackets (4 corners of viewfinder)
    const BL = 24;
    ([
      [cx-205, cy-205, 1, 1], [cx+205, cy-205, -1, 1],
      [cx-205, cy+205, 1,-1], [cx+205, cy+205, -1,-1],
    ] as [number,number,number,number][]).forEach(([bx, by, sx, sy]) => {
      ctx.strokeStyle = "#00E5FF";
      ctx.lineWidth   = 2.5;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + sx * BL, by); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + sy * BL); ctx.stroke();
    });

    // Center crosshair
    ctx.strokeStyle = "#00E5FF";
    ctx.lineWidth   = 1.5;
    [[cx-20, cy, cx-7, cy],[cx+7, cy, cx+20, cy],
     [cx, cy-20, cx, cy-7],[cx, cy+7, cx, cy+20]].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    });
    ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.stroke();

    // ── Readout overlays ────────────────────────────────────────────
    ctx.fillStyle = "rgba(0,229,255,0.85)";
    ctx.font      = "bold 18px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("PRO MODE", cx, cy - 248);

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font      = "15px 'Courier New', monospace";
    ctx.fillText("4K · 60FPS · 12MP", cx, cy + 250);

    ctx.fillStyle = "rgba(255,255,255,0.38)";
    ctx.font      = "13px 'Courier New', monospace";
    ctx.fillText("ISO 100   ƒ/1.8   1/125s", cx, cy + 295);

    // EV meter
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx-80, cy+338); ctx.lineTo(cx+80, cy+338); ctx.stroke();
    ctx.fillStyle = "#00E5FF";
    ctx.fillRect(cx-2, cy+332, 4, 12);

    // Histogram bar (small)
    ctx.fillStyle = "rgba(0,229,255,0.2)";
    for (let i = 0; i < 24; i++) {
      const hh = Math.random() * 28 + 4;
      ctx.fillRect(cx - 60 + i * 5, cy + 365 - hh, 4, hh);
    }

    // ── Bottom controls ─────────────────────────────────────────────
    // Shutter button
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth   = 3.5;
    ctx.beginPath(); ctx.arc(cx, 820, 44, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.arc(cx, 820, 35, 0, Math.PI * 2); ctx.stroke();

    // Mode labels
    const modes = ["PHOTO", "VIDEO", "PRO", "SLOW-MO"];
    modes.forEach((m, i) => {
      const mx = cx - 96 + i * 64;
      ctx.fillStyle  = i === 2 ? "#00E5FF" : "rgba(255,255,255,0.3)";
      ctx.font       = i === 2 ? "bold 12px 'Courier New'" : "11px 'Courier New'";
      ctx.textAlign  = "center";
      ctx.fillText(m, mx, 878);
    });

    // Active mode indicator dot
    ctx.fillStyle = "#00E5FF";
    ctx.beginPath(); ctx.arc(cx - 96 + 2 * 64, 888, 3, 0, Math.PI * 2); ctx.fill();

    ctx.textAlign = "left"; // reset
    return new THREE.CanvasTexture(cv);
  }, []);

  // ── useFrame ──────────────────────────────────────────────────────────────

  useFrame(({ clock }) => {
    if (!phoneRef.current) return;

    const t  = clock.getElapsedTime();
    const mi = sceneState.mouseInfluence;
    const sg = sceneState.screenGlow;

    const floatY = Math.sin(t * 0.60 + FLOAT_PHASE_PHONE) * 0.045 * mi;

    phoneRef.current.position.set(
      componentPositions.phone.x + mouseSmooth.x * 0.22 * PARALLAX_PHONE,
      componentPositions.phone.y + mouseSmooth.y * 0.22 * PARALLAX_PHONE + floatY,
      componentPositions.phone.z,
    );
    phoneRef.current.rotation.set(
      componentRotations.phone.x,
      componentRotations.phone.y,
      componentRotations.phone.z,
    );

    // Screen glow — emissive and back-light activate in Stage 4
    if (screenMatRef.current) {
      screenMatRef.current.emissiveIntensity = sg * 1.8;
    }
    if (screenLightRef.current) {
      screenLightRef.current.intensity = sg * 3.5;
    }
  });

  const { chassis, frontGlass, backGlass, cameraBump, camLens, sideButton, notchMat } = mat;

  return (
    <group ref={phoneRef}>

      {/* Screen fill light — activates with screenGlow in Stage 4 */}
      <pointLight
        ref={screenLightRef}
        color="#0066ff"
        intensity={0}
        position={[0, 0, 0.25]}
        distance={4}
        decay={2}
      />

      {/* ── CHASSIS (titanium frame + body) ──────────────────────── */}
      <RoundedBox
        args={[0.72, 1.58, 0.088]}
        radius={0.040}
        smoothness={6}
        castShadow
      >
        <primitive object={chassis} attach="material" />
      </RoundedBox>

      {/* ── FRONT GLASS PANEL ────────────────────────────────────── */}
      <mesh position={[0, 0.005, 0.047]} material={frontGlass} castShadow>
        <boxGeometry args={[0.700, 1.555, 0.006]} />
      </mesh>

      {/* ── SCREEN DISPLAY (canvas texture + emissive for Stage 4) ── */}
      <mesh position={[0, -0.02, 0.046]}>
        <boxGeometry args={[0.636, 1.360, 0.002]} />
        <meshStandardMaterial
          ref={screenMatRef}
          map={screenTex}
          emissive={new THREE.Color("#0040ff")}
          emissiveMap={screenTex}
          emissiveIntensity={0}
          roughness={0.05}
          metalness={0}
        />
      </mesh>

      {/* Dynamic camera punch-hole notch */}
      <mesh position={[0, 0.65, 0.049]} material={notchMat}>
        <cylinderGeometry args={[0.022, 0.022, 0.004, 24]} />
      </mesh>

      {/* ── BACK GLASS PANEL ─────────────────────────────────────── */}
      <mesh position={[0, 0, -0.047]} material={backGlass} castShadow>
        <boxGeometry args={[0.700, 1.555, 0.006]} />
      </mesh>

      {/* ── CAMERA MODULE BUMP ───────────────────────────────────── */}
      {/* Raised island on back — visible when phone shows its back (Stage 3) */}
      <RoundedBox
        args={[0.240, 0.240, 0.024]}
        radius={0.030}
        smoothness={4}
        position={[-0.148, 0.530, -0.058]}
        castShadow
      >
        <primitive object={cameraBump} attach="material" />
      </RoundedBox>

      {/* Three camera lenses on the module */}
      {([[-0.055,  0.055],[ 0.055,  0.055],[-0.055, -0.055]] as [number,number][]).map(
        ([lx, ly], i) => (
          <group key={i} position={[-0.148 + lx, 0.530 + ly, -0.068]}>
            {/* Lens housing ring */}
            <mesh material={chassis}>
              <cylinderGeometry args={[0.038, 0.038, 0.008, 24]} />
            </mesh>
            {/* Glass element */}
            <mesh material={camLens} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.006, 24]} />
            </mesh>
          </group>
        )
      )}

      {/* LED flash */}
      <mesh position={[-0.148 + 0.055, 0.530 - 0.055, -0.064]} material={cameraBump}>
        <cylinderGeometry args={[0.024, 0.024, 0.01, 20]} />
      </mesh>
      {/* Flash emissive disc */}
      <mesh position={[-0.148 + 0.055, 0.530 - 0.055, -0.069]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.020, 20]} />
        <meshBasicMaterial color="#fffae0" transparent opacity={0.4} />
      </mesh>

      {/* LiDAR scanner (small square sensor) */}
      <mesh position={[-0.148 + 0.055, 0.530 + 0.055, -0.064]} material={cameraBump}>
        <boxGeometry args={[0.032, 0.032, 0.008]} />
      </mesh>

      {/* ── SIDE BUTTONS ─────────────────────────────────────────── */}
      {/* Volume up */}
      <mesh position={[-0.364, 0.22, 0]} material={sideButton}>
        <boxGeometry args={[0.010, 0.090, 0.040]} />
      </mesh>
      {/* Volume down */}
      <mesh position={[-0.364, 0.08, 0]} material={sideButton}>
        <boxGeometry args={[0.010, 0.090, 0.040]} />
      </mesh>
      {/* Power / lock */}
      <mesh position={[0.364, 0.14, 0]} material={sideButton}>
        <boxGeometry args={[0.010, 0.120, 0.040]} />
      </mesh>

      {/* ── SPEAKER GRILLE (bottom) ───────────────────────────────── */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[(i - 2.5) * 0.05, -0.76, 0.046]} material={notchMat}>
          <cylinderGeometry args={[0.010, 0.010, 0.006, 8]} />
        </mesh>
      ))}

    </group>
  );
}
