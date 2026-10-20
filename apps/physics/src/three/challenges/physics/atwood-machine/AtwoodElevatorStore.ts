"use client";

import { create } from "zustand";
import { challengeAudio } from "@/lib/audio/challengeAudio";

export type SimulationStatus =
  | "idle"
  | "moving"
  | "landing_soft"
  | "cargo_shatter"
  | "pulley_crash"
  | "stalled"
  | "success"
  | "fail";

export interface AtwoodStage {
  round: number;
  title: string;
  subtitle: string;
  cabinMass: number;      // m1 (kg)
  targetAccel: number;    // safe target downward acceleration (m/s²)
  accelTolerance: number; // acceptable delta (+/- m/s²)
  gravity: number;        // g (m/s²)
  shaftHeight: number;    // h (m)
  defaultCounterweight: number; // initial slider value (kg)
  minCounterweight: number;
  maxCounterweight: number;
  stepCounterweight: number;
}

export const ATWOOD_STAGES: AtwoodStage[] = [
  {
    round: 1,
    title: "Stage 1: Standard Test Flight",
    subtitle: "Standard Cabin (500 kg) · Earth Gravity (9.8 m/s²) · Target a = 2.0 m/s²",
    cabinMass: 500,
    targetAccel: 2.0,
    accelTolerance: 0.18,
    gravity: 9.8,
    shaftHeight: 20,
    defaultCounterweight: 200,
    minCounterweight: 50,
    maxCounterweight: 650,
    stepCounterweight: 0.5,
  },
  {
    round: 2,
    title: "Stage 2: Heavy Quantum Payload",
    subtitle: "Reinforced Cabin (750 kg) · Fragile Core · Target a = 1.5 m/s²",
    cabinMass: 750,
    targetAccel: 1.5,
    accelTolerance: 0.14,
    gravity: 9.8,
    shaftHeight: 20,
    defaultCounterweight: 350,
    minCounterweight: 100,
    maxCounterweight: 900,
    stepCounterweight: 0.5,
  },
  {
    round: 3,
    title: "Stage 3: Off-World Orbital Silo",
    subtitle: "Orbital Station Test · Low Gravity (6.0 m/s²) · Target a = 1.5 m/s²",
    cabinMass: 600,
    targetAccel: 1.5,
    accelTolerance: 0.12,
    gravity: 6.0,
    shaftHeight: 20,
    defaultCounterweight: 220,
    minCounterweight: 50,
    maxCounterweight: 750,
    stepCounterweight: 0.5,
  },
];

export interface AtwoodElevatorState {
  currentRound: number;
  stageConfig: AtwoodStage;

  status: SimulationStatus;
  crashReason: string | null;
  showResultModal: boolean;

  counterweightMass: number; // m2 (kg)

  // Kinematic state
  elevatorY: number;
  counterweightY: number;
  velocity: number;
  acceleration: number;
  tension: number;
  pulleyAngle: number;
  shockCompression: number;
  cargoIntegrityPct: number;
  timeInFlight: number;

  // Touchdown stats
  landingVelocity: number;
  peakAcceleration: number;

  stars: number;
  score: number;
  isMissionStarted: boolean;
  resetCount: number;

  setCounterweightMass: (m: number) => void;
  startMission: () => void;
  releaseBrakes: () => void;
  resetSimulation: () => void;
  nextRound: () => void;
  updatePhysics: (delta: number) => void;
}

const PULLEY_Y = 22.5;
const GROUND_Y = 1.5;
const INITIAL_ELEVATOR_Y = 20.0;
const INITIAL_COUNTERWEIGHT_Y = 2.0;
const PULLEY_RADIUS = 1.6;

