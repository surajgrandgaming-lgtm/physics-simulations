"use client";

import { create } from "zustand";

export type SimulationStatus =
  | "idle"
  | "launching"
  | "success"
  | "fail_low"
  | "fail_high";

export interface EscapeVelocityStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  missionObjective: string;
  controlLabel: string;
  paramUnit: string;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  stepSmall: number;
  stepLarge: number;
  defaultSlider: number;
  targetValue: number;
  tolerance: number;
  targetAltitudeKm?: number;
  residualExcessVelocityKms?: number;
  formulaHint: string;
  explanationTrap: string;
}

// ─── Real Physical Constants ───────────────────────────────────────────────────
export const G_M_EARTH   = 398600.4418;  // km³/s² (μ = GM_Earth)
export const R_EARTH_KM  = 6371.0;       // km (Earth mean radius)
export const V_ESCAPE_KM = 11.182;       // km/s (exact surface escape speed)
export const OMEGA_EARTH = 7.292115e-5;  // rad/s (sidereal spin rate)

// Visual scaling: Earth radius = 2.0 scene units
export const R_VIS_SCALE = 2.0 / R_EARTH_KM; // scene-units per km

// Standard gravity-turn launch pitch angle from horizontal surface
export const LAUNCH_PITCH_DEG = 55.0; // degrees

// ─── Stage Configurations ──────────────────────────────────────────────────────
export const ESCAPE_VELOCITY_STAGES: EscapeVelocityStageConfig[] = [
  {
    stage: 1,
    title: "STAGE 1: SUB-ORBITAL BALLISTIC APOGEE",
    subtitle: "Curved Ascent to Relay Altitude h = 6,371 km (r = 2 R_E)",
    missionObjective:
      "Calculate and dial the launch velocity v0 required for a research probe to follow a curved orbital ascent reaching the target relay station at peak apogee h = 6,371 km before curving back to Earth.",
    controlLabel: "LAUNCH VELOCITY (v0)",
    paramUnit: "km/s",
    sliderMin: 5.00,
    sliderMax: 10.50,
    sliderStep: 0.01,
    stepSmall: 0.01,
    stepLarge: 0.10,
    defaultSlider: 6.50,
    targetValue: 8.26,     // Exact for pitch 55°: v0 = 8.26 km/s -> apogee 6,371 km
    tolerance: 0.15,
    targetAltitudeKm: 6371.0,
    formulaHint: "v_0 = \\sqrt{\\frac{2 G M_E \\left(\\frac{1}{R_E} - \\frac{1}{R_E + h}\\right)}{1 - \\left(\\frac{R_E}{R_E + h}\\right)^2 \\cos^2\\gamma}}",
    explanationTrap:
      "Because the rocket launches with a curved gravity-turn trajectory (pitch 55°), part of its velocity is tangential (conserving angular momentum h = r·v_θ). At apogee, tangential speed is non-zero, requiring v0 = 8.26 km/s.",
  },
  {
    stage: 2,
    title: "STAGE 2: THE PARABOLIC ESCAPE THRESHOLD",
    subtitle: "Curved Parabolic Trajectory & Total Energy E = 0",
    missionObjective:
      "Calculate and set the exact escape velocity threshold v_e so the probe follows a curved parabolic trajectory, escaping Earth's gravitational well into deep space with zero residual speed at infinity.",
    controlLabel: "ESCAPE VELOCITY (v_e)",
    paramUnit: "km/s",
    sliderMin: 9.00,
    sliderMax: 13.50,
    sliderStep: 0.01,
    stepSmall: 0.01,
    stepLarge: 0.10,
    defaultSlider: 10.00,
    targetValue: 11.18,    // ve = √(2 G M_E / R_E) ≈ 11.18 km/s (independent of angle!)
    tolerance: 0.20,
    formulaHint: "v_e = \\sqrt{\\frac{2 G M_E}{R_E}} = \\sqrt{2} \\cdot v_{\\text{circ}}",
    explanationTrap:
      "Because energy is a scalar quantity (E = 0.5·v² - GM/r), the escape speed threshold is strictly independent of the launch direction! At 11.18 km/s, the rocket curves into an open parabolic arc that never closes.",
  },
  {
    stage: 3,
    title: "STAGE 3: HYPERBOLIC EXCESS INJECTION",
    subtitle: "Interplanetary Transfer Trajectory (v_∞ = 4.20 km/s)",
    missionObjective:
      "Calculate the required surface injection speed v0 so that the spacecraft follows a curved hyperbolic escape arc, exiting Earth's gravity well with a residual cruise speed of v_∞ = 4.20 km/s toward Mars.",
    controlLabel: "INJECTION VELOCITY (v0)",
    paramUnit: "km/s",
    sliderMin: 10.50,
    sliderMax: 14.00,
    sliderStep: 0.01,
    stepSmall: 0.01,
    stepLarge: 0.10,
    defaultSlider: 11.20,
    targetValue: 11.94,    // v0 = √(ve² + v∞²) = √(11.182² + 4.20²) ≈ 11.94 km/s
    tolerance: 0.15,
    residualExcessVelocityKms: 4.20,
    formulaHint: "v_0 = \\sqrt{v_e^2 + v_\\infty^2}",
    explanationTrap:
      "The Pythagorean velocity relationship (v0² = ve² + v_∞²) applies along the curved trajectory. Adding just 0.76 km/s at the surface yields 4.20 km/s of asymptotic speed in interplanetary space!",
  },
];

