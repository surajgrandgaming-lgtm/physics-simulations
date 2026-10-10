"use client";
import { createChallengeStore, createChallengeContext } from "@/stores/factory";

export interface TableclothPullExtra extends Record<string, unknown> {
  pullForceN: number;
  isPulling: boolean;
  dishesDisplaced: boolean;
  maxDishDisplacement: number;
  clothCleared: boolean;
  setPullForce: (force: number) => void;
  initiatePull: () => void;
  recordDisplacement: (displacement: number) => void;
  markClothCleared: () => void;
  markDishFell: () => void;
}

export const createTableclothStore = createChallengeStore<TableclothPullExtra>(
  {
    pullForceN: 30,
    isPulling: false,
    dishesDisplaced: false,
    maxDishDisplacement: 0,
    clothCleared: false,
    setPullForce: () => {},
    initiatePull: () => {},
    recordDisplacement: () => {},
    markClothCleared: () => {},
    markDishFell: () => {},
  },
  (set, get) => ({
    setPullForce: (force: number) => set({ pullForceN: force }),

    initiatePull: () => {
      const { status } = get();
      if (status !== "running") return;
      set({ isPulling: true });
    },

    recordDisplacement: (displacement: number) => {
      const prev = get().maxDishDisplacement as number;
      if (displacement > prev) {
        set({ maxDishDisplacement: displacement, dishesDisplaced: displacement > 0.01 });
      }
    },

    markClothCleared: () => {
      set({ clothCleared: true });
    },

    markDishFell: () => {
      get().fail();
    },
  })
);

export const {
  ChallengeProvider: TableclothChallengeProvider,
  useChallengeStore: useTableclothStore,
  StoreContext: TableclothStoreContext,
} = createChallengeContext<TableclothPullExtra>();
