"use client";

import { createChallengeStore, createChallengeContext } from "@/stores/factory";

export interface EscapeArtistRoundConfig {
  roundNumber: number;
  title: string;
  channelWidth: number;
  channelLength: number;
  riverCurrent: { x: number; y: number };
  playerSpeedMax: number;
  patrolInitialPos: { x: number; y: number };
  patrolSpeed: number;
  extractionPos: { x: number; y: number };
  extractionRadius: number;
  captureRadius: number;
  safeMarginMin: number;
  description: string;
}

export const ESCAPE_ARTIST_ROUNDS: EscapeArtistRoundConfig[] = [
  {
    roundNumber: 1,
    title: "Line of Sight Interception",
    channelWidth: 160,
    channelLength: 400,
    riverCurrent: { x: 0, y: 0 },
    playerSpeedMax: 26,
    patrolInitialPos: { x: 260, y: 15 },
    patrolSpeed: 20,
    extractionPos: { x: 300, y: 160 },
    extractionRadius: 24,
    captureRadius: 18,
    safeMarginMin: 20,
    description: "Patrol boat attempts pure line-of-sight interception. Calculate your heading angle θ and speed to cross into the extraction buoy without entering the 18m capture zone.",
  },
  {
    roundNumber: 2,
    title: "Cross-Current River Vector Drift",
    channelWidth: 180,
    channelLength: 450,
    riverCurrent: { x: 8, y: 0 },
    playerSpeedMax: 28,
    patrolInitialPos: { x: 280, y: 25 },
    patrolSpeed: 22,
    extractionPos: { x: 340, y: 180 },
    extractionRadius: 26,
    captureRadius: 20,
    safeMarginMin: 25,
    description: "A fast 8 m/s river current pushes all vessels downstream (v_ground = v_engine + v_river). Steer upstream into the current to outmaneuver the interceptor!",
  },
  {
    roundNumber: 3,
    title: "Closest Approach & Evasion",
    channelWidth: 200,
    channelLength: 500,
    riverCurrent: { x: 10, y: 0 },
    playerSpeedMax: 30,
    patrolInitialPos: { x: 250, y: 40 },
    patrolSpeed: 25,
    extractionPos: { x: 420, y: 200 },
    extractionRadius: 28,
    captureRadius: 22,
    safeMarginMin: 30,
    description: "High-speed pursuit interceptor with adaptive heading. Calculate the minimum distance of closest approach (d_min = |r0 × v_rel| / |v_rel|) and escape under pressure!",
  },
];

export interface EscapeArtistExtra extends Record<string, unknown> {
  currentRound: number;
  headingAngleDeg: number;
  engineThrottle: number;
  nitroRemaining: number;
  isBoosting: boolean;
  isSteeringLeft: boolean;
  isSteeringRight: boolean;
  cameraMode: "tactical" | "chase" | "overhead";
  showTrajectoryGuide: boolean;

  // Simulation State
  isRunning: boolean;
  isCaptured: boolean;
  captureReason: string | null;
  hasEscaped: boolean;
  escapeTime: number;
  closestApproachDist: number;
  isSoundEnabled: boolean;
  totalScore: number;
  streak: number;
  starsEarned: number;
  floatingToast: string | null;

  // Live Position / Velocity Getters
  getLiveState: () => {
    playerPos: { x: number; y: number };
    playerVel: { x: number; y: number };
    patrolPos: { x: number; y: number };
    patrolVel: { x: number; y: number };
    relVel: { x: number; y: number };
    distToPatrol: number;
    distToExtraction: number;
    closestDist: number;
    nitro: number;
    timeElapsed: number;
  };
  setLiveGetter: (fn: () => any) => void;

  // Actions
  setHeadingAngle: (angle: number) => void;
  setEngineThrottle: (throttle: number) => void;
  setBoosting: (boost: boolean) => void;
  setSteeringLeft: (active: boolean) => void;
  setSteeringRight: (active: boolean) => void;
  setCameraMode: (mode: "tactical" | "chase" | "overhead") => void;
  toggleTrajectoryGuide: () => void;
  startSimulation: () => void;
  resetRound: () => void;
  nextRound: () => void;
  recordSuccess: (timeTaken: number, minDistance: number, bonusXp?: number) => void;
  recordCapture: (reason: string) => void;
  toggleSound: () => void;
}

