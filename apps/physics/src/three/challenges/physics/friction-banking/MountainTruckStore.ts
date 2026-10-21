"use client";

import { create } from "zustand";
import * as THREE from "three";
import { challengeAudio } from "@/lib/audio/challengeAudio";

export type TruckSimulationStatus =
  | "idle"
  | "driving"
  | "won"
  | "rollback_crash"
  | "cliff_skid"
  | "runaway_crash"
  | "cargo_lost";

export type CargoDropDirection = "none" | "left" | "right" | "rear";

export interface MountainStage {
  round: number;
  title: string;
  subtitle: string;
  totalLength: number;     // meters from start archway to summit finish (440m)
  maxInclineDeg: number;   // steepest slope (degrees, e.g. 16°, 22°, 28°)
  hairpinRadius: number;   // meters (e.g. 32m, 25m, 18m)
  frictionMu: number;      // tire-road static friction coefficient (0.65, 0.44, 0.32)
  truckMass: number;       // kg (4000 kg)
  targetTime: number;      // seconds for 3-star rating
}

export const MOUNTAIN_STAGES: MountainStage[] = [
  {
    round: 1,
    title: "Stage 1: Rocky Foothills",
    subtitle: "Max Slope +16° · Downhill -10° · Curve R = 32 m · Dry Gravel μ = 0.65",
    totalLength: 440,
    maxInclineDeg: 16,
    hairpinRadius: 32,
    frictionMu: 0.65,
    truckMass: 4000,
    targetTime: 28,
  },
  {
    round: 2,
    title: "Stage 2: Dead Man's Ridge",
    subtitle: "Steep Slope +22° · Downhill -12° · Curve R = 25 m · Wet Dirt μ = 0.44",
    totalLength: 440,
    maxInclineDeg: 22,
    hairpinRadius: 25,
    frictionMu: 0.44,
    truckMass: 4200,
    targetTime: 32,
  },
  {
    round: 3,
    title: "Stage 3: Himalayan Sky Pass",
    subtitle: "Extreme Incline +28° · Downhill -15° · Curve R = 18 m · Icy Ridge μ = 0.32",
    totalLength: 440,
    maxInclineDeg: 28,
    hairpinRadius: 18,
    frictionMu: 0.32,
    truckMass: 4500,
    targetTime: 36,
  },
];

export const ROAD_PAD_LENGTH = 18;  // meters of approach pad before start archway
export const TOTAL_ROAD_LENGTH = 440; // meters from start archway to summit finish

/**
 * Builds the exact 3D CatmullRom spline representing the winding mountain road.
 * This exact spline is shared between 3D visual rendering and physics calculations.
 */
