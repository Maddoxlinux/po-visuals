"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Background atmosphere — three layered elements that break up the flat
 * navy backdrop and tie the floating objects to an implied studio space.
 *
 * - Large outer torus: suggests a studio softbox halo (slow Y rotation)
 * - Smaller tilted torus: inner highlight ring (counter-rotate for movement)
 * - Diffuse radial backdrop plane: provides a subtle luminous gradient swell
 *
 * All meshes use MeshBasicMaterial so they ignore scene lighting and emit
 * their colour absolutely — the warm cyan tint reinforces the studio mood
 * without competing with the 3D component lighting.
 */
export function AtmosphereRing() {
  const outerRef  = useRef<THREE.Mesh>(null);
  const innerRef  = useRef<THREE.Mesh>(null);
  const glowRef   = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.025;
      outerRef.current.rotation.x = Math.sin(t * 0.018) * 0.08;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.035;
      innerRef.current.rotation.z =  t * 0.012;
    }
    if (glowRef.current) {
      // Subtle pulsing opacity
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.28 + Math.sin(t * 0.4) * 0.06;
    }
  });

  return (
    <group position={[0, 0, -7]}>
      {/* Main studio-softbox torus — large, dim, warm cyan */}
      <mesh ref={outerRef}>
        <torusGeometry args={[5.8, 0.32, 8, 96]} />
        <meshBasicMaterial color="#001c40" transparent opacity={0.20} />
      </mesh>

      {/* Inner accent ring — slightly warmer, tilted for depth */}
      <mesh ref={innerRef} rotation={[0.35, 0, 0.15]}>
        <torusGeometry args={[3.6, 0.16, 6, 80]} />
        <meshBasicMaterial color="#002e5c" transparent opacity={0.14} />
      </mesh>

      {/* Radial glow disc — the "luminous dark" that separates scene from void */}
      <mesh ref={glowRef} position={[0, 0, -0.5]}>
        <circleGeometry args={[6.5, 64]} />
        <meshBasicMaterial
          color="#000d20"
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Micro crosshair ring — very faint detail in the centre of the halo */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[1.2, 0.008, 4, 48]} />
        <meshBasicMaterial color="#004488" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}
