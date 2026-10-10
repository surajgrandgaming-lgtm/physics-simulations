"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PROTOCOL, type NativeToWebMessage } from "@/lib/bridge/protocol";
import { postToNative, subscribeNative } from "@/lib/bridge/webBridge";
import type { QualityTier } from "./EmbedProvider";

export interface UseEmbedBridgeOptions {
  standalone?: boolean;
  initialQuality?: QualityTier;
  onStartAction?: () => void;
  onResetAction?: () => void;
  onPauseAction?: () => void;
  onResumeAction?: () => void;
  getTelemetry?: (elapsedSeconds: number) => Record<string, number>;
}

export interface UseEmbedBridgeReturn {
  isReadyToMount: boolean;
  isRunning: boolean;
  isPaused: boolean;
  attemptId: string | null;
  quality: QualityTier;
  muted: boolean;
  onFirstFrame: () => void;
  onWebglContextLost: () => void;
  notifyStatusChanged: (status: "idle" | "running" | "success" | "fail") => void;
}

export function useEmbedBridge({
  standalone = false,
  initialQuality = "medium",
  onStartAction,
  onResetAction,
  onPauseAction,
  onResumeAction,
  getTelemetry,
}: UseEmbedBridgeOptions): UseEmbedBridgeReturn {
  const [isReadyToMount, setIsReadyToMount] = useState(standalone);
  const [quality, setQuality] = useState<QualityTier>(initialQuality);
  const [muted, setMuted] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(standalone ? "standalone-attempt" : null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bootIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const readySentRef = useRef(false);
  const completedSentRef = useRef(false);
  const initReceivedRef = useRef(false);

  // Store refs to callbacks to avoid re-subscribing, updated safely inside useEffect
  const onStartRef = useRef(onStartAction);
  const onResetRef = useRef(onResetAction);
  const onPauseRef = useRef(onPauseAction);
  const onResumeRef = useRef(onResumeAction);
  const getTelemetryRef = useRef(getTelemetry);

  useEffect(() => {
    onStartRef.current = onStartAction;
    onResetRef.current = onResetAction;
    onPauseRef.current = onPauseAction;
    onResumeRef.current = onResumeAction;
    getTelemetryRef.current = getTelemetry;
  }, [onStartAction, onResetAction, onPauseAction, onResumeAction, getTelemetry]);

  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    heartbeatRef.current = setInterval(() => {
      postToNative({ type: "HEARTBEAT" });
    }, 2000);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const triggerStart = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    completedSentRef.current = false;
    startTimeRef.current = performance.now();
    startHeartbeat();
    if (onStartRef.current) {
      onStartRef.current();
    }
  }, [startHeartbeat]);

  const triggerReset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    completedSentRef.current = false;
    stopHeartbeat();
    if (onResetRef.current) {
      onResetRef.current();
    }
  }, [stopHeartbeat]);

  const triggerPause = useCallback(() => {
    setIsPaused(true);
    stopHeartbeat();
    if (onPauseRef.current) {
      onPauseRef.current();
    }
  }, [stopHeartbeat]);

  const triggerResume = useCallback(() => {
    setIsPaused(false);
    if (isRunning) {
      startHeartbeat();
    }
    if (onResumeRef.current) {
      onResumeRef.current();
    }
  }, [isRunning, startHeartbeat]);

  // Install native listener & post BOOT (with retry interval until INIT)
  useEffect(() => {
    if (standalone) return;

    const unsubscribe = subscribeNative((msg: NativeToWebMessage) => {
      switch (msg.type) {
        case "INIT": {
          initReceivedRef.current = true;
          if (bootIntervalRef.current) {
            clearInterval(bootIntervalRef.current);
            bootIntervalRef.current = null;
          }
          setAttemptId(msg.attemptId);
          setQuality(msg.quality);
          setMuted(msg.muted);
          setIsReadyToMount(true);
          break;
        }
        case "START": {
          triggerStart();
          break;
        }
        case "PAUSE": {
          triggerPause();
          break;
        }
        case "RESUME": {
          triggerResume();
          break;
        }
        case "RESET": {
          triggerReset();
          break;
        }
      }
    });

    // 1. Post BOOT once listener is installed, and pulse every 400ms until INIT is received
    const sendBoot = () => {
      if (initReceivedRef.current) {
        if (bootIntervalRef.current) {
          clearInterval(bootIntervalRef.current);
          bootIntervalRef.current = null;
        }
        return;
      }
      postToNative({ type: "BOOT", protocol: PROTOCOL });
    };

    bootIntervalRef.current = setInterval(sendBoot, 400);
    sendBoot();

    return () => {
      if (bootIntervalRef.current) {
        clearInterval(bootIntervalRef.current);
        bootIntervalRef.current = null;
      }
      unsubscribe();
      stopHeartbeat();
    };
  }, [standalone, triggerStart, triggerPause, triggerResume, triggerReset, stopHeartbeat]);

  // Notify first rendered frame
  const onFirstFrame = useCallback(() => {
    if (!readySentRef.current) {
      readySentRef.current = true;
      const loadMs = Math.round(performance.now());
      if (!standalone) {
        postToNative({ type: "READY", loadMs });
      }
    }
  }, [standalone]);

  // Notify WebGL context lost
  const onWebglContextLost = useCallback(() => {
    postToNative({
      type: "ERROR",
      code: "WEBGL_CONTEXT_LOST",
      recoverable: false,
    });
  }, []);

  // When store's status becomes success or fail
  const notifyStatusChanged = useCallback(
    (status: "idle" | "running" | "success" | "fail") => {
      if (status === "success" || status === "fail") {
        if (!completedSentRef.current) {
          completedSentRef.current = true;
          stopHeartbeat();
          setIsRunning(false);

          const elapsedSeconds = startTimeRef.current
            ? (performance.now() - startTimeRef.current) / 1000
            : 0;

          const telemetry = getTelemetryRef.current
            ? getTelemetryRef.current(elapsedSeconds)
            : { elapsedSeconds: Math.round(elapsedSeconds * 100) / 100 };

          postToNative({
            type: "COMPLETED",
            attemptId: attemptId || "unknown-attempt",
            success: status === "success",
            telemetry,
          });
        }
      }
    },
    [attemptId, stopHeartbeat]
  );

  return {
    isReadyToMount,
    isRunning,
    isPaused,
    attemptId,
    quality,
    muted,
    onFirstFrame,
    onWebglContextLost,
    notifyStatusChanged,
  };
}
