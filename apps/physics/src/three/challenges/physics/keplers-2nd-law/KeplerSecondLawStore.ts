"use client";

import { create } from "zustand";

export type SimulationStatus =
  | "idle"
  | "launching"
  | "success"
  | "fail_low"
  | "fail_high";

export interface KeplerStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  missionObjective: string;
  controlLabel: string;
  paramUnit: string;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  stepSmall: number;
  stepLarge: number;
  defaultSlider: number;
  targetValue: number;
  tolerance: number;
  // Astronomical parameters
  semiMajorAxisAU: number; // a
  eccentricity: number;    // e
  perihelionAU: number;    // r_p = a(1-e)
  aphelionAU: number;      // r_a = a(1+e)
  vPerihelionKms: number;  // v_p
  vAphelionTargetKms: number; // v_a
  sectorDeltaDays: number; // time window for swept area
  formulaHint: string;
  explanationTrap: string;
}

// Astronomical & Scaling Constants
export const AU_TO_KM = 1.496e8; // km per AU
export const GM_SUN = 1.32712440018e11; // km³/s² (standard gravitational parameter of the Sun)
// Visual scene scale: 1 AU = 3.5 scene units
export const SCENE_SCALE_AU = 3.5;

export const KEPLER_STAGES: KeplerStageConfig[] = [
  {
    stage: 1,
    title: "STAGE 1: ORBITAL SPEED BALANCER",
    subtitle: "Conserve Angular Momentum (L = r_p · v_p = r_a · v_a)",
    missionObjective:
      "A planetary orbiter has perihelion r_p = 1.00 AU with speed v_p = 30.0 km/s. At aphelion r_a = 2.00 AU, calculate and set the exact aphelion speed v_a so the orbit remains bound and stable.",
    controlLabel: "Aphelion Velocity (v_a)",
    paramUnit: "km/s",
    sliderMin: 5.0,
    sliderMax: 25.0,
    sliderStep: 0.1,
    stepSmall: 0.1,
    stepLarge: 1.0,
    defaultSlider: 10.0,
    targetValue: 15.0,
    tolerance: 0.35,
    semiMajorAxisAU: 1.5,
    eccentricity: 0.3333,
    perihelionAU: 1.0,
    aphelionAU: 2.0,
    vPerihelionKms: 30.0,
    vAphelionTargetKms: 15.0,
    sectorDeltaDays: 30,
    formulaHint: "v_a = v_p · (r_p / r_a)",
    explanationTrap:
      "If aphelion velocity is too high, the probe escapes onto a hyperbolic trajectory; if too low, it falls inward on an unstable plunge.",
  },
  {
    stage: 2,
    title: "STAGE 2: EQUAL AREA SWEEPER",
    subtitle: "Verify Areal Velocity Constancy (dA/dt = constant)",
    missionObjective:
      "Tune the orbital eccentricity e so that over a fixed observation window Δt = 25 days, the area swept near perihelion (short & wide) exactly equals the area swept near aphelion (long & narrow).",
    controlLabel: "Orbital Eccentricity (e)",
    paramUnit: "",
    sliderMin: 0.1,
    sliderMax: 0.75,
    sliderStep: 0.01,
    stepSmall: 0.01,
    stepLarge: 0.05,
    defaultSlider: 0.25,
    targetValue: 0.50,
    tolerance: 0.02,
    semiMajorAxisAU: 2.0,
    eccentricity: 0.50,
    perihelionAU: 1.0,
    aphelionAU: 3.0,
    vPerihelionKms: 36.0,
    vAphelionTargetKms: 12.0,
    sectorDeltaDays: 25,
    formulaHint: "dA/dt = L / (2m) = const  ⇒  Area_1 = Area_2",
    explanationTrap:
      "Equal areas in equal times requires exact matching of the elliptical geometry with the orbital period.",
  },
  {
    stage: 3,
    title: "STAGE 3: COMET SLINGSHOT CORRIDOR",
    subtitle: "High-Eccentricity Solar Slingshot & Outer Sensor Gate",
    missionObjective:
      "A deep-space Halley-class comet approaches perihelion at r_p = 0.50 AU at v_p = 54.0 km/s. Set the aphelion speed v_a for the comet to dock smoothly through the sensor gate at r_a = 4.50 AU.",
    controlLabel: "Aphelion Velocity (v_a)",
    paramUnit: "km/s",
    sliderMin: 2.0,
    sliderMax: 16.0,
    sliderStep: 0.1,
    stepSmall: 0.1,
    stepLarge: 1.0,
    defaultSlider: 10.0,
    targetValue: 6.0,
    tolerance: 0.25,
    semiMajorAxisAU: 2.5,
    eccentricity: 0.80,
    perihelionAU: 0.5,
    aphelionAU: 4.5,
    vPerihelionKms: 54.0,
    vAphelionTargetKms: 6.0,
    sectorDeltaDays: 20,
    formulaHint: "v_a = v_p · (r_p / r_a) = 54.0 · (0.50 / 4.50) = 6.0 km/s",
    explanationTrap:
      "With extreme eccentricity (e = 0.80), the planet speeds up by a factor of 9x at perihelion relative to aphelion!",
  },
];

interface KeplerSecondLawState {
  currentStage: number;
  status: SimulationStatus;
  sliderValue: number;

  // Live simulation telemetry
  orbitProgress: number; // 0 to 1
  currentRadiusAU: number;
  currentVelocityKms: number;
  currentAngularMomentum: number; // L / m in AU · km/s
  arealVelocityAU2PerDay: number;

  // Swept areas for visual sectors
  perihelionAreaAU2: number;
  aphelionAreaAU2: number;
  areaRatio: number;

