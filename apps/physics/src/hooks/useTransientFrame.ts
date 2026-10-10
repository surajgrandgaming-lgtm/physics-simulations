"use client";
/**
 * hooks/useTransientFrame.ts
 *
 * Directive 4 compliance helper:
 * Returns a ref-backed "transient" value from useFrame, plus a callback
 * that lets THREE.js scene values be read by React without triggering re-renders.
 *
 * Usage:
 *   const [posRef, readPos] = useTransientFrame({ x: 0, y: 0, z: 0 });
 *
 *   // Inside useFrame (no setState, no re-render):
 *   useFrame(() => {
 *     posRef.current.x = rigidBodyRef.current.translation().x;
 *   });
 *
 *   // To trigger a Zustand state update (discrete event only):
 *   if (Math.abs(readPos().x) > threshold) {
 *     store.getState().fail();
 *   }
 */
import { useRef, useCallback } from "react";

export function useTransientFrame<T>(initialValue: T): [React.RefObject<T>, () => T] {
  const ref = useRef<T>(initialValue);
  const read = useCallback(() => ref.current, []);
  return [ref, read];
}
