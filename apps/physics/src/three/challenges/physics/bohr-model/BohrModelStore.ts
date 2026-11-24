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

export interface BohrStageConfig {
  stage: number;
  title: string;
  subtitle: string;
  parameterName: string;
  parameterUnit: string;
  targetAtomName: string;
  targetAtomSymbol: string;
  atomicNumberZ: number;
  initialOrbitN: number;
  finalOrbitN: number;
  mode: "absorption" | "emission" | "ionization";
  targetValue: number;
  tolerance: number;
  sliderMin: number;
  sliderMax: number;
  sliderDefault: number;
  stepSmall: number;
  stepLarge: number;
  targetDisplay: string;
  targetDescription: string;
  mathDerivation: MathDerivation;
}

// Fundamental Universal Physical Constants
export const HC_EV_NM = 1239.842;
export const RYDBERG_CONSTANT_M = 1.097373e7; // R_H in m^-1
export const BOHR_RADIUS_ANGSTROM = 0.529177; // a_0 in Angstroms
export const GROUND_STATE_ENERGY_EV = -13.6057; // E_1 for Hydrogen

export const BOHR_STAGES: Record<number, BohrStageConfig> = {
  1: {
    stage: 1,
    title: "Stage 1: Resonance Absorption & Quantum Leap (n = 1 → 2)",
    subtitle: "Question: Given ground-state Hydrogen (E₁ = -13.60 eV), calculate the exact photon excitation energy required to bump the electron to the first excited state (n = 2).",
    parameterName: "Photon Energy (E)",
    parameterUnit: "eV",
    targetAtomName: "Hydrogen",
    targetAtomSymbol: "H",
    atomicNumberZ: 1,
    initialOrbitN: 1,
    finalOrbitN: 2,
    mode: "absorption",
    targetValue: 10.20,
    tolerance: 0.15,
    sliderMin: 8.00,
    sliderMax: 13.00,
    sliderDefault: 9.00,
    stepSmall: 0.01,
    stepLarge: 0.10,
    targetDisplay: "n = 1 → 2",
    targetDescription: "Find the energy needed to excite Hydrogen from orbit n = 1 to n = 2.",
    mathDerivation: {
      title: "Resonance Absorption & Quantized Orbital Transitions",
      concept:
        "1. The Quantum Ladder Analogy (Why Energy is Quantized)\n" +
        "Imagine an electron living on a ladder. In classical physics, an object can slide smoothly up or down a continuous ramp at any height. But in Niels Bohr's quantum model of the atom, the electron can ONLY stand on discrete rungs (orbits n = 1, 2, 3, ...). The space between rungs is strictly forbidden—the electron simply cannot exist at n = 1.5!\n\n" +
        "2. Why Are Atomic Energy Levels Negative?\n" +
        "The electron carries negative charge (-e) and is attracted to the positive nucleus (+e). Being 'bound' means the electron is trapped inside an electrostatic energy well. We define zero energy (E = 0) as the electron being completely free and infinitely far away. Because you must ADD positive energy to pull the electron away from the nucleus, any trapped state has negative energy:\n" +
        "• Ground State (n = 1): E₁ = -13.60 eV (most tightly bound, closest to nucleus)\n" +
        "• First Excited State (n = 2): E₂ = -13.60 / 2² = -3.40 eV (higher up, less tightly bound)\n\n" +
        "3. The 'Lock & Key' Resonance Rule (All-or-Nothing Absorption)\n" +
        "A bound electron cannot absorb 'part' of a photon! For an electron to leap from rung n = 1 to rung n = 2, an incoming photon must deliver the EXACT energy difference:\n" +
        "ΔE = E₂ - E₁ = -3.40 eV - (-13.60 eV) = +10.20 eV.\n" +
        "• If you shoot a 9.0 eV photon: It doesn't have enough energy to reach rung 2. The atom cannot absorb 9.0 eV, so the photon passes straight through.\n" +
        "• If you shoot an 11.5 eV photon: It has more than enough energy for rung 2, but not enough for rung 3 (which needs 12.09 eV). Because there is no rung at 11.5 eV, the atom rejects it completely!\n" +
        "Only when the photon has EXACTLY 10.20 eV does the atom absorb it in a flash, triggering the instant quantum leap!\n\n" +
        "4. How Does Orbit Size Change?\n" +
        "Bohr proved that orbital radius expands with n²:\n" +
        "r_n = n² · a₀  (where a₀ = 0.529 Å is the Bohr radius).\n" +
        "• In the ground state (n = 1), r₁ = 0.53 Å.\n" +
        "• In the excited state (n = 2), r₂ = 2² · a₀ = 4 · 0.53 Å = 2.12 Å (4 times wider!).",
      conclusion:
        "Key Takeaways & Exam Tips:\n" +
        "• Ground State Energy: E₁ = -13.60 eV (n = 1).\n" +
        "• First Excited State: E₂ = -3.40 eV (n = 2).\n" +
        "• Resonance Excitation Energy: ΔE = E₂ - E₁ = 10.20 eV.\n" +
        "• Lyman-α Wavelength: λ = hc / ΔE = 1240 / 10.20 = 121.5 nm (Ultraviolet spectrum).\n" +
        "• Common Exam Trap: Forgetting the negative sign in ΔE = E₂ - E₁ = -3.4 - (-13.6) = +10.2 eV! Energy required to excite an atom is ALWAYS positive.",
      formulas: [
        {
          label: "1. BOHR ORBIT ENERGY LEVEL",
          formula: "E_n = -\\dfrac{13.6\\text{ eV}}{n^2} \\cdot Z^2",
          explanation: "Calculates the total bound mechanical energy (kinetic + electrostatic potential) of orbit n in Hydrogen (Z=1).",
        },
        {
          label: "2. BOHR FREQUENCY / TRANSITION LAW",
          formula: "\\Delta E = E_{\\text{final}} - E_{\\text{initial}} = h\\nu = \\dfrac{hc}{\\lambda}",
          explanation: "The energy carried by an absorbed or emitted photon exactly equals the energy gap between initial and final orbits.",
        },
        {
          label: "3. BOHR RADIUS EXPANSION",
          formula: "r_n = n^2 \\cdot a_0 = n^2 (0.529\\text{ \\AA})",
          explanation: "Orbital radius scales with n squared. Orbit n=2 is 4x wider than n=1; orbit n=3 is 9x wider.",
        },
        {
          label: "4. HC SHORTCUT CONVERSION",
          formula: "\\lambda\\text{ (nm)} = \\dfrac{1239.84\\text{ eV}\\cdot\\text{nm}}{\\Delta E\\text{ (eV)}} \\approx \\dfrac{1240}{\\Delta E}",
          explanation: "High-speed conversion formula to switch between photon energy in electron-volts and wavelength in nanometers.",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Find the Ground State Energy (n = 1)",
          math: "E_1 = -\\dfrac{13.606\\text{ eV}}{1^2} = -13.606\\text{ eV}",
          explanation: "The electron starts in Hydrogen's innermost ground state orbit (n = 1), where it is held most tightly by the proton.",
        },
        {
          step: 2,
          title: "Find the Target Excited State Energy (n = 2)",
          math: "E_2 = -\\dfrac{13.606\\text{ eV}}{2^2} = -\\dfrac{13.606}{4} = -3.401\\text{ eV}",
          explanation: "In the n = 2 orbit, the electron has moved further from the nucleus, so its binding energy is reduced to -3.40 eV.",
        },
        {
          step: 3,
          title: "Calculate the Energy Gap (ΔE)",
          math: "\\Delta E = E_2 - E_1 = -3.401\\text{ eV} - (-13.606\\text{ eV}) = \\mathbf{+10.205\\text{ eV}} \\approx \\mathbf{10.20\\text{ eV}}",
          explanation: "Subtract initial energy from final energy. The electron requires exactly 10.20 eV of external photon energy to leap.",
        },
        {
          step: 4,
          title: "Determine the Corresponding Photon Wavelength (λ)",
          math: "\\lambda = \\dfrac{hc}{\\Delta E} = \\dfrac{1239.84\\text{ eV}\\cdot\\text{nm}}{10.205\\text{ eV}} = \\mathbf{121.5\\text{ nm}}",
          explanation: "121.5 nm is an ultraviolet photon known as the Lyman-α (alpha) line, the first member of the Lyman series.",
        },
        {
          step: 5,
          title: "Verify Resonance Absorption & Orbital Expansion",
          math: "r_1 = 0.529\\text{ \\AA} \\quad \\longrightarrow \\quad r_2 = 2^2 \\cdot 0.529\\text{ \\AA} = \\mathbf{2.116\\text{ \\AA}}",
          explanation: "Setting the photon gun to 10.20 eV delivers the exact quantum required: the photon is absorbed and the orbit expands by 4x.",
        },
      ],
    },
  },
  2: {
    stage: 2,
    title: "Stage 2: Emission Spectra (Balmer Hα Line, n = 3 → 2)",
    subtitle: "Question: An electron in the second excited state (n = 3) cascades down to n = 2. Calculate the emitted photon wavelength (Hα line) and tune the spectrograph.",
    parameterName: "Spectral Wavelength (λ)",
    parameterUnit: "nm",
    targetAtomName: "Hydrogen",
    targetAtomSymbol: "H",
    atomicNumberZ: 1,
    initialOrbitN: 3,
    finalOrbitN: 2,
    mode: "emission",
    targetValue: 656.3,
    tolerance: 5.0,
    sliderMin: 400.0,
    sliderMax: 750.0,
    sliderDefault: 550.0,
    stepSmall: 0.1,
    stepLarge: 1.0,
    targetDisplay: "Balmer Hα (n = 3 → 2)",
    targetDescription: "Find the wavelength of light emitted when the electron drops from n = 3 to n = 2.",
    mathDerivation: {
      title: "The Balmer Series & Atomic Line Spectra",
      concept:
        "1. Why Do Atoms Emit Light? (Spontaneous De-Excitation)\n" +
        "An electron in an excited state (n = 3) is unstable—it typically lasts only about 10 nanoseconds (10⁻⁸ s) before falling naturally to a lower energy state. Just like a ball rolling down stairs, the falling electron loses energy. By the Law of Conservation of Energy, this lost energy cannot simply vanish: it is instantly converted into a single photon of light shot outward from the atom!\n\n" +
        "2. Why the Balmer Series is So Special (Visible Rainbow Light)\n" +
        "Hydrogen has multiple series of spectral lines depending on where the falling electron lands:\n" +
        "• Lyman Series (drops to n = 1): Huge energy drops → High-energy Ultraviolet (invisible to humans)\n" +
        "• Paschen Series (drops to n = 3): Small energy drops → Low-energy Infrared (invisible to humans)\n" +
        "• BALMER SERIES (drops to n = 2): Medium energy drops (1.8 eV to 3.1 eV) → Exactly matches the VISIBLE LIGHT spectrum that human eyes can see!\n\n" +
        "3. The Famous Crimson Hα Line (656.3 nm)\n" +
        "The very first line of the Balmer series occurs when an electron drops from n = 3 to n = 2. Because this is the smallest step in the Balmer series, it releases the smallest energy: ΔE = 1.889 eV. In physics, smaller energy means longer wavelength: λ = 656.3 nm, which is deep crimson red! This very line is what causes glowing hydrogen nebulae throughout our galaxy to glow bright red in astronomical telescopes.\n\n" +
        "4. How the Prism Spectrometer Works\n" +
        "When the emitted light passes through the quartz prism, different wavelengths refract (bend) by different amounts—shorter wavelengths (blue/violet) bend more, while longer wavelengths (red) bend less. This separates the emitted photons onto the calibrated detector screen at exactly 656.3 nm.",
      conclusion:
        "Key Takeaways & Exam Tips:\n" +
        "• Initial Excited State: n = 3, E₃ = -1.51 eV.\n" +
        "• Final Lower State: n = 2, E₂ = -3.40 eV.\n" +
        "• Energy Released as Light: ΔE = E₃ - E₂ = 1.889 eV.\n" +
        "• Emitted Wavelength: λ = 656.3 nm (Red Hα spectral line).\n" +
        "• Common Exam Trap: In the Rydberg formula 1/λ = R_H (1/n₁² - 1/n₂²), ALWAYS put the lower orbit as n₁ (n₁ = 2) and the higher orbit as n₂ (n₂ = 3), so that (1/n₁² - 1/n₂²) is positive!",
      formulas: [
        {
          label: "1. RYDBERG WAVELENGTH FORMULA",
          formula: "\\dfrac{1}{\\lambda} = R_H \\left(\\dfrac{1}{n_1^2} - \\dfrac{1}{n_2^2}\\right) \\quad (n_1 < n_2)",
          explanation: "Universal empirical formula for all Hydrogen spectral lines, where R_H = 1.09737 × 10⁷ m⁻¹.",
        },
        {
          label: "2. PHOTON ENERGY FROM ORBITAL DROP",
          formula: "\\Delta E = E_3 - E_2 = -1.51\\text{ eV} - (-3.40\\text{ eV}) = +1.889\\text{ eV}",
          explanation: "The energy carried away by the emitted photon equals the drop in electron binding energy.",
        },
        {
          label: "3. WAVELENGTH SHORTCUT",
          formula: "\\lambda\\text{ (nm)} = \\dfrac{hc}{\\Delta E} = \\dfrac{1239.84\\text{ eV}\\cdot\\text{nm}}{\\Delta E\\text{ (eV)}} = 656.3\\text{ nm}",
          explanation: "Direct conversion from transition energy in electron-volts to wavelength in nanometers.",
        },
        {
          label: "4. BALMER SERIES IDENTIFIER",
          formula: "n_1 = 2, \\quad n_2 = 3, 4, 5, 6, \\dots",
          explanation: "All transitions ending at n = 2 produce visible light: Hα (red), Hβ (aqua), Hγ (blue), Hδ (violet).",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Find the Initial Energy Level (n = 3)",
          math: "E_3 = -\\dfrac{13.606\\text{ eV}}{3^2} = -\\dfrac{13.606}{9} = -1.512\\text{ eV}",
          explanation: "The electron starts in the second excited state (n = 3), where its binding energy is -1.51 eV.",
        },
        {
          step: 2,
          title: "Find the Final Energy Level (n = 2)",
          math: "E_2 = -\\dfrac{13.606\\text{ eV}}{2^2} = -\\dfrac{13.606}{4} = -3.401\\text{ eV}",
          explanation: "The electron falls to the first excited state (n = 2), where binding energy is -3.40 eV.",
        },
        {
          step: 3,
          title: "Calculate the Energy Released (ΔE)",
          math: "\\Delta E = E_3 - E_2 = -1.512\\text{ eV} - (-3.401\\text{ eV}) = \\mathbf{+1.889\\text{ eV}}",
          explanation: "The falling electron sheds 1.889 eV of energy, which creates a single photon of red light.",
        },
        {
          step: 4,
          title: "Calculate the Emitted Wavelength (λ)",
          math: "\\lambda = \\dfrac{hc}{\\Delta E} = \\dfrac{1239.84\\text{ eV}\\cdot\\text{nm}}{1.889\\text{ eV}} = \\mathbf{656.35\\text{ nm}} \\approx \\mathbf{656.3\\text{ nm}}",
          explanation: "Using the Planck constant shortcut yields exactly 656.3 nm, which sits squarely in the red spectrum.",
        },
        {
          step: 5,
          title: "Verify with the Rydberg Equation",
          math: "\\dfrac{1}{\\lambda} = R_H \\left(\\dfrac{1}{2^2} - \\dfrac{1}{3^2}\\right) = R_H \\left(\\dfrac{5}{36}\\right) \\implies \\lambda = \\dfrac{36}{5 R_H} = \\mathbf{656.3\\text{ nm}}",
          explanation: "Both Bohr's energy-level difference and Rydberg's classical formula yield identical results.",
        },
      ],
    },
  },
  3: {
    stage: 3,
    title: "Stage 3: Ionization Cannon (n = 1 → ∞)",
    subtitle: "Question: Calculate the exact Ionization Energy required to overcome Hydrogen's Coulomb barrier and knock the ground-state electron completely free.",
    parameterName: "Ionization Energy (E_ion)",
    parameterUnit: "eV",
    targetAtomName: "Hydrogen",
    targetAtomSymbol: "H",
    atomicNumberZ: 1,
    initialOrbitN: 1,
    finalOrbitN: 999, // Infinity
    mode: "ionization",
    targetValue: 13.61,
    tolerance: 0.20,
    sliderMin: 10.00,
    sliderMax: 18.00,
    sliderDefault: 11.50,
    stepSmall: 0.01,
    stepLarge: 0.10,
    targetDisplay: "Ionization (n = 1 → ∞)",
    targetDescription: "Find the energy needed to knock the ground-state electron completely free.",
    mathDerivation: {
      title: "Atomic Ionization & Bound-to-Continuum Transitions",
      concept:
        "1. What is Ionization? (Escaping the Coulomb Prison)\n" +
        "In normal atomic life, the electron is trapped inside the atom by the electrical attraction of the proton. Ionization means completely pulling the electron away to infinity (n → ∞), breaking the nuclear bond forever. This leaves behind a bare Hydrogen ion (a lone H⁺ proton) and a free wandering electron.\n\n" +
        "2. The 'Zero-Energy' Boundary (Bound States vs. The Continuum)\n" +
        "• Bound States (n = 1, 2, 3, ...): Total energy E is NEGATIVE (E < 0). The electron is trapped in an energy pit and must revolve in fixed, quantized circular tracks.\n" +
        "• Zero-Energy Threshold (n = ∞): At infinite distance, the electrostatic pull drops to zero, so E_∞ = 0.00 eV.\n" +
        "• The Continuum (E > 0): Once the electron has zero or positive total energy, it is NO LONGER bound to the atom! In the continuum, energy is NO LONGER quantized—the free electron can fly through space at any continuous speed and kinetic energy!\n\n" +
        "3. Photoelectric Effect Meets Bohr's Atom\n" +
        "What happens if you shoot a photon with MORE than 13.61 eV (for example, a 16.0 eV extreme-UV photon)?\n" +
        "Unlike bound-to-bound transitions (which reject non-matching photons), ionization will accept ANY photon with E ≥ 13.61 eV!\n" +
        "• 13.61 eV is consumed to break the Coulomb bond.\n" +
        "• The remaining surplus energy (16.0 - 13.61 = 2.39 eV) converts directly into the classical kinetic energy of the speeding freed electron: K_free = (1/2) m_e v² = 2.39 eV.\n\n" +
        "4. Hydrogenic (Hydrogen-Like) Ions for JEE / NEET\n" +
        "Bohr's formula applies to ANY one-electron system with atomic number Z:\n" +
        "E_n = -13.6 · (Z² / n²) eV.\n" +
        "• Neutral Hydrogen (Z = 1): E_ion = 13.6 eV\n" +
        "• Singly Ionized Helium He⁺ (Z = 2): E_ion = 13.6 · 2² = 54.4 eV\n" +
        "• Doubly Ionized Lithium Li²⁺ (Z = 3): E_ion = 13.6 · 3² = 122.4 eV!",
      conclusion:
        "Key Takeaways & Exam Tips:\n" +
        "• Ground State Binding Energy: E₁ = -13.606 eV.\n" +
        "• Continuum Threshold: E_∞ = 0.00 eV.\n" +
        "• Minimum Ionization Energy: E_ion = E_∞ - E₁ = +13.61 eV.\n" +
        "• Lyman Limit Wavelength: λ_limit = hc / 13.61 eV = 91.1 nm (Extreme Ultraviolet).\n" +
        "• Common Exam Trap: Confusing Excitation Energy with Ionization Energy! Excitation energy moves an electron to another bound orbit (e.g. n=1→2 needs 10.2 eV); Ionization energy removes the electron completely to n=∞ (needs 13.6 eV).",
      formulas: [
        {
          label: "1. IONIZATION ENERGY FORMULA",
          formula: "E_{\\text{ion}} = E_\\infty - E_1 = 0 - (-13.6 Z^2) = +13.6 Z^2\\text{ eV}",
          explanation: "Minimum energy required to lift an electron from the ground state into the free continuum.",
        },
        {
          label: "2. EINSTEIN-BOHR FREE ELECTRON KINETIC ENERGY",
          formula: "K_{\\text{free}} = E_{\\text{photon}} - E_{\\text{ion}} = \\dfrac{1}{2} m_e v^2",
          explanation: "Excess energy supplied above the 13.61 eV ionization threshold converts into free electron kinetic energy.",
        },
        {
          label: "3. LYMAN SERIES LIMIT WAVELENGTH",
          formula: "\\lambda_{\\text{limit}} = \\dfrac{hc}{E_{\\text{ion}}} = \\dfrac{1239.84\\text{ eV}\\cdot\\text{nm}}{13.606\\text{ eV}} = \\mathbf{91.12\\text{ nm}}",
          explanation: "Shortest possible absorption/emission wavelength in Hydrogen; photons shorter than 91.1 nm ionize the atom instantly.",
        },
        {
          label: "4. HYDROGENIC ION SCALING LAW",
          formula: "E_{\\text{ion}}(Z) = Z^2 \\cdot E_{\\text{ion}}(H) = 13.6 \\cdot Z^2\\text{ eV}",
          explanation: "Ionization energy scales with the square of nuclear charge Z (He+: 54.4 eV, Li2+: 122.4 eV).",
        },
      ],
      steps: [
        {
          step: 1,
          title: "Identify Ground State Binding Energy",
          math: "E_1 = -\\dfrac{13.606\\text{ eV}}{1^2} = -13.606\\text{ eV}",
          explanation: "In ground-state Hydrogen, the electron is bound at the bottom of the Coulomb potential well with -13.61 eV of energy.",
        },
        {
          step: 2,
          title: "Determine the Free Unbound State Energy (n = ∞)",
          math: "E_\\infty = -\\dfrac{13.606\\text{ eV}}{\\infty^2} = \\mathbf{0.000\\text{ eV}}",
          explanation: "At infinite separation, the electrostatic attraction between the proton and electron drops to zero.",
        },
        {
          step: 3,
          title: "Calculate the Required Ionization Energy",
          math: "E_{\\text{ion}} = E_\\infty - E_1 = 0 - (-13.606\\text{ eV}) = \\mathbf{+13.606\\text{ eV}} \\approx \\mathbf{13.61\\text{ eV}}",
          explanation: "The external photon beam must supply at least +13.61 eV of work to overcome the electrostatic bond.",
        },
        {
          step: 4,
          title: "Calculate the Lyman Limit Cutoff Wavelength",
          math: "\\lambda_{\\text{limit}} = \\dfrac{hc}{E_{\\text{ion}}} = \\dfrac{1239.84\\text{ eV}\\cdot\\text{nm}}{13.606\\text{ eV}} = \\mathbf{91.12\\text{ nm}}",
          explanation: "Any photon in the extreme ultraviolet with λ ≤ 91.1 nm possesses enough energy to liberate the electron.",
        },
        {
          step: 5,
          title: "Verify Free Hyperbolic Electron Escape",
          math: "E_{\\text{beam}} = 13.61\\text{ eV} \\implies E_{\\text{total}} = 0 \\implies \\text{Coulomb Bond Severed}",
          explanation: "Dialing the photon beam to 13.61 eV shatters the circular orbit constraint, launching the electron on an open escape trajectory.",
        },
      ],
    },
  },
};

