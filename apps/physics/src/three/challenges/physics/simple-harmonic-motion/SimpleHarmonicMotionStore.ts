import { create } from "zustand";

export interface SHMStageConfig {
  stage: number;
  title: string;
  stageBadge: string;
  missionObjective: string;
  missionQuestion: string;
  mass: number; // kg
  amplitude: number; // meters
  targetVmax: number; // m/s
  targetK: number; // N/m exact
  tolerance: number; // N/m
  unit: string;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;
  paramName: string;
  tip: string;
  explanationTrap: string;
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
      calculation: string;
      explanation: string;
    }[];
  };
}

export const SHM_STAGES: Record<number, SHMStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Standard Harmonic Calibration",
    stageBadge: "STAGE 1 • HARMONIC CALIBRATION",
    missionObjective: "Tune Spring Constant k to Reach v_max = 2.50 m/s",
    missionQuestion:
      "A frictionless air-track glider of mass m = 2.00 kg is attached to a horizontal helical spring and pulled to amplitude A = 0.50 m. What spring constant (k in N/m) must the spring have so that the glider reaches a maximum speed of exactly v_max = 2.50 m/s as it passes through the equilibrium position?",
    mass: 2.0,
    amplitude: 0.5,
    targetVmax: 2.5,
    targetK: 50.0,
    tolerance: 2.0,
    unit: "N/m",
    sliderMin: 10,
    sliderMax: 120,
    sliderStep: 1,
    sliderDefault: 30,
    stepSmall: 1,
    stepLarge: 5,
    paramName: "Spring Constant (k)",
    tip: "Remember that maximum velocity occurs at x = 0 where all potential energy is converted to kinetic energy: v_max = A·ω = A·√(k/m).",
    explanationTrap:
      "A common error is confusing amplitude A with peak-to-peak displacement 2A, or forgetting to square the angular frequency ω when calculating k = m·ω².",
    mathDerivation: {
      title: "Stage 1: Simple Harmonic Motion & Spring Stiffness Calibration",
      concept:
        "Simple Harmonic Motion (SHM) occurs when the restoring force acting on a displaced body is directly proportional to its displacement from equilibrium and directed toward that equilibrium position: F = -k·x. By the Law of Conservation of Mechanical Energy, in the absence of friction, the total energy of the oscillating glider remains completely constant. At the extreme release point (x = A), the glider is momentarily at rest (v = 0), storing all energy as elastic potential energy: E_p = 1/2·k·A². When released, this stored potential energy converts into kinetic energy. As the glider sweeps across the equilibrium position (x = 0), elastic potential energy drops to zero, and kinetic energy reaches its absolute peak: E_k = 1/2·m·v_max². Equating these two energies gives the fundamental speed-amplitude relationship.",
      conclusion:
        "To achieve a peak speed of exactly 2.50 m/s with a 2.00 kg glider released from 0.50 m, the system requires an angular frequency of ω = 5.00 rad/s. This dictates a spring constant of exactly k = 50.0 N/m.",
      formulas: [
        {
          label: "1. CONSERVATION OF MECHANICAL ENERGY IN SHM",
          formula: "E_{total} = \\dfrac{1}{2} k A^2 = \\dfrac{1}{2} m v_{max}^2",
          explanation:
            "Because the air-track is frictionless, total energy at maximum amplitude (pure elastic potential energy) equals total energy at equilibrium (pure kinetic energy).",
        },
        {
          label: "2. MAXIMUM VELOCITY & ANGULAR FREQUENCY RELATION",
          formula: "\\omega = \\sqrt{\\dfrac{k}{m}}, \\qquad v_{max} = A \\cdot \\omega = A \\sqrt{\\dfrac{k}{m}}",
          explanation:
            "The glider's maximum linear velocity occurs at x = 0 and is directly proportional to the release amplitude A and the natural angular frequency ω.",
        },
        {
          label: "3. ISOLATED FORMULA FOR SPRING CONSTANT (k)",
          formula: "k = m \\cdot \\left(\\dfrac{v_{max}}{A}\\right)^2 = m \\cdot \\omega^2",
          explanation:
            "Rearranging the maximum speed formula isolates the required spring stiffness k in terms of mass, target speed, and displacement amplitude.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Known Experimental Values & Goal",
          math: "m = 2.00\\text{ kg}, \\quad A = 0.50\\text{ m}, \\quad v_{max} = 2.50\\text{ m/s}",
          calculation: "Mass m = 2.00 kg • Amplitude A = 0.50 m • Target v_max = 2.50 m/s",
          explanation:
            "The glider has a mass of 2.00 kg and is pulled to an initial displacement of A = 0.50 m from the center. It must reach v_max = 2.50 m/s when passing through the optical sensor at x = 0.",
        },
        {
          step: 2,
          title: "Calculate the Required Angular Oscillation Frequency (ω)",
          math: "\\omega = \\dfrac{v_{max}}{A} = \\dfrac{2.50\\text{ m/s}}{0.50\\text{ m}} = 5.00\\text{ rad/s}",
          calculation: "omega = v_max / A = 2.50 / 0.50 = 5.00 rad/s",
          explanation:
            "Angular frequency represents the rate of phase rotation in radians per second. Dividing the target maximum speed by the displacement amplitude gives the precise oscillation rate needed: 5.00 rad/s.",
        },
        {
          step: 3,
          title: "Calculate the Corresponding Oscillation Period (T)",
          math: "T = \\dfrac{2\\pi}{\\omega} = \\dfrac{2 \\times 3.1416}{5.00\\text{ rad/s}} = 1.257\\text{ seconds}",
          calculation: "T = 2 * pi / omega = 6.283 / 5.00 = 1.26 s",
          explanation:
            "The glider will complete one full back-and-forth oscillation cycle every 1.26 seconds, sweeping past the optical photogate twice per cycle.",
        },
        {
          step: 4,
          title: "Solve for Required Spring Constant (k)",
          math: "k = m \\cdot \\omega^2 = 2.00\\text{ kg} \\times (5.00\\text{ rad/s})^2 = 2.00 \\times 25.00 = 50.0\\text{ N/m}",
          calculation: "k = 2.00 * (5.00)^2 = 2.00 * 25.0 = 50.0 N/m (Newtons per Meter)",
          explanation:
            "Since ω = √(k/m), squaring both sides gives k = m·ω². Multiplying the 2.00 kg glider mass by 25.00 rad²/s² proves that a spring stiffness of exactly 50.0 N/m is required.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: Heavy Glider & Higher Frequency",
    stageBadge: "STAGE 2 • HEAVY GLIDER",
    missionObjective: "Tune Spring Constant k to Reach v_max = 3.60 m/s",
    missionQuestion:
      "A heavy research glider of mass m = 4.00 kg is released from rest at amplitude A = 0.40 m. Calculate the required spring stiffness (k in N/m) so that its kinetic energy at equilibrium translates into a maximum velocity of exactly v_max = 3.60 m/s.",
    mass: 4.0,
    amplitude: 0.4,
    targetVmax: 3.6,
    targetK: 324.0,
    tolerance: 6.0,
    unit: "N/m",
    sliderMin: 100,
    sliderMax: 500,
    sliderStep: 1,
    sliderDefault: 200,
    stepSmall: 1,
    stepLarge: 10,
    paramName: "Spring Constant (k)",
    tip: "With a heavier mass and smaller amplitude, a much stiffer spring is needed to achieve the higher target velocity: k = m · (v_max / A)².",
    explanationTrap:
      "Notice that doubling the mass while increasing the frequency requires a steep increase in k because stiffness scales with the square of frequency.",
    mathDerivation: {
      title: "Stage 2: Heavy Glider Dynamics & Spring Stiffening Derivation",
      concept:
        "When the mass of the oscillating body increases, its inertia (resistance to acceleration) increases proportionally. To accelerate a heavier 4.00 kg research glider to a higher velocity of 3.60 m/s across a shorter displacement stroke of only 0.40 m, the spring must supply significantly greater restoring forces at every point along the path. Because angular frequency is ω = v_max / A, a high velocity paired with a smaller amplitude requires a rapid frequency of oscillation (9.00 rad/s). Because spring constant k scales with the square of the angular frequency (k = m·ω²), the required stiffness grows dramatically.",
      conclusion:
        "Tuning the spring stiffness to exactly k = 324.0 N/m provides the necessary restoring force gradient to propel the 4.00 kg glider to 3.60 m/s as it sweeps past x = 0.",
      formulas: [
        {
          label: "1. ANGULAR FREQUENCY REQUIREMENT",
          formula: "\\omega = \\dfrac{v_{max}}{A} = \\dfrac{3.60\\text{ m/s}}{0.40\\text{ m}} = 9.00\\text{ rad/s}",
          explanation:
            "Dividing the high peak velocity by the shorter 0.40 m stroke reveals that the oscillator must cycle at 9.00 radians per second.",
        },
        {
          label: "2. KINETIC ENERGY & MAXIMUM WORK CAPACITY",
          formula: "E_k = \\dfrac{1}{2} m v_{max}^2 = \\dfrac{1}{2} (4.00\\text{ kg}) (3.60\\text{ m/s})^2 = 25.92\\text{ Joules}",
          explanation:
            "At equilibrium (x = 0), the heavy glider carries 25.92 Joules of pure kinetic energy, all of which was originally stored in the compressed/stretched spring.",
        },
        {
          label: "3. QUADRATIC DEPENDENCE OF SPRING STIFFNESS",
          formula: "k = m \\cdot \\left(\\dfrac{v_{max}}{A}\\right)^2 = m \\cdot \\omega^2",
          explanation:
            "Spring stiffness scales linearly with mass and quadratically with frequency. Doubling the mass and nearly doubling the frequency demands a spring more than 6× stiffer than Stage 1.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Known Experimental Values",
          math: "m = 4.00\\text{ kg}, \\quad A = 0.40\\text{ m}, \\quad v_{max} = 3.60\\text{ m/s}",
          calculation: "Mass m = 4.00 kg • Amplitude A = 0.40 m • Target v_max = 3.60 m/s",
          explanation:
            "The glider mass is increased to 4.00 kg and displaced to an amplitude of A = 0.40 m. The goal is achieving exactly 3.60 m/s at x = 0.",
        },
        {
          step: 2,
          title: "Compute Required Angular Frequency (ω)",
          math: "\\omega = \\dfrac{v_{max}}{A} = \\dfrac{3.60\\text{ m/s}}{0.40\\text{ m}} = 9.00\\text{ rad/s}",
          calculation: "omega = 3.60 / 0.40 = 9.00 rad/s",
          explanation:
            "The glider must oscillate at 9.00 rad/s to sweep through a 0.40 m amplitude at a peak speed of 3.60 m/s.",
        },
        {
          step: 3,
          title: "Compute the Kinetic Energy at Equilibrium",
          math: "E_k = \\dfrac{1}{2} m v_{max}^2 = \\dfrac{1}{2} (4.00) (3.60)^2 = 2.00 \\times 12.96 = 25.92\\text{ Joules}",
          calculation: "E_k = 0.5 * 4.00 * (3.60)^2 = 25.92 J",
          explanation:
            "All 25.92 Joules must originate from the elastic potential energy stored in the spring at release: E_p = 1/2·k·A².",
        },
        {
          step: 4,
          title: "Calculate the Spring Constant (k)",
          math: "k = m \\cdot \\omega^2 = 4.00\\text{ kg} \\times (9.00\\text{ rad/s})^2 = 4.00 \\times 81.00 = 324.0\\text{ N/m}",
          calculation: "k = 4.00 * 81.00 = 324.0 N/m (Newtons per Meter)",
          explanation:
            "Multiplying the 4.00 kg glider mass by ω² (81.00) confirms that a spring constant of exactly 324.0 N/m is required.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: High-Amplitude Precision Resonance",
    stageBadge: "STAGE 3 • HIGH AMPLITUDE",
    missionObjective: "Tune Spring Constant k to Reach v_max = 6.00 m/s",
    missionQuestion:
      "A lightweight precision glider of mass m = 1.50 kg is displaced to a wide stroke amplitude A = 0.80 m. What spring constant (k in N/m) must be calibrated so that the glider attains a high-velocity pass of exactly v_max = 6.00 m/s through the optical gate at equilibrium?",
    mass: 1.5,
    amplitude: 0.8,
    targetVmax: 6.0,
    targetK: 84.0, // 84.375 rounded to whole N/m = 84 N/m (tolerance +-3)
    tolerance: 3.0,
    unit: "N/m",
    sliderMin: 20,
    sliderMax: 180,
    sliderStep: 1,
    sliderDefault: 50,
    stepSmall: 1,
    stepLarge: 5,
    paramName: "Spring Constant (k)",
    tip: "With a large amplitude (0.80 m) and lightweight mass (1.50 kg), calculate: ω = 6.0 / 0.8 = 7.5 rad/s, then k = m · ω² = 1.5 · 56.25 ≈ 84 N/m.",
    explanationTrap:
      "Be careful to keep unit consistency and account for both the lightweight glider and wide displacement stroke.",
    mathDerivation: {
      title: "Stage 3: High-Amplitude Precision Tuning Derivation",
      concept:
        "In this final stage, the system uses a lightweight glider (1.50 kg) pulled out to an extended amplitude of A = 0.80 m to achieve a rapid optical gate transit speed of 6.00 m/s. Because potential energy scales quadratically with amplitude (E_p = 1/2·k·A²), a larger amplitude stores considerably more energy for any given spring stiffness. Consequently, even though the glider reaches a fast maximum speed of 6.00 m/s, the wide stroke allows a moderate angular frequency (ω = 7.50 rad/s) and a moderate spring stiffness of ~84 N/m.",
      conclusion:
        "Calibrating the spring stiffness to k = 84.0 N/m (within ±3 N/m tolerance) perfectly balances the large 0.80 m amplitude stroke and lightweight glider to deliver exactly 6.00 m/s through the optical sensor.",
      formulas: [
        {
          label: "1. ANGULAR FREQUENCY FROM EXTENDED STROKE",
          formula: "\\omega = \\dfrac{v_{max}}{A} = \\dfrac{6.00\\text{ m/s}}{0.80\\text{ m}} = 7.50\\text{ rad/s}",
          explanation:
            "Dividing the 6.00 m/s target speed by the 0.80 m amplitude demonstrates that the glider must oscillate at 7.50 rad/s.",
        },
        {
          label: "2. MAXIMUM KINETIC ENERGY DELIVERED",
          formula: "E_k = \\dfrac{1}{2} m v_{max}^2 = \\dfrac{1}{2} (1.50\\text{ kg}) (6.00\\text{ m/s})^2 = 27.00\\text{ Joules}",
          explanation:
            "The glider converts 27.00 Joules of elastic potential energy entirely into kinetic energy as it passes through the center.",
        },
        {
          label: "3. ANALYTIC SPRING CONSTANT SOLUTION",
          formula: "k = m \\cdot \\left(\\dfrac{v_{max}}{A}\\right)^2 = m \\cdot \\omega^2",
          explanation:
            "Equating 1/2·k·A² = 1/2·m·v_max² isolates the exact required spring stiffness k.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Known Experimental Values",
          math: "m = 1.50\\text{ kg}, \\quad A = 0.80\\text{ m}, \\quad v_{max} = 6.00\\text{ m/s}",
          calculation: "Mass m = 1.50 kg • Amplitude A = 0.80 m • Target v_max = 6.00 m/s",
          explanation:
            "A lightweight 1.50 kg glider is pulled to an extended amplitude of A = 0.80 m and released from rest.",
        },
        {
          step: 2,
          title: "Calculate the Required Angular Frequency (ω)",
          math: "\\omega = \\dfrac{v_{max}}{A} = \\dfrac{6.00\\text{ m/s}}{0.80\\text{ m}} = 7.50\\text{ rad/s}",
          calculation: "omega = 6.00 / 0.80 = 7.50 rad/s",
          explanation:
            "The glider must oscillate at an angular rate of 7.50 rad/s.",
        },
        {
          step: 3,
          title: "Calculate Oscillation Period (T)",
          math: "T = \\dfrac{2\\pi}{\\omega} = \\dfrac{6.2832}{7.50\\text{ rad/s}} = 0.838\\text{ seconds}",
          calculation: "T = 2 * pi / 7.50 = 0.84 s",
          explanation:
            "The glider makes a complete cycle every 0.84 seconds, delivering swift transits across the center.",
        },
        {
          step: 4,
          title: "Solve for the Spring Constant (k)",
          math: "k = m \\cdot \\omega^2 = 1.50\\text{ kg} \\times (7.50\\text{ rad/s})^2 = 1.50 \\times 56.25 = 84.38\\text{ N/m} \\approx 84\\text{ N/m}",
          calculation: "k = 1.50 * 56.25 = 84.375 N/m ≈ 84 N/m (Newtons per Meter)",
          explanation:
            "Setting the spring stiffness to 84 N/m (with a tolerance of ±3 N/m) achieves the required restoring force for 6.00 m/s transit.",
        },
      ],
    },
  },
};

interface SHMState {
  currentStage: number;
  sliderValue: number; // User-selected k (N/m)
  isSimulating: boolean;
  isWon: boolean;
  isGameOver: boolean;
  failureReason: string | null;
  showResultModal: boolean;
  isMissionStarted: boolean;
  missionStartedAt: number | null;

  // Real-time dynamic values updated by simulation loop
  simTime: number; // seconds
  currentX: number; // displacement x(t) in meters
  currentV: number; // velocity v(t) in m/s
  measuredVmax: number; // recorded max speed when passing x=0
  phaseTrail: { x: number; v: number }[]; // trail of (x, v) points for phase portrait

  // Actions
  setSliderValue: (val: number) => void;
  startMission: () => void;
  startSimulation: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  tickSimulation: (dt: number) => void;
  setShowResultModal: (show: boolean) => void;
}

export const useSimpleHarmonicMotionStore = create<SHMState>((set, get) => ({
  currentStage: 1,
  sliderValue: SHM_STAGES[1].sliderDefault,
  isSimulating: false,
  isWon: false,
  isGameOver: false,
  failureReason: null,
  showResultModal: false,
  isMissionStarted: false,
  missionStartedAt: null,

  simTime: 0,
  currentX: SHM_STAGES[1].amplitude,
  currentV: 0,
  measuredVmax: 0,
  phaseTrail: [],

  setSliderValue: (val: number) => {
    const stage = SHM_STAGES[get().currentStage];
    const clamped = Math.max(stage.sliderMin, Math.min(stage.sliderMax, val));
    set({ sliderValue: clamped });
  },

  startMission: () => {
    const stage = SHM_STAGES[get().currentStage];
    set({
      sliderValue: stage.sliderDefault,
      isSimulating: false,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      simTime: 0,
      currentX: stage.amplitude,
      currentV: 0,
      measuredVmax: 0,
      phaseTrail: [],
    });
  },

  startSimulation: () => {
    const stage = SHM_STAGES[get().currentStage];
    set({
      isSimulating: true,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      simTime: 0,
      currentX: stage.amplitude,
      currentV: 0,
      measuredVmax: 0,
      phaseTrail: [{ x: stage.amplitude, v: 0 }],
    });
  },

  resetSimulation: () => {
    const stage = SHM_STAGES[get().currentStage];
    set({
      isSimulating: false,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      simTime: 0,
      currentX: stage.amplitude,
      currentV: 0,
      measuredVmax: 0,
      phaseTrail: [],
    });
  },

  nextStage: () => {
    const current = get().currentStage;
    const next = current < 3 ? current + 1 : 1;
    const stage = SHM_STAGES[next];
    set({
      currentStage: next,
      sliderValue: stage.sliderDefault,
      isSimulating: false,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      simTime: 0,
      currentX: stage.amplitude,
      currentV: 0,
      measuredVmax: 0,
      phaseTrail: [],
    });
  },

  setShowResultModal: (show: boolean) => set({ showResultModal: show }),

  tickSimulation: (dt: number) => {
    const state = get();
    if (!state.isSimulating) return;

    const stage = SHM_STAGES[state.currentStage];
    const k = state.sliderValue;
    const m = stage.mass;
    const A = stage.amplitude;
    const omega = Math.sqrt(k / m);

    const newTime = state.simTime + dt;
    // Simple Harmonic Motion equations: x(t) = A * cos(omega * t), v(t) = -A * omega * sin(omega * t)
    const newX = A * Math.cos(omega * newTime);
    const newV = -A * omega * Math.sin(omega * newTime);

    const actualVmax = A * omega;
    const newMeasuredVmax = Math.max(state.measuredVmax, Math.abs(newV));

    // Update phase trail (keep last 60 points for smooth ellipse visualization)
    const newPhaseTrail = [...state.phaseTrail, { x: newX, v: newV }];
    if (newPhaseTrail.length > 70) {
      newPhaseTrail.shift();
    }

    // Simulation duration: run at least 1.25 full cycles so it passes equilibrium at least twice
    const period = (2 * Math.PI) / omega;
    const simDuration = Math.max(2.5, Math.min(5.0, period * 1.35));

    if (newTime >= simDuration) {
      // Evaluate outcome
      const error = Math.abs(k - stage.targetK);
      const isSuccess = error <= stage.tolerance;

      if (isSuccess) {
        set({
          simTime: newTime,
          currentX: newX,
          currentV: newV,
          measuredVmax: actualVmax,
          phaseTrail: newPhaseTrail,
          isSimulating: false,
          isWon: true,
          isGameOver: false,
          showResultModal: true,
        });
      } else {
        const diff = actualVmax - stage.targetVmax;
        const reason =
          diff > 0
            ? `Glider speed (${actualVmax.toFixed(2)} m/s) exceeded target (${stage.targetVmax.toFixed(2)} m/s). Spring stiffness k = ${k.toFixed(0)} N/m is too stiff!`
            : `Glider speed (${actualVmax.toFixed(2)} m/s) was below target (${stage.targetVmax.toFixed(2)} m/s). Spring stiffness k = ${k.toFixed(0)} N/m is too loose!`;

        set({
          simTime: newTime,
          currentX: newX,
          currentV: newV,
          measuredVmax: actualVmax,
          phaseTrail: newPhaseTrail,
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
        currentX: newX,
        currentV: newV,
        measuredVmax: newMeasuredVmax,
        phaseTrail: newPhaseTrail,
      });
    }
  },
}));

