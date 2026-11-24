"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useWaveOpticsStore } from "./WaveOpticsStore";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Dovetail Optical Rail with Millimeter Graduations
// ─────────────────────────────────────────────────────────────────────────────
function OpticalBenchRail() {
  const graduationMarks = useMemo(() => {
    const lines: { start: [number, number, number]; end: [number, number, number] }[] = [];
    const railLength = 1.9;
    const startX = -railLength / 2;
    const numTicks = 38; // Every 5 cm

    for (let i = 0; i <= numTicks; i++) {
      const x = startX + (i / numTicks) * railLength;
      const isMajor = i % 5 === 0;
      const tickZLen = isMajor ? 0.024 : 0.012;
      lines.push({
        start: [x, 0.041, 0.07],
        end: [x, 0.041, 0.07 + tickZLen],
      });
    }
    return lines;
  }, []);

  const railTickGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    graduationMarks.forEach((m) => {
      points.push(new THREE.Vector3(...m.start));
      points.push(new THREE.Vector3(...m.end));
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [graduationMarks]);

  return (
    <group position={[0, 0, 0]}>
      {/* Heavy Granite/Solid Aluminum Isolation Table */}
      <mesh receiveShadow position={[0, -0.04, 0]}>
        <boxGeometry args={[2.4, 0.06, 1.4]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.35} metalness={0.4} />
      </mesh>

      {/* Grid Pattern Top Plate */}
      <mesh position={[0, -0.009, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.3, 1.3]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} metalness={0.15} />
      </mesh>

      {/* Main Extruded Aluminum Precision Optical Rail */}
      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[2.0, 0.04, 0.16]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.25} metalness={0.7} />
      </mesh>

      {/* Central Guide Track Slot */}
      <mesh position={[0, 0.0405, 0]}>
        <boxGeometry args={[1.96, 0.002, 0.028]} />
        <meshBasicMaterial color="#64748b" />
      </mesh>

      {/* Graduation Scale Lines */}
      <lineSegments geometry={railTickGeometry}>
        <lineBasicMaterial color="#334155" />
      </lineSegments>

      {/* Rail End Stops */}
      <mesh position={[-1.0, 0.035, 0]}>
        <boxGeometry args={[0.03, 0.05, 0.18]} />
        <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[1.0, 0.035, 0]}>
        <boxGeometry args={[0.03, 0.05, 0.18]} />
        <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Coherent Laser Emitter Unit on Carrier Stanchion
// ─────────────────────────────────────────────────────────────────────────────
function LaserEmitterUnit({
  colorHex,
  wavelengthNm,
}: {
  colorHex: string;
  wavelengthNm: number;
}) {
  return (
    <group position={[-0.72, 0.04, 0]}>
      {/* Sliding Rail Carrier Clamp */}
      <mesh castShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[0.16, 0.03, 0.18]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Chrome Vertical Support Post */}
      <mesh castShadow position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.1, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.15} metalness={0.9} />
      </mesh>

      {/* Laser Diode Housing Cylinder */}
      <mesh castShadow position={[0, 0.13, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.032, 0.032, 0.22, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Brass Aperture Ring */}
      <mesh position={[0.115, 0.13, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.033, 0.033, 0.012, 32]} />
        <meshStandardMaterial color="#d97706" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Laser Emission Aperture Glowing Lens */}
      <mesh position={[0.122, 0.13, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.012, 24]} />
        <meshBasicMaterial color={colorHex} />
      </mesh>

      {/* Color Indicator LED on Housing Top */}
      <mesh position={[-0.04, 0.163, 0]}>
        <sphereGeometry args={[0.006, 16, 16]} />
        <meshBasicMaterial color={colorHex} />
      </mesh>

      {/* Coherent Source Label Badge */}
      <Html position={[0, 0.22, 0]} center distanceFactor={1.9}>
        <div className="bg-white/95 border border-slate-300 text-slate-800 px-1 py-0.5 rounded-sm font-mono text-[3.8px] font-bold shadow-xs whitespace-nowrap flex items-center gap-1 select-none pointer-events-none">
          <span className="w-1.2 h-1.2 rounded-full inline-block shrink-0" style={{ backgroundColor: colorHex }} />
          Laser: λ = {wavelengthNm} nm
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Double-Slit Mask & Precision Carrier Stanchion
// ─────────────────────────────────────────────────────────────────────────────
function DoubleSlitAperture({
  slitSeparationMm,
  colorHex,
}: {
  slitSeparationMm: number;
  colorHex: string;
}) {
  return (
    <group position={[-0.20, 0.04, 0]}>
      {/* Sliding Rail Carrier Clamp */}
      <mesh castShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[0.12, 0.03, 0.18]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Support Post */}
      <mesh castShadow position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.1, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.15} metalness={0.9} />
      </mesh>

      {/* Optical Filter/Mask Ring Holder */}
      <mesh castShadow position={[0, 0.13, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.01, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Black Anodized Double Slit Slide Plate */}
      <mesh position={[0, 0.13, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.06, 0.06, 0.003]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* High-Resolution Slit Windows (Dual luminous micro-apertures) */}
      <mesh position={[0.002, 0.13, 0.006]}>
        <boxGeometry args={[0.001, 0.024, 0.0015]} />
        <meshBasicMaterial color={colorHex} />
      </mesh>
      <mesh position={[0.002, 0.13, -0.006]}>
        <boxGeometry args={[0.001, 0.024, 0.0015]} />
        <meshBasicMaterial color={colorHex} />
      </mesh>

      {/* Aperture Component Badge */}
      <Html position={[0, 0.22, 0]} center distanceFactor={1.9}>
        <div className="bg-white/95 border border-slate-300 text-slate-800 px-1 py-0.5 rounded-sm font-mono text-[3.8px] font-bold shadow-xs whitespace-nowrap select-none pointer-events-none">
          Slits: d = {slitSeparationMm.toFixed(2)} mm
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Observation Screen, Dynamic Interference Shader & Micrometer Crosshair
// ─────────────────────────────────────────────────────────────────────────────
function ObservationScreenWithFringes({
  wavelengthNm,
  slitSeparationMm,
  screenDistanceM,
  colorHex,
  currentYMm,
  targetYMm,
  targetDisplay,
  isAligned,
}: {
  wavelengthNm: number;
  slitSeparationMm: number;
  screenDistanceM: number;
  colorHex: string;
  currentYMm: number;
  targetYMm: number;
  targetDisplay: string;
  isAligned: boolean;
}) {
  // Screen geometry is 0.01m thick, 0.32m tall, 0.45m wide along Z
  const screenX = 0.65;
  const screenHeight = 0.30;
  const screenWidth = 0.44;

  // Generate dynamic canvas texture for realistic interference fringes
  const fringeTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Clear white matte screen background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate physical parameters
    // In our 3D view, screenWidth (0.44m) represents roughly ±22 mm in real scaled fringe space
    const maxRealMm = 18.0; // From -18mm to +18mm
    const lambdaM = wavelengthNm * 1e-9;
    const dM = slitSeparationMm * 1e-3;
    const DM = screenDistanceM;

    // Draw the interference stripes
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const data = imgData.data;

    const baseColor = new THREE.Color("#38bdf8");
    const rInt = Math.floor(baseColor.r * 255);
    const gInt = Math.floor(baseColor.g * 255);
    const bInt = Math.floor(baseColor.b * 255);

    for (let x = 0; x < canvas.width; x++) {
      // Map x pixel to real mm coordinate y
      const yMm = ((x - canvas.width / 2) / (canvas.width / 2)) * maxRealMm;
      const yM = yMm * 1e-3;

      // Double slit path difference: Delta x = y * d / D
      const pathDiff = (yM * dM) / DM;
      // Phase: delta = 2 * pi * Delta x / lambda
      const phase = (2 * Math.PI * pathDiff) / lambdaM;
      // Intensity: I = cos^2(phase / 2)
      const intensity = Math.pow(Math.cos(phase / 2), 2);

      // Gaussian beam envelope to soften edges realistically
      const envelope = Math.exp(-Math.pow(yMm / 14.0, 2));

      for (let y = 0; y < canvas.height; y++) {
        const idx = (y * canvas.width + x) * 4;
        // In a true optical interference projection:
        // Where constructive (intensity = 1), luminous light-blue photons illuminate brightly
        // Where destructive (intensity = 0), zero photons arrive -> dark fringe
        const darkR = Math.round(18 * envelope + 248 * (1 - envelope));
        const darkG = Math.round(24 * envelope + 250 * (1 - envelope));
        const darkB = Math.round(38 * envelope + 252 * (1 - envelope));

        // Constructive light blue with luminous bright highlights
        const brightR = Math.min(255, Math.round(rInt + (255 - rInt) * 0.25 * intensity));
        const brightG = Math.min(255, Math.round(gInt + (255 - gInt) * 0.25 * intensity));
        const brightB = Math.min(255, Math.round(bInt + (255 - bInt) * 0.25 * intensity));

        data[idx] = Math.round(darkR * (1 - intensity) + brightR * intensity);
        data[idx + 1] = Math.round(darkG * (1 - intensity) + brightG * intensity);
        data[idx + 2] = Math.round(darkB * (1 - intensity) + brightB * intensity);
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Draw high-contrast engraved millimeter scale along screen top
    ctx.strokeStyle = "#475569";
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 13px monospace";
    ctx.lineWidth = 1.5;

    for (let mm = -15; mm <= 15; mm++) {
      const xPixel = (canvas.width / 2) + (mm / maxRealMm) * (canvas.width / 2);
      const isMajor = mm % 5 === 0;
      const tickH = isMajor ? 28 : 14;

      ctx.beginPath();
      ctx.moveTo(xPixel, 0);
      ctx.lineTo(xPixel, tickH);
      ctx.stroke();

      if (isMajor) {
        ctx.fillText(`${mm > 0 ? "+" : ""}${mm}`, xPixel - 8, 42);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }, [wavelengthNm, slitSeparationMm, screenDistanceM, colorHex]);

  // Convert current real-world mm coordinate to 3D Z offset
  // Canvas pixel x=0 (u=0) is at Z = -screenWidth/2 (-maxRealMm)
  // Canvas pixel x=width (u=1) is at Z = +screenWidth/2 (+maxRealMm)
  // Therefore positive physical yMm maps directly to +Z offset:
  const maxRealMm = 18.0;
  const currentZOffset = (currentYMm / maxRealMm) * (screenWidth / 2);
  const targetZOffset = (targetYMm / maxRealMm) * (screenWidth / 2);

  return (
    <group position={[screenX, 0.04, 0]}>
      {/* Heavy Screen Rail Carrier Clamp placed behind the screen frame */}
      <mesh castShadow position={[0.04, 0.015, 0]}>
        <boxGeometry args={[0.14, 0.03, 0.22]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Vertical Stanchion Post placed cleanly behind the screen backing */}
      <mesh castShadow position={[0.04, 0.09, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.12, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.15} metalness={0.9} />
      </mesh>

      {/* Screen Frame Bezel (Anodized Slate) */}
      <mesh castShadow position={[0, 0.17, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[screenWidth + 0.03, screenHeight + 0.03, 0.018]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Frosted Projection Face with Live Interference Fringes */}
      <mesh position={[-0.01, 0.17, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[screenWidth, screenHeight]} />
        {fringeTexture ? (
          <meshBasicMaterial map={fringeTexture} />
        ) : (
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        )}
      </mesh>

      {/* Target Crosshair Marker on Screen (Green) */}
      <group position={[-0.012, 0.17, targetZOffset]}>
        {/* Reticle Vertical Line: Green */}
        <mesh>
          <boxGeometry args={[0.001, screenHeight * 0.75, 0.0015]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        {/* Target Reticle Badge - elevated cleanly above the screen */}
        <Html position={[0, screenHeight * 0.56, 0]} center distanceFactor={1.9}>
          <div
            className={`px-1 py-0.5 rounded-sm text-[3.8px] font-mono font-bold border transition-all duration-300 shadow-xs whitespace-nowrap select-none pointer-events-none ${isAligned
              ? "bg-emerald-50 border-emerald-400 text-emerald-700 shadow-emerald-200"
              : "bg-white/95 border-emerald-500 text-emerald-800"
              }`}
          >
            TARGET: {targetDisplay}
          </div>
        </Html>
      </group>

      {/* Movable Micrometer Traveling Sensor Crosshair (White) */}
      <group position={[-0.014, 0.17, currentZOffset]}>
        {/* Micrometer Vertical Hairline: Solid White */}
        <mesh>
          <boxGeometry args={[0.001, screenHeight * 0.9, 0.0015]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Top/Bottom Calibration Index Arrows: Solid White */}
        <mesh position={[0, screenHeight * 0.42, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.005, 0.014, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, -screenHeight * 0.42, 0]}>
          <coneGeometry args={[0.005, 0.014, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Live Traveling Sensor Readout Badge - moved down clear of screen fringes */}
        <Html position={[0, -screenHeight * 0.58, 0]} center distanceFactor={1.9}>
          <div
            className={`px-1 py-0.5 rounded-sm text-[3.8px] font-mono font-black border shadow-xs whitespace-nowrap transition-colors select-none pointer-events-none ${isAligned
              ? "bg-emerald-50 border-emerald-400 text-emerald-700"
              : "bg-white/95 border-slate-300 text-slate-800"
              }`}
          >
            Sensor: y = {currentYMm.toFixed(2)} mm
          </div>
        </Html>
      </group>

      {/* Screen Distance Badge - moved higher up above target badge */}
      <Html position={[0, 0.47, 0]} center distanceFactor={1.9}>
        <div className="bg-white/95 border border-slate-300 text-slate-800 px-1 py-0.5 rounded-sm font-mono text-[3.8px] font-bold shadow-xs whitespace-nowrap select-none pointer-events-none">
          Screen: D = {screenDistanceM.toFixed(2)} m
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Coherent Laser Beam & Expanding Huygens Wave Cones
// ─────────────────────────────────────────────────────────────────────────────
function CoherentInterferenceBeams({
  colorHex,
  wavelengthNm,
}: {
  colorHex: string;
  wavelengthNm: number;
}) {
  // Laser emitter is at X = -0.72 + 0.12 = -0.60, slit mask is at X = -0.20, screen is at X = 0.65
  const emitterX = -0.60;
  const slitX = -0.20;
  const screenX = 0.64;
  const beamY = 0.17;

  // Primary collimated laser beam (from diode to double slit mask)
  const primaryBeamGeo = useMemo(() => {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(emitterX, beamY, 0),
      new THREE.Vector3(slitX, beamY, 0)
    );
    return new THREE.TubeGeometry(curve, 8, 0.003, 12, false);
  }, []);

  // Outer primary glow
  const primaryGlowGeo = useMemo(() => {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(emitterX, beamY, 0),
      new THREE.Vector3(slitX, beamY, 0)
    );
    return new THREE.TubeGeometry(curve, 8, 0.006, 12, false);
  }, []);

  // Ray 1 from Slit 1 (Z = +0.006) to screen
  const ray1Geo = useMemo(() => {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(slitX, beamY, 0.006),
      new THREE.Vector3(screenX, beamY, 0.08)
    );
    return new THREE.TubeGeometry(curve, 12, 0.0016, 8, false);
  }, []);

  // Ray 2 from Slit 2 (Z = -0.006) to screen
  const ray2Geo = useMemo(() => {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(slitX, beamY, -0.006),
      new THREE.Vector3(screenX, beamY, -0.08)
    );
    return new THREE.TubeGeometry(curve, 12, 0.0016, 8, false);
  }, []);

  // Center axial constructive ray
  const centerRayGeo = useMemo(() => {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(slitX, beamY, 0),
      new THREE.Vector3(screenX, beamY, 0)
    );
    return new THREE.TubeGeometry(curve, 12, 0.0018, 8, false);
  }, []);

  return (
    <group position={[0, 0, 0]} renderOrder={10}>
      {/* Primary Laser Core */}
      <mesh geometry={primaryBeamGeo} renderOrder={10}>
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Primary Laser Color Glow */}
      <mesh geometry={primaryGlowGeo} renderOrder={10}>
        <meshBasicMaterial color={colorHex} transparent opacity={0.7} />
      </mesh>

      {/* Coherent Diffracted Interfering Wave Rays */}
      <mesh geometry={ray1Geo} renderOrder={10}>
        <meshBasicMaterial color={colorHex} transparent opacity={0.65} />
      </mesh>
      <mesh geometry={ray2Geo} renderOrder={10}>
        <meshBasicMaterial color={colorHex} transparent opacity={0.65} />
      </mesh>
      <mesh geometry={centerRayGeo} renderOrder={10}>
        <meshBasicMaterial color={colorHex} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Cinematic Camera Transition Rig
// ─────────────────────────────────────────────────────────────────────────────
function CameraRig() {
  const controlsRef = useRef<any>(null);
  const isMissionStarted = useWaveOpticsStore((s) => s.isMissionStarted);
  const missionStartedAt = useWaveOpticsStore((s) => s.missionStartedAt);
  const currentStage = useWaveOpticsStore((s) => s.currentStage);
  const cameraTrigger = useWaveOpticsStore((s) => s.cameraTrigger);

  // Close-up zoomed in directly in front of the Detector Screen facing it head-on
  const targetCamPos = useMemo(() => new THREE.Vector3(0.05, 0.21, 0.0), []);
  const targetCamLook = useMemo(() => new THREE.Vector3(0.65, 0.21, 0.0), []);

  // Overview position matching user's exact side profile perspective
  const overviewCamPos = useMemo(() => new THREE.Vector3(-0.32, 0.32, 1.28), []);
  const overviewCamLook = useMemo(() => new THREE.Vector3(0.08, 0.16, 0.0), []);

  const holdDuration = 0.8;
  const zoomDuration = 2.4;
  const totalIntroDuration = holdDuration + zoomDuration;

  const [introFinished, setIntroFinished] = useState(false);
  const lastMissionStartedAtRef = useRef(missionStartedAt);

  useEffect(() => {
    if (missionStartedAt !== lastMissionStartedAtRef.current) {
      lastMissionStartedAtRef.current = missionStartedAt;
      setIntroFinished(false);
    }
  }, [missionStartedAt]);

  useEffect(() => {
    setIntroFinished(false);
  }, [currentStage, cameraTrigger]);

  useFrame((state) => {
    if (controlsRef.current && !introFinished) {
      if (!isMissionStarted || missionStartedAt === null) {
        state.camera.position.copy(targetCamPos);
        controlsRef.current.target.copy(targetCamLook);
        controlsRef.current.update();
      } else {
        const elapsed = (performance.now() - missionStartedAt) / 1000;
        if (elapsed <= holdDuration) {
          state.camera.position.copy(targetCamPos);
          controlsRef.current.target.copy(targetCamLook);
          controlsRef.current.update();
        } else if (elapsed < totalIntroDuration) {
          const progress = (elapsed - holdDuration) / zoomDuration;
          const rawT = Math.min(1, Math.max(0, progress));
          const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;
          state.camera.position.lerpVectors(targetCamPos, overviewCamPos, t);
          controlsRef.current.target.lerpVectors(targetCamLook, overviewCamLook, t);
          controlsRef.current.update();
        } else {
          state.camera.position.copy(overviewCamPos);
          controlsRef.current.target.copy(overviewCamLook);
          controlsRef.current.update();
          setIntroFinished(true);
        }
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0.08, 0.16, 0.0]}
      minDistance={0.4}
      maxDistance={4.5}
      maxPolarAngle={Math.PI / 2 - 0.05}
      enableDamping
      dampingFactor={0.05}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Main Wave Optics Simulation Root Scene
// ─────────────────────────────────────────────────────────────────────────────
export function WaveOpticsScene() {
  const currentStage = useWaveOpticsStore((s) => s.currentStage);
  const sliderValue = useWaveOpticsStore((s) => s.sliderValue);
  const getStageConfig = useWaveOpticsStore((s) => s.getStageConfig);
  const getPhysicsState = useWaveOpticsStore((s) => s.getPhysicsState);

  const stageConfig = useMemo(() => getStageConfig(), [getStageConfig, currentStage]);
  const physics = useMemo(() => getPhysicsState(), [getPhysicsState, currentStage, sliderValue]);

  return (
    <div className="w-full h-full relative bg-slate-50 select-none">
      <Canvas
        shadows
        camera={{ position: [-0.32, 0.32, 1.28], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#f8fafc"]} />
        <ambientLight intensity={1.35} />
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-3, 4, -2]} intensity={0.5} />

        {/* 1. Precision Dovetail Optical Rail Bench */}
        <OpticalBenchRail />

        {/* 2. Coherent Laser Emitter Unit */}
        <LaserEmitterUnit
          colorHex={stageConfig.laserHex}
          wavelengthNm={stageConfig.laserWavelengthNm}
        />

        {/* 3. Double-Slit Mask Aperture */}
        <DoubleSlitAperture
          slitSeparationMm={stageConfig.slitSeparationMm}
          colorHex={stageConfig.laserHex}
        />

        {/* 4. Observation Screen with Dynamic Interference Fringes & Micrometer */}
        <ObservationScreenWithFringes
          wavelengthNm={stageConfig.laserWavelengthNm}
          slitSeparationMm={stageConfig.slitSeparationMm}
          screenDistanceM={stageConfig.screenDistanceM}
          colorHex={stageConfig.laserHex}
          currentYMm={physics.currentYMm}
          targetYMm={physics.targetYMm}
          targetDisplay={stageConfig.targetDisplay}
          isAligned={physics.isAligned}
        />

        {/* 5. Coherent Laser Beams & Wave Rays */}
        <CoherentInterferenceBeams
          colorHex={stageConfig.laserHex}
          wavelengthNm={stageConfig.laserWavelengthNm}
        />

        {/* 6. Cinematic Camera Rig */}
        <CameraRig />
      </Canvas>
    </div>
  );
}

export default WaveOpticsScene;
