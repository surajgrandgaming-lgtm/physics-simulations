import { z } from "zod";

// ── Individual Question Types ──────────────────────────────────────────────

export const OptionSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const SingleCorrectQuestionSchema = z.object({
  id: z.string(),
  type: z.literal("single-correct"),
  text: z.string(),
  options: z.array(OptionSchema).min(2).max(6),
  correctOptionId: z.string(),
  explanation: z.string(),
  xp: z.number().int().positive(),
});

export const MultipleCorrectQuestionSchema = z.object({
  id: z.string(),
  type: z.literal("multiple-correct"),
  text: z.string(),
  options: z.array(OptionSchema).min(2).max(8),
  correctOptionIds: z.array(z.string()).min(1),
  explanation: z.string(),
  xp: z.number().int().positive(),
});

export const InputValueQuestionSchema = z.object({
  id: z.string(),
  type: z.literal("input-value"),
  text: z.string(),
  correctValue: z.number(),
  tolerance: z.number().positive(),
  unit: z.string(),
  hint: z.string().optional(),
  solution: z.string(),
  xp: z.number().int().positive(),
});

export const QuestionSchema = z.discriminatedUnion("type", [
  SingleCorrectQuestionSchema,
  MultipleCorrectQuestionSchema,
  InputValueQuestionSchema,
]);

// ── Full Quiz File ─────────────────────────────────────────────────────────

export const QuizSchema = z.object({
  topicId: z.string(),
  difficulty: z.enum(["easy", "medium", "advanced"]),
  questions: z.array(QuestionSchema).min(1),
});

export type Option = z.infer<typeof OptionSchema>;
export type SingleCorrectQuestion = z.infer<typeof SingleCorrectQuestionSchema>;
export type MultipleCorrectQuestion = z.infer<typeof MultipleCorrectQuestionSchema>;
export type InputValueQuestion = z.infer<typeof InputValueQuestionSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type QuizDifficulty = Quiz["difficulty"];
