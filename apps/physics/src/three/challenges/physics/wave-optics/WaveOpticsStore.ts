import { create } from "zustand";

export interface MathFormula {
  label: string;
  formula: string;
  explanation: string;
}

export interface MathStep {
  step: number;
  title: string;
  math: string;
  explanation: string;
}

export interface MathDerivation {
  title: string;
  concept: string;
  conclusion: string;
  formulas: MathFormula[];
  steps: MathStep[];
}

export interface WaveOpticsStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  parameterName: string;
  parameterUnit: string;
  laserColorName: string;
  laserHex: string;
  laserWavelengthNm: number; // in nm
  laserWavelengthM: number;  // in meters
  slitSeparationMm: number;  // d in mm
  slitSeparationM: number;   // d in meters
  screenDistanceM: number;   // D in meters (1.200 m)
  fringeWidthMm: number;     // beta = lambda * D / d in mm
  targetOrderName: string;
  targetOrderType: "dark" | "bright";
  targetOrderIndex: number;
  targetPositionMm: number;  // y in mm
  toleranceMm: number;       // tolerance
  sliderMin: number;
  sliderMax: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;
  targetDisplay: string;
  targetDescription: string;
  mathDerivation: MathDerivation;
}

export const STAGE_CONFIGS: Record<number, WaveOpticsStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Blue Laser (1st Dark Fringe)",
    subtitle: "Question: Given Blue light (λ = 450 nm), double slits (d = 0.25 mm), and screen (D = 1.20 m), calculate and locate the position of the 1st Dark Fringe.",
    parameterName: "Sensor Position (y)",
    parameterUnit: "mm",
    laserColorName: "Light Blue",
    laserHex: "#38bdf8",
    laserWavelengthNm: 450,
    laserWavelengthM: 450e-9,
    slitSeparationMm: 0.25,
    slitSeparationM: 0.25e-3,
    screenDistanceM: 1.20,
    fringeWidthMm: 2.16,
    targetOrderName: "1st Dark Minimum (m = 0)",
    targetOrderType: "dark",
    targetOrderIndex: 0,
    targetPositionMm: 1.08,
    toleranceMm: 0.08,
    sliderMin: 0.0,
    sliderMax: 5.0,
    sliderDefault: 0.20,
    stepSmall: 0.01,
    stepLarge: 0.1,
    targetDisplay: "1st Dark",
    targetDescription: "Find the position of the 1st Dark Fringe (m = 0) for a Blue laser (λ = 450 nm, d = 0.25 mm, D = 1.20 m).",
    mathDerivation: {
      title: "Young's Double Slit Interference & Destructive Minima",
      concept:
        "Wave Optics treats light as transverse electromagnetic waves that obey the Principle of Superposition. When a coherent plane laser wave encounters two parallel microscopic slits separated by distance d, each slit acts as a secondary emitter of spherical wavelets according to Huygens' Principle.\n\n" +
        "1. Geometry of Path Difference (Δx)\n" +
        "Consider a point P at lateral height y on an observation screen positioned distance D away from the double slit aperture. Because D (1.20 m) is vastly larger than the slit separation d (0.25 mm), the two ray paths from slit 1 and slit 2 are nearly parallel.\n" +
        "Dropping a perpendicular from slit 1 to the path of slit 2 gives the geometric path difference:\n" +
        "Δx = d · sin(θ) ≈ d · tan(θ) = d · (y / D) = (y · d) / D\n\n" +
        "2. Optical Phase Difference and Destructive Interference\n" +
        "The spatial path difference Δx introduces an optical phase difference δ between the two arriving waves:\n" +
        "δ = (2π / λ) · Δx\n" +
        "When the two arriving wavefronts are exactly half a cycle out of phase (δ = π, 3π, 5π...), a wave crest from slit 1 overlaps exactly with a wave trough from slit 2. They cancel each other completely, producing zero resultant intensity (a dark fringe):\n" +
        "Δx = (m + 1/2) · λ,  where m = 0, 1, 2...\n\n" +
        "3. Calculating the First Dark Minimum (m = 0)\n" +
        "For the first dark fringe immediately flanking the central bright maximum:\n" +
        "Δx = (0 + 1/2) · λ = λ / 2\n" +
        "Equating path differences:\n" +
        "(y · d) / D = λ / 2  ⟹  y = (λ · D) / (2 · d)\n" +
        "Substituting Blue laser parameters (λ = 450 nm, D = 1.20 m, d = 0.25 mm):\n" +
        "y = (450 × 10⁻⁹ m × 1.20 m) / (2 × 0.25 × 10⁻³ m) = (5.40 × 10⁻⁷) / (5.00 × 10⁻⁴) = 1.08 × 10⁻³ m = 1.08 mm!",
      conclusion:
        "Summary & Physics Takeaway:\n" +
        "• Light Source: Coherent Blue Laser (λ = 450 nm).\n" +
        "• Slit Geometry: d = 0.25 mm, D = 1.20 m.\n" +
        "• Fringe Width: β = λD / d = 2.16 mm.\n" +
        "• First Minimum Condition: Path difference Δx = λ / 2 = 225 nm, Phase difference δ = π radians (180° cancellation).\n" +
        "• Target Coordinate: y = β / 2 = 1.08 mm.\n" +
        "Setting the micrometer crosshair to y = 1.08 mm captures the complete cancellation of the two interfering wave trains.",
      formulas: [
        {
          label: "1. PATH DIFFERENCE IN YDSE",
          formula: "\\Delta x = d \\sin\\theta \\approx \\dfrac{y \\cdot d}{D}",
          explanation: "Geometrical difference in optical path length traversed by waves from the two slits to height y on screen.",
        },
        {
          label: "2. DESTRUCTIVE INTERFERENCE CONDITION",
          formula: "\\Delta x = \\left(m + \\dfrac{1}{2}\\right)\\lambda, \\quad m = 0, 1, 2, \\dots",
          explanation: "Condition where wave crests from one slit meet wave troughs from the other, yielding zero net amplitude.",
        },
        {
          label: "3. POSITION OF m-TH DARK FRINGE",
          formula: "y_{\\text{dark}} = \\left(m + \\dfrac{1}{2}\\right) \\dfrac{\\lambda D}{d}",
          explanation: "Calculates the exact distance from the central axis to the m-th dark interference minimum.",
        },
        {
          label: "4. FRINGE WIDTH (BETA)",
          formula: "\\beta = \\dfrac{\\lambda D}{d}",
          explanation: "Linear separation between any two successive bright maxima or two successive dark minima.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Experimental Parameters",
          math: "\\lambda = 450\\text{ nm} = 4.50 \\times 10^{-7}\\text{ m}, \\quad d = 0.25\\text{ mm} = 2.50 \\times 10^{-4}\\text{ m}, \\quad D = 1.20\\text{ m}",
          explanation: "Blue laser beam incident normally onto precision double slits.",
        },
        {
          step: 2,
          title: "Compute Standard Fringe Width (β)",
          math: "\\beta = \\dfrac{\\lambda D}{d} = \\dfrac{4.50 \\times 10^{-7} \\times 1.20}{2.50 \\times 10^{-4}} = 2.16 \\times 10^{-3}\\text{ m} = 2.16\\text{ mm}",
          explanation: "The full period of the spatial cosine-squared intensity pattern is 2.16 mm.",
        },
        {
          step: 3,
          title: "Formulate 1st Dark Minimum Condition",
          math: "m = 0 \\implies \\Delta x = \\dfrac{\\lambda}{2} = 225\\text{ nm}, \\quad y_{\\text{dark}} = \\dfrac{\\beta}{2}",
          explanation: "The first minimum occurs exactly halfway between the central peak and the first bright fringe.",
        },
        {
          step: 4,
          title: "Calculate Target Sensor Position (y)",
          math: "y = \\dfrac{2.16\\text{ mm}}{2} = \\mathbf{1.08\\text{ mm}}",
          explanation: "The photodetector crosshair must be positioned at exactly 1.08 mm.",
        },
        {
          step: 5,
          title: "Verify Intensity Null",
          math: "I(1.08\\text{ mm}) = I_0 \\cos^2\\left(\\dfrac{\\pi \\times 0.25 \\times 1.08}{450 \\times 10^{-6} \\times 1200}\\right) = I_0 \\cos^2\\left(\\dfrac{\\pi}{2}\\right) = \\mathbf{0}",
          explanation: "Mathematical confirmation that the intensity drops to pure zero at this coordinate.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: Blue Laser (2nd Bright Fringe)",
    subtitle: "Question: Given Blue light (λ = 450 nm), double slits (d = 0.20 mm), and screen (D = 1.20 m), calculate and locate the position of the 2nd Bright Fringe.",
    parameterName: "Sensor Position (y)",
    parameterUnit: "mm",
    laserColorName: "Light Blue",
    laserHex: "#38bdf8",
    laserWavelengthNm: 450,
    laserWavelengthM: 450e-9,
    slitSeparationMm: 0.20,
    slitSeparationM: 0.20e-3,
    screenDistanceM: 1.20,
    fringeWidthMm: 2.70,
    targetOrderName: "2nd Bright Maximum (m = 2)",
    targetOrderType: "bright",
    targetOrderIndex: 2,
    targetPositionMm: 5.40,
    toleranceMm: 0.08,
    sliderMin: 0.0,
    sliderMax: 10.0,
    sliderDefault: 1.00,
    stepSmall: 0.01,
    stepLarge: 0.1,
    targetDisplay: "2nd Bright",
    targetDescription: "Find the position of the 2nd Bright Fringe (m = 2) for a Blue laser (λ = 450 nm, d = 0.20 mm, D = 1.20 m).\n\nFormula: y = 2·(λ·D) / d",
    mathDerivation: {
      title: "Wavelength Shift & Constructive Interference Maxima",
      concept:
        "Using blue laser light (λ = 450 nm) produces tight, high-resolution interference fringes across the observation screen.\n\n" +
        "1. Constructive Interference Condition\n" +
        "Bright fringes occur whenever waves arriving from the two slits are exactly in phase (δ = 0, 2π, 4π, 6π...). This requires the geometrical path difference Δx to be an exact integer multiple of the wavelength:\n" +
        "Δx = m · λ,  where m = 0 (central), ±1 (1st order), ±2 (2nd order)...\n\n" +
        "2. Finding the 2nd Order Principal Maximum (m = 2)\n" +
        "For the second bright fringe:\n" +
        "Δx = 2 · λ\n" +
        "From the small-angle approximation:\n" +
        "(y · d) / D = 2 · λ  ⟹  y = 2 · (λ · D) / d = 2 · β\n\n" +
        "3. Numerical Calculation for Blue Laser (d = 0.20 mm, D = 1.20 m)\n" +
        "Fringe width β:\n" +
        "β = (450 × 10⁻⁹ m × 1.20 m) / (0.20 × 10⁻³ m) = (5.40 × 10⁻⁷) / (2.00 × 10⁻⁴) = 2.70 × 10⁻³ m = 2.70 mm\n" +
        "Location of 2nd bright fringe:\n" +
        "y₂ = 2 · β = 2 × 2.70 mm = 5.40 mm!\n\n" +
        "4. Physical Significance of Slit Separation and Color\n" +
        "Notice that as the slit separation d decreases to 0.20 mm, the fringes spread wider proportionally, allowing high-precision measurement on the micrometer scale.",
      conclusion:
        "Summary & Physics Takeaway:\n" +
        "• Light Source: Coherent Blue Laser (λ = 450 nm).\n" +
        "• Slit Separation: d = 0.20 mm.\n" +
        "• Screen Distance: D = 1.20 m.\n" +
        "• Fundamental Fringe Width: β = 2.70 mm.\n" +
        "• 2nd Order Maximum Condition: Δx = 2λ = 900 nm, Phase difference δ = 4π radians.\n" +
        "• Target Coordinate: y = 2β = 5.40 mm.\n" +
        "Positioning the sensor at y = 5.40 mm aligns precisely with the bright constructive antinode.",
      formulas: [
        {
          label: "1. CONSTRUCTIVE INTERFERENCE CONDITION",
          formula: "\\Delta x = m \\lambda, \\quad m = 0, \\pm 1, \\pm 2, \\dots",
          explanation: "Waves arrive completely in phase, constructively reinforcing to produce bright intensity peaks.",
        },
        {
          label: "2. POSITION OF m-TH BRIGHT MAXIMUM",
          formula: "y_m = m \\dfrac{\\lambda D}{d} = m \\beta",
          explanation: "Coordinates of bright interference antinodes as integer multiples of fringe width β.",
        },
        {
          label: "3. INTENSITY FORMULA",
          formula: "I = 4 I_0 \\cos^2\\left(\\dfrac{\\pi d y}{\\lambda D}\\right)",
          explanation: "Screen intensity profile exhibiting equal-width, cosine-squared fringes with maximum 4I₀.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Blue Laser Setup Parameters",
          math: "\\lambda = 450\\text{ nm} = 4.50 \\times 10^{-7}\\text{ m}, \\quad d = 0.20\\text{ mm} = 2.00 \\times 10^{-4}\\text{ m}, \\quad D = 1.20\\text{ m}",
          explanation: "High-coherence blue laser illumination across a 0.20 mm double slit.",
        },
        {
          step: 2,
          title: "Calculate Single Fringe Width (β)",
          math: "\\beta = \\dfrac{450 \\times 10^{-9} \\times 1.20}{2.00 \\times 10^{-4}} = 2.70\\text{ mm}",
          explanation: "The spacing between adjacent bright fringes is 2.70 mm.",
        },
        {
          step: 3,
          title: "State 2nd Order Maximum Condition (m = 2)",
          math: "\\Delta x = 2\\lambda = 900\\text{ nm} \\implies y_2 = 2 \\beta",
          explanation: "Constructive reinforcement occurs at twice the fundamental fringe width.",
        },
        {
          step: 4,
          title: "Solve for Target Coordinate (y)",
          math: "y = 2 \\times 2.70\\text{ mm} = \\mathbf{5.40\\text{ mm}}",
          explanation: "The photodetector crosshair must be driven to y = 5.40 mm.",
        },
        {
          step: 5,
          title: "Confirm Peak Maximum Intensity",
          math: "I(5.40\\text{ mm}) = 4I_0 \\cos^2(2\\pi) = 4I_0 \\times (1.0)^2 = \\mathbf{4I_0}",
          explanation: "Peak constructive superposition yielding maximum radiant brightness.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: Blue Laser (3rd Bright Fringe)",
    subtitle: "Question: Given Blue light (λ = 450 nm), double slits (d = 0.15 mm), and screen (D = 1.20 m), calculate and locate the position of the 3rd Bright Fringe.",
    parameterName: "Sensor Position (y)",
    parameterUnit: "mm",
    laserColorName: "Light Blue",
    laserHex: "#38bdf8",
    laserWavelengthNm: 450,
    laserWavelengthM: 450e-9,
    slitSeparationMm: 0.15,
    slitSeparationM: 0.15e-3,
    screenDistanceM: 1.20,
    fringeWidthMm: 3.60,
    targetOrderName: "3rd Bright Maximum (m = 3)",
    targetOrderType: "bright",
    targetOrderIndex: 3,
    targetPositionMm: 10.80,
    toleranceMm: 0.08,
    sliderMin: 0.0,
    sliderMax: 15.0,
    sliderDefault: 2.00,
    stepSmall: 0.01,
    stepLarge: 0.1,
    targetDisplay: "3rd Bright",
    targetDescription: "Find the position of the 3rd Bright Fringe (m = 3) for a Blue laser (λ = 450 nm, d = 0.15 mm, D = 1.20 m).\n\nFormula: y = 3·(λ·D) / d",
    mathDerivation: {
      title: "Short-Wavelength Blue Interference & Higher-Order Maxima",
      concept:
        "Blue light sits toward the higher-frequency edge of the visible spectrum with a short wavelength (λ = 450 nm). Using narrow slits (d = 0.15 mm) broadens the diffractive fringe distribution across the optical bench.\n\n" +
        "1. The 3rd Order Constructive Fringe (m = 3)\n" +
        "As we scan further out from the optical center axis, the optical path difference continues to grow. At the 3rd order maximum:\n" +
        "Δx = 3 · λ = 3 × 450 nm = 1350 nm = 1.350 μm\n" +
        "The phase difference between the two interfering wave trains is:\n" +
        "δ = 3 × 2π = 6π radians\n" +
        "Because 6π is an integral multiple of 2π, the wave crests re-align perfectly, creating a sharp constructive maximum.\n\n" +
        "2. Exact Mathematical Position\n" +
        "y₃ = 3 · (λ · D) / d = 3 · β\n" +
        "Calculating single fringe width β:\n" +
        "β = (450 × 10⁻⁹ m × 1.20 m) / (0.15 × 10⁻³ m) = (5.40 × 10⁻⁷) / (1.50 × 10⁻⁴) = 3.60 × 10⁻³ m = 3.60 mm\n" +
        "Position of 3rd bright maximum:\n" +
        "y₃ = 3 × 3.60 mm = 10.80 mm!\n\n" +
        "3. Verification via Path Difference Geometry\n" +
        "We can check the path difference directly using the fundamental formula:\n" +
        "Δx = (y · d) / D = (10.80 × 10⁻³ m × 0.15 × 10⁻³ m) / 1.20 m = (1.620 × 10⁻⁶) / 1.20 = 1.350 × 10⁻⁶ m = 1350 nm\n" +
        "Dividing by the blue wavelength λ = 450 nm:\n" +
        "Δx / λ = 1350 nm / 450 nm = 3.000 (Exact integer order m = 3!).",
      conclusion:
        "Summary & Physics Takeaway:\n" +
        "• Light Source: Coherent Blue Laser Diode (λ = 450 nm).\n" +
        "• Ultra-Fine Slit Aperture: d = 0.15 mm.\n" +
        "• Screen Distance: D = 1.20 m.\n" +
        "• Fringe Spacing: β = 3.60 mm.\n" +
        "• 3rd Order Path Difference: Δx = 3λ = 1350 nm (1.350 μm).\n" +
        "• Target Coordinate: y = 3β = 10.80 mm.\n" +
        "Setting y = 10.80 mm locks onto the 3rd order antinode, completing the precision laser interference calibration with 3-star mastery.",
      formulas: [
        {
          label: "1. HIGHER ORDER CONSTRUCTIVE MAXIMUM",
          formula: "y_m = m \\dfrac{\\lambda D}{d}, \\quad m = 3 \\implies y_3 = 3 \\dfrac{\\lambda D}{d}",
          explanation: "Determines the position of the 3rd order bright fringe from the central axis.",
        },
        {
          label: "2. OPTICAL PATH DIFFERENCE VERIFICATION",
          formula: "\\Delta x = \\dfrac{y \\cdot d}{D} = m \\lambda",
          explanation: "Proves that the geometric path difference is an exact integer multiple of the laser wavelength.",
        },
        {
          label: "3. ANGULAR SEPARATION",
          formula: "\\theta = \\dfrac{\\lambda}{d} \\implies y = D \\tan(m \\theta) \\approx m D \\theta",
          explanation: "Connects angular divergence between adjacent fringes to wavelength and slit separation.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Blue Laser Setup Parameters",
          math: "\\lambda = 450\\text{ nm} = 4.50 \\times 10^{-7}\\text{ m}, \\quad d = 0.15\\text{ mm} = 1.50 \\times 10^{-4}\\text{ m}, \\quad D = 1.20\\text{ m}",
          explanation: "Short-wavelength 450 nm blue laser passing through 0.15 mm slits.",
        },
        {
          step: 2,
          title: "Calculate Spatial Fringe Width (β)",
          math: "\\beta = \\dfrac{4.50 \\times 10^{-7} \\times 1.20}{1.50 \\times 10^{-4}} = 3.60\\text{ mm}",
          explanation: "The fringe pitch across the screen is 3.60 mm.",
        },
        {
          step: 3,
          title: "State 3rd Order Maximum Condition",
          math: "m = 3 \\implies \\Delta x = 3 \\lambda = 1350\\text{ nm}, \\quad y_3 = 3 \\beta",
          explanation: "Three full wavelengths of path delay between the two optical rays.",
        },
        {
          step: 4,
          title: "Solve for Target Sensor Position (y)",
          math: "y = 3 \\times 3.60\\text{ mm} = \\mathbf{10.80\\text{ mm}}",
          explanation: "The micrometer crosshair must be dialed to exactly 10.80 mm.",
        },
        {
          step: 5,
          title: "Confirm Path Difference Integer Ratio",
          math: "\\dfrac{\\Delta x}{\\lambda} = \\dfrac{(10.80\\text{ mm} \\times 0.15\\text{ mm}) / 1200\\text{ mm}}{450 \\times 10^{-6}\\text{ mm}} = \\dfrac{1.350 \\times 10^{-3}}{0.450 \\times 10^{-3}} = \\mathbf{3.000}",
          explanation: "Exact integer confirmation of m = 3 constructive interference.",
        },
      ],
    },
  },
};

export interface WavePhysicsState {
  currentYMm: number;
  targetYMm: number;
  pathDifferenceNm: number;
  phaseDifferenceRad: number;
  intensityNormalized: number;
  errorMm: number;
  isAligned: boolean;
}

interface WaveOpticsState {
  currentStage: number;
  sliderValue: number; // in mm
  isSimulating: boolean;
  score: number;
  stars: number;
  feedbackMessage: string;
  isCompleted: boolean;
  stageResults: Record<number, { stars: number; error: number }>;
  isMissionStarted: boolean;
  missionStartedAt: number | null;
  cameraTrigger: number;

  // Actions
  setSliderValue: (val: number) => void;
  setStage: (stage: number) => void;
  startMission: () => void;
  resetSimulation: () => void;
  checkAlignment: () => { isSuccess: boolean; error: number };
  nextStage: () => void;
  triggerCameraReset: () => void;

  // Selectors
  getStageConfig: () => WaveOpticsStageConfig;
  getPhysicsState: () => WavePhysicsState;
}

export const useWaveOpticsStore = create<WaveOpticsState>((set, get) => ({
  currentStage: 1,
  sliderValue: STAGE_CONFIGS[1].sliderDefault,
  isSimulating: false,
  score: 0,
  stars: 0,
  feedbackMessage: "Translate the micrometer crosshair to find the target fringe.",
  isCompleted: false,
  stageResults: {},
  isMissionStarted: false,
  missionStartedAt: null,
  cameraTrigger: 0,

  setSliderValue: (val: number) => {
    const config = get().getStageConfig();
    const clamped = Math.max(config.sliderMin, Math.min(config.sliderMax, val));
    set({ sliderValue: Number(clamped.toFixed(2)) });
  },

  setStage: (stage: number) => {
    if (!STAGE_CONFIGS[stage]) return;
    set({
      currentStage: stage,
      sliderValue: STAGE_CONFIGS[stage].sliderDefault,
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      cameraTrigger: get().cameraTrigger + 1,
      feedbackMessage: `Stage ${stage} initialized. Align micrometer to ${STAGE_CONFIGS[stage].targetDisplay}.`,
    });
  },

  startMission: () => {
    set({
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      cameraTrigger: get().cameraTrigger + 1,
    });
  },

  triggerCameraReset: () => {
    set((s) => ({ cameraTrigger: s.cameraTrigger + 1 }));
  },

  resetSimulation: () => {
    const stage = get().currentStage;
    set({
      sliderValue: STAGE_CONFIGS[stage].sliderDefault,
      feedbackMessage: "Micrometer reset to default position.",
    });
  },

  checkAlignment: () => {
    const config = get().getStageConfig();
    const physics = get().getPhysicsState();
    const error = physics.errorMm;
    const isSuccess = error <= config.toleranceMm;

    let awardedStars = 0;
    if (error <= config.toleranceMm * 0.4) awardedStars = 3;
    else if (error <= config.toleranceMm * 0.7) awardedStars = 2;
    else if (isSuccess) awardedStars = 1;

    set((state) => ({
      stars: Math.max(state.stars, awardedStars),
      stageResults: {
        ...state.stageResults,
        [state.currentStage]: { stars: awardedStars, error },
      },
      feedbackMessage: isSuccess
        ? `Target verified! Deviation: ${error.toFixed(2)} mm. (${awardedStars} Stars)`
        : `Deviation of ${error.toFixed(2)} mm exceeds tolerance (±${config.toleranceMm} mm). Adjust carefully.`,
    }));

    return { isSuccess, error };
  },

  nextStage: () => {
    const next = get().currentStage + 1;
    if (STAGE_CONFIGS[next]) {
      get().setStage(next);
    } else {
      set({
        isCompleted: true,
        feedbackMessage: "Mission accomplished! You have calibrated all 3 laser interference orders.",
      });
    }
  },

  getStageConfig: () => {
    const { currentStage } = get();
    return STAGE_CONFIGS[currentStage] || STAGE_CONFIGS[1];
  },

  getPhysicsState: () => {
    const config = get().getStageConfig();
    const currentYMm = get().sliderValue;
    const targetYMm = config.targetPositionMm;
    const errorMm = Math.abs(currentYMm - targetYMm);
    const isAligned = errorMm <= config.toleranceMm;

    // Path diff: Delta x = y * d / D
    // in nm: (y_mm * 1e-3 * d_mm * 1e-3 / D_m) * 1e9 = (y_mm * d_mm / D_m) * 1000
    const pathDifferenceNm = (currentYMm * config.slitSeparationMm / config.screenDistanceM) * 1000;

    // Phase diff: delta = 2 * pi * Delta x / lambda
    const phaseDifferenceRad = (2 * Math.PI * pathDifferenceNm) / config.laserWavelengthNm;

    // Intensity: I = cos^2(delta / 2)
    const intensityNormalized = Math.pow(Math.cos(phaseDifferenceRad / 2), 2);

    return {
      currentYMm,
      targetYMm,
      pathDifferenceNm,
      phaseDifferenceRad,
      intensityNormalized,
      errorMm,
      isAligned,
    };
  },
}));
