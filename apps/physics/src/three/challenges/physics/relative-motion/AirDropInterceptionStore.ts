"use client";

import { createChallengeStore, createChallengeContext } from "@/stores/factory";

export interface AirDropRoundConfig {
  roundNumber: number;
  title: string;
  altitude: number; // H in meters
  gravity: number; // g in m/s^2
  heliTargetSpeedX: number; // 40 m/s
  boatMotorSpeed: { x: number; y: number }; // { x: 0, y: 15 }
  riverCurrent: { x: number; y: number }; // { x: 5, y: 0 }
  crosswind: { x: number; y: number }; // { x: 0, y: -3 }
  description: string;
}

export const AIR_DROP_ROUNDS: AirDropRoundConfig[] = [
  {
    roundNumber: 1,
    title: "Standard Daylight Interception",
    altitude: 125,
    gravity: 9.8,
    heliTargetSpeedX: 40,
    boatMotorSpeed: { x: 15, y: 0 },
    riverCurrent: { x: 5, y: 0 },
    crosswind: { x: 0, y: -3 },
    description: "Helicopter at H = 125m. The boat moves straight downstream at v_boat = 20î m/s (15î motor + 5î current). Steer your helicopter (W/A/S/D) to match velocity (40î m/s) and offset laterally (+15.15m North) to compensate for crosswind (-3ĵ m/s) and drop onto the moving boat deck!",
  },
  {
    roundNumber: 2,
    title: "High Crosswind Compensation",
    altitude: 125,
    gravity: 9.8,
    heliTargetSpeedX: 45,
    boatMotorSpeed: { x: 17, y: 0 },
    riverCurrent: { x: 8, y: 0 },
    crosswind: { x: 0, y: -6 },
    description: "Stronger crosswind v_w = -6ĵ m/s and fast river surge v_boat = 25î m/s (17î motor + 8î current). Steer laterally (+30.3m North) to compensate for heavy southward drift during the 5.05s fall!",
  },
  {
    roundNumber: 3,
    title: "High-Altitude Storm Intercept",
    altitude: 180,
    gravity: 9.8,
    heliTargetSpeedX: 50,
    boatMotorSpeed: { x: 20, y: 0 },
    riverCurrent: { x: 5, y: 0 },
    crosswind: { x: 0, y: -4 },
    description: "High altitude drop H = 180m increases flight time to t_f = √(360/9.8) ≈ 6.06s! Boat moves straight downstream at 25î m/s. Steer into long-range spatial lead (Δx = -151.5m, Δz = +24.2m) and drop cleanly!",
  },
];

export interface AirDropState extends Record<string, unknown> {
  currentRound: number;

  // Active Flight Dynamics
  isFlying: boolean; // Flight simulation active (can pause/play)
  heliVelX: number; // Forward velocity (m/s) controlled by W/S
  heliVelZ: number; // Lateral velocity (m/s) controlled by A/D
  heliPitch: number; // Pitch angle (radians) based on forward/back thrust
  heliBank: number; // Roll bank angle (radians) based on left/right steering
  heliYaw: number; // Heading yaw angle (radians)

  // Real-time Inputs
  inputForward: boolean; // W / Up
  inputBackward: boolean; // S / Down
  inputLeft: boolean; // A / Left
  inputRight: boolean; // D / Right

  // Real-Time 3D Positions
  heliPos: { x: number; y: number; z: number };
  boatPos: { x: number; y: number; z: number };
  payloadPos: { x: number; y: number; z: number };
  payloadVel: { x: number; y: number; z: number };

  // Payload Drop State
  isPayloadReleased: boolean;
  isPayloadLanded: boolean;
  payloadTime: number;

  // Targeting & Bomb-Sight Computer
  predictedImpactPos: { x: number; z: number };
  targetBoatImpactPos: { x: number; z: number };
  leadDistanceError: number; // meters from target at future impact
  isTargetLocked: boolean; // true when reticle is within ±3.8m of moving boat deck!

  // Results & Score
  dropAccuracy: number | null; // miss distance in meters on impact
  landingScore: "pending" | "bullseye" | "deck-hit" | "missed";
  scoreStars: number;
  totalScore: number;
  resultFeedback: string | null;
  showVictoryModal: boolean;

  // Camera & Visuals
  cameraMode: "bomb-sight" | "chase" | "tactical" | "boat-deck";
  showVectorHUD: boolean;
  showTrajectoryArc: boolean;
  showSolutionModal: boolean;
  isSoundEnabled: boolean;

