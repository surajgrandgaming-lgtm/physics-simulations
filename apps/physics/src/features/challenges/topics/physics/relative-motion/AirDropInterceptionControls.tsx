"use client";

import React, { useEffect } from "react";
import {
  useAirDropInterceptionStore,
  AIR_DROP_ROUNDS,
} from "@/three/challenges/physics/relative-motion/AirDropInterceptionStore";
import { GameHUDContainer } from "@/features/challenges/hud";
import {
  Package,
  RotateCcw,
  ChevronRight,
  Plus,
  Minus,
  Trophy,
} from "lucide-react";
import { challengeAudio } from "@/lib/audio/challengeAudio";

interface Props {
  config: any;
}

export function AirDropInterceptionControls({ config }: Props) {
  const currentRound = useAirDropInterceptionStore((s) => s.currentRound);
  const heliVelX = useAirDropInterceptionStore((s) => s.heliVelX);
  const heliPos = useAirDropInterceptionStore((s) => s.heliPos);

  const isPayloadReleased = useAirDropInterceptionStore((s) => s.isPayloadReleased);
  const isPayloadLanded = useAirDropInterceptionStore((s) => s.isPayloadLanded);
  const isTargetLocked = useAirDropInterceptionStore((s) => s.isTargetLocked);
  const leadDistanceError = useAirDropInterceptionStore((s) => s.leadDistanceError);
  const dropAccuracy = useAirDropInterceptionStore((s) => s.dropAccuracy);
  const landingScore = useAirDropInterceptionStore((s) => s.landingScore);

  const setHeliSpeedDirect = useAirDropInterceptionStore((s) => s.setHeliSpeedDirect);
  const setHeliLateralDirect = useAirDropInterceptionStore((s) => s.setHeliLateralDirect);
  const releasePayload = useAirDropInterceptionStore((s) => s.releasePayload);
  const resetFlight = useAirDropInterceptionStore((s) => s.resetFlight);
  const nextRound = useAirDropInterceptionStore((s) => s.nextRound);

  const isHit = isPayloadLanded && (landingScore === "bullseye" || landingScore === "deck-hit");
  const isMissed = isPayloadLanded && landingScore === "missed";

  const roundCfg = AIR_DROP_ROUNDS[currentRound - 1] || AIR_DROP_ROUNDS[0];
  const tFlight = Math.sqrt((2 * roundCfg.altitude) / roundCfg.gravity);
  const vBoatNetX = roundCfg.boatMotorSpeed.x + roundCfg.riverCurrent.x;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        setHeliSpeedDirect(heliVelX + 2);
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        setHeliSpeedDirect(heliVelX - 2);
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        setHeliLateralDirect(heliPos.z - 1.5);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        setHeliLateralDirect(heliPos.z + 1.5);
      } else if (e.key === " " && !isPayloadReleased) {
        e.preventDefault();
        releasePayload();
        challengeAudio.playLaunch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [heliVelX, heliPos.z, isPayloadReleased, setHeliSpeedDirect, setHeliLateralDirect, releasePayload]);

  return (
    <GameHUDContainer
      title="The Air-Drop Interception"
      topicName="Relative Motion (River Heist)"
      difficulty="advanced"
      xpReward={250}
      onReset={resetFlight}
      hideTopBar={true}
      hideEyeButton={true}
      hideRestartButton={true}
      showExitButton={true}
      topCenterHUD={
        <div className="flex items-center gap-3 bg-[#08152c]/90 backdrop-blur-xl border border-sky-500/25 px-3.5 py-1.5 rounded-2xl shadow-lg">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-300">
            <Trophy className="w-3.5 h-3.5" />
            <span>STAGE {currentRound} / 3</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 font-mono text-xs text-slate-300">
            <span className="text-cyan-400 font-bold">{roundCfg.title}</span>
            <span className="ml-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              Alt: {roundCfg.altitude}m • Crosswind: {roundCfg.crosswind.y} m/s
            </span>
          </div>
        </div>
      }
      instructionsOverlay={{
        title: "INSTRUCTIONS TO PLAY",
        instructions: [
          {
            title: "Match Carrier Speed",
            badge: "Heli Airspeed",
            description: "Use [-] and [+] on the left to match forward airspeed with the moving ship.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%202/advance/1.png",
          },
          {
            title: "Compensate Crosswind",
            badge: "Lateral Lead",
            description: "Use [◄ North] and [South ►] on the right to align horizontally with the flight deck.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%202/advance/2.png",
          },
          {
            title: "Drop at Zero Lead",
            badge: "Bullseye Drop",
            description: "Tap RELEASE CARGO when the reticle turns green to hit the carrier deck dead-center.",
            imageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%202/advance/3.png",
          },
        ],
        tip: "Released cargo keeps the helicopter's forward velocity during its parabolic drop.",
      }}
      briefing={{
        target: "Drop cargo accurately onto the moving carrier flight deck.",
        targetImageUrl: "https://topcoaching.b-cdn.net/Module%201/Topic%202/advance/target.png",
        steps: [
          {
            step: 1,
            title: "Match Airspeed",
            description: "Adjust helicopter speed to match the moving ship below.",
            keys: ["Tap [-] / [+]"],
          },
          {
            step: 2,
            title: "Align Lateral Track",
            description: "Nudge left or right to counteract wind and align with the flight deck.",
            keys: ["◄ North", "South ►"],
          },
          {
            step: 3,
            title: "Release Cargo",
            description: "Drop the cargo when the targeting reticle locks on target.",
            keys: ["RELEASE CARGO"],
          },
        ],
        formulas: [
          {
            label: "Time of Flight",
            formula: "t = \\sqrt{\\frac{2h}{g}}",
            explanation: "Vertical free fall time from release altitude to river surface.",
          },
          {
            label: "Lead Drop Distance",
            formula: "\\Delta x = (v_{\\mathrm{heli}} - (v_{\\mathrm{boat}} + v_{\\mathrm{river}})) \\cdot t",
            explanation: "Horizontal distance helicopter must be ahead/behind boat at moment of drop.",
          },
          {
            label: "Crosswind Drift",
            formula: "\\Delta y = v_{\\mathrm{wind}} \\cdot t",
            explanation: "Lateral drift of cargo caused by crosswind currents during descent.",
          },
        ],
      }}
      result={{
        isWon: isHit,
        isGameOver: isMissed,
        onNextTier: currentRound < 3 ? nextRound : undefined,
        nextTierUrl: currentRound === 3 ? "/physics/kinematics/vectors-river-rain/challenge/easy" : undefined,
        nextTierLabel: currentRound < 3 ? `STAGE ${currentRound + 1}` : "MODULE 1 TOPIC 3",
        failureReason: `Crate splashed into the river! Miss distance: ${(dropAccuracy ?? 0).toFixed(1)}m.`,
        tip: `Release when Lead Error is near 0.0m. Free fall duration is ${tFlight.toFixed(1)}s.`,
        stats: [
          { label: "Result", value: landingScore === "bullseye" ? "Bullseye (100%)" : landingScore === "deck-hit" ? "Deck Hit" : "Missed Splash" },
          { label: "Altitude", value: roundCfg.altitude, unit: "m" },
          { label: "Fall Time", value: tFlight.toFixed(1), unit: "s" },
          { label: "Crosswind", value: `${roundCfg.crosswind.y} m/s` },
        ],
        calculation: {
          title: "Air Drop Ballistics & Moving Target Interception",
          concept: "2D Projectile Motion & Frame Transformations",
          steps: [
            {
              step: 1,
              title: "Vertical Free Fall Time",
              math: "t_{\\mathrm{fall}} = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{2 \\times " + roundCfg.altitude + "}{" + roundCfg.gravity + "}} \\approx " + tFlight.toFixed(2) + "\\text{ s}",
              calculation: `Dropping cargo from altitude h = ${roundCfg.altitude}m under gravity g = ${roundCfg.gravity} m/s² takes ${tFlight.toFixed(2)}s to reach the deck surface.`,
            },
            {
              step: 2,
              title: "Relative Horizontal Speed",
              math: "v_{\\mathrm{rel},x} = v_{\\mathrm{heli}} - (v_{\\mathrm{boat}} + v_{\\mathrm{river}})",
              calculation: `The cargo preserves the helicopter's horizontal velocity upon detachment. Relative approach speed is v_rel = v_heli - (v_boat + v_river).`,
            },
            {
              step: 3,
              title: "Calculated Lead Release Distance",
              math: "\\Delta x_{\\mathrm{lead}} = v_{\\mathrm{rel},x} \\cdot t_{\\mathrm{fall}}",
              calculation: `Releasing when Δx = Δx_lead ensures that both the cargo's parabolic flight and the boat's motion converge at the exact same spatial coordinate (x, y).`,
            },
          ],
          conclusion:
            "A released projectile maintains its initial horizontal velocity. The interception point is obtained by decoupling vertical free-fall time from horizontal relative displacement.",
        },
      }}
      bottomDock={
        <div className="flex flex-col items-center gap-2 pointer-events-auto select-none pb-2 sm:pb-3 max-w-3xl mx-auto w-full px-3">
          {/* Controls Bar: Airspeed (Left) | Action Trigger (Center) | Lateral Alignment (Right) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-3 w-full">
            {/* LEFT: Forward Airspeed */}
            <div className="flex-1 sm:flex-none h-12 flex items-center justify-between sm:justify-center gap-2 px-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_24px_rgba(0,0,0,0.18)] min-w-[210px] sm:w-[225px]">
              <button
                type="button"
                onClick={() => setHeliSpeedDirect(heliVelX - 2.5)}
                disabled={isPayloadReleased}
                className="w-8 h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-bold active:scale-90 transition-all cursor-pointer shadow-sm disabled:opacity-40"
                title="Decrease helicopter airspeed (S or Down)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex flex-col items-center px-1 flex-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Heli Airspeed
                </span>
                <span className="font-mono text-xs sm:text-sm font-black text-slate-900 whitespace-nowrap">
                  {heliVelX.toFixed(0)} m/s
                </span>
              </div>

              <button
                type="button"
                onClick={() => setHeliSpeedDirect(heliVelX + 2.5)}
                disabled={isPayloadReleased}
                className="w-8 h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-bold active:scale-90 transition-all cursor-pointer shadow-sm disabled:opacity-40"
                title="Increase helicopter airspeed (W or Up)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CENTER: Main Action Button */}
            <div className="flex items-center justify-center">
              {isPayloadLanded ? (
                isHit ? (
                  currentRound < 3 ? (
                    <button
                      type="button"
                      onClick={nextRound}
                      className="h-12 min-w-[170px] flex items-center justify-center gap-2 px-7 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(16,185,129,0.45)] active:scale-95 transition-all cursor-pointer"
                    >
                      <span>STAGE {currentRound + 1}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={resetFlight}
                      className="h-12 min-w-[170px] flex items-center justify-center gap-2 px-7 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(16,185,129,0.45)] active:scale-95 transition-all cursor-pointer"
                    >
                      <span>CHALLENGE COMPLETE</span>
                      <Trophy className="w-4 h-4" />
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={resetFlight}
                    className="h-12 min-w-[170px] flex items-center justify-center gap-2 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(244,63,94,0.4)] active:scale-95 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>RETRY DROP</span>
                  </button>
                )
              ) : isPayloadReleased ? (
                <div className="h-12 min-w-[170px] flex items-center justify-center gap-2 px-6 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono font-black text-xs sm:text-sm tracking-wider uppercase animate-pulse">
                  <Package className="w-4 h-4" />
                  <span>DROPPED (FALLING)</span>
                </div>
              ) : isTargetLocked ? (
                <button
                  type="button"
                  onClick={() => {
                    releasePayload();
                    challengeAudio.playLaunch();
                  }}
                  className="h-12 min-w-[170px] flex items-center justify-center gap-2 px-7 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_28px_rgba(16,185,129,0.55)] active:scale-95 transition-all cursor-pointer animate-pulse"
                >
                  <Package className="w-4 h-4 fill-current" />
                  <span>DROP CARGO NOW</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    releasePayload();
                    challengeAudio.playLaunch();
                  }}
                  className="h-12 min-w-[170px] flex items-center justify-center gap-2 px-7 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_24px_rgba(6,182,212,0.45)] active:scale-95 transition-all cursor-pointer"
                >
                  <Package className="w-4 h-4 fill-current" />
                  <span>RELEASE CARGO</span>
                </button>
              )}
            </div>

            {/* RIGHT: Lateral Drift & Crosswind Offset */}
            <div className="flex-1 sm:flex-none h-12 flex items-center justify-between sm:justify-center gap-2 px-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_24px_rgba(0,0,0,0.18)] min-w-[210px] sm:w-[225px]">
              <button
                type="button"
                onClick={() => setHeliLateralDirect(heliPos.z - 1.5)}
                disabled={isPayloadReleased}
                className="px-2.5 h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-mono font-bold text-xs active:scale-90 transition-all cursor-pointer shadow-sm disabled:opacity-40"
                title="Shift helicopter North (A or Left)"
              >
                ◄ North
              </button>

              <div className="flex flex-col items-center px-1 flex-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Lead Error
                </span>
                <span className={`font-mono text-xs sm:text-sm font-black whitespace-nowrap ${isTargetLocked ? "text-emerald-600" : "text-slate-900"}`}>
                  {leadDistanceError > 0 ? `+${leadDistanceError.toFixed(1)}` : leadDistanceError.toFixed(1)}m
                </span>
              </div>

              <button
                type="button"
                onClick={() => setHeliLateralDirect(heliPos.z + 1.5)}
                disabled={isPayloadReleased}
                className="px-2.5 h-8 shrink-0 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300/80 flex items-center justify-center text-slate-800 hover:text-slate-950 font-mono font-bold text-xs active:scale-90 transition-all cursor-pointer shadow-sm disabled:opacity-40"
                title="Shift helicopter South (D or Right)"
              >
                South ►
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}
