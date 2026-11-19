import { create } from "zustand";

export interface MetrologyStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  parameterName: string;
  parameterUnit: string;

  // Circuit electrical parameters
  batteryV: number;
  rKnown: number;
  rUnknown: number;
  wireLength: number; // in cm (100.0)
  wireResistance: number; // in ohms (10.0)
  galvanometerG: number; // 50.0 ohms

  // Specific stage extras
  testCellEmf?: number; // for stage 2
  testCellR?: number; // for stage 2
  rheostatR?: number; // for stage 2
  fullScaleIg?: number; // for stage 3
  lineCurrent?: number; // for stage 3

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

export const METROLOGY_STAGES: Record<number, MetrologyStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Metre Bridge Null-Point Balance",
    subtitle: "Locate the exact jockey balance position l on the 100 cm wire to find unknown coil resistance S = 9.00 Ω",
    parameterName: "Jockey Position (l)",
    parameterUnit: "cm",
    batteryV: 4.0,
    rKnown: 6.0,
    rUnknown: 9.0,
    wireLength: 100.0,
    wireResistance: 10.0,
    galvanometerG: 50.0,
    sliderMin: 5.0,
    sliderMax: 95.0,
    sliderDefault: 20.0,
    stepSmall: 0.5,
    stepLarge: 2.0,
    // R / S = l / (100 - l) => 6 / 9 = 2/3 = l / (100 - l) => 200 - 2l = 3l => 5l = 200 => l = 40.0 cm
    targetValue: 40.0,
    tolerance: 0.8,
    targetDescription: "Find the zero-current balance point on the 100 cm bridge wire to measure unknown coil S.",
    mathDerivation: {
      title: "Stage 1: Wheatstone Bridge Principle & Metre Bridge Null Condition",
      concept:
        "How can we measure an unknown electrical resistance with extreme precision without even knowing the battery's voltage or the meter's internal resistance?\n\n1. Physical Intuition: The Water Canal Seesaw\nImagine water flowing through an aqueduct that splits into two parallel branches (an upper path and a lower path) before rejoining at the exit.\n• If water pressure drops at the exact same rate along both channels, any cross-canal dug between the midpoints will experience zero pressure difference.\n• No water flows sideways across the bridge! The water level in the center channel remains dead calm.\nIn our electrical bridge, the top branch has resistors R and S. The bottom branch is a uniform 100 cm wire. When the resistance ratios match, the electrical potential (voltage) at the top junction equals the voltage at the jockey contact point (V_top = V_jockey). The voltage difference across the galvanometer drops to 0.00 V, so the needle rests dead-center at exactly 0.00 µA!\n\n2. Why This Method is Immunity to Errors (The Null Principle)\nIn typical measurements, connecting a meter disturbs the circuit because the meter draws current. But at the null point (I_g = 0):\n• Zero current flows through the galvanometer needle.\n• Zero current flows through the jockey contact point (meaning contact resistance has ZERO effect on accuracy!).\n• The battery voltage does not matter—even if the battery gets weak or drops from 4.0 V to 3.0 V, the balance ratio remains 100% unchanged!\n\n3. The Metre Bridge Balancing Ratio\nA uniform slide wire has a uniform resistance per centimeter σ = R_wire / 100 cm = 0.10 Ω/cm.\n• Left segment wire resistance: R_left = σ · l.\n• Right segment wire resistance: R_right = σ · (100 - l).\nAt null balance:\n  R / S = R_left / R_right = (σ · l) / (σ · [100 - l])\nNotice that the wire's resistivity and thickness (σ) cancel out completely!\n  R / S = l / (100 - l)\n\n4. Step-by-Step Calculation for our Experiment:\n• Known standard resistance in left gap: R = 6.00 Ω.\n• Unknown alloy coil in right gap: S = 9.00 Ω.\n• Set up ratio: 6.00 / 9.00 = 2 / 3.\n• Equate to wire lengths: 2 / 3 = l / (100 - l).\n• Cross-multiply: 2 · (100 - l) = 3 · l  ⟹  200 - 2l = 3l  ⟹  5l = 200  ⟹  l = 40.0 cm.\nSliding the jockey to exactly 40.0 cm balances the bridge, dropping detector current to 0.00 µA!",
      conclusion:
        "Key Physics Takeaway: At the null point l = 40.0 cm, the bridge satisfies Wheatstone balance (R/S = l/(100-l)). Because zero current flows through the galvanometer detector, contact resistance and meter loading introduce zero error, providing a true null-method measurement.",
      formulas: [
        {
          label: "1. WHEATSTONE BALANCE CONDITION",
          formula: "\\dfrac{R}{S} = \\dfrac{R_{\\text{left}}}{R_{\\text{right}}} = \\dfrac{\\sigma \\cdot l}{\\sigma \\cdot (100 - l)} = \\dfrac{l}{100 - l}",
          explanation:
            "The ratio of upper resistances equals the ratio of wire segment lengths. Wire resistivity and cross-section cancel out completely.",
        },
        {
          label: "2. UNKNOWN RESISTANCE DETERMINATION",
          formula: "S = R \\cdot \\left[\\dfrac{100 - l}{l}\\right] = 6.00\\,\\Omega \\cdot \\left[\\dfrac{100.0 - 40.0}{40.0}\\right] = 6.00 \\cdot \\dfrac{60.0}{40.0} = 9.00\\,\\Omega",
          explanation:
            "Allows direct calculation of unknown alloy coil S from known resistance R and measured balance length l.",
        },
        {
          label: "3. DETECTOR OFF-BALANCE EQUATION",
          formula: "I_g(l) = \\dfrac{V_{\\text{top}} - V_{\\text{jockey}}(l)}{R_{\\text{th}}(l) + G}",
          explanation:
            "When l < 40 cm, V_jockey > V_top (needle deflects negative). At l = 40 cm, V_top = V_jockey = 2.40 V (Ig = 0). When l > 40 cm, V_top > V_jockey (needle deflects positive).",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Known Resistances & Form the Ratio",
          math: "R = 6.00\\,\\Omega, \\quad S = 9.00\\,\\Omega \\implies \\dfrac{R}{S} = \\dfrac{6.00}{9.00} = \\dfrac{2}{3}",
          explanation:
            "The upper ratio of the bridge is locked in by standard box R (6.0 Ω) and unknown coil S (9.0 Ω).",
        },
        {
          step: 2,
          title: "Set Up the 100 cm Wire Ratio Equation",
          math: "\\dfrac{l}{100 - l} = \\dfrac{2}{3} \\implies 3l = 2(100 - l) = 200 - 2l",
          explanation:
            "Because the slide wire is perfectly uniform, resistance is directly proportional to length.",
        },
        {
          step: 3,
          title: "Solve Linear Equation for Null Position (l)",
          math: "3l + 2l = 200 \\implies 5l = 200 \\implies l = \\dfrac{200}{5} = 40.0\\text{ cm}",
          explanation:
            "Sliding the brass jockey to exactly 40.0 cm equalizes the potential at both nodes (V_top = V_jockey = 2.40 V). Net current drops to 0.00 µA!",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: Potentiometer Null-Gradient & True EMF",
    subtitle: "Balance wire potential drop against test cell EMF to measure true open-circuit voltage with zero current draw",
    parameterName: "Potentiometer Jockey (l)",
    parameterUnit: "cm",
    batteryV: 6.0, // driver cell E_driver
    rheostatR: 2.0, // series rheostat Rh
    wireLength: 100.0,
    wireResistance: 10.0,
    rKnown: 2.0,
    rUnknown: 0.0,
    galvanometerG: 50.0,
    testCellEmf: 2.25, // test cell E_test
    testCellR: 1.5, // internal resistance r
    sliderMin: 10.0,
    sliderMax: 90.0,
    sliderDefault: 20.0,
    stepSmall: 0.5,
    stepLarge: 2.0,
    // I_pri = 6.0 / (10.0 + 2.0) = 0.50 A. V_wire = 0.50 * 10 = 5.0 V.
    // k = 5.0 V / 100 cm = 0.050 V/cm = 50 mV/cm.
    // At null: E_test = k * l => 2.25 = 0.050 * l => l = 45.0 cm
    targetValue: 45.0,
    tolerance: 0.8,
    targetDescription: "Calibrate the slide wire potential ramp to balance the cell's pure chemical EMF with zero current draw.",
    mathDerivation: {
      title: "Stage 2: Potentiometer Principle, Potential Gradient & True Open-Circuit EMF",
      concept:
        "Why is a potentiometer called an 'Ideal Voltmeter with Infinite Internal Resistance'?\n\n1. Physical Intuition: The Voltmeter Distortion Trap\nImagine you want to measure the natural water level of a delicate pond. If you bring a giant measuring bucket and dip it into the pond, filling the bucket withdraws water and lowers the pond level! That is exactly what a standard moving-coil or digital voltmeter does to a battery:\n• A voltmeter must steal a small current (I) through its terminals just to move its needle.\n• But drawing current forces electrons to fight through the battery's chemical internal resistance (r).\n• This causes an internal voltage drop (I · r). The terminal voltage read by the voltmeter is V = E - I · r.\n• Therefore, a voltmeter can NEVER measure the true open-circuit electromotive force (EMF) of a cell—it always reads lower than reality!\n\n2. The Potentiometer Solution: The Zero-Current Principle\nA potentiometer completely solves this problem. It uses a long, uniform manganin resistance wire driven by a stable external primary battery (E_driver = 6.00 V). This sets up a uniform, steady voltage drop along the wire—just like an electrical ramp.\n• When we connect the test cell to the wire in opposition, the cell pushes against the wire drop.\n• When we slide the jockey to the exact point where the wire's drop equals the cell's EMF (V_wire = E_test), both voltages fight to an exact tie!\n• The net voltage difference across the galvanometer is 0.00 V, so the galvanometer current drops to EXACTLY 0.00 µA!\n• Because I = 0, the internal drop is I · r = 0 · r = 0.00 V! The potentiometer measures the TRUE, 100% pure chemical EMF of the cell!\n\n3. Calculating the Potential Gradient (k):\n• Primary battery voltage: E_driver = 6.00 V.\n• Primary circuit total resistance: R_pri = R_wire + R_rheostat = 10.0 Ω + 2.0 Ω = 12.0 Ω.\n• Primary circuit current: I_pri = 6.00 V / 12.0 Ω = 0.50 A.\n• Total voltage drop across the 100.0 cm wire: V_wire = I_pri · R_wire = 0.50 A × 10.0 Ω = 5.00 V.\n• Potential Gradient (k) = V_wire / L = 5.00 V / 100.0 cm = 0.050 V/cm = 50.0 mV/cm.\n  Every single centimeter of wire drops exactly 50 millivolts!\n\n4. Finding the Exact Balancing Length:\n• Test cell EMF: E_test = 2.25 V.\n• Balance equation: E_test = k · l  ⟹  2.25 V = (0.050 V/cm) · l.\n• Solve for length: l = 2.25 / 0.050 = 45.0 cm.\nAt l = 45.0 cm, wire potential equals 2.25 V. Galvanometer current halts at 0.00 µA, confirming true EMF!",
      conclusion:
        "Key Physics Takeaway: At the null point l = 45.0 cm, the wire's potential drop V(l) = k·l = 2.25 V perfectly matches the cell's EMF. Because zero current is drawn from the secondary cell, internal resistance causes zero voltage drop (I·r = 0), allowing a potentiometer to act as an ideal voltmeter of infinite resistance.",
      formulas: [
        {
          label: "1. PRIMARY CURRENT & POTENTIAL GRADIENT (k)",
          formula: "k = \\dfrac{V_{\\text{wire}}}{L} = \\dfrac{I_{\\text{pri}} \\cdot R_{\\text{wire}}}{L} = \\dfrac{\\left(\\frac{6.00}{10.0 + 2.0}\\right) \\times 10.0}{100.0} = 0.050\\text{ V/cm}",
          explanation:
            "Uniform potential drop per unit length established along the slide wire by the primary driver circuit.",
        },
        {
          label: "2. EMF NULL-BALANCE CONDITION",
          formula: "\\mathcal{E}_{\\text{test}} = k \\cdot l = 0.050\\text{ V/cm} \\times 45.0\\text{ cm} = 2.25\\text{ V}",
          explanation:
            "Unknown cell EMF equals the wire drop across balancing length l when galvanometer current is zero.",
        },
        {
          label: "3. ZERO LOADING ADVANTAGE",
          formula: "V_{\\text{terminal}} = \\mathcal{E}_{\\text{test}} - I \\cdot r = \\mathcal{E}_{\\text{test}} - (0) \\cdot r = \\mathcal{E}_{\\text{test}}",
          explanation:
            "Unlike a voltmeter, zero current draw ensures internal resistance r produces zero measurement distortion.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Compute Primary Circuit Steady Current",
          math: "I_{\\text{pri}} = \\dfrac{\\mathcal{E}_{\\text{driver}}}{R_{\\text{wire}} + R_h} = \\dfrac{6.00\\text{ V}}{10.0\\,\\Omega + 2.0\\,\\Omega} = \\dfrac{6.00}{12.0} = 0.50\\text{ A}",
          explanation:
            "The series combination of the 10 Ω potentiometer wire and 2 Ω rheostat limits primary current to 0.50 A.",
        },
        {
          step: 2,
          title: "Calculate Potential Gradient of the Wire (k)",
          math: "k = \\dfrac{V_{\\text{wire}}}{L} = \\dfrac{I_{\\text{pri}} \\cdot R_{\\text{wire}}}{L} = \\dfrac{0.50\\text{ A} \\times 10.0\\,\\Omega}{100.0\\text{ cm}} = \\dfrac{5.00\\text{ V}}{100.0\\text{ cm}} = 0.050\\text{ V/cm}",
          explanation:
            "Every 1.0 cm along the manganin slide wire drops exactly 0.050 V (50.0 mV).",
        },
        {
          step: 3,
          title: "Calculate Balance Length for 2.25 V Cell",
          math: "l = \\dfrac{\\mathcal{E}_{\\text{test}}}{k} = \\dfrac{2.25\\text{ V}}{0.050\\text{ V/cm}} = 45.0\\text{ cm}",
          explanation:
            "Sliding the jockey to 45.0 cm balances the 2.25 V cell against the wire drop, resulting in a perfect 0.00 µA null point!",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: Galvanometer Conversion (Ammeter Shunt)",
    subtitle: "Calculate and dial precision shunt resistor S = 20.0 mΩ to safely convert delicate galvanometer into a 5.0 A ammeter",
    parameterName: "Shunt Resistor (S)",
    parameterUnit: "mΩ",
    batteryV: 5.0,
    rKnown: 0.0,
    rUnknown: 0.0,
    wireLength: 100.0,
    wireResistance: 0.0,
    galvanometerG: 49.95, // ~50 ohms
    fullScaleIg: 0.002, // 2.0 mA
    lineCurrent: 5.0, // 5.0 A surge
    sliderMin: 5.0,
    sliderMax: 50.0,
    sliderDefault: 40.0,
    stepSmall: 1.0,
    stepLarge: 5.0,
    // S = Ig * G / (I - Ig) = (0.002 * 49.95) / (5.0 - 0.002) = 0.0999 / 4.998 = 0.0200 Ω = 20.0 mΩ
    targetValue: 20.0,
    tolerance: 1.0,
    targetDescription: "Calibrate a parallel shunt to bypass a 5.0 A power surge and protect the delicate galvanometer coil.",
    mathDerivation: {
      title: "Stage 3: Galvanometer Physics, Current Sensitivity & Shunt Resistance",
      concept:
        "How can we measure a massive, high-amperage current (5.00 A) using a delicate laboratory moving-coil galvanometer whose hairspring burns out at just 2 milliamperes (0.002 A)?\n\n1. Physical Intuition: The Massive Bypass River Canal\nImagine an ancient, delicate waterwheel designed for a tiny garden stream of 2 liters/minute. If a raging river flood of 5,000 liters/minute hits it directly, the wooden paddles will instantly snap!\n• To measure the river without destroying the wheel, engineers dig a wide, low-resistance bypass canal (called a Shunt) right alongside the wheel.\n• The bypass canal carries 4,998 liters/minute straight through, while letting exactly 2 liters/minute trickle safely through the wheel.\n• Because the flow divides in an exact, known mathematical ratio, measuring the gentle 2 L/min trickle tells you the entire 5,000 L/min river flow with perfect precision!\n\n2. The Parallel Shunt Equation\nThe moving coil of the galvanometer has internal copper wire resistance G = 49.95 Ω. We solder a tiny resistance strip of manganin or copper (the Shunt, S) directly across its terminals in parallel.\n• Because the galvanometer and shunt are in parallel, the voltage across both must be strictly identical: V_galv = V_shunt.\n• By Ohm's Law: I_g · G = I_shunt · S.\n• By Kirchhoff's Current Law, the total current divides: I_shunt = I_total - I_g.\n• Substituting yields the universal Ammeter Shunt Formula:\n  S = (I_g · G) / (I_total - I_g)\n\n3. Step-by-Step Calibration for our 5.0 A Ammeter:\n• Maximum full-scale coil current: I_g = 2.00 mA = 0.0020 A.\n• Galvanometer coil internal resistance: G = 49.95 Ω.\n• Total main circuit current to be measured: I_total = 5.00 A.\n• Current that must be bypassed through the shunt: I_shunt = 5.00 A - 0.0020 A = 4.998 A (99.96% of the current!).\n• Voltage drop across the galvanometer at full deflection: V_g = I_g · G = 0.0020 A × 49.95 Ω = 0.0999 V.\n• Required Shunt Resistance: S = 0.0999 V / 4.998 A = 0.0200 Ω = 20.0 mΩ (milliohms).\n\n4. Why an Ammeter Must Have Near-Zero Resistance:\nWhen we connect this converted ammeter into a real circuit, it is placed in series. The overall resistance of the ammeter is:\n  R_ammeter = (G · S) / (G + S) ≈ 0.01999 Ω ≈ 0.020 Ω.\nBecause 0.020 Ω is virtually zero, inserting the ammeter into a circuit causes negligible voltage drop, leaving the real circuit currents undisturbed!",
      conclusion:
        "Key Physics Takeaway: Connecting a tiny shunt resistor S = 20.0 mΩ in parallel converts the delicate 2.0 mA galvanometer into a robust 5.00 A ammeter. The shunt safely diverts 99.96% of the current, and collapses the ammeter's total resistance to just 0.020 Ω, ensuring zero circuit disruption.",
      formulas: [
        {
          label: "1. UNIVERSAL AMMETER SHUNT FORMULA",
          formula: "S = \\dfrac{I_g \\cdot G}{I - I_g}",
          explanation:
            "Derived from parallel voltage equality: Ig·G = Is·S, where Is = (I - Ig) is the bypassed current.",
        },
        {
          label: "2. SHUNT CALIBRATION ARITHMETIC",
          formula: "S = \\dfrac{0.0020\\text{ A} \\times 49.95\\,\\Omega}{5.00\\text{ A} - 0.0020\\text{ A}} = \\dfrac{0.0999\\text{ V}}{4.998\\text{ A}} = 0.0200\\,\\Omega = 20.0\\text{ m}\\Omega",
          explanation:
            "A 20.0 milliohm precision strip safely diverts 4.998 A, directing exactly 2.0 mA through the coil for full-scale 5.0 A deflection.",
        },
        {
          label: "3. EQUIVALENT AMMETER RESISTANCE",
          formula: "R_A = \\dfrac{G \\cdot S}{G + S} = \\dfrac{49.95 \\times 0.0200}{49.95 + 0.0200} \\approx 0.020\\,\\Omega",
          explanation:
            "Extremely low total resistance ensures that connecting the ammeter in series causes negligible circuit loading.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Coil Limits & Desired Range",
          math: "G = 49.95\\,\\Omega, \\quad I_g = 2.00\\text{ mA} = 0.0020\\text{ A}, \\quad I = 5.00\\text{ A}",
          explanation:
            "The galvanometer coil can safely accept at most 0.0020 A before hitting its mechanical end-stops.",
        },
        {
          step: 2,
          title: "Determine Bypass Current Through Shunt",
          math: "I_s = I - I_g = 5.00\\text{ A} - 0.0020\\text{ A} = 4.998\\text{ A}",
          explanation:
            "The parallel shunt must carry 99.96% of the total current surge.",
        },
        {
          step: 3,
          title: "Calculate Precision Shunt Resistance (S)",
          math: "S = \\dfrac{I_g \\cdot G}{I_s} = \\dfrac{0.0020 \\times 49.95}{4.998} = \\dfrac{0.0999}{4.998} = 0.0200\\,\\Omega = 20.0\\text{ m}\\Omega",
          explanation:
            "Dialing S = 20.0 mΩ calibrates the instrument to exactly 100% full scale at 5.00 A without damaging the coil!",
        },
      ],
    },
  },
};

interface MetrologyBenchState {
  currentStage: number;
  sliderValue: number;

  // Derived real-time telemetry
  jockeyX: number; // 3D spatial coordinate along the 100 cm rail
  iGalvanometer: number; // in microamperes or milliamperes
  needleAngle: number; // in radians (-Math.PI/4 to +Math.PI/4)
  isBalanced: boolean;

  // Simulation lifecycle
  isMissionStarted: boolean;
  isSimulating: boolean;
  simTime: number;
  isWon: boolean;
  isGameOver: boolean;
  failureReason: string | null;
  showResultModal: boolean;

  // Actions
  startMission: () => void;
  setSliderValue: (val: number) => void;
  runMeasurement: () => void;
  tickSimulation: (dt: number) => void;
  resetSimulation: () => void;
  nextStage: () => void;
  setStage: (stage: number) => void;
}

export const useMetrologyBenchStore = create<MetrologyBenchState>((set, get) => {
  const initialStage = 1;
  const cfg = METROLOGY_STAGES[initialStage];

  // Helper to calculate electrical status from slider value
  const computeTelemetry = (stageNum: number, slider: number) => {
    const stageCfg = METROLOGY_STAGES[stageNum] || METROLOGY_STAGES[1];
    let iGalv = 0; // in microamperes (or mA for stage 3)
    let angle = 0;
    let balanced = false;

    if (stageNum === 1) {
      // Metre Bridge
      const l = Math.max(1.0, Math.min(99.0, slider));
      const rLeft = (l / 100.0) * stageCfg.wireResistance;
      const rRight = ((100.0 - l) / 100.0) * stageCfg.wireResistance;
      const vTop = stageCfg.batteryV * (stageCfg.rUnknown / (stageCfg.rKnown + stageCfg.rUnknown));
      const vJockey = stageCfg.batteryV * ((100.0 - l) / 100.0);
      const rTh =
        (stageCfg.rKnown * stageCfg.rUnknown) / (stageCfg.rKnown + stageCfg.rUnknown) +
        (rLeft * rRight) / stageCfg.wireResistance;
      // iGalv in microamps:
      iGalv = ((vTop - vJockey) / (rTh + stageCfg.galvanometerG)) * 1e6; // in uA
      // Clamp to visual range of galvanometer [-30 uA to +30 uA]
      const clampedCurrent = Math.max(-30.0, Math.min(30.0, iGalv));
      angle = (clampedCurrent / 30.0) * (Math.PI / 4.5); // max 40 deg
      balanced = Math.abs(slider - stageCfg.targetValue) <= stageCfg.tolerance;
    } else if (stageNum === 2) {
      // Potentiometer
      const l = Math.max(1.0, Math.min(99.0, slider));
      const k = (stageCfg.batteryV / (stageCfg.wireResistance + (stageCfg.rheostatR || 0))) * (stageCfg.wireResistance / 100.0);
      const wireDrop = k * l;
      const emf = stageCfg.testCellEmf || 2.25;
      const diffV = wireDrop - emf;
      const rSec = (stageCfg.testCellR || 1.5) + stageCfg.galvanometerG;
      iGalv = (diffV / rSec) * 1e6; // in uA
      const clampedCurrent = Math.max(-30.0, Math.min(30.0, iGalv));
      angle = (clampedCurrent / 30.0) * (Math.PI / 4.5);
      balanced = Math.abs(slider - stageCfg.targetValue) <= stageCfg.tolerance;
    } else {
      // Galvanometer conversion (Stage 3): Slider is Shunt in mΩ
      const shuntOhms = slider / 1000.0;
      const g = stageCfg.galvanometerG; // 49.95
      const totalI = stageCfg.lineCurrent || 5.0; // 5.0 A
      const igActual = totalI * (shuntOhms / (g + shuntOhms)); // in Amps
      const igMA = igActual * 1000.0; // in mA
      iGalv = igMA; // stored in mA
      // Full scale is 2.0 mA. At 2.0 mA, angle is +Math.PI / 4.5
      // If shunt is too high, needle deflects past full scale (pegged)
      const fraction = igMA / (stageCfg.fullScaleIg! * 1000.0);
      angle = Math.max(-0.05, Math.min(1.2, fraction)) * (Math.PI / 4.5);
      balanced = Math.abs(slider - stageCfg.targetValue) <= stageCfg.tolerance;
    }

    // 3D coordinate along X axis: length of wire is 6.0 units (from x = -3.0 to +3.0)
    // l = 0 -> x = -3.0, l = 100 -> x = +3.0
    const jockeyX = -3.0 + (Math.max(0, Math.min(100, slider)) / 100.0) * 6.0;

    return { iGalv, angle, balanced, jockeyX };
  };

  const initialTelem = computeTelemetry(initialStage, cfg.sliderDefault);

  return {
    currentStage: initialStage,
    sliderValue: cfg.sliderDefault,
    jockeyX: initialTelem.jockeyX,
    iGalvanometer: initialTelem.iGalv,
    needleAngle: initialTelem.angle,
    isBalanced: initialTelem.balanced,

    isMissionStarted: false,
    isSimulating: false,
    simTime: 0,
    isWon: false,
    isGameOver: false,
    failureReason: null,
    showResultModal: false,

    startMission: () => {
      set({ isMissionStarted: true });
    },

    setSliderValue: (val: number) => {
      const state = get();
      if (state.isSimulating) return;
      const stageCfg = METROLOGY_STAGES[state.currentStage] || METROLOGY_STAGES[1];
      const clamped = Math.max(stageCfg.sliderMin, Math.min(stageCfg.sliderMax, val));
      const telem = computeTelemetry(state.currentStage, clamped);
      set({
        sliderValue: clamped,
        jockeyX: telem.jockeyX,
        iGalvanometer: telem.iGalv,
        needleAngle: telem.angle,
        isBalanced: telem.balanced,
      });
    },

    runMeasurement: () => {
      const state = get();
      if (state.isSimulating) return;
      set({
        isSimulating: true,
        simTime: 0,
        showResultModal: false,
        isWon: false,
        isGameOver: false,
        failureReason: null,
      });
    },

    tickSimulation: (dt: number) => {
      const state = get();
      if (!state.isSimulating) return;

      const newTime = state.simTime + dt;
      // Complete measurement after 1.8 seconds of needle stabilization
      if (newTime >= 1.8) {
        const stageCfg = METROLOGY_STAGES[state.currentStage] || METROLOGY_STAGES[1];
        const error = Math.abs(state.sliderValue - stageCfg.targetValue);
        const won = error <= stageCfg.tolerance;

        let failMsg: string | null = null;
        if (!won) {
          if (state.currentStage === 1) {
            failMsg = `Bridge unbalance: Galvanometer detected ${state.iGalvanometer.toFixed(1)} µA. Null point required l = 40.0 cm.`;
          } else if (state.currentStage === 2) {
            failMsg = `EMF mismatch: Galvanometer detected ${state.iGalvanometer.toFixed(1)} µA. Potentiometer null length is 45.0 cm.`;
          } else {
            failMsg = `Current overload: Needle deflected past limits! Shunt must be exactly 20.0 mΩ for 5.0 A full-scale conversion.`;
          }
        }

        set({
          isSimulating: false,
          simTime: newTime,
          isWon: won,
          isGameOver: !won,
          failureReason: failMsg,
          showResultModal: true,
        });
      } else {
        set({ simTime: newTime });
      }
    },

    resetSimulation: () => {
      const state = get();
      const stageCfg = METROLOGY_STAGES[state.currentStage] || METROLOGY_STAGES[1];
      const telem = computeTelemetry(state.currentStage, state.sliderValue);
      set({
        isSimulating: false,
        simTime: 0,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
        iGalvanometer: telem.iGalv,
        needleAngle: telem.angle,
        isBalanced: telem.balanced,
      });
    },

    nextStage: () => {
      const state = get();
      const next = Math.min(3, state.currentStage + 1);
      const stageCfg = METROLOGY_STAGES[next] || METROLOGY_STAGES[1];
      const telem = computeTelemetry(next, stageCfg.sliderDefault);
      set({
        currentStage: next,
        sliderValue: stageCfg.sliderDefault,
        jockeyX: telem.jockeyX,
        iGalvanometer: telem.iGalv,
        needleAngle: telem.angle,
        isBalanced: telem.balanced,
        isSimulating: false,
        simTime: 0,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
      });
    },

    setStage: (stage: number) => {
      const stageCfg = METROLOGY_STAGES[stage] || METROLOGY_STAGES[1];
      const telem = computeTelemetry(stage, stageCfg.sliderDefault);
      set({
        currentStage: stage,
        sliderValue: stageCfg.sliderDefault,
        jockeyX: telem.jockeyX,
        iGalvanometer: telem.iGalv,
        needleAngle: telem.angle,
        isBalanced: telem.balanced,
        isSimulating: false,
        simTime: 0,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
      });
    },
  };
});
