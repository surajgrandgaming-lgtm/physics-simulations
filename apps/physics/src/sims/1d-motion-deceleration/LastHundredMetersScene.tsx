"use client";

import { useRef, useEffect, useContext, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Html } from "@react-three/drei";
import { SceneLighting } from "@topcoaching/sim-core";
import { JetFighter } from "@/sims/kit/JetFighter";
import { CarrierDeck } from "@/sims/kit/CarrierDeck";
import { TargetZoneMarker } from "@/sims/kit/TargetZoneMarker";
import { challengeAudio } from "@topcoaching/sim-core";
import {
  LastHundredMetersContext,
  useLastHundredMetersStore,
} from "./LastHundredMetersStore";

interface InnerSceneProps {
  deckLength?: number;
}

function CarrierTakeoffInner({ deckLength = 250 }: InnerSceneProps) {
  const store = useContext(LastHundredMetersContext);
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  // Physics state
  const posX = useRef(0);
  const posY = useRef(0.2);
  const pitchAngle = useRef(0);
  const velX = useRef(0);
  const hasEnded = useRef(false);
  const climbTimer = useRef(0);

  const [jetPos, setJetPos] = useState<[number, number, number]>([0, 0.2, 0]);
  const [jetPitch, setJetPitch] = useState<[number, number, number]>([0, 0, 0]);
  const [jetSpeed, setJetSpeed] = useState(0);

  const currentRound = useLastHundredMetersStore((s) => s.currentRound);
  const setLiveSpeedGetter = useLastHundredMetersStore((s) => s.setLiveSpeedGetter);
  const setLiveJetPosGetter = useLastHundredMetersStore((s) => s.setLiveJetPosGetter);
  const hasLaunched = useLastHundredMetersStore((s) => s.hasLaunched);
  const isAccelerating = useLastHundredMetersStore((s) => s.isAccelerating);
  const takeoffTriggered = useLastHundredMetersStore((s) => s.takeoffTriggered);
  const inputAcceleration = useLastHundredMetersStore((s) => s.inputAcceleration);
  const targetTakeoffSpeed = useLastHundredMetersStore((s) => s.targetTakeoffSpeed);
  const activeDeckLength = useLastHundredMetersStore((s) => s.deckLength);
  const cameraMode = useLastHundredMetersStore((s) => s.cameraMode);
  const isSoundEnabled = useLastHundredMetersStore((s) => s.isSoundEnabled);
  const status = useLastHundredMetersStore((s) => s.status);

  const finalDeck = activeDeckLength || deckLength;

  useEffect(() => {
    challengeAudio.setMuted(!isSoundEnabled);
  }, [isSoundEnabled]);

  useEffect(() => {
    setLiveSpeedGetter(() => velX.current);
    setLiveJetPosGetter(() => posX.current);
  }, [setLiveSpeedGetter, setLiveJetPosGetter]);

  // Reset physics and reset camera when round or status changes
  useEffect(() => {
    if (!hasLaunched && status === "idle") {
      posX.current = 0;
      posY.current = 0.2;
      pitchAngle.current = 0;
      velX.current = 0;
      hasEnded.current = false;
      climbTimer.current = 0;
      setJetPos([0, 0.2, 0]);
      setJetPitch([0, 0, 0]);
      setJetSpeed(0);

      // Re-center camera on the jet at start of runway
      if (controlsRef.current) {
        if (cameraMode === "orbit") {
          camera.position.set(-14, 7, 22);
          controlsRef.current.target.set(22, 1.5, 0);
        } else if (cameraMode === "cockpit") {
          camera.position.set(-12, 4.2, 0);
          controlsRef.current.target.set(30, 2, 0);
        } else if (cameraMode === "tower") {
          camera.position.set(finalDeck * 0.35, 18, 42);
          controlsRef.current.target.set(15, 2, 0);
        }
        controlsRef.current.update();
      }
    }
  }, [currentRound, status, hasLaunched, cameraMode, camera, finalDeck]);

  // Switch camera positions on mode toggle
  useEffect(() => {
    if (controlsRef.current) {
      if (cameraMode === "orbit") {
        camera.position.set(posX.current - 14, posY.current + 7, 22);
        controlsRef.current.target.set(posX.current + 22, posY.current + 1.5, 0);
      } else if (cameraMode === "cockpit") {
        camera.position.set(posX.current - 12, posY.current + 4.2, 0);
        controlsRef.current.target.set(posX.current + 35, posY.current + 2, 0);
      } else if (cameraMode === "tower") {
        camera.position.set(finalDeck * 0.35, 18, 42);
        controlsRef.current.target.set(posX.current + 15, posY.current + 2, 0);
      }
      controlsRef.current.update();
    }
  }, [cameraMode, camera, finalDeck]);

  // Trigger launch audio
  useEffect(() => {
    if (hasLaunched && !hasEnded.current) {
      challengeAudio.playLaunch();
    }
  }, [hasLaunched]);

  useFrame((state, delta) => {
    if (hasEnded.current) return;

    // ── 1. Runway Acceleration Stage ──
    if (hasLaunched && !hasEnded.current) {
      const a = inputAcceleration;
      velX.current += a * delta;
      posX.current += velX.current * delta;

      // ── 2. Takeoff / Pitch Rotation Execution ──
      if (takeoffTriggered) {
        climbTimer.current += delta;
        const currentV = velX.current;

        if (currentV >= targetTakeoffSpeed) {
          // Aerodynamic lift is sufficient! Jet climbs smoothly
          pitchAngle.current = Math.min(0.38, pitchAngle.current + delta * 0.9);
          posY.current += (currentV * 0.38) * delta;
          posX.current += currentV * 0.95 * delta;

          if (climbTimer.current > 2.2 && !hasEnded.current) {
            hasEnded.current = true;
            challengeAudio.playSuccessFanfare();
            store?.getState().recordFlightResult("airborne", currentV, posX.current);
          }
        } else {
          // Insufficient lift -> Stall and drop into ocean
          pitchAngle.current = Math.min(0.2, pitchAngle.current + delta * 0.4);
          posY.current -= 9.81 * delta * 0.8;

          if (posY.current <= -1.8 && !hasEnded.current) {
            hasEnded.current = true;
            challengeAudio.playCrashImpact();
            store?.getState().recordFlightResult("stalled_water", currentV, posX.current);
          }
        }
      }

      // ── 3. Overrunning Deck Edge without Taking Off ──
      if (posX.current >= finalDeck && !takeoffTriggered && !hasEnded.current) {
        posY.current -= 14 * delta;
        if (posY.current <= -2.5) {
          hasEnded.current = true;
          challengeAudio.playCrashImpact();
          store?.getState().recordFlightResult("overshot_deck", velX.current, finalDeck);
        }
      }

      setJetPos([posX.current, posY.current, 0]);
      setJetPitch([0, 0, pitchAngle.current]);
      setJetSpeed(velX.current);

      // Smooth Dynamic Camera Tracking
      if (controlsRef.current) {
        if (cameraMode === "cockpit") {
          state.camera.position.x = posX.current - 14;
          state.camera.position.y = posY.current + 4.2;
          state.camera.position.z = 0;
          controlsRef.current.target.set(posX.current + 30, posY.current + 2.0, 0);
          controlsRef.current.update();
        } else if (cameraMode === "tower") {
          controlsRef.current.target.set(posX.current + 10, posY.current + 1, 0);
          controlsRef.current.update();
        } else {
          // Orbit mode: smoothly track jet position along runway
          const targetX = posX.current + 20;
          const targetY = Math.max(1.5, posY.current + 1.2);
          controlsRef.current.target.x = THREE.MathUtils.lerp(controlsRef.current.target.x, targetX, 0.08);
          controlsRef.current.target.y = THREE.MathUtils.lerp(controlsRef.current.target.y, targetY, 0.08);
          controlsRef.current.update();
        }
      }
    }
  });

  const remainingDeck = Math.max(0, finalDeck - jetPos[0]);
  const isSpeedReady = jetSpeed >= targetTakeoffSpeed;

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        target={[22, 1.5, 0]}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI * 0.49}
        minDistance={3}
        maxDistance={500}
      />
      <SceneLighting />

      {/* ── Aircraft Carrier Flight Deck & Ocean ── */}
      <CarrierDeck position={[0, 0, 0]} length={finalDeck} width={28} />

      {/* Lift-Off Velocity Required Zone Marker */}
      <TargetZoneMarker position={[finalDeck * 0.65, 0.22, 0]} length={8} color="#00F0FF" pulse />

      {/* Deck End Critical Warning Barrier Line */}
      <TargetZoneMarker position={[finalDeck - 4, 0.22, 0]} length={4} color="#EF4444" pulse />

      {/* ── Naval Fighter Jet ── */}
      <group position={jetPos}>
        <JetFighter
          position={[0, 0, 0]}
          speed={jetSpeed}
          rotation={jetPitch}
        />

        {/* Floating Proximity & Airspeed HUD Tag */}
        <Html position={[0, 3.2, 0]} center distanceFactor={22} zIndexRange={[100, 0]}>
          <div className="pointer-events-none select-none flex flex-col items-center">
            <div className={`px-3 py-1 rounded-full text-[10px] font-mono font-black tracking-wider uppercase border shadow-xl backdrop-blur-md transition-colors ${
              jetPos[1] > 2
                ? "bg-emerald-500/90 text-white border-emerald-400 shadow-emerald-500/50"
                : isSpeedReady
                ? "bg-amber-500/90 text-white border-amber-400 shadow-amber-500/50 animate-pulse"
                : "bg-[#090E1C]/90 text-cyan-300 border-cyan-500/40 shadow-cyan-500/30"
            }`}>
              {jetPos[1] > 2 ? "AIRBORNE CLIMB ✈️" : isSpeedReady ? `LIFT READY: ${jetSpeed.toFixed(1)} m/s (PULL UP!)` : `RUNWAY GAP: ${remainingDeck.toFixed(1)}m`}
            </div>
            <div className="w-1.5 h-1.5 rotate-45 bg-[#090E1C] border-r border-b border-cyan-500/40 -mt-1" />
          </div>
        </Html>
      </group>
    </>
  );
}

export function LastHundredMetersScene({ config }: { config: any }) {
  const params = config?.parameters || {};

  return (
    <div className="w-full h-full min-h-[560px] relative bg-[#070D1E]">
      <Suspense fallback={null}>
        <Canvas camera={{ position: [-14, 7, 22], fov: 50 }}>
          <CarrierTakeoffInner deckLength={params.deckLength ?? 250} />
        </Canvas>
      </Suspense>
    </div>
  );
}
