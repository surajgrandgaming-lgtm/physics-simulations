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

export interface PhotoelectricStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  parameterName: string;
  parameterUnit: string;
  targetMetalName: string;
  targetMetalSymbol: string;
  workFunctionEv: number;          // Phi_0 in eV
  fixedWavelengthNm?: number;       // For stages with fixed radiation (Stages 2 & 3)
  fixedPhotonEnergyEv?: number;     // h*nu in eV
  fixedColorHex?: string;           // Hex color for fixed radiation
  mode: "wavelength" | "stopping_potential";
  targetValue: number;              // Target value to dial
  tolerance: number;                // Acceptable error tolerance
  sliderMin: number;
  sliderMax: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;
  targetDisplay: string;
  targetDescription: string;
  mathDerivation: MathDerivation;
}

// Universal constants for Photoelectric calculations:
// hc = 1239.84193 eV·nm ≈ 1240 eV·nm
export const HC_EV_NM = 1239.842;

export function wavelengthToHex(wavelengthNm: number): string {
  if (wavelengthNm < 380) return "#818cf8"; // Ultraviolet (rendered as violet-indigo glow)
  if (wavelengthNm < 440) return "#6366f1"; // Violet
  if (wavelengthNm < 490) return "#38bdf8"; // Blue / Light Sky Blue
  if (wavelengthNm < 560) return "#22c55e"; // Green
  if (wavelengthNm < 595) return "#eab308"; // Yellow
  if (wavelengthNm < 640) return "#f97316"; // Orange
  if (wavelengthNm <= 750) return "#ef4444"; // Red
  return "#991b1b"; // Deep infrared
}