export function buildMountainSpline(stage: MountainStage): THREE.CatmullRomCurve3 {
  const R = stage.hairpinRadius; // 32, 25, or 18
  const H = stage.maxInclineDeg * 1.35; // 21.6, 29.7, 37.8

  // Grade-separated Alpine Spiral Loop:
  // Lower road exits tunnel at lower elevation (Y_lower ~ 13m to 23m)
  // Hairpin climbs continuously around the mountain spire
  // Upper road crosses over the lower road on an elevated viaduct bridge with guaranteed 9.1m+ vertical clearance!
  const yLowerCrossing = H * 0.60;
  const yUpperCrossing = yLowerCrossing + 8.5; // Guaranteed minimum 8.5m vertical clearance for loaded truck!

  const points = [
    new THREE.Vector3(0, 0, -18),               // Approach pad rear
    new THREE.Vector3(0, 0, -6),                // Approach pad
    new THREE.Vector3(0, 0, 0),                 // Start line archway (d = 0)
    new THREE.Vector3(0, 0, 18),                // Flat launch pad (0 deg)
    new THREE.Vector3(5, H * 0.12, 48),         // Foothills entry (slope ~9 deg)
    new THREE.Vector3(14, H * 0.28, 85),        // Valley climb (slope ~12 deg)
    new THREE.Vector3(20, H * 0.48, 126),       // Ridge shoulder ascent (slope ~15 deg)
    new THREE.Vector3(14, H * 0.58, 168),       // Sweeping curve toward mountain tunnel
    new THREE.Vector3(2, H * 0.62, 205),        // Approaching granite tunnel portal
    // Granite Massif Mountain Tunnel (u ~ 0.44 to 0.56, d ~ 210m to 270m)
    new THREE.Vector3(-10, H * 0.62, 238),      // Inside arched mountain tunnel
    new THREE.Vector3(-18, yLowerCrossing, 268), // Tunnel exit portal onto lower road cut
    // LOWER ROAD UNDERPASS (passes directly underneath the upper bridge at Z ~ 285, X ~ -21)
    new THREE.Vector3(-24, yLowerCrossing, 295), // Underpass floor (Y = yLowerCrossing)
    // Grand Alpine Horseshoe Hairpin (Radius R around rocky spur, climbing up to the bridge)
    new THREE.Vector3(-24 - R * 0.45, yLowerCrossing + 2.0, 295 + R * 0.65),
    new THREE.Vector3(-24 - R * 0.85, yLowerCrossing + 4.2, 295 + R * 0.12),
    new THREE.Vector3(-24 - R * 0.65, yLowerCrossing + 6.4, 295 - R * 0.35),
    // UPPER VIADUCT BRIDGE CROSSING:
    // This section crosses directly OVER the lower road at Z ~ 285, X ~ -21 with >= 9.1m clearance!
    new THREE.Vector3(-24 - R * 0.10, yUpperCrossing, 295 - R * 0.50),
    new THREE.Vector3(-24 + R * 0.45, yUpperCrossing + 1.2, 295 - R * 0.25),
    new THREE.Vector3(-24 + R * 0.80, yUpperCrossing + 2.4, 295 + R * 0.15),
    // Hairpin exit climbing to summit pass
    new THREE.Vector3(2, yUpperCrossing + 3.8, 320),        // Summit ridge climb
    new THREE.Vector3(12, yUpperCrossing + 4.8, 348),       // Final pass crest
    new THREE.Vector3(15, yUpperCrossing + 5.2, 368),       // Summit plateau entry
    new THREE.Vector3(15, yUpperCrossing + 5.2, 386),       // Summit Finish Arch (d ~ 440m)
    new THREE.Vector3(15, yUpperCrossing + 5.2, 404),       // Parking runout
    new THREE.Vector3(15, yUpperCrossing + 5.2, 418),       // Plateau end
  ];

  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
}

// Spline cache to ensure instant sampling without re-generating
const splineCache = new Map<number, THREE.CatmullRomCurve3>();

export function getMountainSpline(stage: MountainStage): THREE.CatmullRomCurve3 {
  let s = splineCache.get(stage.round);
  if (!s) {
    s = buildMountainSpline(stage);
    splineCache.set(stage.round, s);
  }
  return s;
}

/**
 * Procedural Road Profile derived directly from the 3D spline tangent.
 * 1. On plane road (d <= 15m and d >= 415m): slope is strictly 0.0°, truck is unaffected by slope gravity.
 * 2. On up slope (sinAlpha > 0): gravity pulls backward (-mg sin(alpha)).
 * 3. On down slope (sinAlpha < 0): gravity pulls forward (+mg |sin(alpha)|).
 */
export function getRoadProfile(distance: number, stage: MountainStage) {
  const spline = getMountainSpline(stage);
  const totalSplineLen = spline.getLength();

  // 1. Plane road at start (d <= 15m) and at summit finish (d >= 415m):
  // Strictly horizontal flat road!
  if (distance <= 15) {
    return { slopeDeg: 0, sinAlpha: 0, alpha: 0, radius: 999, turnDirection: 0, bankAngle: 0, bankDeg: 0 };
  }
  if (distance >= 415) {
    return { slopeDeg: 0, sinAlpha: 0, alpha: 0, radius: 999, turnDirection: 0, bankAngle: 0, bankDeg: 0 };
  }

  const u = Math.max(0, Math.min(1, (distance + ROAD_PAD_LENGTH) / totalSplineLen));
  const tangent = spline.getTangentAt(u).normalize();
  let rawSinAlpha = Math.max(-0.95, Math.min(0.95, tangent.y));

  // Clean deadband to eliminate spline micro-ripples near zero:
  if (Math.abs(rawSinAlpha) < 0.015) {
    rawSinAlpha = 0;
  }

  const alpha = Math.asin(rawSinAlpha);
  const slopeDeg = (alpha * 180) / Math.PI;

  let radius = 999;
  if (u >= 0.58 && u <= 0.78) {
    radius = stage.hairpinRadius;
  }

  // Calculate road turn direction for centrifugal momentum and authentic curve banking
  const tangentAhead = spline.getTangentAt(Math.min(1, u + 0.012)).normalize();
  const upVec = new THREE.Vector3(0, 1, 0);
  const roadRight = new THREE.Vector3().crossVectors(upVec, tangent).normalize();
  const deltaT = new THREE.Vector3().subVectors(tangentAhead, tangent);
  const turnDirection = deltaT.dot(roadRight); // > 0 = turns right, < 0 = turns left

  const bankAngle = Math.max(-0.11, Math.min(0.11, turnDirection * 0.40));
  const bankDeg = (bankAngle * 180) / Math.PI;

  return { slopeDeg, sinAlpha: rawSinAlpha, alpha, radius, turnDirection, bankAngle, bankDeg };
}

