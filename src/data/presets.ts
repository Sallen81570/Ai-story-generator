import { PresetProgram } from "../types";

export const PRESET_PROGRAMS: PresetProgram[] = [
  {
    id: "deep_sleep_neutral_reset",
    title: "Deep Sleep & Subconscious Stillness",
    category: "Sleep & Recovery",
    description: "Deep brown noise acoustic bed masking subconscious restorative thoughts to ease insomnia and overactive evening thoughts.",
    voiceName: "Kore",
    recommendedNoise: "brown",
    recommendedBrainwave: "delta_sleep",
    voiceLowPassHz: 2200,
    subliminalAttenuationDb: -26,
    intervalRestSec: 6,
    masterLowPassHz: 3500,
    phrases: [
      "The stomach is settled. The body runs clean on its own energy.",
      "Hunger is just a passing signal. Hydration satisfies the urge.",
      "Dangerous urges fade away completely. The body is protected and respected.",
      "You release the need for extreme sensations. Calm balance takes over.",
      "Impulses arise, peak, and dissolve harmlessly. You remain in control.",
      "Mindless feeds drain focus. Put the screen away.",
      "The mind prefers stillness over rapid feeds.",
      "Clear focus replaces idle searching.",
      "Physical discipline is absolute. Energy is directed inward and upward.",
      "You are fully present, grounded, and at peace."
    ]
  },
  {
    id: "fasting_metabolic_discipline",
    title: "Fasting, Appetite Mastery & Clean Energy",
    category: "Discipline & Health",
    description: "Calm mental anchoring to curb emotional eating, quiet late-night cravings, and reinforce metabolic clarity.",
    voiceName: "Charon",
    recommendedNoise: "brown",
    recommendedBrainwave: "theta_meditation",
    voiceLowPassHz: 2000,
    subliminalAttenuationDb: -28,
    intervalRestSec: 5,
    masterLowPassHz: 3200,
    phrases: [
      "The body effortlessly burns its clean, natural reserves.",
      "Cravings are temporary waves that crest and dissolve into calm.",
      "You derive profound satisfaction from lightness and clarity.",
      "Water refreshes, restores, and energizes your cells.",
      "Hunger is a quiet guest, not a demanding master.",
      "Your discipline around nourishment is effortless and unwavering.",
      "You eat only when truly hungry, stopping when comfortably nourished.",
      "Every cell vibrates with renewed vitality, healing, and strength."
    ]
  },
  {
    id: "digital_detox_focus",
    title: "Dopamine Reset & Digital Stillness",
    category: "Focus & Productivity",
    description: "Designed to break compulsive phone checking, doomscrolling loops, and cultivate deep uninterrupted concentration.",
    voiceName: "Fenrir",
    recommendedNoise: "pink",
    recommendedBrainwave: "alpha_relax",
    voiceLowPassHz: 2400,
    subliminalAttenuationDb: -24,
    intervalRestSec: 5,
    masterLowPassHz: 4000,
    phrases: [
      "Mindless scrolling gives way to deep, sustained creative focus.",
      "You are immune to cheap algorithmic dopamine traps.",
      "Your attention span expands into calm, single-pointed power.",
      "Silence and stillness feel rich, rewarding, and deeply grounding.",
      "You choose meaningful creation over passive consumption.",
      "The urge to check devices passes in seconds without action.",
      "Your mind is a sanctuary of clarity, focus, and purposeful drive."
    ]
  },
  {
    id: "cortisol_anxiety_release",
    title: "Cortisol Dissolution & Nervous System Reset",
    category: "Stress & Anxiety",
    description: "Gentle acoustic softening designed to down-regulate the sympathetic nervous system and induce parasympathetic calm.",
    voiceName: "Aoede",
    recommendedNoise: "ocean",
    recommendedBrainwave: "solfeggio_528",
    voiceLowPassHz: 1800,
    subliminalAttenuationDb: -30,
    intervalRestSec: 7,
    masterLowPassHz: 3000,
    phrases: [
      "The muscles in your shoulders, jaw, and brow soften completely.",
      "Adrenaline drains away, replaced by soothing warmth.",
      "You are fundamentally safe in this present moment.",
      "Whatever needs to be solved can wait until morning.",
      "Every exhale releases old tension and tightness from your chest.",
      "Peace surrounds your thoughts like a gentle shield.",
      "You trust your body to repair, recharge, and renew itself tonight."
    ]
  },
  {
    id: "athletic_physical_drive",
    title: "Physical Mastery & Unstoppable Willpower",
    category: "Athletic & Mindset",
    description: "Internal reinforcement for physical grit, morning discipline, and mental toughness under deep noise conditioning.",
    voiceName: "Zephyr",
    recommendedNoise: "rain",
    recommendedBrainwave: "solfeggio_432",
    voiceLowPassHz: 2500,
    subliminalAttenuationDb: -22,
    intervalRestSec: 4,
    masterLowPassHz: 4200,
    phrases: [
      "Physical discipline is your second nature.",
      "When fatigue suggests stopping, your resolve grows sharper.",
      "Your body recovers faster and builds stronger every day.",
      "You embrace effort as the catalyst for transformation.",
      "Energy flows abundantly whenever demand arises.",
      "You show up with consistency, poise, and relentless execution."
    ]
  },
  {
    id: "green_forest_tranquility",
    title: "Forest Sanctuary & Natural Nervous Equilibrium",
    category: "Stress & Anxiety",
    description: "Centering 500-2200 Hz green noise imitating ambient forest foliage, grounding the spirit into quiet balance.",
    voiceName: "Kore",
    recommendedNoise: "green",
    recommendedBrainwave: "theta_meditation",
    voiceLowPassHz: 2100,
    subliminalAttenuationDb: -26,
    intervalRestSec: 6,
    masterLowPassHz: 3300,
    phrases: [
      "You are anchored in the calm rhythm of the natural world.",
      "Thoughts settle like leaves falling gently to forest earth.",
      "Your breathing slows into effortless harmony.",
      "Stress dissolves in the quiet presence of nature.",
      "You release all artificial urgency and rest deeply.",
      "Every breath fills you with grounded organic peace."
    ]
  },
  {
    id: "blue_noise_deep_work",
    title: "Deep Cognitive Flow & High-Frequency Clarity",
    category: "Focus & Productivity",
    description: "Crisp +3 dB/octave blue noise mask designed to sharpen intellectual acuity, analytical speed, and mental stamina.",
    voiceName: "Charon",
    recommendedNoise: "blue",
    recommendedBrainwave: "alpha_relax",
    voiceLowPassHz: 2600,
    subliminalAttenuationDb: -22,
    intervalRestSec: 4,
    masterLowPassHz: 4500,
    phrases: [
      "Your mind cuts through complex tasks with effortless clarity.",
      "Distractions vanish outside your sphere of concentration.",
      "You think with pristine logic, depth, and precision.",
      "Creative solutions emerge rapidly and spontaneously.",
      "Your mental endurance sustains unbroken focus for hours.",
      "You enjoy the sensation of pure productive momentum."
    ]
  },
  {
    id: "black_void_hypnagogic",
    title: "Cosmic Void & Sub-Audible Theta Trance",
    category: "Sleep & Recovery",
    description: "Sub-100 Hz black noise sub-bass bed for profound sensory quietude, removing all high frequencies for heavy sleep.",
    voiceName: "Fenrir",
    recommendedNoise: "black",
    recommendedBrainwave: "delta_sleep",
    voiceLowPassHz: 1900,
    subliminalAttenuationDb: -28,
    intervalRestSec: 7,
    masterLowPassHz: 2800,
    phrases: [
      "You sink into the warm, infinite stillness of the night.",
      "All weight leaves your body as you float in deep peace.",
      "The conscious mind lets go completely into restful silence.",
      "Restorative sleep heals every system within you.",
      "You are cocooned in safety, silence, and serenity.",
      "Surrender into the deep, rejuvenating abyss of restorative rest."
    ]
  },
  {
    id: "dmt_pineal_activation",
    title: "Pineal Gland Resonance & DMT Hyper-Synchrony",
    category: "Spiritual & Consciousness",
    description: "Endogenous pineal 963 Hz crown carrier entrained with 40 Hz gamma flash and cosmic black noise bed for profound transcendent awareness.",
    voiceName: "Zephyr",
    recommendedNoise: "black",
    recommendedBrainwave: "dmt_963_40",
    voiceLowPassHz: 2100,
    subliminalAttenuationDb: -26,
    intervalRestSec: 6,
    masterLowPassHz: 3200,
    phrases: [
      "Your third eye awakens into pristine inner light and clarity.",
      "The pineal gland resonates with cosmic harmonic intelligence.",
      "You perceive the sacred interconnected geometry of existence.",
      "Ego boundaries dissolve into pure peaceful awareness.",
      "You are a timeless conscious observer connected to all that is.",
      "Deep intuitive wisdom flows effortlessly into your thoughts.",
      "Higher frequency insights illuminate your path with absolute peace."
    ]
  },
  {
    id: "schumann_lucid_astral",
    title: "Schumann Resonance 7.83 Hz Lucid Gateway",
    category: "Spiritual & Consciousness",
    description: "Earth ionosphere 7.83 Hz electromagnetic pulse tuned with 256 Hz harmonic carrier for lucid dreaming and conscious out-of-body stillness.",
    voiceName: "Aoede",
    recommendedNoise: "ocean",
    recommendedBrainwave: "theta_schumann",
    voiceLowPassHz: 2200,
    subliminalAttenuationDb: -28,
    intervalRestSec: 5,
    masterLowPassHz: 3400,
    phrases: [
      "Your consciousness remains awake, centered, and fully lucid.",
      "You recognize when you are dreaming with effortless clarity.",
      "The body sleeps peacefully while the mind remains illuminated.",
      "You navigate inner dreamscapes with serene intention and control.",
      "Earth natural frequencies anchor your spirit in deep tranquility.",
      "Every night brings profound self-discovery and restful renewal."
    ]
  }
];
