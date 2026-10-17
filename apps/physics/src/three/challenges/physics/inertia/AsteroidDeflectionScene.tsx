"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  useAsteroidDeflectionStore,
  AsteroidWall,
  AsteroidRockItem,
} from "./AsteroidDeflectionStore";
import { JetFighter } from "@/three/kit/physics/JetFighter";

// -------------------------------------------------------------
// Cosmic Starfield & Distant Nebulae
// -------------------------------------------------------------

// -------------------------------------------------------------
// Majestic Distant Ringed Planet & Glowing Nebula Clouds
// -------------------------------------------------------------
function DistantCelestialEnvironment() {
  const planetRingRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (planetRingRef.current) {
      planetRingRef.current.rotation.z += delta * 0.02;
    }
  });

  return (
    <group>
      {/* Luminous Cosmic Sky Dome */}
      <mesh>
        <sphereGeometry args={[750, 32, 16]} />
        <meshBasicMaterial
          color="#1e3a8a"
          side={THREE.BackSide}
          transparent
          opacity={0.65}
        />
      </mesh>
      {/* Giant Luminous Ringed Gas Giant Planet */}
      <group position={[170, 60, 480]}>
        <mesh>
          <sphereGeometry args={[65, 32, 32]} />
          <meshStandardMaterial
            color="#1e3a8a"
            emissive="#1e40af"
            emissiveIntensity={0.35}
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
        {/* Planet Ring System */}
        <mesh ref={planetRingRef} rotation={[0.65, 0.2, 0.4]}>
          <ringGeometry args={[78, 125, 64]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
          />
        </mesh>
        <pointLight color="#60a5fa" intensity={3} distance={300} />
      </group>

      {/* Luminous Nebula Cloud 1 (Cyan/Teal Horizon Glow) */}
      <mesh position={[-140, 70, 320]} rotation={[0.2, 0.4, 0]}>
        <planeGeometry args={[260, 180]} />
        <meshBasicMaterial
          color="#0284c7"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Luminous Nebula Cloud 2 (Deep Violet / Indigo Cosmic Haze) */}
      <mesh position={[110, -50, 420]} rotation={[-0.3, -0.2, 0.5]}>
        <planeGeometry args={[240, 170]} />
        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.30}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Luminous Nebula Cloud 3 (Electric Blue Ambient Core) */}
      <mesh position={[-60, -70, 560]} rotation={[0.1, -0.4, -0.3]}>
        <planeGeometry args={[280, 190]} />
        <meshBasicMaterial
          color="#2563eb"
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function CosmicStarfield() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 2400;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx] = (Math.random() - 0.5) * 750;
      pos[idx + 1] = (Math.random() - 0.5) * 550;
      pos[idx + 2] = Math.random() * 1250 - 150;

      const tint = Math.random();
      if (tint > 0.8) {
        col[idx] = 0.4; col[idx + 1] = 0.8; col[idx + 2] = 1.0;
      } else if (tint > 0.6) {
        col[idx] = 0.95; col[idx + 1] = 0.65; col[idx + 2] = 1.0;
      } else {
        col[idx] = 0.95; col[idx + 1] = 0.95; col[idx + 2] = 1.0;
      }
    }
    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.004;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={1.6}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

