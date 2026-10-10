"use client";

import { createChallengeStore, createChallengeContext } from "@/stores/factory";

export type ReferenceFrame = "ground" | "water" | "boat";
export type CameraMode = "tpp" | "isometric" | "overhead" | "target";

export interface PrecisionRoundConfig {
  roundNumber: number;
  riverWidth: number;
  riverSpeed: number;
  boatSpeed: number;
  targetY: number;
  targetTolerance: number;
  description: string;
}

export const LAST_GAP_ROUNDS: PrecisionRoundConfig[] = [
  {
    roundNumber: 1,
    riverWidth: 300,
    riverSpeed: 3,
    boatSpeed: 5,
    targetY: 0,
    targetTolerance: 18,
    description: "Escape Pad (0 Drift): River flows North at 3 m/s. Steer upstream to land dead-center on the escape pad.",
  },
  {
    roundNumber: 2,
    riverWidth: 300,
    riverSpeed: 4,
    boatSpeed: 5,
    targetY: 0,
    targetTolerance: 18,
    description: "High Current Surge: River flow increased to 4 m/s North. Calculate the new steeper angle θ!",
  },
  {
    roundNumber: 3,
    riverWidth: 300,
    riverSpeed: 3,
    boatSpeed: 5,
    targetY: -50,
    targetTolerance: 18,
    description: "Offset Extraction Base: Escape pad is located at Y = -50m (Upstream). Calculate required heading!",
  },
];

export interface LastGapExtra extends Record<string, unknown> {
  currentRound: number;
  riverWidth: number;
  riverSpeed: number;
  boatSpeed: number;
  steerAngleDeg: number;
  targetY: number;
  targetTolerance: number;

  // Live Position
  boatPosX: number;
  boatPosY: number;

  // Real-time calculated values
  vxGround: number;
  vyGround: number;
  vGroundResultant: number;
  effectiveCrossingTime: number;
  finalPredictedDrift: number;

  // Simulation state
  simSpeedMultiplier: number;
  elapsedSimTime: number;
  isRunning: boolean;
  isCompleted: boolean;
  isTargetHit: boolean;
  frameOfReference: ReferenceFrame;
  cameraMode: CameraMode;
  isSoundEnabled: boolean;
  showVectors: boolean;
  totalScore: number;
  starsEarned: number;

  // Question Inputs
  inputAngle: string;
  inputEffectiveSpeed: string;
  inputCrossingTime: string;
  isAnswersSubmitted: boolean;
  scoreBreakdown: { angleCorrect: boolean; speedCorrect: boolean; timeCorrect: boolean };

  // Actions & Real-Time Steering
  setSteerAngleDeg: (angle: number) => void;
  adjustSteering: (deltaAngle: number) => void;
  setSimSpeedMultiplier: (mult: number) => void;
  setFrameOfReference: (frame: ReferenceFrame) => void;
  setCameraMode: (mode: CameraMode) => void;
  setShowVectors: (show: boolean) => void;
  toggleSound: () => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetRound: () => void;
  nextRound: () => void;
  setInputAngle: (val: string) => void;
  setInputEffectiveSpeed: (val: string) => void;
  setInputCrossingTime: (val: string) => void;
  submitAnswers: () => void;
  updateLivePosition: (posX: number, posY: number, simDt: number) => void;
}

