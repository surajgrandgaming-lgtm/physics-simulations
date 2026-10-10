"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  useDeceleratingBulletStore,
  BallisticCameraMode,
  BALLISTIC_MISSIONS,
} from "@/sims/1d-motion-deceleration/DeceleratingBulletStore";
import {
  GameHUDContainer,
  HUDPanel,
  SpeedometerDial,
  CircularRingGauge,
  TelemetryGrid,
  ResourceGauge,
  ActionDock,
  ActionButton,
  StepperButton,
} from "@topcoaching/sim-core";
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
} from "lucide-react";
import { playChallengeSound } from "@topcoaching/sim-core";

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
  const missionInfo = BALLISTIC_MISSIONS[currentRound - 1] || BALLISTIC_MISSIONS[0];
  const machSpeed = (initialVelocity / 343).toFixed(1);
  const isFinished = phase === "completed";
  const isFiring = phase === "firing";

  return (
    <GameHUDContainer
      title="Hypervelocity Armor Penetration"
      topicName="1D Motion & Deceleration"
      difficulty="advanced"
      xpReward={200}
      onReset={reset}
      onMissionStart={fireRound}
      topCenterHUD={
        <div className="flex items-center gap-3 bg-[#080E1C]/90 backdrop-blur-xl border border-white/[0.08] px-3.5 py-1.5 rounded-2xl">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400">
            <Trophy className="w-3.5 h-3.5" />
            <span>{totalScore} PTS</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 font-mono text-xs text-slate-300">
            <span>TARGET STAGE</span>
            <span className="text-cyan-400 font-bold">{currentRound} / 3</span>
          </div>
        </div>
      }
      briefing={{
        target: "Fire the bullet so it stops inside the target sensor zone",
        storyObjective:
          `A tungsten APFSDS sabot round is fired into a 2-layer composite target: Layer 1 (Ballistic Gel: ${layer1Thickness}m, β₁=${layer1Beta}) and Layer 2 (Composite Armor: ${layer2Thickness}m, β₂=${layer2Beta}). Calculate the initial cannon velocity (v₀) so the round halts inside the Emerald Target Sensor Zone (${targetMinDepth}m - ${targetMaxDepth}m)!`,
        steps: [
          {
            step: 1,
            title: "Calculate Quadratic Drag Decay",
            description: "In dense media, velocity decays exponentially: v(x) = v₀ · e^(-β·x).",
          },
          {
            step: 2,
            title: "Invert for Required Cannon Velocity (v₀)",
            description: `v₀ = v_stop · exp(β₁·d₁ + β₂·(x_target - d₁)). For x_target = ${((targetMinDepth + targetMaxDepth)/2).toFixed(1)}m, calculate v₀.`,
          },
          {
            step: 3,
            title: "Fire Cannon",
            description: "Calibrate velocity and fire sabot to breach Layer 1 and embed precisely in the target zone.",
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
            formula: "v_0 = v_{\\mathrm{stop}} \\cdot e^{\\beta_1 d_1 + \\beta_2 (x_{\\mathrm{target}} - d_1)}",
            explanation: "Calculates precise initial velocity to lodge projectile at target sensor depth.",
          },
        ],
      }}
      result={{
        isWon: stoppedInZone,
        isGameOver: isFinished && !stoppedInZone,
        onNextTier: currentRound < 3 ? nextRound : undefined,
        nextTierUrl: currentRound === 3 ? "/physics/kinematics/relative-motion/challenge/easy" : undefined,
        nextTierLabel: currentRound < 3 ? `STAGE ${currentRound + 1}` : "NEXT TIER",
        failureReason: breachedLayer2
          ? "Target Overshoot! Round punched through entire composite shield!"
          : !breachedLayer1
          ? "Insufficient Muzzle Energy! Projectile halted inside Layer 1."
          : `Lodged at ${actualPenetrationDepth !== null ? actualPenetrationDepth.toFixed(2) : "0.00"}m (Outside ${targetMinDepth}m - ${targetMaxDepth}m zone).`,
        tip: "Use the master inversion formula v₀ = 10 · exp(β₁·d₁ + β₂·(x_target - d₁)) to calculate exact velocity.",
        stats: [
          { label: "Depth Reached", value: actualPenetrationDepth !== null ? actualPenetrationDepth.toFixed(2) : "0.00", unit: "m" },
          { label: "Target Zone", value: `${targetMinDepth} - ${targetMaxDepth}`, unit: "m" },
          { label: "Muzzle Speed", value: initialVelocity, unit: "m/s" },
        ],
        calculation: {
          title: "Multi-Layer Non-Linear Drag & Penetration Depth",
          concept: "Quadratic Drag Deceleration & Differential Equations",
          steps: [
            {
              step: 1,
              title: "Layer 1 Viscous Attenuation",
              math: "v_1 = v_0 \\cdot e^{-\\beta_1 d_1}",
              calculation: `Passing through Layer 1 (thickness ${layer1Thickness}m, drag β₁ = ${layer1Beta} m⁻¹) decays projectile velocity by factor e^(-${(layer1Beta * layer1Thickness).toFixed(2)}).`,
            },
            {
              step: 2,
              title: "Layer 2 Penetration Decay",
              math: "v(x) = v_1 \\cdot e^{-\\beta_2 (x - d_1)}",
              calculation: `Inside Layer 2 (drag β₂ = ${layer2Beta} m⁻¹), velocity decays exponentially until the round halts in the target zone (${targetMinDepth}m–${targetMaxDepth}m).`,
            },
            {
              step: 3,
              title: "Muzzle Velocity Inversion",
              math: "v_0 = v_{\\mathrm{stop}} \\cdot e^{\\beta_1 d_1 + \\beta_2 (x_{\\mathrm{target}} - d_1)}",
              calculation: `For midpoint depth x = ${((targetMinDepth + targetMaxDepth) / 2).toFixed(1)}m, exact required muzzle speed is v₀ ≈ ${(10 * Math.exp(layer1Beta * layer1Thickness + layer2Beta * (((targetMinDepth + targetMaxDepth) / 2) - layer1Thickness))).toFixed(0)} m/s.`,
            },
          ],
          conclusion:
            "Under quadratic fluid drag (a = -βv²), velocity decays exponentially with position rather than time, governed by the differential relation v(x) = v₀·e^(-βx).",
        },
      }}
      leftHUD={
        <div className="flex flex-col items-center gap-1.5 p-2 rounded-3xl bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <SpeedometerDial
            value={liveSpeed}
            min={100}
            max={maxSliderV}
            targetValue={initialVelocity}
            label="PROJECTILE SPEED"
            unit="m/s"
            variant="cyan"
          />
        </div>
      }
      rightHUD={
        <div className="flex flex-col items-center gap-2.5">
          {/* Armor Penetration Circular Ring */}
          <CircularRingGauge
            value={liveDepth}
            max={totalLength}
            label="armor depth"
            sublabel={stoppedInZone ? "in target" : `${liveDepth.toFixed(1)}m / ${totalLength}m`}
            unit="m"
            icon={Crosshair}
            variant={stoppedInZone ? "emerald" : "cyan"}
            size={70}
          />

          {/* Mach Speed Circular Ring */}
          <CircularRingGauge
            value={parseFloat(machSpeed) || 1}
            max={5}
            label="mach rating"
            sublabel={`${initialVelocity} m/s`}
            unit="M"
            icon={Flame}
            variant="amber"
            size={70}
          />
        </div>
      }
      bottomDock={
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          {/* In-Flight Speed Readout Bar */}
          <div className="flex flex-col items-center pointer-events-none select-none pb-1">
            <div className="text-base sm:text-xl md:text-2xl font-mono font-bold tracking-widest text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              – {liveSpeed.toFixed(0)} M/S
            </div>
            <div className="w-32 sm:w-48 h-1 bg-white/20 rounded-full overflow-hidden mt-1 backdrop-blur-sm">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                style={{
                  width: `${Math.min(100, Math.max(0, ((liveSpeed - 100) / (maxSliderV - 100)) * 100))}%`,
                }}
              />
            </div>
          </div>

          <ActionDock>
            {/* Muzzle Velocity Steppers */}
            <div className="flex items-center gap-1">
              <StepperButton
                onClick={() => setInitialVelocity(Math.max(minSliderV, initialVelocity - 25))}
                disabled={isFiring}
                label="-25"
              />
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 flex flex-col items-center">
                <span className="text-[9px] font-mono text-slate-400">MUZZLE (v₀)</span>
                <span className="text-xs font-mono font-bold text-cyan-300">{initialVelocity} m/s</span>
              </div>
              <StepperButton
                onClick={() => setInitialVelocity(Math.min(maxSliderV, initialVelocity + 25))}
                disabled={isFiring}
                label="+25"
              />
            </div>

            {/* Auto Calibrate */}
            <ActionButton
              onClick={autoCalibrate}
              disabled={isFiring}
              icon={Sparkles}
              label="AUTO-CALIBRATE"
              variant="secondary"
              size="md"
            />

            {/* Fire Cannon / Next Stage */}
            {stoppedInZone && currentRound < 3 ? (
              <ActionButton
                onClick={nextRound}
                icon={ChevronRight}
                label={`STAGE ${currentRound + 1}`}
                variant="success"
                size="md"
              />
            ) : (
              <ActionButton
                onClick={fireRound}
                disabled={isFiring}
                icon={Crosshair}
                label={isFiring ? "PENETRATING..." : "FIRE SABOT CANNON"}
                variant="primary"
                size="md"
              />
            )}
          </ActionDock>
        </div>
      }
    />
  );
}
