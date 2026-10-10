"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Line, Html, Grid } from "@react-three/drei";
import { Helicopter, SupplyPackage } from "@/three/kit/physics/Helicopter";
import { Boat } from "@/three/kit/physics/Boat";
import {
  useAirDropInterceptionStore,
  AIR_DROP_ROUNDS,
} from "./AirDropInterceptionStore";
import {
  Compass,
  Navigation,
  Wind,
  Target,
  Eye,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  Package,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Infinite High-Performance 3D River Environment
// ─────────────────────────────────────────────────────────────────────────────
function RiverSceneEnvironment() {
  const heliX = useAirDropInterceptionStore((s) => s.heliPos.x);
  // Modular chunk offset so river, shorelines, and grid follow indefinitely
  const chunkX = Math.floor(heliX / 100) * 100;

  return (
    <group position={[chunkX, 0, 0]}>
      {/* Daylight Sky Background */}
      <color attach="background" args={["#38bdf8"]} />
      <fog attach="fog" args={["#60a5fa", 600, 3500]} />

      {/* Sun Light Source */}
      <directionalLight position={[chunkX + 200, 350, -150]} intensity={1.8} />
      <ambientLight intensity={0.8} />

      {/* Infinite River Water Surface (Z: -250 to +350, spans ±4000m along X) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 50]}>
        <planeGeometry args={[8000, 800]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.2}
          metalness={0.6}
          transparent
          opacity={0.94}
        />
      </mesh>

      {/* North River Shoreline (Green Land Bank) */}
      <mesh position={[0, 1.2, 420]}>
        <boxGeometry args={[8000, 3.5, 180]} />
        <meshStandardMaterial color="#15803d" roughness={0.9} />
      </mesh>

      {/* South River Shoreline (Green Land Bank) */}
      <mesh position={[0, 1.2, -320]}>
        <boxGeometry args={[8000, 3.5, 180]} />
        <meshStandardMaterial color="#166534" roughness={0.9} />
      </mesh>

      {/* High-Performance Coordinate Grid on River Surface */}
      <Grid
        position={[0, 0.05, 50]}
        args={[8000, 600]}
        cellSize={25}
        cellThickness={0.8}
        cellColor="#0369a1"
        sectionSize={100}
        sectionThickness={1.4}
        sectionColor="#38bdf8"
        fadeDistance={1400}
        fadeStrength={1.2}
      />

      {/* Distant Puffy Clouds Following Flight */}
      {[-1200, -600, 0, 600, 1200].map((xOff, i) => (
        <group key={i} position={[xOff, 200, (i % 2 === 0 ? 1 : -1) * 260]}>
          <mesh>
            <sphereGeometry args={[35, 8, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.95} transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Multi-Perspective Camera Rig
// ─────────────────────────────────────────────────────────────────────────────
function AirDropCameraRig({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const cameraMode = useAirDropInterceptionStore((s) => s.cameraMode);
  const heliPos = useAirDropInterceptionStore((s) => s.heliPos);
  const boatPos = useAirDropInterceptionStore((s) => s.boatPos);
  const payloadPos = useAirDropInterceptionStore((s) => s.payloadPos);
  const isPayloadReleased = useAirDropInterceptionStore((s) => s.isPayloadReleased);
  const isPayloadLanded = useAirDropInterceptionStore((s) => s.isPayloadLanded);

  const { camera } = useThree();

  useFrame((_, delta) => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    const dt = Math.min(delta, 0.05);

    if (cameraMode === "bomb-sight") {
      // Tactical Bomb-Sight: Positioned above & behind looking down at water
      camera.position.lerp(
        new THREE.Vector3(heliPos.x - 45, heliPos.y + 35, heliPos.z),
        dt * 4.5
      );
      controls.target.lerp(
        new THREE.Vector3(heliPos.x + 130, 0, heliPos.z - 15),
        dt * 4.5
      );
    } else if (cameraMode === "chase") {
      // Dynamic TPP Chase behind Helicopter or Payload
      if (isPayloadReleased && !isPayloadLanded) {
        camera.position.lerp(
          new THREE.Vector3(payloadPos.x - 30, payloadPos.y + 14, payloadPos.z + 18),
          dt * 5.0
        );
        controls.target.lerp(
          new THREE.Vector3(payloadPos.x + 15, payloadPos.y - 2, payloadPos.z),
          dt * 5.0
        );
      } else {
        camera.position.lerp(
          new THREE.Vector3(heliPos.x - 50, heliPos.y + 16, heliPos.z + 20),
          dt * 4.0
        );
        controls.target.lerp(
          new THREE.Vector3(heliPos.x + 35, heliPos.y, heliPos.z),
          dt * 4.0
        );
      }
    } else if (cameraMode === "boat-deck") {
      // View from the boat deck looking up toward helicopter
      camera.position.lerp(
        new THREE.Vector3(boatPos.x - 8, boatPos.y + 5, boatPos.z - 8),
        dt * 4.0
      );
      controls.target.lerp(
        new THREE.Vector3(heliPos.x, heliPos.y, heliPos.z),
        dt * 4.0
      );
    } else {
      // Tactical 3D Free Orbit
      const midX = (heliPos.x + boatPos.x) / 2;
      const midZ = (heliPos.z + boatPos.z) / 2;
      controls.target.lerp(new THREE.Vector3(midX, 35, midZ), dt * 3.0);
    }

    controls.update();
  });

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Real-Time Bomb-Sight HUD & Vector Overlays
// ─────────────────────────────────────────────────────────────────────────────
function BombSightOverlays() {
  const showVectorHUD = useAirDropInterceptionStore((s) => s.showVectorHUD);
  const showTrajectoryArc = useAirDropInterceptionStore((s) => s.showTrajectoryArc);
  const heliPos = useAirDropInterceptionStore((s) => s.heliPos);
  const heliVelX = useAirDropInterceptionStore((s) => s.heliVelX);
  const heliVelZ = useAirDropInterceptionStore((s) => s.heliVelZ);
  const boatPos = useAirDropInterceptionStore((s) => s.boatPos);
  const predictedImpactPos = useAirDropInterceptionStore((s) => s.predictedImpactPos);
  const targetBoatImpactPos = useAirDropInterceptionStore((s) => s.targetBoatImpactPos);
  const isTargetLocked = useAirDropInterceptionStore((s) => s.isTargetLocked);
  const leadDistanceError = useAirDropInterceptionStore((s) => s.leadDistanceError);
  const isPayloadReleased = useAirDropInterceptionStore((s) => s.isPayloadReleased);
  const isPayloadLanded = useAirDropInterceptionStore((s) => s.isPayloadLanded);
  const currentRound = useAirDropInterceptionStore((s) => s.currentRound);

  const roundCfg = AIR_DROP_ROUNDS[currentRound - 1] || AIR_DROP_ROUNDS[0];

  // Projected Parabolic Trajectory Arc
  const trajectoryPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const tFlight = Math.sqrt((2 * roundCfg.altitude) / roundCfg.gravity);
    const steps = 25;

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * tFlight;
      const x = heliPos.x + heliVelX * t;
      const y = roundCfg.altitude - 0.5 * roundCfg.gravity * t * t;
      const z = heliPos.z + (heliVelZ + roundCfg.crosswind.y) * t;
      pts.push([x, Math.max(0, y), z]);
    }
    return pts;
  }, [heliPos.x, heliPos.z, heliVelX, heliVelZ, roundCfg]);

  return (
    <group>
      {/* ── Real-Time Drop Trajectory Arc ── */}
      {showTrajectoryArc && !isPayloadLanded && (
        <Line
          points={trajectoryPoints}
          color={isTargetLocked ? "#10b981" : "#38bdf8"}
          lineWidth={isTargetLocked ? 4.5 : 3}
          dashed
          dashSize={3}
          gapSize={1.5}
        />
      )}

      {/* ── Projected Bomb-Sight Impact Reticle on Water ── */}
      {!isPayloadLanded && (
        <group position={[predictedImpactPos.x, 0.15, predictedImpactPos.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[3.2, 4.0, 32]} />
            <meshBasicMaterial
              color={isTargetLocked ? "#10b981" : "#f59e0b"}
              transparent
              opacity={0.85}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.6, 16]} />
            <meshBasicMaterial color={isTargetLocked ? "#34d399" : "#fbbf24"} />
          </mesh>

          <Html position={[0, 4.0, 0]} center distanceFactor={40}>
            <div
              className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold whitespace-nowrap shadow-2xl border flex items-center gap-1.5 select-none ${
                isTargetLocked
                  ? "bg-emerald-950/95 border-emerald-400 text-emerald-300 animate-pulse"
                  : "bg-slate-950/90 border-amber-500/60 text-amber-300"
              }`}
            >
              <Crosshair className={`w-3.5 h-3.5 ${isTargetLocked ? "text-emerald-400 animate-spin" : "text-amber-400"}`} />
              <span>
                {isTargetLocked
                  ? "🎯 INTERCEPT LOCKED! PRESS [SPACE]"
                  : `LEAD ERROR: ${leadDistanceError.toFixed(1)}m (STEER TO ALIGN)`}
              </span>
            </div>
          </Html>
        </group>
      )}

      {/* ── Future Target Boat Position Ring on Water ── */}
      {!isPayloadLanded && (
        <group position={[targetBoatImpactPos.x, 0.12, targetBoatImpactPos.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.8, 2.6, 24]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.65} />
          </mesh>
        </group>
      )}

      {/* ── Vector HUD Overlays ── */}
      {showVectorHUD && (
        <group>
          {/* Helicopter Velocity Vector Arrow */}
          <group position={[heliPos.x, heliPos.y, heliPos.z]}>
            <Line
              points={[
                [0, 0, 0],
                [heliVelX * 0.45, 0, heliVelZ * 0.45],
              ]}
              color="#f97316"
              lineWidth={4}
            />
          </group>

          {/* Crosswind Drift Indicator */}
          <group position={[heliPos.x, heliPos.y + 4, heliPos.z]}>
            <Line
              points={[
                [0, 0, 0],
                [0, 0, roundCfg.crosswind.y * 3],
              ]}
              color="#38bdf8"
              lineWidth={3.5}
            />
            <Html position={[0, 0, roundCfg.crosswind.y * 2]} center distanceFactor={35}>
              <div className="px-2 py-0.5 rounded bg-sky-950/90 border border-sky-400 text-sky-200 font-mono text-[9px] font-bold whitespace-nowrap flex items-center gap-1">
                <Wind className="w-3 h-3 text-sky-400" />
                <span>CROSSWIND: {roundCfg.crosswind.y}ĵ m/s</span>
              </div>
            </Html>
          </group>

          {/* Boat Velocity Vector */}
          <group position={[boatPos.x, 0.4, boatPos.z]}>
            <Line
              points={[
                [0, 0, 0],
                [(roundCfg.riverCurrent.x + roundCfg.boatMotorSpeed.x) * 0.7, 0, (roundCfg.riverCurrent.y + roundCfg.boatMotorSpeed.y) * 0.7],
              ]}
              color="#10b981"
              lineWidth={4}
            />
          </group>
        </group>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D Scene Simulation
// ─────────────────────────────────────────────────────────────────────────────
function AirDropSceneSimulation({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const updateTick = useAirDropInterceptionStore((s) => s.updateTick);
  const heliPos = useAirDropInterceptionStore((s) => s.heliPos);
  const heliVelX = useAirDropInterceptionStore((s) => s.heliVelX);
  const heliVelZ = useAirDropInterceptionStore((s) => s.heliVelZ);
  const heliPitch = useAirDropInterceptionStore((s) => s.heliPitch);
  const heliBank = useAirDropInterceptionStore((s) => s.heliBank);
  const heliYaw = useAirDropInterceptionStore((s) => s.heliYaw);
  const boatPos = useAirDropInterceptionStore((s) => s.boatPos);
  const payloadPos = useAirDropInterceptionStore((s) => s.payloadPos);
  const isPayloadReleased = useAirDropInterceptionStore((s) => s.isPayloadReleased);
  const isPayloadLanded = useAirDropInterceptionStore((s) => s.isPayloadLanded);
  const currentRound = useAirDropInterceptionStore((s) => s.currentRound);

  const roundCfg = AIR_DROP_ROUNDS[currentRound - 1] || AIR_DROP_ROUNDS[0];

  useFrame((_, delta) => {
    updateTick(delta);
  });

  return (
    <>
      <RiverSceneEnvironment />
      <AirDropCameraRig controlsRef={controlsRef} />
      <BombSightOverlays />

      {/* ── 3D Rescue Helicopter (User Steered) ── */}
      <group position={[heliPos.x, heliPos.y, heliPos.z]} rotation={[heliBank, heliYaw, heliPitch]}>
        <Helicopter
          scale={2.2}
          color="#ea580c"
          callsign={`RESCUE-01 (${heliVelX.toFixed(0)} m/s)`}
          rotorSpeed={38}
        />
        <Html position={[0, 6.0, 0]} center distanceFactor={35}>
          <div className="px-3 py-1 rounded-full bg-slate-950/95 border border-orange-500 text-[10px] font-mono font-bold text-orange-200 shadow-2xl whitespace-nowrap select-none flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span>
              {Math.abs(heliVelX) < 1 && Math.abs(heliVelZ) < 1
                ? "HOVER READY • USE W/A/S/D TO STEER"
                : `SPEED: ${Math.sqrt(heliVelX * heliVelX + heliVelZ * heliVelZ).toFixed(0)} m/s (v_x=${heliVelX.toFixed(0)})`}
            </span>
          </div>
        </Html>
      </group>

      {/* ── 3D River Boat Target (Moving straight downstream) ── */}
      <group
        position={[boatPos.x, 0.2, boatPos.z]}
        rotation={[
          0,
          Math.atan2(
            roundCfg.riverCurrent.y + roundCfg.boatMotorSpeed.y,
            roundCfg.riverCurrent.x + roundCfg.boatMotorSpeed.x
          ),
          0,
        ]}
      >
        <Boat position={[0, 0, 0]} speed={20} showVectors={false} />

        {/* Landing Deck Bullseye */}
        <group position={[-1.2, 0.65, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1.8, 24]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.5, 16]} />
            <meshBasicMaterial color="#34d399" />
          </mesh>
        </group>

        <Html position={[0, 4.0, 0]} center distanceFactor={30}>
          <div className="px-2.5 py-0.5 rounded-full bg-cyan-950/95 border border-cyan-400 text-[10px] font-mono font-bold text-cyan-200 shadow-xl whitespace-nowrap select-none flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>
              BOAT: ({roundCfg.riverCurrent.x + roundCfg.boatMotorSpeed.x}î m/s)
            </span>
          </div>
        </Html>
      </group>

      {/* ── 3D Supply Cargo Package ── */}
      <group position={[payloadPos.x, payloadPos.y, payloadPos.z]}>
        <SupplyPackage
          isFalling={isPayloadReleased && !isPayloadLanded}
          isLanded={isPayloadLanded}
        />
        {isPayloadReleased && !isPayloadLanded && (
          <Html position={[0, 2.8, 0]} center distanceFactor={25}>
            <div className="px-2 py-0.5 rounded bg-amber-950/95 border border-amber-500 text-amber-200 text-[9px] font-mono font-bold whitespace-nowrap animate-bounce">
              ALT: {payloadPos.y.toFixed(0)}m
            </div>
          </Html>
        )}
      </group>

      {/* Water Splash on Impact */}
      {isPayloadLanded && (
        <group position={[payloadPos.x, 0.15, payloadPos.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 4.2, 32]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
        </group>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Scene Component
// ─────────────────────────────────────────────────────────────────────────────
export function AirDropInterceptionScene({ config }: { config?: any }) {
  const cameraMode = useAirDropInterceptionStore((s) => s.cameraMode);
  const setCameraMode = useAirDropInterceptionStore((s) => s.setCameraMode);
  const showVectorHUD = useAirDropInterceptionStore((s) => s.showVectorHUD);
  const toggleVectorHUD = useAirDropInterceptionStore((s) => s.toggleVectorHUD);
  const showTrajectoryArc = useAirDropInterceptionStore((s) => s.showTrajectoryArc);
  const toggleTrajectoryArc = useAirDropInterceptionStore((s) => s.toggleTrajectoryArc);

  const controlsRef = useRef<any>(null);

  return (
    <div className="relative w-full h-full bg-[#0284c7] overflow-hidden select-none">
      {/* ── Camera Mode & Visualizer Bar (Positioned unobtrusively at bottom-left on md+ screens) ── */}
      <div className="hidden md:flex absolute bottom-20 left-4 z-20 items-center gap-1 sm:gap-1.5 bg-slate-950/85 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-white/10 shadow-xl pointer-events-auto">
        <button
          onClick={() => setCameraMode("bomb-sight")}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 sm:gap-1.5 transition-all ${
            cameraMode === "bomb-sight"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
          title="Tactical Bomb-Sight"
        >
          <Crosshair className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Bomb-Sight</span>
        </button>

        <button
          onClick={() => setCameraMode("chase")}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 sm:gap-1.5 transition-all ${
            cameraMode === "chase"
              ? "bg-orange-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
          title="Helicopter Chase View"
        >
          <Eye className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Heli Chase</span>
        </button>

        <button
          onClick={() => setCameraMode("tactical")}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 sm:gap-1.5 transition-all ${
            cameraMode === "tactical"
              ? "bg-cyan-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
          title="Tactical 3D View"
        >
          <Compass className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Tactical 3D</span>
        </button>

        <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

        <button
          onClick={toggleVectorHUD}
          className={`px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-mono font-bold transition-all ${
            showVectorHUD
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="Toggle Vector Overlay"
        >
          Vectors
        </button>

        <button
          onClick={toggleTrajectoryArc}
          className={`px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-mono font-bold transition-all ${
            showTrajectoryArc
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="Toggle Trajectory Arc"
        >
          Arc
        </button>
      </div>

      <Canvas
        camera={{ position: [-260, 160, 140], fov: 48, near: 0.5, far: 6000 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
      >
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.05}
          minDistance={15}
          maxDistance={900}
          maxPolarAngle={Math.PI / 2.05}
        />
        <AirDropSceneSimulation controlsRef={controlsRef} />
      </Canvas>
    </div>
  );
}
