import { create } from "zustand";

export interface FirstLawStageConfig {
  stage: number;
  title: string;
  stageBadge: string;
  missionObjective: string;
  missionQuestion: string;
  moles: number; // mol
  temperature: number; // K
  initialVolume: number; // Liters
  targetVolume: number; // Liters
  initialPressure: number; // kPa
  targetPressure: number; // kPa
  targetValue: number; // Joules (Heat Q)
  tolerance: number; // Joules
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

export const FIRST_LAW_STAGES: Record<number, FirstLawStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Isothermal Heat-Work Balance (2× Expansion)",
    stageBadge: "STAGE 1 • ISOTHERMAL WORK",
    missionObjective: "Supply Exact Heat Energy for Isothermal 2x Expansion",
    missionQuestion:
      "A pneumatic cylinder containing n = 1.00 mol of ideal gas is held at constant temperature T = 300.0 K inside a thermal bath. The gas starts at V₁ = 10.0 L and must expand to docking height V₂ = 20.0 L. Applying the First Law of Thermodynamics (ΔQ = ΔU + W with ΔU = 0), calculate the exact heat energy (Q in Joules) that the heater must deliver so the piston reaches exactly 20.0 L.",
    moles: 1.0,
    temperature: 300.0,
    initialVolume: 10.0,
    targetVolume: 20.0,
    initialPressure: 249.4,
    targetPressure: 124.7,
    targetValue: 1729,
    tolerance: 35,
    unit: "J",
    sliderMin: 1000,
    sliderMax: 2500,
    sliderStep: 1,
    sliderDefault: 1250,
    stepSmall: 1,
    stepLarge: 50,
    paramName: "Supplied Heat Energy (Q)",
    tip: "In an isothermal process (T = const), internal energy cannot change (ΔU = 0). Every single Joule of heat added becomes mechanical work: Q = W.",
    explanationTrap: "Work is not simply P·ΔV because pressure drops continuously as volume expands: W = nRT·ln(V₂/V₁).",
    mathDerivation: {
      title: "Stage 1: Isothermal Work & Heat Balance Derivation",
      concept:
        "The First Law of Thermodynamics establishes the conservation of energy: ΔQ = ΔU + W. For an ideal gas, internal energy depends solely on temperature: U = n·Cv·T. Because this process is strictly isothermal (T = constant), ΔU = 0, meaning all heat absorbed from the thermal reservoir is transformed entirely into boundary work performed by the expanding piston against external resistance: Q = W.",
      conclusion:
        "Expanding 1.00 mol of gas at 300.0 K from 10.0 L to 20.0 L requires W = 1.00 × 8.314 × 300.0 × ln(2.00) = 1,729 J of mechanical work. To sustain constant temperature without stalling, the heater must supply exactly Q = 1,729 J.",
      formulas: [
        {
          label: "1. First Law of Thermodynamics",
          formula: "Q = \\Delta U + W",
          explanation: "Total heat supplied equals internal energy change plus mechanical work done by the gas.",
        },
        {
          label: "2. Isothermal Condition",
          formula: "\\Delta T = 0 \\implies \\Delta U = n C_v \\Delta T = 0 \\implies Q = W",
          explanation: "Internal energy remains constant throughout any isothermal process.",
        },
        {
          label: "3. Quasi-Static Isothermal Work",
          formula: "W = \\int_{V_1}^{V_2} P \\, dV = n R T \\int_{V_1}^{V_2} \\frac{dV}{V} = n R T \\ln\\left(\\frac{V_2}{V_1}\\right)",
          explanation: "The logarithmic integral represents the exact area under the hyperbolic P-V curve.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify thermodynamic coordinates",
          math: "n = 1.00\\text{ mol}, \\quad T = 300.0\\text{ K}, \\quad V_1 = 10.0\\text{ L}, \\quad V_2 = 20.0\\text{ L}",
          calculation: "V₂ / V₁ = 20.0 / 10.0 = 2.00 (two-fold expansion ratio)",
          explanation: "Identifies gas quantity, thermal reservoir temperature, and expansion bounds.",
        },
        {
          step: 2,
          title: "Compute isothermal boundary work (W)",
          math: "W = n R T \\ln(2.00) = (1.00) \\times (8.314\\text{ J/(mol}\\cdot\\text{K)}) \\times (300.0\\text{ K}) \\times \\ln(2.00)",
          calculation: "2,494.2 × 0.693147 = 1,728.85 J ≈ 1,729 J",
          explanation: "Evaluates the work integral under the hyperbolic curve.",
        },
        {
          step: 3,
          title: "Apply 1st Law to find required heat input (Q)",
          math: "Q = \\Delta U + W = 0 + 1,729\\text{ J} = 1,729\\text{ J}",
          calculation: "Q = 1,729 J",
          explanation: "Supplying 1,729 Joules lifts the piston smoothly to exactly 20.0 L.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: Industrial Actuator Stroke (3× Expansion)",
    stageBadge: "STAGE 2 • ACTUATOR WORK",
    missionObjective: "Calibrate Heat Supply for 3x Actuator Stroke",
    missionQuestion:
      "A high-pressure pneumatic actuator contains n = 1.50 mol of gas in a heated bath at T = 350.0 K. The gas begins at V₁ = 8.0 L and expands through a 3× stroke to target height V₂ = 24.0 L. Determine the required heat energy (Q in Joules) needed to execute this power stroke while holding temperature constant.",
    moles: 1.5,
    temperature: 350.0,
    initialVolume: 8.0,
    targetVolume: 24.0,
    initialPressure: 545.6,
    targetPressure: 181.9,
    targetValue: 4795,
    tolerance: 60,
    unit: "J",
    sliderMin: 3000,
    sliderMax: 6500,
    sliderStep: 1,
    sliderDefault: 3800,
    stepSmall: 1,
    stepLarge: 100,
    paramName: "Supplied Heat Energy (Q)",
    tip: "A larger expansion ratio yields proportionally greater work: ln(3) ≈ 1.0986 delivers nearly 60% more work than ln(2).",
    explanationTrap: "Be sure to multiply by the number of moles (n = 1.5 mol); more gas particles perform more aggregate work.",
    mathDerivation: {
      title: "Stage 2: 3× Expansion Stroke Work Derivation",
      concept:
        "Industrial pneumatic actuators convert thermal energy directly into mechanical power. With n = 1.50 mol of gas maintained at 350.0 K, the expanding gas molecules push against the piston rod. Because heat transfer keeps the system isothermal, the area under the P-V curve scales directly with n·R·T·ln(V₂/V₁).",
      conclusion:
        "The 3× expansion requires W = 1.50 × 8.314 × 350.0 × ln(3.00) = 4,795 J of boundary work. Per the First Law, the heater must supply exactly Q = 4,795 J.",
      formulas: [
        {
          label: "1. Isothermal Heat-Work Equivalence",
          formula: "Q = W = n R T \\ln\\left(\\frac{V_2}{V_1}\\right)",
          explanation: "Direct equivalence between thermal energy input and mechanical boundary work.",
        },
        {
          label: "2. Expansion Ratio Scaling",
          formula: "r_v = \\frac{V_2}{V_1} = \\frac{24.0}{8.0} = 3.00",
          explanation: "Tripling the volume defines the logarithmic boundary bounds.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify thermodynamic constants",
          math: "n = 1.50\\text{ mol}, \\quad T = 350.0\\text{ K}, \\quad r_v = 3.00",
          calculation: "n·R·T = 1.50 × 8.314 × 350.0 = 4,364.85 J",
          explanation: "Energy scale per unit natural logarithm.",
        },
        {
          step: 2,
          title: "Calculate total mechanical work (W)",
          math: "W = 4,364.85 \\times \\ln(3.00) = 4,364.85 \\times 1.098612 = 4,795.2\\text{ J}",
          calculation: "4,364.85 × 1.098612 ≈ 4,795 J",
          explanation: "Mechanical boundary work performed by 1.50 moles of gas.",
        },
        {
          step: 3,
          title: "Equate to required heat supply (Q)",
          math: "Q = W = 4,795\\text{ J}",
          calculation: "Q = 4,795 J",
          explanation: "Delivering 4,795 J expands the actuator precisely to 24.0 L.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: High-Temperature Power Stroke (5× Expansion)",
    stageBadge: "STAGE 3 • HIGH-RATIO EXPANSION",
    missionObjective: "Balance Heat Input with High-Ratio Piston Work",
    missionQuestion:
      "A heavy thermal actuator operating at T = 450.0 K contains n = 2.00 mol of gas. The chamber expands from high-pressure initial volume V₁ = 5.0 L (P₁ = 1,496.5 kPa) to final clearance stop V₂ = 25.0 L (a 5× expansion ratio). Calculate the total thermal energy (Q in Joules) that must be absorbed by the gas to complete the full 25.0 L power stroke.",
    moles: 2.0,
    temperature: 450.0,
    initialVolume: 5.0,
    targetVolume: 25.0,
    initialPressure: 1496.5,
    targetPressure: 299.3,
    targetValue: 12043,
    tolerance: 120,
    unit: "J",
    sliderMin: 8000,
    sliderMax: 16000,
    sliderStep: 1,
    sliderDefault: 10200,
    stepSmall: 1,
    stepLarge: 100,
    paramName: "Supplied Heat Energy (Q)",
    tip: "A five-fold expansion ratio with 2.0 moles at 450 K generates over 12 kJ of mechanical work!",
    explanationTrap: "Make sure not to round ln(5) ≈ 1.6094 prematurely; with large n and T, slight rounding shifts the result by dozens of Joules.",
    mathDerivation: {
      title: "Stage 3: 5× High-Temperature Expansion Derivation",
      concept:
        "High-temperature isothermal expansion represents the power stroke of idealized thermodynamic engines. At 450.0 K, thermal agitation is intense. As the gas expands from 5.0 L to 25.0 L, pressure drops from nearly 15 atmospheres (1.50 MPa) to 3 atmospheres. Integrating this extensive hyperbolic path yields substantial mechanical work.",
      conclusion:
        "With n = 2.00 mol, T = 450.0 K, and a 5.0× ratio, the total work output is W = 2.00 × 8.314 × 450.0 × ln(5.00) = 12,043 J (12.04 kJ). Energy conservation requires Q = 12,043 J.",
      formulas: [
        {
          label: "1. First Law Work Integration",
          formula: "W = n R T \\ln\\left(\\frac{V_2}{V_1}\\right)",
          explanation: "Calculates total boundary displacement energy across large compression/expansion ratios.",
        },
        {
          label: "2. Isothermal Energy Conservation",
          formula: "Q = W \\quad (\\text{since } \\Delta U = n C_v \\Delta T = 0)",
          explanation: "Heat absorbed directly matches work delivered to the flywheel.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify thermodynamic parameters",
          math: "n = 2.00\\text{ mol}, \\quad T = 450.0\\text{ K}, \\quad V_1 = 5.0\\text{ L}, \\quad V_2 = 25.0\\text{ L}",
          calculation: "n·R·T = 2.00 × 8.314 × 450.0 = 7,482.6 J",
          explanation: "Thermal energy product for 2.00 moles at 450 K.",
        },
        {
          step: 2,
          title: "Calculate expansion work (ln 5.00 ≈ 1.609438)",
          math: "W = 7,482.6 \\times 1.609438 = 12,042.78\\text{ J} \\approx 12,043\\text{ J}",
          calculation: "7,482.6 × 1.609438 = 12,043 J",
          explanation: "Boundary work done over the complete 5× stroke.",
        },
        {
          step: 3,
          title: "Determine required heat energy (Q)",
          math: "Q = W = 12,043\\text{ J}",
          calculation: "Q = 12,043 J",
          explanation: "Inputting 12,043 J drives the piston smoothly to the 25.0 L stop.",
        },
      ],
    },
  },
};

interface FirstLawState {
  currentStage: number;
  temperature: number; // K
  volume: number; // L
  pressure: number; // kPa
  workDone: number; // J
  heatSupplied: number; // J
  sliderValue: number; // User selected Q in Joules
  isSimulating: boolean;
  isMissionStarted: boolean;
  missionStartedAt: number | null;
  simulationProgress: number; // 0 to 1
  isWon: boolean;
  isGameOver: boolean;
  failureReason: string;
  showResultModal: boolean;

  // Actions
  setSliderValue: (val: number) => void;
  startMission: () => void;
  startSimulation: () => void;
  resetSimulation: () => void;
  setStage: (stage: number) => void;
  nextStage: () => void;
  tickPhysics: (delta: number) => void;
}

export const useFirstLawStore = create<FirstLawState>((set, get) => {
  const initialStage = 1;
  const cfg = FIRST_LAW_STAGES[initialStage];

  return {
    currentStage: initialStage,
    temperature: cfg.temperature,
    volume: cfg.initialVolume,
    pressure: cfg.initialPressure,
    workDone: 0,
    heatSupplied: 0,
    sliderValue: cfg.sliderDefault,
    isSimulating: false,
    isMissionStarted: false,
    missionStartedAt: null,
    simulationProgress: 0,
    isWon: false,
    isGameOver: false,
    failureReason: "",
    showResultModal: false,

    setSliderValue: (val: number) => {
      const { isSimulating } = get();
      if (isSimulating) return;
      const stage = FIRST_LAW_STAGES[get().currentStage];
      const clamped = Math.max(stage.sliderMin, Math.min(stage.sliderMax, val));
      set({ sliderValue: clamped });
    },

    startMission: () => {
      set({ isMissionStarted: true, missionStartedAt: performance.now() });
    },

    startSimulation: () => {
      const { isSimulating } = get();
      if (isSimulating) return;
      set({
        isSimulating: true,
        simulationProgress: 0,
        workDone: 0,
        heatSupplied: 0,
        isWon: false,
        isGameOver: false,
        failureReason: "",
        showResultModal: false,
      });
    },

    resetSimulation: () => {
      const cfg = FIRST_LAW_STAGES[get().currentStage];
      set({
        temperature: cfg.temperature,
        volume: cfg.initialVolume,
        pressure: cfg.initialPressure,
        workDone: 0,
        heatSupplied: 0,
        sliderValue: cfg.sliderDefault,
        isSimulating: false,
        simulationProgress: 0,
        isWon: false,
        isGameOver: false,
        failureReason: "",
        showResultModal: false,
      });
    },

    setStage: (stageNum: number) => {
      const cfg = FIRST_LAW_STAGES[stageNum] || FIRST_LAW_STAGES[1];
      set({
        currentStage: cfg.stage,
        temperature: cfg.temperature,
        volume: cfg.initialVolume,
        pressure: cfg.initialPressure,
        workDone: 0,
        heatSupplied: 0,
        sliderValue: cfg.sliderDefault,
        isSimulating: false,
        isMissionStarted: cfg.stage > 1, // Immediately start mission for Stage 2 & 3 without pre-mission overlay
        missionStartedAt: cfg.stage > 1 ? performance.now() : null,
        simulationProgress: 0,
        isWon: false,
        isGameOver: false,
        failureReason: "",
        showResultModal: false,
      });
    },

    nextStage: () => {
      const next = get().currentStage + 1;
      if (FIRST_LAW_STAGES[next]) {
        get().setStage(next);
      }
    },

    tickPhysics: (delta: number) => {
      const state = get();
      if (!state.isSimulating) return;

      const stage = FIRST_LAW_STAGES[state.currentStage];
      const nextProgress = Math.min(1, state.simulationProgress + delta * 0.45);

      // Final volume achievable with user-supplied heat Q:
      // In isothermal expansion, Q = W = nRT * ln(V_final / V_i)
      // => V_final = V_i * exp(Q / (nRT))
      const nRT = stage.moles * 8.314 * stage.temperature;
      const achievableFinalVolume = stage.initialVolume * Math.exp(state.sliderValue / nRT);

      // Smooth interpolation of volume and work during animation
      const currentV = stage.initialVolume + (achievableFinalVolume - stage.initialVolume) * nextProgress;
      const currentP = (stage.moles * 8.314 * stage.temperature) / (currentV / 1000) / 1000; // in kPa
      const currentW = nRT * Math.log(currentV / stage.initialVolume);
      const currentQ = state.sliderValue * nextProgress;

      if (nextProgress >= 1) {
        // Evaluate completion against target heat Q
        const error = Math.abs(state.sliderValue - stage.targetValue);
        const won = error <= stage.tolerance;
        let failureText = "";

        if (!won) {
          if (state.sliderValue < stage.targetValue) {
            failureText = `Insufficient heat energy (${state.sliderValue} J). The gas produced only ${currentW.toFixed(0)} J of work, stalling at ${currentV.toFixed(1)} L short of the ${stage.targetVolume.toFixed(1)} L docking stop.`;
          } else {
            failureText = `Excess heat energy (${state.sliderValue} J). The gas produced ${currentW.toFixed(0)} J of work, overshooting the ${stage.targetVolume.toFixed(1)} L target stop and slamming into the limiter bracket.`;
          }
        }

        set({
          simulationProgress: 1,
          isSimulating: false,
          volume: currentV,
          pressure: currentP,
          workDone: currentW,
          heatSupplied: state.sliderValue,
          isWon: won,
          isGameOver: !won,
          failureReason: failureText,
          showResultModal: true,
        });
      } else {
        set({
          simulationProgress: nextProgress,
          volume: currentV,
          pressure: currentP,
          workDone: currentW,
          heatSupplied: currentQ,
        });
      }
    },
  };
});

