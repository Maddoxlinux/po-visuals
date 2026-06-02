"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cameraTarget } from "@/lib/cameraTarget";

export function CameraModel() {
  const groupRef      = useRef<THREE.Group>(null);
  const lensLightRef  = useRef<THREE.PointLight>(null);
  const glowDisc1Ref  = useRef<THREE.MeshBasicMaterial>(null);
  const glowDisc2Ref  = useRef<THREE.MeshBasicMaterial>(null);
  const glowDisc3Ref  = useRef<THREE.MeshBasicMaterial>(null);

  // Raw mouse [-1, 1] — updated outside React to avoid state churn
  const mouse         = useRef({ x: 0, y: 0 });
  // Exponentially smoothed parallax offset applied on top of GSAP values
  const smooth        = useRef({ x: 0, y: 0 });
  // Tab-visibility flag — skip all work when page is hidden
  const pageVisible   = useRef(true);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onVisible = () => { pageVisible.current = !document.hidden; };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const mat = useMemo(() => {
    const body = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color("#0c0c10"),
      roughness:          0.22,
      metalness:          0.98,
      reflectivity:       1,
      clearcoat:          0.6,
      clearcoatRoughness: 0.08,
      envMapIntensity:    1.8,
    });

    const lensMetal = new THREE.MeshPhysicalMaterial({
      color:           new THREE.Color("#141418"),
      roughness:       0.08,
      metalness:       1,
      reflectivity:    1,
      envMapIntensity: 2.5,
    });

    const grip = new THREE.MeshPhysicalMaterial({
      color:           new THREE.Color("#0a0a0e"),
      roughness:       0.75,
      metalness:       0.2,
      envMapIntensity: 0.5,
    });

    const glass = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color("#040912"),
      roughness:          0,
      metalness:          0,
      transmission:       0.96,
      thickness:          0.8,
      ior:                1.52,
      transparent:        true,
      opacity:            1,
      envMapIntensity:    3,
      attenuationColor:   new THREE.Color("#00E5FF"),
      attenuationDistance:1.2,
    });

    const glassInner = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color("#000508"),
      roughness:          0,
      metalness:          0,
      transmission:       0.6,
      thickness:          0.4,
      ior:                1.8,
      transparent:        true,
      opacity:            0.9,
      envMapIntensity:    4,
      attenuationColor:   new THREE.Color("#002233"),
      attenuationDistance:0.8,
    });

    return { body, lensMetal, grip, glass, glassInner };
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current || !pageVisible.current) return;

    const t  = clock.getElapsedTime();
    const mi = cameraTarget.mouseInfluence;

    // Idle sinusoidal hover — amplitude scaled by mouseInfluence so it
    // disappears when scroll states take precise control of the transform
    const floatY = Math.sin(t * 0.65) * 0.055 * mi;
    const floatZ = Math.cos(t * 0.42) * 0.022 * mi;

    // Mouse parallax — exponential lerp toward pointer, fades with mi
    smooth.current.x += (mouse.current.y * 0.15 * mi - smooth.current.x) * 0.04;
    smooth.current.y += (mouse.current.x * 0.20 * mi - smooth.current.y) * 0.04;

    // Apply GSAP-animated values directly — scrub:1.5 provides the scroll
    // smoothing; we do NOT add an extra lerp here to avoid double-lag.
    groupRef.current.position.set(
      cameraTarget.posX,
      cameraTarget.posY + floatY,
      cameraTarget.posZ + floatZ,
    );
    groupRef.current.rotation.set(
      cameraTarget.rotX + smooth.current.x,
      cameraTarget.rotY + smooth.current.y,
      cameraTarget.rotZ,
    );
    groupRef.current.scale.setScalar(cameraTarget.scale);

    // ── Lens glow system ────────────────────────────────────────────────
    const g = cameraTarget.lensGlow;

    // Point light at lens centre — illuminates nearby geometry / scene bg
    if (lensLightRef.current)  lensLightRef.current.intensity = g * 8;

    // Layered glow discs — simulate a soft bloom without post-processing
    if (glowDisc1Ref.current)  glowDisc1Ref.current.opacity = g * 0.90;
    if (glowDisc2Ref.current)  glowDisc2Ref.current.opacity = g * 0.38;
    if (glowDisc3Ref.current)  glowDisc3Ref.current.opacity = g * 0.14;
  });

  const { body, lensMetal, grip, glass, glassInner } = mat;

  return (
    <group ref={groupRef}>

      {/* ══════════════════════════════════════════
          LENS GLOW SYSTEM
          Three concentric BasicMaterial discs at
          the lens front face, animated by lensGlow.
          MeshBasicMaterial ignores scene lighting so
          the glow always appears as pure emissive colour.
      ══════════════════════════════════════════ */}

      {/* Inner core glow — matches glass disc radius */}
      <mesh position={[-0.13, 0, 1.165]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.265, 64]} />
        <meshBasicMaterial ref={glowDisc1Ref} color="#00E5FF" transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Mid halo */}
      <mesh position={[-0.13, 0, 1.16]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.48, 64]} />
        <meshBasicMaterial ref={glowDisc2Ref} color="#00E5FF" transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Outer soft bloom */}
      <mesh position={[-0.13, 0, 1.155]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.80, 64]} />
        <meshBasicMaterial ref={glowDisc3Ref} color="#00AACC" transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Dynamic point light at lens face — glows cyan at Contact state */}
      <pointLight
        ref={lensLightRef}
        color="#00E5FF"
        intensity={0}
        position={[-0.13, 0, 1.18]}
        distance={6}
        decay={2}
      />

      {/* ══════════════════════════════════════════
          BODY
      ══════════════════════════════════════════ */}

      <mesh material={body} castShadow>
        <boxGeometry args={[1.65, 1.12, 0.82]} />
      </mesh>

      {/* Grip — rubberised texture, slightly protruding */}
      <mesh position={[0.70, -0.05, 0.01]} material={grip} castShadow>
        <boxGeometry args={[0.42, 1.06, 0.86]} />
      </mesh>

      {/* Viewfinder hump */}
      <mesh position={[-0.13, 0.66, -0.01]} material={body} castShadow>
        <boxGeometry args={[0.66, 0.29, 0.66]} />
      </mesh>

      {/* ══════════════════════════════════════════
          TOP CONTROLS
      ══════════════════════════════════════════ */}

      {/* Mode dial */}
      <mesh position={[0.56, 0.72, -0.04]} material={lensMetal} castShadow>
        <cylinderGeometry args={[0.19, 0.19, 0.14, 32]} />
      </mesh>
      <mesh position={[0.56, 0.72, -0.04]} material={body}>
        <torusGeometry args={[0.19, 0.015, 4, 32]} />
      </mesh>

      {/* Shutter button */}
      <mesh position={[0.47, 0.765, 0.24]} material={lensMetal}>
        <cylinderGeometry args={[0.063, 0.063, 0.07, 16]} />
      </mesh>

      {/* Hot-shoe rail */}
      <mesh position={[-0.1, 0.825, 0]} material={lensMetal}>
        <boxGeometry args={[0.44, 0.038, 0.22]} />
      </mesh>

      {/* ══════════════════════════════════════════
          LENS SYSTEM
          All cylinders/toruses rotated π/2 on X
          so their axis faces +Z (toward the viewer).
      ══════════════════════════════════════════ */}

      {/* Lens mount plate — ring on body front face */}
      <mesh position={[-0.13, 0, 0.42]} rotation={[Math.PI / 2, 0, 0]} material={lensMetal} castShadow>
        <torusGeometry args={[0.40, 0.048, 8, 64]} />
      </mesh>

      {/* Outer barrel */}
      <mesh position={[-0.13, 0, 0.68]} rotation={[Math.PI / 2, 0, 0]} material={lensMetal} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.52, 64]} />
      </mesh>

      {/* Focus ring grooves (×2) */}
      <mesh position={[-0.13, 0, 0.76]} rotation={[Math.PI / 2, 0, 0]} material={grip}>
        <torusGeometry args={[0.385, 0.022, 6, 64]} />
      </mesh>
      <mesh position={[-0.13, 0, 0.64]} rotation={[Math.PI / 2, 0, 0]} material={grip}>
        <torusGeometry args={[0.385, 0.022, 6, 64]} />
      </mesh>

      {/* Middle step — tapered */}
      <mesh position={[-0.13, 0, 0.96]} rotation={[Math.PI / 2, 0, 0]} material={lensMetal} castShadow>
        <cylinderGeometry args={[0.315, 0.38, 0.08, 64]} />
      </mesh>

      {/* Inner barrel */}
      <mesh position={[-0.13, 0, 1.065]} rotation={[Math.PI / 2, 0, 0]} material={lensMetal} castShadow>
        <cylinderGeometry args={[0.31, 0.31, 0.14, 64]} />
      </mesh>

      {/* Aperture ring */}
      <mesh position={[-0.13, 0, 1.05]} rotation={[Math.PI / 2, 0, 0]} material={body}>
        <torusGeometry args={[0.315, 0.018, 6, 64]} />
      </mesh>

      {/* Front element bezel */}
      <mesh position={[-0.13, 0, 1.14]} rotation={[Math.PI / 2, 0, 0]} material={lensMetal}>
        <torusGeometry args={[0.295, 0.032, 8, 64]} />
      </mesh>

      {/* Primary glass — transmission material, catches cyan light */}
      <mesh position={[-0.13, 0, 1.148]} rotation={[Math.PI / 2, 0, 0]} material={glass}>
        <cylinderGeometry args={[0.263, 0.263, 0.038, 64]} />
      </mesh>

      {/* Inner aperture ring */}
      <mesh position={[-0.13, 0, 1.14]} rotation={[Math.PI / 2, 0, 0]} material={lensMetal}>
        <torusGeometry args={[0.20, 0.022, 8, 64]} />
      </mesh>

      {/* Centre element — deeper glass, darker blue tint */}
      <mesh position={[-0.13, 0, 1.155]} rotation={[Math.PI / 2, 0, 0]} material={glassInner}>
        <cylinderGeometry args={[0.09, 0.09, 0.01, 48]} />
      </mesh>

      {/* ══════════════════════════════════════════
          DETAILS
      ══════════════════════════════════════════ */}

      <mesh position={[0.0, -0.15, 0.412]} material={body}>
        <boxGeometry args={[0.35, 0.08, 0.005]} />
      </mesh>

      <mesh position={[0.84, -0.3, 0]} material={grip}>
        <boxGeometry args={[0.015, 0.24, 0.36]} />
      </mesh>

    </group>
  );
}
