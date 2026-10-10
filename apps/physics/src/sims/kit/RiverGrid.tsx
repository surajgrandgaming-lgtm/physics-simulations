"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";

interface RiverGridProps {
  riverWidth?: number; // default 300m
  riverLength?: number; // default 700m
  riverSpeed?: number; // default 3 m/s North
  targetX?: number; // default 300m
  targetY?: number; // default 0m
  targetRadius?: number; // default 15m
  showGridLabels?: boolean;
}

// ── Low-Poly Stylized Tree Component ─────────────────────────────────────────
function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.8, 5, 6]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>
      {/* Foliage Layers */}
      <mesh position={[0, 6, 0]} castShadow>
        <coneGeometry args={[3.2, 4.5, 6]} />
        <meshStandardMaterial color="#166534" roughness={0.7} />
      </mesh>
      <mesh position={[0, 8.5, 0]} castShadow>
        <coneGeometry args={[2.5, 4.0, 6]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>
      <mesh position={[0, 10.8, 0]} castShadow>
        <coneGeometry args={[1.7, 3.2, 6]} />
        <meshStandardMaterial color="#22c55e" roughness={0.6} />
      </mesh>
    </group>
  );
}

// ── Stylized River Rock ──────────────────────────────────────────────────────
function Rock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} scale={[scale, scale * 0.7, scale]} castShadow>
      <dodecahedronGeometry args={[2, 1]} />
      <meshStandardMaterial color="#475569" roughness={0.8} />
    </mesh>
  );
}

