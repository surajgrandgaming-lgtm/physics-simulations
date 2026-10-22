"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useBungeeDropStore,
  BUNGEE_STAGES,
} from "./BungeeDropStore";

// Procedural 3D Helical Coil Spring
function ProceduralSpring({
  payloadY,
  cordLength,
}: {
  payloadY: number;
  cordLength: number;
}) {
  const dropDepth = Math.max(0.05, payloadY);
  const isStretched = dropDepth > cordLength;
  const stretch = Math.max(0, dropDepth - cordLength);
  const stretchRatio = Math.min(1.0, stretch / 35.0);

  // Dynamic tension color: Azure Cyan (slack) -> Safety Orange (moderate) -> Vivid Crimson (max stretch)
  const springColor = useMemo(() => {
    if (!isStretched) return new THREE.Color("#0284c7");
    if (stretchRatio < 0.5) {
      return new THREE.Color("#0284c7").lerp(new THREE.Color("#ea580c"), stretchRatio * 2);
    }
    return new THREE.Color("#ea580c").lerp(new THREE.Color("#dc2626"), (stretchRatio - 0.5) * 2);
  }, [isStretched, stretchRatio]);

  // Spring spans from gantry winch at (0, 2.2, 0) down to probe top coupling at (0, -dropDepth + 0.9, 0)
  const topY = 2.2;
  const bottomY = -dropDepth + 0.9;
  const totalLength = Math.max(0.5, topY - bottomY);

  // Generate authentic 3D helical coil spring geometry
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const coils = Math.max(16, Math.min(32, Math.round(18 + totalLength * 0.15)));
    const segments = coils * 10;
    const radius = Math.max(0.18, 0.30 - stretchRatio * 0.08);

    // 1. Top straight lead from winch down into spring coil
    points.push(new THREE.Vector3(0, topY, 0));
    points.push(new THREE.Vector3(0, topY - 0.15, 0));

    // 2. Helical spring body
    const helixStartY = topY - 0.2;
    const helixEndY = bottomY + 0.2;
    const helixHeight = Math.max(0.2, helixStartY - helixEndY);

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * coils * Math.PI * 2;
      const py = helixStartY - t * helixHeight;
      const px = Math.cos(angle) * radius;
      const pz = Math.sin(angle) * radius;
      points.push(new THREE.Vector3(px, py, pz));
    }

    // 3. Bottom straight lead down into probe coupling
    points.push(new THREE.Vector3(0, bottomY + 0.15, 0));
    points.push(new THREE.Vector3(0, bottomY, 0));

    const curve = new THREE.CatmullRomCurve3(points);
    const wireRadius = Math.max(0.025, 0.042 - stretchRatio * 0.012);
    return new THREE.TubeGeometry(curve, segments + 4, wireRadius, 6, false);
  }, [topY, bottomY, totalLength, stretchRatio]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={springColor}
        emissive={springColor}
        emissiveIntensity={isStretched ? 0.35 + stretchRatio * 0.45 : 0.08}
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  );
}

// Armored Science Probe Payload
function SciencePayload({ positionY, isImpact }: { positionY: number; isImpact: boolean }) {
  return (
    <group position={[0, -positionY, 0]}>
      {/* Top Cable Harness Coupling */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.15, 0.35, 0.4, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Main Armored Chassis Body */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.55, 0.6, 1.2, 24]} />
        <meshStandardMaterial
          color={isImpact ? "#ef4444" : "#1e293b"}
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>

      {/* Gold Thermal Multi-layer Insulation Band */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.57, 0.57, 0.65, 24]} />
        <meshStandardMaterial
          color="#f59e0b"
          metalness={0.9}
          roughness={0.15}
          emissive="#d97706"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Guidance Fins with Blue Telemetry Beacons */}
      {[-1, 1].map((dir, idx) => (
        <group key={idx} position={[dir * 0.72, 0.2, 0]}>
          <mesh rotation={[0, 0, dir * 0.2]}>
            <boxGeometry args={[0.1, 0.85, 0.35]} />
            <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[dir * 0.08, 0.35, 0]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      ))}

      {/* Precision Contact Sensor Tip at probe base */}
      <mesh position={[0, -0.45, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.26, 0.38, 20]} />
        <meshStandardMaterial
          color={isImpact ? "#ef4444" : "#10b981"}
          emissive={isImpact ? "#ef4444" : "#10b981"}
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}

