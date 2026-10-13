"use client";

import { createChallengeStore, createChallengeContext } from "@/stores/factory";

export interface RefuelStageConfig {
  round: number;
  tankerSpeed: number;
  initialPlayerSpeed: number;
  initialDistance: number;
  fuel: number;
  fuelDrainRate: number;
  requiredSeconds: number;
  label: string;
}

export const REFUEL_STAGES: RefuelStageConfig[] = [
  {
    round: 1,
    tankerSpeed: 90,
    initialPlayerSpeed: 70,
    initialDistance: 30,
    fuel: 45,
    fuelDrainRate: 0.9,
    requiredSeconds: 5.0,
    label: "Training Sortie (90 m/s)",
  },
  {
    round: 2,
    tankerSpeed: 140,
    initialPlayerSpeed: 110,
    initialDistance: 45,
    fuel: 35,
    fuelDrainRate: 1.2,
    requiredSeconds: 5.0,
    label: "High-Speed Rendezvous (140 m/s)",
  },
  {
    round: 3,
    tankerSpeed: 190,
    initialPlayerSpeed: 150,
    initialDistance: 60,
    fuel: 30,
    fuelDrainRate: 1.5,
    requiredSeconds: 5.0,
    label: "Supersonic Emergency Pursuit (190 m/s)",
  },
];

export interface RefuelStoreState extends Record<string, unknown> {
  currentRound: number;
  tankerSpeed: number; // constant speed of lead jet
  playerSpeed: number; // your jet speed
  relativeSpeed: number; // playerSpeed - tankerSpeed (m/s)
  pipeDistance: number; // distance to fuel pipe (meters)
  
  fuel: number; // 0 to 100%
  fuelDrainRate: number; // % per second drained while flying
  fuelFillRate: number; // % per second filled when connected (20%/s)
  
  isDockable: boolean; // within docking sweet spot (|distance| <= 2.2m & |vRel| <= 2.5 m/s)
  isConnected: boolean; // active locked connection
  connectedSeconds: number; // 0.0 to 5.0 seconds
  dockMessage: string; // status feedback message
  
  isRunning: boolean;
  isWon: boolean;
  isCrashed: boolean;
  
  setPlayerSpeed: (speed: number) => void;
  adjustSpeed: (delta: number) => void;
  connectPipe: () => void;
  disconnectPipe: () => void;
  startFlight: () => void;
  pauseFlight: () => void;
  resetFlight: () => void;
  nextRound: () => void;
  updateTick: (dt: number) => void;
}

