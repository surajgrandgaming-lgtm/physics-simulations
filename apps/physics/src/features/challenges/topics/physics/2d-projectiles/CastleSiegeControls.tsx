"use client";

import React, { useEffect } from "react";
import { useCastleSiegeStore } from "@/three/challenges/physics/2d-projectiles/CastleSiegeStore";
import { GameHUDContainer } from "@/features/challenges/hud";
import {
  Flame,
  RotateCcw,
  ChevronRight,
  Plus,
  Minus,
  Trophy,
} from "lucide-react";

interface Props {
  config: any;
}

export function CastleSiegeControls({ config }: Props) {
  const currentRound = useCastleSiegeStore((s) => s.currentRound);
  const stageConfig = useCastleSiegeStore((s) => s.stageConfig);

  const launchAngleDeg = useCastleSiegeStore((s) => s.launchAngleDeg);
  const muzzleVelocity = useCastleSiegeStore((s) => s.muzzleVelocity);

  const isFlying = useCastleSiegeStore((s) => s.isFlying);
  const isDestructionActive = useCastleSiegeStore((s) => s.isDestructionActive);
  const startMission = useCastleSiegeStore((s) => s.startMission);
  const isLanded = useCastleSiegeStore((s) => s.isLanded);
  const hitResult = useCastleSiegeStore((s) => s.hitResult);
  const flightTime = useCastleSiegeStore((s) => s.flightTime);
  const missDistance = useCastleSiegeStore((s) => s.missDistance);
  const maxAltitudeReached = useCastleSiegeStore((s) => s.maxAltitudeReached);
  const score = useCastleSiegeStore((s) => s.score);

  const adjustLaunchAngle = useCastleSiegeStore((s) => s.adjustLaunchAngle);
  const adjustMuzzleVelocity = useCastleSiegeStore((s) => s.adjustMuzzleVelocity);
  const fireCannon = useCastleSiegeStore((s) => s.fireCannon);
  const resetShot = useCastleSiegeStore((s) => s.resetShot);
  const nextRound = useCastleSiegeStore((s) => s.nextRound);

  const isWon = isLanded && hitResult === "hit";
  const isGameOver = isLanded && hitResult !== "hit";

  // Keyboard navigation
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

  // Mathematical calculations for display & student explanation
  const rad = (launchAngleDeg * Math.PI) / 180;
  const v0x = muzzleVelocity * Math.cos(rad);
  const v0y = muzzleVelocity * Math.sin(rad);
  const g = stageConfig.gravity;

  // Mountain ridge transit time & height
  const tMountain = stageConfig.mountainDistance / Math.max(0.1, v0x);
  const yAtMountain = 3.2 + v0y * tMountain - 0.5 * g * tMountain * tMountain;
  const peakClearance = yAtMountain - stageConfig.mountainPeakHeight;

  // Trajectory Apex (maximum height and time to apex)
  const tApex = v0y / g;
  const xApex = v0x * tApex;
  const hMax = 3.2 + (v0y * v0y) / (2 * g);

  // Time to target distance and arrival height
  const tTarget = stageConfig.targetDistance / Math.max(0.1, v0x);
  const yAtTarget = 3.2 + v0y * tTarget - 0.5 * g * tTarget * tTarget;

  // Landing range on ground level (solving y(t) = 0 with initial y0 = 3.2m)
  const disc = v0y * v0y + 2 * g * 3.2;
  const tLanding = (v0y + Math.sqrt(Math.max(0, disc))) / g;
  const predictedRange = v0x * tLanding;
  const diffTarget = Math.abs(predictedRange - stageConfig.targetDistance);

  return (
    <GameHUDContainer
      title="Castle Siege"
      topicName="2D Projectiles (Kinematics)"
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
              Peak: {stageConfig.mountainPeakHeight}m • Target: {stageConfig.targetDistance}m
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
            description: "Tilt the cannon high (58\u00B0\u201362\u00B0) to arc safely over the mountain peak.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%204/medium/1.png",
          },
          {
            title: "Tune Powder Speed",
            badge: "Speed (Right)",
            description: "Adjust blast speed to reach the wooden target tower across the valley.",
            imageUrl: "/images/2d-projectiles/2.png",
          },
          {
            title: "Fire & Demolish",
            badge: "Fire Cannon",
            description: "Tap Fire Cannon to shatter the wooden tower and trigger full destruction.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%204/medium/3.png",
          },
        ],
        tip: "Low flat shots crash into the cliff. Use a high-angle lob (> 55\u00B0) to clear the peak!",
      }}
      briefing={{
        target: `Clear the ${stageConfig.mountainPeakHeight}m mountain and demolish the wooden target tower at ${stageConfig.targetDistance}m.`,
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%204/medium/target.png",
        steps: [
          {
            step: 1,
            title: "Overcome the Mountain Obstacle",
            description: "A direct flat shot will crash into the rocky cliff face. You must lob the cannonball high into the sky over the summit peak.",
            keys: ["High angle > 55\u00B0"],
          },
          {
            step: 2,
            title: "Dial Elevation Angle",
            description: "Increase launch angle so the trajectory apex reaches well above the mountain summit elevation.",
            keys: ["Angle [-] / [+] on Left"],
          },
          {
            step: 3,
            title: "Tune Powder Speed",
            description: "Set muzzle speed so the projectile's horizontal range lands precisely on the wooden tower across the valley.",
            keys: ["Speed [-] / [+] on Right"],
          },
          {
            step: 4,
            title: "Fire & Demolish Target",
            description: "Press FIRE CANNON to watch the high-arc lob clear the mountain ridge and demolish the enemy wooden stand structure.",
            keys: ["FIRE CANNON / Spacebar"],
          },
        ],
        formulas: [
          {
            label: "1. The Two Pushes: Forward Speed vs Upward Jump",
            formula: "v_{0x} = v_0 \\cos\\theta, \\quad v_{0y} = v_0 \\sin\\theta",
            explanation: "When the cannon fires, the blast is split into two jobs: Forward Speed (travels forward at constant speed) and Upward Jump (shoots high into the sky against gravity).",
          },
          {
            label: "2. Where is the Ball Right Now? (Height and Distance)",
            formula: "x(t) = v_{0x} t, \\quad y(t) = y_0 + v_{0y} t - \\frac{1}{2} g t^2",
            explanation: "Tells us the exact position of the ball at any second: how many meters it has traveled forward, and how high it is in the air.",
          },
          {
            label: "3. The Mountain Jump Rule (Do Not Crash!)",
            formula: `y(${stageConfig.mountainDistance}\\text{ m}) > ${stageConfig.mountainPeakHeight}.0\\text{ m}`,
            explanation: `To fly over the mountain without crashing, the ball's height must be greater than the ${stageConfig.mountainPeakHeight}m peak when it reaches ${stageConfig.mountainDistance}m.`,
          },
          {
            label: "4. The Highest Point in the Clouds (Peak of the Rainbow)",
            formula: "t_{\\text{peak}} = \\frac{v_{0y}}{g}, \\quad H_{\\max} = y_0 + \\frac{v_{0y}^2}{2g}",
            explanation: "The ball climbs higher and higher until gravity slows it down. For a split second at the very top, it pauses before starting to fall.",
          },
        ],
      }}
      result={{
        isWon,
        isGameOver,
        onNextTier: currentRound < 3 ? nextRound : undefined,
        nextTierLabel: currentRound < 3 ? `STAGE ${currentRound + 1}` : "TOPIC 4 ADVANCED",
        nextTierUrl: currentRound === 3 ? "/physics/kinematics/2d-projectiles/challenge/advanced" : undefined,
        failureReason:
          hitResult === "mountain-hit"
            ? `BOOM! The cannonball hit the mountain at height ${yAtMountain.toFixed(1)}m (the peak is ${stageConfig.mountainPeakHeight}m). Tilt the cannon higher up (tap Angle +) to fly over it!`
            : hitResult === "miss-short"
            ? `Almost! The ball landed ${missDistance.toFixed(1)}m in front of the tower. Tap Speed (+) to throw it a little harder!`
            : `Whoops! The ball flew ${missDistance.toFixed(1)}m past the tower. Tap Speed (-) to throw it a little gentler!`,
        tip: `To easily fly over the ${stageConfig.mountainPeakHeight}m mountain, keep your angle around 58\u00B0 to 62\u00B0! That gives you plenty of height to clear the rocks.`,
        stats: [
          { label: "Mission Result", value: isWon ? "Target Smashed! \u{1F389}" : hitResult === "mountain-hit" ? "Crashed on Cliff \u{1F4A5}" : "Missed Target" },
          { label: "Cannon Angle", value: `${launchAngleDeg.toFixed(1)}\u00B0` },
          { label: "Powder Blast Speed", value: `${muzzleVelocity.toFixed(1)} m/s` },
          { label: "Mountain Clearance", value: peakClearance >= 0 ? `+${peakClearance.toFixed(1)}m (Cleared!)` : `${peakClearance.toFixed(1)}m (Crashed!)` },
          { label: "Air Time", value: flightTime.toFixed(2), unit: "seconds" },
          { label: "Score Bonus", value: score },
        ],
        calculation: {
          title: "How the Cannonball Flies Over the Mountain",
          concept: "Easy Rainbow Trajectory, Speed Splitting and Safe Mountain Clearance",
          steps: [
            {
              step: 1,
              title: "Step 1: Splitting the Blast (Forward Speed vs Upward Jump)",
              math: `v_{0x} = ${muzzleVelocity.toFixed(1)} \\times \\cos(${launchAngleDeg.toFixed(1)}^\\circ) = ${v0x.toFixed(1)}\\text{ m/s (Forward)}, \\quad v_{0y} = ${muzzleVelocity.toFixed(1)} \\times \\sin(${launchAngleDeg.toFixed(1)}^\\circ) = ${v0y.toFixed(1)}\\text{ m/s (Upward)}`,
              calculation: `Think of throwing a ball up and forward at the same time! Your blast speed (${muzzleVelocity.toFixed(1)} m/s) splits into two jobs: ${v0x.toFixed(1)} m/s pushing forward across the valley, and ${v0y.toFixed(1)} m/s launching straight up into the sky to fight gravity.`,
            },
            {
              step: 2,
              title: "Step 2: Reaching the Mountain (Did it fly over or crash?)",
              math: `t_{\\text{to mountain}} = \\frac{${stageConfig.mountainDistance}\\text{ m}}{${v0x.toFixed(1)}\\text{ m/s}} = ${tMountain.toFixed(2)}\\text{ s}, \\quad y(${stageConfig.mountainDistance}\\text{ m}) = ${yAtMountain.toFixed(1)}\\text{ m (Mountain is ${stageConfig.mountainPeakHeight}m)}`,
              calculation: `The mountain is ${stageConfig.mountainDistance} meters away. Racing at ${v0x.toFixed(1)} m/s forward, the ball reaches the mountain in ${tMountain.toFixed(2)} seconds. At that exact second, the ball is ${yAtMountain.toFixed(1)} meters high! ${peakClearance > 0 ? "\u{1F389} HOORAY! It soars +" + peakClearance.toFixed(1) + " meters ABOVE the mountain peak! Totally safe!" : "\u{1F4A5} CRASH! It was " + Math.abs(peakClearance).toFixed(1) + " meters too low and hit the rocks! Tap Angle (+) to tilt higher!"}`,
            },
            {
              step: 3,
              title: "Step 3: The Top of the Rainbow (Highest Point in the Sky)",
              math: `t_{\\text{peak}} = \\frac{${v0y.toFixed(1)}}{9.8} = ${tApex.toFixed(2)}\\text{ s}, \\quad H_{\\max} = ${hMax.toFixed(1)}\\text{ m}`,
              calculation: `Just like tossing an apple into the air, the ball slows down as it climbs until it pauses at the very top. At ${tApex.toFixed(2)} seconds, your cannonball reaches its highest ceiling of ${hMax.toFixed(1)} meters high up in the sky before falling down!`,
            },
            {
              step: 4,
              title: "Step 4: Total Time in the Air and Landing Distance",
              math: `t_{\\text{air}} = ${tLanding.toFixed(2)}\\text{ s}, \\quad \\text{Landing Distance } R = ${predictedRange.toFixed(1)}\\text{ m}`,
              calculation: `Gravity pulls the ball back down to earth, giving it a total air time of ${tLanding.toFixed(2)} seconds. During these seconds, its forward speed carries it a total distance of ${predictedRange.toFixed(1)} meters across the valley.`,
            },
            {
              step: 5,
              title: "Step 5: The Target Check (Did we hit the wooden tower?)",
              math: `\\text{Target Distance} = ${stageConfig.targetDistance}\\text{ m}, \\quad \\Delta x = ${diffTarget.toFixed(1)}\\text{ m} \\quad (\\text{Hit zone: } \\pm ${stageConfig.targetTolerance}\\text{m})`,
              calculation: `${diffTarget <= stageConfig.targetTolerance ? "\u{1F3AF} BULLSEYE! PERFECT HIT! The ball lands directly on the wooden tower! The heavy iron ball shatters the wooden beams into pieces and blows up the powder barrels!" : predictedRange < stageConfig.targetDistance ? "Almost there! The ball landed " + diffTarget.toFixed(1) + " meters too short. Easy fix: Increase Powder Speed by +1 or +2 m/s to push it further!" : "Flew too far! The ball landed " + diffTarget.toFixed(1) + " meters past the tower. Easy fix: Decrease Powder Speed by -1 or -2 m/s so it lands closer!"}`,
            },
          ],
          conclusion:
            "\u{1F308} The Rainbow Secret (Why High Throws Work): If a tall wall or mountain is in your way, you cannot throw straight at your target because you will hit the wall! But if you throw high into the sky (like a rainbow or a basketball arch), gravity curves the ball up and over the wall, and drops it right down on the other side. That is how real-life catapults, cannons, and basketball players score points over tall defenders!",
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
                title="Decrease launch angle (-1°)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex flex-col items-center px-0.5 xs:px-1 flex-1 min-w-0">
                <span className="text-[8px] xs:text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold truncate">
                  Launch Angle
                </span>
                <span className="font-mono text-xs xs:text-sm font-black text-slate-900 whitespace-nowrap">
                  {launchAngleDeg.toFixed(1)}°
                </span>
              </div>

              <button
                type="button"
                onClick={() => adjustLaunchAngle(1)}
                disabled={isFlying || isDestructionActive}
                className="w-7 h-7 xs:w-8 xs:h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-bold active:scale-90 transition-all cursor-pointer shadow-sm"
                title="Increase launch angle (+1°)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. Powder Speed Controller (Order 3 in Landscape: Right, but Row 1 Col 2 in Mobile Portrait Grid!) */}
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

            {/* 3. Action Button: CENTER in Landscape (Order 2), and BIG FULL-WIDTH BOTTOM in Mobile Portrait (col-span-2) */}
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
      }/>
  );
}
