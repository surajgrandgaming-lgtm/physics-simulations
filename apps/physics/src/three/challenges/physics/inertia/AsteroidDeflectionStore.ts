"use client";

import { create } from "zustand";
import { challengeAudio } from "@/lib/audio/challengeAudio";

export interface AsteroidWall {
  id: number;
  z: number;
  thickness: number;
  gapX: number;
  gapWidth: number;
  isOscillating?: boolean;
  oscSpeed?: number;
  oscAmp?: number;
  cleared: boolean;
}

export interface AsteroidRockItem {
  id: string;
  wallId: number;
  x: number;
  y: number;
  z: number;
  baseX: number;
  scale: number;
  rot: [number, number, number];
  rotSpeed: [number, number, number];
  geoVariant: "dodeca" | "icosa";
  color: string;
  isOscillating?: boolean;
  oscSpeed?: number;
  oscAmp?: number;
}

export interface FlightStage {
  round: number;
  title: string;
  subtitle: string;
  massKg: number;
  forwardSpeed: number; // constant v_z in m/s (Newton's 1st Law: Sigma F_z = 0)
  pulseDeltaV: number;  // lateral impulse delta-v in m/s
  pulseFuelCost: number;
  walls: AsteroidWall[];
  gateZ: number;
}

// Generate physical 3D asteroid rock colliders for each barrier
export function generateRocksForWall(wall: AsteroidWall): AsteroidRockItem[] {
  const rocks: AsteroidRockItem[] = [];
  const halfGap = wall.gapWidth / 2;
  const gapMin = wall.gapX - halfGap;
  const gapMax = wall.gapX + halfGap;

  let seed = wall.id * 1793 + 81;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const rockColors = ["#64748b", "#78716c", "#94a3b8", "#6b7280", "#57606a"];

  // 1. Left Asteroid Flank: cluster of physical rocks
  for (let i = 0; i < 28; i++) {
    const u = rand();
    const x = -70 + u * (gapMin - 2 - (-70));
    const y = (rand() - 0.5) * 44;
    const z = wall.z + (rand() - 0.5) * 38;
    const scale = 3.2 + rand() * 5.0;

    rocks.push({
      id: `w${wall.id}_L_${i}`,
      wallId: wall.id,
      x,
      y,
      z,
      baseX: x,
      scale,
      rot: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI],
      rotSpeed: [(rand() - 0.5) * 0.35, (rand() - 0.5) * 0.35, (rand() - 0.5) * 0.35],
      geoVariant: rand() > 0.5 ? "dodeca" : "icosa",
      color: rockColors[Math.floor(rand() * rockColors.length)],
      isOscillating: wall.isOscillating,
      oscSpeed: wall.oscSpeed,
      oscAmp: wall.oscAmp,
    });
  }

  // 2. Right Asteroid Flank: cluster of physical rocks
  for (let i = 0; i < 28; i++) {
    const u = rand();
    const x = (gapMax + 2) + u * (70 - (gapMax + 2));
    const y = (rand() - 0.5) * 44;
    const z = wall.z + (rand() - 0.5) * 38;
    const scale = 3.2 + rand() * 5.0;

    rocks.push({
      id: `w${wall.id}_R_${i}`,
      wallId: wall.id,
      x,
      y,
      z,
      baseX: x,
      scale,
      rot: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI],
      rotSpeed: [(rand() - 0.5) * 0.35, (rand() - 0.5) * 0.35, (rand() - 0.5) * 0.35],
      geoVariant: rand() > 0.5 ? "dodeca" : "icosa",
      color: rockColors[Math.floor(rand() * rockColors.length)],
      isOscillating: wall.isOscillating,
      oscSpeed: wall.oscSpeed,
      oscAmp: wall.oscAmp,
    });
  }

  // 3. Roof & Floor clutter boulders (top and bottom)
  for (let i = 0; i < 14; i++) {
    const x = gapMin - 6 + rand() * (wall.gapWidth + 12);
    const isRoof = rand() > 0.5;
    const y = isRoof ? 14 + rand() * 16 : -14 - rand() * 16;
    const z = wall.z + (rand() - 0.5) * 32;
    const scale = 4.0 + rand() * 5.5;

    rocks.push({
      id: `w${wall.id}_RF_${i}`,
      wallId: wall.id,
      x,
      y,
      z,
      baseX: x,
      scale,
      rot: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI],
      rotSpeed: [(rand() - 0.5) * 0.25, (rand() - 0.5) * 0.25, (rand() - 0.5) * 0.25],
      geoVariant: rand() > 0.5 ? "dodeca" : "icosa",
      color: rockColors[Math.floor(rand() * rockColors.length)],
      isOscillating: wall.isOscillating,
      oscSpeed: wall.oscSpeed,
      oscAmp: wall.oscAmp,
    });
  }

  // 4. Anchor asteroids on each side of the corridor
  rocks.push({
    id: `w${wall.id}_anchor_L`,
    wallId: wall.id,
    x: gapMin - 3.5,
    y: 0,
    z: wall.z,
    baseX: gapMin - 3.5,
    scale: 8.5,
    rot: [0.4, 0.2, 0.1],
    rotSpeed: [0.06, 0.08, 0.04],
    geoVariant: "dodeca",
    color: "#1e293b",
    isOscillating: wall.isOscillating,
    oscSpeed: wall.oscSpeed,
    oscAmp: wall.oscAmp,
  });

  rocks.push({
    id: `w${wall.id}_anchor_R`,
    wallId: wall.id,
    x: gapMax + 3.5,
    y: 0,
    z: wall.z,
    baseX: gapMax + 3.5,
    scale: 8.5,
    rot: [0.2, 0.7, 0.3],
    rotSpeed: [-0.05, 0.07, -0.03],
    geoVariant: "dodeca",
    color: "#1e293b",
    isOscillating: wall.isOscillating,
    oscSpeed: wall.oscSpeed,
    oscAmp: wall.oscAmp,
  });

  return rocks;
}