interface MountainTruckState {
  currentRound: number;
  status: TruckSimulationStatus;
  distance: number;         // distance along road (meters, 0 = start archway)
  velocity: number;         // speed along road (m/s, positive = forward, negative = backward)
  acceleration: number;     // m/s²
  throttle: number;         // 0 to 1
  brake: number;            // 0 to 1
  currentSlopeDeg: number;  // degrees (positive = uphill, negative = downhill)
  currentRadius: number;
  currentBankDeg: number;    // meters
  lateralG: number;         // centripetal acceleration / g
  tractionUsed: number;     // ratio of drive force to max static friction (0 to 1+)
  lateralOffset: number;    // meters offset from centerline
  isRollingBack: boolean;   // true when rolling or sliding backward down incline
  isSliding: boolean;       // true when tires are skidding on slope
  isTireSpinning: boolean;  // true when excessive gas spins tires on wet/ice
  isLateralSkidding: boolean;// true when cornering speed breaks lateral friction
  rollbackDistance: number; // accumulated distance rolled backward
  cargoShiftZ: number;      // meters shifted along flatbed (starts at 0, negative = sliding toward tailgate)
  cargoShiftX: number;      // meters shifted laterally (from centrifugal force)
  cargoStability: number;   // 0 to 100% stability rating
  isCargoLost: boolean;     // true if timber logs have fallen off the truck
  cargoDropDirection: CargoDropDirection; // direction logs spilled following momentum
  cargoFallProgress: number;// 0 to 1 tumbling animation progress
  elapsedTime: number;
  score: number;
  stars: number;
  crashReason: string | null;

  // Actions
  setThrottle: (val: number) => void;
  setBrake: (val: number) => void;
  startEngine: () => void;
  resetSimulation: () => void;
  nextRound: () => void;
  tick: (dt: number) => void;
}

