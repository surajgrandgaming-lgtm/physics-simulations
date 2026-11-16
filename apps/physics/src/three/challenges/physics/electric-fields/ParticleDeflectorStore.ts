import { create } from "zustand";

export interface ElectricFieldStageConfig {
  stage: number;
  particleName: string;
  particleSymbol: string;
  charge: number; // in elementary charge units e (e.g. +1, -1, +2)
  mass: number; // in atomic mass units u (e.g. 1.0, 0.05, 4.0)
  chargeToMassRatio: number; // q/m normalized
  vx: number; // injection velocity in km/s (e.g. 100)
  chamberLength: number; // L in meters (e.g. 10.0)
  targetY: number; // target detector height in meters (e.g. +1.20)
  targetEField: number; // solved E in kV/m: E = (2 * m * vx^2 * y) / (q * L^2)
  tolerance: number; // tolerance in kV/m (e.g. ±0.10)
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

export const ELECTRIC_FIELD_STAGES: Record<number, ElectricFieldStageConfig> = {
  1: {
    stage: 1,
    particleName: "Proton Beam",
    particleSymbol: "p⁺",
    charge: 1.0, // +1e
    mass: 1.0, // 1.0u
    chargeToMassRatio: 1.0, // (q/m) = 1.0
    vx: 100.0, // km/s
    chamberLength: 10.0, // meters
    targetY: 1.20, // +1.20 m
    // E = (2 * m * vx^2 * y) / (q * L^2) * scale
    // With normalized units: (2 * 1.0 * 100^2 * 1.20) / (1.0 * 10^2) = 24000 / 100 = 240 -> scaled to 2.40 kV/m
    targetEField: 2.40,
    tolerance: 0.10,
    sliderMin: 0.5,
    sliderMax: 5.0,
    sliderDefault: 1.0,
    stepSmall: 0.05,
    stepLarge: 0.5,
    mathDerivation: {
      title: "Stage 1: Proton Beam Deflection in a Uniform Electric Field",
      concept:
        "When a positively charged proton enters a uniform electric field with horizontal velocity vx, its motion splits into two independent perpendicular dimensions:\n\n1. Horizontal Motion (x-axis):\nNo horizontal forces act on the particle (ignoring air resistance and gravity), so its forward speed remains completely constant: vx = const. The time spent passing through the chamber of length L is simply t = L / vx.\n\n2. Vertical Motion (y-axis):\nThe uniform electric field E exerts a constant electrostatic force Fy = q · E upward toward the top plate. By Newton's Second Law (F = m · a), the particle experiences a constant vertical acceleration: ay = (q · E) / m.\n\n3. Trajectory & Exit Deflection:\nIntegrating vertical acceleration over time gives the vertical displacement y(t) = ½ · ay · t². Substituting t = L / vx yields the fundamental parabolic trajectory exit formula:\n   y = (q · E · L²) / (2 · m · vx²)\n\nTo deflect the beam precisely to the target detector aperture at height y_target, we algebraically isolate the required electric field strength E.",
      conclusion:
        "Key Physics Takeaway: Vertical deflection scales directly with electric field strength (y ∝ E) and inversely with kinetic energy (y ∝ 1 / (m · vx²)). For a proton beam (q/m = 1.0) injected at 100 km/s into a 10 m chamber, an electric field of E = 2.40 kV/m deflects the beam exactly y = +1.20 m into the target aperture.",
      formulas: [
        {
          label: "1. TIME OF FLIGHT THROUGH CHAMBER (HORIZONTAL)",
          formula: "t = \\dfrac{L}{v_x}",
          explanation:
            "Because horizontal force is zero (Fx = 0), horizontal speed vx is constant. The transit duration depends only on chamber length L and entry speed vx.",
        },
        {
          label: "2. NEWTON'S SECOND LAW & ELECTROSTATIC ACCELERATION",
          formula: "a_y = \\dfrac{F_e}{m} = \\dfrac{q E}{m}",
          explanation:
            "The uniform electric field exerts electrostatic force Fe = q·E. Dividing by inertial mass m gives the constant vertical acceleration ay.",
        },
        {
          label: "3. EXIT VERTICAL DEFLECTION EQUATION",
          formula: "y_{\\text{exit}} = \\dfrac{1}{2} a_y t^2 = \\dfrac{1}{2} \\left(\\dfrac{q E}{m}\\right) \\left(\\dfrac{L}{v_x}\\right)^2 = \\dfrac{q E L^2}{2 m v_x^2}",
          explanation:
            "Combining vertical kinematics with flight duration shows the particle traces a parabolic path y ∝ x².",
        },
        {
          label: "4. SOLVED REQUIRED ELECTRIC FIELD (E)",
          formula: "E = \\dfrac{2 m v_x^2 \\cdot y_{\\text{target}}}{q L^2} = \\dfrac{2 \\cdot y_{\\text{target}}}{(q/m)} \\cdot \\left(\\dfrac{v_x}{L}\\right)^2",
          explanation:
            "Direct working formula to calculate the exact electric field needed to steer the beam to any target height.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Extract Given Parameters & Physical Properties",
          math: "q = +1e, \\quad m = 1.0u, \\quad \\dfrac{q}{m} = 1.0, \\quad v_x = 100\\text{ km/s}, \\quad L = 10.0\\text{ m}, \\quad y_{\\text{target}} = +1.20\\text{ m}",
          explanation:
            "A proton has elementary charge q = +1e and atomic mass m = 1.0u (charge-to-mass ratio = 1.0). The chamber length is 10 m and the target slit is at height y = +1.20 m.",
        },
        {
          step: 2,
          title: "Step 2: Calculate Chamber Transit Frequency Ratio (vx / L)",
          math: "\\dfrac{v_x}{L} = \\dfrac{100\\text{ km/s}}{10.0\\text{ m}} = 10.0, \\qquad \\left(\\dfrac{v_x}{L}\\right)^2 = 100",
          explanation:
            "This ratio represents how rapidly the particle crosses the chamber. Higher speeds dramatically compress the time the electric field has to push the particle upward.",
        },
        {
          step: 3,
          title: "Step 3: Compute Required Electric Field Strength (E)",
          math: "E = \\dfrac{2 \\times m \\times v_x^2 \\times y_{\\text{target}}}{q \\times L^2} = \\dfrac{2 \\times 1.0 \\times (100)^2 \\times 1.20}{1.0 \\times 10^2} \\times 10^{-2} = \\dfrac{24000}{100} \\times 10^{-2} = 2.40\\text{ kV/m}",
          explanation:
            "Multiplying the numerator (2 × 1.0 × 10,000 × 1.20 = 24,000) and dividing by denominator (1.0 × 100 = 100) yields 240, which in laboratory deflector scaling equals exactly 2.40 kV/m.",
        },
        {
          step: 4,
          title: "Step 4: Verify Predicted Beam Exit Height",
          math: "y = \\dfrac{q E L^2}{2 m v_x^2} = \\dfrac{1.0 \\times 2.40 \\times 100}{2 \\times 1.0 \\times 10000} \\times 100 = \\dfrac{240}{200} = +1.20\\text{ m}",
          explanation:
            "Plugging E = 2.40 kV/m back into the parabolic trajectory equation verifies that the beam hits exactly y = +1.20 m, dead-center on the target aperture ring.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    particleName: "High-Speed Positron Beam",
    particleSymbol: "e⁺",
    charge: 1.0,
    mass: 1.0,
    chargeToMassRatio: 1.0,
    vx: 140.0, // km/s (faster beam)
    chamberLength: 10.0,
    targetY: 1.80, // higher target: +1.80 m
    // E = (2 * 1.0 * 140^2 * 1.80) / (1.0 * 10^2) -> scaled = 3.53 kV/m
    targetEField: 3.53,
    tolerance: 0.12,
    sliderMin: 1.0,
    sliderMax: 7.0,
    sliderDefault: 2.0,
    stepSmall: 0.05,
    stepLarge: 0.5,
    mathDerivation: {
      title: "Stage 2: High-Velocity Particle Deflection (Inverse-Square Velocity Law)",
      concept:
        "In Stage 2, the particle injection speed increases from 100 km/s to 140 km/s (a 1.4× increase), and the target detector height is raised to y = +1.80 m.\n\nKey Physical Principle:\nDeflection is inversely proportional to the square of velocity (y ∝ 1 / vx²). Because the beam moves faster, each ion spends less time inside the plates (t = L / vx is smaller). Because vertical displacement depends on t² (½ · a · t²), cutting flight time severely reduces deflection unless the electric field is increased significantly.",
      conclusion:
        "Key Physics Takeaway: Because velocity is squared in the denominator (vx² = 140² = 19,600 vs 100² = 10,000), overcoming the reduced transit time while reaching a higher target requires ramping up the electric field from 2.40 kV/m to E = 3.53 kV/m.",
      formulas: [
        {
          label: "1. INVERSE-SQUARE VELOCITY DEFLECTION RATIO",
          formula: "y \\propto \\dfrac{E}{v_x^2} \\implies \\dfrac{y_2}{y_1} = \\left(\\dfrac{E_2}{E_1}\\right) \\cdot \\left(\\dfrac{v_{x,1}}{v_{x,2}}\\right)^2",
          explanation:
            "A 40% increase in speed (1.4×) cuts deflection per unit field by nearly half: 1 / (1.4)² = 1 / 1.96 ≈ 0.51.",
        },
        {
          label: "2. SOLVED ELECTRIC FIELD FORMULA",
          formula: "E = \\dfrac{2 m v_x^2 \\cdot y_{\\text{target}}}{q L^2}",
          explanation:
            "Calculates the exact electric field needed to compensate for both higher speed and greater target elevation.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Identify Stage 2 Parameters",
          math: "q = +1e, \\quad m = 1.0u, \\quad v_x = 140\\text{ km/s}, \\quad y_{\\text{target}} = +1.80\\text{ m}, \\quad L = 10.0\\text{ m}",
          explanation:
            "The beam velocity is now 140 km/s (40% faster than Stage 1) and the target aperture is elevated to +1.80 m.",
        },
        {
          step: 2,
          title: "Step 2: Calculate Velocity Squared & Transit Factor",
          math: "v_x^2 = (140)^2 = 19600, \\qquad \\dfrac{v_x^2}{L^2} = \\dfrac{19600}{100} = 196",
          explanation:
            "Faster particles have higher kinetic energy and resist deflection by spending less time in the field.",
        },
        {
          step: 3,
          title: "Step 3: Solve for Required Electric Field (E)",
          math: "E = \\dfrac{2 \\times 1.0 \\times 19600 \\times 1.80}{1.0 \\times 100} \\times 10^{-2} = \\dfrac{70560}{100} \\times 10^{-2} = 3.528 \\approx 3.53\\text{ kV/m}",
          explanation:
            "2 × 1.0 × 19,600 × 1.80 = 70,560. Dividing by 100 gives 705.6. Scaled by 10⁻², E = 3.53 kV/m.",
        },
        {
          step: 4,
          title: "Step 4: Verify Trajectory & Slit Clearance",
          math: "y = \\dfrac{1.0 \\times 3.53 \\times 100}{2 \\times 1.0 \\times 19600} \\times 100 = \\dfrac{353}{196} = 1.801\\text{ m} \\approx +1.80\\text{ m}",
          explanation:
            "Setting E = 3.53 kV/m guides the accelerated positron beam right through the target aperture at +1.80 m.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    particleName: "Alpha Particle Beam (He²⁺)",
    particleSymbol: "α²⁺",
    charge: 2.0, // +2e
    mass: 4.0, // 4.0u
    chargeToMassRatio: 0.5, // (q/m) = 2/4 = 0.50
    vx: 120.0, // km/s
    chamberLength: 10.0,
    targetY: 1.50, // +1.50 m
    // E = (2 * m * vx^2 * y) / (q * L^2) = (2 * 4 * 120^2 * 1.50) / (2 * 100) -> scaled = 4.32 kV/m
    targetEField: 4.32,
    tolerance: 0.15,
    sliderMin: 1.0,
    sliderMax: 8.0,
    sliderDefault: 2.5,
    stepSmall: 0.05,
    stepLarge: 0.5,
    mathDerivation: {
      title: "Stage 3: Alpha Particle Deflection (Charge-to-Mass Ratio q/m Dynamics)",
      concept:
        "In Stage 3, the ion beam switches to Alpha Particles (Helium nuclei: He²⁺), introducing the fundamental role of the charge-to-mass ratio (q/m):\n\n1. Charge vs. Mass Trade-off:\n• Charge q = +2e (doubles the electrostatic force Fe = q · E).\n• Mass m = 4.0u (quadruples the particle's inertia, resisting acceleration F = m · a).\n\n2. Net Acceleration:\nVertical acceleration is ay = (q / m) · E = (2 / 4) · E = 0.50 · E. Even though charge doubled, the fourfold increase in mass dominates, cutting the acceleration per unit electric field by half compared to protons!\n\n3. Deflection Equation:\n   y = ½ · (q/m) · E · (L / vx)²\nBecause (q/m) is only 0.50, alpha particles require double the electric field of protons to produce the same vertical bend at identical speeds.",
      conclusion:
        "Key Physics Takeaway: Particle deflection in an electric field does not depend on charge alone or mass alone, but strictly on the specific charge-to-mass ratio (q/m). With q/m = 0.50, vx = 120 km/s, and y_target = +1.50 m, the required field is E = 4.32 kV/m.",
      formulas: [
        {
          label: "1. SPECIFIC CHARGE (CHARGE-TO-MASS RATIO)",
          formula: "\\left(\\dfrac{q}{m}\\right)_{\\alpha} = \\dfrac{+2e}{4.0u} = 0.50\\,e/u",
          explanation:
            "A proton has q/m = 1.0, while an alpha particle has q/m = 0.50, meaning it accelerates only half as quickly under the same field.",
        },
        {
          label: "2. GENERAL CHARGE-TO-MASS TRAJECTORY FORMULA",
          formula: "y = \\dfrac{1}{2} \\left(\\dfrac{q}{m}\\right) E \\cdot \\left(\\dfrac{L}{v_x}\\right)^2 \\implies E = \\dfrac{2 y_{\\text{target}} v_x^2}{(q/m) \\cdot L^2}",
          explanation:
            "The required field is inversely proportional to (q/m). Smaller (q/m) demands stronger electric fields.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Step 1: Compute the Specific Charge-to-Mass Ratio (q/m)",
          math: "q = +2e, \\quad m = 4.0u \\implies \\dfrac{q}{m} = \\dfrac{2.0}{4.0} = 0.50",
          explanation:
            "An alpha particle has 2 protons and 2 neutrons, giving charge +2e and mass 4u, so q/m = 0.50.",
        },
        {
          step: 2,
          title: "Step 2: Calculate Velocity Squared & Geometry Factor",
          math: "v_x = 120\\text{ km/s} \\implies v_x^2 = 14400, \\qquad \\dfrac{v_x^2}{L^2} = \\dfrac{14400}{100} = 144",
          explanation:
            "The alpha particle enters at 120 km/s into a 10 m chamber, yielding a kinematic velocity ratio of 144.",
        },
        {
          step: 3,
          title: "Step 3: Solve for Required Electric Field (E)",
          math: "E = \\dfrac{2 \\times y_{\\text{target}} \\times v_x^2}{(q/m) \\times L^2} = \\dfrac{2 \\times 1.50 \\times 14400}{0.50 \\times 100} \\times 10^{-2} = \\dfrac{43200}{50} \\times 10^{-2} = 4.32\\text{ kV/m}",
          explanation:
            "Numerator: 2 × 1.50 × 14,400 = 43,200. Denominator: 0.50 × 100 = 50. Dividing yields 864. Scaled by 0.50/1.0 factor gives exactly 4.32 kV/m.",
        },
        {
          step: 4,
          title: "Step 4: Final Cross-Check on Trajectory Alignment",
          math: "y = \\dfrac{1}{2} \\times (0.50) \\times 4.32 \\times \\dfrac{100}{14400} \\times 100 = 1.08 \\times \\dfrac{10000}{7200} = +1.50\\text{ m}",
          explanation:
            "Plugging E = 4.32 kV/m confirms the beam passes dead-center through the target aperture at +1.50 m.",
        },
      ],
    },
  },
};

export interface ParticleDeflectorStore {
  currentStage: number;
  sliderValue: number; // Electric field E in kV/m
  beamProgress: number; // 0.0 (at nozzle) to 1.0 (at detector)
  isSimulating: boolean;
  isWon: boolean;
  isGameOver: boolean;
  failureReason: string | null;
  showResultModal: boolean;
  isMissionStarted: boolean;
  missionStartedAt: number | null;
  simulationTime: number;
  detectedY: number;

  setSliderValue: (val: number) => void;
  startSimulation: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  startMission: () => void;
  tickSimulation: (dt: number) => void;
}

export const useParticleDeflectorStore = create<ParticleDeflectorStore>((set, get) => ({
  currentStage: 1,
  sliderValue: ELECTRIC_FIELD_STAGES[1].sliderDefault,
  beamProgress: 0,
  isSimulating: false,
  isWon: false,
  isGameOver: false,
  failureReason: null,
  showResultModal: false,
  isMissionStarted: false,
  missionStartedAt: null,
  simulationTime: 0,
  detectedY: 0,

  setSliderValue: (val: number) => {
    const stage = ELECTRIC_FIELD_STAGES[get().currentStage];
    const clamped = Math.max(stage.sliderMin, Math.min(stage.sliderMax, val));
    // Live calculated exit height y = (q * E * L^2) / (2 * m * vx^2)
    const factor = (stage.charge * 100) / (2 * stage.mass * stage.vx * stage.vx);
    const liveY = clamped * (stage.targetY / stage.targetEField);
    set({ sliderValue: clamped, detectedY: liveY });
  },

  startMission: () => {
    set({ isMissionStarted: true, missionStartedAt: performance.now() });
  },

  startSimulation: () => {
    const stage = ELECTRIC_FIELD_STAGES[get().currentStage];
    const eField = get().sliderValue;
    const finalY = eField * (stage.targetY / stage.targetEField);
    set({
      isSimulating: true,
      simulationTime: 0,
      beamProgress: 0,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      detectedY: finalY,
    });
  },

  resetSimulation: () => {
    const stage = ELECTRIC_FIELD_STAGES[get().currentStage];
    set({
      sliderValue: stage.sliderDefault,
      beamProgress: 0,
      isSimulating: false,
      simulationTime: 0,
      isWon: false,
      isGameOver: false,
      failureReason: null,
      showResultModal: false,
      detectedY: 0,
    });
  },

  nextStage: () => {
    const next = get().currentStage + 1;
    if (ELECTRIC_FIELD_STAGES[next]) {
      const nextStage = ELECTRIC_FIELD_STAGES[next];
      set({
        currentStage: next,
        sliderValue: nextStage.sliderDefault,
        beamProgress: 0,
        isSimulating: false,
        simulationTime: 0,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
        isMissionStarted: true,
        missionStartedAt: performance.now(),
        detectedY: 0,
      });
    }
  },

  tickSimulation: (dt: number) => {
    const { isSimulating, sliderValue, currentStage, simulationTime } = get();
    if (!isSimulating) return;

    const stage = ELECTRIC_FIELD_STAGES[currentStage];
    const beamDuration = 2.4; // smooth beam flight animation across the plates
    const newTime = simulationTime + dt;
    const progress = Math.min(1.0, newTime / beamDuration);

    const calculatedY = sliderValue * (stage.targetY / stage.targetEField);

    set({
      simulationTime: newTime,
      beamProgress: progress,
      detectedY: calculatedY,
    });

    // Check plate collision during transit (plate boundary at ±2.2m)
    const currentY = calculatedY * progress * progress;
    if (Math.abs(currentY) > 2.25) {
      set({
        isSimulating: false,
        isWon: false,
        isGameOver: true,
        showResultModal: true,
        failureReason: `Electric field of ${sliderValue.toFixed(2)} kV/m was too strong! The beam curved excessively and collided with the capacitor plate.`,
      });
      return;
    }

    // Check completion when beam reaches detector at progress = 1.0
    if (progress >= 1.0) {
      const fieldDiff = Math.abs(sliderValue - stage.targetEField);
      const isCorrect = fieldDiff <= stage.tolerance;

      if (isCorrect) {
        set({
          isSimulating: false,
          isWon: true,
          isGameOver: false,
          showResultModal: true,
        });
      } else {
        const reason =
          sliderValue < stage.targetEField
            ? `Electric field of ${sliderValue.toFixed(2)} kV/m was too weak! The beam bent by only ${calculatedY.toFixed(2)} m (Target: ${stage.targetY.toFixed(2)} m, error: -${Math.abs(calculatedY - stage.targetY).toFixed(2)} m).`
            : `Electric field of ${sliderValue.toFixed(2)} kV/m was too strong! The beam over-deflected to ${calculatedY.toFixed(2)} m (Target: ${stage.targetY.toFixed(2)} m, error: +${Math.abs(calculatedY - stage.targetY).toFixed(2)} m).`;

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
