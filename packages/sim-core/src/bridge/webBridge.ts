import {
  NativeToWeb,
  WebToNative,
  type NativeToWebMessage,
  type WebToNativeMessage,
} from "./protocol";

export type TransportType = "react-native" | "parent" | "standalone";

export interface BridgeTransport {
  type: TransportType;
  postMessage: (messageString: string) => void;
}

interface MinimalWindowLike {
  ReactNativeWebView?: {
    postMessage: (msg: string) => void;
  };
  parent?: {
    postMessage: (msg: string, targetOrigin: string) => void;
  };
}

export interface WebBridgeDependencies {
  win?: (Window & MinimalWindowLike) | EventTarget | null;
  doc?: Document | EventTarget | null;
  transport?: BridgeTransport | null;
}

export function createTransport(win?: (Window & MinimalWindowLike) | unknown): BridgeTransport | null {
  const targetWindow = (win ?? (typeof window !== "undefined" ? window : undefined)) as (Window & MinimalWindowLike) | undefined;
  if (!targetWindow) return null;

  if (targetWindow.ReactNativeWebView && typeof targetWindow.ReactNativeWebView.postMessage === "function") {
    return {
      type: "react-native",
      postMessage: (msg: string) => targetWindow.ReactNativeWebView!.postMessage(msg),
    };
  }

  if (targetWindow.parent && targetWindow.parent !== targetWindow && typeof targetWindow.parent.postMessage === "function") {
    return {
      type: "parent",
      postMessage: (msg: string) => targetWindow.parent!.postMessage(msg, "*"),
    };
  }

  return null;
}

export type OutgoingMessagePayload =
  | Omit<WebToNativeMessage, "seq">
  | WebToNativeMessage;

export class WebBridgeInstance {
  private seq = 0;
  private lastReceivedSeq = -1;
  private transport: BridgeTransport | null = null;
  private win?: EventTarget | null;
  private doc?: EventTarget | null;

  constructor(deps?: WebBridgeDependencies) {
    this.win = deps?.win !== undefined ? deps.win : (typeof window !== "undefined" ? window : undefined);
    this.doc = deps?.doc !== undefined ? deps.doc : (typeof document !== "undefined" ? document : undefined);
    this.transport = deps?.transport !== undefined ? deps.transport : createTransport(this.win);
  }

  public getTransportType(): TransportType {
    return this.transport ? this.transport.type : "standalone";
  }

  public setTransport(transport: BridgeTransport | null) {
    this.transport = transport;
  }

  public postToNative(msg: OutgoingMessagePayload): boolean {
    try {
      const assignedSeq = "seq" in msg && typeof msg.seq === "number" ? msg.seq : this.seq++;
      const candidate = { ...msg, seq: assignedSeq };
      const parsed = WebToNative.safeParse(candidate);
      if (!parsed.success) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[webBridge] Invalid outgoing message:", candidate, parsed.error);
        }
        return false;
      }

      

      // Dynamically discover ReactNativeWebView if it became available after initialization

      if (!this.transport || this.transport.type !== "react-native") {

        const fresh = createTransport(this.win);

        if (fresh && fresh.type === "react-native") {

          this.transport = fresh;

        }

      }

      

      if (!this.transport) {
        return false;
      }

      this.transport.postMessage(JSON.stringify(parsed.data));
      return true;
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[webBridge] Error in postToNative:", err);
      }
      return false;
    }
  }

  public subscribeNative(handler: (msg: NativeToWebMessage) => void): () => void {
    const handleRaw = (rawData: unknown) => {
      try {
        let parsedJson: unknown = rawData;
        if (typeof rawData === "string") {
          try {
            parsedJson = JSON.parse(rawData);
          } catch {
            return;
          }
        }

        if (!parsedJson || typeof parsedJson !== "object") return;
        const candidate = parsedJson as Record<string, unknown>;
        if (typeof candidate.seq !== "number") return;

        if (candidate.seq <= this.lastReceivedSeq) {
          return;
        }

        const result = NativeToWeb.safeParse(candidate);
        if (!result.success) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[webBridge] Unknown or invalid native message:", candidate);
          }
          return;
        }

        this.lastReceivedSeq = result.data.seq;
        handler(result.data);
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[webBridge] Error handling message:", err);
        }
      }
    };

    const listener = (event: Event) => {
      if (!event) return;
      const rawData = "data" in event ? (event as MessageEvent).data : undefined;
      handleRaw(rawData);
    };

    if (this.win && typeof (this.win as EventTarget).addEventListener === "function") {
      (this.win as EventTarget).addEventListener("message", listener);
    }
    if (this.doc && typeof (this.doc as EventTarget).addEventListener === "function") {
      (this.doc as EventTarget).addEventListener("message", listener);
    }

    return () => {
      if (this.win && typeof (this.win as EventTarget).removeEventListener === "function") {
        (this.win as EventTarget).removeEventListener("message", listener);
      }
      if (this.doc && typeof (this.doc as EventTarget).removeEventListener === "function") {
        (this.doc as EventTarget).removeEventListener("message", listener);
      }
    };
  }

  public resetSeq() {
    this.seq = 0;
    this.lastReceivedSeq = -1;
  }
}

// Default singleton instance
const defaultBridge = new WebBridgeInstance();

export function postToNative(msg: OutgoingMessagePayload): boolean {
  return defaultBridge.postToNative(msg);
}

export function subscribeNative(
  handler: (msg: NativeToWebMessage) => void,
  deps?: WebBridgeDependencies
): () => void {
  if (deps) {
    const customBridge = new WebBridgeInstance(deps);
    return customBridge.subscribeNative(handler);
  }
  return defaultBridge.subscribeNative(handler);
}
