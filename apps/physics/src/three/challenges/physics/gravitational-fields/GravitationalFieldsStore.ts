"use client";

import { create } from "zustand";

export type SimulationStatus =
  | "idle"
  | "launching"
  | "success"
  | "fail_low"
  | "fail_high";

export interface GravitationalFieldsStageConfig {
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
  // Physical parameters
  targetRadiusKm: number;    // r from center
  targetDepthKm: number;     // d from surface (d = R - r)
  targetFieldMs2: number;    // g(r)
  targetTransitTimeMin?: number;
  formulaHint: string;
  explanationTrap: string;
}

// ─── Real Astronomical & Earth Constants ─────────────────────────────────────────
export const R_EARTH_KM = 6371.0;          // km (Earth mean radius)
export const G_SURFACE_MS2 = 9.81;         // m/s² (surface gravitational acceleration)
export const V_MAX_CENTER_KMS = 7.906;     // km/s (v_max = sqrt(g0 * R))
export const T_SHM_FULL_MIN = 84.4;        // min (T = 2*pi*sqrt(R/g))
export const T_SHM_ONE_WAY_MIN = 42.2;     // min (t_transit = T / 2)

// Visual Scene Scaling: Earth Radius R = 3.5 scene units
export const SCENE_RADIUS = 3.5;
export const KM_TO_SCENE = SCENE_RADIUS / R_EARTH_KM;

export const GRAVITATIONAL_FIELDS_STAGES: GravitationalFieldsStageConfig[] = [
  {
    stage: 1,
    title: "STAGE 1: SUB-SURFACE FIELD CALIBRATION",
    subtitle: "Linear Field Variation Inside Solid Sphere: g(r) = g₀ · (r / R)",
    missionObjective:
      "A deep-core seismic laboratory probe is descending to an underground base at r = 0.50 R (depth d = 3,185.5 km). Calculate and set the local gravitational field strength g(r) to calibrate its hover thrusters.",
    controlLabel: "Local Gravity Field g(r)",
    paramUnit: "m/s²",
    sliderMin: 1.0,
    sliderMax: 10.0,
    sliderStep: 0.05,
    stepSmall: 0.1,
    stepLarge: 1.0,
    defaultSlider: 7.5,
    targetValue: 4.91, // 9.81 * 0.50 = 4.905
    tolerance: 0.20,
    targetRadiusKm: 3185.5,
    targetDepthKm: 3185.5,
    targetFieldMs2: 4.91,
    formulaHint: "g(r) = g₀ · (r / R) = 9.81 · 0.50 = 4.91 m/s²",
    explanationTrap:
      "Unlike outside where g ∝ 1/r², inside a solid sphere the outer spherical shell provides zero net gravity! The field drops linearly to zero at the center.",
  },
  {
    stage: 2,
    title: "STAGE 2: DIAMETRIC TUNNEL TRANSIT",
    subtitle: "Simple Harmonic Motion (SHM) Through Earth's Center",
    missionObjective:
      "Release the probe into a frictionless evacuated borehole cutting from North Pole to South Pole. Calculate the one-way transit time t = π · √(R / g₀) so the antipode station can trigger the arrival clamp.",
    controlLabel: "One-Way Transit Time",
    paramUnit: "min",
    sliderMin: 30.0,
    sliderMax: 55.0,
    sliderStep: 0.1,
    stepSmall: 0.2,
    stepLarge: 1.0,
    defaultSlider: 35.0,
    targetValue: 42.2, // pi * sqrt(R / g0) = 2533 s = 42.22 min
    tolerance: 0.8,
    targetRadiusKm: 0.0,
    targetDepthKm: 6371.0,
    targetFieldMs2: 0.0,
    targetTransitTimeMin: 42.2,
    formulaHint: "t = π · √(R / g₀) = 42.2 min, v_max = √(g₀ · R) = 7.91 km/s",
    explanationTrap:
      "Because restoring force is linear (F = -m(g₀/R)r), motion is exact SHM! Maximum speed occurs right at the center where gravity is zero.",
  },
  {
    stage: 3,
    title: "STAGE 3: HOLLOW PLANETARY CAVERN",
    subtitle: "Newton's Shell Theorem: Weightlessness Inside a Spherical Shell",
    missionObjective:
      "The probe enters an ancient hollow planetary shell (cavity radius r < 3,000 km). Calibrate the internal field sensor to the exact theoretical gravity inside a uniform hollow spherical shell.",
    controlLabel: "Cavity Gravity Field g(r)",
    paramUnit: "m/s²",
    sliderMin: 0.0,
    sliderMax: 5.0,
    sliderStep: 0.05,
    stepSmall: 0.1,
    stepLarge: 0.5,
    defaultSlider: 2.5,
    targetValue: 0.00,
    tolerance: 0.15,
    targetRadiusKm: 2000.0,
    targetDepthKm: 4371.0,
    targetFieldMs2: 0.00,
    formulaHint: "g_inside = 0 m/s² everywhere inside a hollow spherical shell",
    explanationTrap:
      "Inside any hollow spherical shell, gravitational forces from all shell elements in every direction cancel out vectorially to strictly zero!",
  },
];

