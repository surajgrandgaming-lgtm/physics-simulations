import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Theme = "dark" | "light" | "system";

interface AppState {
  // User
  userId: string | null;
  displayName: string | null;
  avatarUrl: string | null;

  // XP & Progress
  totalXP: number;
  level: number;
  streak: number; // consecutive days

  // Preferences
  theme: Theme;
  soundEnabled: boolean;
  musicVolume: number; // 0–1
  sfxVolume: number; // 0–1

  // Actions
  setUser: (userId: string, displayName: string, avatarUrl?: string) => void;
  clearUser: () => void;
  addXP: (amount: number) => void;
  setTheme: (theme: Theme) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicVolume: (vol: number) => void;
  setSfxVolume: (vol: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

/** Compute level from total XP (100 XP per level, simple linear) */
function computeLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userId: null,
      displayName: null,
      avatarUrl: null,
      totalXP: 0,
      level: 1,
      streak: 0,
      theme: "dark",
      soundEnabled: true,
      musicVolume: 0.4,
      sfxVolume: 0.7,

      setUser: (userId, displayName, avatarUrl) =>
        set({ userId, displayName, avatarUrl: avatarUrl ?? null }),

      clearUser: () =>
        set({ userId: null, displayName: null, avatarUrl: null }),

      addXP: (amount) =>
        set((s) => {
          const newXP = s.totalXP + amount;
          return { totalXP: newXP, level: computeLevel(newXP) };
        }),

      setTheme: (theme) => set({ theme }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setMusicVolume: (musicVolume) => set({ musicVolume: Math.max(0, Math.min(1, musicVolume)) }),
      setSfxVolume: (sfxVolume) => set({ sfxVolume: Math.max(0, Math.min(1, sfxVolume)) }),
      incrementStreak: () => set((s) => ({ streak: s.streak + 1 })),
      resetStreak: () => set({ streak: 0 }),
    }),
    {
      name: "topcoaching-app",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
