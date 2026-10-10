import { z } from "zod";

export const HudWidgetSchema = z.enum([
  "speed-gauge",
  "live-vt-graph",
  "formula-reference",
  "outcome-replay",
  "status-badge",
]);

export const ChallengeConfigSchema = z.object({
  topicId: z.string(),
  difficulty: z.enum(["easy", "medium", "advanced"]),
  title: z.string(),
  description: z.string(),
  sceneType: z.string(), // maps to a specific Scene component
  ageTarget: z.string(), // e.g. "Class 7-8"
  parameters: z.record(z.string(), z.any()),
  hudWidgets: z.array(HudWidgetSchema),
  formulaReferences: z.array(
    z.object({
      label: z.string(),
      latex: z.string(),
    })
  ),
  objectives: z.array(z.string()),
  successCriteria: z.record(z.string(), z.unknown()),
  failureCriteria: z.record(z.string(), z.unknown()).optional(),
  hints: z.array(z.string()),
});

export type ChallengeConfig = z.infer<typeof ChallengeConfigSchema>;
