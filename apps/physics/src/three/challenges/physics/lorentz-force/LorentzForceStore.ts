import { create } from "zustand";

export interface LorentzStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  parameterName: string;
  parameterUnit: string;

  // Physical particle parameters
  particleName: string;
  particleCharge: number; // in C
  particleMass: number; // in kg
  qmRatio: number; // (q/m) normalized, 1.0 C/kg
  v0: number; // injection velocity in m/s (4.00 m/s)
  injectionAngleDeg: number; // angle relative to chamber axis

  // Chamber & Field parameters
  driftLength: number; // 7.0 m
  chamberRadius: number; // 2.5 m
  fixedB?: number; // for stage 3: B = 2.00 T
  targetPitch?: number; // for stage 2: 2.00 m
  targetRadius?: number; // for stage 1: 2.00 m

  // Slider bounds
  sliderMin: number;
  sliderMax: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;

  targetValue: number;
  tolerance: number;
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

export const LORENTZ_STAGES: Record<number, LorentzStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Pure Magnetic Bending (Cyclotron Deflection)",
    subtitle: "Calibrate magnetic field B = 0.80 T to steer a high-energy ion beam along a circular arc into the target detector at radius r = 5.00 m",
    parameterName: "Magnetic Field (B)",
    parameterUnit: "T",
    particleName: "Singly Charged Argon Ion (Ar⁺)",
    particleCharge: 1.0,
    particleMass: 1.0,
    qmRatio: 1.0,
    v0: 4.0,
    injectionAngleDeg: 90.0,
    driftLength: 7.0,
    chamberRadius: 2.5,
    targetRadius: 5.0,
    sliderMin: 0.2,
    sliderMax: 3.0,
    sliderDefault: 1.5,
    stepSmall: 0.05,
    stepLarge: 0.2,
    // r = (m * v) / (q * B) => B = v / r = 4.0 / 5.0 = 0.80 T
    targetValue: 0.80,
    tolerance: 0.05,
    targetDescription: "Tune the solenoid magnetic field B to bend the ion beam into the target detector at radius r = 5.00 m.",
    mathDerivation: {
      title: "Stage 1: Magnetic Lorentz Force & Cyclotron Radius Derivation",
      concept:
        "When an energetic charged particle is injected perpendicularly into a uniform magnetic field (θ = 90°), what dictates the shape and size of its flight trajectory?\n\n1. Physical Intuition: The Zero-Work Centripetal Steering Wheel\nUnlike an electric force which pushes in the direction of the field and alters a particle's kinetic energy, the magnetic Lorentz force acts strictly perpendicular to the particle's instantaneous velocity vector:\n• Vector formulation: F_B = q(v × B).\n• Because the force is orthogonal to displacement at every infinitesimal instant (F · dr = 0), the magnetic field does ZERO work on the charged particle!\n• The speed |v| and kinetic energy remain strictly constant. The magnetic field acts as a pure, frictionless cosmic steering wheel, continuously redirecting the velocity vector toward a fixed center of rotation.\n\n2. Centripetal Balance & Cyclotron Radius\nEquating the magnetic Lorentz force to the classical kinematic centripetal force required for circular orbit of radius r:\n  q · v_0 · B = (m · v_0²) / r\nSolving directly for the orbital radius (known as the Cyclotron Radius or Larmor Radius):\n  r = (m · v_0) / (q · B)\nNotice the fundamental physical relationships:\n• Radius is directly proportional to particle momentum (p = m · v_0): faster or heavier particles require wider turns.\n• Radius is inversely proportional to magnetic field strength B: a stronger field curves the beam more sharply.\n\n3. Calculating the Target Magnetic Field for our Drift Chamber:\n• Injection velocity: v_0 = 4.00 m/s.\n• Charge-to-mass ratio: (q / m) = 1.00 C/kg.\n• Fixed detector location: r_target = 5.00 m.\n• Rearranging the Larmor formula for B:\n  B = (v_0) / ((q / m) · r_target) = 4.00 / (1.00 · 5.00) = 0.80 T.\nWhen the solenoid produces exactly 0.80 Tesla, the ion beam bends along an arc of radius r = 5.00 m and enters the detector target!",
      conclusion:
        "Key Physics Takeaway: Because the magnetic force F = q(v × B) is always orthogonal to velocity, it performs zero work and preserves particle speed while bending the trajectory into a circular arc of radius r = mv/(qB). Setting B = 0.80 T achieves the exact 5.00 m radius required for detection.",
      formulas: [
        {
          label: "1. MAGNETIC LORENTZ FORCE (θ = 90°)",
          formula: "\\vec{F}_B = q(\\vec{v} \\times \\vec{B}) \\implies |F_B| = q \\cdot v_0 \\cdot B \\sin(90^\\circ) = q \\cdot v_0 \\cdot B",
          explanation:
            "Maximum transverse magnetic deflecting force exerted perpendicular to both velocity and magnetic field vectors.",
        },
        {
          label: "2. CYCLOTRON (LARMOR) RADIUS",
          formula: "r = \\dfrac{m \\cdot v_0}{q \\cdot B} = \\dfrac{p}{q \\cdot B}",
          explanation:
            "Orbital radius determined by momentum p balanced against magnetic Lorentz deflection.",
        },
        {
          label: "3. TARGET FIELD CALIBRATION",
          formula: "B = \\dfrac{m \\cdot v_0}{q \\cdot r} = \\dfrac{1.00 \\cdot 4.00\\text{ m/s}}{1.00\\text{ C} \\cdot 5.00\\text{ m}} = 0.80\\text{ T}",
          explanation:
            "Dialing B = 0.80 T sets cyclotron radius r = 5.00 m, guiding the beam into the detector target.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Injection Kinematics & Detector Geometry",
          math: "v_0 = 4.00\\text{ m/s}, \\quad \\theta = 90.0^\\circ, \\quad r_{\\text{target}} = 5.00\\text{ m}, \\quad \\dfrac{q}{m} = 1.00\\text{ C/kg}",
          explanation:
            "The ion beam enters from the left end along the chamber axis into the magnetic field.",
        },
        {
          step: 2,
          title: "Equate Magnetic Force to Centripetal Force",
          math: "q \\cdot v_0 \\cdot B = \\dfrac{m \\cdot v_0^2}{r} \\implies r = \\dfrac{m \\cdot v_0}{q \\cdot B}",
          explanation:
            "Zero tangential acceleration means speed is constant; inward Lorentz force supplies 100% of centripetal acceleration.",
        },
        {
          step: 3,
          title: "Solve for Resonant Magnetic Field (B)",
          math: "B = \\dfrac{v_0}{(q/m) \\cdot r} = \\dfrac{4.00\\text{ m/s}}{1.00 \\times 5.00\\text{ m}} = 0.80\\text{ T}",
          explanation:
            "Adjusting the solenoid field to B = 0.80 T bends the beam along an exact 5.00 m radius arc directly into the detector target.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: 3D Helical Drift & Spiral Pitch Tuning",
    subtitle: "Inject ions at θ = 60° and tune B = 1.00 T so helical pitch p = 2.00 m threads all three coaxial aperture baffles",
    parameterName: "Solenoid Field (B)",
    parameterUnit: "T",
    particleName: "Deuterium Ion (D⁺)",
    particleCharge: 1.0,
    particleMass: 1.0,
    qmRatio: 1.0,
    v0: 4.0,
    injectionAngleDeg: 60.0,
    driftLength: 7.0,
    chamberRadius: 2.5,
    targetPitch: 2.0,
    sliderMin: 0.25,
    sliderMax: 2.5,
    sliderDefault: 0.5,
    stepSmall: 0.05,
    stepLarge: 0.2,
    targetValue: 1.0,
    tolerance: 0.05,
    targetDescription: "Synchronize the helical pitch to p = 2.00 m so the spiral loops cleanly pass through all 3 drift chamber baffle rings.",
    mathDerivation: {
      title: "Stage 2: 3D Helical Motion, Velocity Decomposition & Pitch Synchronization",
      concept:
        "What happens when a charged particle enters a magnetic field at an oblique angle (neither parallel nor perpendicular)?\n\n1. Physical Intuition: Velocity Vector Decomposition\nConsider the magnetic field vector aligned along the longitudinal drift axis (X-axis: B = B · x̂). The particle enters with speed v_0 at angle θ = 60° to the B-field.\nWe decompose the velocity vector into two independent, uncoupled components:\n• Parallel Component (v_∥ = v_0 · cos θ): Moves along the magnetic field line. Since (v_∥ × B) = 0, the magnetic force along the X-axis is ZERO! The particle drifts forward at a steady, uniform velocity v_∥ = constant.\n• Perpendicular Component (v_⊥ = v_0 · sin θ): Moves in the plane orthogonal to B. The magnetic force F_⊥ = q · v_⊥ · B drives circular motion in the YZ-plane.\n\n2. The Combined 3D Corkscrew Trajectory\nThe simultaneous combination of:\n  (a) Uniform longitudinal translation along X, and\n  (b) Constant circular revolution in the YZ plane\nresults in a gorgeous three-dimensional HELIX (corkscrew path)!\n\n3. Time Period and Helical Pitch (p)\nThe time required to complete one full 360° revolution is the Cyclotron Period:\n  T = (2π · m) / (q · B)\nNotice that the period T is completely independent of particle speed!\nThe longitudinal distance advanced along the chamber during one complete revolution is defined as the Helical Pitch (p):\n  p = v_∥ · T = (v_0 · cos θ) · [(2π · m) / (q · B)]\n\n4. Synchronizing the Pitch to Chamber Baffle Rings:\n• Three circular collimator baffles are mounted along the drift tube at intervals of Δx = 2.00 m (x = -1.5 m, 0.5 m, 2.5 m).\n• For the corkscrewing ion beam to thread the apertures without colliding into the baffles, the helical pitch must match the baffle spacing: p = 2.00 m.\n• Calibrating the magnetic field to B = 1.00 T establishes the exact pitch p = 2.00 m, steering the beam safely through all three baffles to the collector!",
      conclusion:
        "Key Physics Takeaway: Helical motion is the superposition of uniform linear drift parallel to B (v_∥ = v_0 cos θ) and uniform circular orbit perpendicular to B (v_⊥ = v_0 sin θ). The axial pitch p = v_∥ · T = 2πm v_∥ / (qB). Tuning B = 1.00 T synchronizes pitch p to 2.00 m, clearing all baffle rings.",
      formulas: [
        {
          label: "1. VELOCITY VECTOR DECOMPOSITION",
          formula: "v_\\parallel = v_0 \\cos\\theta = 4.00 \\cdot \\cos(60^\\circ) = 2.00\\text{ m/s}, \\quad v_\\perp = v_0 \\sin\\theta = 4.00 \\cdot \\sin(60^\\circ) = 3.46\\text{ m/s}",
          explanation:
            "Parallel velocity drives longitudinal drift unperturbed; perpendicular velocity sustains circular gyro-motion.",
        },
        {
          label: "2. CYCLOTRON GYRO-PERIOD",
          formula: "T = \\dfrac{2\\pi \\cdot m}{q \\cdot B}",
          explanation:
            "Time period of one complete 360° orbit around the magnetic field lines, independent of speed.",
        },
        {
          label: "3. HELICAL PITCH RELATION",
          formula: "p = v_\\parallel \\cdot T = \\dfrac{2\\pi \\cdot m \\cdot v_0 \\cos\\theta}{q \\cdot B} \\implies B = \\dfrac{2\\pi \\cdot m \\cdot v_\\parallel}{q \\cdot p} = 1.00\\text{ T}",
          explanation:
            "Axial advance per revolution. Dialing B = 1.00 T achieves pitch p = 2.00 m to clear all three baffle rings.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Resolve Initial Velocity Vector Components",
          math: "v_0 = 4.00\\text{ m/s}, \\quad \\theta = 60^\\circ \\implies v_\\parallel = 4.00 \\times 0.50 = 2.00\\text{ m/s}",
          explanation:
            "The parallel velocity component along the chamber axis is invariant because the magnetic force along B is strictly zero.",
        },
        {
          step: 2,
          title: "Formulate Helical Pitch in Terms of Field B",
          math: "p = v_\\parallel \\cdot T = v_\\parallel \\cdot \\left[\\dfrac{2\\pi m}{qB}\\right]",
          explanation:
            "Longitudinal distance traversed during one full gyro-revolution depends inversely on magnetic field strength.",
        },
        {
          step: 3,
          title: "Tune B to Match Baffle Spacing (p = 2.00 m)",
          math: "p = 2.00\\text{ m} \\implies B = 1.00\\text{ T}",
          explanation:
            "Setting B = 1.00 T aligns the helical crests and nodes with the three aperture baffles at x = -1.5m, 0.5m, 2.5m.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: Crossed Fields (Wien Velocity Selector)",
    subtitle: "Apply transverse electric field E = 8.00 kV/m orthogonal to B = 2.00 T to cancel magnetic deflection for undeflected transmission",
    parameterName: "Electric Field (E)",
    parameterUnit: "kV/m",
    particleName: "High-Energy Molecular Ion (N₂⁺)",
    particleCharge: 1.0,
    particleMass: 1.0,
    qmRatio: 1.0,
    v0: 4.0,
    injectionAngleDeg: 90.0,
    driftLength: 7.0,
    chamberRadius: 2.5,
    fixedB: 2.0,
    sliderMin: 2.0,
    sliderMax: 14.0,
    sliderDefault: 4.0,
    stepSmall: 0.2,
    stepLarge: 1.0,
    targetValue: 8.0,
    tolerance: 0.3,
    targetDescription: "Balance electrostatic force against magnetic Lorentz force to transmit undeflected ions through the exit slit.",
    mathDerivation: {
      title: "Stage 3: Wien Velocity Filter, Crossed Fields & Force Cancellation",
      concept:
        "How can a mass spectrometer isolate particles of one exact velocity out of a polyenergetic ion beam containing mixed speeds?\n\n1. Physical Intuition: The Tug-of-War Between Electric & Magnetic Fields\nIn a Wien Filter (velocity selector), two mutually perpendicular fields are applied across the drift region:\n• A transverse magnetic field (B = 2.00 T directed along +Z) exerts an upward magnetic force: F_B = q · v · B.\n• A transverse electrostatic field (E directed along -Y between parallel plates) exerts a downward electrostatic force: F_E = q · E.\nThis sets up a microscopic tug-of-war on every passing ion:\n• The electric force F_E depends ONLY on charge q (completely independent of velocity!).\n• The magnetic force F_B depends linearly on velocity v (faster particles get pulled upward more strongly).\n\n2. The Undeflected Condition (Wien Velocity Selector Principle)\nFor an ion to travel straight down the chamber axis without suffering any transverse deflection, the net Lorentz force must equal zero:\n  F_net = F_E - F_B = q · E - q · v · B = 0\nDividing out charge q:\n  E = v · B  ⟹  v_selected = E / B\nThis remarkable result means:\n• Ions moving faster than v_selected (v > E/B) experience F_B > F_E and deflect upward, striking the top plate.\n• Ions moving slower than v_selected (v < E/B) experience F_E > F_B and deflect downward, striking the bottom plate.\n• ONLY ions possessing the exact velocity v = E/B experience zero net force and pass undeflected through a narrow collimating exit slit!\n\n3. Calculating the Selector Electric Field for our Beam:\n• Ion velocity: v_0 = 4.00 m/s.\n• Fixed magnetic field: B = 2.00 T.\n• Required electric field: E = v_0 · B = 4.00 m/s × 2.00 T = 8.00 kV/m.\nAdjusting the plate voltage until E = 8.00 kV/m produces a dead-straight beam that shoots cleanly through the exit aperture!",
      conclusion:
        "Key Physics Takeaway: In crossed electric and magnetic fields (E ⊥ B ⊥ v), the electric force qE opposes the magnetic force qvB. When E = vB, net transverse force vanishes (F_net = 0), allowing particles of velocity v = E/B to pass perfectly undeflected regardless of their mass or charge.",
      formulas: [
        {
          label: "1. TOTAL LORENTZ FORCE IN CROSSED FIELDS",
          formula: "\\vec{F} = q\\left(\\vec{E} + \\vec{v} \\times \\vec{B}\\right)",
          explanation:
            "Superposition of electrostatic attraction/repulsion and magnetic Lorentz deflection.",
        },
        {
          label: "2. WIEN FILTER BALANCE CONDITION",
          formula: "q \\cdot E = q \\cdot v_0 \\cdot B \\implies v_0 = \\dfrac{E}{B}",
          explanation:
            "Charge cancels out, demonstrating that the velocity selector is purely velocity-dependent, not mass-dependent.",
        },
        {
          label: "3. ELECTRIC FIELD CALIBRATION",
          formula: "E = v_0 \\cdot B = 4.00\\text{ m/s} \\times 2.00\\text{ T} = 8.00\\text{ kV/m}",
          explanation:
            "Dialing E = 8.00 kV/m perfectly cancels magnetic deflection, aligning the ion beam straight into the exit slit.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Opposing Force Vectors",
          math: "F_E = q \\cdot E \\quad (-\\hat{y}), \\qquad F_B = q \\cdot v_0 \\cdot B \\quad (+\\hat{y})",
          explanation:
            "Crossed geometry ensures the electrostatic and magnetic Lorentz forces act along the exact same transverse axis in opposite directions.",
        },
        {
          step: 2,
          title: "Formulate the Net Transverse Force Equation",
          math: "F_{\\text{net}} = q(v_0 B - E) = m \\cdot a_y",
          explanation:
            "Any imbalance between electric and magnetic forces produces nonzero transverse acceleration a_y.",
        },
        {
          step: 3,
          title: "Solve for Equilibrium Field Strength (E)",
          math: "a_y = 0 \\implies E = v_0 \\cdot B = 4.00\\text{ m/s} \\times 2.00\\text{ T} = 8.00\\text{ kV/m}",
          explanation:
            "Setting plate field to 8.00 kV/m cancels transverse acceleration, guiding the beam cleanly through the exit slit.",
        },
      ],
    },
  },
};

export interface TrajectoryPoint {
  x: number;
  y: number;
  z: number;
}

interface LorentzForceState {
  currentStage: number;
  sliderValue: number;

  // Real-time physical telemetry
  cyclotronRadius: number;
  helicalPitch: number;
  transverseForceNet: number;
  isTrajectoryTargetHit: boolean;
  trajectoryPoints: TrajectoryPoint[];

  // Simulation lifecycle
  isMissionStarted: boolean;
  isSimulating: boolean;
  simTime: number;
  isWon: boolean;
  isGameOver: boolean;
  failureReason: string | null;
  showResultModal: boolean;

  // Camera animation
  cameraZoomProgress: number;

  // Actions
  startMission: () => void;
  setSliderValue: (val: number) => void;
  runMeasurement: () => void;
  tickSimulation: (dt: number) => void;
  resetSimulation: () => void;
  nextStage: () => void;
  setStage: (stage: number) => void;
}

export const useLorentzForceStore = create<LorentzForceState>((set, get) => {
  const initialStage = 1;
  const cfg = LORENTZ_STAGES[initialStage];

  const computeTelemetry = (stageNum: number, slider: number) => {
    const stageCfg = LORENTZ_STAGES[stageNum] || LORENTZ_STAGES[1];
    let radius = 0;
    let pitch = 0;
    let netForce = 0;
    let targetHit = false;
    const points: TrajectoryPoint[] = [];

    const numPoints = 120;

    if (stageNum === 1) {
      // Stage 1: Clean circular deflection in the drift chamber
      // Injector is mounted on left flange at x0 = -3.5, y0 = 0.0, z0 = 0.0
      // Velocity v0 = 4.00 m/s along +X
      // Solenoid magnetic field B (slider) curves beam in XY plane
      // Radius r = mv / (qB) = 4.0 / B
      // Circular trajectory:
      // x(t) = -3.5 + r * sin(omega * t)
      // y(t) = -r * (1 - cos(omega * t))
      // z(t) = 0.0
      // Target detector is placed on bottom chamber wall at x_target = -1.5, y_target = -0.9
      // At target B = 2.00 T: r = 2.00 m
      // Arc reaches x = -3.5 + 2.0*sin(phi), y = -2.0*(1 - cos(phi))
      // At phi = 60° (pi/3): x = -3.5 + 2.0 * 0.866 = -1.77
      // Let's calibrate target detector position exactly along the B = 2.00 T arc:
      // When B = 2.00 T, r = 2.00 m.
      // At y = -0.85 m: 1 - cos(phi) = 0.85 / 2.0 = 0.425 => cos(phi) = 0.575 => phi = 0.958 rad (54.9°)
      // sin(phi) = sin(0.958) = 0.818
      // x = -3.5 + 2.0 * 0.818 = -1.86 m
      const B = Math.max(0.1, slider);
      radius = (stageCfg.particleMass * stageCfg.v0) / (stageCfg.particleCharge * B);
      targetHit = Math.abs(slider - stageCfg.targetValue) <= stageCfg.tolerance;

      const omega = (stageCfg.particleCharge * B) / stageCfg.particleMass;
      // Trace until beam hits chamber bottom wall (y = -1.0) or exits right (x = 3.5)
      for (let i = 0; i <= numPoints; i++) {
        const phi = (i / numPoints) * 1.6; // up to ~90 deg
        const px = -3.5 + radius * Math.sin(phi);
        const py = -radius * (1.0 - Math.cos(phi));
        const pz = 0.0;
        points.push({ x: px, y: py, z: pz });
        if (py < -0.95 || px > 3.5) break;
      }
    } else if (stageNum === 2) {
      // Stage 2: 3D Helical Drift
      // Injection along chamber:
      // Solenoid magnetic field B along X-axis.
      // v0 at theta = 60° to X-axis => v_parallel = v0 * cos(60°) = 2.0 m/s
      // v_perp = v0 * sin(60°) = 3.464 m/s
      // Gyroradius r = m*v_perp / (q*B).
      // Chamber radius is R_tube = 1.44 m.
      // We scale the visual gyroradius so that at B = 1.00 T, r = 0.40 m.
      // When B changes from 0.25 T to 2.5 T:
      // r(B) = 0.40 / B  (at B = 0.5 T: r = 0.80 m, safely inside tube 1.44 m; at B = 1.0 T: r = 0.40 m)
      // Helical pitch p = v_parallel * T = 2.0 m / B.
      // At B = 1.00 T, pitch p = 2.00 m.
      const B = Math.max(0.1, slider);
      radius = 0.40 / B;
      pitch = 2.0 / B;
      targetHit = Math.abs(slider - stageCfg.targetValue) <= stageCfg.tolerance;

      // The beam enters at injector muzzle x = -3.5, y = 0, z = 0.
      // Spiral revolves around an axis offset by radius in z (or y) so it starts at (0, 0):
      // y(x) = radius * sin(k * (x - x0))
      // z(x) = radius * (1 - cos(k * (x - x0)))
      // where k = 2 * PI / pitch
      const k = (2 * Math.PI) / pitch;
      const numSteps = 160;
      const length = 7.0; // from -3.5 to +3.5
      for (let i = 0; i <= numSteps; i++) {
        const dx = (i / numSteps) * length;
        const px = -3.5 + dx;
        const py = radius * Math.sin(k * dx);
        const pz = radius * (1.0 - Math.cos(k * dx));
        points.push({ x: px, y: py, z: pz });
      }
    } else {
      // Stage 3: Crossed Fields Wien Filter
      const E = slider;
      const B = stageCfg.fixedB || 2.0;
      netForce = stageCfg.particleCharge * (E - stageCfg.v0 * B);
      targetHit = Math.abs(slider - stageCfg.targetValue) <= stageCfg.tolerance;

      const driftDist = 7.0;
      const totalTime = driftDist / stageCfg.v0;
      for (let i = 0; i <= numPoints; i++) {
        const frac = i / numPoints;
        const px = -3.5 + frac * driftDist;
        const t = frac * totalTime;
        const py = 0.5 * (netForce * 0.12) * t * t;
        const pz = 0.0;
        points.push({ x: px, y: py, z: pz });
      }
    }

    return { radius, pitch, netForce, targetHit, points };
  };

  const initialTelem = computeTelemetry(initialStage, cfg.sliderDefault);

  return {
    currentStage: initialStage,
    sliderValue: cfg.sliderDefault,
    cyclotronRadius: initialTelem.radius,
    helicalPitch: initialTelem.pitch,
    transverseForceNet: initialTelem.netForce,
    isTrajectoryTargetHit: initialTelem.targetHit,
    trajectoryPoints: initialTelem.points,

    isMissionStarted: false,
    isSimulating: false,
    simTime: 0,
    isWon: false,
    isGameOver: false,
    failureReason: null,
    showResultModal: false,
    cameraZoomProgress: 0,

    startMission: () => {
      set({ isMissionStarted: true });
    },

    setSliderValue: (val: number) => {
      const state = get();
      if (state.isSimulating) return;
      const stageCfg = LORENTZ_STAGES[state.currentStage] || LORENTZ_STAGES[1];
      const clamped = Math.max(stageCfg.sliderMin, Math.min(stageCfg.sliderMax, val));
      const telem = computeTelemetry(state.currentStage, clamped);
      set({
        sliderValue: clamped,
        cyclotronRadius: telem.radius,
        helicalPitch: telem.pitch,
        transverseForceNet: telem.netForce,
        isTrajectoryTargetHit: telem.targetHit,
        trajectoryPoints: telem.points,
      });
    },

    runMeasurement: () => {
      const state = get();
      if (state.isSimulating) return;
      set({
        isSimulating: true,
        simTime: 0,
        showResultModal: false,
        isWon: false,
        isGameOver: false,
        failureReason: null,
      });
    },

    tickSimulation: (dt: number) => {
      const state = get();

      let zoomProgress = state.cameraZoomProgress;
      if (zoomProgress < 1.0) {
        zoomProgress = Math.min(1.0, zoomProgress + dt * 0.7);
        set({ cameraZoomProgress: zoomProgress });
      }

      if (!state.isSimulating) return;

      const newTime = state.simTime + dt;
      if (newTime >= 1.8) {
        const stageCfg = LORENTZ_STAGES[state.currentStage] || LORENTZ_STAGES[1];
        const error = Math.abs(state.sliderValue - stageCfg.targetValue);
        const won = error <= stageCfg.tolerance;

        let failMsg: string | null = null;
        if (!won) {
          if (state.currentStage === 1) {
            failMsg = `Beam Missed Detector: Cyclotron radius was ${state.cyclotronRadius.toFixed(2)} m (Target: 5.00 m). Tune magnetic field to B = 0.80 T.`;
          } else if (state.currentStage === 2) {
            failMsg = `Baffle Collision: Spiral pitch was ${state.helicalPitch.toFixed(2)} m (Target: 2.00 m). Synchronize field to B = 1.00 T to thread all aperture rings.`;
          } else {
            failMsg = `Exit Slit Deflection: Transverse net force produced deflection. Wien condition requires E = v·B = 8.00 kV/m for undeflected straight flight.`;
          }
        }

        set({
          isSimulating: false,
          simTime: newTime,
          isWon: won,
          isGameOver: !won,
          failureReason: failMsg,
          showResultModal: true,
        });
      } else {
        set({ simTime: newTime });
      }
    },

    resetSimulation: () => {
      const state = get();
      const stageCfg = LORENTZ_STAGES[state.currentStage] || LORENTZ_STAGES[1];
      const telem = computeTelemetry(state.currentStage, state.sliderValue);
      set({
        isSimulating: false,
        simTime: 0,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
        cyclotronRadius: telem.radius,
        helicalPitch: telem.pitch,
        transverseForceNet: telem.netForce,
        isTrajectoryTargetHit: telem.targetHit,
        trajectoryPoints: telem.points,
      });
    },

    nextStage: () => {
      const state = get();
      const next = Math.min(3, state.currentStage + 1);
      const stageCfg = LORENTZ_STAGES[next] || LORENTZ_STAGES[1];
      const telem = computeTelemetry(next, stageCfg.sliderDefault);
      set({
        currentStage: next,
        sliderValue: stageCfg.sliderDefault,
        cyclotronRadius: telem.radius,
        helicalPitch: telem.pitch,
        transverseForceNet: telem.netForce,
        isTrajectoryTargetHit: telem.targetHit,
        trajectoryPoints: telem.points,
        isSimulating: false,
        simTime: 0,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
        cameraZoomProgress: 0,
      });
    },

    setStage: (stage: number) => {
      const stageCfg = LORENTZ_STAGES[stage] || LORENTZ_STAGES[1];
      const telem = computeTelemetry(stage, stageCfg.sliderDefault);
      set({
        currentStage: stage,
        sliderValue: stageCfg.sliderDefault,
        cyclotronRadius: telem.radius,
        helicalPitch: telem.pitch,
        transverseForceNet: telem.netForce,
        isTrajectoryTargetHit: telem.targetHit,
        trajectoryPoints: telem.points,
        isSimulating: false,
        simTime: 0,
        isWon: false,
        isGameOver: false,
        failureReason: null,
        showResultModal: false,
        cameraZoomProgress: 0,
      });
    },
  };
});
