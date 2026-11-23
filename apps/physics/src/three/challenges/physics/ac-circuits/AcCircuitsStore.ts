import { create } from "zustand";

export interface AcCircuitsStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  parameterName: string;
  parameterUnit: string;
  inductance: number; // H
  capacitance: number; // Farads
  resistance: number; // Ohms
  vRms: number; // Volts
  targetFrequency: number; // Hz (resonant frequency f_0)
  sliderMin: number;
  sliderMax: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;
  tolerance: number; // Hz
  targetDisplay: string;
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

export const AC_CIRCUITS_STAGES: Record<number, AcCircuitsStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Mains Standard Tuning (50.0 Hz Resonance)",
    subtitle: "Tune generator frequency f = 50.0 Hz to align current and voltage in phase and maximize bulb brilliance",
    parameterName: "Source Frequency (f)",
    parameterUnit: "Hz",
    inductance: 0.50, // 500 mH
    capacitance: 20.26e-6, // 20.26 uF
    resistance: 20.0, // Ohms
    vRms: 100.0, // V
    targetFrequency: 50.0, // Hz
    sliderMin: 20.0,
    sliderMax: 120.0,
    sliderDefault: 25.0,
    stepSmall: 0.5,
    stepLarge: 5.0,
    tolerance: 1.5,
    targetDisplay: "f_0 = 50.0 Hz",
    targetDescription: "Tune AC frequency f to match series RLC resonance at 50.0 Hz.",
    mathDerivation: {
      title: "Stage 1: Series RLC Resonance & Minimum Impedance (50.0 Hz)",
      concept:
        "Imagine an alternating voltage source V(t) = V_0 sin(ωt) connected across an inductor (L = 500 mH), a capacitor (C = 20.26 μF), and an incandescent lamp (R = 20.0 Ω).\n\n" +
        "Here is the physical intuition behind what you are seeing on the oscilloscope and the bulb:\n\n" +
        "1. Two Opposing Reactive Behaviors\n" +
        "• Inductor (L): Opposes rapid changes in current via self-induced back-EMF. Its inductive reactance X_L = 2π f L grows larger at high frequencies.\n" +
        "• Capacitor (C): Opposes the accumulation of electric charge on its plates. Its capacitive reactance X_C = 1 / (2π f C) is huge at low frequencies and tiny at high frequencies.\n\n" +
        "2. Why the Circuit Current Lags or Leads Off-Resonance\n" +
        "• When f < 50 Hz (Capacitive dominant, X_C > X_L): The current wave leads the voltage wave on the oscilloscope (φ < 0).\n" +
        "• When f > 50 Hz (Inductive dominant, X_L > X_C): The current wave lags behind the voltage wave (φ > 0).\n" +
        "• In both off-resonance cases, the net reactance |X_L - X_C| inflates the total circuit impedance Z = √(R² + (X_L - X_C)²). At high Z, loop current I_rms drops sharply and the bulb stays dim.\n\n" +
        "3. The Magic of Resonance (X_L = X_C)\n" +
        "At exactly f_0 = 50.0 Hz, the inductive back-EMF and capacitive voltage drop are 100% equal and opposite in phase (180° out of phase with each other). They completely cancel each other out across the reactive pair!\n" +
        "The total impedance collapses to its absolute minimum: Z = R = 20.0 Ω. The circuit behaves as purely resistive: current spikes to peak 5.00 A, locking into perfect phase with voltage (φ = 0°, cos φ = 1.000), and delivering maximum 500 W of brilliant illumination to the bulb.",
      conclusion:
        "Key Physics Takeaway: Unity Power Factor & Maximum Power Transfer\n" +
        "• Resonant Frequency: f_0 = 1 / (2π √(LC)) = 50.00 Hz\n" +
        "• Opposing Reactances: X_L = X_C = 157.1 Ω (Net reactance = 0.0 Ω)\n" +
        "• Minimum Impedance: Z = R = 20.0 Ω\n" +
        "• Maximum Loop Current: I_rms = 100 V / 20.0 Ω = 5.00 A\n" +
        "• Peak Dissipated Power: P = I² R = (5.00 A)²(20.0 Ω) = 500.0 Watts\n" +
        "At 50.0 Hz, the yellow voltage wave and cyan current wave on your oscilloscope lock into perfect alignment, proving that no energy is wasted in reactive circulation.",
      formulas: [
        {
          label: "1. INDUCTIVE REACTANCE",
          formula: "X_L = \\omega L = 2\\pi f L",
          explanation: "Opposition to alternating current produced by the inductor's magnetic back-EMF.",
        },
        {
          label: "2. CAPACITIVE REACTANCE",
          formula: "X_C = \\dfrac{1}{\\omega C} = \\dfrac{1}{2\\pi f C}",
          explanation: "Opposition to alternating current produced by electrostatic charge buildup on capacitor plates.",
        },
        {
          label: "3. TOTAL CIRCUIT IMPEDANCE",
          formula: "Z = \\sqrt{R^2 + (X_L - X_C)^2}",
          explanation: "The combined opposition to alternating current; reaches minimum Z = R at resonance.",
        },
        {
          label: "4. NATURAL RESONANT FREQUENCY",
          formula: "f_0 = \\dfrac{1}{2\\pi \\sqrt{LC}}",
          explanation: "The exact frequency where inductive and capacitive reactances cancel out (X_L = X_C).",
        },
        {
          label: "5. PHASE ANGLE & POWER FACTOR",
          formula: "\\tan \\phi = \\dfrac{X_L - X_C}{R}, \\quad \\cos \\phi = \\dfrac{R}{Z}",
          explanation: "Measures the phase shift between voltage and current. At resonance, φ = 0° and cos φ = 1.000.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Known Circuit Values",
          math: "L = 0.50\\text{ H}, \\quad C = 20.26\\,\\mu\\text{F}, \\quad R = 20.0\\,\\Omega, \\quad V_{\\text{rms}} = 100.0\\text{ V}",
          explanation: "The circuit contains an AC generator powering a series combination of a 500 mH coil, a 20.26 μF capacitor, and a 20 Ω lamp.",
        },
        {
          step: 2,
          title: "Calculate the LC Reactive Time Constant",
          math: "LC = (0.50\\text{ H})(20.26 \\times 10^{-6}\\text{ F}) = 1.013 \\times 10^{-5}\\text{ s}^2",
          explanation: "The product LC determines the natural oscillation period of energy exchange between the magnetic field and electric field.",
        },
        {
          step: 3,
          title: "Compute the Resonant Frequency (f_0)",
          math: "f_0 = \\dfrac{1}{2\\pi \\sqrt{LC}} = \\dfrac{1}{2\\pi \\times 3.1828 \\times 10^{-3}} = \\mathbf{50.00\\text{ Hz}}",
          explanation: "Tuning the AC generator to exactly 50.0 Hz establishes series resonance.",
        },
        {
          step: 4,
          title: "Confirm Reactance Cancellation (X_L = X_C)",
          math: "X_L = 2\\pi(50)(0.50) = 157.1\\,\\Omega, \\quad X_C = \\dfrac{1}{2\\pi(50)(20.26\\times 10^{-6})} = 157.1\\,\\Omega",
          explanation: "Because X_L - X_C = 0, the reactive voltages across L and C cancel each other completely.",
        },
        {
          step: 5,
          title: "Calculate Maximum Circuit Current & Power",
          math: "I_{\\text{rms}} = \\dfrac{V}{R} = \\dfrac{100\\text{ V}}{20\\,\\Omega} = 5.00\\text{ A}, \\quad P = (5.00\\text{ A})^2(20\\,\\Omega) = \\mathbf{500.0\\text{ W}}",
          explanation: "At minimum impedance Z = 20 Ω, current peaks at 5.00 A, lighting the bulb with 500 W of peak brilliance in perfect phase.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: Audio Band Resonance (100.0 Hz Tuning)",
    subtitle: "Dial AC generator frequency f = 100.0 Hz to eliminate reactive phase lag in the audio spectrum",
    parameterName: "Source Frequency (f)",
    parameterUnit: "Hz",
    inductance: 0.20, // 200 mH
    capacitance: 12.67e-6, // 12.67 uF
    resistance: 25.0, // Ohms
    vRms: 100.0, // V
    targetFrequency: 100.0, // Hz
    sliderMin: 50.0,
    sliderMax: 180.0,
    sliderDefault: 60.0,
    stepSmall: 0.5,
    stepLarge: 5.0,
    tolerance: 1.5,
    targetDisplay: "f_0 = 100.0 Hz",
    targetDescription: "Tune AC frequency f to match series RLC resonance at 100.0 Hz.",
    mathDerivation: {
      title: "Stage 2: Mid-Band Audio Resonance & Phase Matching (100.0 Hz)",
      concept:
        "In Stage 2, the circuit components are modified for mid-frequency audio operation: L = 200 mH, C = 12.67 μF, and R = 25.0 Ω.\n\n" +
        "1. The Challenge of Frequency Shifting\n" +
        "Because inductance is lower (200 mH vs 500 mH) and capacitance is lower (12.67 μF vs 20.26 μF), the circuit naturally oscillates at a faster rate.\n\n" +
        "2. Reactance Balance at 100 Hz\n" +
        "At 100.0 Hz, angular frequency ω = 2π(100) = 628.3 rad/s:\n" +
        "• Inductive reactance: X_L = (628.3)(0.20) = 125.7 Ω\n" +
        "• Capacitive reactance: X_C = 1 / ((628.3)(12.67 × 10⁻⁶)) = 125.7 Ω\n" +
        "Both reactances balance out to 125.7 Ω, creating zero reactive barrier.\n\n" +
        "3. Visualizing Phase Matching on the Oscilloscope\n" +
        "If you run the generator at 60 Hz, the capacitor overpowers the inductor (X_C > X_L), and current leads voltage with a large phase shift. As you tune the generator up to 100.0 Hz, the cyan current sine wave slides directly under the yellow voltage wave until they are completely in phase.",
      conclusion:
        "Key Physics Takeaway: Fast-Response Tuning\n" +
        "• Resonant Frequency: f_0 = 1 / (2π √(LC)) = 100.00 Hz\n" +
        "• Matched Reactance: X_L = X_C = 125.7 Ω\n" +
        "• Minimum Impedance: Z = R = 25.0 Ω\n" +
        "• Peak RMS Current: I_rms = 100 V / 25.0 Ω = 4.00 A\n" +
        "• Power Dissipation: P = I² R = (4.00 A)²(25.0 Ω) = 400.0 Watts\n" +
        "Tuning to 100.0 Hz eliminates reactive phase lag, achieving unity power factor (cos φ = 1.000).",
      formulas: [
        {
          label: "1. RESONANCE CONDITION",
          formula: "2\pi f_0 L = \dfrac{1}{2\pi f_0 C} \implies f_0 = \dfrac{1}{2\pi \sqrt{LC}}",
          explanation: "Inductive and capacitive reactances are exactly equal in magnitude.",
        },
        {
          label: "2. IMPEDANCE AT RESONANCE",
          formula: "Z_{\min} = R",
          explanation: "All reactive opposition vanishes, leaving only ohmic resistance.",
        },
        {
          label: "3. RMS CURRENT AT RESONANCE",
          formula: "I_{\text{rms}} = \dfrac{V_{\text{rms}}}{R}",
          explanation: "Ohm's Law applies directly with resistance R as the sole limiter of current.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Component Values",
          math: "L = 0.20\text{ H}, \quad C = 12.67\,\mu\text{F}, \quad R = 25.0\,\Omega, \quad V = 100\text{ V}",
          explanation: "Medium audio frequency bench setup with smaller reactive components.",
        },
        {
          step: 2,
          title: "Calculate the Resonant Constant",
          math: "LC = (0.20\text{ H})(12.67 \times 10^{-6}\text{ F}) = 2.534 \times 10^{-6}\text{ s}^2",
          explanation: "Compute the combined reactive time constant.",
        },
        {
          step: 3,
          title: "Solve for Resonant Frequency",
          math: "f_0 = \dfrac{1}{2\pi \sqrt{2.534 \times 10^{-6}}} = \dfrac{1}{2\pi \times 1.5918 \times 10^{-3}} = \mathbf{100.00\text{ Hz}}",
          explanation: "At 100.0 Hz, capacitive reactance cancels inductive reactance.",
        },
        {
          step: 4,
          title: "Verify Circuit Current and Power",
          math: "I_{\text{rms}} = \dfrac{100\text{ V}}{25\,\Omega} = 4.00\text{ A}, \quad P = 4^2 \times 25 = \mathbf{400.0\text{ W}}",
          explanation: "The bulb reaches full 400 W brightness as current peaks at 4.00 A.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: High-Frequency Resonance (200.0 Hz Tuning)",
    subtitle: "Drive generator to f = 200.0 Hz to tune the compact high-frequency tank circuit into unity power factor",
    parameterName: "Source Frequency (f)",
    parameterUnit: "Hz",
    inductance: 0.10, // 100 mH
    capacitance: 6.33e-6, // 6.33 uF
    resistance: 20.0, // Ohms
    vRms: 100.0, // V
    targetFrequency: 200.0, // Hz
    sliderMin: 120.0,
    sliderMax: 280.0,
    sliderDefault: 140.0,
    stepSmall: 1.0,
    stepLarge: 10.0,
    tolerance: 2.0,
    targetDisplay: "f_0 = 200.0 Hz",
    targetDescription: "Tune AC frequency f to match series RLC resonance at 200.0 Hz.",
    mathDerivation: {
      title: "Stage 3: High-Frequency Resonance & Quality Factor (200.0 Hz)",
      concept:
        "In Stage 3, we enter high-frequency territory: L = 100 mH, C = 6.33 μF, and R = 20.0 Ω.\n\n" +
        "1. High-Frequency Tank Dynamics\n" +
        "High frequencies require fast energy transfer between the magnetic field of the inductor and the electric field of the capacitor. With smaller L (100 mH) and smaller C (6.33 μF), the circuit naturally oscillates at 200 Hz.\n\n" +
        "2. Reactance at 200 Hz\n" +
        "At 200.0 Hz, angular frequency ω = 2π(200) = 1256.6 rad/s:\n" +
        "• Inductive reactance: X_L = (1256.6)(0.10) = 125.7 Ω\n" +
        "• Capacitive reactance: X_C = 1 / ((1256.6)(6.33 × 10⁻⁶)) = 125.7 Ω\n" +
        "Both reactances balance out to 125.7 Ω, creating zero net reactance.\n\n" +
        "3. Quality Factor (Q) & Sharpness\n" +
        "The Quality Factor Q = (ω_0 L) / R = 125.7 / 20 = 6.28 indicates high frequency selectivity. Even a slight mistuning by 10 Hz drastically reduces bulb brightness, showing how radio tuners select exact broadcast stations.",
      conclusion:
        "Key Physics Takeaway: High-Selectivity Resonance\n" +
        "• Resonant Frequency: f_0 = 1 / (2π √(LC)) = 200.00 Hz\n" +
        "• Equal Reactances: X_L = X_C = 125.7 Ω\n" +
        "• Minimum Impedance: Z = R = 20.0 Ω\n" +
        "• Peak RMS Current: I_rms = 100 V / 20.0 Ω = 5.00 A\n" +
        "• Maximum Power: P = (5.00 A)²(20.0 Ω) = 500.0 Watts\n" +
        "• Quality Factor: Q = 6.28\n" +
        "Dialing f = 200.0 Hz locks the oscilloscope waveforms into phase and achieves peak resonant power.",
      formulas: [
        {
          label: "1. HIGH-FREQUENCY RESONANCE",
          formula: "f_0 = \dfrac{1}{2\pi \sqrt{LC}} = 200.0\text{ Hz}",
          explanation: "Calculates the high-frequency natural resonance of the compact tank circuit.",
        },
        {
          label: "2. QUALITY FACTOR (Q)",
          formula: "Q = \dfrac{\omega_0 L}{R} = \dfrac{1}{R} \sqrt{\dfrac{L}{C}}",
          explanation: "Measures the sharpness of the resonance curve and reactive voltage magnification.",
        },
        {
          label: "3. POWER AT RESONANCE",
          formula: "P = I_{\text{rms}}^2 R = \dfrac{V_{\text{rms}}^2}{R}",
          explanation: "Maximum power dissipated in the load resistor at unity power factor.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Component Values",
          math: "L = 0.10\text{ H}, \quad C = 6.33\,\mu\text{F}, \quad R = 20.0\,\Omega, \quad V = 100\text{ V}",
          explanation: "Compact high-frequency RLC circuit parameters.",
        },
        {
          step: 2,
          title: "Calculate the High-Frequency Time Constant",
          math: "LC = (0.10\text{ H})(6.33 \times 10^{-6}\text{ F}) = 6.33 \times 10^{-7}\text{ s}^2",
          explanation: "Determine the natural oscillation constant of the circuit.",
        },
        {
          step: 3,
          title: "Solve for Resonant Frequency",
          math: "f_0 = \dfrac{1}{2\pi \sqrt{6.33 \times 10^{-7}}} = \dfrac{1}{2\pi \times 7.956 \times 10^{-4}} = \mathbf{200.00\text{ Hz}}",
          explanation: "Tuning the generator to 200.0 Hz achieves resonance.",
        },
        {
          step: 4,
          title: "Confirm In-Phase Power Delivery",
          math: "Z = 20.0\,\Omega, \quad I = 5.00\text{ A}, \quad P = \mathbf{500.0\text{ W}}, \quad Q = 6.28",
          explanation: "At minimum impedance Z = 20 Ω, maximum current (5.00 A) powers the bulb at 500 W.",
        },
      ],
    },
  },
};

interface AcCircuitsState {
  currentStage: number;
  sliderValue: number;
  isVerifying: boolean;
  isWon: boolean;
  isGameOver: boolean;
  failureReason: string | null;
  showResultModal: boolean;
  cameraTrigger: number;
  isMissionStarted: boolean;
  missionStartedAt: number | null;

  // Actions
  setSliderValue: (val: number) => void;
  startMission: () => void;
  launchSimulation: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  setStage: (stageNum: number) => void;
  closeResultModal: () => void;

  // Computed physics helpers
  getStageConfig: () => AcCircuitsStageConfig;
  getPhysicsState: () => {
    f: number;
    omega: number;
    XL: number;
    XC: number;
    Z: number;
    Irms: number;
    phiRad: number;
    phiDeg: number;
    cosPhi: number;
    power: number;
    VR: number;
    VL: number;
    VC: number;
    bulbBrightness: number;
    isResonant: boolean;
  };
}

export const useAcCircuitsStore = create<AcCircuitsState>((set, get) => ({
  currentStage: 1,
  sliderValue: AC_CIRCUITS_STAGES[1].sliderDefault,
  isVerifying: false,
  isWon: false,
  isGameOver: false,
  failureReason: null,
  showResultModal: false,
  cameraTrigger: 0,
  isMissionStarted: false,
  missionStartedAt: null,

  setSliderValue: (val: number) => {
    const config = get().getStageConfig();
    const clamped = Math.max(config.sliderMin, Math.min(config.sliderMax, Number(val.toFixed(2))));
    set({ sliderValue: clamped });
  },

  getStageConfig: () => {
    const stageNum = get().currentStage;
    return AC_CIRCUITS_STAGES[stageNum] || AC_CIRCUITS_STAGES[1];
  },

  getPhysicsState: () => {
    const config = get().getStageConfig();
    const f = get().sliderValue;
    const omega = 2 * Math.PI * f;
    const XL = omega * config.inductance;
    const XC = 1 / (omega * config.capacitance);
    const deltaX = XL - XC;
    const Z = Math.sqrt(config.resistance * config.resistance + deltaX * deltaX);
    const Irms = config.vRms / Z;
    const phiRad = Math.atan2(deltaX, config.resistance);
    const phiDeg = (phiRad * 180) / Math.PI;
    const cosPhi = config.resistance / Z;
    const power = Irms * Irms * config.resistance;
    const VR = Irms * config.resistance;
    const VL = Irms * XL;
    const VC = Irms * XC;

    // Maximum theoretical current at resonance
    const Imax = config.vRms / config.resistance;
    const bulbBrightness = Math.min(1.0, Math.pow(Irms / Imax, 2));
    const isResonant = Math.abs(f - config.targetFrequency) <= config.tolerance;

    return {
      f,
      omega,
      XL,
      XC,
      Z,
      Irms,
      phiRad,
      phiDeg,
      cosPhi,
      power,
      VR,
      VL,
      VC,
      bulbBrightness,
      isResonant,
    };
  },

  startMission: () => {
    set({
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      isVerifying: false,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
    });
  },

  launchSimulation: () => {
    if (get().isVerifying) return;
    set({ isVerifying: true, failureReason: null });

    const config = get().getStageConfig();
    const fVal = get().sliderValue;
    const diff = Math.abs(fVal - config.targetFrequency);
    const won = diff <= config.tolerance;

    setTimeout(() => {
      if (won) {
        set({
          isVerifying: false,
          isWon: true,
          isGameOver: false,
          failureReason: null,
          showResultModal: true,
        });
      } else {
        const direction = fVal < config.targetFrequency ? "too low (capacitive lag)" : "too high (inductive lead)";
        set({
          isVerifying: false,
          isWon: false,
          isGameOver: true,
          failureReason: `Frequency ${fVal.toFixed(1)} Hz is ${direction}. Net reactance (X_L - X_C) is not zero.`,
          showResultModal: true,
        });
      }
    }, 1200);
  },

  resetSimulation: () => {
    const config = get().getStageConfig();
    set({
      sliderValue: config.sliderDefault,
      isVerifying: false,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      cameraTrigger: Date.now(),
      isMissionStarted: true,
      missionStartedAt: performance.now(),
    });
  },

  nextStage: () => {
    const next = get().currentStage + 1;
    if (next <= 3) {
      const nextConfig = AC_CIRCUITS_STAGES[next];
      set({
        currentStage: next,
        sliderValue: nextConfig.sliderDefault,
        isVerifying: false,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
        cameraTrigger: Date.now(),
        isMissionStarted: true,
        missionStartedAt: performance.now(),
      });
    }
  },

  setStage: (stageNum: number) => {
    if (stageNum >= 1 && stageNum <= 3) {
      const config = AC_CIRCUITS_STAGES[stageNum];
      set({
        currentStage: stageNum,
        sliderValue: config.sliderDefault,
        isVerifying: false,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
        cameraTrigger: Date.now(),
        isMissionStarted: true,
        missionStartedAt: performance.now(),
      });
    }
  },

  closeResultModal: () => {
    set({ showResultModal: false });
  },
}));
