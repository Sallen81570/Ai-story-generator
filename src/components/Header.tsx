import React from "react";
import { Play, Pause, Volume2, Clock, Download, Info, Sparkles, Sliders, BookOpen } from "lucide-react";
import { AudioMixerState } from "../types";

interface HeaderProps {
  mixerState: AudioMixerState;
  onTogglePlay: () => void;
  onUpdateMixer: (updates: Partial<AudioMixerState>) => void;
  onOpenExport: () => void;
  onOpenInfo: () => void;
  onOpenGuideBook: () => void;
  readyVoiceCount: number;
  totalVoiceCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  mixerState,
  onTogglePlay,
  onUpdateMixer,
  onOpenExport,
  onOpenInfo,
  onOpenGuideBook,
  readyVoiceCount,
  totalVoiceCount,
}) => {
  const sleepTimers = [
    { label: "Off", value: null },
    { label: "15m", value: 15 },
    { label: "30m", value: 30 },
    { label: "45m", value: 45 },
    { label: "60m", value: 60 },
  ];

  return (
    <header className="border-b border-stone-800 bg-stone-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-stone-100 font-semibold tracking-tight text-base md:text-lg">
                  Subliminal AI Studio
                </h1>
                <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase">
                  DSP Master
                </span>
              </div>
              <p className="text-stone-400 text-xs hidden sm:block">
                Whispering AI voice synthesis & deep brown noise acoustic beds
              </p>
            </div>
          </div>

          <button
            id="mobile-info-btn"
            onClick={onOpenInfo}
            className="md:hidden p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white"
            title="Acoustic Science"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Master Playback & Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
          {/* Main Play / Pause Button */}
          <button
            id="master-play-pause-btn"
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-medium text-sm transition-all shadow-md ${
              mixerState.isPlaying
                ? "bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-amber-500/20"
                : "bg-stone-100 text-stone-900 hover:bg-white shadow-stone-950/40"
            }`}
          >
            {mixerState.isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Studio</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Live Audition</span>
              </>
            )}
          </button>

          {/* Master Volume */}
          <div className="flex items-center gap-2 bg-stone-900/90 border border-stone-800 rounded-xl px-3 py-1.5">
            <Volume2 className="w-4 h-4 text-stone-400" />
            <input
              id="master-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={mixerState.masterVolume}
              onChange={(e) => onUpdateMixer({ masterVolume: parseFloat(e.target.value) })}
              className="w-20 sm:w-24 accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
              title={`Master Volume: ${Math.round(mixerState.masterVolume * 100)}%`}
            />
            <span className="text-[11px] font-mono text-stone-400 w-8 text-right">
              {Math.round(mixerState.masterVolume * 100)}%
            </span>
          </div>

          {/* Sleep Timer Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-stone-900/90 border border-stone-800 rounded-xl p-1 text-xs">
            <Clock className="w-3.5 h-3.5 text-stone-400 ml-1.5 mr-0.5" />
            {sleepTimers.map((t) => {
              const active = mixerState.sleepTimerMinutes === t.value;
              return (
                <button
                  key={t.label}
                  id={`sleep-timer-${t.label}`}
                  onClick={() => onUpdateMixer({ sleepTimerMinutes: t.value })}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    active
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Guidebook Button */}
          <button
            id="desktop-guidebook-btn"
            onClick={onOpenGuideBook}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            title="Step-by-Step Guidebook: With & Without Subliminals"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>App Guidebook</span>
          </button>

          {/* Acoustic Science Guide Button */}
          <button
            id="desktop-info-btn"
            onClick={onOpenInfo}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 text-xs font-medium transition-colors"
          >
            <Info className="w-4 h-4 text-amber-400" />
            <span>Acoustic Science</span>
          </button>

          {/* Export WAV Master Button */}
          <button
            id="export-wav-master-btn"
            onClick={onOpenExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 text-xs font-medium transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Master WAV</span>
          </button>
        </div>
      </div>
    </header>
  );
};