// ─── State Interface ───────────────────────────────────────────────────────────
interface EscapeVelocityState {
  currentStage: number;
  status: SimulationStatus;
  sliderValue: number;

  // Real-time kinematics & planet revolution
  simTimeSec: number;
  earthAngleRad: number;        // Continuous Earth rotation angle around Y
  posXKm: number;               // Equatorial 2D position X
  posZKm: number;               // Equatorial 2D position Z
  velXKms: number;              // Velocity vector component X
  velZKms: number;              // Velocity vector component Z

  currentRadiusKm: number;
  currentAltitudeKm: number;
  currentVelocityKms: number;
  peakAltitudeKm: number;

  // Real-time specific energies (MJ/kg)
  kineticEnergyMJ: number;
  potentialEnergyMJ: number;
  totalEnergyMJ: number;

  // 3D Cartesian positions (scene units, R_Earth = 2.0)
  vehiclePos: [number, number, number];
  vehicleVelDir: [number, number, number];
  trajectoryPoints: [number, number, number][];

  // UI feedback & scoring
  stars: number;
  score: number;
  failureReason?: string;
  showResultModal: boolean;

  // Mission intro transition state
  isMissionStarted: boolean;
  missionStartedAt: number | null;

  // Actions
  startMission: () => void;
  setSliderValue: (val: number) => void;
  adjustSliderValue: (delta: number) => void;
  launchProbe: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  setStage: (stage: number) => void;
  updateAnimationStep: (deltaRealSec: number) => void;
}

