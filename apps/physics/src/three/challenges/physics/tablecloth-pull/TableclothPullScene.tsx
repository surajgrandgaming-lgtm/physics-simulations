"use client";
/**
 * TableclothPullScene.tsx — Main R3F scene for the tablecloth-pull challenge.
 *
 * This component is loaded via next/dynamic with ssr: false in @canvas/page.tsx.
 * Three.js code NEVER executes during SSR (Directive 1).
 */

import { ChallengeCanvas } from "@/features/challenges/ChallengeCanvas";
import { Suspense, useContext } from "react";
import { RigidBody } from "@react-three/rapier";

import { PhysicsWorldProvider } from "@/three/core/physics/PhysicsWorldProvider";
import { SceneLighting } from "@/three/core/environment/SceneLighting";
import { StudioEnvironment } from "@/three/core/environment/StudioEnvironment";
import { CameraRig } from "@/three/core/environment/CameraRig";

import { TableclothMesh } from "./TableclothMesh";
import { DishStack } from "./DishStack";
import { TableclothChallengeProvider, useTableclothStore, createTableclothStore, TableclothStoreContext } from "./store";
import type { ChallengeConfig } from "@/types/content";

interface Props {
  config: ChallengeConfig;
}

/** The actual Three.js scene — rendered inside Canvas */
function Scene({ config }: Props) {
  const scene = (config as any).scene ?? {
    cameraPosition: [0, 3, 5] as [number, number, number],
    cameraTarget: [0, 0.5, 0] as [number, number, number],
    fov: 50,
  };
  const physics = (config as any).physics ?? {
    gravity: [0, -9.81, 0] as [number, number, number],
  };

  return (
    <>
      <CameraRig
        position={scene.cameraPosition}
        target={scene.cameraTarget}
        fov={scene.fov}
      />
      <SceneLighting />
      <StudioEnvironment />

      <PhysicsWorldProvider gravity={physics.gravity as [number, number, number]}>
        {/* Table surface (fixed rigid body) */}
        <RigidBody type="fixed" friction={0.4} restitution={0}>
          <mesh
            castShadow
            receiveShadow
            position={[0, physics.tableDimensions.height / 2, 0]}
          >
            <boxGeometry
              args={[
                physics.tableDimensions.width,
                physics.tableDimensions.thickness,
                physics.tableDimensions.depth,
              ]}
            />
            <meshStandardMaterial color="#5c3d2e" roughness={0.7} metalness={0.1} />
          </mesh>
          {/* Table legs */}
          {[[-1.3, -0.8], [-1.3, 0.8], [1.3, -0.8], [1.3, 0.8]].map(([lx, lz], i) => (
            <mesh key={i} position={[lx, physics.tableDimensions.height / 2 - 0.4, lz]}>
              <cylinderGeometry args={[0.04, 0.04, physics.tableDimensions.height - 0.05, 8]} />
              <meshStandardMaterial color="#3d2010" roughness={0.9} />
            </mesh>
          ))}
        </RigidBody>

        {/* Tablecloth */}
        <TableclothMesh
          width={physics.clothDimensions.width}
          depth={physics.clothDimensions.depth}
          friction={physics.clothFriction.clothToTable}
          tableHeight={physics.tableDimensions.height}
        />

        {/* Dishes */}
        <DishStack
          dishes={physics.dishes as Parameters<typeof DishStack>[0]["dishes"]}
          tableHeight={physics.tableDimensions.height}
          tableWidth={physics.tableDimensions.width}
          tableDepth={physics.tableDimensions.depth}
        />
      </PhysicsWorldProvider>

      {/* Subtle background */}
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#0d0d1a" />
      </mesh>
    </>
  );
}

/** HUD overlay showing status */
function SceneHUD() {
  const status = useTableclothStore((s) => s.status);
  const stars = useTableclothStore((s) => s.stars);
  const maxDisp = useTableclothStore((s) => s.maxDishDisplacement as number);

  if (status === "idle") return null;

  return (
    <div className="absolute top-4 left-4 pointer-events-none">
      {status === "success" && (
        <div className="bg-green-500/20 border border-green-400 rounded-lg px-4 py-2 backdrop-blur">
          <p className="text-green-300 font-bold text-lg">
            {"⭐".repeat(stars)} Success!
          </p>
          <p className="text-green-200 text-sm">
            Max dish moved: {(maxDisp * 100).toFixed(1)} cm
          </p>
        </div>
      )}
      {status === "fail" && (
        <div className="bg-red-500/20 border border-red-400 rounded-lg px-4 py-2 backdrop-blur">
          <p className="text-red-300 font-bold text-lg">💥 A dish fell!</p>
          <p className="text-red-200 text-sm">Try pulling faster</p>
        </div>
      )}
      {status === "running" && (
        <div className="bg-blue-500/20 border border-blue-400 rounded-lg px-3 py-1 backdrop-blur">
          <p className="text-blue-300 text-sm animate-pulse">Simulating…</p>
        </div>
      )}
    </div>
  );
}

/**
 * Root export — wraps with the challenge store provider.
 * Loaded via next/dynamic ssr:false in @canvas/page.tsx.
 */
export function TableclothPullScene({ config }: Props) {
  return (
    <TableclothChallengeProvider storeFactory={createTableclothStore}>
      <div className="relative w-full h-full">
        <ChallengeCanvas
          shadows
          gl={{ antialias: true, toneMapping: 4 /* ACESFilmic */ }}
          camera={{
            position: (config as any).scene?.cameraPosition ?? [0, 3, 5],
            fov: (config as any).scene?.fov ?? 50,
          }}
          style={{ background: "linear-gradient(180deg, #0d0d1a 0%, #1a1a2e 100%)" }}
        >
          <Suspense fallback={null}>
            <Scene config={config} />
          </Suspense>
        </ChallengeCanvas>
        <SceneHUD />
      </div>
    </TableclothChallengeProvider>
  );
}

