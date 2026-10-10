"use client";

import { createChallengeStore, createChallengeContext } from "@/stores/factory";

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
  isBrakingActive: boolean;
  failedAttempts: number;
  cameraMode: CameraMode;
  isSoundEnabled: boolean;
  totalScore: number;
  streak: number;
  vtPoints: VtDataPoint[];
  isMissionStarted: boolean;
  missionStartedAt: number | null;
  startMission: () => void;
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
  applyBrakes: () => void;
  setIsBrakingActive: (active: boolean) => void;
  nextRound: () => void;
  recordStop: (finalX: number, hit: boolean) => void;
}

const SURFACES: SurfaceType[] = ["dry", "wet", "ice"];

export const createEmergencyStopStore = createChallengeStore<EmergencyStopExtra>(
  {
    currentRound: 1,
    roadSurface: "dry",
    initialSpeed: 10,
    brakeMarkerX: 25,
    brakeAppliedPosition: null,
    stoppedPosition: null,
    hitIntersection: false,
    isRunning: false,
    isBrakingActive: false,
    failedAttempts: 0,
    cameraMode: "chase",
    isSoundEnabled: true,
    totalScore: 0,
    streak: 0,
    vtPoints: [],
    isMissionStarted: false,
    missionStartedAt: null,
    startMission: () => {},
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
    applyBrakes: () => {},
    setIsBrakingActive: () => {},
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

      startMission: () => {
        set({
          isMissionStarted: true,
          missionStartedAt: performance.now(),
        });
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
          set({ initialSpeed: 10, brakeMarkerX: 51.5 });
        } else if (surface === "wet") {
          set({ initialSpeed: 10, brakeMarkerX: 45.0 });
        } else if (surface === "ice") {
          set({ initialSpeed: 10, brakeMarkerX: 7.0 });
        }
      },

      startSimulation: () => {
        set({
          isRunning: true,
          status: "running",
          isBrakingActive: false,
          brakeAppliedPosition: null,
          stoppedPosition: null,
          hitIntersection: false,
          vtPoints: [],
        });
      },

      applyBrakes: () => {
        if (get().isRunning && !get().isBrakingActive) {
          const liveX = get().getLiveCarPos();
          set({
            isBrakingActive: true,
            brakeAppliedPosition: liveX,
          });
        }
      },

      setIsBrakingActive: (active: boolean) => {
        set({ isBrakingActive: active });
      },

      recordStop: (finalX: number, hit: boolean) => {
        const currentRound = get().currentRound;
        // To win, the vehicle must stop inside the designated safe target line (55.0m to 59.8m) without hitting the barrier!
        const stoppedInTargetZone = !hit && finalX >= 55.0 && finalX <= 59.8;
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
          isBrakingActive: false,
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
          const defaultMarker = nextSurface === "wet" ? 25 : nextSurface === "ice" ? 7 : 45;
          const defaultSpeed = 10;

          set({
            currentRound: nextR,
            roadSurface: nextSurface,
            brakeMarkerX: defaultMarker,
            initialSpeed: defaultSpeed,
            brakeAppliedPosition: null,
            stoppedPosition: null,
            hitIntersection: false,
            isRunning: false,
            isBrakingActive: false,
            failedAttempts: 0,
            vtPoints: [],
            status: "idle",
          });
        }
      },

      reset: () => {
        const surface = get().roadSurface;
        const defaultMarker = surface === "wet" ? 25 : surface === "ice" ? 7 : 45;
        const defaultSpeed = 10;

        set({
          brakeMarkerX: defaultMarker,
          initialSpeed: defaultSpeed,
          brakeAppliedPosition: null,
          stoppedPosition: null,
          hitIntersection: false,
          isRunning: false,
          isBrakingActive: false,
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
