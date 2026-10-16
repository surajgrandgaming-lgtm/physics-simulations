"use client";

import { create } from "zustand";
import { challengeAudio } from "@/lib/audio/challengeAudio";

export interface MountainSummitStage {
  round: number;
  title: string;
  subtitle: string;
  summitElevation: number; // Height of cannon peak terrace in meters (H0)
  slopeAngleDeg: number; // Downhill slope incline angle beta (degrees)
  slopeStartDistance: number; // X where descent begins (meters)
  targetDistance: number; // X distance to enemy wooden base (meters)
  targetTolerance: number; // Allowed hit radius (m)
  gravity: number; // m/s^2 (typically 9.8)
  defaultAngleDeg: number;
  defaultSpeed: number;
  windSpeedX: number; // Crosswind along X axis (m/s)
  description: string;
}

export const MOUNTAIN_SUMMIT_STAGES: MountainSummitStage[] = [
  {
    round: 1,
    title: "Alpine Outpost Descent",
    subtitle: "Downhill Incline 18\u00B0 \u2022 Drop from 55m Summit",
    summitElevation: 55,
    slopeAngleDeg: 18,
    slopeStartDistance: 10,
    targetDistance: 195,
    targetTolerance: 6.5,
    gravity: 9.8,
    defaultAngleDeg: 35,
    defaultSpeed: 38,
    windSpeedX: 0,
    description: "Launch downhill from the 55m mountain summit terrace to bombard the enemy wooden base sitting on the 18\u00B0 alpine incline.",
  },
  {
    round: 2,
    title: "Steep Crag Citadel",
    subtitle: "Steep Slope 26\u00B0 \u2022 Drop from 80m Peak",
    summitElevation: 80,
    slopeAngleDeg: 26,
    slopeStartDistance: 10,
    targetDistance: 225,
    targetTolerance: 6.5,
    gravity: 9.8,
    defaultAngleDeg: 32,
    defaultSpeed: 44,
    windSpeedX: 0,
    description: "The mountain face falls away at a steep 26\u00B0 angle. Exploit downhill incline kinematics (best angle: 45\u00B0 - \u03B2/2) to reach the distant fortress.",
  },
  {
    round: 3,
    title: "Abyss Chasm Fortress",
    subtitle: "Extreme Incline 32\u00B0 \u2022 105m Summit Drop with Updraft",
    summitElevation: 105,
    slopeAngleDeg: 32,
    slopeStartDistance: 10,
    targetDistance: 260,
    targetTolerance: 7.0,
    gravity: 9.8,
    defaultAngleDeg: 29,
    defaultSpeed: 50,
    windSpeedX: -2.0, // Mountain headwind resisting downhill flight
    description: "A dramatic 105m vertical chasm with a 32\u00B0 slope face and mountain headwind. Calculate the downhill ballistic arc to crush the enemy fortress!",
  },
];

export interface ShatterPiece {
  id: number;
  pos: [number, number, number];
  rot: [number, number, number];
  vel: [number, number, number];
  rotVel: [number, number, number];
  size: [number, number, number];
  color: string;
}

export interface MountainSummitState {
  currentRound: number;
  stageConfig: MountainSummitStage;

  // Camera transition lifecycle
  isMissionStarted: boolean;
  missionStartedAt: number | null;
  startMission: () => void;

  // Cannon parameters
  launchAngleDeg: number;
  muzzleVelocity: number;

  // Ballistic Simulation State
  isFired: boolean;
  isFlying: boolean;
  isLanded: boolean;
  hitResult: "none" | "hit" | "miss-short" | "miss-long";
  flightTime: number;
  ballPos: { x: number; y: number; z: number };
  ballVelocity: { x: number; y: number; z: number };
  missDistance: number;
  maxAltitudeReached: number;

  // Visual/Animation flags & destruction
  cannonRecoil: number; // 0 to 1
  muzzleFlash: boolean;
  structureCollapsed: boolean;
  isDestructionActive: boolean;
  destructionElapsed: number;
  isImpactActive: boolean;
  impactElapsed: number;
  shatterPieces: ShatterPiece[];
  impactPos: [number, number, number] | null;

  // Scoring
  score: number;
  stars: number;

