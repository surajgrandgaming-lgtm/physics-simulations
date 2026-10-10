import { z } from "zod";

export const TopicMetaSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  subject: z.enum(["physics", "chemistry", "mathematics"]),
  module: z.string(),
  description: z.string(),
  conceptTags: z.array(z.string()),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  estimatedMinutes: z.number().int().positive(),
  xpReward: z.number().int().positive(),
  prerequisites: z.array(z.string()).default([]),
  nextTopics: z.array(z.string()).default([]),
});

export type TopicMeta = z.infer<typeof TopicMetaSchema>;
