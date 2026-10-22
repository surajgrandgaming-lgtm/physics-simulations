"use client";

import React, { useEffect } from "react";
import { useMountainSummitStore } from "@/three/challenges/physics/inclined-projectiles/MountainSummitStore";
import { GameHUDContainer } from "@/features/challenges/hud";
import {
  Flame,
  RotateCcw,
  ChevronRight,
  Plus,
  Minus,
  Trophy,
  Mountain,
} from "lucide-react";

interface Props {
  config: any;
}

export function MountainSummitControls({ config }: Props) {
  const currentRound = useMountainSummitStore((s) => s.currentRound);
  const stageConfig = useMountainSummitStore((s) => s.stageConfig);

  const launchAngleDeg = useMountainSummitStore((s) => s.launchAngleDeg);
  const muzzleVelocity = useMountainSummitStore((s) => s.muzzleVelocity);

  const isFlying = useMountainSummitStore((s) => s.isFlying);
  const isDestructionActive = useMountainSummitStore((s) => s.isDestructionActive);
  const startMission = useMountainSummitStore((s) => s.startMission);
  const isLanded = useMountainSummitStore((s) => s.isLanded);
  const hitResult = useMountainSummitStore((s) => s.hitResult);
  const flightTime = useMountainSummitStore((s) => s.flightTime);
  const missDistance = useMountainSummitStore((s) => s.missDistance);
  const maxAltitudeReached = useMountainSummitStore((s) => s.maxAltitudeReached);
  const score = useMountainSummitStore((s) => s.score);

  const adjustLaunchAngle = useMountainSummitStore((s) => s.adjustLaunchAngle);
  const adjustMuzzleVelocity = useMountainSummitStore((s) => s.adjustMuzzleVelocity);
  const fireCannon = useMountainSummitStore((s) => s.fireCannon);
  const resetShot = useMountainSummitStore((s) => s.resetShot);
  const nextRound = useMountainSummitStore((s) => s.nextRound);

  const isWon = isLanded && hitResult === "hit";
  const isGameOver = isLanded && hitResult !== "hit";

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        adjustLaunchAngle(-1);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        adjustLaunchAngle(1);
      } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        adjustMuzzleVelocity(1);
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        adjustMuzzleVelocity(-1);
      } else if (e.key === " ") {
        e.preventDefault();
        if (isWon) {
          if (currentRound < 3) nextRound();
          else resetShot();
        } else if (isGameOver) {
          resetShot();
        } else if (!isFlying) {
          fireCannon();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [adjustLaunchAngle, adjustMuzzleVelocity, fireCannon, resetShot, nextRound, isWon, isGameOver, isFlying, currentRound]);

  // Mathematical calculations for display & physics explanation
  const thetaRad = (launchAngleDeg * Math.PI) / 180;
  const betaRad = (stageConfig.slopeAngleDeg * Math.PI) / 180;
  const v0 = muzzleVelocity;
  const g = stageConfig.gravity;

  const v0x = v0 * Math.cos(thetaRad);
  const v0y = v0 * Math.sin(thetaRad);

  // Optimal launch angle for downhill slope of angle beta (from horizontal)
  // theta_opt = 45 deg - beta / 2
  const optAngleDeg = 45 - stageConfig.slopeAngleDeg / 2;

  // Time of flight to hit downhill inclined plane y_slope(x) = H0 - (x - x0)*tan(beta)
  // For x0 = slopeStartDistance:
  // With x = v0x * t, y = H0 + v0y * t - 0.5 * g * t^2
  // Intersection occurs when 0.5 * g * t^2 - (v0y + v0x * tan(beta)) * t - slopeStartDistance * tan(beta) = 0
  const bCoeff = v0y + v0x * Math.tan(betaRad);
  const cCoeff = stageConfig.slopeStartDistance * Math.tan(betaRad);
  const discriminant = bCoeff * bCoeff + 2 * g * cCoeff;
  const tImpactEstimated = (bCoeff + Math.sqrt(Math.max(0, discriminant))) / g;
  const predictedImpactX = v0x * tImpactEstimated;
  const diffTarget = Math.abs(predictedImpactX - stageConfig.targetDistance);

  // Target base elevation
  const targetElevation = Math.max(
    0,
    stageConfig.summitElevation - (stageConfig.targetDistance - stageConfig.slopeStartDistance) * Math.tan(betaRad)
  );

  return (
    <GameHUDContainer
      title="Mountain Summit Siege"
      topicName="Inclined Projectiles (Kinematics)"
      difficulty="medium"
      xpReward={250}
      onReset={resetShot}
      onMissionStart={startMission}
      hideTopBar={true}
      hideEyeButton={true}
      hideRestartButton={true}
      showExitButton={true}
      topCenterHUD={
        <div className="flex items-center gap-2.5 sm:gap-3 bg-[#08152c]/90 backdrop-blur-xl border border-sky-500/25 px-3 sm:px-4 py-1.5 rounded-2xl shadow-xl select-none">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-300">
            <Trophy className="w-3.5 h-3.5" />
            <span>STAGE {currentRound} / 3</span>
          </div>
          <div className="w-[1px] h-3.5 bg-white/10" />
          <div className="font-mono text-xs text-slate-300 flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">{stageConfig.title}</span>
            <span className="text-[10px] font-semibold text-sky-300 uppercase px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-500/30">
              Summit: {stageConfig.summitElevation}m &bull; Slope: {stageConfig.slopeAngleDeg}&deg; &bull; Target: {stageConfig.targetDistance}m
            </span>
          </div>
        </div>
      }
      instructionsOverlay={{
        title: "INSTRUCTIONS TO PLAY",
        instructions: [
          {
            title: "Set Launch Angle",
            badge: "Angle (Left)",
            description: "Aim lower than 45° (best around 45° − β/2) because downhill ground falls away.",
            imageUrl: "/images/inclined-projectiles/1.png",
          },
          {
            title: "Tune Powder Speed",
            badge: "Speed (Right)",
            description: "Calibrate blast speed to reach the enemy war tent down the incline.",
            imageUrl: "/images/inclined-projectiles/2.png",
          },
          {
            title: "Fire & Demolish",
            badge: "Fire Cannon",
            description: "Launch the iron cannonball to crush the enemy war tent and detonate TNT barrels.",
            imageUrl: "/images/inclined-projectiles/3.png",
          },
        ],
        tip: "Downhill Secret: Ground drops away beneath the ball, so lower launch angles travel further!",
      }}
      briefing={{
        target: `Crush the enemy outpost at ${stageConfig.targetDistance}m down the ${stageConfig.slopeAngleDeg}° mountain incline.`,
        targetImageUrl: "/images/inclined-projectiles/target.png",
        steps: [
          {
            step: 1,
            title: "Understand the Downhill Advantage",
            description: "Since the ground slopes downward at angle β, the projectile stays in the air longer as the ground recedes.",
            keys: [`Summit H0 = ${stageConfig.summitElevation}m`, `Slope β = ${stageConfig.slopeAngleDeg}°`],
          },
          {
            step: 2,
            title: "Dial Elevation Angle",
            description: "For downhill projection, maximum distance occurs at θ = 45° − β/2. A flatter shot carries more forward momentum.",
            keys: [`Optimal θ \u2248 ${optAngleDeg.toFixed(1)}°`],
          },
          {
            step: 3,
            title: "Tune Powder Speed",
            description: "Adjust blast speed so the ballistic arc meets the inclined terrain precisely at the target structure.",
            keys: ["Speed [-] / [+] on Right"],
          },
          {
            step: 4,
            title: "Fire & Shatter Target",
            description: "Press FIRE CANNON to watch the cannonball race down the mountain slope and smash through tent canvas, timber mast, and explosive barrels.",
            keys: ["FIRE CANNON / Spacebar"],
          },
        ],
        formulas: [
          {
            label: "1. The Falling Ground Equation (Downhill Incline)",
            formula: "y_{\\text{ground}}(x) = H_0 - (x - x_0) \\tan\\beta",
            explanation: "As the cannonball moves forward by x meters, the ground drops lower and lower by x times tan(β) meters.",
          },
          {
            label: "2. The Golden Angle Rule for Downhill Slopes",
            formula: "\\theta_{\\text{max range}} = 45^\\circ - \\frac{\\beta}{2}",
            explanation: "On flat ground, 45° is best. But shooting DOWN a hill, aiming slightly lower gives much greater forward speed before touching the falling ground!",
          },
          {
            label: "3. Flight Time to Downhill Impact",
            formula: "t_{\\text{impact}} = \\frac{2 v_0 \\sin(\\theta + \\beta)}{g \\cos\\beta}",
            explanation: "Because gravity pulls down while the ground slopes away, the ball stays in the air significantly longer than on flat land.",
          },
          {
            label: "4. Impact Distance Along the Mountain",
            formula: "R_{\\text{incline}} = \\frac{v_0^2}{g \\cos^2\\beta} \\left[\\sin(2\\theta + \\beta) + \\sin\\beta\\right]",
            explanation: "The total distance traveled down the incline. Notice the bonus +sin(β) boost from the downhill slope!",
          },
        ],
      }}
      result={{
        isWon,
        isGameOver,
        onNextTier: currentRound < 3 ? nextRound : undefined,
        nextTierLabel: currentRound < 3 ? `STAGE ${currentRound + 1}` : "TOPIC 5 ADVANCED",
        nextTierUrl: currentRound === 3 ? "/physics/kinematics/inclined-projectiles/challenge/advanced" : undefined,
        failureReason:
          hitResult === "miss-short"
            ? `Almost! The ball landed ${missDistance.toFixed(1)}m short of the enemy tent. Tap Speed (+) to launch it faster!`
            : `Whoops! The ball flew ${missDistance.toFixed(1)}m past the enemy tent down the slope. Tap Speed (-) to throw it gentler!`,
        tip: `For this ${stageConfig.slopeAngleDeg}° downhill slope, the optimal angle is around ${optAngleDeg.toFixed(1)}° (45° - ${stageConfig.slopeAngleDeg / 2}°)!`,
        stats: [
          { label: "Mission Result", value: isWon ? "Fortress Smashed! 🎉" : "Missed Target" },
          { label: "Launch Angle", value: `${launchAngleDeg.toFixed(1)}°` },
          { label: "Powder Speed", value: `${muzzleVelocity.toFixed(1)} m/s` },
          { label: "Downhill Incline", value: `${stageConfig.slopeAngleDeg}°` },
          { label: "Summit Elevation", value: `${stageConfig.summitElevation}m` },
          { label: "Air Time", value: flightTime.toFixed(2), unit: "seconds" },
          { label: "Score Bonus", value: score },
        ],
        calculation: {
          title: "How Projectiles Fly Down a Mountain Slope",
          concept: "Downhill Incline Geometry, Falling Ground & Optimal Launch Angle",
          steps: [
            {
              step: 1,
              title: "Step 1: Splitting Cannon Speed into Forward & Upward Moves",
              math: `v_{0x} = ${v0.toFixed(1)} \\times \\cos(${launchAngleDeg.toFixed(1)}^\\circ) = ${v0x.toFixed(1)}\\text{ m/s (Forward)}, \\quad v_{0y} = ${v0.toFixed(1)} \\times \\sin(${launchAngleDeg.toFixed(1)}^\\circ) = ${v0y.toFixed(1)}\\text{ m/s (Upward)}`,
              calculation: `Your blast speed of ${v0.toFixed(1)} m/s splits into two components: ${v0x.toFixed(1)} m/s pushing forward over the valley, and ${v0y.toFixed(1)} m/s climbing into the sky against gravity.`,
            },
            {
              step: 2,
              title: "Step 2: The Ground is Falling Away!",
              math: `y_{\\text{ground}}(x) = ${stageConfig.summitElevation}\\text{ m} - (x - ${stageConfig.slopeStartDistance}) \\times \\tan(${stageConfig.slopeAngleDeg}^\\circ)`,
              calculation: `On flat ground, the floor stays at zero. But here on a mountain, as the ball flies forward, the rocky slope drops downhill at ${stageConfig.slopeAngleDeg}°. At the enemy base (${stageConfig.targetDistance}m away), the ground is down at elevation ${targetElevation.toFixed(1)}m!`,
            },
            {
              step: 3,
              title: "Step 3: The Golden Downhill Angle (Why 45° is NOT best!)",
              math: `\\theta_{\\text{opt}} = 45^\\circ - \\frac{${stageConfig.slopeAngleDeg}^\\circ}{2} = ${optAngleDeg.toFixed(1)}^\\circ`,
              calculation: `Because the ground drops away beneath the ball, you do not need as much upward loft as flat land! Aiming lower (${optAngleDeg.toFixed(1)}°) converts more blast powder into sheer forward speed, giving you huge extra downhill distance!`,
            },
            {
              step: 4,
              title: "Step 4: Flight Time and Predicted Impact Point",
              math: `t_{\\text{impact}} = ${tImpactEstimated.toFixed(2)}\\text{ s}, \\quad X_{\\text{impact}} = ${predictedImpactX.toFixed(1)}\\text{ m}`,
              calculation: `Carried forward by ${v0x.toFixed(1)} m/s, the cannonball spends ${tImpactEstimated.toFixed(2)} seconds flying down the canyon before crashing into the mountain slope at ${predictedImpactX.toFixed(1)} meters.`,
            },
            {
              step: 5,
              title: "Step 5: Target Base Check (Did we crush the fortress?)",
              math: `X_{\\text{target}} = ${stageConfig.targetDistance}\\text{ m}, \\quad \\Delta x = ${diffTarget.toFixed(1)}\\text{ m} \\quad (\\text{Hit zone: } \\pm ${stageConfig.targetTolerance}\\text{m})`,
              calculation: `${diffTarget <= stageConfig.targetTolerance ? "🎯 DIRECT HIT! The cannonball slams into the enemy war tent, ripping canvas, toppling the mast, and triggering massive TNT barrel explosions down the mountain slope!" : predictedImpactX < stageConfig.targetDistance ? "Fell short! The ball landed " + diffTarget.toFixed(1) + " meters before the target. Increase powder blast speed by +1 or +2 m/s!" : "Flew past! The ball overshot by " + diffTarget.toFixed(1) + " meters down the mountain. Decrease powder blast speed by -1 or -2 m/s!"}`,
            },
          ],
          conclusion:
            "⛰️ The Downhill Incline Secret: When firing downhill, gravity helps the ball reach further because the mountain falls away underneath it. The steeper the downhill slope (β), the lower you should aim (θ = 45° − β/2) to maximize range and blast enemy fortifications at the bottom of the valley!",
        },
      }}
      bottomDock={
        <div className="flex flex-col items-center gap-2 pointer-events-auto select-none pb-2 sm:pb-3 max-w-3xl mx-auto w-full px-2 sm:px-3">
          <div className="grid grid-cols-2 sm:flex sm:flex-row max-sm:landscape:flex max-sm:landscape:flex-row items-center justify-center gap-2 sm:gap-3 w-full">
            {/* 1. Launch Angle Controller (Order 1 in Landscape: Left) */}
            <div className="col-span-1 sm:order-1 max-sm:landscape:order-1 sm:flex-none max-sm:landscape:flex-none h-12 flex items-center justify-between sm:justify-center gap-1.5 xs:gap-2 px-2.5 xs:px-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_24px_rgba(0,0,0,0.18)] min-w-0 sm:w-[220px]">
              <button
                type="button"
                onClick={() => adjustLaunchAngle(-1)}
                disabled={isFlying || isDestructionActive}
                className="w-7 h-7 xs:w-8 xs:h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-bold active:scale-90 transition-all cursor-pointer shadow-sm"
                title="Decrease launch angle (-1&deg;)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex flex-col items-center px-0.5 xs:px-1 flex-1 min-w-0">
                <span className="text-[8px] xs:text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold truncate">
                  Launch Angle
                </span>
                <span className="font-mono text-xs xs:text-sm font-black text-slate-900 whitespace-nowrap">
                  {launchAngleDeg.toFixed(1)}&deg;
                </span>
              </div>

              <button
                type="button"
                onClick={() => adjustLaunchAngle(1)}
                disabled={isFlying || isDestructionActive}
                className="w-7 h-7 xs:w-8 xs:h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-bold active:scale-90 transition-all cursor-pointer shadow-sm"
                title="Increase launch angle (+1&deg;)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. Powder Speed Controller (Order 3 in Landscape: Right, Row 1 Col 2 in Mobile Portrait) */}
            <div className="col-span-1 sm:order-3 max-sm:landscape:order-3 sm:flex-none max-sm:landscape:flex-none h-12 flex items-center justify-between sm:justify-center gap-1.5 xs:gap-2 px-2.5 xs:px-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_24px_rgba(0,0,0,0.18)] min-w-0 sm:w-[220px]">
              <button
                type="button"
                onClick={() => adjustMuzzleVelocity(-1)}
                disabled={isFlying || isDestructionActive}
                className="w-7 h-7 xs:w-8 xs:h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-bold active:scale-90 transition-all cursor-pointer shadow-sm"
                title="Decrease powder velocity (-1 m/s)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex flex-col items-center px-0.5 xs:px-1 flex-1 min-w-0">
                <span className="text-[8px] xs:text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold truncate">
                  Powder Speed
                </span>
                <span className="font-mono text-xs xs:text-sm font-black text-slate-900 whitespace-nowrap">
                  {muzzleVelocity.toFixed(1)} m/s
                </span>
              </div>

              <button
                type="button"
                onClick={() => adjustMuzzleVelocity(1)}
                disabled={isFlying || isDestructionActive}
                className="w-7 h-7 xs:w-8 xs:h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-bold active:scale-90 transition-all cursor-pointer shadow-sm"
                title="Increase powder velocity (+1 m/s)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. Action Button: CENTER in Landscape (Order 2), FULL-WIDTH BOTTOM in Mobile Portrait */}
            <div className="col-span-2 sm:order-2 max-sm:landscape:order-2 w-full sm:w-auto max-sm:landscape:w-auto flex items-center justify-center">
              {isLanded ? (
                isWon ? (
                  currentRound < 3 ? (
                    <button
                      type="button"
                      onClick={nextRound}
                      className="h-12 w-full sm:w-auto min-w-[170px] sm:min-w-[190px] flex items-center justify-center gap-2 px-7 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(16,185,129,0.45)] active:scale-95 transition-all cursor-pointer"
                    >
                      <span>STAGE {currentRound + 1}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={resetShot}
                      className="h-12 w-full sm:w-auto min-w-[170px] sm:min-w-[190px] flex items-center justify-center gap-2 px-7 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(16,185,129,0.45)] active:scale-95 transition-all cursor-pointer"
                    >
                      <span>SIEGE WON</span>
                      <Trophy className="w-4 h-4" />
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={resetShot}
                    className="h-12 w-full sm:w-auto min-w-[170px] sm:min-w-[190px] flex items-center justify-center gap-2 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(244,63,94,0.4)] active:scale-95 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>RETRY SHOT</span>
                  </button>
                )
              ) : isDestructionActive ? (
                <div className="h-12 w-full sm:w-auto min-w-[170px] sm:min-w-[190px] flex items-center justify-center gap-2 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase animate-pulse shadow-[0_0_28px_rgba(239,68,68,0.7)]">
                  <Flame className="w-4 h-4 fill-current text-amber-300 animate-spin" />
                  <span>DEMOLISHING...</span>
                </div>
              ) : isFlying ? (
                <div className="h-12 w-full sm:w-auto min-w-[170px] sm:min-w-[190px] flex items-center justify-center gap-2 px-6 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono font-black text-xs sm:text-sm tracking-wider uppercase animate-pulse">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>IN FLIGHT...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={fireCannon}
                  className="h-12 w-full sm:w-auto min-w-[170px] sm:min-w-[190px] flex items-center justify-center gap-2 px-7 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-slate-950 font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_26px_rgba(249,115,22,0.5)] active:scale-95 transition-all cursor-pointer"
                >
                  <Flame className="w-4 h-4 fill-current text-slate-950" />
                  <span>FIRE CANNON</span>
                </button>
              )}
            </div>
          </div>
        </div>
      }
    />
  );
}

