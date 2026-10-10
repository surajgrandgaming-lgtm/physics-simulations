import { create } from "zustand";

export type TopicStatus = "not-started" | "in-progress" | "completed";

export interface TopicProgress {
  topicId: string;
  status: TopicStatus;
  theoryRead: boolean;
  quizBestScore: Record<"easy" | "medium" | "advanced", number | null>;
  challengeBestStars: Record<"easy" | "medium" | "advanced", 0 | 1 | 2 | 3>;
  lastVisitedAt: number; // epoch ms
  xpEarned: number;
}

interface ProgressState {
  /** keyed by topicId, not one field per topic */
  topics: Record<string, TopicProgress>;

  // Actions
  initTopic: (topicId: string) => void;
  markTheoryRead: (topicId: string) => void;
  recordQuizScore: (
    topicId: string,
    difficulty: "easy" | "medium" | "advanced",
    score: number
  ) => void;
  recordChallengeStars: (
    topicId: string,
    difficulty: "easy" | "medium" | "advanced",
    stars: 0 | 1 | 2 | 3
  ) => void;
  addTopicXP: (topicId: string, xp: number) => void;
  touchTopic: (topicId: string) => void;
}

function emptyProgress(topicId: string): TopicProgress {
  return {
    topicId,
    status: "not-started",
    theoryRead: false,
    quizBestScore: { easy: null, medium: null, advanced: null },
    challengeBestStars: { easy: 0, medium: 0, advanced: 0 },
    lastVisitedAt: Date.now(),
    xpEarned: 0,
  };
}

export const useProgressStore = create<ProgressState>()((set, get) => ({
  topics: {},

  initTopic: (topicId) =>
    set((s) => ({
      topics: s.topics[topicId]
        ? s.topics
        : { ...s.topics, [topicId]: emptyProgress(topicId) },
    })),

  markTheoryRead: (topicId) =>
    set((s) => {
      const prev = s.topics[topicId] ?? emptyProgress(topicId);
      return {
        topics: {
          ...s.topics,
          [topicId]: {
            ...prev,
            theoryRead: true,
            status: prev.status === "not-started" ? "in-progress" : prev.status,
            lastVisitedAt: Date.now(),
          },
        },
      };
    }),

  recordQuizScore: (topicId, difficulty, score) =>
    set((s) => {
      const prev = s.topics[topicId] ?? emptyProgress(topicId);
      const prevBest = prev.quizBestScore[difficulty];
      return {
        topics: {
          ...s.topics,
          [topicId]: {
            ...prev,
            quizBestScore: {
              ...prev.quizBestScore,
              [difficulty]: prevBest === null ? score : Math.max(prevBest, score),
            },
            lastVisitedAt: Date.now(),
          },
        },
      };
    }),

  recordChallengeStars: (topicId, difficulty, stars) =>
    set((s) => {
      const prev = s.topics[topicId] ?? emptyProgress(topicId);
      return {
        topics: {
          ...s.topics,
          [topicId]: {
            ...prev,
            challengeBestStars: {
              ...prev.challengeBestStars,
              [difficulty]: Math.max(prev.challengeBestStars[difficulty], stars),
            },
            status: "in-progress",
            lastVisitedAt: Date.now(),
          },
        },
      };
    }),

  addTopicXP: (topicId, xp) =>
    set((s) => {
      const prev = s.topics[topicId] ?? emptyProgress(topicId);
      return {
        topics: {
          ...s.topics,
          [topicId]: { ...prev, xpEarned: prev.xpEarned + xp },
        },
      };
    }),

  touchTopic: (topicId) =>
    set((s) => {
      const prev = s.topics[topicId] ?? emptyProgress(topicId);
      get().initTopic(topicId);
      return {
        topics: {
          ...s.topics,
          [topicId]: { ...prev, lastVisitedAt: Date.now() },
        },
      };
    }),
}));
