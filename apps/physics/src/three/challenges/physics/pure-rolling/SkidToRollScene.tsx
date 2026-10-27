"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useSkidToRollStore,
  SKID_STAGES,
  G_ACCEL,
} from "./SkidToRollStore";

const BALL_RADIUS = 0.11; // 11 cm radius
const LANE_WIDTH = 1.4;   // 1.4 m regulation lane width
const LANE_LENGTH = 14.0; // 14 m length visible

// Modern Bowling Alley Room with Architectural Walls, Wood Trim, and Ceiling Lighting
function BowlingAlleyRoom({ targetDist }: { targetDist: number }) {
  // Dynamic responsive scaling for floating 3D labels across various screen resolutions
  const { width, height } = useThree((s) => s.size);
  const screenScale = Math.min(1.0, Math.max(0.65, Math.min(width / 1100, height / 600)));
  const roomDf = 4.8 * screenScale;
  const targetDf = 5.8 * screenScale;

  const ROOM_X_MIN = -3.5;
  const ROOM_X_MAX = 15.5;
  const ROOM_LENGTH = ROOM_X_MAX - ROOM_X_MIN; // 19m
  const ROOM_CENTER_X = (ROOM_X_MIN + ROOM_X_MAX) / 2; // 6m
  const ROOM_WIDTH = 8.5; // Z: -4.25 to +4.25
  const WALL_HEIGHT = 4.2;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Main Concrete / Terrazzo Room Floor (Light Theme) */}
      <mesh position={[ROOM_CENTER_X, -0.06, 0]} receiveShadow>
        <boxGeometry args={[ROOM_LENGTH + 0.5, 0.1, ROOM_WIDTH + 0.5]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* 2. Raised Side Walkways flanking the bowling lane */}
      {[-2.2, 2.2].map((zWalk, wi) => (
        <group key={wi} position={[ROOM_CENTER_X, 0.015, zWalk]}>
          <mesh receiveShadow>
            <boxGeometry args={[ROOM_LENGTH, 0.05, 2.2]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.65} metalness={0.1} />
          </mesh>
          {/* Subtle Tile Grid on Walkway */}
          <gridHelper
            args={[ROOM_LENGTH, Math.floor(ROOM_LENGTH / 1.5), "#cbd5e1", "#e2e8f0"]}
            position={[0, 0.026, 0]}
          />
        </group>
      ))}

      {/* 3. Back Wall Behind Pins (x = ROOM_X_MAX) with Pinsetter Mask Graphic */}
      <group position={[ROOM_X_MAX, WALL_HEIGHT / 2, 0]}>
        {/* Main Solid Wall */}
        <mesh receiveShadow>
          <boxGeometry args={[0.3, WALL_HEIGHT, ROOM_WIDTH]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        </mesh>
        {/* Dark Pinsetter Housing Recess */}
        <mesh position={[-0.1, -WALL_HEIGHT / 2 + 0.85, 0]}>
          <boxGeometry args={[0.2, 1.7, LANE_WIDTH + 1.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Pinsetter Decorative Accent Bar */}
        <mesh position={[-0.21, -WALL_HEIGHT / 2 + 1.8, 0]}>
          <boxGeometry args={[0.02, 0.12, LANE_WIDTH + 1.0]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.6} />
        </mesh>
        <Html position={[-0.22, -WALL_HEIGHT / 2 + 2.1, 0]} center distanceFactor={roomDf} style={{ pointerEvents: "none" }}>
          <div className="px-2.5 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-sky-400 font-mono text-[9px] font-bold tracking-widest uppercase shadow-xs whitespace-nowrap select-none">
            LANE 04 • TARGET ZONE
          </div>
        </Html>
      </group>

      {/* 4. Front Approach Wall Behind Player (x = ROOM_X_MIN) */}
      <group position={[ROOM_X_MIN, WALL_HEIGHT / 2, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.3, WALL_HEIGHT, ROOM_WIDTH]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.85} />
        </mesh>
        {/* Baseboard Trim */}
        <mesh position={[0.16, -WALL_HEIGHT / 2 + 0.1, 0]}>
          <boxGeometry args={[0.04, 0.2, ROOM_WIDTH]} />
          <meshStandardMaterial color="#64748b" roughness={0.5} />
        </mesh>
      </group>

      {/* 5. Left Acoustic Wood-Slatted Feature Wall (z = -ROOM_WIDTH / 2) */}
      <group position={[ROOM_CENTER_X, WALL_HEIGHT / 2, -ROOM_WIDTH / 2]}>
        {/* Drywall Backing */}
        <mesh receiveShadow>
          <boxGeometry args={[ROOM_LENGTH, WALL_HEIGHT, 0.25]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
        </mesh>
        {/* Modern Acoustic Vertical Wood Battens */}
        {Array.from({ length: 22 }).map((_, bi) => {
          const bx = -ROOM_LENGTH / 2 + 0.5 + bi * 0.85;
          return (
            <mesh key={bi} position={[bx, 0, 0.14]} castShadow>
              <boxGeometry args={[0.12, WALL_HEIGHT * 0.85, 0.04]} />
              <meshStandardMaterial color="#d97706" roughness={0.4} metalness={0.1} />
            </mesh>
          );
        })}
        {/* Soft Ambient Wall Sconce Lighting Bars */}
        {[-4, 1, 6].map((wx, si) => (
          <group key={si} position={[wx, 0.8, 0.18]}>
            <mesh>
              <boxGeometry args={[0.6, 0.06, 0.04]} />
              <meshStandardMaterial color="#ffffff" emissive="#f8fafc" emissiveIntensity={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 6. Right Wall with Observation Glass & Wall Panels (z = +ROOM_WIDTH / 2) */}
      <group position={[ROOM_CENTER_X, WALL_HEIGHT / 2, ROOM_WIDTH / 2]}>
        <mesh receiveShadow>
          <boxGeometry args={[ROOM_LENGTH, WALL_HEIGHT, 0.25]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.85} />
        </mesh>
        {/* Lower Dado Rail Trim */}
        <mesh position={[0, -WALL_HEIGHT / 2 + 1.1, -0.14]}>
          <boxGeometry args={[ROOM_LENGTH, 0.08, 0.04]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>

      {/* 7. Open Architectural Ceiling Trusses & Overhead Track Lights */}
      {Array.from({ length: 6 }).map((_, ci) => {
        const cx = ROOM_X_MIN + 2.5 + ci * 2.8;
        return (
          <group key={ci} position={[cx, WALL_HEIGHT - 0.2, 0]}>
            {/* Horizontal Steel Truss */}
            <mesh castShadow>
              <boxGeometry args={[0.14, 0.14, ROOM_WIDTH - 0.2]} />
              <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Suspended Downward Track Spotlight */}
            <group position={[0, -0.22, 0]}>
              <mesh>
                <cylinderGeometry args={[0.06, 0.08, 0.16, 16]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
              </mesh>
              <mesh position={[0, -0.09, 0]}>
                <circleGeometry args={[0.07, 16]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* 8. Main Wood Bowling Lane Bed */}
      <mesh position={[6, -0.005, 0]} receiveShadow>
        <boxGeometry args={[14, 0.04, LANE_WIDTH]} />
        <meshStandardMaterial
          color="#fde047"
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>

      {/* Synthetic Maple Wood Plank Longitudinal Strips */}
      {[-0.5, -0.25, 0, 0.25, 0.5].map((zPos, idx) => (
        <mesh key={idx} position={[6, 0.016, zPos]}>
          <boxGeometry args={[14, 0.001, 0.015]} />
          <meshBasicMaterial color="#d97706" transparent opacity={0.35} />
        </mesh>
      ))}

      {/* Left and Right Gutters */}
      {[-LANE_WIDTH / 2 - 0.12, LANE_WIDTH / 2 + 0.12].map((zGutter, gi) => (
        <group key={gi} position={[6, -0.02, zGutter]}>
          <mesh receiveShadow>
            <boxGeometry args={[14, 0.05, 0.24]} />
            <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Approach Foul Line (x = 0m) */}
      <mesh position={[0, 0.016, 0]}>
        <boxGeometry args={[0.08, 0.002, LANE_WIDTH]} />
        <meshBasicMaterial color="#dc2626" />
      </mesh>
      <Html position={[0, 0.05, -LANE_WIDTH / 2 - 0.26]} center distanceFactor={roomDf} style={{ pointerEvents: "none" }}>
        <span className="text-[8px] font-mono font-bold text-red-600 select-none whitespace-nowrap block">
          FOUL LINE (x=0)
        </span>
      </Html>

      {/* Distance Ruler Markers along side gutter edge every 1 meter */}
      {Array.from({ length: 12 }).map((_, i) => (
        <group key={i} position={[i, 0.02, LANE_WIDTH / 2 + 0.2]}>
          <mesh>
            <boxGeometry args={[0.04, 0.005, 0.12]} />
            <meshBasicMaterial color="#64748b" />
          </mesh>
          <Html position={[0, 0.03, 0.12]} center distanceFactor={roomDf} style={{ pointerEvents: "none" }}>
            <span className="text-[8px] font-mono font-medium text-slate-400 select-none whitespace-nowrap block">
              {i}m
            </span>
          </Html>
        </group>
      ))}

      {/* Target Transition Laser Gate Line (Holographic Green) */}
      <group position={[targetDist, 0.02, 0]}>
        <mesh>
          <boxGeometry args={[0.06, 0.004, LANE_WIDTH + 0.1]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        {/* Vertical Holographic Goal Beacons */}
        {[-LANE_WIDTH / 2 - 0.06, LANE_WIDTH / 2 + 0.06].map((zPos, bi) => (
          <group key={bi} position={[0, 0.4, zPos]}>
            <mesh>
              <cylinderGeometry args={[0.02, 0.02, 0.8, 16]} />
              <meshStandardMaterial color="#059669" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.42, 0]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial
                color="#34d399"
                emissive="#10b981"
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        ))}
        <Html position={[0, 0.72, 0]} center distanceFactor={targetDf} style={{ pointerEvents: "none" }}>
          <div className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-[9px] font-black tracking-wide shadow-xs whitespace-nowrap block">
            {"TARGET: " + targetDist.toFixed(1) + "m"}
          </div>
        </Html>
      </group>

      {/* 10 Bowling Pins Rack at Lane End (x = 11.5m) */}
      <group position={[11.5, 0, 0]}>
        {[
          { x: 0, z: 0 },
          { x: 0.35, z: -0.15 },
          { x: 0.35, z: 0.15 },
          { x: 0.7, z: -0.3 },
          { x: 0.7, z: 0 },
          { x: 0.7, z: 0.3 },
          { x: 1.05, z: -0.45 },
          { x: 1.05, z: -0.15 },
          { x: 1.05, z: 0.15 },
          { x: 1.05, z: 0.45 },
        ].map((pin, pidx) => (
          <group key={pidx} position={[pin.x, 0.22, pin.z]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.04, 0.06, 0.38, 16]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
            </mesh>
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.043, 0.043, 0.03, 16]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.048, 0.048, 0.03, 16]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// Interactive 3D Bowling Ball with Spin Markings and Kinematic Vectors
function BowlingBallMesh() {
  // Responsive dynamic scaling for floating labels
  const { width, height } = useThree((s) => s.size);
  const screenScale = Math.min(1.0, Math.max(0.65, Math.min(width / 1100, height / 600)));
  const ballDf = 3.2 * screenScale;
  const vectorDf = 3.2 * screenScale;

  const posX = useSkidToRollStore((s) => s.posX);
  const velX = useSkidToRollStore((s) => s.velX);
  const rotAngle = useSkidToRollStore((s) => s.rotAngle);
  const rimVel = useSkidToRollStore((s) => s.rimVel);
  const slipVel = useSkidToRollStore((s) => s.slipVel);
  const frictionForce = useSkidToRollStore((s) => s.frictionForce);
  const status = useSkidToRollStore((s) => s.status);

  const isSkidding = status === "skidding";
  const isPureRolling = status === "pure_rolling" || status === "success";

  const vArrowLength = Math.max(0.18, Math.min(1.8, velX * 0.2));
  const rimArrowLength = Math.max(0.18, Math.min(1.8, rimVel * 0.2));
  const frictionArrowLength = frictionForce > 0 ? 0.6 : 0;

  return (
    <group position={[posX, BALL_RADIUS, 0]}>
      {/* Rotating Ball Sphere Container */}
      <group rotation={[0, 0, -rotAngle]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
          <meshStandardMaterial
            color="#1e3a8a"
            roughness={0.15}
            metalness={0.4}
            envMapIntensity={1.2}
          />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[BALL_RADIUS * 0.99, 0.005, 8, 32]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[BALL_RADIUS * 0.99, 0.005, 8, 32]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* Three Finger Grip Holes */}
        <group position={[0, BALL_RADIUS * 0.85, 0]}>
          <mesh position={[-0.02, 0, -0.015]}>
            <cylinderGeometry args={[0.012, 0.012, 0.04, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          <mesh position={[0.02, 0, -0.015]}>
            <cylinderGeometry args={[0.012, 0.012, 0.04, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.025, 0.02]}>
            <cylinderGeometry args={[0.015, 0.015, 0.04, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* Ground Contact Shadow */}
      <mesh position={[0, -BALL_RADIUS + 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[BALL_RADIUS * 0.85, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* --- REAL-TIME DYNAMIC PHYSICS VECTOR ARROWS --- */}

      {/* 1. Linear COM Velocity Arrow (Forward at Center of Mass) */}
      {velX > 0 && (
        <group position={[0, 0, 0]}>
          <mesh position={[vArrowLength / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.009, 0.009, vArrowLength, 12]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
          <mesh position={[vArrowLength, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.025, 0.06, 16]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
          <Html position={[vArrowLength, 0.05, 0.16]} center distanceFactor={vectorDf} style={{ pointerEvents: "none" }}>
            <span className="px-2 py-0.5 rounded-full bg-sky-950/90 border border-sky-400/40 text-sky-200 font-mono text-[8.5px] font-bold shadow-xs whitespace-nowrap block">
              {"v = " + velX.toFixed(2) + " m/s"}
            </span>
          </Html>
        </group>
      )}

      {/* 2. Rim Tangential Velocity (v_rim = R*w, at Top of Ball) */}
      <group position={[0, BALL_RADIUS, 0]}>
        <mesh position={[rimArrowLength / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.007, 0.007, Math.abs(rimArrowLength), 12]} />
          <meshBasicMaterial color="#8b5cf6" />
        </mesh>
        <mesh position={[rimArrowLength, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.02, 0.05, 16]} />
          <meshBasicMaterial color="#8b5cf6" />
        </mesh>
        <Html position={[rimArrowLength, 0.04, -0.16]} center distanceFactor={vectorDf} style={{ pointerEvents: "none" }}>
          <span className="px-2 py-0.5 rounded-full bg-purple-950/90 border border-purple-400/40 text-purple-200 font-mono text-[8.5px] font-bold shadow-xs whitespace-nowrap block">
            {"Rω = " + rimVel.toFixed(2) + " m/s"}
          </span>
        </Html>
      </group>

      {/* 3. Kinetic Friction Vector fk (at Ground Contact Patch) */}
      {isSkidding && frictionArrowLength > 0 && (
        <group position={[0, -BALL_RADIUS + 0.02, 0]}>
          <mesh position={[-frictionArrowLength / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, frictionArrowLength, 12]} />
            <meshBasicMaterial color="#f97316" />
          </mesh>
          <mesh position={[-frictionArrowLength, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.022, 0.055, 16]} />
            <meshBasicMaterial color="#f97316" />
          </mesh>
          <Html position={[-frictionArrowLength / 2, -0.06, 0]} center distanceFactor={vectorDf} style={{ pointerEvents: "none" }}>
            <span className="px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-400/40 text-amber-300 font-mono text-[8.5px] font-bold shadow-xs whitespace-nowrap block">
              {"fk = " + frictionForce.toFixed(1) + " N"}
            </span>
          </Html>
        </group>
      )}

      {/* Phase Status Floating Badge (Only shown while skidding or pure rolling; READY TO LAUNCH removed) */}
      {(isSkidding || isPureRolling) && (
        <Html position={[0, BALL_RADIUS + 0.25, 0]} center distanceFactor={ballDf} style={{ pointerEvents: "none" }}>
          {isSkidding ? (
            <div className="px-2 py-0.5 rounded-full bg-amber-500/95 text-amber-950 border border-amber-300 font-mono text-[8.5px] font-black tracking-wider uppercase shadow-xs flex items-center gap-1 whitespace-nowrap block animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
              <span>{"SKIDDING · v_slip: " + slipVel.toFixed(2) + " m/s"}</span>
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded-full bg-emerald-500/95 text-white border border-emerald-300 font-mono text-[8.5px] font-black tracking-wider uppercase shadow-xs flex items-center gap-1 whitespace-nowrap block">
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-ping" />
              <span>{"PURE ROLLING · v = " + velX.toFixed(2) + " m/s"}</span>
            </div>
          )}
        </Html>
      )}
    </group>
  );
}

// Camera Director: Swoop from Target to Behind the Ball when PLAY button is clicked
function CameraController({
  controlsRef,
  targetDist,
}: {
  controlsRef: React.RefObject<any>;
  targetDist: number;
}) {
  const { camera } = useThree();
  const posX = useSkidToRollStore((s) => s.posX);
  const isMissionStarted = useSkidToRollStore((s) => s.isMissionStarted);
  const missionStartedAt = useSkidToRollStore((s) => s.missionStartedAt);
  const status = useSkidToRollStore((s) => s.status);

  // Target Focus Overview (Points at the target lock line at x = targetDist)
  const targetCamPos = useMemo(
    () => new THREE.Vector3(targetDist + 1.8, 1.6, 2.8),
    [targetDist]
  );
  const targetLookAt = useMemo(
    () => new THREE.Vector3(targetDist, 0.4, 0),
    [targetDist]
  );

  // Transition durations: Hold 1.5s on target after clicking PLAY/RETRY, then 2.2s cinematic swoop back
  const holdDuration = 1.5;
  const travelDuration = 2.2;
  const totalIntro = holdDuration + travelDuration;

  const introCompletedRef = useRef(false);
  const prevBallXRef = useRef(0);
  const lastMissionStartedAtRef = useRef(missionStartedAt);

  // When stage changes or mission resets (e.g. clicking RETRY), re-trigger smooth transition from target to ball
  React.useEffect(() => {
    if (missionStartedAt !== lastMissionStartedAtRef.current) {
      lastMissionStartedAtRef.current = missionStartedAt;
      introCompletedRef.current = false;
      prevBallXRef.current = posX;
    }
  }, [missionStartedAt, posX]);

  // Room Wall Boundaries (strictly enforce camera stays inside the interior)
  const MIN_CAM_X = -2.8;
  const MAX_CAM_X = 14.8;
  const MIN_CAM_Z = -3.6;
  const MAX_CAM_Z = 3.6;
  const MIN_CAM_Y = 0.35;
  const MAX_CAM_Y = 3.8;

  useFrame(() => {
    if (!controlsRef.current) return;

    // TPP Behind-the-Ball View
    const tppCamPos = new THREE.Vector3(posX - 2.8, 0.7, 1);
    const tppLookAt = new THREE.Vector3(posX + 4.5, 0.15, 0.0);

    // 1. Camera Transitions & OrbitControls Follow
    if (!isMissionStarted || missionStartedAt === null) {
      // While pre-mission instructions overlay is visible: hold on Target Line
      camera.position.copy(targetCamPos);
      controlsRef.current.target.copy(targetLookAt);
      controlsRef.current.update();
    } else {
      const elapsed = (performance.now() - missionStartedAt) / 1000;

      if (elapsed <= holdDuration) {
        // Hold on target area for 1.5s after clicking PLAY or RETRY
        introCompletedRef.current = false;
        camera.position.copy(targetCamPos);
        controlsRef.current.target.copy(targetLookAt);
        controlsRef.current.update();
      } else if (elapsed < totalIntro) {
        // Smooth cinematic swoop from Target Line to TPP view behind the ball
        introCompletedRef.current = false;
        const progress = (elapsed - holdDuration) / travelDuration;
        const rawT = Math.min(1, Math.max(0, progress));
        const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

        camera.position.lerpVectors(targetCamPos, tppCamPos, t);
        controlsRef.current.target.lerpVectors(targetLookAt, tppLookAt, t);
        controlsRef.current.update();
      } else {
        // Flyover complete! Hand over camera to behind the ball
        if (!introCompletedRef.current) {
          introCompletedRef.current = true;
          camera.position.set(tppCamPos.x, tppCamPos.y, tppCamPos.z);
          controlsRef.current.target.set(tppLookAt.x, tppLookAt.y, tppLookAt.z);
          prevBallXRef.current = posX;
          controlsRef.current.update();
        }

        // When the ball rolls down the lane, shift camera and target smoothly along X
        if (status === "skidding" || status === "pure_rolling") {
          const deltaX = posX - prevBallXRef.current;
          if (Math.abs(deltaX) > 0.0001) {
            camera.position.x += deltaX;
            controlsRef.current.target.x += deltaX;
            prevBallXRef.current = posX;
            controlsRef.current.update();
          }
        } else {
          prevBallXRef.current = posX;
        }
      }
    }

    // HARD CLAMP: Prevent camera from ever clipping outside the room walls or floor/ceiling
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, MIN_CAM_X, MAX_CAM_X);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, MIN_CAM_Y, MAX_CAM_Y);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, MIN_CAM_Z, MAX_CAM_Z);
  });

  return null;
}

// Main 3D Three.js Scene Component
export function SkidToRollScene({ config }: { config?: any }) {
  const currentStage = useSkidToRollStore((s) => s.currentStage);
  const updateAnimationStep = useSkidToRollStore((s) => s.updateAnimationStep);
  const stage = SKID_STAGES[currentStage - 1];

  const controlsRef = useRef<any>(null);

  // Hook into Three.js render loop for real-time physics integration
  function PhysicsTicker() {
    useFrame((_, delta) => {
      updateAnimationStep(delta);
    });
    return null;
  }

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [3.2, 2.8, 4.6], fov: 46 }}
      >
        {/* Light Theme Background & Distance Fog */}
        <color attach="background" args={["#f1f5f9"]} />
        <fog attach="fog" args={["#f1f5f9", 18, 38]} />

        {/* Studio Room Lighting */}
        <ambientLight intensity={0.7} color="#ffffff" />
        <directionalLight
          position={[10, 16, 8]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-8}
          shadow-camera-right={18}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-bias={-0.0005}
        />
        <hemisphereLight groundColor="#cbd5e1" color="#ffffff" intensity={0.45} />

        {/* Complete Bowling Alley Room (Walls, Floor, Accents, Lane) */}
        <BowlingAlleyRoom targetDist={stage.targetDistance} />

        {/* Dynamic Bowling Ball */}
        <BowlingBallMesh />

        {/* Frame Physics Driver */}
        <PhysicsTicker />

        {/* Smooth Dynamic Camera Follow Controller with Swoop Transition */}
        <CameraController controlsRef={controlsRef} targetDist={stage.targetDistance} />

        {/* Orbit Camera Controls with Room Boundary Constraints */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          target={[3.5, 0.35, 0]}
          minDistance={1.2}
          maxDistance={7.5}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI / 2 - 0.08}
        />
      </Canvas>
    </div>
  );
}
