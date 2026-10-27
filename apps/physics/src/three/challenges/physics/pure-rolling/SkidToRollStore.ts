"use client";

import { create } from "zustand";

export type SimulationStatus = "idle" | "skidding" | "pure_rolling" | "success" | "fail";

export interface SkidStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  missionObjective: string;
  bodyType: "sphere" | "cylinder" | "ring";
  bodyLabel: string;
  inertiaFactor: number; // c in I = c*m*R^2 (0.4 for sphere, 0.5 for cylinder, 1.0 for ring)
  mass: number;          // kg
  radius: number;        // m (e.g. 0.11 m)
  muKinetic: number;     // coefficient of kinetic friction
  initialSpinOmega0: number; // rad/s (positive = forward spin, negative = backspin, 0 = pure sliding)
  sliderParam: "velocity" | "friction" | "backspin";
  controlLabel: string;
  paramUnit: string;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  stepSmall: number;
  stepLarge: number;
  defaultSlider: number;
  targetValue: number;   // Calculated exact value for milestone
  targetDistance: number; // m where pure rolling transition should occur
  tolerance: number;     // Allowed margin
  formulaHint: string;
  explanationTrap: string;
}

export const G_ACCEL = 9.80; // m/s^2

export const SKID_STAGES: SkidStageConfig[] = [
  {
    stage: 1,
    title: "STAGE 1: BOWLING SKID-TO-ROLL TRANSITION",
    subtitle: "Launch Speed Tuning (Solid Sphere, c = 2/5, μk = 0.20, ω0 = 0)",
    missionObjective:
      "Calibrate the launch speed v0 so that the bowling ball's kinetic friction skid locks into Pure Rolling exactly at the 6.00 m mark on the lane.",
    bodyType: "sphere",
    bodyLabel: "Solid Bowling Ball (c = 2/5)",
    inertiaFactor: 0.4, // 2/5
    mass: 6.0,          // 6.0 kg
    radius: 0.11,       // 11 cm radius
    muKinetic: 0.20,
    initialSpinOmega0: 0,
    sliderParam: "velocity",
    controlLabel: "LAUNCH VELOCITY (v0)",
    paramUnit: "m/s",
    sliderMin: 4.0,
    sliderMax: 12.0,
    sliderStep: 0.05,
    stepSmall: 0.1,
    stepLarge: 0.5,
    defaultSlider: 5.5,
    targetValue: 6.93,
    targetDistance: 6.0,
    tolerance: 0.15,
    formulaHint: "x^* = \\frac{12 v_0^2}{49 \\mu_k g} \\implies v_0 = \\sqrt{\\frac{49 \\mu_k g x^*}{12}}",
    explanationTrap:
      "Remember that for a solid sphere (c = 2/5), the final rolling speed will be exactly (5/7) of the initial launch speed!",
  },
  {
    stage: 2,
    title: "STAGE 2: LANE OIL FRICTION COMPENSATION",
    subtitle: "Surface Grip Adaptation (v0 = 8.00 m/s, Target x* = 5.00 m)",
    missionObjective:
      "The lane conditioner requires a custom surface friction μk so that a ball launched at 8.00 m/s achieves pure rolling in exactly 5.00 m.",
    bodyType: "sphere",
    bodyLabel: "Solid Bowling Ball (c = 2/5)",
    inertiaFactor: 0.4,
    mass: 6.0,
    radius: 0.11,
    muKinetic: 0.25,
    initialSpinOmega0: 0,
    sliderParam: "friction",
    controlLabel: "FRICTION COEFFICIENT (μk)",
    paramUnit: "",
    sliderMin: 0.10,
    sliderMax: 0.50,
    sliderStep: 0.01,
    stepSmall: 0.01,
    stepLarge: 0.05,
    defaultSlider: 0.18,
    targetValue: 0.32,
    targetDistance: 5.0,
    tolerance: 0.02,
    formulaHint: "\\mu_k = \\frac{12 v_0^2}{49 g x^*}",
    explanationTrap:
      "Higher friction shortens the skid distance rapidly because it increases both linear braking and spin torque!",
  },
  {
    stage: 3,
    title: "STAGE 3: CURVED BACKSPIN CONTROL",
    subtitle: "Initial Reverse Angular Velocity (v0 = 6.50 m/s, μk = 0.25)",
    missionObjective:
      "Apply negative backspin ω0 to delay or precisely position the pure rolling lock-in at the 5.33 m mark.",
    bodyType: "sphere",
    bodyLabel: "Pro Bowling Ball (c = 2/5)",
    inertiaFactor: 0.4,
    mass: 6.0,
    radius: 0.11,
    muKinetic: 0.25,
    initialSpinOmega0: 0,
    sliderParam: "backspin",
    controlLabel: "INITIAL BACKSPIN (ω0)",
    paramUnit: "rad/s",
    sliderMin: -40.0,
    sliderMax: 0.0,
    sliderStep: 0.5,
    stepSmall: 0.5,
    stepLarge: 2.5,
    defaultSlider: -10.0,
    targetValue: -20.0,
    targetDistance: 5.33,
    tolerance: 1.0,
    formulaHint: "t^* = \\frac{c (v_0 - R \\omega_0)}{(c+1) \\mu_k g}, \\quad x^* = v_0 t^* - \\frac{1}{2} \\mu_k g (t^*)^2",
    explanationTrap:
      "Backspin opposes forward rotation, keeping the contact point slipping forward longer and increasing total skid time!",
  },
];

