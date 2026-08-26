import React, { useState, useEffect } from "react";
import {
  AudioMixerState,
  VoiceName,
  NoiseType,
  BrainwaveType,
  BinauralBeatDefinition,
} from "../types";
import {
  getAllBinauralBeats,
  loadCustomBeats,
  deleteCustomBeat,
  resolveBinauralBeat,
} from "../data/binauralBeats";
import { CustomFrequencyModal } from "./CustomFrequencyModal";
import {
  Mic,
  Wind,
  Activity,
  Sliders,
  Volume2,
  VolumeX,
  Headphones,
  HelpCircle,
  Zap,
  Waves,
  Shield,
  Layers,
  Plus,
  Trash2,
  Atom,
  Radio,
  Search,
  Sparkles,
} from "lucide-react";

interface MixerConsoleProps {
  mixerState: AudioMixerState;
  onUpdateMixer: (updates: Partial<AudioMixerState>) => void;
  selectedVoice: VoiceName;
  onChangeVoice: (voice: VoiceName) => void;
}

export const MixerConsole: React.FC<MixerConsoleProps> = ({
  mixerState,
  onUpdateMixer,
  selectedVoice,
  onChangeVoice,
}) => {
  const [noiseFilter, setNoiseFilter] = useState<"all" | "colored" | "natural">("all");

  // Brainwave & DMT state
  const [customBeats, setCustomBeats] = useState<BinauralBeatDefinition[]>(() => loadCustomBeats());
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customModalMode, setCustomModalMode] = useState<"binaural" | "dmt">("binaural");
  const [brainwaveCategoryFilter, setBrainwaveCategoryFilter] = useState<
    "all" | "dmt_sacred" | "delta_theta" | "focus_gamma" | "solfeggio" | "custom"
  >("all");
  const [brainwaveSearchQuery, setBrainwaveSearchQuery] = useState("");

  const handleFrequencyCreated = (newBeat: BinauralBeatDefinition) => {
    setCustomBeats(loadCustomBeats());
    onUpdateMixer({ brainwaveType: newBeat.id });
  };

  const handleDeleteCustomBeat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = deleteCustomBeat(id);
    setCustomBeats(updated);
    if (mixerState.brainwaveType === id) {
      onUpdateMixer({ brainwaveType: "delta_sleep" });
    }
  };

  const allFrequencies = getAllBinauralBeats(customBeats);

  const filteredFrequencies = allFrequencies.filter((b) => {
    // Search query filter
    if (brainwaveSearchQuery.trim()) {
      const q = brainwaveSearchQuery.toLowerCase();
      const matchText = `${b.name} ${b.badge} ${b.description} ${b.targetState} ${b.baseFreq} ${b.beatFreq}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    // Category filter
    if (brainwaveCategoryFilter === "all") return true;
    if (brainwaveCategoryFilter === "dmt_sacred") return b.category === "dmt_sacred" || b.isDmt;
    if (brainwaveCategoryFilter === "delta_theta")
      return b.category === "delta" || b.category === "theta" || b.category === "epsilon_lambda";
    if (brainwaveCategoryFilter === "focus_gamma")
      return b.category === "alpha" || b.category === "beta" || b.category === "gamma";
    if (brainwaveCategoryFilter === "solfeggio") return b.category === "solfeggio";
    if (brainwaveCategoryFilter === "custom") return b.isCustom;
    return true;
  });

  const voices: { id: VoiceName; label: string; desc: string }[] = [
    { id: "Kore", label: "Kore", desc: "Gentle feminine whisper (Recommended for sleep)" },
    { id: "Fenrir", label: "Fenrir", desc: "Warm deep masculine cadence" },
    { id: "Puck", label: "Puck", desc: "Soft youthful tranquil tone" },
    { id: "Charon", label: "Charon", desc: "Low resonant grounding whisper" },
    { id: "Aoede", label: "Aoede", desc: "Silky melodic restorative voice" },
    { id: "Zephyr", label: "Zephyr", desc: "Airy, soft-spoken ethereal delivery" },
  ];

  const noiseBeds: {
    id: NoiseType;
    label: string;
    desc: string;
    icon: string;
    category: "colored" | "natural";
    badge: string;
  }[] = [
    {
      id: "brown",
      label: "Deep Brown Noise",
      desc: "-6 dB/oct Brownian curve • Warm low-end rumble",
      icon: "🌋",
      category: "colored",
      badge: "Brownian 1/f²",
    },
    {
      id: "pink",
      label: "Pink Noise",
      desc: "-3 dB/oct 1/f curve • Equal energy per octave",
      icon: "🌸",
      category: "colored",
      badge: "Pink 1/f",
    },
    {
      id: "white",
      label: "White Noise",
      desc: "0 dB/oct flat spectrum • Full frequency masking",
      icon: "⚡",
      category: "colored",
      badge: "Flat 0dB",
    },
    {
      id: "blue",
      label: "Blue Noise",
      desc: "+3 dB/oct slope • High-frequency clarity & focus",
      icon: "🔷",
      category: "colored",
      badge: "Azure +3dB",
    },
    {
      id: "violet",
      label: "Violet / Purple",
      desc: "+6 dB/oct slope • Crisp treble & tinnitus mask",
      icon: "🔮",
      category: "colored",
      badge: "Violet +6dB",
    },
    {
      id: "grey",
      label: "Grey Noise",
      desc: "Inverted Equal-Loudness • Perceptually flat volume",
      icon: "🔘",
      category: "colored",
      badge: "Psychoacoustic",
    },
    {
      id: "green",
      label: "Green Noise",
      desc: "500–2200 Hz natural mid-range • Forest foliage",
      icon: "🍃",
      category: "colored",
      badge: "Mid-Band",
    },
    {
      id: "black",
      label: "Black Noise",
      desc: "<100 Hz sub-bass • Deep cosmic infra-rumble",
      icon: "🌌",
      category: "colored",
      badge: "Sub-Audible",
    },
    {
      id: "ocean",
      label: "Ocean Tides",
      desc: "Dynamic swelling surf • Coastal wave cycles",
      icon: "🌊",
      category: "natural",
      badge: "Nature Bed",
    },
    {
      id: "rain",
      label: "Gentle Rainstorm",
      desc: "Soft rhythmic droplets • Calming precipitation",
      icon: "🌧️",
      category: "natural",
      badge: "Nature Bed",
    },
  ];

  const brainwaves: { id: BrainwaveType; label: string; desc: string; hz: string }[] = [
    { id: "delta_sleep", label: "Delta Waves", desc: "Deep sleep, SWS, cellular repair", hz: "2.5 Hz" },
    { id: "theta_meditation", label: "Theta Waves", desc: "Hypnagogic state & suggestibility", hz: "5.5 Hz" },
    { id: "alpha_relax", label: "Alpha Waves", desc: "Calm alert presence & stress relief", hz: "10.0 Hz" },
    { id: "solfeggio_528", label: "528 Hz Solfeggio", desc: "Harmonic restorative tone", hz: "528 Hz" },
    { id: "solfeggio_432", label: "432 Hz Natural", desc: "Acoustic grounding frequency", hz: "432 Hz" },
    { id: "none", label: "Disabled", desc: "Voice + Noise bed only", hz: "Off" },
  ];

  // Helper for Attenuation Level descriptor
  const getAttenuationLabel = (db: number) => {
    if (db >= -6) return { text: "Audible Speech", color: "text-red-400" };
    if (db >= -18) return { text: "Soft Whisper", color: "text-amber-400" };
    if (db >= -30) return { text: "Subliminal (Optimal)", color: "text-emerald-400" };
    return { text: "Deep Subconscious", color: "text-purple-400" };
  };

  const attenuationInfo = getAttenuationLabel(mixerState.subliminalAttenuationDb);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* CHANNEL 1: Subliminal AI Voice Strip */}
      <div className="rounded-2xl bg-stone-900/70 border border-stone-800 p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
        {mixerState.voiceSoloTest && (
          <div className="absolute top-0 left-0 right-0 bg-amber-500 text-stone-950 text-[11px] font-semibold py-0.5 text-center tracking-wide z-10">
            AUDITION MODE: Noise muted, Voice audible (0 dB)
          </div>
        )}

        <div>
          {/* Channel Header */}
          <div className="flex items-center justify-between mb-4 mt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-stone-100 font-semibold text-sm">Ch 1: Subliminal Voice</h2>
                <p className="text-stone-400 text-xs">Gemini AI Whispered TTS</p>
              </div>
            </div>

            {/* Mute & Solo Audition Button */}
            <div className="flex items-center gap-1.5">
              <button
                id="voice-solo-test-btn"
                onClick={() => onUpdateMixer({ voiceSoloTest: !mixerState.voiceSoloTest })}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                  mixerState.voiceSoloTest
                    ? "bg-amber-400 text-stone-950 shadow-md shadow-amber-500/30"
                    : "bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700"
                }`}
                title="Hear raw un-masked whisper to verify script phrases"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{mixerState.voiceSoloTest ? "Solo On" : "Solo"}</span>
              </button>

              <button
                id="voice-mute-btn"
                onClick={() => onUpdateMixer({ voiceMute: !mixerState.voiceMute })}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  mixerState.voiceMute
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-stone-800 text-stone-400 hover:text-stone-200"
                }`}
                title={mixerState.voiceMute ? "Unmute Voice" : "Mute Voice"}
              >
                {mixerState.voiceMute ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Voice Model Selector */}
          <div className="mb-4">
            <label className="block text-stone-300 text-xs font-medium mb-1.5 flex items-center justify-between">
              <span>Gemini Voice Actor</span>
              <span className="text-[11px] text-amber-400/90 font-mono">{selectedVoice}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {voices.map((v) => (
                <button
                  key={v.id}
                  id={`voice-select-${v.id}`}
                  onClick={() => onChangeVoice(v.id)}
                  className={`p-2 rounded-xl text-left border text-xs transition-all ${
                    selectedVoice === v.id
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
                      : "bg-stone-950/60 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:border-stone-700"
                  }`}
                >
                  <div className="font-semibold">{v.label}</div>
                  <div className="text-[10px] text-stone-400 truncate mt-0.5">{v.desc.split(" ")[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Subliminal Masking Attenuation Slider (-40dB to 0dB) */}
          <div className="mb-4 bg-stone-950/60 border border-stone-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-stone-300 text-xs font-medium flex items-center gap-1">
                <Shield className="w-3 h-3 text-amber-400" />
                Subliminal Attenuation
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-semibold ${attenuationInfo.color}`}>
                  {attenuationInfo.text}
                </span>
                <span className="text-xs font-mono text-stone-200">
                  {mixerState.subliminalAttenuationDb} dB
                </span>
              </div>
            </div>
            <input
              id="subliminal-attenuation-slider"
              type="range"
              min="-40"
              max="0"
              step="1"
              value={mixerState.subliminalAttenuationDb}
              onChange={(e) =>
                onUpdateMixer({ subliminalAttenuationDb: parseInt(e.target.value, 10) })
              }
              className="w-full accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
              <span>-40dB (Deep Sub)</span>
              <span className="text-amber-400 font-bold">-26dB (Recommended)</span>
              <span>0dB (Audible)</span>
            </div>
          </div>

          {/* Acoustic Softening: Low-Pass Filter */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-stone-300 font-medium">
                Voice Low-Pass Filter (Sibilance Cut)
              </span>
              <span className="font-mono text-stone-300">{mixerState.voiceLowPassHz} Hz</span>
            </div>
            <input
              id="voice-lowpass-slider"
              type="range"
              min="800"
              max="6000"
              step="50"
              value={mixerState.voiceLowPassHz}
              onChange={(e) =>
                onUpdateMixer({ voiceLowPassHz: parseInt(e.target.value, 10) })
              }
              className="w-full accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Eliminates harsh consonants (S, T, K) at 2200Hz that interrupt delta sleep.
            </p>
          </div>

          {/* Interval Rest Between Affirmations */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-stone-300 font-medium">Rhythm Gap Between Lines</span>
              <span className="font-mono text-stone-300">{mixerState.intervalRestSec}s rest</span>
            </div>
            <input
              id="interval-rest-slider"
              type="range"
              min="2"
              max="15"
              step="1"
              value={mixerState.intervalRestSec}
              onChange={(e) =>
                onUpdateMixer({ intervalRestSec: parseInt(e.target.value, 10) })
              }
              className="w-full accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Voice Channel Level */}
        <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center gap-3">
          <span className="text-xs text-stone-400 font-mono w-16">Gain:</span>
          <input
            id="voice-gain-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={mixerState.voiceVolume}
            onChange={(e) => onUpdateMixer({ voiceVolume: parseFloat(e.target.value) })}
            className="flex-1 accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono text-stone-300 w-10 text-right">
            {Math.round(mixerState.voiceVolume * 100)}%
          </span>
        </div>
      </div>

      {/* CHANNEL 2: Acoustic Noise Bed Strip */}
      <div className="rounded-2xl bg-stone-900/70 border border-stone-800 p-5 flex flex-col justify-between shadow-lg">
        <div>
          {/* Channel Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-stone-100 font-semibold text-sm">Ch 2: Noise Bed</h2>
                <p className="text-stone-400 text-xs">Psychoacoustic Masking Carrier</p>
              </div>
            </div>

            {/* Mute Button */}
            <button
              id="noise-mute-btn"
              onClick={() => onUpdateMixer({ noiseMute: !mixerState.noiseMute })}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                mixerState.noiseMute
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-stone-800 text-stone-400 hover:text-stone-200"
              }`}
              title={mixerState.noiseMute ? "Unmute Noise Bed" : "Mute Noise Bed"}
            >
              {mixerState.noiseMute ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Noise Category Filter Tabs */}
          <div className="flex items-center gap-1.5 mb-2.5 bg-stone-950/80 p-1 rounded-xl border border-stone-800/80">
            <button
              onClick={() => setNoiseFilter("all")}
              className={`flex-1 py-1 text-[11px] font-medium rounded-lg transition-all ${
                noiseFilter === "all"
                  ? "bg-orange-500/20 text-orange-200 border border-orange-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              All Beds (10)
            </button>
            <button
              onClick={() => setNoiseFilter("colored")}
              className={`flex-1 py-1 text-[11px] font-medium rounded-lg transition-all ${
                noiseFilter === "colored"
                  ? "bg-orange-500/20 text-orange-200 border border-orange-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Colored Noises (8)
            </button>
            <button
              onClick={() => setNoiseFilter("natural")}
              className={`flex-1 py-1 text-[11px] font-medium rounded-lg transition-all ${
                noiseFilter === "natural"
                  ? "bg-orange-500/20 text-orange-200 border border-orange-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Nature (2)
            </button>
          </div>

          {/* Noise Type Selection (Scrollable List) */}
          <div className="space-y-1.5 mb-4 max-h-72 overflow-y-auto pr-1">
            {noiseBeds
              .filter((n) => noiseFilter === "all" || n.category === noiseFilter)
              .map((n) => {
                const active = mixerState.noiseType === n.id;
                return (
                  <button
                    key={n.id}
                    id={`noise-select-${n.id}`}
                    onClick={() => onUpdateMixer({ noiseType: n.id })}
                    className={`w-full p-2 rounded-xl text-left border flex items-center justify-between transition-all ${
                      active
                        ? "bg-orange-500/15 border-orange-500/40 text-orange-100 shadow-sm"
                        : "bg-stone-950/60 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{n.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                          <span className="truncate">{n.label}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-900 border border-stone-800 text-orange-400/90 shrink-0">
                            {n.badge}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 truncate">{n.desc}</div>
                      </div>
                    </div>
                    {active && (
                      <div className="w-2 h-2 rounded-full bg-orange-400 shadow-sm shadow-orange-400/50 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
          </div>

          {/* Master Spectrum Smoothing (3500 Hz) */}
          <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-stone-300 font-medium">Master Soundscape Low-Pass</span>
              <span className="font-mono text-stone-300">{mixerState.masterLowPassHz} Hz</span>
            </div>
            <input
              id="master-lowpass-slider"
              type="range"
              min="1500"
              max="8000"
              step="100"
              value={mixerState.masterLowPassHz}
              onChange={(e) =>
                onUpdateMixer({ masterLowPassHz: parseInt(e.target.value, 10) })
              }
              className="w-full accent-orange-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Softens overall master high frequencies into an organic bedtime soundscape.
            </p>
          </div>
        </div>

        {/* Noise Channel Level */}
        <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center gap-3">
          <span className="text-xs text-stone-400 font-mono w-16">Gain:</span>
          <input
            id="noise-gain-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={mixerState.noiseVolume}
            onChange={(e) => onUpdateMixer({ noiseVolume: parseFloat(e.target.value) })}
            className="flex-1 accent-orange-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono text-stone-300 w-10 text-right">
            {Math.round(mixerState.noiseVolume * 100)}%
          </span>
        </div>
      </div>

      {/* CHANNEL 3: Brainwave & DMT Pineal Entrainment Strip */}
      <div className="rounded-2xl bg-stone-900/70 border border-stone-800 p-5 flex flex-col justify-between shadow-lg">
        <div>
          {/* Channel Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-stone-100 font-semibold text-sm flex items-center gap-1.5">
                  <span>Ch 3: Binaural & DMT Beats</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {allFrequencies.length} Frequencies
                  </span>
                </h2>
                <p className="text-stone-400 text-xs">Pineal Resonance, Brainwaves & Solfeggio</p>
              </div>
            </div>

            {/* Mute Button */}
            <button
              id="brainwave-mute-btn"
              onClick={() => onUpdateMixer({ brainwaveMute: !mixerState.brainwaveMute })}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                mixerState.brainwaveMute
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-stone-800 text-stone-400 hover:text-stone-200"
              }`}
              title={mixerState.brainwaveMute ? "Unmute Brainwaves" : "Mute Brainwaves"}
            >
              {mixerState.brainwaveMute ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Creation Action Bar */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              id="btn-add-custom-binaural"
              onClick={() => {
                setCustomModalMode("binaural");
                setIsCustomModalOpen(true);
              }}
              className="py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/25 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>+ Add Binaural Beat</span>
            </button>

            <button
              type="button"
              id="btn-add-dmt-freq"
              onClick={() => {
                setCustomModalMode("dmt");
                setIsCustomModalOpen(true);
              }}
              className="py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-200 hover:bg-purple-500/25 transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-purple-900/20"
            >
              <Atom className="w-3.5 h-3.5" />
              <span>+ Add DMT / Pineal</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-2.5">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-500" />
            <input
              type="text"
              value={brainwaveSearchQuery}
              onChange={(e) => setBrainwaveSearchQuery(e.target.value)}
              placeholder="Search frequencies (e.g. 40Hz, Pineal, 528, Theta)..."
              className="w-full pl-8 pr-3 py-1.5 bg-stone-950/80 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-purple-500"
            />
            {brainwaveSearchQuery && (
              <button
                onClick={() => setBrainwaveSearchQuery("")}
                className="absolute right-2.5 top-2 text-[10px] text-stone-500 hover:text-stone-300 font-mono"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 mb-2.5 bg-stone-950/80 p-1 rounded-xl border border-stone-800/80 overflow-x-auto text-[11px]">
            <button
              onClick={() => setBrainwaveCategoryFilter("all")}
              className={`px-2.5 py-1 font-medium rounded-lg whitespace-nowrap transition-all ${
                brainwaveCategoryFilter === "all"
                  ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              All ({allFrequencies.length})
            </button>
            <button
              onClick={() => setBrainwaveCategoryFilter("dmt_sacred")}
              className={`px-2.5 py-1 font-medium rounded-lg whitespace-nowrap transition-all ${
                brainwaveCategoryFilter === "dmt_sacred"
                  ? "bg-purple-500/25 text-purple-200 border border-purple-500/40"
                  : "text-purple-300/80 hover:text-purple-200"
              }`}
            >
              🌌 DMT & Pineal
            </button>
            <button
              onClick={() => setBrainwaveCategoryFilter("delta_theta")}
              className={`px-2.5 py-1 font-medium rounded-lg whitespace-nowrap transition-all ${
                brainwaveCategoryFilter === "delta_theta"
                  ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              🌙 Sleep & Trance
            </button>
            <button
              onClick={() => setBrainwaveCategoryFilter("focus_gamma")}
              className={`px-2.5 py-1 font-medium rounded-lg whitespace-nowrap transition-all ${
                brainwaveCategoryFilter === "focus_gamma"
                  ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              ⚡ Focus & Gamma
            </button>
            <button
              onClick={() => setBrainwaveCategoryFilter("solfeggio")}
              className={`px-2.5 py-1 font-medium rounded-lg whitespace-nowrap transition-all ${
                brainwaveCategoryFilter === "solfeggio"
                  ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              ✨ Solfeggio
            </button>
            <button
              onClick={() => setBrainwaveCategoryFilter("custom")}
              className={`px-2.5 py-1 font-medium rounded-lg whitespace-nowrap transition-all ${
                brainwaveCategoryFilter === "custom"
                  ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              🛠️ Custom ({customBeats.length})
            </button>
          </div>

          {/* Disable Entrainment option */}
          <button
            id="brainwave-select-none"
            onClick={() => onUpdateMixer({ brainwaveType: "none" })}
            className={`w-full mb-2 p-2 rounded-xl text-left border flex items-center justify-between transition-all ${
              mixerState.brainwaveType === "none"
                ? "bg-stone-800/80 border-stone-600 text-stone-200"
                : "bg-stone-950/40 border-stone-800/60 text-stone-500 hover:text-stone-300"
            }`}
          >
            <div className="text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-600" />
              <span>Disable Brainwave Entrainment (Voice + Noise Only)</span>
            </div>
            {mixerState.brainwaveType === "none" && (
              <span className="text-[10px] font-mono uppercase text-stone-400">Active</span>
            )}
          </button>

          {/* Scrollable Frequency List */}
          <div className="space-y-1.5 mb-4 max-h-72 overflow-y-auto pr-1">
            {filteredFrequencies.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-500 bg-stone-950/60 rounded-xl border border-stone-800">
                No frequencies matched your filter. Click "+ Add Custom Beat" or "+ Add DMT / Pineal" above to synthesize one!
              </div>
            ) : (
              filteredFrequencies.map((b) => {
                const active = mixerState.brainwaveType === b.id;
                const isDmt = b.isDmt || b.category === "dmt_sacred";
                return (
                  <button
                    key={b.id}
                    id={`brainwave-select-${b.id}`}
                    onClick={() => onUpdateMixer({ brainwaveType: b.id })}
                    className={`w-full p-2.5 rounded-xl text-left border flex items-center justify-between transition-all group relative ${
                      active
                        ? isDmt
                          ? "bg-purple-950/40 border-purple-500/60 text-purple-100 shadow-md shadow-purple-900/30"
                          : "bg-purple-500/15 border-purple-500/40 text-purple-100 shadow-sm"
                        : "bg-stone-950/60 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:border-stone-700"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="text-xs font-semibold text-stone-200 flex items-center gap-1.5 flex-wrap">
                        <span className="truncate">{b.name}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${
                            isDmt
                              ? "bg-purple-950/80 text-purple-300 border-purple-800"
                              : "bg-stone-900 text-purple-400 border-stone-800"
                          }`}
                        >
                          {b.badge}
                        </span>
                        {b.isCustom && (
                          <span className="text-[9px] font-mono px-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400 truncate mt-0.5">{b.description}</div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {b.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustomBeat(e, b.id)}
                          className="p-1 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete custom frequency"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {active && (
                        <div className={`w-2.5 h-2.5 rounded-full ${isDmt ? "bg-purple-400 shadow-md shadow-purple-400/80 animate-pulse" : "bg-purple-400 shadow-sm shadow-purple-400/50"}`} />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3 text-xs text-stone-400 flex items-start gap-2">
            <Layers className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p>
              Stereo headphones recommended for binaural beats & DMT pineal phase coherence (Left & Right carrier differential).
            </p>
          </div>
        </div>

        {/* Brainwave Channel Level */}
        <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center gap-3">
          <span className="text-xs text-stone-400 font-mono w-16">Gain:</span>
          <input
            id="brainwave-gain-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={mixerState.brainwaveVolume}
            onChange={(e) => onUpdateMixer({ brainwaveVolume: parseFloat(e.target.value) })}
            className="flex-1 accent-purple-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono text-stone-300 w-10 text-right">
            {Math.round(mixerState.brainwaveVolume * 100)}%
          </span>
        </div>
      </div>

      {/* Custom Frequency Modal */}
      <CustomFrequencyModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        initialMode={customModalMode}
        onFrequencyCreated={handleFrequencyCreated}
      />
    </div>
  );
};