  // Failure / success info
  failureReason: string;
  showResultModal: boolean;
  introKey: number; // incremented on initial mount, retry, or stage switch to trigger intro transition

  // Camera transition state
  cameraIntroActive: boolean;
  cameraIntroProgress: number; // 0 (target close-up) -> 1 (wide zoom)

  // Actions
  setSliderValue: (val: number) => void;
  adjustSliderValue: (delta: number) => void;
  launchSimulation: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  setStage: (stage: number) => void;
  closeResultModal: () => void;
  updateTelemetry: (params: {
    orbitProgress: number;
    radiusAU: number;
    velocityKms: number;
    angMom: number;
    arealVel: number;
    area1: number;
    area2: number;
  }) => void;
  setCameraIntroState: (active: boolean, progress: number) => void;
  finishSimulation: (success: boolean, reason?: string) => void;
}

export const useKeplerSecondLawStore = create<KeplerSecondLawState>((set, get) => {
  const initialStageConfig = KEPLER_STAGES[0];

  return {
    currentStage: 1,
    status: "idle",
    sliderValue: initialStageConfig.defaultSlider,

    orbitProgress: 0,
    currentRadiusAU: initialStageConfig.perihelionAU,
    currentVelocityKms: initialStageConfig.vPerihelionKms,
    currentAngularMomentum: initialStageConfig.perihelionAU * initialStageConfig.vPerihelionKms,
    arealVelocityAU2PerDay: 0.15,

    perihelionAreaAU2: 0,
    aphelionAreaAU2: 0,
    areaRatio: 1.0,

    failureReason: "",
    showResultModal: false,
    introKey: 1,

    cameraIntroActive: false,
    cameraIntroProgress: 0,

    setSliderValue: (val: number) => {
      const cfg = KEPLER_STAGES[get().currentStage - 1];
      const clamped = Math.max(cfg.sliderMin, Math.min(cfg.sliderMax, Number(val.toFixed(2))));
      set({ sliderValue: clamped });
    },

    adjustSliderValue: (delta: number) => {
      const { sliderValue, currentStage } = get();
      const cfg = KEPLER_STAGES[currentStage - 1];
      const next = Math.max(cfg.sliderMin, Math.min(cfg.sliderMax, Number((sliderValue + delta).toFixed(2))));
      set({ sliderValue: next });
    },

    launchSimulation: () => {
      const { status } = get();
      if (status === "launching") return;

      set({
        status: "launching",
        showResultModal: false,
        failureReason: "",
        orbitProgress: 0,
        cameraIntroActive: false,
        cameraIntroProgress: 1,
      });
    },

    resetSimulation: () => {
      const cfg = KEPLER_STAGES[get().currentStage - 1];
      set({
        status: "idle",
        orbitProgress: 0,
        currentRadiusAU: cfg.perihelionAU,
        currentVelocityKms: cfg.vPerihelionKms,
        currentAngularMomentum: cfg.perihelionAU * cfg.vPerihelionKms,
        perihelionAreaAU2: 0,
        aphelionAreaAU2: 0,
        showResultModal: false,
        failureReason: "",
        introKey: get().introKey + 1,
        cameraIntroActive: false,
        cameraIntroProgress: 0,
      });
    },

    nextStage: () => {
      const next = Math.min(3, get().currentStage + 1);
      const cfg = KEPLER_STAGES[next - 1];
      set({
        currentStage: next,
        status: "idle",
        sliderValue: cfg.defaultSlider,
        orbitProgress: 0,
        currentRadiusAU: cfg.perihelionAU,
        currentVelocityKms: cfg.vPerihelionKms,
        currentAngularMomentum: cfg.perihelionAU * cfg.vPerihelionKms,
        perihelionAreaAU2: 0,
        aphelionAreaAU2: 0,
        showResultModal: false,
        failureReason: "",
        introKey: get().introKey + 1,
        cameraIntroActive: false,
        cameraIntroProgress: 0,
      });
    },

    setStage: (stage: number) => {
      const clamped = Math.max(1, Math.min(3, stage));
      const cfg = KEPLER_STAGES[clamped - 1];
      set({
        currentStage: clamped,
        status: "idle",
        sliderValue: cfg.defaultSlider,
        orbitProgress: 0,
        currentRadiusAU: cfg.perihelionAU,
        currentVelocityKms: cfg.vPerihelionKms,
        currentAngularMomentum: cfg.perihelionAU * cfg.vPerihelionKms,
        perihelionAreaAU2: 0,
        aphelionAreaAU2: 0,
        showResultModal: false,
        failureReason: "",
        introKey: get().introKey + 1,
        cameraIntroActive: false,
        cameraIntroProgress: 0,
      });
    },

    closeResultModal: () => {
      set({ showResultModal: false });
    },

    updateTelemetry: (params) => {
      const ratio = params.area2 > 0 ? params.area1 / params.area2 : 1.0;
      set({
        orbitProgress: params.orbitProgress,
        currentRadiusAU: params.radiusAU,
        currentVelocityKms: params.velocityKms,
        currentAngularMomentum: params.angMom,
        arealVelocityAU2PerDay: params.arealVel,
        perihelionAreaAU2: params.area1,
        aphelionAreaAU2: params.area2,
        areaRatio: ratio,
      });
    },

    setCameraIntroState: (active: boolean, progress: number) => {
      set({ cameraIntroActive: active, cameraIntroProgress: progress });
    },

    finishSimulation: (success: boolean, reason?: string) => {
      set({
        status: success ? "success" : "fail_low",
        showResultModal: true,
        failureReason: reason || "",
      });
    },
  };
});
