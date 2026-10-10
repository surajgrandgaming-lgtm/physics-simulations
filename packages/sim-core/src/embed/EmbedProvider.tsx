"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";

export type QualityTier = "low" | "medium" | "high";

export interface EmbedContextValue {
  quality: QualityTier;
  standalone: boolean;
  stats: boolean;
  isPaused: boolean;
  isHosted: boolean;
  muted: boolean;
  setPaused: (paused: boolean) => void;
  onFirstFrame?: () => void;
  onWebglContextLost?: () => void;
}

const EmbedContext = createContext<EmbedContextValue | null>(null);

export function useEmbedContext() {
  return useContext(EmbedContext);
}

export function EmbedProvider({
  quality = "medium",
  standalone = false,
  stats = false,
  muted = false,
  onFirstFrame,
  onWebglContextLost,
  children,
}: {
  quality?: QualityTier;
  standalone?: boolean;
  stats?: boolean;
  muted?: boolean;
  onFirstFrame?: () => void;
  onWebglContextLost?: () => void;
  children: ReactNode;
}) {
  const [isPaused, setIsPaused] = useState(false);

  const value: EmbedContextValue = {
    quality,
    standalone,
    stats,
    isPaused,
    isHosted: !standalone,
    muted,
    setPaused: setIsPaused,
    onFirstFrame,
    onWebglContextLost,
  };

  return <EmbedContext.Provider value={value}>{children}</EmbedContext.Provider>;
}
