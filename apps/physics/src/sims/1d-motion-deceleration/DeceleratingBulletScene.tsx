"use client";

import { useRef, useEffect, useContext, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Html } from "@react-three/drei";
import { SceneLighting } from "@topcoaching/sim-core";
import { challengeAudio } from "@topcoaching/sim-core";
import {
  DeceleratingBulletContext,
  useDeceleratingBulletStore,
} from "./DeceleratingBulletStore";

function BallisticSimulationInner() {
  const store = useContext(DeceleratingBulletContext);
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const bulletRef = useRef<THREE.Group>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);

  // Exact physics analytical trajectory state
  const posX = useRef(-3);
  const velV = useRef(330);
  const timeT = useRef(0);
  const layer1ExitV = useRef<number | null>(null);
  const vtPoints = useRef<Array<{ t: number; x: number; v: number }>>([]);
  const hasCompleted = useRef(false);

  const [bulletX, setBulletX] = useState(-3);
  const [currentSpeed, setCurrentSpeed] = useState(330);
  const [activeLayer, setActiveLayer] = useState(0);

  const currentRound = useDeceleratingBulletStore((s) => s.currentRound);
  const phase = useDeceleratingBulletStore((s) => s.phase);
  const initialVelocity = useDeceleratingBulletStore((s) => s.initialVelocity);
  const layer1Thickness = useDeceleratingBulletStore((s) => s.layer1Thickness);
  const layer1Beta = useDeceleratingBulletStore((s) => s.layer1Beta);
  const layer2Thickness = useDeceleratingBulletStore((s) => s.layer2Thickness);
  const layer2Beta = useDeceleratingBulletStore((s) => s.layer2Beta);
  const targetMinDepth = useDeceleratingBulletStore((s) => s.targetMinDepth);
  const targetMaxDepth = useDeceleratingBulletStore((s) => s.targetMaxDepth);
  const playbackSpeed = useDeceleratingBulletStore((s) => s.playbackSpeed);
  const cameraMode = useDeceleratingBulletStore((s) => s.cameraMode);
  const isSoundEnabled = useDeceleratingBulletStore((s) => s.isSoundEnabled);

  const totalLength = layer1Thickness + layer2Thickness;
  const V_STOP_THRESHOLD = 10.0; // Terminal lodgement threshold (m/s)

  // Calculate exact analytical stopping depth and Layer 1 exit velocity
  const analyticalResults = useMemo(() => {
    const v0 = initialVelocity;
    const v1 = v0 * Math.exp(-layer1Beta * layer1Thickness);

    let stopX: number;
    if (v1 <= V_STOP_THRESHOLD) {
      // Stopped inside Layer 1
      stopX = Math.max(0, (1 / layer1Beta) * Math.log(v0 / V_STOP_THRESHOLD));
    } else {
      // Breached Layer 1, enters Layer 2
      const deltaX2 = (1 / layer2Beta) * Math.log(v1 / V_STOP_THRESHOLD);
      stopX = layer1Thickness + deltaX2;
    }

    return { stopX, exitV1: v1 };
  }, [initialVelocity, layer1Beta, layer1Thickness, layer2Beta]);

  useEffect(() => {
    challengeAudio.setMuted(!isSoundEnabled);
  }, [isSoundEnabled]);

  const setLiveSpeedGetter = useDeceleratingBulletStore((s) => s.setLiveSpeedGetter);
  const setLiveDepthGetter = useDeceleratingBulletStore((s) => s.setLiveDepthGetter);
  const setVtPointsGetter = useDeceleratingBulletStore((s) => s.setVtPointsGetter);

  useEffect(() => {
    setLiveSpeedGetter(() => velV.current);
    setLiveDepthGetter(() => Math.max(0, posX.current));
    setVtPointsGetter(() => vtPoints.current);
  }, [setLiveSpeedGetter, setLiveDepthGetter, setVtPointsGetter]);

  // Reset physics on phase change
  useEffect(() => {
    if (phase === "ready") {
      posX.current = -3;
      velV.current = initialVelocity;
      timeT.current = 0;
      layer1ExitV.current = null;
      vtPoints.current = [];
      hasCompleted.current = false;
      setBulletX(-3);
      setCurrentSpeed(initialVelocity);
      setActiveLayer(0);

      if (controlsRef.current) {
        if (cameraMode === "side") {
          camera.position.set(totalLength * 0.45, 1.5, 15);
          controlsRef.current.target.set(totalLength * 0.45, 0, 0);
        } else if (cameraMode === "fpv") {
          camera.position.set(-5, 0.6, 1.5);
          controlsRef.current.target.set(5, 0, 0);
        } else if (cameraMode === "impact") {
          camera.position.set(totalLength + 4, 1.5, 6);
          controlsRef.current.target.set(totalLength * 0.7, 0, 0);
        }
        controlsRef.current.update();
      }
    }
  }, [phase, initialVelocity, currentRound, cameraMode, camera, totalLength]);

  // Trigger fire audio
  useEffect(() => {
    if (phase === "firing" && !hasCompleted.current) {
      challengeAudio.playLaunch();
    }
  }, [phase]);

  useFrame((_, delta) => {
    if (phase !== "firing" || hasCompleted.current) return;

    const stopX = analyticalResults.stopX;
    const v0 = initialVelocity;
    const v1 = analyticalResults.exitV1;
    const isOverpenetration = stopX >= totalLength;
    const maxBound = isOverpenetration ? totalLength + 1.2 : stopX;

    // Smooth visual travel speed:
    const currentX = posX.current;
    let vExact: number;
    let currentLayer = 0;

    if (currentX < 0) {
      vExact = v0;
      currentLayer = 0;
    } else if (currentX <= layer1Thickness) {
      vExact = Math.max(V_STOP_THRESHOLD, v0 * Math.exp(-layer1Beta * currentX));
      currentLayer = 1;
    } else {
      vExact = Math.max(V_STOP_THRESHOLD, v1 * Math.exp(-layer2Beta * (currentX - layer1Thickness)));
      currentLayer = 2;
    }

    // Normalized progress speed
    const speedRatio = Math.max(0.2, vExact / v0);
    const stepDx = 5.5 * speedRatio * (playbackSpeed ?? 0.25) * 4 * delta;

    posX.current += stepDx;
    timeT.current += delta;
    velV.current = vExact;

    // Track Layer 1 exit velocity event
    if (layer1ExitV.current === null && posX.current >= layer1Thickness) {
      layer1ExitV.current = v1;
      challengeAudio.playBrakeSkid();
    }

    // Record VT curve points
    vtPoints.current.push({
      t: timeT.current,
      x: posX.current,
      v: vExact,
    });

    // Check stopping condition
    if (posX.current >= maxBound) {
      hasCompleted.current = true;
      posX.current = maxBound;
      velV.current = isOverpenetration ? v1 * Math.exp(-layer2Beta * layer2Thickness) : 0;
      challengeAudio.playCrashImpact();
      store?.getState().recordImpactResult(v1, stopX);
    }

    setBulletX(posX.current);
    setCurrentSpeed(velV.current);
    setActiveLayer(currentLayer);

    if (bulletRef.current) {
      bulletRef.current.position.x = posX.current;
    }

    if (shockwaveRef.current) {
      shockwaveRef.current.scale.set(
        1 + Math.sin(timeT.current * 20) * 0.15,
        1 + Math.sin(timeT.current * 20) * 0.15,
        1
      );
    }
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        target={[totalLength * 0.45, 0, 0]}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={60}
      />
      <SceneLighting />

      {/* ── Holographic Ballistic Range Backdrop ── */}
      <mesh position={[totalLength * 0.45, 0, -5]}>
        <planeGeometry args={[totalLength + 20, 14]} />
        <meshBasicMaterial color="#040814" />
      </mesh>
      <gridHelper args={[totalLength + 20, 24, 0x00f0ff, 0x1e293b]} position={[totalLength * 0.45, -3, 0]} />

      {/* ── Layer 1: Ballistic Gel / Kevlar Medium (Cyan) ── */}
      <group position={[0, 0, 0]}>
        <mesh position={[layer1Thickness / 2, 0, 0]}>
          <boxGeometry args={[layer1Thickness, 5, 5]} />
          <meshStandardMaterial
            color="#0284C7"
            roughness={0.15}
            metalness={0.1}
            transparent
            opacity={0.45}
          />
        </mesh>
        <lineSegments position={[layer1Thickness / 2, 0, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(layer1Thickness, 5, 5)]} />
          <lineBasicMaterial color="#38BDF8" linewidth={1.5} />
        </lineSegments>
      </group>

      {/* ── Layer 2: Composite Ceramic Plate (Purple/Indigo) ── */}
      <group position={[layer1Thickness, 0, 0]}>
        <mesh position={[layer2Thickness / 2, 0, 0]}>
          <boxGeometry args={[layer2Thickness, 5, 5]} />
          <meshStandardMaterial
            color="#7C3AED"
            roughness={0.25}
            metalness={0.4}
            transparent
            opacity={0.55}
          />
        </mesh>
        <lineSegments position={[layer2Thickness / 2, 0, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(layer2Thickness, 5, 5)]} />
          <lineBasicMaterial color="#A78BFA" linewidth={1.5} />
        </lineSegments>
      </group>

      {/* ── Target Emerald Sensor Zone in Layer 2 ── */}
      <group position={[targetMinDepth, 0, 0]}>
        <mesh position={[(targetMaxDepth - targetMinDepth) / 2, 0, 0]}>
          <boxGeometry args={[targetMaxDepth - targetMinDepth, 5.2, 5.2]} />
          <meshStandardMaterial
            color="#10B981"
            emissive="#10B981"
            emissiveIntensity={0.6}
            transparent
            opacity={0.35}
          />
        </mesh>
        <lineSegments position={[(targetMaxDepth - targetMinDepth) / 2, 0, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(targetMaxDepth - targetMinDepth, 5.2, 5.2)]} />
          <lineBasicMaterial color="#34D399" linewidth={2} />
        </lineSegments>
      </group>

      {/* ── Caliper Measurement Bar on Top ── */}
      <group position={[0, 3.2, 0]}>
        {/* Layer 1 Caliper */}
        <mesh position={[layer1Thickness / 2, 0, 0]}>
          <boxGeometry args={[layer1Thickness - 0.1, 0.08, 0.08]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
        {/* Layer 2 Caliper */}
        <mesh position={[layer1Thickness + layer2Thickness / 2, 0, 0]}>
          <boxGeometry args={[layer2Thickness - 0.1, 0.08, 0.08]} />
          <meshBasicMaterial color="#A78BFA" />
        </mesh>
      </group>

      {/* ── Hypervelocity Tungsten Sabot Round ── */}
      <group ref={bulletRef} position={[-3, 0, 0]}>
        {/* Bullet Body */}
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 1.2, 16]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Aerodynamic Tip */}
        <mesh position={[0.75, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.18, 0.5, 16]} />
          <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.8} />
        </mesh>

        {/* Supersonic Shockwave Glow */}
        {phase === "firing" && (
          <mesh ref={shockwaveRef} position={[0.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.7, 1.4, 16, 1, true]} />
            <meshBasicMaterial color="#00F0FF" wireframe transparent opacity={0.4} />
          </mesh>
        )}

        {/* Floating Proximity Telemetry Tag */}
        <Html position={[0, 1.6, 0]} center distanceFactor={18} zIndexRange={[100, 0]}>
          <div className="pointer-events-none select-none flex flex-col items-center">
            <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border shadow-xl backdrop-blur-md transition-colors ${
              bulletX >= targetMinDepth && bulletX <= targetMaxDepth
                ? "bg-emerald-500/90 text-white border-emerald-400 shadow-emerald-500/50"
                : bulletX >= totalLength
                ? "bg-rose-500/90 text-white border-rose-400 shadow-rose-500/50"
                : "bg-[#090E1C]/90 text-cyan-300 border-cyan-500/40 shadow-cyan-500/30"
            }`}>
              {bulletX < 0 ? `MUZZLE: ${currentSpeed.toFixed(0)} m/s` : `DEPTH: ${bulletX.toFixed(2)}m (${currentSpeed.toFixed(0)} m/s)`}
            </div>
            <div className="w-1.5 h-1.5 rotate-45 bg-[#090E1C] border-r border-b border-cyan-500/40 -mt-1" />
          </div>
        </Html>
      </group>
    </>
  );
}

export function DeceleratingBulletScene({ config }: { config: any }) {
  return (
    <div className="w-full h-full min-h-[560px] relative bg-[#070D1E]">
      <Suspense fallback={null}>
        <Canvas camera={{ position: [7, 1.5, 15], fov: 45 }}>
          <BallisticSimulationInner />
        </Canvas>
      </Suspense>
    </div>
  );
}
