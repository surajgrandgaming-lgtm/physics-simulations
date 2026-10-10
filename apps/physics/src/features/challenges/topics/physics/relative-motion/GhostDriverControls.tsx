"use client";

import React, { useEffect } from "react";
import { useGhostDriverStore } from "@/three/challenges/physics/relative-motion/GhostDriverStore";
import {
  GameHUDContainer,
  HUDPanel,
  SpeedometerDial,
  CircularRingGauge,
  ResourceGauge,
  TelemetryGrid,
  ActionDock,
  ActionButton,
  StepperButton,
  CircularMovementJoystick,
  MobileActionTrigger,
} from "@/features/challenges/hud";
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Lock,
  Unlock,
  Gauge,
  Fuel,
  Compass,
  ArrowUp,
  ArrowDown,
  Timer,
} from "lucide-react";

interface Props {
  config: any;
}

export function GhostDriverControls({ config }: Props) {
  const tankerSpeed = useGhostDriverStore((s) => s.tankerSpeed);
  const playerSpeed = useGhostDriverStore((s) => s.playerSpeed);
  const relativeSpeed = useGhostDriverStore((s) => s.relativeSpeed);
  const pipeDistance = useGhostDriverStore((s) => s.pipeDistance);
  const fuel = useGhostDriverStore((s) => s.fuel);
  const isDockable = useGhostDriverStore((s) => s.isDockable);
  const isConnected = useGhostDriverStore((s) => s.isConnected);
  const connectedSeconds = useGhostDriverStore((s) => s.connectedSeconds);
  const dockMessage = useGhostDriverStore((s) => s.dockMessage);
  const isRunning = useGhostDriverStore((s) => s.isRunning);
  const isWon = useGhostDriverStore((s) => s.isWon);
  const isCrashed = useGhostDriverStore((s) => s.isCrashed);

  const setPlayerSpeed = useGhostDriverStore((s) => s.setPlayerSpeed);
  const adjustSpeed = useGhostDriverStore((s) => s.adjustSpeed);
  const connectPipe = useGhostDriverStore((s) => s.connectPipe);
  const startFlight = useGhostDriverStore((s) => s.startFlight);
  const pauseFlight = useGhostDriverStore((s) => s.pauseFlight);
  const resetFlight = useGhostDriverStore((s) => s.resetFlight);

  // Keyboard controls: [W/S] or [Up/Down] to adjust speed, [Space] to Connect/Lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        adjustSpeed(3);
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        adjustSpeed(-3);
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        connectPipe();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [adjustSpeed, connectPipe]);

  // Telemetry status computation
  const vRelStatus = Math.abs(relativeSpeed) <= 1.5 ? "success" : Math.abs(relativeSpeed) <= 5 ? "warning" : "nominal";
  const pipeGapStatus = isConnected || Math.abs(pipeDistance) <= 1.5 ? "success" : pipeDistance < -2.2 ? "danger" : "nominal";

  return (
    <GameHUDContainer
      title="Mid-Air Fuel Rendezvous"
      topicName="Relative Motion (Kinematics)"
      difficulty="easy"
      xpReward={100}
      onReset={resetFlight}
      onMissionStart={startFlight}
      briefing={{
        target: "Catch the tanker and refuel your jet mid-air",
        storyObjective:
          "Your fighter jet is running dangerously low on fuel! A KC-135 Stratotanker is cruising ahead at a constant 100 m/s. You must catch up, match relative velocity (v_rel = 0 m/s), lock into the fuel drogue basket, and maintain the lock for 5.0 seconds to transfer 100% fuel before your engine cuts out.",
        steps: [
          {
            step: 1,
            title: "Accelerate Forward",
            description: "Hold Joystick UP to continuously increase speed (80 → 110 m/s) to close the 35m gap.",
            keys: ["Hold Joystick ▲", "W"],
          },
          {
            step: 2,
            title: "Match Tanker Velocity",
            description: "Hold Joystick DOWN when within 3 meters to slow down to 100 m/s (v_rel = 0 m/s).",
            keys: ["Hold Joystick ▼", "S"],
          },
          {
            step: 3,
            title: "Lock Probe & Refuel",
            description: "Press Lock Probe when in the green docking zone and hold for 5.0 seconds.",
            keys: ["Lock Probe", "Space"],
          },
        ],
        formulas: [
          {
            label: "Relative Velocity",
            formula: "v_{\\mathrm{rel}} = v_{\\mathrm{player}} - v_{\\mathrm{tanker}}",
            explanation: "When v_rel = 0, both jets fly in unison with 0 relative drift.",
          },
          {
            label: "Relative Displacement",
            formula: "\\Delta s = v_{\\mathrm{rel}} \\cdot \\Delta t",
            explanation: "Distance closes when v_player > v_tanker, separates when v_player < v_tanker.",
          },
          {
            label: "Safe Docking Window",
            formula: "|v_{\\mathrm{rel}}| \\le 2.5\\text{ m/s} \\quad \\text{and} \\quad |\\Delta s| \\le 2.0\\text{ m}",
            explanation: "Aerodynamic probe requires synchronized velocity to lock without damage.",
          },
        ],
      }}
      result={{
        isWon,
        isGameOver: isCrashed,
        nextTierUrl: "/physics/kinematics/relative-motion/challenge/medium",
        failureReason: fuel <= 0 ? "Fuel exhausted! Engines cut out causing a crash." : "Overshot past the lead jet.",
        tip: "Hold joystick UP to accelerate and DOWN to decelerate. Match 100 m/s then tap Lock Probe.",
        stats: [
          { label: "Final Fuel", value: "100", unit: "%" },
          { label: "Refuel Time", value: "5.0", unit: "s" },
          { label: "Relative Drift", value: "0.0", unit: "m/s" },
        ],
        calculation: {
          title: "Mid-Air Rendezvous & Relative Velocity Matching",
          concept: "1D Galilean Relative Velocity & Frame Transformation",
          steps: [
            {
              step: 1,
              title: "Relative Velocity Transformation",
              math: "v_{\\mathrm{rel}} = v_{\\mathrm{jet}} - v_{\\mathrm{tanker}}",
              calculation:
                "With the lead tanker cruising at v_tanker = 100 m/s, accelerating the jet to v_jet = 110 m/s creates a closing relative velocity v_rel = +10 m/s.",
            },
            {
              step: 2,
              title: "Interception & Closure Time",
              math: "\\Delta t = \\frac{\\Delta x}{v_{\\mathrm{rel}}} = \\frac{35\\text{ m}}{10\\text{ m/s}} = 3.5\\text{ s}",
              calculation:
                "At v_rel = 10 m/s, closing the initial 35-meter separation gap to the fuel basket requires approximately 3.5 seconds.",
            },
            {
              step: 3,
              title: "Zero Relative Drift Docking Condition",
              math: "v_{\\mathrm{jet}} = v_{\\mathrm{tanker}} = 100\\text{ m/s} \\implies v_{\\mathrm{rel}} = 0\\text{ m/s}",
              calculation:
                "Inside the ±2.0m docking zone, matching tanker speed (100 m/s) eliminates relative velocity (v_rel = 0), securing the probe lock for 5.0 seconds.",
            },
          ],
          conclusion:
            "When relative velocity equals zero (v_rel = 0), both aircraft move synchronously as a single coupled kinematic system in the ground frame.",
        },
      }}
      leftHUD={
        <div className="flex flex-col items-center gap-1.5 p-1.5 xs:p-2 rounded-3xl bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <SpeedometerDial
            value={playerSpeed}
            min={50}
            max={150}
            targetValue={100}
            targetTolerance={2}
            label="JET VELOCITY"
            unit="m/s"
            size={130}
            variant={Math.abs(relativeSpeed) <= 1.5 ? "emerald" : "cyan"}
          />
        </div>
      }
      rightHUD={
        <div className="flex flex-col items-center gap-2">
          {/* Fuel Pod Circular Gauge */}
          <CircularRingGauge
            value={fuel}
            max={100}
            label="fuel pod"
            sublabel={isConnected ? "charging" : fuel <= 15 ? "low fuel" : "draining"}
            unit="%"
            icon={Fuel}
            variant={isConnected ? "emerald" : fuel <= 15 ? "rose" : "cyan"}
            size={68}
          />

          {/* Dock Hold Progress Circular Gauge */}
          <CircularRingGauge
            value={connectedSeconds}
            max={5.0}
            label="dock hold"
            sublabel={isConnected ? "connected" : isDockable ? "ready" : `${connectedSeconds.toFixed(1)}s / 5.0s`}
            unit="s"
            icon={Zap}
            variant={isConnected ? "emerald" : isDockable ? "cyan" : "amber"}
            size={68}
          />
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center gap-1.5 xs:gap-2 pointer-events-auto select-none pb-2 sm:pb-3">
          {/* Minimalist Floating Speed Readout */}
          <div className="flex flex-col items-center pointer-events-none select-none">
            <div className="text-[11px] xs:text-xs sm:text-sm font-mono font-bold tracking-widest text-cyan-100/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              ▶ {playerSpeed.toFixed(1)} M/S
              <span className="text-[10px] text-slate-400 font-normal ml-2">
                (Δv: {relativeSpeed > 0 ? `+${relativeSpeed.toFixed(1)}` : relativeSpeed.toFixed(1)} m/s)
              </span>
            </div>
            <div className="w-24 sm:w-36 h-0.5 bg-white/15 rounded-full overflow-hidden mt-0.5 backdrop-blur-sm">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-150 shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                style={{
                  width: `${Math.min(100, Math.max(0, ((playerSpeed - 50) / 100) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Minimalist Floating Controls (No Block Background) */}
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            {/* Left: Floating Circular Flight Toggle */}
            <button
              type="button"
              onClick={isRunning ? pauseFlight : startFlight}
              disabled={isWon || isCrashed}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/45 hover:bg-slate-900/65 backdrop-blur-xl border border-white/15 text-slate-300 shadow-[0_4px_16px_rgba(0,0,0,0.3)] flex items-center justify-center active:scale-90 transition-all disabled:opacity-30"
              title={isRunning ? "Pause Flight" : "Start Flight"}
            >
              {isRunning ? (
                <Pause className="w-4 h-4 text-amber-400" />
              ) : (
                <Play className="w-4 h-4 text-cyan-400 ml-0.5" />
              )}
            </button>

            {/* Center: Minimalist Floating Circular Joystick */}
            <CircularMovementJoystick
              mode="vertical"
              size={112}
              upLabel="HOLD ▲"
              downLabel="HOLD ▼"
              disabled={!isRunning || isWon || isCrashed}
              onTick={({ dy, dt }) => {
                const rate = 24;
                const delta = -dy * rate * dt;
                adjustSpeed(delta);
              }}
            />

            {/* Right: Floating Capsule Lock Trigger */}
            <MobileActionTrigger
              onClick={connectPipe}
              disabled={!isRunning || isWon || isCrashed}
              icon={isConnected ? Zap : isDockable ? Lock : Unlock}
              label={isConnected ? "LOCKED" : isDockable ? "LOCK NOW" : "LOCK PROBE"}
              sublabel={isDockable && !isConnected ? "Sweet Spot" : undefined}
              variant={isConnected ? "success" : isDockable ? "success" : "primary"}
              isPulsing={isDockable && !isConnected}
              hotkey="SPACE"
            />
          </div>
        </div>
      }
    />
  );
}
