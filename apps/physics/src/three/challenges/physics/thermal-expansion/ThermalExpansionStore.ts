import { create } from "zustand";

export interface ThermalExpansionStageConfig {
  stage: number;
  title: string;
  stageBadge: string;
  missionObjective: string;
  missionQuestion: string;
  targetValue: number; // Stage 1: gap mm (10.8), Stage 2: deltaT °C (50.0), Stage 3: final temp °C (220.0)
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

export const THERMAL_EXPANSION_STAGES: Record<number, ThermalExpansionStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Railway Track Gap & Buckle Prevention",
    stageBadge: "STAGE 1 • LINEAR EXPANSION",
    missionObjective: "Set Expansion Gap to Prevent Track Buckling in Summer",
    missionQuestion:
      "A section of standard steel railroad track has a length of L0 = 20.0 m at -5.0°C in winter. In summer sun, the rails heat to 40.0°C (ΔT = 45.0°C). If the coefficient of linear expansion of steel is α = 1.20 × 10⁻⁵ /°C, determine the exact minimum expansion gap (g in mm) needed so adjacent rails just meet without buckling.",
    targetValue: 10.8,
    tolerance: 0.3,
    unit: "mm",
    sliderMin: 2.0,
    sliderMax: 20.0,
    sliderStep: 0.1,
    sliderDefault: 6.0,
    stepSmall: 0.1,
    stepLarge: 1.0,
    paramName: "Expansion Joint Gap (g)",
    tip: "Longer rails expand more: ΔL = L0·α·ΔT is directly proportional to initial length.",
    explanationTrap: "Gap must equal full expansion ΔL, or thermal stress (σ = Y·α·ΔT) will violently buckle the tracks.",
    mathDerivation: {
      title: "Stage 1: Linear Railway Track Expansion Derivation",
      concept:
        "When an unconstrained solid object of initial length L0 undergoes a uniform temperature change ΔT, its length changes linearly: ΔL = L0 · α · ΔT. To avoid dangerous thermal compressive stress and rail buckling, civil engineers leave an intentional expansion gap g at fishplate joints equal to the maximum anticipated thermal elongation.",
      conclusion:
        "A 20.0 m steel track undergoing a 45.0°C temperature rise expands by exactly 10.8 mm. Leaving a gap of g = 10.8 mm allows the rails to kiss smoothly at peak temperature with zero buckling stress.",
      formulas: [
        {
          label: "1. Linear Thermal Expansion",
          formula: "\\Delta L = L_0 \\cdot \\alpha \\cdot \\Delta T",
          explanation:
            "Elongation depends directly on original length L0, coefficient α, and temperature change ΔT.",
        },
        {
          label: "2. Total Temperature Differential",
          formula: "\\Delta T = T_{\\text{summer}} - T_{\\text{winter}} = 40.0^\\circ\\text{C} - (-5.0^\\circ\\text{C}) = 45.0^\\circ\\text{C}",
          explanation:
            "The full operational temperature range between freezing winter and blazing summer.",
        },
        {
          label: "3. Thermal Stress (if constrained)",
          formula: "\\sigma = Y \\cdot \\frac{\\Delta L}{L_0} = Y \\cdot \\alpha \\cdot \\Delta T",
          explanation:
            "Demonstrates that stress is independent of length—preventable only with an adequate gap.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Convert initial length to consistent units",
          math: "L_0 = 20.0\\text{ m} = 20,000\\text{ mm}",
          calculation: "20.0 m × 1,000 = 20,000 mm",
          explanation:
            "Expressing length in millimeters directly yields the gap in millimeters.",
        },
        {
          step: 2,
          title: "Identify material expansion coefficient and temperature swing",
          math: "\\alpha_{\\text{steel}} = 1.20 \\times 10^{-5}\\text{ }^\\circ\\text{C}^{-1}, \\quad \\Delta T = 45.0^\\circ\\text{C}",
          calculation: "ΔT = 40.0 - (-5.0) = 45.0°C",
          explanation:
            "Standard structural steel coefficient of thermal expansion.",
        },
        {
          step: 3,
          title: "Calculate total linear elongation (ΔL)",
          math: "\\Delta L = 20,000\\text{ mm} \\times (1.20 \\times 10^{-5}\\text{ }^\\circ\\text{C}^{-1}) \\times 45.0^\\circ\\text{C} = 10.8\\text{ mm}",
          calculation: "20,000 × 0.000012 × 45.0 = 10.8 mm",
          explanation:
            "The rail elongates by exactly 10.8 mm at 40°C.",
        },
        {
          step: 4,
          title: "Set minimum required expansion gap",
          math: "g = \\Delta L = 10.8\\text{ mm}",
          calculation: "g = 10.8 mm",
          explanation:
            "A gap of exactly 10.8 mm closes to 0 mm at 40°C without inducing compressive strain.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: Bimetallic Thermostat Strip Curvature",
    stageBadge: "STAGE 2 • DIFFERENTIAL EXPANSION",
    missionObjective: "Heat the Bimetallic Strip to Trigger the Fire Alarm Contact",
    missionQuestion:
      "A bimetallic thermostat strip of length L = 100.0 mm has top brass (α₁ = 1.90 × 10⁻⁵ /°C) and bottom steel (α₂ = 1.10 × 10⁻⁵ /°C) bonded together with total thickness 2d = 2.0 mm (d = 1.0 mm each). An electrical contact pin is positioned h = 2.0 mm directly above the free tip. Determine the exact temperature increase (ΔT in °C) required to bend the strip upward into an arc and touch the contact to sound the fire alarm.",
    targetValue: 50.0,
    tolerance: 1.0,
    unit: "°C",
    sliderMin: 10.0,
    sliderMax: 100.0,
    sliderStep: 0.5,
    sliderDefault: 25.0,
    stepSmall: 0.5,
    stepLarge: 5.0,
    paramName: "Heating Rise (ΔT)",
    tip: "A heated bimetallic strip always bends toward the metal with the smaller expansion rate.",
    explanationTrap: "Tip deflection follows δ ≈ L²/(2R), where curvature 1/R is proportional to (α₁ - α₂)·ΔT.",
    mathDerivation: {
      title: "Stage 2: Bimetallic Strip Radius of Curvature & Tip Deflection",
      concept:
        "When two metals with different expansion coefficients α₁ > α₂ are riveted or welded along their interface, the strip cannot expand straight. The higher-expansion metal (brass) is forced into a longer outer arc while the lower-expansion metal (steel) stays on the shorter inner arc. This forces the assembly to bend into a circular arc of radius R.",
      conclusion:
        "With strip length L = 100 mm and thickness 2d = 2 mm, a temperature rise of ΔT = 50.0°C curves the strip into an arc of radius R = 2.5 m, deflecting the free tip upward by exactly 2.0 mm to complete the circuit.",
      formulas: [
        {
          label: "1. Radius of Curvature (R)",
          formula: "\\frac{1}{R} = \\frac{(\\alpha_1 - \\alpha_2) \\cdot \\Delta T}{2d}",
          explanation:
            "Curvature 1/R is directly proportional to the difference in coefficients (α₁ - α₂) and temperature rise ΔT, inversely proportional to total thickness 2d.",
        },
        {
          label: "2. Free Tip Deflection (δ)",
          formula: "\\delta \\approx \\frac{L^2}{2R} = \\frac{L^2 \\cdot (\\alpha_1 - \\alpha_2) \\cdot \\Delta T}{4d}",
          explanation:
            "Derived from circle geometry: x² + (y - R)² = R² → y ≈ x² / (2R) evaluated at x = L.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify differential expansion coefficient (Δα)",
          math: "\\Delta \\alpha = \\alpha_{\\text{brass}} - \\alpha_{\\text{steel}} = (1.90 - 1.10) \\times 10^{-5} = 0.80 \\times 10^{-5}\\text{ }^\\circ\\text{C}^{-1}",
          calculation: "1.90e-5 - 1.10e-5 = 0.80e-5 /°C",
          explanation:
            "Brass expands 0.80 × 10⁻⁵ per degree faster than steel.",
        },
        {
          step: 2,
          title: "Determine required radius of curvature (R) for 2.0 mm deflection",
          math: "\\delta = \\frac{L^2}{2R} \\implies R = \\frac{L^2}{2\\delta} = \\frac{(100.0\\text{ mm})^2}{2 \\times 2.0\\text{ mm}} = 2,500\\text{ mm} = 2.50\\text{ m}",
          calculation: "10,000 / 4 = 2,500 mm = 2.50 m",
          explanation:
            "A 2.50-meter radius arc lifts the 100 mm tip upward by 2.0 mm.",
        },
        {
          step: 3,
          title: "Solve for required temperature increase (ΔT)",
          math: "\\Delta T = \\frac{2d}{R \\cdot \\Delta \\alpha} = \\frac{2.0\\text{ mm}}{2,500\\text{ mm} \\times 0.80 \\times 10^{-5}\\text{ }^\\circ\\text{C}^{-1}} = 50.0^\\circ\\text{C}",
          calculation: "2.0 / (2,500 × 0.000008) = 50.0°C",
          explanation:
            "Heating by exactly 50.0°C raises the tip 2.0 mm, sounding the alarm.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: Thermal Hole & Ring Clearance (Shrink-Fitting)",
    stageBadge: "STAGE 3 • THERMAL CAVITY EXPANSION",
    missionObjective: "Expand the Brass Ring Cavity so the Steel Bearing Drops Through",
    missionQuestion:
      "A precision brass ring at 20.0°C has an inner cavity diameter of D0 = 50.00 mm. An oversized steel bearing ball has a fixed diameter of D_ball = 50.20 mm and cannot pass through. Given α_brass = 2.00 × 10⁻⁵ /°C, determine the final heating temperature (T in °C) of the ring so its inner hole expands to match 50.20 mm, allowing the ball to drop through.",
    targetValue: 220.0,
    tolerance: 1.5,
    unit: "°C",
    sliderMin: 80.0,
    sliderMax: 300.0,
    sliderStep: 1.0,
    sliderDefault: 120.0,
    stepSmall: 1.0,
    stepLarge: 10.0,
    paramName: "Ring Final Temp (T)",
    tip: "A hole inside solid metal expands under heat exactly as if it were filled with solid metal.",
    explanationTrap: "Heating never shrinks a cavity: every atom expands outward away from every other atom.",
    mathDerivation: {
      title: "Stage 3: Thermal Expansion of Cavities & Shrink-Fit Mechanics",
      concept:
        "When an object containing a hole or cavity is heated, the cavity expands at the exact same fractional rate as the parent material: ΔD = D0 · α · ΔT. This counterintuitive principle is the foundation of mechanical shrink-fitting in industrial engineering (mounting train wheels onto steel axles and engine bearings).",
      conclusion:
        "The inner hole must enlarge by ΔD = 50.20 - 50.00 = 0.20 mm. With D0 = 50.00 mm and α_brass = 2.00 × 10⁻⁵ /°C, a temperature increase of ΔT = 200.0°C is required. Heating the ring from 20.0°C to 220.0°C permits the ball to drop through effortlessly.",
      formulas: [
        {
          label: "1. Cavity Linear Expansion",
          formula: "\\Delta D = D_0 \\cdot \\alpha \\cdot \\Delta T",
          explanation:
            "Inner hole diameter expands identically to a solid cylinder of the same material.",
        },
        {
          label: "2. Final Temperature Relation",
          formula: "T_{\\text{final}} = T_0 + \\Delta T",
          explanation:
            "Final absolute temperature of the ring after heating from ambient baseline T0 = 20.0°C.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Calculate required diametric expansion (ΔD)",
          math: "\\Delta D = D_{\\text{ball}} - D_0 = 50.20\\text{ mm} - 50.00\\text{ mm} = 0.20\\text{ mm}",
          calculation: "50.20 - 50.00 = 0.20 mm",
          explanation:
            "The ring aperture must expand by at least 0.20 mm for clearance.",
        },
        {
          step: 2,
          title: "Compute required temperature change (ΔT)",
          math: "\\Delta T = \\frac{\\Delta D}{D_0 \\cdot \\alpha_{\\text{brass}}} = \\frac{0.20\\text{ mm}}{50.00\\text{ mm} \\times 2.00 \\times 10^{-5}\\text{ }^\\circ\\text{C}^{-1}} = 200.0^\\circ\\text{C}",
          calculation: "0.20 / (50.00 × 0.000020) = 200.0°C",
          explanation:
            "The ring must be heated by ΔT = 200.0°C above baseline.",
        },
        {
          step: 3,
          title: "Determine final ring temperature (T_final)",
          math: "T_{\\text{final}} = T_0 + \\Delta T = 20.0^\\circ\\text{C} + 200.0^\\circ\\text{C} = 220.0^\\circ\\text{C}",
          calculation: "20.0 + 200.0 = 220.0°C",
          explanation:
            "Target dial value: T_final = 220.0°C.",
        },
      ],
    },
  },
};

export type SimulationStatus = "idle" | "running" | "success" | "fail_low" | "fail_high";

export interface ThermalExpansionStore {
  currentStage: number;
  isMissionStarted: boolean;
  missionStartedAt: number;
  cameraResetKey: number;
  status: SimulationStatus;
  simulationProgress: number; // 0 to 1
  showResultModal: boolean;
  failureReason: string;

  // Slider value per stage
  sliderValue: number;

  // Dynamic simulation telemetry
  currentTemp: number;
  currentExpansionMm: number;
  currentTipDeflectionMm: number;
  currentHoleDiameterMm: number;
  circuitClosed: boolean;
  ballDropped: boolean;
  railBuckled: boolean;

  // Actions
  setSliderValue: (val: number) => void;
  adjustSliderValue: (delta: number) => void;
  startMission: () => void;
  launchSimulation: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  setStage: (stage: number) => void;
  closeResultModal: () => void;
  openExplanationModal: () => void;
  tickSimulation: (dt: number) => void;
}

export const useThermalExpansionStore = create<ThermalExpansionStore>((set, get) => ({
  currentStage: 1,
  isMissionStarted: false,
  missionStartedAt: 0,
  cameraResetKey: 0,
  status: "idle",
  simulationProgress: 0,
  showResultModal: false,
  failureReason: "",

  sliderValue: THERMAL_EXPANSION_STAGES[1].sliderDefault,

  currentTemp: -5.0,
  currentExpansionMm: 0,
  currentTipDeflectionMm: 0,
  currentHoleDiameterMm: 50.0,
  circuitClosed: false,
  ballDropped: false,
  railBuckled: false,

  setSliderValue: (val: number) => {
    const { status, currentStage } = get();
    if (status === "running") return;
    const stage = THERMAL_EXPANSION_STAGES[currentStage];
    const clamped = Math.min(stage.sliderMax, Math.max(stage.sliderMin, val));
    set({
      sliderValue: Number(clamped.toFixed(2)),
    });
  },

  adjustSliderValue: (delta: number) => {
    const { status, sliderValue, currentStage } = get();
    if (status === "running") return;
    const stage = THERMAL_EXPANSION_STAGES[currentStage];
    const clamped = Math.min(stage.sliderMax, Math.max(stage.sliderMin, sliderValue + delta));
    set({
      sliderValue: Number(clamped.toFixed(2)),
    });
  },

  startMission: () => {
    set({
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      cameraResetKey: get().cameraResetKey + 1,
    });
  },

  closeResultModal: () => {
    set({ showResultModal: false });
  },

  openExplanationModal: () => {
    set({ showResultModal: true });
  },

  launchSimulation: () => {
    const { currentStage, sliderValue } = get();
    const stage = THERMAL_EXPANSION_STAGES[currentStage];
    const diff = sliderValue - stage.targetValue;
    const passed = Math.abs(diff) <= stage.tolerance;

    let failMsg = "";
    let finalStatus: SimulationStatus = "success";

    if (!passed) {
      if (diff > 0) {
        finalStatus = "fail_high";
        if (currentStage === 1) {
          failMsg = `Gap of ${sliderValue.toFixed(1)} mm is too wide! Even at 40°C, a remaining gap causes wheel impact vibration and derailment risk.`;
        } else if (currentStage === 2) {
          failMsg = `Heating by ${sliderValue.toFixed(1)}°C overheats the strip! Excessive deflection (${((sliderValue / 50.0) * 2.0).toFixed(2)} mm) deforms the bimetallic junction permanently.`;
        } else {
          failMsg = `Temperature ${sliderValue.toFixed(1)}°C is unnecessarily high! While the ball drops through, such excessive thermal strain softens the brass ring.`;
        }
      } else {
        finalStatus = "fail_low";
        if (currentStage === 1) {
          failMsg = `Gap of ${sliderValue.toFixed(1)} mm is too tight! The rails expand by 10.8 mm, causing compressive crush and violent track buckling!`;
        } else if (currentStage === 2) {
          failMsg = `Heating by ${sliderValue.toFixed(1)}°C is insufficient! The tip only rises ${((sliderValue / 50.0) * 2.0).toFixed(2)} mm and fails to touch the 2.0 mm contact pin.`;
        } else {
          failMsg = `Temperature ${sliderValue.toFixed(1)}°C expands the ring to only ${(50.0 + ((sliderValue - 20) * 0.001)).toFixed(2)} mm—still too small for the 50.20 mm steel ball!`;
        }
      }
    }

    set({
      status: "running",
      simulationProgress: 0,
      showResultModal: false,
      failureReason: failMsg,
      circuitClosed: false,
      ballDropped: false,
      railBuckled: false,
    });
  },

  resetSimulation: () => {
    const { currentStage } = get();
    const stage = THERMAL_EXPANSION_STAGES[currentStage];
    set({
      status: "idle",
      simulationProgress: 0,
      showResultModal: false,
      failureReason: "",
      currentTemp: currentStage === 1 ? -5.0 : 20.0,
      currentExpansionMm: 0,
      currentTipDeflectionMm: 0,
      currentHoleDiameterMm: 50.0,
      circuitClosed: false,
      ballDropped: false,
      railBuckled: false,
    });
  },

  nextStage: () => {
    const { currentStage } = get();
    if (currentStage < 3) {
      const next = currentStage + 1;
      const nextConfig = THERMAL_EXPANSION_STAGES[next];
      set({
        currentStage: next,
        isMissionStarted: false,
        missionStartedAt: 0,
        cameraResetKey: get().cameraResetKey + 1,
        status: "idle",
        simulationProgress: 0,
        showResultModal: false,
        failureReason: "",
        sliderValue: nextConfig.sliderDefault,
        currentTemp: next === 1 ? -5.0 : 20.0,
        currentExpansionMm: 0,
        currentTipDeflectionMm: 0,
        currentHoleDiameterMm: 50.0,
        circuitClosed: false,
        ballDropped: false,
        railBuckled: false,
      });
    }
  },

  setStage: (stage: number) => {
    if (stage >= 1 && stage <= 3) {
      const stageConfig = THERMAL_EXPANSION_STAGES[stage];
      set({
        currentStage: stage,
        isMissionStarted: false,
        missionStartedAt: 0,
        cameraResetKey: get().cameraResetKey + 1,
        status: "idle",
        simulationProgress: 0,
        showResultModal: false,
        failureReason: "",
        sliderValue: stageConfig.sliderDefault,
        currentTemp: stage === 1 ? -5.0 : 20.0,
        currentExpansionMm: 0,
        currentTipDeflectionMm: 0,
        currentHoleDiameterMm: 50.0,
        circuitClosed: false,
        ballDropped: false,
        railBuckled: false,
      });
    }
  },

  tickSimulation: (dt: number) => {
    const { status, simulationProgress, currentStage, sliderValue } = get();
    if (status !== "running") return;

    // Smooth ~3.0 second physics progression
    const newProgress = Math.min(1, simulationProgress + dt * 0.34);
    const stage = THERMAL_EXPANSION_STAGES[currentStage];

    if (currentStage === 1) {
      // Rails heat from -5°C to 40°C
      const temp = -5.0 + 45.0 * Math.sin((newProgress * Math.PI) / 2);
      // Actual expansion of the rail (10.8 mm max)
      const expansion = 10.8 * newProgress;
      // If chosen gap is less than 10.5 mm, rails collide and buckle upward
      const isBuckling = sliderValue < 10.5 && newProgress > (sliderValue / 10.8);

      set({
        simulationProgress: newProgress,
        currentTemp: temp,
        currentExpansionMm: expansion,
        railBuckled: isBuckling,
      });
    } else if (currentStage === 2) {
      // Flame heats strip by sliderValue
      const tempRise = sliderValue * Math.sin((newProgress * Math.PI) / 2);
      // Deflection: delta = (tempRise / 50.0) * 2.0 mm
      const deflection = (tempRise / 50.0) * 2.0;
      const isContact = deflection >= 1.95;

      set({
        simulationProgress: newProgress,
        currentTemp: 20.0 + tempRise,
        currentTipDeflectionMm: deflection,
        circuitClosed: isContact,
      });
    } else if (currentStage === 3) {
      // Burner heats brass ring from 20°C toward sliderValue
      const temp = 20.0 + (sliderValue - 20.0) * Math.sin((newProgress * Math.PI) / 2);
      // D(T) = 50.0 + (temp - 20.0) * 50.0 * 2.0e-5
      const holeD = 50.0 + (temp - 20.0) * 0.001;
      const canDrop = holeD >= 50.19 && newProgress > 0.65;

      set({
        simulationProgress: newProgress,
        currentTemp: temp,
        currentHoleDiameterMm: holeD,
        ballDropped: canDrop,
      });
    }

    if (newProgress >= 1) {
      const diff = sliderValue - stage.targetValue;
      const passed = Math.abs(diff) <= stage.tolerance;
      const finalStatus: SimulationStatus = passed
        ? "success"
        : diff > 0
        ? "fail_high"
        : "fail_low";

      set({
        status: finalStatus,
        showResultModal: true,
      });
    }
  },
}));

