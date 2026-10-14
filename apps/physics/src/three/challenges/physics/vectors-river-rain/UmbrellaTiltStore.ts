import { create } from "zustand";

export interface RainStageConfig {
  stage: number;
  label: string;
  description: string;
  rainSpeedY: number; // Downward rain speed (m/s)
  windSpeedX: number; // Wind speed (m/s, + = tailwind, - = headwind)
  trackDistance: number; // Distance in meters to reach shelter
  allowedWetnessLimit: number; // Max allowed wetness %
}

export const UMBRELLA_STAGES: RainStageConfig[] = [
  {
    stage: 1,
    label: "Stage 1: Vertical Downpour",
    description: "No wind (v_wind = 0 m/s). Rain falls straight down at 9 m/s. Walking forward creates forward relative rain!",
    rainSpeedY: 9,
    windSpeedX: 0,
    trackDistance: 40,
    allowedWetnessLimit: 25,
  },
  {
    stage: 2,
    label: "Stage 2: Light Headwind",
    description: "Headwind (v_wind = -3 m/s). Rain already slants toward you. Walking forward increases the required forward tilt!",
    rainSpeedY: 11,
    windSpeedX: -3,
    trackDistance: 45,
    allowedWetnessLimit: 22,
  },
  {
    stage: 3,
    label: "Stage 3: Tailwind Squall",
    description: "Tailwind (v_wind = +4 m/s). Rain blows from behind! Tilt backward if walking slow, vertical if matching wind, forward if sprinting!",
    rainSpeedY: 12,
    windSpeedX: 4,
    trackDistance: 50,
    allowedWetnessLimit: 20,
  },
  {
    stage: 4,
    label: "Stage 4: Gale Headwind",
    description: "Gale force headwind (v_wind = -6 m/s, rain = 13 m/s). Large relative horizontal velocity requires steep forward tilt (~35° to 50°)!",
    rainSpeedY: 13,
    windSpeedX: -6,
    trackDistance: 55,
    allowedWetnessLimit: 18,
  },
  {
    stage: 5,
    label: "Stage 5: Storm Surge",
    description: "Extreme storm (v_wind = -8 m/s, rain = 14 m/s). Strict wetness limit — calibrate walk speed and umbrella tilt angle with precision!",
    rainSpeedY: 14,
    windSpeedX: -8,
    trackDistance: 60,
    allowedWetnessLimit: 15,
  },
];

export interface UmbrellaTiltState {
  currentRound: number;
  stageConfig: RainStageConfig;

  // Player motion & umbrella
  playerPosX: number;
  playerVelocityX: number; // Walking speed: 0 to 8 m/s
  umbrellaAngleDeg: number; // Tilt from vertical (-75 to +75 deg)
  wetnessPercentage: number; // 0 to 100%

  // Mission & Flyover transition status
  isMissionStarted: boolean;
  missionStartedAt: number | null;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  isSoaked: boolean;
  totalScore: number;

  // Actions
  startMission: () => void;
  setPlayerSpeed: (speed: number) => void;
  setUmbrellaAngle: (angle: number) => void;
  adjustUmbrellaAngle: (delta: number) => void;
  startWalking: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetRound: () => void;
  nextRound: () => void;
  tickSimulation: (dt: number) => void;
}

