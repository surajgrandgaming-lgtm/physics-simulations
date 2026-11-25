import { create } from "zustand";

export interface FormulaItem {
  label: string;
  formula: string;
  explanation: string;
}

export interface DerivationStep {
  step: number;
  title: string;
  math: string;
  explanation: string;
}

export interface MathDerivation {
  title: string;
  concept: string;
  formulas: FormulaItem[];
  steps: DerivationStep[];
  conclusion: string;
}

export interface NuclearStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  parameterName: string;
  parameterUnit: string;
  mode: "half-life" | "discrimination" | "shielding";
  targetValue: number;
  tolerance: number;
  sliderMin: number;
  sliderMax: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;
  targetDisplay: string;
  targetDescription: string;
  // Stage-specific physics quantities
  initialActivityBq?: number;
  elapsedTimeSec?: number;
  finalActivityBq?: number;
  totalCountsCps?: number;
  paperCountsCps?: number;
  aluminumCountsCps?: number;
  unshieldedDoseMsv?: number;
  safeDoseMsv?: number;
  leadHvlMm?: number;
  mathDerivation: MathDerivation;
}

export const NUCLEAR_STAGES: Record<number, NuclearStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Radioactive Decay Kinetics & Half-Life (T₁/₂)",
    subtitle:
      "A sample of radioisotope Iodine-131 produces an initial activity of A₀ = 1600 Bq. After elapsed time t = 24.0 s, the detector measures A = 200 Bq. Calculate the half-life.",
    parameterName: "Half-Life (T₁/₂)",
    parameterUnit: "s",
    mode: "half-life",
    targetValue: 8.00,
    tolerance: 0.15,
    sliderMin: 4.00,
    sliderMax: 16.00,
    sliderDefault: 6.00,
    stepSmall: 0.01,
    stepLarge: 0.10,
    targetDisplay: "Half-Life (T₁/₂)",
    targetDescription: "Find the half-life of the decaying radioisotope sample.",
    initialActivityBq: 1600,
    elapsedTimeSec: 24.0,
    finalActivityBq: 200,
    mathDerivation: {
      title: "Radioactive Decay Law & Half-Life Kinetics",
      concept:
        "1. The Stochastic Nature of Nuclear Decay\n" +
        "Radioactive decay is a purely spontaneous, quantum statistical process. Individual nuclei do not 'age'—a nucleus that has existed for a billion years has the exact same probability of decaying in the next second as one created a microsecond ago!\n\n" +
        "2. The First-Order Decay Differential Equation\n" +
        "Because each nucleus has a constant decay probability λ (decay constant per unit time), the rate of disintegration (Activity A) is directly proportional to the number of active nuclei N present:\n" +
        "A(t) = -dN/dt = λ N(t).\n" +
        "Integrating from t = 0 (where N = N₀) gives the universal exponential decay law:\n" +
        "N(t) = N₀ · e^(-λ t)   and   A(t) = A₀ · e^(-λ t).\n\n" +
        "3. Defining the Half-Life (T₁/₂)\n" +
        "The half-life T₁/₂ is the time required for exactly half of the radioactive nuclei to disintegrate:\n" +
        "N(T₁/₂) = N₀ / 2 = N₀ · e^(-λ T₁/₂)  ⟹  e^(λ T₁/₂) = 2  ⟹  λ · T₁/₂ = ln(2) ≈ 0.69315.\n" +
        "Therefore, after n elapsed half-lives (where n = t / T₁/₂), the remaining activity is simply:\n" +
        "A(t) = A₀ · (1/2)^n = A₀ · (1/2)^(t / T₁/₂).\n\n" +
        "4. Analyzing the Challenge Data\n" +
        "• Initial Activity: A₀ = 1600 Bq\n" +
        "• Final Activity: A(24 s) = 200 Bq\n" +
        "• Ratio: A(t) / A₀ = 200 / 1600 = 1/8 = (1/2)³.\n" +
        "This proves that exactly 3 half-lives have elapsed in 24.0 seconds:\n" +
        "3 · T₁/₂ = 24.0 s  ⟹  T₁/₂ = 8.00 s!",
      conclusion:
        "Key Takeaways & Exam Tips:\n" +
        "• Master Formula: A(t) = A₀ · (1/2)^(t / T₁/₂).\n" +
        "• Decay Constant: λ = ln(2) / T₁/₂ ≈ 0.693 / T₁/₂ = 0.0866 s⁻¹.\n" +
        "• Mean Lifetime: τ = 1 / λ = 1.443 · T₁/₂ ≈ 11.54 s.\n" +
        "• Common Exam Trap: Forgetting that Activity A(t) and active nuclei count N(t) decay with the EXACT SAME half-life and rate!",
      formulas: [
        {
          label: "1. EXPONENTIAL DECAY LAW",
          formula: "N(t) = N_0 e^{-\\lambda t} = N_0 \\left(\\dfrac{1}{2}\\right)^{t / T_{1/2}}",
          explanation: "Calculates the number of undecayed radioactive nuclei remaining after time t.",
        },
        {
          label: "2. ACTIVITY & DISINTEGRATION RATE",
          formula: "A(t) = -\\dfrac{dN}{dt} = \\lambda N(t) = A_0 \\left(\\dfrac{1}{2}\\right)^{t / T_{1/2}}",
          explanation: "Activity measures disintegrations per second in Becquerels (1 Bq = 1 decay/s; 1 Ci = 3.7 × 10¹⁰ Bq).",
        },
        {
          label: "3. DECAY CONSTANT RELATION",
          formula: "\\lambda = \\dfrac{\\ln 2}{T_{1/2}} \\approx \\dfrac{0.69315}{T_{1/2}}",
          explanation: "Inversely relates the half-life to the intrinsic quantum decay probability λ.",
        },
        {
          label: "4. MEAN LIFETIME",
          formula: "\\tau = \\dfrac{1}{\\lambda} = \\dfrac{T_{1/2}}{\\ln 2} \\approx 1.4427 \\cdot T_{1/2}",
          explanation: "The average time an unstable nucleus survives before decaying.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Initial and Measured Activities",
          math: "A_0 = 1600.0\\text{ Bq}, \\quad A(t) = 200.0\\text{ Bq}, \\quad t = 24.0\\text{ s}",
          explanation: "The Iodine-131 sample begins at 1600 disintegrations per second and drops to 200 Bq in 24 seconds.",
        },
        {
          step: 2,
          title: "Compute the Attenuation Ratio",
          math: "\\dfrac{A(t)}{A_0} = \\dfrac{200.0}{1600.0} = \\dfrac{1}{8}",
          explanation: "The remaining fraction is exactly 1/8th of the original starting activity.",
        },
        {
          step: 3,
          title: "Express as Powers of One-Half (n Half-Lives)",
          math: "\\dfrac{1}{8} = \\left(\\dfrac{1}{2}\\right)^3 \\implies n = 3\\text{ half-lives}",
          explanation: "Because (1/2)³ = 1/8, exactly 3 consecutive half-lives must have transpired.",
        },
        {
          step: 4,
          title: "Calculate the Single Half-Life (T₁/₂)",
          math: "n = \\dfrac{t}{T_{1/2}} \\implies 3 = \\dfrac{24.0\\text{ s}}{T_{1/2}} \\implies T_{1/2} = \\dfrac{24.0}{3} = \\mathbf{8.00\\text{ s}}",
          explanation: "Dividing elapsed time by 3 half-lives yields an exact half-life of 8.00 seconds.",
        },
        {
          step: 5,
          title: "Verify the Decay Constant (λ)",
          math: "\\lambda = \\dfrac{\\ln 2}{8.00\\text{ s}} = \\dfrac{0.69315}{8.00} = \\mathbf{0.08664\\text{ s}^{-1}}",
          explanation: "Each undecayed nucleus has an 8.66% chance of decaying during every passing second.",
        },
      ],
    },
  },

  2: {
    stage: 2,
    title: "Stage 2: Radiation Discrimination (α, β, and γ Rays)",
    subtitle:
      "A mixed radiation beam produces I_total = 2400 CPS. Paper drops it to 1500 CPS; Aluminum drops it to 300 CPS. Calculate the percentage of penetrating Gamma (γ) radiation.",
    parameterName: "Gamma Fraction (% γ)",
    parameterUnit: "%",
    mode: "discrimination",
    targetValue: 12.50,
    tolerance: 0.50,
    sliderMin: 5.00,
    sliderMax: 30.00,
    sliderDefault: 8.00,
    stepSmall: 0.10,
    stepLarge: 1.00,
    targetDisplay: "Gamma Fraction (% γ)",
    targetDescription: "Find the percentage of penetrating Gamma radiation in the mixed beam.",
    totalCountsCps: 2400,
    paperCountsCps: 1500,
    aluminumCountsCps: 300,
    mathDerivation: {
      title: "Differential Penetration & Identification of Nuclear Radiation",
      concept:
        "1. Three Fundamental Modes of Nuclear Radiation\n" +
        "When an unstable nucleus decays toward stability, it can shed mass and charge through three distinct emissions:\n" +
        "• Alpha (α) Particles: Doubly ionized Helium nuclei (⁴He²⁺). Heavy (mass ≈ 4 u), charge +2e. Because they are massive and strongly charged, they ionize air molecules intensely and lose all kinetic energy within 3 to 5 cm of air. A single thin sheet of paper (0.1 mm) or dead skin completely stops α particles!\n" +
        "• Beta (β⁻/β⁺) Particles: High-speed relativistic electrons (e⁻) or positrons (e⁺). Low mass (1/1836 u), charge ±e. They penetrate paper easily, but are completely stopped by a few millimeters of aluminum (3 mm).\n" +
        "• Gamma (γ) Photons: Zero-mass, zero-charge electromagnetic photons with frequencies f > 10¹⁹ Hz. Because they have no electrical charge, they do not suffer Coulomb friction and can penetrate tens of centimeters of dense matter!\n\n" +
        "2. Step-by-Step Differential Absorption Technique\n" +
        "By sequentially inserting absorbers, we determine each component:\n" +
        "• Total Unfiltered Beam: I_total = I_α + I_β + I_γ = 2400 CPS.\n" +
        "• After 0.1 mm Paper: Alpha is completely blocked (I_α = 0). The remaining beam is I_β + I_γ = 1500 CPS.\n" +
        "  ⟹ Alpha Component: I_α = 2400 - 1500 = 900 CPS (37.5%).\n" +
        "• After 3 mm Aluminum: Beta is completely blocked (I_β = 0). The only radiation that gets through aluminum is pure Gamma!\n" +
        "  ⟹ Gamma Component: I_γ = 300 CPS (12.5%).\n" +
        "  ⟹ Beta Component: I_β = 1500 - 300 = 1200 CPS (50.0%).\n\n" +
        "3. Calculation of Gamma Percentage\n" +
        "% γ = (I_γ / I_total) · 100% = (300 / 2400) · 100% = 12.50%!",
      conclusion:
        "Key Takeaways & Exam Tips:\n" +
        "• Ionizing Power Order: α (most ionizing, ~10,000 ion pairs/mm) > β (~100 pairs/mm) > γ (least ionizing, ~1 pair/mm).\n" +
        "• Penetrating Power Order: γ (most penetrating) > β > α (least penetrating).\n" +
        "• Stopping Absorbers: Paper stops α; 3 mm Aluminum stops β; Thick Lead attenuates γ.\n" +
        "• Common Exam Trap: Thinking that Gamma can be '100% stopped' by a thin shield! Gamma attenuation is purely exponential (I = I₀ e^(-μx)), so it theoretically never reaches absolute zero—only diminishes asymptotically.",
      formulas: [
        {
          label: "1. TOTAL RADIATION BEAM SUPERPOSITION",
          formula: "I_{\\text{total}} = I_\\alpha + I_\\beta + I_\\gamma",
          explanation: "Total detected count rate equals the linear sum of all individual ionizing radiation components.",
        },
        {
          label: "2. ALPHA COMPONENT EXTRACTION",
          formula: "I_\\alpha = I_{\\text{total}} - I_{\\text{paper}}",
          explanation: "Paper card absorbs all alpha particles while transmitting beta and gamma with negligible attenuation.",
        },
        {
          label: "3. BETA COMPONENT EXTRACTION",
          formula: "I_\\beta = I_{\\text{paper}} - I_{\\text{aluminum}}",
          explanation: "Aluminum plate completely blocks all beta electrons, leaving only penetrating gamma rays.",
        },
        {
          label: "4. GAMMA PERCENTAGE FRACTION",
          formula: "\\%\\gamma = \\dfrac{I_\\gamma}{I_{\\text{total}}} \\times 100\\%",
          explanation: "Calculates the proportional fraction of gamma radiation in the source.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Record Unshielded Benchmark Intensity",
          math: "I_{\\text{total}} = 2400.0\\text{ CPS}",
          explanation: "With no shielding between source and GM tube, the raw beam counts at 2400 pulses per second.",
        },
        {
          step: 2,
          title: "Insert Paper Filter (Isolate Alpha)",
          math: "I_{\\text{paper}} = I_\\beta + I_\\gamma = 1500.0\\text{ CPS} \\implies I_\\alpha = 2400 - 1500 = 900.0\\text{ CPS}",
          explanation: "Paper stops all Alpha particles; the 900 CPS drop represents the entire Alpha component.",
        },
        {
          step: 3,
          title: "Insert Aluminum Plate (Isolate Beta)",
          math: "I_{\\text{aluminum}} = I_\\gamma = 300.0\\text{ CPS} \\implies I_\\beta = 1500 - 300 = 1200.0\\text{ CPS}",
          explanation: "Aluminum stops all Beta electrons; the remaining 300.0 CPS is pure Gamma radiation.",
        },
        {
          step: 4,
          title: "Calculate the Percentage of Gamma Radiation",
          math: "\\%\\gamma = \\dfrac{I_\\gamma}{I_{\\text{total}}} \\times 100\\% = \\dfrac{300.0}{2400.0} \\times 100\\% = \\mathbf{12.50\\%}",
          explanation: "Dividing the 300 CPS gamma counts by 2400 CPS total yields exactly 12.50%.",
        },
        {
          step: 5,
          title: "Summary of Beam Composition",
          math: "\\%\\alpha = 37.50\\%, \\quad \\%\\beta = 50.00\\%, \\quad \\%\\gamma = 12.50\\%",
          explanation: "The three components sum perfectly to 100.0% of the original 2400 CPS source.",
        },
      ],
    },
  },

  3: {
    stage: 3,
    title: "Stage 3: Exponential Lead Shielding & Half-Value Layer (HVL)",
    subtitle:
      "A Cobalt-60 source produces a hazardous gamma dose rate of I₀ = 128.0 mSv/h. The safe threshold is I ≤ 2.0 mSv/h. Given HVL_lead = 11.0 mm, calculate the minimum lead shield thickness.",
    parameterName: "Lead Shield Thickness (x)",
    parameterUnit: "mm",
    mode: "shielding",
    targetValue: 66.00,
    tolerance: 0.80,
    sliderMin: 20.00,
    sliderMax: 100.00,
    sliderDefault: 40.00,
    stepSmall: 0.10,
    stepLarge: 1.00,
    targetDisplay: "Lead Shield (x)",
    targetDescription: "Find the lead thickness required to reduce radiation to safe regulatory levels.",
    unshieldedDoseMsv: 128.0,
    safeDoseMsv: 2.0,
    leadHvlMm: 11.0,
    mathDerivation: {
      title: "Exponential Attenuation of Gamma Radiation & Half-Value Layer (HVL)",
      concept:
        "1. The Beer-Lambert Law for Ionizing Radiation\n" +
        "Unlike charged particles (α, β) which have a definite stopping range, uncharged photons (γ and X-rays) interact through three probabilistic collision mechanisms:\n" +
        "• Photoelectric Absorption (dominates at low energies < 0.5 MeV)\n" +
        "• Compton Scattering (dominates at medium energies ~ 1 MeV)\n" +
        "• Electron-Positron Pair Production (dominates at high energies > 1.022 MeV).\n\n" +
        "Because each thin slice dx of an absorbing material has an equal probability μ of removing a photon from the beam:\n" +
        "-dI / I = μ · dx  ⟹  Integrating yields:  I(x) = I₀ · e^(-μ x),\n" +
        "where μ is the linear attenuation coefficient of the material (in cm⁻¹ or mm⁻¹).\n\n" +
        "2. The Half-Value Layer (HVL)\n" +
        "The Half-Value Layer (HVL) is the thickness of absorber required to cut the incident radiation intensity by exactly 50%:\n" +
        "I(HVL) = I₀ / 2 = I₀ · e^(-μ · HVL)  ⟹  μ · HVL = ln(2) ≈ 0.69315.\n" +
        "This gives a very intuitive shortcut: after n half-value layers (where n = x / HVL), the transmitted intensity is:\n" +
        "I(x) = I₀ · (1/2)^n = I₀ · (1/2)^(x / HVL).\n\n" +
        "3. Solving the Radiation Protection Problem\n" +
        "• Initial Dose Rate: I₀ = 128.0 mSv/h (Extreme Radiation Hazard)\n" +
        "• Safe Regulatory Limit: I_safe = 2.0 mSv/h\n" +
        "• Required Attenuation Ratio: I_safe / I₀ = 2.0 / 128.0 = 1/64.\n" +
        "Since 1/64 = (1/2)⁶, we require exactly n = 6 Half-Value Layers!\n" +
        "Given HVL_lead = 11.0 mm for Cobalt-60 (1.25 MeV gamma rays):\n" +
        "x_min = 6 · HVL = 6 · 11.0 mm = 66.00 mm (6.60 cm of solid Lead)!",
      conclusion:
        "Key Takeaways & Exam Tips:\n" +
        "• Half-Value Layer Relation: HVL = ln(2) / μ ≈ 0.693 / μ.\n" +
        "• Number of HVLs: n = log₂(I₀ / I_final) = ln(I₀ / I_final) / ln(2).\n" +
        "• Total Thickness: x = n · HVL.\n" +
        "• Tenth-Value Layer (TVL): The thickness that reduces intensity to 10% (1/10). Relation: TVL = 3.32 · HVL.\n" +
        "• Common Exam Trap: Confusing Linear Attenuation Coefficient μ (unit: cm⁻¹) with Mass Attenuation Coefficient μ/ρ (unit: cm²/g)! The mass attenuation coefficient is independent of the physical density state of the absorber.",
      formulas: [
        {
          label: "1. EXPONENTIAL ATTENUATION (BEER-LAMBERT)",
          formula: "I(x) = I_0 e^{-\\mu x} = I_0 \\left(\\dfrac{1}{2}\\right)^{x / \\text{HVL}}",
          explanation: "Calculates the transmitted radiation intensity through absorber thickness x.",
        },
        {
          label: "2. HALF-VALUE LAYER (HVL)",
          formula: "\\text{HVL} = \\dfrac{\\ln 2}{\\mu} \\approx \\dfrac{0.69315}{\\mu}",
          explanation: "Thickness of shielding required to reduce the gamma radiation field by exactly half.",
        },
        {
          label: "3. ATTENUATION FACTOR",
          formula: "\\dfrac{I(x)}{I_0} = \\left(\\dfrac{1}{2}\\right)^n \\implies n = \\dfrac{x}{\\text{HVL}}",
          explanation: "Number of half-value layers required to achieve a designated reduction factor.",
        },
        {
          label: "4. TENTH-VALUE LAYER (TVL)",
          formula: "\\text{TVL} = \\dfrac{\\ln 10}{\\mu} \\approx 3.3219 \\cdot \\text{HVL}",
          explanation: "Thickness required to attenuate radiation by a factor of 10 (down to 10%).",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Incident and Safe Threshold Dose Rates",
          math: "I_0 = 128.0\\text{ mSv/h}, \\quad I_{\\text{safe}} = 2.0\\text{ mSv/h}, \\quad \\text{HVL} = 11.0\\text{ mm}",
          explanation: "An unshielded dose of 128 mSv/h must be reduced to 2 mSv/h using lead with HVL = 11 mm.",
        },
        {
          step: 2,
          title: "Calculate the Required Attenuation Factor",
          math: "\\dfrac{I_{\\text{safe}}}{I_0} = \\dfrac{2.0}{128.0} = \\dfrac{1}{64}",
          explanation: "The lead shield must reduce the radiation intensity by a factor of exactly 64.",
        },
        {
          step: 3,
          title: "Determine the Number of Half-Value Layers (n)",
          math: "\\dfrac{1}{64} = \\left(\\dfrac{1}{2}\\right)^6 \\implies n = 6\\text{ HVLs}",
          explanation: "Because 2⁶ = 64, exactly 6 half-value layers are required to safely shield the source.",
        },
        {
          step: 4,
          title: "Calculate the Total Lead Thickness (x)",
          math: "x = n \\times \\text{HVL} = 6 \\times 11.0\\text{ mm} = \\mathbf{66.00\\text{ mm}} = 6.60\\text{ cm}",
          explanation: "Multiplying 6 half-value layers by 11.0 mm yields exactly 66.00 mm of lead.",
        },
        {
          step: 5,
          title: "Verify Final Transmitted Dose Rate",
          math: "I(66\\text{ mm}) = 128.0 \\times e^{-(0.0630)(66)} = 128.0 \\times \\dfrac{1}{64} = \\mathbf{2.00\\text{ mSv/h}} \\le 2.0\\text{ mSv/h} \\quad \\text{[SAFE]}",
          explanation: "At 66.0 mm, radiation is attenuated into the green safety zone, guaranteeing operator protection.",
        },
      ],
    },
  },
};

