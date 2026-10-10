import { useRef, useEffect, useContext, useState, useMemo, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { ChallengeCanvas } from "@topcoaching/sim-core";
import * as THREE from "three";
import { OrbitControls, Html } from "@react-three/drei";
import { SceneLighting } from "@topcoaching/sim-core";
import { GroundPlane } from "@topcoaching/sim-core";
import { Car } from "@/sims/kit/Car";
import { RoadTrack } from "@/sims/kit/RoadTrack";
import { Wall } from "@/sims/kit/Wall";
import { TargetZoneMarker } from "@/sims/kit/TargetZoneMarker";
import { challengeAudio } from "@topcoaching/sim-core";
import {
  EmergencyStopContext,
  useEmergencyStopStore,
  type SurfaceType,
} from "./EmergencyStopStore";

interface InnerSceneProps {
  initialSpeed?: number;
  intersectionPosition?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Weather FX: Rain (Wet) & Snow/Frost (Ice)
// ─────────────────────────────────────────────────────────────────────────────
function WeatherParticles({ surface }: { surface: SurfaceType }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = surface === "wet" ? 800 : surface === "ice" ? 450 : 0;

  const [positions, speeds] = useMemo(() => {
    if (count === 0) return [new Float32Array(0), new Float32Array(0)];
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.2) * 120;
      pos[i * 3 + 1] = Math.random() * 25 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      spd[i] = surface === "wet" ? 22 + Math.random() * 12 : 2.5 + Math.random() * 2.0;
    }
    return [pos, spd];
  }, [count, surface]);

  useFrame((_, delta) => {
    if (!pointsRef.current || count === 0) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] -= speeds[i] * delta;
      if (surface === "ice") {
        array[i * 3] += Math.sin(array[i * 3 + 1] * 0.4) * 0.04;
      }
      if (array[i * 3 + 1] < 0) {
        array[i * 3 + 1] = 25;
      }
    }
    posAttr.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={surface === "wet" ? "#60A5FA" : "#E0F2FE"}
        size={surface === "wet" ? 0.08 : 0.14}
        transparent
        opacity={surface === "wet" ? 0.75 : 0.85}
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Holographic Road Target Zones & Distance Markings
// ─────────────────────────────────────────────────────────────────────────────
function RoadTargetZones() {
  const distanceMarks = [10, 20, 30, 40, 50];

  return (
    <group position={[0, 0.012, 0]}>
      {/* 3-Star Bullseye Zone: 55m to 59.8m */}
      <mesh position={[57.4, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.8, 6.2]} />
        <meshBasicMaterial color="#10B981" transparent opacity={0.3} />
      </mesh>

      {/* 2-Star Safe Zone: 45m to 55m */}
      <mesh position={[50, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 6.2]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.12} />
      </mesh>

      {/* Distance Marks across track */}
      {distanceMarks.map((dist) => (
        <group key={dist} position={[dist, 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.2, 5.8]} />
            <meshBasicMaterial color="#00F0FF" transparent opacity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Skid Marks on Road
// ─────────────────────────────────────────────────────────────────────────────
function SkidMarks({
  startX,
  currentX,
  active,
  width = 1.2,
}: {
  startX: number;
  currentX: number;
  active: boolean;
  width?: number;
}) {
  if (!active || currentX <= startX) return null;
  const len = currentX - startX;
  return (
    <group position={[startX + len / 2, 0.015, 0]}>
      <mesh position={[0, 0, width / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[len, 0.22]} />
        <meshBasicMaterial color="#05070c" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0, -width / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[len, 0.22]} />
        <meshBasicMaterial color="#05070c" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Neon Runway Distance Pylons
// ─────────────────────────────────────────────────────────────────────────────
function RunwayPylons({ maxDist = 80, step = 10 }: { maxDist?: number; step?: number }) {
  const markers = [];
  for (let x = 0; x <= maxDist; x += step) {
    markers.push(x);
  }

  return (
    <group>
      {markers.map((dist) => (
        <group key={dist} position={[dist, 0, 0]}>
          <mesh position={[0, 0.6, 3.6]}>
            <cylinderGeometry args={[0.06, 0.08, 1.2, 12]} />
            <meshStandardMaterial color="#1a202c" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.25, 3.6]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial color={dist === 60 ? "#00f0ff" : dist >= 50 ? "#10b981" : "#7b2cbf"} />
          </mesh>

          <mesh position={[0, 0.6, -3.6]}>
            <cylinderGeometry args={[0.06, 0.08, 1.2, 12]} />
            <meshStandardMaterial color="#1a202c" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.25, -3.6]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial color={dist === 60 ? "#00f0ff" : dist >= 50 ? "#10b981" : "#7b2cbf"} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Neon Braking Marker Gate (Interactive in 3D)
// ─────────────────────────────────────────────────────────────────────────────
function BrakeMarkerGate({ positionX }: { positionX: number }) {
  return (
    <group position={[positionX, 0, 0]}>
      {/* Left Laser Post */}
      <mesh position={[0, 0.9, 3.4]}>
        <cylinderGeometry args={[0.08, 0.12, 1.8, 16]} />
        <meshStandardMaterial color="#FF5722" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.85, 3.4]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#FF9100" />
      </mesh>

      {/* Right Laser Post */}
      <mesh position={[0, 0.9, -3.4]}>
        <cylinderGeometry args={[0.08, 0.12, 1.8, 16]} />
        <meshStandardMaterial color="#FF5722" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.85, -3.4]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#FF9100" />
      </mesh>

      {/* Translucent Laser Beam across track */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 6.6]} />
        <meshBasicMaterial color="#FF9100" transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

function EmergencyStopInner({
  intersectionPosition = 60,
}: InnerSceneProps) {
  const store = useContext(EmergencyStopContext);
  const controlsRef = useRef<any>(null);
  const posX = useRef(0);
  const velX = useRef(15);
  const isBraking = useRef(false);
  const hasStopped = useRef(false);
  const brakeStartPos = useRef<number | null>(null);
  const runTimeRef = useRef(0);

  const roadSurface = useEmergencyStopStore((s) => s.roadSurface);
  const currentRound = useEmergencyStopStore((s) => s.currentRound);
  const initialSpeed = useEmergencyStopStore((s) => s.initialSpeed);
  const brakeMarkerX = useEmergencyStopStore((s) => s.brakeMarkerX);
  const isRunning = useEmergencyStopStore((s) => s.isRunning);
  const status = useEmergencyStopStore((s) => s.status);
  const cameraMode = useEmergencyStopStore((s) => s.cameraMode);
  const isSoundEnabled = useEmergencyStopStore((s) => s.isSoundEnabled);
  const addVtPoint = useEmergencyStopStore((s) => s.addVtPoint);
  const setLiveSpeedGetter = useEmergencyStopStore((s) => s.setLiveSpeedGetter);
  const setLiveCarPosGetter = useEmergencyStopStore((s) => s.setLiveCarPosGetter);

  const [carSpeed, setCarSpeed] = useState(initialSpeed);
  const [carPos, setCarPos] = useState(0);
  const [brakingActive, setBrakingActive] = useState(false);

  const wallPosition = intersectionPosition + 15;

  const frictionMap: Record<SurfaceType, number> = {
    dry: 0.8,
    wet: 0.4,
    ice: 0.1,
  };

  useEffect(() => {
    challengeAudio.setMuted(!isSoundEnabled);
  }, [isSoundEnabled]);

  useEffect(() => {
    setLiveSpeedGetter(() => velX.current);
    setLiveCarPosGetter(() => posX.current);
  }, [setLiveSpeedGetter, setLiveCarPosGetter]);

  // Reset internal state when round, initial speed, or status changes back to idle
  useEffect(() => {
    if (!isRunning && status === "idle") {
      posX.current = 0;
      velX.current = initialSpeed;
      isBraking.current = false;
      hasStopped.current = false;
      brakeStartPos.current = null;
      runTimeRef.current = 0;
      setCarPos(0);
      setCarSpeed(initialSpeed);
      setBrakingActive(false);
      if (controlsRef.current && cameraMode === "orbit") {
        controlsRef.current.target.set(15, 1, 0);
        controlsRef.current.update();
      }
    }
  }, [currentRound, initialSpeed, isRunning, status, cameraMode]);

  // Handle simulation start
  useEffect(() => {
    if (isRunning) {
      posX.current = 0;
      velX.current = initialSpeed;
      isBraking.current = false;
      hasStopped.current = false;
      brakeStartPos.current = null;
      runTimeRef.current = 0;
      setCarPos(0);
      setCarSpeed(initialSpeed);
      setBrakingActive(false);
      challengeAudio.playLaunch();
    }
  }, [isRunning, initialSpeed]);

  useFrame((state, delta) => {
    if (!isRunning || hasStopped.current) return;

    runTimeRef.current += delta;
    const mu = frictionMap[roadSurface] ?? 0.8;
    const g = 9.81;
    const deceleration = isBraking.current ? mu * g : 0;

    // Check if car reached or crossed the brake marker
    if (!isBraking.current && posX.current >= brakeMarkerX) {
      isBraking.current = true;
      brakeStartPos.current = posX.current;
      setBrakingActive(true);
      challengeAudio.playBrakeSkid();
    }

    if (isBraking.current && velX.current > 0) {
      velX.current = Math.max(0, velX.current - deceleration * delta);
    }

    if (velX.current > 0) {
      posX.current += velX.current * delta;

      if (posX.current >= wallPosition) {
        posX.current = wallPosition;
        velX.current = 0;
        hasStopped.current = true;
        challengeAudio.playCrashImpact();
        store?.getState().recordStop(wallPosition, true);
      }
    } else if (velX.current === 0 && !hasStopped.current && isBraking.current) {
      hasStopped.current = true;
      const hit = posX.current >= intersectionPosition;
      if (hit) {
        challengeAudio.playCrashImpact();
      } else {
        challengeAudio.playSuccessFanfare();
      }
      store?.getState().recordStop(posX.current, hit);
    }

    // Telemetry v-t data logging
    addVtPoint({ t: runTimeRef.current, v: velX.current, x: posX.current });

    setCarPos(posX.current);
    setCarSpeed(velX.current);

    // Dynamic Camera Modes
    if (controlsRef.current) {
      if (cameraMode === "chase") {
        state.camera.position.x = posX.current - 9;
        state.camera.position.y = 3.2;
        state.camera.position.z = 0;
        controlsRef.current.target.set(posX.current + 10, 1.2, 0);
        controlsRef.current.update();
      } else if (cameraMode === "side") {
        state.camera.position.x = posX.current + 5;
        state.camera.position.y = 4.5;
        state.camera.position.z = 18;
        controlsRef.current.target.set(posX.current + 5, 1, 0);
        controlsRef.current.update();
      } else {
        // Orbit mode smoothly follows car
        const targetX = posX.current + 12;
        controlsRef.current.target.x = THREE.MathUtils.lerp(
          controlsRef.current.target.x,
          targetX,
          0.08
        );
        controlsRef.current.update();
      }
    }
  });

  const gapToBarrier = Math.max(0, intersectionPosition - carPos);
  const isCrashed = carPos >= intersectionPosition;

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        target={[15, 1, 0]}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI * 0.49}
        minDistance={2}
        maxDistance={200}
      />
      <SceneLighting />

      {/* Cyberpunk Ground Grid */}
      <GroundPlane position={[40, -0.01, 0]} color="#070D1E" size={[250, 150]} />
      <gridHelper args={[250, 60, 0x00f0ff, 0x16213e]} position={[40, -0.005, 0]} />

      {/* Weather Rain / Snow Particles */}
      <WeatherParticles surface={roadSurface} />

      {/* Road Track */}
      <RoadTrack position={[0, 0, 0]} length={100} surfaceType={roadSurface} />

      {/* Holographic Target Zones on Road */}
      <RoadTargetZones />

      {/* Neon Pylons */}
      <RunwayPylons maxDist={80} step={10} />

      {/* Interactive Neon Brake Marker Gate */}
      <BrakeMarkerGate positionX={brakeMarkerX} />

      {/* Target Intersection Zone (60m) & Collision Wall (75m) */}
      <TargetZoneMarker position={[intersectionPosition, 0, 0]} length={3} color="#4FD1C5" pulse />
      <Wall position={[wallPosition, 0, 0]} width={7} height={3.5} color="#E53E3E" glowColor="#4FD1C5" />

      {/* Live Distance Laser Beam between Car and Barrier */}
      {carPos < intersectionPosition && (
        <group position={[carPos + gapToBarrier / 2, 0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[gapToBarrier, 0.12]} />
            <meshBasicMaterial
              color={gapToBarrier < 8 ? "#4ADE80" : gapToBarrier < 25 ? "#F59E0B" : "#00F0FF"}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      )}

      {/* Skid Marks */}
      {brakeStartPos.current !== null && (
        <SkidMarks
          startX={brakeStartPos.current}
          currentX={carPos}
          active={brakingActive && roadSurface !== "ice"}
          width={1.2}
        />
      )}

      {/* Car Entity */}
      <group position={[carPos, 0, 0]}>
        <Car position={[0, 0, 0]} color="#3182CE" speed={carSpeed} />

        {/* Floating Proximity Tag above Car */}
        <Html position={[0, 2.2, 0]} center distanceFactor={18} zIndexRange={[100, 0]}>
          <div className="pointer-events-none select-none flex flex-col items-center">
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border shadow-lg backdrop-blur-md transition-colors ${
              isCrashed
                ? "bg-rose-500/90 text-white border-rose-400 shadow-rose-500/50"
                : gapToBarrier <= 5
                ? "bg-emerald-500/90 text-white border-emerald-400 shadow-emerald-500/50 animate-bounce"
                : gapToBarrier <= 20
                ? "bg-amber-500/90 text-white border-amber-400 shadow-amber-500/50"
                : "bg-[#090E1C]/90 text-cyan-300 border-cyan-500/40 shadow-cyan-500/30"
            }`}>
              {isCrashed ? "CRASH!" : `GAP: ${gapToBarrier.toFixed(1)}m`}
            </div>
            <div className="w-1.5 h-1.5 rotate-45 bg-[#090E1C] border-r border-b border-cyan-500/40 -mt-1" />
          </div>
        </Html>

        {/* Headlight Cones */}
        <spotLight
          position={[1.4, 0.45, 0.4]}
          target-position={[8, 0, 0.4]}
          angle={0.45}
          penumbra={0.6}
          intensity={carSpeed > 0 ? 3.5 : 1.0}
          color="#EBF8FF"
          castShadow
        />
        <spotLight
          position={[1.4, 0.45, -0.4]}
          target-position={[8, 0, -0.4]}
          angle={0.45}
          penumbra={0.6}
          intensity={carSpeed > 0 ? 3.5 : 1.0}
          color="#EBF8FF"
          castShadow
        />
      </group>
    </>
  );
}

export function EmergencyStopScene({ config }: { config: any }) {
  const params = config?.parameters || {};

  return (
    <div className="w-full h-full min-h-[500px] relative bg-[#070D1E]">
      <Suspense fallback={null}>
        <ChallengeCanvas camera={{ position: [-12, 6, 16], fov: 50 }}>
          <EmergencyStopInner
            initialSpeed={params.initialSpeed ?? 15}
            intersectionPosition={params.intersectionPosition ?? 60}
          />
        </ChallengeCanvas>
      </Suspense>
    </div>
  );
}
