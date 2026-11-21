import { create } from "zustand";

export interface InclinedRailsStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  parameterName: string;
  parameterUnit: string;

  // Incline & Physics Parameters
  thetaDeg: number;
  thetaRad: number;
  mass: number; // 0.50 kg
  length: number; // 1.00 m
  bField: number; // 0.50 T
  gravity: number; // 10 m/s^2
  mu_s: number; // static friction coefficient
  isFieldNormal: boolean; // false = vertical field, true = normal to incline

  // Target & Incline Positions
  sStart: number; // e.g. -0.95 m (bottom bumper)
  sTarget: number; // e.g. +0.35 m (target gate)

  // Slider Configuration
  sliderMin: number;
  sliderMax: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;

  targetValue: number;
  tolerance: number;
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

export const INCLINED_RAILS_STAGES: Record<number, InclinedRailsStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Smooth Incline Magnetic Equilibrium (JEE Mains)",
    subtitle: "Dial current I = 10.00 A so magnetic force F_B cos θ balances gravity mg sin θ at θ = 45°",
    parameterName: "Conductor Current (I)",
    parameterUnit: "A",
    thetaDeg: 45,
    thetaRad: Math.PI / 4,
    mass: 0.5,
    length: 1.0,
    bField: 0.5,
    gravity: 10.0,
    mu_s: 0.0,
    isFieldNormal: false,
    sStart: -0.95,
    sTarget: 0.35,
    sliderMin: 2.0,
    sliderMax: 18.0,
    sliderDefault: 4.0,
    stepSmall: 0.05,
    stepLarge: 0.5,
    targetValue: 10.0,
    tolerance: 0.005,
    targetDisplay: "Equilibrium at I = 10.00 A  [Target: s = +0.35 m]",
    targetDescription: "Balance the conducting rod (m = 0.5 kg, L = 1.0 m) at the target gate on the 45° smooth incline by setting current I.",
    mathDerivation: {
      title: "Stage 1: Mechanical Equilibrium on a Frictionless Incline (JEE Mains)",
      concept:
        "Imagine a conducting metal rod of mass m = 0.50 kg and length L = 1.00 m resting on smooth parallel rails inclined at angle θ = 45° to the horizontal. A uniform magnetic field B = 0.50 T points vertically upwards.\n\n" +
        "When an electric current I passes through the rod, two competing forces act along the inclined track:\n" +
        "1. Gravity (Downhill): Pulls the rod straight down with weight W = mg. The component acting parallel to the incline, pulling it downhill, is F_g,∥ = mg sin θ.\n" +
        "2. Magnetic Lorentz Force (Uphill): By the Right-Hand Rule, current I flowing across the rod in a vertical magnetic field produces a strictly HORIZONTAL force F_B = I L B. Because the rails are tilted at angle θ, the component of this horizontal force pushing parallel UP the incline is F_B,∥ = (I L B) cos θ.\n\n" +
        "For the rod to remain perfectly stationary in equilibrium at the target gate, the upward magnetic force must exactly balance the downward gravitational pull: (I L B) cos θ = mg sin θ.",
      conclusion:
        "Key Physics Takeaway: On a smooth incline in a vertical magnetic field, the required balance current depends directly on tan θ. At θ = 45°, tan(45°) = 1.00, meaning the required horizontal magnetic force must equal the rod's full weight (5.00 N). Dialing current I = 10.00 A produces an upward force of exactly 3.54 N, balancing gravity and locking the rod firmly at the target gate.",
      formulas: [
        {
          label: "1. HORIZONTAL MAGNETIC LORENTZ FORCE",
          formula: "\\vec{F}_B = I(\\vec{L} \\times \\vec{B}) \\implies |F_B| = I L B",
          explanation: "By vector cross product, current flowing along the rod in a vertical field creates a purely horizontal force pointing toward the incline.",
        },
        {
          label: "2. PARALLEL FORCE BALANCE (ALONG INCLINE)",
          formula: "F_{B,\\parallel} = F_{g,\\parallel} \\iff (I L B)\\cos\\theta = mg \\sin\\theta",
          explanation: "The uphill component of the horizontal magnetic push (cos θ) balances the downhill gravitational pull (sin θ).",
        },
        {
          label: "3. TARGET CURRENT FORMULA",
          formula: "I = \\dfrac{mg \\sin\\theta}{LB \\cos\\theta} = \\dfrac{mg \\tan\\theta}{LB}",
          explanation: "Dividing sin θ by cos θ gives tan θ. The current required for balance scales directly with tan θ.",
        },
        {
          label: "4. EXACT NUMERICAL CALCULATION",
          formula: "I = \\dfrac{0.50\\text{ kg} \\times 10\\text{ m/s}^2 \\times \\tan(45^\\circ)}{1.00\\text{ m} \\times 0.50\\text{ T}} = \\dfrac{5.00 \\times 1.00}{0.50} = 10.00\\text{ A}",
          explanation: "Substituting the given values yields exactly 10.00 A. At this current, the net parallel force is exactly 0.00 N.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Given Parameters",
          math: "m = 0.50\\text{ kg}, \\quad g = 10.0\\text{ m/s}^2, \\quad \\theta = 45^\\circ, \\quad L = 1.00\\text{ m}, \\quad B = 0.50\\text{ T}",
          explanation: "The rod has a total weight W = mg = (0.50)(10.0) = 5.00 N, and rests on smooth (frictionless) rails inclined at 45°.",
        },
        {
          step: 2,
          title: "Resolve Forces Along the Inclined Plane",
          math: "F_{g,\\parallel} = mg \\sin(45^\\circ) = 5.00 \\times \\frac{\\sqrt{2}}{2} \\approx 3.536\\text{ N} \\quad (\\text{Downhill})",
          explanation: "Gravity tries to accelerate the rod down the ramp with a parallel force of 3.54 N.",
        },
        {
          step: 3,
          title: "Determine the Upward Magnetic Component",
          math: "F_{B,\\parallel} = (I L B)\\cos(45^\\circ) = (I \\times 1.00 \\times 0.50) \\times \\frac{\\sqrt{2}}{2} \\approx 0.3536 \\cdot I \\quad (\\text{Uphill})",
          explanation: "Because magnetic field B is vertical, Lorentz force F_B = ILB is horizontal. Its component directed UP the ramp is (ILB) cos 45°.",
        },
        {
          step: 4,
          title: "Equate Upward and Downward Forces for Equilibrium",
          math: "(I L B)\\cos(45^\\circ) = mg \\sin(45^\\circ) \\implies I = \\dfrac{mg \\tan(45^\\circ)}{LB}",
          explanation: "Since sin(45°) = cos(45°), they cancel out directly, leaving tan(45°) = 1.00.",
        },
        {
          step: 5,
          title: "Calculate the Exact Required Conductor Current",
          math: "I = \\dfrac{5.00 \\times 1.00}{1.00 \\times 0.50} = \\dfrac{5.00}{0.50} = \\mathbf{10.00\\text{ A}}",
          explanation: "Setting current I = 10.00 A produces an upward force of exactly 3.54 N, balancing downhill gravity and holding the rod locked at the target gate.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: Incline with Static Friction Threshold (JEE Advanced)",
    subtitle: "Calculate minimum threshold current I_min = 6.00 A to prevent slipping down the rough incline (μ_s = 0.25, θ = 45°)",
    parameterName: "Conductor Current (I)",
    parameterUnit: "A",
    thetaDeg: 45,
    thetaRad: Math.PI / 4,
    mass: 0.5,
    length: 1.0,
    bField: 0.5,
    gravity: 10.0,
    mu_s: 0.25,
    isFieldNormal: false,
    sStart: -0.95,
    sTarget: 0.35,
    sliderMin: 2.0,
    sliderMax: 14.0,
    sliderDefault: 3.0,
    stepSmall: 0.05,
    stepLarge: 0.5,
    targetValue: 6.0,
    tolerance: 0.005,
    targetDisplay: "Threshold I_min = 6.00 A  [Target: s = +0.35 m]",
    targetDescription: "Hold the rod on the rough incline (μ_s = 0.25, θ = 45°) at the target gate by setting minimum current I_min.",
    mathDerivation: {
      title: "Stage 2: Static Friction Threshold Balance on Rough Incline (JEE Advanced)",
      concept:
        "In this stage, the rails have surface roughness with coefficient of static friction μ_s = 0.25. The rod is in danger of slipping DOWN the incline.\n\n" +
        "How Static Friction Helps:\n" +
        "When the rod experiences impending downward motion, static friction f_s = μ_s N acts UP the incline! It directly assists the magnetic force in holding the rod.\n\n" +
        "Critical Normal Reaction (N):\n" +
        "The normal force pressing perpendicular between the rails and rod has TWO sources:\n" +
        "1. The normal component of gravity: mg cos θ\n" +
        "2. The horizontal magnetic force F_B = ILB presses INTO the inclined plane with component: (I L B) sin θ\n" +
        "Therefore, total normal reaction is: N = mg cos θ + (I L B) sin θ.\n\n" +
        "Balance Equation for Minimum Current (I_min):\n" +
        "At impending downward slip: (Upward Magnetic Force) + (Max Static Friction) = (Downward Gravity)\n" +
        "(I_min · L · B) cos θ + μ_s [mg cos θ + (I_min · L · B) sin θ] = mg sin θ.",
      conclusion:
        "Key Physics Takeaway: Because static friction assists with up to 1.41 N of upward holding force, you do not need 10.00 A. The minimum current needed to prevent sliding is reduced to exactly 6.00 A. Any current in the stability window between I_min = 6.00 A and I_max = 16.67 A keeps the rod stably locked in static equilibrium.",
      formulas: [
        {
          label: "1. TOTAL NORMAL CONTACT FORCE",
          formula: "N = mg \\cos\\theta + (I L B)\\sin\\theta",
          explanation: "The horizontal magnetic force pushes into the ramp surface, significantly increasing contact pressure and normal reaction.",
        },
        {
          label: "2. MAXIMUM STATIC FRICTION FORCE",
          formula: "f_{s,\\max} = \\mu_s N = \\mu_s \\left[ mg \\cos\\theta + (I L B)\\sin\\theta \\right]",
          explanation: "Static friction acts UP the incline, opposing impending downward slip.",
        },
        {
          label: "3. IMPENDING DOWNWARD SLIP EQUILIBRIUM",
          formula: "(I_{\\min} L B)\\cos\\theta + \\mu_s N = mg \\sin\\theta",
          explanation: "Upward magnetic propulsion plus static friction equals downhill gravitational pull.",
        },
        {
          label: "4. CLOSED-FORM MINIMUM CURRENT FORMULA",
          formula: "I_{\\min} = \\dfrac{mg (\\sin\\theta - \\mu_s \\cos\\theta)}{LB (\\cos\\theta + \\mu_s \\sin\\theta)} = \\dfrac{mg (1 - \\mu_s)}{LB (1 + \\mu_s)} \\quad [\\text{at } \\theta = 45^\\circ]",
          explanation: "At 45°, cos θ = sin θ factors out, yielding the elegant ratio (1 - μ_s) / (1 + μ_s).",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Parameters with Surface Friction",
          math: "m = 0.50\\text{ kg}, \\quad g = 10.0\\text{ m/s}^2, \\quad \\theta = 45^\\circ, \\quad \\mu_s = 0.25, \\quad L = 1.00\\text{ m}, \\quad B = 0.50\\text{ T}",
          explanation: "The rails are rough with static friction coefficient μ_s = 0.25.",
        },
        {
          step: 2,
          title: "Formulate the Normal Force Expression",
          math: "N = mg \\cos(45^\\circ) + (I_{\\min} L B)\\sin(45^\\circ)",
          explanation: "Both gravity and the magnetic force contribute to the normal reaction pressing the rod against the rails.",
        },
        {
          step: 3,
          title: "Set Up the Boundary Force Balance",
          math: "(I_{\\min} L B)\\cos(45^\\circ) + \\mu_s \\left[ mg \\cos(45^\\circ) + (I_{\\min} L B)\\sin(45^\\circ) \\right] = mg \\sin(45^\\circ)",
          explanation: "At the threshold of downward slipping, static friction reaches its maximum possible value f_s = μ_s N uphill.",
        },
        {
          step: 4,
          title: "Simplify Trigonometric Terms at 45°",
          math: "I_{\\min} L B (1 + \\mu_s) = mg (1 - \\mu_s) \\implies I_{\\min} = \\dfrac{mg}{LB} \\cdot \\dfrac{1 - \\mu_s}{1 + \\mu_s}",
          explanation: "Dividing through by cos(45°) = sin(45°) simplifies the relation to a simple ratio involving μ_s = 0.25.",
        },
        {
          step: 5,
          title: "Compute the Exact Threshold Current",
          math: "I_{\\min} = \\dfrac{0.50 \\times 10.0}{1.00 \\times 0.50} \\times \\dfrac{1 - 0.25}{1 + 0.25} = 10.00 \\times \\dfrac{0.75}{1.25} = 10.00 \\times 0.60 = \\mathbf{6.00\\text{ A}}",
          explanation: "Setting current I = 6.00 A provides exactly enough magnetic lift that, combined with static friction, holds the rod securely at the target gate.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: Normal Magnetic Field Orientation (JEE Advanced)",
    subtitle: "Magnetic field is tilted perpendicular to rails (B ⊥ incline at θ = 30°); calculate I = 5.00 A for equilibrium",
    parameterName: "Conductor Current (I)",
    parameterUnit: "A",
    thetaDeg: 30,
    thetaRad: Math.PI / 6,
    mass: 0.5,
    length: 1.0,
    bField: 0.5,
    gravity: 10.0,
    mu_s: 0.0,
    isFieldNormal: true,
    sStart: -0.95,
    sTarget: 0.35,
    sliderMin: 1.0,
    sliderMax: 12.0,
    sliderDefault: 2.0,
    stepSmall: 0.05,
    stepLarge: 0.5,
    targetValue: 5.0,
    tolerance: 0.005,
    targetDisplay: "Equilibrium at I = 5.00 A  [Target: s = +0.35 m]",
    targetDescription: "Balance the rod on the 30° incline with normal magnetic field B = 0.50 T by setting current I.",
    mathDerivation: {
      title: "Stage 3: Perpendicular Field Alignment & Direct Ramp Propulsion (JEE Advanced)",
      concept:
        "In this advanced configuration, the magnetic coils are tilted so the uniform magnetic field B = 0.50 T is oriented PERPENDICULAR (normal) to the inclined rails (directed along unit normal n̂).\n\n" +
        "Why Normal Field Is 100% Efficient:\n" +
        "Because the conducting rod lies transversely across the rails (x̂) and field B is perpendicular to the ramp (n̂), the magnetic Lorentz force vector is:\n" +
        "  F_B = I(L × B)\n" +
        "By the Right-Hand Rule (x̂ × n̂), the resulting force points DIRECTLY ALONG THE INCLINE UP THE RAMP!\n\n" +
        "Notice the crucial difference from Stages 1 and 2:\n" +
        "There is NO cosine reduction factor (cos θ) because the force is already parallel to the rails! 100% of the Lorentz force acts as uphill propulsion: F_B,∥ = I L B.\n\n" +
        "For stationary equilibrium at the target gate on the θ = 30° ramp:\n" +
        "  Upward Magnetic Force = Downward Gravity Component\n" +
        "  I · L · B = m · g · sin θ.",
      conclusion:
        "Key Physics Takeaway: Aligning the magnetic field normal to the incline maximizes uphill propulsion efficiency. Since no magnetic force is wasted pressing into the ramp, a current of just 5.00 A produces an upward force of exactly 2.50 N, perfectly balancing gravity at θ = 30°.",
      formulas: [
        {
          label: "1. DIRECT PARALLEL MAGNETIC FORCE (B ⊥ INCLINE)",
          formula: "\\vec{F}_B = I(\\vec{L} \\times \\vec{B}_\\perp) \\implies |F_{B,\\parallel}| = I L B",
          explanation: "Because current and field are mutually perpendicular to each other and to the rails, 100% of the Lorentz force acts directly uphill.",
        },
        {
          label: "2. DIRECT FORCE EQUILIBRIUM",
          formula: "F_{B,\\parallel} = F_{g,\\parallel} \\iff I L B = mg \\sin\\theta",
          explanation: "Direct balance between upward magnetic propulsion (ILB) and downhill gravity (mg sin θ).",
        },
        {
          label: "3. TARGET CURRENT FORMULA",
          formula: "I = \\dfrac{mg \\sin\\theta}{LB}",
          explanation: "The required current scales purely with sin θ rather than tan θ.",
        },
        {
          label: "4. EXACT NUMERICAL SUBSTITUTION",
          formula: "I = \\dfrac{0.50\\text{ kg} \\times 10\\text{ m/s}^2 \\times \\sin(30^\\circ)}{1.00\\text{ m} \\times 0.50\\text{ T}} = \\dfrac{5.00 \\times 0.50}{0.50} = \\mathbf{5.00\\text{ A}}",
          explanation: "At θ = 30°, sin(30°) = 0.50. Dividing 2.50 N by 0.50 T·m yields exactly 5.00 A.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Parameters & Incline Geometry",
          math: "m = 0.50\\text{ kg}, \\quad g = 10.0\\text{ m/s}^2, \\quad \\theta = 30^\\circ, \\quad L = 1.00\\text{ m}, \\quad B = 0.50\\text{ T} \\; (\\vec{B} \\perp \\text{rails})",
          explanation: "The ramp is inclined at 30°, and the magnetic field is tilted to be normal to the ramp surface.",
        },
        {
          step: 2,
          title: "Calculate Downward Gravitational Force",
          math: "F_{g,\\parallel} = mg \\sin(30^\\circ) = 0.50 \\times 10.0 \\times 0.50 = 2.50\\text{ N} \\quad (\\text{Downhill})",
          explanation: "Gravity pulls the rod downhill with a parallel force of exactly 2.50 N.",
        },
        {
          step: 3,
          title: "Determine Upward Magnetic Propulsion",
          math: "F_{B,\\parallel} = I L B = I \\times 1.00 \\times 0.50 = 0.50 \\cdot I \\quad (\\text{Uphill})",
          explanation: "Because field B is perpendicular to the track, the entire Lorentz force acts directly parallel up the rails.",
        },
        {
          step: 4,
          title: "Equate Uphill and Downhill Forces",
          math: "I L B = mg \\sin(30^\\circ) \\implies 0.50 \\cdot I = 2.50\\text{ N}",
          explanation: "For stationary equilibrium at the target gate, net force must be zero.",
        },
        {
          step: 5,
          title: "Solve for the Required Conductor Current",
          math: "I = \\dfrac{2.50\\text{ N}}{0.50\\text{ T}\\cdot\\text{m}} = \\mathbf{5.00\\text{ A}}",
          explanation: "Setting current to I = 5.00 A balances the rod in stationary equilibrium at the target gate.",
        },
      ],
    },
  },
};

interface InclinedRailsState {
  currentStage: number;
  sliderValue: number;

  // Live Telemetry
  netForceParallel: number;
  forceMagneticParallel: number;
  forceGravityParallel: number;
  isTrajectoryTargetHit: boolean;
  statusText: string;

  // Real-time Physics Simulation Control
  isLiveSimulating: boolean; // Continuous physical animation
  rodResetVersion: number; // Incremented to trigger rod repositioning to bottom
  launchVersion: number; // Incremented to trigger launch from bottom to target
  isMovingToTarget: boolean;
  isAtTarget: boolean;
  isMissionStarted: boolean;
  missionStartedAt: number | null;
  isVerifying: boolean;
  isWon: boolean;
  isGameOver: boolean;
  failureReason: string | null;
  showResultModal: boolean;

  // Actions
  setSliderValue: (val: number) => void;
  resetToBottom: () => void;
  launchToTarget: () => void;
  runMeasurement: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  startMission: () => void;
  setLiveSimulating: (active: boolean) => void;
}

function computeForces(stageNum: number, current: number): {
  fMag: number;
  fGrav: number;
  fNet: number;
  hit: boolean;
  status: string;
} {
  const cfg = INCLINED_RAILS_STAGES[stageNum];
  const { mass, gravity, length, bField, thetaRad, mu_s, isFieldNormal } = cfg;

  const fGrav = mass * gravity * Math.sin(thetaRad); // Downward component

  let fMag = 0;
  if (isFieldNormal) {
    fMag = current * length * bField;
  } else {
    fMag = current * length * bField * Math.cos(thetaRad);
  }

  let fNet = fMag - fGrav;

  if (mu_s > 0) {
    const nForce = mass * gravity * Math.cos(thetaRad) + current * length * bField * Math.sin(thetaRad);
    const maxFriction = mu_s * nForce;
    if (Math.abs(fNet) <= maxFriction) {
      fNet = 0;
    } else if (fNet > maxFriction) {
      fNet -= maxFriction;
    } else {
      fNet += maxFriction;
    }
  }

  const hit = Math.abs(current - cfg.targetValue) < 0.005;

  let status = "";
  if (hit) {
    status = "EXACT EQUILIBRIUM CALCULATED (READY TO LOCK)";
  } else if (fNet > 0) {
    status = `NET UPHILL (+${fNet.toFixed(2)} N)`;
  } else {
    status = `NET DOWNHILL (${fNet.toFixed(2)} N)`;
  }

  return { fMag, fGrav, fNet, hit, status };
}

export const useMagneticFieldsStore = create<InclinedRailsState>((set, get) => {
  const initialStage = 1;
  const cfg = INCLINED_RAILS_STAGES[initialStage];
  const initialForces = computeForces(initialStage, cfg.sliderDefault);

  return {
    currentStage: initialStage,
    sliderValue: cfg.sliderDefault,

    netForceParallel: initialForces.fNet,
    forceMagneticParallel: initialForces.fMag,
    forceGravityParallel: initialForces.fGrav,
    isTrajectoryTargetHit: initialForces.hit,
    statusText: initialForces.status,

    isLiveSimulating: true, // ACTIVE AND ALIVE BY DEFAULT!
    rodResetVersion: 0,
    launchVersion: 0,
    isMovingToTarget: false,
    isAtTarget: false,
    isMissionStarted: false,
    missionStartedAt: null,
    isVerifying: false,
    isWon: false,
    isGameOver: false,
    failureReason: null,
    showResultModal: false,

    setSliderValue: (val: number) => {
      const { currentStage } = get();
      const stageCfg = INCLINED_RAILS_STAGES[currentStage];
      const clamped = Math.max(stageCfg.sliderMin, Math.min(stageCfg.sliderMax, val));
      const res = computeForces(currentStage, clamped);

      set({
        sliderValue: clamped,
        netForceParallel: res.fNet,
        forceMagneticParallel: res.fMag,
        forceGravityParallel: res.fGrav,
        isTrajectoryTargetHit: res.hit,
        statusText: res.status,
      });
    },

    resetToBottom: () => {
      const { rodResetVersion } = get();
      set({
        rodResetVersion: rodResetVersion + 1,
        isMovingToTarget: false,
        isAtTarget: false,
      });
    },

    launchToTarget: () => {
      const { launchVersion, isTrajectoryTargetHit, currentStage } = get();
      set({
        launchVersion: launchVersion + 1,
        isMovingToTarget: true,
        isVerifying: true,
      });

      // After travel time (1.8s), evaluate result
      setTimeout(() => {
        if (isTrajectoryTargetHit) {
          set({
            isVerifying: false,
            isMovingToTarget: false,
            isAtTarget: true,
            isWon: true,
            isGameOver: false,
            showResultModal: true,
          });
        } else {
          const { sliderValue: val, currentStage: stageId } = get();
          const formula =
            stageId === 1
              ? "I = (mg tan θ) / (LB) = 10.00 A"
              : stageId === 2
              ? "I_min = [mg(1 - μ_s)] / [LB(1 + μ_s)] = 6.00 A"
              : "I = (mg sin θ) / (LB) = 5.00 A";

          set({
            isVerifying: false,
            isMovingToTarget: false,
            isAtTarget: false,
            isWon: false,
            isGameOver: true,
            failureReason: `Incorrect current! You entered ${val.toFixed(2)} A. The rod only balances at the target gate when dialing the exact calculated value: ${formula}.`,
            showResultModal: true,
          });
        }
      }, 1900);
    },

    setLiveSimulating: (active: boolean) => {
      set({ isLiveSimulating: active });
    },

    runMeasurement: () => {
      get().launchToTarget();
    },

    resetSimulation: () => {
      const { currentStage, rodResetVersion } = get();
      const stageCfg = INCLINED_RAILS_STAGES[currentStage];
      const res = computeForces(currentStage, stageCfg.sliderDefault);
      set({
        sliderValue: stageCfg.sliderDefault,
        netForceParallel: res.fNet,
        forceMagneticParallel: res.fMag,
        forceGravityParallel: res.fGrav,
        isTrajectoryTargetHit: res.hit,
        statusText: res.status,
        isLiveSimulating: true,
        isVerifying: false,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
        rodResetVersion: rodResetVersion + 1,
        isMovingToTarget: false,
        isAtTarget: false,
      });
    },

    nextStage: () => {
      const { currentStage, rodResetVersion } = get();
      const next = currentStage < 3 ? currentStage + 1 : 1;
      const stageCfg = INCLINED_RAILS_STAGES[next];
      const res = computeForces(next, stageCfg.sliderDefault);
      set({
        currentStage: next,
        sliderValue: stageCfg.sliderDefault,
        netForceParallel: res.fNet,
        forceMagneticParallel: res.fMag,
        forceGravityParallel: res.fGrav,
        isTrajectoryTargetHit: res.hit,
        statusText: res.status,
        isLiveSimulating: true,
        isMissionStarted: true,
        missionStartedAt: performance.now(),
        isVerifying: false,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
        rodResetVersion: rodResetVersion + 1,
        isMovingToTarget: false,
        isAtTarget: false,
      });
    },

    startMission: () => {
      set({ isMissionStarted: true, missionStartedAt: performance.now() });
    },
  };
});
