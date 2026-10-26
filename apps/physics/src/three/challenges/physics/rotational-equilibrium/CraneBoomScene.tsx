"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useCraneBoomStore,
  CRANE_STAGES,
  G_ACCEL,
} from "./CraneBoomStore";

const HINGE_HEIGHT = 3.5; // m above ground

// Ground Testing Pad & Industrial Environment (Light Theme)
function TestingEnvironment() {
  const { width, height } = useThree((s) => s.size);
  const screenScale = Math.min(1.1, Math.max(0.85, Math.min(width / 1000, height / 500)));
  const df = 10.5 * screenScale;

  return (
    <group position={[0, 0, 0]}>
      {/* Main Concrete Testing Pad */}
      <mesh position={[4, -0.05, 0]} receiveShadow>
        <boxGeometry args={[24, 0.1, 14]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Safety Stripe Border Under Crane Base */}
      <mesh position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[3.6, 3.6]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
      </mesh>

      {/* Grid Floor Lines */}
      <gridHelper args={[24, 24, "#94a3b8", "#cbd5e1"]} position={[4, 0.01, 0]} />

      {/* Distance Ruler Along Ground (x = 0m to 10m) */}
      {Array.from({ length: 11 }).map((_, i) => (
        <group key={i} position={[i, 0.02, 1.8]}>
          <mesh>
            <boxGeometry args={[0.04, 0.01, 0.3]} />
            <meshBasicMaterial color="#64748b" />
          </mesh>
          <Html position={[0, 0.06, 0.25]} center distanceFactor={df} style={{ pointerEvents: "none" }}>
            <span className="text-[10px] font-mono font-bold text-slate-500 select-none block">
              {i}m
            </span>
          </Html>
        </group>
      ))}
    </group>
  );
}

