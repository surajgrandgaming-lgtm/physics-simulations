import { create } from "zustand";

export interface DielectricStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  parameterName: string;
  parameterUnit: string;
  // Physical parameters
  plateLength: number; // L in cm (e.g. 20.0 cm)
  plateWidth: number; // b in cm (e.g. 20.0 cm)
  plateGap: number; // d in cm (e.g. 2.0 cm)
  kappa: number; // dielectric constant
  voltage: number; // in Volts (for stage 1 & 3)
  charge0: number; // in nC (for stage 2 isolated charge)
  isBatteryConnected: boolean;

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

export const DIELECTRIC_STAGES: Record<number, DielectricStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Resonant Capacitance Tuning",
    subtitle: "Tune insertion depth x to match target resonant capacitance C = 53.12 pF",
    parameterName: "Slab Insertion Depth (x)",
    parameterUnit: "cm",
    plateLength: 20.0,
    plateWidth: 20.0,
    plateGap: 2.0,
    kappa: 5.0,
    voltage: 100.0,
    charge0: 0.0,
    isBatteryConnected: true,
    sliderMin: 0.0,
    sliderMax: 20.0,
    sliderDefault: 2.0,
    stepSmall: 0.5,
    stepLarge: 2.0,
    // C0 = e0 * A / d = 8.854e-12 * 0.04 / 0.02 = 17.708 pF.
    // For C = 53.12 pF (3.0 * C0), 1 + 4*(x/20) = 3 => 4*(x/20) = 2 => x = 10.0 cm.
    targetValue: 10.0,
    tolerance: 0.6,
    targetDescription: "Find the insertion depth x to triple the capacitance to C = 53.12 pF (κ = 5.0)",
    mathDerivation: {
      title: "Stage 1: Partial Dielectric Insertion & Parallel Capacitance",
      concept:
        "Think of a capacitor as an electrical storage tank for charge. When a dielectric slab is partially inserted, the capacitor naturally divides into two side-by-side chambers sharing the same voltage:\n\n1. The Air Chamber: Length (L - x)\nFilled only with air (κ = 1). Its capacitance is C_air = ε₀·b·(L - x) / d.\n\n2. The Dielectric Chamber: Length x\nOccupied by the dielectric slab (κ = 5.0). Its capacitance is C_diel = κ·ε₀·b·x / d.\n\n3. Parallel Addition Rule\nBecause both chambers share the exact same top and bottom metal plates, their voltages are identical. In circuit physics, components sharing identical voltage are in PARALLEL. Therefore, their capacitances add together directly: C(x) = C_air + C_diel = C₀ · [1 + (κ - 1)·(x / L)].\n\n4. Molecular Polarization & Extra Charge\nInside the dielectric slab, the electric field polarizes billions of atomic dipoles. The surface bound charges oppose the external field, weakening it. Because the battery holds voltage constant at 100 V, it pumps extra free charge onto the plates until equilibrium is restored, effectively multiplying storage capacity. Setting x = 10.0 cm doubles the dielectric contribution, scaling capacitance from 17.71 pF up to exactly 53.12 pF (3× C₀).",
      conclusion:
        "Key Physics Takeaway: Slabs inserted side-by-side act as parallel capacitors whose values sum together: C(x) = C₀[1 + (κ - 1)(x/L)]. With κ = 5.0 and plate length L = 20.0 cm, inserting the slab halfway (x = 10.0 cm) triples the base air capacitance to exactly 53.12 pF.",
      formulas: [
        {
          label: "1. BASE AIR CAPACITANCE",
          formula: "C_0 = \\dfrac{\\varepsilon_0 A}{d} = \\dfrac{\\varepsilon_0 \\cdot (L \\cdot b)}{d}",
          explanation:
            "Capacitance before dielectric insertion depends purely on plate area (L × b) and gap distance d.",
        },
        {
          label: "2. PARALLEL CAPACITANCE SUM RULE",
          formula: "C(x) = \\dfrac{\\varepsilon_0 b}{d}(L - x) + \\dfrac{\\kappa \\varepsilon_0 b}{d}x = C_0 \\left[1 + (\\kappa - 1)\\dfrac{x}{L}\\right]",
          explanation:
            "Because both sections share the same voltage plates, total capacitance is the sum of the air and dielectric slices.",
        },
        {
          label: "3. SOLVED INSERTION DEPTH",
          formula: "x = L \\cdot \\left[\\dfrac{(C_{\\text{target}} / C_0) - 1}{\\kappa - 1}\\right]",
          explanation:
            "Direct working equation used to calculate the required mechanical slide distance x for any desired capacitance.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Compute Empty Air Capacitance (C₀)",
          math: "C_0 = \\dfrac{8.854 \\times 10^{-12} \\times (0.20 \\times 0.20)}{0.02} = \\dfrac{3.5416 \\times 10^{-13}}{0.02} = 17.71\\text{ pF}",
          explanation:
            "With plates 20 cm by 20 cm separated by a 2.0 cm air gap, the baseline capacitance is 17.71 picofarads.",
        },
        {
          step: 2,
          title: "Step 2: Determine Required Multiplier Ratio",
          math: "\\dfrac{C_{\\text{target}}}{C_0} = \\dfrac{53.12\\text{ pF}}{17.71\\text{ pF}} = 3.00",
          explanation:
            "The resonant circuit requires 53.12 pF, which is exactly 3.00 times the empty air capacitance.",
        },
        {
          step: 3,
          title: "Step 3: Formulate the Linear Insertion Ratio",
          math: "1 + (\\kappa - 1)\\dfrac{x}{L} = 1 + (5.0 - 1)\\dfrac{x}{20.0\\text{ cm}} = 1 + 4.0 \\times \\dfrac{x}{20.0} = 3.00",
          explanation:
            "Substitute κ = 5.0 and plate length L = 20.0 cm into the equivalent parallel capacitor formula.",
        },
        {
          step: 4,
          title: "Step 4: Solve for Exact Insertion Depth (x)",
          math: "4.0 \\times \\dfrac{x}{20.0} = 2.00 \\implies \\dfrac{x}{20.0} = 0.500 \\implies x = 10.0\\text{ cm}",
          explanation:
            "Solving the linear equation shows the slab must be inserted exactly 10.0 cm (halfway into the plates).",
        },
        {
          step: 5,
          title: "Step 5: Verify Plate Charge and Stored Energy",
          math: "Q = C \\cdot V = 53.12\\text{ pF} \\times 100\\text{ V} = 5.312\\text{ nC}, \\quad U = \\dfrac{1}{2} C V^2 = 0.266\\,\\mu\\text{J}",
          explanation:
            "With the battery maintaining 100 V, the capacitor stores 5.31 nC of charge and 0.266 microjoules of energy.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: Isolated Charge & Potential Drop",
    subtitle: "Battery disconnected (Q = const): slide slab (κ = 4.0) to drop voltage to V = 25.0 V",
    parameterName: "Slab Insertion Depth (x)",
    parameterUnit: "cm",
    plateLength: 20.0,
    plateWidth: 20.0,
    plateGap: 2.0,
    kappa: 4.0,
    voltage: 100.0, // initial V0
    charge0: 1.771, // Q0 = C0 * V0 = 17.71 pF * 100 V = 1.771 nC
    isBatteryConnected: false, // ISOLATED CHARGE
    sliderMin: 0.0,
    sliderMax: 20.0,
    sliderDefault: 4.0,
    stepSmall: 0.5,
    stepLarge: 2.0,
    // V(x) = Q0 / C(x) = V0 / [1 + (kappa - 1)*(x/L)]
    // For V = 25.0 V (100 / 4), 1 + 3*(x/20) = 4 => 3*(x/20) = 3 => x = 20.0 cm (fully inserted)
    targetValue: 20.0,
    tolerance: 0.7,
    targetDescription: "Find the insertion depth x so trapped charge Q₀ drops voltage from 100 V to 25.0 V",
    mathDerivation: {
      title: "Stage 2: Disconnected Battery & Potential Drop via Field Screening",
      concept:
        "What happens when you pre-charge a capacitor and then DISCONNECT the battery before sliding a dielectric inside?\n\n1. Trapped Charge Conservation (Q = constant)\nBecause the wires are disconnected, electrons cannot enter or escape the plates. The net free charge remains strictly conserved: Q = Q₀ = 1.771 nC.\n\n2. Microscopic Polarization & Bound Surface Charges\nAs the dielectric slab (κ = 4.0) slides inside, the electric field stretches atomic electron clouds toward the positive plate. These aligned dipoles produce bound surface charges on the glass faces (σ_b = σ·(1 - 1/κ)). The negative bound surface faces the positive plate and the positive bound surface faces the negative plate, setting up a counter-field E_ind that cancels part of the external field.\n\n3. Net Field Weakening & Potential Drop\nInside the slab, the net field weakens to E_net = E₀ / κ. Since voltage is the potential difference across the plates (V = E · d), weakening the internal field causes the terminal voltage to drop: V(x) = Q₀ / C(x) = V₀ / [1 + (κ - 1)·(x / L)].\n\n4. Mechanical Work & The Lost Energy\nStored electrostatic energy drops from 88.55 nJ to 22.14 nJ (U = Q² / 2C). That missing 66.41 nJ was converted into mechanical kinetic energy because the fringe field did positive work by pulling the glass slab into the plates. Fully inserting the slab (x = 20.0 cm) cuts terminal voltage by a factor of 4 (from 100 V to 25.0 V).",
      conclusion:
        "Key Physics Takeaway: With battery disconnected, charge Q is trapped and constant. Sliding the dielectric slab inside weakens the internal electric field (E = E₀/κ), which directly cuts the voltage across the plates (V = Q/C). Fully inserting the slab (x = 20.0 cm) cuts voltage by a factor of 4 (from 100 V to 25.0 V).",
      formulas: [
        {
          label: "1. CONSERVED FREE CHARGE",
          formula: "Q_0 = C_0 \\cdot V_0 = \\text{constant} \\quad (\\text{Battery Disconnected})",
          explanation:
            "No conducting pathway exists for electrons to escape, keeping net plate charge strictly fixed.",
        },
        {
          label: "2. VOLTAGE ATTENUATION FORMULA",
          formula: "V(x) = \\dfrac{Q_0}{C(x)} = \\dfrac{V_0}{1 + (\\kappa - 1)\\dfrac{x}{L}}",
          explanation:
            "Because capacitance C(x) grows linearly as the slab enters, the terminal voltage drops inversely.",
        },
        {
          label: "3. DIELECTRIC BULK ELECTRIC FIELD",
          formula: "E_{\\text{bulk}} = \\dfrac{V(x)}{d} = \\dfrac{E_0}{\\kappa} \\quad (\\text{Fully Inserted})",
          explanation:
            "Bound polarization charges directly screen and weaken the electric field inside the dielectric bulk.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Calculate Trapped Free Charge (Q₀)",
          math: "Q_0 = C_0 \\times V_0 = 17.71\\text{ pF} \\times 100\\text{ V} = 1.771\\text{ nC}",
          explanation:
            "Before disconnecting the battery, 1.771 nanocoulombs of charge was deposited onto the metal plates.",
        },
        {
          step: 2,
          title: "Step 2: Determine Required Voltage Reduction Factor",
          math: "\\dfrac{V_0}{V_{\\text{target}}} = \\dfrac{100.0\\text{ V}}{25.0\\text{ V}} = 4.00",
          explanation:
            "Our precision electrometer requires terminal voltage to drop to 25.0 V (a 4-fold reduction).",
        },
        {
          step: 3,
          title: "Step 3: Relate Voltage Reduction to Slab Insertion",
          math: "1 + (\\kappa - 1)\\dfrac{x}{L} = 1 + (4.0 - 1)\\dfrac{x}{20.0} = 1 + 3.0 \\times \\dfrac{x}{20.0} = 4.00",
          explanation:
            "Substitute κ = 4.0 and plate length L = 20.0 cm into the potential drop equation.",
        },
        {
          step: 4,
          title: "Step 4: Solve for Target Insertion Depth (x)",
          math: "3.0 \\times \\dfrac{x}{20.0} = 3.00 \\implies \\dfrac{x}{20.0} = 1.00 \\implies x = 20.0\\text{ cm}",
          explanation:
            "Solving the equation gives x = 20.0 cm, meaning the slab must be 100% fully inserted between the plates.",
        },
        {
          step: 5,
          title: "Step 5: Verify Mechanical Energy Transformation",
          math: "\\Delta U = \\dfrac{1}{2} C_0 V_0^2 - \\dfrac{1}{2} C_{\\text{final}} V_{\\text{final}}^2 = 88.55\\text{ nJ} - 22.14\\text{ nJ} = 66.41\\text{ nJ}",
          explanation:
            "The 66.41 nJ drop in stored electrostatic energy equals the mechanical work done by the field pulling the slab inward.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: Electrostatic Fringe Suction Force",
    subtitle: "Battery connected: dial voltage V to balance mechanical spring tension F = 3.54 μN",
    parameterName: "Applied Voltage (V)",
    parameterUnit: "V",
    plateLength: 20.0,
    plateWidth: 20.0,
    plateGap: 1.0, // d = 1.0 cm (0.01 m)
    kappa: 5.0,
    voltage: 100.0,
    charge0: 0.0,
    isBatteryConnected: true,
    sliderMin: 0.0,
    sliderMax: 200.0,
    sliderDefault: 20.0,
    stepSmall: 2.0,
    stepLarge: 10.0,
    // F = 0.5 * V^2 * dC/dx
    // dC/dx = e0 * b * (kappa - 1) / d
    // e0 = 8.854e-12, b = 0.20 m, kappa = 5.0 (kappa-1 = 4.0), d = 0.01 m
    // dC/dx = 8.854e-12 * 0.20 * 4.0 / 0.01 = 7.0832e-10 F/m
    // F = 0.5 * V^2 * 7.0832e-10.
    // For V = 100.0 V: F = 0.5 * 10000 * 7.0832e-10 = 3.5416e-6 N = 3.54 μN.
    targetValue: 100.0,
    tolerance: 4.0,
    targetDescription: "Calculate and dial the voltage V to balance a spring pull force of F = 3.54 μN",
    mathDerivation: {
      title: "Stage 3: Fringe Electric Field & Dielectric Suction Force",
      concept:
        "Why does an electrically neutral glass slab experience an inward pulling force when placed near the mouth of a charged capacitor?\n\n1. The Fringe Field Gradient\nNear the plate center, field lines run straight down. But at the open lips, field lines curve and bulge outward into empty space (fringe fields). The field is strongest right at the gap and weakens further out.\n\n2. Inward Force on Atomic Dipoles\nIn this curved fringe field, each polarized atom in the glass has its positive end pulled toward the negative plate and its negative end pulled toward the positive plate. Because the field lines bow inward, these forces do not point straight vertically—they have a NET HORIZONTAL COMPONENT directed straight INTO the gap!\n\n3. Virtual Work & Constant Voltage\nWith constant battery voltage V, any small inward displacement dx increases capacitance by dC. The battery supplies energy V²·dC, producing an inward suction force: F_pull = (1/2) · V² · (dC / dx).\n\n4. Constant Force Independent of Position\nBecause capacitance grows linearly with depth C(x), the gradient dC/dx = ε₀·b·(κ - 1)/d is constant! The suction force does not depend on how far the slab is already inserted. Dialing V = 100.0 V generates exactly 3.54 μN, achieving perfect equilibrium with our laboratory spring.",
      conclusion:
        "Key Physics Takeaway: The electrostatic suction force is F_pull = (1/2)·V²·(dC/dx) = ε₀·b·V²·(κ - 1) / (2d). It scales with voltage squared (V²) and (κ - 1), but is completely independent of insertion depth x. Setting V = 100.0 V yields exactly F = 3.54 μN, achieving static force equilibrium.",
      formulas: [
        {
          label: "1. VIRTUAL WORK FORCE EQUATION",
          formula: "F_{\\text{pull}} = \\dfrac{1}{2} V^2 \\dfrac{dC}{dx} \\quad (V = \\text{constant})",
          explanation:
            "At constant voltage, the battery does work as capacitance changes, pulling the dielectric inward.",
        },
        {
          label: "2. CAPACITANCE GRADIENT (dC/dx)",
          formula: "\\dfrac{dC}{dx} = \\dfrac{\\varepsilon_0 b (\\kappa - 1)}{d}",
          explanation:
            "Rate of capacitance increase per meter of slab insertion. Constant along the entire plate length.",
        },
        {
          label: "3. ELECTROSTATIC SUCTION FORCE",
          formula: "F_{\\text{pull}} = \\dfrac{\\varepsilon_0 b V^2 (\\kappa - 1)}{2d}",
          explanation:
            "Exact formula for the inward suction force pulling the dielectric into the capacitor gap.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Identify Physical Dimensions & Constants",
          math: "b = 0.20\\text{ m}, \\quad d = 0.01\\text{ m}, \\quad \\kappa = 5.0, \\quad \\varepsilon_0 = 8.854 \\times 10^{-12}\\text{ F/m}",
          explanation:
            "Plate width is 20 cm, the gap is narrowed to 1.0 cm, and dielectric constant κ = 5.0.",
        },
        {
          step: 2,
          title: "Step 2: Calculate Capacitance Gradient (dC/dx)",
          math: "\\dfrac{dC}{dx} = \\dfrac{8.854 \\times 10^{-12} \\times 0.20 \\times (5.0 - 1)}{0.01} = 7.0832 \\times 10^{-10}\\text{ F/m}",
          explanation:
            "Each meter of slab insertion adds 708.32 picofarads of capacitance to the system.",
        },
        {
          step: 3,
          title: "Step 3: Relate Target Spring Force to Applied Voltage",
          math: "F_{\\text{target}} = \\dfrac{1}{2} V^2 \\left(7.0832 \\times 10^{-10}\\right) = 3.5416 \\times 10^{-6}\\text{ N}",
          explanation:
            "Equating the inward suction force to our target spring counter-force of 3.54 μN.",
        },
        {
          step: 4,
          title: "Step 4: Solve for the Required Applied Voltage (V)",
          math: "V^2 = \\dfrac{2 \\times 3.5416 \\times 10^{-6}}{7.0832 \\times 10^{-10}} = 10,000\\text{ V}^2 \\implies V = \\sqrt{10,000} = 100.0\\text{ V}",
          explanation:
            "Dividing and taking the square root gives an exact integer potential of V = 100.0 Volts.",
        },
        {
          step: 5,
          title: "Step 5: Verify Force Balance and Static Equilibrium",
          math: "F_{\\text{pull}} = \\dfrac{8.854 \\times 10^{-12} \\times 0.20 \\times (100.0)^2 \\times 4.0}{2 \\times 0.01} = 3.54\\,\\mu\\text{N}",
          explanation:
            "The inward electrostatic pull precisely cancels the outward mechanical spring tension: F_net = 0.",
        },
      ],
    },
  },
};

export interface DielectricSliderStore {
  currentStage: number;
  sliderValue: number;
  isSimulating: boolean;
  isWon: boolean;
  isGameOver: boolean;
  failureReason: string | null;
  showResultModal: boolean;
  isMissionStarted: boolean;
  missionStartedAt: number | null;
  analysisProgress: number;

  // Computed state
  computedCapacitance: number; // pF
  computedVoltage: number; // V
  computedCharge: number; // nC
  computedEnergy: number; // uJ
  computedForce: number; // uN

  setSliderValue: (val: number) => void;
  startSimulation: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  startMission: () => void;
  tickSimulation: (dt: number) => void;
}

const EPSILON_0 = 8.854187817e-12; // F/m

function computePhysicalState(stageConfig: DielectricStageConfig, sliderVal: number) {
  const L = stageConfig.plateLength / 100; // m
  const b = stageConfig.plateWidth / 100; // m
  const d = stageConfig.plateGap / 100; // m
  const kappa = stageConfig.kappa;

  // Stage 1 & 2: slider is x in cm.
  // Stage 3: slider is V in Volts (with fixed x = 10 cm).
  let x = 0.10; // default 10 cm
  let V = stageConfig.voltage;

  if (stageConfig.stage === 1 || stageConfig.stage === 2) {
    x = Math.max(0, Math.min(L, sliderVal / 100));
  } else {
    V = Math.max(0, sliderVal);
  }

  // Base capacitance: C0 = eps0 * L * b / d
  const C0 = (EPSILON_0 * L * b) / d; // Farads
  // C(x) = C0 * [1 + (kappa - 1) * (x / L)]
  const C_farads = C0 * (1 + (kappa - 1) * (x / L));
  const C_pF = C_farads * 1e12;

  let charge_nC = 0;
  let volt = 0;
  let energy_uJ = 0;

  if (stageConfig.isBatteryConnected) {
    volt = V;
    const Q_coulombs = C_farads * volt;
    charge_nC = Q_coulombs * 1e9;
    const U_joules = 0.5 * C_farads * volt * volt;
    energy_uJ = U_joules * 1e6;
  } else {
    // Battery disconnected: charge is constant Q0
    charge_nC = stageConfig.charge0;
    const Q_coulombs = charge_nC * 1e-9;
    volt = Q_coulombs / C_farads;
    const U_joules = (0.5 * Q_coulombs * Q_coulombs) / C_farads;
    energy_uJ = U_joules * 1e6;
  }

  // Force: F = 0.5 * V^2 * dC/dx = 0.5 * V^2 * (eps0 * b * (kappa - 1) / d)
  const dC_dx = (EPSILON_0 * b * (kappa - 1)) / d;
  const F_newtons = 0.5 * volt * volt * dC_dx;
  const F_uN = F_newtons * 1e6;

  return {
    computedCapacitance: C_pF,
    computedVoltage: volt,
    computedCharge: charge_nC,
    computedEnergy: energy_uJ,
    computedForce: F_uN,
  };
}

export const useDielectricSliderStore = create<DielectricSliderStore>((set, get) => {
  const initialStage = DIELECTRIC_STAGES[1];
  const initialComputations = computePhysicalState(initialStage, initialStage.sliderDefault);

  return {
    currentStage: 1,
    sliderValue: initialStage.sliderDefault,
    isSimulating: false,
    isWon: false,
    isGameOver: false,
    failureReason: null,
    showResultModal: false,
    isMissionStarted: false,
    missionStartedAt: null,
    analysisProgress: 0.0,

    ...initialComputations,

    setSliderValue: (val: number) => {
      const { currentStage, isSimulating } = get();
      if (isSimulating) return;
      const stageConfig = DIELECTRIC_STAGES[currentStage] || DIELECTRIC_STAGES[1];
      const clamped = Math.max(
        stageConfig.sliderMin,
        Math.min(stageConfig.sliderMax, val)
      );
      const computed = computePhysicalState(stageConfig, clamped);
      set({ sliderValue: clamped, ...computed });
    },

    startMission: () => {
      set({
        isMissionStarted: true,
        missionStartedAt: Date.now(),
      });
    },

    startSimulation: () => {
      const { isSimulating, isWon } = get();
      if (isSimulating || isWon) return;

      set({
        isSimulating: true,
        analysisProgress: 0.0,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
      });
    },

    tickSimulation: (dt: number) => {
      const { isSimulating, analysisProgress, sliderValue, currentStage } = get();
      if (!isSimulating) return;

      const newProgress = Math.min(1.0, analysisProgress + dt * 1.5);
      set({ analysisProgress: newProgress });

      if (newProgress >= 1.0) {
        const stageConfig = DIELECTRIC_STAGES[currentStage] || DIELECTRIC_STAGES[1];
        const error = Math.abs(sliderValue - stageConfig.targetValue);
        const won = error <= stageConfig.tolerance;

        let failMsg: string | null = null;
        if (!won) {
          if (currentStage === 1) {
            failMsg = `Current insertion x = ${sliderValue.toFixed(1)} cm gives C = ${get().computedCapacitance.toFixed(2)} pF (Target: 53.12 pF at x = 10.0 cm).`;
          } else if (currentStage === 2) {
            failMsg = `Current insertion x = ${sliderValue.toFixed(1)} cm gives V = ${get().computedVoltage.toFixed(1)} V (Target: 25.0 V at full insertion x = 20.0 cm).`;
          } else {
            failMsg = `Current voltage V = ${sliderValue.toFixed(1)} V produces F = ${get().computedForce.toFixed(2)} μN (Target: 3.54 μN at V = 100.0 V).`;
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
      const stageConfig = DIELECTRIC_STAGES[currentStage] || DIELECTRIC_STAGES[1];
      const computed = computePhysicalState(stageConfig, stageConfig.sliderDefault);
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
      if (DIELECTRIC_STAGES[next]) {
        const nextConfig = DIELECTRIC_STAGES[next];
        const computed = computePhysicalState(nextConfig, nextConfig.sliderDefault);
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
        // Reset to stage 1 if completed all
        const firstConfig = DIELECTRIC_STAGES[1];
        const computed = computePhysicalState(firstConfig, firstConfig.sliderDefault);
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
