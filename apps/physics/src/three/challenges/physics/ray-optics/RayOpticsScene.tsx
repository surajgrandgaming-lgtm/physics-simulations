"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useRayOpticsStore } from "./RayOpticsStore";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Sleek Laser Beam Line Tube (Bounded exact glow, no overshoot)
// ─────────────────────────────────────────────────────────────────────────────
function GlowingLaserRay({
  start,
  end,
  color = "#22c55e",
  opacity = 0.9,
  radius = 0.004,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  opacity?: number;
  radius?: number;
}) {
  const geom = useMemo(() => {
    const p1 = new THREE.Vector3(...start);
    const p2 = new THREE.Vector3(...end);
    const curve = new THREE.LineCurve3(p1, p2);
    return new THREE.TubeGeometry(curve, 12, radius, 8, false);
  }, [start, end, radius]);

  const glowGeom = useMemo(() => {
    const p1 = new THREE.Vector3(...start);
    const p2 = new THREE.Vector3(...end);
    const curve = new THREE.LineCurve3(p1, p2);
    return new THREE.TubeGeometry(curve, 12, radius * 2.2, 8, false);
  }, [start, end, radius]);

  return (
    <group renderOrder={10}>
      {/* Intense Core Beam */}
      <mesh geometry={geom} renderOrder={10}>
        <meshBasicMaterial color={color} transparent opacity={opacity} depthTest={true} />
      </mesh>
      {/* Soft Glow Outer Tube - Perfectly bounded to beam endpoints */}
      <mesh geometry={glowGeom} renderOrder={10}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 0.35}
          blending={THREE.AdditiveBlending}
          depthTest={true}
        />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Optical Breadboard Platform & Circular Protractor Dial
// ─────────────────────────────────────────────────────────────────────────────
function OpticalBreadboard() {
  const dialRadius = 0.65;
  const tickMarks = useMemo(() => {
    const lines: Array<{ start: [number, number, number]; end: [number, number, number]; isMajor: boolean }> = [];
    for (let deg = 0; deg < 360; deg += 5) {
      const rad = (deg * Math.PI) / 180;
      const isMajor = deg % 15 === 0;
      const rInner = isMajor ? dialRadius - 0.04 : dialRadius - 0.02;
      const rOuter = dialRadius;
      lines.push({
        start: [rInner * Math.cos(rad), 0.002, rInner * Math.sin(rad)],
        end: [rOuter * Math.cos(rad), 0.002, rOuter * Math.sin(rad)],
        isMajor,
      });
    }
    return lines;
  }, [dialRadius]);

  const tickGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    tickMarks.forEach((tick) => {
      points.push(new THREE.Vector3(...tick.start));
      points.push(new THREE.Vector3(...tick.end));
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [tickMarks]);

  return (
    <group position={[0, 0, 0]}>
      {/* Precision Brushed Aluminum Optical Breadboard Base */}
      <mesh receiveShadow position={[0, -0.025, 0]}>
        <boxGeometry args={[2.5, 0.05, 1.6]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Grid Pattern Working Surface Plate */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 1.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Outer Radial Scale Ring */}
      <mesh position={[0, 0.0015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, dialRadius + 0.015, 64]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Circular Degree Protractor Scale Track */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[dialRadius - 0.045, dialRadius + 0.005, 64]} />
        <meshBasicMaterial color="#e2e8f0" />
      </mesh>

      {/* Engraved Protractor Tick Marks (High-Contrast Slate on Light Track) */}
      <lineSegments geometry={tickGeometry}>
        <lineBasicMaterial color="#475569" />
      </lineSegments>

      {/* Center Optical Turntable Mount */}
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.22, 0.23, 0.03, 32]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.031, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.005, 32]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Semi-Circular Acrylic Block (Stage 1: D-Block)
// ─────────────────────────────────────────────────────────────────────────────
function SemiCircularBlock({
  refractiveIndex,
}: {
  refractiveIndex: number;
}) {
  const blockGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = 0.16;
    // Flat interface along X axis (from -radius to +radius at y=0)
    // Semicircle extends into -Z (negative Z is back)
    shape.moveTo(-radius, 0);
    shape.absarc(0, 0, radius, Math.PI, 0, true);
    shape.lineTo(-radius, 0);

    const extrudeSettings = {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.003,
      bevelThickness: 0.003,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  return (
    <group position={[0, 0.034, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <mesh geometry={blockGeo} castShadow receiveShadow renderOrder={1}>
        <meshPhysicalMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.08}
          transparent
          opacity={0.42}
          roughness={0.04}
          metalness={0.08}
          clearcoat={1.0}
          clearcoatRoughness={0.03}
          depthWrite={false}
        />
      </mesh>

      {/* Flat Interface Normal Indicator Line (Centered along Z-axis) */}
      <mesh position={[0, 0, 0.04]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.0015, 0.32, 0.0015]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.6} />
      </mesh>

      {/* Component Badge */}
      <Html position={[0, -0.19, 0.04]} center distanceFactor={1.35}>
        <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full font-sans text-[2.6px] font-semibold shadow-xs whitespace-nowrap select-none pointer-events-none">
          Glass D-Block: n = {refractiveIndex.toFixed(2)}
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Equilateral Optical Prism (Stages 2 & 3: A = 60°)
// ─────────────────────────────────────────────────────────────────────────────
function EquilateralPrism({
  refractiveIndex,
}: {
  refractiveIndex: number;
}) {
  const prismGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const side = 0.26;
    const h = side * (Math.sqrt(3) / 2); // height of equilateral triangle

    // Center the triangle at origin
    const yTop = (2 / 3) * h;
    const yBottom = -(1 / 3) * h;
    const xHalf = side / 2;

    shape.moveTo(0, yTop); // Apex at top (+Z in world)
    shape.lineTo(xHalf, yBottom); // Bottom-right
    shape.lineTo(-xHalf, yBottom); // Bottom-left
    shape.closePath();

    const extrudeSettings = {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.003,
      bevelThickness: 0.003,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  return (
    <group position={[0, 0.034, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <mesh geometry={prismGeo} castShadow receiveShadow renderOrder={1}>
        <meshPhysicalMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.08}
          transparent
          opacity={0.42}
          roughness={0.04}
          metalness={0.08}
          clearcoat={1.0}
          clearcoatRoughness={0.03}
          depthWrite={false}
        />
      </mesh>

      {/* Component Badge */}
      <Html position={[0, -0.16, 0.04]} center distanceFactor={1.35}>
        <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full font-sans text-[2.6px] font-semibold shadow-xs whitespace-nowrap select-none pointer-events-none">
          Prism: A = 60° • n = {refractiveIndex.toFixed(3)}
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Precision Laser Emitter on Rotating Goniometer Arm
// ─────────────────────────────────────────────────────────────────────────────
function LaserEmitterArm({
  angleDeg,
  opticalElement,
}: {
  angleDeg: number;
  opticalElement: "semi-circle" | "prism";
}) {
  const armRadius = 0.62;
  const rad = (angleDeg * Math.PI) / 180;

  let posX = 0;
  let posZ = 0;
  let angleHeading = 0;

  if (opticalElement === "semi-circle") {
    posX = -armRadius * Math.sin(rad);
    posZ = -armRadius * Math.cos(rad);
    // Three.js Y-rotation matrix has Z' = -X*sin(alpha), so angleHeading must negate atan2 to align local +X with ray
    angleHeading = -Math.atan2(-posZ, -posX);
  } else {
    // Prism: laser aims directly at Face 1 midpoint [-0.065, 0.07, 0.038]
    // Incident angle angleDeg relative to Face 1 normal: thetaIn = -30° + angleDeg
    const thetaInRad = ((-30 + angleDeg) * Math.PI) / 180;
    posX = -0.065 - 0.55 * Math.cos(thetaInRad);
    posZ = 0.038 - 0.55 * Math.sin(thetaInRad);
    angleHeading = -Math.atan2(0.038 - posZ, -0.065 - posX);
  }

  return (
    <group position={[posX, 0.074, posZ]} rotation={[0, angleHeading, 0]}>
      {/* Cylindrical Diode Housing (Light Satin Aluminum) */}
      <mesh castShadow position={[-0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.10, 20]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Brass Aperture Collar */}
      <mesh position={[0.015, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.016, 0.02, 16]} />
        <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Emitting Diode Aperture Dot */}
      <mesh position={[0.026, 0, 0]}>
        <sphereGeometry args={[0.005, 12, 12]} />
        <meshBasicMaterial color="#16a34a" />
      </mesh>

      {/* Mounting Stanchion to Protractor Rail (Brushed Steel, reaches bench plate) */}
      <mesh position={[-0.04, -0.037, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.074, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Goniometer Indicator Line & Angle Badge */}
      <Html position={[0, 0.06, 0]} center distanceFactor={1.35}>
        <div className="bg-white/90 backdrop-blur-xs border border-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full font-sans text-[2.6px] font-semibold shadow-xs whitespace-nowrap select-none pointer-events-none">
          Laser: i = {angleDeg.toFixed(1)}°
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Frosted Radial Detector Screen & Target Marker
// ─────────────────────────────────────────────────────────────────────────────
function RadialDetectorScreen({
  targetDisplay,
  targetAngle,
  currentAngle,
  opticalElement,
  isTIR,
}: {
  targetDisplay: string;
  targetAngle: number;
  currentAngle: number;
  opticalElement: "semi-circle" | "prism";
  isTIR: boolean;
}) {
  const currentStage = useRayOpticsStore((s) => s.currentStage);

  let screenPos: [number, number, number] = [0.698, 0.074, 0.0];
  let screenRot: [number, number, number] = [0, 0, 0];

  if (currentStage === 1) {
    screenPos = [0.698, 0.074, 0.0];
    screenRot = [0, 0, 0];
  } else if (currentStage === 2) {
    // Symmetrical minimum deviation for Crown glass n=1.520 (delta_m = 39.0°, emergent angle = -19.46°)
    // Screen normal points directly back towards incoming beam at +19.46° Y-yaw
    screenPos = [0.591, 0.074, -0.148];
    screenRot = [0, (19.46 * Math.PI) / 180, 0];
  } else {
    // Symmetrical minimum deviation for Flint glass n=1.660 (delta_m = 52.2°, emergent angle = -26.10°)
    // Screen normal points directly back towards incoming beam at +26.10° Y-yaw
    screenPos = [0.566, 0.074, -0.207];
    screenRot = [0, (26.10 * Math.PI) / 180, 0];
  }

  const isBeamAligned = Math.abs(currentAngle - targetAngle) <= 0.6;

  return (
    <group position={screenPos} rotation={screenRot}>
      {/* 1. Anodized Aluminum Backing Plate / Bezel */}
      <mesh castShadow receiveShadow position={[0.002, 0, 0]}>
        <boxGeometry args={[0.016, 0.12, 0.22]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* 2. Front Matte White Projection Screen Surface */}
      <mesh position={[-0.007, 0, 0]}>
        <boxGeometry args={[0.002, 0.108, 0.208]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.05} />
      </mesh>

      {/* 3. Calibrated Center Target Reticle Line */}
      <mesh position={[-0.0085, 0, 0]}>
        <boxGeometry args={[0.001, 0.104, 0.003]} />
        <meshBasicMaterial color="#0284c7" />
      </mesh>

      {/* 4. Dynamic Laser Beam Impact Dot */}
      {isBeamAligned && (
        <mesh position={[-0.009, 0, 0]}>
          <sphereGeometry args={[0.006, 16, 16]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      )}

      {/* 5. Rear Mounting Bracket & Stanchion Base (Cleanly mounted BEHIND the screen) */}
      <mesh position={[0.016, 0, 0]}>
        <boxGeometry args={[0.016, 0.03, 0.04]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.02, -0.037, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.074, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.02, -0.072, 0]}>
        <cylinderGeometry args={[0.022, 0.024, 0.005, 20]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* ── Light Theme TARGET Badge (Directly Above Target Screen) ── */}
      <Html position={[0, 0.14, 0]} center distanceFactor={1.35}>
        <div className="bg-cyan-50 border border-cyan-400 text-cyan-800 px-2 py-0.5 rounded-full font-mono text-[2.6px] font-bold shadow-xs flex items-center gap-1 select-none whitespace-nowrap pointer-events-none">
          <span className="text-cyan-600">TARGET:</span>
          <span>{targetDisplay}</span>
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Dynamic Optical Laser Ray Paths (Incident, Refracted, Reflected/TIR)
// ─────────────────────────────────────────────────────────────────────────────
function RayTracingRays({
  incidentAngle,
  refractedAngle,
  opticalElement,
  isTIR,
  reflectance,
  transmittance,
  refractiveIndex,
}: {
  incidentAngle: number;
  refractedAngle: number;
  opticalElement: "semi-circle" | "prism";
  isTIR: boolean;
  reflectance: number;
  transmittance: number;
  refractiveIndex: number;
}) {
  const armRadius = 0.60;
  const iRad = (incidentAngle * Math.PI) / 180;
  const yLevel = 0.074;

  if (opticalElement === "semi-circle") {
    // Stage 1: Laser enters curved surface, hits origin [0, yLevel, 0] on flat boundary
    const laserStartX = -armRadius * Math.sin(iRad);
    const laserStartZ = -armRadius * Math.cos(iRad);

    // 1. Incident Ray: from emitter aperture to boundary center [0, yLevel, 0]
    const incidentStart: [number, number, number] = [
      laserStartX + 0.026 * Math.sin(iRad),
      yLevel,
      laserStartZ + 0.026 * Math.cos(iRad),
    ];
    const boundaryCenter: [number, number, number] = [0, yLevel, 0];

    // 2. Reflected Ray (Always exists by Fresnel reflection; 100% at TIR)
    // Reflects back into negative Z at angle i: X = +R*sin(i), Z = -R*cos(i)
    const reflectedEnd: [number, number, number] = [
      armRadius * Math.sin(iRad),
      yLevel,
      -armRadius * Math.cos(iRad),
    ];

    // 3. Refracted Ray (Into positive Z air at angle r; cleanly terminates on detector front face)
    // X = R*sin(r), Z = +R*cos(r)
    const rRad = (refractedAngle * Math.PI) / 180;
    const screenR = 0.69;
    const refractedEnd: [number, number, number] = [
      screenR * Math.sin(rRad),
      yLevel,
      screenR * Math.cos(rRad),
    ];

    return (
      <group>
        {/* Incident Laser Beam (Full Intensity Green) */}
        <GlowingLaserRay start={incidentStart} end={boundaryCenter} color="#22c55e" opacity={0.95} />

        {/* Reflected Beam (Green: faint Fresnel when i < critical, intense when TIR) */}
        <GlowingLaserRay
          start={boundaryCenter}
          end={reflectedEnd}
          color={isTIR ? "#22c55e" : "#86efac"}
          opacity={isTIR ? 0.98 : Math.max(0.15, reflectance)}
          radius={isTIR ? 0.005 : 0.003}
        />

        {/* Refracted Beam (Extinguished when i >= critical angle / TIR) */}
        {!isTIR && (
          <GlowingLaserRay
            start={boundaryCenter}
            end={refractedEnd}
            color="#22c55e"
            opacity={Math.max(0.2, transmittance)}
            radius={0.004}
          />
        )}
      </group>
    );
  } else {
    // Stages 2 & 3: Triangular Prism (A = 60°)
    const A_rad = (60.0 * Math.PI) / 180;
    const n = refractiveIndex;

    // Face 1 midpoint: [-0.065, yLevel, 0.038]
    const pEntry: [number, number, number] = [-0.065, yLevel, 0.038];
    // Direction of incident beam towards pEntry: thetaIn = -30° + incidentAngle
    const thetaInRad = ((-30 + incidentAngle) * Math.PI) / 180;
    const p1: [number, number, number] = [
      pEntry[0] - 0.55 * Math.cos(thetaInRad),
      yLevel,
      pEntry[2] - 0.55 * Math.sin(thetaInRad),
    ];
    // Start incident ray right at the front brass aperture dot of the diode
    const rayStart: [number, number, number] = [
      p1[0] + 0.026 * Math.cos(thetaInRad),
      yLevel,
      p1[2] + 0.026 * Math.sin(thetaInRad),
    ];

    // Refraction at Face 1: sin(r1) = sin(i) / n
    const sinR1 = Math.sin(iRad) / n;
    const r1_rad = Math.asin(Math.min(1.0, Math.max(-1.0, sinR1)));

    // Internal ray direction: thetaInternal = -30° + r1
    const thetaInternal = (-30 * Math.PI) / 180 + r1_rad;
    const pExit: [number, number, number] = [
      0.065,
      yLevel,
      0.038 + 0.130 * Math.tan(thetaInternal),
    ];

    // Face 2 refraction: r2 = A - r1
    const r2_rad = A_rad - r1_rad;
    const sinE = n * Math.sin(r2_rad);
    let thetaEmergent = -0.34;
    let isTIRAtExit = false;

    if (sinE > 1.0) {
      isTIRAtExit = true;
    } else {
      const e_rad = Math.asin(Math.min(1.0, Math.max(-1.0, sinE)));
      thetaEmergent = (30 * Math.PI) / 180 - e_rad;
    }

    const pEnd: [number, number, number] = [
      pExit[0] + 0.55 * Math.cos(thetaEmergent),
      yLevel,
      pExit[2] + 0.55 * Math.sin(thetaEmergent),
    ];

    return (
      <group>
        {/* Incident Ray */}
        <GlowingLaserRay start={rayStart} end={pEntry} color="#22c55e" opacity={0.95} />
        {/* Internal Refracted Ray (Vivid Neon Laser inside glass) */}
        <GlowingLaserRay start={pEntry} end={pExit} color="#22c55e" opacity={0.98} radius={0.005} />
        {/* Emergent Deviated Ray (Extinguished if TIR occurs at exit face) */}
        {!isTIRAtExit && (
          <GlowingLaserRay start={pExit} end={pEnd} color="#22c55e" opacity={0.95} />
        )}
      </group>
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Cinematic Target Zoom-In & Ease-Out Camera Transition
// ─────────────────────────────────────────────────────────────────────────────
function CameraRig() {
  const controlsRef = useRef<any>(null);
  const isMissionStarted = useRayOpticsStore((s) => s.isMissionStarted);
  const missionStartedAt = useRayOpticsStore((s) => s.missionStartedAt);
  const currentStage = useRayOpticsStore((s) => s.currentStage);
  const cameraTrigger = useRayOpticsStore((s) => s.cameraTrigger);

  // Close-up zoomed in directly on the Target Detector during intro hold
  const targetCamPos = useMemo(() => new THREE.Vector3(0.55, 0.35, 0.30), []);
  const targetCamLook = useMemo(() => new THREE.Vector3(0.40, 0.12, 0.0), []);

  // Final position after transition: high-angle top-down tilted view centered on the apparatus
  const overviewCamPos = useMemo(() => new THREE.Vector3(0.0, 1.85, 0.95), []);
  const overviewCamLook = useMemo(() => new THREE.Vector3(0.0, 0.07, 0.0), []);

  const holdDuration = 0.6;
  const zoomDuration = 2.4;
  const totalIntroDuration = holdDuration + zoomDuration;

  const [introFinished, setIntroFinished] = useState(false);
  const lastMissionStartedAtRef = useRef(missionStartedAt);

  useEffect(() => {
    if (missionStartedAt !== lastMissionStartedAtRef.current) {
      lastMissionStartedAtRef.current = missionStartedAt;
      setIntroFinished(false);
    }
  }, [missionStartedAt]);

  useEffect(() => {
    setIntroFinished(false);
  }, [currentStage, cameraTrigger]);

  useFrame((state) => {
    if (controlsRef.current && !introFinished) {
      if (!isMissionStarted || missionStartedAt === null) {
        state.camera.position.copy(targetCamPos);
        controlsRef.current.target.copy(targetCamLook);
        controlsRef.current.update();
      } else {
        const elapsed = (performance.now() - missionStartedAt) / 1000;
        if (elapsed <= holdDuration) {
          state.camera.position.copy(targetCamPos);
          controlsRef.current.target.copy(targetCamLook);
          controlsRef.current.update();
        } else if (elapsed < totalIntroDuration) {
          const progress = (elapsed - holdDuration) / zoomDuration;
          const rawT = Math.min(1, Math.max(0, progress));
          const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;
          state.camera.position.lerpVectors(targetCamPos, overviewCamPos, t);
          controlsRef.current.target.lerpVectors(targetCamLook, overviewCamLook, t);
          controlsRef.current.update();
        } else {
          state.camera.position.copy(overviewCamPos);
          controlsRef.current.target.copy(overviewCamLook);
          controlsRef.current.update();
          setIntroFinished(true);
        }
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0.0, 0.07, 0.0]}
      minDistance={0.8}
      maxDistance={4.5}
      maxPolarAngle={Math.PI / 2 - 0.05}
      enableDamping
      dampingFactor={0.05}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Main Root Ray Optics Simulation Scene
// ─────────────────────────────────────────────────────────────────────────────
export function RayOpticsScene() {
  const currentStage = useRayOpticsStore((s) => s.currentStage);
  const sliderValue = useRayOpticsStore((s) => s.sliderValue);
  const getStageConfig = useRayOpticsStore((s) => s.getStageConfig);
  const getPhysicsState = useRayOpticsStore((s) => s.getPhysicsState);

  const stageConfig = useMemo(() => getStageConfig(), [getStageConfig, currentStage]);
  const physics = useMemo(() => getPhysicsState(), [getPhysicsState, currentStage, sliderValue]);

  return (
    <div className="w-full h-full relative bg-slate-50 select-none">
      <Canvas
        shadows
        camera={{ position: [0.0, 1.85, 0.95], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#f8fafc"]} />
        <ambientLight intensity={1.35} />
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-3, 4, -2]} intensity={0.5} />

        {/* 1. Anodized Optical Breadboard with Protractor Dial */}
        <OpticalBreadboard />

        {/* 2. Optical Element (Semi-Circle D-Block for S1, Equilateral Prism for S2 & S3) */}
        {stageConfig.opticalElement === "semi-circle" ? (
          <SemiCircularBlock refractiveIndex={stageConfig.refractiveIndex} />
        ) : (
          <EquilateralPrism refractiveIndex={stageConfig.refractiveIndex} />
        )}

        {/* 3. Laser Emitter Arm */}
        <LaserEmitterArm
          angleDeg={physics.incidentAngle}
          opticalElement={stageConfig.opticalElement}
        />

        {/* 4. Radial Detector Screen & Target Marker */}
        <RadialDetectorScreen
          targetDisplay={stageConfig.targetDisplay}
          targetAngle={stageConfig.targetAngle}
          currentAngle={physics.incidentAngle}
          opticalElement={stageConfig.opticalElement}
          isTIR={physics.isTIR}
        />

        {/* 5. Glowing Laser Ray Tracing Paths */}
        <RayTracingRays
          incidentAngle={physics.incidentAngle}
          refractedAngle={physics.refractedAngle}
          opticalElement={stageConfig.opticalElement}
          isTIR={physics.isTIR}
          reflectance={physics.reflectance}
          transmittance={physics.transmittance}
          refractiveIndex={stageConfig.refractiveIndex}
        />

        {/* 6. Cinematic Camera Transition */}
        <CameraRig />
      </Canvas>
    </div>
  );
}

export default RayOpticsScene;