export const PHOTOELECTRIC_STAGES: Record<number, PhotoelectricStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Threshold Wavelength (Work Function)",
    subtitle: "Question: Given a Cesium photocathode (Φ = 2.14 eV), calculate and tune the light source to the Threshold Cutoff Wavelength (λ₀).",
    parameterName: "Source Wavelength (λ)",
    parameterUnit: "nm",
    targetMetalName: "Cesium",
    targetMetalSymbol: "Cs",
    workFunctionEv: 2.14,
    mode: "wavelength",
    targetValue: 579.0, // lambda_0 = hc / Phi_0 = 1239.84 / 2.14 = 579.36 nm
    tolerance: 8.0,
    sliderMin: 400.0,
    sliderMax: 700.0,
    sliderDefault: 650.0, // starts in red (below threshold, 0 electrons)
    stepSmall: 1.0,
    stepLarge: 10.0,
    targetDisplay: "Threshold Cutoff λ₀",
    targetDescription: "Find the Threshold Cutoff Wavelength (λ₀) for a Cesium photocathode (Φ = 2.14 eV).\n\nFormula: λ₀ = hc / Φ",
    mathDerivation: {
      title: "Photoelectric Threshold & Quantum Work Function",
      concept:
        "1. What is the Photoelectric Effect?\n" +
        "When light shines on a metallic surface, it can knock out electrons from the metal atoms. These liberated electrons are called photoelectrons, and their directed flow across a vacuum creates an electric current called the photocurrent (I).\n\n" +
        "2. The Failure of Wave Theory vs. Einstein's Quantum Breakthrough\n" +
        "Classical wave theory viewed light as continuous electromagnetic waves spreading energy smoothly across the metal. Wave theory predicted that even dim red light, if left shining long enough, would slowly build up energy until an electron popped out. It also predicted that brighter light would give electrons more kinetic energy. Experiments completely disproved both predictions:\n" +
        "• Photoemission is instantaneous (delay < 10⁻⁹ seconds) with zero time lag.\n" +
        "• If the light frequency is below a critical threshold, zero electrons are ever emitted—no matter how bright the beam is or how long it shines!\n" +
        "Einstein resolved this puzzle by proposing that light travels as discrete, indivisible packets of energy called photons. In the metal, each collision is strictly a 1-to-1 event: one photon transfers its entire energy E = hν to exactly one electron.\n\n" +
        "3. The Work Function (Φ₀) as an Energy Toll\n" +
        "Electrons are held inside the metal lattice by electrostatic attraction to positive ions. The minimum energy needed to liberate an electron from the metal surface without any excess kinetic energy is defined as the Work Function (Φ₀):\n" +
        "• If Photon Energy E < Φ₀: The electron cannot escape; the energy is harmlessly absorbed as heat.\n" +
        "• If Photon Energy E = Φ₀: The electron just barely escapes with zero kinetic energy (K_max = 0). This is the threshold condition.\n" +
        "• If Photon Energy E > Φ₀: The electron escapes and uses the remaining energy as kinetic energy: K_max = E - Φ₀.\n\n" +
        "4. The Threshold Cutoff Wavelength (λ₀)\n" +
        "Because photon energy is inversely proportional to wavelength (E = hc / λ), shorter wavelengths mean higher energy. Therefore, the minimum threshold energy corresponds to the maximum (longest) wavelength capable of liberating an electron (the Red Limit):\n" +
        "λ₀ = hc / Φ₀\n" +
        "For Cesium (Φ₀ = 2.14 eV), this cutoff is 579 nm (yellow-orange light). Any wavelength longer than 579 nm (such as red at 650 nm) has insufficient photon energy and produces zero photocurrent!",
      conclusion:
        "Summary & Physics Takeaways:\n" +
        "• Target Metal: Cesium (Cs) with a low Work Function Φ₀ = 2.14 eV.\n" +
        "• Universal Conversion Constant: hc = 1239.84 eV·nm ≈ 1240 eV·nm.\n" +
        "• Threshold Cutoff: λ₀ = 1239.84 / 2.14 = 579.36 nm ≈ 579 nm (yellow-orange boundary).\n" +
        "• If λ > 579 nm (e.g., Red at 650 nm): Photon energy E = 1.91 eV < 2.14 eV ⟹ Zero emission (I = 0 μA).\n" +
        "• If λ ≤ 579 nm (e.g., Green at 532 nm or Blue at 450 nm): Photon energy E > 2.14 eV ⟹ Photoelectrons instantly emerge and current flows!",
      formulas: [
        {
          label: "1. PLANCK-EINSTEIN PHOTON ENERGY",
          formula: "E = h\\nu = \\dfrac{hc}{\\lambda} \\approx \\dfrac{1240\\text{ eV}\\cdot\\text{nm}}{\\lambda\\text{ (nm)}}",
          explanation: "Calculates the energy carried by a single photon of frequency ν or wavelength λ.",
        },
        {
          label: "2. WORK FUNCTION DEFINITION",
          formula: "\\Phi_0 = h\\nu_0 = \\dfrac{hc}{\\lambda_0}",
          explanation: "Minimum energy required to overcome the metal's surface barrier and liberate an electron.",
        },
        {
          label: "3. THRESHOLD CUTOFF WAVELENGTH",
          formula: "\\lambda_0 = \\dfrac{hc}{\\Phi_0}",
          explanation: "The longest (maximum) wavelength of light capable of initiating photoemission.",
        },
        {
          label: "4. EINSTEIN'S PHOTOELECTRIC EQUATION",
          formula: "K_{\\max} = h\\nu - \\Phi_0 = \\dfrac{hc}{\\lambda} - \\Phi_0",
          explanation: "Energy conservation: excess photon energy after paying the work function becomes maximum electron kinetic energy.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Metal Work Function & Constants",
          math: "\\Phi_0 = 2.14\\text{ eV}, \\quad hc = 1239.84\\text{ eV}\\cdot\\text{nm}",
          explanation: "Cesium (Cs) has one of the lowest work functions among alkali metals, sensitive to visible light.",
        },
        {
          step: 2,
          title: "State the Threshold Emission Condition",
          math: "E_{\\text{photon}} = \\Phi_0 \\implies \\dfrac{hc}{\\lambda_0} = \\Phi_0 \\implies \\lambda_0 = \\dfrac{hc}{\\Phi_0}",
          explanation: "At the threshold cutoff, the photon carries just enough energy to free an electron with zero residual speed (K_max = 0).",
        },
        {
          step: 3,
          title: "Substitute Values to Calculate λ₀",
          math: "\\lambda_0 = \\dfrac{1239.84\\text{ eV}\\cdot\\text{nm}}{2.14\\text{ eV}} = \\mathbf{579.36\\text{ nm}} \\approx \\mathbf{579\\text{ nm}}",
          explanation: "Evaluating the ratio yields 579 nm, located on the yellow-orange boundary of the visible spectrum.",
        },
        {
          step: 4,
          title: "Verify Circuit Photoemission Behavior",
          math: "\\lambda \\le 579\\text{ nm} \\implies E > 2.14\\text{ eV} \\implies I > 0\\,\\mu\\text{A}",
          explanation: "Tuning the light source from 650 nm (red) down to ≤ 579 nm instantly liberates electrons and registers current on the microammeter.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: Stopping Potential (UV on Sodium)",
    subtitle: "Question: Given a Sodium photocathode (Φ = 2.75 eV) illuminated with Near-UV light (λ = 310 nm), calculate and dial the Stopping Potential (V₀).",
    parameterName: "Retarding Bias (V)",
    parameterUnit: "V",
    targetMetalName: "Sodium",
    targetMetalSymbol: "Na",
    workFunctionEv: 2.75,
    fixedWavelengthNm: 310,
    fixedPhotonEnergyEv: 4.00, // 1239.84 / 310 = 3.9995 eV ≈ 4.00 eV
    fixedColorHex: "#a855f7",
    mode: "stopping_potential",
    targetValue: 1.25, // V_0 = (4.00 - 2.75) / 1 = 1.25 V
    tolerance: 0.05,
    sliderMin: 0.0,
    sliderMax: 3.0,
    sliderDefault: 0.2,
    stepSmall: 0.01,
    stepLarge: 0.1,
    targetDisplay: "Stopping Potential V₀",
    targetDescription: "Find the Stopping Potential (V₀) for Sodium (Φ = 2.75 eV) under Near-UV light (λ = 310 nm).\n\nFormula: V₀ = (hν - Φ) / e",
    mathDerivation: {
      title: "Stopping Potential & Maximum Kinetic Energy (K_max)",
      concept:
        "1. Kinetic Energy Distribution of Liberated Photoelectrons\n" +
        "When ultraviolet photons strike the sodium photocathode, they penetrate slightly into the surface. Electrons liberated deeper within the metal collide with other atoms on their way out, losing energy. However, electrons right on the outermost surface escape cleanly without collisions. These surface electrons emerge with the Maximum Kinetic Energy (K_max).\n\n" +
        "2. What is Stopping Potential (V₀)?\n" +
        "To measure this maximum kinetic energy, we apply a reverse electric voltage (retarding bias) using the DC power supply on the bench. The collector anode is made negative with respect to the photocathode, establishing an opposing electric field that exerts a retarding electrostatic force F = e·E pushing electrons backward.\n" +
        "As an electron moves against this field toward the collector, it does work: W = e·V.\n" +
        "As the retarding voltage is dialed up, slower electrons are turned around first. When the voltage reaches the Stopping Potential (V₀), even the fastest electron (carrying K_max) is decelerated to a momentary halt right in front of the collector grid:\n" +
        "K_max = e · V₀\n" +
        "At this exact voltage, not a single electron can reach the collector, and the microammeter reading drops to exactly zero!\n\n" +
        "3. Connecting Einstein's Equation to Stopping Voltage\n" +
        "e · V₀ = hν - Φ₀  ⟹  V₀ = (hν - Φ₀) / e = K_max / e\n" +
        "Because 1 eV is defined as the energy gained or lost by an electron moving across 1 volt, the value of K_max in electron-volts (eV) is numerically identical to the Stopping Potential V₀ in volts (V). If K_max = 1.25 eV, then V₀ = 1.25 V!\n\n" +
        "4. Why Intensity Does NOT Change Stopping Potential\n" +
        "Making the light brighter increases the number of photons per second (higher photocurrent), but does NOT change the energy of any individual photon (E remains 4.00 eV). Therefore, the fastest electron still emerges with K_max = 1.25 eV and is stopped by the exact same voltage V₀ = 1.25 V.",
      conclusion:
        "Summary & Physics Takeaways:\n" +
        "• Photocathode: Sodium (Na), Work Function Φ₀ = 2.75 eV.\n" +
        "• Light Radiation: Near-UV at λ = 310 nm, Photon Energy E = 4.00 eV.\n" +
        "• Maximum Kinetic Energy: K_max = E - Φ₀ = 4.00 eV - 2.75 eV = 1.25 eV.\n" +
        "• Stopping Potential: V₀ = K_max / e = 1.25 V.\n" +
        "• Circuit Behavior: Dialing the DC power supply to V ≥ 1.25 V establishes an electrostatic barrier that halts all photoelectrons, dropping the current to 0.00 μA.",
      formulas: [
        {
          label: "1. EINSTEIN'S PHOTOELECTRIC LAW",
          formula: "K_{\\max} = h\\nu - \\Phi_0 = \\dfrac{hc}{\\lambda} - \\Phi_0",
          explanation: "Relates incident photon energy to the maximum kinetic energy of liberated surface electrons.",
        },
        {
          label: "2. STOPPING POTENTIAL RELATION",
          formula: "e V_0 = K_{\\max} \\implies V_0 = \\dfrac{K_{\\max}}{e}",
          explanation: "The retarding voltage required to do enough electrical work to bring the fastest electron to a dead stop.",
        },
        {
          label: "3. STOPPING POTENTIAL FROM WAVELENGTH",
          formula: "V_0 = \\dfrac{1}{e}\\left(\\dfrac{hc}{\\lambda} - \\Phi_0\\right)",
          explanation: "Direct formula to calculate stopping voltage in volts from wavelength in nm and work function in eV.",
        },
        {
          label: "4. MAXIMUM ELECTRON SPEED",
          formula: "v_{\\max} = \\sqrt{\\dfrac{2 K_{\\max}}{m_e}}",
          explanation: "Classical velocity of the fastest photoelectrons emerging from the photocathode surface.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Compute Incident UV Photon Energy (E)",
          math: "E = \\dfrac{hc}{\\lambda} = \\dfrac{1239.84\\text{ eV}\\cdot\\text{nm}}{310\\text{ nm}} = \\mathbf{4.00\\text{ eV}}",
          explanation: "Near-ultraviolet photons at 310 nm deliver 4.00 eV of energy per quantum.",
        },
        {
          step: 2,
          title: "Calculate Maximum Kinetic Energy (K_max)",
          math: "K_{\\max} = E - \\Phi_0 = 4.00\\text{ eV} - 2.75\\text{ eV} = \\mathbf{1.25\\text{ eV}}",
          explanation: "Overcoming Sodium's surface barrier consumes 2.75 eV; the remaining 1.25 eV appears as kinetic energy.",
        },
        {
          step: 3,
          title: "Solve for the Stopping Potential (V₀)",
          math: "V_0 = \\dfrac{K_{\\max}}{e} = \\dfrac{1.25\\text{ eV}}{e} = \\mathbf{1.25\\text{ V}}",
          explanation: "Because 1 eV divided by elementary charge e equals 1 volt, K_max = 1.25 eV directly gives V₀ = 1.25 V.",
        },
        {
          step: 4,
          title: "Calculate Maximum Photoelectron Speed",
          math: "v_{\\max} = \\sqrt{\\dfrac{2 \\times (1.25 \\times 1.602 \\times 10^{-19}\\text{ J})}{9.109 \\times 10^{-31}\\text{ kg}}} = \\mathbf{6.63 \\times 10^5\\text{ m/s}}",
          explanation: "The fastest photoelectrons shoot out of the sodium cathode at over 660 kilometers per second!",
        },
        {
          step: 5,
          title: "Verify Circuit Current Cutoff",
          math: "V \\ge 1.25\\text{ V} \\implies I = 0.00\\,\\mu\\text{A}",
          explanation: "Setting the bench power supply to 1.25 V completely arrests the electron flow, dropping photocurrent to zero.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: High Work Function Stopping Potential (Deep UV on Zinc)",
    subtitle: "Question: Given a Zinc photocathode (Φ = 4.31 eV) illuminated with Deep-UV radiation (λ = 200 nm), calculate and dial the Stopping Potential (V₀).",
    parameterName: "Retarding Bias (V)",
    parameterUnit: "V",
    targetMetalName: "Zinc",
    targetMetalSymbol: "Zn",
    workFunctionEv: 4.31,
    fixedWavelengthNm: 200,
    fixedPhotonEnergyEv: 6.20, // 1239.84 / 200 = 6.1992 eV ≈ 6.20 eV
    fixedColorHex: "#6366f1",
    mode: "stopping_potential",
    targetValue: 1.89, // V_0 = 6.20 - 4.31 = 1.89 V
    tolerance: 0.05,
    sliderMin: 0.0,
    sliderMax: 4.0,
    sliderDefault: 0.3,
    stepSmall: 0.01,
    stepLarge: 0.1,
    targetDisplay: "Stopping Potential V₀",
    targetDescription: "Find the Stopping Potential (V₀) for Zinc (Φ = 4.31 eV) under Deep-UV light (λ = 200 nm).\n\nFormula: V₀ = (hν - Φ) / e",
    mathDerivation: {
      title: "Deep Ultraviolet Emission & High Work Function Physics",
      concept:
        "1. High Work Function Metals & The Historic Hertz/Hallwachs Discovery\n" +
        "Historically, Wilhelm Hallwachs (1888) discovered the photoelectric effect using a polished zinc plate connected to an electroscope. He observed that ultraviolet radiation discharged a negatively charged zinc plate, but visible light had no effect whatsoever! Why? Zinc has a high work function (Φ₀ = 4.31 eV). Even the highest-energy visible violet photon (λ = 400 nm) carries only 3.10 eV, which falls far short of 4.31 eV. Only energetic Deep Ultraviolet (UV-C) photons can liberate electrons from Zinc!\n\n" +
        "2. Deep-UV Energetics (λ = 200 nm)\n" +
        "Radiation at λ = 200 nm delivers a potent quantum energy:\n" +
        "E = hc / λ = 1239.84 / 200 = 6.20 eV\n" +
        "Subtracting Zinc's 4.31 eV work function leaves 1.89 eV of maximum kinetic energy for the photoelectrons.\n\n" +
        "3. High-Velocity Electron Kinematics\n" +
        "With K_max = 1.89 eV, liberated electrons shoot toward the collector anode at an astounding velocity:\n" +
        "v_max = √(2 K_max / m_e) ≈ 8.15 × 10⁵ m/s (over 815 km/s)!\n" +
        "To halt these high-speed electrons, a strong retarding electric field of 1.89 V is required.\n\n" +
        "4. Key Exam Principle: Intensity Independence\n" +
        "Whether the Deep-UV lamp is set to a faint 10% brightness or turned up to a blazing 100% intensity, the energy per photon remains strictly 6.20 eV. Therefore, the stopping potential V₀ remains identically 1.89 V at all intensity levels! Increasing intensity only increases the number of emitted electrons per second (photocurrent), never their stopping voltage.",
      conclusion:
        "Summary & Physics Takeaways:\n" +
        "• Metal Target: Zinc (Zn) with high Work Function Φ₀ = 4.31 eV (completely immune to visible light).\n" +
        "• Deep-UV Radiation: λ = 200 nm, Photon Energy E = 6.20 eV.\n" +
        "• Maximum Kinetic Energy: K_max = E - Φ₀ = 6.20 eV - 4.31 eV = 1.89 eV.\n" +
        "• Stopping Potential: V₀ = K_max / e = 1.89 V.\n" +
        "• Electron Speed: v_max = 815 km/s.\n" +
        "• Intensity Independence: V₀ depends solely on light frequency and metal work function, remaining 1.89 V at all light intensities.",
      formulas: [
        {
          label: "1. DEEP-UV PHOTON ENERGY",
          formula: "E = \\dfrac{hc}{\\lambda} = \\dfrac{1239.84\\text{ eV}\\cdot\\text{nm}}{200\\text{ nm}} = 6.20\\text{ eV}",
          explanation: "High-frequency UV-C photon energy greatly exceeding Zinc's work function barrier.",
        },
        {
          label: "2. STOPPING VOLTAGE FORMULA",
          formula: "V_0 = \\dfrac{hc/\\lambda - \\Phi_0}{e}",
          explanation: "Analytical equation directly yielding the required counter-voltage in volts.",
        },
        {
          label: "3. HIGH-VELOCITY ELECTRON SPEED",
          formula: "v_{\\max} = \\sqrt{\\dfrac{2 K_{\\max}}{m_e}}",
          explanation: "Maximum classical velocity of liberated photoelectrons.",
        },
        {
          label: "4. INTENSITY INDEPENDENCE LAW",
          formula: "V_0 \\neq f(\\text{Intensity}), \\quad I_{\\text{sat}} \\propto \\text{Intensity}",
          explanation: "Intensity governs the number of ejected electrons (current), while frequency governs their stopping potential.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Calculate Deep-UV Photon Energy (E)",
          math: "E = \\dfrac{1239.84\\text{ eV}\\cdot\\text{nm}}{200\\text{ nm}} = \\mathbf{6.20\\text{ eV}} = 9.933 \\times 10^{-19}\\text{ J}",
          explanation: "Deep ultraviolet photons at 200 nm carry 6.20 eV of quantum energy.",
        },
        {
          step: 2,
          title: "Subtract Zinc Work Function for K_max",
          math: "K_{\\max} = E - \\Phi_0 = 6.20\\text{ eV} - 4.31\\text{ eV} = \\mathbf{1.89\\text{ eV}}",
          explanation: "Overcoming Zinc's surface barrier consumes 4.31 eV; the remaining 1.89 eV appears as kinetic energy.",
        },
        {
          step: 3,
          title: "Obtain Stopping Potential (V₀)",
          math: "V_0 = \\dfrac{K_{\\max}}{e} = \\dfrac{1.89\\text{ eV}}{e} = \\mathbf{1.89\\text{ V}}",
          explanation: "A reverse retarding voltage of exactly 1.89 V is required to drop current to zero.",
        },
        {
          step: 4,
          title: "Compute Maximum Electron Speed",
          math: "v_{\\max} = \\sqrt{\\dfrac{2 \\times (1.89 \\times 1.602 \\times 10^{-19}\\text{ J})}{9.109 \\times 10^{-31}\\text{ kg}}} = \\mathbf{8.15 \\times 10^5\\text{ m/s}} = \\mathbf{815\\text{ km/s}}",
          explanation: "Photoelectrons exit the zinc cathode at an astonishing speed of 815 kilometers per second.",
        },
        {
          step: 5,
          title: "Verify Intensity Independence",
          math: "V_0 \\neq f(\\text{Intensity}) \\implies V_0 = 1.89\\text{ V (at all lamp flux levels)}",
          explanation: "Changing lamp brightness alters electron quantity, but the stopping potential remains strictly 1.89 V.",
        },
      ],
    },
  },
};

export interface PhotoelectricPhysicsState {
  currentWavelengthNm: number;
  currentPhotonEnergyEv: number;
  currentVoltageV: number;
  workFunctionEv: number;
  maxKineticEnergyEv: number;
  stoppingPotentialV: number;
  thresholdWavelengthNm: number;
  photocurrentMicroAmps: number;
  isEmitting: boolean;
  error: number;
  isAligned: boolean;
}

interface PhotoelectricState {
  currentStage: number;
  sliderValue: number;
  isSimulating: boolean;
  simulationTrigger: number;
  score: number;
  stars: number;
  feedbackMessage: string;
  isCompleted: boolean;
  stageResults: Record<number, { stars: number; error: number }>;
  isMissionStarted: boolean;
  missionStartedAt: number | null;
  cameraTrigger: number;
  intensityPercent: number; // 10% to 100%

  // Actions
  setSliderValue: (val: number) => void;
  setIntensityPercent: (val: number) => void;
  setStage: (stage: number) => void;
  startMission: () => void;
  triggerSimulationPulse: () => void;
  resetSimulation: () => void;
  checkAlignment: () => { isSuccess: boolean; error: number };
  nextStage: () => void;
  triggerCameraReset: () => void;

  // Selectors
  getStageConfig: () => PhotoelectricStageConfig;
  getPhysicsState: () => PhotoelectricPhysicsState;
}

export const usePhotoelectricStore = create<PhotoelectricState>((set, get) => ({
  currentStage: 1,
  sliderValue: PHOTOELECTRIC_STAGES[1].sliderDefault,
  isSimulating: false,
  simulationTrigger: 0,
  score: 0,
  stars: 0,
  feedbackMessage: "Adjust the control to find the target physical condition.",
  isCompleted: false,
  stageResults: {},
  isMissionStarted: false,
  missionStartedAt: null,
  cameraTrigger: 0,
  intensityPercent: 80,

  setSliderValue: (val: number) => {
    const config = get().getStageConfig();
    const clamped = Math.max(config.sliderMin, Math.min(config.sliderMax, val));
    set({ sliderValue: Number(clamped.toFixed(2)) });
  },

  setIntensityPercent: (val: number) => {
    set({ intensityPercent: Math.max(10, Math.min(100, val)) });
  },

  setStage: (stage: number) => {
    if (!PHOTOELECTRIC_STAGES[stage]) return;
    set({
      currentStage: stage,
      sliderValue: PHOTOELECTRIC_STAGES[stage].sliderDefault,
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      cameraTrigger: get().cameraTrigger + 1,
      simulationTrigger: get().simulationTrigger + 1,
      feedbackMessage: `Stage ${stage} initialized. Dial to match ${PHOTOELECTRIC_STAGES[stage].targetDisplay}.`,
    });
  },

  startMission: () => {
    set({
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      cameraTrigger: get().cameraTrigger + 1,
      simulationTrigger: get().simulationTrigger + 1,
    });
  },

  triggerSimulationPulse: () => {
    set((s) => ({ simulationTrigger: s.simulationTrigger + 1 }));
  },

  triggerCameraReset: () => {
    set((s) => ({ cameraTrigger: s.cameraTrigger + 1 }));
  },

  resetSimulation: () => {
    const stage = get().currentStage;
    set({
      sliderValue: PHOTOELECTRIC_STAGES[stage].sliderDefault,
      feedbackMessage: "Dial reset to initial position.",
    });
  },

  checkAlignment: () => {
    const config = get().getStageConfig();
    const physics = get().getPhysicsState();
    const error = physics.error;
    const isSuccess = error <= config.tolerance;

    let awardedStars = 0;
    if (error <= config.tolerance * 0.4) awardedStars = 3;
    else if (error <= config.tolerance * 0.7) awardedStars = 2;
    else if (isSuccess) awardedStars = 1;

    set((state) => ({
      stars: Math.max(state.stars, awardedStars),
      stageResults: {
        ...state.stageResults,
        [state.currentStage]: { stars: awardedStars, error },
      },
      feedbackMessage: isSuccess
        ? `Target verified! Deviation: ${error.toFixed(2)} ${config.parameterUnit}. (${awardedStars} Stars)`
        : `Deviation of ${error.toFixed(2)} ${config.parameterUnit} exceeds tolerance (±${config.tolerance} ${config.parameterUnit}).`,
    }));

    return { isSuccess, error };
  },

  nextStage: () => {
    const next = get().currentStage + 1;
    if (PHOTOELECTRIC_STAGES[next]) {
      get().setStage(next);
    } else {
      set({
        isCompleted: true,
        feedbackMessage: "Mission accomplished! You have calibrated all photoelectric effect parameters.",
      });
    }
  },

  getStageConfig: () => {
    const { currentStage } = get();
    return PHOTOELECTRIC_STAGES[currentStage] || PHOTOELECTRIC_STAGES[1];
  },

  getPhysicsState: () => {
    const config = get().getStageConfig();
    const sliderVal = get().sliderValue;
    const intensity = get().intensityPercent;

    let currentWavelengthNm: number;
    let currentVoltageV: number;

    if (config.mode === "wavelength") {
      currentWavelengthNm = sliderVal;
      currentVoltageV = 0.0; // 0V bias in Stage 1
    } else {
      currentWavelengthNm = config.fixedWavelengthNm || 310;
      currentVoltageV = sliderVal;
    }

    const currentPhotonEnergyEv = HC_EV_NM / currentWavelengthNm;
    const workFunctionEv = config.workFunctionEv;
    const thresholdWavelengthNm = HC_EV_NM / workFunctionEv;

    const rawKMax = currentPhotonEnergyEv - workFunctionEv;
    const isEmitting = rawKMax > 0;
    const maxKineticEnergyEv = Math.max(0, rawKMax);
    const stoppingPotentialV = isEmitting ? maxKineticEnergyEv : 0;

    // Saturation photocurrent proportional to intensity (e.g. 5.0 uA at 100%)
    const baseSatCurrentMicroAmps = (intensity / 100) * 5.0;

    let photocurrentMicroAmps = 0;
    if (isEmitting) {
      if (currentVoltageV <= 0) {
        photocurrentMicroAmps = baseSatCurrentMicroAmps;
      } else if (currentVoltageV < stoppingPotentialV) {
        // Smooth drop off as reverse bias approaches stopping potential
        const ratio = 1 - currentVoltageV / stoppingPotentialV;
        photocurrentMicroAmps = baseSatCurrentMicroAmps * Math.pow(ratio, 1.8);
      } else {
        photocurrentMicroAmps = 0.0;
      }
    }

    const error = Math.abs(sliderVal - config.targetValue);
    const isAligned = error <= config.tolerance;

    return {
      currentWavelengthNm,
      currentPhotonEnergyEv,
      currentVoltageV,
      workFunctionEv,
      maxKineticEnergyEv,
      stoppingPotentialV,
      thresholdWavelengthNm,
      photocurrentMicroAmps,
      isEmitting,
      error,
      isAligned,
    };
  },
}));
