import { describe, it, expect, vi } from "vitest";
import {
  PROTOCOL,
  NativeToWeb,
  WebToNative,
} from "../protocol";
import {
  createTransport,
  WebBridgeInstance,
  subscribeNative,
} from "../webBridge";

describe("Protocol Validation", () => {
  it("parses valid NativeToWeb messages", () => {
    const initMsg = {
      seq: 0,
      type: "INIT",
      protocol: PROTOCOL,
      attemptId: "att-123",
      path: {
        subject: "physics",
        module: "kinematics",
        topic: "1d-motion-deceleration",
        difficulty: "easy",
      },
      quality: "medium",
      muted: false,
    };
    expect(NativeToWeb.safeParse(initMsg).success).toBe(true);

    const startMsg = { seq: 1, type: "START" };
    expect(NativeToWeb.safeParse(startMsg).success).toBe(true);

    const pauseMsg = { seq: 2, type: "PAUSE" };
    expect(NativeToWeb.safeParse(pauseMsg).success).toBe(true);

    const resumeMsg = { seq: 3, type: "RESUME" };
    expect(NativeToWeb.safeParse(resumeMsg).success).toBe(true);

    const resetMsg = { seq: 4, type: "RESET" };
    expect(NativeToWeb.safeParse(resetMsg).success).toBe(true);
  });

  it("rejects invalid NativeToWeb messages", () => {
    // Missing required fields
    expect(NativeToWeb.safeParse({ seq: 0, type: "INIT" }).success).toBe(false);
    // Invalid difficulty
    expect(
      NativeToWeb.safeParse({
        seq: 0,
        type: "INIT",
        protocol: 1,
        attemptId: "a",
        path: { subject: "p", module: "m", topic: "t", difficulty: "super-hard" },
        quality: "medium",
        muted: false,
      }).success
    ).toBe(false);
    // Negative seq
    expect(NativeToWeb.safeParse({ seq: -1, type: "START" }).success).toBe(false);
    // Unknown type
    expect(NativeToWeb.safeParse({ seq: 0, type: "EXPLODE" }).success).toBe(false);
  });

  it("parses valid WebToNative messages", () => {
    const bootMsg = { seq: 0, type: "BOOT", protocol: PROTOCOL };
    expect(WebToNative.safeParse(bootMsg).success).toBe(true);

    const readyMsg = { seq: 1, type: "READY", loadMs: 450.5 };
    expect(WebToNative.safeParse(readyMsg).success).toBe(true);

    const completedMsg = {
      seq: 2,
      type: "COMPLETED",
      attemptId: "att-123",
      success: true,
      telemetry: { elapsedSeconds: 4.2, finalSpeed: 0 },
    };
    expect(WebToNative.safeParse(completedMsg).success).toBe(true);

    const errorMsg = {
      seq: 3,
      type: "ERROR",
      code: "WEBGL_CONTEXT_LOST",
      recoverable: false,
    };
    expect(WebToNative.safeParse(errorMsg).success).toBe(true);

    const heartbeatMsg = { seq: 4, type: "HEARTBEAT" };
    expect(WebToNative.safeParse(heartbeatMsg).success).toBe(true);
  });

  it("rejects non-number values in telemetry and invalid WebToNative messages", () => {
    const invalidTelemetry = {
      seq: 2,
      type: "COMPLETED",
      attemptId: "att-123",
      success: true,
      telemetry: { elapsedSeconds: "fast" as unknown as number },
    };
    expect(WebToNative.safeParse(invalidTelemetry).success).toBe(false);

    // Invalid error code
    expect(
      WebToNative.safeParse({
        seq: 3,
        type: "ERROR",
        code: "INVALID_CODE",
        recoverable: false,
      }).success
    ).toBe(false);
  });
});

