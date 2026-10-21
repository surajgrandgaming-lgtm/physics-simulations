"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useBankedCurveStore, BANKED_CURVE_STAGES } from "./BankedCurveStore";

// Ticker to step the store simulation forward
function SimulationTicker() {
  const status = useBankedCurveStore((s) => s.status);
  const tick = useBankedCurveStore((s) => s.tick);

  useFrame((_, delta) => {
    if (status === "running") {
      tick(delta);
    }
  });

  return null;
}

// Procedural Banked Curved Road Geometry
function BankedRoad({ radius, bankAngleDeg, arcDegrees, laneWidth }: {
  radius: number;
  bankAngleDeg: number;
  arcDegrees: number;
  laneWidth: number;
}) {
  const theta = (bankAngleDeg * Math.PI) / 180;
  const totalArc = (arcDegrees * Math.PI) / 180;

  // Generate curved mesh and stripes
  const { roadGeo, centerStripeGeo, outerStripeGeo, innerStripeGeo } = useMemo(() => {
    const segments = 90;
    const halfW = laneWidth / 2;

    const roadPositions: number[] = [];
    const roadUvs: number[] = [];
    const roadIndices: number[] = [];

    const centerPositions: number[] = [];
    const centerIndices: number[] = [];

    const outerPositions: number[] = [];
    const outerIndices: number[] = [];

    const innerPositions: number[] = [];
    const innerIndices: number[] = [];

    const stripeW = 0.25;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const phi = t * totalArc;
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);

      // Main Road Surface
      const rInner = radius - halfW * Math.cos(theta);
      const yInner = -halfW * Math.sin(theta);
      roadPositions.push(rInner * cosP, yInner, rInner * sinP);

      const rOuter = radius + halfW * Math.cos(theta);
      const yOuter = halfW * Math.sin(theta);
      roadPositions.push(rOuter * cosP, yOuter, rOuter * sinP);

      roadUvs.push(0, t * 15, 1, t * 15);

      if (i < segments) {
        const v0 = i * 2;
        const v1 = i * 2 + 1;
        const v2 = (i + 1) * 2;
        const v3 = (i + 1) * 2 + 1;
        roadIndices.push(v0, v1, v2, v1, v3, v2);
      }

      // Centerline Stripe (u in [-stripeW/2, +stripeW/2])
      const rC1 = radius - (stripeW / 2) * Math.cos(theta);
      const yC1 = -(stripeW / 2) * Math.sin(theta) + 0.02;
      centerPositions.push(rC1 * cosP, yC1, rC1 * sinP);

      const rC2 = radius + (stripeW / 2) * Math.cos(theta);
      const yC2 = (stripeW / 2) * Math.sin(theta) + 0.02;
      centerPositions.push(rC2 * cosP, yC2, rC2 * sinP);

      if (i < segments) {
        const c0 = i * 2;
        const c1 = i * 2 + 1;
        const c2 = (i + 1) * 2;
        const c3 = (i + 1) * 2 + 1;
        centerIndices.push(c0, c1, c2, c1, c3, c2);
      }

      // Outer Hazard Stripe
      const rO1 = radius + (halfW - 0.4) * Math.cos(theta);
      const yO1 = (halfW - 0.4) * Math.sin(theta) + 0.02;
      outerPositions.push(rO1 * cosP, yO1, rO1 * sinP);

      const rO2 = radius + halfW * Math.cos(theta);
      const yO2 = halfW * Math.sin(theta) + 0.02;
      outerPositions.push(rO2 * cosP, yO2, rO2 * sinP);

      if (i < segments) {
        const o0 = i * 2;
        const o1 = i * 2 + 1;
        const o2 = (i + 1) * 2;
        const o3 = (i + 1) * 2 + 1;
        outerIndices.push(o0, o1, o2, o1, o3, o2);
      }

      // Inner Curb Stripe
      const rI1 = radius - halfW * Math.cos(theta);
      const yI1 = -halfW * Math.sin(theta) + 0.02;
      innerPositions.push(rI1 * cosP, yI1, rI1 * sinP);

      const rI2 = radius - (halfW - 0.4) * Math.cos(theta);
      const yI2 = -(halfW - 0.4) * Math.sin(theta) + 0.02;
      innerPositions.push(rI2 * cosP, yI2, rI2 * sinP);

      if (i < segments) {
        const i0 = i * 2;
        const i1 = i * 2 + 1;
        const i2 = (i + 1) * 2;
        const i3 = (i + 1) * 2 + 1;
        innerIndices.push(i0, i1, i2, i1, i3, i2);
      }
    }

    const buildGeo = (pos: number[], ind: number[]) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(ind);
      g.computeVertexNormals();
      return g;
    };

    return {
      roadGeo: buildGeo(roadPositions, roadIndices),
      centerStripeGeo: buildGeo(centerPositions, centerIndices),
      outerStripeGeo: buildGeo(outerPositions, outerIndices),
      innerStripeGeo: buildGeo(innerPositions, innerIndices),
    };
  }, [radius, theta, totalArc, laneWidth]);

  return (
    <group>
      {/* Asphalt Surface */}
      <mesh geometry={roadGeo} receiveShadow>
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.65}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Underside Thickness */}
      <mesh geometry={roadGeo} position={[0, -0.25, 0]}>
        <meshStandardMaterial color="#0f172a" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Yellow Centerline Stripe */}
      <mesh geometry={centerStripeGeo}>
        <meshBasicMaterial color="#facc15" side={THREE.DoubleSide} />
      </mesh>

      {/* Outer Barrier Hazard Stripe (Orange) */}
      <mesh geometry={outerStripeGeo}>
        <meshBasicMaterial color="#f97316" side={THREE.DoubleSide} />
      </mesh>

      {/* Inner Curb Stripe (Cyan) */}
      <mesh geometry={innerStripeGeo}>
        <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} />
      </mesh>

      {/* Outer Cliff Wall & Barrier Guardrails */}
      {Array.from({ length: 18 }).map((_, idx) => {
        const t = (idx / 17) * totalArc;
        const halfW = laneWidth / 2;
        const rOut = radius + halfW * Math.cos(theta) + 0.35;
        const yOut = halfW * Math.sin(theta);
        const x = rOut * Math.cos(t);
        const z = rOut * Math.sin(t);

        return (
          <mesh key={idx} position={[x, yOut + 0.6, z]}>
            <cylinderGeometry args={[0.15, 0.15, 1.2, 8]} />
            <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.7} />
          </mesh>
        );
      })}

      {/* Structural Support Pillars Rising from Valley */}
      {Array.from({ length: 8 }).map((_, idx) => {
        const t = ((idx + 0.5) / 8) * totalArc;
        const x = radius * Math.cos(t);
        const z = radius * Math.sin(t);

        return (
          <group key={idx} position={[x, -7.5, z]}>
            <mesh>
              <cylinderGeometry args={[0.9, 1.4, 15, 16]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
            </mesh>
            <mesh position={[0, 7.3, 0]}>
              <boxGeometry args={[4, 0.6, 2.5]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Cyber-Hauler Vehicle Model
function CyberHauler({ radius, bankAngleDeg, arcDegrees }: {
  radius: number;
  bankAngleDeg: number;
  arcDegrees: number;
}) {
  const vehicleRef = useRef<THREE.Group>(null);
  const status = useBankedCurveStore((s) => s.status);
  const progress = useBankedCurveStore((s) => s.progress);
  const lateralOffset = useBankedCurveStore((s) => s.lateralOffset);
  const slipRatio = useBankedCurveStore((s) => s.slipRatio);

  const theta = (bankAngleDeg * Math.PI) / 180;
  const totalArc = (arcDegrees * Math.PI) / 180;

  useFrame(() => {
    if (!vehicleRef.current) return;

    const phi = progress * totalArc;
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);

    // Position along banked cross section:
    // r = radius + u * cos(theta), y = u * sin(theta) + wheelOffset
    const rCurrent = radius + lateralOffset * Math.cos(theta);
    const yCurrent = lateralOffset * Math.sin(theta) + 0.45;
    const xCurrent = rCurrent * cosP;
    const zCurrent = rCurrent * sinP;

    vehicleRef.current.position.set(xCurrent, yCurrent, zCurrent);

    // Orientation:
    // 1. Heading along circle tangent: (-sinP, 0, cosP)
    const yaw = -phi + Math.PI / 2;
    // 2. Bank tilt roll matching road slope: theta
    vehicleRef.current.rotation.set(0, 0, 0);
    vehicleRef.current.rotation.y = yaw;
    vehicleRef.current.rotateX(theta);

    // Visual slip lean if friction is high
    if (status === "running" && slipRatio > 0.8) {
      const shake = (Math.random() - 0.5) * 0.04;
      vehicleRef.current.rotateZ(shake);
    }
  });

  // Dynamic Underglow color based on safety / slip ratio
  const underglowColor = useMemo(() => {
    if (status === "crash_outer" || status === "slide_inner") return "#ef4444";
    if (slipRatio > 0.85) return "#f97316";
    if (slipRatio > 0.5) return "#eab308";
    return "#06b6d4";
  }, [status, slipRatio]);

  return (
    <group ref={vehicleRef}>
      {/* Main Aero Chassis */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.8, 0.6, 3.4]} />
        <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Cockpit Canopy */}
      <mesh position={[0, 0.85, 0.4]} castShadow>
        <boxGeometry args={[1.4, 0.45, 1.6]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Fusion Power Core Cargo in Bed */}
      <group position={[0, 0.85, -0.7]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 1.3, 16]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive={underglowColor}
            emissiveIntensity={1.2}
            roughness={0.3}
          />
        </mesh>
        {/* Core Protection Roll Cage */}
        <mesh>
          <boxGeometry args={[1.2, 0.7, 1.5]} />
          <meshStandardMaterial color="#475569" wireframe />
        </mesh>
      </group>

      {/* Front Headlights */}
      <mesh position={[0.6, 0.4, 1.72]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.6, 0.4, 1.72]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* 4 Wheels */}
      {([
        [-0.95, 0.25, 1.1],
        [0.95, 0.25, 1.1],
        [-0.95, 0.25, -1.1],
        [0.95, 0.25, -1.1],
      ] as [number, number, number][]).map((pos, i) => (
        <group key={i} position={pos}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 0.32, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          {/* Glowing Wheel Hubs */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.34, 12]} />
            <meshBasicMaterial color={underglowColor} />
          </mesh>
        </group>
      ))}

      {/* Underglow Ground Light */}
      <pointLight position={[0, -0.1, 0]} color={underglowColor} intensity={2.5} distance={4} />

      {/* Normal & Gravity Force Vectors */}
      {status === "running" && (
        <group position={[0, 0.6, 0]}>
          {/* Normal Force Arrow (perpendicular to roof) */}
          <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 2.2, 0x0284c7, 0.4, 0.25]} />
          {/* Gravity Arrow (straight down in world space) */}
          <arrowHelper args={[new THREE.Vector3(0, -Math.cos(theta), -Math.sin(theta)), new THREE.Vector3(0, 0, 0), 2.0, 0xf59e0b, 0.4, 0.25]} />
        </group>
      )}
    </group>
  );
}

