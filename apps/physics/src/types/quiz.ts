export type {
  Question,
  Quiz,
  QuizDifficulty,
  SingleCorrectQuestion,
  MultipleCorrectQuestion,
  InputValueQuestion,
  Option,
} from "@/content/schemas/quiz.schema";

/** Answer record keyed by question id */
export type AnswerRecord = Record<string, QuizAnswer>;

export type QuizAnswer =
  | { type: "single-correct"; selectedOptionId: string }
  | { type: "multiple-correct"; selectedOptionIds: string[] }
  | { type: "input-value"; value: number };

export interface QuizSessionState {
  quizId: string;
  currentIndex: number;
  answers: AnswerRecord;
  status: "idle" | "active" | "submitted";
  score: number;
  maxScore: number;
  startedAt: number; // epoch ms
  submittedAt?: number;
}
