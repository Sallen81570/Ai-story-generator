import { VoiceName, NoiseType } from "../types";

export type WhisperPersonaId =
  | "calm_narrator"
  | "binaural_whisperer"
  | "energetic_affirmator"
  | "hypnotic_somnambulist"
  | "sacred_sage"
  | "warm_compassion"
  | "gentle_zen"
  | "cinematic_deep";

export interface WhisperPersona {
  id: WhisperPersonaId;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  defaultVoice: VoiceName;
  promptDirective: string;
  energyLevel: "Trance" | "Ultra-Soft" | "Gentle" | "Balanced" | "Empowered";
  recommendedNoise: NoiseType;
  recommendedBrainwave: string;
  recommendedAttenuationDb: number;
  tags: string[];
}

export const WHISPER_PERSONAS: WhisperPersona[] = [
  {
    id: "calm_narrator",
    name: "Calm Narrator",
    tagline: "Grounding, steady bedtime storytelling",
    description: "A soothing, articulate, and relaxed narrative cadence. Perfect for reading classical literature, bedtime adventures, and philosophical chapters with effortless poise.",
    badge: "Storyteller",
    defaultVoice: "Aoede",
    promptDirective: "Speak as a gentle, grounded storyteller in a calm, soothing, steady, and articulately paced cadence: ",
    energyLevel: "Balanced",
    recommendedNoise: "brown",
    recommendedBrainwave: "theta_schumann",
    recommendedAttenuationDb: -24,
    tags: ["Bedtime Books", "Literature", "Stoic Reflection", "Classic Tone"],
  },
  {
    id: "binaural_whisperer",
    name: "Binaural Whisperer",
    tagline: "Close-mic ASMR & intimate subconscious whisper",
    description: "An ultra-soft, breathy, close-mic ear-to-ear ASMR whisper. Designed specifically for headphone immersion, triggering deep tingles and rapid hypnotic relaxation.",
    badge: "ASMR Subconscious",
    defaultVoice: "Zephyr",
    promptDirective: "Speak in an extremely close-mic, intimate, ultra-soft ASMR breathy whisper, with gentle pauses and hypnotic softness: ",
    energyLevel: "Ultra-Soft",
    recommendedNoise: "pink",
    recommendedBrainwave: "theta_lucid_5_5",
    recommendedAttenuationDb: -28,
    tags: ["ASMR", "Headphone Immersion", "Subconscious Infiltration", "Breathy"],
  },
  {
    id: "energetic_affirmator",
    name: "Energetic Affirmator",
    tagline: "Uplifting, confident, and rhythmic empowerment",
    description: "A rhythmic, motivating, and articulate cadence full of conviction and inner power. Ideal for morning priming, identity conditioning, workouts, and manifestation.",
    badge: "Empowerment",
    defaultVoice: "Puck",
    promptDirective: "Speak in an uplifting, confident, inspiring, articulate, and rhythmic empowering cadence with positive momentum and vitality: ",
    energyLevel: "Empowered",
    recommendedNoise: "white",
    recommendedBrainwave: "gamma_40",
    recommendedAttenuationDb: -18,
    tags: ["Morning Priming", "Confidence", "Peak Focus", "Manifestation"],
  },
  {
    id: "hypnotic_somnambulist",
    name: "Hypnotic Somnambulist",
    tagline: "Deep sleep induction & heavy trance pacing",
    description: "A slow, heavy-lidded, drowsy sleep trance delivery. Prolongs soothing vowel tones and inserts deep calming pauses to slow racing brainwaves down into Delta somnolence.",
    badge: "Sleep Trance",
    defaultVoice: "Charon",
    promptDirective: "Speak in a drowsy, deeply relaxed, slow hypnotic sleep-induction cadence, drawing out calming vowel sounds with prolonged pauses: ",
    energyLevel: "Trance",
    recommendedNoise: "black",
    recommendedBrainwave: "delta_deep_sleep_1_5",
    recommendedAttenuationDb: -30,
    tags: ["Insomnia Relief", "Delta Sleep", "Hypnotherapy", "Drowsy"],
  },
  {
    id: "sacred_sage",
    name: "Sacred Sage & Mystic",
    tagline: "Reverent, spacious cosmic awareness",
    description: "A spacious, resonant, and meditative tone imbued with timeless serenity. Engineered for DMT pineal activation, chakra alignment, and transcendent spiritual contemplation.",
    badge: "DMT Pineal",
    defaultVoice: "Fenrir",
    promptDirective: "Speak with reverent, spacious, meditative serenity and timeless wisdom, like an ancient spiritual master reciting sacred truths: ",
    energyLevel: "Gentle",
    recommendedNoise: "blue",
    recommendedBrainwave: "dmt_963_40",
    recommendedAttenuationDb: -26,
    tags: ["Pineal Activation", "Cosmic Wisdom", "Third Eye", "Spiritual"],
  },
  {
    id: "warm_compassion",
    name: "Warm Compassionate Guide",
    tagline: "Nurturing, heart-centered unconditional calm",
    description: "Infused with emotional warmth, profound acceptance, and empathetic tenderness. Melts away anxiety, self-criticism, and somatic tension with gentle reassurance.",
    badge: "Healing Heart",
    defaultVoice: "Kore",
    promptDirective: "Speak with deep emotional warmth, unconditional kindness, soothing comfort, and maternal/paternal reassurance: ",
    energyLevel: "Gentle",
    recommendedNoise: "green",
    recommendedBrainwave: "solfeggio_528_dna",
    recommendedAttenuationDb: -25,
    tags: ["Anxiety Release", "Self-Love", "Nervous System Reset", "Heart Space"],
  },
  {
    id: "gentle_zen",
    name: "Gentle Zen Master",
    tagline: "Minimalist, unhurried, breath-synchronized presence",
    description: "A clean, peaceful, unhurried monastic cadence emphasizing present-moment mindfulness, stillness, and breath awareness.",
    badge: "Mindfulness",
    defaultVoice: "Aoede",
    promptDirective: "Speak in a clean, tranquil, minimalist, and unhurried Zen cadence with natural breathing spaces: ",
    energyLevel: "Gentle",
    recommendedNoise: "grey",
    recommendedBrainwave: "alpha_flow_10",
    recommendedAttenuationDb: -26,
    tags: ["Vipassana", "Breathwork", "Stillness", "Zen"],
  },
  {
    id: "cinematic_deep",
    name: "Cinematic Deep Voice",
    tagline: "Resonant, epic, and grounding baritone",
    description: "A rich, deep, cinematic baritone delivery that anchors the physical body into deep stability and grounded mental fortress fortitude.",
    badge: "Epic Fortress",
    defaultVoice: "Fenrir",
    promptDirective: "Speak in a deep, cinematic, rich baritone, steady, commanding, yet profoundly relaxing and grounding: ",
    energyLevel: "Balanced",
    recommendedNoise: "brown",
    recommendedBrainwave: "delta_growth_2_5",
    recommendedAttenuationDb: -24,
    tags: ["Deep Baritone", "Fortitude", "Grounded Presence", "Cinematic"],
  },
];

export function resolveWhisperPersona(id: string): WhisperPersona {
  return WHISPER_PERSONAS.find((p) => p.id === id) || WHISPER_PERSONAS[0];
}
