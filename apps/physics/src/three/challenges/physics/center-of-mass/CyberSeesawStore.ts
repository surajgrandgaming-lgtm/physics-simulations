"use client";

import { create } from "zustand";
import { challengeAudio } from "@/lib/audio/challengeAudio";

export type SeesawStatus = "idle" | "testing" | "success" | "fail_left" | "fail_right";

export interface FixedMass {
  id: string;
  mass: number;     // kg
  position: number; // m relative to fulcrum at x=0
  color: string;
  label: string;
}

export interface TargetMass {
  mass: number;     // kg
  color: string;
  label: string;
}

export interface SeesawStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  beamLength: number;       // total length in m
  leftSpan: number;         // distance from fulcrum to left end (m)
  rightSpan: number;        // distance from fulcrum to right end (m)
  plankMass: number;        // kg (0 for negligible)
  plankCenterOffset: number;// m relative to fulcrum (where plank CM acts)
  fixedMasses: FixedMass[];
  targetMass: TargetMass;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  defaultSlider: number;
  exactTargetX: number;     // theoretical exact x position (m)
  targetTolerance: number;  // allowable deviation (m)
  explanationTrap?: string; // specific JEE trap explanation
}

export const SEESAW_STAGES: SeesawStageConfig[] = [
  {
    stage: 1,
    title: "Alpine Test Bench: Two-Mass Centroid",
    subtitle: "12kg Payload vs 6kg Counterweight • Symmetric Pivot",
    beamLength: 16.0,
    leftSpan: 8.0,
    rightSpan: 8.0,
    plankMass: 0.0,
    plankCenterOffset: 0.0,
    fixedMasses: [
      { id: "m1", mass: 12, position: -3.5, color: "#f59e0b", label: "m₁ = 12 kg" },
    ],
    targetMass: { mass: 6, color: "#06b6d4", label: "m₂ = 6 kg" },
    sliderMin: 1.0,
    sliderMax: 7.8,
    sliderStep: 0.1,
    defaultSlider: 3.5,
    exactTargetX: 7.0,
    targetTolerance: 0.1,
    explanationTrap: "Basic centroid balance: m₁ x₁ + m₂ x₂ = 0 ⇒ 12(-3.5) + 6 x₂ = 0 ⇒ x₂ = 7.0 m.",
  },
  {
    stage: 2,
    title: "Subterranean Foundry: Multi-Mass Composite",
    subtitle: "Two Fixed Payloads (10kg + 6kg) vs 7kg Counterweight",
    beamLength: 16.0,
    leftSpan: 8.0,
    rightSpan: 8.0,
    plankMass: 0.0,
    plankCenterOffset: 0.0,
    fixedMasses: [
      { id: "m1", mass: 10, position: -4.0, color: "#f59e0b", label: "m₁ = 10 kg" },
      { id: "m2", mass: 6, position: -1.5, color: "#ea580c", label: "m₂ = 6 kg" },
    ],
    targetMass: { mass: 7, color: "#06b6d4", label: "m₃ = 7 kg" },
    sliderMin: 2.0,
    sliderMax: 7.8,
    sliderStep: 0.1,
    defaultSlider: 4.5,
    exactTargetX: 7.0,
    targetTolerance: 0.1,
    explanationTrap: "Composite moment sum: 10(-4.0) + 6(-1.5) + 7 x₃ = 0 ⇒ -40 - 9 + 7 x₃ = 0 ⇒ 7 x₃ = 49 ⇒ x₃ = 7.0 m.",
  },
  {
    stage: 3,
    title: "Orbital Gantry: Asymmetric Heavy Beam (JEE Trap)",
    subtitle: "20kg Beam Self-Weight • Fulcrum Shifted • 10kg vs 10kg",
    beamLength: 14.0,
    leftSpan: 7.5,
    rightSpan: 6.5,
    plankMass: 20.0,
    plankCenterOffset: -0.5, // Geometric center is at (-7.5 + 6.5)/2 = -0.5m
    fixedMasses: [
      { id: "m1", mass: 10, position: -4.5, color: "#f59e0b", label: "m₁ = 10 kg" },
    ],
    targetMass: { mass: 10, color: "#06b6d4", label: "m₂ = 10 kg" },
    sliderMin: 2.0,
    sliderMax: 6.2,
    sliderStep: 0.1,
    defaultSlider: 3.5,
    exactTargetX: 5.5,
    targetTolerance: 0.1,
    explanationTrap: "The Fatal JEE Trap: Neglecting the plank's own 20kg mass acting at its centroid x = -0.5m gives a false 4.5m! Including the beam: 10(-4.5) + 20(-0.5) + 10 x₂ = 0 ⇒ -45 - 10 + 10 x₂ = 0 ⇒ x₂ = 5.5 m.",
  },
];

