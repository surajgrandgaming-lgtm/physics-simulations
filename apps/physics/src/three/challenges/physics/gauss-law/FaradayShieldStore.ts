import { create } from "zustand";

export interface FaradayShieldStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  parameterName: string;
  parameterUnit: string;
  qCore: number; // in microcoulombs (μC)
  qShellInitial: number; // in microcoulombs (μC)
  rInner: number; // inner conductor radius in meters (R1)
  rOuter: number; // outer conductor radius in meters (R2)
  sliderMin: number;
  sliderMax: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;
  targetValue: number; // target parameter value to hit
  tolerance: number; // acceptable deviation
  targetDescription: string;
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

// Laboratory Coulomb constant normalized: ke = 1 / (4 * pi * epsilon0) = 9.0 (kV * m / μC)
export const COULOMB_CONSTANT = 9.0;

export const FARADAY_STAGES: Record<number, FaradayShieldStageConfig> = {
  1: {
    stage: 1,
    title: "Cavity Core Flux & Radial Sensor Calibration",
    subtitle: "Calibrate the Gaussian sensor bubble within the vacuum cavity",
    parameterName: "Gaussian Radius (r)",
    parameterUnit: "m",
    qCore: 4.0, // +4.0 μC
    qShellInitial: 0.0, // uncharged shell
    rInner: 3.2, // R1 = 3.2 m (inner cavity wall)
    rOuter: 4.5, // R2 = 4.5 m (outer metal wall)
    sliderMin: 1.0, // Clean min limit inside cavity
    sliderMax: 3.0, // Strictly bounded below cavity boundary R1 = 3.2 m
    sliderDefault: 1.4,
    stepSmall: 0.05,
    stepLarge: 0.2,
    // E = ke * Q / r^2 = 9.0 * 4.0 / (2.0^2) = 36.0 / 4.0 = 9.00 kV/m
    targetValue: 2.0, // r = 2.00 m
    tolerance: 0.08,
    targetDescription: "Tune Gaussian detector radius r until field reaches exactly E = 9.00 kV/m (r = 2.00 m)",
    mathDerivation: {
      title: "Stage 1: Gauss's Law in the Central Vacuum Cavity",
      concept:
        "Imagine an imaginary spherical balloon (a Gaussian surface) expanding from the central positive ion core outward through the empty vacuum cavity. Because the central charge is a sphere, electric field lines spray out uniformly in every direction like sunlight from a star. Gauss's Law allows us to find the field strength at any radius r simply by asking: how much charge is trapped inside the balloon, and how much surface area is that field spread over? Since the surface area of a sphere grows as 4πr², the electric field spreads out and dilutes with distance squared (E ∝ 1/r²).",
      conclusion:
        "In the vacuum cavity, the electric field follows Coulomb's inverse-square law: E = k_e · Q / r². For a +4.0 μC core, tuning the Gaussian detector radius to exactly r = 2.00 m concentrates the field to exactly the target 9.00 kV/m.",
      formulas: [
        {
          label: "1. GAUSS'S LAW FOR A SPHERE",
          formula: "\\Phi_E = \\oint \\mathbf{E} \\cdot d\\mathbf{A} = E(r) \\cdot (4\\pi r^2) = \\dfrac{Q_{\\text{enc}}}{\\varepsilon_0}",
          explanation:
            "Electric field lines point straight outward perpendicular to the sphere. The total electric flux equals field strength E times the sphere's surface area 4πr².",
        },
        {
          label: "2. ELECTRIC FIELD IN VACUUM CAVITY",
          formula: "E(r) = k_e \\dfrac{Q_{\\text{core}}}{r^2} \\qquad \\left(k_e = \\dfrac{1}{4\\pi\\varepsilon_0} = 9.0\\text{ kV}\\cdot\\text{m}/\\mu\\text{C}\\right)",
          explanation:
            "Dividing the flux equation by 4πr² gives the familiar inverse-square law: doubling your distance cuts the electric field strength to one-fourth.",
        },
        {
          label: "3. TARGET DETECTOR RADIUS FORMULA",
          formula: "r = \\sqrt{\\dfrac{k_e \\cdot Q_{\\text{core}}}{E_{\\text{target}}}}",
          explanation:
            "Rearranging the field equation lets us directly calculate the exact radius needed to measure any desired field strength.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Identify Known Values",
          math: "Q_{\\text{core}} = +4.0\\,\\mu\\text{C}, \\quad E_{\\text{target}} = 9.00\\text{ kV/m}, \\quad k_e = 9.0\\text{ kV}\\cdot\\text{m}/\\mu\\text{C}",
          explanation:
            "The suspended central core holds +4.0 microcoulombs of positive charge, and our target field is 9.00 kilovolts per meter.",
        },
        {
          step: 2,
          title: "Step 2: Calculate the Numerator (Field Times Area Factor)",
          math: "k_e \\times Q_{\\text{core}} = 9.0 \\times 4.0 = 36.0\\text{ kV}\\cdot\\text{m}",
          explanation:
            "Multiply Coulomb's constant (9.0) by the central core charge (4.0 μC) to find the total field-distance constant of 36.0.",
        },
        {
          step: 3,
          title: "Step 3: Solve for Radius Squared (r²)",
          math: "r^2 = \\dfrac{k_e \\cdot Q_{\\text{core}}}{E_{\\text{target}}} = \\dfrac{36.0}{9.00} = 4.00\\text{ m}^2",
          explanation:
            "Divide the constant (36.0) by the target electric field (9.00 kV/m). This gives r² = 4.00 square meters.",
        },
        {
          step: 4,
          title: "Step 4: Take the Square Root to Find Target Radius",
          math: "r = \\sqrt{4.00\\text{ m}^2} = 2.00\\text{ m}",
          explanation:
            "Taking the square root of 4.00 gives exactly r = 2.00 meters. This is safely inside the cavity boundary (R₁ = 2.50 m).",
        },
        {
          step: 5,
          title: "Step 5: Verify the Electric Field",
          math: "E(2.00\\text{ m}) = \\dfrac{9.0 \\times 4.0}{(2.00)^2} = \\dfrac{36.0}{4.00} = 9.00\\text{ kV/m}",
          explanation:
            "Plugging r = 2.00 m back into Gauss's Law confirms the detector registers exactly 9.00 kV/m.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Faraday Shielding & Conductor Zero-Field Discovery",
    subtitle: "Locate the electrostatic quiet zone inside the metallic shell wall",
    parameterName: "Gaussian Radius (r)",
    parameterUnit: "m",
    qCore: 5.0, // +5.0 μC
    qShellInitial: 0.0, // uncharged shell
    rInner: 2.4, // R1 = 2.4 m
    rOuter: 3.8, // R2 = 3.8 m
    sliderMin: 1.5,
    sliderMax: 4.5,
    sliderDefault: 1.8,
    stepSmall: 0.05,
    stepLarge: 0.2,
    // Metal shell spans 2.4 m <= r <= 3.8 m. Safe midpoint target is r = 3.10 m.
    targetValue: 3.1,
    tolerance: 0.65, // Any radius strictly inside the metal wall: [2.45, 3.75]
    targetDescription: "Expand detector into the conducting metal bulk (2.40 m < r < 3.80 m) where E = 0.00 kV/m",
    mathDerivation: {
      title: "Stage 2: Electrostatic Shielding & Conductor Zero-Field Discovery",
      concept:
        "What happens when electric field lines hit a solid metal shell? Metals are packed with trillions of free, mobile conduction electrons. The moment the positive central core (+5.0 μC) attracts them, negative electrons instantly rush to the inner wall (R₁ = 2.40 m), building up an induced charge of -5.0 μC. This negative wall creates its own internal electric field that points in the exact opposite direction of the core's field! Inside the solid metal wall, these two fields cancel each other out with 100% precision. Therefore, inside any conductor in electrostatic equilibrium, the net electric field is always strictly zero (E = 0). This is the secret behind Faraday cages and electromagnetic shielding.",
      conclusion:
        "Conductors act as perfect shields. Mobile electrons automatically rearrange until E = 0 inside the metal bulk. For any Gaussian sphere inside the metal wall (2.40 m < r < 3.80 m), the enclosed core charge (+5.0 μC) and induced inner surface charge (-5.0 μC) cancel out (Q_enc = 0), proving that E = 0.00 kV/m.",
      formulas: [
        {
          label: "1. CONDUCTOR EQUILIBRIUM PRINCIPLE",
          formula: "\\mathbf{E}_{\\text{metal}} = 0 \\iff \\oint_{\\text{metal}} \\mathbf{E} \\cdot d\\mathbf{A} = 0",
          explanation:
            "If an electric field existed inside the metal, free electrons would keep moving. Since charges are at rest in equilibrium, the field inside must be zero.",
        },
        {
          label: "2. INDUCED INNER SURFACE CHARGE",
          formula: "Q_{\\text{enc}} = Q_{\\text{core}} + Q_{\\text{inner}} = 0 \\implies Q_{\\text{inner}} = -Q_{\\text{core}}",
          explanation:
            "Because the electric field inside the metal is zero, Gauss's Law proves that the total enclosed charge must equal zero.",
        },
        {
          label: "3. ZERO FIELD IN CONDUCTING REGION",
          formula: "E(r) = k_e \\dfrac{Q_{\\text{enc}}}{r^2} = k_e \\dfrac{0}{r^2} = 0.00\\text{ kV/m} \\quad (R_1 < r < R_2)",
          explanation:
            "Zero net enclosed charge guarantees that no electric field lines penetrate or exist anywhere within the thickness of the metal shell.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Identify Metal Shell Boundaries",
          math: "R_1 = 2.40\\text{ m} \\quad (\\text{Inner Wall}), \\qquad R_2 = 3.80\\text{ m} \\quad (\\text{Outer Wall})",
          explanation:
            "The solid metallic conducting shell extends from radius 2.40 m to radius 3.80 m (thickness of 1.40 m).",
        },
        {
          step: 2,
          title: "Step 2: Calculate Induced Inner Surface Charge",
          math: "Q_{\\text{inner}} = -Q_{\\text{core}} = -(+5.00\\,\\mu\\text{C}) = -5.00\\,\\mu\\text{C}",
          explanation:
            "Mobile electrons are pulled inward until exactly 5.00 microcoulombs of negative charge lines the inner cavity wall.",
        },
        {
          step: 3,
          title: "Step 3: Sum the Enclosed Charge in the Metal Bulk",
          math: "Q_{\\text{enc}} = Q_{\\text{core}} + Q_{\\text{inner}} = +5.00\\,\\mu\\text{C} + (-5.00\\,\\mu\\text{C}) = 0.00\\,\\mu\\text{C}",
          explanation:
            "Any Gaussian surface drawn between R₁ and R₂ encloses both the positive core and the negative inner wall, summing to zero net charge.",
        },
        {
          step: 4,
          title: "Step 4: Evaluate Electric Field via Gauss's Law",
          math: "E(r) = \\dfrac{k_e \\cdot Q_{\\text{enc}}}{r^2} = \\dfrac{9.0 \\times 0.00}{r^2} = 0.00\\text{ kV/m}",
          explanation:
            "Gauss's Law states flux equals Q_enc / ε₀. With zero enclosed charge, the electric field is strictly 0.00 kV/m.",
        },
        {
          step: 5,
          title: "Step 5: Select Sensor Detector Target",
          math: "r = 3.10\\text{ m} \\quad (2.40\\text{ m} < 3.10\\text{ m} < 3.80\\text{ m})",
          explanation:
            "Setting the detector to r = 3.10 m places it directly in the quiet zone of the metal shell, where field readings drop to zero.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Electrostatic Cloaking & Shell Neutralization",
    subtitle: "Neutralize external leakage flux by applying outer shielding charge",
    parameterName: "Shielding Charge Bias (Q)",
    parameterUnit: "μC",
    qCore: 6.0, // +6.0 μC
    qShellInitial: 0.0,
    rInner: 2.5, // R1 = 2.5 m
    rOuter: 4.0, // R2 = 4.0 m
    sliderMin: -8.0,
    sliderMax: 2.0,
    sliderDefault: 0.0,
    stepSmall: 0.1,
    stepLarge: 1.0,
    // Outer shell net charge must be -6.0 μC so Q_total = Q_core + Q_shell = +6.0 + (-6.0) = 0
    targetValue: -6.0,
    tolerance: 0.15,
    targetDescription: "Dial the outer shield charge Q to -6.00 μC so exterior field E(r > R2) is zero",
    mathDerivation: {
      title: "Stage 3: Electrostatic Cloaking via Shell Charge Bias",
      concept:
        "While a metal shell shields its own interior metal bulk, notice what happens outside! By default, because the metal was neutral, pulling negative charges to the inner wall leaves behind +6.0 μC of positive charge on the exterior surface. As a result, the outer world still feels electric field lines radiating into the room! To make the entire system completely invisible to external detectors (electrostatic cloaking), we must eliminate all outward flux. According to Gauss's Law, the only way the electric field outside the entire apparatus (r > R₂ = 4.0 m) can be zero is if the total net charge enclosed by an external Gaussian surface is zero. By applying an external charge bias of Q_bias = -6.0 μC (or grounding the shell), we neutralize the outer surface charge, collapsing the escaping external field to zero.",
      conclusion:
        "To achieve complete electrostatic cloaking (E = 0 everywhere outside), the net charge of the entire assembly must sum to zero: Q_total = Q_core + Q_bias = 0. Setting the shell bias to Q_bias = -6.00 μC cancels the +6.00 μC core, eliminating all external electric flux.",
      formulas: [
        {
          label: "1. TOTAL EXTERIOR ENCLOSED CHARGE",
          formula: "Q_{\\text{enc}}(r > R_2) = Q_{\\text{core}} + Q_{\\text{bias}}",
          explanation:
            "A Gaussian sphere surrounding the entire apparatus encloses both the internal core ion and the conducting shell.",
        },
        {
          label: "2. CLOAKING ZERO-FIELD CONDITION",
          formula: "E(r > R_2) = 0 \\iff Q_{\\text{enc}} = 0 \\implies Q_{\\text{bias}} = -Q_{\\text{core}}",
          explanation:
            "By Gauss's Law, the exterior field vanishes if and only if the total enclosed charge adds up to zero.",
        },
        {
          label: "3. ESCAPING EXTERIOR ELECTRIC FIELD",
          formula: "E(r > R_2) = k_e \\dfrac{Q_{\\text{core}} + Q_{\\text{bias}}}{r^2}",
          explanation:
            "Shows that adjusting the shell bias directly dials the intensity of the external field up or down.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Identify Given Parameters",
          math: "Q_{\\text{core}} = +6.00\\,\\mu\\text{C}, \\quad R_1 = 2.50\\text{ m}, \\quad R_2 = 4.00\\text{ m}",
          explanation:
            "The suspended core has +6.00 μC, and the shell outer boundary ends at radius 4.00 m.",
        },
        {
          step: 2,
          title: "Step 2: Set Up Exterior Gauss's Law Balance",
          math: "Q_{\\text{enc}} = Q_{\\text{core}} + Q_{\\text{bias}} = 0",
          explanation:
            "For zero electric flux lines to escape into the laboratory room, the sum of all enclosed charges must equal zero.",
        },
        {
          step: 3,
          title: "Step 3: Solve for the Required Bias Charge",
          math: "Q_{\\text{bias}} = -Q_{\\text{core}} = -(+6.00\\,\\mu\\text{C}) = -6.00\\,\\mu\\text{C}",
          explanation:
            "Subtracting the core charge shows the shell requires a bias of exactly -6.00 microcoulombs.",
        },
        {
          step: 4,
          title: "Step 4: Verify Outer Surface Charge Cancellation",
          math: "Q_{\\text{outer}} = Q_{\\text{bias}} - Q_{\\text{inner}} = -6.00\\,\\mu\\text{C} - (-6.00\\,\\mu\\text{C}) = 0.00\\,\\mu\\text{C}",
          explanation:
            "With -6.00 μC applied, the outer surface is completely neutral, so no charge remains on the exterior.",
        },
        {
          step: 5,
          title: "Step 5: Verify Exterior Electric Field is Zero",
          math: "E(r > 4.00\\text{ m}) = \\dfrac{k_e \\times (6.00 - 6.00)}{r^2} = \\dfrac{9.0 \\times 0.00}{r^2} = 0.00\\text{ kV/m}",
          explanation:
            "The external electric field is identically zero at all distances outside the shell. The core is completely cloaked!",
        },
      ],
    },
  },
};

export interface FaradayShieldStore {
  currentStage: number;
  sliderValue: number;
  isSimulating: boolean;
  isWon: boolean;
  isGameOver: boolean;
  failureReason: string | null;
  showResultModal: boolean;
  isMissionStarted: boolean;
  missionStartedAt: number | null;
  analysisProgress: number; // 0.0 to 1.0 during sweep

  // Computed state
  computedEField: number;
  computedFlux: number;
  computedQEnc: number;
  isFieldShielded: boolean;

  setSliderValue: (val: number) => void;
  startSimulation: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  startMission: () => void;
  tickSimulation: (dt: number) => void;
}

export const useFaradayShieldStore = create<FaradayShieldStore>((set, get) => ({
  currentStage: 1,
  sliderValue: FARADAY_STAGES[1].sliderDefault,
  isSimulating: false,
  isWon: false,
  isGameOver: false,
  failureReason: null,
  showResultModal: false,
  isMissionStarted: false,
  missionStartedAt: null,
  analysisProgress: 0.0,

  computedEField: 0.0,
  computedFlux: 0.0,
  computedQEnc: 0.0,
  isFieldShielded: false,

  setSliderValue: (val: number) => {
    const stage = FARADAY_STAGES[get().currentStage];
    const clamped = Math.max(stage.sliderMin, Math.min(stage.sliderMax, val));

    // Calculate real-time physics based on current stage mode
    let eField = 0.0;
    let qEnc = 0.0;
    let isShielded = false;

    if (stage.stage === 1) {
      // Slider is radius r inside cavity (r < rInner)
      const r = clamped;
      qEnc = stage.qCore;
      eField = (COULOMB_CONSTANT * qEnc) / (r * r);
    } else if (stage.stage === 2) {
      // Slider is radius r spanning cavity, metal, and exterior
      const r = clamped;
      if (r < stage.rInner) {
        qEnc = stage.qCore;
        eField = (COULOMB_CONSTANT * qEnc) / (r * r);
      } else if (r <= stage.rOuter) {
        // Inside metal wall!
        qEnc = 0.0; // Core + induced inner wall
        eField = 0.0;
        isShielded = true;
      } else {
        // Outside shell
        qEnc = stage.qCore + stage.qShellInitial;
        eField = (COULOMB_CONSTANT * qEnc) / (r * r);
      }
    } else if (stage.stage === 3) {
      // Detector is fixed outside shell (e.g. r = 4.8 m), slider is Q_bias on shell
      const rExterior = 4.8;
      const qBias = clamped;
      qEnc = stage.qCore + qBias;
      eField = (COULOMB_CONSTANT * Math.abs(qEnc)) / (rExterior * rExterior);
      isShielded = Math.abs(qEnc) <= stage.tolerance;
    }

    const flux = eField * (4 * Math.PI * (stage.stage === 3 ? 4.8 * 4.8 : clamped * clamped));

    set({
      sliderValue: clamped,
      computedEField: eField,
      computedFlux: flux,
      computedQEnc: qEnc,
      isFieldShielded: isShielded,
    });
  },

  startMission: () => {
    set({
      isMissionStarted: true,
      missionStartedAt: performance.now(),
    });
    // Trigger initial calculation
    get().setSliderValue(get().sliderValue);
  },

  startSimulation: () => {
    const { isSimulating } = get();
    if (isSimulating) return;

    set({
      isSimulating: true,
      analysisProgress: 0.0,
      showResultModal: false,
      isGameOver: false,
    });
  },

  resetSimulation: () => {
    const stage = FARADAY_STAGES[get().currentStage];
    set({
      sliderValue: stage.sliderDefault,
      isSimulating: false,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      analysisProgress: 0.0,
    });
    get().setSliderValue(stage.sliderDefault);
  },

  nextStage: () => {
    const nextStg = Math.min(3, get().currentStage + 1);
    const stageConfig = FARADAY_STAGES[nextStg];
    set({
      currentStage: nextStg,
      sliderValue: stageConfig.sliderDefault,
      isSimulating: false,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      analysisProgress: 0.0,
    });
    get().setSliderValue(stageConfig.sliderDefault);
  },

  tickSimulation: (dt: number) => {
    const { isSimulating, analysisProgress, sliderValue, currentStage } = get();
    if (!isSimulating) return;

    const newProg = Math.min(1.0, analysisProgress + dt * 1.5);
    set({ analysisProgress: newProg });

    if (newProg >= 1.0) {
      const stage = FARADAY_STAGES[currentStage];
      const diff = Math.abs(sliderValue - stage.targetValue);
      const isSuccess = diff <= stage.tolerance;

      if (isSuccess) {
        set({
          isSimulating: false,
          isWon: true,
          isGameOver: false,
          showResultModal: true,
        });
      } else {
        let reason = "";
        if (stage.stage === 1) {
          reason = `Radius r = ${sliderValue.toFixed(2)} m produced E = ${get().computedEField.toFixed(2)} kV/m (Target: 9.00 kV/m). Need r = ${stage.targetValue.toFixed(2)} m.`;
        } else if (stage.stage === 2) {
          reason = `Sensor is at r = ${sliderValue.toFixed(2)} m, outside the metal shell (${stage.rInner} m - ${stage.rOuter} m). Electric field is not shielded here!`;
        } else {
          reason = `Outer shell charge Q = ${sliderValue.toFixed(2)} μC leaves net leakage flux. Need Q = ${stage.targetValue.toFixed(2)} μC to cloak external field.`;
        }

        set({
          isSimulating: false,
          isWon: false,
          isGameOver: true,
          failureReason: reason,
          showResultModal: true,
        });
      }
    }
  },
}));
