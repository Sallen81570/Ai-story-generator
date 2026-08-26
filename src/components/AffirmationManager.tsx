import React, { useState } from "react";
import {
  AffirmationItem,
  PresetProgram,
  VoiceName,
} from "../types";
import { PRESET_PROGRAMS } from "../data/presets";
import { safeFetchJson } from "../utils/api";
import {
  Sparkles,
  Plus,
  Trash2,
  Play,
  RotateCcw,
  Bot,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Volume2,
  Bookmark,
  Edit3,
} from "lucide-react";

interface AffirmationManagerProps {
  affirmations: AffirmationItem[];
  onUpdateAffirmations: (items: AffirmationItem[]) => void;
  selectedVoice: VoiceName;
  onApplyPreset: (preset: PresetProgram) => void;
  onSynthesizeSingle: (item: AffirmationItem) => Promise<void>;
  onSynthesizeAll: () => Promise<void>;
  isBatchSynthesizing: boolean;
  batchProgress: { current: number; total: number };
}

export const AffirmationManager: React.FC<AffirmationManagerProps> = ({
  affirmations,
  onUpdateAffirmations,
  selectedVoice,
  onApplyPreset,
  onSynthesizeSingle,
  onSynthesizeAll,
  isBatchSynthesizing,
  batchProgress,
}) => {
  const [customTopic, setCustomTopic] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newPhraseText, setNewPhraseText] = useState("");

  // AI Script Generator using backend Gemini endpoint
  const handleGenerateAIScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    setIsGeneratingScript(true);
    setAiError(null);

    try {
      const res = await safeFetchJson("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: customTopic.trim(), count: 8 }),
      });

      if (!res.ok || !res.data?.success) {
        throw new Error(res.error || "Failed to generate script");
      }

      const generated = res.data.data;
      const newItems: AffirmationItem[] = (generated.phrases || []).map(
        (text: string, idx: number) => ({
          id: `ai_${Date.now()}_${idx}`,
          text,
          status: "idle" as const,
        })
      );

      onUpdateAffirmations(newItems);
      setCustomTopic("");
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Failed to generate AI affirmations");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Add individual phrase
  const handleAddPhrase = () => {
    if (!newPhraseText.trim()) return;
    const newItem: AffirmationItem = {
      id: `custom_${Date.now()}`,
      text: newPhraseText.trim(),
      status: "idle",
    };
    onUpdateAffirmations([...affirmations, newItem]);
    setNewPhraseText("");
  };

  // Delete phrase
  const handleDeletePhrase = (id: string) => {
    onUpdateAffirmations(affirmations.filter((a) => a.id !== id));
  };

  // Start edit
  const handleStartEdit = (item: AffirmationItem) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  // Save edit
  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    onUpdateAffirmations(
      affirmations.map((a) =>
        a.id === id ? { ...a, text: editText.trim(), status: "idle", audioBase64: undefined } : a
      )
    );
    setEditingId(null);
  };

  const readyCount = affirmations.filter((a) => a.status === "ready").length;

  return (
    <div className="rounded-2xl bg-stone-900/70 border border-stone-800 p-5 lg:p-6 shadow-xl space-y-6">
      {/* Top Header & Presets Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-400" />
            <h2 className="text-stone-100 font-semibold text-base">
              Subliminal Affirmation Scripts
            </h2>
          </div>
          <p className="text-stone-400 text-xs mt-0.5">
            Load science-backed presets or generate customized psychological suggestions with Gemini.
          </p>
        </div>

        {/* Preset Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-stone-400 font-mono mr-1">Presets:</span>
          {PRESET_PROGRAMS.map((preset) => (
            <button
              key={preset.id}
              id={`preset-btn-${preset.id}`}
              onClick={() => onApplyPreset(preset)}
              className="px-2.5 py-1.5 rounded-xl bg-stone-950/70 border border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-500/40 text-xs font-medium transition-all"
            >
              {preset.title.split(" & ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* AI Custom Script Generator Bar */}
      <div className="bg-stone-950/80 border border-stone-800/90 rounded-xl p-4">
        <form onSubmit={handleGenerateAIScript} className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <Bot className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="custom-affirmation-topic-input"
              type="text"
              placeholder="e.g. Stop late night snacking, deep 8-hour sleep, public speaking confidence..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-amber-500/60 placeholder:text-stone-500"
            />
          </div>
          <button
            id="ai-generate-script-btn"
            type="submit"
            disabled={isGeneratingScript || !customTopic.trim()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            {isGeneratingScript ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Crafting Script...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Generate Script</span>
              </>
            )}
          </button>
        </form>

        {aiError && (
          <div className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{aiError}</span>
          </div>
        )}
      </div>

      {/* Batch Synthesis Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-950/40 p-3.5 rounded-xl border border-stone-800/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-stone-300">
            Voice Synthesis:{" "}
            <span className="text-amber-400 font-bold">{readyCount}</span> /{" "}
            {affirmations.length} Ready
          </span>
          <span className="text-[11px] text-stone-400 font-mono">
            (Voice: <strong className="text-stone-300">{selectedVoice}</strong>)
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="synthesize-all-btn"
            onClick={onSynthesizeAll}
            disabled={isBatchSynthesizing || affirmations.length === 0}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/10"
          >
            {isBatchSynthesizing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>
                  Synthesizing ({batchProgress.current}/{batchProgress.total})...
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synthesize All Phrases</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Phrase List */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {affirmations.map((item, idx) => {
          const isEditing = editingId === item.id;
          const isReady = item.status === "ready" && item.audioBase64;
          const isSynthesizing = item.status === "synthesizing";

          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                isReady
                  ? "bg-stone-950/60 border-stone-800/80 hover:border-stone-700"
                  : item.status === "error"
                  ? "bg-red-950/10 border-red-900/30"
                  : "bg-stone-950/30 border-stone-800/40"
              }`}
            >
              {/* Phrase Number */}
              <span className="text-[11px] font-mono text-stone-400 w-5 shrink-0 text-center">
                {idx + 1}.
              </span>

              {/* Phrase Content or Edit Input */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(item.id)}
                      className="w-full px-2.5 py-1 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="px-2 py-1 bg-amber-500 text-stone-950 text-[11px] font-semibold rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-stone-200 font-medium leading-relaxed">
                    "{item.text}"
                  </p>
                )}

                {item.errorMessage && (
                  <p className="text-[10px] text-red-400 mt-0.5">{item.errorMessage}</p>
                )}
              </div>

              {/* Action Buttons & Status */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Synthesis status badge */}
                {isReady ? (
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>TTS Ready</span>
                  </div>
                ) : isSynthesizing ? (
                  <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono bg-amber-950/30 border border-amber-900/40 px-2 py-0.5 rounded-md">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Rendering...</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onSynthesizeSingle(item)}
                    disabled={isBatchSynthesizing}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] font-medium transition-colors"
                    title="Synthesize single phrase with Gemini TTS"
                  >
                    Synthesize
                  </button>
                )}

                {/* Edit Button */}
                <button
                  onClick={() => handleStartEdit(item)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 text-xs transition-colors"
                  title="Edit phrase text"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeletePhrase(item.id)}
                  className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 text-xs transition-colors"
                  title="Delete phrase"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Phrase Input */}
      <div className="flex items-center gap-2 pt-2">
        <input
          id="new-affirmation-phrase-input"
          type="text"
          placeholder="Add a new custom subliminal affirmation..."
          value={newPhraseText}
          onChange={(e) => setNewPhraseText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddPhrase()}
          className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-amber-500/50"
        />
        <button
          id="add-phrase-btn"
          onClick={handleAddPhrase}
          disabled={!newPhraseText.trim()}
          className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};
