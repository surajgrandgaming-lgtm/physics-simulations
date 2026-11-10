"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useHeatTransferStore, HEAT_TRANSFER_STAGES } from "./HeatTransferStore";

const NUM_SLICES = 36;
const NUM_FLUX_PARTICLES = 70;

// Color interpolation for physical thermal gradient
function getHeatColor(tempK: number): THREE.Color {
  const norm = Math.max(0, Math.min(1, (tempK - 300) / 300));
  const col = new THREE.Color();
  if (norm < 0.35) {
    col.lerpColors(new THREE.Color("#0284c7"), new THREE.Color("#eab308"), norm / 0.35);
  } else if (norm < 0.7) {
    col.lerpColors(new THREE.Color("#eab308"), new THREE.Color("#f97316"), (norm - 0.35) / 0.35);
  } else {
    col.lerpColors(new THREE.Color("#f97316"), new THREE.Color("#ef4444"), (norm - 0.7) / 0.3);
  }
  return col;
}

function HeatTransferApparatusContent() {
  const currentStage = useHeatTransferStore((s) => s.currentStage);
  const furnaceTemp = useHeatTransferStore((s) => s.furnaceTemp);
  const sinkTemp = useHeatTransferStore((s) => s.sinkTemp);
  const junctionTemp = useHeatTransferStore((s) => s.junctionTemp);
  const heatCurrent = useHeatTransferStore((s) => s.heatCurrent);
  const isSimulating = useHeatTransferStore((s) => s.isSimulating);
  const simulationProgress = useHeatTransferStore((s) => s.simulationProgress);
  const isMissionStarted = useHeatTransferStore((s) => s.isMissionStarted);
  const missionStartedAt = useHeatTransferStore((s) => s.missionStartedAt);
  const tickPhysics = useHeatTransferStore((s) => s.tickPhysics);

  const stageCfg = HEAT_TRANSFER_STAGES[currentStage];
  const controlsRef = useRef<any>(null);
  const [introFinished, setIntroFinished] = useState(false);

  // Rod bounds: spans from furnace at X = -2.2 to cold sink at X = 2.2
  const leftX = -2.2;
  const rightX = 2.2;
  const rodLengthSpan = rightX - leftX; // 4.4 units
  const sliceWidth = rodLengthSpan / NUM_SLICES;

  const targetProbeX = currentStage === 2 ? 0.3 : 0;

  // Keyframe camera positions
  const zoomedInCamPos = useMemo(() => new THREE.Vector3(targetProbeX, 1.2, 2.4), [targetProbeX]);
  const zoomedInTarget = useMemo(() => new THREE.Vector3(targetProbeX, 0.7, 0), [targetProbeX]);
  const fullModelCamPos = useMemo(() => new THREE.Vector3(0, 2.2, 7.8), []);
  const fullModelTarget = useMemo(() => new THREE.Vector3(0, 0.65, 0), []);

  const holdDuration = 0.5;
  const zoomDuration = 2.4;
  const totalIntroDuration = holdDuration + zoomDuration;

  useEffect(() => {
    setIntroFinished(false);
  }, [currentStage]);

  // Instanced mesh refs
  // Single/Series rod:
  const singleRodMeshRef = useRef<THREE.InstancedMesh>(null);
  // Parallel rods (Branch A = upper, Branch B = lower):
  const branchAMeshRef = useRef<THREE.InstancedMesh>(null);
  const branchBMeshRef = useRef<THREE.InstancedMesh>(null);
  const dummySlice = useMemo(() => new THREE.Object3D(), []);

  // Heat flux animated particles
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const dummyParticle = useMemo(() => new THREE.Object3D(), []);

  const particlesData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < NUM_FLUX_PARTICLES; i++) {
      arr.push({
        t: Math.random(),
        radialAngle: Math.random() * Math.PI * 2,
        radialDist: 0.16 + Math.random() * 0.06,
        speed: 0.18 + Math.random() * 0.14,
        branch: Math.random() > 0.5 ? 1 : -1, // for Stage 3 parallel split
      });
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    // Camera Transition
    if (controlsRef.current && !introFinished) {
      if (!isMissionStarted || missionStartedAt === null) {
        state.camera.position.copy(zoomedInCamPos);
        controlsRef.current.target.copy(zoomedInTarget);
        controlsRef.current.update();
      } else {
        const elapsed = (performance.now() - missionStartedAt) / 1000;
        if (elapsed <= holdDuration) {
          state.camera.position.copy(zoomedInCamPos);
          controlsRef.current.target.copy(zoomedInTarget);
          controlsRef.current.update();
        } else if (elapsed < totalIntroDuration) {
          const progress = (elapsed - holdDuration) / zoomDuration;
          const rawT = Math.min(1, Math.max(0, progress));
          const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

          state.camera.position.lerpVectors(zoomedInCamPos, fullModelCamPos, t);
          controlsRef.current.target.lerpVectors(zoomedInTarget, fullModelTarget, t);
          controlsRef.current.update();
        } else {
          state.camera.position.copy(fullModelCamPos);
          controlsRef.current.target.copy(fullModelTarget);
          controlsRef.current.update();
          setIntroFinished(true);
        }
      }
    }

    if (isSimulating) {
      tickPhysics(dt);
    }

    // ── Update Thermal Conduction Gradient for Single/Series (Stage 1 & 2) ──
    if (currentStage !== 3 && singleRodMeshRef.current) {
      for (let i = 0; i < NUM_SLICES; i++) {
        const frac = (i + 0.5) / NUM_SLICES;
        const posX = leftX + frac * rodLengthSpan;

        let tempK = sinkTemp;
        if (currentStage === 1) {
          const steadyT = furnaceTemp - frac * (furnaceTemp - sinkTemp);
          tempK = sinkTemp + (steadyT - sinkTemp) * (isSimulating ? simulationProgress : 0.05);
        } else if (currentStage === 2) {
          const copperFrac = 0.57;
          if (frac <= copperFrac) {
            const subFrac = frac / copperFrac;
            const copperT = furnaceTemp - subFrac * (furnaceTemp - junctionTemp);
            tempK = sinkTemp + (copperT - sinkTemp) * (isSimulating ? simulationProgress : 0.05);
          } else {
            const subFrac = (frac - copperFrac) / (1 - copperFrac);
            const steelT = junctionTemp - subFrac * (junctionTemp - sinkTemp);
            tempK = sinkTemp + (steelT - sinkTemp) * (isSimulating ? simulationProgress : 0.05);
          }
        }

        const color = getHeatColor(tempK);
        singleRodMeshRef.current.setColorAt(i, color);

        dummySlice.position.set(posX, 0.65, 0);
        dummySlice.rotation.set(0, 0, Math.PI / 2);
        dummySlice.scale.set(1, 1, 1);
        dummySlice.updateMatrix();
        singleRodMeshRef.current.setMatrixAt(i, dummySlice.matrix);
      }
      singleRodMeshRef.current.instanceMatrix.needsUpdate = true;
      if (singleRodMeshRef.current.instanceColor) {
        singleRodMeshRef.current.instanceColor.needsUpdate = true;
      }
    }

    // ── Update Thermal Conduction Gradient for Parallel (Stage 3) ──
    if (currentStage === 3 && branchAMeshRef.current && branchBMeshRef.current) {
      for (let i = 0; i < NUM_SLICES; i++) {
        const frac = (i + 0.5) / NUM_SLICES;
        const posX = leftX + frac * rodLengthSpan;
        const steadyT = furnaceTemp - frac * (furnaceTemp - sinkTemp);
        const tempK = sinkTemp + (steadyT - sinkTemp) * (isSimulating ? simulationProgress : 0.05);
        const color = getHeatColor(tempK);

        // Branch A (Top: Y = 0.65 + 0.35)
        branchAMeshRef.current.setColorAt(i, color);
        dummySlice.position.set(posX, 1.0, 0);
        dummySlice.rotation.set(0, 0, Math.PI / 2);
        dummySlice.scale.set(1, 1, 1);
        dummySlice.updateMatrix();
        branchAMeshRef.current.setMatrixAt(i, dummySlice.matrix);

        // Branch B (Bottom: Y = 0.65 - 0.35)
        branchBMeshRef.current.setColorAt(i, color);
        dummySlice.position.set(posX, 0.3, 0);
        dummySlice.rotation.set(0, 0, Math.PI / 2);
        dummySlice.scale.set(1, 1, 1);
        dummySlice.updateMatrix();
        branchBMeshRef.current.setMatrixAt(i, dummySlice.matrix);
      }
      branchAMeshRef.current.instanceMatrix.needsUpdate = true;
      branchBMeshRef.current.instanceMatrix.needsUpdate = true;
      if (branchAMeshRef.current.instanceColor) branchAMeshRef.current.instanceColor.needsUpdate = true;
      if (branchBMeshRef.current.instanceColor) branchBMeshRef.current.instanceColor.needsUpdate = true;
    }

    // ── Update Heat Flux Particles ──
    if (particlesRef.current) {
      const activeSpeedMult = isSimulating ? 1.0 + (heatCurrent / 40) : 0.2;
      for (let i = 0; i < NUM_FLUX_PARTICLES; i++) {
        const p = particlesData[i];
        p.t = (p.t + dt * p.speed * activeSpeedMult) % 1.0;

        const posX = leftX + p.t * rodLengthSpan;
        let posY = 0.65 + Math.sin(p.radialAngle) * p.radialDist;

        if (currentStage === 3) {
          // In parallel, particles flow through both upper and lower rods
          posY = (p.branch > 0 ? 1.0 : 0.3) + Math.sin(p.radialAngle) * (p.radialDist * 0.7);
        }

        const posZ = Math.cos(p.radialAngle) * p.radialDist;
        const pScale = isSimulating ? 0.035 + (heatCurrent / 200) * 0.025 : 0.025;

        dummyParticle.position.set(posX, posY, posZ);
        dummyParticle.scale.setScalar(pScale);
        dummyParticle.updateMatrix();
        particlesRef.current.setMatrixAt(i, dummyParticle.matrix);
      }
      particlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <color attach="background" args={["#f1f5f9"]} />

      {/* Lighting */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 10, 8]} intensity={1.3} castShadow />
      <directionalLight position={[-6, 6, -6]} intensity={0.4} />
      <pointLight position={[-2.8, 1.2, 0.8]} intensity={isSimulating ? 3.5 : 1.8} color="#f97316" distance={6} />
      <pointLight position={[2.8, 1.2, 0.8]} intensity={1.8} color="#38bdf8" distance={5} />

      <OrbitControls
        ref={controlsRef}
        enableRotate={introFinished}
        enableZoom={introFinished}
        enablePan={introFinished}
        minDistance={3.2}
        maxDistance={12}
        target={[0, 0.65, 0]}
      />

      <group position={[0, 0, 0]}>
        {/* Precision Heavy Lab Workbench */}
        <mesh position={[0, -0.3, 0]} receiveShadow>
          <boxGeometry args={[8.2, 0.35, 4.0]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.65} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[7.8, 0.08, 3.6]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* ─── 1. HOT FURNACE RESERVOIR (Left, Constant T_H) ─── */}
        <group position={[-2.8, 0.65, 0]}>
          <mesh>
            <boxGeometry args={[1.2, 1.5, 1.4]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.25} />
          </mesh>

          <mesh position={[0.55, 0, 0]}>
            <boxGeometry args={[0.12, 1.2, 1.1]} />
            <meshStandardMaterial
              color="#ea580c"
              emissive="#f97316"
              emissiveIntensity={isSimulating ? 1.8 : 0.9}
              metalness={0.2}
              roughness={0.2}
            />
          </mesh>

          {[-0.3, 0, 0.3].map((cy, idx) => (
            <mesh key={`coil-${idx}`} position={[0.58, cy, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.25, 0.035, 16, 32]} />
              <meshStandardMaterial color="#fed7aa" emissive="#ffedd5" emissiveIntensity={isSimulating ? 2.5 : 1.2} />
            </mesh>
          ))}

          <Html position={[0, 1.15, 0]} center>
            <div className="px-2.5 py-1 rounded-md bg-amber-950 border border-amber-500/50 text-amber-300 font-mono text-[10px] font-black tracking-wider shadow-lg whitespace-nowrap select-none pointer-events-none">
              🔥 HOT FURNACE: {furnaceTemp.toFixed(0)} K
            </div>
          </Html>
        </group>

        {/* ─── 2. COLD ICE SINK RESERVOIR (Right, Constant T_C) ─── */}
        <group position={[2.8, 0.65, 0]}>
          <mesh>
            <boxGeometry args={[1.2, 1.5, 1.4]} />
            <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.2} />
          </mesh>

          {[-0.4, -0.2, 0, 0.2, 0.4].map((rx, idx) => (
            <mesh key={`fin-${idx}`} position={[rx, 0, 0.72]}>
              <boxGeometry args={[0.06, 1.3, 0.12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
            </mesh>
          ))}

          <mesh position={[-0.55, 0, 0]}>
            <boxGeometry args={[0.12, 1.2, 1.1]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.6}
              metalness={0.4}
              roughness={0.3}
            />
          </mesh>

          <Html position={[0, 1.15, 0]} center>
            <div className="px-2.5 py-1 rounded-md bg-sky-950 border border-sky-500/50 text-sky-300 font-mono text-[10px] font-black tracking-wider shadow-lg whitespace-nowrap select-none pointer-events-none">
              ❄️ COLD SINK: {sinkTemp.toFixed(0)} K
            </div>
          </Html>
        </group>

        {/* ─── 3. CONDUCTION CONDUCTORS ─── */}
        {/* Stages 1 & 2: Single or Composite Series Rod */}
        {currentStage !== 3 && (
          <>
            <instancedMesh
              ref={singleRodMeshRef}
              args={[undefined, undefined, NUM_SLICES]}
              position={[0, 0, 0]}
            >
              <cylinderGeometry args={[0.22, 0.22, sliceWidth * 1.02, 32]} />
              <meshStandardMaterial metalness={0.75} roughness={0.25} />
            </instancedMesh>

            {/* End Flanges */}
            <mesh position={[leftX - 0.05, 0.65, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.28, 0.28, 0.14, 32]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[rightX + 0.05, 0.65, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.28, 0.28, 0.14, 32]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Heat Flux Sensor Ring & Target Badge (Stage 1) */}
            {currentStage === 1 && (
              <group position={[0, 0.65, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.26, 0.26, 0.10, 32]} />
                  <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.15} />
                </mesh>
                {/* Glowing cyan sensor target ring */}
                <mesh rotation={[0, Math.PI / 2, 0]}>
                  <ringGeometry args={[0.28, 0.35, 48]} />
                  <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} />
                </mesh>
                {/* Target badge below collar */}
                <Html position={[0, -0.45, 0]} center>
                  <div className="px-3 py-1 rounded-md bg-cyan-950/90 text-cyan-300 border border-cyan-400/50 text-[10px] font-mono font-extrabold whitespace-nowrap shadow-lg select-none pointer-events-none">
                    TARGET: H = 160.0 W
                  </div>
                </Html>
              </group>
            )}

            {/* Series Junction Collar (Stage 2) */}
            {currentStage === 2 && (
              <group position={[targetProbeX, 0.65, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.27, 0.27, 0.12, 32]} />
                  <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.15} />
                </mesh>
                {/* Glowing cyan junction target ring */}
                <mesh rotation={[0, Math.PI / 2, 0]}>
                  <ringGeometry args={[0.29, 0.36, 48]} />
                  <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} />
                </mesh>
                {/* Junction indicator below */}
                <Html position={[0, -0.45, 0]} center>
                  <div className="px-3 py-1 rounded-md bg-cyan-950/90 text-cyan-300 border border-cyan-400/50 text-[10px] font-mono font-extrabold whitespace-nowrap shadow-lg select-none pointer-events-none">
                    COPPER ⇄ STEEL JUNCTION (T_j = ?)
                  </div>
                </Html>
              </group>
            )}
          </>
        )}

        {/* Stage 3: True Dual Parallel Conductor Rods */}
        {currentStage === 3 && (
          <group position={[0, 0, 0]}>
            {/* Terminal Manifold Blocks connecting both rods */}
            <mesh position={[leftX + 0.05, 0.65, 0]}>
              <boxGeometry args={[0.28, 1.1, 0.42]} />
              <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
            </mesh>
            <mesh position={[rightX - 0.05, 0.65, 0]}>
              <boxGeometry args={[0.28, 1.1, 0.42]} />
              <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
            </mesh>

            {/* Upper Branch A (Aluminum) Instanced Gradient Slices */}
            <instancedMesh
              ref={branchAMeshRef}
              args={[undefined, undefined, NUM_SLICES]}
              position={[0, 0, 0]}
            >
              <cylinderGeometry args={[0.15, 0.15, sliceWidth * 1.02, 32]} />
              <meshStandardMaterial metalness={0.8} roughness={0.2} />
            </instancedMesh>

            {/* Lower Branch B (Brass) Instanced Gradient Slices */}
            <instancedMesh
              ref={branchBMeshRef}
              args={[undefined, undefined, NUM_SLICES]}
              position={[0, 0, 0]}
            >
              <cylinderGeometry args={[0.15, 0.15, sliceWidth * 1.02, 32]} />
              <meshStandardMaterial metalness={0.8} roughness={0.2} />
            </instancedMesh>

            {/* Branch Labels */}
            <Html position={[0, 1.35, 0]} center>
              <div className="px-2.5 py-0.5 rounded bg-slate-900/90 text-slate-200 border border-slate-600 text-[10px] font-mono font-bold whitespace-nowrap select-none">
                BRANCH A: ALUMINUM (R_A = 5.0 K/W)
              </div>
            </Html>
            <Html position={[0, -0.05, 0]} center>
              <div className="px-2.5 py-0.5 rounded bg-slate-900/90 text-amber-300 border border-amber-600/40 text-[10px] font-mono font-bold whitespace-nowrap select-none">
                BRANCH B: BRASS (R_B = 10.0 K/W)
              </div>
            </Html>
          </group>
        )}

        {/* ─── 4. HEAT FLUX PARTICLES (Glowing Heat Energy Pulses) ─── */}
        <instancedMesh
          ref={particlesRef}
          args={[undefined, undefined, NUM_FLUX_PARTICLES]}
          position={[0, 0, 0]}
        >
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color="#ffedd5"
            emissive="#ea580c"
            emissiveIntensity={isSimulating ? 2.8 : 1.2}
            roughness={0.15}
          />
        </instancedMesh>
      </group>
    </>
  );
}

export function HeatTransferScene() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 2.2, 7.8], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <HeatTransferApparatusContent />
      </Canvas>
    </div>
  );
}

export default HeatTransferScene;
