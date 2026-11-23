import { create } from "zustand";

export interface MotionalEmfStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  parameterName: string;
  parameterUnit: string;
  mode: "horizontal-force" | "vertical-terminal" | "incline-capacitor";
  mass: number; // kg
  length: number; // m (rail spacing)
  bField: number; // Tesla
  gravity: number; // m/s^2
  fixedResistance?: number; // Ohms (for stage 1)
  fixedPullForce?: number; // N
  fixedTargetVelocity?: number; // m/s (for stages 1 & 2)
  fixedThetaRad?: number; // Incline angle
  fixedTargetAcceleration?: number; // m/s^2 (for stage 3)
  sStart: number; // Initial position along rail
  sTarget: number; // Target position along rail
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

export const MOTIONAL_EMF_STAGES: Record<number, MotionalEmfStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Constant-Speed Motional EMF & Power Balance (JEE Mains)",
    subtitle: "Dial external pulling force F_ext = 0.50 N to slide the rod at constant speed v = 4.00 m/s and power the bulb",
    parameterName: "External Pulling Force (F_ext)",
    parameterUnit: "N",
    mode: "horizontal-force",
    mass: 0.20,
    length: 1.00,
    bField: 0.50,
    gravity: 10.0,
    fixedResistance: 2.00,
    fixedTargetVelocity: 4.00,
    sStart: -0.90,
    sTarget: 0.40,
    sliderMin: 0.10,
    sliderMax: 2.00,
    sliderDefault: 0.20,
    stepSmall: 0.05,
    stepLarge: 0.10,
    targetValue: 0.50,
    tolerance: 0.005,
    targetDisplay: "Equilibrium at F_ext = 0.50 N (v = 4.00 m/s)",
    targetDescription: "Pull the rod at constant speed v = 4.00 m/s into the target gate by setting force F_ext.",
    mathDerivation: {
      title: "Stage 1: Motional EMF & Mechanical-to-Electrical Energy Conservation",
      concept:
        "Imagine pulling a metal rod of length L = 1.00 m along frictionless horizontal rails in an upward magnetic field B = 0.50 T. The rails are closed by an incandescent light bulb with resistance R = 2.00 Ω.\n\n" +
        "Here is the simple, step-by-step physical mechanism of what happens:\n\n" +
        "1. What creates the Voltage? (Microscopic Charge Separation)\n" +
        "When you pull the rod forward at velocity v, all the free conduction electrons inside the rod are dragged forward too. Any electric charge q moving across a magnetic field experiences a Lorentz magnetic force: F = q(v × B).\n" +
        "By the Right-Hand Rule (or Fleming's Left-Hand Rule for negative electrons), this force pushes electrons toward one rail, leaving behind exposed positive metal ions at the opposite end. This charge separation creates an electric voltage difference across the ends of the rod, called the Motional Electromotive Force (EMF):\n" +
        "E = B · L · v = (0.50 T)(1.00 m)(4.00 m/s) = 2.00 V.\n" +
        "The moving rod acts exactly like an internal 2.00 V chemical battery!\n\n" +
        "2. Why does the Light Bulb Glow? (Circuit Loop Current)\n" +
        "Because the rails are connected to the bulb (R = 2.00 Ω), this induced EMF drives a steady electric current around the closed rectangular loop according to Ohm's Law:\n" +
        "I = E / R = 2.00 V / 2.00 Ω = 1.00 A.\n" +
        "This 1.00 A current flows through the tiny filament, heating it to incandescence and producing bright visible light with power P = I² R = 2.00 W.\n\n" +
        "3. Why is an External Pulling Force Needed? (Lenz's Law & Magnetic Drag)\n" +
        "As the 1.00 A current flows through the moving rod, that current is also immersed in the perpendicular magnetic field B. A current-carrying wire in a magnetic field experiences a magnetic force F = I L B.\n" +
        "By Lenz's Law, nature always resists changes in magnetic flux: this magnetic force pushes straight BACKWARD against your pulling direction, acting like an electromagnetic brake with magnitude:\n" +
        "F_mag = I L B = (1.00 A)(1.00 m)(0.50 T) = 0.50 N.\n" +
        "If you let go of the rod, this backward drag brings it to a dead stop in milliseconds!\n\n" +
        "4. Perfect Steady Motion (Dynamic Balance)\n" +
        "To glide smoothly at constant velocity v = 4.00 m/s into the target gate with zero acceleration (a = 0), Newton's First Law requires the net force to be zero (ΣF = 0). Therefore, your pulling force F_ext must exactly match the magnetic drag: F_ext = F_mag = 0.50 N.",
      conclusion:
        "Key Physics Takeaway: Energy Conservation in Action\n" +
        "Where does the energy lighting the bulb come from? It comes directly from your hand doing mechanical work!\n" +
        "• Mechanical Power Input: P_mech = F_ext · v = (0.50 N)(4.00 m/s) = 2.00 Watts.\n" +
        "• Electrical Light & Heat Dissipation: P_elec = I² R = (1.00 A)²(2.00 Ω) = 2.00 Watts.\n" +
        "Mechanical energy is converted 100% into electrical energy: P_mech = P_elec. Setting F_ext = 0.50 N locks the glider at exactly 4.00 m/s, lighting the bulb with 2.00 W of brilliant glow.",
      formulas: [
        {
          label: "1. MOTIONAL ELECTROMOTIVE FORCE (FARADAY'S LAW)",
          formula: "\\mathcal{E} = B L v",
          explanation: "Voltage induced across the ends of the rod as it sweeps across the perpendicular magnetic flux.",
        },
        {
          label: "2. INDUCED CIRCUIT CURRENT (OHM'S LAW)",
          formula: "I = \\dfrac{\\mathcal{E}}{R} = \\dfrac{B L v}{R}",
          explanation: "The circulating current flowing through the rod, rails, and light bulb load.",
        },
        {
          label: "3. LENZ'S LAW MAGNETIC OPPOSING DRAG",
          formula: "F_{\\text{mag}} = I L B = \\dfrac{B^2 L^2 v}{R}",
          explanation: "The backward electromagnetic braking force that directly resists forward motion.",
        },
        {
          label: "4. EXTERNAL FORCE FOR CONSTANT VELOCITY",
          formula: "F_{\\text{ext}} = F_{\\text{mag}} = \\dfrac{B^2 L^2 v}{R}",
          explanation: "Net force ΣF = 0 requires pulling forward with the exact same strength as the backward magnetic drag.",
        },
        {
          label: "5. MECHANICAL & ELECTRICAL POWER EQUIVALENCE",
          formula: "P_{\\text{mech}} = F_{\\text{ext}} v = I^2 R = P_{\\text{elec}}",
          explanation: "Work done by the external pulling force per second directly equals the electrical power lighting the bulb (100% energy conservation).",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Known System Values",
          math: "B = 0.50\\text{ T}, \\quad L = 1.00\\text{ m}, \\quad R = 2.00\\,\\Omega, \\quad v = 4.00\\text{ m/s}",
          explanation: "A 1.00 m rod glides across horizontal rails in a 0.50 T vertical magnetic field connected to a 2.00 Ω light bulb.",
        },
        {
          step: 2,
          title: "Calculate the Induced Motional Voltage (EMF)",
          math: "\\mathcal{E} = B L v = (0.50\\text{ T})(1.00\\text{ m})(4.00\\text{ m/s}) = 2.00\\text{ V}",
          explanation: "Sweeping across the field generates an internal battery potential of exactly 2.00 V across the rails.",
        },
        {
          step: 3,
          title: "Calculate the Circuit Current Lighting the Bulb",
          math: "I = \\dfrac{\\mathcal{E}}{R} = \\dfrac{2.00\\text{ V}}{2.00\\,\\Omega} = 1.00\\text{ A}",
          explanation: "By Ohm's Law (I = E / R), a 1.00 A current flows through the circuit loop, making the galvanometer deflect and the bulb glow.",
        },
        {
          step: 4,
          title: "Calculate the Backward Magnetic Drag Force",
          math: "F_{\\text{mag}} = I L B = (1.00\\text{ A})(1.00\\text{ m})(0.50\\text{ T}) = 0.50\\text{ N}",
          explanation: "By Lenz's Law and the Right-Hand Rule, current in a magnetic field experiences a backward opposing force of 0.50 N.",
        },
        {
          step: 5,
          title: "Determine the Required Forward Pulling Force",
          math: "F_{\\text{ext}} = F_{\\text{mag}} = \\mathbf{0.50\\text{ N}}",
          explanation: "To keep the rod cruising at constant speed 4.00 m/s without slowing down or speeding up, apply forward pull F_ext = 0.50 N.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: High-Speed Cruising · Dynamic Motional EMF",
    subtitle: "Calculate required external force F_ext = 0.80 N to cruise the rod at target speed v = 6.40 m/s through target photogate",
    parameterName: "Applied Pulling Force (F_ext)",
    parameterUnit: "N",
    mode: "horizontal-force",
    mass: 0.20,
    length: 1.00,
    bField: 0.50,
    gravity: 10.0,
    fixedResistance: 2.00,
    fixedTargetVelocity: 6.40,
    sStart: -0.90,
    sTarget: 0.15,
    sliderMin: 0.10,
    sliderMax: 2.00,
    sliderDefault: 0.40,
    stepSmall: 0.05,
    stepLarge: 0.20,
    targetValue: 0.80,
    tolerance: 0.005,
    targetDisplay: "Equilibrium at F_ext = 0.80 N (v = 6.40 m/s) [Target: s = +0.15 m]",
    targetDescription: "Pull the rod at target speed v = 6.40 m/s into the target gate by setting force F_ext.",
    mathDerivation: {
      title: "Stage 2: High-Speed Steady Gliding & Joule Power Scaling",
      concept:
        "In this second stage, the apparatus remains on the exact same horizontal lab bench (rod length L = 1.00 m, bulb resistance R = 2.00 Ω, upward field B = 0.50 T). However, the target photogate has been moved to location s = +0.15 m, requiring a higher steady speed of v = 6.40 m/s.\n\n" +
        "1. Increased Motional EMF at Higher Velocity:\n" +
        "As the rod cruises faster across the magnetic field at v = 6.40 m/s, the rate of magnetic flux cutting increases directly:\n" +
        "E = B · L · v = (0.50 T)(1.00 m)(6.40 m/s) = 3.20 V.\n" +
        "The moving rod now acts like a 3.20 V power source across the rails!\n\n" +
        "2. Higher Circuit Loop Current:\n" +
        "This higher induced potential difference drives a stronger current through the incandescent bulb (R = 2.00 Ω):\n" +
        "I = E / R = 3.20 V / 2.00 Ω = 1.60 A.\n" +
        "The incandescent bulb glows much brighter, dissipating power:\n" +
        "P_elec = I² R = (1.60 A)²(2.00 Ω) = 5.12 Watts.\n\n" +
        "3. Increased Magnetic Opposing Drag:\n" +
        "Because current has increased to 1.60 A, the backward Lenz's law Lorentz force resisting forward motion increases too:\n" +
        "F_mag = I · L · B = (1.60 A)(1.00 m)(0.50 T) = 0.80 N.\n\n" +
        "4. Exact Force Equilibrium for Constant Speed:\n" +
        "To maintain steady, uniform velocity v = 6.40 m/s as the rod passes through the target gate at s = +0.15 m without slowing down, your pulling mechanism must deliver exactly:\n" +
        "F_ext = F_mag = 0.80 N.",
      conclusion:
        "Key Physics Takeaway: Power Scales with Velocity Squared (v²)\n" +
        "Notice that doubling the speed quadruples the required electrical power dissipation:\n" +
        "• Mechanical Power Supplied: P_mech = F_ext · v = (0.80 N)(6.40 m/s) = 5.12 Watts.\n" +
        "• Electrical Bulb Power Dissipated: P_elec = I² R = (1.60 A)²(2.00 Ω) = 5.12 Watts.\n" +
        "Mechanical input power and electrical output power match perfectly. Applying F_ext = 0.80 N delivers exactly v = 6.40 m/s at target photogate s = +0.15 m.",
      formulas: [
        {
          label: "1. INDUCED MOTIONAL VOLTAGE",
          formula: "\\mathcal{E} = B L v",
          explanation: "Voltage induced across the ends of the rod as it moves across magnetic field lines.",
        },
        {
          label: "2. CIRCUIT CURRENT (OHM'S LAW)",
          formula: "I = \\dfrac{\\mathcal{E}}{R} = \\dfrac{B L v}{R}",
          explanation: "Current flowing through the loop formed by the rails, sliding rod, and light bulb.",
        },
        {
          label: "3. LENZ'S LAW OPPOSING MAGNETIC DRAG",
          formula: "F_{\\text{mag}} = I L B = \\dfrac{B^2 L^2 v}{R}",
          explanation: "Backward magnetic drag resisting the rod's forward motion.",
        },
        {
          label: "4. EXTERNAL FORCE REQUIRED FOR STEADY CRUISE",
          formula: "F_{\\text{ext}} = F_{\\text{mag}} = \\dfrac{B^2 L^2 v}{R} = \\mathbf{0.80\\text{ N}}",
          explanation: "Forward pulling force needed to neutralize the backward magnetic drag (ΣF = 0).",
        },
        {
          label: "5. MECHANICAL TO ELECTRICAL POWER CONSERVATION",
          formula: "P_{\\text{mech}} = F_{\\text{ext}} v = I^2 R = P_{\\text{elec}} = 5.12\\text{ W}",
          explanation: "Rate of mechanical work done equals electrical power dissipated in the bulb filament.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Given System Parameters",
          math: "B = 0.50\\text{ T}, \\quad L = 1.00\\text{ m}, \\quad R = 2.00\\,\\Omega, \\quad v = 6.40\\text{ m/s}, \\quad s_{\\text{target}} = +0.15\\text{ m}",
          explanation: "The rod glides across horizontal rails in the same 0.50 T vertical field with target photogate at s = +0.15 m.",
        },
        {
          step: 2,
          title: "Calculate Induced Motional EMF at Target Speed",
          math: "\\mathcal{E} = B L v = (0.50\\text{ T})(1.00\\text{ m})(6.40\\text{ m/s}) = 3.20\\text{ V}",
          explanation: "Moving at 6.40 m/s generates an induced potential difference of 3.20 V across the rails.",
        },
        {
          step: 3,
          title: "Calculate Resulting Loop Current",
          math: "I = \\dfrac{\\mathcal{E}}{R} = \\dfrac{3.20\\text{ V}}{2.00\\,\\Omega} = 1.60\\text{ A}",
          explanation: "By Ohm's Law (I = E / R), a current of 1.60 A circulates through the bulb, lighting it brightly.",
        },
        {
          step: 4,
          title: "Determine the Backward Magnetic Drag Force",
          math: "F_{\\text{mag}} = I L B = (1.60\\text{ A})(1.00\\text{ m})(0.50\\text{ T}) = 0.80\\text{ N}",
          explanation: "By Lenz's Law, current flowing through the rod in the magnetic field creates 0.80 N of backward drag.",
        },
        {
          step: 5,
          title: "Calculate the Required Forward Pulling Force",
          math: "F_{\\text{ext}} = F_{\\text{mag}} = \\mathbf{0.80\\text{ N}}",
          explanation: "Setting pull force F_ext = 0.80 N achieves perfect force balance, locking rod velocity at exactly 6.40 m/s.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: Precision Low-Speed Gliding · High Sensitivity Induction",
    subtitle: "Calculate required external force F_ext = 0.30 N to cruise the rod at target speed v = 2.40 m/s through target photogate",
    parameterName: "Applied Pulling Force (F_ext)",
    parameterUnit: "N",
    mode: "horizontal-force",
    mass: 0.20,
    length: 1.00,
    bField: 0.50,
    gravity: 10.0,
    fixedResistance: 2.00,
    fixedTargetVelocity: 2.40,
    sStart: -0.90,
    sTarget: 0.55,
    sliderMin: 0.05,
    sliderMax: 1.00,
    sliderDefault: 0.15,
    stepSmall: 0.05,
    stepLarge: 0.10,
    targetValue: 0.30,
    tolerance: 0.005,
    targetDisplay: "Equilibrium at F_ext = 0.30 N (v = 2.40 m/s) [Target: s = +0.55 m]",
    targetDescription: "Pull the rod at target speed v = 2.40 m/s into the target gate by setting force F_ext.",
    mathDerivation: {
      title: "Stage 3: Precision Low-Speed Cruise & Gentle Induction",
      concept:
        "In this final challenge, the apparatus is identical to Stage 1 and Stage 2 on the horizontal lab bench (L = 1.00 m, R = 2.00 Ω, B = 0.50 T), but the target photogate has been moved further down the track to location s = +0.55 m, requiring a delicate low-speed cruise velocity of v = 2.40 m/s.\n\n" +
        "1. Gentle Motional EMF Induction:\n" +
        "At the lower cruise speed of v = 2.40 m/s, the rate of magnetic flux cutting is gentler:\n" +
        "E = B · L · v = (0.50 T)(1.00 m)(2.40 m/s) = 1.20 V.\n" +
        "The induced potential across the rails is 1.20 V.\n\n" +
        "2. Moderate Circuit Loop Current:\n" +
        "With loop resistance R = 2.00 Ω, this induced voltage generates a steady current:\n" +
        "I = E / R = 1.20 V / 2.00 Ω = 0.60 A.\n" +
        "The bulb glows with a soft, warm amber filament at power P = I² R = (0.60 A)²(2.00 Ω) = 0.72 Watts.\n\n" +
        "3. Gentle Magnetic Drag Force:\n" +
        "The magnetic counter-force resisting forward motion is proportional to current:\n" +
        "F_mag = I · L · B = (0.60 A)(1.00 m)(0.50 T) = 0.30 N.\n\n" +
        "4. Final Steady State Equilibrium:\n" +
        "To glide smoothly into the target photogate at s = +0.55 m without stalling or overspeeding, the external towing wire must apply exactly:\n" +
        "F_ext = F_mag = 0.30 N.",
      conclusion:
        "Key Physics Takeaway: Consistent Physical Law Across All Regimes\n" +
        "Whether cruising fast or slow, the fundamental electromagnetic relationship remains invariant:\n" +
        "F_ext = (B² L² v) / R\n" +
        "• At v = 2.40 m/s: F_ext = (0.25 × 2.40) / 2.00 = 0.30 N.\n" +
        "• Power input P_mech = (0.30 N)(2.40 m/s) = 0.72 W matches bulb electrical dissipation P_elec = 0.72 W with 100% precision.\n" +
        "Setting F_ext = 0.30 N guides the rod smoothly through the photogate at s = +0.55 m.",
      formulas: [
        {
          label: "1. INDUCED MOTIONAL VOLTAGE",
          formula: "\\mathcal{E} = B L v",
          explanation: "Voltage induced across the ends of the rod as it moves across magnetic field lines.",
        },
        {
          label: "2. CIRCUIT CURRENT (OHM'S LAW)",
          formula: "I = \\dfrac{\\mathcal{E}}{R} = \\dfrac{B L v}{R}",
          explanation: "Current flowing through the loop formed by the rails, sliding rod, and light bulb.",
        },
        {
          label: "3. LENZ'S LAW OPPOSING MAGNETIC DRAG",
          formula: "F_{\\text{mag}} = I L B = \\dfrac{B^2 L^2 v}{R}",
          explanation: "Backward magnetic drag resisting the rod's forward motion.",
        },
        {
          label: "4. EXTERNAL FORCE REQUIRED FOR STEADY CRUISE",
          formula: "F_{\\text{ext}} = F_{\\text{mag}} = \\dfrac{B^2 L^2 v}{R} = \\mathbf{0.30\\text{ N}}",
          explanation: "Forward pulling force needed to neutralize the backward magnetic drag (ΣF = 0).",
        },
        {
          label: "5. MECHANICAL TO ELECTRICAL POWER CONSERVATION",
          formula: "P_{\\text{mech}} = F_{\\text{ext}} v = I^2 R = P_{\\text{elec}} = 0.72\\text{ W}",
          explanation: "Rate of mechanical work done equals electrical power dissipated in the bulb filament.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Given System Parameters",
          math: "B = 0.50\\text{ T}, \\quad L = 1.00\\text{ m}, \\quad R = 2.00\\,\\Omega, \\quad v = 2.40\\text{ m/s}, \\quad s_{\\text{target}} = +0.55\\text{ m}",
          explanation: "The rod glides across horizontal rails with the target photogate placed at s = +0.55 m.",
        },
        {
          step: 2,
          title: "Calculate Induced Motional EMF at Target Speed",
          math: "\\mathcal{E} = B L v = (0.50\\text{ T})(1.00\\text{ m})(2.40\\text{ m/s}) = 1.20\\text{ V}",
          explanation: "Moving at 2.40 m/s generates an induced potential difference of 1.20 V across the rails.",
        },
        {
          step: 3,
          title: "Calculate Resulting Loop Current",
          math: "I = \\dfrac{\\mathcal{E}}{R} = \\dfrac{1.20\\text{ V}}{2.00\\,\\Omega} = 0.60\\text{ A}",
          explanation: "By Ohm's Law (I = E / R), a current of 0.60 A circulates through the bulb, lighting it softly.",
        },
        {
          step: 4,
          title: "Determine the Backward Magnetic Drag Force",
          math: "F_{\\text{mag}} = I L B = (0.60\\text{ A})(1.00\\text{ m})(0.50\\text{ T}) = 0.30\\text{ N}",
          explanation: "By Lenz's Law, current flowing through the rod in the magnetic field creates 0.30 N of backward drag.",
        },
        {
          step: 5,
          title: "Calculate the Required Forward Pulling Force",
          math: "F_{\\text{ext}} = F_{\\text{mag}} = \\mathbf{0.30\\text{ N}}",
          explanation: "Setting pull force F_ext = 0.30 N achieves perfect force balance, locking rod velocity at exactly 2.40 m/s.",
        },
      ],
    },
  },
};

interface MotionalEmfState {
  currentStage: number;
  sliderValue: number;

  // Live Telemetry
  currentEmf: number; // Volts
  currentCurrent: number; // Amperes
  currentPower: number; // Watts
  currentSpeed: number; // m/s
  currentAcceleration: number; // m/s^2
  currentDragForce: number; // Newtons
  isTrajectoryTargetHit: boolean;
  statusText: string;

  // Simulation State
  isLiveSimulating: boolean;
  rodResetVersion: number;
  launchVersion: number;
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
  resetToStart: () => void;
  launchSimulation: () => void;
  runMeasurement: () => void;
  resetSimulation: () => void;
  nextStage: () => void;
  startMission: () => void;
  setLiveSimulating: (active: boolean) => void;
}

function computeTelemetry(stageNum: number, sliderVal: number) {
  const cfg = MOTIONAL_EMF_STAGES[stageNum];
  const hit = Math.abs(sliderVal - cfg.targetValue) < 0.005;

  let currentEmf = 0;
  let currentCurrent = 0;
  let currentPower = 0;
  let currentSpeed = 0;
  let currentAcceleration = 0;
  let currentDragForce = 0;
  let statusText = "";

  if (cfg.mode === "horizontal-force") {
    // sliderVal is F_ext (N). Terminal / steady speed v = (F_ext * R) / (B^2 L^2)
    const R = cfg.fixedResistance ?? 2.0;
    const B = cfg.bField;
    const L = cfg.length;
    currentSpeed = (sliderVal * R) / (B * B * L * L);
    currentEmf = B * L * currentSpeed;
    currentCurrent = currentEmf / R;
    currentPower = currentCurrent * currentCurrent * R;
    currentDragForce = currentCurrent * L * B;
    currentAcceleration = (sliderVal - currentDragForce) / cfg.mass;

    if (hit) {
      statusText = "STEADY SPEED v = 4.00 m/s ACHIEVED";
    } else if (currentSpeed < 4.0) {
      statusText = `UNDERPOWERED (v = ${currentSpeed.toFixed(2)} m/s)`;
    } else {
      statusText = `OVERDRIVEN (v = ${currentSpeed.toFixed(2)} m/s)`;
    }
  } else if (cfg.mode === "vertical-terminal") {
    // sliderVal is R (Ohms). Terminal speed v_T = (mg * R) / (B^2 L^2)
    const R = sliderVal;
    const B = cfg.bField;
    const L = cfg.length;
    const mg = cfg.mass * cfg.gravity;
    currentSpeed = (mg * R) / (B * B * L * L);
    currentEmf = B * L * currentSpeed;
    currentCurrent = currentEmf / R;
    currentPower = currentCurrent * currentCurrent * R;
    currentDragForce = currentCurrent * L * B;
    currentAcceleration = (mg - currentDragForce) / cfg.mass;

    if (hit) {
      statusText = "TERMINAL VELOCITY v_T = 5.00 m/s LOCKED";
    } else if (currentSpeed < 5.0) {
      statusText = `OVER-DAMPED (v_T = ${currentSpeed.toFixed(2)} m/s)`;
    } else {
      statusText = `UNDER-DAMPED (v_T = ${currentSpeed.toFixed(2)} m/s)`;
    }
  } else {
    // incline-capacitor: sliderVal is C (F). a = (mg sin theta) / (m + C B^2 L^2)
    const C = sliderVal;
    const B = cfg.bField;
    const L = cfg.length;
    const theta = cfg.fixedThetaRad ?? Math.PI / 6;
    const fGrav = cfg.mass * cfg.gravity * Math.sin(theta);
    currentAcceleration = fGrav / (cfg.mass + C * B * B * L * L);
    currentSpeed = 3.2; // nominal tracking velocity
    currentEmf = B * L * currentSpeed;
    currentCurrent = C * B * L * currentAcceleration;
    currentPower = currentEmf * currentCurrent;
    currentDragForce = currentCurrent * L * B;

    if (hit) {
      statusText = "TARGET ACCELERATION a = 3.00 m/s² MATCHED";
    } else if (currentAcceleration < 3.0) {
      statusText = `EXCESS INERTIA (a = ${currentAcceleration.toFixed(2)} m/s²)`;
    } else {
      statusText = `INSUFFICIENT INERTIA (a = ${currentAcceleration.toFixed(2)} m/s²)`;
    }
  }

  return {
    currentEmf,
    currentCurrent,
    currentPower,
    currentSpeed,
    currentAcceleration,
    currentDragForce,
    isTrajectoryTargetHit: hit,
    statusText,
  };
}

export const useMotionalEmfStore = create<MotionalEmfState>((set, get) => {
  const initialStage = 1;
  const cfg = MOTIONAL_EMF_STAGES[initialStage];
  const initialTelemetry = computeTelemetry(initialStage, cfg.sliderDefault);

  return {
    currentStage: initialStage,
    sliderValue: cfg.sliderDefault,

    currentEmf: initialTelemetry.currentEmf,
    currentCurrent: initialTelemetry.currentCurrent,
    currentPower: initialTelemetry.currentPower,
    currentSpeed: initialTelemetry.currentSpeed,
    currentAcceleration: initialTelemetry.currentAcceleration,
    currentDragForce: initialTelemetry.currentDragForce,
    isTrajectoryTargetHit: initialTelemetry.isTrajectoryTargetHit,
    statusText: initialTelemetry.statusText,

    isLiveSimulating: true,
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
      const stageCfg = MOTIONAL_EMF_STAGES[currentStage];
      const clamped = Math.max(stageCfg.sliderMin, Math.min(stageCfg.sliderMax, val));
      const tel = computeTelemetry(currentStage, clamped);

      set({
        sliderValue: clamped,
        ...tel,
      });
    },

    resetToStart: () => {
      const { rodResetVersion } = get();
      set({
        rodResetVersion: rodResetVersion + 1,
        isMovingToTarget: false,
        isAtTarget: false,
      });
    },

    launchSimulation: () => {
      const { launchVersion, isTrajectoryTargetHit, currentStage } = get();
      set({
        launchVersion: launchVersion + 1,
        isMovingToTarget: true,
        isVerifying: true,
      });

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
              ? "F_ext = (B² L² v) / R = 0.50 N"
              : stageId === 2
                ? "R = (B² L² v_T) / (mg) = 2.50 Ω"
                : "C = m(g sin θ - a) / (a B² L²) = 0.20 F";

          set({
            isVerifying: false,
            isMovingToTarget: false,
            isAtTarget: false,
            isWon: false,
            isGameOver: true,
            failureReason: `Incorrect value! You entered ${val.toFixed(2)}. The rod only stabilizes cleanly at the target gate when dialing the exact calculated value: ${formula}.`,
            showResultModal: true,
          });
        }
      }, 1900);
    },

    setLiveSimulating: (active: boolean) => {
      set({ isLiveSimulating: active });
    },

    runMeasurement: () => {
      get().launchSimulation();
    },

    resetSimulation: () => {
      const { currentStage, rodResetVersion } = get();
      const stageCfg = MOTIONAL_EMF_STAGES[currentStage];
      const tel = computeTelemetry(currentStage, stageCfg.sliderDefault);
      set({
        sliderValue: stageCfg.sliderDefault,
        ...tel,
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
      const stageCfg = MOTIONAL_EMF_STAGES[next];
      const tel = computeTelemetry(next, stageCfg.sliderDefault);
      set({
        currentStage: next,
        sliderValue: stageCfg.sliderDefault,
        ...tel,
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