export const useEscapeVelocityStore = create<EscapeVelocityState>((set, get) => {
  const initStage = ESCAPE_VELOCITY_STAGES[0];
  const initR = R_EARTH_KM;
  const initV = initStage.defaultSlider;
  const initK = 0.5 * initV * initV;
  const initU = -G_M_EARTH / initR;
  const initE = initK + initU;
  const initVisX = initR * R_VIS_SCALE; // 2.0

  return {
    currentStage: 1,
    status: "idle",
    sliderValue: initStage.defaultSlider,

    simTimeSec: 0,
    earthAngleRad: 0,
    posXKm: initR,
    posZKm: 0,
    velXKms: 0,
    velZKms: 0,

    currentRadiusKm: initR,
    currentAltitudeKm: 0,
    currentVelocityKms: initV,
    peakAltitudeKm: 0,

    kineticEnergyMJ: initK,
    potentialEnergyMJ: initU,
    totalEnergyMJ: initE,

    vehiclePos: [initVisX, 0, 0],
    vehicleVelDir: [1, 0, 0],
    trajectoryPoints: [[initVisX, 0, 0]],

    stars: 3,
    score: 1000,
    failureReason: undefined,
    showResultModal: false,

    isMissionStarted: false,
    missionStartedAt: null,

    startMission: () => {
      set({
        isMissionStarted: true,
        missionStartedAt: performance.now(),
      });
    },

    // ── setSliderValue ────────────────────────────────────────────────────────
    setSliderValue: (val) => {
      if (get().status === "launching") return;
      const stageIdx = get().currentStage - 1;
      const cfg = ESCAPE_VELOCITY_STAGES[stageIdx];
      const clamped = Math.max(cfg.sliderMin, Math.min(cfg.sliderMax, val));

      const k = 0.5 * clamped * clamped;
      const u = -G_M_EARTH / R_EARTH_KM;
      const e = k + u;

      set({
        sliderValue: clamped,
        currentVelocityKms: clamped,
        kineticEnergyMJ: k,
        potentialEnergyMJ: u,
        totalEnergyMJ: e,
        status: "idle",
        showResultModal: false,
      });
    },

    adjustSliderValue: (delta) => {
      get().setSliderValue(get().sliderValue + delta);
    },

    // ── launchProbe ───────────────────────────────────────────────────────────
    launchProbe: () => {
      if (get().status === "launching") return;
      const v0 = get().sliderValue;
      const pitchRad = (LAUNCH_PITCH_DEG * Math.PI) / 180.0;

      // Launch begins from the launchpad's EXACT current position at this instant
      const currentAngle = get().earthAngleRad;

      const initX = R_EARTH_KM * Math.cos(currentAngle);
      const initZ = -R_EARTH_KM * Math.sin(currentAngle);

      // Radial outward unit vector & Prograde Eastward unit vector
      const uRadX = Math.cos(currentAngle);
      const uRadZ = -Math.sin(currentAngle);
      const uEastX = -Math.sin(currentAngle);
      const uEastZ = -Math.cos(currentAngle);

      // Initial velocity vector combining radial ascent + Eastward gravity turn
      const vx = v0 * (Math.sin(pitchRad) * uRadX + Math.cos(pitchRad) * uEastX);
      const vz = v0 * (Math.sin(pitchRad) * uRadZ + Math.cos(pitchRad) * uEastZ);

      const k = 0.5 * v0 * v0;
      const u = -G_M_EARTH / R_EARTH_KM;
      const visX = initX * R_VIS_SCALE;
      const visZ = initZ * R_VIS_SCALE;

      set({
        status: "launching",
        simTimeSec: 0,
        posXKm: initX,
        posZKm: initZ,
        velXKms: vx,
        velZKms: vz,
        currentRadiusKm: R_EARTH_KM,
        currentAltitudeKm: 0,
        currentVelocityKms: v0,
        peakAltitudeKm: 0,
        kineticEnergyMJ: k,
        potentialEnergyMJ: u,
        totalEnergyMJ: k + u,
        vehiclePos: [visX, 0, visZ],
        vehicleVelDir: [vx / v0, 0, vz / v0],
        trajectoryPoints: [[visX, 0, visZ]],
        failureReason: undefined,
        showResultModal: false,
      });
    },

    // ── resetSimulation ───────────────────────────────────────────────────────
    resetSimulation: () => {
      const stageIdx = get().currentStage - 1;
      const cfg = ESCAPE_VELOCITY_STAGES[stageIdx];
      const v0 = cfg.defaultSlider;
      const initVisX = R_EARTH_KM * R_VIS_SCALE;
      const k = 0.5 * v0 * v0;
      const u = -G_M_EARTH / R_EARTH_KM;

      set({
        status: "idle",
        sliderValue: v0,
        simTimeSec: 0,
        posXKm: R_EARTH_KM,
        posZKm: 0,
        velXKms: 0,
        velZKms: 0,
        currentRadiusKm: R_EARTH_KM,
        currentAltitudeKm: 0,
        currentVelocityKms: v0,
        peakAltitudeKm: 0,
        kineticEnergyMJ: k,
        potentialEnergyMJ: u,
        totalEnergyMJ: k + u,
        vehiclePos: [initVisX, 0, 0],
        vehicleVelDir: [1, 0, 0],
        trajectoryPoints: [[initVisX, 0, 0]],
        showResultModal: false,
        failureReason: undefined,
      });
    },

    // ── nextStage ─────────────────────────────────────────────────────────────
    nextStage: () => {
      const { currentStage } = get();
      if (currentStage >= 3) return;
      const nextIdx = currentStage;
      const cfg = ESCAPE_VELOCITY_STAGES[nextIdx];
      const v0 = cfg.defaultSlider;
      const initVisX = R_EARTH_KM * R_VIS_SCALE;
      const k = 0.5 * v0 * v0;
      const u = -G_M_EARTH / R_EARTH_KM;

      set({
        currentStage: currentStage + 1,
        status: "idle",
        sliderValue: v0,
        simTimeSec: 0,
        posXKm: R_EARTH_KM,
        posZKm: 0,
        velXKms: 0,
        velZKms: 0,
        currentRadiusKm: R_EARTH_KM,
        currentAltitudeKm: 0,
        currentVelocityKms: v0,
        peakAltitudeKm: 0,
        kineticEnergyMJ: k,
        potentialEnergyMJ: u,
        totalEnergyMJ: k + u,
        vehiclePos: [initVisX, 0, 0],
        vehicleVelDir: [1, 0, 0],
        trajectoryPoints: [[initVisX, 0, 0]],
        showResultModal: false,
        failureReason: undefined,
      });
    },

    // ── setStage ──────────────────────────────────────────────────────────────
    setStage: (stage) => {
      if (stage < 1 || stage > 3) return;
      const stageIdx = stage - 1;
      const cfg = ESCAPE_VELOCITY_STAGES[stageIdx];
      const v0 = cfg.defaultSlider;
      const initVisX = R_EARTH_KM * R_VIS_SCALE;
      const k = 0.5 * v0 * v0;
      const u = -G_M_EARTH / R_EARTH_KM;

      set({
        currentStage: stage,
        status: "idle",
        sliderValue: v0,
        simTimeSec: 0,
        posXKm: R_EARTH_KM,
        posZKm: 0,
        velXKms: 0,
        velZKms: 0,
        currentRadiusKm: R_EARTH_KM,
        currentAltitudeKm: 0,
        currentVelocityKms: v0,
        peakAltitudeKm: 0,
        kineticEnergyMJ: k,
        potentialEnergyMJ: u,
        totalEnergyMJ: k + u,
        vehiclePos: [initVisX, 0, 0],
        vehicleVelDir: [1, 0, 0],
        trajectoryPoints: [[initVisX, 0, 0]],
        showResultModal: false,
        failureReason: undefined,
      });
    },

    // ── updateAnimationStep ───────────────────────────────────────────────────
    updateAnimationStep: (deltaRealSec) => {
      const state = get();

      // Earth spins constantly (revolving planet visual)
      // Visual Earth rotation: full revolution every ~24 seconds
      const earthSpinDelta = (2.0 * Math.PI / 24.0) * deltaRealSec;
      const newEarthAngle = state.earthAngleRad + earthSpinDelta;

      // If idle, rocket sits on the revolving pad
      if (state.status !== "launching") {
        const padX = 2.0 * Math.cos(newEarthAngle);
        const padZ = -2.0 * Math.sin(newEarthAngle);
        set({
          earthAngleRad: newEarthAngle,
          vehiclePos: [padX, 0, padZ],
          vehicleVelDir: [Math.cos(newEarthAngle), 0, -Math.sin(newEarthAngle)],
          trajectoryPoints: [[padX, 0, padZ]],
        });
        return;
      }

      const stageIdx = state.currentStage - 1;
      const cfg = ESCAPE_VELOCITY_STAGES[stageIdx];

      // Physical speedup factor for smooth curved arc flight
      const SIM_SPEEDUP = 380.0;
      const dtPhys = deltaRealSec * SIM_SPEEDUP;

      // 4th-Order Runge-Kutta 2D central gravity integration
      const SUB_STEPS = 8;
      const dtSub = dtPhys / SUB_STEPS;

      let x = state.posXKm;
      let z = state.posZKm;
      let vx = state.velXKms;
      let vz = state.velZKms;
      let peakH = state.peakAltitudeKm;

      for (let s = 0; s < SUB_STEPS; s++) {
        const getAccel = (px: number, pz: number) => {
          const rSq = px * px + pz * pz;
          const r = Math.sqrt(rSq);
          const a = -G_M_EARTH / (rSq * r);
          return { ax: a * px, az: a * pz };
        };

        const a1 = getAccel(x, z);
        const k1_vx = a1.ax;
        const k1_vz = a1.az;
        const k1_x  = vx;
        const k1_z  = vz;

        const a2 = getAccel(x + 0.5 * dtSub * k1_x, z + 0.5 * dtSub * k1_z);
        const k2_vx = a2.ax;
        const k2_vz = a2.az;
        const k2_x  = vx + 0.5 * dtSub * k1_vx;
        const k2_z  = vz + 0.5 * dtSub * k1_vz;

        const a3 = getAccel(x + 0.5 * dtSub * k2_x, z + 0.5 * dtSub * k2_z);
        const k3_vx = a3.ax;
        const k3_vz = a3.az;
        const k3_x  = vx + 0.5 * dtSub * k2_vx;
        const k3_z  = vz + 0.5 * dtSub * k2_vz;

        const a4 = getAccel(x + dtSub * k3_x, z + dtSub * k3_z);
        const k4_vx = a4.ax;
        const k4_vz = a4.az;
        const k4_x  = vx + dtSub * k3_vx;
        const k4_z  = vz + dtSub * k3_vz;

        x  += (dtSub / 6.0) * (k1_x  + 2 * k2_x  + 2 * k3_x  + k4_x);
        z  += (dtSub / 6.0) * (k1_z  + 2 * k2_z  + 2 * k3_z  + k4_z);
        vx += (dtSub / 6.0) * (k1_vx + 2 * k2_vx + 2 * k3_vx + k4_vx);
        vz += (dtSub / 6.0) * (k1_vz + 2 * k2_vz + 2 * k3_vz + k4_vz);

        const curR = Math.hypot(x, z);
        const curAlt = curR - R_EARTH_KM;
        if (curAlt > peakH) peakH = curAlt;
      }

      const curR = Math.hypot(x, z);
      const curAlt = Math.max(0, curR - R_EARTH_KM);
      const curV = Math.hypot(vx, vz);
      const kEnergy = 0.5 * curV * curV;
      const uEnergy = -G_M_EARTH / curR;
      const totEnergy = kEnergy + uEnergy;

      // 3D visual coordinates
      const visX = x * R_VIS_SCALE;
      const visZ = z * R_VIS_SCALE;
      const newPos: [number, number, number] = [visX, 0, visZ];

      // Velocity direction unit vector for rocket attitude
      const velMag = Math.max(0.001, curV);
      const newVelDir: [number, number, number] = [vx / velMag, 0, vz / velMag];

      // Trajectory trail
      const currentTrail = [...state.trajectoryPoints];
      const lastPoint = currentTrail[currentTrail.length - 1];
      const dDist = Math.hypot(visX - lastPoint[0], visZ - lastPoint[2]);
      if (dDist > 0.04) {
        currentTrail.push(newPos);
        if (currentTrail.length > 300) currentTrail.shift();
      }

      const newTime = state.simTimeSec + deltaRealSec;

      // ── Stage Completion Checks ──
      if (cfg.stage === 1) {
        // Sub-orbital apogee: radial velocity component (v_r = (x·vx + z·vz)/r) crosses zero
        const vRadial = (x * vx + z * vz) / curR;
        if ((vRadial <= 0 && newTime > 1.2) || curAlt <= 0 || newTime >= 7.0) {
          const deltaParam = Math.abs(state.sliderValue - cfg.targetValue);
          const isSuccess = deltaParam <= cfg.tolerance;

          if (isSuccess) {
            set({
              status: "success",
              showResultModal: true,
              stars: deltaParam <= cfg.tolerance * 0.4 ? 3 : 2,
              score: Math.round(1000 - deltaParam * 120),
            });
          } else {
            const reason =
              state.sliderValue < cfg.targetValue
                ? `Launch velocity too low (${state.sliderValue.toFixed(2)} km/s < 8.26 km/s). Curved apogee reached only ${peakH.toFixed(0)} km (required: 6,371 km). The spacecraft curved back into the atmosphere.`
                : `Launch velocity too high (${state.sliderValue.toFixed(2)} km/s > 8.26 km/s). The craft overshot the target apogee ring to ${peakH.toFixed(0)} km, missing the orbital relay station.`;

            set({
              status: state.sliderValue < cfg.targetValue ? "fail_low" : "fail_high",
              showResultModal: true,
              failureReason: reason,
            });
          }
        }
      } else if (cfg.stage === 2) {
        // Parabolic escape threshold (r >= 6.5 R_E)
        const ESCAPE_GATE_R = 6.5 * R_EARTH_KM;
        const vRadial = (x * vx + z * vz) / curR;
        if (curR >= ESCAPE_GATE_R || (vRadial <= 0 && newTime > 2.0) || newTime >= 7.5) {
          const deltaParam = Math.abs(state.sliderValue - cfg.targetValue);
          const isSuccess = deltaParam <= cfg.tolerance;

          if (isSuccess) {
            set({
              status: "success",
              showResultModal: true,
              stars: deltaParam <= cfg.tolerance * 0.4 ? 3 : 2,
              score: Math.round(1000 - deltaParam * 80),
            });
          } else {
            const reason =
              state.sliderValue < cfg.targetValue
                ? `Velocity below escape threshold (${state.sliderValue.toFixed(2)} km/s < 11.18 km/s). Total energy E = ${totEnergy.toFixed(1)} MJ/kg < 0. Earth's gravity remained dominant, looping the spacecraft into a closed elliptic orbit (apogee ${peakH.toFixed(0)} km).`
                : `Velocity exceeded parabolic threshold (${state.sliderValue.toFixed(2)} km/s > 11.18 km/s). Total energy E > 0 resulted in a fast hyperbolic escape rather than the targeted parabolic escape arc.`;

            set({
              status: state.sliderValue < cfg.targetValue ? "fail_low" : "fail_high",
              showResultModal: true,
              failureReason: reason,
            });
          }
        }
      } else {
        // Stage 3: Hyperbolic excess velocity at Mars gate (r >= 8 R_E)
        const INTERPLANETARY_GATE_R = 8.0 * R_EARTH_KM;
        const vRadial = (x * vx + z * vz) / curR;
        if (curR >= INTERPLANETARY_GATE_R || (vRadial <= 0 && newTime > 2.0) || newTime >= 7.5) {
          const deltaParam = Math.abs(state.sliderValue - cfg.targetValue);
          const isSuccess = deltaParam <= cfg.tolerance;
          const computedExcess = totEnergy > 0 ? Math.sqrt(2 * totEnergy) : 0;

          if (isSuccess) {
            set({
              status: "success",
              showResultModal: true,
              stars: deltaParam <= cfg.tolerance * 0.4 ? 3 : 2,
              score: Math.round(1000 - deltaParam * 90),
            });
          } else {
            const reason =
              state.sliderValue < cfg.targetValue
                ? `Residual hyperbolic excess insufficient (v_∞ = ${computedExcess.toFixed(2)} km/s < 4.20 km/s). The probe does not possess sufficient surplus kinetic energy to join the Mars interplanetary transfer corridor.`
                : `Residual excess velocity too high (v_∞ = ${computedExcess.toFixed(2)} km/s > 4.20 km/s). The probe will approach the interplanetary corridor with excessive speed, requiring unsustainable retro-burn fuel for orbital insertion.`;

            set({
              status: state.sliderValue < cfg.targetValue ? "fail_low" : "fail_high",
              showResultModal: true,
              failureReason: reason,
            });
          }
        }
      }

      set({
        simTimeSec: newTime,
        earthAngleRad: newEarthAngle,
        posXKm: x,
        posZKm: z,
        velXKms: vx,
        velZKms: vz,
        currentRadiusKm: curR,
        currentAltitudeKm: curAlt,
        currentVelocityKms: curV,
        peakAltitudeKm: peakH,
        kineticEnergyMJ: kEnergy,
        potentialEnergyMJ: uEnergy,
        totalEnergyMJ: totEnergy,
        vehiclePos: newPos,
        vehicleVelDir: newVelDir,
        trajectoryPoints: currentTrail,
      });
    },
  };
});