  // Actions
  setLaunchAngle: (angle: number) => void;
  adjustLaunchAngle: (delta: number) => void;
  setMuzzleVelocity: (vel: number) => void;
  adjustMuzzleVelocity: (delta: number) => void;
  fireCannon: () => void;
  resetShot: () => void;
  nextRound: () => void;
  tickFlight: (dt: number) => void;
}

// Function to calculate terrain elevation at horizontal distance x
export function getTerrainElevationAt(x: number, stage: MountainSummitStage): number {
  if (x <= stage.slopeStartDistance) {
    return stage.summitElevation;
  }
  const rad = (stage.slopeAngleDeg * Math.PI) / 180;
  const slopeY = stage.summitElevation - (x - stage.slopeStartDistance) * Math.tan(rad);
  return Math.max(0, slopeY);
}

// Calculate target base Y on the inclined slope
export function getTargetBaseY(stage: MountainSummitStage): number {
  return getTerrainElevationAt(stage.targetDistance, stage);
}

// Create shatter pieces for full downhill tumbling destruction
function generateShatterPieces(targetX: number, targetY: number, slopeDeg: number): ShatterPiece[] {
  const pieces: ShatterPiece[] = [];
  let id = 0;
  const slopeRad = (slopeDeg * Math.PI) / 180;
  // Natural downhill momentum bias along slope
  const downhillVx = Math.cos(slopeRad) * 7;
  const downhillVy = -Math.sin(slopeRad) * 4.5;

  // 1. Central tent timber mast pole (3 segments snapping and toppling downhill)
  for (let s = 0; s < 3; s++) {
    pieces.push({
      id: id++,
      pos: [targetX + (s - 1) * 0.4, targetY + 2.5 + s * 2.5, 0],
      rot: [0, 0, -slopeRad - 0.2 * s],
      vel: [downhillVx + (Math.random() - 0.1) * 12 + 6, 8 + Math.random() * 6, (Math.random() - 0.5) * 8],
      rotVel: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10],
      size: [0.35, 2.8, 0.35],
      color: "#78350f",
    });
  }

  // 2. Tent Canvas Fabric Panels (12 panels ripping and tumbling down the slope)
  const canvasColors = ["#b91c1c", "#991b1b", "#d97706", "#dc2626", "#f59e0b", "#7f1d1d"];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const rx = Math.cos(angle) * 3.2;
    const rz = Math.sin(angle) * 3.2;
    pieces.push({
      id: id++,
      pos: [targetX + rx, targetY + 3.0 + (i % 3) * 1.5, rz],
      rot: [Math.random() * 2, Math.random() * 2, -slopeRad + (Math.random() - 0.5)],
      vel: [downhillVx + (Math.random() - 0.1) * 18 + 8, 10 + Math.random() * 10, (Math.random() - 0.5) * 14],
      rotVel: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14],
      size: [2.2, 0.15, 2.2],
      color: canvasColors[i % canvasColors.length],
    });
  }

  // 3. Explosive TNT barrels (Violent high-energy blast launching down the valley!)
  pieces.push({
    id: id++,
    pos: [targetX - 2.8, targetY + 1.2, 1.8],
    rot: [0, 0.4, 0],
    vel: [downhillVx + (Math.random() - 0.1) * 30 + 18, 22 + Math.random() * 12, (Math.random() - 0.5) * 22],
    rotVel: [(Math.random() - 0.5) * 24, (Math.random() - 0.5) * 24, (Math.random() - 0.5) * 24],
    size: [1.6, 1.6, 1.6],
    color: "#dc2626", // Red TNT
  });
  pieces.push({
    id: id++,
    pos: [targetX - 1.8, targetY + 1.2, 2.4],
    rot: [0, -0.3, 0],
    vel: [downhillVx + (Math.random() - 0.1) * 28 + 16, 20 + Math.random() * 10, (Math.random() - 0.5) * 20],
    rotVel: [(Math.random() - 0.5) * 22, (Math.random() - 0.5) * 22, (Math.random() - 0.5) * 22],
    size: [1.6, 1.6, 1.6],
    color: "#dc2626", // Red TNT
  });

  // 4. Wooden Supply Crates & Weapon Rack
  for (let c = 0; c < 4; c++) {
    pieces.push({
      id: id++,
      pos: [targetX + 2.5 + (c % 2) * 1.5, targetY + 0.8 + Math.floor(c / 2) * 1.4, -1.5 + (c % 2) * 1.2],
      rot: [0, 0, -slopeRad],
      vel: [downhillVx + (Math.random() - 0.1) * 16 + 8, 12 + Math.random() * 8, (Math.random() - 0.5) * 12],
      rotVel: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12],
      size: [1.5, 1.3, 1.5],
      color: c % 2 === 0 ? "#92400e" : "#b45309",
    });
  }

  // 5. Campsite Cobble Stones & Palisade Stakes
  for (let i = 0; i < 6; i++) {
    pieces.push({
      id: id++,
      pos: [targetX + (i - 2.5) * 1.8, targetY + 0.5, (Math.random() - 0.5) * 6],
      rot: [0, 0, -slopeRad],
      vel: [downhillVx + (Math.random() - 0.2) * 10 + 4, 6 + Math.random() * 6, (Math.random() - 0.5) * 10],
      rotVel: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8],
      size: [1.2, 0.8, 1.2],
      color: "#64748b",
    });
  }

  // 6. Fluttering Golden Battle Pennant
  pieces.push({
    id: id++,
    pos: [targetX + 1.0, targetY + 8.2, 0],
    rot: [0, 0, -0.5],
    vel: [downhillVx + 14, 15 + Math.random() * 8, (Math.random() - 0.5) * 12],
    rotVel: [(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16],
    size: [2.4, 1.2, 0.1],
    color: "#f59e0b",
  });

  return pieces;
}

