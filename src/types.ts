export type VoiceName = "Kore" | "Fenrir" | "Puck" | "Charon" | "Aoede" | "Zephyr";

export type NoiseType =
  | "brown"
  | "pink"
  | "white"
  | "blue"
  | "violet"
  | "grey"
  | "green"
  | "black"
  | "ocean"
  | "rain";

export type BrainwaveType = string;

export type BinauralCategory =
  | "all"
  | "dmt_sacred"
  | "delta"
  | "theta"
  | "alpha"
  | "beta"
  | "gamma"
  | "epsilon_lambda"
  | "solfeggio"
  | "custom";

export interface BinauralBeatDefinition {
  id: string;
  name: string;
  category: "dmt_sacred" | "delta" | "theta" | "alpha" | "beta" | "gamma" | "epsilon_lambda" | "solfeggio" | "custom";
  baseFreq: number; // Carrier Hz (e.g. 963, 432, 528, 108, 160, 220)
  beatFreq: number; // Binaural beat / pulse offset Hz (e.g. 40, 33, 7.83, 5.5, 2.5, 0)
  waveform?: "sine" | "triangle";
  badge: string; // e.g. "963Hz + 40Hz Gamma", "2.5Hz Delta", "528Hz Solfeggio"
  description: string;
  targetState: string;
  isDmt?: boolean;
  isCustom?: boolean;
  createdAt?: number;
}

export interface AffirmationItem {
  id: string;
  text: string;
  audioBase64?: string;
  audioDuration?: number; // in seconds
  status: "idle" | "synthesizing" | "ready" | "error";
  errorMessage?: string;
}

export interface PresetProgram {
  id: string;
  title: string;
  category: string;
  description: string;
  voiceName: VoiceName;
  recommendedNoise: NoiseType;
  recommendedBrainwave: BrainwaveType;
  voiceLowPassHz: number;
  subliminalAttenuationDb: number;
  intervalRestSec: number;
  masterLowPassHz: number;
  phrases: string[];
}

export interface AudioMixerState {
  isPlaying: boolean;
  masterVolume: number; // 0 to 1
  
  // Voice channel
  voiceVolume: number; // 0 to 1
  voiceMute: boolean;
  voiceSoloTest: boolean; // if true, temporarily plays voice at normal audible level without noise to inspect speech
  voiceLowPassHz: number; // e.g. 2200 Hz
  subliminalAttenuationDb: number; // e.g. -26 dB
  intervalRestSec: number; // e.g. 6 sec
  
  // Noise bed channel
  noiseType: NoiseType;
  noiseVolume: number; // 0 to 1
  noiseMute: boolean;
  
  // Brainwave channel
  brainwaveType: BrainwaveType;
  brainwaveVolume: number; // 0 to 1
  brainwaveMute: boolean;
  
  // Master tone
  masterLowPassHz: number; // e.g. 3500 Hz
  
  // Active state
  currentPhraseIndex: number;
  sleepTimerMinutes: number | null; // null or number
  sleepTimerRemainingSec: number | null;
}

export interface ExportSettings {
  targetMinutes: number; // 5, 15, 30, 60
  sampleRate: number; // 44100
  format: "wav";
}

export interface ExportProgress {
  isExporting: boolean;
  progressPercent: number;
  statusMessage: string;
  downloadUrl: string | null;
  downloadFilename: string | null;
}

export type PhaseType = "lock" | "audio_layers" | "tracker" | "wake";

export interface ProtocolPhase {
  id: string;
  number: number;
  title: string;
  type: PhaseType;
  enabled: boolean;
  timeWindow?: {
    start: string; // e.g. "05:00"
    end: string;   // e.g. "17:00"
  };
  config: {
    // Phase 1: Lock parameters
    lockManualOverride?: boolean;
    muteNotifications?: boolean;
    screenDimPercent?: number;
    logSessionStart?: boolean;
    startFuelGallons?: number;
    startLocation?: string;

    // Phase 2: Audio Layers
    layerNames?: string[];
    selectedPresetId?: string;

    // Phase 3: Mileage Tracker
    intervalMinutes?: number;
    startOdometer?: number;
    currentOdometer?: number;
    milesDrivenSession?: number;
    totalHistoricalMiles?: number;
    fuelRemainingGallons?: number;

    // Phase 4: Wake Trigger
    wakeConditionTime?: string;
    wakePromptText?: string;
    screenRestorePercent?: number;
    wakeVoice?: VoiceName;
    unlockManualControl?: boolean;
  };
}