// Target Receiving Platform at Canyon Floor (Depth H)
function TargetReceptorPlatform({
  height,
  showLabel,
}: {
  height: number;
  showLabel: boolean;
}) {
  const targetY = -height;

  return (
    <group position={[0, targetY, 0]}>
      {/* Submerged Mooring Foundation */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[5.2, 6.2, 1.6, 6]} />
        <meshStandardMaterial color="#64748b" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Floating Target Deck */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[3.4, 3.6, 0.3, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Concentric Target Rings */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.5, 32]} />
        <meshBasicMaterial color="#0284c7" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.4, 32]} />
        <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 24]} />
        <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
      </mesh>

      {/* Target Light Beacon */}
      <pointLight position={[0, 1.5, 0]} color="#10b981" intensity={1.5} distance={15} />

      {/* 4 Sensor Perimeter Pylons with Emerald Beacons */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        const px = Math.cos(angle) * 3.1;
        const pz = Math.sin(angle) * 3.1;
        return (
          <group key={i} position={[px, 0.5, pz]}>
            <mesh>
              <cylinderGeometry args={[0.08, 0.12, 1.2, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.65, 0]}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
          </group>
        );
      })}

      {/* Floating 3D Target Badge (Only shown when no modal is up) */}
      {showLabel && (
        <Html position={[0, 2.2, 0]} center distanceFactor={28}>
          <div className="px-3.5 py-1 rounded-full bg-white/95 border border-emerald-500/60 text-emerald-800 font-mono text-xs font-bold shadow-md pointer-events-none select-none whitespace-nowrap backdrop-blur-md">
            TARGET RECEPTOR DOCK ({height.toFixed(0)}m)
          </div>
        </Html>
      )}
    </group>
  );
}

