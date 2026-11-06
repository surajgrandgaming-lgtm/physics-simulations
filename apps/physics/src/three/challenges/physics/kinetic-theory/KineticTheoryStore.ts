import { create } from "zustand";

export interface KTGStageConfig {
  stage: number;
  title: string;
  stageBadge: string;
  missionObjective: string;
  missionQuestion: string;
  initialTemp: number; // Kelvin
  initialHeight: number; // cm
  initialPressure: number; // kPa
  initialMassLoad: number; // kg
  targetValue: number;
  tolerance: number;
  unit: string;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;
  paramName: string;
  gasType: string;
  molarMass: number; // g/mol
  crossSectionArea: number; // m^2
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

export const KTG_STAGES: Record<number, KTGStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Isobaric Expansion & Docking Calibration",
    stageBadge: "STAGE 1 • CHARLES'S LAW",
    missionObjective: "Calibrate Heater to Expand Cylinder to Docking Height",
    missionQuestion:
      "A pneumatic cylinder with cross-sectional area A = 50 cm² supports a constant load pressure of P = 150.0 kPa. The gas begins at room temperature T₁ = 300.0 K with piston height h₁ = 20.0 cm. Determine the exact heater temperature (T₂ in K) needed to isobarically expand the gas so the floating piston lifts and aligns with the docking sensor at h₂ = 32.0 cm.",
    initialTemp: 300.0,
    initialHeight: 20.0,
    initialPressure: 150.0,
    initialMassLoad: 24.85,
    targetValue: 480.0,
    tolerance: 3.0,
    unit: "K",
    sliderMin: 250.0,
    sliderMax: 600.0,
    sliderStep: 1.0,
    sliderDefault: 320.0,
    stepSmall: 1.0,
    stepLarge: 10.0,
    paramName: "Target Gas Temperature (T₂)",
    gasType: "Helium Gas (He)",
    molarMass: 4.00,
    crossSectionArea: 0.005,
    tip: "At constant pressure, gas volume is directly proportional to absolute Kelvin temperature: V₁/T₁ = V₂/T₂.",
    explanationTrap: "Always calculate in absolute Kelvin (K), not Celsius. Doubling Celsius temperature does NOT double volume!",
    mathDerivation: {
      title: "Stage 1: Isobaric Thermal Expansion Derivation",
      concept:
        "Under constant external pressure, the force balance on the frictionless piston remains unchanged. According to Charles's Law (and the Ideal Gas Law PV = nRT with P = const), the volume occupied by an ideal gas expands in direct linear proportion to its absolute temperature in Kelvin: V₁ / T₁ = V₂ / T₂. Since the cylinder has constant cross-sectional area A, volume scales directly with height: V = A · h.",
      conclusion:
        "To lift the piston from 20.0 cm to 32.0 cm (a 1.6× volume expansion), the absolute temperature must scale by the exact same ratio: T₂ = 300.0 K × (32.0 / 20.0) = 480.0 K (206.9°C).",
      formulas: [
        {
          label: "1. Charles's Law (Isobaric Condition)",
          formula: "\\frac{V_1}{T_1} = \\frac{V_2}{T_2}",
          explanation: "Volume varies directly with absolute temperature when pressure and moles are held constant.",
        },
        {
          label: "2. Height-Volume Equivalence",
          formula: "V = A \\cdot h \\implies \\frac{h_1}{T_1} = \\frac{h_2}{T_2}",
          explanation: "Cylinder geometry relates volume changes directly to linear piston displacement.",
        },
        {
          label: "3. RMS Molecular Velocity",
          formula: "v_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}}",
          explanation: "Higher temperature means faster molecular impacts that sustain the increased volume.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify initial thermodynamic coordinates",
          math: "T_1 = 300.0\\text{ K}, \\quad h_1 = 20.0\\text{ cm}, \\quad h_2 = 32.0\\text{ cm}",
          calculation: "h₁ = 20.0 cm, h₂ = 32.0 cm, T₁ = 300.0 K",
          explanation: "Initial state defines the reference volume-temperature quotient.",
        },
        {
          step: 2,
          title: "Formulate Charles's Law in terms of cylinder height",
          math: "\\frac{A \\cdot h_1}{T_1} = \\frac{A \\cdot h_2}{T_2} \\implies T_2 = T_1 \\cdot \\frac{h_2}{h_1}",
          calculation: "T₂ = 300.0 × (32.0 / 20.0)",
          explanation: "Cross-sectional area A cancels out cleanly from both sides.",
        },
        {
          step: 3,
          title: "Calculate required Kelvin temperature",
          math: "T_2 = 300.0\\text{ K} \\times 1.60 = 480.0\\text{ K}",
          calculation: "300.0 × 1.60 = 480.0 K",
          explanation: "Heating to 480.0 K expands the gas column smoothly to exactly 32.0 cm.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: Isothermal Compression & Mechanical Loading",
    stageBadge: "STAGE 2 • BOYLE'S LAW",
    missionObjective: "Calculate Piston Counterweight Load for Isothermal Compression",
    missionQuestion:
      "The cylinder operates inside a constant-temperature thermal bath at T = 300.0 K. The gas initially rests at atmospheric pressure P₁ = 101.3 kPa with piston height h₁ = 30.0 cm. To compress the cylinder down to clearance height h₂ = 18.0 cm (A = 50 cm²), calculate the total mass of weights (M_load in kg) that must be placed on top of the piston.",
    initialTemp: 300.0,
    initialHeight: 30.0,
    initialPressure: 101.3,
    initialMassLoad: 0.0,
    targetValue: 34.46,
    tolerance: 0.8,
    unit: "kg",
    sliderMin: 5.0,
    sliderMax: 60.0,
    sliderStep: 0.1,
    sliderDefault: 15.0,
    stepSmall: 0.1,
    stepLarge: 1.0,
    paramName: "Added Piston Weight (M_load)",
    gasType: "Nitrogen Gas (N₂)",
    molarMass: 28.02,
    crossSectionArea: 0.005,
    tip: "In isothermal compression (PV = const), halving the volume doubles the pressure and molecular collision frequency.",
    explanationTrap: "Remember that the added weight only supplies the gauge pressure difference: ΔP = P₂ - P_atm = (M·g)/A.",
    mathDerivation: {
      title: "Stage 2: Isothermal Compression & Load Derivation",
      concept:
        "When an ideal gas undergoes a quasi-static compression in thermal equilibrium with a heat reservoir (T = constant), Boyle's Law states that pressure is inversely proportional to volume: P₁V₁ = P₂V₂. The increased gas pressure inside the cylinder must balance the downward forces: atmospheric pressure pressing on the piston plus the gravitational weight of the added load.",
      conclusion:
        "Compressing the column from 30.0 cm to 18.0 cm increases chamber pressure from 101.3 kPa to 168.83 kPa. The required gauge pressure differential ΔP = 67.53 kPa on a 50 cm² piston requires an added mass load of M_load = 34.46 kg.",
      formulas: [
        {
          label: "1. Boyle's Law (Isothermal Condition)",
          formula: "P_1 V_1 = P_2 V_2 \\implies P_2 = P_1 \\cdot \\frac{h_1}{h_2}",
          explanation: "Pressure increases as volume is compressed at constant temperature.",
        },
        {
          label: "2. Mechanical Equilibrium of Piston",
          formula: "P_2 = P_{\\text{atm}} + \\frac{M_{\\text{load}} \\cdot g}{A}",
          explanation: "Downwards forces (atmospheric air + weights) balance upward gas pressure.",
        },
        {
          label: "3. Required Load Mass",
          formula: "M_{\\text{load}} = \\frac{(P_2 - P_{\\text{atm}}) \\cdot A}{g}",
          explanation: "Translates required gauge pressure into kilograms of ballast mass.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Compute final compressed pressure (P₂)",
          math: "P_2 = P_1 \\cdot \\frac{h_1}{h_2} = 101.3\\text{ kPa} \\times \\frac{30.0}{18.0} = 168.83\\text{ kPa}",
          calculation: "101.3 × (30 / 18) = 168.83 kPa",
          explanation: "Volume decreases by a factor of 1.667, so pressure rises by 1.667×.",
        },
        {
          step: 2,
          title: "Calculate required excess gauge pressure (ΔP)",
          math: "\\Delta P = P_2 - P_{\\text{atm}} = 168.83\\text{ kPa} - 101.30\\text{ kPa} = 67.53\\text{ kPa} = 67,533\\text{ Pa}",
          calculation: "168.83 - 101.30 = 67.53 kPa",
          explanation: "Only the excess pressure over atmosphere needs to be provided by weights.",
        },
        {
          step: 3,
          title: "Calculate added mass load on piston (A = 0.005 m², g = 9.80 m/s²)",
          math: "M_{\\text{load}} = \\frac{67,533\\text{ N/m}^2 \\times 0.0050\\text{ m}^2}{9.80\\text{ m/s}^2} = 34.46\\text{ kg}",
          calculation: "(67533 × 0.005) / 9.80 = 34.46 kg",
          explanation: "Placing 34.46 kg on the platform establishes steady-state equilibrium at 18.0 cm.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: Kinetic RMS Velocity & Rupture Limit",
    stageBadge: "STAGE 3 • MOLECULAR KINETICS",
    missionObjective: "Maximize Kinetic Velocity Without Exceeding Rupture Pressure",
    missionQuestion:
      "The piston is clamped securely with safety pins at a fixed volume V = 1.0 L (h = 20.0 cm) containing pure Argon gas (M = 39.95 g/mol). An emergency pressure relief disc will rupture if pressure reaches P_burst = 250.0 kPa. If initial state is P₀ = 100.0 kPa at T₀ = 300.0 K, calculate the safe maximum gas temperature (T_safe in K) to reach 250.0 kPa, and verify its RMS molecular speed (v_rms in m/s).",
    initialTemp: 300.0,
    initialHeight: 20.0,
    initialPressure: 100.0,
    initialMassLoad: 0.0,
    targetValue: 750.0,
    tolerance: 5.0,
    unit: "K",
    sliderMin: 300.0,
    sliderMax: 900.0,
    sliderStep: 1.0,
    sliderDefault: 450.0,
    stepSmall: 1.0,
    stepLarge: 15.0,
    paramName: "Safe Peak Temperature (T_safe)",
    gasType: "Argon Gas (Ar)",
    molarMass: 39.95,
    crossSectionArea: 0.005,
    tip: "Kinetic pressure is directly proportional to mean molecular kinetic energy: P = (1/3)ρ·v_rms² = (N·k_B·T)/V.",
    explanationTrap: "RMS speed depends on the square root of temperature (v_rms ∝ √T), while pressure depends linearly on T at fixed volume.",
    mathDerivation: {
      title: "Stage 3: Kinetic Pressure & Molecular RMS Velocity Derivation",
      concept:
        "The fundamental postulate of Kinetic Theory connects macroscopic pressure to microscopic momentum exchanges during elastic collisions with chamber walls: P = (1/3) · (N·m / V) · v_rms². For an ideal gas at fixed volume (Gay-Lussac's Law), pressure scales strictly with absolute temperature: P / T = constant. Molecular root-mean-square speed follows Maxwell-Boltzmann statistics: v_rms = √(3RT / M).",
      conclusion:
        "To bring the Argon gas right to its maximum threshold of 250.0 kPa from 100.0 kPa, the chamber must be heated to T_safe = 750.0 K (476.9°C). At this temperature, Argon atoms speed along at an RMS velocity of v_rms = 684.3 m/s.",
      formulas: [
        {
          label: "1. Gay-Lussac's Law (Isochoric Condition)",
          formula: "\\frac{P_1}{T_1} = \\frac{P_2}{T_2} \\implies T_2 = T_1 \\cdot \\frac{P_2}{P_1}",
          explanation: "At fixed volume, pressure grows in direct linear proportion to absolute temperature.",
        },
        {
          label: "2. Root-Mean-Square Molecular Velocity",
          formula: "v_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}}",
          explanation: "Represents the effective kinetic speed of individual gas atoms of molar mass M.",
        },
        {
          label: "3. Microscopic Kinetic Pressure Formula",
          formula: "P = \\frac{1}{3} \\rho v_{\\text{rms}}^2 = \\frac{1}{3} \\frac{N m}{V} v_{\\text{rms}}^2",
          explanation: "Links momentum transfer per wall collision to macroscopic pressure manometer readings.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Determine safe operating peak temperature (T_safe)",
          math: "T_{\\text{safe}} = T_0 \\cdot \\frac{P_{\\text{burst}}}{P_0} = 300.0\\text{ K} \\times \\frac{250.0\\text{ kPa}}{100.0\\text{ kPa}} = 750.0\\text{ K}",
          calculation: "300.0 × (250 / 100) = 750.0 K",
          explanation: "Pressure increases 2.50×, so absolute temperature must rise by 2.50× to 750.0 K.",
        },
        {
          step: 2,
          title: "Substitute values into RMS speed formula (M_Ar = 0.03995 kg/mol)",
          math: "v_{\\text{rms}} = \\sqrt{\\frac{3 \\times 8.314\\text{ J/(mol}\\cdot\\text{K)} \\times 750.0\\text{ K}}{0.03995\\text{ kg/mol}}} = \\sqrt{468,235} \\approx 684.3\\text{ m/s}",
          calculation: "sqrt((3 × 8.314 × 750) / 0.03995) = 684.3 m/s",
          explanation: "Argon atoms impact cylinder boundaries at over 2,460 km/h, generating 250 kPa of pressure.",
        },
      ],
    },
  },
};

interface KTGState {
  currentStage: number;
  temperature: number; // Kelvin
  pistonHeight: number; // cm
  pressure: number; // kPa
  massLoad: number; // kg
  sliderValue: number;
  vRms: number; // m/s
  isSimulating: boolean;
  isMissionStarted: boolean;
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

export const useKTGStore = create<KTGState>((set, get) => {
  const initialStage = 1;
  const cfg = KTG_STAGES[initialStage];

  // v_rms calculation helper: v = sqrt(3 * R * T / M)
  const calcVRms = (T: number, M_g_mol: number) => {
    const M_kg = M_g_mol / 1000;
    return Math.sqrt((3 * 8.314 * T) / M_kg);
  };

  return {
    currentStage: initialStage,
    temperature: cfg.initialTemp,
    pistonHeight: cfg.initialHeight,
    pressure: cfg.initialPressure,
    massLoad: cfg.initialMassLoad,
    sliderValue: cfg.sliderDefault,
    vRms: calcVRms(cfg.initialTemp, cfg.molarMass),
    isSimulating: false,
    isMissionStarted: false,
    simulationProgress: 0,
    isWon: false,
    isGameOver: false,
    failureReason: "",
    showResultModal: false,

    setSliderValue: (val: number) => {
      const { isSimulating } = get();
      if (isSimulating) return;
      const stage = KTG_STAGES[get().currentStage];
      const clamped = Math.max(stage.sliderMin, Math.min(stage.sliderMax, val));
      set({ sliderValue: clamped });
    },

    startMission: () => {
      set({ isMissionStarted: true });
    },

    startSimulation: () => {
      const { isSimulating } = get();
      if (isSimulating) return;
      set({
        isSimulating: true,
        simulationProgress: 0,
        isWon: false,
        isGameOver: false,
        failureReason: "",
        showResultModal: false,
      });
    },

    resetSimulation: () => {
      const cfg = KTG_STAGES[get().currentStage];
      set({
        temperature: cfg.initialTemp,
        pistonHeight: cfg.initialHeight,
        pressure: cfg.initialPressure,
        massLoad: cfg.initialMassLoad,
        sliderValue: cfg.sliderDefault,
        vRms: calcVRms(cfg.initialTemp, cfg.molarMass),
        isSimulating: false,
        simulationProgress: 0,
        isWon: false,
        isGameOver: false,
        failureReason: "",
        showResultModal: false,
      });
    },

    setStage: (stageNum: number) => {
      const cfg = KTG_STAGES[stageNum] || KTG_STAGES[1];
      set({
        currentStage: cfg.stage,
        temperature: cfg.initialTemp,
        pistonHeight: cfg.initialHeight,
        pressure: cfg.initialPressure,
        massLoad: cfg.initialMassLoad,
        sliderValue: cfg.sliderDefault,
        vRms: calcVRms(cfg.initialTemp, cfg.molarMass),
        isSimulating: false,
        isMissionStarted: false,
        simulationProgress: 0,
        isWon: false,
        isGameOver: false,
        failureReason: "",
        showResultModal: false,
      });
    },

    nextStage: () => {
      const next = get().currentStage + 1;
      if (KTG_STAGES[next]) {
        get().setStage(next);
      }
    },

    tickPhysics: (delta: number) => {
      const state = get();
      if (!state.isSimulating) return;

      const stage = KTG_STAGES[state.currentStage];
      const nextProgress = Math.min(1, state.simulationProgress + delta * 0.4);

      // Smooth interpolation from initial state to user-selected slider setting
      let currentT = stage.initialTemp;
      let currentH = stage.initialHeight;
      let currentP = stage.initialPressure;
      let currentMass = stage.initialMassLoad;

      if (stage.stage === 1) {
        // Stage 1: Isobaric expansion (slider is T_target)
        currentT = stage.initialTemp + (state.sliderValue - stage.initialTemp) * nextProgress;
        // h = h1 * (T / T1)
        currentH = stage.initialHeight * (currentT / stage.initialTemp);
        currentP = stage.initialPressure;
      } else if (stage.stage === 2) {
        // Stage 2: Isothermal compression (slider is M_load)
        currentMass = state.sliderValue * nextProgress;
        currentT = stage.initialTemp; // constant 300K
        // P2 = Patm + M_load * g / A
        const P_atm = 101.3;
        const g = 9.80;
        const A = stage.crossSectionArea;
        const deltaP_kPa = (currentMass * g) / A / 1000;
        currentP = P_atm + deltaP_kPa;
        // Boyle's law: h2 = h1 * (P1 / P2)
        currentH = stage.initialHeight * (stage.initialPressure / currentP);
      } else if (stage.stage === 3) {
        // Stage 3: Isochoric heating to burst limit (slider is T_safe)
        currentT = stage.initialTemp + (state.sliderValue - stage.initialTemp) * nextProgress;
        currentH = stage.initialHeight; // fixed clamped volume
        // P = P0 * (T / T0)
        currentP = stage.initialPressure * (currentT / stage.initialTemp);
      }

      const currentVRms = calcVRms(currentT, stage.molarMass);

      if (nextProgress >= 1) {
        // Evaluate completion
        const error = Math.abs(state.sliderValue - stage.targetValue);
        const won = error <= stage.tolerance;
        let failureText = "";

        if (!won) {
          if (stage.stage === 1) {
            failureText =
              state.sliderValue < stage.targetValue
                ? `Underheated (${state.sliderValue.toFixed(1)} K). The piston stalled at ${currentH.toFixed(1)} cm, falling short of the 32.0 cm docking sensor.`
                : `Overheated (${state.sliderValue.toFixed(1)} K). Piston overextended to ${currentH.toFixed(1)} cm, overshooting the docking bracket.`;
          } else if (stage.stage === 2) {
            failureText =
              state.sliderValue < stage.targetValue
                ? `Insufficient ballast (${state.sliderValue.toFixed(1)} kg). Height remained at ${currentH.toFixed(1)} cm, failing to clear the 18.0 cm transport limit.`
                : `Excess weight (${state.sliderValue.toFixed(1)} kg). Over-compressed cylinder down to ${currentH.toFixed(1)} cm, crushing the internal sensor.`;
          } else {
            failureText =
              state.sliderValue > stage.targetValue
                ? `Pressure overload (${currentP.toFixed(1)} kPa)! Chamber burst disk ruptured violently at 250 kPa.`
                : `Underheated (${state.sliderValue.toFixed(1)} K). Chamber generated only ${currentP.toFixed(1)} kPa, failing to achieve maximum operational efficiency.`;
          }
        }

        set({
          simulationProgress: 1,
          isSimulating: false,
          temperature: currentT,
          pistonHeight: currentH,
          pressure: currentP,
          massLoad: currentMass,
          vRms: currentVRms,
          isWon: won,
          isGameOver: !won,
          failureReason: failureText,
          showResultModal: true,
        });
      } else {
        set({
          simulationProgress: nextProgress,
          temperature: currentT,
          pistonHeight: currentH,
          pressure: currentP,
          massLoad: currentMass,
          vRms: currentVRms,
        });
      }
    },
  };
});

