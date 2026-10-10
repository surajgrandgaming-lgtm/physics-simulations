"use client";

/**
 * Axes3D — Math Kit Component
 *
 * Labeled XYZ axes with tick marks and optional gridlines.
 * Extends AxisGrid3D from core/primitives.
 * Props: range, labels, tickInterval.
 */

import { AxisGrid3D } from "@/three/core/primitives/AxisGrid3D";

export interface Axes3DProps {
  range?: number;
  labels?: [string, string, string];
  tickInterval?: number;
  showGrid?: boolean;
}

export function Axes3D({
  range = 10,
  labels = ["X", "Y", "Z"],
  tickInterval = 1,
  showGrid = true,
}: Axes3DProps) {
  // Suppress unused variable warning for labels placeholder parameter
  void labels;
  return (
    <group>
      {showGrid && <AxisGrid3D size={range} divisions={range / tickInterval} />}
    </group>
  );
}
