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
        "When an imaginary spherical Gaussian surface of radius r surrounds a central point charge Q inside a vacuum cavity (r < R₁), three fundamental physical conditions hold:\n\n1. Spherical Symmetry of Electric Field:\nBecause the central charge is a sphere, the electric field lines radiate symmetrically outward in all 360° directions. At any constant radius r, the electric field strength E has the exact same magnitude everywhere on the sphere and points strictly perpendicular to the surface (parallel to the area normal vector dA).\n\n2. Evaluating the Gauss's Law Flux Integral:\nGauss's Law states that total electric flux Φ_E equals the net enclosed charge divided by permittivity:\n   Φ_E = ∮ E · dA = E · ∮ dA = E · (4πr²) = Q_enc / ε₀\n\n3. Solving for Electric Field & Sensor Radius:\nIsolating E gives Coulomb's inverse-square law:\n   E(r) = (1 / 4πε₀) · (Q / r²) = k_e · (Q / r²)\nwhere k_e = 9.0 kV·m/μC. To find the exact radius r where the field equals our calibrated instrument threshold E_target = 9.00 kV/m, we rearrange:\n   r = √(k_e · Q / E_target)",
      conclusion:
        "Key Physics Takeaway: In vacuum, the electric field drops off with the square of the distance (E ∝ 1/r²). For an ion core of Q = +4.0 μC, setting the Gaussian detector radius to r = 2.00 m produces a field of exactly E = 9.00 kV/m.",
      formulas: [
        {
          label: "1. GAUSS'S FLUX INTEGRAL FOR A SPHERE",
          formula: "\\Phi_E = \\oint \\mathbf{E} \\cdot d\\mathbf{A} = E(r) \\cdot (4\\pi r^2) = \\dfrac{Q_{\\text{enc}}}{\\varepsilon_0}",
          explanation:
            "Because E is radial and uniform across the spherical surface, the dot product E·dA simplifies directly to field magnitude E multiplied by total surface area 4πr².",
        },
        {
          label: "2. CAVITY ELECTRIC FIELD (COULOMB'S INVERSE-SQUARE LAW)",
          formula: "E(r) = k_e \\dfrac{Q_{\\text{core}}}{r^2} \\qquad \\left(k_e = \\dfrac{1}{4\\pi\\varepsilon_0} = 9.0\\text{ kV}\\cdot\\text{m}/\\mu\\text{C}\\right)",
          explanation:
            "The electric field inside the cavity depends solely on the central core charge and decays rapidly with distance squared (1/r²).",
        },
        {
          label: "3. SOLVED RADIUS FORMULA",
          formula: "r = \\sqrt{\\dfrac{k_e \\cdot Q_{\\text{core}}}{E_{\\text{target}}}}",
          explanation:
            "Direct working equation used to calculate the required detector radius for any target field threshold.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Identify Given Parameters",
          math: "Q_{\\text{core}} = +4.0\\,\\mu\\text{C}, \\quad E_{\\text{target}} = 9.00\\text{ kV/m}, \\quad k_e = 9.0\\text{ kV}\\cdot\\text{m}/\\mu\\text{C}",
          explanation:
            "The positive ion core suspended at the center holds a charge of 4.0 microcoulombs.",
        },
        {
          step: 2,
          title: "Step 2: Set Up the Inverted Radius Equation",
          math: "r^2 = \\dfrac{k_e \\cdot Q_{\\text{core}}}{E_{\\text{target}}} = \\dfrac{9.0 \\times 4.0}{9.00} = \\dfrac{36.0}{9.00}",
          explanation:
            "Multiply Coulomb's constant (9.0) by the core charge (4.0 μC) to get 36.0, then divide by the target field (9.00 kV/m).",
        },
        {
          step: 3,
          title: "Step 3: Compute the Target Radius",
          math: "r^2 = 4.00\\text{ m}^2 \\implies r = \\sqrt{4.00} = 2.00\\text{ m}",
          explanation:
            "Taking the square root of 4.00 gives exactly r = 2.00 meters.",
        },
        {
          step: 4,
          title: "Step 4: Verify Surface Flux & Field",
          math: "E = \\dfrac{9.0 \\times 4.0}{(2.00)^2} = \\dfrac{36.0}{4.00} = 9.00\\text{ kV/m}",
          explanation:
            "Plugging r = 2.00 m back into Gauss's Law confirms the field is dead-on 9.00 kV/m, matching the target.",
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
      title: "Stage 2: Electrostatic Shielding & Induced Charges in Conductors",
      concept:
        "When an uncharged conducting metal shell surrounds a positive cavity charge Q_core = +5.0 μC, a remarkable physical phenomenon occurs:\n\n1. Behavior of Mobile Conduction Electrons:\nMetals contain quadrillions of mobile free electrons. The positive charge at the center attracts these electrons inward toward the inner cavity surface (R₁ = 2.40 m). Electrons accumulate on the inner surface until the electric field they generate completely cancels the core's outward field inside the metal bulk!\n\n2. Electrostatic Equilibrium (E = 0 in Metal):\nIf any electric field existed inside the conducting metal, free electrons would experience a force (F = -e·E) and move. Because charges are at rest in equilibrium, the electric field inside the metal wall must be strictly zero:\n   E_metal = 0\n\n3. Applying Gauss's Law Inside the Metal (R₁ < r < R₂):\nDrawing any Gaussian sphere of radius r inside the metal wall:\n   Φ_E = ∮ E · dA = ∮ 0 · dA = 0\n   ⟹ Q_enc = Q_core + Q_inner_surface = 0\n   ⟹ Q_inner_surface = -Q_core = -5.0 μC\n\n4. Outer Surface Charge Conservation:\nBecause the metal shell had zero net charge originally (uncharged), the electrons that moved to the inner wall left behind a positive deficit on the outer wall:\n   Q_outer_surface = Q_shell - Q_inner_surface = 0 - (-5.0 μC) = +5.0 μC\n\nTherefore, inside the metal wall (2.40 m < r < 3.80 m), any sensitive quantum instrument is completely shielded from external and internal fields: E = 0.00 kV/m.",
      conclusion:
        "Key Physics Takeaway: Inside a conductor in electrostatic equilibrium, E = 0 strictly holds. The inner surface automatically induces Q_in = -Q_core so that the net enclosed charge Q_enc = 0 for any Gaussian surface inside the metal (2.40 m < r < 3.80 m).",
      formulas: [
        {
          label: "1. CONDUCTOR EQUILIBRIUM CONDITION",
          formula: "\\mathbf{E}_{\\text{metal}} = 0 \\implies \\oint_{\\text{bulk}} \\mathbf{E} \\cdot d\\mathbf{A} = 0",
          explanation:
            "Mobile electrons instantaneously redistribute until the internal electrostatic field vanishes completely.",
        },
        {
          label: "2. INDUCED INNER SURFACE CHARGE",
          formula: "Q_{\\text{enc}} = Q_{\\text{core}} + Q_{\\text{inner}} = 0 \\implies Q_{\\text{inner}} = -Q_{\\text{core}}",
          explanation:
            "By Gauss's Law, zero field implies zero net enclosed charge, forcing the inner wall to hold exactly -Q_core.",
        },
        {
          label: "3. OUTER SURFACE INDUCED CHARGE",
          formula: "Q_{\\text{outer}} = Q_{\\text{shell, net}} - Q_{\\text{inner}} = 0 - (-Q_{\\text{core}}) = +Q_{\\text{core}}",
          explanation:
            "Charge conservation on an isolated shell means an equal positive charge appears on the exterior boundary.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Identify Conductor Shell Boundaries",
          math: "R_1 = 2.40\\text{ m} \\quad (\\text{Inner Wall}), \\qquad R_2 = 3.80\\text{ m} \\quad (\\text{Outer Wall})",
          explanation:
            "The solid metallic conducting wall spans from radius 2.40 m to 3.80 m.",
        },
        {
          step: 2,
          title: "Step 2: Determine Net Enclosed Charge Inside Metal",
          math: "Q_{\\text{enc}}(r) = Q_{\\text{core}} + Q_{\\text{inner}} = +5.0\\,\\mu\\text{C} + (-5.0\\,\\mu\\text{C}) = 0.00\\,\\mu\\text{C}",
          explanation:
            "The induced negative charge on the inner wall cancels the positive core charge completely.",
        },
        {
          step: 3,
          title: "Step 3: Calculate Electric Field Inside Metal",
          math: "E(r) = \\dfrac{k_e \\cdot Q_{\\text{enc}}}{r^2} = \\dfrac{9.0 \\times 0.00}{r^2} = 0.00\\text{ kV/m} \\quad (2.40\\text{ m} < r < 3.80\\text{ m})",
          explanation:
            "Zero net enclosed charge guarantees that the electric field is exactly zero everywhere inside the metal.",
        },
        {
          step: 4,
          title: "Step 4: Select Sensor Radius in the Shielded Band",
          math: "r = 3.10\\text{ m} \\quad (2.40\\text{ m} < 3.10\\text{ m} < 3.80\\text{ m})",
          explanation:
            "Positioning the sensor at r = 3.10 m places it safely inside the shielded metal wall where E = 0.",
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
      title: "Stage 3: Electrostatic Cloaking via Outer Surface Grounding / Charge Bias",
      concept:
        "In Stage 3, our Gaussian detector is placed in the external environment outside the entire apparatus (r > R₂ = 4.0 m):\n\n1. The Problem of Field Leakage:\nEven though the metal shell shields its own bulk (E = 0 inside), by default its outer surface still carries an induced charge Q_outer = +Q_core = +6.00 μC. This outer charge emits electric flux lines outward into the laboratory room!\n\n2. Applying Gauss's Law to the Entire System:\nA Gaussian sphere drawn outside the entire assembly (r > 4.0 m) encloses both the central core AND the outer conducting shell:\n   Φ_E = ∮ E · dA = E · (4πr²) = Q_enc / ε₀\n   where Q_enc = Q_core + Q_shell\n\n3. The Electrostatic Cloaking Condition:\nTo prevent any electric field from escaping into the room (achieving complete electrostatic cloaking):\n   E(r > R₂) = 0 ⟹ Φ_E = 0 ⟹ Q_enc = 0\n   Q_core + Q_shell = 0\n   ⟹ Q_shell = -Q_core = -6.00 μC\n\nWhen we apply an external bias of -6.00 μC to the shell (or ground the shell), negative charges flow onto the outer wall, neutralizing the +6.00 μC outer surface charge. The net exterior enclosed charge drops to zero, and the exterior electric field vanishes completely!",
      conclusion:
        "Key Physics Takeaway: Applying an equal and opposite charge Q_shell = -Q_core (or grounding the shell) neutralizes all exterior surface charge. As a result, Q_enc = 0 for any external Gaussian surface, making the system 100% electrostatically invisible (E = 0 for all r > R₂).",
      formulas: [
        {
          label: "1. TOTAL EXTERIOR ENCLOSED CHARGE",
          formula: "Q_{\\text{enc}}(r > R_2) = Q_{\\text{core}} + Q_{\\text{shell, net}}",
          explanation:
            "A Gaussian surface outside the apparatus encloses the central core and all charges residing on the shell.",
        },
        {
          label: "2. CLOAKING ZERO-FIELD CONDITION",
          formula: "E(r > R_2) = 0 \\iff Q_{\\text{enc}} = 0 \\implies Q_{\\text{shell}} = -Q_{\\text{core}}",
          explanation:
            "The exterior field can only be zero if the total net charge enclosed by the Gaussian surface is zero.",
        },
        {
          label: "3. EXTERIOR FIELD FORMULA",
          formula: "E(r > R_2) = k_e \\dfrac{Q_{\\text{core}} + Q_{\\text{bias}}}{r^2}",
          explanation:
            "Shows that adjusting the bias charge directly controls the strength of the escaping external electric field.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Identify Active Core Charge",
          math: "Q_{\\text{core}} = +6.00\\,\\mu\\text{C}, \\quad R_1 = 2.50\\text{ m}, \\quad R_2 = 4.00\\text{ m}",
          explanation:
            "The positive core emits outward electric flux corresponding to +6.00 microcoulombs.",
        },
        {
          step: 2,
          title: "Step 2: Formulate External Flux Balance",
          math: "Q_{\\text{enc}} = Q_{\\text{core}} + Q_{\\text{bias}} = +6.00\\,\\mu\\text{C} + Q_{\\text{bias}} = 0",
          explanation:
            "For zero external field lines to pierce the outer detector, the total net charge inside must sum to zero.",
        },
        {
          step: 3,
          title: "Step 3: Solve for Required Bias Charge (Q)",
          math: "Q_{\\text{bias}} = -Q_{\\text{core}} = -6.00\\,\\mu\\text{C}",
          explanation:
            "Injecting -6.00 microcoulombs onto the conducting shell cancels the outward field completely.",
        },
        {
          step: 4,
          title: "Step 4: Verify Exterior Electrostatic Isolation",
          math: "E(r > 4.00\\text{ m}) = \\dfrac{k_e \\times (6.00 - 6.00)}{r^2} = \\dfrac{9.0 \\times 0.00}{r^2} = 0.00\\text{ kV/m}",
          explanation:
            "With Q_bias = -6.00 μC, the external field is identically zero everywhere outside the apparatus.",
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
