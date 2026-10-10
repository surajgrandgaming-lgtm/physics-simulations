"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Line, Html } from "@react-three/drei";
import { SceneLighting } from "@/three/core/environment/SceneLighting";
import { JetFighter, DrogueBasket } from "@/three/kit/physics/JetFighter";
import { SkyEnvironment } from "@/three/kit/physics/SkyEnvironment";
import { useGhostDriverStore } from "./GhostDriverStore";
import { Fuel, AlertTriangle, CheckCircle2, Zap } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Dropped Fuel Pipe (From Lead Jet Fuel Boom to Basket)
// ─────────────────────────────────────────────────────────────────────────────
function FuelPipe({
  leadPos,
  pipeEndPos,
  isConnected,
}: {
  leadPos: [number, number, number];
  pipeEndPos: [number, number, number];
  isConnected: boolean;
}) {
  const points = useMemo(() => {
    const p0 = new THREE.Vector3(leadPos[0] - 2.8, leadPos[1] + 0.3, leadPos[2]);
    const midX = (leadPos[0] + pipeEndPos[0]) / 2;
    const midY = pipeEndPos[1] - 0.7;
    const p1 = new THREE.Vector3(midX, midY, pipeEndPos[2]);
    const p2 = new THREE.Vector3(pipeEndPos[0], pipeEndPos[1], pipeEndPos[2]);

    const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
    return curve.getPoints(24).map((p) => [p.x, p.y, p.z] as [number, number, number]);
  }, [leadPos, pipeEndPos]);

  return (
    <group>
      {/* Heavy Flexible Hose */}
      <Line points={points} color={isConnected ? "#10b981" : "#475569"} lineWidth={6} />
      {/* High-Pressure Fuel Flow Glow Stream when locked */}
      {isConnected && (
        <Line points={points} color="#34d399" lineWidth={10} transparent opacity={0.7} />
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic TPP Camera Follow Rig with Mouse Orbit Freedom
// ─────────────────────────────────────────────────────────────────────────────
function DynamicFlightCameraRig({
  controlsRef,
  playerX,
  playerY,
  playerZ,
}: {
  controlsRef: React.RefObject<any>;
  playerX: number;
  playerY: number;
  playerZ: number;
}) {
  const { camera } = useThree();
  const prevPlayerX = useRef(playerX);
  const isInitialized = useRef(false);

  // Initialize camera position once on mount: Behind player jet, framing both jets
  useEffect(() => {
    if (!controlsRef.current || isInitialized.current) return;
    const controls = controlsRef.current;

    // Cinematic TPP chase angle: slightly behind and above our jet, looking forward towards lead jet
    camera.position.set(playerX - 26, playerY + 7.5, playerZ + 12);
    controls.target.set(playerX + 22, playerY + 0.8, playerZ);
    controls.update();

    prevPlayerX.current = playerX;
    isInitialized.current = true;
  }, [playerX, playerY, playerZ, controlsRef, camera]);

  // Smooth TPP follow as player jet moves along X or Y
  useFrame(() => {
    if (!controlsRef.current || !isInitialized.current) return;
    const controls = controlsRef.current;

    const dx = playerX - prevPlayerX.current;
    if (Math.abs(dx) > 0.0001) {
      // Move camera and target together along X so user's orbit angle is preserved
      camera.position.x += dx;
      controls.target.x += dx;
      prevPlayerX.current = playerX;
    }

    // Smoothly follow altitude changes (e.g. during crash)
    controls.target.y = THREE.MathUtils.lerp(controls.target.y, playerY + 0.8, 0.1);
    controls.update();
  });

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main 3D Simulation
// ─────────────────────────────────────────────────────────────────────────────
function FlightScene({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const store = useGhostDriverStore((s) => s);
  const crashProgress = useRef(0);

  useFrame((_, delta) => {
    store.updateTick(delta);
    if (store.isCrashed) {
      // Descend down towards green ground (at Y = -28)
      crashProgress.current = Math.min(41.65, crashProgress.current + delta * 15);
    }
  });

  // Lead Jet position in the sky
  const leadPos: [number, number, number] = [0, 15, 0];
  // Fuel pipe length behind lead jet
  const pipeLength = 20;
  const pipeEndPos: [number, number, number] = [-pipeLength, 14.7, 0];

  // Player jet position:
  // Normal flight altitude Y = 13.65, crash lands down to ground (Y = -28)
  const playerY = store.isCrashed ? 13.65 - crashProgress.current : 13.65;
  const playerRotZ = store.isCrashed ? (playerY > -27 ? -0.45 : 0) : 0;

  // When passing/overshooting the lead jet, give slight lateral clearance to fly past cleanly
  let lateralZ = -0.35;
  if (!store.isConnected && store.pipeDistance < -1.5) {
    const overtakeProgress = Math.min(1, Math.abs(store.pipeDistance + 1.5) / 6.0);
    lateralZ = -0.35 - overtakeProgress * 3.2;
  }

  const playerPos: [number, number, number] = [
    -pipeLength - store.pipeDistance - 3.8,
    playerY,
    lateralZ,
  ];

  return (
    <group>
      {/* ── Reusable Modular Sky & Scrolling Ground Environment ── */}
      <SkyEnvironment
        speed={store.isRunning ? store.tankerSpeed : 0}
        skyColor="#38bdf8"
        fogColor="#60a5fa"
        groundHeight={-28}
        groundType="green"
      />

      {/* ── Dynamic TPP Camera Follow Rig ── */}
      <DynamicFlightCameraRig
        controlsRef={controlsRef}
        playerX={playerPos[0]}
        playerY={playerPos[1]}
        playerZ={playerPos[2]}
      />

      {/* ── Lead Jet ── */}
      <JetFighter
        position={leadPos}
        speed={store.tankerSpeed}
        variant="tanker"
        callsign="LEAD JET (100 m/s)"
        hasProbe={false}
      />

      {/* ── Dropped Fuel Pipe ── */}
      <FuelPipe
        leadPos={leadPos}
        pipeEndPos={pipeEndPos}
        isConnected={store.isConnected}
      />

      {/* ── Trailing Fuel Basket ── */}
      <DrogueBasket
        position={pipeEndPos}
        isDocked={store.isConnected}
        relativeSpeed={store.relativeSpeed}
      />

      {/* ── Player Jet ── */}
      <group position={playerPos} rotation={[0, 0, playerRotZ]}>
        <JetFighter
          position={[0, 0, 0]}
          speed={store.playerSpeed}
          variant="player"
          isDocked={store.isConnected}
          callsign="YOUR JET"
          hasProbe={true}
        />
        {/* Crash Fire & Smoke */}
        {store.isCrashed && (
          <group position={[-4, 0, 0]}>
            <mesh>
              <sphereGeometry args={[1.8, 8, 8]} />
              <meshBasicMaterial color="#1e293b" transparent opacity={0.8} />
            </mesh>
            <mesh position={[-1, 0, 0]}>
              <sphereGeometry args={[1.3, 8, 8]} />
              <meshBasicMaterial color="#ef4444" transparent opacity={0.65} />
            </mesh>
          </group>
        )}
      </group>

      {/* ── Relative Velocity Vector Overlay ── */}
      {store.isRunning && Math.abs(store.relativeSpeed) > 0.5 && !store.isCrashed && !store.isConnected && (
        <group position={[-pipeLength - store.pipeDistance, 16.5, 0]}>
          <Line
            points={[
              [0, 0, 0],
              [store.relativeSpeed > 0 ? 3.5 : -3.5, 0, 0],
            ]}
            color={store.relativeSpeed > 0 ? "#10b981" : "#f43f5e"}
            lineWidth={4}
          />
          <Html center distanceFactor={60}>
            <div
              className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-mono font-bold whitespace-nowrap shadow-md border pointer-events-none ${
                store.relativeSpeed > 0
                  ? "bg-emerald-950/90 text-emerald-300 border-emerald-500"
                  : "bg-rose-950/90 text-rose-300 border-rose-500"
              }`}
            >
              v_rel = {store.relativeSpeed > 0 ? `+${store.relativeSpeed.toFixed(0)}` : store.relativeSpeed.toFixed(0)} m/s
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Component
// ─────────────────────────────────────────────────────────────────────────────
export function GhostDriverScene({ config }: { config?: any }) {
  const fuel = useGhostDriverStore((s) => s.fuel);
  const isConnected = useGhostDriverStore((s) => s.isConnected);
  const connectedSeconds = useGhostDriverStore((s) => s.connectedSeconds);
  const isWon = useGhostDriverStore((s) => s.isWon);
  const isCrashed = useGhostDriverStore((s) => s.isCrashed);
  const resetFlight = useGhostDriverStore((s) => s.resetFlight);

  const controlsRef = useRef<any>(null);

  return (
    <div className="relative w-full h-full bg-[#38bdf8] overflow-hidden select-none font-sans">
      <Canvas
        shadows
        camera={{ position: [-80, 22, 12], fov: 45, near: 0.5, far: 900 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <SceneLighting />
        <ambientLight intensity={0.8} />
        <directionalLight position={[100, 140, -50]} intensity={2.0} castShadow />

        {/* Orbit Controls (Full mouse rotation & zoom enabled) */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={140}
          maxPolarAngle={Math.PI / 2 + 0.15}
          minPolarAngle={Math.PI / 12}
        />

        <FlightScene controlsRef={controlsRef} />
      </Canvas>
    </div>
  );
}
