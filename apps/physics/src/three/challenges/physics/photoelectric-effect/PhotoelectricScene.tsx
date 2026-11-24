"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  usePhotoelectricStore,
  wavelengthToHex,
} from "./PhotoelectricStore";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Dovetail Optical Table with Bench Graduations
// ─────────────────────────────────────────────────────────────────────────────
function OpticalBenchTable() {
  const graduationMarks = useMemo(() => {
    const lines: { start: [number, number, number]; end: [number, number, number] }[] = [];
    const railLength = 1.9;
    const startX = -railLength / 2;
    const numTicks = 38;

    for (let i = 0; i <= numTicks; i++) {
      const x = startX + (i / numTicks) * railLength;
      const isMajor = i % 5 === 0;
      const tickZLen = isMajor ? 0.024 : 0.012;
      lines.push({
        start: [x, 0.041, 0.07],
        end: [x, 0.041, 0.07 + tickZLen],
      });
    }
    return lines;
  }, []);

  const railTickGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    graduationMarks.forEach((m) => {
      points.push(new THREE.Vector3(...m.start));
      points.push(new THREE.Vector3(...m.end));
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [graduationMarks]);

  return (
    <group position={[0, 0, 0]}>
      {/* Heavy Granite/Solid Aluminum Isolation Table */}
      <mesh receiveShadow position={[0, -0.04, 0]}>
        <boxGeometry args={[2.4, 0.06, 1.4]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.35} metalness={0.4} />
      </mesh>

      {/* Grid Pattern Top Plate */}
      <mesh position={[0, -0.009, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.3, 1.3]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} metalness={0.15} />
      </mesh>

      {/* Precision Optical Rail */}
      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[2.0, 0.04, 0.16]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.25} metalness={0.7} />
      </mesh>

      {/* Central Guide Track Slot */}
      <mesh position={[0, 0.0405, 0]}>
        <boxGeometry args={[1.96, 0.002, 0.028]} />
        <meshBasicMaterial color="#64748b" />
      </mesh>

      {/* Graduation Scale Lines */}
      <lineSegments geometry={railTickGeometry}>
        <lineBasicMaterial color="#334155" />
      </lineSegments>

      {/* Rail End Stops */}
      <mesh position={[-1.0, 0.035, 0]}>
        <boxGeometry args={[0.03, 0.05, 0.18]} />
        <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[1.0, 0.035, 0]}>
        <boxGeometry args={[0.03, 0.05, 0.18]} />
        <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Tunable Monochromatic Light Source Unit
// ─────────────────────────────────────────────────────────────────────────────
function MonochromaticLightSource({
  wavelengthNm,
  photonEnergyEv,
  colorHex,
}: {
  wavelengthNm: number;
  photonEnergyEv: number;
  colorHex: string;
}) {
  return (
    <group position={[-0.68, 0.04, 0]}>
      {/* Sliding Carrier Clamp */}
      <mesh castShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[0.18, 0.03, 0.18]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Support Pillar */}
      <mesh castShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.11, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.15} metalness={0.9} />
      </mesh>

      {/* Lamp Housing Cylinder */}
      <mesh castShadow position={[0, 0.14, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.038, 0.038, 0.22, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Brass Collimator Aperture Nozzle */}
      <mesh position={[0.115, 0.14, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.024, 0.034, 0.03, 32]} />
        <meshStandardMaterial color="#d97706" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Radiant Glowing Lens Aperture */}
      <mesh position={[0.131, 0.14, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.018, 32]} />
        <meshBasicMaterial color={colorHex} />
      </mesh>

      {/* Wavelength Indicator LED on Housing Top */}
      <mesh position={[-0.04, 0.18, 0]}>
        <sphereGeometry args={[0.007, 16, 16]} />
        <meshBasicMaterial color={colorHex} />
      </mesh>

      {/* Light Source Label Badge (Compact for Mobile) */}
      <Html position={[0, 0.23, 0]} center distanceFactor={1.9}>
        <div className="bg-white/95 border border-slate-300 text-slate-800 px-1 py-0.5 rounded-sm font-mono text-[3.8px] font-bold shadow-xs whitespace-nowrap flex items-center gap-1 select-none pointer-events-none">
          <span className="w-1.2 h-1.2 rounded-full inline-block shrink-0" style={{ backgroundColor: colorHex }} />
          Light: λ = {wavelengthNm.toFixed(0)} nm ({photonEnergyEv.toFixed(2)} eV)
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Photocell Vacuum Tube with Quartz Window, Cathode, Anode & Electrons
// ─────────────────────────────────────────────────────────────────────────────
function PhotocellVacuumTube({
  targetMetalName,
  targetMetalSymbol,
  workFunctionEv,
  lightColorHex,
  currentVoltageV,
  stoppingPotentialV,
  isEmitting,
  photocurrentMicroAmps,
  isAligned,
}: {
  targetMetalName: string;
  targetMetalSymbol: string;
  workFunctionEv: number;
  lightColorHex: string;
  currentVoltageV: number;
  stoppingPotentialV: number;
  isEmitting: boolean;
  photocurrentMicroAmps: number;
  isAligned: boolean;
}) {
  // Tube center is at X = 0.0, tube radius = 0.07m, length = 0.28m
  // In world coordinates, PhotocellVacuumTube is placed at group Y = 0.04.
  // Setting tubeY = 0.14 places the phototube optical axis at world Y = 0.04 + 0.14 = 0.18,
  // perfectly coaxial with the lamp nozzle, light beam, and target alignment!
  const cathodeX = -0.09;
  const anodeX = 0.09;
  const tubeY = 0.14;

  const simulationTrigger = usePhotoelectricStore((s) => s.simulationTrigger);
  const pulseAnimRef = useRef(0);
  const lastSimTriggerRef = useRef(simulationTrigger);

  // Particle cloud for liberated photoelectrons
  const electronCount = 56;
  const particleGroupRef = useRef<THREE.Group>(null);
  const flashRingRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<
    {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      initVx: number;
      active: boolean;
    }[]
  >([]);

  // Trigger burst simulation pulse when START is clicked
  useEffect(() => {
    if (simulationTrigger !== lastSimTriggerRef.current) {
      lastSimTriggerRef.current = simulationTrigger;
      pulseAnimRef.current = 1.0; // Trigger high-energy burst animation
      // Re-energize and launch all electrons from cathode simultaneously
      particlesRef.current.forEach((p) => {
        p.x = cathodeX;
        p.y = tubeY + (Math.random() - 0.5) * 0.04;
        p.z = (Math.random() - 0.5) * 0.04;
        p.initVx = 0.16 + Math.random() * 0.18;
        p.vx = p.initVx;
        p.vy = (Math.random() - 0.5) * 0.025;
        p.vz = (Math.random() - 0.5) * 0.025;
      });
    }
  }, [simulationTrigger, cathodeX, tubeY]);

  // Initialize electron particle pool
  useEffect(() => {
    particlesRef.current = Array.from({ length: electronCount }, () => ({
      x: cathodeX,
      y: tubeY + (Math.random() - 0.5) * 0.04,
      z: (Math.random() - 0.5) * 0.04,
      vx: 0,
      vy: 0,
      vz: 0,
      initVx: 0.14 + Math.random() * 0.16,
      active: Math.random() > 0.4,
    }));
  }, [cathodeX, tubeY]);

  // Animate electron kinematics and START burst wave frame-by-frame
  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);

    // Fade out START pulse ring
    if (pulseAnimRef.current > 0) {
      pulseAnimRef.current = Math.max(0, pulseAnimRef.current - dt * 1.5);
      if (flashRingRef.current) {
        flashRingRef.current.scale.setScalar(1 + (1 - pulseAnimRef.current) * 1.8);
        (flashRingRef.current.material as THREE.MeshBasicMaterial).opacity = pulseAnimRef.current * 0.9;
        flashRingRef.current.visible = true;
      }
    } else if (flashRingRef.current) {
      flashRingRef.current.visible = false;
    }

    if (!particleGroupRef.current) return;
    const children = particleGroupRef.current.children;

    // Retarding electric deceleration factor: a = - (V / V0)
    // When V >= V0, the electron decelerates to 0 and turns back before reaching anodeX
    const retardingRatio = stoppingPotentialV > 0.01 ? currentVoltageV / stoppingPotentialV : 10.0;
    const speedBoost = 1.0 + pulseAnimRef.current * 0.8;

    particlesRef.current.forEach((p, idx) => {
      const mesh = children[idx] as THREE.Mesh;
      if (!mesh) return;

      if (!isEmitting || (photocurrentMicroAmps <= 0.001 && pulseAnimRef.current <= 0.01)) {
        // If not emitting or fully stopped, keep particles invisible
        mesh.visible = isEmitting && p.x > cathodeX;
      } else {
        mesh.visible = true;
      }

      if (isEmitting) {
        // Deceleration proportional to retarding voltage
        const accelX = -retardingRatio * 0.28;
        p.vx += accelX * dt * speedBoost;
        p.x += p.vx * dt * speedBoost;
        p.y += p.vy * dt;
        p.z += p.vz * dt;

        // Strict tube interior boundary clamping
        p.y = Math.max(tubeY - 0.035, Math.min(tubeY + 0.035, p.y));
        p.z = Math.max(-0.035, Math.min(0.035, p.z));

        // Boundary checks
        if (p.x >= anodeX) {
          // Reached collector anode! Absorbed -> reset to cathode
          p.x = cathodeX;
          p.y = tubeY + (Math.random() - 0.5) * 0.03;
          p.z = (Math.random() - 0.5) * 0.03;
          p.vx = p.initVx;
          p.vy = (Math.random() - 0.5) * 0.015;
          p.vz = (Math.random() - 0.5) * 0.015;
        } else if (p.vx < 0 && p.x <= cathodeX) {
          // Turned around by retarding field and fell back to cathode -> reset
          p.x = cathodeX;
          p.y = tubeY + (Math.random() - 0.5) * 0.03;
          p.z = (Math.random() - 0.5) * 0.03;
          p.vx = p.initVx;
          p.vy = (Math.random() - 0.5) * 0.015;
          p.vz = (Math.random() - 0.5) * 0.015;
        }

        mesh.position.set(p.x, p.y, p.z);
      } else {
        mesh.visible = false;
      }
    });
  });

  // Distinct metallic colors for the cathode plate
  const metalColor =
    targetMetalSymbol === "Cs"
      ? "#eab308" // Golden-amber Cesium
      : targetMetalSymbol === "Na"
      ? "#cbd5e1" // Silvery-white Sodium
      : "#94a3b8"; // Bluish-grey Zinc

  return (
    <group position={[0, 0.04, 0]}>
      {/* Heavy Support Stanchion & Rail Clamp */}
      <mesh castShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[0.26, 0.03, 0.18]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Central Support Post meeting tube bottom at Y = 0.07 */}
      <mesh castShadow position={[0, 0.048, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.038, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.15} metalness={0.9} />
      </mesh>
      {/* Rubber/metal saddle collar cradling the glass bulb */}
      <mesh position={[0, 0.068, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.008, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Evacuated Cylindrical Glass Bulb */}
      <mesh position={[0, tubeY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.28, 32]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.32}
          roughness={0.05}
          transmission={0.88}
          thickness={0.04}
          ior={1.48}
          color="#f8fafc"
        />
      </mesh>

      {/* Spherical Quartz End Caps (Coaxial Hemispheres sealing cylinder ends) */}
      {/* Left Entrance End Cap: bulges towards -X */}
      <mesh position={[-0.14, tubeY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <sphereGeometry args={[0.07, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.32}
          roughness={0.05}
          transmission={0.88}
          thickness={0.04}
          ior={1.48}
          color="#f8fafc"
        />
      </mesh>
      {/* Right Collector End Cap: bulges towards +X */}
      <mesh position={[0.14, tubeY, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <sphereGeometry args={[0.07, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.32}
          roughness={0.05}
          transmission={0.88}
          thickness={0.04}
          ior={1.48}
          color="#f8fafc"
        />
      </mesh>

      {/* Optical Quartz Window Rim on Negative Entrance Dome (Golden Brass at apex X = -0.208) */}
      <mesh position={[-0.208, tubeY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.024, 0.003, 16, 32]} />
        <meshStandardMaterial color="#d97706" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Precision Flat Quartz Window Glass */}
      <mesh position={[-0.208, tubeY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.022, 32]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.4}
          transmission={0.95}
          roughness={0.02}
          ior={1.5}
          color="#ffffff"
        />
      </mesh>

      {/* ── Cathode (Emitter Plate) - Authentic Concave Semi-Cylindrical Photocathode ── */}
      <group position={[cathodeX, tubeY, 0]}>
        {/* Semi-cylindrical curved metal plate:
            Curving in Y-Z plane, symmetric from y = -0.042 to y = +0.042,
            concave depth in negative Z (-0.042), open towards the viewer (+Z) and collector (+X) */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry
            args={[0.042, 0.042, 0.065, 32, 1, true, Math.PI / 2, Math.PI]}
          />
          <meshStandardMaterial
            color={metalColor}
            roughness={0.25}
            metalness={0.88}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Top & Bottom Lip Trim Ribs */}
        <mesh position={[0, 0.042, -0.002]}>
          <boxGeometry args={[0.065, 0.0025, 0.004]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.042, -0.002]}>
          <boxGeometry args={[0.065, 0.0025, 0.004]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Cathode Terminal Support Rod (welded to bottom lip at y = -0.042, extending down through glass) */}
        <mesh position={[0, -0.064, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.045, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Terminal Banana Jack Connector at bottom tip (world Y = 0.095) */}
        <mesh position={[0, -0.085, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.012, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>

      {/* ── Anode (Collector Ring/Grid) ── */}
      <group position={[anodeX, tubeY, 0]}>
        {/* Wire-Mesh Collector Ring */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.042, 0.0035, 16, 32]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.15} metalness={0.95} />
        </mesh>
        {/* Collector Anode Central Cross Wires */}
        <mesh>
          <boxGeometry args={[0.001, 0.084, 0.002]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.001, 0.084, 0.002]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} />
        </mesh>
        {/* Anode Terminal Rod */}
        <mesh position={[0, -0.064, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.045, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Terminal Banana Jack Connector at bottom tip (world Y = 0.095) */}
        <mesh position={[0, -0.085, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.012, 16]} />
          <meshStandardMaterial color="#ef4444" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>

      {/* ── START Verification Quantum Pulse Wave Ring ── */}
      <mesh
        ref={flashRingRef}
        position={[cathodeX, tubeY, 0]}
        rotation={[0, Math.PI / 2, 0]}
        visible={false}
      >
        <ringGeometry args={[0.015, 0.038, 32]} />
        <meshBasicMaterial color={lightColorHex} transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Photoelectron Cloud Particles ── */}
      <group ref={particleGroupRef}>
        {Array.from({ length: electronCount }).map((_, i) => (
          <mesh key={i} visible={false}>
            <sphereGeometry args={[0.0034, 12, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        ))}
      </group>

      {/* Cathode Target Badge (Elevated Cleanly) */}
      <Html position={[cathodeX, tubeY + 0.11, 0]} center distanceFactor={1.9}>
        <div className="bg-white/95 border border-slate-300 text-slate-800 px-1 py-0.5 rounded-sm font-mono text-[3.8px] font-bold shadow-xs whitespace-nowrap select-none pointer-events-none">
          Cathode: {targetMetalName} ({targetMetalSymbol}, Φ = {workFunctionEv.toFixed(2)} eV)
        </div>
      </Html>

      {/* Collector Anode Badge */}
      <Html position={[anodeX, tubeY + 0.11, 0]} center distanceFactor={1.9}>
        <div className="bg-white/95 border border-slate-300 text-slate-800 px-1 py-0.5 rounded-sm font-mono text-[3.8px] font-bold shadow-xs whitespace-nowrap select-none pointer-events-none">
          Collector Anode
        </div>
      </Html>

      {/* Microammeter Live Current Badge (Beneath Tube, Completely Unobstructed) */}
      <Html position={[0, tubeY - 0.11, 0]} center distanceFactor={1.9}>
        <div
          className={`px-1.5 py-0.5 rounded-sm text-[4.2px] font-mono font-black border shadow-xs whitespace-nowrap select-none pointer-events-none transition-colors ${
            photocurrentMicroAmps <= 0.001
              ? "bg-rose-50 border-rose-300 text-rose-700"
              : "bg-emerald-50 border-emerald-300 text-emerald-700"
          }`}
        >
          Photocurrent: I = {photocurrentMicroAmps.toFixed(2)} μA
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Incident Monochromatic Light Beam Cone
// ─────────────────────────────────────────────────────────────────────────────
function LightBeamCone({
  colorHex,
}: {
  colorHex: string;
}) {
  // From lamp nozzle at X = -0.55, Y = 0.18 to Cathode at X = -0.09, Y = 0.18
  const startX = -0.55;
  const endX = -0.09;
  const beamY = 0.18;

  const beamGeo = useMemo(() => {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(startX, beamY, 0),
      new THREE.Vector3(endX, beamY, 0)
    );
    return new THREE.TubeGeometry(curve, 12, 0.007, 16, false);
  }, []);

  const glowGeo = useMemo(() => {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(startX, beamY, 0),
      new THREE.Vector3(endX, beamY, 0)
    );
    return new THREE.TubeGeometry(curve, 12, 0.016, 16, false);
  }, []);

  return (
    <group renderOrder={10}>
      <mesh geometry={beamGeo} renderOrder={10}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      <mesh geometry={glowGeo} renderOrder={10}>
        <meshBasicMaterial color={colorHex} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Digital Benchtop Power Supply & Voltage Controller Unit
// ─────────────────────────────────────────────────────────────────────────────
function VoltageBiasUnit({
  voltageV,
  targetDisplay,
  isAligned,
  isWavelengthMode,
}: {
  voltageV: number;
  targetDisplay: string;
  isAligned: boolean;
  isWavelengthMode: boolean;
}) {
  const chassisX = 0.58;

  return (
    <group position={[chassisX, 0.04, 0]} rotation={[0, -Math.PI / 10, 0]}>
      {/* Heavy Benchtop Rail Clamp Base (Squarely supports chassis) */}
      <mesh castShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[0.20, 0.03, 0.18]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Main Benchtop Power Supply Housing */}
      <group position={[0, 0.10, 0]}>
        {/* Powder-Coated Metal Chassis */}
        <mesh castShadow>
          <boxGeometry args={[0.18, 0.16, 0.16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.6} />
        </mesh>

        {/* Front Anodized Control Fascia (Z = +0.081) */}
        <mesh position={[0, 0, 0.081]}>
          <planeGeometry args={[0.17, 0.15]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>

        {/* Brand Header Plate */}
        <mesh position={[0, 0.055, 0.082]}>
          <planeGeometry args={[0.15, 0.02]} />
          <meshStandardMaterial color="#334155" />
        </mesh>

        {/* Digital 7-Segment LED Voltmeter Window */}
        <mesh position={[0, 0.018, 0.082]}>
          <planeGeometry args={[0.12, 0.038]} />
          <meshBasicMaterial color="#020617" />
        </mesh>

        {/* Glowing Amber/Cyan LED Digital Voltmeter Readout */}
        <Html position={[0, 0.018, 0.083]} center distanceFactor={1.9}>
          <div className="font-mono text-[5.2px] font-black text-cyan-400 tracking-wider bg-black/90 px-1.5 py-0.5 rounded border border-cyan-800 shadow-[0_0_8px_rgba(6,182,212,0.4)] whitespace-nowrap select-none pointer-events-none flex flex-col items-center">
            <span>{voltageV.toFixed(2)} V</span>
            {isWavelengthMode && (
              <span className="text-[2.8px] text-cyan-600 font-sans tracking-normal -mt-0.5 font-bold">
                0V BIAS · STAGE 1
              </span>
            )}
          </div>
        </Html>

        {/* Rotary Multi-Turn Potentiometer Knob */}
        <mesh position={[-0.04, -0.04, 0.088]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.014, 24]} />
          <meshStandardMaterial color="#64748b" roughness={0.25} metalness={0.8} />
        </mesh>
        <mesh position={[-0.04, -0.04, 0.096]}>
          <boxGeometry args={[0.003, 0.014, 0.002]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Red Terminal Binding Post (+) */}
        <mesh position={[0.04, -0.038, 0.088]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.015, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Black Terminal Binding Post (-) */}
        <mesh position={[0.04, -0.058, 0.088]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.015, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Power Rocker Switch (Glowing Green) */}
        <mesh position={[0, -0.05, 0.085]}>
          <boxGeometry args={[0.014, 0.016, 0.006]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </group>

      {/* Target Condition Badge (Elevated above instrument) */}
      <Html position={[0, 0.24, 0]} center distanceFactor={1.9}>
        <div
          className={`px-1 py-0.5 rounded-sm text-[3.8px] font-mono font-bold border transition-all shadow-xs whitespace-nowrap select-none pointer-events-none ${
            isAligned
              ? "bg-emerald-50 border-emerald-400 text-emerald-700"
              : "bg-white/95 border-emerald-500 text-emerald-800"
          }`}
        >
          TARGET: {targetDisplay}
        </div>
      </Html>

      {/* Retarding Bias Voltage Badge */}
      <Html position={[0, -0.01, 0]} center distanceFactor={1.9}>
        <div className="bg-white/95 border border-slate-300 text-slate-800 px-1 py-0.5 rounded-sm font-mono text-[3.8px] font-bold shadow-xs whitespace-nowrap select-none pointer-events-none">
          {isWavelengthMode ? "Bias Supply: 0.00 V (0V Bias in Stage 1)" : `Retarding Bias: V = ${voltageV.toFixed(2)} V`}
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5b. Circuit Patch Wires (Rendered in World Coordinates)
// ─────────────────────────────────────────────────────────────────────────────
function CircuitPatchWires() {
  // World coordinates of power supply binding posts:
  // Supply is at [0.58, 0.04, 0], rotated around Y by -pi/10
  // Red post is at local [0.04, 0.062, 0.088] -> world [0.591, 0.102, 0.096]
  // Black post is at local [0.04, 0.042, 0.088] -> world [0.591, 0.082, 0.096]

  const redCableGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.591, 0.102, 0.096), // Power supply red (+) post
      new THREE.Vector3(0.53, 0.045, 0.095),  // Drape down along rail front
      new THREE.Vector3(0.32, 0.042, 0.085),  // Run along bench rail
      new THREE.Vector3(0.12, 0.06, 0.02),    // Rise up to anode clamp
      new THREE.Vector3(0.09, 0.095, 0.0),    // Connect directly into Anode Terminal Rod!
    ]);
    return new THREE.TubeGeometry(curve, 40, 0.0026, 8, false);
  }, []);

  const blackCableGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.591, 0.082, 0.096), // Power supply black (-) post
      new THREE.Vector3(0.51, 0.043, 0.065),  // Drape along central rail channel
      new THREE.Vector3(0.20, 0.042, 0.055),  // Run past center post
      new THREE.Vector3(-0.05, 0.06, 0.02),   // Rise up to cathode clamp
      new THREE.Vector3(-0.09, 0.095, 0.0),   // Connect directly into Cathode Terminal Rod!
    ]);
    return new THREE.TubeGeometry(curve, 48, 0.0026, 8, false);
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* Red Wire (+) to Collector Anode */}
      <mesh geometry={redCableGeo}>
        <meshStandardMaterial color="#ef4444" roughness={0.35} />
      </mesh>
      {/* Black Wire (-) to Cathode Emitter */}
      <mesh geometry={blackCableGeo}>
        <meshStandardMaterial color="#0f172a" roughness={0.35} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Camera Rig
// ─────────────────────────────────────────────────────────────────────────────
function CameraRig() {
  const controlsRef = useRef<any>(null);
  const isMissionStarted = usePhotoelectricStore((s) => s.isMissionStarted);
  const missionStartedAt = usePhotoelectricStore((s) => s.missionStartedAt);
  const currentStage = usePhotoelectricStore((s) => s.currentStage);
  const cameraTrigger = usePhotoelectricStore((s) => s.cameraTrigger);

  // Close-up intro view focusing on the photocell tube
  const targetCamPos = useMemo(() => new THREE.Vector3(0.0, 0.20, 0.70), []);
  const targetCamLook = useMemo(() => new THREE.Vector3(0.0, 0.16, 0.0), []);

  // Overview side-profile perspective matching our unified aesthetic
  const overviewCamPos = useMemo(() => new THREE.Vector3(-0.25, 0.32, 1.25), []);
  const overviewCamLook = useMemo(() => new THREE.Vector3(0.02, 0.16, 0.0), []);

  const holdDuration = 0.8;
  const zoomDuration = 2.2;
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
      target={[0.02, 0.16, 0.0]}
      minDistance={0.4}
      maxDistance={4.5}
      maxPolarAngle={Math.PI / 2 - 0.05}
      enableDamping
      dampingFactor={0.05}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Main Photoelectric Scene Component
// ─────────────────────────────────────────────────────────────────────────────
export function PhotoelectricScene() {
  const currentStage = usePhotoelectricStore((s) => s.currentStage);
  const sliderValue = usePhotoelectricStore((s) => s.sliderValue);
  const getStageConfig = usePhotoelectricStore((s) => s.getStageConfig);
  const getPhysicsState = usePhotoelectricStore((s) => s.getPhysicsState);

  const stage = useMemo(() => getStageConfig(), [getStageConfig, currentStage]);
  const physics = useMemo(() => getPhysicsState(), [getPhysicsState, currentStage, sliderValue]);

  const lightColorHex = useMemo(() => {
    if (stage.fixedColorHex) return stage.fixedColorHex;
    return wavelengthToHex(physics.currentWavelengthNm);
  }, [stage, physics.currentWavelengthNm]);

  return (
    <div className="w-full h-full relative bg-slate-50 select-none">
      <Canvas
        shadows
        camera={{ position: [-0.25, 0.32, 1.25], fov: 45 }}
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

        {/* 1. Precision Optical Bench Table */}
        <OpticalBenchTable />

        {/* 2. Monochromatic Tunable Lamp Source */}
        <MonochromaticLightSource
          wavelengthNm={physics.currentWavelengthNm}
          photonEnergyEv={physics.currentPhotonEnergyEv}
          colorHex={lightColorHex}
        />

        {/* 3. Photocell Vacuum Tube with Photoelectrons */}
        <PhotocellVacuumTube
          targetMetalName={stage.targetMetalName}
          targetMetalSymbol={stage.targetMetalSymbol}
          workFunctionEv={stage.workFunctionEv}
          lightColorHex={lightColorHex}
          currentVoltageV={physics.currentVoltageV}
          stoppingPotentialV={physics.stoppingPotentialV}
          isEmitting={physics.isEmitting}
          photocurrentMicroAmps={physics.photocurrentMicroAmps}
          isAligned={physics.isAligned}
        />

        {/* 4. Collimated Light Beam */}
        <LightBeamCone colorHex={lightColorHex} />

        {/* 5. Voltage Controller & Galvanometer Unit */}
        <VoltageBiasUnit
          voltageV={physics.currentVoltageV}
          targetDisplay={stage.targetDisplay}
          isAligned={physics.isAligned}
          isWavelengthMode={stage.mode === "wavelength"}
        />

        {/* 5b. Circuit Patch Cables Connected Directly to Tube Terminals */}
        <CircuitPatchWires />

        {/* 6. Cinematic Camera Rig */}
        <CameraRig />
      </Canvas>
    </div>
  );
}

export default PhotoelectricScene;
