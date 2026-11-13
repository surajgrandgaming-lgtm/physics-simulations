import { create } from "zustand";

export interface StandingWavesStageConfig {
  stage: number;
  apparatusName: string;
  harmonicN: number; // 1 = fundamental, 2 = 2nd harmonic, 3 = 3rd harmonic
  stringLength: number; // L in meters
  tension: number; // T in Newtons
  linearDensity: number; // mu in kg/m (e.g. 0.003 kg/m)
  waveSpeed: number; // v = sqrt(T / mu) in m/s
  targetFrequency: number; // f_n = (n / 2L) * v in Hz
  tolerance: number; // ± tolerance in Hz
  sliderMin: number;
  sliderMax: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;
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

export const STANDING_WAVES_STAGES: Record<number, StandingWavesStageConfig> = {
  1: {
    stage: 1,
    apparatusName: "Melde's Stretched Cord Test Stand",
    harmonicN: 1,
    stringLength: 1.2,
    tension: 48.0,
    linearDensity: 0.003,
    waveSpeed: 126.491, // sqrt(48.0 / 0.003) = 126.491 m/s
    targetFrequency: 52.7, // (1 / (2 * 1.2)) * 126.491 = 52.70 Hz
    tolerance: 0.8,
    sliderMin: 20.0,
    sliderMax: 100.0,
    sliderDefault: 35.0,
    stepSmall: 0.1,
    stepLarge: 1.0,
    mathDerivation: {
      title: "Stage 1: Tuning Fundamental Standing Wave (n = 1 Loop)",
      concept:
        "When you shake a stretched string, waves travel forward, bounce off the far end, and reflect back. \n\nUsually, the forward and reflected waves collide chaotically, resulting in small, messy ripples. BUT when you shake the string at the exact right speed (the Resonant Frequency), the two waves add up in perfect harmony!\n\nThis forms a STANDING WAVE: the wave appears to freeze in place, creating wide dancing loops (Antinodes) and motionless still points (Nodes). For the fundamental mode (n = 1), the entire string vibrates as one big loop.",
      conclusion:
        "For length L = 1.20 m, tension T = 48.0 N, and cord density μ = 0.0030 kg/m, the required resonant frequency is exactly f₁ = 52.70 Hz.",
      formulas: [
        {
          label: "1. WAVE SPEED ON A STRING",
          formula: "v = \\sqrt{\\dfrac{T}{\\mu}}",
          explanation:
            "Tighter strings (higher tension T) make waves move faster; heavier strings (higher density μ) slow waves down.",
        },
        {
          label: "2. STANDING WAVE RESONANCE RULE",
          formula: "L = n \\cdot \\left(\\dfrac{\\lambda_n}{2}\\right) \\implies \\lambda_n = \\dfrac{2L}{n}",
          explanation:
            "Because both ends are pinned down, an exact whole number of half-loops (λ/2) must fit the string length L.",
        },
        {
          label: "3. HARMONIC FREQUENCY FORMULA",
          formula: "f_n = \\dfrac{v}{\\lambda_n} = \\dfrac{n}{2L}\\sqrt{\\dfrac{T}{\\mu}}",
          explanation:
            "This gives the exact driver frequency needed to produce 'n' glowing loops along the string.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Your Known Values",
          math: "L = 1.20\\text{ m}, \\quad T = 48.00\\text{ N}, \\quad \\mu = 0.0030\\text{ kg/m}, \\quad n = 1",
          explanation:
            "Read string length L between bridges, tension T from the hanging weights, cord thickness μ, and target mode n = 1 loop.",
        },
        {
          step: 2,
          title: "Calculate Wave Speed (v = √(T / μ))",
          math: "v = \\sqrt{\\dfrac{48.00}{0.0030}} = \\sqrt{16000} \\approx 126.49\\text{ m/s}",
          explanation:
            "Divide tension by density (48 ÷ 0.0030 = 16,000) and take the square root. The wave travels at 126.49 m/s.",
        },
        {
          step: 3,
          title: "Determine Loop Wavelength (λ₁ = 2L / n)",
          math: "\\lambda_1 = \\dfrac{2 \\times 1.20}{1} = 2.40\\text{ m}",
          explanation:
            "Since 1 loop equals half a full wave (λ/2), the full wavelength is twice the string length: 2 × 1.20 = 2.40 m.",
        },
        {
          step: 4,
          title: "Compute Final Resonant Frequency (f₁ = v / λ₁)",
          math: "f_1 = \\dfrac{126.49}{2.40} \\approx 52.70\\text{ Hz}",
          explanation:
            "Divide wave speed by wavelength: 126.49 ÷ 2.40 = 52.70 Hz. Dial 52.7 Hz into the driver to form the fundamental loop!",
        },
      ],
    },
  },
  2: {
    stage: 2,
    apparatusName: "Medium Elastic Cord Bench",
    harmonicN: 2,
    stringLength: 1.5,
    tension: 60.0,
    linearDensity: 0.0024,
    waveSpeed: 158.114, // sqrt(60.0 / 0.0024) = 158.114 m/s
    targetFrequency: 105.41, // (2 / (2 * 1.5)) * 158.114 = 105.41 Hz
    tolerance: 1.2,
    sliderMin: 40.0,
    sliderMax: 180.0,
    sliderDefault: 70.0,
    stepSmall: 0.1,
    stepLarge: 1.0,
    mathDerivation: {
      title: "Stage 2: Exciting the 2nd Harmonic (n = 2 Loops, 1 Central Node)",
      concept:
        "In the second harmonic (n = 2), the driving frequency is doubled so that two complete loops fit between the bridges.\n\nNotice the midpoint of the string (x = L/2): here, the two colliding waves completely cancel each other at all times. This creates a motionless point called a NODE. The string swings up and down on either side of the node in opposite directions, while the center point stays dead still!",
      conclusion:
        "For length L = 1.50 m, tension T = 60.0 N, and cord density μ = 0.0024 kg/m, the required frequency is f₂ = 105.41 Hz.",
      formulas: [
        {
          label: "1. SECOND HARMONIC FORMULA",
          formula: "f_2 = \\dfrac{2}{2L}\\sqrt{\\dfrac{T}{\\mu}} = \\dfrac{1}{L}\\sqrt{\\dfrac{T}{\\mu}}",
          explanation:
            "With n = 2, one full wave fits exactly into the string length (λ₂ = L).",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Your Known Values",
          math: "L = 1.50\\text{ m}, \\quad T = 60.00\\text{ N}, \\quad \\mu = 0.0024\\text{ kg/m}, \\quad n = 2",
          explanation:
            "String length is 1.50 m, tension is increased to 60.0 N, cord density is 0.0024 kg/m, and target is n = 2 loops.",
        },
        {
          step: 2,
          title: "Calculate Wave Speed (v = √(T / μ))",
          math: "v = \\sqrt{\\dfrac{60.00}{0.0024}} = \\sqrt{25000} \\approx 158.11\\text{ m/s}",
          explanation:
            "Divide tension by density (60 ÷ 0.0024 = 25,000) and take the square root. Wave velocity is 158.11 m/s.",
        },
        {
          step: 3,
          title: "Determine Loop Wavelength (λ₂ = 2L / 2 = L)",
          math: "\\lambda_2 = \\dfrac{2 \\times 1.50}{2} = 1.50\\text{ m}",
          explanation:
            "Two half-loops fit the 1.50 m string, so one full wavelength equals exactly 1.50 m.",
        },
        {
          step: 4,
          title: "Compute Final Resonant Frequency (f₂ = v / λ₂)",
          math: "f_2 = \\dfrac{158.11}{1.50} \\approx 105.41\\text{ Hz}",
          explanation:
            "Divide speed by wavelength: 158.11 ÷ 1.50 = 105.41 Hz. Dial 105.4 Hz to split the cord into 2 vibrating loops with a still center node!",
        },
      ],
    },
  },
  3: {
    stage: 3,
    apparatusName: "Precision Sonometer Test Stand",
    harmonicN: 3,
    stringLength: 1.6,
    tension: 72.0,
    linearDensity: 0.002,
    waveSpeed: 189.737, // sqrt(72.0 / 0.002) = 189.737 m/s
    targetFrequency: 177.88, // (3 / (2 * 1.6)) * 189.737 = 177.88 Hz
    tolerance: 1.5,
    sliderMin: 80.0,
    sliderMax: 260.0,
    sliderDefault: 120.0,
    stepSmall: 0.1,
    stepLarge: 1.0,
    mathDerivation: {
      title: "Stage 3: Exciting the 3rd Harmonic (n = 3 Loops, 2 Interior Nodes)",
      concept:
        "In the third harmonic (n = 3), the string divides into three identical vibrating loops separated by two interior stationary nodes (at x = 1/3 L and x = 2/3 L).\n\nIf you place paper markers on the string, the markers sitting right on top of the two nodes remain completely undisturbed, while the markers sitting at the three antinode peaks are vigorously tossed off into the air!",
      conclusion:
        "For length L = 1.60 m, tension T = 72.0 N, and cord density μ = 0.0020 kg/m, the required frequency is f₃ = 177.88 Hz.",
      formulas: [
        {
          label: "1. THIRD HARMONIC FORMULA",
          formula: "f_3 = \\dfrac{3}{2L}\\sqrt{\\dfrac{T}{\\mu}} = 3 \\cdot f_1",
          explanation:
            "The 3rd harmonic frequency is exactly three times the fundamental frequency of the same cord.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Your Known Values",
          math: "L = 1.60\\text{ m}, \\quad T = 72.00\\text{ N}, \\quad \\mu = 0.0020\\text{ kg/m}, \\quad n = 3",
          explanation:
            "String length is 1.60 m, tension is 72.0 N, cord density is 0.0020 kg/m, and target is n = 3 loops.",
        },
        {
          step: 2,
          title: "Calculate Wave Speed (v = √(T / μ))",
          math: "v = \\sqrt{\\dfrac{72.00}{0.0020}} = \\sqrt{36000} \\approx 189.74\\text{ m/s}",
          explanation:
            "Divide tension by density (72 ÷ 0.0020 = 36,000) and take the square root. Wave speed is 189.74 m/s.",
        },
        {
          step: 3,
          title: "Determine Loop Wavelength (λ₃ = 2L / 3)",
          math: "\\lambda_3 = \\dfrac{2 \\times 1.60}{3} = \\dfrac{3.20}{3} \\approx 1.067\\text{ m}",
          explanation:
            "Three half-loops fill the string, so one full wavelength is 3.20 ÷ 3 ≈ 1.067 m.",
        },
        {
          step: 4,
          title: "Compute Final Resonant Frequency (f₃ = v / λ₃)",
          math: "f_3 = \\dfrac{189.74}{1.067} \\approx 177.88\\text{ Hz}",
          explanation:
            "Divide wave speed by wavelength: 189.74 ÷ 1.067 = 177.88 Hz. Dial 177.9 Hz into the driver to produce 3 crisp standing wave loops!",
        },
      ],
    },
  },
};

interface StandingWavesState {
  currentStage: number;
  sliderValue: number; // User's tuned frequency f in Hz
  isSimulating: boolean;
  simulationTime: number;
  currentAmplitude: number; // Real-time resonant amplitude 0.0 -> max (0.28)
  isResonant: boolean; // True if within tolerance
  isWon: boolean;
  isGameOver: boolean;
  failureReason: string | null;
  showResultModal: boolean;
  isMissionStarted: boolean;
  missionStartedAt: number | null;

