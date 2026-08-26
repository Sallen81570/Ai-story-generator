import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  AffirmationItem,
  AudioMixerState,
  PresetProgram,
  VoiceName,
  BunkProtocol,
} from "./types";
import { PRESET_PROGRAMS } from "./data/presets";
import { studioAudioEngine } from "./utils/audioEngine";
import { safeFetchJson } from "./utils/api";
import { Header } from "./components/Header";
import { Visualizer } from "./components/Visualizer";
import { MixerConsole } from "./components/MixerConsole";
import { AffirmationManager } from "./components/AffirmationManager";
import { ProtocolManager } from "./components/ProtocolManager";
import { StoryReaderStudio } from "./components/StoryReaderStudio";
import { ExportModal } from "./components/ExportModal";
import { AcousticInfoModal } from "./components/AcousticInfoModal";
import { AppGuideBookModal } from "./components/AppGuideBookModal";
import { Sparkles, Sliders, Layers, Waves, AlertCircle, Shield, BookOpen } from "lucide-react";

export default function App() {
  const defaultPreset = PRESET_PROGRAMS[0];

  // Active Main Studio View Mode
  const [activeStudioMode, setActiveStudioMode] = useState<"story" | "affirmations" | "protocol">("story");


  // 0. Bunk Protocol State
  const [protocol, setProtocol] = useState<BunkProtocol>({
    id: "raios_v3",
    name: "Bunk Protocol — RAIOS v3",
    targetUser: "Steve",
    operator: "Rai",
    guardian: "Misty",
    active: true,
    sessionActive: false,
    phases: [
      {
        id: "phase_1",
        number: 1,
        title: "PHASE 1 — Bunk Lock (05:00)",
        type: "lock",
        enabled: true,
        timeWindow: { start: "05:00", end: "17:00" },
        config: {
          lockManualOverride: true,
          muteNotifications: true,
          screenDimPercent: 5,
          logSessionStart: true,
          startFuelGallons: 85,
          startLocation: "Sector West Transit",
        },
      },
      {
        id: "phase_2",
        number: 2,
        title: "PHASE 2 — Subliminal Audio Layers",
        type: "audio_layers",
        enabled: true,
        config: {
          layerNames: [
            "Receptivity & Subconscious Focus",
            "Metabolic Fasting & Cravings Reduction",
            "Discipline, Willpower & Physical Stillness",
            "Deep Circadian Sleep & Neural Reset",
            "Stress & Cortisol Release Modulation",
            "Wake Readiness Trigger (17:00 Guardian Prompt)",
          ],
        },
      },
      {
        id: "phase_3",
        number: 3,
        title: "PHASE 3 — Transit & Mileage Tracker",
        type: "tracker",
        enabled: true,
        config: {
          intervalMinutes: 15,
          startOdometer: 124500,
          currentOdometer: 124820,
          milesDrivenSession: 320,
          totalHistoricalMiles: 3420,
          fuelRemainingGallons: 75,
        },
      },
      {
        id: "phase_4",
        number: 4,
        title: "PHASE 4 — Wake Trigger & Unlock (17:00)",
        type: "wake",
        enabled: true,
        config: {
          wakeConditionTime: "17:00",
          wakePromptText: "Steve. 1700. Miles logged. Session complete. Let's move.",
          screenRestorePercent: 70,
          wakeVoice: "Aoede",
          unlockManualControl: true,
        },
      },
    ],
  });

  // 1. Affirmations State
  const [affirmations, setAffirmations] = useState<AffirmationItem[]>(() =>
    defaultPreset.phrases.map((text, idx) => ({
      id: `default_${idx}`,
      text,
      status: "idle",
    }))
  );

  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(defaultPreset.voiceName);

  // 2. Audio Mixer State
  const [mixerState, setMixerState] = useState<AudioMixerState>({
    isPlaying: false,
    masterVolume: 0.85,
    voiceVolume: 0.85,
    voiceMute: false,
    voiceSoloTest: false,
    voiceLowPassHz: defaultPreset.voiceLowPassHz,
    subliminalAttenuationDb: defaultPreset.subliminalAttenuationDb,
    intervalRestSec: defaultPreset.intervalRestSec,
    noiseType: defaultPreset.recommendedNoise,
    noiseVolume: 0.85,
    noiseMute: false,
    brainwaveType: defaultPreset.recommendedBrainwave,
    brainwaveVolume: 0.5,
    brainwaveMute: false,
    masterLowPassHz: defaultPreset.masterLowPassHz,
    currentPhraseIndex: -1,
    sleepTimerMinutes: null,
    sleepTimerRemainingSec: null,
  });

  const [activePhraseIndex, setActivePhraseIndex] = useState<number>(-1);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isGuideBookOpen, setIsGuideBookOpen] = useState(false);

  // Batch synthesis state
  const [isBatchSynthesizing, setIsBatchSynthesizing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Listen to engine phrase change
  useEffect(() => {
    studioAudioEngine.setOnPhraseChange((idx) => {
      setActivePhraseIndex(idx);
    });

    return () => {
      studioAudioEngine.cleanup();
    };
  }, []);

  // Sync mixer updates to active engine
  const handleUpdateMixer = useCallback((updates: Partial<AudioMixerState>) => {
    setMixerState((prev) => {
      const next = { ...prev, ...updates };
      studioAudioEngine.updateParameters(next);
      return next;
    });
  }, []);

  // Toggle Live Playback
  const handleTogglePlay = async () => {
    if (mixerState.isPlaying) {
      studioAudioEngine.pause();
      setMixerState((prev) => ({ ...prev, isPlaying: false }));
    } else {
      await studioAudioEngine.play(mixerState, affirmations);
      setMixerState((prev) => ({ ...prev, isPlaying: true }));
    }
  };

  // Synthesize single phrase
  const handleSynthesizeSingle = async (item: AffirmationItem) => {
    setAffirmations((prev) =>
      prev.map((a) => (a.id === item.id ? { ...a, status: "synthesizing", errorMessage: undefined } : a))
    );

    try {
      const res = await safeFetchJson("/api/synthesize-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: item.text,
          voiceName: selectedVoice,
          promptStyle: "soft_whisper",
        }),
      });

      if (!res.ok || !res.data?.success || !res.data?.audioBase64) {
        throw new Error(res.error || "Failed to synthesize voice");
      }

      const data = res.data;

      setAffirmations((prev) =>
        prev.map((a) =>
          a.id === item.id
            ? {
                ...a,
                status: "ready",
                audioBase64: data.audioBase64,
                errorMessage: undefined,
              }
            : a
        )
      );

      // Pre-decode into audio engine cache
      await studioAudioEngine.decodeAudioBase64(item.id, data.audioBase64);
    } catch (err: any) {
      console.error(err);
      setAffirmations((prev) =>
        prev.map((a) =>
          a.id === item.id
            ? { ...a, status: "error", errorMessage: err.message || "TTS synthesis failed" }
            : a
        )
      );
    }
  };

  // Synthesize all phrases sequentially
  const handleSynthesizeAll = async () => {
    if (affirmations.length === 0) return;
    setIsBatchSynthesizing(true);
    setGlobalError(null);
    setBatchProgress({ current: 0, total: affirmations.length });

    for (let i = 0; i < affirmations.length; i++) {
      const item = affirmations[i];
      setBatchProgress({ current: i + 1, total: affirmations.length });
      await handleSynthesizeSingle(item);
    }

    setIsBatchSynthesizing(false);

    // If currently playing, restart sequence with newly loaded voices
    if (mixerState.isPlaying) {
      await studioAudioEngine.play(mixerState, affirmations);
    }
  };

  // Apply a preset
  const handleApplyPreset = (preset: PresetProgram) => {
    const newItems: AffirmationItem[] = preset.phrases.map((text, idx) => ({
      id: `preset_${preset.id}_${idx}`,
      text,
      status: "idle",
    }));

    setAffirmations(newItems);
    setSelectedVoice(preset.voiceName);

    handleUpdateMixer({
      voiceLowPassHz: preset.voiceLowPassHz,
      subliminalAttenuationDb: preset.subliminalAttenuationDb,
      intervalRestSec: preset.intervalRestSec,
      noiseType: preset.recommendedNoise,
      brainwaveType: preset.recommendedBrainwave,
      masterLowPassHz: preset.masterLowPassHz,
    });
  };

  // Voice change handler
  const handleChangeVoice = (voice: VoiceName) => {
    setSelectedVoice(voice);
    // Mark items as idle so they can be re-synthesized with the new voice actor
    setAffirmations((prev) =>
      prev.map((a) => ({
        ...a,
        status: "idle",
        audioBase64: undefined,
      }))
    );
  };

  // Sleep Timer Countdown Ticker
  useEffect(() => {
    if (!mixerState.isPlaying || mixerState.sleepTimerMinutes === null) return;

    const targetSeconds = mixerState.sleepTimerMinutes * 60;
    let remaining = targetSeconds;

    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        studioAudioEngine.pause();
        setMixerState((prev) => ({
          ...prev,
          isPlaying: false,
          sleepTimerMinutes: null,
          sleepTimerRemainingSec: null,
        }));
        clearInterval(interval);
      } else {
        setMixerState((prev) => ({
          ...prev,
          sleepTimerRemainingSec: remaining,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [mixerState.isPlaying, mixerState.sleepTimerMinutes]);

  // Update protocol state
  const handleUpdateProtocol = (updates: Partial<BunkProtocol>) => {
    setProtocol((prev) => ({ ...prev, ...updates }));
  };

  // Trigger synthesized wake audio cue
  const handleTriggerWakeAudio = async (text: string, voiceName: VoiceName) => {
    try {
      const res = await safeFetchJson("/api/synthesize-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voiceName,
          promptStyle: "soft_whisper",
        }),
      });
      if (res.ok && res.data?.audioBase64) {
        const cleanBase64 = res.data.audioBase64.replace(/^data:.*?;base64,/i, "").replace(/\s/g, "");
        const audio = new Audio(`data:audio/wav;base64,${cleanBase64}`);
        audio.volume = 0.9;
        audio.play();
      }
    } catch (e) {
      console.error("Failed to play wake voice:", e);
    }
  };

  const readyVoiceCount = affirmations.filter((a) => a.status === "ready").length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Studio Header */}
      <Header
        mixerState={mixerState}
        onTogglePlay={handleTogglePlay}
        onUpdateMixer={handleUpdateMixer}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenGuideBook={() => setIsGuideBookOpen(true)}
        readyVoiceCount={readyVoiceCount}
        totalVoiceCount={affirmations.length}
      />

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Global Alert Bar if applicable */}
        {globalError && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/50 text-red-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{globalError}</span>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className="text-red-400 hover:text-white font-mono"
            >
              ✕
            </button>
          </div>
        )}

        {/* Studio Primary Workspace Mode Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-stone-900/80 p-2 rounded-2xl border border-stone-800">
          <div className="flex items-center gap-1.5 p-1 bg-stone-950 rounded-xl border border-stone-800/80 w-full sm:w-auto">
            <button
              onClick={() => setActiveStudioMode("story")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                activeStudioMode === "story"
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Ebook & Story Streamer</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-purple-950 text-purple-300 rounded border border-purple-800/40 font-mono">
                Lookahead Cache
              </span>
            </button>

            <button
              onClick={() => setActiveStudioMode("affirmations")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                activeStudioMode === "affirmations"
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Affirmation Studio</span>
            </button>

            <button
              onClick={() => setActiveStudioMode("protocol")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                activeStudioMode === "protocol"
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Bunk Protocol</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-stone-400 px-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>IndexedDB Lookahead Engine Online</span>
          </div>
        </div>

        {/* Mode 1: Ebook & Story Streamer */}
        {activeStudioMode === "story" && (
          <section>
            <StoryReaderStudio
              mixerState={mixerState}
              onUpdateMixer={handleUpdateMixer}
              selectedVoice={selectedVoice}
              onChangeVoice={handleChangeVoice}
            />
          </section>
        )}

        {/* Mode 2: Affirmation Studio */}
        {activeStudioMode === "affirmations" && (
          <section>
            <AffirmationManager
              affirmations={affirmations}
              onUpdateAffirmations={setAffirmations}
              selectedVoice={selectedVoice}
              onApplyPreset={handleApplyPreset}
              onSynthesizeSingle={handleSynthesizeSingle}
              onSynthesizeAll={handleSynthesizeAll}
              isBatchSynthesizing={isBatchSynthesizing}
              batchProgress={batchProgress}
            />
          </section>
        )}

        {/* Mode 3: Bunk Protocol */}
        {activeStudioMode === "protocol" && (
          <section>
            <ProtocolManager
              protocol={protocol}
              onUpdateProtocol={handleUpdateProtocol}
              onTriggerWakeAudio={handleTriggerWakeAudio}
            />
          </section>
        )}

        {/* Real-time Spectrum & Active Subliminal Display */}
        <Visualizer
          mixerState={mixerState}
          activePhraseIndex={activePhraseIndex}
          affirmations={affirmations}
        />

        {/* 3-Channel DSP Studio Console (Shared across all modes) */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h2 className="text-stone-200 font-semibold text-sm">
                3-Channel DSP Audio Console
              </h2>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">
              Acoustic Softening & Noise Masking Active
            </span>
          </div>
          <MixerConsole
            mixerState={mixerState}
            onUpdateMixer={handleUpdateMixer}
            selectedVoice={selectedVoice}
            onChangeVoice={handleChangeVoice}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 bg-stone-950/80 py-4 px-4 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Subliminal AI Sleep & Affirmation Studio</span>
          <span className="font-mono text-[11px]">
            Powered by Gemini TTS & WebAudio DSP Engine
          </span>
        </div>
      </footer>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        mixerState={mixerState}
        affirmations={affirmations}
      />

      <AcousticInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      <AppGuideBookModal
        isOpen={isGuideBookOpen}
        onClose={() => setIsGuideBookOpen(false)}
      />
    </div>
  );
}
