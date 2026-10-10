"use client";
import { createStore, type StoreApi } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import { createContext, useContext, createElement, useState, type ReactNode } from "react";
import { useStore } from "zustand";

export type ChallengeStatus = "idle" | "running" | "success" | "fail";

export interface ChallengeBaseState {
  status: ChallengeStatus;
  stars: number;
  elapsedMs: number;
  start: () => void;
  succeed: (stars: number) => void;
  fail: () => void;
  reset: () => void;
  tick: (deltaMs: number) => void;
}

export type ChallengeStateExtension = Record<string, unknown>;
export type ChallengeState<T extends ChallengeStateExtension = ChallengeStateExtension> = ChallengeBaseState & T;

export function createChallengeStore<T extends ChallengeStateExtension>(
  extraInitialState: T,
  extraActions: (
    set: (partial: Partial<ChallengeState<T>>) => void,
    get: () => ChallengeState<T>
  ) => Partial<ChallengeState<T>>
): () => StoreApi<ChallengeState<T>> {
  return () =>
    createStore<ChallengeState<T>>()(
      subscribeWithSelector((set, get) => ({
        status: "idle",
        stars: 0,
        elapsedMs: 0,
        ...extraInitialState,
        start: () => set({ status: "running" } as unknown as Partial<ChallengeState<T>>),
        succeed: (stars: number) => set({ status: "success", stars } as unknown as Partial<ChallengeState<T>>),
        fail: () => set({ status: "fail" } as unknown as Partial<ChallengeState<T>>),
        reset: () =>
          set({
            status: "idle",
            stars: 0,
            elapsedMs: 0,
            ...extraInitialState,
          } as unknown as Partial<ChallengeState<T>>),
        tick: (deltaMs: number) =>
          set((s) => ({
            elapsedMs: s.status === "running" ? s.elapsedMs + deltaMs : s.elapsedMs,
          }) as Partial<ChallengeState<T>>),
        ...extraActions(set, get),
      }))
    );
}

export function createChallengeContext<T extends ChallengeStateExtension>() {
  const StoreContext = createContext<StoreApi<ChallengeState<T>> | null>(null);

  function ChallengeProvider({ storeFactory, children }: { storeFactory: () => StoreApi<ChallengeState<T>>, children: ReactNode }) {
    const [store] = useState(storeFactory);
    return createElement(StoreContext.Provider, { value: store }, children);
  }

  function useChallengeStore<U>(selector: (state: ChallengeState<T>) => U): U {
    const store = useContext(StoreContext);
    if (!store) throw new Error("useChallengeStore must be used within its matching Provider");
    return useStore(store, selector);
  }

  return { ChallengeProvider, useChallengeStore, StoreContext };
}