export const CANNON_PIVOT_X = 0;
export const CANNON_PIVOT_HEIGHT_ABOVE_TERRACE = 3.2;

export const useMountainSummitStore = create<MountainSummitState>()((set, get) => {
  const initialStage = MOUNTAIN_SUMMIT_STAGES[0];
  const initialCannonY = initialStage.summitElevation + CANNON_PIVOT_HEIGHT_ABOVE_TERRACE;

  return {
    currentRound: 1,
    stageConfig: initialStage,

    isMissionStarted: false,
    missionStartedAt: null,

    launchAngleDeg: initialStage.defaultAngleDeg,
    muzzleVelocity: initialStage.defaultSpeed,

    isFired: false,
    isFlying: false,
    isLanded: false,
    hitResult: "none",
    flightTime: 0,
    ballPos: { x: CANNON_PIVOT_X, y: initialCannonY, z: 0 },
    ballVelocity: { x: 0, y: 0, z: 0 },
    missDistance: 0,
    maxAltitudeReached: initialCannonY,

    cannonRecoil: 0,
    muzzleFlash: false,
    structureCollapsed: false,
    isDestructionActive: false,
    destructionElapsed: 0,
    isImpactActive: false,
    impactElapsed: 0,
    shatterPieces: [],
    impactPos: null,

    score: 0,
    stars: 0,

    startMission: () => {
      set({
        isMissionStarted: true,
        missionStartedAt: performance.now(),
      });
    },

    setLaunchAngle: (angle: number) => {
      if (get().isFlying || get().isDestructionActive) return;
      const clamped = Math.max(10, Math.min(65, Math.round(angle * 10) / 10));
      set({ launchAngleDeg: clamped });
    },

    adjustLaunchAngle: (delta: number) => {
      if (get().isFlying || get().isDestructionActive) return;
      const current = get().launchAngleDeg;
      const next = Math.max(10, Math.min(65, Math.round((current + delta) * 10) / 10));
      set({ launchAngleDeg: next });
      challengeAudio.playClick();
    },

    setMuzzleVelocity: (vel: number) => {
      if (get().isFlying || get().isDestructionActive) return;
      const clamped = Math.max(20, Math.min(75, Math.round(vel * 10) / 10));
      set({ muzzleVelocity: clamped });
    },

    adjustMuzzleVelocity: (delta: number) => {
      if (get().isFlying || get().isDestructionActive) return;
      const current = get().muzzleVelocity;
      const next = Math.max(20, Math.min(75, Math.round((current + delta) * 10) / 10));
      set({ muzzleVelocity: next });
      challengeAudio.playClick();
    },

    fireCannon: () => {
      const s = get();
      if (s.isFlying || s.isDestructionActive) return;

      challengeAudio.playLaunch();

      const rad = (s.launchAngleDeg * Math.PI) / 180;
      const vx = s.muzzleVelocity * Math.cos(rad);
      const vy = s.muzzleVelocity * Math.sin(rad);

      const cannonY = s.stageConfig.summitElevation + CANNON_PIVOT_HEIGHT_ABOVE_TERRACE;
      const barrelLen = 4.2;
      const startX = CANNON_PIVOT_X + barrelLen * Math.cos(rad);
      const startY = cannonY + barrelLen * Math.sin(rad);

      set({
        isFired: true,
        isFlying: true,
        isLanded: false,
        hitResult: "none",
        flightTime: 0,
        ballPos: { x: startX, y: startY, z: 0 },
        ballVelocity: { x: vx, y: vy, z: 0 },
        maxAltitudeReached: startY,
        cannonRecoil: 1.0,
        muzzleFlash: true,
        structureCollapsed: false,
        isDestructionActive: false,
        destructionElapsed: 0,
        isImpactActive: false,
        impactElapsed: 0,
        shatterPieces: [],
        impactPos: null,
      });

      setTimeout(() => {
        set({ muzzleFlash: false });
      }, 120);
    },

    resetShot: () => {
      const s = get();
      const cannonY = s.stageConfig.summitElevation + CANNON_PIVOT_HEIGHT_ABOVE_TERRACE;
      set({
        isFired: false,
        isFlying: false,
        isLanded: false,
        hitResult: "none",
        flightTime: 0,
        ballPos: { x: CANNON_PIVOT_X, y: cannonY, z: 0 },
        ballVelocity: { x: 0, y: 0, z: 0 },
        cannonRecoil: 0,
        muzzleFlash: false,
        structureCollapsed: false,
        isDestructionActive: false,
        destructionElapsed: 0,
        isImpactActive: false,
        impactElapsed: 0,
        shatterPieces: [],
        impactPos: null,
      });
    },

    nextRound: () => {
      const s = get();
      const nextR = (s.currentRound % MOUNTAIN_SUMMIT_STAGES.length) + 1;
      const nextStage = MOUNTAIN_SUMMIT_STAGES[nextR - 1];
      const cannonY = nextStage.summitElevation + CANNON_PIVOT_HEIGHT_ABOVE_TERRACE;

      set({
        currentRound: nextR,
        stageConfig: nextStage,
        launchAngleDeg: nextStage.defaultAngleDeg,
        muzzleVelocity: nextStage.defaultSpeed,
        isFired: false,
        isFlying: false,
        isLanded: false,
        hitResult: "none",
        flightTime: 0,
        ballPos: { x: CANNON_PIVOT_X, y: cannonY, z: 0 },
        ballVelocity: { x: 0, y: 0, z: 0 },
        cannonRecoil: 0,
        muzzleFlash: false,
        structureCollapsed: false,
        isDestructionActive: false,
        destructionElapsed: 0,
        isImpactActive: false,
        impactElapsed: 0,
        shatterPieces: [],
        impactPos: null,
        missionStartedAt: performance.now(),
      });
    },

    tickFlight: (dt: number) => {
      const s = get();

      // 1. Recoil damping
      if (s.cannonRecoil > 0) {
        set({ cannonRecoil: Math.max(0, s.cannonRecoil - dt * 2.8) });
      }

      // 2. Animate shattered structure pieces tumbling downhill along the slope
      if (s.structureCollapsed && s.shatterPieces.length > 0) {
        const slopeRad = (s.stageConfig.slopeAngleDeg * Math.PI) / 180;
        const slopeSlope = Math.tan(slopeRad);

        const updatedPieces = s.shatterPieces.map((p) => {
          const currentGroundY = getTerrainElevationAt(p.pos[0], s.stageConfig) + p.size[1] / 2;
          const newY = Math.max(currentGroundY, p.pos[1] + p.vel[1] * dt);
          const onGround = newY <= currentGroundY + 0.1;

          // Downhill gravity acceleration along slope when on ground!
          const downhillAcc = onGround ? Math.sin(slopeRad) * 14 : 0;
          const damp = onGround ? 0.78 : 0.99;

          const newVelY = onGround && Math.abs(p.vel[1]) < 0.6 ? -slopeSlope * p.vel[0] : p.vel[1] - 24 * dt;
          const newVelX = (p.vel[0] + downhillAcc * dt) * damp;
          const newVelZ = p.vel[2] * damp;

          return {
            ...p,
            pos: [p.pos[0] + newVelX * dt, newY, p.pos[2] + newVelZ * dt] as [number, number, number],
            rot: [
              p.rot[0] + p.rotVel[0] * dt * (onGround ? 0.35 : 1),
              p.rot[1] + p.rotVel[1] * dt * (onGround ? 0.35 : 1),
              p.rot[2] + p.rotVel[2] * dt * (onGround ? 0.35 : 1),
            ] as [number, number, number],
            vel: [newVelX, newVelY, newVelZ] as [number, number, number],
          };
        });
        set({ shatterPieces: updatedPieces });
      }

      // 3. Destruction animation timer (2.6s)
      if (s.isDestructionActive) {
        const newDestr = s.destructionElapsed + dt;
        if (newDestr >= 2.6) {
          set({
            isDestructionActive: false,
            isLanded: true,
          });
        } else {
          set({ destructionElapsed: newDestr });
        }
        return;
      }

      // 4. Non-hit impact animation timer (1.2s)
      if (s.isImpactActive) {
        const newImp = s.impactElapsed + dt;
        if (newImp >= 1.2) {
          set({
            isImpactActive: false,
            isLanded: true,
          });
        } else {
          set({ impactElapsed: newImp });
        }
        return;
      }

      // 5. Cannonball flight kinematics
      if (!s.isFlying) return;

      const g = s.stageConfig.gravity;
      const wind = s.stageConfig.windSpeedX;

      const newTime = s.flightTime + dt;
      const newVx = s.ballVelocity.x + (wind - s.ballVelocity.x * 0.005) * dt;
      const newVy = s.ballVelocity.y - g * dt;
      const newVz = s.ballVelocity.z;

      const newX = s.ballPos.x + newVx * dt;
      const newY = s.ballPos.y + newVy * dt;
      const newZ = s.ballPos.z + newVz * dt;

      const maxAlt = Math.max(s.maxAltitudeReached, newY);

      // Collision Detection with Downhill Terrain:
      const terrainY = getTerrainElevationAt(newX, s.stageConfig);

      if (newX > 5 && newY <= terrainY) {
        // Impact occurred on the mountain terrain!
        const targetX = s.stageConfig.targetDistance;
        const diffX = newX - targetX;
        const absDiff = Math.abs(diffX);
        const tolerance = s.stageConfig.targetTolerance;

        if (absDiff <= tolerance) {
          // DIRECT HIT on the enemy wooden fortress!
          challengeAudio.playCrashImpact();
          challengeAudio.playSuccessFanfare();

          const targetBaseY = getTargetBaseY(s.stageConfig);
          const pieces = generateShatterPieces(targetX, targetBaseY, s.stageConfig.slopeAngleDeg);

          const stageBonus = 350 + Math.max(0, Math.round(50 - absDiff * 8));

          set({
            isFlying: false,
            hitResult: "hit",
            structureCollapsed: true,
            isDestructionActive: true,
            destructionElapsed: 0,
            shatterPieces: pieces,
            missDistance: 0,
            impactPos: [newX, terrainY, newZ],
            flightTime: newTime,
            score: s.score + stageBonus,
            stars: Math.min(3, s.stars + 1),
            ballPos: { x: newX, y: terrainY, z: newZ },
          });
        } else if (newX < targetX - tolerance) {
          // FELL SHORT on the slope
          challengeAudio.playCrashImpact();
          set({
            isFlying: false,
            hitResult: "miss-short",
            missDistance: absDiff,
            isImpactActive: true,
            impactElapsed: 0,
            impactPos: [newX, terrainY, newZ],
            flightTime: newTime,
            ballPos: { x: newX, y: terrainY, z: newZ },
          });
        } else {
          // OVERSHOT down the slope
          challengeAudio.playCrashImpact();
          set({
            isFlying: false,
            hitResult: "miss-long",
            missDistance: absDiff,
            isImpactActive: true,
            impactElapsed: 0,
            impactPos: [newX, terrainY, newZ],
            flightTime: newTime,
            ballPos: { x: newX, y: terrainY, z: newZ },
          });
        }
        return;
      }

      // Update in-flight state
      set({
        flightTime: newTime,
        ballPos: { x: newX, y: newY, z: newZ },
        ballVelocity: { x: newVx, y: newVy, z: newVz },
        maxAltitudeReached: maxAlt,
      });
    },
  };
});
