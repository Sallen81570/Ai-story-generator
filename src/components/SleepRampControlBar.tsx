import React, { useEffect, useState } from "react";
import {
  Moon,
  Volume2,
  Clock,
  Radio,
  Sliders,
  Shield,
  Layers,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Info,
} from "lucide-react";
import { SleepConditioningRampConfig } from "../types";
import { storyStreamManager, StoryStreamState } from "../utils/storyStreamManager";
import { studioAudioEngine } from "../utils/audioEngine";

interface SleepRampControlBarProps {
  config?: SleepConditioningRampConfig;
  onOpenSettings?: () => void;
}

export const SleepRampControlBar: React.FC<SleepRampControlBarProps> = ({
  config,
  onOpenSettings,
}) => {
  const [streamState, setStreamState] = useState<StoryStreamState>(storyStreamManager.getState());
  const [rampProgress, setRampProgress] = useState(studioAudioEngine.getSleepRampProgress());

  useEffect(() => {
    const unsub = storyStreamManager.subscribe((s) => {
      setStreamState(s);
      setRampProgress(s.sleepRampProgress);
    });

    const interval = setInterval(() => {
      setRampProgress(studioAudioEngine.getSleepRampProgress());
    }, 1000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const isEnabled = !!config?.enabled;
  const stage = rampProgress.stage;

  const getStageLabel = () => {
    switch (stage) {
      case "audible_story":
        return {
          title: "Stage 1: Audible Story Narration",
          desc: "Full voice clarity (0 dB) with Alpha relaxation waves",
          color: "text-amber-300 border-amber-500/30 bg-amber-950/40",
        };
      case "whisper_ramp":
        return {
          title: "Stage 2: Whisper-Down Descent",
          desc: "Voice volume gently softening into intimate whisper",
          color: "text-purple-300 border-purple-500/30 bg-purple-950/40",
        };
      case "subconscious_subliminal":
        return {
          title: "Stage 3: Subconscious Subliminal Masking",
          desc: "Voice attenuated (-26 dB) beneath colored noise bed",
          color: "text-indigo-300 border-indigo-500/30 bg-indigo-950/40",
        };
      case "all_night_delta":
        return {
          title: "Stage 4: All-Night Delta Regeneration Loop",
          desc: "Continuous subconscious conditioning & delta waves",
          color: "text-emerald-300 border-emerald-500/30 bg-emerald-950/40",
        };
    }
  };

  const stageInfo = getStageLabel();

  return (
    <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-4 backdrop-blur-md shadow-xl space-y-3">
      {/* Top row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold text-slate-100">
                Timed Sleep Conditioning Ramp Engine
              </h4>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  isEnabled ? stageInfo.color : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {isEnabled ? stageInfo.title : "Standard Playback"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isEnabled
                ? `${config.rampDurationMinutes} min descent from audible narration down to subliminal threshold beneath noise bed`
                : "Voice plays at standard static volume without timed volume descent"}
            </p>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              storyStreamManager.setSleepRampConfig({
                enabled: !isEnabled,
                rampDurationMinutes: config?.rampDurationMinutes || 30,
                initialVoiceVolumeDb: 0,
                targetSubliminalDb: -26,
                transitionBrainwave: true,
                allNightLoopMode: true,
              });
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isEnabled
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            {isEnabled ? "Sleep Ramp: ACTIVE" : "Enable Sleep Ramp"}
          </button>

          {isEnabled && (
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Configure Ramp Timeline"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Live Timeline & Progress Bar (when enabled) */}
      {isEnabled && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>
                Elapsed: <strong>{rampProgress.elapsedMinutes}m</strong> / {rampProgress.totalMinutes}m Target
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-400">Current Voice Volume:</span>
              <span
                className={`font-bold ${
                  rampProgress.currentDb <= -20 ? "text-indigo-400" : "text-amber-300"
                }`}
              >
                {rampProgress.currentDb} dB ({rampProgress.percentComplete}% ramped)
              </span>
            </div>
          </div>

          {/* Multi-Segment Timeline Bar */}
          <div className="relative w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            {/* Stage markers */}
            <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-40">
              <div className="border-r border-slate-700" />
              <div className="border-r border-slate-700" />
              <div className="border-r border-slate-700" />
            </div>

            {/* Progress Fill */}
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 transition-all duration-1000"
              style={{ width: `${Math.min(100, rampProgress.percentComplete)}%` }}
            />
          </div>

          {/* Stage Labels under bar */}
          <div className="grid grid-cols-4 text-[9px] font-mono text-slate-400 pt-0.5">
            <span className="text-left">0m: Audible</span>
            <span className="text-center">Whisper Ramp</span>
            <span className="text-center">Subliminal (-26dB)</span>
            <span className="text-right">All-Night Loop</span>
          </div>
        </div>
      )}
    </div>
  );
};