export function buildStageRocks(walls: AsteroidWall[]): AsteroidRockItem[] {
  return walls.flatMap(generateRocksForWall);
}

export const FLIGHT_STAGES: FlightStage[] = [
  {
    round: 1,
    title: "Sector 1: The Triple Gate",
    subtitle: "3 Randomized Barrier Passages · Master Inertial Drift",
    massKg: 1200,
    forwardSpeed: 22.0,
    pulseDeltaV: 4.0,
    pulseFuelCost: 2.0,
    walls: [
      { id: 1, z: 110, thickness: 16, gapX: -18, gapWidth: 30, cleared: false },
      { id: 2, z: 210, thickness: 16, gapX: 18, gapWidth: 28, cleared: false },
      { id: 3, z: 310, thickness: 16, gapX: -12, gapWidth: 28, cleared: false },
    ],
    gateZ: 390,
  },
  {
    round: 2,
    title: "Sector 2: The Fivefold Slalom",
    subtitle: "5 Randomized Barrier Passages · Rapid Momentum Reversal",
    massKg: 1800,
    forwardSpeed: 24.0,
    pulseDeltaV: 4.5,
    pulseFuelCost: 1.5,
    walls: [
      { id: 1, z: 100, thickness: 16, gapX: 22, gapWidth: 26, cleared: false },
      { id: 2, z: 200, thickness: 16, gapX: -20, gapWidth: 26, cleared: false },
      { id: 3, z: 300, thickness: 16, gapX: 16, gapWidth: 25, cleared: false },
      { id: 4, z: 400, thickness: 16, gapX: -24, gapWidth: 25, cleared: false },
      { id: 5, z: 500, thickness: 16, gapX: 18, gapWidth: 25, cleared: false },
    ],
    gateZ: 580,
  },
  {
    round: 3,
    title: "Sector 3: The Seven Chasm Gauntlet",
    subtitle: "7 Randomized Barrier Passages · Dynamic Oscillating Apertures",
    massKg: 2500,
    forwardSpeed: 25.0,
    pulseDeltaV: 5.0,
    pulseFuelCost: 1.0,
    walls: [
      { id: 1, z: 90, thickness: 16, gapX: -18, gapWidth: 24, cleared: false },
      { id: 2, z: 180, thickness: 16, gapX: 22, gapWidth: 24, cleared: false },
      { id: 3, z: 270, thickness: 16, gapX: -16, gapWidth: 23, isOscillating: true, oscSpeed: 1.1, oscAmp: 12, cleared: false },
      { id: 4, z: 360, thickness: 16, gapX: 20, gapWidth: 23, cleared: false },
      { id: 5, z: 450, thickness: 16, gapX: -22, gapWidth: 22, cleared: false },
      { id: 6, z: 540, thickness: 16, gapX: 16, gapWidth: 22, isOscillating: true, oscSpeed: 1.2, oscAmp: 14, cleared: false },
      { id: 7, z: 630, thickness: 16, gapX: -12, gapWidth: 22, cleared: false },
    ],
    gateZ: 710,
  },
];

