"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  useGeoSyncStore,
  R_EARTH_KM,
  R_GEO_KM,
  R_VIS_SCALE,
  stationXYZ,
} from "./GeoSyncStore";

// ─── Procedural High-Fidelity Earth Canvas Texture ─────────────────────────────
function createEarthCanvasTexture(): THREE.CanvasTexture {
  if (typeof window === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }

  const canvas = window.document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Deep Ocean Base with Depth Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  oceanGrad.addColorStop(0.0, "#081d38"); // Polar deeps
  oceanGrad.addColorStop(0.2, "#0b2545");
  oceanGrad.addColorStop(0.5, "#10345e"); // Equatorial warm shelf
  oceanGrad.addColorStop(0.8, "#0b2545");
  oceanGrad.addColorStop(1.0, "#081d38");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // 2. Continents (Equirectangular Projection)
  // Mapping: Lon [-180°, +180°] -> X [0, 2048], Lat [+90°N, -90°S] -> Y [0, 1024]
  // In Three.js SphereGeometry:
  //   u=0.5, v=0.5 maps to (2, 0, 0) which is Lon 0°, Lat 0°!
  //   X = 1024 is the Prime Meridian (Greenwich / Station Alpha)!
  const lonToX = (lonDeg: number) => ((lonDeg + 180) / 360) * 2048;
  const latToY = (latDeg: number) => ((90 - latDeg) / 180) * 1024;

  const drawPolygon = (
    pts: [number, number][],
    fillColor: string,
    strokeColor?: string
  ) => {
    if (pts.length < 3) return;
    ctx.beginPath();
    ctx.moveTo(lonToX(pts[0][0]), latToY(pts[0][1]));
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(lonToX(pts[i][0]), latToY(pts[i][1]));
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  };

  // ── Africa & Middle East ──
  drawPolygon(
    [
      [-17, 30], [-10, 36], [10, 37], [25, 32], [35, 30],
      [51, 12], [43, 8], [40, -4], [33, -25], [20, -34],
      [18, -34], [12, -18], [9, 5], [0, 6], [-15, 11], [-17, 21]
    ],
    "#1e4620", "#143616"
  );
  // Sahara Desert Overlay
  drawPolygon(
    [
      [-15, 28], [-5, 33], [12, 33], [30, 30], [35, 23],
      [32, 16], [15, 14], [-5, 15], [-15, 20]
    ],
    "#a17838"
  );
  // Arabian Peninsula
  drawPolygon(
    [[35, 30], [42, 32], [55, 25], [59, 22], [54, 16], [44, 13]],
    "#b58942"
  );

  // ── Europe ──
  drawPolygon(
    [
      [-9, 36], [-9, 43], [-1, 48], [-4, 52], [5, 54],
      [10, 56], [22, 60], [28, 70], [38, 68], [35, 52],
      [28, 45], [22, 40], [14, 41], [15, 38], [0, 38]
    ],
    "#235928", "#17401c"
  );
  // British Isles & Scandinavia
  drawPolygon([[-6, 50], [2, 52], [0, 58], [-6, 58]], "#2d6a4f");
  drawPolygon([[5, 58], [15, 58], [25, 71], [12, 70]], "#1b4332");

  // ── Asia ──
  drawPolygon(
    [
      [38, 68], [60, 72], [100, 77], [140, 72], [170, 65],
      [145, 55], [130, 42], [120, 32], [108, 22], [103, 10],
      [90, 22], [80, 10], [70, 24], [60, 25], [52, 36], [40, 40]
    ],
    "#22543d", "#143616"
  );
  // Gobi & Central Asian Steppe
  drawPolygon(
    [[55, 45], [80, 48], [105, 46], [115, 40], [90, 36], [65, 38]],
    "#8c723e"
  );
  // India
  drawPolygon([[70, 24], [78, 28], [88, 22], [80, 8]], "#2d6a4f");
  // Japan Archipelago
  drawPolygon([[130, 32], [140, 36], [142, 44], [135, 38]], "#1e4620");

  // ── North America ──
  drawPolygon(
    [
      [-168, 65], [-140, 70], [-100, 72], [-65, 68], [-55, 50],
      [-70, 42], [-80, 25], [-97, 26], [-97, 18], [-105, 23],
      [-118, 32], [-124, 40], [-125, 49], [-140, 60], [-165, 60]
    ],
    "#1e4620", "#143616"
  );
  // Greenland
  drawPolygon([[-55, 60], [-20, 70], [-25, 82], [-60, 82]], "#dbeafe");

  // ── South America ──
  drawPolygon(
    [
      [-80, 9], [-60, 11], [-35, -5], [-35, -12], [-42, -22],
      [-52, -32], [-65, -54], [-75, -50], [-72, -35], [-80, -18], [-80, -2]
    ],
    "#15803d", "#14532d"
  );

  // ── Australia ──
  drawPolygon(
    [
      [114, -22], [125, -15], [136, -12], [148, -20],
      [152, -30], [148, -38], [138, -35], [120, -35], [114, -30]
    ],
    "#9a6b32", "#784f1f"
  );

  // ── Antarctica (Bottom Ice Shelf) ──
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(0, latToY(-72), 2048, 1024 - latToY(-72));
  // Arctic Ice Cap (Top)
  ctx.fillRect(0, 0, 2048, latToY(82));

  // 3. Coordinate Graticule (Parallels & Meridians)
  ctx.strokeStyle = "rgba(56, 189, 248, 0.16)";
  ctx.lineWidth = 1.0;

  // Meridians every 30°
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = lonToX(lon);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  // Parallels every 30°
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = latToY(lat);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }

  // 4. Prime Meridian (Lon 0° = X: 1024)
  ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(1024, 0);
  ctx.lineTo(1024, 1024);
  ctx.stroke();

  // 5. Prominent Glowing Equator (Lat 0° = Y: 512)
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 3.5;
  ctx.shadowColor = "#0284c7";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(0, 512);
  ctx.lineTo(2048, 512);
  ctx.stroke();
  ctx.shadowBlur = 0; // reset

  // 6. Ground Station Alpha Target Crosshair at (Lon 0°, Lat 0°) -> (1024, 512)
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.arc(1024, 512, 12, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ─── Earth Globe (Rotates CCW around +Y axis) ──────────────────────────────────
function EarthGlobe() {
  const earthAngleRad = useGeoSyncStore((s) => s.earthAngleRad);
  const globeGroupRef = useRef<THREE.Group>(null);

  const earthTexture = useMemo(() => createEarthCanvasTexture(), []);

  useFrame(() => {
    if (globeGroupRef.current) {
      // Rotate Earth counter-clockwise around +Y axis (right-hand rule: points move +X -> -Z)
      globeGroupRef.current.rotation.y = earthAngleRad;
    }
  });

  return (
    <>
      {/* ── Fixed World Reference Geometry (Does NOT rotate with Earth) ── */}
      {/* Fixed Equatorial Reference Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.04, 2.08, 96]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Polar Axis Gimbal Rod */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 5.4, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* North Pole Arrow (+Y) */}
      <mesh position={[0, 2.75, 0]}>
        <coneGeometry args={[0.08, 0.22, 16]} />
        <meshStandardMaterial color="#0ea5e9" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* South Pole Arrow (-Y) */}
      <mesh position={[0, -2.75, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.08, 0.22, 16]} />
        <meshStandardMaterial color="#0ea5e9" metalness={0.5} roughness={0.2} />
      </mesh>

      {/* ── Rotating Earth Group ── */}
      <group ref={globeGroupRef} position={[0, 0, 0]}>
        {/* Main Textured Globe */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[2.0, 64, 64]} />
          <meshStandardMaterial
            map={earthTexture}
            roughness={0.65}
            metalness={0.12}
          />
        </mesh>

        {/* Soft Atmospheric Glow Shell */}
        <mesh>
          <sphereGeometry args={[2.08, 48, 48]} />
          <meshStandardMaterial
            color="#7dd3fc"
            transparent
            opacity={0.14}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Ground Station Alpha sits at [2.0, 0, 0] inside the Earth group */}
        {/* It naturally rotates WITH the continents and equator! */}
        <group position={[2.0, 0, 0]}>
          {/* Hexagonal Launchpad / Concrete Pedestal */}
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.26, 0.06, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.4} />
          </mesh>
          {/* Hazard Border Ring */}
          <mesh rotation={[0, 0, -Math.PI / 2]} position={[0.035, 0, 0]}>
            <ringGeometry args={[0.18, 0.22, 8]} />
            <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
          </mesh>

          {/* Stepper Tracking Mount */}
          <mesh position={[0.10, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.07, 0.14, 12]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* High-Gain Parabolic Dish (Points radially outward along local +X) */}
          <group position={[0.22, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <mesh>
              <sphereGeometry args={[0.22, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
              <meshStandardMaterial
                color="#f8fafc"
                metalness={0.8}
                roughness={0.2}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Feed Horn Emitter */}
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.16, 12]} />
              <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.23, 0]}>
              <sphereGeometry args={[0.03, 12, 12]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>

          {/* Signal Acceptance Cone (Holographic Green / Red Beam Width) */}
          <SignalBeamCone />
        </group>
      </group>
    </>
  );
}

