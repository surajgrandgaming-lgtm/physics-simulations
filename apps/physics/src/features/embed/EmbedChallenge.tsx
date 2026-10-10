"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { EmbedProvider, type QualityTier } from "./EmbedProvider";
import { useEmbedBridge } from "./useEmbedBridge";
import { EmbedStoreConnector, type StoreBridgeActions } from "./EmbedStoreConnector";
import { ChallengeSessionProvider } from "@/features/challenges/ChallengeSessionProvider";
import { ChallengeControlsClient } from "@/features/challenges/ChallengeControlsClient";

const CanvasClient = dynamic(
  () =>
    import(
      "@/features/challenges/CanvasClient"
    ),
  { ssr: false }
);

interface EmbedChallengeProps {
  config: Record<string, unknown>;
  standalone?: boolean;
  initialQuality?: QualityTier;
  showStats?: boolean;
}


function CanvasFirstFrameWatcher({ onFirstFrame }: { onFirstFrame: () => void }) {
  useEffect(() => {
    let animId: number;
    let attempts = 0;
    const check = () => {
      attempts++;
      const canvas = document.querySelector("#embed-container canvas");
      if (canvas || attempts > 20) {
        requestAnimationFrame(() => {
          onFirstFrame();
        });
        return;
      }
      animId = requestAnimationFrame(check);
    };
    animId = requestAnimationFrame(check);
    return () => cancelAnimationFrame(animId);
  }, [onFirstFrame]);

  return null;
}

export function EmbedChallenge({
  config,
  standalone = false,
  initialQuality = "medium",
  showStats = false,
}: EmbedChallengeProps) {
  const [storeActions, setStoreActions] = useState<StoreBridgeActions | null>(null);
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);

  const bridge = useEmbedBridge({
    standalone,
    initialQuality,
    onStartAction: () => storeActions?.start(),
    onResetAction: () => storeActions?.reset(),
    getTelemetry: (elapsedSeconds) =>
      storeActions?.getTelemetry
        ? storeActions.getTelemetry(elapsedSeconds)
        : { elapsedSeconds: Math.round(elapsedSeconds * 100) / 100 },
  });

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        setLockedHeight(window.innerHeight);
      }
    };
    const onFocusOut = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        setLockedHeight(null);
      }
    };
    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);
    return () => {
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return (
    <EmbedProvider
      quality={bridge.quality}
      standalone={standalone}
      stats={showStats}
      muted={bridge.muted}
      onFirstFrame={bridge.onFirstFrame}
      onWebglContextLost={bridge.onWebglContextLost}
    >
      <div
        id="embed-container"
        data-fx={bridge.quality === "low" ? "low" : "normal"}
        className="fixed inset-0 w-screen h-[100dvh] overflow-hidden select-none bg-[#070D1E] text-slate-100"
        style={{
          height: lockedHeight ? `${lockedHeight}px` : "100dvh",
          touchAction: "none",
          overscrollBehavior: "none",
          userSelect: "none",
          WebkitTouchCallout: "none",
        }}
      >
        <style jsx global>{`
          [data-fx="low"] *,
          [data-fx="low"] *::before {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
        `}</style>

        <ChallengeSessionProvider>
          <EmbedStoreConnector
            sceneType={typeof config?.sceneType === "string" ? config.sceneType : undefined}
            onConnect={setStoreActions}
            onStatusChange={bridge.notifyStatusChanged}
          />

          {bridge.isReadyToMount ? (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 w-full h-full z-0">
                <CanvasClient config={config} />
                <CanvasFirstFrameWatcher onFirstFrame={bridge.onFirstFrame} />
              </div>

              <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                <ChallengeControlsClient config={config} isHosted={!standalone} />
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#070D1E] text-cyan-400">
              <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
              <div className="font-mono text-xs tracking-wider uppercase">Connecting to Simulation...</div>
            </div>
          )}
        </ChallengeSessionProvider>
      </div>
    </EmbedProvider>
  );
}
