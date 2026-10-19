"use client";

import { create } from "zustand";
import { challengeAudio } from "@/lib/audio/challengeAudio";

export type SimulationStatus = "idle" | "pulling" | "settling" | "falling" | "success" | "fail";

export interface TableclothStage {
  round: number;
  title: string;
  subtitle: string;
  mass: number;            // kg
  muStatic: number;        // static friction coeff
  muKinetic: number;       // kinetic friction coeff
  clothSlipLength: number; // distance under dishes (m)
  driftTolerance: number;  // max drift for 3 stars (m)
  safeDriftMax: number;    // max drift for 2 stars (m)
  tableDecel: number;      // table stopping deceleration (m/s²)
}

export const TABLECLOTH_STAGES: TableclothStage[] = [
  {
    round: 1,
    title: "Round 1: Royal Tea Setting",
    subtitle: "Standard Banquet Setup · Porcelain Plate and Warm Soup",
    mass: 1.2,
    muStatic: 0.42,
    muKinetic: 0.28,
    clothSlipLength: 0.08,
    driftTolerance: 0.040,
    safeDriftMax: 0.080,
    tableDecel: 6.86,
  },
  {
    round: 2,
    title: "Round 2: Silver Feast Setting",
    subtitle: "Heavier Silverware and Goblet · Higher Static Grip",
    mass: 1.8,
    muStatic: 0.48,
    muKinetic: 0.32,
    clothSlipLength: 0.09,
    driftTolerance: 0.035,
    safeDriftMax: 0.070,
    tableDecel: 6.86,
  },
  {
    round: 3,
    title: "Round 3: Grand Imperial Banquet",
    subtitle: "Full Tableware Set · Maximum Sensitivity and Precision",
    mass: 2.4,
    muStatic: 0.54,
    muKinetic: 0.36,
    clothSlipLength: 0.10,
    driftTolerance: 0.030,
    safeDriftMax: 0.060,
    tableDecel: 6.86,
  },
];

export interface TableclothState {
  currentRound: number;
  stageConfig: TableclothStage;

  status: SimulationStatus;
  crashReason: string | null;
  showResultModal: boolean;

  g: number;
  tableEdgeX: number;
  clothClearX: number;

  pullAcceleration: number;

  clothPos: number;
  clothVelocity: number;
  dishPos: number;
  dishVelocity: number;
  dishDisplacement: number;
  maxDishDisplacement: number;

  soupSloshAngle: number;
  wineSloshAngle: number;
  isSoupSpilled: boolean;
  isWineSpilled: boolean;
  liquidStabilityPct: number;

  dishY: number;
  dishRotZ: number;
  gobletAngle: number;
  gobletTipped: boolean;
  fallTimer: number;
  settleTimer: number;

  stars: number;
  score: number;
  isMissionStarted: boolean;
  resetCount: number;

  setPullAcceleration: (a: number) => void;
  startMission: () => void;
  executePull: () => void;
  resetSimulation: () => void;
  nextRound: () => void;
  updatePhysics: (delta: number) => void;
}