// ─── Signal Acceptance Cone (Children of Ground Station) ───────────────────────
function SignalBeamCone() {
  const signalStrength = useGeoSyncStore((s) => s.signalStrengthPercent);
  const isLocked = signalStrength > 50;

  return (
    <mesh position={[4.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      {/* 4.5° acceptance half-angle cone expanding outward */}
      <coneGeometry args={[1.0, 9.0, 32, 1, true]} />
      <meshBasicMaterial
        color={isLocked ? "#10b981" : "#ef4444"}
        transparent
        opacity={isLocked ? 0.08 : 0.06}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── Ground Station HTML Badge (World Space) ───────────────────────────────────
function GroundStationBadge() {
  const stationPos = useGeoSyncStore((s) => s.stationPos);
  const { width, height } = useThree((s) => s.size);
  const df = 11.5 * Math.min(1.1, Math.max(0.85, Math.min(width / 1000, height / 500)));

  return (
    <group position={stationPos}>
      <Html position={[0, 0.48, 0]} center distanceFactor={df} style={{ pointerEvents: "none" }}>
        <div className="px-2.5 py-0.5 rounded-full bg-slate-900/95 border border-sky-400 text-sky-300 font-mono text-[10px] font-black tracking-wide shadow-md whitespace-nowrap">
          ▲ GROUND STATION ALPHA (0.0° Lat, 0.0° Lon)
        </div>
      </Html>
    </group>
  );
}

// ─── Satellite Vehicle (Orbits CCW at radius r and inclination i) ─────────────
function SatelliteVehicle() {
  const satellitePos       = useGeoSyncStore((s) => s.satellitePos);
  const currentVelocityKms = useGeoSyncStore((s) => s.currentVelocityKms);
  const orbitalPeriodHours = useGeoSyncStore((s) => s.orbitalPeriodHours);
  const signalStrength     = useGeoSyncStore((s) => s.signalStrengthPercent);
  const angularDriftDeg    = useGeoSyncStore((s) => s.angularDriftDeg);

  const { width, height } = useThree((s) => s.size);
  const df = 11.5 * Math.min(1.1, Math.max(0.85, Math.min(width / 1000, height / 500)));

  // Orient satellite so its primary dish (+X) always faces toward Earth center (origin)
  const satGroupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (satGroupRef.current) {
      satGroupRef.current.position.set(...satellitePos);
      const toEarth = new THREE.Vector3(-satellitePos[0], -satellitePos[1], -satellitePos[2]).normalize();
      const localForward = new THREE.Vector3(1, 0, 0);
      satGroupRef.current.quaternion.setFromUnitVectors(localForward, toEarth);
    }
  });

  return (
    <group ref={satGroupRef}>
      {/* ── Main Satellite Bus (Gold MLI Insulation) ── */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.54, 0.54, 0.54]} />
        <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.22} />
      </mesh>
      {/* Avionics Trim Band */}
      <mesh>
        <boxGeometry args={[0.57, 0.57, 0.20]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* ── Solar Array Panels (Left & Right Wings) ── */}
      {[-1.25, 1.25].map((zOff, idx) => (
        <group key={idx} position={[0, 0, zOff]}>
          {/* Panel Base */}
          <mesh castShadow>
            <boxGeometry args={[0.44, 0.04, 1.5]} />
            <meshStandardMaterial color="#1e3a8a" metalness={0.88} roughness={0.18} />
          </mesh>
          {/* Photovoltaic Cell Grid Wireframe */}
          <mesh position={[0, 0.025, 0]}>
            <boxGeometry args={[0.42, 0.005, 1.46]} />
            <meshStandardMaterial color="#38bdf8" wireframe />
          </mesh>
          {/* Support Boom */}
          <mesh position={[0, 0, idx === 0 ? 0.82 : -0.82]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.22, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* ── Earth-Facing High-Gain Antenna Dish (Local +X) ── */}
      <group position={[0.34, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.26, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.16, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.18, 8]} />
          <meshStandardMaterial color="#e0e7ff" metalness={0.8} />
        </mesh>
        <mesh position={[0.25, 0, 0]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* ── Xenon Ion Thruster Engine (Local -X = Away from Earth) ── */}
      <mesh position={[-0.34, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.17, 0.22, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Ion Plasma Glow */}
      <mesh position={[-0.48, 0, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
      </mesh>

      {/* ── Telemetry HUD Badge ── */}
      <Html position={[0, 1.0, 0]} center distanceFactor={df} style={{ pointerEvents: "none" }}>
        <div className="px-2.5 py-0.5 rounded-md bg-slate-900/95 border border-amber-400 text-amber-300 font-mono text-[11px] font-black tracking-wide shadow-lg whitespace-nowrap">
          {"SAT · v = " + currentVelocityKms.toFixed(2) + " km/s · T = " + orbitalPeriodHours.toFixed(1) + " h"}
        </div>
      </Html>

      {/* ── Lock Status HUD Badge ── */}
      <Html position={[0, -0.95, 0]} center distanceFactor={df} style={{ pointerEvents: "none" }}>
        <div
          className={`px-2.5 py-0.5 rounded-full border font-mono text-[10px] font-black shadow-md whitespace-nowrap ${
            signalStrength > 60
              ? "bg-emerald-950/95 border-emerald-400 text-emerald-300"
              : "bg-red-950/95 border-red-500 text-red-300"
          }`}
        >
          {signalStrength > 60
            ? "⬤ BEAM LOCKED · " + signalStrength + "%"
            : "⬤ DRIFTING (" + angularDriftDeg.toFixed(1) + "°) · SIGNAL LOST"}
        </div>
      </Html>
    </group>
  );
}

// ─── Laser Lock Link (Station Dish ↔ Satellite Vehicle) ────────────────────────
function LaserLockLink() {
  const stationPos = useGeoSyncStore((s) => s.stationPos);
  const satPos     = useGeoSyncStore((s) => s.satellitePos);
  const sig        = useGeoSyncStore((s) => s.signalStrengthPercent);

  const groupRef = useRef<THREE.Group>(null);
  const coreRef  = useRef<THREE.Mesh>(null);
  const glowRef  = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!groupRef.current || !coreRef.current || !glowRef.current) return;

    const stV  = new THREE.Vector3(...stationPos);
    const satV = new THREE.Vector3(...satPos);
    const dist = stV.distanceTo(satV);
    const mid  = stV.clone().add(satV).multiplyScalar(0.5);
    const dir  = satV.clone().sub(stV).normalize();

    // Align cylinder (Three.js cylinder defaults along Y-axis)
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);

    groupRef.current.position.copy(mid);
    groupRef.current.quaternion.copy(quat);

    // Scale Y by distance (zero memory allocation per frame!)
    coreRef.current.scale.set(1, dist, 1);
    glowRef.current.scale.set(1, dist, 1);

    const locked = sig > 50;
    const coreMat = coreRef.current.material as THREE.MeshBasicMaterial;
    const glowMat = glowRef.current.material as THREE.MeshBasicMaterial;

    coreMat.color.set(locked ? "#34d399" : "#f87171");
    coreMat.opacity = locked ? 0.95 : 0.45;
    glowMat.color.set(locked ? "#10b981" : "#ef4444");
    glowMat.opacity = locked ? 0.28 : 0.12;
  });

  return (
    <group ref={groupRef}>
      {/* Laser Core */}
      <mesh ref={coreRef}>
        <cylinderGeometry args={[0.02, 0.02, 1.0, 12]} />
        <meshBasicMaterial transparent opacity={0.9} />
      </mesh>
      {/* Outer Glow */}
      <mesh ref={glowRef}>
        <cylinderGeometry args={[0.07, 0.07, 1.0, 12]} />
        <meshBasicMaterial transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

// ─── Orbital Trajectory Ring (Rotated by Inclination around X-axis) ────────────
function OrbitalTrajectoryRing() {
  const currentRadiusKm       = useGeoSyncStore((s) => s.currentRadiusKm);
  const currentInclinationDeg = useGeoSyncStore((s) => s.currentInclinationDeg);

  const rVis   = currentRadiusKm * R_VIS_SCALE;
  const incRad = (currentInclinationDeg * Math.PI) / 180.0;

  return (
    <group rotation={[incRad, 0, 0]}>
      {/* Orbit Ring in tilted plane */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[rVis - 0.035, rVis + 0.035, 128]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Scene Controller (Drives physics simulation tick) ─────────────────────────
function SceneController() {
  const update = useGeoSyncStore((s) => s.updateAnimationStep);
  useFrame((_, delta) => {
    update(Math.min(delta, 0.05)); // clamp delta to 50ms max to prevent jump
  });
  return null;
}

// ─── Main 3D Canvas Scene ──────────────────────────────────────────────────────
export function GeoSyncScene() {
  const geoRVis = R_GEO_KM * R_VIS_SCALE; // ~13.23 scene-units

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        camera={{
          position: [geoRVis * 0.75, geoRVis * 0.45, geoRVis * 0.85],
          fov: 46,
          near: 0.1,
          far: 300,
        }}
      >
        {/* Light theme aerospace lab sky */}
        <color attach="background" args={["#f1f5f9"]} />
        <fog attach="fog" args={["#f1f5f9", 35, 120]} />

        {/* Studio daylight illumination */}
        <ambientLight intensity={0.9} color="#ffffff" />
        <directionalLight
          position={[30, 35, 25]}
          intensity={1.6}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={150}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
          shadow-bias={-0.0005}
        />
        <hemisphereLight groundColor="#cbd5e1" color="#ffffff" intensity={0.5} />

        {/* Equatorial Grid */}
        <gridHelper args={[40, 40, "#94a3b8", "#e2e8f0"]} position={[0, -0.05, 0]} />

        {/* Scene Components */}
        <SceneController />
        <EarthGlobe />
        <GroundStationBadge />
        <SatelliteVehicle />
        <LaserLockLink />
        <OrbitalTrajectoryRing />

        <OrbitControls
          target={[0, 0, 0]}
          minDistance={4}
          maxDistance={45}
          enablePan={true}
          enableZoom={true}
          enableDamping={true}
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}