  // Actions
  setInputForward: (active: boolean) => void;
  setInputBackward: (active: boolean) => void;
  setInputLeft: (active: boolean) => void;
  setInputRight: (active: boolean) => void;
  setHeliSpeedDirect: (vx: number) => void;
  setHeliLateralDirect: (z: number) => void;
  setHeliVelocitiesDirect: (vx: number, vz: number) => void;

  toggleFlying: () => void;
  releasePayload: () => void;
  resetFlight: () => void;
  setRound: (round: number) => void;
  nextRound: () => void;
  autoAlignOptimal: () => void;
  setCameraMode: (mode: "bomb-sight" | "chase" | "tactical" | "boat-deck") => void;
  toggleVectorHUD: () => void;
  toggleTrajectoryArc: () => void;
  toggleSolutionModal: (show?: boolean) => void;
  setShowVictoryModal: (show: boolean) => void;
  toggleSound: () => void;

  updateTick: (delta: number) => void;
}

export const createAirDropInterceptionStore = createChallengeStore<AirDropState>(
  {
    currentRound: 1,

    isFlying: true,
    heliVelX: 0, // Starts in controllable hover so it doesn't run away!
    heliVelZ: 0,
    heliPitch: 0,
    heliBank: 0,
    heliYaw: 0,

    inputForward: false,
    inputBackward: false,
    inputLeft: false,
    inputRight: false,

    heliPos: { x: -120, y: 125, z: 15.15 },
    boatPos: { x: 0, y: 0, z: 0 },
    payloadPos: { x: -120, y: 123.8, z: 15.15 },
    payloadVel: { x: 0, y: 0, z: -3 },

    isPayloadReleased: false,
    isPayloadLanded: false,
    payloadTime: 0,

    predictedImpactPos: { x: -120, z: 0 },
    targetBoatImpactPos: { x: 101.02, z: 0 },
    leadDistanceError: 221.0,
    isTargetLocked: false,

    dropAccuracy: null,
    landingScore: "pending",
    scoreStars: 0,
    totalScore: 0,
    resultFeedback: null,
    showVictoryModal: false,

    cameraMode: "chase",
    showVectorHUD: true,
    showTrajectoryArc: true,
    showSolutionModal: false,
    isSoundEnabled: true,

    setInputForward: () => {},
    setInputBackward: () => {},
    setInputLeft: () => {},
    setInputRight: () => {},
    setHeliSpeedDirect: () => {},
    setHeliLateralDirect: () => {},
    setHeliVelocitiesDirect: () => {},
    toggleFlying: () => {},
    releasePayload: () => {},
    resetFlight: () => {},
    setRound: () => {},
    nextRound: () => {},
    autoAlignOptimal: () => {},
    setCameraMode: () => {},
    toggleVectorHUD: () => {},
    toggleTrajectoryArc: () => {},
    toggleSolutionModal: () => {},
    setShowVictoryModal: () => {},
    toggleSound: () => {},
    updateTick: () => {},
  },
  (set, get) => {
    return {
      setInputForward: (active) => set({ inputForward: active }),
      setInputBackward: (active) => set({ inputBackward: active }),
      setInputLeft: (active) => set({ inputLeft: active }),
      setInputRight: (active) => set({ inputRight: active }),

      setHeliSpeedDirect: (vx) => {
        const clamped = Math.max(-20, Math.min(80, vx));
        set({ heliVelX: clamped });
      },

      setHeliLateralDirect: (z) => {
        set({ heliPos: { ...get().heliPos, z } });
      },

      setHeliVelocitiesDirect: (vx, vz) => {
        set({ heliVelX: vx, heliVelZ: vz });
      },

      toggleFlying: () => set({ isFlying: !get().isFlying }),

      releasePayload: () => {
        const { isPayloadReleased, heliPos, heliVelX, heliVelZ, currentRound } = get();
        if (isPayloadReleased) return;

        const roundCfg = AIR_DROP_ROUNDS[currentRound - 1] || AIR_DROP_ROUNDS[0];

        set({
          isPayloadReleased: true,
          isPayloadLanded: false,
          showVictoryModal: false,
          payloadTime: 0,
          payloadPos: { x: heliPos.x, y: heliPos.y - 1.2, z: heliPos.z },
          payloadVel: {
            x: heliVelX,
            y: 0,
            z: heliVelZ + roundCfg.crosswind.y, // Crosswind acts on payload
          },
          cameraMode: "chase",
        });
      },

      resetFlight: () => {
        const { currentRound } = get();
        const roundCfg = AIR_DROP_ROUNDS[currentRound - 1] || AIR_DROP_ROUNDS[0];
        const tFlight = Math.sqrt((2 * roundCfg.altitude) / roundCfg.gravity);
        const optimalOffsetZ = -roundCfg.crosswind.y * tFlight;

        set({
          isFlying: true,
          isPayloadReleased: false,
          isPayloadLanded: false,
          showVictoryModal: false,
          payloadTime: 0,
          heliVelX: 0,
          heliVelZ: 0,
          heliPitch: 0,
          heliBank: 0,
          heliYaw: 0,
          heliPos: { x: -120, y: roundCfg.altitude, z: optimalOffsetZ },
          boatPos: { x: 0, y: 0, z: 0 },
          payloadPos: { x: -120, y: roundCfg.altitude - 1.2, z: optimalOffsetZ },
          dropAccuracy: null,
          landingScore: "pending",
          resultFeedback: null,
        });
      },

      setRound: (round) => {
        const clamped = Math.max(1, Math.min(AIR_DROP_ROUNDS.length, round));
        set({ currentRound: clamped });
        get().resetFlight();
      },

      nextRound: () => {
        const { currentRound } = get();
        if (currentRound < AIR_DROP_ROUNDS.length) {
          get().setRound(currentRound + 1);
        }
      },

      autoAlignOptimal: () => {
        const { currentRound, boatPos } = get();
        const roundCfg = AIR_DROP_ROUNDS[currentRound - 1] || AIR_DROP_ROUNDS[0];
        const tFlight = Math.sqrt((2 * roundCfg.altitude) / roundCfg.gravity);

        const vBoatX = roundCfg.riverCurrent.x + roundCfg.boatMotorSpeed.x; // 20
        const vBoatZ = roundCfg.riverCurrent.y + roundCfg.boatMotorSpeed.y; // 0

        const optimalHeliX = boatPos.x + (vBoatX - roundCfg.heliTargetSpeedX) * tFlight;
        const optimalHeliZ = boatPos.z + (vBoatZ - roundCfg.crosswind.y) * tFlight;

        set({
          heliVelX: roundCfg.heliTargetSpeedX,
          heliVelZ: 0,
          heliPitch: -0.15,
          heliBank: 0,
          heliYaw: 0,
          heliPos: { x: optimalHeliX, y: roundCfg.altitude, z: optimalHeliZ },
        });
      },

      setCameraMode: (mode) => set({ cameraMode: mode }),
      toggleVectorHUD: () => set({ showVectorHUD: !get().showVectorHUD }),
      toggleTrajectoryArc: () => set({ showTrajectoryArc: !get().showTrajectoryArc }),
      toggleSolutionModal: (show) =>
        set({ showSolutionModal: show !== undefined ? show : !get().showSolutionModal }),
      setShowVictoryModal: (show) => set({ showVictoryModal: show }),
      toggleSound: () => set({ isSoundEnabled: !get().isSoundEnabled }),

      updateTick: (delta: number) => {
        const state = get();
        if (!state.isFlying) return;

        const dt = Math.min(delta, 0.05);
        const roundCfg = AIR_DROP_ROUNDS[state.currentRound - 1] || AIR_DROP_ROUNDS[0];

        // 1. ACTIVE STEERING FLIGHT DYNAMICS
        let vx = state.heliVelX;
        let vz = state.heliVelZ;
        let targetPitch = 0;
        let targetBank = 0;

        // W/S: Longitudinal Acceleration/Braking & Pitch
        if (state.inputForward) {
          vx = Math.min(75, vx + 28 * dt);
          targetPitch = -0.22; // Nose down acceleration
        } else if (state.inputBackward) {
          vx = Math.max(-15, vx - 30 * dt);
          targetPitch = 0.22; // Nose up braking
        }

        // A/D: Lateral Steering (North +Z / South -Z) & Bank Roll
        if (state.inputLeft) {
          vz = Math.min(35, vz + 28 * dt); // Steer North (+Z)
          targetBank = -0.25; // Bank left
        } else if (state.inputRight) {
          vz = Math.max(-35, vz - 28 * dt); // Steer South (-Z)
          targetBank = 0.25; // Bank right
        } else {
          // Centering damping on lateral drift
          vz += (0 - vz) * Math.min(1, 2.0 * dt);
        }

        const newPitch = state.heliPitch + (targetPitch - state.heliPitch) * Math.min(1, 6 * dt);
        const newBank = state.heliBank + (targetBank - state.heliBank) * Math.min(1, 6 * dt);

        // Heading yaw based on horizontal velocity vector
        let targetYaw = 0;
        if (Math.abs(vx) > 0.5 || Math.abs(vz) > 0.5) {
          targetYaw = Math.atan2(-vz, Math.max(0.1, vx));
        }
        const newYaw = state.heliYaw + (targetYaw - state.heliYaw) * Math.min(1, 5 * dt);

        // Advance Helicopter Position
        const newHeliX = state.heliPos.x + vx * dt;
        const newHeliY = roundCfg.altitude;
        const newHeliZ = state.heliPos.z + vz * dt;

        // 2. MOVING BOAT MOTION ON RIVER
        const boatVx = roundCfg.riverCurrent.x + roundCfg.boatMotorSpeed.x;
        const boatVz = roundCfg.riverCurrent.y + roundCfg.boatMotorSpeed.y;
        const newBoatX = state.boatPos.x + boatVx * dt;
        const newBoatZ = state.boatPos.z + boatVz * dt;

        // 3. REAL-TIME BOMB-SIGHT INTERCEPT COMPUTATION
        const tFlight = Math.sqrt((2 * roundCfg.altitude) / roundCfg.gravity);
        const predImpactX = newHeliX + vx * tFlight;
        const predImpactZ = newHeliZ + (vz + roundCfg.crosswind.y) * tFlight;

        const futureBoatX = newBoatX + boatVx * tFlight;
        const futureBoatZ = newBoatZ + boatVz * tFlight;

        const reticleDx = predImpactX - futureBoatX;
        const reticleDz = predImpactZ - futureBoatZ;
        const reticleDist = Math.sqrt(reticleDx * reticleDx + reticleDz * reticleDz);
        const isLocked = reticleDist <= 4.0;

        // 4. FALLING PAYLOAD PHYSICS (IF RELEASED)
        let payloadX = state.payloadPos.x;
        let payloadY = state.payloadPos.y;
        let payloadZ = state.payloadPos.z;
        let payloadTime = state.payloadTime;
        let isLanded = state.isPayloadLanded;
        let accuracy = state.dropAccuracy;
        let score = state.landingScore;
        let stars = state.scoreStars;
        let feedback = state.resultFeedback;
        let totalScore = state.totalScore;
        let stopSimulation = false;
        let showPopup = state.showVictoryModal;

        if (state.isPayloadReleased && !isLanded) {
          payloadTime += dt;
          payloadX += state.payloadVel.x * dt;
          payloadZ += state.payloadVel.z * dt;
          payloadY = Math.max(0, roundCfg.altitude - 0.5 * roundCfg.gravity * payloadTime * payloadTime);

          // Impact Check at Water / Deck surface
          if (payloadY <= 0.2) {
            isLanded = true;
            payloadY = 0.2;
            stopSimulation = true; // STOP simulation when landed / win
            showPopup = true;

            const missX = payloadX - newBoatX;
            const missZ = payloadZ - newBoatZ;
            accuracy = Math.sqrt(missX * missX + missZ * missZ);

            if (accuracy <= 3.0) {
              score = "bullseye";
              stars = 3;
              totalScore += 500;
              feedback = `🎯 BULLSEYE DECK LANDING! Accuracy: ${accuracy.toFixed(2)}m (+500 XP)`;
            } else if (accuracy <= 7.5) {
              score = "deck-hit";
              stars = 2;
              totalScore += 300;
              feedback = `✅ DECK RECOVERY! Cargo retrieved within ${accuracy.toFixed(2)}m (+300 XP)`;
            } else {
              score = "missed";
              stars = 1;
              feedback = `❌ RIVER SPLASH! Missed boat deck by ${accuracy.toFixed(1)}m. Re-evaluate release timing!`;
            }
          }
        } else if (!state.isPayloadReleased) {
          // Attached under helicopter belly
          payloadX = newHeliX;
          payloadY = newHeliY - 1.2;
          payloadZ = newHeliZ;
        }

        set({
          isFlying: stopSimulation ? false : state.isFlying,
          heliVelX: vx,
          heliVelZ: vz,
          heliPitch: newPitch,
          heliBank: newBank,
          heliYaw: newYaw,
          heliPos: { x: newHeliX, y: newHeliY, z: newHeliZ },
          boatPos: { x: newBoatX, y: 0, z: newBoatZ },
          payloadPos: { x: payloadX, y: payloadY, z: payloadZ },
          payloadTime,
          predictedImpactPos: { x: predImpactX, z: predImpactZ },
          targetBoatImpactPos: { x: futureBoatX, z: futureBoatZ },
          leadDistanceError: reticleDist,
          isTargetLocked: isLocked,
          isPayloadLanded: isLanded,
          showVictoryModal: showPopup,
          dropAccuracy: accuracy,
          landingScore: score,
          scoreStars: stars,
          totalScore: totalScore,
          resultFeedback: feedback,
        });
      },
    };
  }
);

export const {
  ChallengeProvider: AirDropInterceptionProvider,
  useChallengeStore: useAirDropInterceptionStore,
  StoreContext: AirDropInterceptionContext,
} = createChallengeContext<AirDropState>();
