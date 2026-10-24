"use client";

import { create } from "zustand";

export type CollisionStatus =
  | "idle"
  | "approaching"
  | "impact"
  | "separating"
  | "docking"
  | "success"
  | "fail_short"
  | "fail_overshoot";

export interface CollisionStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  controlType: "restitution";
  controlLabel: string;
  controlUnit: string;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  defaultSlider: number;
  exactTargetValue: number;
  tolerance: number;

  // Physical Parameters
  m1: number;             // kg mass of Cart 1
  u1: number;             // m/s initial speed of Cart 1
  m2: number;             // kg mass of Cart 2
  u2: number;             // m/s initial speed of Cart 2 (0 m/s)
  restitution: number;    // coefficient of restitution e (tuned via slider)
  
  // Track Geometry
  collisionX: number;     // contact point along track (m)
  dockingTargetX: number; // target position or distance for Cart 2 (m)
  dockingTolerance: number; // allowable stopping margin (m)
  hasFrictionBay: boolean;// true for Stage 3 stopping challenge
  frictionMu: number;     // kinetic friction coefficient
  targetV2: number;       // post-collision speed expected for Cart 2 (m/s)
  speedTolerance: number; // allowable velocity margin (m/s)
  explanationTrap: string;
}

export const COLLISION_STAGES: CollisionStageConfig[] = [
  {
    stage: 1,
    title: "Linear Accelerator: Restitution Bumper Calibration",
    subtitle: "Launcher Cart: 30.0 kg @ 10.0 m/s • Target Cart: 20.0 kg at Rest",
    controlType: "restitution",
    controlLabel: "RESTITUTION COEFFICIENT (e)",
    controlUnit: "",
    sliderMin: 0.0,
    sliderMax: 1.0,
    sliderStep: 0.01,
    defaultSlider: 0.30,
    exactTargetValue: 0.80,
    tolerance: 0.04,

    m1: 30.0,
    u1: 10.0,
    m2: 20.0,
    u2: 0.0,
    restitution: 0.80,

    collisionX: 0.0,
    dockingTargetX: 18.0,
    dockingTolerance: 0.8,
    hasFrictionBay: false,
    frictionMu: 0.0,
    targetV2: 10.8,
    speedTolerance: 0.35,
    explanationTrap: "In a 1D collision: v₂ = [m₁(1 + e) / (m₁ + m₂)] u₁. For v₂ = 10.8 m/s with m₁ = 30kg, m₂ = 20kg, u₁ = 10 m/s: 10.8 = [30(1 + e) / 50](10) = 6.0(1 + e) ⟹ 1 + e = 1.80 ⟹ e = 0.80.",
  },
  {
    stage: 2,
    title: "Subterranean Mag-Lev: Inelastic Bumper Damping",
    subtitle: "Launcher Cart: 20.0 kg @ 12.0 m/s • Target Cart: 10.0 kg at Rest",
    controlType: "restitution",
    controlLabel: "RESTITUTION COEFFICIENT (e)",
    controlUnit: "",
    sliderMin: 0.0,
    sliderMax: 1.0,
    sliderStep: 0.01,
    defaultSlider: 0.30,
    exactTargetValue: 0.60,
    tolerance: 0.04,

    m1: 20.0,
    u1: 12.0,
    m2: 10.0,
    u2: 0.0,
    restitution: 0.60,

    collisionX: 0.0,
    dockingTargetX: 18.0,
    dockingTolerance: 0.8,
    hasFrictionBay: false,
    frictionMu: 0.0,
    targetV2: 12.8,
    speedTolerance: 0.35,
    explanationTrap: "In an inelastic collision: v₂ = [m₁(1 + e) / (m₁ + m₂)] u₁. For v₂ = 12.8 m/s: 12.8 = [20(1 + e) / 30](12) = 8.0(1 + e) ⟹ 1 + e = 1.60 ⟹ e = 0.60.",
  },
  {
    stage: 3,
    title: "Orbital Recovery Bay: Kinetic Braking Stop",
    subtitle: "Ramp Friction μ = 0.25 • Docking Distance D = 10.0 m",
    controlType: "restitution",
    controlLabel: "RESTITUTION COEFFICIENT (e)",
    controlUnit: "",
    sliderMin: 0.0,
    sliderMax: 1.0,
    sliderStep: 0.01,
    defaultSlider: 0.20,
    exactTargetValue: 0.40,
    tolerance: 0.04,

    m1: 20.0,
    u1: 10.0,
    m2: 20.0,
    u2: 0.0,
    restitution: 0.40,

    collisionX: 0.0,
    dockingTargetX: 10.0,
    dockingTolerance: 0.50,
    hasFrictionBay: true,
    frictionMu: 0.25,
    targetV2: 7.0, // sqrt(2 * 0.25 * 9.8 * 10.0) = sqrt(49.0) = 7.00 m/s exact!
    speedTolerance: 0.35,
    explanationTrap: "Two-step JEE problem: 1) Work-Energy theorem for stopping: v₂ = √(2 μ g D) = √(2 × 0.25 × 9.8 × 10.0) = 7.0 m/s. 2) Restitution formula: v₂ = [20(1 + e) / 40](10) = 5.0(1 + e) = 7.0 ⟹ 1 + e = 1.40 ⟹ e = 0.40.",
  },
];

