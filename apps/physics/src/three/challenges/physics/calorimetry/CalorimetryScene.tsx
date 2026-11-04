"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useCalorimetryStore, CALORIMETRY_STAGES } from "./CalorimetryStore";

function CameraController({
  controlsRef,
}: {
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const isMissionStarted = useCalorimetryStore((s) => s.isMissionStarted);
  const missionStartedAt = useCalorimetryStore((s) => s.missionStartedAt);
  const cameraResetKey = useCalorimetryStore((s) => s.cameraResetKey);
  const currentStage = useCalorimetryStore((s) => s.currentStage);

  const introFinished = useRef(false);

  // Pre-mission overview and in-mission stage default camera views
  const preMissionPos = useMemo(() => new THREE.Vector3(0, 4.6, 12.5), []);
  const inMissionPos = useMemo(() => {
    if (currentStage === 2) {
      return new THREE.Vector3(2.4, 3.8, 7.2);
    }
    return new THREE.Vector3(0, 3.4, 7.5);
  }, [currentStage]);

  const targetLookAt = useMemo(() => new THREE.Vector3(0, 1.5, 0), []);

  // When stage changes or mission starts/resets, re-enable smooth transition and lock controls temporarily
  React.useEffect(() => {
    introFinished.current = false;
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
      controlsRef.current.target.copy(targetLookAt);
    }
  }, [isMissionStarted, missionStartedAt, cameraResetKey, currentStage, controlsRef, targetLookAt]);

  useFrame(() => {
    if (!isMissionStarted) {
      camera.position.lerp(preMissionPos, 0.08);
      camera.lookAt(targetLookAt);
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
      return;
    }

    // During active mission: glide camera to the stage default position, then give full control to user
    if (!introFinished.current) {
      camera.position.lerp(inMissionPos, 0.08);
      camera.lookAt(targetLookAt);

      if (camera.position.distanceTo(inMissionPos) < 0.08) {
        introFinished.current = true;
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
          controlsRef.current.target.copy(targetLookAt);
        }
      }
    }
  });

  return null;
}

// Laboratory Table & Apparatus
function LabApparatus() {
  return (
    <group position={[0, -0.2, 0]}>
      {/* Workbench top: clean daylight laboratory surface */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[16, 0.2, 10]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.25} metalness={0.08} />
      </mesh>

      {/* Front edge trim */}
      <mesh position={[0, -0.05, 5.01]}>
        <boxGeometry args={[16, 0.1, 0.05]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
      </mesh>

      {/* Heavy retort stand base */}
      <group position={[-2.5, 0, -1.2]}>
        <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.1, 1.4]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Steel vertical support rod */}
        <mesh position={[0, 3.4, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 6.8, 20]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Horizontal clamp arm for thermometer */}
        <mesh position={[1.1, 4.8, 0]}>
          <boxGeometry args={[2.2, 0.08, 0.08]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.35} />
        </mesh>
        {/* Horizontal clamp arm for mechanical stirrer */}
        <mesh position={[1.3, 3.9, 0.4]}>
          <boxGeometry args={[2.6, 0.07, 0.07]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.35} />
        </mesh>
      </group>

      {/* Lab safety mat beneath calorimeter */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <cylinderGeometry args={[2.4, 2.4, 0.02, 36]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
}

// Calorimeter Double-Walled Vacuum Vessel
function CalorimeterVessel() {
  const currentStage = useCalorimetryStore((s) => s.currentStage);
  const isCopper = currentStage === 2;

  return (
    <group position={[0, 1.6, 0]}>
      {/* Outer Insulated Shell */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.9, 1.9, 3.2, 40, 1, true]} />
        <meshPhysicalMaterial
          color={isCopper ? "#b45309" : "#e2e8f0"}
          roughness={isCopper ? 0.35 : 0.15}
          metalness={isCopper ? 0.65 : 0.08}
          transmission={isCopper ? 0 : 0.35}
          opacity={isCopper ? 0.95 : 0.55}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Insulated bottom base */}
      <mesh position={[0, -1.6, 0]} receiveShadow>
        <cylinderGeometry args={[1.9, 1.9, 0.12, 40]} />
        <meshStandardMaterial
          color={isCopper ? "#78350f" : "#64748b"}
          roughness={0.4}
          metalness={0.5}
        />
      </mesh>

      {/* Inner Borosilicate glass or copper liner */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.65, 1.65, 3.0, 40, 1, true]} />
        <meshPhysicalMaterial
          color={isCopper ? "#d97706" : "#bae6fd"}
          transmission={isCopper ? 0 : 0.85}
          roughness={0.1}
          metalness={isCopper ? 0.75 : 0.05}
          ior={1.47}
          transparent
          opacity={isCopper ? 0.9 : 0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner base */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[1.65, 1.65, 0.08, 40]} />
        <meshStandardMaterial
          color={isCopper ? "#92400e" : "#0284c7"}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {/* Polished metallic rim collar around calorimeter lip */}
      <mesh position={[0, 1.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.78, 0.06, 16, 48]} />
        <meshStandardMaterial
          color={isCopper ? "#b45309" : "#cbd5e1"}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>

      {/* Vessel Label badge */}
      <Html position={[0, -1.2, 1.95]} transform distanceFactor={5.5}>
        <div className="bg-slate-900/90 border border-slate-700 text-slate-200 font-mono text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap font-semibold">
          {isCopper ? "Copper Calorimeter (100g, W=10g)" : "Vacuum Dewared Vessel"}
        </div>
      </Html>
    </group>
  );
}

