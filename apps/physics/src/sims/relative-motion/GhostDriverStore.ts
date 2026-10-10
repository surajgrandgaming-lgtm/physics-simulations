"use client";

import { createChallengeStore, createChallengeContext } from "@topcoaching/sim-core";

export interface RefuelStoreState extends Record<string, unknown> {
  // Speed & 1D Position
  tankerSpeed: number; // constant speed of lead jet (100 m/s)
  playerSpeed: number; // your jet speed
  relativeSpeed: number; // playerSpeed - tankerSpeed (m/s)
  pipeDistance: number; // distance to fuel pipe (meters). Positive = behind pipe, 0 = at pipe, Negative = past pipe / in front of lead jet!
  
  // Fuel & Connection
  fuel: number; // 0 to 100% (starts at 35%)
  fuelDrainRate: number; // % per second drained while flying (1.2%/s)
  fuelFillRate: number; // % per second filled when connected (20%/s)
  
  isDockable: boolean; // within docking sweet spot (distance within ±2.0m & |vRel| <= 2.5 m/s)
  isConnected: boolean; // active locked connection
  connectedSeconds: number; // 0.0 to 5.0 seconds
  dockMessage: string; // status feedback message
  
  // States
  isRunning: boolean;
  isWon: boolean;
  isCrashed: boolean;
  
  // Actions
  setPlayerSpeed: (speed: number) => void;
  adjustSpeed: (delta: number) => void;
  connectPipe: () => void;
  disconnectPipe: () => void;
  startFlight: () => void;
  pauseFlight: () => void;
  resetFlight: () => void;
  updateTick: (dt: number) => void;
}

export const createGhostDriverStore = createChallengeStore<RefuelStoreState>(
  {
    tankerSpeed: 100,
    playerSpeed: 80,
    relativeSpeed: -20,
    pipeDistance: 35,

    fuel: 35,
    fuelDrainRate: 1.2,
    fuelFillRate: 20.0,

    isDockable: false,
    isConnected: false,
    connectedSeconds: 0,
    dockMessage: "Fly forward (W / ↑) to approach the fuel pipe.",

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
    updateTick: () => {},
  },
  (set, get) => ({
    setPlayerSpeed: (speed: number) => {
      const s = get();
      if (s.isCrashed || s.isWon) return;
      const clamped = Math.max(50, Math.min(160, speed));
      const vRel = clamped - s.tankerSpeed;
      
      // If connected, check if user speed drifted too far
      let connected = s.isConnected;
      let msg = s.dockMessage;
      if (connected && Math.abs(clamped - s.tankerSpeed) > 3.0) {
        connected = false;
        msg = "⚠️ Disconnected! Speed drifted away from 100 m/s.";
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
        // Toggle disconnect if already connected
        set({
          isConnected: false,
          dockMessage: "Pipe disconnected manually.",
        });
        return;
      }

      // Check if in valid docking window: distance within ±2.0m and |vRel| <= 2.5 m/s
      const inDistanceZone = Math.abs(s.pipeDistance) <= 2.2;
      const speedMatched = Math.abs(s.relativeSpeed) <= 2.5;

      if (inDistanceZone && speedMatched) {
        // SUCCESSFUL LOCK!
        set({
          isConnected: true,
          pipeDistance: 0, // snaps neatly into basket
          playerSpeed: s.tankerSpeed, // sync speed with tanker
          relativeSpeed: 0,
          dockMessage: "🔒 PIPE LOCKED! Transferring fuel (Hold for 5s)...",
        });
      } else if (!inDistanceZone) {
        if (s.pipeDistance > 2.2) {
          set({ dockMessage: `❌ Too far behind (${s.pipeDistance.toFixed(1)}m away). Fly closer to the pipe!` });
        } else {
          set({ dockMessage: `❌ Overshot by ${Math.abs(s.pipeDistance).toFixed(1)}m! Slow down (S / ↓) to fall back!` });
        }
      } else {
        set({ dockMessage: `❌ Relative speed too high (${s.relativeSpeed > 0 ? "+" : ""}${s.relativeSpeed} m/s). Match speed to 100 m/s first!` });
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
        dockMessage: "Flight started! Accelerate (W / ↑) to catch up.",
      });
    },

    pauseFlight: () => set({ isRunning: false }),

    resetFlight: () => {
      set({
        tankerSpeed: 100,
        playerSpeed: 80,
        relativeSpeed: -20,
        pipeDistance: 35,
        fuel: 35,
        isDockable: false,
        isConnected: false,
        connectedSeconds: 0,
        dockMessage: "Fly forward (W / ↑) to approach the fuel pipe.",
        isRunning: false,
        isWon: false,
        isCrashed: false,
      });
    },

    updateTick: (dt: number) => {
      const s = get();
      if (!s.isRunning || s.isWon || s.isCrashed) return;

      const vRel = s.playerSpeed - s.tankerSpeed;
      let newDistance = s.pipeDistance;

      if (!s.isConnected) {
        // When not locked, distance changes by relative velocity (can overshoot in front!)
        newDistance -= vRel * dt;
      } else {
        // When locked, held at 0 distance
        newDistance = 0;
      }

      // Docking sweet spot check
      const isDockable = Math.abs(newDistance) <= 2.2 && Math.abs(vRel) <= 2.5;

      let newFuel = s.fuel;
      let newConnectedSec = s.connectedSeconds;
      let msg = s.dockMessage;

      if (s.isConnected) {
        // Transferring fuel!
        newConnectedSec = Math.min(5.0, newConnectedSec + dt);
        newFuel = Math.min(100, newFuel + s.fuelFillRate * dt);
        msg = `⚡ REFUELING: ${newConnectedSec.toFixed(1)}s / 5.0s (${newFuel.toFixed(0)}% Fuel)`;
      } else {
        // Draining fuel while flying freely
        newFuel = Math.max(0, newFuel - s.fuelDrainRate * dt);
        if (newConnectedSec > 0) {
          newConnectedSec = Math.max(0, newConnectedSec - dt * 2);
        }

        // Contextual guidance
        if (newDistance < -20) {
          msg = `⚠️ OVERSHOT! You flew past the lead jet (${Math.abs(newDistance + 20).toFixed(0)}m ahead). Slow down (S / ↓)!`;
        } else if (newDistance < -2.2) {
          msg = `⚠️ Passed the fuel pipe (${Math.abs(newDistance).toFixed(1)}m ahead). Decelerate (S / ↓) to fall back!`;
        } else if (isDockable) {
          msg = "🎯 READY TO CONNECT! Press [CONNECT PIPE] or [Space] now!";
        } else if (newDistance <= 5.0) {
          msg = "👀 Close to the pipe! Match speed to 100 m/s (Relative Speed = 0).";
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
          dockMessage: "🏆 REFUEL COMPLETE! 100% FUEL REACHED!",
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
          dockMessage: "💥 FUEL EMPTY! Engine flameout — Crash landed!",
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
