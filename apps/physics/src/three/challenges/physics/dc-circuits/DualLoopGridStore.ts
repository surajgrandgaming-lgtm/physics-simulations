import { create } from "zustand";

export interface DualLoopGridStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  parameterName: string;
  parameterUnit: string;

  // Circuit parameters
  e1: number; // Left generator EMF in V
  r1: number; // Left branch resistor in Ω
  r2: number; // Right branch resistor in Ω
  rCenter: number; // Center branch resistor in Ω
  fixedE2?: number; // For stage 3

  // Slider bounds
  sliderMin: number;
  sliderMax: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;

  targetValue: number;
  tolerance: number;
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

export const DUAL_LOOP_STAGES: Record<number, DualLoopGridStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: KCL Feeder Current Division",
    subtitle: "Tune branch resistor R₂ so incoming 10.0 A surge splits into an exact 3:1 ratio (I₁ = 7.5 A, I₂ = 2.5 A)",
    parameterName: "Branch Resistor (R₂)",
    parameterUnit: "Ω",
    e1: 30.0,
    r1: 4.0,
    r2: 12.0, // target
    rCenter: 0.0,
    sliderMin: 2.0,
    sliderMax: 24.0,
    sliderDefault: 4.0,
    stepSmall: 0.5,
    stepLarge: 2.0,
    // I_total = 10 A, I1 = 10 * R2 / (R1 + R2) => 7.5 = 10 * R2 / (4 + R2) => 30 + 7.5 R2 = 10 R2 => 2.5 R2 = 30 => R2 = 12.0 Ω
    targetValue: 12.0,
    tolerance: 0.4,
    targetDescription: "Tune branch resistor R₂ so the 10.0 A feeder surge divides into I₁ = 7.5 A and I₂ = 2.5 A",
    mathDerivation: {
      title: "Stage 1: Kirchhoff's Current Law & The Current Divider Principle",
      concept:
        "Why does current split the way it does when it encounters a fork in the road?\n\n1. Physical Intuition: The Water Pipe Analogy\nImagine water flowing through a main pipe that splits into two branches. Every single drop of water entering the fork must leave through one of the two branch pipes—water cannot vanish or pile up inside the junction pipe. In electrical circuits, electric charge behaves the same way! Kirchhoff's Current Law (KCL) is simply the law of conservation of charge: the total current entering a junction must strictly equal the total current leaving it (I_in = I_out).\n\n2. Why Electricity Takes the Path of Least Resistance\nBoth parallel branch resistors (R₁ and R₂) are connected between the same two electrical points: Node A at the top and Ground (0 V) at the bottom. Because they share the exact same starting and ending nodes, both resistors experience the exact same electrical pressure (voltage drop V_A). By Ohm's law, V_A = I₁ · R₁ = I₂ · R₂. This creates a reciprocal relationship: current is inversely proportional to resistance (I ∝ 1/R). The easier path (lower resistance) carries the majority of the current, while the harder path (higher resistance) carries less!\n\n3. The 3:1 Split Target Calculation\nA central power feeder injects a total surge of I_total = 10.0 A into Node A. Our target is to route exactly 7.5 A through Branch 1 (R₁ = 4.0 Ω) and the remaining 2.5 A through Branch 2. Notice that 7.5 A / 2.5 A = 3.00, meaning Branch 1 must carry exactly 3 times as much current as Branch 2. To force Branch 2 to carry 1/3 as much current, its resistance must be exactly 3 times greater: R₂ = 3.00 × R₁ = 3.00 × 4.0 Ω = 12.0 Ω.",
      conclusion:
        "Key Physics Takeaway: At any parallel node sharing common voltage, current divides in the exact inverse ratio of the branch resistances: I₁ / I₂ = R₂ / R₁. With R₁ = 4.0 Ω, setting R₂ = 12.0 Ω satisfies Kirchhoff's Current Law at Node A with an exact 3:1 split (I₁ = 7.5 A, I₂ = 2.5 A) and a matching 30.0 V node drop across both branches.",
      formulas: [
        {
          label: "1. KIRCHHOFF'S CURRENT LAW (KCL)",
          formula: "\\sum I_{\\text{in}} = \\sum I_{\\text{out}} \\implies I_{\\text{total}} = I_1 + I_2",
          explanation:
            "Conservation of Charge: Electric charge cannot be created, destroyed, or accumulated at any conducting junction.",
        },
        {
          label: "2. COMMON NODE VOLTAGE EQUALITY",
          formula: "V_A = I_1 \\cdot R_1 = I_2 \\cdot R_2",
          explanation:
            "Because parallel branches share the same electrical endpoints, the voltage drop across each branch is identical.",
        },
        {
          label: "3. CURRENT DIVIDER INVERSE RATIO",
          formula: "\\dfrac{I_1}{I_2} = \\dfrac{R_2}{R_1} \\implies R_2 = R_1 \\cdot \\left[\\dfrac{I_1}{I_2}\\right]",
          explanation:
            "Branch currents are inversely proportional to their resistances: higher resistance results in lower current.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Check Injected Current Against Conservation of Charge",
          math: "I_{\\text{total}} = I_1 + I_2 = 7.5\\text{ A} + 2.5\\text{ A} = 10.0\\text{ A}",
          explanation:
            "Verify that the desired branch currents sum up to the total feeder surge of 10.0 A, confirming KCL consistency.",
        },
        {
          step: 2,
          title: "Step 2: Calculate the Target Current Ratio",
          math: "\\text{Ratio} = \\dfrac{I_1}{I_2} = \\dfrac{7.5\\text{ A}}{2.5\\text{ A}} = 3.00",
          explanation:
            "Branch 1 must carry exactly 3.00 times as much current as Branch 2.",
        },
        {
          step: 3,
          title: "Step 3: Solve for Target Resistance R₂",
          math: "R_2 = R_1 \\times \\left[\\dfrac{I_1}{I_2}\\right] = 4.0\\,\\Omega \\times 3.00 = 12.0\\,\\Omega",
          explanation:
            "Because current is inversely proportional to resistance, Branch 2 must have 3.00 times the resistance of Branch 1.",
        },
        {
          step: 4,
          title: "Step 4: Verify Both Branch Voltage Drops",
          math: "V_A = 7.5\\text{ A} \\times 4.0\\,\\Omega = 30.0\\text{ V}, \\quad V_A = 2.5\\text{ A} \\times 12.0\\,\\Omega = 30.0\\text{ V}",
          explanation:
            "Both parallel branches produce the exact same potential drop of 30.0 V, confirming mathematical and physical balance.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: The Current Reversal Stalemate",
    subtitle: "Dial opposing generator EMF E₂ to freeze central relay current to exactly 0.00 A, preventing breaker trip",
    parameterName: "Opposing Generator (E₂)",
    parameterUnit: "V",
    e1: 36.0,
    r1: 6.0,
    r2: 12.0,
    rCenter: 4.0,
    sliderMin: 4.0,
    sliderMax: 48.0,
    sliderDefault: 8.0,
    stepSmall: 1.0,
    stepLarge: 4.0,
    // V_th = E1 * R2 / (R1 + R2) = 36 * 12 / 18 = 24.0 V.
    // I_center = (V_th - E2) / (R_th + R_center). For I_center = 0 => E2 = 24.0 V
    targetValue: 24.0,
    tolerance: 0.8,
    targetDescription: "Dial opposing generator EMF E₂ to bring central branch current to exactly 0.00 A",
    mathDerivation: {
      title: "Stage 2: Multi-Mesh Networks, Thévenin Equivalence & The Current Reversal Stalemate",
      concept:
        "What happens when two separate power sources fight over the same wire in an electrical grid?\n\n1. Physical Intuition: The Electrical Arm Wrestling Match\nImagine two people pushing on opposite sides of a revolving door. Generator 1 (E₁ = 36.0 V on the left) tries to push electric current clockwise through Loop 1, forcing current downward through the center branch. Generator 2 (E₂ on the right) is wired in reverse facing upward, pushing current in the exact opposite direction! Which way the electricity flows depends entirely on which generator pushes harder.\n\n2. Thévenin Equivalent: How Hard Does Generator 1 Push?\nTo find out how strongly Generator 1 pushes on the center branch, electrical engineers use Thévenin's Theorem. Imagine temporarily unplugging the center branch:\n• Generator 1 sends current through resistors R₁ (6.0 Ω) and R₂ (12.0 Ω) in series.\n• The voltage appearing across resistor R₂ is the Thévenin Open-Circuit Voltage: V_th = E₁ · [R₂ / (R₁ + R₂)] = 36.0 V · [12.0 / 18.0] = 24.0 V.\n• The internal resistance of this driving network is R_th = (R₁ · R₂) / (R₁ + R₂) = 72.0 / 18.0 = 4.0 Ω.\nSo Generator 1 and its resistors behave like a single 24.0 V battery behind a 4.0 Ω internal resistor!\n\n3. The 3 Regimes of Current Flow (What You See in 3D!)\nWhen we plug the center branch (R_center = 4.0 Ω, with opposing generator E₂) back in, the net current is governed by: I_center = (V_th - E₂) / (R_th + R_center) = (24.0 V - E₂) / 8.0 Ω.\n• E₂ < 24.0 V (Generator 1 Wins): V_th exceeds E₂. Net current flows downward (I_center > 0). You see yellow laser darts streaming down!\n• E₂ = 24.0 V (The Electrical Stalemate): Both sides push with identical voltage (24.0 V vs 24.0 V). The net voltage difference across the relay is exactly 0.00 V! Current drops to exactly 0.00 A, the laser darts come to a dead halt, and the center relay glows emerald green!\n• E₂ > 24.0 V (Generator 2 Overpowers): Generator 2 overcomes Generator 1! Current reverses direction (I_center < 0). The laser darts flip 180° and stream upward!",
      conclusion:
        "Key Physics Takeaway: Opposing EMF E₂ directly counteracts the network's Thévenin open-circuit voltage V_th = 24.0 V. Tuning E₂ to exactly 24.0 V eliminates the net potential across the central relay, creating a zero-current stalemate (I_center = 0.00 A) that protects the grid from breaker trips.",
      formulas: [
        {
          label: "1. THÉVENIN OPEN-CIRCUIT VOLTAGE (V_th)",
          formula: "V_{\\text{th}} = E_1 \\cdot \\left[\\dfrac{R_2}{R_1 + R_2}\\right] = 36.0 \\cdot \\left[\\dfrac{12.0}{6.0 + 12.0}\\right] = 24.0\\text{ V}",
          explanation:
            "The effective open-circuit driving potential established by Generator 1 across the central relay terminals.",
        },
        {
          label: "2. THÉVENIN EQUIVALENT RESISTANCE (R_th)",
          formula: "R_{\\text{th}} = \\dfrac{R_1 \\cdot R_2}{R_1 + R_2} = \\dfrac{6.0 \\times 12.0}{6.0 + 12.0} = 4.0\\,\\Omega",
          explanation:
            "The internal resistance of the network seen looking back into the terminals from the central branch.",
        },
        {
          label: "3. NET CENTRAL BRANCH CURRENT",
          formula: "I_{\\text{center}} = \\dfrac{V_{\\text{th}} - E_2}{R_{\\text{th}} + R_{\\text{center}}} = \\dfrac{24.0 - E_2}{4.0 + 4.0}",
          explanation:
            "Ohm's Law applied to the single-loop equivalent circuit: net driving voltage divided by total loop resistance.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Calculate the Thévenin Driving Voltage (V_th)",
          math: "V_{\\text{th}} = 36.0\\text{ V} \\times \\dfrac{12.0\\,\\Omega}{6.0\\,\\Omega + 12.0\\,\\Omega} = 36.0 \\times \\dfrac{12}{18} = 24.0\\text{ V}",
          explanation:
            "Disconnecting the center branch reveals that Generator 1 produces 24.0 V across resistor R₂.",
        },
        {
          step: 2,
          title: "Step 2: Calculate the Network Internal Resistance (R_th)",
          math: "R_{\\text{th}} = \\dfrac{6.0 \\times 12.0}{6.0 + 12.0} = 4.0\\,\\Omega \\implies R_{\\text{total}} = R_{\\text{th}} + R_{\\text{center}} = 4.0 + 4.0 = 8.0\\,\\Omega",
          explanation:
            "Deactivating Generator 1 shows R₁ and R₂ are in parallel, giving 4.0 Ω internal resistance. Total branch loop resistance is 8.0 Ω.",
        },
        {
          step: 3,
          title: "Step 3: Set Up the Zero-Current Balance Condition",
          math: "I_{\\text{center}} = \\dfrac{24.0\\text{ V} - E_2}{8.0\\,\\Omega} = 0.00\\text{ A} \\implies 24.0\\text{ V} - E_2 = 0 \\implies E_2 = 24.0\\text{ V}",
          explanation:
            "For current to be zero, the numerator (net driving voltage) must be zero. Therefore, opposing EMF E₂ must equal exactly 24.0 V.",
        },
        {
          step: 4,
          title: "Step 4: Verify Current Reversal Above and Below 24 V",
          math: "E_2 = 16\\text{ V} \\implies I = +1.0\\text{ A} \\;(\\downarrow), \\quad E_2 = 24\\text{ V} \\implies I = 0.0\\text{ A}, \\quad E_2 = 32\\text{ V} \\implies I = -1.0\\text{ A} \\;(\\uparrow)",
          explanation:
            "Below 24 V, Generator 1 dominates (downward). At 24 V, current halts. Above 24 V, Generator 2 dominates, reversing flow upward!",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: Maximum Power Transfer & Impedance Matching",
    subtitle: "Tune central load resistor R_L to match grid internal impedance and achieve peak power dissipation P = 36.0 W",
    parameterName: "Load Resistor (R_L)",
    parameterUnit: "Ω",
    e1: 36.0,
    r1: 6.0,
    r2: 12.0,
    rCenter: 4.0, // target
    fixedE2: 0.0,
    sliderMin: 1.0,
    sliderMax: 16.0,
    sliderDefault: 1.0,
    stepSmall: 0.5,
    stepLarge: 2.0,
    // V_th = 24.0 V, R_th = 4.0 Ω. Max power occurs when R_L = R_th = 4.0 Ω.
    // P_max = V_th^2 / (4 * R_th) = 576 / 16 = 36.0 W.
    targetValue: 4.0,
    tolerance: 0.4,
    targetDescription: "Tune load resistor R_L to achieve maximum power transfer of P = 36.0 W",
    mathDerivation: {
      title: "Stage 3: Maximum Power Transfer Theorem & Impedance Matching",
      concept:
        "How do electrical engineers maximize the amount of useful power delivered to a load?\n\n1. Physical Intuition: The Goldilocks Dilemma\nElectric power dissipated in a load resistor is P = I² · R_L. Think about what happens at the two extremes:\n• Extreme 1: If R_L is almost zero (a short circuit), current I is huge, but the voltage across the load collapses to zero. Power = 0 W!\n• Extreme 2: If R_L is huge (an open circuit), the voltage across it is high, but almost no current can squeeze through. Power = 0 W!\nBecause power is near zero at both extremes, there must be a 'Goldilocks' peak right in the middle where power transfer reaches its absolute maximum!\n\n2. The Maximum Power Transfer Theorem\nUsing calculus to find the peak of the power curve P(R_L) = [V_th / (R_th + R_L)]² · R_L by differentiating dP/dR_L = 0 leads to a universally famous law of electrical engineering: Maximum power is delivered to the load when the load resistance exactly matches the internal resistance of the power source (R_L = R_th).\n\n3. Applying Impedance Matching to our Power Grid\nFrom Stage 2, our power grid source has a Thévenin voltage of V_th = 24.0 V and an internal resistance of R_th = 4.0 Ω.\n• To extract the maximum possible power into our central heating coil, we must set R_L = R_th = 4.0 Ω.\n• At this matched point, current is I = 24.0 V / (4.0 + 4.0 Ω) = 3.0 A.\n• The voltage drop across the load is exactly half the source voltage: V_L = 3.0 A × 4.0 Ω = 12.0 V.\n• Peak power dissipated as heat in the coil is P_max = I² · R_L = (3.0 A)² × 4.0 Ω = exactly 36.0 W!",
      conclusion:
        "Key Physics Takeaway: Maximum power transfer occurs when load impedance matches the internal grid resistance: R_L = R_th = 4.0 Ω. At this matched operating point, current is I = 3.0 A, voltage across the load is 12.0 V (50% efficiency), and the load dissipates its theoretical peak power of P_max = 36.0 W.",
      formulas: [
        {
          label: "1. MAXIMUM POWER TRANSFER THEOREM",
          formula: "P_{\\text{load}} = \\text{Maximum} \\iff R_L = R_{\\text{th}}",
          explanation:
            "A linear electrical network delivers maximum power to an external load when load resistance equals the source Thévenin resistance.",
        },
        {
          label: "2. GENERAL LOAD POWER EQUATION",
          formula: "P(R_L) = I_L^2 \\cdot R_L = \\left[\\dfrac{V_{\\text{th}}}{R_{\\text{th}} + R_L}\\right]^2 \\cdot R_L",
          explanation:
            "Power dissipated across the load resistor as a function of load resistance R_L.",
        },
        {
          label: "3. PEAK POWER FORMULA",
          formula: "P_{\\text{max}} = \\dfrac{V_{\\text{th}}^2}{4 R_{\\text{th}}} = \\dfrac{(24.0)^2}{4 \\times 4.0} = 36.0\\text{ W}",
          explanation:
            "The maximum attainable power in any DC network, achieved under matched impedance conditions.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Identify Grid Thévenin Parameters",
          math: "V_{\\text{th}} = 24.0\\text{ V}, \quad R_{\\text{th}} = \\dfrac{6.0 \\times 12.0}{6.0 + 12.0} = 4.0\\,\\Omega",
          explanation:
            "The driving grid behaves as an ideal 24.0 V source behind a 4.0 Ω internal resistance.",
        },
        {
          step: 2,
          title: "Step 2: Apply the Impedance Matching Condition",
          math: "R_L = R_{\\text{th}} = 4.0\\,\\Omega",
          explanation:
            "According to the Maximum Power Transfer Theorem, peak power transfer requires tuning load resistor R_L to match R_th = 4.0 Ω.",
        },
        {
          step: 3,
          title: "Step 3: Calculate Matched Operating Current (I_L)",
          math: "I_L = \\dfrac{V_{\\text{th}}}{R_{\\text{th}} + R_L} = \\dfrac{24.0\\text{ V}}{4.0\\,\\Omega + 4.0\\,\\Omega} = \\dfrac{24.0}{8.0} = 3.00\\text{ A}",
          explanation:
            "At matched impedance, total resistance is 8.0 Ω, producing exactly 3.00 A of current through the load.",
        },
        {
          step: 4,
          title: "Step 4: Calculate Peak Power Dissipation (P_max)",
          math: "P = I_L^2 \\cdot R_L = (3.00\\text{ A})^2 \\times 4.0\\,\\Omega = 9.00 \\times 4.0 = 36.0\\text{ W}",
          explanation:
            "Thermal dissipation in the central coil reaches its theoretical maximum of 36.0 W, indicated by the thermal glow.",
        },
      ],
    },
  },
};

export interface PhysicalGridState {
  currentE1: number; // in V
  currentE2: number; // in V
  currentR1: number; // in Ω
  currentR2: number; // in Ω
  currentRCenter: number; // in Ω
  vNodeA: number; // in V
  i1: number; // in A (left branch)
  i2: number; // in A (right branch)
  iCenter: number; // in A (center branch: + is downward, - is upward)
  powerCenter: number; // in W (I_center^2 * R_center)
  isBalanced: boolean;
}

export function computePhysicalGridState(
  stageConfig: DualLoopGridStageConfig,
  sliderValue: number
): PhysicalGridState {
  const { stage, e1, r1, tolerance } = stageConfig;

  let currentE1 = e1;
  let currentE2 = 0.0;
  let currentR1 = r1;
  let currentR2 = stageConfig.r2;
  let currentRCenter = stageConfig.rCenter;

  let vNodeA = 0.0;
  let i1 = 0.0;
  let i2 = 0.0;
  let iCenter = 0.0;
  let powerCenter = 0.0;

  if (stage === 1) {
    // Stage 1: Injected feeder current I_total = 10.0 A splits into R1 and R2
    currentR2 = Math.max(1.0, sliderValue);
    const iTotal = 10.0;
    i1 = iTotal * (currentR2 / (currentR1 + currentR2));
    i2 = iTotal * (currentR1 / (currentR1 + currentR2));
    vNodeA = i1 * currentR1; // = i2 * currentR2
    iCenter = 0.0;
    powerCenter = 0.0;
  } else if (stage === 2) {
    // Stage 2: Dual-mesh current reversal. E2 is variable opposing generator
    currentE2 = sliderValue;
    currentRCenter = stageConfig.rCenter;
    const vTh = e1 * (currentR2 / (currentR1 + currentR2)); // 24.0 V
    const rTh = (currentR1 * currentR2) / (currentR1 + currentR2); // 4.0 Ω

    // I_center = (V_th - E2) / (R_th + R_center)
    iCenter = (vTh - currentE2) / (rTh + currentRCenter);
    vNodeA = currentE2 + iCenter * currentRCenter;
    i1 = (e1 - vNodeA) / currentR1;
    i2 = (vNodeA) / currentR2;
    powerCenter = Math.abs(iCenter * iCenter * currentRCenter);
  } else {
    // Stage 3: Maximum power transfer. Load resistor R_L is variable
    currentRCenter = Math.max(0.5, sliderValue);
    currentE2 = 0.0;
    const vTh = e1 * (currentR2 / (currentR1 + currentR2)); // 24.0 V
    const rTh = (currentR1 * currentR2) / (currentR1 + currentR2); // 4.0 Ω

    iCenter = vTh / (rTh + currentRCenter);
    vNodeA = iCenter * currentRCenter;
    i1 = (e1 - vNodeA) / currentR1;
    i2 = vNodeA / currentR2;
    powerCenter = iCenter * iCenter * currentRCenter;
  }

  const error = Math.abs(sliderValue - stageConfig.targetValue);
  const isBalanced = error <= tolerance;

  return {
    currentE1,
    currentE2,
    currentR1,
    currentR2,
    currentRCenter,
    vNodeA,
    i1,
    i2,
    iCenter,
    powerCenter,
    isBalanced,
  };
}

export interface DualLoopGridStore {
  currentStage: number;
  sliderValue: number;

  // Live state
  currentE1: number;
  currentE2: number;
  currentR1: number;
  currentR2: number;
  currentRCenter: number;
  vNodeA: number;
  i1: number;
  i2: number;
  iCenter: number;
  powerCenter: number;
  isBalanced: boolean;

  // Game/Simulation state
  isSimulating: boolean;
  isWon: boolean;
  isGameOver: boolean;
  failureReason: string | null;
  showResultModal: boolean;
  isMissionStarted: boolean;
  missionStartedAt: number | null;
  analysisProgress: number;

  // Actions
  setSliderValue: (val: number) => void;
  triggerAnalysis: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  startMission: () => void;
  tickSimulation: (dt: number) => void;
}

export const useDualLoopGridStore = create<DualLoopGridStore>((set, get) => {
  const initialStage = 1;
  const initialConfig = DUAL_LOOP_STAGES[initialStage];
  const initialComputed = computePhysicalGridState(initialConfig, initialConfig.sliderDefault);

  return {
    currentStage: initialStage,
    sliderValue: initialConfig.sliderDefault,

    ...initialComputed,

    isSimulating: false,
    isWon: false,
    isGameOver: false,
    failureReason: null,
    showResultModal: false,
    isMissionStarted: false,
    missionStartedAt: null,
    analysisProgress: 0.0,

    setSliderValue: (val: number) => {
      const { currentStage, isSimulating } = get();
      if (isSimulating) return;

      const stageConfig = DUAL_LOOP_STAGES[currentStage] || DUAL_LOOP_STAGES[1];
      const clamped = Math.max(stageConfig.sliderMin, Math.min(stageConfig.sliderMax, val));
      const computed = computePhysicalGridState(stageConfig, clamped);

      set({
        sliderValue: clamped,
        ...computed,
      });
    },

    startMission: () => {
      set({
        isMissionStarted: true,
        missionStartedAt: Date.now(),
      });
    },

    triggerAnalysis: () => {
      const { isSimulating } = get();
      if (isSimulating) return;

      set({
        isSimulating: true,
        analysisProgress: 0.0,
      });
    },

    tickSimulation: (dt: number) => {
      const { isSimulating, analysisProgress, sliderValue, currentStage } = get();
      if (!isSimulating) return;

      const newProgress = Math.min(1.0, analysisProgress + dt * 0.85);
      set({ analysisProgress: newProgress });

      if (newProgress >= 1.0) {
        const stageConfig = DUAL_LOOP_STAGES[currentStage] || DUAL_LOOP_STAGES[1];
        const error = Math.abs(sliderValue - stageConfig.targetValue);
        const won = error <= stageConfig.tolerance;

        let failMsg: string | null = null;
        if (!won) {
          if (currentStage === 1) {
            failMsg = `Current resistor R₂ = ${sliderValue.toFixed(1)} Ω splits current into I₁ = ${get().i1.toFixed(2)} A and I₂ = ${get().i2.toFixed(2)} A (Target: I₁ = 7.5 A, I₂ = 2.5 A at R₂ = 12.0 Ω).`;
          } else if (currentStage === 2) {
            failMsg = `Current generator E₂ = ${sliderValue.toFixed(1)} V produces center current I = ${get().iCenter.toFixed(2)} A (Target: Null balance I = 0.00 A at E₂ = 24.0 V).`;
          } else {
            failMsg = `Current load R_L = ${sliderValue.toFixed(1)} Ω dissipates P = ${get().powerCenter.toFixed(1)} W (Target: Matched peak power P = 36.0 W at R_L = 4.0 Ω).`;
          }
        }

        set({
          isSimulating: false,
          isWon: won,
          isGameOver: !won,
          failureReason: failMsg,
          showResultModal: true,
        });
      }
    },

    resetSimulation: () => {
      const { currentStage } = get();
      const stageConfig = DUAL_LOOP_STAGES[currentStage] || DUAL_LOOP_STAGES[1];
      const computed = computePhysicalGridState(stageConfig, stageConfig.sliderDefault);
      set({
        sliderValue: stageConfig.sliderDefault,
        isSimulating: false,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
        analysisProgress: 0.0,
        ...computed,
      });
    },

    nextStage: () => {
      const { currentStage } = get();
      const next = currentStage + 1;
      if (DUAL_LOOP_STAGES[next]) {
        const nextConfig = DUAL_LOOP_STAGES[next];
        const computed = computePhysicalGridState(nextConfig, nextConfig.sliderDefault);
        set({
          currentStage: next,
          sliderValue: nextConfig.sliderDefault,
          isSimulating: false,
          isWon: false,
          isGameOver: false,
          failureReason: null,
          showResultModal: false,
          analysisProgress: 0.0,
          ...computed,
        });
      } else {
        const firstConfig = DUAL_LOOP_STAGES[1];
        const computed = computePhysicalGridState(firstConfig, firstConfig.sliderDefault);
        set({
          currentStage: 1,
          sliderValue: firstConfig.sliderDefault,
          isSimulating: false,
          isWon: false,
          isGameOver: false,
          failureReason: null,
          showResultModal: false,
          analysisProgress: 0.0,
          ...computed,
        });
      }
    },
  };
});
