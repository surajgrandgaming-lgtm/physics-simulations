"use client";

import { create } from "zustand";

export type SimulationStatus = "idle" | "docking" | "success" | "fail";

export interface SatelliteStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  missionObjective: string;
  numPods: number;        // 2 for Stage 1 & 2, 4 for Stage 3
  hubInertia: number;     // kg·m²
  massPerPod: number;     // kg
  initialRadius: number;  // m
  initialOmega: number;   // rad/s
  targetOmega: number;    // rad/s
  targetRadius: number;   // m
  tolerance: number;      // m
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  stepSmall: number;
  stepLarge: number;
  defaultSlider: number;
  formulaHint: string;
  explanationTrap: string;
}

export const SATELLITE_STAGES: SatelliteStageConfig[] = [
  {
    stage: 1,
    title: "STAGE 1: EXTEND TO DECELERATE",
    subtitle: "Spin Braking via Radial Deployment (I_hub = 180, 2 × 25 kg, ω_i = 3.50 rad/s)",
    missionObjective:
      "The space station collar is rotating at 1.40 rad/s. Your satellite was launched with an excessive spin rate of 3.50 rad/s. Extend the counterweights outward to increase inertia and slow down your spin until it matches the station. Then click LOCK & DOCK to merge!",
    numPods: 2,
    hubInertia: 180.0,
    massPerPod: 25.0,
    initialRadius: 0.60,
    initialOmega: 3.50,
    targetOmega: 1.40,
    targetRadius: 2.51,
    tolerance: 0.05,
    sliderMin: 0.60,
    sliderMax: 3.50,
    sliderStep: 0.01,
    stepSmall: 0.05,
    stepLarge: 0.25,
    defaultSlider: 1.00,
    formulaHint: "I_f = \\frac{L}{\\omega^*} \\implies r_f = \\sqrt{\\frac{I_f - I_{\\text{hub}}}{2m}}",
    explanationTrap:
      "As the counterweights slide outward, total angular momentum L = Iω remains strictly constant, while kinetic energy drops as internal brakes absorb rotational energy!",
  },
  {
    stage: 2,
    title: "STAGE 2: RETRACT TO ACCELERATE",
    subtitle: "Spin Acceleration via Winch Retraction (I_hub = 140, 2 × 20 kg, ω_i = 0.90 rad/s)",
    missionObjective:
      "The space station research centrifuge is rotating fast at 2.50 rad/s. Your platform is idling slowly at 0.90 rad/s with weights extended at 3.20 m. Winch the counterweights inward to decrease inertia and accelerate your spin to match the station, then LOCK & DOCK!",
    numPods: 2,
    hubInertia: 140.0,
    massPerPod: 20.0,
    initialRadius: 3.20,
    initialOmega: 0.90,
    targetOmega: 2.50,
    targetRadius: 1.20,
    tolerance: 0.05,
    sliderMin: 0.60,
    sliderMax: 3.50,
    sliderStep: 0.01,
    stepSmall: 0.05,
    stepLarge: 0.25,
    defaultSlider: 2.80,
    formulaHint: "r_f = \\sqrt{\\frac{\\frac{L}{\\omega^*} - I_{\\text{hub}}}{2m}}",
    explanationTrap:
      "Pulling the masses inward against centrifugal reaction requires positive mechanical work (W_internal > 0) from the electric winches, pumping energy into rotational kinetic energy!",
  },
  {
    stage: 3,
    title: "STAGE 3: QUAD-AXIS SENSOR ARRAY",
    subtitle: "4-Pod Symmetric Cross-Rail (I_hub = 120, 4 × 15 kg, ω_i = 4.00 rad/s)",
    missionObjective:
      "A deep-space observatory features 4 symmetric sensor pods sliding along perpendicular cross-arms. Reconfigure the 4-mass array from 1.00 m to synchronize your spin with the transfer station at exactly 2.00 rad/s, then merge!",
    numPods: 4,
    hubInertia: 120.0,
    massPerPod: 15.0,
    initialRadius: 1.00,
    initialOmega: 4.00,
    targetOmega: 2.00,
    targetRadius: 2.00,
    tolerance: 0.05,
    sliderMin: 0.60,
    sliderMax: 3.50,
    sliderStep: 0.01,
    stepSmall: 0.05,
    stepLarge: 0.25,
    defaultSlider: 1.20,
    formulaHint: "I(r) = I_{\\text{hub}} + 4mr^2 \\implies r_f = \\sqrt{\\frac{\\frac{L}{\\omega^*} - I_{\\text{hub}}}{4m}}",
    explanationTrap:
      "With 4 masses, the moment of inertia scales four times as quickly with r², giving high sensitivity to radial positioning adjustments!",
  },
];

export interface SatelliteSpinState {
  currentStage: number;
  status: SimulationStatus;
  sliderValue: number; // configured target radius (m)

