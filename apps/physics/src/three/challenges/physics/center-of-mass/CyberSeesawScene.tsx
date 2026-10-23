"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useCyberSeesawStore,
  SEESAW_STAGES,
} from "./CyberSeesawStore";

// Metallic & Glassmorphic Fulcrum Pedestal
function FulcrumPedestal() {
  return (
    <group position={[0, 0, 0]}>
      {/* Heavy Base Plinth */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[2.0, 2.4, 0.5, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Hexagonal Stepped Ring */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[1.5, 1.8, 0.2, 6]} />
        <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Triangular Stanchion Spire */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.35, 1.2, 2.2, 4]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Axle Pivot Housing */}
      <mesh position={[0, 2.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 1.6, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Cyan Axle Bearings on sides */}
      {[-0.85, 0.85].map((z, idx) => (
        <mesh key={idx} position={[0, 2.8, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.15, 24]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.6}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Reference Laser Origin Beacon */}
      <mesh position={[0, 2.8, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
    </group>
  );
}

// Retractable Hydraulic Support Jacks
function HydraulicJacks({
  extension,
  leftSpan,
  rightSpan,
}: {
  extension: number;
  leftSpan: number;
  rightSpan: number;
}) {
  const xLeft = -Math.min(5.5, leftSpan * 0.7);
  const xRight = Math.min(5.5, rightSpan * 0.7);

  // Height interpolates between 1.6 (retracted) and 2.55 (fully supporting beam at y=2.8)
  const currentHeight = 1.6 + extension * 0.95;

  return (
    <group>
      {[xLeft, xRight].map((x, idx) => (
        <group key={idx} position={[x, 0, 0]}>
          {/* Base Mount */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.5, 0.6, 0.6, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
          </mesh>

          {/* Fixed Outer Cylinder Sleeve */}
          <mesh position={[0, 1.0, 0]}>
            <cylinderGeometry args={[0.25, 0.28, 1.0, 16]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.25} />
          </mesh>

          {/* Moving Chrome Piston Shaft */}
          <mesh position={[0, currentHeight - 0.5, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 1.0, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Rubber Contact Pad at Top */}
          <mesh position={[0, currentHeight + 0.05, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.12, 16]} />
            <meshStandardMaterial
              color={extension > 0.8 ? "#0284c7" : "#475569"}
              emissive={extension > 0.8 ? "#0284c7" : "#000000"}
              emissiveIntensity={0.25}
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Ground Floor Shock Absorber Bumpers
function EndBumpers({
  leftSpan,
  rightSpan,
}: {
  leftSpan: number;
  rightSpan: number;
}) {
  const xLeft = -leftSpan + 0.5;
  const xRight = rightSpan - 0.5;

  return (
    <group>
      {[xLeft, xRight].map((x, idx) => (
        <group key={idx} position={[x, 0, 0]}>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.45, 0.55, 0.9, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <cylinderGeometry args={[0.35, 0.4, 0.2, 16]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={0.2}
              roughness={0.7}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Glowing Energy Payload Sphere
function PayloadSphere({
  mass,
  color,
  label,
  positionX,
  isTarget = false,
}: {
  mass: number;
  color: string;
  label: string;
  positionX: number;
  isTarget?: boolean;
}) {
  const radius = Math.min(0.68, Math.max(0.38, 0.3 + Math.sqrt(mass) * 0.09));

  return (
    <group position={[positionX, 0.2 + radius, 0]}>
      {/* Magnetic Docking Pedestal Base */}
      <mesh position={[0, -radius + 0.05, 0]}>
        <cylinderGeometry args={[radius * 0.85, radius * 0.95, 0.1, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Luminous Inner Core Sphere */}
      <mesh>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isTarget ? 0.45 : 0.3}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      {/* Holographic Equatorial Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.08, 0.025, 12, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Floating 3D Metric Tag */}
      <Html position={[0, radius + 0.35, 0]} center distanceFactor={22}>
        <div
          className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] tracking-wide shadow-md pointer-events-none select-none whitespace-nowrap border bg-white/95 backdrop-blur-md"
          style={{
            borderColor: color,
            color: color === "#06b6d4" ? "#0891b2" : color === "#f59e0b" ? "#b45309" : "#c2410c",
          }}
        >
          {label} ({positionX >= 0 ? "+" + positionX.toFixed(1) + "m" : positionX.toFixed(1) + "m"})
        </div>
      </Html>
    </group>
  );
}

// Live Holographic Center of Mass Reticle Beacon
function HolographicCOMBeacon({
  xCOM,
  isBalanced,
}: {
  xCOM: number;
  isBalanced: boolean;
}) {
  const beaconColor = isBalanced ? "#10b981" : "#0284c7";

  return (
    <group position={[xCOM, 1.4, 0]}>
      {/* Vertical Laser Projection Guide Down to Beam */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.2, 8]} />
        <meshBasicMaterial color={beaconColor} transparent opacity={0.7} />
      </mesh>

      {/* Floating Target Diamond Reticle */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.3, 0.3, 0.04]} />
        <meshStandardMaterial
          color={beaconColor}
          emissive={beaconColor}
          emissiveIntensity={isBalanced ? 0.8 : 0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Pulsing Concentric Ring for Balanced Centroid */}
      {isBalanced && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.42, 32]} />
          <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Floating Centroid Coordinate Label */}
      <Html position={[0, 0.45, 0]} center distanceFactor={22}>
        <div
          className={
            "px-2.5 py-0.5 rounded-md font-mono font-extrabold text-[10.5px] tracking-wider shadow-lg pointer-events-none select-none whitespace-nowrap border backdrop-blur-md " +
            (isBalanced
              ? "bg-emerald-500 text-white border-emerald-300 animate-pulse"
              : "bg-white/95 text-slate-800 border-blue-400")
          }
        >
          {isBalanced ? "✓ BALANCED (X_cm = 0.0m)" : "X_cm: " + (xCOM >= 0 ? "+" : "") + xCOM.toFixed(2) + "m"}
        </div>
      </Html>
    </group>
  );
}

// The Rotating Balance Beam Assembly
function SeesawBeamAssembly({
  beamAngle,
  stageConfig,
  sliderPosition,
  xCOM,
  isBalanced,
}: {
  beamAngle: number;
  stageConfig: any;
  sliderPosition: number;
  xCOM: number;
  isBalanced: boolean;
}) {
  const { beamLength, leftSpan, rightSpan, fixedMasses, targetMass, plankMass, plankCenterOffset } =
    stageConfig;

  // Beam physical center relative to pivot:
  const beamCenterX = (rightSpan - leftSpan) / 2;

  // Metric tick coordinates (-floor(leftSpan) to +floor(rightSpan))
  const ticks = useMemo(() => {
    const list: number[] = [];
    for (let x = -Math.floor(leftSpan); x <= Math.floor(rightSpan); x += 1) {
      list.push(x);
    }
    return list;
  }, [leftSpan, rightSpan]);

  return (
    // Rotating parent group centered at pivot point (0, 2.8, 0)
    <group position={[0, 2.8, 0]} rotation={[0, 0, -beamAngle]}>
      {/* ── Main Structural Glassmorphic Rail Beam ── */}
      <mesh position={[beamCenterX, 0, 0]}>
        <boxGeometry args={[beamLength, 0.36, 1.2]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Top Running Deck Plate */}
      <mesh position={[beamCenterX, 0.19, 0]}>
        <boxGeometry args={[beamLength - 0.1, 0.04, 1.0]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Blue Center Guide Slot Track */}
      <mesh position={[beamCenterX, 0.212, 0]}>
        <boxGeometry args={[beamLength - 0.2, 0.01, 0.16]} />
        <meshBasicMaterial color="#0284c7" />
      </mesh>

      {/* Centimeter / Meter Metric Graduation Ticks along Beam */}
      {ticks.map((tX) => {
        const isPivot = tX === 0;
        return (
          <group key={tX} position={[tX, 0.215, 0]}>
            <mesh position={[0, 0, 0.42]}>
              <boxGeometry args={[isPivot ? 0.08 : 0.03, 0.015, 0.14]} />
              <meshBasicMaterial color={isPivot ? "#10b981" : "#94a3b8"} />
            </mesh>
            <mesh position={[0, 0, -0.42]}>
              <boxGeometry args={[isPivot ? 0.08 : 0.03, 0.015, 0.14]} />
              <meshBasicMaterial color={isPivot ? "#10b981" : "#94a3b8"} />
            </mesh>
          </group>
        );
      })}

      {/* Stage 3 Special Indicator: Highlight Beam Centroid (plank mass center) */}
      {plankMass > 0 && (
        <group position={[plankCenterOffset, 0.22, 0]}>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.4, 0.1, 0.8]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={0.3}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          <Html position={[0, 0.5, 0]} center distanceFactor={24}>
            <div className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-bold text-[9px] tracking-wider border border-amber-300 shadow-md whitespace-nowrap pointer-events-none select-none">
              {"BEAM CENTROID (" + plankMass + "kg) at " + plankCenterOffset.toFixed(1) + "m"}
            </div>
          </Html>
        </group>
      )}

      {/* Fixed Masses on the Beam */}
      {fixedMasses.map((fm: any) => (
        <PayloadSphere
          key={fm.id}
          mass={fm.mass}
          color={fm.color}
          label={fm.label}
          positionX={fm.position}
        />
      ))}

      {/* Adjustable Counterweight Target Mass */}
      <PayloadSphere
        mass={targetMass.mass}
        color={targetMass.color}
        label={targetMass.label}
        positionX={sliderPosition}
        isTarget={true}
      />

      {/* Live Holographic Center of Mass Marker */}
      <HolographicCOMBeacon xCOM={xCOM} isBalanced={isBalanced} />
    </group>
  );
}

// Full 3D Scene Controller and Environment
function SeesawSceneContent() {
  const currentStage = useCyberSeesawStore((s) => s.currentStage);
  const sliderPosition = useCyberSeesawStore((s) => s.sliderPosition);
  const beamAngle = useCyberSeesawStore((s) => s.beamAngle);
  const xCOM = useCyberSeesawStore((s) => s.xCOM);
  const jackExtension = useCyberSeesawStore((s) => s.jackExtension);
  const tickPhysics = useCyberSeesawStore((s) => s.tickPhysics);

  const stage = SEESAW_STAGES[currentStage - 1];
  const isBalanced = Math.abs(xCOM) <= stage.targetTolerance;

  // Run physics loop inside useFrame
  useFrame((_, delta) => {
    tickPhysics(delta);
  });

  return (
    <>
      {/* Balanced Studio Lighting */}
      <ambientLight intensity={0.55} color="#ffffff" />
      <directionalLight
        position={[15, 25, 20]}
        intensity={0.85}
        color="#fffaf0"
        castShadow
        shadow-mapSize={1024}
      />
      <directionalLight position={[-15, 15, -10]} intensity={0.3} color="#93c5fd" />

      {/* Fixed Reference Horizontal Laser Line across backdrop at pivot height y=2.8 */}
      <mesh position={[0, 2.8, -0.8]}>
        <cylinderGeometry args={[0.015, 0.015, stage.beamLength + 4, 8]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.65} />
      </mesh>

      {/* Central Fulcrum Stand */}
      <FulcrumPedestal />

      {/* Retractable Hydraulic Jacks */}
      <HydraulicJacks
        extension={jackExtension}
        leftSpan={stage.leftSpan}
        rightSpan={stage.rightSpan}
      />

      {/* Floor Shock Absorber Bumpers */}
      <EndBumpers leftSpan={stage.leftSpan} rightSpan={stage.rightSpan} />

      {/* Rotating Beam and Mounted Payloads */}
      <SeesawBeamAssembly
        beamAngle={beamAngle}
        stageConfig={stage}
        sliderPosition={sliderPosition}
        xCOM={xCOM}
        isBalanced={isBalanced}
      />

      {/* High-Tech Lab Floor Grid */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[45, 30]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.85} metalness={0.1} />
      </mesh>
      <gridHelper args={[40, 40, "#94a3b8", "#cbd5e1"]} position={[0, 0.01, 0]} />

      {/* Orbit Controls with Sensible Zoom and Angle Bounds */}
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={8}
        maxDistance={25}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI * 0.48}
        target={[0, 2.4, 0]}
      />
    </>
  );
}

export function CyberSeesawScene({ config }: { config?: any }) {
  return (
    <div className="w-full h-full relative select-none overflow-hidden bg-slate-100">
      <Canvas
        shadows
        camera={{ position: [0, 4.0, 16], fov: 46, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false, powerPreference: "default" }}
      >
        <color attach="background" args={["#f1f5f9"]} />
        <fog attach="fog" args={["#f1f5f9", 25, 75]} />
        <Suspense fallback={null}>
          <SeesawSceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
