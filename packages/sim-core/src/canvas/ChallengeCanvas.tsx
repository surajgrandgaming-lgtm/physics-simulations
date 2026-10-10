"use client";

import React, { useRef, useEffect, type ComponentProps } from "react";
import { Canvas } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import { useEmbedContext } from "../embed/EmbedProvider";

export interface ChallengeCanvasProps extends ComponentProps<typeof Canvas> {
  quality?: "low" | "medium" | "high";
  onFirstFrame?: () => void;
  showStats?: boolean;
}

function FirstFrameNotifier({ onFirstFrame }: { onFirstFrame?: () => void }) {
  const calledRef = useRef(false);

  useEffect(() => {
    let animId: number;
    const checkFrame = () => {
      if (!calledRef.current) {
        calledRef.current = true;
        onFirstFrame?.();
      }
    };
    animId = requestAnimationFrame(checkFrame);
    return () => cancelAnimationFrame(animId);
  }, [onFirstFrame]);

  return null;
}

export function ChallengeCanvas({
  quality: propQuality,
  onFirstFrame,
  showStats: propShowStats,
  children,
  dpr,
  shadows,
  gl,
  frameloop,
  ...rest
}: ChallengeCanvasProps) {
  const embed = useEmbedContext();
  const effectiveQuality = propQuality ?? embed?.quality;
  const isStats = propShowStats ?? embed?.stats ?? false;
  const isPaused = embed?.isPaused ?? false;

  let resolvedDpr = dpr;
  let resolvedShadows = shadows;
  let resolvedAntialias =
    typeof gl === "object" && gl && "antialias" in gl
      ? (gl as any).antialias
      : undefined;

  if (effectiveQuality === "low") {
    resolvedDpr = 1;
    resolvedShadows = false;
    resolvedAntialias = false;
  } else if (effectiveQuality === "medium") {
    resolvedDpr = [1, 1.25];
    resolvedShadows = false;
    resolvedAntialias = true;
  } else if (effectiveQuality === "high") {
    resolvedDpr = [1, 1.5];
    resolvedShadows = shadows !== undefined ? shadows : true;
    resolvedAntialias = true;
  }

  const resolvedGl =
    resolvedAntialias !== undefined
      ? { ...(typeof gl === "object" && gl ? gl : {}), antialias: resolvedAntialias }
      : gl;

  const resolvedFrameloop = isPaused ? "never" : frameloop || "always";

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current?.querySelector("canvas");
    if (!el) return;

    let restoredTimer: ReturnType<typeof setTimeout> | null = null;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      restoredTimer = setTimeout(() => {
        if (embed?.onWebglContextLost) {
          embed.onWebglContextLost();
        }
      }, 4000);
    };

    const onContextRestored = () => {
      if (restoredTimer) {
        clearTimeout(restoredTimer);
        restoredTimer = null;
      }
    };

    el.addEventListener("webglcontextlost", onContextLost);
    el.addEventListener("webglcontextrestored", onContextRestored);

    return () => {
      el.removeEventListener("webglcontextlost", onContextLost);
      el.removeEventListener("webglcontextrestored", onContextRestored);
      if (restoredTimer) clearTimeout(restoredTimer);
    };
  }, [embed]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Canvas
        {...rest}
        dpr={resolvedDpr}
        shadows={resolvedShadows}
        gl={resolvedGl}
        frameloop={resolvedFrameloop}
      >
        <FirstFrameNotifier onFirstFrame={onFirstFrame ?? embed?.onFirstFrame} />
        {isStats && <Stats />}
        {children}
      </Canvas>
    </div>
  );
}
