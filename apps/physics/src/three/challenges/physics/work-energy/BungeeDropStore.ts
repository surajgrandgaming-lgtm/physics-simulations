"use client";

import { create } from "zustand";
import { challengeAudio } from "@/lib/audio/challengeAudio";

export type BungeeStatus =
  | "idle"
  | "dropping"
  | "rebounding"
  | "success"
  | "fail_crash"
  | "fail_short";

export type BungeeCameraMode = "follow" | "target" | "overview";

export interface BungeeStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  mass: number;          // kg
  height: number;        // total drop depth H (m)
  cordLength: number;    // unstretched length L (m)
  targetTolerance: number; // acceptable stop margin (m)
  kDefault: number;      // initial slider value (N/m)
  kMin: number;
  kMax: number;
  kStep: number;
  targetTime: number;    // target transit duration (s)
}

export const BUNGEE_STAGES: BungeeStageConfig[] = [
  {
    stage: 1,
    title: "Alpine Gorge Drop",
    subtitle: "80kg Science Probe • Depth: 60m • Cord: 25m",
    mass: 80,
    height: 60.0,
    cordLength: 25.0,
    targetTolerance: 0.25,
    kDefault: 45.0,
    kMin: 15.0,
    kMax: 150.0,
    kStep: 0.5,
    targetTime: 4.8,
  },
  {
    stage: 2,
    title: "Subterranean Reactor Core",
    subtitle: "150kg Heavy Siphon • Depth: 80m • Cord: 35m",
    mass: 150,
    height: 80.0,
    cordLength: 35.0,
    targetTolerance: 0.20,
    kDefault: 70.0,
    kMin: 30.0,
    kMax: 220.0,
    kStep: 0.5,
    targetTime: 5.5,
  },
  {
    stage: 3,
    title: "Titan Abyss Deep Drop",
    subtitle: "100kg Quantum Beacon • Depth: 100m • Cord: 40m",
    mass: 100,
    height: 100.0,
    cordLength: 40.0,
    targetTolerance: 0.15,
    kDefault: 35.0,
    kMin: 20.0,
    kMax: 120.0,
    kStep: 0.5,
    targetTime: 6.2,
  },
];

interface BungeeDropState {
  currentStage: number;
  status: BungeeStatus;
  kSpring: number;
  
  // Real-time kinematic variables (Y measured downwards from 0 to H)
  positionY: number;
  velocity: number;
  acceleration: number;
  lowestPoint: number;
  touchVelocity: number;
  elapsedTime: number;

  // Real-time Energy Ledger variables (Joules)
  energyUg: number;
  energyK: number;
  energyUs: number;
  energyTotal: number;

  cameraMode: BungeeCameraMode;
  crashReason: string | null;
  stars: number;
  score: number;
  showResultModal: boolean;

  // Actions
  setKSpring: (k: number) => void;
  adjustKSpring: (delta: number) => void;
  setCameraMode: (mode: BungeeCameraMode) => void;
  dropPayload: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  tickPhysics: (dt: number) => void;
}