export interface SkidToRollState {
  currentStage: number;
  status: SimulationStatus;
  sliderValue: number;

  // Real-time kinematic tracking
  posX: number;           // m along lane (x = 0 to 14m)
  velX: number;           // m/s
  rotAngle: number;       // rad
  angularVel: number;     // rad/s
  rimVel: number;         // R * omega (m/s)
  slipVel: number;        // v - R*omega (m/s)
  frictionForce: number;  // N (positive opposite to slip)

  // Transition tracking
  simTime: number;        // s elapsed in active run
  transitionTime: number | null; // s when pure rolling locked
  transitionDist: number | null; // m where pure rolling locked
  finalRollSpeed: number | null; // m/s once pure rolling
  energyDissipated: number;      // Joules dissipated via friction
  launchedAt: number | null;     // performance.now() when launched for rolling
  isMissionStarted: boolean;     // whether PLAY button in instructions overlay was clicked
  missionStartedAt: number | null; // performance.now() when PLAY button was clicked

  // Challenge game metrics
  stars: number;
  score: number;
  failureReason?: string;
  showResultModal: boolean;

  // Actions
  startMission: () => void;
  setSliderValue: (val: number) => void;
  adjustSliderValue: (delta: number) => void;
  launchSimulation: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  setStage: (stageNum: number) => void;
  updateAnimationStep: (deltaSec: number) => void;
}