export type CameraViewMode = "chase" | "cockpit" | "topdown" | "side";

export interface AsteroidDeflectionState {
  cameraView: CameraViewMode;
  setCameraView: (view: CameraViewMode) => void;
  cycleCameraView: () => void;
  currentRound: number;
  stageConfig: FlightStage;

  isFlying: boolean;
  isPaused: boolean;
  status: "idle" | "cruising" | "cleared" | "crashed";
  crashReason: string | null;

  rocketPos: { x: number; y: number; z: number };
  rocketVel: { vx: number; vy: number; vz: number };
  rocketRoll: number;

  activeRCS: "left" | "right" | "stabilize" | null;
  rcsPulseTimer: number;

  fuel: number;
  totalPulses: number;
  score: number;
  stars: number;

  walls: AsteroidWall[];
  rocks: AsteroidRockItem[];
  currentWallIdx: number;
  simTime: number;

  isMissionStarted: boolean;
  startMission: () => void;

  startFlight: () => void;
  pulseRCS: (direction: "left" | "right") => void;
  stabilizeRCS: () => void;
  tick: (delta: number) => void;
  resetFlight: () => void;
  nextRound: () => void;
}

export const useAsteroidDeflectionStore = create<AsteroidDeflectionState>((set, get) => ({
  cameraView: "chase",
  setCameraView: (view) => set({ cameraView: view }),
  cycleCameraView: () => {
    const modes: CameraViewMode[] = ["chase", "cockpit", "topdown", "side"];
    const current = get().cameraView;
    const nextIdx = (modes.indexOf(current) + 1) % modes.length;
    set({ cameraView: modes[nextIdx] });
    try { challengeAudio.playClick(); } catch {}
  },
  currentRound: 1,
  stageConfig: FLIGHT_STAGES[0],

  isFlying: false,
  isPaused: false,
  status: "idle",
  crashReason: null,

  rocketPos: { x: 0, y: 0, z: 0 },
  rocketVel: { vx: 0, vy: 0, vz: FLIGHT_STAGES[0].forwardSpeed },
  rocketRoll: 0,

  activeRCS: null,
  rcsPulseTimer: 0,

  fuel: 100,
  totalPulses: 0,
  score: 0,
  stars: 3,

  walls: JSON.parse(JSON.stringify(FLIGHT_STAGES[0].walls)),
  rocks: buildStageRocks(FLIGHT_STAGES[0].walls),
  currentWallIdx: 0,
  simTime: 0,

  isMissionStarted: false,
  startMission: () => {
    try { challengeAudio.playClick(); } catch {}
    set({ isMissionStarted: true });
    get().startFlight();
  },

  startFlight: () => {
    const { stageConfig } = get();
    // launch sound removed
    set({
      isFlying: true,
      status: "cruising",
      crashReason: null,
      rocketPos: { x: 0, y: 0, z: 0 },
      rocketVel: { vx: 0, vy: 0, vz: stageConfig.forwardSpeed },
      rocketRoll: 0,
      fuel: 100,
      totalPulses: 0,
      walls: JSON.parse(JSON.stringify(stageConfig.walls)),
      rocks: buildStageRocks(stageConfig.walls),
      currentWallIdx: 0,
      simTime: 0,
    });
  },

  pulseRCS: (direction) => {
    const state = get();
    if (!state.isFlying || state.status !== "cruising") return;

    // Outer boundary constraint: prevent drifting outside the asteroid field (span ±60m)
    const MAX_LATERAL = 60.0;
    if (state.rocketPos.x >= MAX_LATERAL && direction === "left") return;
    if (state.rocketPos.x <= -MAX_LATERAL && direction === "right") return;

    const impulse = state.stageConfig.pulseDeltaV;
    const deltaVx = direction === "right" ? -impulse : impulse;
    const nextVx = Math.round((state.rocketVel.vx + deltaVx) * 10) / 10;
    const cost = state.stageConfig.pulseFuelCost || 2.0;
    // Fuel can reach 0, but emergency reserve thrusters ensure pilot is never locked out of steering
    const nextFuel = Math.max(0, Math.round((state.fuel - cost) * 10) / 10);

    set({
      rocketVel: { ...state.rocketVel, vx: nextVx },
      fuel: nextFuel,
      totalPulses: state.totalPulses + 1,
      activeRCS: direction,
      rcsPulseTimer: 0.28,
    });
  },

  stabilizeRCS: () => {
    const state = get();
    if (!state.isFlying || state.status !== "cruising") return;
    if (Math.abs(state.rocketVel.vx) < 0.1) return;

    const cost = (state.stageConfig.pulseFuelCost || 2.0) + 0.5;
    const nextFuel = Math.max(0, Math.round((state.fuel - cost) * 10) / 10);

    set({
      rocketVel: { ...state.rocketVel, vx: 0 },
      fuel: nextFuel,
      totalPulses: state.totalPulses + 1,
      activeRCS: "stabilize",
      rcsPulseTimer: 0.35,
    });
  },

  tick: (delta) => {
    const state = get();
    if (!state.isFlying || state.status !== "cruising") return;

    const dt = Math.min(delta, 0.08);
    const newSimTime = state.simTime + dt;

    // 1. Position update: Newton's 1st Law (Sigma F = 0 -> constant velocity in space)
    let nextX = state.rocketPos.x + state.rocketVel.vx * dt;
    const nextZ = state.rocketPos.z + state.rocketVel.vz * dt;
    const nextY = Math.sin(newSimTime * 3.5) * 0.18;

    // Strictly contain jet within the asteroid field area (no escaping to empty void)
    const MAX_LATERAL = 60.0;
    let nextVx = state.rocketVel.vx;

    if (nextX > MAX_LATERAL) {
      nextX = MAX_LATERAL;
      if (nextVx > 0) nextVx = 0; // stop drifting further left
    } else if (nextX < -MAX_LATERAL) {
      nextX = -MAX_LATERAL;
      if (nextVx < 0) nextVx = 0; // stop drifting further right
    }

    // 2. Banking roll interpolation based on lateral drift
    const targetRoll = -Math.max(-0.45, Math.min(0.45, state.rocketVel.vx * 0.07));
    const nextRoll = state.rocketRoll + (targetRoll - state.rocketRoll) * (dt * 6.0);

    // 3. RCS active timer countdown
    let nextActiveRCS = state.activeRCS;
    let nextTimer = state.rcsPulseTimer - dt;
    if (nextTimer <= 0) {
      nextActiveRCS = null;
      nextTimer = 0;
    }

    // 4. Update dynamic/oscillating rocks
    const updatedRocks = state.rocks.map((r) => {
      if (r.isOscillating && r.oscSpeed && r.oscAmp) {
        return {
          ...r,
          x: r.baseX + Math.sin(newSimTime * r.oscSpeed) * r.oscAmp,
        };
      }
      return r;
    });

    // Also update wall gapX for visual guides
    const updatedWalls = state.walls.map((w) => {
      if (w.isOscillating && w.oscSpeed && w.oscAmp) {
        return {
          ...w,
          gapX: Math.sin(newSimTime * w.oscSpeed) * w.oscAmp,
        };
      }
      return w;
    });

    // -------------------------------------------------------------
    // 5. TRUE 3D PHYSICAL COLLISION DETECTION AGAINST ACTUAL ROCKS
    // No artificial flat wall plane! You only crash if you hit a rock!
    // -------------------------------------------------------------
    const jetCollisionRadius = 1.6; // Jet bounding sphere radius
    let crashed = false;
    let hitRock: AsteroidRockItem | null = null;

    for (const rock of updatedRocks) {
      // Spatial Z-cull: only check rocks within 14m of the jet
      const dz = nextZ - rock.z;
      if (Math.abs(dz) > 14) continue;

      const dx = nextX - rock.x;
      const dy = nextY - rock.y;
      const distSq = dx * dx + dy * dy + dz * dz;

      // Realistic physical rock radius (0.70 of visual scale so craggy outer points don't trigger cheap collision)
      const physicalRockRadius = rock.scale * 0.70;
      const minDist = physicalRockRadius + jetCollisionRadius;

      if (distSq <= minDist * minDist) {
        crashed = true;
        hitRock = rock;
        break;
      }
    }

    if (crashed && hitRock) {
      try { challengeAudio.playCrashImpact(); } catch {}
      set({
        isFlying: false,
        status: "crashed",
        crashReason: `Collided with Space Asteroid at Barrier ${hitRock.wallId}! Maneuver into open space to avoid rock impacts.`,
        rocketPos: { x: nextX, y: nextY, z: nextZ },
        rocketRoll: nextRoll,
        rocks: updatedRocks,
        walls: updatedWalls,
        activeRCS: null,
      });
      return;
    }

    // 6. Check Wall Clearances (passing through or past an asteroid barrier)
    for (const wall of updatedWalls) {
      if (!wall.cleared && nextZ > wall.z + 18) {
        wall.cleared = true;
        try { challengeAudio.playRadarPing(0.6); } catch {}
      }
    }

    // 7. Check Warp Gate Clearance
    if (nextZ >= state.stageConfig.gateZ) {
      try { challengeAudio.playSuccessFanfare(); } catch {}
      const fuelBonus = Math.round(state.fuel * 5);
      const wallBonus = state.stageConfig.walls.length * 300;
      const stageScore = 600 + fuelBonus + wallBonus;
      const starsEarned = state.fuel > 35 ? 3 : state.fuel > 15 ? 2 : 1;

      set({
        isFlying: false,
        status: "cleared",
        score: state.score + stageScore,
        stars: starsEarned,
        rocketPos: { x: nextX, y: nextY, z: nextZ },
        rocketRoll: nextRoll,
        rocks: updatedRocks,
        walls: updatedWalls,
        activeRCS: null,
      });
      return;
    }

    // Normal flight continuation
    set({
      rocketPos: { x: nextX, y: nextY, z: nextZ },
      rocketVel: { ...state.rocketVel, vx: nextVx },
      rocketRoll: nextRoll,
      activeRCS: nextActiveRCS,
      rcsPulseTimer: nextTimer,
      rocks: updatedRocks,
      walls: updatedWalls,
      simTime: newSimTime,
    });
  },

  resetFlight: () => {
    const { stageConfig } = get();
    try { challengeAudio.playClick(); } catch {}
    set({
      isFlying: true,
      status: "cruising",
      crashReason: null,
      rocketPos: { x: 0, y: 0, z: 0 },
      rocketVel: { vx: 0, vy: 0, vz: stageConfig.forwardSpeed },
      rocketRoll: 0,
      fuel: 100,
      totalPulses: 0,
      walls: JSON.parse(JSON.stringify(stageConfig.walls)),
      rocks: buildStageRocks(stageConfig.walls),
      currentWallIdx: 0,
      simTime: 0,
      activeRCS: null,
    });
  },

  nextRound: () => {
    const { currentRound } = get();
    const nextIdx = currentRound < FLIGHT_STAGES.length ? currentRound : 0;
    const nextStage = FLIGHT_STAGES[nextIdx];

    try { challengeAudio.playSuccessFanfare(); } catch {}

    set({
      currentRound: nextStage.round,
      stageConfig: nextStage,
      isFlying: true,
      status: "cruising",
      crashReason: null,
      rocketPos: { x: 0, y: 0, z: 0 },
      rocketVel: { vx: 0, vy: 0, vz: nextStage.forwardSpeed },
      rocketRoll: 0,
      fuel: 100,
      totalPulses: 0,
      walls: JSON.parse(JSON.stringify(nextStage.walls)),
      rocks: buildStageRocks(nextStage.walls),
      currentWallIdx: 0,
      simTime: 0,
      activeRCS: null,
    });
  },
}));
