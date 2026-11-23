import { create } from "zustand";

export interface RayOpticsStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  parameterName: string;
  parameterUnit: string;
  opticalElement: "semi-circle" | "prism";
  refractiveIndex: number;
  prismApexAngle: number; // in degrees (for prism)
  targetAngle: number; // in degrees (incident angle i)
  tolerance: number; // in degrees
  sliderMin: number;
  sliderMax: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;
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

export const RAY_OPTICS_STAGES: Record<number, RayOpticsStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Critical Angle & Total Internal Reflection (TIR)",
    subtitle: "Tune the laser incident angle inside dense glass (n = 1.50) to reach the exact Critical Angle θ_c = 41.8°",
    parameterName: "Incident Angle (i)",
    parameterUnit: "°",
    opticalElement: "semi-circle",
    refractiveIndex: 1.50,
    prismApexAngle: 60.0,
    targetAngle: 41.8,
    tolerance: 0.4,
    sliderMin: 10.0,
    sliderMax: 70.0,
    sliderDefault: 25.0,
    stepSmall: 0.1,
    stepLarge: 1.0,
    targetDisplay: "θ_c = 41.8°",
    targetDescription: "Rotate the laser arm to discover the Critical Angle θ_c = 41.8° where the refracted ray skims at 90° and Total Internal Reflection begins.",
    mathDerivation: {
      title: "Snell's Law, Critical Angle & Total Internal Reflection (TIR)",
      concept:
        "When light travels through space, its phase velocity depends strictly on the electrical and optical properties of the medium. The ratio of the speed of light in vacuum (c ≈ 3 × 10⁸ m/s) to its speed in a medium (v) defines the medium's absolute refractive index: n = c / v.\n\n" +
        "1. Snell's Law and Refraction Mechanics\n" +
        "At any optical interface between medium 1 (dense glass, n₁) and medium 2 (rarer air, n₂), wave crests adjust their angle of propagation to conserve frequency across the boundary. This yields Snell's Law:\n" +
        "n₁ · sin(θ₁) = n₂ · sin(θ₂)\n" +
        "In our semi-circular D-block apparatus, the incoming laser strikes the curved cylindrical face along its radius. Because a radial line is perpendicular to the circumference at every point, the incident angle at the outer curved surface is 0°. The ray enters without any initial bending and arrives straight at the origin on the flat boundary from inside the denser medium.\n\n" +
        "2. The Concept of Critical Angle (θ_c)\n" +
        "When light attempts to escape from an optically denser medium (glass, n₁ = 1.50) into a rarer medium (air, n₂ = 1.00), it speeds up and bends AWAY from the surface normal (θ₂ > θ₁). As we tilt the incident angle θ₁ upward, the refracted angle θ₂ increases at an even faster rate until it reaches its physical upper limit: θ₂ = 90.0°.\n" +
        "At this boundary condition, the refracted light can no longer escape into the air; instead, it skims horizontally along the flat glass-air interface. Setting θ₂ = 90° in Snell's Law:\n" +
        "n₁ · sin(θ_c) = n₂ · sin(90°) = n₂ · 1.0\n" +
        "sin(θ_c) = n₂ / n₁\n" +
        "For standard optical crown glass (n₁ = 1.50) in air (n₂ = 1.00):\n" +
        "sin(θ_c) = 1.00 / 1.50 = 2/3 ≈ 0.6667  ⟹  θ_c = arcsin(0.6667) = 41.81° ≈ 41.8°.\n\n" +
        "3. Total Internal Reflection (TIR)\n" +
      "If the angle of incidence is increased even a fraction of a degree past θ_c (i > 41.81°), the mathematical value of sin(θ₂) would have to exceed 1.0, which is physically impossible for a real transmitted wave. Consequently, the transmission coefficient drops strictly to zero — no light enters the second medium. Instead, 100% of the radiant energy is reflected back into the denser glass according to the Law of Reflection (angle of reflection = angle of incidence).\n\n" +
        "4. Real-World Applications\n" +
        "Unlike silvered metal mirrors that absorb 4% to 10% of light on every bounce, TIR provides 100% loss-free reflection. This foundational principle enables high-bandwidth fiber-optic telecommunications across oceans, medical endoscopes for minimally invasive surgery, automotive rain sensors, and precision prism binoculars.",
      conclusion:
      "Summary & Key Physics Takeaways:\n" +
        "• Two Essential Conditions for Total Internal Reflection:\n" +
        "  1. The light ray must attempt to travel from an optically DENSER medium into a RARER medium (n₁ > n₂).\n" +
        "  2. The angle of incidence must equal or exceed the critical angle (i ≥ θ_c).\n" +
        "• Optical Parameters:\n" +
        "  - Core D-Block Index: n₁ = 1.500 (Optical Glass).\n" +
        "  - Surrounding Medium: n₂ = 1.000 (Air).\n" +
        "  - Critical Angle Threshold: θ_c = arcsin(1.000 / 1.500) = 41.81° ≈ 41.8°.\n" +
        "• Experimental Result: At i = 41.8°, the refracted ray skims the flat face at r = 90.0°, and the reflected ray reaches 100% intensity, successfully activating the target detector.",
      formulas: [
        {
          label: "1. SNELL'S LAW OF REFRACTION",
          formula: "n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2",
          explanation: "Governs the directional change of wavefronts passing between media of differing refractive indices.",
        },
        {
          label: "2. CRITICAL ANGLE FORMULA",
          formula: "\\sin \\theta_c = \\dfrac{n_2}{n_1} \\quad \\implies \\quad \\theta_c = \\arcsin\\left(\\dfrac{n_2}{n_1}\\right)",
          explanation: "The unique incident angle in the denser medium for which the angle of refraction into the rarer medium reaches exactly 90°.",
        },
        {
          label: "3. TOTAL INTERNAL REFLECTION (TIR) CRITERION",
          formula: "i \\ge \\theta_c \\quad \\implies \\quad R = 1.00 \\ (100\\% \\text{ reflection}), \\quad T = 0.00",
          explanation: "When incidence equals or exceeds the critical angle, all wave energy reflects back internally with zero transmission loss.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Optical Properties of the Interface",
          math: "n_1 = 1.50\\text{ (glass)}, \\quad n_2 = 1.00\\text{ (air)}, \\quad n_1 > n_2",
          explanation: "Light originates in the denser glass D-block and strikes the planar air boundary, fulfilling the first condition for TIR.",
        },
        {
          step: 2,
          title: "Set Boundary Condition for Grazing Refraction",
          math: "\\theta_2 = 90.0^\\circ \\implies \\sin(\\theta_2) = \\sin(90.0^\\circ) = 1.000",
          explanation: "At the critical threshold, the emergent ray skims flat along the interface at right angles to the normal.",
        },
        {
          step: 3,
          title: "Substitute into Snell's Law",
          math: "n_1 \\sin \\theta_c = n_2 \\sin(90^\\circ) \\implies 1.50 \\times \\sin \\theta_c = 1.00 \\times 1.000",
          explanation: "Equating the boundary terms to isolate the sine of the critical angle.",
        },
        {
          step: 4,
          title: "Calculate the Numerical Critical Angle (θ_c)",
          math: "\\sin \\theta_c = \\dfrac{1.00}{1.50} = \\dfrac{2}{3} \\approx 0.6667 \\implies \\theta_c = \\arcsin(0.6667) = \\mathbf{41.81^\\circ \\approx 41.8^\\circ}",
          explanation: "Taking the inverse sine yields the precise critical angle of 41.8°.",
        },
        {
          step: 5,
          title: "Confirm Total Internal Reflection State",
          math: "i = 41.8^\\circ \\ge \\theta_c \\implies R = 100\\%, \\quad r_{\\text{refl}} = i = 41.8^\\circ",
          explanation: "Because the laser angle meets θ_c, the transmitted ray vanishes and the full-power reflected ray hits the target sensor.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: Equilateral Crown Glass Prism (Minimum Deviation)",
    subtitle: "Tune laser angle i = 49.5° to achieve symmetrical minimum deviation δ_m = 39.0° through a 60° prism",
    parameterName: "Incident Angle (i)",
    parameterUnit: "°",
    opticalElement: "prism",
    refractiveIndex: 1.520,
    prismApexAngle: 60.0,
    targetAngle: 49.5,
    tolerance: 0.5,
    sliderMin: 30.0,
    sliderMax: 75.0,
    sliderDefault: 38.0,
    stepSmall: 0.1,
    stepLarge: 1.0,
    targetDisplay: "i = 49.5°",
    targetDescription: "Tune incident angle i to achieve symmetrical refraction through the equilateral prism at the Angle of Minimum Deviation δ_m = 39.0°.",
    mathDerivation: {
      title: "Prism Refraction, Minimum Deviation & Symmetry",
      concept:
        "When a collimated laser beam passes through a triangular glass prism, it undergoes two successive refractions: first from air into glass at face 1 (bending toward the normal), and then from glass back into air at face 2 (bending away from the normal). Both refractions bend the beam toward the base of the prism.\n\n" +
        "1. Geometry of Prism Deviation\n" +
        "Consider an equilateral prism with apex angle A = 60.0°. At the first face, the ray enters with angle of incidence i and refracts at internal angle r₁. Traveling through the glass, it strikes the second face with internal incidence angle r₂ and emerges into air at angle e.\n" +
        "From the geometry of the triangle formed by the two refracting faces and the ray path:\n" +
        "r₁ + r₂ = A = 60.0°\n" +
        "The total deviation angle δ is the net angular deflection between the incoming incident ray and the outgoing emergent ray:\n" +
        "δ = (i - r₁) + (e - r₂) = (i + e) - (r₁ + r₂) = i + e - A\n\n" +
        "2. The Characteristic Deviation Curve and Minimum Deviation (δ_m)\n" +
        "If we plot total deviation δ as a function of incident angle i, the curve is strictly U-shaped: starting from glancing angles, δ decreases rapidly, reaches a unique minimum value δ_m, and then rises again at steep angles of incidence.\n" +
        "By the Principle of Optical Reversibility, if a ray entering at angle i emerges at angle e with deviation δ, then a reverse ray entering at angle e must retrace the exact path and emerge at angle i with the same deviation δ. Because the U-shaped curve has only ONE single minimum point, the incident and emergent angles at this turning point must be mathematically identical!\n" +
        "• Condition for Minimum Deviation: i = e\n" +
        "• Consequence for Internal Angles: Since r₁ + r₂ = A and i = e, Snell's law forces r₁ = r₂ = A / 2 = 60.0° / 2 = 30.0°.\n" +
        "• Internal Ray Path: The ray travels completely horizontally and parallel to the prism base inside the glass.\n\n" +
        "3. Calculating the Target Angle for Crown Glass (n = 1.520)\n" +
        "Applying Snell's Law at the first refracting face:\n" +
        "1.00 · sin(i) = n · sin(r₁) = 1.520 · sin(30.0°) = 1.520 · 0.500 = 0.7600\n" +
        "i = arcsin(0.7600) = 49.46° ≈ 49.5°!\n" +
      "The total minimum deviation angle is therefore:\n" +
        "δ_m = 2i - A = 2(49.46°) - 60.0° = 98.92° - 60.0° = 38.92° ≈ 39.0°.",
      conclusion:
      "Summary & Key Physics Takeaways:\n" +
        "• Minimum Deviation Characteristics:\n" +
        "  - Symmetry: Angle of incidence equals angle of emergence (i = e = 49.5°).\n" +
        "  - Internal Angles: r₁ = r₂ = A / 2 = 30.0°.\n" +
        "  - Ray Orientation: Transmitted beam travels strictly parallel to the prism base.\n" +
        "• Material Parameters:\n" +
        "  - Apex Angle: A = 60.0°.\n" +
        "  - Crown Glass Refractive Index: n = 1.520.\n" +
        "  - Angle of Minimum Deviation: δ_m = 39.0°.\n" +
        "• Practical Value: Operating at minimum deviation minimizes optical aberrations, keeps transmission throughput highest, and provides the baseline for precision prism spectrometers.",
      formulas: [
        {
          label: "1. GENERAL PRISM DEVIATION FORMULA",
          formula: "\\delta = i + e - A",
          explanation: "Expresses total angular deflection as a function of incident angle, emergent angle, and apex angle.",
        },
        {
          label: "2. MINIMUM DEVIATION SYMMETRY CONDITIONS",
          formula: "i = e, \\quad r_1 = r_2 = \\dfrac{A}{2}",
          explanation: "At minimum deviation, the ray traverses the prism symmetrically and travels parallel to its base.",
        },
        {
          label: "3. MINIMUM DEVIATION RELATION",
          formula: "\\delta_m = 2i - A \\quad \\iff \\quad i = \\dfrac{A + \\delta_m}{2}",
          explanation: "Directly relates the angle of minimum deviation to the symmetrical angle of incidence.",
        },
        {
          label: "4. SNELL'S LAW AT FIRST FACE",
          formula: "\\sin i = n \\sin r_1 = n \\sin\\left(\\dfrac{A}{2}\\right)",
          explanation: "Connects the external incident angle to the refractive index under minimum deviation symmetry.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Prism Geometry and Refractive Index",
          math: "A = 60.0^\\circ \\text{ (equilateral)}, \\quad n = 1.520 \\text{ (crown glass)}",
          explanation: "The equilateral prism has equal internal angles of 60° at all vertices.",
        },
        {
          step: 2,
          title: "Determine Symmetrical Internal Refraction Angle",
          math: "r_1 = r_2 = \\dfrac{A}{2} = \\dfrac{60.0^\\circ}{2} = 30.0^\\circ",
          explanation: "Under minimum deviation, internal refraction angles split the apex angle evenly.",
        },
        {
          step: 3,
          title: "Apply Snell's Law to Find sin(i)",
          math: "\\sin(i) = n \\sin(r_1) = 1.520 \\times \\sin(30.0^\\circ) = 1.520 \\times 0.5000 = 0.7600",
          explanation: "Multiplying the refractive index by sin(30°) gives 0.7600.",
        },
        {
          step: 4,
          title: "Solve for Incident Angle (i)",
          math: "i = \\arcsin(0.7600) = \\mathbf{49.46^\\circ \\approx 49.5^\\circ}",
          explanation: "Setting the goniometer laser arm to 49.5° establishes minimum deviation.",
        },
        {
          step: 5,
          title: "Compute Net Minimum Deviation (δ_m)",
          math: "\\delta_m = 2i - A = 2(49.46^\\circ) - 60.0^\\circ = 98.92^\\circ - 60.0^\\circ = \\mathbf{38.92^\\circ \\approx 39.0^\\circ}",
          explanation: "The laser beam is deflected 39.0° toward the base, aligning perfectly with the target.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: Spectrometer Identification (Dense Flint Glass)",
    subtitle: "Tune incident angle i = 56.1° to measure minimum deviation δ_m = 52.2° and identify the unknown prism index (n = 1.660)",
    parameterName: "Incident Angle (i)",
    parameterUnit: "°",
    opticalElement: "prism",
    refractiveIndex: 1.660,
    prismApexAngle: 60.0,
    targetAngle: 56.1,
    tolerance: 0.5,
    sliderMin: 35.0,
    sliderMax: 80.0,
    sliderDefault: 42.0,
    stepSmall: 0.1,
    stepLarge: 1.0,
    targetDisplay: "i = 56.1°",
    targetDescription: "Find the minimum deviation angle δ_m = 52.2° to determine the unknown heavy flint glass index n = 1.660 using the master prism formula.",
    mathDerivation: {
      title: "Prism Spectrometer & Refractive Index Determination",
      concept:
        "The optical spectrometer is one of the most accurate instruments in experimental physics. It allows researchers and gemologists to deduce the internal refractive index of an unknown crystal or optical glass by simply measuring angular deflections with a graduated protractor turntable.\n\n" +
        "1. Derivation of the Master Prism Formula\n" +
        "At the angle of minimum deviation δ_m, we established two fundamental physical conditions:\n" +
        "• Symmetrical incidence and emergence: i = e  ⟹  i = (A + δ_m) / 2\n" +
        "• Equal internal refraction angles: r₁ = r₂  ⟹  r₁ = A / 2\n" +
        "Substituting these exact expressions into Snell's Law (n₁ sin i = n₂ sin r₁) with air as medium 1 (n₁ = 1.000) yields the celebrated Master Prism Formula:\n" +
        "n = sin((A + δ_m) / 2) / sin(A / 2)\n" +
      "This formula is extraordinary: it enables the determination of an intrinsic atomic property (the optical refractive index n) solely from two macroscopic angle measurements—the prism apex angle A and the minimum deviation angle δ_m—completely independent of the prism's physical size or thickness!\n\n" +
        "2. Optical Dispersion and Dense Flint Glass\n" +
        "Flint glass contains heavy metal elements such as lead oxide (PbO) or titanium, which dramatically increase electron polarizability and optical density. Compared to light crown glass (n ≈ 1.52), dense flint glass exhibits a much higher refractive index (n = 1.660) and intense optical dispersion.\n" +
        "When light passes through this high-index prism:\n" +
        "• Internal Angle: r₁ = A / 2 = 60.0° / 2 = 30.0°.\n" +
        "• Snell's Law at Face 1: sin(i) = n · sin(r₁) = 1.660 · sin(30.0°) = 1.660 · 0.500 = 0.8300.\n" +
        "• Required Incident Angle: i = arcsin(0.8300) = 56.10° ≈ 56.1°.\n" +
        "• Resulting Minimum Deviation Angle: δ_m = 2i - A = 2(56.10°) - 60.0° = 112.20° - 60.0° = 52.2°.\n\n" +
        "3. Comparison of Deviation: Flint Glass vs. Crown Glass\n" +
        "Notice the dramatic difference caused by the higher refractive index:\n" +
        "• Crown Glass (n = 1.520): Minimum deviation δ_m = 39.0° (incident angle i = 49.5°).\n" +
        "• Dense Flint Glass (n = 1.660): Minimum deviation δ_m = 52.2° (incident angle i = 56.1°).\n" +
        "The dense flint glass produces 13.2° greater angular deflection, clearly distinguishing it on the spectrometer.",
      conclusion:
      "Summary & Key Physics Takeaways:\n" +
        "• Master Prism Formula: n = sin((A + δ_m) / 2) / sin(A / 2).\n" +
        "• Experimental Spectrometer Results:\n" +
        "  - Prism Apex Angle: A = 60.0°.\n" +
        "  - Measured Minimum Deviation: δ_m = 52.2°.\n" +
        "  - Incidence Angle at Minimum Deviation: i = (60.0° + 52.2°) / 2 = 56.1°.\n" +
        "  - Internal Refraction Angle: r₁ = 60.0° / 2 = 30.0°.\n" +
        "  - Calculated Refractive Index: n = sin(56.1°) / sin(30.0°) = 0.8300 / 0.5000 = 1.660.\n" +
        "• Physical Conclusion: A higher refractive index causes a larger minimum deviation angle. Setting i = 56.1° hits the spectrometer detector and positively identifies the unknown sample as Dense Flint Glass.",
      formulas: [
        {
          label: "1. THE MASTER PRISM SPECTROMETER FORMULA",
          formula: "n = \\dfrac{\\sin\\left(\\dfrac{A + \\delta_m}{2}\\right)}{\\sin\\left(\\dfrac{A}{2}\\right)}",
          explanation: "Calculates the unknown refractive index of a prism material directly from apex angle A and minimum deviation δ_m.",
        },
        {
          label: "2. INCIDENCE ANGLE AT MINIMUM DEVIATION",
          formula: "i = \\dfrac{A + \\delta_m}{2}",
          explanation: "Determines the symmetrical angle of incidence required to reach the minimum deviation angle.",
        },
        {
          label: "3. INTERNAL REFRACTION ANGLE AT SYMMETRY",
          formula: "r_1 = r_2 = \\dfrac{A}{2}",
          explanation: "At minimum deviation, the internal refraction angle is exactly half the prism apex angle.",
        },
        {
          label: "4. SNELL'S LAW RATIO",
          formula: "n = \\dfrac{\\sin i}{\\sin r_1} = \\dfrac{\\sin\\left(\\frac{A + \\delta_m}{2}\\right)}{\\sin\\left(\\frac{A}{2}\\right)}",
          explanation: "Equates the ratio of sines to the relative refractive index of the prism glass.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Spectrometer Parameters",
          math: "A = 60.0^\\circ, \\quad n = 1.660 \\text{ (dense flint glass)}, \\quad r_1 = 30.0^\\circ",
          explanation: "An equilateral test prism made of dense high-index optical flint glass.",
        },
        {
          step: 2,
          title: "Calculate Angle of Incidence for Minimum Deviation",
          math: "\\sin(i) = n \\sin(r_1) = 1.660 \\times \\sin(30.0^\\circ) = 1.660 \\times 0.500 = 0.8300",
          explanation: "Using Snell's Law to calculate the required sine of incidence.",
        },
        {
          step: 3,
          title: "Solve for Incident Laser Angle (i)",
          math: "i = \\arcsin(0.8300) = \\mathbf{56.10^\\circ \\approx 56.1^\\circ}",
          explanation: "Tilting the goniometer arm to 56.1° establishes the minimum deviation condition.",
        },
        {
          step: 4,
          title: "Determine Measured Minimum Deviation (δ_m)",
          math: "\\delta_m = 2i - A = 2(56.10^\\circ) - 60.0^\\circ = 112.20^\\circ - 60.0^\\circ = \\mathbf{52.20^\\circ \\approx 52.2^\\circ}",
          explanation: "The detector plate registers minimum deviation at exactly 52.2° from the incident path.",
        },
        {
          step: 5,
          title: "Verify Unknown Material via Master Prism Formula",
          math: "n = \\dfrac{\\sin\\left(\\frac{60^\\circ + 52.2^\\circ}{2}\\right)}{\\sin\\left(\\frac{60^\\circ}{2}\\right)} = \\dfrac{\\sin(56.1^\\circ)}{\\sin(30.0^\\circ)} = \\dfrac{0.8300}{0.5000} = \\mathbf{1.660}",
          explanation: "The master formula mathematically confirms the material is Dense Flint Glass (n = 1.660).",
        },
      ],
    },
  },
};

interface RayOpticsState {
  currentStage: number;
  sliderValue: number; // Incident angle i in degrees
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
  getStageConfig: () => RayOpticsStageConfig;
  getPhysicsState: () => {
    incidentAngle: number; // i in degrees
    refractedAngle: number; // r in degrees (or r1)
    deviationAngle: number; // delta in degrees
    isTIR: boolean; // whether Total Internal Reflection occurs
    criticalAngle: number; // theta_c in degrees
    isCorrect: boolean;
    refractiveIndex: number;
    reflectance: number; // 0..1
    transmittance: number; // 0..1
  };
}

export const useRayOpticsStore = create<RayOpticsState>((set, get) => ({
  currentStage: 1,
  sliderValue: RAY_OPTICS_STAGES[1].sliderDefault,
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
    const clamped = Math.max(config.sliderMin, Math.min(config.sliderMax, Number(val.toFixed(1))));
    set({ sliderValue: clamped });
  },

  getStageConfig: () => {
    const stageNum = get().currentStage;
    return RAY_OPTICS_STAGES[stageNum] || RAY_OPTICS_STAGES[1];
  },

  getPhysicsState: () => {
    const config = get().getStageConfig();
    const iDeg = get().sliderValue;
    const iRad = (iDeg * Math.PI) / 180;
    const n = config.refractiveIndex;

    if (config.opticalElement === "semi-circle") {
      // Stage 1: Dense glass (n) to rare air (1.00)
      const sinCritical = 1.0 / n;
      const criticalAngleDeg = (Math.asin(sinCritical) * 180) / Math.PI; // ~41.81°
      const isTIR = iDeg >= criticalAngleDeg;

      let rDeg = 90.0;
      let reflectance = 1.0;
      let transmittance = 0.0;

      if (!isTIR) {
        const sinR = n * Math.sin(iRad);
        const rRad = Math.asin(Math.min(1.0, sinR));
        rDeg = (rRad * 180) / Math.PI;

        // Fresnel approximation
        const r0 = Math.pow((n - 1.0) / (n + 1.0), 2);
        reflectance = Math.min(1.0, r0 + (1 - r0) * Math.pow(1 - Math.cos(iRad), 5));
        transmittance = 1.0 - reflectance;
      }

      const diff = Math.abs(iDeg - config.targetAngle);
      const isCorrect = diff <= config.tolerance;

      return {
        incidentAngle: iDeg,
        refractedAngle: rDeg,
        deviationAngle: isTIR ? 180 - 2 * iDeg : Math.abs(rDeg - iDeg),
        isTIR,
        criticalAngle: criticalAngleDeg,
        isCorrect,
        refractiveIndex: n,
        reflectance,
        transmittance,
      };
    } else {
      // Stages 2 & 3: Equilateral prism (A = 60°)
      const A_deg = config.prismApexAngle;
      const A_rad = (A_deg * Math.PI) / 180;

      // Snell's Law at face 1: air -> glass
      const sinR1 = Math.sin(iRad) / n;
      const r1_rad = Math.asin(Math.min(1.0, sinR1));
      const r1_deg = (r1_rad * 180) / Math.PI;

      // Internal geometry: r1 + r2 = A
      const r2_rad = A_rad - r1_rad;
      const r2_deg = (r2_rad * 180) / Math.PI;

      // Snell's Law at face 2: glass -> air
      const sinE = n * Math.sin(r2_rad);
      let e_deg = 90.0;
      let isTIR = false;
      let delta_deg = 0.0;

      if (sinE > 1.0) {
        // TIR at second face
        isTIR = true;
        delta_deg = 180; // internally reflected
      } else {
        const e_rad = Math.asin(Math.min(1.0, Math.max(-1.0, sinE)));
        e_deg = (e_rad * 180) / Math.PI;
        delta_deg = iDeg + e_deg - A_deg;
      }

      const diff = Math.abs(iDeg - config.targetAngle);
      const isCorrect = diff <= config.tolerance;

      return {
        incidentAngle: iDeg,
        refractedAngle: r1_deg,
        deviationAngle: delta_deg,
        isTIR,
        criticalAngle: (Math.asin(1.0 / n) * 180) / Math.PI,
        isCorrect,
        refractiveIndex: n,
        reflectance: 0.08,
        transmittance: 0.92,
      };
    }
  },

  startMission: () => {
    set({
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      cameraTrigger: Date.now(),
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
    const currentAngle = get().sliderValue;
    const diff = Math.abs(currentAngle - config.targetAngle);
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
        const direction = currentAngle < config.targetAngle ? "too low" : "too high";
        const reason =
          config.opticalElement === "semi-circle"
            ? `Incident angle ${currentAngle.toFixed(1)}° is ${direction}. Critical angle is ${config.targetAngle.toFixed(1)}°.`
            : `Incident angle ${currentAngle.toFixed(1)}° is ${direction}. Target minimum deviation incidence is ${config.targetAngle.toFixed(1)}°.`;

        set({
          isVerifying: false,
          isWon: false,
          isGameOver: true,
          failureReason: reason,
          showResultModal: true,
        });
      }
    }, 1000);
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
      const nextConfig = RAY_OPTICS_STAGES[next];
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
      const config = RAY_OPTICS_STAGES[stageNum];
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