export const createEscapeArtistStore = createChallengeStore<EscapeArtistExtra>(
  {
    currentRound: 1,
    headingAngleDeg: 60,
    engineThrottle: 0.85,
    nitroRemaining: 100,
    isBoosting: false,
    isSteeringLeft: false,
    isSteeringRight: false,
    cameraMode: "tactical",
    showTrajectoryGuide: true,

    isRunning: false,
    isCaptured: false,
    captureReason: null,
    hasEscaped: false,
    escapeTime: 0,
    closestApproachDist: 999,
    isSoundEnabled: true,
    totalScore: 0,
    streak: 0,
    starsEarned: 0,
    floatingToast: null,

    getLiveState: () => ({
      playerPos: { x: 0, y: 0 },
      playerVel: { x: 0, y: 0 },
      patrolPos: { x: 260, y: 15 },
      patrolVel: { x: 0, y: 0 },
      relVel: { x: 0, y: 0 },
      distToPatrol: 260,
      distToExtraction: 340,
      closestDist: 260,
      nitro: 100,
      timeElapsed: 0,
    }),
    setLiveGetter: () => {},

    setHeadingAngle: () => {},
    setEngineThrottle: () => {},
    setBoosting: () => {},
    setSteeringLeft: () => {},
    setSteeringRight: () => {},
    setCameraMode: () => {},
    toggleTrajectoryGuide: () => {},
    startSimulation: () => {},
    resetRound: () => {},
    nextRound: () => {},
    recordSuccess: () => {},
    recordCapture: () => {},
    toggleSound: () => {},
  },
  (set, get) => {
    let liveGetter: () => any = () => ({
      playerPos: { x: 0, y: 0 },
      playerVel: { x: 0, y: 0 },
      patrolPos: { x: 260, y: 15 },
      patrolVel: { x: 0, y: 0 },
      relVel: { x: 0, y: 0 },
      distToPatrol: 260,
      distToExtraction: 340,
      closestDist: 260,
      nitro: 100,
      timeElapsed: 0,
    });

    return {
      getLiveState: () => liveGetter(),
      setLiveGetter: (fn) => {
        liveGetter = fn;
      },

      setHeadingAngle: (angle: number) => {
        const clamped = Math.max(0, Math.min(180, angle));
        set({ headingAngleDeg: clamped });
      },

      setEngineThrottle: (throttle: number) => {
        const clamped = Math.max(0.2, Math.min(1.0, throttle));
        set({ engineThrottle: clamped });
      },

      setBoosting: (boost: boolean) => set({ isBoosting: boost }),
      setSteeringLeft: (active: boolean) => set({ isSteeringLeft: active }),
      setSteeringRight: (active: boolean) => set({ isSteeringRight: active }),
      setCameraMode: (mode: "tactical" | "chase" | "overhead") => set({ cameraMode: mode }),
      toggleTrajectoryGuide: () => set({ showTrajectoryGuide: !get().showTrajectoryGuide }),

      startSimulation: () => {
        set({
          isRunning: true,
          isCaptured: false,
          captureReason: null,
          hasEscaped: false,
          escapeTime: 0,
          closestApproachDist: 999,
          floatingToast: "INTERCEPTION ACTIVE — EVADE & REACH BUOY!",
        });
      },

      resetRound: () => {
        set({
          isRunning: false,
          isCaptured: false,
          captureReason: null,
          hasEscaped: false,
          escapeTime: 0,
          closestApproachDist: 999,
          isBoosting: false,
          isSteeringLeft: false,
          isSteeringRight: false,
          nitroRemaining: 100,
          floatingToast: null,
        });
      },

      nextRound: () => {
        const { currentRound } = get();
        if (currentRound < ESCAPE_ARTIST_ROUNDS.length) {
          set({
            currentRound: currentRound + 1,
            isRunning: false,
            isCaptured: false,
            captureReason: null,
            hasEscaped: false,
            escapeTime: 0,
            closestApproachDist: 999,
            nitroRemaining: 100,
            floatingToast: null,
          });
        }
      },

      recordSuccess: (timeTaken: number, minDistance: number, bonusXp: number = 0) => {
        const { totalScore, streak, currentRound } = get();
        const roundCfg = ESCAPE_ARTIST_ROUNDS[currentRound - 1] || ESCAPE_ARTIST_ROUNDS[0];
        const isCleanEvasion = minDistance >= roundCfg.safeMarginMin;
        const baseEarned = isCleanEvasion ? 300 : 200;
        const gainedXp = baseEarned + bonusXp;

        set({
          isRunning: false,
          hasEscaped: true,
          escapeTime: timeTaken,
          closestApproachDist: minDistance,
          totalScore: totalScore + gainedXp,
          streak: streak + 1,
          floatingToast: `EXTRACTION SUCCESS! +${gainedXp} XP (Closest: ${minDistance.toFixed(1)}m)`,
        });
      },

      recordCapture: (reason: string) => {
        set({
          isRunning: false,
          isCaptured: true,
          captureReason: reason,
          streak: 0,
          floatingToast: "INTERCEPTED BY PATROL! RECALCULATE VECTOR",
        });
      },

      toggleSound: () => set({ isSoundEnabled: !get().isSoundEnabled }),
    };
  }
);

export const {
  ChallengeProvider: EscapeArtistProvider,
  useChallengeStore: useEscapeArtistStore,
  StoreContext: EscapeArtistContext,
} = createChallengeContext<EscapeArtistExtra>();