export const useBungeeDropStore = create<BungeeDropState>((set, get) => ({
  currentStage: 1,
  status: "idle",
  kSpring: BUNGEE_STAGES[0].kDefault,

  positionY: 0,
  velocity: 0,
  acceleration: 9.8,
  lowestPoint: 0,
  touchVelocity: 0,
  elapsedTime: 0,

  energyUg: BUNGEE_STAGES[0].mass * 9.8 * BUNGEE_STAGES[0].height,
  energyK: 0,
  energyUs: 0,
  energyTotal: BUNGEE_STAGES[0].mass * 9.8 * BUNGEE_STAGES[0].height,

  cameraMode: "follow",
  crashReason: null,
  stars: 0,
  score: 0,
  showResultModal: false,

  setKSpring: (k: number) => {
    const stage = BUNGEE_STAGES[get().currentStage - 1];
    const clamped = Math.max(stage.kMin, Math.min(stage.kMax, Number(k.toFixed(1))));
    set({ kSpring: clamped });
  },

  adjustKSpring: (delta: number) => {
    const stage = BUNGEE_STAGES[get().currentStage - 1];
    const current = get().kSpring;
    const next = Math.max(stage.kMin, Math.min(stage.kMax, Number((current + delta).toFixed(1))));
    set({ kSpring: next });
    challengeAudio.playClick();
  },

  setCameraMode: (mode: BungeeCameraMode) => {
    set({ cameraMode: mode });
  },

  dropPayload: () => {
    const state = get();
    if (state.status !== "idle") return;

    challengeAudio.playLaunch();
    set({
      status: "dropping",
      positionY: 0,
      velocity: 0,
      acceleration: 9.8,
      lowestPoint: 0,
      touchVelocity: 0,
      elapsedTime: 0,
      showResultModal: false,
      crashReason: null,
    });
  },

  resetSimulation: () => {
    const stage = BUNGEE_STAGES[get().currentStage - 1];
    set({
      status: "idle",
      positionY: 0,
      velocity: 0,
      acceleration: 9.8,
      lowestPoint: 0,
      touchVelocity: 0,
      elapsedTime: 0,
      energyUg: stage.mass * 9.8 * stage.height,
      energyK: 0,
      energyUs: 0,
      energyTotal: stage.mass * 9.8 * stage.height,
      showResultModal: false,
      crashReason: null,
    });
    challengeAudio.playClick();
  },

  nextStage: () => {
    const nextIdx = Math.min(BUNGEE_STAGES.length - 1, get().currentStage);
    const nextStageConfig = BUNGEE_STAGES[nextIdx];
    set({
      currentStage: nextIdx + 1,
      status: "idle",
      kSpring: nextStageConfig.kDefault,
      positionY: 0,
      velocity: 0,
      acceleration: 9.8,
      lowestPoint: 0,
      touchVelocity: 0,
      elapsedTime: 0,
      energyUg: nextStageConfig.mass * 9.8 * nextStageConfig.height,
      energyK: 0,
      energyUs: 0,
      energyTotal: nextStageConfig.mass * 9.8 * nextStageConfig.height,
      showResultModal: false,
      crashReason: null,
    });
    challengeAudio.playSuccessFanfare();
  },

  tickPhysics: (dt: number) => {
    const state = get();
    if (state.status !== "dropping" && state.status !== "rebounding") return;

    // Sub-stepping for ultra-smooth symplectic integration
    const subSteps = 10;
    const subDt = Math.min(dt, 0.05) / subSteps;
    const stage = BUNGEE_STAGES[state.currentStage - 1];
    const m = stage.mass;
    const g = 9.8;
    const H = stage.height;
    const L = stage.cordLength;
    const k = state.kSpring;

    let y = state.positionY;
    let v = state.velocity;
    let a = state.acceleration;
    let lowest = state.lowestPoint;
    let currentStatus: BungeeStatus = state.status;
    let touchSpeed = state.touchVelocity;

    for (let i = 0; i < subSteps; i++) {
      // 1. Calculate net vertical force downwards
      let F_net = m * g;
      if (y > L) {
        const stretch = y - L;
        const F_spring = k * stretch;
        F_net -= F_spring;
      }

      a = F_net / m;
      v += a * subDt;
      y += v * subDt;

      if (y > lowest) {
        lowest = y;
      }

      // Check impact with ground / target at y >= H
      if (y >= H) {
        y = H;
        touchSpeed = Math.abs(v);

        // Trap detection vs perfect landing
        if (touchSpeed > 1.2) {
          // Crashed hard into the target!
          challengeAudio.playCrashImpact();
          set({
            positionY: H,
            velocity: 0,
            acceleration: 0,
            touchVelocity: touchSpeed,
            lowestPoint: H,
            status: "fail_crash",
            showResultModal: true,
            crashReason: `FATAL IMPACT! Payload smashed the sensor at ${touchSpeed.toFixed(1)} m/s! (Did you use the static equilibrium trap mg = kx instead of the Work-Energy Theorem?)`,
          });
          return;
        } else {
          // Perfect kiss of the landing target with v ≈ 0!
          challengeAudio.playSuccessFanfare();
          const starsEarned = touchSpeed <= 0.3 ? 3 : touchSpeed <= 0.7 ? 2 : 1;
          const scoreEarned = 1000 * starsEarned - Math.round(state.elapsedTime * 10);
          set({
            positionY: H,
            velocity: 0,
            acceleration: 0,
            touchVelocity: touchSpeed,
            lowestPoint: H,
            status: "success",
            stars: starsEarned,
            score: Math.max(100, scoreEarned),
            showResultModal: true,
          });
          return;
        }
      }

      // Check if payload reached lowest turnaround point (v flips from > 0 to <= 0)
      if (currentStatus === "dropping" && y > L && v <= 0) {
        currentStatus = "rebounding";
        
        // Rebound turnaround evaluation
        const error = Math.abs(H - lowest);
        if (error <= stage.targetTolerance) {
          // Reached turnaround exactly at the sensor zone
          challengeAudio.playSuccessFanfare();
          set({
            positionY: lowest,
            velocity: 0,
            acceleration: 0,
            lowestPoint: lowest,
            status: "success",
            stars: error <= 0.1 ? 3 : 2,
            score: 1000 * (error <= 0.1 ? 3 : 2),
            showResultModal: true,
          });
          return;
        } else if (lowest < H - stage.targetTolerance) {
          // Rebounded too early - cord was too stiff
          challengeAudio.playCrashImpact();
          set({
            positionY: lowest,
            velocity: 0,
            acceleration: 0,
            lowestPoint: lowest,
            status: "fail_short",
            showResultModal: true,
            crashReason: `REBOUNDED TOO EARLY! Turned around at ${(H - lowest).toFixed(1)}m above target. Cord is too stiff (k is too high).`,
          });
          return;
        }
      }
    }

    // Energy ledger computation
    const currentUg = Math.max(0, m * g * (H - y));
    const currentK = 0.5 * m * v * v;
    const currentStretch = Math.max(0, y - L);
    const currentUs = 0.5 * k * currentStretch * currentStretch;
    const totalE = m * g * H;

    set({
      positionY: y,
      velocity: v,
      acceleration: a,
      lowestPoint: lowest,
      status: currentStatus,
      elapsedTime: state.elapsedTime + dt,
      energyUg: currentUg,
      energyK: currentK,
      energyUs: currentUs,
      energyTotal: totalE,
    });
  },
}));
