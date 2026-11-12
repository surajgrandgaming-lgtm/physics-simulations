import { create } from "zustand";

export interface DampedOscillationsStageConfig {
  stage: number;
  apparatusName: string;
  mass: number; // kg
  springK: number; // N/m
  initialDisplacement: number; // m
  criticalDamping: number; // N·s/m: bc = 2 * sqrt(k * m)
  tolerance: number; // ± tolerance in N·s/m
  sliderMin: number;
  sliderMax: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;
  settlingTimeLimit: number; // seconds
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

export const DAMPED_OSCILLATIONS_STAGES: Record<number, DampedOscillationsStageConfig> = {
  1: {
    stage: 1,
    apparatusName: "Light Aluminum Glider",
    mass: 1.0,
    springK: 9.0,
    initialDisplacement: 0.8,
    criticalDamping: 6.0, // 2 * sqrt(9.0 * 1.0) = 6.00 N·s/m
    tolerance: 0.35,
    sliderMin: 1.0,
    sliderMax: 15.0,
    sliderDefault: 3.0,
    stepSmall: 0.01,
    stepLarge: 0.1,
    settlingTimeLimit: 2.8,
    mathDerivation: {
      title: "Stage 1: Tuning Critical Damping (bc) for Light Glider",
      concept:
        "When an object oscillates with friction or fluid resistance, energy is removed over time. There are three possible outcomes:\n\n1. UNDERDAMPED (b < bc): Resistance is too weak. The cart overshoots past equilibrium and bounces back and forth like a loose car suspension.\n2. OVERDAMPED (b > bc): Resistance is too thick. The fluid drags heavily, making the cart creep back agonizingly slowly.\n3. CRITICALLY DAMPED (b = bc): The 'sweet spot'. The cart returns to rest at equilibrium in the absolute fastest time possible without bouncing or overshooting even once!",
      conclusion:
        "For m = 1.0 kg and k = 9.0 N/m, the exact critical damping coefficient is bc = 2√(k · m) = 6.00 N·s/m.",
      formulas: [
        {
          label: "1. THE DAMPED MOTION LAW",
          formula: "m \\dfrac{d^2x}{dt^2} + b \\dfrac{dx}{dt} + k x = 0",
          explanation:
            "This equation sums the three active forces: Mass Inertia (m·a), Viscous Fluid Resistance (-b·v), and Spring Pull (-k·x).",
        },
        {
          label: "2. CRITICAL DAMPING SWEET SPOT",
          formula: "b_c = 2 \\sqrt{k \\cdot m} = 2 m \\omega_0",
          explanation:
            "Derived from the quadratic discriminant (b² - 4km = 0). This is the exact threshold separating bouncing oscillations from sluggish dragging.",
        },
        {
          label: "3. NATURAL UNDAMPED FREQUENCY",
          formula: "\\omega_0 = \\sqrt{\\dfrac{k}{m}}",
          explanation:
            "How rapidly the system would vibrate if there were zero liquid friction.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Your Known Values",
          math: "m = 1.00\\text{ kg}, \\quad k = 9.00\\text{ N/m}",
          explanation:
            "The glider has a mass of 1.0 kg, and the attached spring has a stiffness of 9.0 N/m.",
        },
        {
          step: 2,
          title: "Multiply Spring Stiffness by Mass",
          math: "k \\cdot m = 9.00 \\times 1.00 = 9.00",
          explanation:
            "First, calculate the product inside the square root: 9.00 × 1.00 = 9.00.",
        },
        {
          step: 3,
          title: "Take the Square Root",
          math: "\\sqrt{k \\cdot m} = \\sqrt{9.00} = 3.00",
          explanation:
            "The square root of 9.00 is exactly 3.00.",
        },
        {
          step: 4,
          title: "Multiply by 2 for the Final Answer",
          math: "b_c = 2 \\times \\sqrt{k \\cdot m} = 2 \\times 3.00 = 6.00\\text{ N}\\cdot\\text{s/m}",
          explanation:
            "Set the damping slider to 6.00 N·s/m so the hydraulic piston provides ideal cushioning without any overshoot.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    apparatusName: "Medium Steel Carriage",
    mass: 2.0,
    springK: 18.0,
    initialDisplacement: 0.8,
    criticalDamping: 12.0, // 2 * sqrt(18.0 * 2.0) = 12.00 N·s/m
    tolerance: 0.6,
    sliderMin: 2.0,
    sliderMax: 25.0,
    sliderDefault: 6.0,
    stepSmall: 0.01,
    stepLarge: 0.1,
    settlingTimeLimit: 2.8,
    mathDerivation: {
      title: "Stage 2: Calibrating Medium Carriage Suspension",
      concept:
        "Now the cart mass has doubled to 2.0 kg and the spring stiffness has doubled to 18.0 N/m. Because both inertia and spring pull are greater, the hydraulic dashpot must provide stronger damping to absorb the additional momentum without bouncing.",
      conclusion:
        "For m = 2.0 kg and k = 18.0 N/m, the required critical damping is bc = 2√(18.0 × 2.0) = 12.00 N·s/m.",
      formulas: [
        {
          label: "1. CRITICAL DAMPING SWEET SPOT",
          formula: "b_c = 2 \\sqrt{k \\cdot m}",
          explanation:
            "As mass and stiffness scale up, the required damping coefficient scales proportionally with √(k · m).",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Your Known Values",
          math: "m = 2.00\\text{ kg}, \\quad k = 18.00\\text{ N/m}",
          explanation: "Carriage mass m = 2.0 kg and spring constant k = 18.0 N/m.",
        },
        {
          step: 2,
          title: "Calculate the Product (k · m)",
          math: "k \\cdot m = 18.00 \\times 2.00 = 36.00",
          explanation: "Multiplying stiffness by mass gives 36.00.",
        },
        {
          step: 3,
          title: "Take the Square Root",
          math: "\\sqrt{k \\cdot m} = \\sqrt{36.00} = 6.00",
          explanation: "The square root of 36.00 is 6.00.",
        },
        {
          step: 4,
          title: "Multiply by 2 for Critical Damping",
          math: "b_c = 2 \\times 6.00 = 12.00\\text{ N}\\cdot\\text{s/m}",
          explanation:
            "Set the damping slider to 12.00 N·s/m so the heavier cart settles quickly without vibrating.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    apparatusName: "Heavy Industrial Dashpot",
    mass: 4.0,
    springK: 25.0,
    initialDisplacement: 0.8,
    criticalDamping: 20.0, // 2 * sqrt(25.0 * 4.0) = 20.00 N·s/m
    tolerance: 0.9,
    sliderMin: 5.0,
    sliderMax: 35.0,
    sliderDefault: 10.0,
    stepSmall: 0.01,
    stepLarge: 0.1,
    settlingTimeLimit: 3.2,
    mathDerivation: {
      title: "Stage 3: Heavy Industrial Dashpot Optimization",
      concept:
        "In heavy industrial machinery (like elevators, door closers, and train buffers), critical damping is essential. If damping is even slightly under-tuned, the massive 4.0 kg payload will overshoot past equilibrium. If over-tuned, the thick fluid traps the cart and delays reset.",
      conclusion:
        "For m = 4.0 kg and k = 25.0 N/m, the optimal damping coefficient is bc = 2√(25.0 × 4.0) = 20.00 N·s/m.",
      formulas: [
        {
          label: "1. CRITICAL DAMPING SWEET SPOT",
          formula: "b_c = 2 \\sqrt{k \\cdot m}",
          explanation:
            "Guarantees that displacement x(t) decays exponentially to zero in minimum time with zero oscillation.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Your Known Values",
          math: "m = 4.00\\text{ kg}, \\quad k = 25.00\\text{ N/m}",
          explanation: "Industrial payload mass m = 4.0 kg and heavy spring stiffness k = 25.0 N/m.",
        },
        {
          step: 2,
          title: "Calculate the Product (k · m)",
          math: "k \\cdot m = 25.00 \\times 4.00 = 100.00",
          explanation: "Multiplying 25.00 by 4.00 gives exactly 100.00.",
        },
        {
          step: 3,
          title: "Take the Square Root",
          math: "\\sqrt{k \\cdot m} = \\sqrt{100.00} = 10.00",
          explanation: "The square root of 100.00 is 10.00.",
        },
        {
          step: 4,
          title: "Multiply by 2 for Critical Damping",
          math: "b_c = 2 \\times 10.00 = 20.00\\text{ N}\\cdot\\text{s/m}",
          explanation:
            "Set the damping slider to 20.00 N·s/m to achieve perfect critical damping on the industrial rig.",
        },
      ],
    },
  },
};

interface DampedOscillationsState {
  currentStage: number;
  sliderValue: number; // User's damping setting (b in N·s/m)
  isSimulating: boolean;
  isWon: boolean;
  isGameOver: boolean;
  failureReason: string | null;
  showResultModal: boolean;
  isMissionStarted: boolean;
  missionStartedAt: number | null;

  // Real-time animation physics
  simTime: number;
  currentX: number; // displacement in meters from equilibrium (x = 0)
  currentV: number; // velocity in m/s
  minReachedX: number; // track minimum x to detect overshoots (x < 0)

  // Actions
  setSliderValue: (val: number) => void;
  startMission: () => void;
  startSimulation: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  tickSimulation: (dt: number) => void;
  setShowResultModal: (show: boolean) => void;
}

export const useDampedOscillationsStore = create<DampedOscillationsState>((set, get) => ({
  currentStage: 1,
  sliderValue: DAMPED_OSCILLATIONS_STAGES[1].sliderDefault,
  isSimulating: false,
  isWon: false,
  isGameOver: false,
  failureReason: null,
  showResultModal: false,
  isMissionStarted: false,
  missionStartedAt: null,

  simTime: 0,
  currentX: DAMPED_OSCILLATIONS_STAGES[1].initialDisplacement,
  currentV: 0,
  minReachedX: DAMPED_OSCILLATIONS_STAGES[1].initialDisplacement,

  setSliderValue: (val: number) => {
    const stage = DAMPED_OSCILLATIONS_STAGES[get().currentStage];
    const clamped = Math.max(stage.sliderMin, Math.min(stage.sliderMax, val));
    set({ sliderValue: Math.round(clamped * 100) / 100 });
  },

  startMission: () => {
    const stage = DAMPED_OSCILLATIONS_STAGES[get().currentStage];
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
      currentX: stage.initialDisplacement,
      currentV: 0,
      minReachedX: stage.initialDisplacement,
    });
  },

  startSimulation: () => {
    const stage = DAMPED_OSCILLATIONS_STAGES[get().currentStage];
    set({
      isSimulating: true,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      simTime: 0,
      currentX: stage.initialDisplacement,
      currentV: 0,
      minReachedX: stage.initialDisplacement,
    });
  },

  resetSimulation: () => {
    const stage = DAMPED_OSCILLATIONS_STAGES[get().currentStage];
    set({
      isSimulating: false,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      simTime: 0,
      currentX: stage.initialDisplacement,
      currentV: 0,
      minReachedX: stage.initialDisplacement,
    });
  },

  nextStage: () => {
    const current = get().currentStage;
    const next = current < 3 ? current + 1 : 1;
    const stage = DAMPED_OSCILLATIONS_STAGES[next];
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
      currentX: stage.initialDisplacement,
      currentV: 0,
      minReachedX: stage.initialDisplacement,
    });
  },

  setShowResultModal: (show: boolean) => set({ showResultModal: show }),

  tickSimulation: (dt: number) => {
    const state = get();
    if (!state.isSimulating) return;

    const stage = DAMPED_OSCILLATIONS_STAGES[state.currentStage];
    const m = stage.mass;
    const k = stage.springK;
    const b = state.sliderValue;
    const x0 = stage.initialDisplacement;

    const newSimTime = state.simTime + dt;
    const gamma = b / (2 * m);
    const omega0 = Math.sqrt(k / m);
    const disc = gamma * gamma - omega0 * omega0;

    let x = 0;
    let v = 0;

    if (Math.abs(disc) < 0.001) {
      // Critically Damped
      // x(t) = x0 * (1 + gamma * t) * exp(-gamma * t)
      const expTerm = Math.exp(-gamma * newSimTime);
      x = x0 * (1 + gamma * newSimTime) * expTerm;
      v = -x0 * (gamma * gamma * newSimTime) * expTerm;
    } else if (disc < 0) {
      // Underdamped (oscillatory with decay envelope)
      const omegaD = Math.sqrt(omega0 * omega0 - gamma * gamma);
      const expTerm = Math.exp(-gamma * newSimTime);
      const cosTerm = Math.cos(omegaD * newSimTime);
      const sinTerm = Math.sin(omegaD * newSimTime);
      x = x0 * expTerm * (cosTerm + (gamma / omegaD) * sinTerm);
      v = -x0 * expTerm * ((omega0 * omega0 / omegaD) * sinTerm);
    } else {
      // Overdamped (sluggish decay)
      const beta = Math.sqrt(disc);
      const lambda1 = -gamma + beta;
      const lambda2 = -gamma - beta;
      const c1 = (x0 * lambda2) / (lambda2 - lambda1);
      const c2 = (-x0 * lambda1) / (lambda2 - lambda1);
      x = c1 * Math.exp(lambda1 * newSimTime) + c2 * Math.exp(lambda2 * newSimTime);
      v = c1 * lambda1 * Math.exp(lambda1 * newSimTime) + c2 * lambda2 * Math.exp(lambda2 * newSimTime);
    }

    const minX = Math.min(state.minReachedX, x);

    // Evaluation checks
    const targetB = stage.criticalDamping;
    const error = Math.abs(b - targetB);
    const isCritical = error <= stage.tolerance;

    // Check 1: Underdamped failure (overshoots past equilibrium x < -0.04m)
    if (x < -0.04) {
      set({
        simTime: newSimTime,
        currentX: x,
        currentV: v,
        minReachedX: minX,
        isSimulating: false,
        isWon: false,
        isGameOver: true,
        failureReason: `Underdamped! The damping constant (b = ${b.toFixed(2)} N·s/m) was too weak. The cart overshot past the equilibrium point (x = ${x.toFixed(2)} m) and oscillated.`,
        showResultModal: true,
      });
      return;
    }

    // Check 2: Settled at equilibrium
    // If x has decayed below 0.025m and velocity is very low
    if (newSimTime >= 0.8 && Math.abs(x) < 0.025 && Math.abs(v) < 0.05) {
      if (isCritical) {
        set({
          simTime: newSimTime,
          currentX: 0,
          currentV: 0,
          minReachedX: minX,
          isSimulating: false,
          isWon: true,
          isGameOver: false,
          showResultModal: true,
        });
        return;
      }
    }

    // Check 3: Overdamped timeout (took too long to return)
    if (newSimTime >= stage.settlingTimeLimit) {
      if (isCritical) {
        set({
          simTime: newSimTime,
          currentX: 0,
          currentV: 0,
          minReachedX: minX,
          isSimulating: false,
          isWon: true,
          isGameOver: false,
          showResultModal: true,
        });
      } else {
        set({
          simTime: newSimTime,
          currentX: x,
          currentV: v,
          minReachedX: minX,
          isSimulating: false,
          isWon: false,
          isGameOver: true,
          failureReason: `Overdamped! The damping constant (b = ${b.toFixed(2)} N·s/m) was too high. The viscous fluid drag caused sluggish motion, failing to settle within ${stage.settlingTimeLimit.toFixed(1)} seconds.`,
          showResultModal: true,
        });
      }
      return;
    }

    set({
      simTime: newSimTime,
      currentX: x,
      currentV: v,
      minReachedX: minX,
    });
  },
}));