// Suspension Bridge with Open Center Drop Well
function SuspensionBridge() {
  return (
    <group position={[0, 0, 0]}>
      {/* Left Road Deck Span (x < -2.6) */}
      <mesh position={[-16, 0.4, 0]}>
        <boxGeometry args={[26, 0.7, 7.5]} />
        <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Right Road Deck Span (x > 2.6) */}
      <mesh position={[16, 0.4, 0]}>
        <boxGeometry args={[26, 0.7, 7.5]} />
        <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Yellow Safety Lines along roadway */}
      <mesh position={[-16, 0.76, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[25, 0.35]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>
      <mesh position={[16, 0.76, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[25, 0.35]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>

      {/* Central Drop Well Steel Framing (Open center so spring and probe plunge freely) */}
      {[-2.8, 2.8].map((x, idx) => (
        <mesh key={idx} position={[x, 0.4, 0]}>
          <boxGeometry args={[0.5, 0.7, 7.5]} />
          <meshStandardMaterial color="#ea580c" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {[-3.6, 3.6].map((z, idx) => (
        <mesh key={idx} position={[0, 0.4, z]}>
          <boxGeometry args={[5.8, 0.7, 0.5]} />
          <meshStandardMaterial color="#ea580c" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Industrial Gantry Drop Crane */}
      <group position={[0, 0, 0]}>
        {/* Support Steel Columns */}
        {[-2.6, 2.6].map((x, idx) => (
          <mesh key={idx} position={[x, 2.6, 0]}>
            <cylinderGeometry args={[0.18, 0.24, 4.8, 12]} />
            <meshStandardMaterial color="#eab308" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}

        {/* Top Heavy Crossbeam */}
        <mesh position={[0, 4.9, 0]}>
          <boxGeometry args={[6.0, 0.45, 0.8]} />
          <meshStandardMaterial color="#ca8a04" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Winch Anchor Drum at (0, 2.2, 0) */}
        <mesh position={[0, 2.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.5, 0.5, 1.2, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Gantry Beacon */}
        <mesh position={[0, 5.3, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
      </group>

      {/* Safety Railings */}
      {[-3.6, 3.6].map((z, idx) => (
        <group key={idx} position={[0, 1.3, z]}>
          <mesh position={[-16, 0, 0]}>
            <boxGeometry args={[26, 1.0, 0.1]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[16, 0, 0]}>
            <boxGeometry args={[26, 1.0, 0.1]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Suspension Towers */}
      {[-24, 24].map((tx, idx) => (
        <group key={idx} position={[tx, 9.0, 0]}>
          <mesh>
            <boxGeometry args={[1.4, 18, 1.4]} />
            <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Altitude & Depth Markers along the Canyon Wall
function GorgeDepthMarkers({
  height,
  cordLength,
}: {
  height: number;
  cordLength: number;
}) {
  const markers = useMemo(() => {
    const list: { y: number; label: string; color: string; isSpecial: boolean }[] = [];
    list.push({ y: 0, label: "0m (BRIDGE)", color: "#d97706", isSpecial: true });

    for (let depth = 10; depth < height; depth += 10) {
      if (Math.abs(depth - cordLength) < 3) continue;
      list.push({ y: -depth, label: `${depth}m`, color: "#64748b", isSpecial: false });
    }

    list.push({
      y: -cordLength,
      label: `CORD LIMIT (${cordLength.toFixed(0)}m)`,
      color: "#ea580c",
      isSpecial: true,
    });
    list.push({
      y: -height,
      label: `TARGET (${height.toFixed(0)}m)`,
      color: "#059669",
      isSpecial: true,
    });

    return list;
  }, [height, cordLength]);

  return (
    <group position={[-9, 0, 0]}>
      {/* Vertical Guide Cable */}
      <mesh position={[0, -height / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, height + 4, 8]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>

      {/* Depth Indicator Ticks */}
      {markers.map((m, idx) => (
        <group key={idx} position={[0, m.y, 0]}>
          <mesh position={[0.7, 0, 0]}>
            <boxGeometry args={[1.4, m.isSpecial ? 0.2 : 0.08, 0.08]} />
            <meshStandardMaterial
              color={m.color}
              emissive={m.color}
              emissiveIntensity={m.isSpecial ? 0.35 : 0.15}
            />
          </mesh>

          <mesh position={[1.5, 0, 0]}>
            <sphereGeometry args={[m.isSpecial ? 0.2 : 0.12, 12, 12]} />
            <meshBasicMaterial color={m.color} />
          </mesh>

          {m.isSpecial && (
            <Html position={[2.4, 0, 0]} center distanceFactor={28}>
              <div
                className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-wider pointer-events-none select-none whitespace-nowrap shadow-sm border bg-white/95"
                style={{
                  borderColor: m.color,
                  color: m.color,
                }}
              >
                {m.label}
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}

// Sculpted Canyon Cliffs Framing the Gorge
function CanyonEnvironment({ height }: { height: number }) {
  return (
    <group>
      {/* Left Tiered Cliff Formations */}
      <mesh position={[-25, -height / 2, 0]}>
        <boxGeometry args={[18, height + 30, 60]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh position={[-16, -height / 2, 0]}>
        <boxGeometry args={[3, height + 20, 45]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Right Tiered Cliff Formations */}
      <mesh position={[25, -height / 2, 0]}>
        <boxGeometry args={[18, height + 30, 60]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh position={[16, -height / 2, 0]}>
        <boxGeometry args={[3, height + 20, 45]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Azure Mountain River at Floor */}
      <mesh position={[0, -height - 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial
          color="#0369a1"
          roughness={0.2}
          metalness={0.7}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

// Camera Director with STRICT BOUNDS to prevent camera from leaving the canyon wall area
function CameraRig({
  payloadY,
  height,
  cameraMode,
}: {
  payloadY: number;
  height: number;
  cameraMode: string;
}) {
  const controlsRef = useRef<any>(null);
  const prevModeRef = useRef<string>(cameraMode);

  useFrame((state) => {
    if (!controlsRef.current) return;

    // View preset triggers
    if (prevModeRef.current !== cameraMode) {
      prevModeRef.current = cameraMode;
      if (cameraMode === "target") {
        state.camera.position.set(6, -height + 3, 10);
        controlsRef.current.target.set(0, -height + 0.6, 0);
      } else if (cameraMode === "overview") {
        state.camera.position.set(15, 8, 20);
        controlsRef.current.target.set(0, -height / 2, 0);
      } else if (cameraMode === "follow") {
        state.camera.position.set(12, -payloadY + 5.5, 16);
        controlsRef.current.target.set(0, -payloadY - 1.0, 0);
      }
    }

    // While dropping in follow mode, gently track descending probe
    if (cameraMode === "follow" && payloadY > 0.1) {
      controlsRef.current.target.y = THREE.MathUtils.lerp(
        controlsRef.current.target.y,
        -payloadY - 1.0,
        0.06
      );
    }

    // STRICT WALL AREA BOUNDS: Camera is physically clamped inside the canyon gorge
    // Walls are at X = ±18, gorge floor at -height, bridge at 0
    state.camera.position.x = THREE.MathUtils.clamp(state.camera.position.x, -14, 14);
    state.camera.position.z = THREE.MathUtils.clamp(state.camera.position.z, -17, 17);
    state.camera.position.y = THREE.MathUtils.clamp(state.camera.position.y, -height + 1.0, 13);
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false} // Disable panning so camera cannot be dragged out of the scene
      enableRotate={true}
      enableZoom={true}
      minDistance={5}
      maxDistance={28} // Strict maximum zoom distance so camera stays well inside the walls
      maxPolarAngle={Math.PI * 0.88} // Prevents looking from below the ground floor
      minPolarAngle={0.15} // Prevents zenith gimbal flip
      target={[0, -1.0, 0]}
    />
  );
}

function BungeeSceneContent() {
  const currentStage = useBungeeDropStore((s) => s.currentStage);
  const positionY = useBungeeDropStore((s) => s.positionY);
  const status = useBungeeDropStore((s) => s.status);
  const cameraMode = useBungeeDropStore((s) => s.cameraMode);
  const showResultModal = useBungeeDropStore((s) => s.showResultModal);
  const tickPhysics = useBungeeDropStore((s) => s.tickPhysics);

  const stage = BUNGEE_STAGES[currentStage - 1];
  const isImpact = status === "fail_crash";

  useFrame((_, delta) => {
    tickPhysics(delta);
  });

  return (
    <>
      {/* Soft Natural Balanced Studio Daylight (No Overexposure) */}
      <ambientLight intensity={0.45} color="#ffffff" />
      <directionalLight
        position={[20, 35, 20]}
        intensity={0.85}
        color="#fffaf0"
        castShadow
        shadow-mapSize={1024}
      />

      {/* OrbitControls Camera Rig with Hard Wall Area Limits */}
      <CameraRig
        payloadY={positionY}
        height={stage.height}
        cameraMode={cameraMode}
      />

      {/* 3D Scene Components */}
      <SuspensionBridge />
      <CanyonEnvironment height={stage.height} />
      <GorgeDepthMarkers height={stage.height} cordLength={stage.cordLength} />
      <TargetReceptorPlatform height={stage.height} showLabel={!showResultModal} />
      <ProceduralSpring
        payloadY={positionY}
        cordLength={stage.cordLength}
      />
      <SciencePayload positionY={positionY} isImpact={isImpact} />
    </>
  );
}

export function BungeeDropScene({ config }: { config?: any }) {
  return (
    <div className="w-full h-full relative select-none overflow-hidden bg-slate-100">
      <Canvas
        shadows
        camera={{ position: [12, 6, 16], fov: 48, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false, powerPreference: "default" }}
      >
        <color attach="background" args={["#f1f5f9"]} />
        <fog attach="fog" args={["#f1f5f9", 60, 180]} />
        <Suspense fallback={null}>
          <BungeeSceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