export const useSkidToRollStore = create<SkidToRollState>((set, get) => {
  const getInitialParameters = (stageIndex: number, sliderVal: number) => {
    const config = SKID_STAGES[stageIndex];
    let v0 = 7.0;
    let mu = config.muKinetic;
    let w0 = config.initialSpinOmega0;

    if (config.sliderParam === "velocity") {
      v0 = sliderVal;
    } else if (config.sliderParam === "friction") {
      v0 = 8.0;
      mu = sliderVal;
    } else if (config.sliderParam === "backspin") {
      v0 = 6.5;
      w0 = sliderVal;
    }

    const rim = config.radius * w0;
    const slip = v0 - rim;
    const fMag = mu * config.mass * G_ACCEL;

    return {
      posX: 0,
      velX: v0,
      rotAngle: 0,
      angularVel: w0,
      rimVel: rim,
      slipVel: slip,
      frictionForce: slip !== 0 ? fMag : 0,
      simTime: 0,
      transitionTime: null,
      transitionDist: null,
      finalRollSpeed: null,
      energyDissipated: 0,
      launchedAt: null,
    };
  };

  const initial = getInitialParameters(0, SKID_STAGES[0].defaultSlider);

  return {
    currentStage: 1,
    status: "idle",
    sliderValue: SKID_STAGES[0].defaultSlider,

    ...initial,

    stars: 0,
    score: 0,
    failureReason: undefined,
    showResultModal: false,

    isMissionStarted: false,
    missionStartedAt: null,

    startMission: () => {
      set({
        isMissionStarted: true,
        missionStartedAt: performance.now(),
      });
    },

    setSliderValue: (val: number) => {
      const state = get();
      if (state.status !== "idle") return;
      const config = SKID_STAGES[state.currentStage - 1];
      const clamped = Math.max(config.sliderMin, Math.min(config.sliderMax, val));
      const rounded = Math.round(clamped * 100) / 100;
      const initialParams = getInitialParameters(state.currentStage - 1, rounded);
      set({ sliderValue: rounded, ...initialParams });
    },

    adjustSliderValue: (delta: number) => {
      const state = get();
      if (state.status !== "idle") return;
      const next = state.sliderValue + delta;
      state.setSliderValue(next);
    },

    launchSimulation: () => {
      const state = get();
      if (state.status !== "idle") return;
      const initialParams = getInitialParameters(state.currentStage - 1, state.sliderValue);
      set({
        ...initialParams,
        status: "skidding",
        launchedAt: performance.now(),
        failureReason: undefined,
        showResultModal: false,
      });
    },

    resetSimulation: () => {
      const state = get();
      const initialParams = getInitialParameters(state.currentStage - 1, state.sliderValue);
      set({
        ...initialParams,
        status: "idle",
        showResultModal: false,
        failureReason: undefined,
        launchedAt: null,
        missionStartedAt: performance.now(),
      });
    },

    nextStage: () => {
      const state = get();
      if (state.currentStage >= SKID_STAGES.length) return;
      const nextIdx = state.currentStage;
      const nextConfig = SKID_STAGES[nextIdx];
      const initialParams = getInitialParameters(nextIdx, nextConfig.defaultSlider);
      set({
        currentStage: state.currentStage + 1,
        status: "idle",
        sliderValue: nextConfig.defaultSlider,
        stars: 0,
        score: 0,
        showResultModal: false,
        failureReason: undefined,
        missionStartedAt: performance.now(),
        ...initialParams,
      });
    },

    setStage: (stageNum: number) => {
      const idx = Math.max(0, Math.min(SKID_STAGES.length - 1, stageNum - 1));
      const nextConfig = SKID_STAGES[idx];
      const initialParams = getInitialParameters(idx, nextConfig.defaultSlider);
      set({
        currentStage: idx + 1,
        status: "idle",
        sliderValue: nextConfig.defaultSlider,
        stars: 0,
        score: 0,
        showResultModal: false,
        failureReason: undefined,
        missionStartedAt: performance.now(),
        ...initialParams,
      });
    },

    updateAnimationStep: (deltaSec: number) => {
      const state = get();
      if (state.status !== "skidding" && state.status !== "pure_rolling") return;

      const config = SKID_STAGES[state.currentStage - 1];
      const dt = Math.min(0.04, Math.max(0.001, deltaSec));

      let v = state.velX;
      let w = state.angularVel;
      let x = state.posX;
      let theta = state.rotAngle;
      let t = state.simTime + dt;
      let transTime = state.transitionTime;
      let transDist = state.transitionDist;
      let rollSpeed = state.finalRollSpeed;
      let currentStatus = state.status;

      let mu = config.muKinetic;
      if (config.sliderParam === "friction") {
        mu = state.sliderValue;
      }

      const m = config.mass;
      const R = config.radius;
      const c = config.inertiaFactor;
      const fMag = mu * m * G_ACCEL;

      if (currentStatus === "skidding") {
        const slip = v - R * w;

        // Check if transition occurs during this frame
        if (slip <= 0.005) {
          // Pure rolling locked!
          currentStatus = "pure_rolling";
          transTime = t;
          transDist = x;

          rollSpeed = v;
          w = v / R;

          const deltaTarget = Math.abs(state.sliderValue - config.targetValue);
          const isTargetMet = deltaTarget <= config.tolerance;

          if (isTargetMet) {
            set({
              stars: 3,
              score: 100,
            });
          }
        } else {
          // Linear deceleration: a = -mu * g
          const aLin = -mu * G_ACCEL;
          v += aLin * dt;

          // Angular acceleration: alpha = (f_k * R) / (c * m * R^2) = (mu * g) / (c * R)
          const alpha = (mu * G_ACCEL) / (c * R);
          w += alpha * dt;

          // If v and R*w cross in this step:
          if (v <= R * w) {
            const vSync = (c * state.velX + R * state.angularVel) / (c + 1);
            v = vSync;
            w = vSync / R;
            currentStatus = "pure_rolling";
            transTime = t;
            transDist = x;
            rollSpeed = v;
          }
        }
      }

      // Kinematic update
      x += v * dt;
      theta += w * dt;

      const rim = R * w;
      const slipNow = Math.max(0, v - rim);
      const frictionActive = currentStatus === "skidding" ? fMag : 0;

      // Energy calculation
      const keTrans = 0.5 * m * v * v;
      const keRot = 0.5 * (c * m * R * R) * w * w;
      const totalKE = keTrans + keRot;
      const initialV = config.sliderParam === "velocity" ? state.sliderValue : (config.sliderParam === "backspin" ? 6.5 : 8.0);
      const initialW = config.sliderParam === "backspin" ? state.sliderValue : config.initialSpinOmega0;
      const initialKE = 0.5 * m * initialV * initialV + 0.5 * (c * m * R * R) * initialW * initialW;
      const dissipated = Math.max(0, initialKE - totalKE);

      // Check boundary conditions or pin strike (e.g. at lane end x = 11.0 m)
      const LANE_END = 11.0;
      if (x >= LANE_END) {
        x = LANE_END;
        const deltaTarget = Math.abs(state.sliderValue - config.targetValue);
        const won = deltaTarget <= config.tolerance;

        let failReason: string | undefined = undefined;
        if (!won) {
          if (config.sliderParam === "velocity") {
            failReason =
              state.sliderValue > config.targetValue
                ? `Launch velocity (${state.sliderValue.toFixed(2)} m/s) was too high! The ball skidded ${(transDist ?? x).toFixed(2)} m before pure rolling, overshooting the ${config.targetDistance.toFixed(2)} m transition line.`
                : `Launch velocity (${state.sliderValue.toFixed(2)} m/s) was too low! The ball locked into pure rolling prematurely at ${(transDist ?? x).toFixed(2)} m before the ${config.targetDistance.toFixed(2)} m marker.`;
          } else if (config.sliderParam === "friction") {
            failReason =
              state.sliderValue > config.targetValue
                ? `Friction μk (${state.sliderValue.toFixed(2)}) was too grippy! The ball locked into roll too early at ${(transDist ?? x).toFixed(2)} m.`
                : `Friction μk (${state.sliderValue.toFixed(2)}) was too slick! The ball continued skidding past ${(transDist ?? x).toFixed(2)} m.`;
          } else {
            failReason = `Backspin (${state.sliderValue.toFixed(1)} rad/s) did not match the required transition distance of ${config.targetDistance.toFixed(2)} m.`;
          }
        }

        set({
          posX: x,
          velX: 0,
          angularVel: 0,
          rimVel: 0,
          slipVel: 0,
          frictionForce: 0,
          status: won ? "success" : "fail",
          stars: won ? 3 : 1,
          score: won ? 100 : 35,
          failureReason: failReason,
          showResultModal: true,
        });
        return;
      }

      set({
        posX: x,
        velX: v,
        rotAngle: theta,
        angularVel: w,
        rimVel: rim,
        slipVel: slipNow,
        frictionForce: frictionActive,
        simTime: t,
        transitionTime: transTime,
        transitionDist: transDist,
        finalRollSpeed: rollSpeed,
        status: currentStatus,
        energyDissipated: dissipated,
      });
    },
  };
});
