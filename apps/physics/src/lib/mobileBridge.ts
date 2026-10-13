/**
 * Mobile Android / iOS WebView Bridge for Physics Simulations
 */

declare global {
  interface Window {
    Android?: {
      exitSimulation?: () => void;
    };
  }
}

/**
 * Triggers the native mobile exit simulation handler.
 * Communicates with Android via JavascriptInterface: window.Android.exitSimulation()
 * Falls back gracefully to browser history or window.close for desktop/dev testing.
 */
export function exitSimulation(): boolean {
  if (typeof window === "undefined") return false;

  // 1. Android native WebView JavascriptInterface
  if (
    typeof window.Android !== "undefined" &&
    typeof window.Android.exitSimulation === "function"
  ) {
    try {
      window.Android.exitSimulation();
      return true;
    } catch (err) {
      console.error("[SimulationBridge] Error executing Android.exitSimulation():", err);
    }
  }

  // 2. iOS WebKit messageHandler fallback (if ever deployed on iOS WebView)
  if ((window as any).webkit?.messageHandlers?.exitSimulation) {
    try {
      (window as any).webkit.messageHandlers.exitSimulation.postMessage({});
      return true;
    } catch (err) {
      console.error("[SimulationBridge] Error executing webkit exitSimulation:", err);
    }
  }

  // 3. Fallback for desktop / standard browser testing
  console.log("[SimulationBridge] exitSimulation called outside native app; invoking history fallback.");
  if (typeof window.history !== "undefined" && window.history.length > 1) {
    window.history.back();
    return true;
  }

  return false;
}