interface GravitationalFieldsState {
  currentStage: number;
  status: SimulationStatus;
  sliderValue: number;

  // Live simulation telemetry
  probeY: number; // scene units (-SCENE_RADIUS to +SCENE_RADIUS)
  currentRadiusKm: number;
  currentDepthKm: number;
  currentFieldMs2: number;
  currentVelocityKms: number;
  elapsedTransitSec: number;

  // Failure / success info
  failureReason: string;
  showResultModal: boolean;

  // Camera transition state
  introKey: number;
  isMissionStarted: boolean;
  missionStartedAt: number | null;

  // Actions
  startMission: () => void;
  setSliderValue: (val: number) => void;
  adjustSliderValue: (delta: number) => void;
  launchSimulation: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  setStage: (stage: number) => void;
  closeResultModal: () => void;
  updateTelemetry: (params: {
    probeY: number;
    radiusKm: number;
    depthKm: number;
    fieldMs2: number;
    velocityKms: number;
    elapsedSec: number;
  }) => void;
  finishSimulation: (success: boolean, reason?: string) => void;
}

export const useGravitationalFieldsStore = create<GravitationalFieldsState>((set, get) => {
  const initStage = GRAVITATIONAL_FIELDS_STAGES[0];

  return {
    currentStage: 1,
    status: "idle",
    sliderValue: initStage.defaultSlider,

    probeY: SCENE_RADIUS, // Starts at North Pole surface
    currentRadiusKm: R_EARTH_KM,
    currentDepthKm: 0,
    currentFieldMs2: G_SURFACE_MS2,
    currentVelocityKms: 0,
    elapsedTransitSec: 0,

    failureReason: "",
    showResultModal: false,

    introKey: 1,
    isMissionStarted: false,
    missionStartedAt: null,

    startMission: () => {
      set({
        isMissionStarted: true,
        missionStartedAt: performance.now(),
      });
    },

    setSliderValue: (val: number) => {
      const cfg = GRAVITATIONAL_FIELDS_STAGES[get().currentStage - 1];
      const clamped = Math.max(cfg.sliderMin, Math.min(cfg.sliderMax, Number(val.toFixed(2))));
      set({ sliderValue: clamped });
    },

    adjustSliderValue: (delta: number) => {
      const { sliderValue, currentStage } = get();
      const cfg = GRAVITATIONAL_FIELDS_STAGES[currentStage - 1];
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
        elapsedTransitSec: 0,
      });
    },

    resetSimulation: () => {
      const cfg = GRAVITATIONAL_FIELDS_STAGES[get().currentStage - 1];
      set({
        status: "idle",
        sliderValue: cfg.defaultSlider,
        probeY: SCENE_RADIUS,
        currentRadiusKm: R_EARTH_KM,
        currentDepthKm: 0,
        currentFieldMs2: G_SURFACE_MS2,
        currentVelocityKms: 0,
        elapsedTransitSec: 0,
        showResultModal: false,
        failureReason: "",
        introKey: get().introKey + 1,
        isMissionStarted: true,
        missionStartedAt: performance.now(),
      });
    },

    nextStage: () => {
      const next = Math.min(3, get().currentStage + 1);
      const cfg = GRAVITATIONAL_FIELDS_STAGES[next - 1];
      set({
        currentStage: next,
        status: "idle",
        sliderValue: cfg.defaultSlider,
        probeY: SCENE_RADIUS,
        currentRadiusKm: R_EARTH_KM,
        currentDepthKm: 0,
        currentFieldMs2: G_SURFACE_MS2,
        currentVelocityKms: 0,
        elapsedTransitSec: 0,
        showResultModal: false,
        failureReason: "",
        introKey: get().introKey + 1,
        isMissionStarted: true,
        missionStartedAt: performance.now(),
      });
    },

    setStage: (stage: number) => {
      const clamped = Math.max(1, Math.min(3, stage));
      const cfg = GRAVITATIONAL_FIELDS_STAGES[clamped - 1];
      set({
        currentStage: clamped,
        status: "idle",
        sliderValue: cfg.defaultSlider,
        probeY: SCENE_RADIUS,
        currentRadiusKm: R_EARTH_KM,
        currentDepthKm: 0,
        currentFieldMs2: G_SURFACE_MS2,
        currentVelocityKms: 0,
        elapsedTransitSec: 0,
        showResultModal: false,
        failureReason: "",
        introKey: get().introKey + 1,
        isMissionStarted: true,
        missionStartedAt: performance.now(),
      });
    },

    closeResultModal: () => {
      set({ showResultModal: false });
    },

    updateTelemetry: (params) => {
      set({
        probeY: params.probeY,
        currentRadiusKm: params.radiusKm,
        currentDepthKm: params.depthKm,
        currentFieldMs2: params.fieldMs2,
        currentVelocityKms: params.velocityKms,
        elapsedTransitSec: params.elapsedSec,
      });
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

