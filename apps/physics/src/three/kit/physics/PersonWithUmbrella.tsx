"use client";

/**
 * PersonWithUmbrella — Physics Kit Component
 *
 * Stylized humanoid character wearing a waterproof raincoat, hood, and rain boots,
 * walking with animated limbs and holding a rotatable parabolic umbrella with an
 * optional protective shield envelope cone.
 */

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface PersonWithUmbrellaProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  walkingSpeed?: number; // m/s (determines leg & arm stride frequency)
  umbrellaAngleDeg?: number; // Tilt angle from vertical in degrees
  isWalking?: boolean;
  isShielded?: boolean;
  coatColor?: string;
  umbrellaColor?: string;
  showShieldCone?: boolean;
  statusBadge?: React.ReactNode;
}

export function PersonWithUmbrella({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  walkingSpeed = 0,
  umbrellaAngleDeg = 0,
  isWalking = false,
  isShielded = true,
  coatColor = "#fbbf24", // Bright yellow raincoat
  umbrellaColor = "#0284c7", // Ocean blue canopy
  showShieldCone = true,
  statusBadge,
}: PersonWithUmbrellaProps) {
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const umbrellaGroupRef = useRef<THREE.Group>(null);
  const rippleRef1 = useRef<THREE.Mesh>(null);
  const rippleRef2 = useRef<THREE.Mesh>(null);

  // ── Generate Custom Sculpted Geometries ─────────────────────────────────────
  const { coatGeometry, umbrellaDomeGeometry } = useMemo(() => {
    // 1. Flared A-Line Raincoat Profile (Lathe around Y)
    const coatPoints = [
      new THREE.Vector2(0.01, -0.42), // Inner hem seal
      new THREE.Vector2(0.31, -0.42), // Flared bottom hem
      new THREE.Vector2(0.28, -0.15), // Lower waist taper
      new THREE.Vector2(0.24, 0.12),  // Chest
      new THREE.Vector2(0.22, 0.34),  // Upper shoulder slope
      new THREE.Vector2(0.14, 0.42),  // Neck base
      new THREE.Vector2(0.15, 0.50),  // High storm collar top
      new THREE.Vector2(0.12, 0.50),  // Collar inner rim
      new THREE.Vector2(0.11, 0.38),  // Neck inner
    ];
    const cGeo = new THREE.LatheGeometry(coatPoints, 24);

    // 2. Parabolic Curved Umbrella Canopy (Lathe around Y)
    const domePoints: THREE.Vector2[] = [];
    const segments = 14;
    const radius = 1.18;
    const height = 0.44;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const r = t * radius;
      // Parabolic + cosine curve for a realistic tensioned umbrella dome
      const y = (1 - Math.pow(t, 1.65)) * height;
      domePoints.push(new THREE.Vector2(r, y));
    }
    // 12 radial panels for a classic faceted umbrella silhouette
    const uGeo = new THREE.LatheGeometry(domePoints, 12);
    uGeo.computeVertexNormals();

    return {
      coatGeometry: cGeo,
      umbrellaDomeGeometry: uGeo,
    };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const isMoving = isWalking && walkingSpeed > 0.05;
    const walkFreq = isMoving ? walkingSpeed * 3.8 : 0;

    // Procedural leg & knee stride oscillation
    if (leftLegRef.current && rightLegRef.current) {
      if (isMoving) {
        const phase = time * walkFreq;
        const leftSwing = Math.sin(phase) * 0.55;
        const rightSwing = -Math.sin(phase) * 0.55;

        leftLegRef.current.rotation.z = leftSwing;
        rightLegRef.current.rotation.z = rightSwing;

        // Subtle natural knee bend when leg swings backward/lifts
        if (leftKneeRef.current && rightKneeRef.current) {
          leftKneeRef.current.rotation.z = -Math.max(0, -Math.cos(phase)) * 0.45;
          rightKneeRef.current.rotation.z = -Math.max(0, Math.cos(phase)) * 0.45;
        }
      } else {
        leftLegRef.current.rotation.z = THREE.MathUtils.lerp(leftLegRef.current.rotation.z, 0, 0.15);
        rightLegRef.current.rotation.z = THREE.MathUtils.lerp(rightLegRef.current.rotation.z, 0, 0.15);
        if (leftKneeRef.current && rightKneeRef.current) {
          leftKneeRef.current.rotation.z = THREE.MathUtils.lerp(leftKneeRef.current.rotation.z, 0, 0.15);
          rightKneeRef.current.rotation.z = THREE.MathUtils.lerp(rightKneeRef.current.rotation.z, 0, 0.15);
        }
      }
    }

    // Left arm natural counter-swing
    if (leftArmRef.current) {
      const targetSwing = isMoving ? -Math.sin(time * walkFreq) * 0.48 : 0;
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(
        leftArmRef.current.rotation.z,
        targetSwing,
        0.2
      );
    }

    // Subtle torso bounce & forward lean when walking briskly
    if (torsoRef.current) {
      torsoRef.current.position.y = isMoving
        ? 1.1 + Math.abs(Math.sin(time * walkFreq)) * 0.045
        : 1.1;
      torsoRef.current.rotation.z = THREE.MathUtils.lerp(
        torsoRef.current.rotation.z,
        isMoving ? -0.05 : 0,
        0.15
      );
    }

    // Smooth umbrella rotation toward target tilt angle
    if (umbrellaGroupRef.current) {
      const targetRad = -(umbrellaAngleDeg * Math.PI) / 180;
      umbrellaGroupRef.current.rotation.z = THREE.MathUtils.lerp(
        umbrellaGroupRef.current.rotation.z,
        targetRad,
        0.2
      );

      // Right arm subtly tracks umbrella pitch so the hand stays coupled to the grip
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.z,
          0.45 + targetRad * 0.25,
          0.2
        );
      }
    }

    // Animated expanding puddle ripples
    if (rippleRef1.current && rippleRef2.current && isMoving) {
      const p1 = (time * 1.8) % 1;
      const p2 = ((time * 1.8) + 0.5) % 1;

      rippleRef1.current.scale.setScalar(0.6 + p1 * 1.4);
      (rippleRef1.current.material as THREE.MeshBasicMaterial).opacity = (1 - p1) * 0.45;

      rippleRef2.current.scale.setScalar(0.6 + p2 * 1.4);
      (rippleRef2.current.material as THREE.MeshBasicMaterial).opacity = (1 - p2) * 0.45;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Optional Status Badge or Floating Pill */}
      {statusBadge}

      {/* ─── 1. Torso / Sculpted Waterproof Raincoat ─── */}
      <group ref={torsoRef} position={[0, 1.1, 0]}>
        {/* Main Flared Raincoat Body */}
        <mesh geometry={coatGeometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={coatColor}
            roughness={0.28}
            metalness={0.12}
          />
        </mesh>

        {/* High-Visibility Reflective Safety Stripes around Lower Hem */}
        <mesh position={[0, -0.32, 0]}>
          <cylinderGeometry args={[0.296, 0.304, 0.045, 24, 1, true]} />
          <meshStandardMaterial
            color="#e2e8f0"
            emissive="#94a3b8"
            emissiveIntensity={0.35}
            roughness={0.2}
            metalness={0.6}
          />
        </mesh>

        {/* Front Storm Flap / Zipper Placket (+X Front) */}
        <mesh position={[0.255, -0.02, 0]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.025, 0.78, 0.06]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>

        {/* Side Raincoat Pocket Flaps */}
        <mesh position={[0.14, -0.15, 0.23]} rotation={[0.15, 0.5, 0.1]}>
          <boxGeometry args={[0.14, 0.04, 0.02]} />
          <meshStandardMaterial color="#d97706" roughness={0.4} />
        </mesh>
        <mesh position={[0.14, -0.15, -0.23]} rotation={[-0.15, -0.5, 0.1]}>
          <boxGeometry args={[0.14, 0.04, 0.02]} />
          <meshStandardMaterial color="#d97706" roughness={0.4} />
        </mesh>

        {/* ─── Head, Face & Sculpted Rain Hood ─── */}
        <group position={[0.02, 0.56, 0]}>
          {/* Neck */}
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.08, 0.09, 0.14, 12]} />
            <meshStandardMaterial color="#fcd34d" roughness={0.6} />
          </mesh>

          {/* Outer Waterproof Hood Shell */}
          <mesh castShadow position={[-0.02, 0.02, 0]} scale={[1.08, 1.12, 1.05]}>
            <sphereGeometry args={[0.195, 20, 20]} />
            <meshStandardMaterial
              color={coatColor}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>

          {/* Dark Hood Interior Cavity */}
          <mesh position={[0.04, 0.02, 0]} scale={[0.98, 1.02, 0.96]}>
            <sphereGeometry args={[0.175, 16, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>

          {/* Human Head / Face (+X Forward) */}
          <mesh position={[0.05, 0.02, 0]} scale={[0.95, 1.0, 0.9]}>
            <sphereGeometry args={[0.155, 20, 20]} />
            <meshStandardMaterial color="#fde68a" roughness={0.55} />
          </mesh>

          {/* Nose */}
          <mesh position={[0.205, 0.01, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.022, 0.05, 8]} />
            <meshStandardMaterial color="#fcd34d" roughness={0.6} />
          </mesh>

          {/* Eyes */}
          <mesh position={[0.185, 0.045, 0.052]}>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
          <mesh position={[0.185, 0.045, -0.052]}>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>

          {/* Hood Storm Brim / Visor */}
          <mesh position={[0.14, 0.14, 0]} rotation={[0, 0, -0.22]}>
            <cylinderGeometry args={[0.17, 0.19, 0.06, 16, 1, true, 0, Math.PI]} />
            <meshStandardMaterial
              color="#d97706"
              roughness={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* ─── Left Arm (Free Swinging with Elbow & Glove) ─── */}
        <group ref={leftArmRef} position={[0, 0.3, -0.24]}>
          {/* Rounded Shoulder */}
          <mesh castShadow>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshStandardMaterial color={coatColor} roughness={0.3} />
          </mesh>
          {/* Upper Sleeve */}
          <mesh castShadow position={[0, -0.13, -0.02]} rotation={[0.08, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.062, 0.26, 12]} />
            <meshStandardMaterial color={coatColor} roughness={0.3} />
          </mesh>
          {/* Forearm (Slight natural forward bend) */}
          <group position={[0, -0.25, -0.03]} rotation={[0, 0, 0.22]}>
            <mesh castShadow position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.06, 0.055, 0.24, 12]} />
              <meshStandardMaterial color={coatColor} roughness={0.3} />
            </mesh>
            {/* Reflective Wrist Cuff */}
            <mesh position={[0, -0.21, 0]}>
              <cylinderGeometry args={[0.058, 0.058, 0.03, 12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.2} />
            </mesh>
            {/* Hand */}
            <mesh position={[0, -0.26, 0]}>
              <sphereGeometry args={[0.048, 10, 10]} />
              <meshStandardMaterial color="#fde68a" roughness={0.6} />
            </mesh>
          </group>
        </group>

        {/* ─── Right Arm (Bent Forward Holding Umbrella Handle) ─── */}
        <group ref={rightArmRef} position={[0.02, 0.3, 0.24]} rotation={[0.15, 0, 0.45]}>
          {/* Rounded Shoulder */}
          <mesh castShadow>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshStandardMaterial color={coatColor} roughness={0.3} />
          </mesh>
          {/* Upper Arm */}
          <mesh castShadow position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.07, 0.06, 0.24, 12]} />
            <meshStandardMaterial color={coatColor} roughness={0.3} />
          </mesh>
          {/* Elbow & Forearm reaching forward toward Umbrella Grip */}
          <group position={[0, -0.23, 0]} rotation={[-0.35, 0, 1.05]}>
            <mesh castShadow position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.058, 0.052, 0.24, 12]} />
              <meshStandardMaterial color={coatColor} roughness={0.3} />
            </mesh>
            {/* Reflective Wrist Cuff */}
            <mesh position={[0, -0.21, 0]}>
              <cylinderGeometry args={[0.055, 0.055, 0.03, 12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.2} />
            </mesh>
            {/* Grip Hand */}
            <mesh position={[0, -0.26, 0]}>
              <sphereGeometry args={[0.052, 10, 10]} />
              <meshStandardMaterial color="#fde68a" roughness={0.6} />
            </mesh>
          </group>
        </group>

        {/* ─── 2. Parabolic Umbrella & Pivot Mount ─── */}
        <group ref={umbrellaGroupRef} position={[0.25, 0.22, 0.14]}>
          {/* Chrome Central Shaft */}
          <mesh position={[0, 0.68, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.018, 1.38, 12]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.18} />
          </mesh>

          {/* Ergonomic Grip Cylinder */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.024, 0.024, 0.14, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </mesh>

          {/* Classic Curved J-Hook Handle */}
          <mesh position={[-0.055, -0.05, 0]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.055, 0.022, 12, 20, Math.PI]} />
            <meshStandardMaterial color="#0f172a" roughness={0.45} />
          </mesh>

          {/* Parabolic Umbrella Dome Canopy */}
          <group position={[0, 0.98, 0]}>
            <mesh geometry={umbrellaDomeGeometry} castShadow receiveShadow>
              <meshStandardMaterial
                color={umbrellaColor}
                roughness={0.3}
                metalness={0.15}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Top Cap Washer & Pointed Ferrule Tip */}
            <mesh position={[0, 0.44, 0]}>
              <cylinderGeometry args={[0.06, 0.08, 0.03, 12]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.52, 0]}>
              <cylinderGeometry args={[0.008, 0.025, 0.14, 12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.15} />
            </mesh>

            {/* Protective Shield Cone Envelope (Dry Zone) */}
            {showShieldCone && (
              <group position={[0, -0.9, 0]}>
                <mesh rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[1.22, 1.85, 24, 1, true]} />
                  <meshStandardMaterial
                    color={isShielded ? "#38bdf8" : "#f43f5e"}
                    transparent
                    opacity={isShielded ? 0.16 : 0.26}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                  />
                </mesh>
                {/* Glowing Boundary Ring at Base of Shield Cone */}
                <mesh position={[0, -0.92, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[1.18, 1.23, 32]} />
                  <meshBasicMaterial
                    color={isShielded ? "#38bdf8" : "#f43f5e"}
                    transparent
                    opacity={0.45}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            )}
          </group>
        </group>
      </group>

      {/* ─── 3. Articulated Legs & Glossy Wellington Rain Boots ─── */}
      <group position={[0, 0.74, 0]}>
        {/* Left Leg */}
        <group ref={leftLegRef} position={[0, 0, -0.11]}>
          {/* Upper Waterproof Trousers */}
          <mesh castShadow position={[0, -0.18, 0]}>
            <cylinderGeometry args={[0.088, 0.075, 0.38, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.65} />
          </mesh>

          {/* Knee & Wellington Rain Boot */}
          <group ref={leftKneeRef} position={[0, -0.36, 0]}>
            {/* Boot Shaft */}
            <mesh castShadow position={[0, -0.16, 0]}>
              <cylinderGeometry args={[0.078, 0.068, 0.32, 12]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.15} />
            </mesh>
            {/* Yellow Boot Top Trim Ring */}
            <mesh position={[0, -0.01, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.025, 12]} />
              <meshStandardMaterial color={coatColor} roughness={0.3} />
            </mesh>
            {/* Contoured Foot & Rounded Toe (+X Forward) */}
            <mesh castShadow position={[0.055, -0.32, 0]}>
              <boxGeometry args={[0.22, 0.08, 0.115]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.15} />
            </mesh>
            <mesh castShadow position={[0.16, -0.32, 0]} scale={[1, 0.72, 1]}>
              <sphereGeometry args={[0.057, 12, 12]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.15} />
            </mesh>
            {/* Thick Lugged Rubber Sole */}
            <mesh position={[0.065, -0.365, 0]}>
              <boxGeometry args={[0.26, 0.025, 0.125]} />
              <meshStandardMaterial color="#334155" roughness={0.85} />
            </mesh>
          </group>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0, 0, 0.11]}>
          {/* Upper Waterproof Trousers */}
          <mesh castShadow position={[0, -0.18, 0]}>
            <cylinderGeometry args={[0.088, 0.075, 0.38, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.65} />
          </mesh>

          {/* Knee & Wellington Rain Boot */}
          <group ref={rightKneeRef} position={[0, -0.36, 0]}>
            {/* Boot Shaft */}
            <mesh castShadow position={[0, -0.16, 0]}>
              <cylinderGeometry args={[0.078, 0.068, 0.32, 12]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.15} />
            </mesh>
            {/* Yellow Boot Top Trim Ring */}
            <mesh position={[0, -0.01, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.025, 12]} />
              <meshStandardMaterial color={coatColor} roughness={0.3} />
            </mesh>
            {/* Contoured Foot & Rounded Toe (+X Forward) */}
            <mesh castShadow position={[0.055, -0.32, 0]}>
              <boxGeometry args={[0.22, 0.08, 0.115]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.15} />
            </mesh>
            <mesh castShadow position={[0.16, -0.32, 0]} scale={[1, 0.72, 1]}>
              <sphereGeometry args={[0.057, 12, 12]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.15} />
            </mesh>
            {/* Thick Lugged Rubber Sole */}
            <mesh position={[0.065, -0.365, 0]}>
              <boxGeometry args={[0.26, 0.025, 0.125]} />
              <meshStandardMaterial color="#334155" roughness={0.85} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ─── 4. Animated Dual Puddle Splash Ripples ─── */}
      {isWalking && walkingSpeed > 0.1 && (
        <group position={[0, 0.01, 0]}>
          <mesh ref={rippleRef1} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.22, 0.28, 24]} />
            <meshBasicMaterial color="#7dd3fc" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
          <mesh ref={rippleRef2} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.22, 0.28, 24]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
}