export const useUmbrellaTiltStore = create<UmbrellaTiltState>()((set, get) => ({
  currentRound: 1,
  stageConfig: UMBRELLA_STAGES[0],
  playerPosX: 0,
  playerVelocityX: 3.0,
  umbrellaAngleDeg: 0,
  wetnessPercentage: 0,
  isMissionStarted: false,
  missionStartedAt: null,
  isRunning: false,
  isPaused: false,
  isCompleted: false,
  isSoaked: false,
  totalScore: 0,

  startMission: () => {
    set({
      isMissionStarted: true,
      missionStartedAt: performance.now(),
    });
  },

  setPlayerSpeed: (speed: number) => {
    const clamped = Math.max(0, Math.min(8.0, Number(speed.toFixed(1))));
    set({ playerVelocityX: clamped });
  },

  setUmbrellaAngle: (angle: number) => {
    const clamped = Math.max(-75, Math.min(75, Math.round(angle)));
    set({ umbrellaAngleDeg: clamped });
  },

  adjustUmbrellaAngle: (delta: number) => {
    const current = get().umbrellaAngleDeg;
    const clamped = Math.max(-75, Math.min(75, Math.round(current + delta)));
    set({ umbrellaAngleDeg: clamped });
  },

  startWalking: () => {
    if (get().isCompleted || get().isSoaked) return;
    set({ isRunning: true, isPaused: false });
  },

  pauseSimulation: () => {
    set({ isPaused: true });
  },

  resumeSimulation: () => {
    set({ isPaused: false });
  },

  resetRound: () => {
    set({
      playerPosX: 0,
      playerVelocityX: 3.0,
      umbrellaAngleDeg: 0,
      wetnessPercentage: 0,
      isRunning: false,
      isPaused: false,
      isCompleted: false,
      isSoaked: false,
      isMissionStarted: true,
      missionStartedAt: performance.now(),
    });
  },

  nextRound: () => {
    const nextR = Math.min(UMBRELLA_STAGES.length, get().currentRound + 1);
    set({
      currentRound: nextR,
      stageConfig: UMBRELLA_STAGES[nextR - 1],
      playerPosX: 0,
      playerVelocityX: 3.0,
      umbrellaAngleDeg: 0,
      wetnessPercentage: 0,
      isRunning: false,
      isPaused: false,
      isCompleted: false,
      isSoaked: false,
      isMissionStarted: true,
      missionStartedAt: performance.now(),
    });
  },

  tickSimulation: (dt: number) => {
    const state = get();
    if (!state.isRunning || state.isPaused || state.isCompleted || state.isSoaked) return;

    const { stageConfig, playerPosX, playerVelocityX, umbrellaAngleDeg, wetnessPercentage } = state;

    // 1. Advance position
    const newPos = playerPosX + playerVelocityX * dt;

    // 2. Relative Velocity Vector Math:
    // Rain in ground frame: v_rain = (v_wind, -u_rain)
    // Man in ground frame:  v_man  = (v_man, 0)
    // Relative velocity:    v_rel  = v_rain - v_man = (v_wind - v_man, -u_rain)
    // Direction rain comes from: -(v_rel) = (v_man - v_wind, u_rain)
    // Ideal umbrella tilt angle from vertical:
    // theta_ideal = atan2(v_man - v_wind, u_rain)
    const uRain = stageConfig.rainSpeedY;
    const vxRel = playerVelocityX - stageConfig.windSpeedX;
    const idealAngleDeg = (Math.atan2(vxRel, uRain) * 180) / Math.PI;

    // 3. Angular deviation between umbrella and relative rain stream
    const angleError = Math.abs(umbrellaAngleDeg - idealAngleDeg);

    // 4. Leak calculation (canopy covers ±16 degrees cone)
    let leakRate = 0;
    if (angleError > 16) {
      const errorSeverity = Math.min(1.0, (angleError - 16) / 32);
      leakRate = errorSeverity * 14.0;
    }

    const newWetness = Math.min(100, wetnessPercentage + leakRate * dt);
    const isFailed = newWetness >= stageConfig.allowedWetnessLimit;
    const isFinished = newPos >= stageConfig.trackDistance;

    if (isFailed) {
      set({
        playerPosX: newPos,
        wetnessPercentage: newWetness,
        isRunning: false,
        isSoaked: true,
      });
    } else if (isFinished) {
      const dryScore = Math.max(
        100,
        Math.round((1 - newWetness / stageConfig.allowedWetnessLimit) * 500)
      );
      set({
        playerPosX: stageConfig.trackDistance,
        wetnessPercentage: newWetness,
        isRunning: false,
        isCompleted: true,
        totalScore: state.totalScore + dryScore,
      });
    } else {
      set({
        playerPosX: newPos,
        wetnessPercentage: newWetness,
      });
    }
  },
}));
