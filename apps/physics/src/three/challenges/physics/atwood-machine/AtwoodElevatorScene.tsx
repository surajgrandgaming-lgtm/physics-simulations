"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useAtwoodElevatorStore } from "./AtwoodElevatorStore";

const INITIAL_CAMERA_POS: [number, number, number] = [0, 12, 31];
const INITIAL_TARGET_POS: [number, number, number] = [0, 11.2, 0];
const PULLEY_X = 0;
const PULLEY_Y = 22.5;
const PULLEY_R = 1.6;
const LEFT_X = -PULLEY_R;
const RIGHT_X = PULLEY_R;

// Camera tracker that smoothly frames the elevator and restores on restart
function CameraTracker({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const status = useAtwoodElevatorStore((s) => s.status);
  const resetCount = useAtwoodElevatorStore((s) => s.resetCount);
  const elevatorY = useAtwoodElevatorStore((s) => s.elevatorY);

  const prevResetCount = useRef(resetCount);
  const prevStatus = useRef(status);

  useFrame((state) => {
    const isReset = resetCount !== prevResetCount.current;
    const isIdleRestart = status === "idle" && prevStatus.current !== "idle";
    const aspect = state.size.width / Math.max(1, state.size.height);

    // In landscape mode (aspect > 1.25), back up camera slightly and shift look-at target lower in world space
    // to elevate the bottom landing platform, shock absorbers, and counterweight well above the bottom dock!
    const targetZ = aspect > 1.5 ? 36.5 : aspect > 1.2 ? 34.0 : 31.0;
    const targetCamY = aspect > 1.3 ? 12.0 : 12.0;
    const baseTargetY = aspect > 1.3 ? 9.2 : 10.5;

    if (isReset || isIdleRestart) {
      state.camera.position.set(0, targetCamY, targetZ);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, baseTargetY, 0);
        controlsRef.current.update();
      }
      prevResetCount.current = resetCount;
    } else if (status === "idle") {
      // Gently adjust framing if screen orientation or window size changes
      if (Math.abs(state.camera.position.z - targetZ) > 0.8) {
        state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05);
        if (controlsRef.current) {
          controlsRef.current.target.y = THREE.MathUtils.lerp(controlsRef.current.target.y, baseTargetY, 0.05);
          controlsRef.current.update();
        }
      }
    } else if (status === "moving" || status === "landing_soft" || status === "cargo_shatter") {
      if (controlsRef.current) {
        // Track the elevator as it descends, keeping bottom platform safely visible above bottom controls
        const trackY = Math.max(5.5, elevatorY * 0.55 + 3.8);
        controlsRef.current.target.y = THREE.MathUtils.lerp(controlsRef.current.target.y, trackY, 0.05);
        controlsRef.current.update();
      }
    }

    prevStatus.current = status;
  });

  return null;
}

// Global Physics Tick Runner inside Canvas
function PhysicsLoop() {
  const updatePhysics = useAtwoodElevatorStore((s) => s.updatePhysics);
  useFrame((_, delta) => {
    updatePhysics(delta);
  });
  return null;
}

