"use client";

import React, { useMemo } from "react";
import {
  RotateCcw,
  Zap,
  Gauge,
  Weight,
  ShieldAlert,
  Play,
  ArrowDownCircle,
  Plus,
  Minus,
} from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import { useAtwoodElevatorStore } from "@/three/challenges/physics/atwood-machine/AtwoodElevatorStore";

export function AtwoodElevatorControls({ config }: { config?: any }) {
  const currentRound = useAtwoodElevatorStore((s) => s.currentRound);
  const stageConfig = useAtwoodElevatorStore((s) => s.stageConfig);
  const status = useAtwoodElevatorStore((s) => s.status);
  const crashReason = useAtwoodElevatorStore((s) => s.crashReason);
  const showResultModal = useAtwoodElevatorStore((s) => s.showResultModal);

  const counterweightMass = useAtwoodElevatorStore((s) => s.counterweightMass);
  const setCounterweightMass = useAtwoodElevatorStore((s) => s.setCounterweightMass);
  const releaseBrakes = useAtwoodElevatorStore((s) => s.releaseBrakes);
  const resetSimulation = useAtwoodElevatorStore((s) => s.resetSimulation);
  const nextRound = useAtwoodElevatorStore((s) => s.nextRound);
  const startMission = useAtwoodElevatorStore((s) => s.startMission);

  const elevatorY = useAtwoodElevatorStore((s) => s.elevatorY);
  const velocity = useAtwoodElevatorStore((s) => s.velocity);
  const acceleration = useAtwoodElevatorStore((s) => s.acceleration);
  const tension = useAtwoodElevatorStore((s) => s.tension);
  const landingVelocity = useAtwoodElevatorStore((s) => s.landingVelocity);
  const stars = useAtwoodElevatorStore((s) => s.stars);
  const score = useAtwoodElevatorStore((s) => s.score);

  const { cabinMass, targetAccel, gravity, shaftHeight } = stageConfig;
  const isWon = status === "success";
  const isGameOver = status === "fail";
  const isMoving = status === "moving" || status === "landing_soft" || status === "cargo_shatter";

  // Real-time calculation
  const currentA = status === "idle"
    ? ((cabinMass - counterweightMass) / (cabinMass + counterweightMass)) * gravity
    : acceleration;

  const currentT = status === "idle"
    ? (2 * cabinMass * counterweightMass * gravity) / (cabinMass + counterweightMass)
    : tension;

  // Clear, complete pedagogical explanation & step-by-step mathematical derivation
  const flightCalculation = useMemo(() => {
    const m1 = cabinMass;
    const m2 = counterweightMass;
    const g = gravity;
    const a = ((m1 - m2) / (m1 + m2)) * g;
    const T = (2 * m1 * m2 * g) / (m1 + m2);

    // Exact theoretical mass calculation for this stage
    const m2_exact = m1 * ((g - targetAccel) / (g + targetAccel));

    return {
      title: "Atwood Machine Mechanics: Elevator & Counterweight",
      concept: "Newton's Second Law on Coupled Systems (F_{net} = m_{total} a)",
      conclusion:
        "The counterweight opposes the elevator's gravity, reducing net downward pull. By balancing the masses so net acceleration matches the target, the elevator docks softly on the hydraulic shock absorbers with zero cargo damage.",
      formulas: [
        {
          label: "1. Master Atwood Acceleration",
          formula: "a = \\frac{m_1 - m_2}{m_1 + m_2} g",
          explanation: "Net driving gravitational force divided by total system inertia.",
        },
        {
          label: "2. Counterweight Inversion Formula",
          formula: "m_2 = m_1 \\cdot \\frac{g - a_{\\text{target}}}{g + a_{\\text{target}}}",
          explanation: "Use this formula to calculate the exact counterweight mass needed to win!",
        },
        {
          label: "3. Cable Suspension Tension",
          formula: "T = \\frac{2 m_1 m_2}{m_1 + m_2} g",
          explanation: "Tension supported by the cable while both bodies accelerate.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Elevator Cabin Free-Body Equation (m₁)",
          math: "m_1 g - T = m_1 a",
          explanation:
            "The cabin accelerates downward. Gravity pulls it downward with weight m₁g, while upward cable tension T opposes the fall.",
        },
        {
          step: 2,
          title: "Counterweight Free-Body Equation (m₂)",
          math: "T - m_2 g = m_2 a",
          explanation:
            "The counterweight is pulled upward with the same acceleration a. Cable tension T hoists it upward against its downward weight m₂g.",
        },
        {
          step: 3,
          title: "Coupled Atwood Acceleration Solution",
          math: "a = \\frac{m_1 - m_2}{m_1 + m_2} g",
          explanation:
            "Adding the two equations eliminates internal tension T. The net accelerating force is (m₁ - m₂)g acting on total inertia (m₁ + m₂).",
        },
        {
          step: 4,
          title: "Solving for the Target Counterweight (m₂)",
          math: "m_2 = m_1 \\cdot \\frac{g - a_{\\text{target}}}{g + a_{\\text{target}}}",
          explanation:
            "Rearranging the Atwood equation isolates m₂ in terms of cabin mass m₁, gravity g, and your desired target acceleration a.",
        },
        {
          step: 5,
          title: "Exact Calculation for Current Stage",
          math: "m_2 = " + m1 + " \\cdot \\frac{" + g + " - " + targetAccel + "}{" + g + " + " + targetAccel + "} \\approx " + m2_exact.toFixed(1) + "\\text{ kg}",
          explanation:
            "Plug in the stage values: Cabin m₁ = " + m1 + " kg, g = " + g + " m/s², target a = " + targetAccel + " m/s². Setting the counterweight rack to ≈ " + m2_exact.toFixed(1) + " kg will produce the exact safe descent rate!",
        },
        {
          step: 6,
          title: "Touchdown Velocity & Safe Kinetic Energy",
          math: "v_{\\text{dock}} = \\sqrt{2 a h}",
          explanation:
            "If counterweight m₂ is too light, acceleration exceeds safe limits and high impact velocity shatters the cargo. If m₂ > m₁, the elevator flies upward into the pulley!",
        },
      ],
    };
  }, [cabinMass, counterweightMass, gravity, shaftHeight, targetAccel]);

  return (
    <GameHUDContainer
      title="Atwood Elevator Silo"
      topicName="Newton's 2nd Law: Atwood Systems & Tension"
      difficulty="medium"
      xpReward={400}
      onReset={resetSimulation}
      onMissionStart={startMission}
      hideTopBar={true}
      hideEyeButton={true}
      hideRestartButton={false}
      showExitButton={true}
      isLight={true}
      calculation={flightCalculation}
      topCenterHUD={
        <div className="flex items-center gap-2.5 sm:gap-3 bg-white/95 backdrop-blur-xl border border-slate-300 px-4 py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.12)] select-none font-mono text-xs">
          <span className="text-slate-800 font-bold tracking-wide">STAGE {currentRound}/3</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700 font-semibold tracking-wide flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-blue-600" />
            <span>TARGET ACCEL:</span>
            <strong className="text-blue-600 font-bold">{targetAccel.toFixed(2)} m/s²</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700 font-semibold tracking-wide flex items-center gap-1.5">
            <Weight className="w-3.5 h-3.5 text-amber-600" />
            <span>CABIN:</span>
            <strong className="text-amber-700 font-bold">{cabinMass} kg</strong>
          </span>
        </div>
      }
      instructionsOverlay={{
        title: "Atwood Elevator Operations Manual",
        instructions: [
          {
            title: "Load Counterweight",
            badge: "Adjust m₂ Mass",
            description: "Calculate and set the digital rack mass so the downward acceleration matches the safe target rate.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%202/Topic%203/medium/1.png",
          },
          {
            title: "Release Brakes",
            badge: "Soft Touchdown",
            description: "Disengage brakes to descend. The elevator must land gently on shock absorbers without shattering cargo.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%202/Topic%203/medium/2.png",
          },
        ],
        tip: "Tip: Use the formula m₂ = m₁ · (g - a) / (g + a) to compute the exact balance mass before releasing brakes.",
      }}
      briefing={{
        target: "Deliver the fragile quantum cargo safely to the bottom dock without shattering or crashing across all 3 test stages.",
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%202/Topic%203/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Calculate Counterweight Mass",
            description: "Use m₂ = m₁ · (g - a)/(g + a) to find the counterweight mass for safe descent acceleration.",
          },
          {
            step: 2,
            title: "Release Brakes",
            description: "Click RELEASE BRAKES to let the coupled Atwood system descend smoothly.",
          },
          {
            step: 3,
            title: "Gentle Shock Absorption",
            description: "The hydraulic pistons compress softly at touchdown, keeping the quantum core intact.",
          },
        ],
        formulas: [
          {
            label: "1. Atwood Acceleration",
            formula: "a = \\frac{m_1 - m_2}{m_1 + m_2} g",
            explanation: "Net driving weight divided by total coupled mass.",
          },
          {
            label: "2. Required Mass Formula",
            formula: "m_2 = m_1 \\cdot \\frac{g - a}{g + a}",
            explanation: "Solve for counterweight mass to hit the target descent acceleration.",
          },
        ],
      }}
      result={
        showResultModal && (isWon || isGameOver)
          ? {
              isWon,
              isGameOver,
              onRetry: resetSimulation,
              onNextTier: isWon && currentRound < 3 ? nextRound : undefined,
              nextTierLabel: currentRound < 3 ? "PROCEED TO STAGE " + (currentRound + 1) : "REPLAY CHALLENGE",
              failureReason: isGameOver
                ? crashReason || "Mission failed! Check your Atwood calculation and try again."
                : undefined,
              tip: "Tactical Tip: If acceleration is too high, increase counterweight mass; if m₂ > m₁, the elevator will fly into the pulley!",
              stats: [
                {
                  label: "Mission Status",
                  value: isWon
                    ? currentRound === 3
                      ? "Orbital Silo Conquered! 🏆"
                      : "Stage " + currentRound + " Cleared! 🚀"
                    : "Failure 💥",
                },
                { label: "Stage", value: "Stage " + currentRound + " / 3" },
                { label: "Elevator Mass (m₁)", value: cabinMass + " kg" },
                { label: "Counterweight (m₂)", value: counterweightMass.toFixed(1) + " kg" },
                { label: "Actual Acceleration", value: Math.abs(currentA).toFixed(2) + " m/s²" },
                { label: "Target Acceleration", value: targetAccel.toFixed(2) + " m/s²" },
                { label: "Cable Tension", value: Math.round(currentT) + " N" },
                { label: "Stars", value: isWon ? stars + " / 3" : "0 / 3" },
                { label: "Score", value: score },
              ],
              calculation: flightCalculation,
            }
          : undefined
      }
      bottomDock={
        <div className="flex flex-col items-center gap-1.5 sm:gap-2 pointer-events-auto select-none pb-2 sm:pb-4 max-lg:landscape:pb-1 max-w-2xl max-lg:landscape:max-w-xl mx-auto w-full px-3 sm:px-4">
          {/* Light-Themed Modern Control Capsule */}
          <div className="py-2.5 px-4 sm:py-3.5 sm:px-5 max-lg:landscape:py-1.5 max-lg:landscape:px-3.5 flex items-center justify-between gap-3 sm:gap-5 max-lg:landscape:gap-2.5 rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300/90 shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-full">
            {/* Counterweight Mass Controls */}
            <div className="flex flex-col flex-1 min-w-0 pr-1 sm:pr-2 justify-center">
              {/* Header Label & Telemetry */}
              <div className="flex items-center justify-between text-xs max-lg:landscape:text-[10px] font-mono mb-1.5 sm:mb-2 max-lg:landscape:mb-1">
                <span className="text-slate-700 font-semibold flex items-center gap-1.5 sm:gap-2 truncate">
                  <Weight className="w-4 h-4 max-lg:landscape:w-3.5 max-lg:landscape:h-3.5 text-blue-600 shrink-0" />
                  <span className="tracking-wide uppercase text-[11px] sm:text-xs text-slate-600 font-bold">
                    Counterweight (m₂)
                  </span>
                  <span className="text-slate-300">|</span>
                  <strong className="text-blue-600 font-bold text-xs sm:text-sm max-lg:landscape:text-xs">
                    {counterweightMass.toFixed(1)}
                  </strong>
                  <span className="text-slate-500 text-[10px] sm:text-xs font-medium">kg</span>
                </span>
                {isMoving && (
                  <span className="text-blue-600 text-[10px] sm:text-xs font-mono font-bold animate-pulse shrink-0 ml-2">
                    a = {Math.abs(acceleration).toFixed(2)} m/s²
                  </span>
                )}
              </div>

              {/* Slider & Quick Steppers (Light Theme) */}
              <div className="flex items-center gap-1.5 sm:gap-2 max-lg:landscape:gap-1">
                <button
                  type="button"
                  disabled={isMoving}
                  onClick={() => setCounterweightMass(Math.max(stageConfig.minCounterweight, counterweightMass - 10))}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-6 max-lg:landscape:h-6 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Decrease 10 kg"
                >
                  -10
                </button>
                <button
                  type="button"
                  disabled={isMoving}
                  onClick={() => setCounterweightMass(Math.max(stageConfig.minCounterweight, counterweightMass - 1))}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-6 max-lg:landscape:h-6 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Decrease 1 kg"
                >
                  -1
                </button>

                <input
                  type="range"
                  min={stageConfig.minCounterweight}
                  max={stageConfig.maxCounterweight}
                  step={stageConfig.stepCounterweight}
                  value={counterweightMass}
                  disabled={isMoving}
                  onChange={(e) => setCounterweightMass(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600 h-2 max-lg:landscape:h-1.5 bg-slate-200 rounded-lg cursor-pointer border border-slate-300/80 disabled:cursor-not-allowed mx-1"
                />

                <button
                  type="button"
                  disabled={isMoving}
                  onClick={() => setCounterweightMass(Math.min(stageConfig.maxCounterweight, counterweightMass + 1))}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-6 max-lg:landscape:h-6 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Increase 1 kg"
                >
                  +1
                </button>
                <button
                  type="button"
                  disabled={isMoving}
                  onClick={() => setCounterweightMass(Math.min(stageConfig.maxCounterweight, counterweightMass + 10))}
                  className="w-7 h-7 sm:w-8 sm:h-8 max-lg:landscape:w-6 max-lg:landscape:h-6 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[11px] sm:text-xs font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Increase 10 kg"
                >
                  +10
                </button>
              </div>
            </div>

            {/* Launch / Release Brakes Button */}
            <button
              type="button"
              disabled={isMoving}
              onClick={releaseBrakes}
              className={`h-10 sm:h-12 max-lg:landscape:h-8 px-4 sm:px-6 max-lg:landscape:px-3 rounded-full font-bold text-xs sm:text-sm max-lg:landscape:text-[11px] tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap active:scale-95 shadow-md shrink-0 self-center ${
                isMoving
                  ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] cursor-pointer"
              }`}
            >
              <Zap className="w-4 h-4 max-lg:landscape:w-3 max-lg:landscape:h-3 fill-current shrink-0" />
              <span>{isMoving ? "DESCENDING..." : "RELEASE BRAKES"}</span>
            </button>
          </div>
        </div>
      }
    />
  );
}
