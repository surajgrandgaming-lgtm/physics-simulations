import { create } from "zustand";

export interface CalorimetryStageConfig {
  stage: number;
  title: string;
  stageBadge: string;
  missionObjective: string;
  missionQuestion: string;
  initialTemp: number; // in Celsius
  targetValue: number; // Stage 1: Teq (23.0°C), Stage 2: c_metal (0.114 cal/g·°C), Stage 3: m_steam (20.0 g)
  tolerance: number;
  unit: string;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;
  paramName: string;
  waterMass: number; // grams
  substanceName: string;
  substanceMass: number; // grams
  substanceInitialTemp: number; // °C
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

export const CALORIMETRY_STAGES: Record<number, CalorimetryStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Multi-Step Ice-Water Equilibrium",
    stageBadge: "STAGE 1 • LATENT FUSION",
    missionObjective: "Calculate Equilibrium Temp (T_eq)",
    missionQuestion:
      "A laboratory calorimeter contains 200 g of warm water at 50.0°C. A student adds 50.0 g of solid ice cubes directly from the freezer at -10.0°C. Assuming an insulated ideal vessel, calculate the final equilibrium temperature (T_eq) once all ice has completely melted into liquid water.",
    initialTemp: 50.0,
    targetValue: 23.0,
    tolerance: 0.5,
    unit: "°C",
    sliderMin: 5.0,
    sliderMax: 40.0,
    sliderStep: 0.1,
    sliderDefault: 15.0,
    stepSmall: 0.1,
    stepLarge: 1.0,
    paramName: "Equilibrium Temperature (T_eq)",
    waterMass: 200.0,
    substanceName: "Ice Cubes (-10°C)",
    substanceMass: 50.0,
    substanceInitialTemp: -10.0,
    tip: "Phase change requires a massive hidden energy reservoir: melting 1 gram of ice absorbs 80 calories without changing temperature by even 0.1°C!",
    explanationTrap:
      "Common Student Mistake: Forgetting that sub-zero ice must first absorb sensible heat (c_ice = 0.50 cal/g·°C) to reach 0°C before the latent heat of fusion (80 cal/g) begins to melt it.",
    mathDerivation: {
      title: "Stage 1: Ice-Water Thermal Equilibrium Derivation",
      concept:
        "The Principle of Calorimetry dictates that in a thermally insulated system, no heat escapes to the environment: Σ Q_lost = Σ Q_gained. Thermal energy flows spontaneously from hot water to cold ice until all components share a single, uniform equilibrium temperature T_eq. Here, the ice undergoes three consecutive thermal phases: (1) Sensible warming from -10°C to 0°C, (2) Isothermal latent fusion melting at 0°C, and (3) Sensible warming of the newly formed 0°C water up to T_eq.",
      conclusion:
        "The 200 g of water releases exactly 5,400 cal as it cools from 50.0°C to 23.0°C. This perfectly matches the 250 cal to warm the ice, 4,000 cal to melt it, and 1,150 cal to warm the melted water to 23.0°C. Thermal equilibrium: T_eq = 23.0°C.",
      formulas: [
        {
          label: "1. Conservation of Thermal Energy",
          formula: "\\sum Q_{\\text{lost}} = \\sum Q_{\\text{gained}}",
          explanation:
            "Heat lost by warm water as it cools equals total heat absorbed by ice warming, melting, and equilibrating.",
        },
        {
          label: "2. Sensible Heat Transfer (Temperature Change)",
          formula: "Q = m \\cdot c \\cdot \\Delta T",
          explanation:
            "Governs temperature variation without phase change (c_w = 1.00 cal/g·°C, c_ice = 0.50 cal/g·°C).",
        },
        {
          label: "3. Latent Heat of Fusion (Phase Transformation)",
          formula: "Q_{\\text{fusion}} = m_i \\cdot L_f",
          explanation:
            "Energy required to break the crystalline hydrogen bond lattice of ice at 0°C (L_f = 80.0 cal/g).",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Heat required to warm ice from -10.0°C to 0.0°C",
          math: "Q_1 = m_i \\cdot c_{\\text{ice}} \\cdot (0 - T_i) = 50.0 \\times 0.50 \\times 10.0 = 250\\text{ cal}",
          calculation: "50 g × 0.50 cal/(g·°C) × 10°C = 250 cal",
          explanation:
            "Before ice can melt, its solid crystal lattice must be warmed up to the melting point of 0°C.",
        },
        {
          step: 2,
          title: "Latent heat required to completely melt ice at 0.0°C",
          math: "Q_2 = m_i \\cdot L_f = 50.0\\text{ g} \\times 80.0\\text{ cal/g} = 4,000\\text{ cal}",
          calculation: "50 g × 80.0 cal/g = 4,000 cal",
          explanation:
            "Isothermal phase transformation: temperature stays strictly locked at 0°C while absorbs 4,000 calories.",
        },
        {
          step: 3,
          title: "Heat required to warm melted ice water from 0.0°C to T_eq",
          math: "Q_3 = m_i \\cdot c_w \\cdot (T_{\\text{eq}} - 0) = 50.0 \\times 1.00 \\times T_{\\text{eq}} = 50.0 \\cdot T_{\\text{eq}}\\text{ cal}",
          calculation: "50 g × 1.00 cal/(g·°C) × T_eq = 50.0 · T_eq cal",
          explanation:
            "Once melted into liquid at 0°C, the water warms up toward the final mixture temperature.",
        },
        {
          step: 4,
          title: "Heat released by warm water cooling from 50.0°C to T_eq",
          math: "Q_{\\text{lost}} = m_w \\cdot c_w \\cdot (50.0 - T_{\\text{eq}}) = 200.0 \\times 1.00 \\times (50.0 - T_{\\text{eq}}) = 10,000 - 200.0 \\cdot T_{\\text{eq}}",
          calculation: "200 g × 1.00 × (50 - T_eq) = 10,000 - 200·T_eq cal",
          explanation:
            "Sensible heat released as the warm bulk water cools down to thermal equilibrium.",
        },
        {
          step: 5,
          title: "Equate Heat Lost = Heat Gained to solve for T_eq",
          math: "10,000 - 200.0 \\cdot T_{\\text{eq}} = 250 + 4,000 + 50.0 \\cdot T_{\\text{eq}} \\implies 250.0 \\cdot T_{\\text{eq}} = 5,750",
          calculation: "T_eq = 5,750 / 250.0 = 23.0°C",
          explanation:
            "Combining linear terms yields the exact final temperature: T_eq = 23.0°C.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: Water Equivalent & Metal Specific Heat",
    stageBadge: "STAGE 2 • METHOD OF MIXTURES",
    missionObjective: "Calculate Specific Heat (c_metal)",
    missionQuestion:
      "A 100.0 g copper calorimeter (c_cu = 0.100 cal/g·°C, water equivalent W = 10.0 g) contains 150.0 g of water at 20.0°C. A 200.0 g heated metal alloy slug at 100.0°C is lowered into the water. The system reaches equilibrium at 30.0°C. Determine the specific heat capacity (c_metal) of the unknown alloy.",
    initialTemp: 20.0,
    targetValue: 0.114,
    tolerance: 0.01,
    unit: "cal/g·°C",
    sliderMin: 0.04,
    sliderMax: 0.28,
    sliderStep: 0.005,
    sliderDefault: 0.07,
    stepSmall: 0.001,
    stepLarge: 0.01,
    paramName: "Specific Heat Capacity (c_metal)",
    waterMass: 150.0,
    substanceName: "Heated Alloy Slug (100°C)",
    substanceMass: 200.0,
    substanceInitialTemp: 100.0,
    tip: "A calorimeter vessel is never an invisible spectator: its copper body absorbs heat in parallel with the water! The 'water equivalent' W = m_cal · (c_cal / c_w) translates the vessel into equivalent grams of water.",
    explanationTrap:
      "Critical Pitfall: Ignoring the heat capacity of the calorimeter vessel itself leads to an underestimation of the metal's heat capacity by over 6%. Always add W = 10 g to the 150 g of water.",
    mathDerivation: {
      title: "Stage 2: Calorimeter Water Equivalent & Metal Specific Heat",
      concept:
        "The Method of Mixtures is standard physics laboratory procedure for measuring specific heat. When a hot solid is immersed into a liquid inside a calorimeter, heat flows from the metal into both the liquid and the inner walls of the container. We define the Water Equivalent W = m_cal · c_cal / c_w as the mass of water that would absorb the exact same amount of thermal energy as the container per degree temperature rise.",
      conclusion:
        "The water and vessel together have an effective thermal capacity of 160.0 cal/°C, absorbing 1,600 cal across their 10°C rise. The metal cooling from 100°C to 30°C releases 14,000 · c_metal cal. Equating both yields c_metal = 0.114 cal/g·°C.",
      formulas: [
        {
          label: "1. Water Equivalent of Calorimeter Vessel",
          formula: "W = m_{\\text{cal}} \\cdot \\left(\\frac{c_{\\text{cal}}}{c_w}\\right) = 100.0 \\times 0.100 = 10.0\\text{ g}",
          explanation:
            "Represents how many grams of pure water would possess the identical heat capacity as the copper cup.",
        },
        {
          label: "2. Total Heat Absorbed by (Water + Calorimeter)",
          formula: "Q_{\\text{gained}} = (m_w + W) \\cdot c_w \\cdot (T_{\\text{eq}} - T_1)",
          explanation:
            "Effective thermal mass is (150 g water + 10 g equivalent) = 160 g.",
        },
        {
          label: "3. Heat Released by Cooling Metal Sample",
          formula: "Q_{\\text{lost}} = M_m \\cdot c_{\\text{metal}} \\cdot (T_m - T_{\\text{eq}})",
          explanation:
            "Metal slug of mass 200 g cools from 100°C down to 30°C (ΔT = 70°C).",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Calculate Effective Water Equivalent (W) of Copper Container",
          math: "W = 100.0\\text{ g} \\times 0.100\\text{ cal/g}\\cdot^\\circ\\text{C} / 1.00 = 10.0\\text{ g}",
          calculation: "100.0 g × 0.100 = 10.0 g of water equivalent",
          explanation:
            "The 100 g copper cup behaves thermally identical to 10 g of liquid water.",
        },
        {
          step: 2,
          title: "Compute Total Heat Absorbed by Water + Vessel",
          math: "Q_{\\text{gained}} = (150.0 + 10.0) \\times 1.00 \\times (30.0 - 20.0) = 160.0 \\times 10.0 = 1,600\\text{ cal}",
          calculation: "160 g × 1.00 cal/(g·°C) × 10.0°C = 1,600 cal",
          explanation:
            "The water and vessel warm by 10.0°C, absorbing 1,600 calories.",
        },
        {
          step: 3,
          title: "Formulate Heat Lost by Cooling Alloy Slug",
          math: "Q_{\\text{lost}} = 200.0\\text{ g} \\times c_{\\text{metal}} \\times (100.0 - 30.0) = 14,000 \\cdot c_{\\text{metal}}\\text{ cal}",
          calculation: "200.0 g × 70.0°C × c_metal = 14,000 · c_metal cal",
          explanation:
            "Metal releases energy across its 70.0°C temperature drop.",
        },
        {
          step: 4,
          title: "Solve for Unknown Specific Heat Capacity c_metal",
          math: "14,000 \\cdot c_{\\text{metal}} = 1,600 \\implies c_{\\text{metal}} = \\frac{1,600}{14,000} \\approx 0.114\\text{ cal/g}\\cdot^\\circ\\text{C}",
          calculation: "c_metal = 1,600 / 14,000 ≈ 0.114 cal/g·°C",
          explanation:
            "Matches brass / zinc alloy specific heat capacity.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: Ice-Steam Condensation Balance",
    stageBadge: "STAGE 3 • DUAL PHASE TRANSITION",
    missionObjective: "Calculate Steam Mass (m_steam)",
    missionQuestion:
      "An insulated vessel contains 100.0 g of ice at 0.0°C. High-energy steam at 100.0°C (L_v = 540.0 cal/g) is bubbled through a diffuser wand. Determine the exact mass of steam (m_steam) needed to completely melt all ice and heat the entire resulting water mixture to 40.0°C.",
    initialTemp: 0.0,
    targetValue: 20.0,
    tolerance: 0.8,
    unit: "g",
    sliderMin: 5.0,
    sliderMax: 45.0,
    sliderStep: 0.5,
    sliderDefault: 12.0,
    stepSmall: 0.5,
    stepLarge: 2.0,
    paramName: "Steam Mass Injected (m_steam)",
    waterMass: 100.0,
    substanceName: "Steam Jet (100°C)",
    substanceMass: 20.0,
    substanceInitialTemp: 100.0,
    tip: "Steam is a thermal powerhouse: condensing 1 gram of steam delivers 540 calories — nearly 7 times more heat than 1 gram of boiling water cooling down to 20°C!",
    explanationTrap:
      "Common Oversight: After steam condenses into water at 100°C, that hot water also cools from 100°C down to 40°C, providing an additional 60 cal/g of sensible heat (totaling 600 cal/g).",
    mathDerivation: {
      title: "Stage 3: Ice-Steam Dual Phase Transition Derivation",
      concept:
        "This challenge pairs the highest latent heat of nature (vaporization, L_v = 540 cal/g) with latent fusion (L_f = 80 cal/g). When dry steam at 100°C enters cold water, it collapses instantaneously into liquid water at 100°C, releasing its latent heat of vaporization. That newly formed boiling liquid then continues releasing sensible heat as it cools down to the 40°C target temperature. Meanwhile, the ice absorbs energy to melt into liquid water at 0°C, then warms from 0°C to 40°C.",
      conclusion:
        "Each gram of injected steam releases 540 cal (condensation) + 60 cal (cooling 100°C→40°C) = 600 cal/g. Melting 100 g of ice and warming it to 40°C requires 12,000 cal. Dividing 12,000 / 600 gives exactly m_steam = 20.0 g.",
      formulas: [
        {
          label: "1. Latent Heat of Vaporization",
          formula: "Q_{\\text{condense}} = m_s \\cdot L_v = m_s \\times 540.0\\text{ cal/g}",
          explanation:
            "Energy released as vapor collapses into liquid state at constant 100°C.",
        },
        {
          label: "2. Total Heat Released per Gram of Steam",
          formula: "q_{\\text{steam}} = L_v + c_w \\cdot (100.0 - T_{\\text{target}}) = 540.0 + 1.00 \\times 60.0 = 600.0\\text{ cal/g}",
          explanation:
            "Includes both latent condensation and sensible cooling down to 40.0°C.",
        },
        {
          label: "3. Total Heat Required by 100 g of Ice",
          formula: "Q_{\\text{ice}} = m_i \\cdot L_f + m_i \\cdot c_w \\cdot (40.0 - 0) = 8,000 + 4,000 = 12,000\\text{ cal}",
          explanation:
            "8,000 cal for complete melting + 4,000 cal to warm the melted water to 40°C.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Heat required to completely melt 100.0 g of ice at 0.0°C",
          math: "Q_{\\text{melt}} = 100.0\\text{ g} \\times 80.0\\text{ cal/g} = 8,000\\text{ cal}",
          calculation: "100.0 g × 80.0 cal/g = 8,000 cal",
          explanation:
            "Latent heat of fusion required to liquefy the entire ice mass.",
        },
        {
          step: 2,
          title: "Heat required to warm melted water from 0.0°C to 40.0°C",
          math: "Q_{\\text{warm}} = 100.0\\text{ g} \\times 1.00\\text{ cal/g}\\cdot^\\circ\\text{C} \\times 40.0^\\circ\\text{C} = 4,000\\text{ cal}",
          calculation: "100.0 g × 1.00 × 40.0°C = 4,000 cal",
          explanation:
            "Sensible heat needed to elevate the cold melted water to 40.0°C.",
        },
        {
          step: 3,
          title: "Calculate Total Energy Absorbed by Ice System",
          math: "Q_{\\text{gained}} = Q_{\\text{melt}} + Q_{\\text{warm}} = 8,000 + 4,000 = 12,000\\text{ cal}",
          calculation: "8,000 cal + 4,000 cal = 12,000 cal",
          explanation:
            "The steam must deliver exactly 12,000 cal to meet the mission criteria.",
        },
        {
          step: 4,
          title: "Energy Delivered per Gram of 100.0°C Steam",
          math: "q_{\\text{unit}} = 540.0 + 1.00 \\times (100.0 - 40.0) = 540.0 + 60.0 = 600.0\\text{ cal/g}",
          calculation: "540 cal/g (latent) + 60 cal/g (sensible) = 600.0 cal/g",
          explanation:
            "Every gram of condensing steam contributes 600 calories of total heat.",
        },
        {
          step: 5,
          title: "Calculate Required Steam Mass m_steam",
          math: "m_{\\text{steam}} = \\frac{12,000\\text{ cal}}{600.0\\text{ cal/g}} = 20.0\\text{ g}",
          calculation: "12,000 / 600.0 = 20.0 g",
          explanation:
            "Exactly 20.0 g of steam achieves equilibrium at 40.0°C.",
        },
      ],
    },
  },
};

export type SimulationStatus = "idle" | "running" | "success" | "fail_low" | "fail_high";

export interface CalorimetryStore {
  currentStage: number;
  isMissionStarted: boolean; // false shows stage mission card, true begins camera transition + simulation
  missionStartedAt: number;
  cameraResetKey: number;
  status: SimulationStatus;
  simulationProgress: number; // 0 to 1
  showResultModal: boolean;
  failureReason: string;

  // User input per stage
  sliderValue: number;

  // Dynamic simulation telemetry
  currentWaterTemp: number;
  iceRemainingGrams: number;
  heatTransferredCal: number;
  substanceTemp: number;
  waterLevelOffset: number; // visual water level rise
  stirrerRotation: number;

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

export const useCalorimetryStore = create<CalorimetryStore>((set, get) => ({
  currentStage: 1,
  isMissionStarted: false,
  missionStartedAt: 0,
  cameraResetKey: 0,
  status: "idle",
  simulationProgress: 0,
  showResultModal: false,
  failureReason: "",

  sliderValue: CALORIMETRY_STAGES[1].sliderDefault,

  currentWaterTemp: CALORIMETRY_STAGES[1].initialTemp,
  iceRemainingGrams: 50.0,
  heatTransferredCal: 0,
  substanceTemp: CALORIMETRY_STAGES[1].substanceInitialTemp,
  waterLevelOffset: 0,
  stirrerRotation: 0,

  setSliderValue: (val: number) => {
    const { status, currentStage } = get();
    if (status === "running") return;
    const stage = CALORIMETRY_STAGES[currentStage];
    const clamped = Math.min(stage.sliderMax, Math.max(stage.sliderMin, val));
    set({
      sliderValue: Number(clamped.toFixed(3)),
    });
  },

  adjustSliderValue: (delta: number) => {
    const { status, sliderValue, currentStage } = get();
    if (status === "running") return;
    const stage = CALORIMETRY_STAGES[currentStage];
    const clamped = Math.min(stage.sliderMax, Math.max(stage.sliderMin, sliderValue + delta));
    set({
      sliderValue: Number(clamped.toFixed(3)),
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
    const stage = CALORIMETRY_STAGES[currentStage];
    const diff = sliderValue - stage.targetValue;
    const passed = Math.abs(diff) <= stage.tolerance;

    let failMsg = "";
    let finalStatus: SimulationStatus = "success";

    if (!passed) {
      if (diff > 0) {
        finalStatus = "fail_high";
        if (currentStage === 1) {
          failMsg = `Selected ${sliderValue.toFixed(1)}°C is too high! The warm water would need to release more heat than it can give to warm and melt ice up to this temperature.`;
        } else if (currentStage === 2) {
          failMsg = `Specific heat ${sliderValue.toFixed(3)} cal/g·°C is too high! A block with this high specific heat would dump surplus energy and overheat the water past 30.0°C.`;
        } else {
          failMsg = `Steam mass ${sliderValue.toFixed(1)} g is excessive! High latent heat (540 cal/g) overheats or boils the mixture beyond the 40.0°C target.`;
        }
      } else {
        finalStatus = "fail_low";
        if (currentStage === 1) {
          failMsg = `Selected ${sliderValue.toFixed(1)}°C is too low! The 200 g water releases more thermal energy than required at this temperature, so equilibrium settles higher.`;
        } else if (currentStage === 2) {
          failMsg = `Specific heat ${sliderValue.toFixed(3)} cal/g·°C is too low! The block lacks sufficient stored thermal energy to raise the water and calorimeter to 30.0°C.`;
        } else {
          failMsg = `Steam mass ${sliderValue.toFixed(1)} g is insufficient! It delivers too little latent heat to melt the 100 g ice and elevate the mixture to 40.0°C.`;
        }
      }
    }

    set({
      status: "running",
      simulationProgress: 0,
      showResultModal: false,
      failureReason: failMsg,
    });
  },

  resetSimulation: () => {
    const { currentStage } = get();
    const stage = CALORIMETRY_STAGES[currentStage];
    set({
      status: "idle",
      simulationProgress: 0,
      showResultModal: false,
      failureReason: "",
      currentWaterTemp: stage.initialTemp,
      iceRemainingGrams: currentStage === 1 ? 50.0 : currentStage === 3 ? 100.0 : 0,
      substanceTemp: stage.substanceInitialTemp,
      heatTransferredCal: 0,
      waterLevelOffset: 0,
      stirrerRotation: 0,
    });
  },

  nextStage: () => {
    const { currentStage } = get();
    if (currentStage < 3) {
      const next = currentStage + 1;
      const nextStageConfig = CALORIMETRY_STAGES[next];
      set({
        currentStage: next,
        isMissionStarted: false,
        missionStartedAt: 0,
        cameraResetKey: get().cameraResetKey + 1,
        status: "idle",
        simulationProgress: 0,
        showResultModal: false,
        failureReason: "",
        sliderValue: nextStageConfig.sliderDefault,
        currentWaterTemp: nextStageConfig.initialTemp,
        substanceTemp: nextStageConfig.substanceInitialTemp,
        iceRemainingGrams: next === 2 ? 0 : next === 3 ? 100.0 : 50.0,
        heatTransferredCal: 0,
        waterLevelOffset: 0,
        stirrerRotation: 0,
      });
    }
  },

  setStage: (stage: number) => {
    if (stage >= 1 && stage <= 3) {
      const stageConfig = CALORIMETRY_STAGES[stage];
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
        currentWaterTemp: stageConfig.initialTemp,
        substanceTemp: stageConfig.substanceInitialTemp,
        iceRemainingGrams: stage === 1 ? 50.0 : stage === 3 ? 100.0 : 0,
        heatTransferredCal: 0,
        waterLevelOffset: 0,
        stirrerRotation: 0,
      });
    }
  },

  tickSimulation: (dt: number) => {
    const { status, simulationProgress, currentStage, sliderValue } = get();
    if (status !== "running") return;

    // Smooth 3.2 second physics trajectory
    const newProgress = Math.min(1, simulationProgress + dt * 0.32);
    const stage = CALORIMETRY_STAGES[currentStage];

    // Stirrer rotates rapidly during active mixing
    const newStirrer = get().stirrerRotation + dt * 14.0;

    if (currentStage === 1) {
      // Warm water (50°C) cools down toward sliderValue
      const temp = 50.0 - (50.0 - sliderValue) * Math.sin((newProgress * Math.PI) / 2);
      // Ice (50g) melts into water
      const iceMass = Math.max(0, 50.0 * (1 - Math.pow(newProgress, 0.85)));
      // Sub-zero ice warms to 0°C rapidly in first 20%, then melts
      const subTemp = newProgress < 0.2 ? -10.0 + (10.0 * newProgress) / 0.2 : temp;
      // Heat transferred
      const heat = (50.0 - temp) * 200.0;
      // Water level rises slightly as ice melts
      const waterRise = (1 - iceMass / 50.0) * 0.12;

      set({
        simulationProgress: newProgress,
        currentWaterTemp: temp,
        substanceTemp: subTemp,
        iceRemainingGrams: iceMass,
        heatTransferredCal: heat,
        waterLevelOffset: waterRise,
        stirrerRotation: newStirrer,
      });
    } else if (currentStage === 2) {
      // Hot metal (100°C) lowers and warms water from 20°C
      const simulatedFinal = (160.0 * 20.0 + 200.0 * sliderValue * 100.0) / (160.0 + 200.0 * sliderValue);
      const ease = 1 - Math.pow(1 - newProgress, 3);
      const temp = 20.0 + (simulatedFinal - 20.0) * ease;
      const mTemp = 100.0 - (100.0 - temp) * ease;
      const heat = (temp - 20.0) * 160.0;
      // Displacement rise of liquid when metal submerged
      const waterRise = Math.min(1, newProgress * 2.5) * 0.24;

      set({
        simulationProgress: newProgress,
        currentWaterTemp: temp,
        substanceTemp: mTemp,
        iceRemainingGrams: 0,
        heatTransferredCal: heat,
        waterLevelOffset: waterRise,
        stirrerRotation: newStirrer,
      });
    } else if (currentStage === 3) {
      // Injected steam (100°C) melts 100g ice and heats mixture toward target
      const simulatedFinal = Math.min(100.0, Math.max(0, (sliderValue * 600.0 - 8000.0) / (100.0 + sliderValue)));
      const ease = Math.sin((newProgress * Math.PI) / 2);
      const temp = 0.0 + simulatedFinal * ease;
      const meltRatio = Math.min(1, (sliderValue / 20.0) * newProgress * 1.1);
      const iceMass = Math.max(0, 100.0 * (1 - meltRatio));
      const heat = Math.min(14000, 12000 * (sliderValue / 20.0) * newProgress);
      // Condensed steam increases liquid water volume
      const waterRise = newProgress * (sliderValue / 20.0) * 0.35;

      set({
        simulationProgress: newProgress,
        currentWaterTemp: temp,
        substanceTemp: 100.0,
        iceRemainingGrams: iceMass,
        heatTransferredCal: heat,
        waterLevelOffset: waterRise,
        stirrerRotation: newStirrer,
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
