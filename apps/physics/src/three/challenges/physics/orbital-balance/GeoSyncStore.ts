"use client";

import { create } from "zustand";

export type SimulationStatus =
  | "idle"
  | "testing"
  | "success"
  | "fail_speed"
  | "fail_radius"
  | "fail_inclination";

export interface GeoSyncStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  missionObjective: string;
  sliderParam: "velocity" | "radius" | "inclination";
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
  fixedRadiusKm?: number;
  fixedSpeedKms?: number;
  fixedInclinationDeg?: number;
  formulaHint: string;
  explanationTrap: string;
}

// ─── Real Physical Constants ───────────────────────────────────────────────────
export const G_M_EARTH   = 398600.4418;  // km³/s²  (μ = GM_Earth)
export const R_EARTH_KM  = 6371.0;       // km (Earth mean radius)
export const OMEGA_EARTH = 7.292115e-5;  // rad/s (sidereal day = 86164.1 s)
export const T_EARTH_SID = 86164.1;      // seconds (sidereal day)
export const R_GEO_KM    = 42164.14;     // km (exact geostationary orbit radius)
export const V_GEO_KMS   = 3.0747;       // km/s (exact circular speed at R_GEO)
export const BEAM_HALF_DEG = 4.5;        // ground station antenna beam half-width

// ─── Visual Scale ─────────────────────────────────────────────────────────────
// Earth sphere radius = 2.0 scene units
export const R_VIS_SCALE = 2.0 / R_EARTH_KM; // scene-units per km (~0.0003139)

// Visual animation speedup:
// In test mode, we want a half-rotation (12 virtual hours = 43200 s) to take 6.0 real seconds.
// Speedup = 43200 / 6.0 = 7200×
export const ANIM_SPEEDUP = 7200.0;

// ─── Stage Configs ─────────────────────────────────────────────────────────────
export const GEOSYNC_STAGES: GeoSyncStageConfig[] = [
  {
    stage: 1,
    title: "STAGE 1: CIRCULAR VELOCITY CALIBRATION",
    subtitle: "Equatorial Orbit Balance (r = 42,164 km, i = 0.0°)",
    missionObjective:
      "Calculate and set the exact orbital speed v required for a circular orbit at geostationary radius r = 42,164 km. At the correct speed the satellite will hover motionless above the equatorial ground station.",
    sliderParam: "velocity",
    controlLabel: "ORBITAL VELOCITY (v)",
    paramUnit: "km/s",
    sliderMin: 2.00,
    sliderMax: 4.20,
    sliderStep: 0.01,
    stepSmall: 0.01,
    stepLarge: 0.10,
    defaultSlider: 2.50,
    targetValue: 3.07,     // v = √(GM/r) = √(398600/42164) ≈ 3.075 km/s
    tolerance: 0.06,
    fixedRadiusKm: 42164,
    fixedInclinationDeg: 0.0,
    formulaHint: "v = \\sqrt{G M_E / r}",
    explanationTrap:
      "At a given radius, circular orbital speed is fixed by gravity: v = √(GM/r). If dialed slower than 3.07 km/s, the satellite moves slower than Earth rotates (lags westward). If dialed faster, it races ahead eastward.",
  },
  {
    stage: 2,
    title: "STAGE 2: PERIOD RESONANCE ALTITUDE",
    subtitle: "Synchronisation with Earth Rotation (T = 24 h)",
    missionObjective:
      "Tune the orbital radius r so that the satellite's orbital period exactly matches Earth's 24-hour rotation. Use Kepler's Third Law to calculate the unique resonance altitude.",
    sliderParam: "radius",
    controlLabel: "ORBITAL RADIUS (r)",
    paramUnit: "×10³ km",
    sliderMin: 20.0,
    sliderMax: 60.0,
    sliderStep: 0.1,
    stepSmall: 0.1,
    stepLarge: 1.0,
    defaultSlider: 30.0,
    targetValue: 42.2,     // r = (GM/ω²)^(1/3) = 42 164 km ≈ 42.2 × 10³ km
    tolerance: 0.8,
    fixedInclinationDeg: 0.0,
    formulaHint: "r = (G M_E / \\omega^2)^{1/3}",
    explanationTrap:
      "Lower orbits complete a revolution faster than Earth spins (satellite races Eastward). Higher orbits are slower (satellite lags Westward). Only r = 42,164 km matches T = 24 h.",
  },
  {
    stage: 3,
    title: "STAGE 3: EQUATORIAL PLANE ALIGNMENT",
    subtitle: "Eliminating North-South Analemma Drift (i → 0°)",
    missionObjective:
      "Trim the orbital inclination i to exactly 0.0° so the satellite stays pinned directly above the equatorial ground station without oscillating north and south.",
    sliderParam: "inclination",
    controlLabel: "ORBITAL INCLINATION (i)",
    paramUnit: "°",
    sliderMin: -25.0,
    sliderMax: 25.0,
    sliderStep: 0.1,
    stepSmall: 0.5,
    stepLarge: 2.0,
    defaultSlider: 15.0,
    targetValue: 0.0,
    tolerance: 1.2,
    fixedRadiusKm: 42164,
    formulaHint: "i = 0.0°  (Equatorial Plane)",
    explanationTrap:
      "A 24-hour orbit inclined even a few degrees traces a figure-8 analemma across the sky — it is geosynchronous but NOT geostationary. Only i = 0° keeps the dish locked.",
  },
];

