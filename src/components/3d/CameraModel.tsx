"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scrollState";

export function CameraModel() {
  const groupRef = useRef<THREE.Group>(null);

  // Raw mouse position [-1, 1]
  const mouse = useRef({ x: 0, y: 0 });
  // Smoothed rotation target
  const smooth = useRef({ x: 0, y: 0.35 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // All materials created once, no SSR module-level THREE calls
  const mat = useMemo(() => {
    const body = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0c0c10"),
      roughness: 0.22,
      metalness: 0.98,
      reflectivity: 1,
      clearcoat: 0.6,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.8,
    });

    const lensMetal = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#141418"),
      roughness: 0.08,
      metalness: 1,
      reflectivity: 1,
      envMapIntensity: 2.5,
    });

    const grip = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0a0a0e"),
      roughness: 0.75,
      metalness: 0.2,
      envMapIntensity: 0.5,
    });

    const glass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#040912"),
      roughness: 0,
      metalness: 0,
      transmission: 0.96,
      thickness: 0.8,
      ior: 1.52,
      transparent: true,
      opacity: 1,
      envMapIntensity: 3,
      attenuationColor: new THREE.Color("#00E5FF"),
      attenuationDistance: 1.2,
    });

    const glassInner = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#000508"),
      roughness: 0,
      metalness: 0,
      transmission: 0.6,
      thickness: 0.4,
      ior: 1.8,
      transparent: true,
      opacity: 0.9,
      envMapIntensity: 4,
      attenuationColor: new THREE.Color("#002233"),
      attenuationDistance: 0.8,
    });

    return { body, lensMetal, grip, glass, glassInner };
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.getElapsedTime();
    const s = scrollState.progress;

    // Exponential ease toward mouse target
    smooth.current.x += (mouse.current.y * 0.18 - smooth.current.x) * 0.045;
    smooth.current.y += (mouse.current.x * 0.22 + 0.35 - smooth.current.y) * 0.045;

    // Idle float — amplitude reduces as user scrolls
    const floatAmp = 0.07 * (1 - s * 0.8);
    const floatY = Math.sin(t * 0.65) * floatAmp;
    const floatZ = Math.cos(t * 0.4) * 0.03 * (1 - s);

    // Scroll-driven keyframes
    // 0.00–0.30 : face-on hero reveal, slow Y drift
    // 0.30–0.65 : full rotation on Y (shows profile)
    // 0.65–0.85 : pull back and tilt
    // 0.85–1.00 : dramatic shrink, final angle
    const scrollRotY = s * Math.PI * 1.8;
    const scrollRotX = s < 0.6
      ? s * 0.35
      : 0.21 + (s - 0.6) * 0.8;
    const scrollPosY = -s * 1.6 + floatY;
    const scrollPosZ = -s * 2.8 + floatZ;
    const scale = 1 - s * 0.28;

    groupRef.current.rotation.x = smooth.current.x + scrollRotX;
    groupRef.current.rotation.y = smooth.current.y + scrollRotY;
    groupRef.current.position.y = scrollPosY;
    groupRef.current.position.z = scrollPosZ;
    groupRef.current.scale.setScalar(scale);
  });

  const { body, lensMetal, grip, glass, glassInner } = mat;

  return (
    <group ref={groupRef}>

      {/* ══════════════════════════════════════════
          BODY
      ══════════════════════════════════════════ */}

      {/* Main body block */}
      <mesh material={body} castShadow>
        <boxGeometry args={[1.65, 1.12, 0.82]} />
      </mesh>

      {/* Grip — rubberised, slightly protruding */}
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

      {/* Mode dial — cylindrical, sits on top-right */}
      <mesh position={[0.56, 0.72, -0.04]} material={lensMetal} castShadow>
        <cylinderGeometry args={[0.19, 0.19, 0.14, 32]} />
      </mesh>
      {/* Dial ridge ring */}
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
          LENS SYSTEM  (all rotated π/2 on X so
          cylinders face +Z toward viewer)
      ══════════════════════════════════════════ */}

      {/* Lens mount plate — flat ring on body front face */}
      <mesh
        position={[-0.13, 0, 0.42]}
        rotation={[Math.PI / 2, 0, 0]}
        material={lensMetal}
        castShadow
      >
        <torusGeometry args={[0.40, 0.048, 8, 64]} />
      </mesh>

      {/* Outer barrel — main cylinder */}
      <mesh
        position={[-0.13, 0, 0.68]}
        rotation={[Math.PI / 2, 0, 0]}
        material={lensMetal}
        castShadow
      >
        <cylinderGeometry args={[0.38, 0.38, 0.52, 64]} />
      </mesh>

      {/* Focus ring groove — torus band on outer barrel */}
      <mesh
        position={[-0.13, 0, 0.76]}
        rotation={[Math.PI / 2, 0, 0]}
        material={grip}
      >
        <torusGeometry args={[0.385, 0.022, 6, 64]} />
      </mesh>
      <mesh
        position={[-0.13, 0, 0.64]}
        rotation={[Math.PI / 2, 0, 0]}
        material={grip}
      >
        <torusGeometry args={[0.385, 0.022, 6, 64]} />
      </mesh>

      {/* Middle step — tapered cylinder */}
      <mesh
        position={[-0.13, 0, 0.96]}
        rotation={[Math.PI / 2, 0, 0]}
        material={lensMetal}
        castShadow
      >
        <cylinderGeometry args={[0.315, 0.38, 0.08, 64]} />
      </mesh>

      {/* Inner barrel */}
      <mesh
        position={[-0.13, 0, 1.065]}
        rotation={[Math.PI / 2, 0, 0]}
        material={lensMetal}
        castShadow
      >
        <cylinderGeometry args={[0.31, 0.31, 0.14, 64]} />
      </mesh>

      {/* Aperture ring torus */}
      <mesh
        position={[-0.13, 0, 1.05]}
        rotation={[Math.PI / 2, 0, 0]}
        material={body}
      >
        <torusGeometry args={[0.315, 0.018, 6, 64]} />
      </mesh>

      {/* Front element bezel ring */}
      <mesh
        position={[-0.13, 0, 1.14]}
        rotation={[Math.PI / 2, 0, 0]}
        material={lensMetal}
      >
        <torusGeometry args={[0.295, 0.032, 8, 64]} />
      </mesh>

      {/* Primary glass element — large, catches the cyan light */}
      <mesh
        position={[-0.13, 0, 1.148]}
        rotation={[Math.PI / 2, 0, 0]}
        material={glass}
      >
        <cylinderGeometry args={[0.263, 0.263, 0.038, 64]} />
      </mesh>

      {/* Inner aperture ring */}
      <mesh
        position={[-0.13, 0, 1.14]}
        rotation={[Math.PI / 2, 0, 0]}
        material={lensMetal}
      >
        <torusGeometry args={[0.20, 0.022, 8, 64]} />
      </mesh>

      {/* Centre lens element — deeper glass, darker blue */}
      <mesh
        position={[-0.13, 0, 1.155]}
        rotation={[Math.PI / 2, 0, 0]}
        material={glassInner}
      >
        <cylinderGeometry args={[0.09, 0.09, 0.01, 48]} />
      </mesh>

      {/* ══════════════════════════════════════════
          DETAILS
      ══════════════════════════════════════════ */}

      {/* Body logo engraving — subtle recessed rectangle */}
      <mesh position={[0.0, -0.15, 0.412]} material={body}>
        <boxGeometry args={[0.35, 0.08, 0.005]} />
      </mesh>

      {/* Port cover — right side bottom */}
      <mesh position={[0.84, -0.3, 0]} material={grip}>
        <boxGeometry args={[0.015, 0.24, 0.36]} />
      </mesh>

    </group>
  );
}
