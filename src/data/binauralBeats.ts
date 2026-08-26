import { BinauralBeatDefinition } from "../types";

export const BUILTIN_BINAURAL_BEATS: BinauralBeatDefinition[] = [
  // ==========================================
  // 1. DMT & PINEAL SACRED RESONANCE (8 Modes)
  // ==========================================
  {
    id: "dmt_pineal_activation",
    name: "DMT Pineal Gland Activation",
    category: "dmt_sacred",
    baseFreq: 963,
    beatFreq: 40.0,
    waveform: "sine",
    badge: "963Hz + 40Hz Gamma Surge",
    description: "Crown chakra carrier combined with 40 Hz gamma neural synchrony for endogenous DMT & third-eye activation.",
    targetState: "Pineal Awakening & Hyper-Lucidity",
    isDmt: true,
  },
  {
    id: "dmt_hyperdimensional_33",
    name: "DMT Hyperdimensional Resonance",
    category: "dmt_sacred",
    baseFreq: 432,
    beatFreq: 33.0,
    waveform: "sine",
    badge: "432Hz + 33Hz Sacred Pulse",
    description: "Sacred geometry pyramid frequency inducing kundalini spinal surge and visionary hypnagogic transcendence.",
    targetState: "Hyperdimensional Vision & Kundalini",
    isDmt: true,
  },
  {
    id: "dmt_shamanic_journey",
    name: "Shamanic DMT Ayahuasca Trance",
    category: "dmt_sacred",
    baseFreq: 108,
    beatFreq: 4.5,
    waveform: "sine",
    badge: "108Hz OM + 4.5Hz Theta",
    description: "Deep sacred OM carrier paired with shamanic hypnagogic theta rhythm for ego-softening and trance immersion.",
    targetState: "Shamanic Trance & Ego Dissolution",
    isDmt: true,
  },
  {
    id: "dmt_pineal_harmonizer_888",
    name: "DMT Cosmic Pineal Harmonizer",
    category: "dmt_sacred",
    baseFreq: 888,
    beatFreq: 7.83,
    waveform: "sine",
    badge: "888Hz + 7.83Hz Schumann",
    description: "Cosmic angel harmonic synchronized with the Earth's natural 7.83 Hz electromagnetic heartbeat.",
    targetState: "Cosmic Synchronization & Grounding",
    isDmt: true,
  },
  {
    id: "dmt_transcendence_111",
    name: "DMT 111Hz Holy Cell Frequency",
    category: "dmt_sacred",
    baseFreq: 111,
    beatFreq: 5.5,
    waveform: "sine",
    badge: "111Hz + 5.5Hz Theta Bliss",
    description: "Ancient megalithic temple resonance producing deep endorphin release, cellular harmony, and euphoric peace.",
    targetState: "Cellular Rejuvenation & Bliss",
    isDmt: true,
  },
  {
    id: "dmt_quantum_528_40",
    name: "DMT Quantum DNA Miracle Surge",
    category: "dmt_sacred",
    baseFreq: 528,
    beatFreq: 40.0,
    waveform: "sine",
    badge: "528Hz + 40Hz Gamma Flash",
    description: "Miracle transformation tone fused with 40 Hz binding frequency for high-level insight and cellular repair.",
    targetState: "Epiphany & DNA Transformation",
    isDmt: true,
  },
  {
    id: "dmt_astral_portal",
    name: "DMT Astral Projection Portal",
    category: "dmt_sacred",
    baseFreq: 432,
    beatFreq: 6.3,
    waveform: "sine",
    badge: "432Hz + 6.3Hz Astral Theta",
    description: "Harmonic gateway tuned to 6.3 Hz border-sleep brainwave for conscious out-of-body lucidity and astral navigation.",
    targetState: "Astral Lucidity & Out-of-Body Trance",
    isDmt: true,
  },
  {
    id: "dmt_kundalini_surge",
    name: "DMT Kundalini Serpent Awakening",
    category: "dmt_sacred",
    baseFreq: 216,
    beatFreq: 33.0,
    waveform: "triangle",
    badge: "216Hz + 33Hz Sacred Surge",
    description: "Harmonic octave sub-carrier with warm triangle waveform inducing energetic spinal elevation and spiritual focus.",
    targetState: "Kundalini Flow & Energetic Charge",
    isDmt: true,
  },

  // ==========================================
  // 2. DELTA BRAINWAVES (0.5 – 4 Hz)
  // ==========================================
  {
    id: "delta_deep_sleep_0_5",
    name: "0.5 Hz Epsilon-Delta Sleep",
    category: "delta",
    baseFreq: 108,
    beatFreq: 0.5,
    waveform: "sine",
    badge: "0.5Hz Delta (108Hz)",
    description: "Ultra-deep slow wave for Human Growth Hormone release and profound restorative somnolence.",
    targetState: "Deep Slow-Wave Stage 4 Sleep",
  },
  {
    id: "delta_sleep",
    name: "2.5 Hz Restorative Delta",
    category: "delta",
    baseFreq: 160,
    beatFreq: 2.5,
    waveform: "sine",
    badge: "2.5Hz Delta (160Hz)",
    description: "Standard restorative Delta band facilitating pineal reset and dreamless physical recovery.",
    targetState: "Dreamless Physical Healing",
  },
  {
    id: "delta_immune_3_5",
    name: "3.5 Hz Cellular Regeneration",
    category: "delta",
    baseFreq: 144,
    beatFreq: 3.5,
    waveform: "sine",
    badge: "3.5Hz Delta (144Hz)",
    description: "Cellular rejuvenation and immune recovery frequency, lowering nocturnal cortisol.",
    targetState: "Immune Regeneration & Deep Rest",
  },
  {
    id: "delta_pineal_1_5",
    name: "1.5 Hz Earth OM Melatonin Wave",
    category: "delta",
    baseFreq: 136.1,
    beatFreq: 1.5,
    waveform: "sine",
    badge: "1.5Hz Delta (136.1Hz)",
    description: "Tuned to the planetary Earth OM year frequency for melatonin release and circadian stabilization.",
    targetState: "Melatonin Release & Circadian Calm",
  },

  // ==========================================
  // 3. THETA BRAINWAVES (4 – 8 Hz)
  // ==========================================
  {
    id: "theta_deep_trance_4_5",
    name: "4.5 Hz Hypnagogic Trance",
    category: "theta",
    baseFreq: 180,
    beatFreq: 4.5,
    waveform: "sine",
    badge: "4.5Hz Theta (180Hz)",
    description: "Hypnagogic boundary between waking consciousness and sleep; maximizes subconscious receptivity.",
    targetState: "Hypnagogic Entry & Deep Suggestibility",
  },
  {
    id: "theta_meditation",
    name: "5.5 Hz Subconscious Reprogramming",
    category: "theta",
    baseFreq: 180,
    beatFreq: 5.5,
    waveform: "sine",
    badge: "5.5Hz Theta (180Hz)",
    description: "Optimal frequency for subliminal affirmation absorption, emotional clearing, and deep meditation.",
    targetState: "Subconscious Priming & Reprogramming",
  },
  {
    id: "theta_lucid_dream_6_3",
    name: "6.3 Hz Lucid Dreaming Wave",
    category: "theta",
    baseFreq: 210,
    beatFreq: 6.3,
    waveform: "sine",
    badge: "6.3Hz Theta (210Hz)",
    description: "Stimulates conscious awareness during REM cycles, assisting with vivid lucid dream recall.",
    targetState: "Lucid Dream Induction & Vivid Recall",
  },
  {
    id: "theta_schumann_7_83",
    name: "7.83 Hz Schumann Earth Resonance",
    category: "theta",
    baseFreq: 256,
    beatFreq: 7.83,
    waveform: "sine",
    badge: "7.83Hz Schumann (256Hz)",
    description: "The fundamental electromagnetic standing wave of the Earth's ionosphere for total grounding.",
    targetState: "Earth Grounding & Autonomic Balance",
  },

  // ==========================================
  // 4. ALPHA BRAINWAVES (8 – 13 Hz)
  // ==========================================
  {
    id: "alpha_stress_relief_8_5",
    name: "8.5 Hz Parasympathetic Alpha",
    category: "alpha",
    baseFreq: 200,
    beatFreq: 8.5,
    waveform: "sine",
    badge: "8.5Hz Alpha (200Hz)",
    description: "Engages the vagus nerve and parasympathetic system to melt somatic tension and anxiety.",
    targetState: "Vagal Tone & Rapid De-Stressing",
  },
  {
    id: "alpha_relax",
    name: "10.0 Hz Flow State & Serotonin",
    category: "alpha",
    baseFreq: 220,
    beatFreq: 10.0,
    waveform: "sine",
    badge: "10.0Hz Alpha (220Hz)",
    description: "Centered alpha wave promoting relaxed alertness, effortless focus, and positive mood stabilization.",
    targetState: "Calm Focus & Serotonin Release",
  },
  {
    id: "alpha_superlearning_12_0",
    name: "12.0 Hz Superlearning & Retention",
    category: "alpha",
    baseFreq: 240,
    beatFreq: 12.0,
    waveform: "sine",
    badge: "12.0Hz Alpha (240Hz)",
    description: "High-alpha bridge optimizing rapid memory absorption, comprehension, and language processing.",
    targetState: "Rapid Cognitive Learning & Retention",
  },

  // ==========================================
  // 5. BETA BRAINWAVES (13 – 30 Hz)
  // ==========================================
  {
    id: "beta_smr_14_0",
    name: "14.0 Hz SMR Sensorimotor Rhythm",
    category: "beta",
    baseFreq: 250,
    beatFreq: 14.0,
    waveform: "sine",
    badge: "14.0Hz Beta SMR (250Hz)",
    description: "Sensorimotor rhythm for sustained physical stillness combined with sharp mental attention.",
    targetState: "Physical Stillness & Sustained Attention",
  },
  {
    id: "beta_cognition_20_0",
    name: "20.0 Hz High Executive Focus",
    category: "beta",
    baseFreq: 280,
    beatFreq: 20.0,
    waveform: "sine",
    badge: "20.0Hz Beta (280Hz)",
    description: "Mid-beta band for analytical problem-solving, rapid decision making, and active cognitive output.",
    targetState: "Executive Function & Analytical Speed",
  },
  {
    id: "beta_peak_energy_24_0",
    name: "24.0 Hz Peak Alertness & Stamina",
    category: "beta",
    baseFreq: 300,
    beatFreq: 24.0,
    waveform: "sine",
    badge: "24.0Hz Beta (300Hz)",
    description: "High-beta drive for morning wake-up readiness, alertness, and athletic willpower.",
    targetState: "Morning Wake Drive & Energy",
  },

  // ==========================================
  // 6. GAMMA BRAINWAVES (30 – 100 Hz)
  // ==========================================
  {
    id: "gamma_neural_sync_40_0",
    name: "40.0 Hz Gamma Neural Sync",
    category: "gamma",
    baseFreq: 432,
    beatFreq: 40.0,
    waveform: "sine",
    badge: "40.0Hz Gamma (432Hz)",
    description: "The 40 Hz master rhythm coordinating inter-hemispheric binding, high-level cognition, and recall.",
    targetState: "Neural Synchrony & Peak Insight",
  },
  {
    id: "gamma_lucid_epiphany_60_0",
    name: "60.0 Hz Transcendent Epiphany",
    category: "gamma",
    baseFreq: 480,
    beatFreq: 60.0,
    waveform: "sine",
    badge: "60.0Hz Gamma (480Hz)",
    description: "High gamma burst linked to moments of profound creative breakthrough and holistic awareness.",
    targetState: "Creative Breakthrough & Synthesis",
  },

  // ==========================================
  // 7. EPSILON & LAMBDA
  // ==========================================
  {
    id: "epsilon_0_1",
    name: "0.1 Hz Epsilon Deep Void",
    category: "epsilon_lambda",
    baseFreq: 96,
    beatFreq: 0.1,
    waveform: "sine",
    badge: "0.1Hz Epsilon (96Hz)",
    description: "Ultra-low frequency beneath standard delta, generating deep suspended stillness and sensory rest.",
    targetState: "Ultra-Deep Somatic Suspended Stillness",
  },
  {
    id: "lambda_200_0",
    name: "200.0 Hz Lambda Super-Consciousness",
    category: "epsilon_lambda",
    baseFreq: 528,
    beatFreq: 200.0,
    waveform: "sine",
    badge: "200Hz Lambda (528Hz)",
    description: "High-speed mystical burst state riding atop ultra-slow epsilon carriers for transcendent states.",
    targetState: "Super-Conscious Expansion",
  },

  // ==========================================
  // 8. FULL 9-TONE SOLFEGGIO SACRED SCALE
  // ==========================================
  {
    id: "solfeggio_174",
    name: "174 Hz Natural Anesthetic & Foundation",
    category: "solfeggio",
    baseFreq: 174,
    beatFreq: 0,
    waveform: "sine",
    badge: "174Hz Pure Solfeggio",
    description: "The lowest Solfeggio tone; reduces physical tension and acts as an energetic foundation.",
    targetState: "Pain Relief & Somatic Grounding",
  },
  {
    id: "solfeggio_285",
    name: "285 Hz Quantum Cellular Renewal",
    category: "solfeggio",
    baseFreq: 285,
    beatFreq: 0,
    waveform: "sine",
    badge: "285Hz Pure Solfeggio",
    description: "Sends harmonic signals for cellular restructuring, tissue regeneration, and vital recovery.",
    targetState: "Tissue Renewal & Vitality",
  },
  {
    id: "solfeggio_396",
    name: "396 Hz Liberation of Fear & Guilt",
    category: "solfeggio",
    baseFreq: 396,
    beatFreq: 0,
    waveform: "sine",
    badge: "396Hz Pure Solfeggio",
    description: "Root chakra resonance cleansing subconscious blockages, self-doubt, and internalized grief.",
    targetState: "Fear Liberation & Root Security",
  },
  {
    id: "solfeggio_417",
    name: "417 Hz Undoing Traumatic Blocks",
    category: "solfeggio",
    baseFreq: 417,
    beatFreq: 0,
    waveform: "sine",
    badge: "417Hz Pure Solfeggio",
    description: "Sacral frequency assisting in breaking negative behavioral loops and facilitating life change.",
    targetState: "Facilitating Change & Trauma Release",
  },
  {
    id: "solfeggio_432",
    name: "432 Hz Sacred Natural Harmonic",
    category: "solfeggio",
    baseFreq: 432,
    beatFreq: 0,
    waveform: "sine",
    badge: "432Hz Sacred Natural",
    description: "Universal harmonic tuning matching nature's golden ratio, bringing mental serenity and peace.",
    targetState: "Natural Harmony & Emotional Peace",
  },
  {
    id: "solfeggio_528",
    name: "528 Hz DNA Repair & Miracle Transformation",
    category: "solfeggio",
    baseFreq: 528,
    beatFreq: 0,
    waveform: "sine",
    badge: "528Hz Miracle Tone",
    description: "The core transformation frequency for profound spiritual clarity, inspiration, and DNA restoration.",
    targetState: "DNA Transformation & Miracles",
  },
  {
    id: "solfeggio_639",
    name: "639 Hz Interpersonal Harmony & Heart",
    category: "solfeggio",
    baseFreq: 639,
    beatFreq: 0,
    waveform: "sine",
    badge: "639Hz Heart Solfeggio",
    description: "Heart chakra resonance enhancing empathy, communication, relational trust, and compassion.",
    targetState: "Heart Coherence & Relationship Harmony",
  },
  {
    id: "solfeggio_741",
    name: "741 Hz Intuitive Awakening & Detox",
    category: "solfeggio",
    baseFreq: 741,
    beatFreq: 0,
    waveform: "sine",
    badge: "741Hz Intuitive Solfeggio",
    description: "Throat & third-eye detox tone stimulating problem-solving intuition and clean mental expression.",
    targetState: "Intuition & Subconscious Detox",
  },
  {
    id: "solfeggio_852",
    name: "852 Hz Spiritual Order & Pure Awareness",
    category: "solfeggio",
    baseFreq: 852,
    beatFreq: 0,
    waveform: "sine",
    badge: "852Hz Third-Eye Solfeggio",
    description: "Awakens higher spiritual order, seeing through illusions and returning to clear perception.",
    targetState: "Spiritual Clarity & Higher Vision",
  },
  {
    id: "solfeggio_963",
    name: "963 Hz Divine Crown & Pineal Awakening",
    category: "solfeggio",
    baseFreq: 963,
    beatFreq: 0,
    waveform: "sine",
    badge: "963Hz Crown Solfeggio",
    description: "The highest Solfeggio frequency connected to the cosmic light, crown chakra, and pineal gland.",
    targetState: "Crown Chakra & Pineal Illumination",
  },
];

