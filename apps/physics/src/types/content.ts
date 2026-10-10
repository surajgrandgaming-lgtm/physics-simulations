import type { TopicMeta } from "@/content/schemas/topic-meta.schema";
import type { Quiz, QuizDifficulty } from "@/content/schemas/quiz.schema";
import type { ChallengeConfig as SchemaChallengeConfig } from "@/content/schemas/challenge.schema";

export type { TopicMeta, Quiz, QuizDifficulty };
export type { TheoryFrontmatter } from "@/content/schemas/theory.schema";

export type TheoryType = "basics" | "full-concept";
export type Subject = "physics" | "chemistry" | "mathematics";

export interface TopicParams {
  subject: string;
  module: string;
  topic: string;
}

export type ChallengeConfig = SchemaChallengeConfig & Record<string, any>;

export interface DishConfig {
  id: string;
  mass: number;
  radius: number;
  height: number;
  startPosition: [number, number, number];
  frictionWithTable: number;
  tippingMoment?: number;
  fragile?: boolean;
  isCurved?: boolean;
  stackHeight?: number;
}