// ─── Orbital Mechanics Computation ─────────────────────────────────────────────

export interface ComputedOrbit {
  rKm: number;
  vKms: number;
  incDeg: number;
  omegaOrbRadSec: number;
  periodHours: number;
}

export function computeOrbit(stageIdx: number, sliderVal: number): ComputedOrbit {
  const cfg = GEOSYNC_STAGES[stageIdx];
  let rKm  = R_GEO_KM;
  let vKms = V_GEO_KMS;
  let incDeg = 0.0;

  if (cfg.sliderParam === "velocity") {
    vKms   = sliderVal;
    rKm    = cfg.fixedRadiusKm ?? R_GEO_KM;
    incDeg = cfg.fixedInclinationDeg ?? 0.0;
  } else if (cfg.sliderParam === "radius") {
    rKm    = sliderVal * 1000.0;               // slider is in ×10³ km
    vKms   = Math.sqrt(G_M_EARTH / rKm);       // stable circular speed at r
    incDeg = cfg.fixedInclinationDeg ?? 0.0;
  } else {
    rKm    = cfg.fixedRadiusKm ?? R_GEO_KM;
    vKms   = V_GEO_KMS;
    incDeg = sliderVal;
  }

  // Orbital angular speed: ω = v / r (rad/s)
  const omegaOrbRadSec = vKms / rKm;
  // Orbital period: T = 2π / ω
  const periodHours = (2.0 * Math.PI) / omegaOrbRadSec / 3600.0;

  return { rKm, vKms, incDeg, omegaOrbRadSec, periodHours };
}

// ─── Cartesian Position Helpers (Standard Three.js Coordinates) ─────────────────
//
// In Three.js:
//   +Y is Up (North pole)
//   +X is Right
//   +Z is Out of screen (towards viewer)
//
// Counter-Clockwise rotation around +Y axis (viewed from above North pole looking down):
//   Points move from +X towards -Z.
//   Parametric coordinates for angle θ (where θ = 0 is +X):
//     x = R * cos(θ)
//     z = -R * sin(θ)
//   This matches Three.js object.rotation.y = θ perfectly!
//
// For satellite with orbital inclination i:
//   The orbit lies in the XZ plane at i = 0.
//   Inclination tilts the orbit plane around the X-axis (line of nodes):
//     x = rVis * cos(θ)
//     y = rVis * sin(θ) * sin(i)
//     z = -rVis * sin(θ) * cos(i)
//
export function stationXYZ(earthAngleRad: number): [number, number, number] {
  return [
    2.0 * Math.cos(earthAngleRad),
    0,
    -2.0 * Math.sin(earthAngleRad),
  ];
}

export function satelliteXYZ(
  satAngleRad: number,
  rVis: number,
  incRad: number
): [number, number, number] {
  const x =  rVis * Math.cos(satAngleRad);
  const y =  rVis * Math.sin(satAngleRad) * Math.sin(incRad);
  const z = -rVis * Math.sin(satAngleRad) * Math.cos(incRad);
  return [x, y, z];
}

// ─── Store State ───────────────────────────────────────────────────────────────

