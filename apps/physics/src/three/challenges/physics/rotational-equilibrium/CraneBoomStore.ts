"use client";

import { create } from "zustand";

export type SimulationStatus = "idle" | "testing" | "success" | "fail_sag" | "fail_lift";

export interface CraneStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  missionObjective: string;
  boomLength: number;       // m
  boomMass: number;         // kg
  payloadMass: number;      // kg
  fixedPayloadX?: number;   // m (if fixed)
  fixedCableX?: number;     // m (if fixed)
  cableAngleDeg: number;    // deg relative to horizontal boom
  fixedTension?: number;    // kN (if fixed)
  sliderParam: "tension" | "collar" | "trolley";
  controlLabel: string;
  paramUnit: string;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  stepSmall: number;
  stepLarge: number;
  defaultSlider: number;
  targetValue: number;      // Exact theoretical value
  tolerance: number;        // Allowed parameter delta or torque tolerance
  formulaHint: string;
  explanationTrap: string;
}

export const CRANE_STAGES: CraneStageConfig[] = [
  {
    stage: 1,
    title: "STAGE 1: WINCH TENSION CALIBRATION",
    subtitle: "Direct Torque Balance (L = 8.0 m, θ = 30.0°)",
    missionObjective:
      "Calculate and set the exact winch cable tension T required to hold the boom horizontally with a 400 kg cargo at the tip.",
    boomLength: 8.0,
    boomMass: 200,         // W_b = 200 * 9.8 = 1960 N at x = 4.0 m
    payloadMass: 400,      // W_L = 400 * 9.8 = 3920 N at x = 8.0 m
    fixedPayloadX: 8.0,
    fixedCableX: 8.0,
    cableAngleDeg: 30.0,   // sin(30°) = 0.50
    sliderParam: "tension",
    controlLabel: "CABLE WINCH TENSION",
    paramUnit: "kN",
    sliderMin: 5.0,
    sliderMax: 15.0,
    sliderStep: 0.05,
    stepSmall: 0.1,
    stepLarge: 0.5,
    defaultSlider: 7.0,
    targetValue: 9.80,     // (1960*4 + 3920*8) / (8 * 0.5) = 39200 / 4 = 9800 N = 9.80 kN
    tolerance: 0.15,
    formulaHint: "T = [W_boom · (L/2) + W_load · L] / [L · sin(30°)]",
    explanationTrap:
      "Remember that the boom's own weight (1.96 kN) acts at its center of gravity (L/2 = 4.0 m), not at the tip!",
  },
  {
    stage: 2,
    title: "STAGE 2: COLLAR LEVER ARM PLACEMENT",
    subtitle: "Variable Lever Arm (T = 15.29 kN, θ = 30.0°)",
    missionObjective:
      "Position the cable collar along the boom so that the rated winch tension (15.29 kN) creates the exact counter-torque.",
    boomLength: 6.0,
    boomMass: 300,         // W_b = 300 * 9.8 = 2940 N at x = 3.0 m -> tau_b = 8820 Nm
    payloadMass: 500,      // W_L = 500 * 9.8 = 4900 N at x = 6.0 m -> tau_L = 29400 Nm -> total = 38220 Nm
    fixedPayloadX: 6.0,
    fixedTension: 15.288,  // T * sin(30°) = 7644 N -> x_c = 38220 / 7644 = 5.00 m
    cableAngleDeg: 30.0,
    sliderParam: "collar",
    controlLabel: "COLLAR DISTANCE (x_c)",
    paramUnit: "m",
    sliderMin: 3.0,
    sliderMax: 6.0,
    sliderStep: 0.05,
    stepSmall: 0.05,
    stepLarge: 0.2,
    defaultSlider: 3.8,
    targetValue: 5.00,
    tolerance: 0.10,
    formulaHint: "x_c = [W_boom · (L/2) + W_load · x_load] / [T · sin(30°)]",
    explanationTrap:
      "Torque is directly proportional to lever arm distance (r). Moving the collar closer to the hinge drastically reduces counter-torque!",
  },
  {
    stage: 3,
    title: "STAGE 3: MOTORIZED TROLLEY CARGO REACH",
    subtitle: "Mobile Heavy Load Horizon (M_load = 1000 kg)",
    missionObjective:
      "Determine the maximum safe position x_load for a 1000 kg container without exceeding the cable torque capacity.",
    boomLength: 8.0,
    boomMass: 300,         // W_b = 2940 N at x = 4.0 m -> tau_b = 11760 Nm
    payloadMass: 1000,     // W_L = 9800 N
    fixedCableX: 8.0,
    cableAngleDeg: 30.0,   // sin(30°) = 0.50
    fixedTension: 17.64,   // T = 17640 N -> tau_cable = 17640 * 8 * 0.5 = 70560 Nm
    sliderParam: "trolley",
    controlLabel: "TROLLEY REACH (x_load)",
    paramUnit: "m",
    sliderMin: 2.0,
    sliderMax: 8.0,
    sliderStep: 0.05,
    stepSmall: 0.05,
    stepLarge: 0.2,
    defaultSlider: 4.0,
    targetValue: 6.00,     // (70560 - 11760) / 9800 = 58800 / 9800 = 6.00 m
    tolerance: 0.10,
    formulaHint: "x_load = [T · x_c · sin(30°) - W_boom · (L/2)] / W_load",
    explanationTrap:
      "As the motorized trolley travels outward, its lever arm grows linearly. If it passes 6.00 m, clockwise torque overwhelms the cable!",
  },
];