// ── Floating Water Buoy Marker ───────────────────────────────────────────────
function RiverBuoy({ position, label }: { position: [number, number, number]; label: string }) {
  const buoyRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (buoyRef.current) {
      buoyRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2 + position[0]) * 0.25;
      buoyRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.5) * 0.08;
    }
  });

  return (
    <group ref={buoyRef} position={position}>
      {/* Buoy Base Float */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.2, 1.4, 0.8, 12]} />
        <meshStandardMaterial color="#eab308" metalness={0.2} roughness={0.4} />
      </mesh>
      {/* Warning Ring */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.9, 12]} />
        <meshStandardMaterial color="#0284c7" />
      </mesh>
      {/* Pulsing Light Beacon */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
      </mesh>
      {/* Label */}
      <Html position={[0, 2.5, 0]} center distanceFactor={80}>
        <span className="text-[10px] font-mono font-bold text-yellow-300 bg-slate-950/85 px-1.5 py-0.5 rounded border border-yellow-500/50 whitespace-nowrap shadow">
          {label}
        </span>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main River Environment Component
// ─────────────────────────────────────────────────────────────────────────────
export function RiverGrid({
  riverWidth = 300,
  riverLength = 700,
  riverSpeed = 3,
  targetX = 300,
  targetY = 0,
  targetRadius = 16,
  showGridLabels = true,
}: RiverGridProps) {
  const flowMeshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // ── High-Contrast Hydrodynamic Flow Arrow & Foam Wake Streamer ───────────
  const flowTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Glowing hydrodynamic chevron head at top (North)
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Trailing foam wake body (fading towards tail)
    const bodyGrad = ctx.createLinearGradient(64, 250, 64, 20);
    bodyGrad.addColorStop(0.0, "rgba(56, 189, 248, 0.0)");
    bodyGrad.addColorStop(0.2, "rgba(56, 189, 248, 0.4)");
    bodyGrad.addColorStop(0.65, "rgba(186, 230, 253, 0.85)");
    bodyGrad.addColorStop(1.0, "rgba(255, 255, 255, 1.0)");

    // Aerodynamic tapered flow streamer
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(64, 15);      // Forward tip (North)
    ctx.lineTo(92, 60);      // Right shoulder
    ctx.lineTo(76, 240);     // Right tail
    ctx.quadraticCurveTo(64, 255, 52, 240); // Tail curve
    ctx.lineTo(36, 60);      // Left shoulder
    ctx.closePath();
    ctx.fill();

    // Sharp glowing velocity chevron arrow in front
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(42, 65);
    ctx.lineTo(64, 25);
    ctx.lineTo(86, 65);
    ctx.stroke();

    // Secondary trailing chevron
    ctx.strokeStyle = "rgba(186, 230, 253, 0.75)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(48, 95);
    ctx.lineTo(64, 60);
    ctx.lineTo(80, 95);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // ── High-Performance GPU Water Shader ──────────────────────────────────────
  const waterMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uRiverSpeed: { value: riverSpeed },
        uRiverWidth: { value: riverWidth },
        uSunDir: { value: new THREE.Vector3(5.0, 10.0, 5.0).normalize() },
        uDeepColor: { value: new THREE.Color("#03507d") },      // Deep vibrant river blue
        uShallowColor: { value: new THREE.Color("#0284c7") },   // Crystal turquoise
        uFoamColor: { value: new THREE.Color("#e0f2fe") },      // Soft white-cyan foam
      },
      vertexShader: `
        uniform float uTime;
        uniform float uRiverSpeed;

        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        varying float vWaveHeight;

        // Directional wave rolling North (along local +Y, which is World -Z)
        float calculateWave(vec2 p, float t, float speed) {
          float flow = t * speed * 0.75;
          // Waves elongated along the river channel, moving smoothly North
          float w1 = sin(p.y * 0.05 - flow * 1.2) * 0.32;
          float w2 = cos(p.x * 0.035 + p.y * 0.03 - flow * 0.8) * 0.2;
          float w3 = sin(p.y * 0.12 - flow * 1.8 + p.x * 0.05) * 0.1;
          return w1 + w2 + w3;
        }

        void main() {
          vUv = uv;
          vec3 pos = position;

          // Displace along local Z (World Y)
          float wave = calculateWave(pos.xy, uTime, uRiverSpeed);
          pos.z += wave;
          vWaveHeight = wave;

          // Compute analytical normal
          float eps = 0.5;
          float waveX = calculateWave(pos.xy + vec2(eps, 0.0), uTime, uRiverSpeed);
          float waveY = calculateWave(pos.xy + vec2(0.0, eps), uTime, uRiverSpeed);
          vec3 localNormal = normalize(vec3(-(waveX - wave) / eps, -(waveY - wave) / eps, 1.0));

          vNormal = normalMatrix * localNormal;
          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPos = worldPos.xyz;

          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uRiverSpeed;
        uniform float uRiverWidth;
        uniform vec3 uDeepColor;
        uniform vec3 uShallowColor;
        uniform vec3 uFoamColor;
        uniform vec3 uSunDir;

        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        varying float vWaveHeight;

        // Smooth directional flow wave harmonic (elongated 4:1 along river flow direction)
        float riverFlowPattern(vec2 p, float flowZ) {
          // p.x is across the river (0 to width), flowZ is along the river
          float xCoord = p.x * 0.09;
          float zCoord = flowZ * 0.024;

          float r1 = sin(xCoord * 2.5 + sin(zCoord * 4.0)) * 0.45;
          float r2 = cos(zCoord * 5.5 + sin(xCoord * 3.0)) * 0.35;
          float r3 = sin((xCoord * 1.8 - zCoord * 3.2) * 1.5) * 0.25;
          float r4 = cos(zCoord * 8.0 + cos(xCoord * 4.0)) * 0.15;

          return (r1 + r2 + r3 + r4) * 0.5 + 0.5;
        }

        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(cameraPosition - vWorldPos);
          vec3 L = normalize(uSunDir);
          vec3 H = normalize(L + V);

          // Distance from shorelines (0.0 at shoreline, 1.0 in river center)
          float shoreDist = min(vUv.x, 1.0 - vUv.x) * 2.0;

          // Flow coordinates: North is -Z in world coords (matching boat drift)
          // (z + v*t) = const implies z decreases (moves towards -Z / North)
          float flowZ = (vWorldPos.z + uTime * uRiverSpeed * 2.8);

          // Longitudinal flowing water surface ripples
          float ripple1 = riverFlowPattern(vec2(vWorldPos.x, 0.0), flowZ);
          float ripple2 = riverFlowPattern(vec2(vWorldPos.x + 12.0, 0.0), flowZ * 1.35 + 8.0);
          float streamFilaments = pow(ripple1 * 0.6 + ripple2 * 0.4, 2.2);

          // Deep river gradient: turquoise near banks, deep marine sapphire in main channel
          vec3 waterColor = mix(uShallowColor, uDeepColor, smoothstep(0.0, 0.38, shoreDist));

          // Shimmering directional river streamlines running along the flow
          waterColor += vec3(0.25, 0.48, 0.65) * streamFilaments * 0.55;

          // Subtle foam wake crests aligned with current
          float foamLines = smoothstep(0.68, 0.88, streamFilaments);
          waterColor = mix(waterColor, uFoamColor, foamLines * 0.35);

          // Gentle shore foam along left and right banks
          float shoreNoise = sin(vWorldPos.z * 0.15 + uTime * 2.5) * 0.015;
          float shoreFoam = smoothstep(0.045 + shoreNoise, 0.005, shoreDist);
          waterColor = mix(waterColor, uFoamColor, shoreFoam * 0.85);

          // Fresnel reflection (sky gleam on glancing angles)
          float fresnel = pow(1.0 - max(dot(V, N), 0.0), 3.0);
          vec3 skyReflection = vec3(0.65, 0.88, 1.0);
          waterColor = mix(waterColor, skyReflection, fresnel * 0.45);

          // Sun specular glint
          float spec = pow(max(dot(N, H), 0.0), 36.0);
          waterColor += vec3(1.0, 0.98, 0.9) * spec * 0.8;

          gl_FragColor = vec4(waterColor, 0.94);
        }
      `,
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide,
    });
  }, [riverSpeed, riverWidth]);

  // Generate trees along west & east shores
  const westTrees = useMemo(() => {
    const trees = [];
    for (let y = -320; y <= 320; y += 28) {
      trees.push({
        x: -25 - Math.random() * 60,
        y: y + (Math.random() - 0.5) * 15,
        scale: 0.9 + Math.random() * 0.6,
      });
      trees.push({
        x: -45 - Math.random() * 50,
        y: y + (Math.random() - 0.5) * 20,
        scale: 1.1 + Math.random() * 0.7,
      });
    }
    return trees;
  }, []);

  const eastTrees = useMemo(() => {
    const trees = [];
    for (let y = -320; y <= 320; y += 28) {
      // Don't place tree right on the escape pad
      if (Math.abs(y - targetY) > 30) {
        trees.push({
          x: riverWidth + 25 + Math.random() * 60,
          y: y + (Math.random() - 0.5) * 15,
          scale: 0.9 + Math.random() * 0.6,
        });
      }
      trees.push({
        x: riverWidth + 45 + Math.random() * 50,
        y: y + (Math.random() - 0.5) * 20,
        scale: 1.1 + Math.random() * 0.7,
      });
    }
    return trees;
  }, [riverWidth, targetY]);

  // River current flow streamers
  const arrowCount = 160;
  const flowOffsets = useMemo(() => {
    const offsets = [];
    for (let i = 0; i < arrowCount; i++) {
      offsets.push({
        x: 15 + Math.random() * (riverWidth - 30),
        y: -350 + Math.random() * 700,
        speed: riverSpeed * (0.9 + Math.random() * 0.25),
        scale: 0.9 + Math.random() * 0.4,
      });
    }
    return offsets;
  }, [arrowCount, riverSpeed, riverWidth]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Update shader uniforms
    if (waterMaterial) {
      waterMaterial.uniforms.uTime.value = t;
      waterMaterial.uniforms.uRiverSpeed.value = riverSpeed;
    }

    // Animate high-contrast hydrodynamic surface flow streamers (moving North)
    if (flowMeshRef.current) {
      flowOffsets.forEach((arrow, idx) => {
        // River flows North (-Z in world coords)
        const currentY = ((arrow.y + arrow.speed * t * 14 + 350) % 700) - 350;
        // Position at y = 0.38 so it floats cleanly on top of wave crests
        dummy.position.set(arrow.x, 0.38, -currentY);
        dummy.rotation.set(-Math.PI / 2, 0, 0); // Flat on water surface pointing North
        dummy.scale.set(arrow.scale * 1.4, arrow.scale * 1.5, 1.0);
        dummy.updateMatrix();
        flowMeshRef.current?.setMatrixAt(idx, dummy.matrix);
      });
      flowMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* ── Underwater Riverbed Floor (Deep Oceanic Base) ── */}
      <mesh position={[riverWidth / 2, -3.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[riverWidth + 40, riverLength + 100]} />
        <meshStandardMaterial color="#071b2e" roughness={0.95} />
      </mesh>

      {/* ── Dynamic Stylized Water Surface with GPU Waves, Caustics & Foam ── */}
      <mesh
        position={[riverWidth / 2, 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={waterMaterial}
      >
        <planeGeometry args={[riverWidth, riverLength, 96, 96]} />
      </mesh>

      {/* ── Surface Flow Wake Streamers (Distinct hydrodynamic chevrons & foam moving North) ── */}
      {flowTexture && (
        <instancedMesh
          ref={flowMeshRef}
          args={[undefined, undefined, arrowCount]}
        >
          <planeGeometry args={[3.2, 13.0]} />
          <meshBasicMaterial
            map={flowTexture}
            transparent
            opacity={0.82}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </instancedMesh>
      )}

      {/* ── Wet Sand Shoreline Rims (Along West & East banks) ── */}
      <mesh position={[0.5, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, riverLength + 100]} />
        <meshStandardMaterial color="#334155" roughness={0.4} />
      </mesh>
      <mesh position={[riverWidth - 0.5, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, riverLength + 100]} />
        <meshStandardMaterial color="#334155" roughness={0.4} />
      </mesh>

      {/* ── West Shore (Lush Green Grass Land, X < 0) ── */}
      <mesh position={[-60, 0.8, 0]} receiveShadow castShadow>
        <boxGeometry args={[120, 1.6, riverLength + 100]} />
        <meshStandardMaterial color="#166534" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* West Shore Riverbank Sand/Rock Edge */}
      <mesh position={[-1.5, 0.5, 0]} receiveShadow>
        <boxGeometry args={[3, 1.1, riverLength + 100]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} />
      </mesh>

      {/* ── East Shore (Lush Green Grass Land, X > riverWidth) ── */}
      <mesh position={[riverWidth + 60, 0.8, 0]} receiveShadow castShadow>
        <boxGeometry args={[120, 1.6, riverLength + 100]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* East Shore Sandy Shore Edge */}
      <mesh position={[riverWidth + 1.5, 0.5, 0]} receiveShadow>
        <boxGeometry args={[3, 1.1, riverLength + 100]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} />
      </mesh>

      {/* ── West Shore Trees & Rocks ── */}
      {westTrees.map((t, idx) => (
        <Tree key={`wt-${idx}`} position={[t.x, 1.6, -t.y]} scale={t.scale} />
      ))}
      <Rock position={[-4, 1.2, 40]} scale={1.8} />
      <Rock position={[-6, 1.2, -80]} scale={2.2} />
      <Rock position={[-5, 1.2, -180]} scale={1.6} />

      {/* ── East Shore Trees & Rocks ── */}
      {eastTrees.map((t, idx) => (
        <Tree key={`et-${idx}`} position={[t.x, 1.6, -t.y]} scale={t.scale} />
      ))}
      <Rock position={[riverWidth + 5, 1.2, 80]} scale={1.9} />
      <Rock position={[riverWidth + 7, 1.2, -120]} scale={2.4} />

      {/* ── West Bank Agent Launch Pier / Dock (X = 0, Y = 0) ── */}
      <group position={[0, 1.0, 0]}>
        {/* Wooden / Concrete Pier extending into river */}
        <mesh position={[-4, 0.3, 0]} receiveShadow castShadow>
          <boxGeometry args={[12, 0.6, 20]} />
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.4} />
        </mesh>
        {/* Glowing Launch Pad ring only — no large text label */}
        <mesh position={[1, 0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[6, 8, 32]} />
          <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[1, 0.64, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[6, 32]} />
          <meshStandardMaterial
            color="#083344"
            emissive="#06b6d4"
            emissiveIntensity={0.6}
          />
        </mesh>
        <pointLight position={[1, 2, 0]} color="#06b6d4" distance={25} intensity={3} />
        {/* No text label — dock is visible by the glowing ring */}
      </group>

      {/* ── East Bank Escape Target Helipad (X = 300, Y = targetY) ── */}
      <group position={[targetX, 1.0, -targetY]}>
        {/* Landing Pier Deck */}
        <mesh position={[4, 0.3, 0]} receiveShadow castShadow>
          <boxGeometry args={[14, 0.6, 24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.5} />
        </mesh>
        {/* Concentric Glowing Target Rings — outer glow */}
        <mesh position={[-1, 0.67, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[targetRadius + 1.5, targetRadius + 4, 36]} />
          <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} transparent opacity={0.3} />
        </mesh>
        <mesh position={[-1, 0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[targetRadius - 1.5, targetRadius + 1.5, 36]} />
          <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-1, 0.64, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[targetRadius - 1.5, 36]} />
          <meshStandardMaterial
            color="#064e3b"
            emissive="#10b981"
            emissiveIntensity={0.8}
          />
        </mesh>
        <pointLight position={[-1, 3, 0]} color="#10b981" distance={40} intensity={5.5} />
        {/* Compact escape pad label */}
        <Html position={[-1, 4.5, 0]} center distanceFactor={120}>
          <div className="bg-emerald-950/90 border border-emerald-400/60 rounded-lg px-2.5 py-1 shadow-xl pointer-events-none whitespace-nowrap backdrop-blur">
            <span className="text-[10px] font-mono font-bold text-emerald-300">🎯 ESCAPE PAD</span>
          </div>
        </Html>
      </group>

      {/* ── Floating Navigation Buoys every 60m across river ── */}
      {showGridLabels && (
        <group>
          <RiverBuoy position={[60, 0.2, 0]} label="60m" />
          <RiverBuoy position={[120, 0.2, 0]} label="120m" />
          <RiverBuoy position={[180, 0.2, 0]} label="180m" />
          <RiverBuoy position={[240, 0.2, 0]} label="240m" />
        </group>
      )}
    </group>
  );
}