describe("WebBridge Transport & Communication", () => {
  it("prefers ReactNativeWebView when available", () => {
    const rnPost = vi.fn();
    const parentPost = vi.fn();
    const fakeWin = {
      ReactNativeWebView: { postMessage: rnPost },
      parent: { postMessage: parentPost },
    };
    const transport = createTransport(fakeWin);
    expect(transport?.type).toBe("react-native");
    transport?.postMessage("hello");
    expect(rnPost).toHaveBeenCalledWith("hello");
    expect(parentPost).not.toHaveBeenCalled();
  });

  it("falls back to parent window when ReactNativeWebView is absent", () => {
    const parentPost = vi.fn();
    const fakeWin: Record<string, unknown> = {
      parent: { postMessage: parentPost },
    };
    (fakeWin.parent as { postMessage: unknown }).postMessage = parentPost;
    const transport = createTransport(fakeWin);
    expect(transport?.type).toBe("parent");
    transport?.postMessage("hello");
    expect(parentPost).toHaveBeenCalledWith("hello", "*");
  });

  it("returns null transport for standalone mode (no RN, parent === self)", () => {
    const fakeWin: Record<string, unknown> = {};
    fakeWin.parent = fakeWin;
    const transport = createTransport(fakeWin);
    expect(transport).toBeNull();
  });

  it("listens on both window and document", () => {
    const winListeners: Record<string, (evt: unknown) => void> = {};
    const docListeners: Record<string, (evt: unknown) => void> = {};

    const fakeWin: Record<string, unknown> = {
      addEventListener: (evt: string, fn: (evt: unknown) => void) => { winListeners[evt] = fn; },
      removeEventListener: (evt: string) => { delete winListeners[evt]; },
    };
    const fakeDoc: Record<string, unknown> = {
      addEventListener: (evt: string, fn: (evt: unknown) => void) => { docListeners[evt] = fn; },
      removeEventListener: (evt: string) => { delete docListeners[evt]; },
    };

    const handler = vi.fn();
    const unsubscribe = subscribeNative(handler, { win: fakeWin as unknown as EventTarget, doc: fakeDoc as unknown as Document });

    expect(winListeners["message"]).toBeDefined();
    expect(docListeners["message"]).toBeDefined();

    // Trigger on window
    winListeners["message"]({ data: JSON.stringify({ seq: 0, type: "START" }) });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ seq: 0, type: "START" });

    // Trigger on document
    docListeners["message"]({ data: JSON.stringify({ seq: 1, type: "PAUSE" }) });
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenCalledWith({ seq: 1, type: "PAUSE" });

    unsubscribe();
    expect(winListeners["message"]).toBeUndefined();
    expect(docListeners["message"]).toBeUndefined();
  });

  it("dedupes incoming messages by seq and ignores duplicate or older seq", () => {
    const winListeners: Record<string, (evt: unknown) => void> = {};
    const fakeWin: Record<string, unknown> = {
      addEventListener: (evt: string, fn: (evt: unknown) => void) => { winListeners[evt] = fn; },
      removeEventListener: () => {},
    };

    const handler = vi.fn();
    const bridge = new WebBridgeInstance({ win: fakeWin as unknown as EventTarget, doc: null });
    bridge.subscribeNative(handler);

    // seq 1
    winListeners["message"]({ data: JSON.stringify({ seq: 1, type: "START" }) });
    expect(handler).toHaveBeenCalledTimes(1);

    // duplicate seq 1 - should be dropped
    winListeners["message"]({ data: JSON.stringify({ seq: 1, type: "START" }) });
    expect(handler).toHaveBeenCalledTimes(1);

    // older seq 0 - should be dropped
    winListeners["message"]({ data: JSON.stringify({ seq: 0, type: "START" }) });
    expect(handler).toHaveBeenCalledTimes(1);

    // newer seq 2 - should be processed
    winListeners["message"]({ data: JSON.stringify({ seq: 2, type: "RESUME" }) });
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("never throws on malformed JSON or unknown message types", () => {
    const winListeners: Record<string, (evt: unknown) => void> = {};
    const fakeWin: Record<string, unknown> = {
      addEventListener: (evt: string, fn: (evt: unknown) => void) => { winListeners[evt] = fn; },
      removeEventListener: () => {},
    };

    const handler = vi.fn();
    const bridge = new WebBridgeInstance({ win: fakeWin as unknown as EventTarget, doc: null });
    bridge.subscribeNative(handler);

    expect(() => {
      winListeners["message"]({ data: "not-json" });
      winListeners["message"]({ data: null });
      winListeners["message"]({ data: undefined });
      winListeners["message"]({ data: "{ invalid json" });
      winListeners["message"]({ data: JSON.stringify({ seq: 1, type: "UNKNOWN_TYPE" }) });
      winListeners["message"]({ data: JSON.stringify({ noSeq: true }) });
    }).not.toThrow();

    expect(handler).not.toHaveBeenCalled();
  });

  it("increments seq and does not throw in postToNative", () => {
    const posted: string[] = [];
    const fakeTransport = {
      type: "react-native" as const,
      postMessage: (msg: string) => posted.push(msg),
    };
    const bridge = new WebBridgeInstance({ transport: fakeTransport });

    bridge.postToNative({ type: "BOOT", protocol: PROTOCOL });
    bridge.postToNative({ type: "READY", loadMs: 120 });

    expect(posted.length).toBe(2);
    const msg0 = JSON.parse(posted[0]);
    const msg1 = JSON.parse(posted[1]);

    expect(msg0.seq).toBe(0);
    expect(msg0.type).toBe("BOOT");
    expect(msg1.seq).toBe(1);
    expect(msg1.type).toBe("READY");

    // Invalid message returns false and never throws
    const invalidSuccess = bridge.postToNative({ type: "INVALID" } as unknown as Parameters<typeof bridge.postToNative>[0]);
    expect(invalidSuccess).toBe(false);
  });
});