  // Actions
  setSliderValue: (val: number) => void;
  startMission: () => void;
  startSimulation: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  tickSimulation: (dt: number) => void;
}

export const useStandingWavesStore = create<StandingWavesState>((set, get) => ({
  currentStage: 1,
  sliderValue: STANDING_WAVES_STAGES[1].sliderDefault,
  isSimulating: false,
  simulationTime: 0,
  currentAmplitude: 0,
  isResonant: false,
  isWon: false,
  isGameOver: false,
  failureReason: null,
  showResultModal: false,
  isMissionStarted: false,
  missionStartedAt: null,

  setSliderValue: (val: number) => {
    const stage = STANDING_WAVES_STAGES[get().currentStage];
    const clamped = Math.max(stage.sliderMin, Math.min(stage.sliderMax, val));
    set({ sliderValue: clamped });
  },

  startMission: () => {
    set({ isMissionStarted: true, missionStartedAt: performance.now() });
  },

  startSimulation: () => {
    const { sliderValue, currentStage } = get();
    const stage = STANDING_WAVES_STAGES[currentStage];
    const diff = Math.abs(sliderValue - stage.targetFrequency);
    const isResonant = diff <= stage.tolerance;

    set({
      isSimulating: true,
      simulationTime: 0,
      currentAmplitude: 0.02,
      isResonant,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
    });
  },

  resetSimulation: () => {
    const stage = STANDING_WAVES_STAGES[get().currentStage];
    set({
      sliderValue: stage.sliderDefault,
      isSimulating: false,
      simulationTime: 0,
      currentAmplitude: 0,
      isResonant: false,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
    });
  },

  nextStage: () => {
    const next = get().currentStage + 1;
    if (STANDING_WAVES_STAGES[next]) {
      set({
        currentStage: next,
        sliderValue: STANDING_WAVES_STAGES[next].sliderDefault,
        isSimulating: false,
        simulationTime: 0,
        currentAmplitude: 0,
        isResonant: false,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
        isMissionStarted: true,
        missionStartedAt: performance.now(),
      });
    }
  },

  tickSimulation: (dt: number) => {
    const { isSimulating, simulationTime, sliderValue, currentStage } = get();
    if (!isSimulating) return;

    const stage = STANDING_WAVES_STAGES[currentStage];
    const newTime = simulationTime + dt;
    const diff = Math.abs(sliderValue - stage.targetFrequency);
    const isNearResonance = diff <= stage.tolerance;

    // Lorentzian resonance curve for visual response
    // Q-factor defines peak sharpness
    const Q = 18.0;
    const fRatio = sliderValue / stage.targetFrequency;
    const detuning = fRatio - 1 / fRatio;
    const lorentzFactor = 1.0 / Math.sqrt(1.0 + Q * Q * detuning * detuning);
    const maxPossibleAmp = 0.32;
    const targetAmp = Math.max(0.015, maxPossibleAmp * lorentzFactor);

    // Smoothly interpolate amplitude toward target
    const currentAmp = get().currentAmplitude;
    const lerpedAmp = currentAmp + (targetAmp - currentAmp) * Math.min(1, dt * 5.0);

    set({
      simulationTime: newTime,
      currentAmplitude: lerpedAmp,
      isResonant: isNearResonance,
    });

    // Check completion after 2.8 seconds of observation
    if (newTime >= 2.8) {
      if (isNearResonance) {
        set({
          isSimulating: false,
          isWon: true,
          isGameOver: false,
          showResultModal: true,
        });
      } else {
        const direction = sliderValue < stage.targetFrequency ? "too low" : "too high";
        set({
          isSimulating: false,
          isWon: false,
          isGameOver: true,
          showResultModal: true,
          failureReason: `Frequency ${sliderValue.toFixed(2)} Hz was ${direction} (target: ${stage.targetFrequency.toFixed(2)} Hz). The wave failed to lock into ${stage.harmonicN} resonant loop${stage.harmonicN > 1 ? "s" : ""}.`,
        });
      }
    }
  },
}));