export interface BunkProtocol {
  id: string;
  name: string;
  targetUser: string;
  operator: string;
  guardian: string;
  active: boolean;
  sessionActive: boolean;
  sessionStartTime?: string;
  phases: ProtocolPhase[];
}

export type StorySourceType = "pdf" | "epub" | "txt" | "pasted" | "preset";

export interface StoryVoiceCharacter {
  id: string;
  name: string;
  role: "narrator" | "protagonist" | "sage" | "inner_voice" | "companion" | "elder" | "ethereal" | "custom";
  description: string;
  voiceName: VoiceName;
  personaId?: WhisperPersonaId;
  customDirective: string;
  colorTag: "amber" | "purple" | "emerald" | "rose" | "cyan" | "indigo" | "orange" | "blue";
  avatarIcon: string;
  paragraphIndices?: number[];
}

export interface StoryParagraph {
  id: string;
  index: number;
  text: string;
  wordCount: number;
  status: "idle" | "caching" | "cached" | "playing" | "error";
  audioBase64?: string;
  audioDuration?: number;
  errorMessage?: string;
  characterId?: string;
  speakerName?: string;
  voiceOverride?: VoiceName;
  customDirectiveOverride?: string;
  scenePrompt?: string;
  sceneImageUrl?: string;
  sceneMood?: string;
  sceneCameraMotion?: "pan_left" | "pan_right" | "zoom_in" | "zoom_out" | "floating_tilt";
}

export interface StoryBibleChapter {
  chapterIndex: number;
  title: string;
  stage: "induction_relaxation" | "whisper_deepening" | "subconscious_reprogramming" | "all_night_delta_regeneration";
  targetBrainwave: "alpha_10hz" | "theta_6hz" | "delta_2hz" | "sub_delta_0_5hz";
  synopsis: string;
  sensoryAtmosphere: string;
  subliminalDirectives: string[];
}

export interface StoryBible {
  id: string;
  title: string;
  theme: string;
  targetFocus: string; // e.g. "Deep sleep conditioning, releasing stress, high self-worth"
  loreOverview: string;
  visualAtmosphere: string;
  soundscapeRecommendation: {
    noiseType: NoiseType;
    brainwaveType: BrainwaveType;
    recommendedRampMinutes: number;
  };
  cast: StoryVoiceCharacter[];
  chapters: StoryBibleChapter[];
  subconsciousAffirmationsEmbedded: string[];
  createdAt: number;
}

export interface SleepConditioningRampConfig {
  enabled: boolean;
  rampDurationMinutes: number; // e.g., 20, 30, 45 minutes from audible (0 dB) down to subliminal (-26 dB)
  initialVoiceVolumeDb: number; // 0 dB (clear voice)
  targetSubliminalDb: number; // -24 dB to -28 dB (masked beneath noise bed)
  transitionBrainwave: boolean; // Auto shift Alpha (10 Hz) -> Theta (6 Hz) -> Delta (1.5 Hz)
  allNightLoopMode: boolean; // Keep noise bed & subliminal story affirmations looping all night
  sessionStartTimestamp?: number;
}

export interface StoryDocument {
  id: string;
  title: string;
  author?: string;
  sourceType: StorySourceType;
  fileName?: string;
  totalWords: number;
  paragraphs: StoryParagraph[];
  characters?: StoryVoiceCharacter[];
  isMultiCharacterEnabled?: boolean;
  storyBible?: StoryBible;
  sleepRampConfig?: SleepConditioningRampConfig;
  visualStoryboardGenerated?: boolean;
  videoPlaybackMode?: "night_subliminal" | "day_audible";
  createdAt: number;
  currentParagraphIndex: number;
}

export type WhisperPersonaId =
  | "calm_narrator"
  | "binaural_whisperer"
  | "energetic_affirmator"
  | "hypnotic_somnambulist"
  | "sacred_sage"
  | "warm_compassion"
  | "gentle_zen"
  | "cinematic_deep";

export interface LookaheadCacheSettings {
  lookaheadAheadCount: number; // e.g. 2 or 3 paragraphs pre-buffered ahead
  autoPreFetchNext: boolean;
  cacheVoice: VoiceName;
  personaId: WhisperPersonaId;
  promptStyle: string;
  paragraphRestSec: number; // pause between paragraphs (e.g. 4-6 sec)
}

export interface StoryCacheStats {
  totalParagraphs: number;
  cachedParagraphs: number;
  cachingInProgress: boolean;
  currentPlayingIndex: number;
  lookaheadReady: boolean;
}