const STORAGE_KEY = "subliminal_studio_custom_frequencies";

export function loadCustomBeats(): BinauralBeatDefinition[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error loading custom binaural beats:", e);
    return [];
  }
}

export function saveCustomBeat(beat: BinauralBeatDefinition): BinauralBeatDefinition[] {
  if (typeof window === "undefined") return [];
  try {
    const current = loadCustomBeats();
    const updated = [beat, ...current.filter((b) => b.id !== beat.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error saving custom beat:", e);
    return [];
  }
}

export function deleteCustomBeat(id: string): BinauralBeatDefinition[] {
  if (typeof window === "undefined") return [];
  try {
    const current = loadCustomBeats();
    const updated = current.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error deleting custom beat:", e);
    return [];
  }
}

export function getAllBinauralBeats(customBeats?: BinauralBeatDefinition[]): BinauralBeatDefinition[] {
  const custom = customBeats !== undefined ? customBeats : loadCustomBeats();
  return [...custom, ...BUILTIN_BINAURAL_BEATS];
}

export function resolveBinauralBeat(id: string, customBeats?: BinauralBeatDefinition[]): BinauralBeatDefinition {
  const all = getAllBinauralBeats(customBeats);
  const found = all.find((b) => b.id === id);
  if (found) return found;

  // Fallback defaults for legacy IDs
  if (id === "delta_sleep") {
    return BUILTIN_BINAURAL_BEATS.find((b) => b.id === "delta_sleep") || BUILTIN_BINAURAL_BEATS[8];
  }
  if (id === "theta_meditation") {
    return BUILTIN_BINAURAL_BEATS.find((b) => b.id === "theta_meditation") || BUILTIN_BINAURAL_BEATS[13];
  }
  if (id === "alpha_relax") {
    return BUILTIN_BINAURAL_BEATS.find((b) => b.id === "alpha_relax") || BUILTIN_BINAURAL_BEATS[17];
  }
  if (id === "solfeggio_528") {
    return BUILTIN_BINAURAL_BEATS.find((b) => b.id === "solfeggio_528") || BUILTIN_BINAURAL_BEATS[28];
  }
  if (id === "solfeggio_432") {
    return BUILTIN_BINAURAL_BEATS.find((b) => b.id === "solfeggio_432") || BUILTIN_BINAURAL_BEATS[27];
  }

  // Generic fallback if unknown
  return {
    id,
    name: "Custom / Dynamic Frequency",
    category: "custom",
    baseFreq: 200,
    beatFreq: 5.0,
    waveform: "sine",
    badge: "200Hz + 5Hz",
    description: "User configured carrier and binaural beat offset.",
    targetState: "Binaural Entrainment",
  };
}
