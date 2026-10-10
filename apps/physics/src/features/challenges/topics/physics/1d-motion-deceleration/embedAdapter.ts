export interface EmbedTopicAdapter {
  getTelemetry?: (state: Record<string, unknown>, elapsedSeconds: number) => Record<string, number>;
}

export const emergencyStopEmbedAdapter: EmbedTopicAdapter = {
  getTelemetry: (state: Record<string, unknown>, elapsedSeconds: number): Record<string, number> => {
    return {
      elapsedSeconds: Math.round(elapsedSeconds * 100) / 100,
      stoppedPosition: typeof state?.stoppedPosition === "number" ? Math.round(state.stoppedPosition * 100) / 100 : 0,
      hitIntersection: state?.hitIntersection ? 1 : 0,
      initialSpeed: typeof state?.initialSpeed === "number" ? state.initialSpeed : 0,
      brakeMarkerX: typeof state?.brakeMarkerX === "number" ? state.brakeMarkerX : 0,
      totalScore: typeof state?.totalScore === "number" ? state.totalScore : 0,
      streak: typeof state?.streak === "number" ? state.streak : 0,
    };
  },
};

export default emergencyStopEmbedAdapter;
