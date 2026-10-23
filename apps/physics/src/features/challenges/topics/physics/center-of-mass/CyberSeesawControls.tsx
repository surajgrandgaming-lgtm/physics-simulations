"use client";

import React, { useMemo } from "react";
import {
  RotateCcw,
  Play,
  Sliders,
} from "lucide-react";
import { GameHUDContainer } from "@/features/challenges/hud/GameHUDContainer";
import {
  useCyberSeesawStore,
  SEESAW_STAGES,
} from "@/three/challenges/physics/center-of-mass/CyberSeesawStore";

export function CyberSeesawControls({ config }: { config?: any }) {
  const currentStage = useCyberSeesawStore((s) => s.currentStage);
  const status = useCyberSeesawStore((s) => s.status);
  const sliderPosition = useCyberSeesawStore((s) => s.sliderPosition);
  const beamAngle = useCyberSeesawStore((s) => s.beamAngle);
  const xCOM = useCyberSeesawStore((s) => s.xCOM);
  const stars = useCyberSeesawStore((s) => s.stars);
  const score = useCyberSeesawStore((s) => s.score);
  const crashReason = useCyberSeesawStore((s) => s.crashReason);
  const showResultModal = useCyberSeesawStore((s) => s.showResultModal);

  const setSliderPosition = useCyberSeesawStore((s) => s.setSliderPosition);
  const adjustSliderPosition = useCyberSeesawStore((s) => s.adjustSliderPosition);
  const testBalance = useCyberSeesawStore((s) => s.testBalance);
  const resetSimulation = useCyberSeesawStore((s) => s.resetSimulation);
  const nextStage = useCyberSeesawStore((s) => s.nextStage);

  const stage = SEESAW_STAGES[currentStage - 1];
  const isWon = status === "success";
  const isGameOver = status === "fail_left" || status === "fail_right";
  const isTesting = status === "testing";

  // Comprehensive mathematical derivation and deep physics explanation
  const calculationDerivation = useMemo(() => {
    if (stage.stage === 1) {
      return {
        title: "Alpine Test Bench: Two-Mass Centroid Equilibrium",
        concept: "In static equilibrium, a system balances about a pivot if the net gravitational torque is zero (Σ τ = 0). Because gravity acts uniformly across all mass elements, the total gravitational torque about the fulcrum is τ_net = M_total · g · X_cm. Therefore, achieving horizontal balance is physically and mathematically identical to locating the system's Center of Mass directly on the vertical fulcrum axis (X_cm = 0.0m).",
        formula: "X_{\\text{cm}} = \\frac{m_1 x_1 + m_2 x_2}{m_1 + m_2} = 0 \\implies m_1 x_1 + m_2 x_2 = 0",
        steps: [
          {
            step: 1,
            title: "1. Coordinate Origin & Sign Convention",
            math: "x_{\\text{pivot}} = 0 \\quad (x < 0 \\text{ is Left}, \\, x > 0 \\text{ is Right})",
            explanation: "The central fulcrum is fixed at coordinate origin x = 0. All distances to the left are negative, and distances to the right are positive.",
          },
          {
            step: 2,
            title: "2. Calculate Fixed Payload First Moment",
            math: "m_1 x_1 = (12.0\\text{ kg})(-3.50\\text{ m}) = -42.0\\text{ kg}\\cdot\\text{m}",
            explanation: "The 12kg science payload is clamped at x₁ = -3.50m, producing 42.0 kg·m of counter-clockwise (left-tilting) moment.",
          },
          {
            step: 3,
            title: "3. Apply Center of Mass Equilibrium Condition",
            math: "\\sum m_i x_i = 0 \\implies m_1 x_1 + m_2 x_2 = 0 \\implies (6.0\\text{ kg}) x_2 = 42.0\\text{ kg}\\cdot\\text{m}",
            explanation: "For the center of mass to lie exactly over the fulcrum, the clockwise moment of the 6kg counterweight must cancel the left moment.",
          },
          {
            step: 4,
            title: "4. Solve for Equilibrium Counterweight Coordinate",
            math: "x_2 = \\frac{42.0}{6.0} = +7.00\\text{ m}",
            explanation: "Because the counterweight (6kg) is exactly half the payload mass (12kg), it must be placed at twice the distance (7.0m vs 3.5m).",
          },
          {
            step: 5,
            title: "5. Numerical Verification of Centroid",
            math: "X_{\\text{cm}} = \\frac{12(-3.5) + 6(+7.0)}{12 + 6} = \\frac{-42 + 42}{18} = 0.000\\text{ m}",
            explanation: "When dialed to +7.00m, the net gravitational torque is zero (τ = M_total · g · X_cm = 0), allowing the beam to settle level.",
          },
        ],
        conclusion: "Center of Mass is an inverse mass-weighted average position. A lighter mass balances a heavier mass when their distances from the pivot are inversely proportional to their masses: x₂ / |x₁| = m₁ / m₂.",
      };
    } else if (stage.stage === 2) {
      return {
        title: "Subterranean Foundry: Multi-Mass Composite System",
        concept: "Superposition of multiple discrete mass moments balanced by a single counterweight across a central pivot.",
        formula: "X_{\\text{cm}} = \\frac{\\sum_{i=1}^{n} m_i x_i}{\\sum_{i=1}^{n} m_i} = 0 \\implies \\sum m_i x_i = 0",
        steps: [
          {
            step: 1,
            title: "1. Payload 1 First Moment",
            math: "m_1 x_1 = (10.0\\text{ kg})(-4.00\\text{ m}) = -40.0\\text{ kg}\\cdot\\text{m}",
            explanation: "The primary 10kg crucible payload is clamped at x₁ = -4.00m.",
          },
          {
            step: 2,
            title: "2. Payload 2 First Moment",
            math: "m_2 x_2 = (6.0\\text{ kg})(-1.50\\text{ m}) = -9.0\\text{ kg}\\cdot\\text{m}",
            explanation: "The secondary 6kg auxiliary payload is clamped at x₂ = -1.50m.",
          },
          {
            step: 3,
            title: "3. Total Left-Side Counter-Clockwise Moment",
            math: "\\sum_{\\text{left}} m_i x_i = -40.0 + (-9.0) = -49.0\\text{ kg}\\cdot\\text{m}",
            explanation: "By the principle of superposition, the net left-hand moment is the algebraic sum of the individual moments.",
          },
          {
            step: 4,
            title: "4. Counterweight Equilibrium Equation",
            math: "m_3 x_3 + (-49.0) = 0 \\implies (7.0\\text{ kg}) x_3 = 49.0\\text{ kg}\\cdot\\text{m}",
            explanation: "The single 7kg counterweight on the right rail must generate an equal and opposite +49.0 kg·m clockwise moment.",
          },
          {
            step: 5,
            title: "5. Solve for Target Counterweight Coordinate",
            math: "x_3 = \\frac{49.0}{7.0} = +7.00\\text{ m}",
            explanation: "Placing the 7kg counterweight at +7.00m brings the composite multi-mass system into exact horizontal equilibrium.",
          },
        ],
        conclusion: "The Principle of Superposition: in any composite multi-body system, each body contributes independently to the first moment of mass (m_i · x_i). The counterweight must cancel the sum of all individual payload moments.",
      };
    } else {
      return {
        title: "Orbital Gantry: Asymmetric Heavy Beam (The Classic JEE Trap)",
        concept: "Accounting for the self-weight and off-center centroid of a distributed rigid body combined with discrete point masses.",
        formula: "X_{\\text{cm}} = \\frac{m_1 x_1 + M_{\\text{plank}} X_{\\text{plank}} + m_2 x_2}{m_1 + M_{\\text{plank}} + m_2} = 0",
        steps: [
          {
            step: 1,
            title: "1. Locating the Beam's Own Center of Mass (The Trap!)",
            math: "X_{\\text{plank}} = \\frac{x_{\\text{left}} + x_{\\text{right}}}{2} = \\frac{-7.50 + 6.50}{2} = -0.50\\text{ m}",
            explanation: "The 14m beam spans from -7.5m (left) to +6.5m (right) relative to the pivot. Its geometric midpoint is shifted 0.50m to the left of the fulcrum!",
          },
          {
            step: 2,
            title: "2. The Beam's Self-Weight Moment Contribution",
            math: "M_{\\text{plank}} X_{\\text{plank}} = (20.0\\text{ kg})(-0.50\\text{ m}) = -10.0\\text{ kg}\\cdot\\text{m}",
            explanation: "The beam itself acts as an extra 20kg mass concentrated at x = -0.50m, producing -10.0 kg·m of left-side moment.",
          },
          {
            step: 3,
            title: "3. Fixed Payload First Moment",
            math: "m_1 x_1 = (10.0\\text{ kg})(-4.50\\text{ m}) = -45.0\\text{ kg}\\cdot\\text{m}",
            explanation: "The 10kg quantum beacon at x₁ = -4.50m produces -45.0 kg·m of moment.",
          },
          {
            step: 4,
            title: "4. Total Left-Side Moment (Beam + Payload)",
            math: "\\text{Total Left Moment} = -45.0 + (-10.0) = -55.0\\text{ kg}\\cdot\\text{m}",
            explanation: "Notice that the plank adds an extra -10.0 kg·m that naive students forget to include!",
          },
          {
            step: 5,
            title: "5. The Fatal JEE Student Trap vs True Solution",
            math: "\\begin{aligned} \\text{Naive Trap (massless beam): } & 10 x_2 = 45 \\implies x_2 = 4.50\\text{ m} \\quad \\text{(Crashes left!)} \\\\ \\text{True Solution (with beam): } & 10 x_2 = 55 \\implies x_2 = +5.50\\text{ m} \\quad \\text{(Balances level!)} \\end{aligned}",
            explanation: "Dialing 4.50m leaves the beam's own 10 kg·m moment uncompensated, causing a severe leftward crash! True equilibrium requires x₂ = +5.50m.",
          },
        ],
        conclusion: "The #1 JEE Rotational Trap: Students routinely treat structural beams and planks as massless rods. Whenever a fulcrum is off-center, you MUST treat the rigid body as a concentrated point mass M located at its geometric centroid X_cm. Forgetting self-weight leads to disastrous balance failures!",
      };
    }
  }, [stage]);

  return (
    <GameHUDContainer
      title="Cyber-Seesaw: System Equilibrium"
      topicName="Center of Mass & System Balance"
      difficulty="medium"
      xpReward={400}
      onReset={resetSimulation}
      hideTopBar={true}
      hideEyeButton={true}
      hideRestartButton={false}
      showExitButton={true}
      isLight={true}
      calculation={calculationDerivation}
      briefing={{
        target: "Calibrate counterweight position x to align the system Center of Mass directly over the pivot (X_cm = 0.0m).",
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%203/Topic%201/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Identify All Mass Coordinates",
            description: "Locate the coordinate x_i of every payload and the beam's own centroid relative to the fulcrum origin (x = 0).",
          },
          {
            step: 2,
            title: "Apply Center of Mass Equilibrium",
            description: "Set Σ m_i x_i + M_plank X_plank = 0 to cancel all clockwise and counter-clockwise first moments.",
          },
          {
            step: 3,
            title: "Beware of Off-Center Fulcrums (JEE Trap)",
            description: "In Stage 3, the beam's own 20kg mass acts at its physical centroid (-0.5m), not at the pivot!",
          },
        ],
        formulas: [
          {
            label: "1. System Center of Mass Definition",
            formula: "X_{\\text{cm}} = \\frac{\\sum_{i=1}^{n} m_i x_i + M_{\\text{plank}} X_{\\text{plank}}}{\\sum_{i=1}^{n} m_i + M_{\\text{plank}}}",
            explanation: "Center of Mass is the mass-weighted average spatial coordinate of all discrete payloads and continuous structural elements.",
          },
          {
            label: "2. Torque & Center of Mass Equivalence",
            formula: "\\tau_{\\text{net}} = \\sum (x_i \\times m_i g) = g \\sum m_i x_i = M_{\\text{total}} \\, g \\, X_{\\text{cm}}",
            explanation: "When X_cm = 0, the gravitational moment arm vanishes, guaranteeing zero net torque regardless of gravity g.",
          },
          {
            label: "3. Zero-Torque Horizontal Equilibrium",
            formula: "\\sum m_i x_i + M_{\\text{plank}} X_{\\text{plank}} = 0",
            explanation: "All clockwise moments on the right rail (x > 0) must exactly balance all counter-clockwise moments on the left rail (x < 0).",
          },
        ],
      }}
      instructionsOverlay={{
        title: "HOW TO PLAY & INSTRUCTIONS",
        instructions: [
          {
            title: "Compute System Centroid",
            description: "Sum the first moments of mass (m × x) on both sides of the fulcrum origin (x = 0).",
            imageUrl: "https://topcoaching.b-cdn.net/Module%203/Topic%201/medium/1.png",
          },
          {
            title: "Dial Position Slider",
            description: "Adjust the counterweight position x on the right rail using the slider and stepper buttons below.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%203/Topic%201/medium/2.png",
          },
          {
            title: "Test Mechanical Balance",
            description: "Click TEST BALANCE to retract the hydraulic jacks and observe if the beam stays perfectly horizontal.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%203/Topic%201/medium/3.png",
          },
        ],
        tip: "Tactical Tip: Always remember that mass to the left of the fulcrum has negative coordinates (x < 0)!",
      }}
      bottomDock={
        <div className="flex flex-col items-center pointer-events-auto select-none w-full px-3 sm:px-4 pb-4 sm:pb-5 max-lg:landscape:pb-1 max-w-xl max-lg:landscape:max-w-lg mx-auto">
          {/* Main Controls Capsule - 2-Column Responsive Layout */}
          <div className="w-full py-1.5 px-3 sm:py-2 sm:px-4 max-lg:landscape:py-0.5 max-lg:landscape:px-2.5 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-2xl border border-slate-300/90 shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex items-center justify-between gap-2.5 sm:gap-4 max-lg:landscape:gap-2">
            {/* Left Column: Counterweight Position Readout & Slider + Steppers */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              {/* Position Header Tag above Slider */}
              <div className="flex items-center gap-1.5 mb-1 max-lg:landscape:mb-0 px-0.5">
                <Sliders className="w-3 h-3 max-lg:landscape:w-2.5 max-lg:landscape:h-2.5 text-cyan-600 shrink-0" />
                <span className="text-[10px] sm:text-[11px] max-lg:landscape:text-[9px] font-mono font-bold text-slate-700 tracking-wider uppercase truncate">
                  COUNTERWEIGHT POSITION:
                </span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-700 font-mono font-black text-[11px] sm:text-xs max-lg:landscape:text-[9.5px] shadow-xs shrink-0">
                  +{sliderPosition.toFixed(2)} m
                </span>
              </div>

              {/* Stepper Buttons & Slider Bar */}
              <div className="flex items-center gap-1 sm:gap-1.5 max-lg:landscape:gap-1">
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={() => adjustSliderPosition(-1.0)}
                  className="w-6 h-6 sm:w-7 sm:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Decrease 1.0 m"
                >
                  -1.0
                </button>
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={() => adjustSliderPosition(-0.1)}
                  className="w-6 h-6 sm:w-7 sm:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Decrease 0.1 m"
                >
                  -0.1
                </button>

                <input
                  type="range"
                  disabled={isTesting}
                  min={stage.sliderMin}
                  max={stage.sliderMax}
                  step={stage.sliderStep}
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-600 h-1.5 sm:h-2 max-lg:landscape:h-1 bg-slate-200 rounded-lg cursor-pointer border border-slate-300 disabled:opacity-40 mx-0.5 sm:mx-1 min-w-[45px]"
                />

                <button
                  type="button"
                  disabled={isTesting}
                  onClick={() => adjustSliderPosition(0.1)}
                  className="w-6 h-6 sm:w-7 sm:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Increase 0.1 m"
                >
                  +0.1
                </button>
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={() => adjustSliderPosition(1.0)}
                  className="w-6 h-6 sm:w-7 sm:h-7 max-lg:landscape:w-5 max-lg:landscape:h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all text-[10px] sm:text-xs max-lg:landscape:text-[9px] font-bold shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                  title="Increase 1.0 m"
                >
                  +1.0
                </button>
              </div>
            </div>

            {/* Right Column: Reset & Test Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 max-lg:landscape:gap-1 shrink-0 self-center">
              <button
                type="button"
                onClick={resetSimulation}
                className="h-7 sm:h-8 max-lg:landscape:h-6 px-2 sm:px-2.5 max-lg:landscape:px-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-mono font-bold text-[10px] sm:text-xs max-lg:landscape:text-[9px] flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                title="Reset Simulation"
              >
                <RotateCcw className="w-3 h-3 max-lg:landscape:w-2.5 max-lg:landscape:h-2.5 text-slate-500" />
                <span className="hidden sm:inline">RESET</span>
              </button>

              <button
                type="button"
                onClick={testBalance}
                disabled={isTesting}
                className={
                  "h-7.5 sm:h-8.5 max-lg:landscape:h-6.5 px-3 sm:px-4 max-lg:landscape:px-2.5 rounded-full font-mono font-black text-[10.5px] sm:text-xs max-lg:landscape:text-[9px] tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md cursor-pointer whitespace-nowrap " +
                  (isTesting
                    ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 text-white shadow-cyan-500/25 border border-cyan-400/30 hover:scale-[1.02]")
                }
              >
                <Play className="w-3 h-3 max-lg:landscape:w-2.5 max-lg:landscape:h-2.5 fill-white shrink-0" />
                <span>{isTesting ? "TESTING..." : "TEST BALANCE"}</span>
              </button>
            </div>
          </div>
        </div>
      }
      result={
        showResultModal && (isWon || isGameOver)
          ? {
              isWon,
              isGameOver,
              onRetry: resetSimulation,
              onNextTier: isWon && currentStage < 3 ? nextStage : undefined,
              nextTierLabel:
                currentStage < 3
                  ? "PROCEED TO STAGE " + (currentStage + 1)
                  : "REPLAY CHALLENGE",
              failureReason: isGameOver ? crashReason || "Beam tilted out of equilibrium." : undefined,
              tip: stage.explanationTrap,
              stats: [
                {
                  label: "Mission Status",
                  value: isWon
                    ? currentStage === 3
                      ? "Master of Centroids Achieved!"
                      : "Stage " + currentStage + " Cleared!"
                    : status === "fail_left"
                    ? "Left Side Heavy (Tilted Left)"
                    : "Right Side Heavy (Tilted Right)",
                },
                {
                  label: "Selected Counterweight Position",
                  value: "+" + sliderPosition.toFixed(2) + " m",
                },
                {
                  label: "Exact Equilibrium Position",
                  value: "+" + stage.exactTargetX.toFixed(2) + " m",
                },
                {
                  label: "System Center of Mass (X_cm)",
                  value: (xCOM >= 0 ? "+" : "") + xCOM.toFixed(3) + " m (Target: 0.000 m)",
                },
                {
                  label: "Final Beam Tilt",
                  value: (beamAngle * (180 / Math.PI)).toFixed(1) + "° (Target: 0.0°)",
                },
                { label: "Stars", value: isWon ? stars + " / 3" : "0 / 3" },
                { label: "Score", value: score },
              ],
              calculation: calculationDerivation,
            }
          : undefined
      }
    />
  );
}
