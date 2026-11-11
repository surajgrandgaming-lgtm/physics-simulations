import { create } from "zustand";

export interface GravityScannerStageConfig {
  stage: number;
  planetName: string;
  length: number; // m
  swings: number;
  totalTime: number; // seconds
  period: number; // seconds per full swing
  targetGravity: number; // m/s²
  tolerance: number; // m/s²
  sliderMin: number;
  sliderMax: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;
  mathDerivation: {
    title: string;
    concept: string;
    conclusion: string;
    formulas: {
      label: string;
      formula: string;
      explanation: string;
    }[];
    steps: {
      step: number;
      title: string;
      math: string;
      explanation: string;
    }[];
  };
}

export const GRAVITY_SCANNER_STAGES: Record<number, GravityScannerStageConfig> = {
  1: {
    stage: 1,
    planetName: "Research Station Alpha",
    length: 1.0, // 1.00 m
    swings: 2,
    totalTime: 6.0, // 2 swings in 6.0 s -> T = 3.00 s
    period: 3.0,
    targetGravity: 4.39, // (4 * pi^2 * 1.0) / 9.0 = 4.3865 m/s² ≈ 4.39 m/s²
    tolerance: 0.15,
    sliderMin: 1.0,
    sliderMax: 15.0,
    sliderDefault: 7.0,
    stepSmall: 0.01,
    stepLarge: 0.1,
    mathDerivation: {
      title: "Stage 1: Determining Planet Alpha's Surface Gravity",
      concept:
        "For a simple pendulum executing small angular oscillations, the restoring torque is proportional to the angular displacement. The oscillation period is independent of the bob's mass and depends solely on the suspension length (L) and the local acceleration due to gravity (g). By accurately measuring the time taken for a fixed count of complete oscillation cycles, the local gravitational field strength can be determined analytically.",
      conclusion:
        "With a period of T = 3.00 s measured on a 1.00 m pendulum, the local gravitational field strength of Station Alpha is calculated to be g = 4.39 m/s².",
      formulas: [
        {
          label: "1. TIME PERIOD OF A SIMPLE PENDULUM",
          formula: "T = 2\\pi \\sqrt{\\dfrac{L}{g}}",
          explanation:
            "Under small angles (θ ≤ 15°), the restoring torque creates simple harmonic motion where period T scales with √(L/g).",
        },
        {
          label: "2. PERIOD FROM TIMED SWING COUNT",
          formula: "T = \\dfrac{t_{total}}{N}",
          explanation:
            "Dividing total elapsed time by the number of complete back-and-forth swings isolates the duration of a single full oscillation.",
        },
        {
          label: "3. ISOLATED FORMULA FOR LOCAL GRAVITY (g)",
          formula: "g = \\dfrac{4\\pi^2 L}{T^2}",
          explanation:
            "Squaring both sides of the period equation and solving for g yields the exact gravitational field strength.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Known Experimental Data",
          math: "L = 1.00\\text{ m}, \\quad N = 2\\text{ swings}, \\quad t_{total} = 6.00\\text{ s}",
          explanation:
            "The planetary research pendulum has an effective length of 1.00 m and completes 2 full back-and-forth oscillation cycles in 6.00 seconds.",
        },
        {
          step: 2,
          title: "Calculate the Period of One Complete Swing (T)",
          math: "T = \\dfrac{t_{total}}{N} = \\dfrac{6.00\\text{ s}}{2} = 3.00\\text{ s}",
          explanation:
            "Dividing the total timed duration (6.00 s) by 2 complete swings gives an exact period of 3.00 seconds per full oscillation.",
        },
        {
          step: 3,
          title: "Substitute Into the Gravitational Field Formula",
          math: "g = \\dfrac{4\\pi^2 L}{T^2} = \\dfrac{4 \\times (3.1416)^2 \\times 1.00\\text{ m}}{(3.00\\text{ s})^2} = \\dfrac{39.478}{9.00} \\approx 4.39\\text{ m/s}^2",
          explanation:
            "Squaring the 3.00 s period yields 9.00 s². Dividing 4π²L (39.48) by 9.00 reveals that the local gravity of Station Alpha is 4.39 m/s².",
        },
      ],
    },
  },
  2: {
    stage: 2,
    planetName: "Colony Outpost Beta",
    length: 1.25, // 1.25 m
    swings: 3,
    totalTime: 7.5, // 3 swings in 7.5 s -> T = 2.50 s
    period: 2.5,
    targetGravity: 7.90, // (4 * pi^2 * 1.25) / (2.5^2) = 49.348 / 6.25 = 7.8956 m/s² ≈ 7.90 m/s²
    tolerance: 0.15,
    sliderMin: 1.0,
    sliderMax: 15.0,
    sliderDefault: 5.0,
    stepSmall: 0.01,
    stepLarge: 0.1,
    mathDerivation: {
      title: "Stage 2: Gravimetric Analysis of Outpost Beta",
      concept:
        "On Outpost Beta, a longer 1.25 m pendulum is observed. Even though the string is longer, the bob completes 3 full swings in only 7.50 seconds (T = 2.50 s). A faster period on a longer pendulum indicates a significantly stronger gravitational acceleration than Station Alpha.",
      conclusion:
        "Evaluating T = 2.50 s for a 1.25 m pendulum yields a local gravity of g = 7.90 m/s², confirming the denser planetary crust of Outpost Beta.",
      formulas: [
        {
          label: "1. SMALL-ANGLE PENDULUM RELATION",
          formula: "T = 2\\pi \\sqrt{\\dfrac{L}{g}} \\iff g = \\dfrac{4\\pi^2 L}{T^2}",
          explanation:
            "Local gravitational acceleration is directly proportional to length L and inversely proportional to T².",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Given Observational Data",
          math: "L = 1.25\\text{ m}, \\quad N = 3\\text{ swings}, \\quad t_{total} = 7.50\\text{ s}",
          explanation:
            "A 1.25 m pendulum completes 3 full oscillation cycles in 7.50 seconds.",
        },
        {
          step: 2,
          title: "Determine the Oscillation Period (T)",
          math: "T = \\dfrac{t_{total}}{N} = \\dfrac{7.50\\text{ s}}{3} = 2.50\\text{ s}",
          explanation:
            "Dividing 7.50 s by 3 swings yields a period of T = 2.50 seconds per cycle.",
        },
        {
          step: 3,
          title: "Compute Outpost Beta's Surface Gravity (g)",
          math: "g = \\dfrac{4\\pi^2 L}{T^2} = \\dfrac{4 \\times 9.8696 \\times 1.25\\text{ m}}{(2.50\\text{ s})^2} = \\dfrac{49.348}{6.25} \\approx 7.90\\text{ m/s}^2",
          explanation:
            "Evaluating the formula gives g = 7.90 m/s², proving Outpost Beta has roughly 80% of Earth's gravity.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    planetName: "Mining Exoplanet Gamma",
    length: 1.6, // 1.60 m
    swings: 3,
    totalTime: 12.0, // 3 swings in 12.0 s -> T = 4.00 s
    period: 4.0,
    targetGravity: 3.95, // (4 * pi^2 * 1.60) / 16.0 = 63.165 / 16.0 = 3.9478 m/s² ≈ 3.95 m/s²
    tolerance: 0.15,
    sliderMin: 1.0,
    sliderMax: 15.0,
    sliderDefault: 8.0,
    stepSmall: 0.01,
    stepLarge: 0.1,
    mathDerivation: {
      title: "Stage 3: Deep Space Survey on Exoplanet Gamma",
      concept:
        "On the low-density exoplanet Gamma, an extended 1.60 m pendulum requires 12.00 seconds to finish 3 swings. The sluggish oscillation period of T = 4.00 s reveals a relatively weak gravitational field, characteristic of a low-mass mineral planetoid.",
      conclusion:
        "A 4.00 s period on a 1.60 m pendulum confirms the surface gravity of Exoplanet Gamma is g = 3.95 m/s² (very close to Martian gravity).",
      formulas: [
        {
          label: "1. GRAVITATIONAL FIELD STRENGTH",
          formula: "g = \\dfrac{4\\pi^2 L}{T^2}",
          explanation:
            "Calculates the exact acceleration due to gravity from the measured pendulum dimensions and period.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Given Observational Data",
          math: "L = 1.60\\text{ m}, \\quad N = 3\\text{ swings}, \\quad t_{total} = 12.00\\text{ s}",
          explanation:
            "A long 1.60 m survey pendulum takes 12.00 seconds for 3 complete oscillations.",
        },
        {
          step: 2,
          title: "Calculate the Period (T)",
          math: "T = \\dfrac{t_{total}}{N} = \\dfrac{12.00\\text{ s}}{3} = 4.00\\text{ s}",
          explanation:
            "Dividing 12.00 s by 3 swings gives an oscillation period of T = 4.00 seconds.",
        },
        {
          step: 3,
          title: "Calculate Planet Gamma's Surface Gravity (g)",
          math: "g = \\dfrac{4\\pi^2 L}{T^2} = \\dfrac{4 \\times 9.8696 \\times 1.60\\text{ m}}{(4.00\\text{ s})^2} = \\dfrac{63.165}{16.00} \\approx 3.95\\text{ m/s}^2",
          explanation:
            "Dividing by 16.00 s² determines the surface gravity to be g = 3.95 m/s².",
        },
      ],
    },
  },
};

export const RELEASE_ANGLE = (10 * Math.PI) / 180; // 10 degrees small-angle harmonic displacement

interface GravityScannerState {
  currentStage: number;
  sliderValue: number; // User's gravity estimate (m/s²)
  isWaitingForSync: boolean; // True when user clicked RUN, waiting for left pendulum to reach extreme right
  isSimulating: boolean; // True once synchronized release occurs
  isWon: boolean;
  isGameOver: boolean;
  failureReason: string | null;
  showResultModal: boolean;
  isMissionStarted: boolean;
  missionStartedAt: number | null;

  // Real-time animation coordinates
  simTime: number; // elapsed simulation seconds once released
  measuredSwings: number; // count of completed swings

  // Actions
  setSliderValue: (val: number) => void;
  startMission: () => void;
  requestRun: () => void;
  triggerSyncRelease: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  tickSimulation: (dt: number) => void;
  setShowResultModal: (show: boolean) => void;
}

export const useGravityScannerStore = create<GravityScannerState>((set, get) => ({
  currentStage: 1,
  sliderValue: GRAVITY_SCANNER_STAGES[1].sliderDefault,
  isWaitingForSync: false,
  isSimulating: false,
  isWon: false,
  isGameOver: false,
  failureReason: null,
  showResultModal: false,
  isMissionStarted: false,
  missionStartedAt: null,

  simTime: 0,
  measuredSwings: 0,

  setSliderValue: (val: number) => {
    const stage = GRAVITY_SCANNER_STAGES[get().currentStage];
    const clamped = Math.max(stage.sliderMin, Math.min(stage.sliderMax, val));
    set({ sliderValue: Math.round(clamped * 100) / 100 });
  },

  startMission: () => {
    const stage = GRAVITY_SCANNER_STAGES[get().currentStage];
    set({
      sliderValue: stage.sliderDefault,
      isWaitingForSync: false,
      isSimulating: false,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      simTime: 0,
      measuredSwings: 0,
    });
  },

  requestRun: () => {
    // When user clicks RUN, enter waiting-for-sync state so the reference pendulum
    // releases exactly when the planet pendulum hits its extreme right position (crest)
    set({
      isWaitingForSync: true,
      isSimulating: false,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      simTime: 0,
      measuredSwings: 0,
    });
  },

  triggerSyncRelease: () => {
    set({
      isWaitingForSync: false,
      isSimulating: true,
      simTime: 0,
      measuredSwings: 0,
    });
  },

  resetSimulation: () => {
    set({
      isWaitingForSync: false,
      isSimulating: false,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      simTime: 0,
      measuredSwings: 0,
    });
  },

  nextStage: () => {
    const current = get().currentStage;
    const next = current < 3 ? current + 1 : 1;
    const stage = GRAVITY_SCANNER_STAGES[next];
    set({
      currentStage: next,
      sliderValue: stage.sliderDefault,
      isWaitingForSync: false,
      isSimulating: false,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      simTime: 0,
      measuredSwings: 0,
    });
  },

  setShowResultModal: (show: boolean) => set({ showResultModal: show }),

  tickSimulation: (dt: number) => {
    const state = get();
    if (!state.isSimulating) return;

    const stage = GRAVITY_SCANNER_STAGES[state.currentStage];
    const targetPeriod = stage.period;
    const totalSimDuration = targetPeriod * stage.swings; // Run exactly the target number of full swings
    const newTime = state.simTime + dt;
    const swingsCompleted = Math.floor(newTime / targetPeriod);

    if (newTime >= totalSimDuration) {
      const estimate = state.sliderValue;
      const target = stage.targetGravity;
      const error = Math.abs(estimate - target);
      const isSuccess = error <= stage.tolerance;

      if (isSuccess) {
        set({
          simTime: totalSimDuration,
          measuredSwings: stage.swings,
          isSimulating: false,
          isWon: true,
          isGameOver: false,
          showResultModal: true,
        });
      } else {
        const reason =
          estimate > target
            ? `Your gravity estimate (${estimate.toFixed(2)} m/s²) is too high! The reference pendulum swung ahead of the planet's pendulum.`
            : `Your gravity estimate (${estimate.toFixed(2)} m/s²) is too low! The reference pendulum lagged behind the planet's pendulum.`;

        set({
          simTime: totalSimDuration,
          measuredSwings: stage.swings,
          isSimulating: false,
          isWon: false,
          isGameOver: true,
          failureReason: reason,
          showResultModal: true,
        });
      }
    } else {
      set({
        simTime: newTime,
        measuredSwings: swingsCompleted,
      });
    }
  },
}));
