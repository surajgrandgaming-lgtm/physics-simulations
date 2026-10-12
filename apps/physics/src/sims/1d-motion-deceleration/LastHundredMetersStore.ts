"use client";

import { createChallengeStore, createChallengeContext } from "@topcoaching/sim-core";

export type CarrierCameraMode = "orbit" | "cockpit" | "tower";

export interface CarrierTakeoffExtra extends Record<string, unknown> {
  currentRound: number;
  throttleLevel: number;
  targetTakeoffSpeed: number;
  maxSafeSpeed: number;
  deckLength: number;
  inputAcceleration: number;
  hasLaunched: boolean;
  isAccelerating: boolean;
  takeoffTriggered: boolean;
  flightOutcome: "idle" | "airborne" | "stalled_water" | "overheated_structural" | "overshot_deck";
  finalSpeed: number | null;
  takeoffPos: number | null;
  failedAttempts: number;
  cameraMode: CarrierCameraMode;
  isSoundEnabled: boolean;
  totalScore: number;
  streak: number;
  getLiveSpeed: () => number;
  getLiveJetPos: () => number;
  setLiveSpeedGetter: (fn: () => number) => void;
  setLiveJetPosGetter: (fn: () => number) => void;
  setInputAcceleration: (a: number) => void;
  setIsAccelerating: (accel: boolean) => void;
  setThrottleLevel: (t: number) => void;
  setCameraMode: (mode: CarrierCameraMode) => void;
  toggleSound: () => void;
  autoCalibrate: () => void;
  launchCatapult: () => void;
  triggerTakeoffPitch: () => void;
  recordFlightResult: (outcome: "airborne" | "stalled_water" | "overheated_structural" | "overshot_deck", speed: number, pos: number) => void;
  nextRound: () => void;
}

const MISSION_CONFIGS = [
  { round: 1, deckLength: 250, targetSpeed: 36, label: "Daylight Catapult (Standard)" },
  { round: 2, deckLength: 220, targetSpeed: 42, label: "Heavy Ordnance Payload" },
  { round: 3, deckLength: 175, targetSpeed: 40, label: "Assault Carrier Deck" },
];

export const createLastHundredMetersStore = createChallengeStore<CarrierTakeoffExtra>(
  {
    currentRound: 1,
    throttleLevel: 80,
    targetTakeoffSpeed: 36,
    maxSafeSpeed: 55,
    deckLength: 250,
    inputAcceleration: 3.2,
    hasLaunched: false,
    isAccelerating: false,
    takeoffTriggered: false,
    flightOutcome: "idle",
    finalSpeed: null,
    takeoffPos: null,
    failedAttempts: 0,
    cameraMode: "orbit",
    isSoundEnabled: true,
    totalScore: 0,
    streak: 0,
    getLiveSpeed: () => 0,
    getLiveJetPos: () => 0,
    setLiveSpeedGetter: () => {},
    setLiveJetPosGetter: () => {},
    setInputAcceleration: () => {},
    setIsAccelerating: () => {},
    setThrottleLevel: () => {},
    setCameraMode: () => {},
    toggleSound: () => {},
    autoCalibrate: () => {},
    launchCatapult: () => {},
    triggerTakeoffPitch: () => {},
    recordFlightResult: () => {},
    nextRound: () => {},
  },
  (set, get) => {
    let speedGetter: () => number = () => 0;
    let posGetter: () => number = () => 0;

    return {
      getLiveSpeed: () => speedGetter(),
      getLiveJetPos: () => posGetter(),

      setLiveSpeedGetter: (fn: () => number) => {
        speedGetter = fn;
      },
      setLiveJetPosGetter: (fn: () => number) => {
        posGetter = fn;
      },

      setInputAcceleration: (a: number) => {
        if (!get().hasLaunched) {
          set({ inputAcceleration: Math.max(1.5, Math.min(6.0, a)) });
        }
      },

      setThrottleLevel: (t: number) => {
        set({ throttleLevel: Math.max(20, Math.min(100, t)) });
      },

      setCameraMode: (mode: CarrierCameraMode) => {
        set({ cameraMode: mode });
      },

      toggleSound: () => {
        set({ isSoundEnabled: !get().isSoundEnabled });
      },

      autoCalibrate: () => {
        const { targetTakeoffSpeed, deckLength } = get();
        // Safe rotation margin is ~25m before deck edge
        const effectiveDist = Math.max(50, deckLength - 25);
        const optimalA = Math.min(5.5, (targetTakeoffSpeed * targetTakeoffSpeed) / (2 * effectiveDist) + 0.15);
        set({ inputAcceleration: Math.round(optimalA * 100) / 100 });
      },

      launchCatapult: () => {
        set({
          hasLaunched: true,
          takeoffTriggered: false,
          flightOutcome: "idle",
          finalSpeed: null,
          takeoffPos: null,
          status: "running",
        });
      },

      triggerTakeoffPitch: () => {
        const { hasLaunched, takeoffTriggered } = get();
        if (hasLaunched && !takeoffTriggered) {
          set({ takeoffTriggered: true });
        }
      },

      recordFlightResult: (outcome, speed, pos) => {
        const isSuccess = outcome === "airborne";
        const currentRound = get().currentRound;
        const deck = get().deckLength;

        let earnedStars = 1;
        let earnedPoints = 200;

        if (isSuccess) {
          const remainingDeck = deck - pos;
          if (remainingDeck >= 15 && remainingDeck <= 60) {
            earnedStars = 3;
            earnedPoints = 500;
          } else if (remainingDeck > 0) {
            earnedStars = 2;
            earnedPoints = 350;
          }

          set({
            totalScore: get().totalScore + earnedPoints,
            streak: get().streak + 1,
          });
        } else {
          set({
            failedAttempts: get().failedAttempts + 1,
            streak: 0,
          });
        }

        set({
          flightOutcome: outcome,
          finalSpeed: speed,
          takeoffPos: pos,
          status: isSuccess ? "success" : "fail",
        });

        if (isSuccess) {
          if (currentRound >= 3) {
            get().succeed(earnedStars);
          } else {
            set({ stars: earnedStars });
          }
        } else {
          get().fail();
        }
      },

      nextRound: () => {
        const round = get().currentRound;
        if (round < 3) {
          const nextR = round + 1;
          const config = MISSION_CONFIGS[nextR - 1];
          set({
            currentRound: nextR,
            deckLength: config.deckLength,
            targetTakeoffSpeed: config.targetSpeed,
            inputAcceleration: nextR === 2 ? 4.4 : 5.0,
            hasLaunched: false,
    isAccelerating: false,
    takeoffTriggered: false,
            flightOutcome: "idle",
            finalSpeed: null,
            takeoffPos: null,
            failedAttempts: 0,
            status: "idle",
          });
        }
      },

      reset: () => {
        const round = get().currentRound;
        const config = MISSION_CONFIGS[round - 1] || MISSION_CONFIGS[0];
        set({
          deckLength: config.deckLength,
          targetTakeoffSpeed: config.targetSpeed,
          inputAcceleration: round === 1 ? 3.2 : round === 2 ? 4.4 : 5.0,
          throttleLevel: 80,
          hasLaunched: false,
          takeoffTriggered: false,
          flightOutcome: "idle",
          finalSpeed: null,
          takeoffPos: null,
          status: "idle",
          stars: 0,
          elapsedMs: 0,
        });
      },
    };
  }
);

export const {
  ChallengeProvider: LastHundredMetersProvider,
  useChallengeStore: useLastHundredMetersStore,
  StoreContext: LastHundredMetersContext,
} = createChallengeContext<CarrierTakeoffExtra>();