interface CyberSeesawState {
  currentStage: number;
  status: SeesawStatus;
  sliderPosition: number; // x position of target mass (m)
  
  // Real-time kinematic & dynamic state
  beamAngle: number;       // radians (0 = horizontal, >0 = right down, <0 = left down)
  angularVelocity: number; // rad/s
  xCOM: number;            // system center of mass relative to fulcrum (m)
  totalMass: number;       // total kg
  
  // Support jacks animation (1 = fully raised and locking beam, 0 = retracted)
  jackExtension: number;
  testTimer: number;

  stars: number;
  score: number;
  crashReason: string | null;
  showResultModal: boolean;

  // Actions
  setSliderPosition: (x: number) => void;
  adjustSliderPosition: (delta: number) => void;
  testBalance: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  tickPhysics: (dt: number) => void;
}

export const useCyberSeesawStore = create<CyberSeesawState>((set, get) => {
  const initialStage = SEESAW_STAGES[0];

  // Helper to compute Center of Mass
  const computeCOM = (stage: SeesawStageConfig, targetX: number) => {
    let massTimesX = 0;
    let totalM = stage.plankMass;

    // Plank contribution
    if (stage.plankMass > 0) {
      massTimesX += stage.plankMass * stage.plankCenterOffset;
    }

    // Fixed masses contribution
    for (const fm of stage.fixedMasses) {
      massTimesX += fm.mass * fm.position;
      totalM += fm.mass;
    }

    // Target mass contribution
    massTimesX += stage.targetMass.mass * targetX;
    totalM += stage.targetMass.mass;

    const xcm = totalM > 0 ? massTimesX / totalM : 0;
    return { xCOM: xcm, totalMass: totalM };
  };

  const initialCOM = computeCOM(initialStage, initialStage.defaultSlider);

  return {
    currentStage: 1,
    status: "idle",
    sliderPosition: initialStage.defaultSlider,
    beamAngle: 0,
    angularVelocity: 0,
    xCOM: initialCOM.xCOM,
    totalMass: initialCOM.totalMass,
    jackExtension: 1.0,
    testTimer: 0,
    stars: 0,
    score: 0,
    crashReason: null,
    showResultModal: false,

    setSliderPosition: (x: number) => {
      const state = get();
      if (state.status === "testing") return;
      const stage = SEESAW_STAGES[state.currentStage - 1];
      const clamped = Math.max(stage.sliderMin, Math.min(stage.sliderMax, Number(x.toFixed(2))));
      const com = computeCOM(stage, clamped);
      set({
        sliderPosition: clamped,
        xCOM: com.xCOM,
        totalMass: com.totalMass,
      });
    },

    adjustSliderPosition: (delta: number) => {
      const state = get();
      if (state.status === "testing") return;
      const stage = SEESAW_STAGES[state.currentStage - 1];
      const nextX = Math.max(
        stage.sliderMin,
        Math.min(stage.sliderMax, Number((state.sliderPosition + delta).toFixed(2)))
      );
      const com = computeCOM(stage, nextX);
      set({
        sliderPosition: nextX,
        xCOM: com.xCOM,
        totalMass: com.totalMass,
      });
      challengeAudio.playClick();
    },

    testBalance: () => {
      const state = get();
      if (state.status !== "idle") return;

      challengeAudio.playLaunch();
      set({
        status: "testing",
        beamAngle: 0,
        angularVelocity: 0,
        testTimer: 0,
        crashReason: null,
        showResultModal: false,
      });
    },

    resetSimulation: () => {
      const state = get();
      const stage = SEESAW_STAGES[state.currentStage - 1];
      const com = computeCOM(stage, state.sliderPosition);
      set({
        status: "idle",
        beamAngle: 0,
        angularVelocity: 0,
        jackExtension: 1.0,
        testTimer: 0,
        xCOM: com.xCOM,
        totalMass: com.totalMass,
        crashReason: null,
        showResultModal: false,
      });
      challengeAudio.playClick();
    },

    nextStage: () => {
      const state = get();
      const nextIdx = Math.min(SEESAW_STAGES.length - 1, state.currentStage);
      const nextStageConfig = SEESAW_STAGES[nextIdx];
      const com = computeCOM(nextStageConfig, nextStageConfig.defaultSlider);
      set({
        currentStage: nextIdx + 1,
        status: "idle",
        sliderPosition: nextStageConfig.defaultSlider,
        beamAngle: 0,
        angularVelocity: 0,
        jackExtension: 1.0,
        testTimer: 0,
        xCOM: com.xCOM,
        totalMass: com.totalMass,
        crashReason: null,
        showResultModal: false,
      });
      challengeAudio.playSuccessFanfare();
    },

    tickPhysics: (dt: number) => {
      const state = get();
      if (state.status === "idle") {
        if (state.jackExtension < 1.0) {
          set({ jackExtension: Math.min(1.0, state.jackExtension + dt * 3.0) });
        }
        return;
      }

      // Smoothly retract hydraulic jacks when testing starts
      let jack = state.jackExtension;
      if (state.status === "testing" && jack > 0) {
        jack = Math.max(0, jack - dt * 2.5);
      }

      const stage = SEESAW_STAGES[state.currentStage - 1];
      const maxTilt = 0.24; // ~14 degrees max mechanical stop
      const isBalanced = Math.abs(state.xCOM) <= stage.targetTolerance;

      // Rotational Dynamics integration
      let angle = state.beamAngle;
      let omega = state.angularVelocity;
      const g = 9.8;

      // Net torque: Gravity pulls down towards the side with positive xCOM
      // Positive torque = right tilts down (angle increases)
      const tauGravity = state.totalMass * g * state.xCOM * Math.cos(angle);
      
      // Self-centering cradle restoring torque (pivot axis is 0.22m above beam center)
      const cradleStiffness = state.totalMass * g * 0.22;
      const tauCradle = -cradleStiffness * Math.sin(angle);

      // Rotational damping
      const damping = 3.8 * state.totalMass;
      const tauDamping = -damping * omega;

      // Moment of inertia: I ≈ 1/12 M L² + sum(m_i r_i²)
      const I_beam = (1 / 12) * Math.max(8, stage.plankMass) * stage.beamLength * stage.beamLength;
      let I_masses = 0;
      for (const fm of stage.fixedMasses) {
        I_masses += fm.mass * fm.position * fm.position;
      }
      I_masses += stage.targetMass.mass * state.sliderPosition * state.sliderPosition;
      const I_total = Math.max(15, I_beam + I_masses);

      const alpha = (tauGravity + tauCradle + tauDamping) / I_total;

      // Symplectic Euler
      omega += alpha * dt;
      angle += omega * dt;

      // If balanced within tolerance, cradle settles beam horizontal
      const elapsed = state.testTimer + dt;

      if (isBalanced) {
        if (elapsed > 1.8 && Math.abs(angle) < 0.03 && Math.abs(omega) < 0.04) {
          // Perfectly balanced!
          challengeAudio.playSuccessFanfare();
          const dev = Math.abs(state.xCOM);
          const starsEarned = dev <= 0.03 ? 3 : dev <= 0.06 ? 2 : 1;
          const scoreEarned = 1000 * starsEarned - Math.round(elapsed * 20);
          set({
            status: "success",
            beamAngle: 0,
            angularVelocity: 0,
            jackExtension: jack,
            testTimer: elapsed,
            stars: starsEarned,
            score: Math.max(100, scoreEarned),
            showResultModal: true,
          });
          return;
        }
      } else {
        // Unbalanced: Beam tilts until hitting mechanical bumper stops
        if (angle <= -maxTilt) {
          challengeAudio.playCrashImpact();
          const dev = Math.abs(state.xCOM);
          set({
            status: "fail_left",
            beamAngle: -maxTilt,
            angularVelocity: 0,
            jackExtension: jack,
            testTimer: elapsed,
            showResultModal: true,
            crashReason: `LEFT SIDE HEAVY! System center of mass is ${dev.toFixed(2)}m to the left of the fulcrum. ${stage.stage === 3 ? "Did you forget the 20kg beam's own mass acting at its centroid x = -0.5m?" : "Increase x₂ to move the counterweight further right."}`,
          });
          return;
        } else if (angle >= maxTilt) {
          challengeAudio.playCrashImpact();
          const dev = Math.abs(state.xCOM);
          set({
            status: "fail_right",
            beamAngle: maxTilt,
            angularVelocity: 0,
            jackExtension: jack,
            testTimer: elapsed,
            showResultModal: true,
            crashReason: `RIGHT SIDE HEAVY! System center of mass is ${dev.toFixed(2)}m to the right of the fulcrum. Counterweight is positioned too far out (x = ${state.sliderPosition.toFixed(2)}m).`,
          });
          return;
        }
      }

      set({
        beamAngle: angle,
        angularVelocity: omega,
        jackExtension: jack,
        testTimer: elapsed,
      });
    },
  };
});
