"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import styles from "./WhyExperience.module.css";

/* =====================================================
   PALACE
===================================================== */

function Palace() {
  const group = useRef<THREE.Group>(null);

  const texture = useTexture(
    "/images/kenyalangku/palace-bg.png"
  );

  const { viewport } = useThree();

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;

    texture.anisotropy = 8;

    texture.needsUpdate = true;
  }, [texture]);

  /*
    Calculate the image's natural aspect ratio.
  */

  const image = texture.image as
    | HTMLImageElement
    | undefined;

  const imageAspect =
    image?.width && image?.height
      ? image.width / image.height
      : 1.75;

  /*
    Palace takes roughly 88% of the visible
    Three.js viewport width.
  */

  const palaceWidth =
    viewport.width * 0.88;

  const palaceHeight =
    palaceWidth / imageAspect;

  /* =====================================================
     ANIMATION
  ===================================================== */

  useFrame((state, delta) => {
    if (!group.current) {
      return;
    }

    /*
      Mouse movement.

      Keep this very subtle.
    */

    const targetX =
      state.pointer.x * 0.16;

    const targetY =
      -0.32 +
      state.pointer.y * 0.06;

    /*
      Smooth movement rather than directly
      following the cursor.
    */

    group.current.position.x =
      THREE.MathUtils.damp(
        group.current.position.x,
        targetX,
        3,
        delta
      );

    group.current.position.y =
      THREE.MathUtils.damp(
        group.current.position.y,
        targetY,
        3,
        delta
      );

    /*
      Extremely small perspective rotation.
    */

    group.current.rotation.y =
      THREE.MathUtils.damp(
        group.current.rotation.y,
        -state.pointer.x * 0.025,
        3,
        delta
      );

    group.current.rotation.x =
      THREE.MathUtils.damp(
        group.current.rotation.x,
        state.pointer.y * 0.01,
        3,
        delta
      );
  });

  return (
    <group
      ref={group}
      position={[0, -0.32, 0]}
    >
      <mesh
        scale={[
          palaceWidth,
          palaceHeight,
          1,
        ]}
      >
        <planeGeometry args={[1, 1]} />

        <meshBasicMaterial
          map={texture}
          transparent
          toneMapped={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* =====================================================
   THREE.JS EXPERIENCE
===================================================== */

export default function WhyExperience() {
  return (
    <div
      className={styles.experience}
      aria-hidden="true"
    >
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 35,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          <Palace />
        </Suspense>
      </Canvas>
    </div>
  );
}