export const createGhostDriverStore = createChallengeStore<RefuelStoreState>(
  {
    currentRound: 1,
    tankerSpeed: 90,
    playerSpeed: 70,
    relativeSpeed: -20,
    pipeDistance: 30,

    fuel: 45,
    fuelDrainRate: 0.9,
    fuelFillRate: 20.0,

    isDockable: false,
    isConnected: false,
    connectedSeconds: 0,
    dockMessage: "Fly forward ([+] / W) to approach the fuel pipe.",

    isRunning: false,
    isWon: false,
    isCrashed: false,

    setPlayerSpeed: () => {},
    adjustSpeed: () => {},
    connectPipe: () => {},
    disconnectPipe: () => {},
    startFlight: () => {},
    pauseFlight: () => {},
    resetFlight: () => {},
    nextRound: () => {},
    updateTick: () => {},
  },
  (set, get) => ({
    setPlayerSpeed: (speed: number) => {
      const s = get();
      if (s.isCrashed || s.isWon) return;
      const clamped = Math.max(40, Math.min(260, speed));
      const vRel = clamped - s.tankerSpeed;
      
      let connected = s.isConnected;
      let msg = s.dockMessage;
      if (connected && Math.abs(clamped - s.tankerSpeed) > 3.0) {
        connected = false;
        msg = `Disconnected! Speed drifted away from ${s.tankerSpeed} m/s.`;
      }

      set({
        playerSpeed: clamped,
        relativeSpeed: vRel,
        isConnected: connected,
        dockMessage: msg,
      });
    },

    adjustSpeed: (delta: number) => {
      const s = get();
      get().setPlayerSpeed(s.playerSpeed + delta);
    },

    connectPipe: () => {
      const s = get();
      if (!s.isRunning || s.isCrashed || s.isWon) return;

      if (s.isConnected) {
        set({
          isConnected: false,
          dockMessage: "Pipe disconnected manually.",
        });
        return;
      }

      // Check if in valid docking window: distance within +-2.2m and |vRel| <= 2.5 m/s
      const inDistanceZone = Math.abs(s.pipeDistance) <= 2.2;
      const speedMatched = Math.abs(s.relativeSpeed) <= 2.5;

      if (inDistanceZone && speedMatched) {
        set({
          isConnected: true,
          pipeDistance: 0,
          playerSpeed: s.tankerSpeed,
          relativeSpeed: 0,
          dockMessage: "PIPE LOCKED! Transferring fuel (Hold for 5s)...",
        });
      } else if (!inDistanceZone) {
        if (s.pipeDistance > 2.2) {
          set({ dockMessage: `Too far behind (${s.pipeDistance.toFixed(1)}m away). Fly closer to the basket!` });
        } else {
          set({ dockMessage: `Overshot by ${Math.abs(s.pipeDistance).toFixed(1)}m! Slow down to fall back!` });
        }
      } else {
        set({ dockMessage: `Relative speed too high (${s.relativeSpeed > 0 ? "+" : ""}${s.relativeSpeed.toFixed(1)} m/s). Match speed to ${s.tankerSpeed} m/s first!` });
      }
    },

    disconnectPipe: () => {
      set({
        isConnected: false,
        dockMessage: "Pipe disconnected.",
      });
    },

    startFlight: () => {
      const s = get();
      if (s.isCrashed || s.isWon) {
        get().resetFlight();
      }
      set({
        isRunning: true,
        dockMessage: `Flight started! Accelerate forward to match ${get().tankerSpeed} m/s.`,
      });
    },

    pauseFlight: () => set({ isRunning: false }),

    resetFlight: () => {
      const round = get().currentRound;
      const stage = REFUEL_STAGES[round - 1] || REFUEL_STAGES[0];
      set({
        tankerSpeed: stage.tankerSpeed,
        playerSpeed: stage.initialPlayerSpeed,
        relativeSpeed: stage.initialPlayerSpeed - stage.tankerSpeed,
        pipeDistance: stage.initialDistance,
        fuel: stage.fuel,
        fuelDrainRate: stage.fuelDrainRate,
        isDockable: false,
        isConnected: false,
        connectedSeconds: 0,
        dockMessage: "Flight reset. Accelerate forward to catch the lead jet.",
        isRunning: false,
        isWon: false,
        isCrashed: false,
      });
    },

    nextRound: () => {
      const round = get().currentRound;
      if (round < 3) {
        const nextR = round + 1;
        const stage = REFUEL_STAGES[nextR - 1];
        set({
          currentRound: nextR,
          tankerSpeed: stage.tankerSpeed,
          playerSpeed: stage.initialPlayerSpeed,
          relativeSpeed: stage.initialPlayerSpeed - stage.tankerSpeed,
          pipeDistance: stage.initialDistance,
          fuel: stage.fuel,
          fuelDrainRate: stage.fuelDrainRate,
          isDockable: false,
          isConnected: false,
          connectedSeconds: 0,
          dockMessage: `Stage ${nextR} started! Accelerate forward to match ${stage.tankerSpeed} m/s.`,
          isRunning: true,
          isWon: false,
          isCrashed: false,
        });
      }
    },

    updateTick: (dt: number) => {
      const s = get();
      if (!s.isRunning || s.isWon || s.isCrashed) return;

      const vRel = s.playerSpeed - s.tankerSpeed;
      let newDistance = s.pipeDistance;

      if (!s.isConnected) {
        newDistance -= vRel * dt;
      } else {
        newDistance = 0;
      }

      const isDockable = Math.abs(newDistance) <= 2.2 && Math.abs(vRel) <= 2.5;

      let newFuel = s.fuel;
      let newConnectedSec = s.connectedSeconds;
      let msg = s.dockMessage;

      if (s.isConnected) {
        newConnectedSec = Math.min(5.0, newConnectedSec + dt);
        newFuel = Math.min(100, newFuel + s.fuelFillRate * dt);
        msg = `REFUELING: ${newConnectedSec.toFixed(1)}s / 5.0s (${newFuel.toFixed(0)}% Fuel)`;
      } else {
        newFuel = Math.max(0, newFuel - s.fuelDrainRate * dt);
        if (newConnectedSec > 0) {
          newConnectedSec = Math.max(0, newConnectedSec - dt * 2);
        }

        if (newDistance < -20) {
          msg = `OVERSHOT! You flew past the lead jet (${Math.abs(newDistance + 20).toFixed(0)}m ahead). Slow down!`
        } else if (newDistance < -2.2) {
          msg = `Passed the fuel basket (${Math.abs(newDistance).toFixed(1)}m ahead). Decelerate to fall back!`;
        } else if (isDockable) {
          msg = "READY TO CONNECT! Press [LOCK PROBE] or [Space] now!";
        } else if (newDistance <= 5.0) {
          msg = `Close to the basket! Match speed to ${s.tankerSpeed} m/s (Relative Speed = 0).`;
        }
      }

      // Check WIN
      if (newConnectedSec >= 5.0 || newFuel >= 100) {
        set({
          pipeDistance: 0,
          isConnected: true,
          connectedSeconds: 5.0,
          fuel: 100,
          isWon: true,
          isRunning: false,
          dockMessage: "REFUEL COMPLETE! 100% FUEL REACHED!",
        });
        return;
      }

      // Check CRASH
      if (newFuel <= 0) {
        set({
          fuel: 0,
          isConnected: false,
          isCrashed: true,
          isRunning: false,
          dockMessage: "FUEL EMPTY! Engine flameout - Crash landed!",
        });
        return;
      }

      set({
        relativeSpeed: vRel,
        pipeDistance: newDistance,
        isDockable,
        connectedSeconds: newConnectedSec,
        fuel: newFuel,
        dockMessage: msg,
      });
    },
  })
);

export const {
  ChallengeProvider: GhostDriverProvider,
  useChallengeStore: useGhostDriverStore,
  StoreContext: GhostDriverContext,
} = createChallengeContext<RefuelStoreState>();