// Vertical Tower Mast
function TowerMast({ mastHeight }: { mastHeight: number }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Heavy Base Plinth */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.3, 1.4]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Four Vertical Corner Columns (Industrial Safety Yellow) */}
      {[-0.45, 0.45].map((x, xi) =>
        [-0.45, 0.45].map((z, zi) => (
          <mesh key={xi + "-" + zi} position={[x, mastHeight / 2 + 0.3, z]} castShadow>
            <boxGeometry args={[0.08, mastHeight, 0.08]} />
            <meshStandardMaterial color="#d97706" metalness={0.5} roughness={0.35} />
          </mesh>
        ))
      )}

      {/* Cross Lattice Braces */}
      {Array.from({ length: Math.floor(mastHeight / 1.0) }).map((_, idx) => {
        const yPos = 0.5 + idx * 1.0;
        return (
          <group key={idx} position={[0, yPos, 0]}>
            <mesh>
              <boxGeometry args={[0.98, 0.04, 0.98]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        );
      })}

      {/* Hinge Bracket Assembly at y = HINGE_HEIGHT */}
      <mesh position={[0.45, HINGE_HEIGHT, 0]} castShadow>
        <boxGeometry args={[0.25, 0.5, 0.35]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Steel Hinge Pin */}
      <mesh position={[0.55, HINGE_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.45, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Hydraulic Safety Bump Stops */}
      <group position={[0.5, HINGE_HEIGHT - 0.5, 0]}>
        <mesh position={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 16]} />
          <meshStandardMaterial color="#dc2626" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// 3D Crane Boom Assembly (Rotates around Hinge)
function BoomAssembly() {
  const currentStage = useCraneBoomStore((s) => s.currentStage);
  const status = useCraneBoomStore((s) => s.status);
  const sliderValue = useCraneBoomStore((s) => s.sliderValue);
  const boomAngle = useCraneBoomStore((s) => s.boomAngle);
  const rTotal = useCraneBoomStore((s) => s.rTotal);
  const updateAnimationStep = useCraneBoomStore((s) => s.updateAnimationStep);

  // Dynamic responsive scaling with guaranteed readability floor
  const { width, height } = useThree((s) => s.size);
  const screenScale = Math.min(1.1, Math.max(0.85, Math.min(width / 1000, height / 500)));
  const df = 11.5 * screenScale;

  const stage = CRANE_STAGES[currentStage - 1];

  // Resolve dynamic vs fixed parameters
  const tensionKN = stage.sliderParam === "tension" ? sliderValue : stage.fixedTension!;
  const collarX = stage.sliderParam === "collar" ? sliderValue : (stage.fixedCableX ?? stage.boomLength);
  const trolleyX = stage.sliderParam === "trolley" ? sliderValue : (stage.fixedPayloadX ?? stage.boomLength);

  // Mast anchor point coordinates
  const thetaRad = (stage.cableAngleDeg * Math.PI) / 180;
  const mastAnchorY = HINGE_HEIGHT + collarX * Math.tan(thetaRad);

  // Physics animation update
  useFrame((_, delta) => {
    updateAnimationStep(Math.min(delta, 0.05));
  });

  const boomRef = useRef<THREE.Group>(null);

  // Calculate dynamic 3D cable position in world space
  const cosA = Math.cos(boomAngle);
  const sinA = Math.sin(boomAngle);
  const collarWorldX = 0.55 + collarX * cosA;
  const collarWorldY = HINGE_HEIGHT + collarX * sinA;

  const cableLength = Math.hypot(collarWorldX - 0.55, collarWorldY - mastAnchorY);
  const cableMidX = (0.55 + collarWorldX) / 2;
  const cableMidY = (mastAnchorY + collarWorldY) / 2;
  const cableAngleZ = Math.atan2(collarWorldY - mastAnchorY, collarWorldX - 0.55);

  const isBalanced = status === "success";
  const cableColor = isBalanced
    ? "#06b6d4" // Glowing cyan at balance
    : status === "fail_sag" || status === "fail_lift"
    ? "#ef4444" // Warning red
    : "#f59e0b"; // Industrial amber while tuning

  return (
    <group position={[0, 0, 0]}>
      {/* Tower Mast Cable Anchor Upper Bracket */}
      <mesh position={[0.45, mastAnchorY, 0]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.3]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.55, mastAnchorY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.35, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* High-Tensile Steel Cable (Dynamic 3D Tube) */}
      <group position={[cableMidX, cableMidY, 0]} rotation={[0, 0, cableAngleZ]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, cableLength, 12]} />
          <meshStandardMaterial
            color={cableColor}
            metalness={0.85}
            roughness={0.2}
            emissive={isBalanced ? "#0891b2" : "#000000"}
            emissiveIntensity={isBalanced ? 0.4 : 0}
          />
        </mesh>
      </group>

      {/* Cable Tension Badge (Floating clearly above the cable line) */}
      <Html
        position={[cableMidX, cableMidY + 0.48, 0]}
        center
        distanceFactor={df}
        style={{ pointerEvents: "none" }}
      >
        <div className="px-2.5 py-0.5 rounded-full bg-white/95 border-2 border-cyan-400 shadow-md text-cyan-950 font-mono text-[11px] font-black whitespace-nowrap block">
          {"T = " + tensionKN.toFixed(2) + " kN"}
        </div>
      </Html>

      {/* Laser Level Line (Green horizontal reference datum at y = HINGE_HEIGHT) */}
      <group position={[0.55, HINGE_HEIGHT, 0]}>
        <mesh position={[stage.boomLength / 2, 0, 0]}>
          <boxGeometry args={[stage.boomLength + 1.5, 0.008, 0.008]} />
          <meshBasicMaterial color={isBalanced ? "#10b981" : "#059669"} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Hinge Reaction Badge (Placed to the left of the mast tower, well separated) */}
      <Html
        position={[-0.75, HINGE_HEIGHT + 0.35, 0]}
        center
        distanceFactor={df}
        style={{ pointerEvents: "none" }}
      >
        <div className="px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-100 font-mono text-[10px] font-bold shadow-md whitespace-nowrap block">
          {"Pivot: " + rTotal.toFixed(1) + " kN"}
        </div>
      </Html>

      {/* ROTATING BOOM ARM GROUP (Pivoting at [0.55, HINGE_HEIGHT, 0]) */}
      <group position={[0.55, HINGE_HEIGHT, 0]} rotation={[0, 0, boomAngle]} ref={boomRef}>
        {/* Main Boom Upper Chord */}
        <mesh position={[stage.boomLength / 2, 0.12, 0]} castShadow receiveShadow>
          <boxGeometry args={[stage.boomLength, 0.06, 0.28]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.65} roughness={0.3} />
        </mesh>

        {/* Main Boom Lower Chord */}
        <mesh position={[stage.boomLength / 2, -0.12, 0]} castShadow receiveShadow>
          <boxGeometry args={[stage.boomLength, 0.06, 0.28]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.65} roughness={0.3} />
        </mesh>

        {/* Boom Side Plate Truss Webbing */}
        {Array.from({ length: Math.floor(stage.boomLength / 0.8) }).map((_, idx) => {
          const bx = 0.4 + idx * 0.8;
          return (
            <mesh key={idx} position={[bx, 0, 0]} castShadow>
              <boxGeometry args={[0.04, 0.24, 0.24]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
            </mesh>
          );
        })}

        {/* Metric Ruler Ticks along Boom */}
        {Array.from({ length: Math.floor(stage.boomLength) + 1 }).map((_, i) => (
          <group key={i} position={[i, 0.16, 0]}>
            <mesh>
              <boxGeometry args={[0.03, 0.02, 0.22]} />
              <meshBasicMaterial color="#475569" />
            </mesh>
          </group>
        ))}

        {/* Boom Center of Mass (acts at L/2) */}
        <group position={[stage.boomLength / 2, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.3} />
          </mesh>
          <Html position={[0, 0.32, 0]} center distanceFactor={df} style={{ pointerEvents: "none" }}>
            <div className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-300 shadow-sm text-sky-900 font-mono text-[10px] font-bold whitespace-nowrap block">
              {"COM: " + stage.boomMass + "kg"}
            </div>
          </Html>
        </group>

        {/* Cable Collar Clamp (at collarX) */}
        <group position={[collarX, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.32, 0.32]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Eyebolt lug */}
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.06, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
          {stage.sliderParam === "collar" && (
            <Html position={[0, -0.34, 0]} center distanceFactor={df} style={{ pointerEvents: "none" }}>
              <div className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-300 text-amber-900 font-mono text-[10px] font-black whitespace-nowrap shadow-sm block">
                {"x_c = " + collarX.toFixed(2) + "m"}
              </div>
            </Html>
          )}
        </group>

        {/* Motorized Trolley & Suspended Cargo (at trolleyX) */}
        <group position={[trolleyX, 0, 0]}>
          {/* Trolley Carriage */}
          <mesh position={[0, -0.16, 0]} castShadow>
            <boxGeometry args={[0.34, 0.08, 0.32]} />
            <meshStandardMaterial color="#d97706" metalness={0.6} roughness={0.3} />
          </mesh>

          {/* Vertical Hoist Cables */}
          {[-0.08, 0.08].map((z, zi) => (
            <mesh key={zi} position={[0, -0.75, z]}>
              <cylinderGeometry args={[0.01, 0.01, 1.1, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
          ))}

          {/* Cargo Container / Generator Payload */}
          <group position={[0, -1.6, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.8, 0.65, 0.8]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.4} roughness={0.4} />
            </mesh>
            {/* Corner steel brackets */}
            <mesh>
              <boxGeometry args={[0.82, 0.67, 0.78]} />
              <meshStandardMaterial color="#475569" wireframe />
            </mesh>

            {/* Payload Weight Badge (Clear, bold, high contrast) */}
            <Html position={[0, 0, 0.48]} center distanceFactor={df} style={{ pointerEvents: "none" }}>
              <div className="px-2 py-0.5 rounded-full bg-slate-900/95 border border-amber-500/50 text-amber-300 font-mono text-[10.5px] font-black tracking-wide shadow-md whitespace-nowrap block">
                {stage.payloadMass + "kg · " + ((stage.payloadMass * G_ACCEL) / 1000).toFixed(1) + " kN"}
              </div>
            </Html>
          </group>

          {stage.sliderParam === "trolley" && (
            <Html position={[0, 0.32, 0]} center distanceFactor={df} style={{ pointerEvents: "none" }}>
              <div className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-300 text-amber-900 font-mono text-[10px] font-black whitespace-nowrap shadow-sm block">
                {"x_load = " + trolleyX.toFixed(2) + "m"}
              </div>
            </Html>
          )}
        </group>
      </group>
    </group>
  );
}

export function CraneBoomScene() {
  const currentStage = useCraneBoomStore((s) => s.currentStage);
  const stage = CRANE_STAGES[currentStage - 1];

  // Camera focuses on middle of the crane boom
  const cameraTarget = useMemo(() => new THREE.Vector3(stage.boomLength / 2, HINGE_HEIGHT, 0), [stage.boomLength]);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        camera={{ position: [stage.boomLength / 2 + 0.5, HINGE_HEIGHT + 1.2, 8.8], fov: 42 }}
      >
        {/* Light theme clean slate background */}
        <color attach="background" args={["#f1f5f9"]} />
        <fog attach="fog" args={["#f1f5f9", 22, 55]} />

        {/* Studio Lighting */}
        <ambientLight intensity={0.8} color="#ffffff" />
        <directionalLight
          position={[14, 22, 12]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={60}
          shadow-camera-left={-10}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-5}
          shadow-bias={-0.0005}
        />
        <hemisphereLight groundColor="#cbd5e1" color="#ffffff" intensity={0.5} />

        <TestingEnvironment />
        <TowerMast mastHeight={8.5} />
        <BoomAssembly />

        <OrbitControls
          target={cameraTarget}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={4}
          maxDistance={22}
          enablePan={true}
          enableZoom={true}
        />
      </Canvas>
    </div>
  );
}