// Dynamic Liquid Volume inside Vessel
function LiquidVolume() {
  const currentWaterTemp = useCalorimetryStore((s) => s.currentWaterTemp);
  const waterLevelOffset = useCalorimetryStore((s) => s.waterLevelOffset);
  const currentStage = useCalorimetryStore((s) => s.currentStage);

  // Dynamic color interpolation
  const liquidColor = useMemo(() => {
    // 0°C -> Sky cyan (#38bdf8), 50°C -> Sky blue / amber, 100°C -> Warm boiling orange (#f97316)
    const norm = THREE.MathUtils.clamp(currentWaterTemp / 100.0, 0, 1);
    const coldCol = new THREE.Color("#38bdf8");
    const hotCol = new THREE.Color("#f97316");
    return coldCol.lerp(hotCol, norm);
  }, [currentWaterTemp]);

  const baseHeight = currentStage === 3 ? 1.8 : 2.0;
  const currentHeight = baseHeight + waterLevelOffset;
  const liquidY = 0.1 + currentHeight / 2.0;

  return (
    <group position={[0, liquidY, 0]}>
      {/* Liquid cylinder */}
      <mesh>
        <cylinderGeometry args={[1.6, 1.6, currentHeight, 36]} />
        <meshPhysicalMaterial
          color={liquidColor}
          transmission={0.86}
          roughness={0.1}
          ior={1.33}
          transparent
          opacity={0.82}
        />
      </mesh>

      {/* Meniscus surface */}
      <mesh position={[0, currentHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.59, 36]} />
        <meshStandardMaterial
          color={liquidColor}
          roughness={0.1}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

// Laboratory Thermometer with Capillary Column and Live Digital Readout
function Thermometer() {
  const currentWaterTemp = useCalorimetryStore((s) => s.currentWaterTemp);
  const normalizedTemp = THREE.MathUtils.clamp(currentWaterTemp / 100.0, 0, 1);
  const columnHeight = 0.3 + normalizedTemp * 3.1;

  return (
    <group position={[-0.8, 1.7, 0]}>
      {/* Outer protective clear glass sleeve */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 4.4, 24]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.95}
          roughness={0.05}
          ior={1.5}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Mercury reservoir bulb at bottom */}
      <mesh position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color="#ef4444" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Mercury red capillary column */}
      <mesh position={[0, -0.4 + columnHeight / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, columnHeight, 16]} />
        <meshStandardMaterial color="#ef4444" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Digital readout badge */}
      <group position={[0, 4.2, 0]}>
        <mesh>
          <boxGeometry args={[1.1, 0.5, 0.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
        <Html position={[0, 0, 0.12]} transform distanceFactor={5.5}>
          <div className="bg-slate-900 border border-cyan-400 text-cyan-300 font-mono text-xs px-2 py-0.5 rounded shadow-lg whitespace-nowrap select-none font-bold">
            {currentWaterTemp.toFixed(1)} °C
          </div>
        </Html>
      </group>
    </group>
  );
}