interface GeoSyncState {
  currentStage: number;
  status: SimulationStatus;
  sliderValue: number;

  // Real-time kinematics (angles in radians, grow monotonically in same CCW direction)
  simTimeSec: number;
  earthAngleRad: number;
  satAngleRad: number;

  // Derived parameters
  currentRadiusKm: number;
  currentVelocityKms: number;
  currentInclinationDeg: number;
  orbitalPeriodHours: number;
  angularDriftDeg: number;
  signalStrengthPercent: number;

  // 3D Cartesian positions (scene units, Earth radius = 2.0)
  stationPos: [number, number, number];
  satellitePos: [number, number, number];

  // UI feedback
  stars: number;
  score: number;
  failureReason?: string;
  showResultModal: boolean;

  // Actions
  setSliderValue: (val: number) => void;
  adjustSliderValue: (delta: number) => void;
  testLock: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  setStage: (stage: number) => void;
  updateAnimationStep: (deltaRealSec: number) => void;
}

export const useGeoSyncStore = create<GeoSyncState>((set, get) => {
  const initOrbit = computeOrbit(0, GEOSYNC_STAGES[0].defaultSlider);
  const initRVis  = initOrbit.rKm * R_VIS_SCALE;
  const initIncRad = (initOrbit.incDeg * Math.PI) / 180.0;

  return {
    currentStage: 1,
    status: "idle",
    sliderValue: GEOSYNC_STAGES[0].defaultSlider,

    simTimeSec: 0,
    earthAngleRad: 0,
    satAngleRad: 0,

    currentRadiusKm: initOrbit.rKm,
    currentVelocityKms: initOrbit.vKms,
    currentInclinationDeg: initOrbit.incDeg,
    orbitalPeriodHours: initOrbit.periodHours,
    angularDriftDeg: 0,
    signalStrengthPercent: 100,

    stationPos: stationXYZ(0),
    satellitePos: satelliteXYZ(0, initRVis, initIncRad),

    stars: 3,
    score: 1000,
    failureReason: undefined,
    showResultModal: false,

    // ── setSliderValue ────────────────────────────────────────────────────────
    setSliderValue: (val) => {
      if (get().status === "testing") return;
      const stageIdx = get().currentStage - 1;
      const cfg = GEOSYNC_STAGES[stageIdx];
      const clamped = Math.max(cfg.sliderMin, Math.min(cfg.sliderMax, val));
      const orbit = computeOrbit(stageIdx, clamped);
      const rVis  = orbit.rKm * R_VIS_SCALE;
      const incRad = (orbit.incDeg * Math.PI) / 180.0;

      // In idle mode, satellite is positioned at current satAngleRad (or 0)
      const currentSatAngle = get().satAngleRad;

      set({
        sliderValue: clamped,
        currentRadiusKm: orbit.rKm,
        currentVelocityKms: orbit.vKms,
        currentInclinationDeg: orbit.incDeg,
        orbitalPeriodHours: orbit.periodHours,
        satellitePos: satelliteXYZ(currentSatAngle, rVis, incRad),
        status: "idle",
        showResultModal: false,
      });
    },

    adjustSliderValue: (delta) => {
      get().setSliderValue(get().sliderValue + delta);
    },

    // ── testLock ──────────────────────────────────────────────────────────────
    testLock: () => {
      if (get().status === "testing") return;
      const stageIdx = get().currentStage - 1;
      const orbit = computeOrbit(stageIdx, get().sliderValue);
      const rVis  = orbit.rKm * R_VIS_SCALE;
      const incRad = (orbit.incDeg * Math.PI) / 180.0;

      // Start lock test from zero alignment (zenith lock)
      set({
        status: "testing",
        simTimeSec: 0,
        earthAngleRad: 0,
        satAngleRad: 0,
        stationPos: stationXYZ(0),
        satellitePos: satelliteXYZ(0, rVis, incRad),
        angularDriftDeg: 0,
        signalStrengthPercent: 100,
        failureReason: undefined,
        showResultModal: false,
      });
    },

    // ── resetSimulation ───────────────────────────────────────────────────────
    resetSimulation: () => {
      const stageIdx = get().currentStage - 1;
      const cfg   = GEOSYNC_STAGES[stageIdx];
      const orbit = computeOrbit(stageIdx, cfg.defaultSlider);
      const rVis  = orbit.rKm * R_VIS_SCALE;
      const incRad = (orbit.incDeg * Math.PI) / 180.0;

      set({
        status: "idle",
        sliderValue: cfg.defaultSlider,
        simTimeSec: 0,
        earthAngleRad: 0,
        satAngleRad: 0,
        currentRadiusKm: orbit.rKm,
        currentVelocityKms: orbit.vKms,
        currentInclinationDeg: orbit.incDeg,
        orbitalPeriodHours: orbit.periodHours,
        angularDriftDeg: 0,
        signalStrengthPercent: 100,
        stationPos: stationXYZ(0),
        satellitePos: satelliteXYZ(0, rVis, incRad),
        showResultModal: false,
        failureReason: undefined,
      });
    },

    // ── nextStage ─────────────────────────────────────────────────────────────
    nextStage: () => {
      const { currentStage } = get();
      if (currentStage >= 3) return;
      const nextIdx = currentStage;
      const cfg   = GEOSYNC_STAGES[nextIdx];
      const orbit = computeOrbit(nextIdx, cfg.defaultSlider);
      const rVis  = orbit.rKm * R_VIS_SCALE;
      const incRad = (orbit.incDeg * Math.PI) / 180.0;

      set({
        currentStage: currentStage + 1,
        status: "idle",
        sliderValue: cfg.defaultSlider,
        simTimeSec: 0,
        earthAngleRad: 0,
        satAngleRad: 0,
        currentRadiusKm: orbit.rKm,
        currentVelocityKms: orbit.vKms,
        currentInclinationDeg: orbit.incDeg,
        orbitalPeriodHours: orbit.periodHours,
        angularDriftDeg: 0,
        signalStrengthPercent: 100,
        stationPos: stationXYZ(0),
        satellitePos: satelliteXYZ(0, rVis, incRad),
        showResultModal: false,
        failureReason: undefined,
      });
    },

    // ── setStage ──────────────────────────────────────────────────────────────
    setStage: (stage) => {
      if (stage < 1 || stage > 3) return;
      const stageIdx = stage - 1;
      const cfg   = GEOSYNC_STAGES[stageIdx];
      const orbit = computeOrbit(stageIdx, cfg.defaultSlider);
      const rVis  = orbit.rKm * R_VIS_SCALE;
      const incRad = (orbit.incDeg * Math.PI) / 180.0;

      set({
        currentStage: stage,
        status: "idle",
        sliderValue: cfg.defaultSlider,
        simTimeSec: 0,
        earthAngleRad: 0,
        satAngleRad: 0,
        currentRadiusKm: orbit.rKm,
        currentVelocityKms: orbit.vKms,
        currentInclinationDeg: orbit.incDeg,
        orbitalPeriodHours: orbit.periodHours,
        angularDriftDeg: 0,
        signalStrengthPercent: 100,
        stationPos: stationXYZ(0),
        satellitePos: satelliteXYZ(0, rVis, incRad),
        showResultModal: false,
        failureReason: undefined,
      });
    },

    // ── updateAnimationStep ───────────────────────────────────────────────────
    updateAnimationStep: (deltaRealSec) => {
      const state = get();
      if (state.status !== "testing") return; // Only advance time while testing lock

      const stageIdx = state.currentStage - 1;
      const cfg     = GEOSYNC_STAGES[stageIdx];
      const orbit   = computeOrbit(stageIdx, state.sliderValue);

      // Virtual time step
      const dtPhys = deltaRealSec * ANIM_SPEEDUP;

      // Both rotate CCW around +Y axis (angles increase monotonically)
      const dEarth = OMEGA_EARTH * dtPhys;
      const dSat   = orbit.omegaOrbRadSec * dtPhys;

      const newTimeSec    = state.simTimeSec + deltaRealSec;
      const newEarthAngle = state.earthAngleRad + dEarth;
      const newSatAngle   = state.satAngleRad   + dSat;

      // Compute 3D positions
      const rVis   = orbit.rKm * R_VIS_SCALE;
      const incRad = (orbit.incDeg * Math.PI) / 180.0;
      const newStPos  = stationXYZ(newEarthAngle);
      const newSatPos = satelliteXYZ(newSatAngle, rVis, incRad);

      // ── Physical Off-Boresight Angle (Ground Dish Drift) ──
      // Station zenith unit vector (points radially outward from Earth's center):
      const zenX = Math.cos(newEarthAngle);
      const zenY = 0;
      const zenZ = -Math.sin(newEarthAngle);

      // Line of sight vector from ground station dish to satellite:
      const dx = newSatPos[0] - newStPos[0];
      const dy = newSatPos[1] - newStPos[1];
      const dz = newSatPos[2] - newStPos[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const losX = dx / dist;
      const losY = dy / dist;
      const losZ = dz / dist;

      // Dot product gives cosine of the angular deviation from local zenith:
      const dotZen = Math.max(-1, Math.min(1, zenX * losX + zenY * losY + zenZ * losZ));
      const angularDriftDeg = (Math.acos(dotZen) * 180.0) / Math.PI;

      // Signal strength: 100% when drift = 0°, 0% when drift >= BEAM_HALF_DEG
      const signalPercent = Math.max(
        0,
        Math.min(100, Math.round(100.0 * (1.0 - angularDriftDeg / BEAM_HALF_DEG)))
      );

      // ── Test Completion Check (6.0 real seconds = 12 virtual hours) ──
      const TEST_DURATION = 6.0;
      if (newTimeSec >= TEST_DURATION) {
        const deltaParam = Math.abs(state.sliderValue - cfg.targetValue);
        const isSuccess  = deltaParam <= cfg.tolerance;

        if (isSuccess) {
          set({
            status: "success",
            showResultModal: true,
            stars: deltaParam <= cfg.tolerance * 0.4 ? 3 : 2,
            score: Math.round(1000 - deltaParam * 80),
          });
        } else {
          let reason = "";
          let failType: SimulationStatus = "fail_speed";

          if (cfg.sliderParam === "velocity") {
            failType = "fail_speed";
            reason =
              state.sliderValue < cfg.targetValue
                ? `Velocity too low (${state.sliderValue.toFixed(2)} km/s < 3.07 km/s). The satellite moves slower than Earth's rotational speed at this radius (v_sync = 3.07 km/s). The satellite lags behind and drifts westward out of the ground station's signal beam.`
                : `Velocity too high (${state.sliderValue.toFixed(2)} km/s > 3.07 km/s). The satellite moves faster than Earth's rotational speed at this radius (v_sync = 3.07 km/s). The satellite races ahead eastward, escaping the ground station's reception cone.`;
          } else if (cfg.sliderParam === "radius") {
            failType = "fail_radius";
            reason =
              state.sliderValue < cfg.targetValue
                ? `Radius too low (${state.sliderValue.toFixed(1)} ×10³ km < 42.2 ×10³ km). By Kepler's 3rd Law (T ∝ r^{3/2}), a lower orbit has a shorter orbital period (T = ${orbit.periodHours.toFixed(1)} h < 24 h). The satellite orbits faster than Earth spins, racing eastward.`
                : `Radius too high (${state.sliderValue.toFixed(1)} ×10³ km > 42.2 ×10³ km). By Kepler's 3rd Law, a higher orbit has a longer period (T = ${orbit.periodHours.toFixed(1)} h > 24 h). The satellite moves slower than Earth's rotation, lagging westward.`;
          } else {
            failType = "fail_inclination";
            reason = `Orbital inclination is tilted by ${state.sliderValue.toFixed(1)}°. A 24-hour inclined orbit is geosynchronous but NOT geostationary — it wanders ${(42164 * Math.sin(Math.abs(state.sliderValue) * Math.PI / 180)).toFixed(0)} km North and South of the equator in a figure-8 analemma, breaching the ground dish's ${BEAM_HALF_DEG}° beam cone.`;
          }

          set({
            status: failType,
            showResultModal: true,
            failureReason: reason,
          });
        }
      }

      set({
        simTimeSec: newTimeSec,
        earthAngleRad: newEarthAngle,
        satAngleRad: newSatAngle,
        stationPos: newStPos,
        satellitePos: newSatPos,
        currentRadiusKm: orbit.rKm,
        currentVelocityKms: orbit.vKms,
        currentInclinationDeg: orbit.incDeg,
        orbitalPeriodHours: orbit.periodHours,
        angularDriftDeg,
        signalStrengthPercent: signalPercent,
      });
    },
  };
});