// Camera Director that chases the vehicle smoothly and tilts with the bank angle
function DynamicChaseCamera({ radius, bankAngleDeg, arcDegrees, controlsRef }: {
  radius: number;
  bankAngleDeg: number;
  arcDegrees: number;
  controlsRef: React.RefObject<any>;
}) {
  const status = useBankedCurveStore((s) => s.status);
  const progress = useBankedCurveStore((s) => s.progress);
  const lateralOffset = useBankedCurveStore((s) => s.lateralOffset);

  const theta = (bankAngleDeg * Math.PI) / 180;
  const totalArc = (arcDegrees * Math.PI) / 180;

  useFrame((state) => {
    if (status === "running" || status === "crash_outer" || status === "slide_inner") {
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }

      const phi = progress * totalArc;
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);

      const rCurrent = radius + lateralOffset * Math.cos(theta);
      const yCurrent = lateralOffset * Math.sin(theta) + 0.45;
      const xCurrent = rCurrent * cosP;
      const zCurrent = rCurrent * sinP;

      // Lookahead point 10 meters ahead along curve
      const aheadPhi = Math.min(totalArc, phi + 0.12);
      const xTarget = radius * Math.cos(aheadPhi);
      const yTarget = yCurrent + 0.8;
      const zTarget = radius * Math.sin(aheadPhi);

      // Chase camera position behind car
      const behindPhi = phi - 0.18;
      const rCam = radius + (lateralOffset + 2) * Math.cos(theta);
      const camX = rCam * Math.cos(behindPhi);
      const camY = yCurrent + 4.2;
      const camZ = rCam * Math.sin(behindPhi);

      state.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.12);
      state.camera.lookAt(xTarget, yTarget, zTarget);
    } else {
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
    }
  });

  return null;
}

