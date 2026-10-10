"use client";

/**
 * FunctionSurface — Data-driven Function Surface Renderer
 *
 * Renders a mathematical surface from f(x,y).
 * Wraps kit/math/SurfacePlot with subject-aware lighting and camera preset.
 * Used for calculus and coordinate geometry topics.
 */

import { SurfacePlot } from "@/three/kit/math/SurfacePlot";

export interface FunctionSurfaceProps {
  fn: (x: number, y: number) => number;
  xRange?: [number, number];
  yRange?: [number, number];
  resolution?: number;
  color?: string;
  wireframe?: boolean;
}

export function FunctionSurface({
  fn,
  xRange = [-3, 3],
  yRange = [-3, 3],
  resolution = 40,
  color = "#6A5ACD",
  wireframe = false,
}: FunctionSurfaceProps) {
  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <SurfacePlot
        fn={fn}
        xRange={xRange}
        yRange={yRange}
        resolution={resolution}
        color={color}
        wireframe={wireframe}
      />
    </group>
  );
}
