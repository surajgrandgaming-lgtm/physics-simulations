"use client";

import { create } from "zustand";
import { challengeAudio } from "@/lib/audio/challengeAudio";

export type SimulationStatus =
  | "idle"
  | "running"
  | "cleared"
  | "crash_outer"
  | "slide_inner";

export interface BankedCurveStage {
  round: number;
  title: string;
  subtitle: string;
  radius: number;          // R (meters)
  bankAngleDeg: number;    // theta (degrees)
  frictionMu: number;      // mu_s (coefficient of static friction)
  gravity: number;         // g (m/s²)
  arcDegrees: number;      // total curve sweep (degrees, e.g. 120°)
  laneWidth: number;       // total road width (meters, e.g. 10m)
  defaultSpeed: number;    // initial speed selector (m/s)
  minSelectableSpeed: number;
  maxSelectableSpeed: number;
  stepSpeed: number;
}

export const BANKED_CURVE_STAGES: BankedCurveStage[] = [
  {
    round: 1,
    title: "Stage 1: Pro Speedway Turn",
    subtitle: "R = 80 m · Bank = 25° · Road Friction μ = 0.30",
    radius: 80,
    bankAngleDeg: 25,
    frictionMu: 0.30,
    gravity: 9.8,
    arcDegrees: 110,
    laneWidth: 10,
    defaultSpeed: 18.0,
    minSelectableSpeed: 5.0,
    maxSelectableSpeed: 35.0,
    stepSpeed: 0.5,
  },
  {
    round: 2,
    title: "Stage 2: Cyber Mountain Pass",
    subtitle: "R = 120 m · Bank = 35° · Road Friction μ = 0.25",
    radius: 120,
    bankAngleDeg: 35,
    frictionMu: 0.25,
    gravity: 9.8,
    arcDegrees: 125,
    laneWidth: 10,
    defaultSpeed: 25.0,
    minSelectableSpeed: 10.0,
    maxSelectableSpeed: 45.0,
    stepSpeed: 0.5,
  },
  {
    round: 3,
    title: "Stage 3: Hypersonic Orbital Ridge",
    subtitle: "R = 160 m · Steep Bank = 45° · High Speed μ = 0.20",
    radius: 160,
    bankAngleDeg: 45,
    frictionMu: 0.20,
    gravity: 9.8,
    arcDegrees: 140,
    laneWidth: 10,
    defaultSpeed: 35.0,
    minSelectableSpeed: 15.0,
    maxSelectableSpeed: 60.0,
    stepSpeed: 0.5,
  },
];

export function computePhysicsLimits(stage: BankedCurveStage) {
  const theta = (stage.bankAngleDeg * Math.PI) / 180;
  const tanT = Math.tan(theta);
  const mu = stage.frictionMu;
  const g = stage.gravity;
  const R = stage.radius;

  // 1. Frictionless optimal speed
  const vOpt = Math.sqrt(R * g * tanT);

  // 2. Maximum safe speed (friction acts DOWN the incline)
  const maxDenom = 1 - mu * tanT;
  const vMax = maxDenom > 0 ? Math.sqrt(R * g * ((tanT + mu) / maxDenom)) : 999;

  // 3. Minimum safe speed (friction acts UP the incline)
  let vMin = 0;
  if (tanT > mu) {
    const minDenom = 1 + mu * tanT;
    vMin = Math.sqrt(R * g * ((tanT - mu) / minDenom));
  }

  return { vOpt, vMax, vMin };
}

interface BankedCurveState {
  currentRound: number;
  status: SimulationStatus;
  selectedSpeed: number; // m/s
  progress: number;      // 0 to 1 along the curve
  lateralOffset: number; // meters from lane centerline (-5 to +5)
  lateralVelocity: number; // m/s
  slipRatio: number;     // 0 to 1.5+ (f_req / f_max)
  lateralG: number;      // centripetal accel / g
  elapsedTime: number;
  score: number;
  stars: number;
  crashReason: string | null;

