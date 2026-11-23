import { create } from "zustand";

export interface TransformersStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  parameterName: string;
  parameterUnit: string;
  vPrimary: number; // Volts (V_p)
  nPrimary: number; // Turns (N_p)
  vSecondaryTarget: number; // Volts (V_s target)
  targetTurns: number; // Turns (N_s target)
  loadResistance: number; // Ohms (R_L)
  sliderMin: number;
  sliderMax: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;
  tolerance: number; // Turns tolerance
  targetDisplay: string;
  targetDescription: string;
  mathDerivation: {
    title: string;
    concept: string;
    conclusion: string;
    formulas: Array<{
      label: string;
      formula: string;
      explanation: string;
    }>;
    steps: Array<{
      step: number;
      title: string;
      math?: string;
      explanation: string;
    }>;
  };
}

export const TRANSFORMERS_STAGES: Record<number, TransformersStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Step-Down Household Adapter (240V → 12.0V)",
    subtitle: "Tune secondary turns N_s = 30 to safely step down 240V mains to 12.0V and power the low-voltage lamp",
    parameterName: "Secondary Turns (N_s)",
    parameterUnit: "turns",
    vPrimary: 240.0,
    nPrimary: 600,
    vSecondaryTarget: 12.0,
    targetTurns: 30,
    loadResistance: 4.0,
    sliderMin: 5,
    sliderMax: 100,
    sliderDefault: 10,
    stepSmall: 1,
    stepLarge: 5,
    tolerance: 1,
    targetDisplay: "V_s = 12.0 V",
    targetDescription: "Tune secondary winding turns N_s to achieve output voltage V_s = 12.0 V.",
    mathDerivation: {
      title: "Step-Down Transformer: Mutual Induction & Voltage Stepping",
      concept:
        "A transformer transfers electrical energy between two isolated circuits through magnetic mutual induction inside a closed iron core.\n\n" +
        "1. How Mutual Induction Works (Faraday's Law)\n" +
        "When an alternating voltage V_p is applied to the primary coil, an alternating current flows through it. This creates a continuously changing magnetic flux Φ(t) trapped within the high-permeability soft-iron core. By Faraday's Law, the induced electromotive force (EMF) in each coil is proportional to its turn count:\n" +
        "• Primary coil: V_p = -N_p · (dΦ/dt)\n" +
        "• Secondary coil: V_s = -N_s · (dΦ/dt)\n\n" +
        "2. The Master Transformer Turns Ratio\n" +
        "Because both coils encircle the exact same iron core, the rate of flux change (dΦ/dt) is identical for every turn in both windings. Dividing the two equations yields:\n" +
        "V_s / V_p = N_s / N_p = k\n" +
      "• If N_s < N_p: The transformer is Step-Down (V_s < V_p).\n" +
        "• If N_s > N_p: The transformer is Step-Up (V_s > V_p).\n" +
        "For our household charger, we need to convert dangerous 240 V mains down to a safe 12.0 V:\n" +
        "k = 12.0 V / 240.0 V = 1/20 = 0.05\n" +
        "With N_p = 600 turns, the secondary must have: N_s = 600 × 0.05 = 30 turns!\n\n" +
        "3. Conservation of Energy & Current Magnification\n" +
        "An ideal transformer does not waste or create power: Input Power = Output Power (P_in = P_out).\n" +
        "V_p · I_p = V_s · I_s ⟹ I_s / I_p = V_p / V_s = N_p / N_s\n" +
        "As voltage steps down by a factor of 20×, current steps up by 20×! A low primary current (0.15 A) safely delivers a powerful 3.00 A to drive the 4.0 Ω low-voltage lamp.",
      conclusion:
      "Summary & Physics Takeaway:\n" +
        "• Core Relationship: Induced voltage is directly proportional to turn count (V ∝ N).\n" +
        "• Primary Parameters: V_p = 240 V, N_p = 600 turns (0.40 V per turn).\n" +
        "• Required Secondary: N_s = 30 turns produces exactly V_s = 12.0 V.\n" +
        "• Load Current: I_s = 12.0 V / 4.0 Ω = 3.00 A.\n" +
        "• Power Delivered: P_s = (12.0 V)(3.00 A) = 36.0 W.\n" +
        "• Primary Draw: I_p = 36.0 W / 240 V = 0.15 A.\n" +
        "Setting N_s = 30 turns achieves the exact 20:1 step-down ratio, illuminating the lamp at rated brightness.",
      formulas: [
        {
          label: "1. TRANSFORMER TURNS RATIO",
          formula: "\\dfrac{V_s}{V_p} = \\dfrac{N_s}{N_p}",
          explanation: "Voltage across each coil is strictly proportional to its number of winding turns.",
        },
        {
          label: "2. SECONDARY OHMIC CURRENT",
          formula: "I_s = \\dfrac{V_s}{R_L}",
          explanation: "Current flowing through the secondary load resistor and lamp bulb by Ohm's Law.",
        },
        {
          label: "3. CONSERVATION OF POWER",
          formula: "P_{\\text{in}} = P_{\\text{out}} \\implies V_p I_p = V_s I_s",
          explanation: "In an ideal transformer (zero core losses), electrical power supplied equals power delivered.",
        },
        {
          label: "4. INVERSE CURRENT RATIO",
          formula: "\\dfrac{I_s}{I_p} = \\dfrac{N_p}{N_s}",
          explanation: "Current is inversely proportional to turns count: stepping down voltage steps up current.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Input Specifications",
          math: "V_p = 240.0\\text{ V}, \\quad N_p = 600\\text{ turns}, \\quad V_{s,\\text{target}} = 12.0\\text{ V}, \\quad R_L = 4.0\\,\\Omega",
          explanation: "Mains power supply is 240 V with 600 primary turns, targeting a 12.0 V safe output for a 4.0 Ω lamp.",
        },
        {
          step: 2,
          title: "Calculate Voltage per Turn",
          math: "\\text{EMF per turn} = \\dfrac{V_p}{N_p} = \\dfrac{240.0\\text{ V}}{600\\text{ turns}} = 0.40\\text{ V/turn}",
          explanation: "Every single loop of wire around the core receives exactly 0.40 V of induced EMF from the magnetic flux.",
        },
        {
          step: 3,
          title: "Determine Required Secondary Turns (N_s)",
          math: "N_s = \\dfrac{V_{s,\\text{target}}}{\\text{EMF per turn}} = \\dfrac{12.0\\text{ V}}{0.40\\text{ V/turn}} = \\mathbf{30\\text{ turns}}",
          explanation: "To accumulate 12.0 V, exactly 30 turns of copper wire must be wound onto the secondary limb.",
        },
        {
          step: 4,
          title: "Compute Secondary Output Current & Lamp Power",
          math: "I_s = \\dfrac{V_s}{R_L} = \\dfrac{12.0\\text{ V}}{4.0\\,\\Omega} = \\mathbf{3.00\\text{ A}}, \\quad P_s = V_s I_s = (12.0)(3.00) = \\mathbf{36.0\\text{ W}}",
          explanation: "The low-voltage lamp draws 3.00 A of current and glows at its rated 36.0 Watts of optical brilliance.",
        },
        {
          step: 5,
          title: "Verify Primary Current Consumption",
          math: "I_p = \\dfrac{P_s}{V_p} = \\dfrac{36.0\\text{ W}}{240.0\\text{ V}} = \\mathbf{0.15\\text{ A}}",
          explanation: "By power conservation (V_p I_p = V_s I_s), the 240 V mains supply draws only 0.15 A.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: Step-Up Inverter Transformer (120V → 240V)",
    subtitle: "Tune secondary turns N_s = 500 to double the input voltage from 120V to 240V for high-power equipment",
    parameterName: "Secondary Turns (N_s)",
    parameterUnit: "turns",
    vPrimary: 120.0,
    nPrimary: 250,
    vSecondaryTarget: 240.0,
    targetTurns: 500,
    loadResistance: 48.0,
    sliderMin: 100,
    sliderMax: 800,
    sliderDefault: 200,
    stepSmall: 5,
    stepLarge: 25,
    tolerance: 5,
    targetDisplay: "V_s = 240.0 V",
    targetDescription: "Tune secondary winding turns N_s to achieve output voltage V_s = 240.0 V.",
    mathDerivation: {
      title: "Step-Up Transformer: Voltage Magnification & Inverter Operation",
      concept:
      "When secondary turns exceed primary turns (N_s > N_p), the transformer operates in Step-Up mode, magnifying voltage for industrial or inverter equipment.\n\n" +
        "1. Step-Up Voltage Multiplication (N_s > N_p)\n" +
        "With N_p = 250 turns and an input voltage V_p = 120.0 V, each individual turn in the laminated iron core links an induced EMF of:\n" +
        "EMF per turn = V_p / N_p = 120.0 V / 250 turns = 0.48 V/turn\n" +
        "To achieve the target output of V_s = 240.0 V, the transformation ratio must be exactly double:\n" +
        "k = V_s / V_p = 240.0 V / 120.0 V = 2.0\n" +
        "Therefore, the secondary winding requires: N_s = 250 × 2.0 = 500 turns.\n\n" +
        "2. The Conservation Trade-off: Current is Halved\n" +
        "By the First Law of Thermodynamics, energy cannot be created. Doubling the voltage does not mean doubling the power:\n" +
        "P_in = P_out ⟹ V_p · I_p = V_s · I_s\n" +
        "With a load resistance R_L = 48.0 Ω, the secondary current is I_s = 240 V / 48 Ω = 5.00 A. Delivering 1200 W to the load requires the primary 120 V supply to draw exactly 10.00 A (twice the secondary current).\n" +
        "• Rule of Thumb: Step-up transformers double voltage, but cut current in half!",
      conclusion:
      "Summary & Physics Takeaway:\n" +
        "• Mode: Step-Up Transformer (k = 2.0 > 1).\n" +
        "• Primary Input: V_p = 120.0 V, N_p = 250 turns (0.48 V per turn).\n" +
        "• Required Secondary: N_s = 500 turns (produces exactly V_s = 240.0 V).\n" +
        "• Load Current: I_s = 240.0 V / 48.0 Ω = 5.00 A.\n" +
        "• Power Delivered: P_s = (240 V)(5.00 A) = 1200.0 Watts.\n" +
        "• Primary Supply Draw: I_p = 1200 W / 120 V = 10.00 A.\n" +
        "Setting N_s = 500 turns provides the exact 1:2 voltage doubling, illuminating the 1200 W high-power inverter load at peak brilliance.",
      formulas: [
        {
          label: "1. STEP-UP RATIO",
          formula: "k = \\dfrac{V_s}{V_p} = \\dfrac{N_s}{N_p} = 2.0",
          explanation: "In a step-up transformer, the turns ratio k is strictly greater than 1, scaling up the output voltage.",
        },
        {
          label: "2. SECONDARY OHMIC CURRENT",
          formula: "I_s = \\dfrac{V_s}{R_L}",
          explanation: "Current flowing through the heavy secondary load resistor by Ohm's Law.",
        },
        {
          label: "3. DELIVERED ELECTRIC POWER",
          formula: "P_s = \\dfrac{V_s^2}{R_L} = V_s I_s",
          explanation: "Total electric power dissipated in the load circuit.",
        },
        {
          label: "4. CONSERVATION OF POWER",
          formula: "V_p I_p = V_s I_s \\implies I_p = I_s \\left(\\dfrac{N_s}{N_p}\\right)",
          explanation: "Primary supply must supply greater current to deliver equal power at half the voltage.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Input Parameters",
          math: "V_p = 120.0\\text{ V}, \\quad N_p = 250\\text{ turns}, \\quad V_{s,\\text{target}} = 240.0\\text{ V}, \\quad R_L = 48.0\\,\\Omega",
          explanation: "Inverter generator provides 120 V across 250 primary turns, targeting 240 V for a 48.0 Ω heavy load.",
        },
        {
          step: 2,
          title: "Compute Voltage per Turn",
          math: "\\text{EMF per turn} = \\dfrac{V_p}{N_p} = \\dfrac{120.0\\text{ V}}{250\\text{ turns}} = 0.48\\text{ V/turn}",
          explanation: "Each turn in the mutual flux core develops 0.48 V.",
        },
        {
          step: 3,
          title: "Calculate Required Secondary Turns (N_s)",
          math: "N_s = N_p \\times \\dfrac{V_{s,\\text{target}}}{V_p} = 250 \\times \\dfrac{240.0}{120.0} = 250 \\times 2 = \\mathbf{500\\text{ turns}}",
          explanation: "Doubling the voltage requires exactly double the turns (500 turns).",
        },
        {
          step: 4,
          title: "Compute Load Current and Power",
          math: "I_s = \\dfrac{240.0\\text{ V}}{48.0\\,\\Omega} = \\mathbf{5.00\\text{ A}}, \\quad P_s = (240.0)(5.00) = \\mathbf{1200.0\\text{ W}}",
          explanation: "The high-voltage load draws 5.00 A, dissipating 1200.0 Watts of electrical power.",
        },
        {
          step: 5,
          title: "Calculate Primary Source Current",
          math: "I_p = \\dfrac{P_s}{V_p} = \\dfrac{1200.0\\text{ W}}{120.0\\text{ V}} = \\mathbf{10.00\\text{ A}}",
          explanation: "At 120 V, the inverter input supplies 10.00 A to conserve total power.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: High-Voltage Transmission Step-Up (50V → 500V)",
    subtitle: "Tune secondary turns N_s = 1000 to achieve a 10× voltage boost for long-distance grid transmission",
    parameterName: "Secondary Turns (N_s)",
    parameterUnit: "turns",
    vPrimary: 50.0,
    nPrimary: 100,
    vSecondaryTarget: 500.0,
    targetTurns: 1000,
    loadResistance: 250.0,
    sliderMin: 300,
    sliderMax: 1500,
    sliderDefault: 400,
    stepSmall: 10,
    stepLarge: 50,
    tolerance: 10,
    targetDisplay: "V_s = 500.0 V",
    targetDescription: "Tune secondary winding turns N_s to achieve output voltage V_s = 500.0 V.",
    mathDerivation: {
      title: "High-Voltage Grid Transmission: Slashing Joule Cable Losses by 100×",
      concept:
      "Long-distance power transmission lines carry electricity across hundreds of kilometers. The primary challenge in electrical engineering is thermal energy loss (Joule heating) in copper and aluminum cables.\n\n" +
        "1. The Physics of Transmission Line Losses (P_loss = I²·R_cable)\n" +
        "Power lost as heat along a transmission wire is given by Joule's Law: P_loss = I² · R_cable.\n" +
        "Notice that power loss depends on the square of the current (I²)! If current is halved, cable losses drop by 4×. If current is reduced by 10×, cable losses drop by an astonishing 100×!\n\n" +
        "2. The 10× Step-Up Transformation (k = 10.0)\n" +
        "To transmit 1000.0 Watts of generator power over long distances:\n" +
        "• At low voltage (50.0 V): Current is I_p = P / V = 1000 W / 50 V = 20.0 A. High current would severely overheat the cables and drop most voltage as waste heat.\n" +
        "• At high voltage (500.0 V): Current drops to I_s = P / V = 1000 W / 500 V = 2.0 A (reduced by 10×!).\n" +
        "By the transformer turns ratio:\n" +
        "N_s = N_p × (V_s / V_p) = 100 × (500.0 / 50.0) = 100 × 10 = 1000 turns!\n\n" +
        "3. Real-World Engineering Significance\n" +
        "This fundamental law is why Nikola Tesla and George Westinghouse's AC grid triumphed over Thomas Edison's DC system: transformers allow easy, reliable stepping up to hundreds of kilovolts (up to 400 kV) at power plants, and stepping down safely to 240 V at our homes.",
      conclusion:
      "Summary & Physics Takeaway:\n" +
        "• Core Law: Transmission power loss scales as the square of current (P_loss ∝ I²).\n" +
        "• Stepping up voltage by 10× (50 V ⟶ 500 V) reduces current by 10× (20.0 A ⟶ 2.00 A).\n" +
        "• Cable heating loss is slashed by (1/10)² = 1/100 (99% reduction in wasted energy!).\n" +
        "• Primary Input: V_p = 50.0 V, N_p = 100 turns (0.50 V per turn).\n" +
        "• Required Secondary: N_s = 1000 turns achieves exactly V_s = 500.0 V.\n" +
        "• Grid Load Current: I_s = 500.0 V / 250.0 Ω = 2.00 A.\n" +
        "• Delivered Power: P_s = (500 V)(2.00 A) = 1000.0 W.\n" +
        "• Primary Generator Draw: I_p = 1000 W / 50 V = 20.00 A.\n" +
        "Setting N_s = 1000 turns demonstrates the foundational principle of all national electrical power grids.",
      formulas: [
        {
          label: "1. HIGH-VOLTAGE TURNS RATIO",
          formula: "\\dfrac{V_s}{V_p} = \\dfrac{N_s}{N_p} = 10.0",
          explanation: "Tenfold voltage amplification achieved across the laminated mutual core.",
        },
        {
          label: "2. TRANSMISSION CURRENT REDUCTION",
          formula: "I_s = I_p \\left(\\dfrac{N_p}{N_s}\\right) = \\dfrac{I_p}{10} = 2.00\\text{ A}",
          explanation: "Stepping voltage up by 10× divides transmission current by 10×.",
        },
        {
          label: "3. JOULE CABLE HEATING LOSS",
          formula: "P_{\\text{loss}} = I^2 R_{\\text{cable}} \\propto \\dfrac{1}{V^2}",
          explanation: "Power lost as heat in transmission lines decreases with the square of voltage.",
        },
        {
          label: "4. CONSERVATION OF TRANSMITTED POWER",
          formula: "P = V_p I_p = V_s I_s = 1000.0\\text{ W}",
          explanation: "Input generator power equals transmitted grid power under ideal conditions.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Grid Input Specifications",
          math: "V_p = 50.0\\text{ V}, \\quad N_p = 100\\text{ turns}, \\quad V_{s,\\text{target}} = 500.0\\text{ V}, \\quad R_L = 250.0\\,\\Omega",
          explanation: "Grid transmission simulation targeting 500 V across a 250 Ω transmission load.",
        },
        {
          step: 2,
          title: "Calculate Transformation Ratio",
          math: "k = \\dfrac{V_{s,\\text{target}}}{V_p} = \\dfrac{500.0\\text{ V}}{50.0\\text{ V}} = \\mathbf{10.0}",
          explanation: "A 10:1 step-up ratio is required to magnify voltage tenfold.",
        },
        {
          step: 3,
          title: "Determine Required Secondary Turns (N_s)",
          math: "N_s = N_p \\times k = 100\\text{ turns} \\times 10.0 = \\mathbf{1000\\text{ turns}}",
          explanation: "1000 turns wound onto the secondary limb generate exactly 500.0 V.",
        },
        {
          step: 4,
          title: "Compute Slashed Transmission Current",
          math: "I_s = \\dfrac{V_s}{R_L} = \\dfrac{500.0\\text{ V}}{250.0\\,\\Omega} = \\mathbf{2.00\\text{ A}}",
          explanation: "Current through the long-distance line is reduced to only 2.00 A.",
        },
        {
          step: 5,
          title: "Calculate Primary Current & Verify 100× Loss Reduction",
          math: "I_p = \\dfrac{P_s}{V_p} = \\dfrac{1000.0\\text{ W}}{50.0\\text{ V}} = \\mathbf{20.00\\text{ A}}, \\quad \\dfrac{P_{\\text{loss, high}}}{P_{\\text{loss, low}}} = \\left(\\dfrac{2.00}{20.00}\\right)^2 = \\mathbf{\\dfrac{1}{100}}",
          explanation: "Primary supplies 20.00 A; stepping up to 500 V slashes line heating loss by 99%.",
        },
      ],
    },
  },
};

interface TransformersState {
  currentStage: number;
  sliderValue: number; // Secondary turns N_s
  isVerifying: boolean;
  isWon: boolean;
  isGameOver: boolean;
  failureReason: string | null;
  showResultModal: boolean;
  cameraTrigger: number;
  isMissionStarted: boolean;
  missionStartedAt: number | null;

  // Actions
  setSliderValue: (val: number) => void;
  startMission: () => void;
  launchSimulation: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  setStage: (stageNum: number) => void;
  closeResultModal: () => void;

  // Computed physics helpers
  getStageConfig: () => TransformersStageConfig;
  getPhysicsState: () => {
    Ns: number;
    Np: number;
    Vp: number;
    k: number;
    Vs: number;
    Is: number;
    Ip: number;
    power: number;
    bulbBrightness: number;
    isBalanced: boolean;
    vPrimary: number;
    vSecondary: number;
    vSecondaryTarget: number;
    nPrimary: number;
    nSecondary: number;
    targetTurns: number;
    loadResistance: number;
    iSecondary: number;
    iPrimary: number;
    pSecondary: number;
    fluxIntensity: number;
    isCorrect: boolean;
  };
}

export const useTransformersStore = create<TransformersState>((set, get) => ({
  currentStage: 1,
  sliderValue: TRANSFORMERS_STAGES[1].sliderDefault,
  isVerifying: false,
  isWon: false,
  isGameOver: false,
  failureReason: null,
  showResultModal: false,
  cameraTrigger: 0,
  isMissionStarted: false,
  missionStartedAt: null,

  setSliderValue: (val: number) => {
    const config = get().getStageConfig();
    const clamped = Math.max(config.sliderMin, Math.min(config.sliderMax, Math.round(val)));
    set({ sliderValue: clamped });
  },

  getStageConfig: () => {
    const stageNum = get().currentStage;
    return TRANSFORMERS_STAGES[stageNum] || TRANSFORMERS_STAGES[1];
  },

  getPhysicsState: () => {
    const config = get().getStageConfig();
    const Ns = get().sliderValue;
    const Np = config.nPrimary;
    const Vp = config.vPrimary;
    const k = Ns / Np;
    const Vs = Vp * k;
    const Is = Vs / config.loadResistance;
    const power = Vs * Is;
    const Ip = power / Vp;

    // Ideal rated power at target
    const targetPower = Math.pow(config.vSecondaryTarget, 2) / config.loadResistance;
    const bulbBrightness = Math.min(1.0, Math.max(0.05, power / targetPower));
    const isBalanced = Math.abs(Ns - config.targetTurns) <= config.tolerance;

    return {
      Ns,
      Np,
      Vp,
      k,
      Vs,
      Is,
      Ip,
      power,
      bulbBrightness,
      isBalanced,
      vPrimary: Vp,
      vSecondary: Vs,
      vSecondaryTarget: config.vSecondaryTarget,
      nPrimary: Np,
      nSecondary: Ns,
      targetTurns: config.targetTurns,
      loadResistance: config.loadResistance,
      iSecondary: Is,
      iPrimary: Ip,
      pSecondary: power,
      fluxIntensity: Math.min(1.0, Vs / (config.vSecondaryTarget || 1)),
      isCorrect: isBalanced,
    };
  },

  startMission: () => {
    set({
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      cameraTrigger: Date.now(),
      isVerifying: false,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
    });
  },

  launchSimulation: () => {
    if (get().isVerifying) return;
    set({ isVerifying: true, failureReason: null });

    const config = get().getStageConfig();
    const currentNs = get().sliderValue;
    const diff = Math.abs(currentNs - config.targetTurns);
    const won = diff <= config.tolerance;

    setTimeout(() => {
      if (won) {
        set({
          isVerifying: false,
          isWon: true,
          isGameOver: false,
          failureReason: null,
          showResultModal: true,
        });
      } else {
        const direction = currentNs < config.targetTurns ? "too low (under-voltage)" : "too high (over-voltage risk)";
        const currentVs = (config.vPrimary * (currentNs / config.nPrimary)).toFixed(1);
        set({
          isVerifying: false,
          isWon: false,
          isGameOver: true,
          failureReason: `Secondary output is ${currentVs} V (${direction}). Target is ${config.vSecondaryTarget.toFixed(1)} V.`,
          showResultModal: true,
        });
      }
    }, 1200);
  },

  resetSimulation: () => {
    const config = get().getStageConfig();
    set({
      sliderValue: config.sliderDefault,
      isVerifying: false,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      cameraTrigger: Date.now(),
      isMissionStarted: true,
      missionStartedAt: performance.now(),
    });
  },

  nextStage: () => {
    const next = get().currentStage + 1;
    if (next <= 3) {
      const nextConfig = TRANSFORMERS_STAGES[next];
      set({
        currentStage: next,
        sliderValue: nextConfig.sliderDefault,
        isVerifying: false,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
        cameraTrigger: Date.now(),
        isMissionStarted: true,
        missionStartedAt: performance.now(),
      });
    }
  },

  setStage: (stageNum: number) => {
    if (stageNum >= 1 && stageNum <= 3) {
      const config = TRANSFORMERS_STAGES[stageNum];
      set({
        currentStage: stageNum,
        sliderValue: config.sliderDefault,
        isVerifying: false,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
        cameraTrigger: Date.now(),
        isMissionStarted: true,
        missionStartedAt: performance.now(),
      });
    }
  },

  closeResultModal: () => {
    set({ showResultModal: false });
  },
}));