// Mechanical Lab Stirrer
function MechanicalStirrer() {
  const stirrerRotation = useCalorimetryStore((s) => s.stirrerRotation);
  const stirrerRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (stirrerRef.current) {
      stirrerRef.current.rotation.y = stirrerRotation;
    }
  });

  return (
    <group position={[0.7, 1.8, -0.4]}>
      {/* Support shaft extending up */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 3.8, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Rotating impeller blade submerged in water */}
      <group ref={stirrerRef} position={[0, -0.6, 0]}>
        <mesh rotation={[0, 0, 0]}>
          <boxGeometry args={[0.45, 0.12, 0.03]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.45, 0.12, 0.03]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Small top motor head */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.35, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

// Stage 1 & Stage 3: Dynamic Floating & Melting Ice Cubes
function IceCubes() {
  const currentStage = useCalorimetryStore((s) => s.currentStage);
  const iceRemainingGrams = useCalorimetryStore((s) => s.iceRemainingGrams);
  const status = useCalorimetryStore((s) => s.status);
  const waterLevelOffset = useCalorimetryStore((s) => s.waterLevelOffset);

  if (currentStage === 2) return null;

  const totalMax = currentStage === 1 ? 50.0 : 100.0;
  const scale = Math.max(0.001, Math.cbrt(iceRemainingGrams / totalMax));

  if (iceRemainingGrams <= 0.1) return null;

  const yBase = 2.2 + waterLevelOffset;

  return (
    <group position={[0.1, yBase, 0.1]}>
      {/* Cube 1 */}
      <group position={[-0.4, 0, -0.2]} scale={scale}>
        <mesh rotation={[0.2, 0.4, 0.1]}>
          <boxGeometry args={[0.65, 0.65, 0.65]} />
          <meshPhysicalMaterial
            color="#e0f2fe"
            transmission={0.88}
            roughness={0.12}
            ior={1.31}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* Cube 2 */}
      <group position={[0.35, 0.04, 0.3]} scale={scale * 0.9}>
        <mesh rotation={[-0.3, 0.2, 0.5]}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshPhysicalMaterial
            color="#e0f2fe"
            transmission={0.88}
            roughness={0.12}
            ior={1.31}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* Cube 3 */}
      <group position={[0.08, -0.04, -0.45]} scale={scale * 0.85}>
        <mesh rotation={[0.4, -0.3, -0.2]}>
          <boxGeometry args={[0.55, 0.55, 0.55]} />
          <meshPhysicalMaterial
            color="#e0f2fe"
            transmission={0.88}
            roughness={0.12}
            ior={1.31}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* Floating ice mass indicator */}
      <Html position={[0, 0.6 * scale + 0.3, 0]} transform distanceFactor={5.5}>
        <div className="bg-slate-900/90 border border-cyan-400 text-cyan-200 font-mono text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap font-bold">
          Ice: {iceRemainingGrams.toFixed(1)} g
        </div>
      </Html>
    </group>
  );
}