  // Real-time kinematic tracking
  currentRadius: number; // physical position of sliding carriages (m)
  targetPhysicalRadius: number; // target position being smoothly interpolated toward
  currentInertia: number; // kg·m²
  currentOmega: number; // rad/s (live satellite spin rate)
  angularMomentum: number; // kg·m²/s (strictly conserved)
  initialKineticEnergy: number; // Joules
  currentKineticEnergy: number; // Joules
  internalWork: number; // ΔK = K_current - K_initial (Joules)
  omegaError: number; // |currentOmega - targetOmega|

  // Visual dynamic angles & offsets
  satelliteRotation: number; // rad (continuous rotation around Y)
  dockingCollarRotation: number; // rad (station docking ring rotation around Y)
  dockElevation: number; // m (vertical displacement towards docking ring)
  dockingProgress: number; // 0 to 1 during vertical approach

  // Timing & Mission Management
  isMissionStarted: boolean; // whether pre-mission modal was dismissed / PLAY clicked
  missionStartedAt: number | null; // timestamp when PLAY or RETRY clicked
  simTime: number; // seconds in active simulation

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

export const useSatelliteSpinStore = create<SatelliteSpinState>((set, get) => {
  const computeStateForRadius = (stageIndex: number, radius: number) => {
    const config = SATELLITE_STAGES[stageIndex];
    const initialI = config.hubInertia + config.numPods * config.massPerPod * Math.pow(config.initialRadius, 2);
    const L = initialI * config.initialOmega;
    const initialKE = 0.5 * initialI * Math.pow(config.initialOmega, 2);

    const I = config.hubInertia + config.numPods * config.massPerPod * Math.pow(radius, 2);
    const omega = L / I;
    const currentKE = 0.5 * I * Math.pow(omega, 2);
    const work = currentKE - initialKE;
    const err = Math.abs(omega - config.targetOmega);

    return {
      currentInertia: I,
      currentOmega: omega,
      angularMomentum: L,
      initialKineticEnergy: initialKE,
      currentKineticEnergy: currentKE,
      internalWork: work,
      omegaError: err,
    };
  };

  const initialCalculations = computeStateForRadius(0, SATELLITE_STAGES[0].defaultSlider);

  return {
    currentStage: 1,
    status: "idle",
    sliderValue: SATELLITE_STAGES[0].defaultSlider,

    currentRadius: SATELLITE_STAGES[0].defaultSlider,
    targetPhysicalRadius: SATELLITE_STAGES[0].defaultSlider,
    ...initialCalculations,

    satelliteRotation: 0,
    dockingCollarRotation: 0,
    dockElevation: 0,
    dockingProgress: 0,

    isMissionStarted: false,
    missionStartedAt: null,
    simTime: 0,

    stars: 0,
    score: 0,
    failureReason: undefined,
    showResultModal: false,

    startMission: () => {
      set({
        isMissionStarted: true,
        missionStartedAt: performance.now(),
      });
    },

    setSliderValue: (val: number) => {
      const state = get();
      if (state.status !== "idle") return;
      const config = SATELLITE_STAGES[state.currentStage - 1];
      const clamped = Math.max(config.sliderMin, Math.min(config.sliderMax, val));
      const rounded = Math.round(clamped * 100) / 100;

      set({
        sliderValue: rounded,
        targetPhysicalRadius: rounded,
      });
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

      // Start vertical docking ascent to merge with station
      set({
        status: "docking",
        dockingProgress: 0,
        dockElevation: 0,
        simTime: 0,
        showResultModal: false,
        failureReason: undefined,
      });
    },

    resetSimulation: () => {
      const state = get();
      const calcs = computeStateForRadius(state.currentStage - 1, state.sliderValue);

      set({
        status: "idle",
        currentRadius: state.sliderValue,
        targetPhysicalRadius: state.sliderValue,
        ...calcs,
        satelliteRotation: 0,
        dockingCollarRotation: 0,
        dockElevation: 0,
        dockingProgress: 0,
        simTime: 0,
        showResultModal: false,
        failureReason: undefined,
        missionStartedAt: performance.now(),
      });
    },

    nextStage: () => {
      const state = get();
      if (state.currentStage >= SATELLITE_STAGES.length) {
        state.resetSimulation();
        return;
      }
      const nextStageIndex = state.currentStage;
      const nextConfig = SATELLITE_STAGES[nextStageIndex];
      const calcs = computeStateForRadius(nextStageIndex, nextConfig.defaultSlider);

      set({
        currentStage: nextStageIndex + 1,
        status: "idle",
        sliderValue: nextConfig.defaultSlider,
        currentRadius: nextConfig.defaultSlider,
        targetPhysicalRadius: nextConfig.defaultSlider,
        ...calcs,
        satelliteRotation: 0,
        dockingCollarRotation: 0,
        dockElevation: 0,
        dockingProgress: 0,
        simTime: 0,
        showResultModal: false,
        failureReason: undefined,
        missionStartedAt: performance.now(),
      });
    },

    setStage: (stageNum: number) => {
      const stageIdx = Math.max(0, Math.min(SATELLITE_STAGES.length - 1, stageNum - 1));
      const config = SATELLITE_STAGES[stageIdx];
      const calcs = computeStateForRadius(stageIdx, config.defaultSlider);

      set({
        currentStage: stageIdx + 1,
        status: "idle",
        sliderValue: config.defaultSlider,
        currentRadius: config.defaultSlider,
        targetPhysicalRadius: config.defaultSlider,
        ...calcs,
        satelliteRotation: 0,
        dockingCollarRotation: 0,
        dockElevation: 0,
        dockingProgress: 0,
        simTime: 0,
        showResultModal: false,
        failureReason: undefined,
        missionStartedAt: performance.now(),
      });
    },

    updateAnimationStep: (deltaSec: number) => {
      const state = get();
      const config = SATELLITE_STAGES[state.currentStage - 1];
      const dt = Math.min(0.033, Math.max(0.001, deltaSec));

      // 1. Continuous rotation of the Station Collar at its fixed speed targetOmega
      const newCollarRot = (state.dockingCollarRotation + config.targetOmega * dt) % (Math.PI * 2);

      // 2. In Idle: Physical masses smoothly glide to slider setting, and satellite's spin rate updates in REAL TIME!
      if (state.status === "idle") {
        const lerpFactor = 1 - Math.exp(-14 * dt);
        const nextR = state.currentRadius + (state.targetPhysicalRadius - state.currentRadius) * lerpFactor;
        const calcs = computeStateForRadius(state.currentStage - 1, nextR);

        // Satellite rotates at its live currentOmega!
        const newSatRot = (state.satelliteRotation + calcs.currentOmega * dt) % (Math.PI * 2);

        set({
          currentRadius: nextR,
          ...calcs,
          dockingCollarRotation: newCollarRot,
          satelliteRotation: newSatRot,
        });
        return;
      }

      // 3. During Docking: Satellite ascends vertically toward the station collar
      if (state.status === "docking") {
        const dockDuration = 2.2;
        const newProgress = Math.min(1.0, state.dockingProgress + dt / dockDuration);
        const maxElevation = 2.15; // Elevation brings probe interface directly into the collar

        // Smooth cubic ease-in-out ascent
        const t = newProgress;
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const elevation = ease * maxElevation;

        // Satellite continues rotating at its current spin rate
        const newSatRot = (state.satelliteRotation + state.currentOmega * dt) % (Math.PI * 2);

        if (newProgress >= 1.0) {
          // Check alignment precision between satellite spin and station spin
          const omegaDiff = Math.abs(state.currentOmega - config.targetOmega);
          const radiusDiff = Math.abs(state.sliderValue - config.targetRadius);
          const isSuccessful = radiusDiff <= config.tolerance || omegaDiff <= 0.05;

          if (isSuccessful) {
            // MERGE SUCCESS: The satellite's rotation locks to the station collar!
            // They now rotate together as one synchronized structure!
            set({
              status: "success",
              dockingProgress: 1.0,
              dockElevation: maxElevation,
              satelliteRotation: newCollarRot, // Locked with station collar
              dockingCollarRotation: newCollarRot,
              simTime: state.simTime + dt,
              stars: 3,
              score: 500,
              showResultModal: true,
            });
          } else {
            // MERGE FAILURE: Rotational shear mismatch
            const isTooFast = state.currentOmega > config.targetOmega;
            const reason = isTooFast
              ? `Centrifuge Shear Collision: The satellite was spinning too fast (${state.currentOmega.toFixed(2)} rad/s) compared to the station collar (${config.targetOmega.toFixed(2)} rad/s). The counterweights were not extended far enough (configured r = ${state.sliderValue.toFixed(2)} m vs target ${config.targetRadius.toFixed(2)} m).`
              : `Rotational Stall / Guide Rejection: The satellite was spinning too slowly (${state.currentOmega.toFixed(2)} rad/s) compared to the station collar (${config.targetOmega.toFixed(2)} rad/s). The counterweights were extended too far (configured r = ${state.sliderValue.toFixed(2)} m vs target ${config.targetRadius.toFixed(2)} m).`;

            set({
              status: "fail",
              dockingProgress: 1.0,
              dockElevation: maxElevation - 0.2, // Small bounce back
              satelliteRotation: newSatRot,
              dockingCollarRotation: newCollarRot,
              simTime: state.simTime + dt,
              failureReason: reason,
              showResultModal: true,
            });
          }
        } else {
          set({
            dockingProgress: newProgress,
            dockElevation: elevation,
            satelliteRotation: newSatRot,
            dockingCollarRotation: newCollarRot,
            simTime: state.simTime + dt,
          });
        }
        return;
      }

      // 4. Success State: Merged together! Both rotate at the station's speed as ONE unit!
      if (state.status === "success") {
        set({
          satelliteRotation: newCollarRot, // Merged rotation with station!
          dockingCollarRotation: newCollarRot,
          simTime: state.simTime + dt,
        });
        return;
      }

      // 5. Fail State: Keep rotating independently
      const newSatRot = (state.satelliteRotation + state.currentOmega * dt) % (Math.PI * 2);
      set({
        satelliteRotation: newSatRot,
        dockingCollarRotation: newCollarRot,
        simTime: state.simTime + dt,
      });
    },
  };
});