export const createLastGapStore = createChallengeStore<LastGapExtra>(
  {
    currentRound: 1,
    riverWidth: 300,
    riverSpeed: 3,
    boatSpeed: 5,
    steerAngleDeg: 36.87,
    targetY: 0,
    targetTolerance: 18,

    boatPosX: 0,
    boatPosY: 0,

    vxGround: 4,
    vyGround: 0,
    vGroundResultant: 4,
    effectiveCrossingTime: 75,
    finalPredictedDrift: 0,

    simSpeedMultiplier: 2.5,
    elapsedSimTime: 0,
    isRunning: false,
    isCompleted: false,
    isTargetHit: false,
    frameOfReference: "ground",
    cameraMode: "tpp",
    isSoundEnabled: true,
    showVectors: true,
    totalScore: 0,
    starsEarned: 0,

    inputAngle: "",
    inputEffectiveSpeed: "",
    inputCrossingTime: "",
    isAnswersSubmitted: false,
    scoreBreakdown: { angleCorrect: false, speedCorrect: false, timeCorrect: false },

    setSteerAngleDeg: () => {},
    adjustSteering: () => {},
    setSimSpeedMultiplier: () => {},
    setFrameOfReference: () => {},
    setCameraMode: () => {},
    setShowVectors: () => {},
    toggleSound: () => {},
    startSimulation: () => {},
    pauseSimulation: () => {},
    resetRound: () => {},
    nextRound: () => {},
    setInputAngle: () => {},
    setInputEffectiveSpeed: () => {},
    setInputCrossingTime: () => {},
    submitAnswers: () => {},
    updateLivePosition: () => {},
  },
  (set, get) => {
    const recalcPhysics = (angleDeg: number, roundNum: number) => {
      const cfg = LAST_GAP_ROUNDS[roundNum - 1] || LAST_GAP_ROUNDS[0];
      const rad = (angleDeg * Math.PI) / 180;
      const vxG = cfg.boatSpeed * Math.cos(rad);
      const vyWater = -cfg.boatSpeed * Math.sin(rad); // pointing South
      const vyG = vyWater + cfg.riverSpeed;
      const vRes = Math.sqrt(vxG * vxG + vyG * vyG);
      const timeCross = cfg.riverWidth / Math.max(0.1, vxG);
      const predDrift = vyG * timeCross;

      return { vxG, vyG, vRes, timeCross, predDrift };
    };

    return {
      setSteerAngleDeg: (angle: number) => {
        const s = get();
        const clampedAngle = Math.max(-30, Math.min(75, angle));
        const { vxG, vyG, vRes, timeCross, predDrift } = recalcPhysics(clampedAngle, s.currentRound);
        set({
          steerAngleDeg: clampedAngle,
          vxGround: vxG,
          vyGround: vyG,
          vGroundResultant: vRes,
          effectiveCrossingTime: timeCross,
          finalPredictedDrift: predDrift,
        });
      },

      adjustSteering: (deltaAngle: number) => {
        const s = get();
        const newAngle = Math.max(-30, Math.min(75, s.steerAngleDeg + deltaAngle));
        const { vxG, vyG, vRes, timeCross, predDrift } = recalcPhysics(newAngle, s.currentRound);
        set({
          steerAngleDeg: newAngle,
          vxGround: vxG,
          vyGround: vyG,
          vGroundResultant: vRes,
          effectiveCrossingTime: timeCross,
          finalPredictedDrift: predDrift,
        });
      },

      setSimSpeedMultiplier: (mult: number) => set({ simSpeedMultiplier: mult }),
      setFrameOfReference: (frame: ReferenceFrame) => set({ frameOfReference: frame }),
      setCameraMode: (mode: CameraMode) => set({ cameraMode: mode }),
      setShowVectors: (show: boolean) => set({ showVectors: show }),
      toggleSound: () => set({ isSoundEnabled: !get().isSoundEnabled }),

      setInputAngle: (val: string) => set({ inputAngle: val }),
      setInputEffectiveSpeed: (val: string) => set({ inputEffectiveSpeed: val }),
      setInputCrossingTime: (val: string) => set({ inputCrossingTime: val }),

      submitAnswers: () => {
        const s = get();
        const userAngle = parseFloat(s.inputAngle);
        const userSpeed = parseFloat(s.inputEffectiveSpeed);
        const userTime = parseFloat(s.inputCrossingTime);

        const idealSin = s.riverSpeed / s.boatSpeed;
        const idealAngle = (Math.asin(Math.min(1, idealSin)) * 180) / Math.PI;
        const idealVx = Math.sqrt(s.boatSpeed * s.boatSpeed - s.riverSpeed * s.riverSpeed);
        const idealT = s.riverWidth / idealVx;

        const angleCorrect = !isNaN(userAngle) && Math.abs(userAngle - idealAngle) <= 1.0;
        const speedCorrect = !isNaN(userSpeed) && Math.abs(userSpeed - idealVx) <= 0.2;
        const timeCorrect = !isNaN(userTime) && Math.abs(userTime - idealT) <= 2.0;

        let stars = 0;
        if (angleCorrect) stars++;
        if (speedCorrect) stars++;
        if (timeCorrect) stars++;

        const xpEarned = stars * 150;
        set({
          isAnswersSubmitted: true,
          scoreBreakdown: { angleCorrect, speedCorrect, timeCorrect },
          starsEarned: Math.max(s.starsEarned, stars),
          totalScore: s.totalScore + xpEarned,
        });
      },

      startSimulation: () => {
        set({ isRunning: true });
      },

      pauseSimulation: () => {
        set({ isRunning: false });
      },

      resetRound: () => {
        const s = get();
        const cfg = LAST_GAP_ROUNDS[s.currentRound - 1] || LAST_GAP_ROUNDS[0];
        const { vxG, vyG, vRes, timeCross, predDrift } = recalcPhysics(s.steerAngleDeg, s.currentRound);

        set({
          boatPosX: 0,
          boatPosY: 0,
          elapsedSimTime: 0,
          isRunning: false,
          isCompleted: false,
          isTargetHit: false,
          riverWidth: cfg.riverWidth,
          riverSpeed: cfg.riverSpeed,
          boatSpeed: cfg.boatSpeed,
          targetY: cfg.targetY,
          targetTolerance: cfg.targetTolerance,
          vxGround: vxG,
          vyGround: vyG,
          vGroundResultant: vRes,
          effectiveCrossingTime: timeCross,
          finalPredictedDrift: predDrift,
          isAnswersSubmitted: false,
        });
      },

      nextRound: () => {
        const s = get();
        const nextR = (s.currentRound % LAST_GAP_ROUNDS.length) + 1;
        const cfg = LAST_GAP_ROUNDS[nextR - 1];
        const defaultAngle = 36.87;
        const { vxG, vyG, vRes, timeCross, predDrift } = recalcPhysics(defaultAngle, nextR);

        set({
          currentRound: nextR,
          steerAngleDeg: defaultAngle,
          boatPosX: 0,
          boatPosY: 0,
          elapsedSimTime: 0,
          isRunning: false,
          isCompleted: false,
          isTargetHit: false,
          riverWidth: cfg.riverWidth,
          riverSpeed: cfg.riverSpeed,
          boatSpeed: cfg.boatSpeed,
          targetY: cfg.targetY,
          targetTolerance: cfg.targetTolerance,
          vxGround: vxG,
          vyGround: vyG,
          vGroundResultant: vRes,
          effectiveCrossingTime: timeCross,
          finalPredictedDrift: predDrift,
          inputAngle: "",
          inputEffectiveSpeed: "",
          inputCrossingTime: "",
          isAnswersSubmitted: false,
        });
      },

      updateLivePosition: (posX: number, posY: number, simDt: number) => {
        const s = get();
        if (!s.isRunning || s.isCompleted) return;

        const newElapsed = s.elapsedSimTime + simDt;
        if (posX >= s.riverWidth) {
          const missDist = Math.abs(posY - s.targetY);
          const hit = missDist <= s.targetTolerance;
          const earnedStars = hit ? (missDist < 6 ? 3 : 2) : 1;

          set({
            boatPosX: s.riverWidth,
            boatPosY: posY,
            elapsedSimTime: newElapsed,
            isRunning: false,
            isCompleted: true,
            isTargetHit: hit,
            starsEarned: Math.max(s.starsEarned, earnedStars),
            totalScore: s.totalScore + (hit ? 300 : 50),
          });
        } else {
          set({
            boatPosX: posX,
            boatPosY: posY,
            elapsedSimTime: newElapsed,
          });
        }
      },
    };
  }
);

export const {
  ChallengeProvider: LastGapProvider,
  useChallengeStore: useLastGapStore,
  StoreContext: LastGapContext,
} = createChallengeContext<LastGapExtra>();