// Stage 2: Heated 200g Metal Sample Lowered on Suspension Wire
function MetalSample() {
  const currentStage = useCalorimetryStore((s) => s.currentStage);
  const status = useCalorimetryStore((s) => s.status);
  const simulationProgress = useCalorimetryStore((s) => s.simulationProgress);
  const substanceTemp = useCalorimetryStore((s) => s.substanceTemp);

  // Metal color: cools from glowing red-hot (100°C) to dark alloy (30°C)
  const coolProgress = THREE.MathUtils.clamp((100.0 - substanceTemp) / 70.0, 0, 1);
  const metalColor = useMemo(() => {
    const hotCol = new THREE.Color("#ea580c"); // hot orange-red
    const coolCol = new THREE.Color("#475569"); // cooled metallic
    return hotCol.lerp(coolCol, coolProgress);
  }, [coolProgress]);

  if (currentStage !== 2) return null;

  // Submerged Y position: lowered smoothly from Y=4.4 to Y=1.1 inside the liquid
  const sampleY = status === "running" || simulationProgress > 0
    ? THREE.MathUtils.lerp(4.4, 1.1, Math.min(1, simulationProgress * 2.2))
    : 4.4;

  return (
    <group position={[0.2, sampleY, 0]}>
      {/* Suspension wire running up */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 5.0, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Heated cylindrical alloy slug */}
      <mesh castShadow>
        <cylinderGeometry args={[0.55, 0.55, 1.2, 32]} />
        <meshStandardMaterial
          color={metalColor}
          metalness={0.85}
          roughness={0.2}
          emissive={coolProgress < 0.85 ? "#f97316" : "#000000"}
          emissiveIntensity={Math.max(0, (1 - coolProgress) * 0.7)}
        />
      </mesh>

      {/* Metal temperature readout badge */}
      <Html position={[0, 0.85, 0]} transform distanceFactor={5.5}>
        <div className="bg-slate-900/95 border border-amber-400 text-amber-300 font-mono text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap font-bold">
          Metal (200g): {substanceTemp.toFixed(1)}°C
        </div>
      </Html>
    </group>
  );
}

// Stage 3: Steam Diffuser Bubbler Wand
function SteamDiffuser() {
  const currentStage = useCalorimetryStore((s) => s.currentStage);
  const status = useCalorimetryStore((s) => s.status);
  const bubbleRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (bubbleRef.current && status === "running") {
      bubbleRef.current.rotation.y += delta * 3.0;
    }
  });

  if (currentStage !== 3) return null;

  return (
    <group position={[0.6, 2.1, 0.2]}>
      {/* Glass delivery tube */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 2.8, 16]} />
        <meshPhysicalMaterial
          color="#f8fafc"
          transmission={0.92}
          roughness={0.1}
          ior={1.48}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Porous bubbler tip submerged */}
      <mesh position={[0, -0.5, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Dynamic steam condensation bubbles during injection */}
      {status === "running" && (
        <group ref={bubbleRef} position={[0, -0.2, 0]}>
          <mesh position={[0.1, 0.2, 0.1]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.75} />
          </mesh>
          <mesh position={[-0.15, 0.45, -0.1]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.65} />
          </mesh>
          <mesh position={[0.08, 0.75, -0.15]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* Steam injector badge */}
      <Html position={[0, 2.7, 0]} transform distanceFactor={5.5}>
        <div className="bg-slate-900/90 border border-sky-400 text-sky-300 font-mono text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap font-bold">
          Steam Jet (100°C, Lv=540)
        </div>
      </Html>
    </group>
  );
}

// Tick runner inside R3F Canvas
function CalorimetrySimulationTicker() {
  const tickSimulation = useCalorimetryStore((s) => s.tickSimulation);

  useFrame((_, delta) => {
    tickSimulation(delta);
  });

  return null;
}

export function CalorimetryScene() {
  const currentStage = useCalorimetryStore((s) => s.currentStage);
  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        camera={{ position: [0, 4.6, 12.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#f1f5f9"]} />

        {/* Studio Lighting */}
        <ambientLight intensity={1.1} />
        <directionalLight
          position={[6, 10, 8]}
          intensity={1.6}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-6, 4, -4]} intensity={0.6} color="#bae6fd" />
        <pointLight position={[4, 6, 4]} intensity={0.5} color="#ffffff" />

        <CameraController controlsRef={controlsRef} />
        <CalorimetrySimulationTicker />

        <group position={[0, 0, 0]}>
          <LabApparatus />
          <CalorimeterVessel />
          <LiquidVolume />
          <Thermometer />
          <MechanicalStirrer />
          {(currentStage === 1 || currentStage === 3) && <IceCubes />}
          {currentStage === 2 && <MetalSample />}
          {currentStage === 3 && <SteamDiffuser />}
        </group>

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          dampingFactor={0.06}
          enableDamping={true}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={3.2}
          maxDistance={18}
          target={[0, 1.5, 0]}
        />
      </Canvas>
    </div>
  );
}

export default CalorimetryScene;
