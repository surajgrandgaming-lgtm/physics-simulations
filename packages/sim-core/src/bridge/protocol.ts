import { z } from "zod";
export const PROTOCOL = 1;

const Difficulty = z.enum(["easy", "medium", "advanced"]);
const Path = z.object({
  subject: z.string(),
  module: z.string(),
  topic: z.string(),
  difficulty: Difficulty,
});
const base = { seq: z.number().int().nonnegative() };

export const NativeToWeb = z.discriminatedUnion("type", [
  z.object({
    ...base,
    type: z.literal("INIT"),
    protocol: z.number().int(),
    attemptId: z.string(),
    path: Path,
    quality: z.enum(["low", "medium", "high"]),
    muted: z.boolean(),
  }),
  z.object({ ...base, type: z.literal("START") }),
  z.object({ ...base, type: z.literal("PAUSE") }),
  z.object({ ...base, type: z.literal("RESUME") }),
  z.object({ ...base, type: z.literal("RESET") }),
]);

export const WebToNative = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("BOOT"), protocol: z.number().int() }),
  z.object({ ...base, type: z.literal("READY"), loadMs: z.number() }),
  z.object({
    ...base,
    type: z.literal("COMPLETED"),
    attemptId: z.string(),
    success: z.boolean(),
    telemetry: z.record(z.string(), z.number()),
  }),
  z.object({
    ...base,
    type: z.literal("ERROR"),
    code: z.enum(["WEBGL_CONTEXT_LOST", "WASM_COMPILE_FAIL", "ASSET_FETCH_FAIL", "UNKNOWN"]),
    recoverable: z.boolean(),
  }),
  z.object({ ...base, type: z.literal("HEARTBEAT") }),
]);

export type NativeToWebMessage = z.infer<typeof NativeToWeb>;
export type WebToNativeMessage = z.infer<typeof WebToNative>;
