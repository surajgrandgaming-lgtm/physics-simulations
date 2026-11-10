import { create } from "zustand";

export interface HeatTransferStageConfig {
  stage: number;
  title: string;
  stageBadge: string;
  missionObjective: string;
  missionQuestion: string;
  furnaceTemp: number; // K (T_H)
  sinkTemp: number; // K (T_C)
  targetValue: number; // target parameter user must set
  tolerance: number;
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
  // Specific geometry & material config for the 3D apparatus
  geometryType: "single" | "series" | "parallel";
  rodLength: number; // Total length in meters (e.g. 0.50m)
  rodRadius: number; // Meters
  materials: {
    name: string;
    k: number; // W/(m*K)
    length: number; // m
    color: string;
  }[];
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

export const HEAT_TRANSFER_STAGES: Record<number, HeatTransferStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Steady Conduction & Thermal Conductivity",
    stageBadge: "STAGE 1 • FOURIER CONDUCTION",
    missionObjective: "Find Thermal Conductivity k to Deliver 160.0 W",
    missionQuestion:
      "A uniform cylindrical conductor of length L = 0.50 m and cross-sectional area A = 4.0 cm² (4.0 × 10⁻⁴ m²) bridges a hot furnace at 500 K and a cold sink at 300 K. What thermal conductivity (k in W/(m·K)) must the material have so that exactly 160.0 W of heat flows continuously to the cold sink?",
    furnaceTemp: 500.0,
    sinkTemp: 300.0,
    targetValue: 100, // k = 100 W/(m*K)
    tolerance: 3,
    unit: "W/(m·K)",
    sliderMin: 40,
    sliderMax: 200,
    sliderStep: 1,
    sliderDefault: 70,
    stepSmall: 1,
    stepLarge: 10,
    paramName: "Thermal Conductivity (k)",
    tip: "Fourier's Law: Heat flow rate H = (k · A · ΔT) / L is directly proportional to conductivity k.",
    explanationTrap: "Make sure cross-sectional area is converted properly: 4 cm² = 4 × 10⁻⁴ m², not 4 × 10⁻² m².",
    geometryType: "single",
    rodLength: 0.50,
    rodRadius: 0.0113,
    materials: [
      { name: "Alloy Conductor", k: 100, length: 0.50, color: "#94a3b8" },
    ],
    mathDerivation: {
      title: "Stage 1: Fourier Conduction Derivation",
      concept:
        "Heat flows naturally from hot to cold via microscopic molecular collisions and free electron movement. Under steady-state conditions with insulated lateral walls, the rate of heat flow (H) is constant along the entire rod and directly proportional to the temperature gradient (ΔT/L), the cross-sectional area (A), and the material's thermal conductivity (k).",
      conclusion:
        "To deliver exactly 160.0 W across ΔT = 200 K through a 0.50 m rod of area 4.0 cm², the material must have a thermal conductivity of k = 100.0 W/(m·K) (similar to a brass/iron composite alloy).",
      formulas: [
        {
          label: "1. Fourier's Law of Heat Conduction",
          formula: "H = \\frac{dQ}{dt} = \\frac{k \\cdot A \\cdot (T_H - T_C)}{L}",
          explanation: "The rate of heat energy transferred per second (Watts) through a uniform conductor.",
        },
        {
          label: "2. Thermal Resistance (Ohm's Analogy)",
          formula: "R_{th} = \\frac{L}{k \\cdot A}, \\quad H = \\frac{\\Delta T}{R_{th}}",
          explanation: "Just like electrical Ohm's Law (I = V/R), heat flow equals temperature difference divided by thermal resistance.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Given Parameters & Temperature Difference",
          math: "\\Delta T = T_H - T_C = 500.0\\text{ K} - 300.0\\text{ K} = 200.0\\text{ K}",
          calculation: "Length L = 0.50 m • Area A = 4.0 cm² = 4.0 × 10⁻⁴ m² • Target H = 160.0 W • ΔT = 200.0 K",
          explanation: "The furnace maintains the hot face at 500 K and the sink holds the cold face at 300 K, giving a steady 200 K driving difference.",
        },
        {
          step: 2,
          title: "Determine the Required Thermal Resistance (R_th)",
          math: "R_{th} = \\frac{\\Delta T}{H} = \\frac{200.0\\text{ K}}{160.0\\text{ W}} = 1.25\\text{ K/W}",
          calculation: "R_th = 200.0 / 160.0 = 1.25 K/W (Kelvin per Watt)",
          explanation: "To allow exactly 160 Joules of heat to flow every second under a 200 K temperature difference, the total thermal opposition must be 1.25 K/W.",
        },
        {
          step: 3,
          title: "Solve for Material Thermal Conductivity (k)",
          math: "k = \\frac{L}{R_{th} \\cdot A} = \\frac{0.50\\text{ m}}{1.25\\text{ K/W} \\times (4.00 \\times 10^{-4}\\text{ m}^2)} = 100.0\\text{ W/(m}\\cdot\\text{K)}",
          calculation: "k = 0.50 / (1.25 × 0.0004) = 0.50 / 0.0005 = 100.0 W/(m·K)",
          explanation: "Rearranging R_th = L / (k·A) isolates conductivity k. Tuning the alloy material to k = 100 W/(m·K) delivers the exact target heat flow of 160 W.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: Composite Rod & Junction Temperature",
    stageBadge: "STAGE 2 • SERIES JUNCTION",
    missionObjective: "Calculate Junction Temperature T_j Between Copper & Steel",
    missionQuestion:
      "A composite series conductor connects a furnace at 600 K to a cold sink at 300 K. Section 1 is Copper (R₁ = 2.50 K/W) and Section 2 is Steel (R₂ = 15.00 K/W). Since the same steady heat current flows through both rods in series (H₁ = H₂), what is the equilibrium junction temperature (T_j in Kelvin) at their contact interface?",
    furnaceTemp: 600.0,
    sinkTemp: 300.0,
    targetValue: 557, // T_j = 557 K (exact 557.14 K)
    tolerance: 4,
    unit: "K",
    sliderMin: 400,
    sliderMax: 600,
    sliderStep: 1,
    sliderDefault: 480,
    stepSmall: 1,
    stepLarge: 10,
    paramName: "Junction Temperature (T_j)",
    tip: "In series, heat current is continuous: H₁ = H₂. The larger resistance (Steel) drops the lion's share of the temperature difference.",
    explanationTrap: "Copper is 8× more conductive than steel! The junction remains much closer to the hot furnace temperature than the cold sink.",
    geometryType: "series",
    rodLength: 0.70,
    rodRadius: 0.0113,
    materials: [
      { name: "Copper (High k)", k: 400, length: 0.40, color: "#b45309" },
      { name: "Steel (Low k)", k: 50, length: 0.30, color: "#64748b" },
    ],
    mathDerivation: {
      title: "Stage 2: Series Junction Temperature Derivation",
      concept:
        "When two different conducting rods are joined in series, heat cannot build up indefinitely or disappear at the interface in steady state. Therefore, the heat current flowing through Section 1 (Copper) must exactly equal the heat current flowing through Section 2 (Steel): H₁ = H₂ = H. The material with the higher thermal resistance (Steel) absorbs the vast majority of the overall temperature drop.",
      conclusion:
        "Because Steel's resistance (15.00 K/W) is 6× larger than Copper's (2.50 K/W), Steel absorbs 6/7 of the total 300 K temperature drop (257.1 K) while Copper drops only 1/7 (42.9 K). This pins the interface junction temperature to T_j = 600 K - 42.9 K ≈ 557 K.",
      formulas: [
        {
          label: "1. Continuity of Heat Flow in Series",
          formula: "H = \\frac{T_H - T_j}{R_1} = \\frac{T_j - T_C}{R_2}",
          explanation: "In steady state, the rate of heat entering the junction from Copper equals the heat exiting into Steel.",
        },
        {
          label: "2. Thermal Resistance of a Conductor",
          formula: "R_{th} = \\frac{L}{k \\cdot A}",
          explanation: "Directly proportional to rod length L and inversely proportional to thermal conductivity k and area A.",
        },
        {
          label: "3. Direct Junction Formula",
          formula: "T_j = \\frac{R_2 \\cdot T_H + R_1 \\cdot T_C}{R_1 + R_2}",
          explanation: "The junction temperature is a resistance-weighted average between furnace (T_H) and sink (T_C).",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Compute Thermal Resistance of Copper (Section 1)",
          math: "R_1 = \\frac{L_1}{k_1 \\cdot A} = \\frac{0.40\\text{ m}}{400\\text{ W/(m}\\cdot\\text{K)} \\times (4.00 \\times 10^{-4}\\text{ m}^2)} = 2.50\\text{ K/W}",
          calculation: "R₁ = 0.40 / (400 × 0.0004) = 0.40 / 0.16 = 2.50 K/W",
          explanation: "Copper has high thermal conductivity (400 W/m·K), giving it very low thermal resistance (only 2.50 K/W).",
        },
        {
          step: 2,
          title: "Compute Thermal Resistance of Steel (Section 2)",
          math: "R_2 = \\frac{L_2}{k_2 \\cdot A} = \\frac{0.30\\text{ m}}{50\\text{ W/(m}\\cdot\\text{K)} \\times (4.00 \\times 10^{-4}\\text{ m}^2)} = 15.00\\text{ K/W}",
          calculation: "R₂ = 0.30 / (50 × 0.0004) = 0.30 / 0.02 = 15.00 K/W",
          explanation: "Steel has 8× lower conductivity than copper, creating a thermal bottleneck with 6× higher resistance (15.00 K/W vs 2.50 K/W).",
        },
        {
          step: 3,
          title: "Calculate Total Resistance & Series Heat Current (H)",
          math: "R_{total} = R_1 + R_2 = 2.50 + 15.00 = 17.50\\text{ K/W}, \\quad H = \\frac{T_H - T_C}{R_{total}} = \\frac{600.0 - 300.0}{17.50} = 17.143\\text{ W}",
          calculation: "ΔT_total = 300 K • R_total = 17.50 K/W • H = 300 / 17.50 = 17.143 W",
          explanation: "A continuous heat current of 17.143 Joules per second passes through both Copper and Steel.",
        },
        {
          step: 4,
          title: "Solve for Interface Junction Temperature (T_j)",
          math: "T_j = T_H - H \\cdot R_1 = 600.0\\text{ K} - (17.143\\text{ W} \\times 2.50\\text{ K/W}) = 600.0 - 42.86 = 557.14\\text{ K} \\approx 557\\text{ K}",
          calculation: "T_j = 600 - 42.86 = 557.14 K (Alternatively: T_j = T_C + H·R₂ = 300 + 17.143 × 15.00 = 557.14 K)",
          explanation: "The junction sits at 557 K, very close to the furnace temperature (600 K), because copper barely resists the flow of heat.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: Parallel Thermal Network & Equivalent Heat Flow",
    stageBadge: "STAGE 3 • PARALLEL NETWORK",
    missionObjective: "Calculate Total Parallel Heat Flow Rate H_total",
    missionQuestion:
      "A furnace at 450 K transfers heat across ΔT = 150 K to a sink at 300 K through dual parallel branches: Branch A (Aluminum, R_A = 5.0 K/W) and Branch B (Brass, R_B = 10.0 K/W). What is the total rate of steady heat transfer (H_total in Watts) flowing through both branches combined?",
    furnaceTemp: 450.0,
    sinkTemp: 300.0,
    targetValue: 45, // H_total = 45 W
    tolerance: 2,
    unit: "W",
    sliderMin: 20,
    sliderMax: 80,
    sliderStep: 1,
    sliderDefault: 32,
    stepSmall: 1,
    stepLarge: 5,
    paramName: "Total Heat Flow (H)",
    tip: "In parallel, total heat current is additive: H_total = H_A + H_B = ΔT/R_A + ΔT/R_B.",
    explanationTrap: "Equivalent resistance in parallel is R_eq = (R_A · R_B) / (R_A + R_B) = 3.33 K/W, which increases total heat conduction.",
    geometryType: "parallel",
    rodLength: 0.50,
    rodRadius: 0.009,
    materials: [
      { name: "Branch A: Aluminum", k: 200, length: 0.50, color: "#cbd5e1" },
      { name: "Branch B: Brass", k: 100, length: 0.50, color: "#eab308" },
    ],
    mathDerivation: {
      title: "Stage 3: Parallel Network Heat Flow Derivation",
      concept:
        "When thermal conductors are connected in parallel, both conductors share the exact same temperature difference across their ends (ΔT = T_H - T_C = 150.0 K). Because heat can travel through either path simultaneously without interfering with each other, the total heat flow is simply the direct sum of the heat currents flowing through Branch A and Branch B: H_total = H_A + H_B.",
      conclusion:
        "Branch A (Aluminum) conducts 30.0 W and Branch B (Brass) conducts 15.0 W. Together in parallel, they dissipate a total thermal power of H_total = 45.0 W (corresponding to an equivalent network resistance of R_eq = 3.33 K/W).",
      formulas: [
        {
          label: "1. Parallel Branch Heat Current Law",
          formula: "H_{total} = H_A + H_B = \\frac{\\Delta T}{R_A} + \\frac{\\Delta T}{R_B}",
          explanation: "In parallel, total heat current is additive. Lower resistance branches carry proportionately greater heat current.",
        },
        {
          label: "2. Equivalent Parallel Thermal Resistance",
          formula: "\\frac{1}{R_{eq}} = \\frac{1}{R_A} + \\frac{1}{R_B} \\implies R_{eq} = \\frac{R_A \\cdot R_B}{R_A + R_B}",
          explanation: "Parallel branches reduce total opposition to heat flow, allowing more total thermal energy to flow than either branch alone.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Driving Temperature Difference (ΔT)",
          math: "\\Delta T = T_H - T_C = 450.0\\text{ K} - 300.0\\text{ K} = 150.0\\text{ K}",
          calculation: "Hot Furnace = 450 K • Cold Sink = 300 K • Common Driving ΔT = 150 K",
          explanation: "Both Branch A and Branch B have their left ends connected to the furnace and their right ends connected to the sink.",
        },
        {
          step: 2,
          title: "Calculate Heat Current Through Branch A (Aluminum)",
          math: "H_A = \\frac{\\Delta T}{R_A} = \\frac{150.0\\text{ K}}{5.0\\text{ K/W}} = 30.0\\text{ W}",
          calculation: "H_A = 150.0 / 5.0 = 30.0 W (Joules per second)",
          explanation: "With a low resistance of 5.0 K/W, Aluminum conducts 30.0 Watts of heat current.",
        },
        {
          step: 3,
          title: "Calculate Heat Current Through Branch B (Brass)",
          math: "H_B = \\frac{\\Delta T}{R_B} = \\frac{150.0\\text{ K}}{10.0\\text{ K/W}} = 15.0\\text{ W}",
          calculation: "H_B = 150.0 / 10.0 = 15.0 W (Joules per second)",
          explanation: "With twice the resistance (10.0 K/W), Brass conducts exactly half as much heat: 15.0 Watts.",
        },
        {
          step: 4,
          title: "Sum the Branch Currents to Find Total Heat Current",
          math: "H_{total} = H_A + H_B = 30.0\\text{ W} + 15.0\\text{ W} = 45.0\\text{ W}",
          calculation: "H_total = 30.0 + 15.0 = 45.0 W • R_eq = (5 × 10)/(5 + 10) = 50/15 = 3.33 K/W • Check: 150 / 3.33 = 45.0 W",
          explanation: "The dual parallel network transports a combined total of 45.0 Watts into the cold sink.",
        },
      ],
    },
  },
};

interface HeatTransferState {
  currentStage: number;
  furnaceTemp: number; // K
  sinkTemp: number; // K
  junctionTemp: number; // K (for Stage 2 or center probe)
  heatCurrent: number; // W (live animated)
  sliderValue: number; // User selected parameter
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

export const useHeatTransferStore = create<HeatTransferState>((set, get) => {
  const initialStage = 1;
  const cfg = HEAT_TRANSFER_STAGES[initialStage];

  return {
    currentStage: initialStage,
    furnaceTemp: cfg.furnaceTemp,
    sinkTemp: cfg.sinkTemp,
    junctionTemp: cfg.furnaceTemp - (cfg.furnaceTemp - cfg.sinkTemp) / 2,
    heatCurrent: 0,
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
      const stage = HEAT_TRANSFER_STAGES[get().currentStage];
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
        heatCurrent: 0,
        isWon: false,
        isGameOver: false,
        failureReason: "",
        showResultModal: false,
      });
    },

    resetSimulation: () => {
      const cfg = HEAT_TRANSFER_STAGES[get().currentStage];
      set({
        furnaceTemp: cfg.furnaceTemp,
        sinkTemp: cfg.sinkTemp,
        junctionTemp: cfg.furnaceTemp - (cfg.furnaceTemp - cfg.sinkTemp) / 2,
        heatCurrent: 0,
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
      const cfg = HEAT_TRANSFER_STAGES[stageNum] || HEAT_TRANSFER_STAGES[1];
      set({
        currentStage: cfg.stage,
        furnaceTemp: cfg.furnaceTemp,
        sinkTemp: cfg.sinkTemp,
        junctionTemp: cfg.furnaceTemp - (cfg.furnaceTemp - cfg.sinkTemp) / 2,
        heatCurrent: 0,
        sliderValue: cfg.sliderDefault,
        isSimulating: false,
        isMissionStarted: false,
        missionStartedAt: null,
        simulationProgress: 0,
        isWon: false,
        isGameOver: false,
        failureReason: "",
        showResultModal: false,
      });
    },

    nextStage: () => {
      const next = get().currentStage + 1;
      if (HEAT_TRANSFER_STAGES[next]) {
        get().setStage(next);
      }
    },

    tickPhysics: (delta: number) => {
      const state = get();
      if (!state.isSimulating) return;

      const stage = HEAT_TRANSFER_STAGES[state.currentStage];
      const nextProgress = Math.min(1, state.simulationProgress + delta * 0.42);

      // Evaluate physical transient state based on stage
      let targetH = 0;
      let liveJunctionT = stage.sinkTemp;

      if (state.currentStage === 1) {
        // User sets k: H = (k * A * ΔT) / L
        const area = 4.0e-4;
        const deltaT = stage.furnaceTemp - stage.sinkTemp;
        targetH = (state.sliderValue * area * deltaT) / stage.rodLength;
        liveJunctionT = stage.furnaceTemp - (deltaT / 2) * nextProgress;
      } else if (state.currentStage === 2) {
        // User sets T_j: If correct, H = (600 - T_j) / 2.5
        liveJunctionT = stage.sinkTemp + (state.sliderValue - stage.sinkTemp) * nextProgress;
        targetH = Math.max(0, (stage.furnaceTemp - liveJunctionT) / 2.5);
      } else if (state.currentStage === 3) {
        // User sets H_total
        targetH = state.sliderValue;
        liveJunctionT = 375;
      }

      const liveH = targetH * nextProgress;

      if (nextProgress >= 1) {
        const error = Math.abs(state.sliderValue - stage.targetValue);
        const won = error <= stage.tolerance;
        let failureText = "";

        if (!won) {
          if (state.currentStage === 1) {
            failureText = state.sliderValue < stage.targetValue
              ? `Thermal conductivity k = ${state.sliderValue} W/(m·K) is too low. Conduction current reached only ${liveH.toFixed(1)} W, failing to meet the required 160 W heat dissipation target.`
              : `Thermal conductivity k = ${state.sliderValue} W/(m·K) is too high. Conduction current surged to ${liveH.toFixed(1)} W, overloading the thermal sink past the 160 W limit.`;
          } else if (state.currentStage === 2) {
            failureText = state.sliderValue < stage.targetValue
              ? `Junction temperature ${state.sliderValue} K is too low. In steady state, Copper's low resistance drops only 42.9 K from the furnace, keeping the interface at 557 K.`
              : `Junction temperature ${state.sliderValue} K is too high. The junction would cause a steep mismatch in steel's heat exit flux.`;
          } else {
            failureText = state.sliderValue < stage.targetValue
              ? `Total heat flow ${state.sliderValue} W is insufficient to balance both parallel conduction channels.`
              : `Total heat flow ${state.sliderValue} W exceeds the combined conductance of the dual Aluminum-Brass paths.`;
          }
        }

        set({
          simulationProgress: 1,
          isSimulating: false,
          heatCurrent: targetH,
          junctionTemp: state.currentStage === 2 ? state.sliderValue : liveJunctionT,
          isWon: won,
          isGameOver: !won,
          failureReason: failureText,
          showResultModal: true,
        });
      } else {
        set({
          simulationProgress: nextProgress,
          heatCurrent: liveH,
          junctionTemp: liveJunctionT,
        });
      }
    },
  };
});

