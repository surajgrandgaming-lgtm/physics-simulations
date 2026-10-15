"use client";

import { create } from "zustand";
import { challengeAudio } from "@/lib/audio/challengeAudio";

export interface CastleSiegeStage {
  round: number;
  title: string;
  subtitle: string;
  mountainDistance: number; // X distance to mountain peak
  mountainPeakHeight: number; // Height of mountain peak in meters
  mountainWidth: number; // Half-width/spread of mountain base
  targetDistance: number; // X distance to enemy wooden stand
  targetElevation: number; // Y elevation of target base (0 = ground level)
  targetTolerance: number; // Allowed hit radius (m)
  gravity: number; // m/s^2 (typically 9.8)
  defaultAngleDeg: number;
  defaultSpeed: number;
  windSpeedX: number; // Crosswind along X axis (m/s)
  description: string;
}

export const CASTLE_SIEGE_STAGES: CastleSiegeStage[] = [
  {
    round: 1,
    title: "Valley Outpost",
    subtitle: "Arc Over Ridge • Clear 36m Mountain Peak",
    mountainDistance: 100,
    mountainPeakHeight: 36,
    mountainWidth: 45,
    targetDistance: 190,
    targetElevation: 0,
    targetTolerance: 6.5,
    gravity: 9.8,
    defaultAngleDeg: 55,
    defaultSpeed: 46,
    windSpeedX: 0,
    description: "Aim the siege cannon over the 36m mountain peak to bombard the enemy wooden stand tower in the valley.",
  },
  {
    round: 2,
    title: "High Crag Stronghold",
    subtitle: "Steep Summit • Clear 52m Tall Mountain",
    mountainDistance: 120,
    mountainPeakHeight: 52,
    mountainWidth: 55,
    targetDistance: 225,
    targetElevation: 0,
    targetTolerance: 6.5,
    gravity: 9.8,
    defaultAngleDeg: 62,
    defaultSpeed: 52,
    windSpeedX: 0,
    description: "A towering 52m mountain peak blocks direct line of sight. Use a steep high-arc lob shot to clear the peak and strike the wooden fortress.",
  },
  {
    round: 3,
    title: "Deep Ravine Citadel",
    subtitle: "Long Distance Siege • Clear 48m Ridge at 255m",
    mountainDistance: 130,
    mountainPeakHeight: 48,
    mountainWidth: 60,
    targetDistance: 255,
    targetElevation: -2,
    targetTolerance: 7.0,
    gravity: 9.8,
    defaultAngleDeg: 58,
    defaultSpeed: 56,
    windSpeedX: -2.0, // slight headwind
    description: "The enemy has retreated into a deep ravine with a 2 m/s headwind. Master the 2D projectile equations to bring down the final wooden citadel!",
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

export interface CastleSiegeState {
  currentRound: number;
  stageConfig: CastleSiegeStage;

  // Camera transition lifecycle (Topic 1 & 3 pattern)
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
  hitResult: "none" | "hit" | "mountain-hit" | "miss-short" | "miss-long";
  flightTime: number;
  ballPos: { x: number; y: number; z: number };
  ballVelocity: { x: number; y: number; z: number };
  missDistance: number;
  maxAltitudeReached: number;

  // Visual/Animation flags & destruction delay
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

// Function to calculate mountain elevation at horizontal distance x
export function getMountainHeightAt(x: number, stage: CastleSiegeStage): number {
  const dx = x - stage.mountainDistance;
  const halfW = stage.mountainWidth;
  if (Math.abs(dx) >= halfW) return 0;
  // Smooth bell-shaped mountain ridge with sub-crags
  const normalized = dx / halfW;
  const baseProfile = stage.mountainPeakHeight * Math.pow(Math.cos((normalized * Math.PI) / 2), 2);
  // Add rocky crag texture
  const crag = Math.sin(normalized * Math.PI * 4) * 2.2;
  return Math.max(0, baseProfile + crag);
}

// Create extensive shatter pieces for full Angry Birds destruction
function generateShatterPieces(targetX: number, targetY: number): ShatterPiece[] {
  const pieces: ShatterPiece[] = [];
  let id = 0;

  // 1. Foundation blocks (Stone and dark oak)
  for (let i = -1; i <= 1; i += 2) {
    pieces.push({
      id: id++,
      pos: [targetX + i * 3.5, targetY + 0.6, 0],
      rot: [0, 0, 0],
      vel: [(Math.random() - 0.4) * 8 + 2, 3 + Math.random() * 4, (Math.random() - 0.5) * 8],
      rotVel: [(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5],
      size: [2.4, 1.2, 4.4],
      color: "#64748b",
    });
  }

  // 2. Main vertical support oak timber pillars (split into 8 segments)
  const pillarX = [-3.5, 3.5];
  const pillarZ = [-1.6, 1.6];
  for (const px of pillarX) {
    for (const pz of pillarZ) {
      // Lower pillar segment
      pieces.push({
        id: id++,
        pos: [targetX + px, targetY + 3.0, pz],
        rot: [0, 0, 0],
        vel: [(Math.random() - 0.2) * 14 + 5, 8 + Math.random() * 8, (Math.random() - 0.5) * 12],
        rotVel: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10],
        size: [0.8, 3.0, 0.8],
        color: "#78350f",
      });
      // Upper pillar segment
      pieces.push({
        id: id++,
        pos: [targetX + px, targetY + 6.0, pz],
        rot: [0, 0, 0],
        vel: [(Math.random() - 0.2) * 16 + 6, 10 + Math.random() * 10, (Math.random() - 0.5) * 14],
        rotVel: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12],
        size: [0.8, 3.0, 0.8],
        color: "#92400e",
      });
    }
  }

  // 3. Diagonal Angry Birds X-Trusses (8 cross braces)
  for (const z of [-1.6, 1.6]) {
    for (const rotSign of [-1, 1]) {
      pieces.push({
        id: id++,
        pos: [targetX + (rotSign * 1.5), targetY + 4.5, z],
        rot: [0, 0, rotSign * 0.6],
        vel: [(Math.random() - 0.1) * 18 + 7, 12 + Math.random() * 8, (Math.random() - 0.5) * 10],
        rotVel: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14],
        size: [4.2, 0.45, 0.45],
        color: "#b45309",
      });
      pieces.push({
        id: id++,
        pos: [targetX - (rotSign * 1.5), targetY + 4.5, z],
        rot: [0, 0, -rotSign * 0.6],
        vel: [(Math.random() - 0.1) * 16 + 8, 11 + Math.random() * 9, (Math.random() - 0.5) * 10],
        rotVel: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14],
        size: [4.2, 0.45, 0.45],
        color: "#a16207",
      });
    }
  }

  // 4. Middle deck plank platform (broken into 4 planks)
  for (let p = -1.5; p <= 1.5; p += 1.0) {
    pieces.push({
      id: id++,
      pos: [targetX, targetY + 7.8, p],
      rot: [0, 0, 0],
      vel: [(Math.random() - 0.2) * 15 + 8, 12 + Math.random() * 8, (Math.random() - 0.5) * 10],
      rotVel: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10],
      size: [8.6, 0.65, 1.2],
      color: "#a16207",
    });
  }

  // 5. TNT Barrels / Crates resting on Middle Deck (Explosive high blast velocity!)
  pieces.push({
    id: id++,
    pos: [targetX - 1.2, targetY + 8.8, 0],
    rot: [0, 0.3, 0],
    vel: [(Math.random() - 0.1) * 26 + 14, 18 + Math.random() * 12, (Math.random() - 0.5) * 18],
    rotVel: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20],
    size: [1.7, 1.6, 1.7],
    color: "#dc2626", // Red TNT Barrel
  });
  pieces.push({
    id: id++,
    pos: [targetX + 1.4, targetY + 8.8, 0],
    rot: [0, -0.4, 0],
    vel: [(Math.random() - 0.1) * 24 + 12, 16 + Math.random() * 10, (Math.random() - 0.5) * 16],
    rotVel: [(Math.random() - 0.5) * 18, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 18],
    size: [1.6, 1.6, 1.6],
    color: "#d97706", // Amber Crate
  });

  // 6. Tier 2 Upper Wooden Scaffolding Tower (4 pillars)
  for (const px of [-1.8, 1.8]) {
    for (const pz of [-1.0, 1.0]) {
      pieces.push({
        id: id++,
        pos: [targetX + px, targetY + 11.5, pz],
        rot: [0, 0, 0],
        vel: [(Math.random() - 0.1) * 22 + 10, 16 + Math.random() * 10, (Math.random() - 0.5) * 14],
        rotVel: [(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16],
        size: [0.65, 5.2, 0.65],
        color: "#b45309",
      });
    }
  }

  // 7. Upper Cross Bracing & Top Platform
  pieces.push({
    id: id++,
    pos: [targetX, targetY + 11.5, 0],
    rot: [0, 0, 0.7],
    vel: [(Math.random() - 0.1) * 20 + 9, 14 + Math.random() * 8, (Math.random() - 0.5) * 12],
    rotVel: [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15],
    size: [4.8, 0.35, 0.35],
    color: "#78350f",
  });
  pieces.push({
    id: id++,
    pos: [targetX, targetY + 14.4, 0],
    rot: [0, 0, 0],
    vel: [(Math.random() - 0.1) * 22 + 12, 18 + Math.random() * 10, (Math.random() - 0.5) * 14],
    rotVel: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14],
    size: [5.2, 0.5, 3.4],
    color: "#92400e",
  });

  // 8. Top Golden Crown / Bell Target
  pieces.push({
    id: id++,
    pos: [targetX, targetY + 16.0, 0],
    rot: [0, 0, 0],
    vel: [(Math.random() - 0.1) * 26 + 14, 22 + Math.random() * 12, (Math.random() - 0.5) * 16],
    rotVel: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20],
    size: [1.2, 1.8, 1.2],
    color: "#fbbf24", // Golden Bell
  });

  return pieces;
}

