import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Moon,
  Clock,
  Volume2,
  Brain,
  Wand2,
  Check,
  RefreshCw,
  Flame,
  Shield,
  Layers,
  ChevronRight,
  Sliders,
  Radio,
  Eye,
  Feather,
  Info,
} from "lucide-react";
import { StoryBible, StoryVoiceCharacter, SleepConditioningRampConfig } from "../types";
import { storyStreamManager } from "../utils/storyStreamManager";

interface StoryBibleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryGenerated?: () => void;
}

const PRESET_PROMPTS = [
  {
    title: "Ancient Bioluminescent Dream Sanctuary",
    plot: "A weary traveler walking along a silver moonlit beach into an ancient bioluminescent grotto with crystal singing caverns. Releasing heavy burdens, melting muscular tension, and entering deep slow-wave delta sleep.",
    focus: "Dissolving daytime stress & anxiety, deep restorative sleep, high self-worth",
    ramp: 30,
  },
  {
    title: "Cosmic Third-Eye & Pineal Awakening",
    plot: "Floating weightlessly in a celestial sanctuary surrounded by indigo geometry, starlight waterfalls, and warm crystalline resonance. Mind quiets, third eye opens to peaceful intuition, ego chatter dissolves into universal oneness.",
    focus: "Lucid dream induction, pineal frequency synchronization, spiritual peace",
    ramp: 25,
  },
  {
    title: "Stoic Fortress of Unshakable Tranquility",
    plot: "Walking with Marcus Aurelius through a tranquil marble garden at midnight. Contemplating the impermanence of daily worries, discovering the inner citadel of peaceful composure, and surrendering the body to total rest.",
    focus: "Mental calmness, stoic resilience, releasing overthinking & insomnia",
    ramp: 35,
  },
  {
    title: "Restorative Mountain Cedar Hot Springs",
    plot: "Hiking through a quiet rain-scented pine forest to a secluded natural thermal hot spring beneath snowy mountain peaks. Warm mineral waters relax every muscle from toes to crown, breathing with the mountain wind.",
    focus: "Somatic physical tension release, nervous system down-regulation, deep REM & slow-wave rest",
    ramp: 20,
  },
];