export const useAtwoodElevatorStore = create<AtwoodElevatorState>((set, get) => ({
  currentRound: 1,
  stageConfig: ATWOOD_STAGES[0],

  status: "idle",
  crashReason: null,
  showResultModal: false,

  counterweightMass: ATWOOD_STAGES[0].defaultCounterweight,

  elevatorY: INITIAL_ELEVATOR_Y,
  counterweightY: INITIAL_COUNTERWEIGHT_Y,
  velocity: 0,
  acceleration: 0,
  tension: 0,
  pulleyAngle: 0,
  shockCompression: 0,
  cargoIntegrityPct: 100,
  timeInFlight: 0,

  landingVelocity: 0,
  peakAcceleration: 0,

  stars: 0,
  score: 0,
  isMissionStarted: true,
  resetCount: 0,

  setCounterweightMass: (m: number) => {
    const { status, stageConfig } = get();
    if (status !== "idle") return;
    const clamped = Math.min(
      stageConfig.maxCounterweight,
      Math.max(stageConfig.minCounterweight, Math.round(m * 10) / 10)
    );
    set({ counterweightMass: clamped });
    challengeAudio.playClick();
  },

  startMission: () => {
    set({ isMissionStarted: true });
  },

  releaseBrakes: () => {
    const { status, stageConfig, counterweightMass } = get();
    if (status !== "idle") return;

    const m1 = stageConfig.cabinMass;
    const m2 = counterweightMass;
    const g = stageConfig.gravity;

    // Atwood acceleration: positive downwards for cabin
    const a = ((m1 - m2) / (m1 + m2)) * g;
    const T = (2 * m1 * m2 * g) / (m1 + m2);

    challengeAudio.playLaunch();
    challengeAudio.playBrakeSkid();

    set({
      status: "moving",
      acceleration: a,
      tension: T,
      peakAcceleration: Math.abs(a),
      timeInFlight: 0,
    });
  },

  resetSimulation: () => {
    const { stageConfig, resetCount } = get();
    challengeAudio.playClick();
    set({
      status: "idle",
      crashReason: null,
      showResultModal: false,
      counterweightMass: stageConfig.defaultCounterweight,
      elevatorY: INITIAL_ELEVATOR_Y,
      counterweightY: INITIAL_COUNTERWEIGHT_Y,
      velocity: 0,
      acceleration: 0,
      tension: 0,
      pulleyAngle: 0,
      shockCompression: 0,
      cargoIntegrityPct: 100,
      timeInFlight: 0,
      landingVelocity: 0,
      peakAcceleration: 0,
      resetCount: resetCount + 1,
    });
  },

  nextRound: () => {
    const { currentRound, resetCount } = get();
    if (currentRound >= 3) return;
    const nextR = currentRound + 1;
    const nextCfg = ATWOOD_STAGES[nextR - 1];
    challengeAudio.playSuccessFanfare();
    set({
      currentRound: nextR,
      stageConfig: nextCfg,
      status: "idle",
      crashReason: null,
      showResultModal: false,
      counterweightMass: nextCfg.defaultCounterweight,
      elevatorY: INITIAL_ELEVATOR_Y,
      counterweightY: INITIAL_COUNTERWEIGHT_Y,
      velocity: 0,
      acceleration: 0,
      tension: 0,
      pulleyAngle: 0,
      shockCompression: 0,
      cargoIntegrityPct: 100,
      timeInFlight: 0,
      landingVelocity: 0,
      peakAcceleration: 0,
      resetCount: resetCount + 1,
    });
  },

  updatePhysics: (delta: number) => {
    const state = get();
    if (state.status === "idle" || state.status === "success" || state.status === "fail") return;

    const dt = Math.min(delta, 0.05);
    const {
      status,
      elevatorY,
      counterweightY,
      velocity,
      acceleration,
      pulleyAngle,
      stageConfig,
      shockCompression,
      timeInFlight,
    } = state;

    // Phase: Landing animation (soft settle on shock absorbers)
    if (status === "landing_soft") {
      const nextCompression = Math.min(1.0, shockCompression + dt * 3.5);
      set({ shockCompression: nextCompression });
      if (nextCompression >= 1.0) {
        challengeAudio.playSuccessFanfare();
        set({
          status: "success",
          showResultModal: true,
          stars: 3,
          score: 1000 + stageConfig.round * 250,
        });
      }
      return;
    }

    // Phase: Crash animation (hard impact)
    if (status === "cargo_shatter") {
      const nextCompression = Math.min(1.0, shockCompression + dt * 6.0);
      set({
        shockCompression: nextCompression,
        cargoIntegrityPct: 0,
      });
      if (nextCompression >= 1.0) {
        challengeAudio.playCrashImpact();
        set({
          status: "fail",
          showResultModal: true,
          crashReason: "Touchdown impact was too violent! The excessive downward acceleration shattered the fragile cargo.",
        });
      }
      return;
    }

    // Phase: Pulley smash animation
    if (status === "pulley_crash") {
      challengeAudio.playCrashImpact();
      set({
        status: "fail",
        showResultModal: true,
        crashReason: "Counterweight was heavier than the elevator cabin! The elevator accelerated upward and collided with the overhead pulley.",
      });
      return;
    }

    // Active descent / motion
    if (status === "moving") {
      const newTime = timeInFlight + dt;

      // a > 0 means cabin accelerates downward
      const newVelocity = velocity + acceleration * dt;
      const dy = newVelocity * dt;

      const newElevatorY = elevatorY - dy;
      const newCounterweightY = counterweightY + dy;
      const dAngle = dy / PULLEY_RADIUS;
      const newPulleyAngle = pulleyAngle + dAngle;

      // Check Pulley Collision (if m2 > m1 and elevator goes up)
      if (acceleration < 0 && newElevatorY >= PULLEY_Y - 1.2) {
        set({
          elevatorY: PULLEY_Y - 1.2,
          counterweightY: Math.max(GROUND_Y, newCounterweightY),
          velocity: 0,
          status: "pulley_crash",
        });
        return;
      }

      // Check Ground / Landing Dock Impact
      if (newElevatorY <= GROUND_Y) {
        const landingSpeed = Math.abs(newVelocity);
        const { targetAccel, accelTolerance } = stageConfig;
        const minSafeAccel = targetAccel - accelTolerance;
        const maxSafeAccel = targetAccel + accelTolerance;

        set({
          elevatorY: GROUND_Y,
          counterweightY: newCounterweightY,
          landingVelocity: landingSpeed,
          velocity: 0,
        });

        // Is downward acceleration safe?
        if (acceleration >= minSafeAccel && acceleration <= maxSafeAccel) {
          // SAFE TOUCHDOWN!
          set({
            status: "landing_soft",
            cargoIntegrityPct: 100,
          });
        } else if (acceleration > maxSafeAccel) {
          // TOO FAST -> CARGO SHATTERS!
          set({
            status: "cargo_shatter",
            cargoIntegrityPct: 0,
          });
        } else {
          // TOO SLOW / STALLED (cabin took too long or barely moved)
          challengeAudio.playCrashImpact();
          set({
            status: "fail",
            showResultModal: true,
            crashReason: "Descent was too slow and failed to reach the required arrival corridor before safety locks engaged. Lower the counterweight slightly to increase acceleration.",
          });
        }
        return;
      }

      // Still in transit
      set({
        elevatorY: newElevatorY,
        counterweightY: newCounterweightY,
        velocity: newVelocity,
        pulleyAngle: newPulleyAngle,
        timeInFlight: newTime,
      });
    }
  },
}));