export interface NuclearPhysicsState {
  currentStage: number;
  sliderValue: number;
  isMissionStarted: boolean;
  missionStartedAt: number | null;
  isCompleted: boolean;
  feedbackMessage: string;
  cameraTrigger: number;
  simulationTrigger: number;

  setSliderValue: (val: number) => void;
  setStage: (stageNum: number) => void;
  nextStage: () => void;
  resetSimulation: () => void;
  startMission: () => void;
  triggerSimulationPulse: () => void;
  checkAlignment: () => { isSuccess: boolean; error: number };
  getStageConfig: () => NuclearStageConfig;
  getPhysicsState: () => {
    dialedValue: number;
    targetValue: number;
    error: number;
    isAligned: boolean;
    // Real-time computed properties
    displayedCountRate: number;
    isSafeDose: boolean;
  };
}

export const useNuclearPhysicsStore = create<NuclearPhysicsState>((set, get) => ({
  currentStage: 1,
  sliderValue: NUCLEAR_STAGES[1].sliderDefault,
  isMissionStarted: false,
  missionStartedAt: null,
  isCompleted: false,
  feedbackMessage: "Welcome to the Nuclear Metrology Bench. Calculate the isotope half-life.",
  cameraTrigger: 0,
  simulationTrigger: 0,

  setSliderValue: (val: number) => {
    const stage = get().getStageConfig();
    const clamped = Math.max(stage.sliderMin, Math.min(stage.sliderMax, val));
    set({ sliderValue: clamped });
  },

  setStage: (stageNum: number) => {
    const config = NUCLEAR_STAGES[stageNum] || NUCLEAR_STAGES[1];
    set({
      currentStage: stageNum,
      sliderValue: config.sliderDefault,
      isCompleted: false,
      feedbackMessage: `Stage ${stageNum} initialized. Match ${config.targetDisplay}.`,
      cameraTrigger: get().cameraTrigger + 1,
    });
  },

  nextStage: () => {
    const next = get().currentStage + 1;
    if (next <= 3) {
      get().setStage(next);
    } else {
      set({
        isCompleted: true,
        feedbackMessage: "Congratulations! You have completed all Nuclear Physics challenges!",
      });
    }
  },

  resetSimulation: () => {
    const stage = get().getStageConfig();
    set({
      sliderValue: stage.sliderDefault,
      isCompleted: false,
      feedbackMessage: "Bench reset. Adjust the controls to match the target value.",
      simulationTrigger: 0,
    });
  },

  startMission: () => {
    set({
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      feedbackMessage: "Mission started! Observe the radiation bench and determine the parameter.",
    });
  },

  triggerSimulationPulse: () => {
    set((state) => ({ simulationTrigger: state.simulationTrigger + 1 }));
  },

  checkAlignment: () => {
    const { isAligned, error } = get().getPhysicsState();
    const stage = get().getStageConfig();

    if (isAligned) {
      set({
        feedbackMessage: `Excellent! Correct ${stage.parameterName} calibrated!`,
      });
      return { isSuccess: true, error };
    } else {
      set({
        feedbackMessage: `Deviation of ${error.toFixed(2)} ${stage.parameterUnit} exceeds tolerance (±${stage.tolerance} ${stage.parameterUnit}). Recalculate and retry.`,
      });
      return { isSuccess: false, error };
    }
  },

  getStageConfig: () => {
    const stage = get().currentStage;
    return NUCLEAR_STAGES[stage] || NUCLEAR_STAGES[1];
  },

  getPhysicsState: () => {
    const stage = get().getStageConfig();
    const dialedValue = get().sliderValue;
    const targetValue = stage.targetValue;
    const error = Math.abs(dialedValue - targetValue);
    const isAligned = error <= stage.tolerance;

    // Real-time displayed readings on the Geiger counter
    let displayedCountRate = 0;
    let isSafeDose = false;

    if (stage.mode === "half-life") {
      // In stage 1: Remaining activity after 24s based on dialed half-life
      const nHalfLives = 24.0 / Math.max(0.1, dialedValue);
      displayedCountRate = (stage.initialActivityBq || 1600) * Math.pow(0.5, nHalfLives);
    } else if (stage.mode === "discrimination") {
      // In stage 2: Measured pure gamma count rate after Paper (α) & Aluminum (β) absorption
      displayedCountRate = stage.aluminumCountsCps || 300;
    } else if (stage.mode === "shielding") {
      // In stage 3: Transmitted dose rate through thickness x
      const nHvl = dialedValue / (stage.leadHvlMm || 11.0);
      displayedCountRate = (stage.unshieldedDoseMsv || 128.0) * Math.pow(0.5, nHvl);
      isSafeDose = displayedCountRate <= 2.05;
    }

    return {
      dialedValue,
      targetValue,
      error,
      isAligned,
      displayedCountRate,
      isSafeDose,
    };
  },
}));