export function BankedCurveScene({ config }: { config?: any }) {
  const controlsRef = useRef<any>(null);
  const currentRound = useBankedCurveStore((s) => s.currentRound);
  const status = useBankedCurveStore((s) => s.status);
  const stage = BANKED_CURVE_STAGES[currentRound - 1];

  // Reset camera view on idle/stage change
  useEffect(() => {
    if (controlsRef.current && status === "idle") {
      // Perfectly center the cyber-hauler at the start line with sweeping view along the banked track
      controlsRef.current.target.set(stage.radius - 5, 2.0, 5);
      controlsRef.current.object.position.set(stage.radius + 20, 8.5, -18);
      controlsRef.current.update();
    }
  }, [currentRound, status, stage.radius]);

  const initialCamPos: [number, number, number] = [
    stage.radius + 20,
    8.5,
    -18,
  ];

  return (
    <div className="w-full h-full relative select-none overflow-hidden bg-white">
      <Canvas
        shadows
        camera={{ position: [stage.radius + 16, 7.5, -16], fov: 48, near: 0.5, far: 800 }}
        className="w-full h-full"
      >
        {/* Clean Light-Themed Lighting */}
        <ambientLight intensity={1.1} />
        <directionalLight
          position={[60, 90, 40]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        <hemisphereLight args={["#ffffff", "#cbd5e1", 0.7]} />

        {/* Minimalist Valley Ground Floor */}
        <mesh position={[stage.radius * 0.6, -15, stage.radius * 0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[500, 500]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
        </mesh>
        <gridHelper
          args={[400, 40, "#94a3b8", "#e2e8f0"]}
          position={[stage.radius * 0.6, -14.9, stage.radius * 0.6]}
        />

        {/* Procedural Banked Track */}
        <BankedRoad
          radius={stage.radius}
          bankAngleDeg={stage.bankAngleDeg}
          arcDegrees={stage.arcDegrees}
          laneWidth={stage.laneWidth}
        />

        {/* Cyber Hauler Vehicle */}
        <CyberHauler
          radius={stage.radius}
          bankAngleDeg={stage.bankAngleDeg}
          arcDegrees={stage.arcDegrees}
        />

        {/* Simulation Ticker & Dynamic Chase Cam */}
        <SimulationTicker />
        <DynamicChaseCamera
          radius={stage.radius}
          bankAngleDeg={stage.bankAngleDeg}
          arcDegrees={stage.arcDegrees}
          controlsRef={controlsRef}
        />

        {/* Interactive Orbit Controls when Idle */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          target={[stage.radius - 2, 2.5, 6]}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={10}
          maxDistance={300}
        />
      </Canvas>
    </div>
  );
}