// -------------------------------------------------------------
// Player Jet Fighter (using kit/physics/JetFighter.tsx)
// -------------------------------------------------------------
function PlayerJet() {
  const rocketPos = useAsteroidDeflectionStore((s) => s.rocketPos);
  const rocketRoll = useAsteroidDeflectionStore((s) => s.rocketRoll);
  const activeRCS = useAsteroidDeflectionStore((s) => s.activeRCS);

  const groupRef = useRef<THREE.Group>(null);
  const rcsLeftRef = useRef<THREE.Mesh>(null);
  const rcsRightRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!groupRef.current) return;

    groupRef.current.position.set(rocketPos.x, rocketPos.y, rocketPos.z);
    groupRef.current.rotation.z = rocketRoll;
    groupRef.current.rotation.x = -0.02;

    if (rcsLeftRef.current) {
      const showLeft = activeRCS === "left" || activeRCS === "stabilize";
      rcsLeftRef.current.visible = showLeft;
      if (showLeft) {
        const s = 1.0 + Math.random() * 0.5;
        rcsLeftRef.current.scale.set(s, s * 1.4, s);
      }
    }

    if (rcsRightRef.current) {
      const showRight = activeRCS === "right" || activeRCS === "stabilize";
      rcsRightRef.current.visible = showRight;
      if (showRight) {
        const s = 1.0 + Math.random() * 0.5;
        rcsRightRef.current.scale.set(s, s * 1.4, s);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <group rotation={[0, -Math.PI / 2, 0]} scale={[1.15, 1.15, 1.15]}>
        <JetFighter
          variant="player"
          hasProbe={false}
          showLabels={false}
        />
      </group>

      <mesh
        ref={rcsLeftRef}
        position={[-2.4, 0.4, -0.5]}
        rotation={[0, 0, Math.PI / 2]}
        visible={false}
      >
        <coneGeometry args={[0.25, 1.2, 8]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} />
      </mesh>

      <mesh
        ref={rcsRightRef}
        position={[2.4, 0.4, -0.5]}
        rotation={[0, 0, -Math.PI / 2]}
        visible={false}
      >
        <coneGeometry args={[0.25, 1.2, 8]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// Tumbling Physical Asteroid Rock Mesh
// -------------------------------------------------------------
function TumblingAsteroid({ rock }: { rock: AsteroidRockItem }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.position.set(rock.x, rock.y, rock.z);
      meshRef.current.rotation.x += rock.rotSpeed[0] * delta;
      meshRef.current.rotation.y += rock.rotSpeed[1] * delta;
      meshRef.current.rotation.z += rock.rotSpeed[2] * delta;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[rock.x, rock.y, rock.z]}
      scale={rock.scale}
      rotation={rock.rot}
      castShadow
      receiveShadow
    >
      {rock.geoVariant === "dodeca" ? (
        <dodecahedronGeometry args={[1.0, 1]} />
      ) : (
        <icosahedronGeometry args={[1.0, 1]} />
      )}
      <meshStandardMaterial
        color={rock.color}
        roughness={0.92}
        metalness={0.12}
        flatShading
      />
    </mesh>
  );
}

// -------------------------------------------------------------
// Visual Guidance Beacons framing the safe passage
// -------------------------------------------------------------

// -------------------------------------------------------------
// Asteroid Field Perimeter Buoys & Safety Boundaries
// -------------------------------------------------------------
function AsteroidFieldBoundaries({ gateZ }: { gateZ: number }) {
  const buoys = useMemo(() => {
    const list: Array<{ x: number; z: number }> = [];
    for (let z = 20; z <= gateZ + 20; z += 50) {
      list.push({ x: -60.5, z });
      list.push({ x: 60.5, z });
    }
    return list;
  }, [gateZ]);

  return (
    <group>
      {buoys.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.25, 14, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 7, 0]}>
            <sphereGeometry args={[0.5, 12, 12]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[0, -7, 0]}>
            <sphereGeometry args={[0.5, 12, 12]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2.5} />
          </mesh>
        </group>
      ))}

      {/* Laser containment guideline along boundary */}
      <mesh position={[-60.5, 0, gateZ / 2]}>
        <boxGeometry args={[0.08, 0.08, gateZ + 40]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.25} />
      </mesh>
      <mesh position={[60.5, 0, gateZ / 2]}>
        <boxGeometry args={[0.08, 0.08, gateZ + 40]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function GuidanceBeacons({ wall }: { wall: AsteroidWall }) {
  const halfGap = wall.gapWidth / 2;
  const gapMin = wall.gapX - halfGap;
  const gapMax = wall.gapX + halfGap;

  return (
    <group>
      <group position={[gapMin, 0, wall.z]}>
        <pointLight color="#10b981" intensity={3.5} distance={25} />
        <mesh position={[0, 6, 0]}>
          <sphereGeometry args={[0.7, 12, 12]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={3} />
        </mesh>
        <mesh position={[0, -6, 0]}>
          <sphereGeometry args={[0.7, 12, 12]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={3} />
        </mesh>
      </group>

      <group position={[gapMax, 0, wall.z]}>
        <pointLight color="#10b981" intensity={3.5} distance={25} />
        <mesh position={[0, 6, 0]}>
          <sphereGeometry args={[0.7, 12, 12]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={3} />
        </mesh>
        <mesh position={[0, -6, 0]}>
          <sphereGeometry args={[0.7, 12, 12]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={3} />
        </mesh>
      </group>

      <mesh position={[wall.gapX, -4, wall.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[wall.gapWidth, 24]} />
        <meshBasicMaterial
          color={wall.cleared ? "#38bdf8" : "#10b981"}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// Extraction Warp Gate at Sector End
// -------------------------------------------------------------
function WarpGate({ gateZ }: { gateZ: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.2;
    }
  });

  return (
    <group position={[0, 0, gateZ]}>
      <mesh ref={ringRef}>
        <torusGeometry args={[14, 0.8, 16, 48]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#22d3ee"
          emissiveIntensity={2.4}
          roughness={0.2}
        />
      </mesh>
      <mesh>
        <circleGeometry args={[13.2, 32]} />
        <meshBasicMaterial
          color="#0891b2"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight color="#22d3ee" intensity={5} distance={50} />
    </group>
  );
}

// -------------------------------------------------------------
// Dynamic Chase Camera Rig & Simulation Frame Tick
// -------------------------------------------------------------
// -------------------------------------------------------------
// Standard OrbitControls Camera Manager
// Allows user to freely drag, rotate, and zoom the camera angle
// -------------------------------------------------------------
function CameraManager({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const rocketPos = useAsteroidDeflectionStore((s) => s.rocketPos);
  const tick = useAsteroidDeflectionStore((s) => s.tick);
  const { camera } = useThree();
  const lastRocketPos = useRef(new THREE.Vector3(0, 0, 0));
  const isInitialized = useRef(false);

  React.useEffect(() => {
    // Initial camera view behind and slightly above the jet
    camera.position.set(0, 4.2, -14.5);
    const initialTarget = new THREE.Vector3(0, 0.4, 18);
    camera.lookAt(initialTarget);

    if (controlsRef.current) {
      controlsRef.current.target.copy(initialTarget);
      controlsRef.current.update();
    }
    lastRocketPos.current.set(0, 0, 0);
    isInitialized.current = true;
  }, [camera, controlsRef]);

  useFrame((_, delta) => {
    // Advance simulation physics
    tick(delta);

    const currentPos = new THREE.Vector3(rocketPos.x, rocketPos.y, rocketPos.z);

    // If simulation restarted back to origin, reset camera and orbit target to start position
    if (isInitialized.current && (currentPos.z < lastRocketPos.current.z - 5 || (currentPos.z === 0 && lastRocketPos.current.z !== 0))) {
      camera.position.set(0, 4.2, -14.5);
      const initialTarget = new THREE.Vector3(0, 0.4, 18);
      camera.lookAt(initialTarget);
      if (controlsRef.current) {
        controlsRef.current.target.copy(initialTarget);
        controlsRef.current.update();
      }
      lastRocketPos.current.copy(currentPos);
      return;
    }

    if (isInitialized.current && controlsRef.current) {
      // Calculate jet displacement this frame
      const dx = currentPos.x - lastRocketPos.current.x;
      const dy = currentPos.y - lastRocketPos.current.y;
      const dz = currentPos.z - lastRocketPos.current.z;

      // Translate camera and OrbitControls target along with the jet
      // Preserves whatever camera angle and zoom distance the user set via mouse/touch drag!
      camera.position.x += dx;
      camera.position.y += dy;
      camera.position.z += dz;

      controlsRef.current.target.x += dx;
      controlsRef.current.target.y += dy;
      controlsRef.current.target.z += dz;

      controlsRef.current.update();
    }

    lastRocketPos.current.copy(currentPos);
  });

  return null;
}

// -------------------------------------------------------------
// Main 3D Canvas Scene
// -------------------------------------------------------------
export function AsteroidDeflectionScene({ config }: { config?: any }) {
  const walls = useAsteroidDeflectionStore((s) => s.walls);
  const rocks = useAsteroidDeflectionStore((s) => s.rocks);
  const stageConfig = useAsteroidDeflectionStore((s) => s.stageConfig);
  const controlsRef = useRef<any>(null);

  return (
    <div className="relative w-full h-full bg-[#182952]">
      <Canvas
        camera={{ position: [0, 4.2, -14.5], fov: 65, near: 0.5, far: 2000 }}
        gl={{ antialias: true, alpha: false }}
        shadows
      >
        <color attach="background" args={["#182952"]} />
        <fog attach="fog" args={["#182952", 70, 950]} />

        {/* Brightened Cosmic Space Lighting */}
        <ambientLight intensity={1.3} color="#dbeafe" />
        <hemisphereLight args={["#93c5fd", "#1e3a8a", 1.2]} />
        <directionalLight
          position={[60, 80, -40]}
          intensity={2.6}
          color="#ffffff"
          castShadow
        />
        <directionalLight
          position={[-60, 40, 100]}
          intensity={1.2}
          color="#38bdf8"
        />
        <pointLight position={[0, 30, 80]} intensity={2.5} color="#38bdf8" distance={220} />

        {/* Cosmic Backdrop & Nebulae */}
        <CosmicStarfield />
        <DistantCelestialEnvironment />

        {/* Actual 3D Physical Rocks (1:1 with collision physics) */}
        {rocks.map((rock) => (
          <TumblingAsteroid key={rock.id} rock={rock} />
        ))}

        {/* Asteroid Field Boundary Perimeter */}
        <AsteroidFieldBoundaries gateZ={stageConfig.gateZ} />

        {/* Visual Guidance Beacons framing the primary gap */}
        {walls.map((wall) => (
          <GuidanceBeacons key={wall.id} wall={wall} />
        ))}

        {/* Warp Gate Destination */}
        <WarpGate gateZ={stageConfig.gateZ} />

        {/* The Player Jet Fighter */}
        <PlayerJet />

        {/* Orbit Controls (Drag to change camera angle, scroll to zoom) */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={3}
          maxDistance={180}
        />

        {/* Camera Tracking Manager */}
        <CameraManager controlsRef={controlsRef} />
      </Canvas>
    </div>
  );
}

export default AsteroidDeflectionScene;