export const useTableclothStore = create<TableclothState>((set, get) => ({
  currentRound: 1,
  stageConfig: TABLECLOTH_STAGES[0],

  status: "idle",
  crashReason: null,
  showResultModal: false,

  g: 9.81,
  tableEdgeX: 2.5,
  clothClearX: 3.4,

  pullAcceleration: 1.2,

  clothPos: 0,
  clothVelocity: 0,
  dishPos: 0,
  dishVelocity: 0,
  dishDisplacement: 0,
  maxDishDisplacement: 0,

  soupSloshAngle: 0,
  wineSloshAngle: 0,
  isSoupSpilled: false,
  isWineSpilled: false,
  liquidStabilityPct: 100,

  dishY: 0.015,
  dishRotZ: 0,
  gobletAngle: 0,
  gobletTipped: false,
  fallTimer: 0,
  settleTimer: 0,

  stars: 0,
  score: 0,
  isMissionStarted: false,
  resetCount: 0,

  setPullAcceleration: (a) => {
    const clamped = Math.max(1.0, Math.min(18.0, Math.round(a * 10) / 10));
    set({ pullAcceleration: clamped });
  },

  startMission: () => {
    try { challengeAudio.playClick(); } catch {}
    set({
      isMissionStarted: true,
      currentRound: 1,
      stageConfig: TABLECLOTH_STAGES[0],
      pullAcceleration: 1.2,
    });
    get().resetSimulation();
  },

  executePull: () => {
    const { status } = get();
    if (status !== "idle") return;

    try { challengeAudio.playClick(); } catch {}
    set({
      status: "pulling",
      crashReason: null,
      showResultModal: false,
      clothPos: 0,
      clothVelocity: 0,
      dishPos: 0,
      dishVelocity: 0,
      dishDisplacement: 0,
      maxDishDisplacement: 0,
      soupSloshAngle: 0,
      wineSloshAngle: 0,
      isSoupSpilled: false,
      isWineSpilled: false,
      liquidStabilityPct: 100,
      dishY: 0.015,
      dishRotZ: 0,
      gobletAngle: 0,
      gobletTipped: false,
      fallTimer: 0,
      settleTimer: 0,
    });
  },

  resetSimulation: () => {
    try { challengeAudio.playClick(); } catch {}
    set({
      status: "idle",
      crashReason: null,
      showResultModal: false,
      clothPos: 0,
      clothVelocity: 0,
      dishPos: 0,
      dishVelocity: 0,
      dishDisplacement: 0,
      maxDishDisplacement: 0,
      soupSloshAngle: 0,
      wineSloshAngle: 0,
      isSoupSpilled: false,
      isWineSpilled: false,
      liquidStabilityPct: 100,
      dishY: 0.015,
      dishRotZ: 0,
      gobletAngle: 0,
      gobletTipped: false,
      fallTimer: 0,
      settleTimer: 0,
      stars: 0,
      score: 0,
      resetCount: get().resetCount + 1,
    });
  },

  nextRound: () => {
    try { challengeAudio.playClick(); } catch {}
    const nextR = Math.min(get().currentRound + 1, 3);
    const stage = TABLECLOTH_STAGES[nextR - 1];
    set({
      currentRound: nextR,
      stageConfig: stage,
      pullAcceleration: 1.2,
      status: "idle",
      crashReason: null,
      showResultModal: false,
      clothPos: 0,
      clothVelocity: 0,
      dishPos: 0,
      dishVelocity: 0,
      dishDisplacement: 0,
      maxDishDisplacement: 0,
      soupSloshAngle: 0,
      wineSloshAngle: 0,
      isSoupSpilled: false,
      isWineSpilled: false,
      liquidStabilityPct: 100,
      dishY: 0.015,
      dishRotZ: 0,
      gobletAngle: 0,
      gobletTipped: false,
      fallTimer: 0,
      settleTimer: 0,
      resetCount: get().resetCount + 1,
    });
  },

  updatePhysics: (delta) => {
    const state = get();
    const dt = Math.min(delta, 0.04);

    // 1. Handling dishes falling off the table (Static Lock Fail)
    if (state.status === "falling") {
      let { dishY, dishRotZ, dishPos, fallTimer } = state;
      fallTimer += dt;
      dishPos += dt * 1.8;
      dishY -= dt * 4.5;
      dishRotZ -= dt * 5.2;

      if (dishY <= -1.75) {
        dishY = -1.75;
        try { challengeAudio.playCrashImpact(); } catch {}
        set({
          dishY,
          dishRotZ,
          dishPos,
          fallTimer,
          status: "fail",
          showResultModal: true,
          stars: 0,
          score: 150,
          isSoupSpilled: true,
          isWineSpilled: true,
          liquidStabilityPct: 0,
        });
        return;
      }

      set({ dishY, dishRotZ, dishPos, fallTimer, isSoupSpilled: true, isWineSpilled: true });
      return;
    }

    // 2. Handling the post-pull Settling Phase
    if (state.status === "settling") {
      let { settleTimer, soupSloshAngle, wineSloshAngle, clothPos, clothVelocity } = state;
      settleTimer += dt;

      clothPos += clothVelocity * dt;
      soupSloshAngle = Math.max(0, soupSloshAngle * Math.exp(-dt * 4));
      wineSloshAngle = Math.max(0, wineSloshAngle * Math.exp(-dt * 4));

      if (settleTimer >= 1.0) {
        const finalDisp = state.maxDishDisplacement;
        const { driftTolerance, safeDriftMax } = state.stageConfig;

        if (finalDisp <= driftTolerance) {
          try { challengeAudio.playSuccessFanfare(); } catch {}
          set({
            status: "success",
            showResultModal: true,
            stars: 3,
            score: 1000,
            soupSloshAngle: 0,
            wineSloshAngle: 0,
            isSoupSpilled: false,
            isWineSpilled: false,
            liquidStabilityPct: 98,
            gobletTipped: false,
          });
        } else if (finalDisp <= safeDriftMax) {
          try { challengeAudio.playSuccessFanfare(); } catch {}
          set({
            status: "success",
            showResultModal: true,
            stars: 2,
            score: 750,
            soupSloshAngle: 0,
            wineSloshAngle: 0,
            isSoupSpilled: false,
            isWineSpilled: false,
            liquidStabilityPct: 82,
            gobletTipped: false,
          });
        } else {
          try { challengeAudio.playCrashImpact(); } catch {}
          set({
            status: "fail",
            showResultModal: true,
            stars: 1,
            score: 350,
            soupSloshAngle: 0.35,
            wineSloshAngle: 0.45,
            isSoupSpilled: true,
            isWineSpilled: true,
            liquidStabilityPct: 15,
            gobletTipped: true,
            crashReason: "LIQUID SPILLED! The snap was too sluggish, allowing fluids to slosh over the rims. Give enough acceleration so the cloth clears before liquids spill!",
          });
        }
        return;
      }

      set({ settleTimer, soupSloshAngle, wineSloshAngle, clothPos });
      return;
    }

    if (state.status !== "pulling") return;

    const {
      pullAcceleration,
      g,
      tableEdgeX,
      clothClearX,
      stageConfig,
    } = state;

    const { muStatic, muKinetic, clothSlipLength, tableDecel } = stageConfig;
    const aCrit = muStatic * g;
    let { clothPos, clothVelocity, dishPos, dishVelocity } = state;

    clothVelocity += pullAcceleration * dt;
    clothPos += clothVelocity * dt;

    // CASE A: STATIC LOCK
    if (pullAcceleration <= aCrit) {
      dishVelocity = clothVelocity;
      dishPos = clothPos;
      const currentDisp = Math.abs(dishPos);
      const slosh = Math.min(0.45, pullAcceleration * 0.08);

      if (dishPos >= tableEdgeX) {
        try { challengeAudio.playCrashImpact(); } catch {}
        set({
          status: "falling",
          dishPos: tableEdgeX,
          clothPos,
          dishVelocity,
          clothVelocity,
          dishDisplacement: currentDisp,
          maxDishDisplacement: currentDisp,
          soupSloshAngle: slosh,
          wineSloshAngle: slosh,
          isSoupSpilled: true,
          isWineSpilled: true,
          liquidStabilityPct: 0,
          crashReason: "STATIC LOCK and TOTAL SPILL! The snap was too slow to break static friction. The dinner set dragged across the table, crashing off the edge and spilling all liquid!",
        });
        return;
      }

      set({
        clothPos,
        clothVelocity,
        dishPos,
        dishVelocity,
        dishDisplacement: currentDisp,
        maxDishDisplacement: Math.max(state.maxDishDisplacement, currentDisp),
        soupSloshAngle: slosh,
        wineSloshAngle: slosh,
        liquidStabilityPct: Math.max(0, Math.round(100 - (dishPos / tableEdgeX) * 100)),
      });
      return;
    }

    // CASE B: BREAKAWAY
    if (clothPos < clothSlipLength) {
      const aDish = muKinetic * g;
      dishVelocity += aDish * dt;
      dishPos += dishVelocity * dt;
    } else {
      dishVelocity = Math.max(0, dishVelocity - tableDecel * dt);
      dishPos += dishVelocity * dt;
    }

    const currentDisp = Math.abs(dishPos);

    const aRel = pullAcceleration - muKinetic * g;
    const tTransit = Math.sqrt((2 * clothSlipLength) / aRel);
    const peakSlosh = Math.min(0.55, 0.35 * (tTransit / 0.20));
    const sloshCurrent = clothPos < clothSlipLength
      ? Math.sin((clothPos / clothSlipLength) * Math.PI) * peakSlosh
      : Math.max(0, peakSlosh * Math.exp(-(clothPos - clothSlipLength) * 8));

    const stabPct = Math.max(0, Math.min(100, Math.round(100 - (peakSlosh / 0.22) * 70)));

    if (clothPos >= clothClearX && (dishVelocity <= 0.001 || clothPos < clothSlipLength)) {
      dishVelocity = 0;
      set({
        status: "settling",
        settleTimer: 0,
        clothPos,
        clothVelocity,
        dishPos,
        dishVelocity: 0,
        dishDisplacement: currentDisp,
        maxDishDisplacement: Math.max(state.maxDishDisplacement, currentDisp),
        soupSloshAngle: sloshCurrent,
        wineSloshAngle: sloshCurrent * 1.15,
        liquidStabilityPct: stabPct,
      });
      return;
    }

    set({
      clothPos,
      clothVelocity,
      dishPos,
      dishVelocity,
      dishDisplacement: currentDisp,
      maxDishDisplacement: Math.max(state.maxDishDisplacement, currentDisp),
      soupSloshAngle: sloshCurrent,
      wineSloshAngle: sloshCurrent * 1.15,
      liquidStabilityPct: stabPct,
    });
  },
}));
