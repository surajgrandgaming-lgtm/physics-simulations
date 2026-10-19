"use client";

import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { TableAndCloth } from "./TableAndCloth";
import { Dishware } from "./Dishware";
import { useTableclothStore } from "./TableclothStore";

const INITIAL_CAMERA_POS: [number, number, number] = [0.4, 2.7, 4.4];
const INITIAL_TARGET_POS: [number, number, number] = [0.2, 0.25, 0];

function CameraTracker({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const status = useTableclothStore((s) => s.status);
  const resetCount = useTableclothStore((s) => s.resetCount);

  const prevStatus = useRef(status);
  const prevResetCount = useRef(resetCount);

  useFrame((state) => {
    // Whenever game restarts or resets, restore the exact initial camera angle and target cleanly
    const isResetTriggered = resetCount !== prevResetCount.current;
    const isStatusRestarted = status === "idle" && prevStatus.current !== "idle";

    if (isResetTriggered || isStatusRestarted) {
      state.camera.position.set(...INITIAL_CAMERA_POS);
      if (controlsRef.current) {
        controlsRef.current.target.set(...INITIAL_TARGET_POS);
        controlsRef.current.update();
      }
      prevResetCount.current = resetCount;
    }

    prevStatus.current = status;
  });

  return null;
}

export function TableclothScene({ config }: { config?: any }) {
  const controlsRef = useRef<any>(null);

  // Light gray studio background (#dce1e9) with stable, rock-solid camera perspective
  return (
    <div className="relative w-full h-full bg-[#dce1e9] select-none">
      <Canvas
        camera={{ position: INITIAL_CAMERA_POS, fov: 44, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
        shadows
      >
        <color attach="background" args={["#dce1e9"]} />
        <fog attach="fog" args={["#dce1e9", 12, 38]} />

        {/* Studio Lighting tailored for pristine light gray ambiance */}
        <ambientLight intensity={1.1} color="#f8fafc" />
        <directionalLight
          position={[6, 11, 7]}
          intensity={2.3}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight
          position={[-6, 6, -5]}
          intensity={0.8}
          color="#94a3b8"
        />
        <pointLight position={[0, 3.8, 0]} intensity={1.8} color="#fef08a" distance={12} />

        {/* Studio Light Gray Floor (y = -1.8) with soft shadow receiver */}
        <mesh position={[0, -1.805, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[45, 45]} />
          <meshStandardMaterial color="#cfd5df" roughness={0.75} metalness={0.05} />
        </mesh>

        <Suspense fallback={null}>
          <TableAndCloth />
          <Dishware />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={2.0}
          maxDistance={14}
          maxPolarAngle={Math.PI / 2.05}
          target={INITIAL_TARGET_POS}
        />

        <CameraTracker controlsRef={controlsRef} />
      </Canvas>
    </div>
  );
}

export default TableclothScene;