// Physical half-length of each cart chassis (meters)
export const CART_HALF_LENGTH = 0.90;

interface QuantumRailState {
  currentStage: number;
  status: CollisionStatus;
  sliderValue: number;

  x1: number;
  v1: number;
  m1: number;

  x2: number;
  v2: number;
  m2: number;

  restitution: number;

  // Real-time Telemetry Ledger
  totalMomentum: number;
  totalKineticEnergy: number;
  kineticEnergyLost: number;
  vSeparation: number;
  vApproach: number;

  // Impact burst animation timer
  impactFlash: number;
  travelDistance2: number;

  stars: number;
  score: number;
  crashReason: string | null;
  showResultModal: boolean;

  // Actions
  setSliderValue: (val: number) => void;
  adjustSliderValue: (delta: number) => void;
  launchCollision: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  tickPhysics: (dt: number) => void;
}

export const useQuantumRailStore = create<QuantumRailState>((set, get) => {
  const initialStage = COLLISION_STAGES[0];

  const initValues = (stage: CollisionStageConfig, sliderVal: number) => {
    const activeE = sliderVal;
    const initialP = stage.m1 * stage.u1 + stage.m2 * stage.u2;
    const initialKE = 0.5 * stage.m1 * stage.u1 * stage.u1 + 0.5 * stage.m2 * stage.u2 * stage.u2;

    return {
      x1: -12.0 - CART_HALF_LENGTH,
      v1: 0.0,
      m1: stage.m1,

      x2: CART_HALF_LENGTH, // rear bumper sits exactly at x = 0.0m
      v2: 0.0,
      m2: stage.m2,

      restitution: activeE,
      totalMomentum: initialP,
      totalKineticEnergy: initialKE,
      kineticEnergyLost: 0.0,
      vSeparation: 0.0,
      vApproach: stage.u1 - stage.u2,
    };
  };

  const initialValues = initValues(initialStage, initialStage.defaultSlider);

  return {
    currentStage: 1,
    status: "idle",
    sliderValue: initialStage.defaultSlider,

    ...initialValues,

    impactFlash: 0.0,
    travelDistance2: 0.0,
    stars: 0,
    score: 0,
    crashReason: null,
    showResultModal: false,

    setSliderValue: (val: number) => {
      const state = get();
      if (state.status !== "idle") return;
      const stage = COLLISION_STAGES[state.currentStage - 1];
      const clamped = Math.max(stage.sliderMin, Math.min(stage.sliderMax, Number(val.toFixed(2))));
      const updated = initValues(stage, clamped);
      set({
        sliderValue: clamped,
        ...updated,
      });
    },

    adjustSliderValue: (delta: number) => {
      const state = get();
      if (state.status !== "idle") return;
      const stage = COLLISION_STAGES[state.currentStage - 1];
      const nextVal = Math.max(
        stage.sliderMin,
        Math.min(stage.sliderMax, Number((state.sliderValue + delta).toFixed(2)))
      );
      const updated = initValues(stage, nextVal);
      set({
        sliderValue: nextVal,
        ...updated,
      });
    },

    launchCollision: () => {
      const state = get();
      if (state.status !== "idle") return;

      const stage = COLLISION_STAGES[state.currentStage - 1];
      const activeE = state.sliderValue;

      set({
        status: "approaching",
        x1: -12.0 - CART_HALF_LENGTH,
        v1: stage.u1,
        m1: stage.m1,
        x2: CART_HALF_LENGTH,
        v2: stage.u2,
        m2: stage.m2,
        restitution: activeE,
        impactFlash: 0.0,
        travelDistance2: 0.0,
        crashReason: null,
        showResultModal: false,
      });
    },

    resetSimulation: () => {
      const state = get();
      const stage = COLLISION_STAGES[state.currentStage - 1];
      const resetVals = initValues(stage, state.sliderValue);
      set({
        status: "idle",
        ...resetVals,
        impactFlash: 0.0,
        travelDistance2: 0.0,
        crashReason: null,
        showResultModal: false,
      });
    },

    nextStage: () => {
      const state = get();
      const nextIdx = Math.min(COLLISION_STAGES.length - 1, state.currentStage);
      const nextStageConfig = COLLISION_STAGES[nextIdx];
      const resetVals = initValues(nextStageConfig, nextStageConfig.defaultSlider);
      set({
        currentStage: nextIdx + 1,
        status: "idle",
        sliderValue: nextStageConfig.defaultSlider,
        ...resetVals,
        impactFlash: 0.0,
        travelDistance2: 0.0,
        crashReason: null,
        showResultModal: false,
      });
    },

    tickPhysics: (dt: number) => {
      const state = get();
      if (
        state.status === "idle" ||
        state.status === "success" ||
        state.status === "fail_short" ||
        state.status === "fail_overshoot"
      ) {
        return;
      }

      // Clamp delta time to avoid large jumps if frame rate drops
      const safeDt = Math.min(0.05, Math.max(0.001, dt));

      const stage = COLLISION_STAGES[state.currentStage - 1];
      let x1 = state.x1;
      let v1 = state.v1;
      let x2 = state.x2;
      let v2 = state.v2;
      let status = state.status;
      let flash = state.impactFlash;
      let travelD = state.travelDistance2;

      if (flash > 0) {
        flash = Math.max(0, flash - safeDt * 2.5);
      }

      // Phase 1: Launcher approaches Target Cart at constant velocity u1
      if (status === "approaching") {
        x1 += v1 * safeDt;

        // Front bumper of Cart 1 touches rear bumper of Cart 2 (at x = 0.0)
        if (x1 + CART_HALF_LENGTH >= 0.0) {
          x1 = -CART_HALF_LENGTH;
          x2 = CART_HALF_LENGTH;
          status = "impact";
          flash = 1.0;

          // Compute EXACT 1D Collision Physics according to standard JEE mechanics
          const m1 = stage.m1;
          const m2 = stage.m2;
          const u1 = stage.u1;
          const e = state.sliderValue; // Strictly dynamically computed from selected restitution e!

          // Standard Restitution Formulas:
          // v1 = [(m1 - e*m2) / (m1 + m2)]*u1
          // v2 = [(m1*(1+e)) / (m1 + m2)]*u1
          const postV1 = ((m1 - e * m2) / (m1 + m2)) * u1;
          const postV2 = ((m1 * (1.0 + e)) / (m1 + m2)) * u1;

          v1 = postV1;
          v2 = postV2;

          const preKE = 0.5 * m1 * u1 * u1;
          const postKE = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
          const lostKE = Math.max(0, preKE - postKE);
          const pTotal = m1 * v1 + m2 * v2;

          set({
            status: "separating",
            x1,
            v1,
            m1,
            x2,
            v2,
            m2,
            restitution: e,
            totalMomentum: pTotal,
            totalKineticEnergy: postKE,
            kineticEnergyLost: lostKE,
            vSeparation: Math.abs(v2 - v1),
            impactFlash: 1.0,
          });
          return;
        }
      }

      // Phase 2: Post-Collision Separation & Motion
      if (status === "separating" || status === "docking") {
        // Cart 1 continues moving with constant velocity postV1
        x1 += v1 * safeDt;

        // Cart 2 motion:
        if (stage.hasFrictionBay) {
          // Decelerates under kinetic friction mu_k in Stage 3
          const aFriction = stage.frictionMu * 9.8; // m/s^2
          
          if (v2 > 0) {
            const timeToStop = v2 / aFriction;
            if (safeDt >= timeToStop) {
              // Cart 2 reaches complete rest within this sub-step
              const dx = (v2 * v2) / (2 * aFriction);
              x2 += dx;
              travelD += dx;
              v2 = 0;
            } else {
              // Continuous deceleration
              const dx = v2 * safeDt - 0.5 * aFriction * safeDt * safeDt;
              x2 += dx;
              travelD += dx;
              v2 -= aFriction * safeDt;
            }
          }

          if (v2 <= 0) {
            v2 = 0;
            // Cart 2 has stopped: Evaluate stopping distance D from collision point (x = 0)
            const actualDistance = x2 - CART_HALF_LENGTH;
            const targetDistance = stage.dockingTargetX;
            const error = Math.abs(actualDistance - targetDistance);

            if (error <= stage.dockingTolerance) {
              const starsEarned = error <= 0.15 ? 3 : error <= 0.35 ? 2 : 1;
              const scoreEarned = 1000 * starsEarned;
              set({
                status: "success",
                x1,
                v1,
                x2,
                v2: 0,
                travelDistance2: actualDistance,
                stars: starsEarned,
                score: scoreEarned,
                showResultModal: true,
              });
              return;
            } else if (actualDistance < targetDistance) {
              set({
                status: "fail_short",
                x1,
                v1,
                x2,
                v2: 0,
                travelDistance2: actualDistance,
                showResultModal: true,
                crashReason: `STOPPED SHORT! Cart 2 stopped at ${actualDistance.toFixed(2)}m (${(targetDistance - actualDistance).toFixed(2)}m before the docking bay at ${targetDistance.toFixed(1)}m). Restitution e = ${state.sliderValue.toFixed(2)} is too low (Target e = ${stage.exactTargetValue.toFixed(2)}).`,
              });
              return;
            } else {
              set({
                status: "fail_overshoot",
                x1,
                v1,
                x2,
                v2: 0,
                travelDistance2: actualDistance,
                showResultModal: true,
                crashReason: `OVERSHOT DOCK! Cart 2 stopped at ${actualDistance.toFixed(2)}m (${(actualDistance - targetDistance).toFixed(2)}m past the target docking bay at ${targetDistance.toFixed(1)}m). Restitution e = ${state.sliderValue.toFixed(2)} is too high (Target e = ${stage.exactTargetValue.toFixed(2)}).`,
              });
              return;
            }
          }
        } else {
          // Frictionless track velocity-gate evaluation (Stages 1 & 2)
          x2 += v2 * safeDt;
          travelD = x2 - CART_HALF_LENGTH;

          // Check when Cart 2 crosses the velocity capture sensor at dockingTargetX (18m)
          if (travelD >= stage.dockingTargetX) {
            const speedError = Math.abs(v2 - stage.targetV2);
            if (speedError <= stage.speedTolerance) {
              const starsEarned = speedError <= 0.10 ? 3 : speedError <= 0.25 ? 2 : 1;
              const scoreEarned = 1000 * starsEarned;
              set({
                status: "success",
                x1,
                v1,
                x2: stage.dockingTargetX + CART_HALF_LENGTH,
                v2,
                travelDistance2: stage.dockingTargetX,
                stars: starsEarned,
                score: scoreEarned,
                showResultModal: true,
              });
              return;
            } else if (v2 < stage.targetV2) {
              set({
                status: "fail_short",
                x1,
                v1,
                x2: stage.dockingTargetX + CART_HALF_LENGTH,
                v2,
                travelDistance2: stage.dockingTargetX,
                showResultModal: true,
                crashReason: `INSUFFICIENT VELOCITY! Cart 2 reached the sensor at ${v2.toFixed(2)} m/s (Target: ${stage.targetV2.toFixed(1)} m/s). Increase Restitution e toward ${stage.exactTargetValue.toFixed(2)}.`,
              });
              return;
            } else {
              set({
                status: "fail_overshoot",
                x1,
                v1,
                x2: stage.dockingTargetX + CART_HALF_LENGTH,
                v2,
                travelDistance2: stage.dockingTargetX,
                showResultModal: true,
                crashReason: `EXCESSIVE VELOCITY! Cart 2 reached the sensor at ${v2.toFixed(2)} m/s (Target: ${stage.targetV2.toFixed(1)} m/s). Decrease Restitution e toward ${stage.exactTargetValue.toFixed(2)}.`,
              });
              return;
            }
          }
        }
      }

      set({
        x1,
        v1,
        x2,
        v2,
        impactFlash: flash,
        travelDistance2: travelD,
      });
    },
  };
});
