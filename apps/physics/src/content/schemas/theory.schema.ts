import { z } from "zod";

export const TheoryFrontmatterSchema = z.object({
  title: z.string(),
  subject: z.enum(["physics", "chemistry", "mathematics"]),
  module: z.string(),
  topic: z.string(),
  type: z.enum(["basics", "full-concept"]),
});

export type TheoryFrontmatter = z.infer<typeof TheoryFrontmatterSchema>;
