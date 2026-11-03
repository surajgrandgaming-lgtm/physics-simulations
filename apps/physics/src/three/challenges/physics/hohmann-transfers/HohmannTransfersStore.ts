import { create } from "zustand";

export interface HohmannStageConfig {
  stage: number;
  name: string;
  subtitle: string;
  missionObjective: string;
  centralBodyName: string;
  r1_km_or_au: number;
  r2_km_or_au: number;
  paramName: string;
  paramUnit: string;
  targetValue: number;
  tolerance: number;
  min: number;
  max: number;
  stepSmall: number;
  stepLarge: number;
  defaultSlider: number;
  explanationTrap: string;
}

export const HOHMANN_STAGES: HohmannStageConfig[] = [
  {
    stage: 1,
    name: "Stage 1: Orbit Injection Burn (LEO to MEO)",
    subtitle: "Low Earth Orbit (7,000 km) → Medium Earth Orbit (14,000 km)",
    missionObjective: "Calculate and apply the first prograde burn (Δv₁) at periapsis in LEO (r₁ = 7,000 km) to stretch the apoapsis of your transfer ellipse to touch the target orbit at r₂ = 14,000 km.",
    centralBodyName: "Earth",
    r1_km_or_au: 7000,
    r2_km_or_au: 14000,
    paramName: "Injection Delta-V (Δv₁)",
    paramUnit: "km/s",
    targetValue: 1.17,
    tolerance: 0.04,
    min: 0.5,
    max: 2.0,
    stepSmall: 0.01,
    stepLarge: 0.1,
    defaultSlider: 0.8,
    explanationTrap: "Firing forward adds energy at periapsis, which raises the orbit on the opposite side (apoapsis). Too little thrust leaves you short of the green ring, while too much overshoots into deep space!",
  },
  {
    stage: 2,
    name: "Stage 2: Orbit Circularization Burn (LEO to GEO)",
    subtitle: "Apoapsis Injection at Geostationary Orbit (42,164 km)",
    missionObjective: "Your satellite has arrived at apoapsis (r₂ = 42,164 km) of a GTO transfer orbit. Apply the second prograde circularization burn (Δv₂) to lock into a permanent circular geostationary orbit.",
    centralBodyName: "Earth",
    r1_km_or_au: 6771,
    r2_km_or_au: 42164,
    paramName: "Circularization Delta-V (Δv₂)",
    paramUnit: "km/s",
    targetValue: 1.46,
    tolerance: 0.04,
    min: 0.5,
    max: 2.5,
    stepSmall: 0.01,
    stepLarge: 0.1,
    defaultSlider: 1.0,
    explanationTrap: "At the highest point (apoapsis), the satellite moves slowest! Without this second speed boost, Earth's gravity pulls it right back down into an egg-shaped orbit.",
  },
  {
    stage: 3,
    name: "Stage 3: Interplanetary Timing (Earth to Mars)",
    subtitle: "Heliocentric Transfer (1.000 AU → 1.524 AU)",
    missionObjective: "Calculate the required planetary phase angle (φ) of Mars relative to Earth at departure so that the probe and Mars arrive at the exact same orbital intercept point.",
    centralBodyName: "Sun",
    r1_km_or_au: 1.0,
    r2_km_or_au: 1.524,
    paramName: "Departure Phase Angle (φ)",
    paramUnit: "°",
    targetValue: 44.3,
    tolerance: 1.0,
    min: 10.0,
    max: 80.0,
    stepSmall: 0.1,
    stepLarge: 1.0,
    defaultSlider: 25.0,
    explanationTrap: "Don't aim where Mars is now! Mars takes 8.5 months to move during your flight. You must launch with Mars roughly 44° ahead so both arrive at the exact same spot.",
  },
];

export type SimulationStatus = "idle" | "launching" | "success" | "fail_low" | "fail_high";

interface HohmannTransfersState {
  currentStage: number;
  sliderValue: number;
  status: SimulationStatus;
  progress: number; // 0 to 1 along transfer / orbit
  simTime: number;
  isMissionStarted: boolean;
  missionStartedAt: number;
  showResultModal: boolean;
  failureReason: string | null;
  cameraResetKey: number;

  // Actions
  setSliderValue: (val: number) => void;
  adjustSliderValue: (delta: number) => void;
  startMission: () => void;
  launchSimulation: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  setStage: (stageNum: number) => void;
  closeResultModal: () => void;
  setStatus: (status: SimulationStatus, reason?: string) => void;
  setProgress: (progress: number) => void;
}

export const useHohmannTransfersStore = create<HohmannTransfersState>((set, get) => ({
  currentStage: 1,
  sliderValue: HOHMANN_STAGES[0].defaultSlider,
  status: "idle",
  progress: 0,
  simTime: 0,
  isMissionStarted: false,
  missionStartedAt: 0,
  showResultModal: false,
  failureReason: null,
  cameraResetKey: 0,

  setSliderValue: (val: number) => {
    const stage = HOHMANN_STAGES[get().currentStage - 1];
    const clamped = Math.max(stage.min, Math.min(stage.max, Number(val.toFixed(2))));
    set({ sliderValue: clamped });
  },

  adjustSliderValue: (delta: number) => {
    const stage = HOHMANN_STAGES[get().currentStage - 1];
    const current = get().sliderValue;
    const isStage3 = get().currentStage === 3;
    const precision = isStage3 ? 1 : 2;
    const updated = Math.max(stage.min, Math.min(stage.max, Number((current + delta).toFixed(precision))));
    set({ sliderValue: updated });
  },

  startMission: () => {
    set({
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      cameraResetKey: get().cameraResetKey + 1,
    });
  },

  launchSimulation: () => {
    if (get().status === "launching") return;
    set({
      status: "launching",
      progress: 0,
      simTime: 0,
      showResultModal: false,
      failureReason: null,
    });
  },

  resetSimulation: () => {
    const stage = HOHMANN_STAGES[get().currentStage - 1];
    set({
      status: "idle",
      progress: 0,
      simTime: 0,
      sliderValue: stage.defaultSlider,
      showResultModal: false,
      failureReason: null,
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      cameraResetKey: get().cameraResetKey + 1,
    });
  },

  nextStage: () => {
    const next = Math.min(3, get().currentStage + 1);
    const stage = HOHMANN_STAGES[next - 1];
    set({
      currentStage: next,
      sliderValue: stage.defaultSlider,
      status: "idle",
      progress: 0,
      simTime: 0,
      showResultModal: false,
      failureReason: null,
      isMissionStarted: false,
      missionStartedAt: 0,
      cameraResetKey: get().cameraResetKey + 1,
    });
  },

  setStage: (stageNum: number) => {
    const target = Math.max(1, Math.min(3, stageNum));
    const stage = HOHMANN_STAGES[target - 1];
    set({
      currentStage: target,
      sliderValue: stage.defaultSlider,
      status: "idle",
      progress: 0,
      simTime: 0,
      showResultModal: false,
      failureReason: null,
      isMissionStarted: false,
      missionStartedAt: 0,
      cameraResetKey: get().cameraResetKey + 1,
    });
  },

  closeResultModal: () => {
    set({ showResultModal: false });
  },

  setStatus: (status: SimulationStatus, reason?: string) => {
    set({
      status,
      showResultModal: true,
      failureReason: reason || null,
    });
  },

  setProgress: (progress: number) => {
    set({ progress });
  },
}));

