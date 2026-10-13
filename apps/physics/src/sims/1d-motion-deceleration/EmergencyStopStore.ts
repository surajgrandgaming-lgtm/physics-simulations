"use client";

import { createChallengeStore, createChallengeContext } from "@topcoaching/sim-core";

export type SurfaceType = "dry" | "wet" | "ice";
export type CameraMode = "orbit" | "chase" | "side";

export interface VtDataPoint {
  t: number;
  v: number;
  x: number;
}

export interface EmergencyStopExtra extends Record<string, unknown> {
  currentRound: number;
  roadSurface: SurfaceType;
  initialSpeed: number;
  brakeMarkerX: number;
  brakeAppliedPosition: number | null;
  stoppedPosition: number | null;
  hitIntersection: boolean;
  isRunning: boolean;
  failedAttempts: number;
  cameraMode: CameraMode;
  isSoundEnabled: boolean;
  totalScore: number;
  streak: number;
  vtPoints: VtDataPoint[];
  resetCount: number;
  getLiveSpeed: () => number;
  getLiveCarPos: () => number;
  setLiveSpeedGetter: (fn: () => number) => void;
  setLiveCarPosGetter: (fn: () => number) => void;
  setBrakeMarkerX: (x: number) => void;
  setInitialSpeed: (speed: number) => void;
  setCameraMode: (mode: CameraMode) => void;
  toggleSound: () => void;
  addVtPoint: (point: VtDataPoint) => void;
  autoCalibrate: () => void;
  startSimulation: () => void;
  nextRound: () => void;
  recordStop: (finalX: number, hit: boolean) => void;
}

const SURFACES: SurfaceType[] = ["dry", "wet", "ice"];

export const createEmergencyStopStore = createChallengeStore<EmergencyStopExtra>(
  {
    currentRound: 1,
    roadSurface: "dry",
    initialSpeed: 15,
    brakeMarkerX: 45,
    brakeAppliedPosition: null,
    stoppedPosition: null,
    hitIntersection: false,
    isRunning: false,
    failedAttempts: 0,
    cameraMode: "orbit",
    isSoundEnabled: true,
    totalScore: 0,
    streak: 0,
    vtPoints: [],
    resetCount: 0,
    getLiveSpeed: () => 0,
    getLiveCarPos: () => 0,
    setLiveSpeedGetter: () => {},
    setLiveCarPosGetter: () => {},
    setBrakeMarkerX: () => {},
    setInitialSpeed: () => {},
    setCameraMode: () => {},
    toggleSound: () => {},
    addVtPoint: () => {},
    autoCalibrate: () => {},
    startSimulation: () => {},
    nextRound: () => {},
    recordStop: () => {},
  },
  (set, get) => {
    let speedGetter: () => number = () => 0;
    let posGetter: () => number = () => 0;

    return {
      getLiveSpeed: () => speedGetter(),
      getLiveCarPos: () => posGetter(),

      setLiveSpeedGetter: (fn: () => number) => {
        speedGetter = fn;
      },
      setLiveCarPosGetter: (fn: () => number) => {
        posGetter = fn;
      },

      setCameraMode: (mode: CameraMode) => {
        set({ cameraMode: mode });
      },

      toggleSound: () => {
        set({ isSoundEnabled: !get().isSoundEnabled });
      },

      addVtPoint: (point: VtDataPoint) => {
        set({ vtPoints: [...get().vtPoints, point] });
      },

      setBrakeMarkerX: (x: number) => {
        if (!get().isRunning && get().stoppedPosition === null) {
          set({ brakeMarkerX: Math.max(0, Math.min(58, x)) });
        }
      },

      setInitialSpeed: (speed: number) => {
        if (!get().isRunning && get().stoppedPosition === null) {
          set({ initialSpeed: Math.max(5, Math.min(25, speed)) });
        }
      },

      autoCalibrate: () => {
        const surface = get().roadSurface;
        if (surface === "dry") {
          set({ initialSpeed: 15, brakeMarkerX: 44.5 });
        } else if (surface === "wet") {
          set({ initialSpeed: 15, brakeMarkerX: 30.0 });
        } else if (surface === "ice") {
          set({ initialSpeed: 10, brakeMarkerX: 7.0 });
        }
      },

      startSimulation: () => {
        set({
          isRunning: true,
          status: "running",
          brakeAppliedPosition: null,
          stoppedPosition: null,
          hitIntersection: false,
          vtPoints: [],
        });
      },

      recordStop: (finalX: number, hit: boolean) => {
        const currentRound = get().currentRound;
        // To win, the vehicle must stop inside the designated safe target line (58.0m to 60.0m) without hitting the barrier!
        const stoppedInTargetZone = !hit && finalX >= 57.5 && finalX <= 60.0;
        const isSuccess = stoppedInTargetZone;

        let earnedStars = 0;
        let earnedPoints = 0;

        if (isSuccess) {
          earnedStars = 3;
          earnedPoints = 500;
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
          stoppedPosition: finalX,
          hitIntersection: hit,
          isRunning: false,
          status: isSuccess ? "success" : "fail",
        });

        if (isSuccess && currentRound === 3) {
          get().succeed(earnedStars);
        } else if (isSuccess) {
          set({ stars: earnedStars });
        } else {
          get().fail();
        }
      },

      nextRound: () => {
        const round = get().currentRound;
        if (round < 3) {
          const nextR = round + 1;
          const nextSurface = SURFACES[nextR - 1];
          const defaultMarker = nextSurface === "wet" ? 30 : nextSurface === "ice" ? 10 : 45;
          const defaultSpeed = nextSurface === "ice" ? 10 : 15;

          set({
            currentRound: nextR,
            roadSurface: nextSurface,
            brakeMarkerX: defaultMarker,
            initialSpeed: defaultSpeed,
            brakeAppliedPosition: null,
            stoppedPosition: null,
            hitIntersection: false,
            isRunning: false,
            failedAttempts: 0,
            vtPoints: [],
            status: "idle",
          });
        }
      },

      reset: () => {
        const surface = get().roadSurface;
        const defaultMarker = surface === "wet" ? 30 : surface === "ice" ? 10 : 45;
        const defaultSpeed = surface === "ice" ? 10 : 15;

        set({
          brakeMarkerX: defaultMarker,
          initialSpeed: defaultSpeed,
          brakeAppliedPosition: null,
          stoppedPosition: null,
          hitIntersection: false,
          isRunning: false,
          vtPoints: [],
          status: "idle",
          stars: 0,
          elapsedMs: 0,
        });
      },
    };
  }
);

export const {
  ChallengeProvider: EmergencyStopProvider,
  useChallengeStore: useEmergencyStopStore,
  StoreContext: EmergencyStopContext,
} = createChallengeContext<EmergencyStopExtra>();