// Glowing Overhead Pulley Wheel
function OverheadPulley() {
  const pulleyAngle = useAtwoodElevatorStore((s) => s.pulleyAngle);
  const wheelRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (wheelRef.current) {
      wheelRef.current.rotation.z = -pulleyAngle;
    }
  });

  return (
    <group position={[PULLEY_X, PULLEY_Y, 0]}>
      {/* Heavy Gantry Truss Beam */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[6.5, 0.5, 1.4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Pulley Axle Mount Brackets */}
      <mesh position={[0, 0.4, 0.4]}>
        <boxGeometry args={[0.4, 1.2, 0.2]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.4, -0.4]}>
        <boxGeometry args={[0.4, 1.2, 0.2]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Rotating Wheel Assembly */}
      <group ref={wheelRef}>
        {/* Main Pulley Disc */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[PULLEY_R, PULLEY_R, 0.35, 36]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Outer Glowing Neon Rim */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[PULLEY_R, 0.06, 16, 36]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={1.2}
          />
        </mesh>

        {/* Inner Hub */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.42, 24]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* 6 Spokes */}
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <mesh key={deg} rotation={[0, 0, rad]}>
              <boxGeometry args={[PULLEY_R * 1.8, 0.12, 0.22]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// Kinematic Cables (Zero-Lag Guaranteed)
function KinematicCables() {
  const elevatorY = useAtwoodElevatorStore((s) => s.elevatorY);
  const counterweightY = useAtwoodElevatorStore((s) => s.counterweightY);

  const CABIN_TOP_OFFSET = 1.35;
  const COUNTERWEIGHT_TOP_OFFSET = 1.1;

  const leftCableTop = PULLEY_Y;
  const leftCableBottom = elevatorY + CABIN_TOP_OFFSET;
  const leftCableLen = Math.max(0.1, leftCableTop - leftCableBottom);
  const leftCableCenterY = (leftCableTop + leftCableBottom) / 2;

  const rightCableTop = PULLEY_Y;
  const rightCableBottom = counterweightY + COUNTERWEIGHT_TOP_OFFSET;
  const rightCableLen = Math.max(0.1, rightCableTop - rightCableBottom);
  const rightCableCenterY = (rightCableTop + rightCableBottom) / 2;

  return (
    <group>
      {/* Semicircular Cable Wrap over Pulley Top */}
      <mesh position={[PULLEY_X, PULLEY_Y, 0]}>
        <torusGeometry args={[PULLEY_R, 0.04, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Left Vertical Cable (to Elevator) */}
      <mesh position={[LEFT_X, leftCableCenterY, 0]}>
        <cylinderGeometry args={[0.035, 0.035, leftCableLen, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Right Vertical Cable (to Counterweight) */}
      <mesh position={[RIGHT_X, rightCableCenterY, 0]}>
        <cylinderGeometry args={[0.035, 0.035, rightCableLen, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
}

// Glass-Walled Elevator Cabin with Glowing Quantum Cargo
function ElevatorCabin() {
  const elevatorY = useAtwoodElevatorStore((s) => s.elevatorY);
  const status = useAtwoodElevatorStore((s) => s.status);
  const cargoIntegrityPct = useAtwoodElevatorStore((s) => s.cargoIntegrityPct);

  const isShattered = status === "cargo_shatter" || cargoIntegrityPct === 0;
  const isWon = status === "success" || status === "landing_soft";

  return (
    <group position={[LEFT_X, elevatorY, 0]}>
      {/* Roof Frame */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[2.2, 0.25, 2.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} emissive="#0284c7" emissiveIntensity={0.15} />
      </mesh>

      {/* Roof Eyelet Connector */}
      <mesh position={[0, 1.45, 0]}>
        <torusGeometry args={[0.15, 0.035, 12, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Floor Base */}
      <mesh position={[0, -1.25, 0]}>
        <boxGeometry args={[2.2, 0.25, 2.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} emissive="#0284c7" emissiveIntensity={0.15} />
      </mesh>

      {/* 4 Corner Pylons */}
      {[
        [-1.0, 0, -1.0],
        [1.0, 0, -1.0],
        [-1.0, 0, 1.0],
        [1.0, 0, 1.0],
      ].map(([px, py, pz], idx) => (
        <mesh key={idx} position={[px, py, pz]}>
          <boxGeometry args={[0.12, 2.3, 0.12]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Transparent Glass Panels (Standard Material for 100% Stability) */}
      {/* Front & Back */}
      <mesh position={[0, 0, 1.0]}>
        <boxGeometry args={[1.9, 2.25, 0.04]} />
        <meshStandardMaterial
          color="#bae6fd"
          transparent
          opacity={0.35}
          roughness={0.06}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, 0, -1.0]}>
        <boxGeometry args={[1.9, 2.25, 0.04]} />
        <meshStandardMaterial
          color="#bae6fd"
          transparent
          opacity={0.35}
          roughness={0.06}
          metalness={0.1}
        />
      </mesh>
      {/* Left & Right */}
      <mesh position={[-1.0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.9, 2.25, 0.04]} />
        <meshStandardMaterial
          color="#bae6fd"
          transparent
          opacity={0.35}
          roughness={0.06}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[1.0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.9, 2.25, 0.04]} />
        <meshStandardMaterial
          color="#bae6fd"
          transparent
          opacity={0.35}
          roughness={0.06}
          metalness={0.1}
        />
      </mesh>

      {/* Interior Pedestal */}
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.45, 0.55, 0.6, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Glowing Quantum Cargo Core inside Cabin */}
      {!isShattered ? (
        <group position={[0, -0.3, 0]}>
          {/* Outer Glass Containment Cylinder */}
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.65, 24]} />
            <meshStandardMaterial
              color="#e0f2fe"
              transparent
              opacity={0.45}
              roughness={0.1}
            />
          </mesh>

          {/* Glowing Energy Core Crystal */}
          <mesh>
            <octahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial
              color={isWon ? "#10b981" : "#00f0ff"}
              emissive={isWon ? "#10b981" : "#00f0ff"}
              emissiveIntensity={2.5}
            />
          </mesh>
          <pointLight
            color={isWon ? "#10b981" : "#00f0ff"}
            intensity={2.2}
            distance={5}
          />
        </group>
      ) : (
        /* Shattered Crystal Fragments / Warning Hazard Light */
        <group position={[0, -0.7, 0]}>
          <mesh rotation={[0.4, 0.5, 0.2]}>
            <boxGeometry args={[0.15, 0.08, 0.12]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.8} />
          </mesh>
          <mesh position={[0.2, 0.02, 0.1]} rotation={[-0.3, 0.8, -0.4]}>
            <boxGeometry args={[0.12, 0.06, 0.1]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.8} />
          </mesh>
          <mesh position={[-0.18, 0.01, -0.15]} rotation={[0.6, -0.3, 0.5]}>
            <boxGeometry args={[0.1, 0.07, 0.14]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.8} />
          </mesh>
          <pointLight color="#ef4444" intensity={3.0} distance={4} />
        </group>
      )}

      {/* Exterior Illuminated Status Bar */}
      <mesh position={[0, 1.25, 1.12]}>
        <boxGeometry args={[1.4, 0.08, 0.02]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

// Digital Counterweight Rack (m2)
function CounterweightRack() {
  const counterweightY = useAtwoodElevatorStore((s) => s.counterweightY);
  const counterweightMass = useAtwoodElevatorStore((s) => s.counterweightMass);

  const plateCount = Math.min(8, Math.max(2, Math.floor(counterweightMass / 80)));

  return (
    <group position={[RIGHT_X, counterweightY, 0]}>
      {/* Heavy Steel Frame Carrier */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 2.0, 1.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} wireframe />
      </mesh>

      {/* Top Hanger Loop */}
      <mesh position={[0, 1.15, 0]}>
        <torusGeometry args={[0.12, 0.03, 12, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Stacked Mass Plates */}
      {Array.from({ length: plateCount }).map((_, i) => {
        const py = -0.7 + i * 0.2;
        return (
          <mesh key={i} position={[0, py, 0]}>
            <boxGeometry args={[1.3, 0.16, 1.0]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
          </mesh>
        );
      })}

      {/* Digital Illuminated Badge */}
      <mesh position={[0, 0.7, 0.62]}>
        <boxGeometry args={[1.1, 0.25, 0.04]} />
        <meshStandardMaterial color="#020617" roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.7, 0.65]}>
        <boxGeometry args={[0.8, 0.08, 0.02]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

// Dual Hydraulic Shock Absorbers at Bottom Pit
function HydraulicShockAbsorbers() {
  const shockCompression = useAtwoodElevatorStore((s) => s.shockCompression);
  const compressionDist = shockCompression * 0.45;

  return (
    <group position={[LEFT_X, 0, 0]}>
      {[-0.65, 0.65].map((posX, idx) => (
        <group key={idx} position={[posX, 0, 0]}>
          {/* Base Outer Heavy Cylinder */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.18, 0.22, 0.7, 24]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.4} />
          </mesh>

          {/* Chrome Inner Piston (compresses downward) */}
          <mesh position={[0, 0.85 - compressionDist, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.6, 24]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Top Contact Pad */}
          <mesh position={[0, 1.15 - compressionDist, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.08, 24]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Vertical Guide Rails & Shaft Environment
function ShaftStructure() {
  return (
    <group>
      {/* Ground Concrete Landing Platform */}
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[14, 0.5, 8]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} metalness={0.15} />
      </mesh>

      {/* Grid Floor Lines */}
      <gridHelper args={[14, 14, "#0284c7", "#94a3b8"]} position={[0, 0.01, 0]} />

      {/* 4 Structural Shaft Columns */}
      {[
        [-3.6, 11, -2.5],
        [3.6, 11, -2.5],
        [-3.6, 11, 2.5],
        [3.6, 11, 2.5],
      ].map(([cx, cy, cz], idx) => (
        <mesh key={idx} position={[cx, cy, cz]}>
          <boxGeometry args={[0.25, 23, 0.25]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Vertical Elevator Guide Rails */}
      {[-2.7, -0.5].map((rx, idx) => (
        <mesh key={idx} position={[rx, 11, 0]}>
          <boxGeometry args={[0.08, 22.5, 0.08]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Vertical Counterweight Guide Rails */}
      {[0.5, 2.7].map((rx, idx) => (
        <mesh key={idx} position={[rx, 11, 0]}>
          <boxGeometry args={[0.08, 22.5, 0.08]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Rear Architectural Backdrop */}
      <mesh position={[0, 11, -3.2]}>
        <planeGeometry args={[14, 25]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Laser Altitude Height Markers on Shaft Back Wall */}
      {[0, 5, 10, 15, 20].map((h) => (
        <group key={h} position={[-3.2, h + 1.5, -2.3]}>
          <mesh>
            <boxGeometry args={[0.8, 0.06, 0.04]} />
            <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function AtwoodElevatorScene({ config }: { config?: any }) {
  const controlsRef = useRef<any>(null);

  return (
    <div className="relative w-full h-full bg-white select-none">
      <Canvas
        camera={{ position: INITIAL_CAMERA_POS, fov: 48, near: 0.1, far: 1000 }}
        gl={{ antialias: true, powerPreference: "default" }}
      >
        <color attach="background" args={["#ffffff"]} />
        <fog attach="fog" args={["#ffffff", 35, 95]} />

        {/* Pristine White Studio Lighting */}
        <ambientLight intensity={1.25} color="#ffffff" />
        <directionalLight position={[8, 22, 16]} intensity={2.4} color="#ffffff" />
        <directionalLight position={[-8, 14, 12]} intensity={1.0} color="#e2e8f0" />
        <pointLight position={[PULLEY_X, PULLEY_Y + 1, 3]} intensity={2.0} color="#00f0ff" distance={25} />
        <directionalLight position={[0, 12, 18]} intensity={1.1} color="#cbd5e1" />

        {/* 3D Scene Objects */}
        <PhysicsLoop />
        <CameraTracker controlsRef={controlsRef} />
        <ShaftStructure />
        <OverheadPulley />
        <KinematicCables />
        <ElevatorCabin />
        <CounterweightRack />
        <HydraulicShockAbsorbers />

        <OrbitControls
          ref={controlsRef}
          target={INITIAL_TARGET_POS}
          minDistance={10}
          maxDistance={45}
          maxPolarAngle={Math.PI / 2 - 0.05}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}