  // Actions
  setSelectedSpeed: (speed: number) => void;
  startRun: () => void;
  resetSimulation: () => void;
  nextRound: () => void;
  tick: (dt: number) => void;
}

export const useBankedCurveStore = create<BankedCurveState>((set, get) => ({
  currentRound: 1,
  status: "idle",
  selectedSpeed: BANKED_CURVE_STAGES[0].defaultSpeed,
  progress: 0,
  lateralOffset: 0,
  lateralVelocity: 0,
  slipRatio: 0,
  lateralG: 0,
  elapsedTime: 0,
  score: 0,
  stars: 0,
  crashReason: null,

  setSelectedSpeed: (speed) => {
    if (get().status !== "idle") return;
    const stage = BANKED_CURVE_STAGES[get().currentRound - 1];
    const clamped = Math.max(
      stage.minSelectableSpeed,
      Math.min(stage.maxSelectableSpeed, Math.round(speed * 10) / 10)
    );
    set({ selectedSpeed: clamped });
  },

  startRun: () => {
    const { status, selectedSpeed, currentRound } = get();
    if (status !== "idle") return;

    const stage = BANKED_CURVE_STAGES[currentRound - 1];
    const { vOpt, vMax, vMin } = computePhysicsLimits(stage);
    const theta = (stage.bankAngleDeg * Math.PI) / 180;
    const g = stage.gravity;
    const R = stage.radius;
    const v = selectedSpeed;

    // Normal force per unit mass
    const N_m = g * Math.cos(theta) + (v * v / R) * Math.sin(theta);
    // Required lateral force per unit mass along slope
    const F_req_m = (v * v / R) * Math.cos(theta) - g * Math.sin(theta);
    // Available static friction per unit mass
    const f_max_m = stage.frictionMu * N_m;
    const initialSlipRatio = Math.abs(F_req_m) / Math.max(0.001, f_max_m);
    const initialLateralG = (v * v / R) / g;

    challengeAudio.playLaunch();

    set({
      status: "running",
      progress: 0,
      lateralOffset: 0,
      lateralVelocity: 0,
      slipRatio: initialSlipRatio,
      lateralG: initialLateralG,
      elapsedTime: 0,
      crashReason: null,
    });
  },

  resetSimulation: () => {
    const stage = BANKED_CURVE_STAGES[get().currentRound - 1];
    set({
      status: "idle",
      progress: 0,
      lateralOffset: 0,
      lateralVelocity: 0,
      slipRatio: 0,
      lateralG: 0,
      elapsedTime: 0,
      crashReason: null,
    });
  },

  nextRound: () => {
    const nextR = Math.min(3, get().currentRound + 1);
    const nextStage = BANKED_CURVE_STAGES[nextR - 1];
    set({
      currentRound: nextR,
      status: "idle",
      selectedSpeed: nextStage.defaultSpeed,
      progress: 0,
      lateralOffset: 0,
      lateralVelocity: 0,
      slipRatio: 0,
      lateralG: 0,
      elapsedTime: 0,
      crashReason: null,
    });
  },

  tick: (dt: number) => {
    const { status, progress, selectedSpeed, currentRound, lateralOffset, lateralVelocity, elapsedTime } = get();
    if (status !== "running") return;

    const safeDt = Math.min(0.05, Math.max(0.001, dt));
    const stage = BANKED_CURVE_STAGES[currentRound - 1];
    const { vOpt, vMax, vMin } = computePhysicsLimits(stage);
    const theta = (stage.bankAngleDeg * Math.PI) / 180;
    const g = stage.gravity;
    const R = stage.radius;
    const v = selectedSpeed;

    // Normal force and required lateral force along slope (per unit mass)
    const N_m = g * Math.cos(theta) + (v * v / R) * Math.sin(theta);
    const F_req_m = (v * v / R) * Math.cos(theta) - g * Math.sin(theta);
    const f_max_m = stage.frictionMu * N_m;
    const slipRatio = Math.abs(F_req_m) / Math.max(0.001, f_max_m);
    const lateralG = (v * v / R) / g;

    // Total road curve length
    const totalArcRad = (stage.arcDegrees * Math.PI) / 180;
    const totalArcLen = R * totalArcRad;
    const dProgress = (v * safeDt) / totalArcLen;
    const newProgress = Math.min(1.0, progress + dProgress);
    const newTime = elapsedTime + safeDt;

    // Lateral dynamics
    let newLatOffset = lateralOffset;
    let newLatVel = lateralVelocity;

    const halfLane = stage.laneWidth / 2 - 0.5; // ~4.5m limit

    if (v > vMax) {
      // Over-speeding: Kinetic friction (0.75 * mu) acts downward, net acceleration flings car up the bank
      const muK = stage.frictionMu * 0.75;
      const netAccUp = F_req_m - muK * N_m; // > 0
      newLatVel += Math.max(1.5, netAccUp) * safeDt;
      newLatOffset += newLatVel * safeDt;

      if (newLatOffset >= halfLane) {
        // Crash into outer cliff barrier!
        challengeAudio.playCrashImpact();
        set({
          status: "crash_outer",
          progress: newProgress,
          lateralOffset: halfLane,
          lateralVelocity: 0,
          slipRatio,
          lateralG,
          crashReason: `CRASH! Exceeded max safe speed (${vMax.toFixed(1)} m/s). Centripetal demand overpowered static friction, skidding the hauler into the cliff wall!`,
        });
        return;
      }
    } else if (v < vMin) {
      // Under-speeding: Gravity pulls car down bank, kinetic friction acts upward
      const muK = stage.frictionMu * 0.75;
      const netAccDown = Math.abs(F_req_m) - muK * N_m; // downward magnitude
      newLatVel -= Math.max(1.5, netAccDown) * safeDt;
      newLatOffset += newLatVel * safeDt;

      if (newLatOffset <= -halfLane) {
        // Slid into inner canyon abyss!
        challengeAudio.playCrashImpact();
        set({
          status: "slide_inner",
          progress: newProgress,
          lateralOffset: -halfLane,
          lateralVelocity: 0,
          slipRatio,
          lateralG,
          crashReason: `SLIDE-OUT! Cruised below minimum safe speed (${vMin.toFixed(1)} m/s). Inward gravity overpowered friction, dragging the hauler into the canyon ditch!`,
        });
        return;
      }
    } else {
      // Within safe friction limits!
      // Subtle visual compliance drift proportional to slip ratio and direction
      const targetCompliance = (F_req_m / f_max_m) * 1.5; // at most 1.5m deviation
      newLatOffset += (targetCompliance - newLatOffset) * 2.0 * safeDt;
    }

    // Check if finished curve successfully
    if (newProgress >= 1.0) {
      challengeAudio.playSuccessFanfare();

      // Calculate Stars and Score based on Risk/Reward
      // Safe Pass (1 star)
      let earnedStars = 1;
      let roundScore = 300;

      // 2 Stars: High speed (>= vOpt)
      if (v >= vOpt) {
        earnedStars = 2;
        roundScore = 600;
      }

      // 3 Stars: Apex Speed Master! Within 6% of vMax without crashing
      const apexThreshold = vMax * 0.94;
      if (v >= apexThreshold) {
        earnedStars = 3;
        roundScore = 1000;
      }

      const totalScore = get().score + roundScore;
      set({
        status: "cleared",
        progress: 1.0,
        lateralOffset: newLatOffset,
        lateralVelocity: 0,
        slipRatio,
        lateralG,
        elapsedTime: newTime,
        stars: earnedStars,
        score: totalScore,
      });
      return;
    }

    set({
      progress: newProgress,
      lateralOffset: newLatOffset,
      lateralVelocity: newLatVel,
      slipRatio,
      lateralG,
      elapsedTime: newTime,
    });
  },
}));