export const useMountainTruckStore = create<MountainTruckState>((set, get) => ({
  currentRound: 1,
  status: "idle",
  distance: 0,
  velocity: 0,
  acceleration: 0,
  throttle: 0,
  brake: 0,
  currentSlopeDeg: 0,
  currentRadius: 999,
  currentBankDeg: 0,
  lateralG: 0,
  tractionUsed: 0,
  lateralOffset: 0,
  isRollingBack: false,
  isSliding: false,
  isTireSpinning: false,
  isLateralSkidding: false,
  rollbackDistance: 0,
  cargoShiftZ: 0,
  cargoShiftX: 0,
  cargoStability: 100,
  isCargoLost: false,
  cargoDropDirection: "none",
  cargoFallProgress: 0,
  elapsedTime: 0,
  score: 0,
  stars: 0,
  crashReason: null,

  setThrottle: (val) => {
    const clamped = Math.max(0, Math.min(1, val));
    if (clamped > 0.05 && get().status === "idle") {
      get().startEngine();
    }
    set({ throttle: clamped });
  },

  setBrake: (val) => {
    set({ brake: Math.max(0, Math.min(1, val)) });
  },

  startEngine: () => {
    if (get().status === "idle") {
      challengeAudio.playLaunch();
      set({ status: "driving" });
    }
  },

  resetSimulation: () => {
    set({
      status: "idle",
      distance: 0,
      velocity: 0,
      acceleration: 0,
      throttle: 0,
      brake: 0,
      currentSlopeDeg: 0,
      currentRadius: 999,
      lateralG: 0,
      tractionUsed: 0,
      lateralOffset: 0,
      isRollingBack: false,
      isSliding: false,
      isTireSpinning: false,
      isLateralSkidding: false,
      rollbackDistance: 0,
      cargoShiftZ: 0,
      cargoShiftX: 0,
      cargoStability: 100,
      isCargoLost: false,
      cargoDropDirection: "none",
      cargoFallProgress: 0,
      elapsedTime: 0,
      crashReason: null,
    });
  },

  nextRound: () => {
    const nextR = Math.min(3, get().currentRound + 1);
    set({
      currentRound: nextR,
      status: "idle",
      distance: 0,
      velocity: 0,
      acceleration: 0,
      throttle: 0,
      brake: 0,
      currentSlopeDeg: 0,
      currentRadius: 999,
      lateralG: 0,
      tractionUsed: 0,
      lateralOffset: 0,
      isRollingBack: false,
      isSliding: false,
      isTireSpinning: false,
      isLateralSkidding: false,
      rollbackDistance: 0,
      cargoShiftZ: 0,
      cargoShiftX: 0,
      cargoStability: 100,
      isCargoLost: false,
      cargoDropDirection: "none",
      cargoFallProgress: 0,
      elapsedTime: 0,
      crashReason: null,
    });
  },

  tick: (dt: number) => {
    const {
      status,
      distance,
      velocity,
      throttle,
      brake,
      currentRound,
      elapsedTime,
      lateralOffset,
      rollbackDistance,
    } = get();

    // Physics runs whenever the simulation is active (not crashed and not won)
    if (
      status === "won" ||
      status === "rollback_crash" ||
      status === "cliff_skid" ||
      status === "runaway_crash" ||
      status === "cargo_lost"
    ) {
      return;
    }

    const safeDt = Math.min(0.04, Math.max(0.001, dt));
    const stage = MOUNTAIN_STAGES[currentRound - 1];
    const m = stage.truckMass;
    const g = 9.8;

    const { slopeDeg, sinAlpha, alpha, radius, turnDirection, bankDeg } = getRoadProfile(distance, stage);

    // Normal force & Static friction grip threshold
    const N = m * g * Math.cos(alpha);
    const F_grip_max = stage.frictionMu * N; // Max static traction before tire slip
    const F_kinetic = 0.72 * stage.frictionMu * N; // Kinetic friction once tires slip/skid
    const f_roll = 0.015 * N; // rolling resistance (~574 N)

    // Component of gravity along the incline:
    // Positive sinAlpha (uphill) -> gravity pulls backwards (-mg sin alpha < 0)
    // Negative sinAlpha (downhill) -> gravity pulls forwards (+mg |sin alpha| > 0)
    // Flat road (sinAlpha == 0) -> gravity produces 0 force along road
    const F_gravity = -m * g * sinAlpha;

    // Applied throttle force:
    const F_engine_max = 34000; // 34 kN peak engine thrust
    const F_brake_max = 42000;  // 42 kN heavy air brake calipers

    let F_drive = throttle * F_engine_max;
    const tractionUsed = F_drive / Math.max(1, F_grip_max);
    let isTireSpinning = false;

    if (F_drive > F_grip_max) {
      // Burnout / tire spin: drops to kinetic friction
      F_drive = F_kinetic;
      isTireSpinning = true;
    }

    const F_brake_applied = brake * F_brake_max;

    // ─────────────────────────────────────────────────────────────
    // EXACT REAL-WORLD SLOPE MECHANICS:
    // 1. On plane road: unaffected by slope gravity (sits still if stopped).
    // 2. On up slope: gravity pulls backward (rolls backward if throttle is off).
    // 3. On down slope: gravity pushes forward (accelerates forward even with 0 throttle).
    // ─────────────────────────────────────────────────────────────
    let F_net = 0;
    let isRollingBack = false;
    let isSliding = false;
    let newRollbackDistance = rollbackDistance;

    if (velocity > 0.05) {
      // FORWARD MOTION (v > 0):
      const F_brake_eff = Math.min(F_brake_applied, F_grip_max);
      if (F_brake_applied > F_grip_max && brake > 0.6) {
        isSliding = true; // Brake skid
      }
      // F_net = F_drive - F_brake + F_gravity - f_roll
      F_net = F_drive - F_brake_eff + F_gravity - f_roll;
      newRollbackDistance = Math.max(0, rollbackDistance - velocity * safeDt * 0.5);
    } else if (velocity < -0.05) {
      // BACKWARD MOTION (v < 0, rolling or sliding backward down the slope):
      isRollingBack = true;
      newRollbackDistance += Math.abs(velocity) * safeDt;

      // When rolling backwards:
      // F_drive pushes forward (+F_drive)
      // Rolling resistance opposes backward motion (+f_roll)
      // Brakes oppose backward motion (+F_brake_eff)
      // Gravity pulls backward if uphill (F_gravity < 0)
      let F_brake_eff = 0;
      if (brake > 0.05) {
        if (Math.abs(F_gravity) > F_grip_max) {
          F_brake_eff = F_kinetic;
          isSliding = true;
        } else {
          F_brake_eff = Math.min(F_brake_applied, F_grip_max);
          isSliding = false;
        }
      }

      F_net = F_drive + F_brake_eff + F_gravity + f_roll;
    } else {
      // AT REST OR NEAR ZERO (|v| <= 0.05 m/s):
      // Unbalanced force trying to move the vehicle:
      const F_unbalanced = F_drive + F_gravity;

      // Holding threshold:
      // If brake is pressed: held up to brake * F_grip_max
      // If brake is 0: held by static rolling resistance only (f_roll * 1.1)
      const F_static_hold = Math.max(f_roll * 1.1, brake * F_grip_max);

      if (Math.abs(F_unbalanced) <= F_static_hold) {
        // Vehicle is held stationary by static friction!
        // On a flat plane road with 0 throttle, F_unbalanced = 0, so it remains stationary!
        F_net = 0;
        isRollingBack = false;
        isSliding = false;
      } else {
        // Static friction is broken!
        if (F_unbalanced < 0) {
          // Gravity is pulling backward on uphill slope:
          // TRUCK ROLLS BACKWARD!
          isRollingBack = true;
          const F_resist = brake > 0.05 ? F_kinetic : f_roll;
          F_net = F_unbalanced + F_resist; // negative net force -> backward acceleration
          isSliding = brake > 0.05;
        } else {
          // Either throttle drives forward, OR gravity pushes downhill:
          // TRUCK ROLLS FORWARD DOWNHILL!
          const F_resist = brake > 0.05 ? F_kinetic : f_roll;
          F_net = F_unbalanced - F_resist; // positive net force -> forward acceleration
          isRollingBack = false;
          isSliding = false;
        }
      }
    }

    const a = F_net / m;
    let newVelocity = velocity + a * safeDt;

    // If rolling starts while idle, transition to driving
    let newStatus = status;
    if (status === "idle" && Math.abs(newVelocity) > 0.05) {
      newStatus = "driving";
    }

    // Distance update along road:
    // Allow rollback down to -17 meters (the rear of the start approach pad)
    let newDistance = Math.max(-17, distance + newVelocity * safeDt);
    if (newDistance <= -17 && newVelocity < 0) {
      newVelocity = 0;
    }
    const newTime = newStatus === "driving" ? elapsedTime + safeDt : elapsedTime;

    // ─────────────────────────────────────────────────────────────
    // CENTRIPETAL DYNAMICS AT HAIRPIN CURVE
    // ─────────────────────────────────────────────────────────────
    const lateralG = radius < 200 ? (newVelocity * newVelocity / radius) / g : 0;
    const v_safe = Math.sqrt(stage.frictionMu * radius * g);
    let newLateralOffset = lateralOffset;
    let isLateralSkidding = false;

    if (radius < 200) {
      if (Math.abs(newVelocity) > v_safe) {
        isLateralSkidding = true;
        const excessSpeed = Math.abs(newVelocity) - v_safe;
        newLateralOffset += excessSpeed * 1.6 * safeDt;
      } else {
        newLateralOffset = THREE_LERP(newLateralOffset, 0, safeDt * 2.5);
      }
    } else {
      newLateralOffset = THREE_LERP(newLateralOffset, 0, safeDt * 4.0);
    }

    // ─────────────────────────────────────────────────────────────
    // TIMBER LOG CARGO DYNAMICS & RETENTION PHYSICS
    // ─────────────────────────────────────────────────────────────
    const m_cargo = 3000; // 3,000 kg timber tree trunk bundle
    // Forces along truck bed (longitudinal axis):
    // 1. Incline gravity component: pulls logs backward on uphills
    const F_cargo_grav = -m_cargo * g * sinAlpha;
    // 2. Inertial reaction force from truck acceleration (F = -m * a)
    // Accelerating forward (a > 0) pulls logs backward (-m * a)
    // Braking (a < 0) pushes logs forward (+m * |a|)
    const F_cargo_inertial = -m_cargo * a;
    const F_cargo_slide = F_cargo_grav + F_cargo_inertial;

    // Normal force and static friction retention threshold:
    const N_cargo = m_cargo * g * Math.cos(alpha);
    const mu_wood = 0.40;
    const strapTension = 3500; // 3.5 kN strap preload clamp
    const F_cargo_hold = mu_wood * N_cargo + strapTension;

    let newCargoShiftZ = get().cargoShiftZ;
    let newCargoShiftX = get().cargoShiftX;
    let isCargoLost = get().isCargoLost;
    let newCargoFallProgress = get().cargoFallProgress;

    if (!isCargoLost) {
      if (Math.abs(F_cargo_slide) > F_cargo_hold) {
        // Friction broken! Logs slip along flatbed:
        const excessForce = Math.abs(F_cargo_slide) - F_cargo_hold;
        const slipDir = Math.sign(F_cargo_slide); // negative = sliding toward tailgate
        const slipVel = (excessForce / m_cargo) * 0.35; // sliding speed (m/s)
        newCargoShiftZ += slipDir * slipVel * safeDt;
      }

      // Front steel bulkhead / headache rack stops forward slip past +0.15m:
      newCargoShiftZ = Math.min(0.15, newCargoShiftZ);

      // Centrifugal lateral force on hairpin curves:
      const F_cargo_lat = m_cargo * Math.abs(lateralG) * g;
      const F_stake_hold = 8500; // 8.5 kN lateral retention from side stanchions
      if (F_cargo_lat > F_stake_hold) {
        const latExcess = (F_cargo_lat - F_stake_hold) / m_cargo;
        newCargoShiftX += (lateralOffset > 0 ? 1 : -1) * latExcess * 0.4 * safeDt;
      } else {
        newCargoShiftX = THREE_LERP(newCargoShiftX, 0, safeDt * 1.5);
      }

      // Cargo Stability percentage:
      const longitudinalMargin = Math.max(0, 1 - Math.abs(Math.min(0, newCargoShiftZ)) / 1.15);
      const lateralMargin = Math.max(0, 1 - Math.abs(newCargoShiftX) / 0.85);
      const cargoStability = Math.round(Math.min(longitudinalMargin, lateralMargin) * 100);

      // ─────────────────────────────────────────────────────────────
      // CARGO LOST / MISSION FAIL CHECK:
      // Slid off rear of bed (shift <= -1.15m) OR spilled over side stakes (shiftX >= 0.85m)
      // ─────────────────────────────────────────────────────────────
      if (newCargoShiftZ <= -1.15 || Math.abs(newCargoShiftX) >= 0.85) {
        challengeAudio.playCrashImpact();
        set({
          status: "cargo_lost",
          velocity: newVelocity * 0.6,
          acceleration: a,
          distance: newDistance,
          currentSlopeDeg: slopeDeg,
          currentRadius: radius,
          lateralG,
          tractionUsed,
          lateralOffset: newLateralOffset,
          isRollingBack,
          isSliding: true,
          cargoShiftZ: newCargoShiftZ,
          cargoShiftX: newCargoShiftX,
          cargoStability: 0,
          isCargoLost: true,
          cargoDropDirection: "rear",
          crashReason: `MISSION FAILED: TIMBER CARGO LOST! Excessive slope gravity (F_g = ${(Math.abs(F_cargo_grav) / 1000).toFixed(1)} kN) and acceleration broke log tie-down friction! The heavy tree logs slipped off the flatbed and crashed down the mountain!`,
        });
        return;
      }

      set({
        cargoShiftZ: newCargoShiftZ,
        cargoShiftX: newCargoShiftX,
        cargoStability,
      });
    } else {
      newCargoFallProgress = Math.min(1, newCargoFallProgress + safeDt * 1.5);
      set({ cargoFallProgress: newCargoFallProgress });
    }

    // ─────────────────────────────────────────────────────────────
    // HAZARD & CRASH CHECKS
    // ─────────────────────────────────────────────────────────────
    // 1. Rollback Disaster:
    // Fast rollback speed (v < -6.5 m/s) OR sliding past start pad cliff edge (distance <= -15.5m)
    if ((newVelocity < -6.5 && slopeDeg > 3) || (newDistance <= -15.5 && isRollingBack)) {
      challengeAudio.playCrashImpact();
      set({
        status: "rollback_crash",
        velocity: newVelocity,
        acceleration: a,
        distance: newDistance,
        currentSlopeDeg: slopeDeg,
        currentRadius: radius,
        lateralG,
        tractionUsed,
        lateralOffset: newLateralOffset,
        isRollingBack: true,
        isSliding: true,
        isCargoLost: true,
        cargoStability: 0,
        crashReason: `ROLLBACK DISASTER! On a +${slopeDeg.toFixed(0)}° uphill incline, gravity pulled backwards with ${(Math.abs(F_gravity) / 1000).toFixed(1)} kN. Insufficient throttle caused the truck to slide backwards down the mountain!`,
      });
      return;
    }

    // ─────────────────────────────────────────────────────────────
    // MOMENTUM-BASED CARGO SPILL & HAZARDS
    // ─────────────────────────────────────────────────────────────
    // 1. Excessive Speed in Turn (Momentum spills logs to the opposite side!)
    // If truck turns left -> momentum throws logs to the RIGHT
    // If truck turns right -> momentum throws logs to the LEFT
    if (radius < 100 && Math.abs(newVelocity) > v_safe * 1.05) {
      challengeAudio.playCrashImpact();
      // turnDirection < 0 -> curve turns left -> cargo momentum flings logs RIGHT!
      // turnDirection > 0 -> curve turns right -> cargo momentum flings logs LEFT!
      const isTurningLeft = turnDirection < -0.01;
      const spillDir: CargoDropDirection = isTurningLeft ? "right" : "left";

      set({
        status: "cargo_lost",
        velocity: newVelocity * 0.6,
        acceleration: a,
        distance: newDistance,
        currentSlopeDeg: slopeDeg,
        currentRadius: radius,
        lateralG,
        tractionUsed,
        lateralOffset: newLateralOffset,
        isCargoLost: true,
        cargoDropDirection: spillDir,
        cargoStability: 0,
        isLateralSkidding: true,
        crashReason: isTurningLeft
          ? `MISSION FAILED: SHARP LEFT TURN AT HIGH SPEED! Entered turn at ${(Math.abs(newVelocity) * 3.6).toFixed(0)} km/h (Safe limit: ${(v_safe * 3.6).toFixed(0)} km/h). Centrifugal momentum flung top timber logs off the RIGHT side of the truck!`
          : `MISSION FAILED: SHARP RIGHT TURN AT HIGH SPEED! Entered turn at ${(Math.abs(newVelocity) * 3.6).toFixed(0)} km/h (Safe limit: ${(v_safe * 3.6).toFixed(0)} km/h). Centrifugal momentum flung top timber logs off the LEFT side of the truck!`,
      });
      return;
    }

    // 2. Excessive Downhill Speed (Momentum snaps tie-downs, logs tumble off rear)
    if (newVelocity > 30 && slopeDeg < -3) {
      challengeAudio.playCrashImpact();
      set({
        status: "cargo_lost",
        velocity: newVelocity,
        acceleration: a,
        distance: newDistance,
        currentSlopeDeg: slopeDeg,
        currentRadius: radius,
        lateralG,
        tractionUsed,
        lateralOffset: newLateralOffset,
        isCargoLost: true,
        cargoDropDirection: "rear",
        cargoStability: 0,
        crashReason: `MISSION FAILED: EXCESSIVE DOWNHILL SPEED! Reached ${(newVelocity * 3.6).toFixed(0)} km/h down steep descent. High-speed inertial vibration snapped cargo straps, spilling timber logs down the mountain!`,
      });
      return;
    }

    // 3. Rollback Disaster:
    if ((newVelocity < -6.5 && slopeDeg > 3) || (newDistance <= -15.5 && isRollingBack)) {
      challengeAudio.playCrashImpact();
      set({
        status: "rollback_crash",
        velocity: newVelocity,
        acceleration: a,
        distance: newDistance,
        currentSlopeDeg: slopeDeg,
        currentRadius: radius,
        lateralG,
        tractionUsed,
        lateralOffset: newLateralOffset,
        isRollingBack: true,
        isSliding: true,
        isCargoLost: true,
        cargoDropDirection: "rear",
        cargoStability: 0,
        crashReason: `ROLLBACK DISASTER! On a +${slopeDeg.toFixed(0)}° uphill incline, gravity pulled backwards with ${(Math.abs(F_gravity) / 1000).toFixed(1)} kN. Insufficient throttle caused the truck to slide backwards down the mountain!`,
      });
      return;
    }

    // 4. Cliff Hairpin Skid:
    if (radius < 100 && (newLateralOffset > 2.8 || Math.abs(newVelocity) > v_safe * 1.35)) {
      challengeAudio.playCrashImpact();
      const isTurningLeft = turnDirection < -0.01;
      set({
        status: "cliff_skid",
        velocity: newVelocity,
        acceleration: a,
        distance: newDistance,
        currentSlopeDeg: slopeDeg,
        currentRadius: radius,
        lateralG,
        tractionUsed,
        lateralOffset: Math.max(3.0, newLateralOffset),
        isLateralSkidding: true,
        isCargoLost: true,
        cargoDropDirection: isTurningLeft ? "right" : "left",
        cargoStability: 0,
        crashReason: `CLIFF SKID! Entered hairpin curve (R = ${radius} m) at ${(newVelocity * 3.6).toFixed(0)} km/h exceeding safe limit (${(v_safe * 3.6).toFixed(0)} km/h), breaking tire grip and flinging truck and cargo off the cliff edge!`,
      });
      return;
    }

    // 5. Downhill Runaway:
    if (newVelocity > 35 && slopeDeg < -3) {
      challengeAudio.playCrashImpact();
      set({
        status: "runaway_crash",
        velocity: newVelocity,
        acceleration: a,
        distance: newDistance,
        currentSlopeDeg: slopeDeg,
        currentRadius: radius,
        lateralG,
        tractionUsed,
        lateralOffset: newLateralOffset,
        isCargoLost: true,
        cargoDropDirection: "rear",
        cargoStability: 0,
        crashReason: `RUNAWAY DESCENT! Downhill gravity accelerated the truck to ${(newVelocity * 3.6).toFixed(0)} km/h without adequate braking, leading to a fatal jackknife crash!`,
      });
      return;
    }
    // ─────────────────────────────────────────────────────────────
    // WIN CHECK: REACHED SUMMIT OUTPOST!
    // ─────────────────────────────────────────────────────────────
    if (newDistance >= stage.totalLength) {
      challengeAudio.playSuccessFanfare();
      let starsEarned = 1;
      let roundScore = 500;

      if (newTime <= stage.targetTime * 1.25) {
        starsEarned = 2;
        roundScore = 800;
      }
      if (newTime <= stage.targetTime) {
        starsEarned = 3;
        roundScore = 1400;
      }

      set({
        status: "won",
        distance: stage.totalLength,
        velocity: 0,
        acceleration: 0,
        currentSlopeDeg: 0,
        currentRadius: radius,
        lateralG: 0,
        tractionUsed: 0,
        lateralOffset: 0,
        isRollingBack: false,
        isSliding: false,
        isTireSpinning: false,
        isLateralSkidding: false,
        elapsedTime: newTime,
        stars: starsEarned,
        score: get().score + roundScore,
      });
      return;
    }

    set({
      status: newStatus,
      distance: newDistance,
      velocity: newVelocity,
      acceleration: a,
      currentSlopeDeg: slopeDeg,
      currentRadius: radius,
      lateralG,
      tractionUsed,
      lateralOffset: newLateralOffset,
      isRollingBack,
      isSliding,
      isTireSpinning,
      isLateralSkidding,
      rollbackDistance: newRollbackDistance,
      elapsedTime: newTime,
    });
  },
}));

function THREE_LERP(start: number, end: number, t: number) {
  return start + (end - start) * Math.min(1, Math.max(0, t));
}
