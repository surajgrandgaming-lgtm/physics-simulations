"use client";

import { createChallengeStore, createChallengeContext } from "@/stores/factory";

export type BallisticCameraMode = "side" | "fpv" | "impact";

export interface DeceleratingBulletExtra extends Record<string, unknown> {
  currentRound: number;
  initialVelocity: number;
  minSliderV: number;
  maxSliderV: number;
  mass: number;
  layer1Thickness: number;
  layer1Beta: number;
  layer2Thickness: number;
  layer2Beta: number;
  targetMinDepth: number;
  targetMaxDepth: number;
  playbackSpeed: number;
  cameraMode: BallisticCameraMode;
  isSoundEnabled: boolean;
  totalScore: number;
  streak: number;
  failedAttempts: number;
  phase: "ready" | "firing" | "completed";
  actualExitVelocity: number | null;
  actualPenetrationDepth: number | null;
  breachedLayer1: boolean;
  breachedLayer2: boolean;
  stoppedInZone: boolean;
  getLiveSpeed: () => number;
  getLiveDepth: () => number;
  getVtPoints: () => Array<{ t: number; x: number; v: number }>;
  setLiveSpeedGetter: (fn: () => number) => void;
  setLiveDepthGetter: (fn: () => number) => void;
  setVtPointsGetter: (fn: () => Array<{ t: number; x: number; v: number }>) => void;
  setInitialVelocity: (v: number) => void;
  adjustVelocity: (delta: number) => void;
  dischargeCapacitors: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setCameraMode: (mode: BallisticCameraMode) => void;
  toggleSound: () => void;
  autoCalibrate: () => void;
  fireRound: () => void;
  recordImpactResult: (l1Exit: number, finalDepth: number) => void;
  nextRound: () => void;
}

export const BALLISTIC_MISSIONS = [
  {
    round: 1,
    title: "Stage 1: Ballistic Gel & Kevlar Layer",
    l1Thickness: 6,
    l1Beta: 0.30,
    l2Thickness: 8,
    l2Beta: 0.40,
    targetDepth: 10.0,
    targetMin: 9.95,
    targetMax: 10.05,
    recommendedSpeed: 300,
    minSliderV: 180,
    maxSliderV: 480,
  },
  {
    round: 2,
    title: "Stage 2: Composite Ceramic Plate",
    l1Thickness: 5,
    l1Beta: 0.35,
    l2Thickness: 9,
    l2Beta: 0.45,
    targetDepth: 9.2,
    targetMin: 9.15,
    targetMax: 9.25,
    recommendedSpeed: 380,
    minSliderV: 240,
    maxSliderV: 560,
  },
  {
    round: 3,
    title: "Stage 3: Titanium Sabot Core Breach",
    l1Thickness: 6,
    l1Beta: 0.40,
    l2Thickness: 8,
    l2Beta: 0.50,
    targetDepth: 9.5,
    targetMin: 9.45,
    targetMax: 9.55,
    recommendedSpeed: 635,
    minSliderV: 450,
    maxSliderV: 800,
  },
];