export const StoryBibleGeneratorModal: React.FC<StoryBibleGeneratorModalProps> = ({
  isOpen,
  onClose,
  onStoryGenerated,
}) => {
  const [plotOrTheme, setPlotOrTheme] = useState(PRESET_PROMPTS[0].plot);
  const [targetFocus, setTargetFocus] = useState(PRESET_PROMPTS[0].focus);
  const [rampMinutes, setRampMinutes] = useState(30);
  const [paragraphCount, setParagraphCount] = useState(16);

  const [generatedBible, setGeneratedBible] = useState<StoryBible | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWritingStory, setIsWritingStory] = useState(false);
  const [activeStep, setActiveStep] = useState<"input" | "review_bible">("input");

  if (!isOpen) return null;

  const handleSelectPreset = (p: (typeof PRESET_PROMPTS)[0]) => {
    setPlotOrTheme(p.plot);
    setTargetFocus(p.focus);
    setRampMinutes(p.ramp);
  };

  const handleGenerateBible = async () => {
    if (!plotOrTheme.trim()) return;
    setIsGenerating(true);

    try {
      const bible = await storyStreamManager.generateStoryBible(
        plotOrTheme.trim(),
        targetFocus.trim(),
        rampMinutes
      );

      if (bible) {
        setGeneratedBible(bible);
        setActiveStep("review_bible");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateFullStory = async () => {
    if (!generatedBible) return;
    setIsWritingStory(true);

    try {
      const story = await storyStreamManager.generateFullStoryFromBible(
        generatedBible,
        paragraphCount
      );

      if (story) {
        onStoryGenerated?.();
        onClose();
      }
    } finally {
      setIsWritingStory(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100">
                  AI Sleep Conditioning Story Bible & Ramp Studio
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Subliminal Ramp
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated story worldbuilding with timed whisper-down to subliminal masking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-base font-bold p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {activeStep === "input" && (
            <div className="space-y-5">
              {/* Presets Row */}
              <div className="space-y-2">
                <label className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose a Curated Sleep Story Premise or Write Your Own:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        plotOrTheme === p.plot
                          ? "bg-indigo-950/50 border-indigo-500/60 text-slate-100 shadow-md shadow-indigo-900/20"
                          : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60"
                      }`}
                    >
                      <div className="font-semibold text-xs text-indigo-300 flex items-center justify-between">
                        <span>{p.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">{p.ramp}m ramp</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{p.plot}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Story Plot / Narrative Intent */}
              <div className="space-y-1.5">
                <label className="text-slate-200 font-semibold flex items-center justify-between">
                  <span>Story Plot, Lore, or Setting Idea:</span>
                  <span className="text-[11px] text-slate-400 font-normal">Tell AI any world, character, or theme</span>
                </label>
                <textarea
                  rows={4}
                  value={plotOrTheme}
                  onChange={(e) => setPlotOrTheme(e.target.value)}
                  placeholder="Describe your story idea, journey, or atmosphere in detail..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 leading-relaxed"
                />
              </div>

              {/* Therapeutic & Subconscious Reprogramming Focus */}
              <div className="space-y-1.5">
                <label className="text-slate-200 font-semibold flex items-center justify-between">
                  <span>Subconscious Reprogramming & Therapeutic Focus:</span>
                  <span className="text-[11px] text-slate-400 font-normal">Affirmations to embed into the story</span>
                </label>
                <input
                  type="text"
                  value={targetFocus}
                  onChange={(e) => setTargetFocus(e.target.value)}
                  placeholder="e.g. Deep sleep conditioning, releasing stress, high self-worth, athletic recovery"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>

              {/* Ramp Duration & Paragraph Depth Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                {/* Whisper-to-Subliminal Target Ramp Minutes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Ramp Down to Subliminal:</span>
                    </span>
                    <span className="font-mono font-bold text-purple-300 text-xs">{rampMinutes} minutes</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    step={5}
                    value={rampMinutes}
                    onChange={(e) => setRampMinutes(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Starts at clear audible volume (0 dB), smoothly descends into whisper (-12 dB), and locks under brown noise (-26 dB) at minute {rampMinutes}.
                  </p>
                </div>

                {/* Paragraph Count */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Story Length:</span>
                    </span>
                    <span className="font-mono font-bold text-indigo-300 text-xs">{paragraphCount} Paragraphs</span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={32}
                    step={4}
                    value={paragraphCount}
                    onChange={(e) => setParagraphCount(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Progressive 4-chapter narrative structure from physical unburdening to all-night delta affirmations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeStep === "review_bible" && generatedBible && (
            <div className="space-y-5 animate-in fade-in">
              {/* Header Title & Atmosphere */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-100">{generatedBible.title}</h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Story Bible Ready
                  </span>
                </div>
                <p className="text-slate-300 italic">{generatedBible.loreOverview}</p>
                <div className="text-[11px] text-slate-400 pt-1">
                  <strong>Visual Atmosphere:</strong> {generatedBible.visualAtmosphere}
                </div>
              </div>

              {/* 4 Sleep Conditioning Chapters */}
              <div className="space-y-2.5">
                <h5 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>4-Stage Sleep Conditioning Chapters:</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {generatedBible.chapters.map((ch) => (
                    <div
                      key={ch.chapterIndex}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-indigo-300">
                          Ch {ch.chapterIndex}: {ch.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                          {ch.targetBrainwave.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{ch.synopsis}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Cast Roster */}
              <div className="space-y-2.5">
                <h5 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-amber-400" />
                  <span>Assigned AI Character Voice Actors ({generatedBible.cast.length}):</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {generatedBible.cast.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1"
                    >
                      <div className="font-semibold text-slate-200">{c.name}</div>
                      <div className="text-[10px] text-indigo-300 font-mono">
                        TTS: {c.voiceName} ({c.role})
                      </div>
                      <p className="text-[10px] text-slate-400 italic line-clamp-2 mt-1">
                        &ldquo;{c.customDirective}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Embedded Subconscious Affirmations */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h5 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Subconscious Reprogramming Directives:</span>
                </h5>
                <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                  {generatedBible.subconsciousAffirmationsEmbedded.map((aff, idx) => (
                    <li key={idx} className="text-emerald-300/90">
                      {aff}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          {activeStep === "review_bible" ? (
            <>
              <button
                type="button"
                onClick={() => setActiveStep("input")}
                disabled={isWritingStory}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-750 transition-colors disabled:opacity-50"
              >
                ← Back to Prompt
              </button>

              <button
                type="button"
                onClick={handleCreateFullStory}
                disabled={isWritingStory}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isWritingStory ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Writing Sleep Story ({paragraphCount} paragraphs)...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate & Load Full Sleep Story</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-750 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGenerateBible}
                disabled={isGenerating || !plotOrTheme.trim()}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Building Story Bible & Lore...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create AI Sleep Story Bible</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
