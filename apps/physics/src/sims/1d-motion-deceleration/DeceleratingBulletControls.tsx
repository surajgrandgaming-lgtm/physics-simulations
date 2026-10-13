"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  useDeceleratingBulletStore,
  BallisticCameraMode,
  BALLISTIC_MISSIONS,
} from "@/three/challenges/physics/1d-motion-deceleration/DeceleratingBulletStore";
import {
  GameHUDContainer,
  HUDPanel,
  SpeedometerDial,
  CircularRingGauge,
  TelemetryGrid,
  ResourceGauge,
  TactileThrottleControl,
  MobileActionTrigger,
} from "@/features/challenges/hud";
import {
  Crosshair,
  RotateCcw,
  Gauge,
  Trophy,
  Flame,
  Layers,
  Sparkles,
  ChevronRight,
  Zap,
  Plus,
  Minus,
  Shield,
  Target,
} from "lucide-react";
import { playChallengeSound } from "@/lib/audio/challengeAudio";

interface Props {
  config?: any;
}

export function DeceleratingBulletControls({ config }: Props) {
  const currentRound = useDeceleratingBulletStore((s) => s.currentRound);
  const initialVelocity = useDeceleratingBulletStore((s) => s.initialVelocity);
  const minSliderV = useDeceleratingBulletStore((s) => s.minSliderV);
  const maxSliderV = useDeceleratingBulletStore((s) => s.maxSliderV);
  const layer1Thickness = useDeceleratingBulletStore((s) => s.layer1Thickness);
  const layer1Beta = useDeceleratingBulletStore((s) => s.layer1Beta);
  const layer2Thickness = useDeceleratingBulletStore((s) => s.layer2Thickness);
  const layer2Beta = useDeceleratingBulletStore((s) => s.layer2Beta);
  const targetMinDepth = useDeceleratingBulletStore((s) => s.targetMinDepth);
  const targetMaxDepth = useDeceleratingBulletStore((s) => s.targetMaxDepth);
  const totalScore = useDeceleratingBulletStore((s) => s.totalScore);
  const phase = useDeceleratingBulletStore((s) => s.phase);
  const actualExitVelocity = useDeceleratingBulletStore((s) => s.actualExitVelocity);
  const actualPenetrationDepth = useDeceleratingBulletStore((s) => s.actualPenetrationDepth);
  const stoppedInZone = useDeceleratingBulletStore((s) => s.stoppedInZone);
  const breachedLayer1 = useDeceleratingBulletStore((s) => s.breachedLayer1);
  const breachedLayer2 = useDeceleratingBulletStore((s) => s.breachedLayer2);

  const setInitialVelocity = useDeceleratingBulletStore((s) => s.setInitialVelocity);
  const adjustVelocity = useDeceleratingBulletStore((s) => s.adjustVelocity);
  const autoCalibrate = useDeceleratingBulletStore((s) => s.autoCalibrate);
  const fireRound = useDeceleratingBulletStore((s) => s.fireRound);
  const nextRound = useDeceleratingBulletStore((s) => s.nextRound);
  const reset = useDeceleratingBulletStore((s) => s.reset);
  const getLiveSpeed = useDeceleratingBulletStore((s) => s.getLiveSpeed);
  const getLiveDepth = useDeceleratingBulletStore((s) => s.getLiveDepth);

  const [liveSpeed, setLiveSpeed] = useState<number>(initialVelocity);
  const [liveDepth, setLiveDepth] = useState<number>(0);

  useEffect(() => {
    let animId: number;
    const update = () => {
      setLiveSpeed(getLiveSpeed());
      setLiveDepth(getLiveDepth());
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [getLiveSpeed, getLiveDepth, initialVelocity]);

  const totalLength = layer1Thickness + layer2Thickness;
  const isFinished = phase === "completed";
  const isFiring = phase === "firing";
  const machSpeed = (initialVelocity / 343).toFixed(1);

  // Exact analytical prediction
  const V_STOP_THRESHOLD = 10.0;
  const v1Predicted = initialVelocity * Math.exp(-layer1Beta * layer1Thickness);
  let predictedStopX: number;
  if (v1Predicted <= V_STOP_THRESHOLD) {
    predictedStopX = Math.max(0, (1 / layer1Beta) * Math.log(initialVelocity / V_STOP_THRESHOLD));
  } else {
    predictedStopX = layer1Thickness + (1 / layer2Beta) * Math.log(v1Predicted / V_STOP_THRESHOLD);
  }

  const isPredictedInZone =
    predictedStopX >= targetMinDepth && predictedStopX <= targetMaxDepth;

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        if (phase === "ready") {
          fireRound();
        } else if (phase === "completed") {
          if (stoppedInZone && currentRound < 3) {
            nextRound();
          } else {
            reset();
          }
        }
      } else if (e.code === "ArrowUp" && phase === "ready") {
        adjustVelocity(5);
      } else if (e.code === "ArrowDown" && phase === "ready") {
        adjustVelocity(-5);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, fireRound, nextRound, reset, stoppedInZone, currentRound, adjustVelocity]);

  return (
    <GameHUDContainer
      title="Hypervelocity Armor Penetration"
      topicName="1D Motion & Deceleration"
      difficulty="advanced"
      xpReward={200}
      onReset={reset}
      hideEyeButton={true}
      hideRestartButton={true}
      hideTopBar={true}
      instructionsOverlay={{
        title: "INSTRUCTIONS TO PLAY",
        instructions: [
          {
            title: "Tune Muzzle Speed",
            badge: "Bottom Throttle",
            description: "Hold [+] to CHARGE or [-] to VENT (or swipe) to adjust bullet launch velocity v0.",
          },
          {
            title: "Penetrate Composite Armor",
            badge: "2 Layers",
            description: "Round decelerates exponentially through Layer 1 (Ballistic Gel) and Layer 2 (Composite Armor).",
          },
          {
            title: "Lodge in Target Sensor Core",
            badge: `${targetMinDepth}m – ${targetMaxDepth}m`,
            description: "Calculate optimal muzzle velocity so the round halts precisely inside the Emerald Sensor Zone!",
          },
        ],
      }}
      briefing={{
        target: "Fire the bullet so it stops inside the target sensor zone",
        storyObjective:
          `A tungsten APFSDS sabot round is fired into a 2-layer composite target: Layer 1 (Ballistic Gel: ${layer1Thickness}m, β1=${layer1Beta}) and Layer 2 (Composite Armor: ${layer2Thickness}m, β2=${layer2Beta}). Adjust muzzle velocity (v0) using the tactile throttle and fire to lodge precisely in the Emerald Sensor Zone (${targetMinDepth}m - ${targetMaxDepth}m)!`,
        steps: [
          {
            step: 1,
            title: "Calculate Quadratic Drag Decay",
            description: "In dense media, velocity decays exponentially: v(x) = v0 · e^(-βx).",
          },
          {
            step: 2,
            title: "Tune Muzzle Throttle (Vent / Charge)",
            description: "Hold [+] to CHARGE or [-] to VENT, or swipe UP/DOWN to set exact muzzle velocity.",
            keys: ["Hold [+] / [-]", "Swipe Up/Down", "Auto-Tune"],
          },
          {
            step: 3,
            title: "Fire Sabot Cannon",
            description: "Tap Fire Sabot to breach Layer 1 and embed directly into the emerald sensor core.",
            keys: ["Space", "Fire Sabot"],
          },
        ],
        formulas: [
          {
            label: "Layer 1 Velocity Decay",
            formula: "v_1 = v_0 \\cdot e^{-\\beta_1 \\cdot d_1}",
            explanation: "Velocity of projectile upon exiting the first material layer.",
          },
          {
            label: "Layer 2 Penetration Velocity",
            formula: "v(x) = v_1 \\cdot e^{-\\beta_2 \\cdot (x - d_1)}",
            explanation: "Velocity inside second composite armor block.",
          },
          {
            label: "Master Velocity Inversion",
            formula: "v_0 = 10 \\cdot e^{\\beta_1 d_1 + \\beta_2 (x_{\\mathrm{target}} - d_1)}",
            explanation: "Calculates precise initial velocity to lodge projectile at target sensor depth.",
          },
        ],
      }}
      result={{
        isWon: isFinished && stoppedInZone,
        isGameOver: isFinished && !stoppedInZone,
        onNextTier: currentRound < 3 ? nextRound : undefined,
        nextTierUrl: currentRound === 3 ? "/physics/kinematics/relative-motion/challenge/easy" : undefined,
        nextTierLabel: currentRound < 3 ? `STAGE ${currentRound + 1}` : "TOPIC 1 COMPLETED",
        failureReason: breachedLayer2
          ? `Overpenetration! Projectile punched through outer armor shield (${(actualPenetrationDepth ?? totalLength).toFixed(2)}m > ${totalLength}m).`
          : !breachedLayer1
          ? `Underpenetration! Projectile halted inside Layer 1 at ${(actualPenetrationDepth ?? 0).toFixed(2)}m (Need > ${layer1Thickness}m).`
          : `Lodged at ${actualPenetrationDepth !== null ? actualPenetrationDepth.toFixed(2) : "0.00"}m (Outside ${targetMinDepth}m - ${targetMaxDepth}m sensor zone).`,
        tip: "Use the master inversion formula v0 = 10 · exp(β1·d1 + β2·(x_target - d1)) to calculate exact velocity.",
        stats: [
          { label: "Depth Reached", value: actualPenetrationDepth !== null ? actualPenetrationDepth.toFixed(2) : "0.00", unit: "m" },
          { label: "Target Zone", value: `${targetMinDepth} - ${targetMaxDepth}`, unit: "m" },
          { label: "Muzzle Speed", value: initialVelocity, unit: "m/s" },
        ],
        calculation: {
          title: "Drag Deceleration & Non-Linear Energy Absorption",
          concept: "1D Position-Dependent Exponential Velocity Decay",
          steps: [
            {
              step: 1,
              title: "Layer 1 Decay Profile",
              math: "v_1 = v_0 \\cdot e^{-\\beta_1 \\cdot d_1} = " + initialVelocity + " \\times e^{-" + layer1Beta + " \\times " + layer1Thickness + "} = " + (initialVelocity * Math.exp(-layer1Beta * layer1Thickness)).toFixed(1) + "\\text{ m/s}",
              calculation: `Breaching Layer 1 (${layer1Thickness}m of ballistic media) drops velocity from ${initialVelocity} m/s down to ${(initialVelocity * Math.exp(-layer1Beta * layer1Thickness)).toFixed(1)} m/s.`,
            },
            {
              step: 2,
              title: "Layer 2 Penetration to Sensor",
              math: "x_{\\mathrm{target}} - d_1 = " + (((targetMinDepth + targetMaxDepth) / 2) - layer1Thickness).toFixed(2) + "\\text{ m}",
              calculation: `The round must penetrate an additional ${(((targetMinDepth + targetMaxDepth) / 2) - layer1Thickness).toFixed(2)}m into the composite armor layer to halt at mid-sensor depth.`,
            },
            {
              step: 3,
              title: "Exact Required Muzzle Velocity",
              math: "v_0^* = 10 \\cdot e^{" + layer1Beta + " \\times " + layer1Thickness + " + " + layer2Beta + " \\times " + (((targetMinDepth + targetMaxDepth) / 2) - layer1Thickness).toFixed(2) + "}",
              calculation: `Optimal velocity to embed the sabot in the sensor core is approximately ${Math.round(10 * Math.exp(layer1Beta * layer1Thickness + layer2Beta * (((targetMinDepth + targetMaxDepth) / 2) - layer1Thickness)))} m/s.`,
            },
          ],
          conclusion:
            "Energy absorption under quadratic drag yields velocity decay exponential with distance: v(x) = v0·exp(-βx). Total penetration is governed by cumulative logarithmic resistance.",
        },
      }}
      bottomDock={
        <div className="flex flex-col items-center gap-2 pointer-events-auto select-none pb-2 sm:pb-3 max-w-xl mx-auto w-full px-3">
          {/* Real-time Telemetry & Armor Cross-Section Progress Bar */}
          <div className="flex flex-col items-center w-full pointer-events-none select-none">
            <div className="flex items-center justify-between w-full max-w-sm text-[11px] sm:text-xs font-mono font-bold tracking-wider text-cyan-100/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              <span>
                📍 DEPTH: {liveDepth.toFixed(2)}m / {totalLength}m
              </span>
              {isFiring ? (
                <span className="text-amber-400 animate-pulse">
                  {liveDepth < layer1Thickness ? "🔥 LAYER 1 (GEL)" : "⚡ LAYER 2 (ARMOR)"}
                </span>
              ) : isPredictedInZone ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
                  SENSOR LOCKED!
                </span>
              ) : (
                <span className="text-slate-400 font-normal">
                  Predicted: <strong className={predictedStopX >= targetMinDepth && predictedStopX <= targetMaxDepth ? "text-emerald-300" : "text-rose-400"}>{predictedStopX.toFixed(2)}m</strong>
                </span>
              )}
            </div>

            {/* Composite Armor Cross-Section Mini-Bar */}
            <div className="relative w-full max-w-sm h-2 sm:h-2.5 bg-slate-900/90 rounded-full overflow-hidden mt-1 border border-white/10 backdrop-blur-sm">
              {/* Layer 1: Ballistic Gel (0 to d1) */}
              <div
                className="absolute top-0 bottom-0 bg-blue-500/25 border-r border-blue-400/40"
                style={{
                  left: 0,
                  width: `${(layer1Thickness / totalLength) * 100}%`,
                }}
              />
              {/* Layer 2: Composite Armor (d1 to d1+d2) */}
              <div
                className="absolute top-0 bottom-0 bg-amber-500/20"
                style={{
                  left: `${(layer1Thickness / totalLength) * 100}%`,
                  width: `${(layer2Thickness / totalLength) * 100}%`,
                }}
              />
              {/* Emerald Sensor Core Target Zone (targetMin to targetMax) */}
              <div
                className="absolute top-0 bottom-0 bg-emerald-400/60 border-x border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.9)] z-10"
                style={{
                  left: `${(targetMinDepth / totalLength) * 100}%`,
                  width: `${Math.max(1.5, ((targetMaxDepth - targetMinDepth) / totalLength) * 100)}%`,
                }}
              />
              {/* Predicted Lodgement Marker */}
              <div
                className={`absolute top-0 bottom-0 w-1 z-20 transition-all duration-150 ${
                  isPredictedInZone
                    ? "bg-emerald-300 shadow-[0_0_8px_rgba(16,185,129,1)]"
                    : "bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                }`}
                style={{
                  left: `${Math.min(99, Math.max(0, (predictedStopX / totalLength) * 100))}%`,
                }}
              />
              {/* Live Projectile Penetration Head */}
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-75 shadow-[0_0_10px_rgba(6,182,212,1)] z-30"
                style={{
                  width: `${Math.min(100, Math.max(0, (liveDepth / totalLength) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Interactive Controls Switcher based on Phase */}
          {/* ========================================================================= */}
          {/* PHASE 1: READY - BIDIRECTIONAL THROTTLE & FIRE SABOT                      */}
          {/* ========================================================================= */}
          {phase === "ready" && (
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-4 w-full max-w-xl px-1">
              {/* Velocity Setter Bar with + and - matching Easy & Medium theme */}
              <div className="order-1 flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-slate-950/70 backdrop-blur-xl border border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                <button
                  type="button"
                  onClick={() => setInitialVelocity(Math.max(minSliderV, initialVelocity - 5))}
                  className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] border border-white/15 flex items-center justify-center text-cyan-300 active:scale-90 transition-all cursor-pointer"
                  title="Decrease muzzle velocity"
                >
                  <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <div className="flex flex-col items-center px-0.5 sm:px-1 min-w-[70px] sm:min-w-[90px]">
                  <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-slate-400">
                    Muzzle Speed
                  </span>
                  <span className="font-mono text-[11px] sm:text-sm font-extrabold text-cyan-200 whitespace-nowrap">
                    {initialVelocity} m/s
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setInitialVelocity(Math.min(maxSliderV, initialVelocity + 5))}
                  className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-xl bg-white/[0.08] hover:bg-white/[0.18] border border-white/15 flex items-center justify-center text-cyan-300 active:scale-90 transition-all cursor-pointer"
                  title="Increase muzzle velocity"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* CENTER: FIRE SABOT Button with glowing cyan-to-blue gradient */}
              <button
                type="button"
                onClick={fireRound}
                className="order-2 w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-10 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-300/60 hover:border-white text-white font-mono font-black text-xs sm:text-sm uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer shrink-0 mt-1 sm:mt-0"
                title="Fire Sabot Round"
              >
                <Crosshair className="w-4 h-4 text-white shrink-0" />
                <span>FIRE SABOT</span>
                <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.5 rounded bg-black/30 border border-white/20 text-[9px] font-mono opacity-80 text-white">
                  SPACE
                </kbd>
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 2: FIRING - PENETRATING IN FLIGHT                                   */}
          {/* ========================================================================= */}
          {phase === "firing" && (
            <div className="flex items-center justify-center gap-3 sm:gap-4 w-full">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950/60 backdrop-blur-xl border border-white/15">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono text-xs font-bold text-cyan-200">
                  {liveSpeed.toFixed(0)} M/S
                </span>
              </div>

              <MobileActionTrigger
                onClick={() => {}}
                disabled={true}
                icon={Flame}
                label="PENETRATING..."
                sublabel={`${liveDepth.toFixed(2)}m / ${totalLength}m`}
                variant="secondary"
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 3: COMPLETED - OUTCOME & ADVANCE                                    */}
          {/* ========================================================================= */}
          {phase === "completed" && (
            <div className="flex items-center justify-center gap-3 sm:gap-4 w-full">
              <button
                type="button"
                onClick={reset}
                className="h-11 sm:h-12 px-4 rounded-2xl bg-slate-950/60 hover:bg-slate-900/80 border border-white/15 backdrop-blur-xl flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-300 active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RETRY RUN</span>
              </button>

              {stoppedInZone ? (
                <MobileActionTrigger
                  onClick={currentRound < 3 ? nextRound : reset}
                  icon={ChevronRight}
                  label={currentRound < 3 ? `NEXT: STAGE ${currentRound + 1}` : "TOPIC 1 COMPLETED!"}
                  sublabel="Sensor Lodged!"
                  variant="success"
                  isPulsing={true}
                  hotkey="SPACE"
                />
              ) : (
                <MobileActionTrigger
                  onClick={reset}
                  icon={RotateCcw}
                  label={breachedLayer2 ? "OVERPENETRATION!" : "UNDERPENETRATION"}
                  sublabel="Tap to Retry"
                  variant="danger"
                  isPulsing={true}
                  hotkey="SPACE"
                />
              )}
            </div>
          )}
        </div>
      }
    />
  );
}