export const createDeceleratingBulletStore = createChallengeStore<DeceleratingBulletExtra>(
  {
    currentRound: 1,
    initialVelocity: 200,
    minSliderV: 180,
    maxSliderV: 480,
    mass: 0.01,
    layer1Thickness: 6,
    layer1Beta: 0.30,
    layer2Thickness: 8,
    layer2Beta: 0.40,
    targetMinDepth: 9.95,
    targetMaxDepth: 10.05,
    playbackSpeed: 0.25,
    cameraMode: "side",
    isSoundEnabled: true,
    totalScore: 0,
    streak: 0,
    failedAttempts: 0,
    phase: "ready",
    actualExitVelocity: null,
    actualPenetrationDepth: null,
    breachedLayer1: false,
    breachedLayer2: false,
    stoppedInZone: false,
    getLiveSpeed: () => 0,
    getLiveDepth: () => 0,
    getVtPoints: () => [],
    setLiveSpeedGetter: () => {},
    setLiveDepthGetter: () => {},
    setVtPointsGetter: () => {},
    setInitialVelocity: () => {},
    adjustVelocity: () => {},
    dischargeCapacitors: () => {},
    setPlaybackSpeed: () => {},
    setCameraMode: () => {},
    toggleSound: () => {},
    autoCalibrate: () => {},
    fireRound: () => {},
    recordImpactResult: () => {},
    nextRound: () => {},
  },
  (set, get) => {
    let speedGetter: () => number = () => 0;
    let depthGetter: () => number = () => 0;
    let vtPointsGetter: () => Array<{ t: number; x: number; v: number }> = () => [];

    return {
      getLiveSpeed: () => speedGetter(),
      getLiveDepth: () => depthGetter(),
      getVtPoints: () => vtPointsGetter(),

      setLiveSpeedGetter: (fn: () => number) => {
        speedGetter = fn;
      },
      setLiveDepthGetter: (fn: () => number) => {
        depthGetter = fn;
      },
      setVtPointsGetter: (fn: () => Array<{ t: number; x: number; v: number }>) => {
        vtPointsGetter = fn;
      },

      setInitialVelocity: (v: number) => {
        if (get().phase !== "firing") {
          const { minSliderV, maxSliderV } = get();
          set({ initialVelocity: Math.max(minSliderV, Math.min(maxSliderV, Math.round(v))) });
        }
      },

      adjustVelocity: (delta: number) => {
        if (get().phase !== "firing") {
          const { minSliderV, maxSliderV, initialVelocity } = get();
          set({ initialVelocity: Math.max(minSliderV, Math.min(maxSliderV, Math.round(initialVelocity + delta))) });
        }
      },

      dischargeCapacitors: () => {
        if (get().phase !== "firing") {
          const { minSliderV } = get();
          set({ initialVelocity: minSliderV });
        }
      },

      setPlaybackSpeed: (speed: number) => {
        set({ playbackSpeed: speed });
      },

      setCameraMode: (mode: BallisticCameraMode) => {
        set({ cameraMode: mode });
      },

      toggleSound: () => {
        set({ isSoundEnabled: !get().isSoundEnabled });
      },

      autoCalibrate: () => {
        const round = get().currentRound;
        const mission = BALLISTIC_MISSIONS[round - 1] || BALLISTIC_MISSIONS[0];
        set({ initialVelocity: mission.recommendedSpeed });
      },

      fireRound: () => {
        set({
          phase: "firing",
          status: "running",
          actualExitVelocity: null,
          actualPenetrationDepth: null,
          breachedLayer1: false,
          breachedLayer2: false,
          stoppedInZone: false,
        });
      },

      recordImpactResult: (l1Exit: number, finalDepth: number) => {
        const { layer1Thickness, targetMinDepth, targetMaxDepth, currentRound } = get();
        const breachedL1 = finalDepth >= layer1Thickness;
        const breachedL2 = finalDepth >= layer1Thickness + get().layer2Thickness;
        const inZone = finalDepth >= targetMinDepth && finalDepth <= targetMaxDepth;

        if (inZone) {
          const earnedStars = 3;
          const points = 600;
          set({
            totalScore: get().totalScore + points,
            streak: get().streak + 1,
            phase: "completed",
            status: "success",
            actualExitVelocity: l1Exit,
            actualPenetrationDepth: finalDepth,
            breachedLayer1: breachedL1,
            breachedLayer2: breachedL2,
            stoppedInZone: true,
          });

          if (currentRound >= 3) {
            get().succeed(earnedStars);
          } else {
            set({ stars: earnedStars });
          }
        } else {
          // Strictly fail if outside the exact sensor zone
          set({
            failedAttempts: get().failedAttempts + 1,
            streak: 0,
            phase: "completed",
            status: "fail",
            actualExitVelocity: l1Exit,
            actualPenetrationDepth: finalDepth,
            breachedLayer1: breachedL1,
            breachedLayer2: breachedL2,
            stoppedInZone: false,
          });
          get().fail();
        }
      },

      nextRound: () => {
        const round = get().currentRound;
        if (round < 3) {
          const nextR = round + 1;
          const config = BALLISTIC_MISSIONS[nextR - 1];
          set({
            currentRound: nextR,
            layer1Thickness: config.l1Thickness,
            layer1Beta: config.l1Beta,
            layer2Thickness: config.l2Thickness,
            layer2Beta: config.l2Beta,
            targetMinDepth: config.targetMin,
            targetMaxDepth: config.targetMax,
            minSliderV: config.minSliderV,
            maxSliderV: config.maxSliderV,
            initialVelocity: config.minSliderV + 20,
            phase: "ready",
            status: "idle",
            failedAttempts: 0,
            actualExitVelocity: null,
            actualPenetrationDepth: null,
            stoppedInZone: false,
            breachedLayer1: false,
            breachedLayer2: false,
          });
        }
      },

      reset: () => {
        const round = get().currentRound;
        const config = BALLISTIC_MISSIONS[round - 1] || BALLISTIC_MISSIONS[0];
        set({
          layer1Thickness: config.l1Thickness,
          layer1Beta: config.l1Beta,
          layer2Thickness: config.l2Thickness,
          layer2Beta: config.l2Beta,
          targetMinDepth: config.targetMin,
          targetMaxDepth: config.targetMax,
          minSliderV: config.minSliderV,
          maxSliderV: config.maxSliderV,
          initialVelocity: config.minSliderV + 20,
          phase: "ready",
          status: "idle",
          actualExitVelocity: null,
          actualPenetrationDepth: null,
          stoppedInZone: false,
          breachedLayer1: false,
          breachedLayer2: false,
          stars: 0,
          elapsedMs: 0,
        });
      },
    };
  }
);

export const {
  ChallengeProvider: DeceleratingBulletProvider,
  useChallengeStore: useDeceleratingBulletStore,
  StoreContext: DeceleratingBulletContext,
} = createChallengeContext<DeceleratingBulletExtra>();
