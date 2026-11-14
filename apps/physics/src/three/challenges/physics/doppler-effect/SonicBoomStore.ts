import { create } from "zustand";

export interface DopplerStageConfig {
  stage: number;
  missionTitle: string;
  atmosphereName: string;
  soundSpeed: number; // v in m/s
  sourceFrequency: number; // f_0 in Hz (siren on jet)
  targetFrequency: number; // f' in Hz (sensor gate target)
  targetJetSpeed: number; // v_s = v * (1 - f_0 / f') in m/s
  tolerance: number; // ± tolerance in m/s
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

export const DOPPLER_STAGES: Record<number, DopplerStageConfig> = {
  1: {
    stage: 1,
    missionTitle: "Acoustic Gate Intercept: Sea Level",
    atmosphereName: "Sea Level (20°C)",
    soundSpeed: 340.0,
    sourceFrequency: 400.0,
    targetFrequency: 500.0,
    targetJetSpeed: 68.0, // 340 * (1 - 400/500) = 68.0 m/s
    tolerance: 1.5,
    sliderMin: 20.0,
    sliderMax: 120.0,
    sliderDefault: 35.0,
    stepSmall: 0.5,
    stepLarge: 5.0,
    mathDerivation: {
      title: "Stage 1: Doppler Effect & Frequency Compression Explained",
      concept:
        "Imagine an aircraft equipped with a siren emitting sound waves at 400 Hz (400 sound pulses every second). Sound travels through the surrounding air at 340 m/s.\n\nWhen the aircraft is standing still, each sound wave spreads out evenly in concentric circles with wavelength λ = v / f₀ = 340 / 400 = 0.85 m.\n\nHowever, when the aircraft flies towards the sensor gate at speed v_s, it chases its own sound waves! Before emitting the next crest, the jet has moved forward by distance v_s · T. This crowds and bunches the wave crests closer together ahead of the jet.\n\nBecause the crests are packed closer together (shorter wavelength λ'), they hit the stationary Acoustic Sensor Gate at a much higher rate. This frequency increase is the Doppler Shift! To hit exactly 500 Hz, we solve for the exact jet velocity v_s.",
      conclusion:
        "Conclusion: In 20°C air (v = 340 m/s), flying the jet at exactly v_s = 68.0 m/s compresses the 400 Hz siren waves by a factor of 1.25x, producing an apparent frequency of exactly 500 Hz at the Acoustic Sensor Gate.",
      formulas: [
        {
          label: "1. DOPPLER EQUATION (MOVING SOURCE APPROACHING STATIONARY RECEIVER)",
          formula: "f' = f_0 \\left(\\dfrac{v}{v - v_s}\\right)",
          explanation: "f' is the higher apparent frequency detected at the gate, f₀ is the original siren pitch (400 Hz), v is the speed of sound (340 m/s), and v_s is the jet speed.",
        },
        {
          label: "2. SOLVING DIRECTLY FOR REQUIRED JET VELOCITY (v_s)",
          formula: "v_s = v \\left(1 - \\dfrac{f_0}{f'}\\right)",
          explanation: "Rearranging the Doppler equation isolates the flight velocity v_s in terms of sound speed and the ratio of emitted to target frequency.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Identify What You Know",
          math: "v = 340.0\\text{ m/s}, \\quad f_0 = 400.0\\text{ Hz}, \\quad f' = 500.0\\text{ Hz}",
          explanation: "The siren emits f₀ = 400 Hz. The stationary sensor gate needs f' = 500 Hz. Sound travels through this atmosphere at v = 340 m/s.",
        },
        {
          step: 2,
          title: "Step 2: Understand the Frequency Compression Ratio",
          math: "\\dfrac{f_0}{f'} = \\dfrac{400.0}{500.0} = 0.80",
          explanation: "The siren's natural frequency is 80% (0.80) of the target frequency. To raise the pitch to 100%, the jet must close the 20% (0.20) gap by moving forward relative to sound speed.",
        },
        {
          step: 3,
          title: "Step 3: Calculate the Required Flight Speed (v_s)",
          math: "v_s = v \\times \\left(1 - \\dfrac{f_0}{f'}\\right) = 340.0 \\times (1 - 0.80) = 340.0 \\times 0.20 = 68.0\\text{ m/s}",
          explanation: "Multiplying the speed of sound (340 m/s) by 0.20 gives exactly 68.0 m/s. Dial the flight speed slider to 68.0 m/s and click RUN to achieve a 100% frequency lock!",
        },
        {
          step: 4,
          title: "Step 4: Verification / Double-Check",
          math: "f' = 400.0 \\times \\left(\\dfrac{340.0}{340.0 - 68.0}\\right) = 400.0 \\times \\left(\\dfrac{340.0}{272.0}\\right) = 400.0 \\times 1.25 = 500.0\\text{ Hz}",
          explanation: "Plugging 68.0 m/s back into the Doppler equation verifies that the relative approach rate compresses the waves by 1.25x, yielding 500.0 Hz perfectly.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    missionTitle: "High-Altitude Airspace: Cold Troposphere Gate",
    atmosphereName: "Tropopause (0°C)",
    soundSpeed: 330.0,
    sourceFrequency: 300.0,
    targetFrequency: 450.0,
    targetJetSpeed: 110.0, // 330 * (1 - 300/450) = 110.0 m/s
    tolerance: 2.0,
    sliderMin: 40.0,
    sliderMax: 170.0,
    sliderDefault: 60.0,
    stepSmall: 0.5,
    stepLarge: 5.0,
    mathDerivation: {
      title: "Stage 2: High-Altitude Atmospheric Gate (Cold Troposphere)",
      concept:
        "At higher altitudes, cold air (0°C) slows down the speed of sound to 330 m/s (down from 340 m/s at sea level).\n\nThe jet's siren emits f₀ = 300 Hz, but the gate demands f' = 450 Hz — a huge 1.50x jump in frequency!\n\nBecause sound moves slower in cold air, the jet must travel significantly faster to bunch the waves tightly enough to create this 1.50x frequency shift.",
      conclusion:
        "Conclusion: In cold 0°C air (v = 330 m/s), flying at v_s = 110.0 m/s compresses the 300 Hz siren into 450 Hz at the Acoustic Sensor Gate.",
      formulas: [
        {
          label: "1. DOPPLER EQUATION (MOVING SOURCE)",
          formula: "f' = f_0 \\left(\\dfrac{v}{v - v_s}\\right)",
          explanation: "Apparent frequency for moving source approaching stationary gate.",
        },
        {
          label: "2. SOLVED FLIGHT SPEED (v_s)",
          formula: "v_s = v \\left(1 - \\dfrac{f_0}{f'}\\right)",
          explanation: "Direct formula to calculate required aircraft velocity.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Identify Known Parameters",
          math: "v = 330.0\\text{ m/s}, \\quad f_0 = 300.0\\text{ Hz}, \\quad f' = 450.0\\text{ Hz}",
          explanation: "Cold atmospheric sound speed v = 330 m/s, siren emits 300 Hz, target frequency is 450 Hz.",
        },
        {
          step: 2,
          title: "Step 2: Compute Frequency Ratio",
          math: "\\dfrac{f_0}{f'} = \\dfrac{300.0}{450.0} = \\dfrac{2}{3} \\approx 0.6667",
          explanation: "Natural frequency is 2/3 of target. The jet must provide the remaining 1/3 (33.3%) through forward velocity.",
        },
        {
          step: 3,
          title: "Step 3: Calculate Required Flight Velocity",
          math: "v_s = 330.0 \\times \\left(1 - \\dfrac{2}{3}\\right) = 330.0 \\times \\dfrac{1}{3} = 110.0\\text{ m/s}",
          explanation: "One-third of 330 m/s is exactly 110.0 m/s. Set the slider to 110.0 m/s and click RUN.",
        },
        {
          step: 4,
          title: "Step 4: Verification",
          math: "f' = 300.0 \\times \\left(\\dfrac{330.0}{330.0 - 110.0}\\right) = 300.0 \\times \\left(\\dfrac{330.0}{220.0}\\right) = 300.0 \\times 1.50 = 450.0\\text{ Hz}",
          explanation: "Confirming that 110 m/s provides the exact 1.50x wave bunching required by the gate.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    missionTitle: "Sub-Zero Arctic Aerial Intercept",
    atmosphereName: "Arctic (-25°C)",
    soundSpeed: 315.0,
    sourceFrequency: 350.0,
    targetFrequency: 525.0,
    targetJetSpeed: 105.0, // 315 * (1 - 350/525) = 105.0 m/s
    tolerance: 2.0,
    sliderMin: 40.0,
    sliderMax: 160.0,
    sliderDefault: 65.0,
    stepSmall: 0.5,
    stepLarge: 5.0,
    mathDerivation: {
      title: "Stage 3: Sub-Zero Arctic Atmosphere Challenge",
      concept:
        "In extreme arctic conditions (-25°C), air molecules are dense and sluggish, slowing sound speed down to only 315 m/s.\n\nThe aircraft siren broadcasts at f₀ = 350 Hz, and the arctic gate requires f' = 525 Hz (again, a 1.50x pitch increase).\n\nBy calculating the exact velocity for this slower sound speed, we ensure the wavefronts hit the gate sensors at precisely 525 pulses per second.",
      conclusion:
        "Conclusion: In arctic air (v = 315 m/s), flying at v_s = 105.0 m/s shifts the 350 Hz siren up to 525 Hz for a perfect frequency lock.",
      formulas: [
        {
          label: "1. DOPPLER EQUATION",
          formula: "f' = f_0 \\left(\\dfrac{v}{v - v_s}\\right)",
          explanation: "Doppler shift for approaching source.",
        },
        {
          label: "2. SOLVED VELOCITY FORMULA",
          formula: "v_s = v \\left(1 - \\dfrac{f_0}{f'}\\right)",
          explanation: "Calculates the flight speed needed.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Identify Known Parameters",
          math: "v = 315.0\\text{ m/s}, \\quad f_0 = 350.0\\text{ Hz}, \\quad f' = 525.0\\text{ Hz}",
          explanation: "Sound speed v = 315 m/s at -25°C, emitted siren f₀ = 350 Hz, gate target f' = 525 Hz.",
        },
        {
          step: 2,
          title: "Step 2: Compute Frequency Ratio",
          math: "\\dfrac{f_0}{f'} = \\dfrac{350.0}{525.0} = \\dfrac{2}{3} \\approx 0.6667",
          explanation: "350 divided by 525 simplifies to 2/3. The jet velocity must compensate for the remaining 1/3.",
        },
        {
          step: 3,
          title: "Step 3: Calculate Required Flight Velocity",
          math: "v_s = 315.0 \\times \\left(1 - \\dfrac{2}{3}\\right) = 315.0 \\times \\dfrac{1}{3} = 105.0\\text{ m/s}",
          explanation: "One-third of 315 m/s is exactly 105.0 m/s. Dial the speed slider to 105.0 m/s and hit RUN.",
        },
        {
          step: 4,
          title: "Step 4: Verification",
          math: "f' = 350.0 \\times \\left(\\dfrac{315.0}{315.0 - 105.0}\\right) = 350.0 \\times \\left(\\dfrac{315.0}{210.0}\\right) = 350.0 \\times 1.50 = 525.0\\text{ Hz}",
          explanation: "105.0 m/s yields an apparent frequency of 525.0 Hz, locking in the arctic sensor gate.",
        },
      ],
    },
  },
};

export const SONIC_BOOM_STAGES = DOPPLER_STAGES;

export interface DopplerStore {
  currentStage: number;
  sliderValue: number; // aircraft velocity v_s in m/s
  jetProgress: number; // 0.0 (start) to 1.0 (reaches gate)
  isSimulating: boolean;
  isWon: boolean;
  isGameOver: boolean;
  failureReason: string | null;
  showResultModal: boolean;
  isMissionStarted: boolean;
  missionStartedAt: number | null;
  simulationTime: number;
  detectedFrequency: number;

  setSliderValue: (val: number) => void;
  startSimulation: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  startMission: () => void;
  tickSimulation: (dt: number) => void;
}

export const useSonicBoomStore = create<DopplerStore>((set, get) => ({
  currentStage: 1,
  sliderValue: DOPPLER_STAGES[1].sliderDefault,
  jetProgress: 0,
  isSimulating: false,
  isWon: false,
  isGameOver: false,
  failureReason: null,
  showResultModal: false,
  isMissionStarted: false,
  missionStartedAt: null,
  simulationTime: 0,
  detectedFrequency: DOPPLER_STAGES[1].sourceFrequency,

  setSliderValue: (val: number) => {
    const stage = DOPPLER_STAGES[get().currentStage];
    const clamped = Math.max(stage.sliderMin, Math.min(stage.sliderMax, val));
    const liveFreq = stage.sourceFrequency * (stage.soundSpeed / Math.max(1, stage.soundSpeed - clamped));
    set({ sliderValue: clamped, detectedFrequency: liveFreq });
  },

  startMission: () => {
    set({ isMissionStarted: true, missionStartedAt: performance.now() });
  },

  startSimulation: () => {
    const stage = DOPPLER_STAGES[get().currentStage];
    const speed = get().sliderValue;
    const initialFreq = stage.sourceFrequency * (stage.soundSpeed / Math.max(1, stage.soundSpeed - speed));
    set({
      isSimulating: true,
      simulationTime: 0,
      jetProgress: 0,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      detectedFrequency: initialFreq,
    });
  },

  resetSimulation: () => {
    const stage = DOPPLER_STAGES[get().currentStage];
    set({
      sliderValue: stage.sliderDefault,
      jetProgress: 0,
      isSimulating: false,
      simulationTime: 0,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      detectedFrequency: stage.sourceFrequency,
    });
  },

  nextStage: () => {
    const next = get().currentStage + 1;
    if (DOPPLER_STAGES[next]) {
      const nextStage = DOPPLER_STAGES[next];
      set({
        currentStage: next,
        sliderValue: nextStage.sliderDefault,
        jetProgress: 0,
        isSimulating: false,
        simulationTime: 0,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
        isMissionStarted: true,
        missionStartedAt: performance.now(),
        detectedFrequency: nextStage.sourceFrequency,
      });
    }
  },

  tickSimulation: (dt: number) => {
    const { isSimulating, sliderValue, currentStage, simulationTime } = get();
    if (!isSimulating) return;

    const stage = DOPPLER_STAGES[currentStage];
    const flightDuration = 3.6; // Runs smoothly across to the gate
    const newTime = simulationTime + dt;
    const progress = Math.min(1.0, newTime / flightDuration);

    const liveFreq = stage.sourceFrequency * (stage.soundSpeed / Math.max(1, stage.soundSpeed - sliderValue));

    set({
      simulationTime: newTime,
      jetProgress: progress,
      detectedFrequency: liveFreq,
    });

    // Check completion when aircraft crosses the gate at progress = 1.0
    if (progress >= 1.0) {
      const speedDiff = Math.abs(sliderValue - stage.targetJetSpeed);
      const isSpeedCorrect = speedDiff <= stage.tolerance;

      if (isSpeedCorrect) {
        set({
          isSimulating: false,
          isWon: true,
          isGameOver: false,
          showResultModal: true,
          detectedFrequency: stage.targetFrequency,
        });
      } else {
        const reason =
          sliderValue < stage.targetJetSpeed
            ? `Flight speed of ${sliderValue.toFixed(1)} m/s was too slow! The sound wavefronts were insufficiently compressed. Gate detected only ${liveFreq.toFixed(1)} Hz (target: ${stage.targetFrequency.toFixed(1)} Hz, -${Math.abs(liveFreq - stage.targetFrequency).toFixed(1)} Hz).`
            : `Flight speed of ${sliderValue.toFixed(1)} m/s was too fast! The sound wavefronts were overcompressed. Gate detected ${liveFreq.toFixed(1)} Hz (target: ${stage.targetFrequency.toFixed(1)} Hz, +${Math.abs(liveFreq - stage.targetFrequency).toFixed(1)} Hz).`;

        set({
          isSimulating: false,
          isWon: false,
          isGameOver: true,
          showResultModal: true,
          failureReason: reason,
        });
      }
    }
  },
}));

export const useDopplerStore = useSonicBoomStore;