export const G_ACCEL = 9.80; // m/s^2

interface CraneBoomState {
  currentStage: number;
  status: SimulationStatus;
  sliderValue: number;

  // Real-time kinematic state
  boomAngle: number;       // rad (0 = horizontal)
  boomAngularVel: number;  // rad/s

  // Derived physics values
  tauGravity: number;      // kNm (clockwise)
  tauCable: number;        // kNm (counter-clockwise)
  tauNet: number;          // kNm (counter-clockwise positive)
  rx: number;              // kN horizontal reaction
  ry: number;              // kN vertical reaction
  rTotal: number;          // kN magnitude

  // Challenge completion feedback
  stars: number;
  score: number;
  failureReason?: string;
  showResultModal: boolean;

  // Actions
  setSliderValue: (val: number) => void;
  adjustSliderValue: (delta: number) => void;
  testBalance: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  setStage: (stage: number) => void;
  updateAnimationStep: (deltaSec: number) => void;
}

export const useCraneBoomStore = create<CraneBoomState>((set, get) => {
  const calculateForces = (stageIdx: number, val: number) => {
    const config = CRANE_STAGES[stageIdx];
    const wBoom = (config.boomMass * G_ACCEL) / 1000;       // kN
    const wLoad = (config.payloadMass * G_ACCEL) / 1000;    // kN

    let tensionKN = 0;
    let collarX = 0;
    let trolleyX = 0;

    if (config.sliderParam === "tension") {
      tensionKN = val;
      collarX = config.fixedCableX!;
      trolleyX = config.fixedPayloadX!;
    } else if (config.sliderParam === "collar") {
      tensionKN = config.fixedTension!;
      collarX = val;
      trolleyX = config.fixedPayloadX!;
    } else {
      tensionKN = config.fixedTension!;
      collarX = config.fixedCableX!;
      trolleyX = val;
    }

    const radAngle = (config.cableAngleDeg * Math.PI) / 180;
    const sinTheta = Math.sin(radAngle);
    const cosTheta = Math.cos(radAngle);

    // Torques about hinge pivot O (clockwise = positive gravity, CCW = cable)
    const tauGrav = wBoom * (config.boomLength / 2) + wLoad * trolleyX;
    const tauCab = tensionKN * collarX * sinTheta;
    const net = tauCab - tauGrav;

    // Reactions at hinge
    const rxVal = tensionKN * cosTheta;
    const ryVal = (wBoom + wLoad) - tensionKN * sinTheta;
    const rTotVal = Math.sqrt(rxVal * rxVal + ryVal * ryVal);

    return {
      tauGravity: tauGrav,
      tauCable: tauCab,
      tauNet: net,
      rx: rxVal,
      ry: ryVal,
      rTotal: rTotVal,
    };
  };

  const initialForces = calculateForces(0, CRANE_STAGES[0].defaultSlider);

  return {
    currentStage: 1,
    status: "idle",
    sliderValue: CRANE_STAGES[0].defaultSlider,

    boomAngle: 0,
    boomAngularVel: 0,

    tauGravity: initialForces.tauGravity,
    tauCable: initialForces.tauCable,
    tauNet: initialForces.tauNet,
    rx: initialForces.rx,
    ry: initialForces.ry,
    rTotal: initialForces.rTotal,

    stars: 0,
    score: 0,
    failureReason: undefined,
    showResultModal: false,

    setSliderValue: (val) => {
      const state = get();
      if (state.status !== "idle") return;
      const config = CRANE_STAGES[state.currentStage - 1];
      const clamped = Math.max(config.sliderMin, Math.min(config.sliderMax, val));
      const rounded = Math.round(clamped * 100) / 100;
      const f = calculateForces(state.currentStage - 1, rounded);
      set({ sliderValue: rounded, ...f });
    },

    adjustSliderValue: (delta) => {
      const state = get();
      if (state.status !== "idle") return;
      const nextVal = state.sliderValue + delta;
      state.setSliderValue(nextVal);
    },

    testBalance: () => {
      const state = get();
      if (state.status !== "idle") return;
      set({ status: "testing", failureReason: undefined });
    },

    resetSimulation: () => {
      const state = get();
      const f = calculateForces(state.currentStage - 1, state.sliderValue);
      set({
        status: "idle",
        boomAngle: 0,
        boomAngularVel: 0,
        showResultModal: false,
        failureReason: undefined,
        ...f,
      });
    },

    nextStage: () => {
      const state = get();
      if (state.currentStage >= 3) return;
      const nextIdx = state.currentStage;
      const nextConfig = CRANE_STAGES[nextIdx];
      const f = calculateForces(nextIdx, nextConfig.defaultSlider);
      set({
        currentStage: state.currentStage + 1,
        status: "idle",
        sliderValue: nextConfig.defaultSlider,
        boomAngle: 0,
        boomAngularVel: 0,
        stars: 0,
        score: 0,
        showResultModal: false,
        failureReason: undefined,
        ...f,
      });
    },

    setStage: (stageNum) => {
      const idx = Math.max(0, Math.min(CRANE_STAGES.length - 1, stageNum - 1));
      const nextConfig = CRANE_STAGES[idx];
      const f = calculateForces(idx, nextConfig.defaultSlider);
      set({
        currentStage: idx + 1,
        status: "idle",
        sliderValue: nextConfig.defaultSlider,
        boomAngle: 0,
        boomAngularVel: 0,
        stars: 0,
        score: 0,
        showResultModal: false,
        failureReason: undefined,
        ...f,
      });
    },

    updateAnimationStep: (deltaSec) => {
      const state = get();
      if (state.status !== "testing") return;

      const config = CRANE_STAGES[state.currentStage - 1];
      const deltaParam = Math.abs(state.sliderValue - config.targetValue);
      const isBalanced = deltaParam <= config.tolerance;

      // Net torque in kNm -> convert to Nm for rotational dynamics
      const tauNetNm = state.tauNet * 1000;

      // System Moment of Inertia about hinge O: I = 1/3 M_b L^2 + M_L x_L^2
      const xLoad = config.fixedPayloadX ?? state.sliderValue;
      const inertia = (1 / 3) * config.boomMass * Math.pow(config.boomLength, 2) + config.payloadMass * Math.pow(xLoad, 2);

      if (isBalanced) {
        // Gently damp toward level horizontal
        const newAngle = state.boomAngle * 0.85;
        if (Math.abs(newAngle) < 0.002) {
          set({
            boomAngle: 0,
            boomAngularVel: 0,
            status: "success",
            stars: 3,
            score: 100,
            showResultModal: true,
          });
        } else {
          set({ boomAngle: newAngle });
        }
        return;
      }

      // Unbalanced dynamics
      const alpha = tauNetNm / inertia; // CCW positive rad/s^2
      let newVel = state.boomAngularVel + alpha * deltaSec;
      // Damping
      newVel *= 0.98;
      const newAngle = state.boomAngle + newVel * deltaSec;

      // Tilt limit check
      const maxSag = -0.22; // ~-12.6 degrees downward
      const maxLift = 0.22; // ~+12.6 degrees upward

      if (newAngle <= maxSag) {
        const failMsg =
          "Clockwise gravity torque (" +
          state.tauGravity.toFixed(2) +
          " kNm) exceeded cable counter-torque (" +
          state.tauCable.toFixed(2) +
          " kNm). The boom tilted down and hit the safety stops!";
        set({
          boomAngle: maxSag,
          boomAngularVel: 0,
          status: "fail_sag",
          stars: 1,
          failureReason: failMsg,
          showResultModal: true,
        });
      } else if (newAngle >= maxLift) {
        const failMsg =
          "Counter-clockwise cable torque (" +
          state.tauCable.toFixed(2) +
          " kNm) overpowered gravity torque (" +
          state.tauGravity.toFixed(2) +
          " kNm). The boom pulled upward past level!";
        set({
          boomAngle: maxLift,
          boomAngularVel: 0,
          status: "fail_lift",
          stars: 1,
          failureReason: failMsg,
          showResultModal: true,
        });
      } else {
        set({ boomAngle: newAngle, boomAngularVel: newVel });
      }
    },
  };
});