export interface BohrPhysicsState {
  currentOrbitN: number;
  currentRadiusAngstrom: number;
  currentEnergyEv: number;
  currentVelocityKmS: number;
  targetValue: number;
  dialedValue: number;
  error: number;
  isAligned: boolean;
  isResonant: boolean;
  emittedWavelengthNm: number;
  spectralColorHex: string;
}

interface BohrState {
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

  // Actions
  setSliderValue: (val: number) => void;
  setStage: (stage: number) => void;
  startMission: () => void;
  triggerSimulationPulse: () => void;
  resetSimulation: () => void;
  checkAlignment: () => { isSuccess: boolean; error: number };
  nextStage: () => void;
  triggerCameraReset: () => void;

  // Selectors
  getStageConfig: () => BohrStageConfig;
  getPhysicsState: () => BohrPhysicsState;
}

export const useBohrModelStore = create<BohrState>((set, get) => ({
  currentStage: 1,
  sliderValue: BOHR_STAGES[1].sliderDefault,
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

  setSliderValue: (val: number) => {
    const config = get().getStageConfig();
    const clamped = Math.max(config.sliderMin, Math.min(config.sliderMax, val));
    set({ sliderValue: clamped });
  },

  setStage: (stage: number) => {
    if (!BOHR_STAGES[stage]) return;
    set({
      currentStage: stage,
      sliderValue: BOHR_STAGES[stage].sliderDefault,
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      cameraTrigger: get().cameraTrigger + 1,
      feedbackMessage: `Stage ${stage} initialized. Match ${BOHR_STAGES[stage].targetDisplay}.`,
    });
  },

  startMission: () => {
    set({
      isMissionStarted: true,
      missionStartedAt: performance.now(),
      cameraTrigger: get().cameraTrigger + 1,
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
      sliderValue: BOHR_STAGES[stage].sliderDefault,
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
    if (BOHR_STAGES[next]) {
      get().setStage(next);
    } else {
      set({
        isCompleted: true,
        feedbackMessage: "Mission accomplished! You have calibrated all Bohr model parameters.",
      });
    }
  },

  getStageConfig: () => {
    const { currentStage } = get();
    return BOHR_STAGES[currentStage] || BOHR_STAGES[1];
  },

  getPhysicsState: () => {
    const config = get().getStageConfig();
    const dialedValue = get().sliderValue;
    const targetValue = config.targetValue;
    const error = Math.abs(dialedValue - targetValue);
    const isAligned = error <= config.tolerance;

    const n = config.initialOrbitN;
    const currentRadiusAngstrom = n * n * BOHR_RADIUS_ANGSTROM;
    const currentEnergyEv = GROUND_STATE_ENERGY_EV / (n * n);
    const currentVelocityKmS = 2187.6 / n;

    let emittedWavelengthNm = 0;
    let spectralColorHex = "#6366f1";

    if (config.mode === "emission") {
      emittedWavelengthNm = dialedValue;
      if (dialedValue >= 640 && dialedValue <= 700) spectralColorHex = "#ef4444"; // H-alpha red
      else if (dialedValue >= 480 && dialedValue < 500) spectralColorHex = "#06b6d4"; // H-beta cyan
      else if (dialedValue >= 420 && dialedValue < 440) spectralColorHex = "#6366f1"; // H-gamma violet
      else spectralColorHex = "#a855f7";
    } else if (config.mode === "absorption") {
      emittedWavelengthNm = dialedValue > 0.1 ? HC_EV_NM / dialedValue : 121.6;
      spectralColorHex = "#818cf8";
    } else {
      emittedWavelengthNm = 91.2;
      spectralColorHex = "#38bdf8";
    }

    return {
      currentOrbitN: n,
      currentRadiusAngstrom,
      currentEnergyEv,
      currentVelocityKmS,
      targetValue,
      dialedValue,
      error,
      isAligned,
      isResonant: isAligned,
      emittedWavelengthNm,
      spectralColorHex,
    };
  },
}));