const CANNON_MOUNT_X = 0;
const CANNON_MOUNT_Y = 3.2; // Elevation of cannon pivot on ledge
const CANNON_MOUNT_Z = 0;

export const useCastleSiegeStore = create<CastleSiegeState>()((set, get) => ({
  currentRound: 1,
  stageConfig: CASTLE_SIEGE_STAGES[0],

  isMissionStarted: false,
  missionStartedAt: null,

  launchAngleDeg: CASTLE_SIEGE_STAGES[0].defaultAngleDeg,
  muzzleVelocity: CASTLE_SIEGE_STAGES[0].defaultSpeed,

  isFired: false,
  isFlying: false,
  isLanded: false,
  hitResult: "none",
  flightTime: 0,
  ballPos: { x: CANNON_MOUNT_X, y: CANNON_MOUNT_Y, z: CANNON_MOUNT_Z },
  ballVelocity: { x: 0, y: 0, z: 0 },
  missDistance: 0,
  maxAltitudeReached: CANNON_MOUNT_Y,

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
    const clamped = Math.max(20, Math.min(80, Math.round(angle * 10) / 10));
    set({ launchAngleDeg: clamped });
  },

  adjustLaunchAngle: (delta: number) => {
    if (get().isFlying || get().isDestructionActive) return;
    const current = get().launchAngleDeg;
    const next = Math.max(20, Math.min(80, Math.round((current + delta) * 10) / 10));
    set({ launchAngleDeg: next });
    challengeAudio.playClick();
  },

  setMuzzleVelocity: (vel: number) => {
    if (get().isFlying || get().isDestructionActive) return;
    const clamped = Math.max(25, Math.min(80, Math.round(vel * 10) / 10));
    set({ muzzleVelocity: clamped });
  },

  adjustMuzzleVelocity: (delta: number) => {
    if (get().isFlying || get().isDestructionActive) return;
    const current = get().muzzleVelocity;
    const next = Math.max(25, Math.min(80, Math.round((current + delta) * 10) / 10));
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

    // Initial position from cannon muzzle (barrel length ~4.2m)
    const barrelLen = 4.2;
    const startX = CANNON_MOUNT_X + barrelLen * Math.cos(rad);
    const startY = CANNON_MOUNT_Y + barrelLen * Math.sin(rad);
    const startZ = CANNON_MOUNT_Z;

    set({
      isFired: true,
      isFlying: true,
      isLanded: false,
      hitResult: "none",
      flightTime: 0,
      ballPos: { x: startX, y: startY, z: startZ },
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

    // Reset muzzle flash after 120ms
    setTimeout(() => {
      set({ muzzleFlash: false });
    }, 120);
  },

  resetShot: () => {
    const s = get();
    set({
      isFired: false,
      isFlying: false,
      isLanded: false,
      hitResult: "none",
      flightTime: 0,
      ballPos: { x: CANNON_MOUNT_X, y: CANNON_MOUNT_Y, z: CANNON_MOUNT_Z },
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
    const nextR = (s.currentRound % CASTLE_SIEGE_STAGES.length) + 1;
    const nextStage = CASTLE_SIEGE_STAGES[nextR - 1];

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
      ballPos: { x: CANNON_MOUNT_X, y: CANNON_MOUNT_Y, z: CANNON_MOUNT_Z },
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
      missionStartedAt: performance.now(), // Trigger smooth camera transition for next stage!
    });
  },

  tickFlight: (dt: number) => {
    const s = get();

    // 1. Recoil damping
    if (s.cannonRecoil > 0) {
      set({ cannonRecoil: Math.max(0, s.cannonRecoil - dt * 2.8) });
    }

    // 2. Animate shattered structure pieces if collapsed
    if (s.structureCollapsed && s.shatterPieces.length > 0) {
      const updatedPieces = s.shatterPieces.map((p) => {
        const groundY = s.stageConfig.targetElevation + p.size[1] / 2;
        const newY = Math.max(groundY, p.pos[1] + p.vel[1] * dt);
        const onGround = newY <= groundY + 0.05;
        const damp = onGround ? 0.72 : 0.99;

        const newVelY = onGround && Math.abs(p.vel[1]) < 0.6 ? 0 : p.vel[1] - 24 * dt;
        const newVelX = p.vel[0] * damp;
        const newVelZ = p.vel[2] * damp;

        return {
          ...p,
          pos: [p.pos[0] + newVelX * dt, newY, p.pos[2] + newVelZ * dt] as [number, number, number],
          rot: [
            p.rot[0] + p.rotVel[0] * dt * (onGround ? 0.25 : 1),
            p.rot[1] + p.rotVel[1] * dt * (onGround ? 0.25 : 1),
            p.rot[2] + p.rotVel[2] * dt * (onGround ? 0.25 : 1),
          ] as [number, number, number],
          vel: [newVelX, newVelY, newVelZ] as [number, number, number],
        };
      });
      set({ shatterPieces: updatedPieces });
    }

    // 3. Destruction animation timer: let user watch the destruction unfold for 2.6s!
    if (s.isDestructionActive) {
      const newDestr = s.destructionElapsed + dt;
      if (newDestr >= 2.6) {
        // Full destruction sequence has played out — show victory modal now!
        set({
          isDestructionActive: false,
          isLanded: true,
        });
      } else {
        set({ destructionElapsed: newDestr });
      }
      return;
    }

    // 4. Non-hit impact animation timer (mountain or ground impact delay: 1.2s)
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

    // 5. Flight kinematics for Cannonball
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

    // Collision Detection:
    // A. Mountain collision:
    const mHeight = getMountainHeightAt(newX, s.stageConfig);
    if (mHeight > 0.5 && newY <= mHeight) {
      // Hit mountain cliff!
      challengeAudio.playCrashImpact();
      set({
        isFlying: false,
        isImpactActive: true,
        impactElapsed: 0,
        hitResult: "mountain-hit",
        flightTime: newTime,
        ballPos: { x: newX, y: mHeight, z: newZ },
        impactPos: [newX, mHeight, newZ],
        missDistance: Math.abs(newX - s.stageConfig.targetDistance),
        maxAltitudeReached: maxAlt,
      });
      return;
    }

    // B. Target structure hit (center at targetDistance, targetElevation):
    const targetX = s.stageConfig.targetDistance;
    const targetY = s.stageConfig.targetElevation;
    const towerTopY = targetY + 17.5;
    const inTowerBoundingBox =
      Math.abs(newX - targetX) <= s.stageConfig.targetTolerance &&
      newY <= towerTopY &&
      newY >= targetY &&
      Math.abs(newZ) <= 4.0;

    if (inTowerBoundingBox) {
      // DIRECT HIT ON ENEMY WOODEN STAND!
      challengeAudio.playCrashImpact();
      challengeAudio.playSuccessFanfare();
      const pieces = generateShatterPieces(targetX, targetY);

      const deltaX = Math.abs(newX - targetX);
      const earnedStars = deltaX <= 2.5 ? 3 : deltaX <= 4.5 ? 2 : 1;
      const roundScore = earnedStars * 150 + 100;

      // START DESTRUCTION ANIMATION - DO NOT SHOW VICTORY MODAL YET!
      set({
        isFlying: false,
        isDestructionActive: true,
        destructionElapsed: 0,
        isLanded: false, // Remains false so modal does not hide the explosion & destruction!
        hitResult: "hit",
        flightTime: newTime,
        ballPos: { x: newX, y: newY, z: newZ },
        impactPos: [newX, newY, newZ],
        missDistance: deltaX,
        maxAltitudeReached: maxAlt,
        structureCollapsed: true,
        shatterPieces: pieces,
        stars: Math.max(s.stars, earnedStars),
        score: s.score + roundScore,
      });
      return;
    }

    // C. Ground impact beyond or before target:
    const groundLevel = newX > s.stageConfig.mountainDistance ? s.stageConfig.targetElevation : 0;
    if (newY <= groundLevel) {
      challengeAudio.playCrashImpact();
      const deltaX = newX - targetX;
      const isShort = deltaX < 0;

      set({
        isFlying: false,
        isImpactActive: true,
        impactElapsed: 0,
        hitResult: isShort ? "miss-short" : "miss-long",
        flightTime: newTime,
        ballPos: { x: newX, y: groundLevel, z: newZ },
        impactPos: [newX, groundLevel, newZ],
        missDistance: Math.abs(deltaX),
        maxAltitudeReached: maxAlt,
      });
      return;
    }

    // Still in flight
    set({
      flightTime: newTime,
      ballPos: { x: newX, y: newY, z: newZ },
      ballVelocity: { x: newVx, y: newVy, z: newVz },
      maxAltitudeReached: maxAlt,
    });
  },
}));
