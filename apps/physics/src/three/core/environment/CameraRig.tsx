"use client";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import type { Vector3Tuple } from "three";

interface Props {
  position?: Vector3Tuple;
  target?: Vector3Tuple;
  fov?: number;
  enableOrbit?: boolean;
}

/**
 * Configurable camera rig with optional orbit controls.
 * Position and target come from challenge config to keep scenes consistent.
 */
export function CameraRig({
  position = [0, 3, 7],
  target = [0, 0.5, 0],
  fov = 55,
  enableOrbit = true,
}: Props) {
  return (
    <>
      <PerspectiveCamera makeDefault position={position} fov={fov} near={0.1} far={1000} />
      {enableOrbit && (
        <OrbitControls
          target={target}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI * 0.49}
          minDistance={1}
          maxDistance={500}
        />
      )}
    </>
  );
}
