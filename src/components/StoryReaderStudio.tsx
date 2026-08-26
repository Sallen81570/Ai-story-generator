import React, { useState, useEffect, useRef } from "react";
import {
  StoryDocument,
  StoryParagraph,
  VoiceName,
  AudioMixerState,
  StoryVoiceCharacter,
} from "../types";
import { PRESET_STORIES } from "../data/defaultStories";
import {
  WHISPER_PERSONAS,
  WhisperPersona,
  WhisperPersonaId,
  resolveWhisperPersona,
} from "../data/whisperPersonas";
import {
  createStoryFromText,
  parsePdfFile,
  parseTextFile,
  segmentTextIntoParagraphs,
} from "../utils/documentParser";
import { storyStreamManager, StoryStreamState } from "../utils/storyStreamManager";
import { StoryCharacterCastManager } from "./StoryCharacterCastManager";
import { StoryBibleGeneratorModal } from "./StoryBibleGeneratorModal";
import { SleepRampControlBar } from "./SleepRampControlBar";
import { StoryCinemaVideoPlayer } from "./StoryCinemaVideoPlayer";
import { AppGuideBookModal } from "./AppGuideBookModal";
import {
  BookOpen,
  UploadCloud,
  FileText,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Trash2,
  Plus,
  Volume2,
  Layers,
  Sliders,
  ChevronRight,
  Database,
  Feather,
  Info,
  Headphones,
  Moon,
  Sun,
  Heart,
  Flame,
  Wand2,
  Brain,
  Users,
  Film,
  Camera,
} from "lucide-react";

interface StoryReaderStudioProps {
  mixerState: AudioMixerState;
  onUpdateMixer: (updates: Partial<AudioMixerState>) => void;
  selectedVoice: VoiceName;
  onChangeVoice: (voice: VoiceName) => void;
}

export function StoryReaderStudio({
  mixerState,
  onUpdateMixer,
  selectedVoice,
  onChangeVoice,
}: StoryReaderStudioProps) {
  // Active story and streaming state
  const [streamState, setStreamState] = useState<StoryStreamState>(() =>
    storyStreamManager.getState()
  );

  // Tab: "presets" | "upload" | "paste"
  const [activeTab, setActiveTab] = useState<"presets" | "upload" | "paste">("presets");

  // Paste form state
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteAuthor, setPasteAuthor] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [pastePreviewCount, setPastePreviewCount] = useState(0);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Active Whisper Persona State
  const [selectedPersonaId, setSelectedPersonaId] = useState<WhisperPersonaId>("calm_narrator");
  const [isBibleModalOpen, setIsBibleModalOpen] = useState(false);
  const [isCinemaModalOpen, setIsCinemaModalOpen] = useState(false);
  const [isGuideBookOpen, setIsGuideBookOpen] = useState(false);

  const activeParagraphRef = useRef<HTMLDivElement | null>(null);

  // Initialize with first preset story if none loaded
  useEffect(() => {
    if (!streamState.story && PRESET_STORIES.length > 0) {
      storyStreamManager.setStory(PRESET_STORIES[0]);
    }
  }, []);

  // Subscribe to story stream updates
  useEffect(() => {
    const unsub = storyStreamManager.subscribe((state) => {
      setStreamState(state);
      if (state.personaId) {
        setSelectedPersonaId(state.personaId);
      }
    });
    return unsub;
  }, []);

  // Update mixer state into stream manager whenever it changes
  useEffect(() => {
    storyStreamManager.setMixerState(mixerState);
  }, [mixerState]);

  // Sync selected voice
  useEffect(() => {
    storyStreamManager.setVoice(selectedVoice);
    storyStreamManager.syncCacheStatus();
  }, [selectedVoice]);

  // Auto-scroll to active paragraph
  useEffect(() => {
    if (activeParagraphRef.current && streamState.isPlaying) {
      activeParagraphRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [streamState.currentParagraphIndex, streamState.isPlaying]);

  // Update paste preview paragraph count
  useEffect(() => {
    if (!pasteContent.trim()) {
      setPastePreviewCount(0);
    } else {
      const p = segmentTextIntoParagraphs(pasteContent);
      setPastePreviewCount(p.length);
    }
  }, [pasteContent]);

  // Handle Play/Pause
  const handleTogglePlay = () => {
    if (streamState.isPlaying) {
      storyStreamManager.pause();
    } else {
      storyStreamManager.play(mixerState);
    }
  };

  // Select Preset Story
  const handleSelectPresetStory = (story: StoryDocument) => {
    storyStreamManager.setStory(story);
  };

  // Switch Whisper Persona
  const handleSelectPersona = (personaId: WhisperPersonaId, autoSwitchVoice = true) => {
    setSelectedPersonaId(personaId);
    storyStreamManager.setPersona(personaId, autoSwitchVoice);
    const persona = resolveWhisperPersona(personaId);
    if (autoSwitchVoice && persona.defaultVoice) {
      onChangeVoice(persona.defaultVoice);
    }
  };

  // Auto-tune studio mixer (noise bed, brainwave, voice) to match selected persona
  const handleApplyPersonaAcousticProfile = (persona: WhisperPersona) => {
    handleSelectPersona(persona.id, true);
    onUpdateMixer({
      noiseType: persona.recommendedNoise,
      brainwaveType: persona.recommendedBrainwave,
      subliminalAttenuationDb: persona.recommendedAttenuationDb,
    });
  };

  // Handle Create Story from Paste
  const handleCreateFromPaste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteContent.trim()) return;

    const doc = createStoryFromText(
      pasteTitle || "Custom Story",
      pasteContent,
      "pasted",
      undefined,
      pasteAuthor || undefined
    );

    storyStreamManager.setStory(doc);
    setPasteTitle("");
    setPasteAuthor("");
    setPasteContent("");
    setActiveTab("presets");
  };

  // Handle File Upload (.pdf, .txt, .md, .epub)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      let title = file.name;
      let text = "";

      if (file.name.toLowerCase().endsWith(".pdf")) {
        const parsed = await parsePdfFile(file);
        title = parsed.title;
        text = parsed.text;
      } else {
        const parsed = await parseTextFile(file);
        title = parsed.title;
        text = parsed.text;
      }

      if (!text.trim()) {
        throw new Error("No readable text found in file.");
      }

      const doc = createStoryFromText(
        title,
        text,
        file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "txt",
        file.name
      );

      storyStreamManager.setStory(doc);
      setActiveTab("presets");
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to process document file.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const story = streamState.story;
  const currentIdx = streamState.currentParagraphIndex;
  const totalParagraphs = story?.paragraphs.length || 0;
  const cachedCount =
    story?.paragraphs.filter((p) => p.status === "cached" || !!p.audioBase64).length || 0;
  const cachePercent = totalParagraphs > 0 ? Math.round((cachedCount / totalParagraphs) * 100) : 0;
  const activePersona = resolveWhisperPersona(selectedPersonaId);

  // Helper for persona icon rendering
  const renderPersonaIcon = (id: WhisperPersonaId) => {
    switch (id) {
      case "binaural_whisperer":
        return <Headphones className="w-4 h-4 text-purple-400" />;
      case "energetic_affirmator":
        return <Zap className="w-4 h-4 text-amber-400" />;
      case "hypnotic_somnambulist":
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case "sacred_sage":
        return <Brain className="w-4 h-4 text-cyan-400" />;
      case "warm_compassion":
        return <Heart className="w-4 h-4 text-rose-400" />;
      case "gentle_zen":
        return <Feather className="w-4 h-4 text-emerald-400" />;
      case "cinematic_deep":
        return <Flame className="w-4 h-4 text-orange-400" />;
      case "calm_narrator":
      default:
        return <BookOpen className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Ingestion & Document Selection */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-stone-100 font-semibold text-base sm:text-lg">
                  Ebook, PDF & Long-Form Story Streamer
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Lookahead Cache Active
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Stream chapters paragraph-by-paragraph with 2-3 paragraph background lookahead
                buffering and masking acoustics.
              </p>
            </div>
          </div>

          {/* Tab Selector & AI Generator Button */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto text-xs">
            <button
              onClick={() => setIsGuideBookOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-stone-100 font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Step-by-Step App Guide: With & Without Subliminals"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Step-by-Step Guide</span>
            </button>

            <button
              onClick={() => setIsBibleModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition-all cursor-pointer border border-purple-400/30"
            >
              <Moon className="w-3.5 h-3.5 text-purple-200" />
              <span>AI Sleep Bible & Ramp Studio</span>
            </button>

            <div className="flex items-center p-1 bg-stone-950 rounded-xl border border-stone-800">
              <button
                onClick={() => setActiveTab("presets")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "presets"
                    ? "bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Library</span>
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "upload"
                    ? "bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload PDF / TXT</span>
              </button>
              <button
                onClick={() => setActiveTab("paste")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "paste"
                    ? "bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste Text</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Library / Presets */}
        {activeTab === "presets" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
                Choose a Sleep Story or Guided Chapter
              </span>
              {story && (
                <span className="text-xs text-amber-400/90 font-medium">
                  Active: <strong className="text-stone-200">{story.title}</strong> (
                  {story.paragraphs.length} paragraphs)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PRESET_STORIES.map((pStory) => {
                const isSelected = story?.id === pStory.id;
                return (
                  <button
                    key={pStory.id}
                    onClick={() => handleSelectPresetStory(pStory)}
                    className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/30"
                        : "bg-stone-950/60 border-stone-800/80 hover:border-stone-700 hover:bg-stone-900"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                          {pStory.author || "Sleep Chapter"}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-stone-100 line-clamp-1">
                        {pStory.title}
                      </h4>
                      <p className="text-[11px] text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                        {pStory.paragraphs[0]?.text || ""}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-800/60 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                      <span>{pStory.paragraphs.length} paragraphs</span>
                      <span>~{pStory.totalWords} words</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Upload File */}
        {activeTab === "upload" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-stone-700 hover:border-amber-500/50 rounded-xl p-6 text-center transition-all bg-stone-950/50">
              <input
                type="file"
                id="doc-upload-input"
                accept=".pdf,.txt,.md,.epub"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <label
                htmlFor="doc-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-200">
                    {isUploading
                      ? "Extracting and segmenting document..."
                      : "Click to upload PDF, EPUB, TXT, or Markdown"}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    Auto-splits long chapters into rhythmic 2–4 sentence subliminal paragraphs
                  </p>
                </div>
              </label>
            </div>

            {uploadError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
                {uploadError}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Paste Text */}
        {activeTab === "paste" && (
          <form onSubmit={handleCreateFromPaste} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={pasteTitle}
                onChange={(e) => setPasteTitle(e.target.value)}
                placeholder="Story / Chapter Title (e.g. Chapter 4: Night Reflection)"
                className="px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/60"
              />
              <input
                type="text"
                value={pasteAuthor}
                onChange={(e) => setPasteAuthor(e.target.value)}
                placeholder="Author / Source (Optional)"
                className="px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="relative">
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                rows={5}
                placeholder="Paste book chapters, sleep narratives, stoic reflections, or mindfulness texts here..."
                className="w-full px-3.5 py-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/60 font-sans leading-relaxed"
                required
              />
              <div className="absolute right-3 bottom-3 text-[10px] font-mono text-stone-400 bg-stone-900/80 px-2 py-0.5 rounded border border-stone-800">
                {pastePreviewCount} paragraphs detected
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!pasteContent.trim()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-semibold text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create & Load Story</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* AI Whisper Persona Selector Bar */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-200">
              AI Whisper Personas & Delivery Styles
            </h3>
          </div>
          <span className="text-[11px] font-mono text-stone-400">
            Select a cadence persona to guide speech delivery & subconscious induction
          </span>
        </div>

        {/* Persona Quick Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {WHISPER_PERSONAS.map((persona) => {
            const isSelected = selectedPersonaId === persona.id;
            return (
              <button
                key={persona.id}
                onClick={() => handleSelectPersona(persona.id, true)}
                className={`p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? "bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/40"
                    : "bg-stone-950/60 border-stone-800/80 hover:border-stone-700 hover:bg-stone-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="p-1 rounded bg-stone-900 border border-stone-800">
                    {renderPersonaIcon(persona.id)}
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800">
                    {persona.energyLevel}
                  </span>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-stone-200 line-clamp-1">
                    {persona.name}
                  </h4>
                  <p className="text-[9px] text-stone-400 line-clamp-1">
                    {persona.badge}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Persona Spotlight & Acoustic Auto-Tune Banner */}
        <div className="p-3.5 rounded-xl bg-stone-950/90 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              {renderPersonaIcon(activePersona.id)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-bold text-stone-100">{activePersona.name}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/40">
                  {activePersona.badge}
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  Voice: <strong className="text-stone-200">{activePersona.defaultVoice}</strong>
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
                {activePersona.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleApplyPersonaAcousticProfile(activePersona)}
            className="w-full md:w-auto px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
            title="Auto-configures noise bed, brainwave frequency, and attenuation to match this persona"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Auto-Tune Bed</span>
          </button>
        </div>
      </div>

      {/* Timed Sleep Conditioning Ramp Engine Bar */}
      {story && (
        <SleepRampControlBar
          config={story.sleepRampConfig}
          onOpenSettings={() => setIsBibleModalOpen(true)}
        />
      )}

      {/* AI Voice Cast & Character Ensemble Manager */}
      {story && (
        <StoryCharacterCastManager
          characters={story.characters || []}
          isMultiCharacterEnabled={!!story.isMultiCharacterEnabled}
          totalParagraphs={story.paragraphs.length}
          isAnalyzingCast={streamState.isAnalyzingCast}
          paragraphAssignments={story.paragraphs.map((p) => ({
            index: p.index,
            characterId: p.characterId,
            speakerName: p.speakerName,
            textSnippet: p.text.slice(0, 75) + (p.text.length > 75 ? "..." : ""),
          }))}
        />
      )}

      {/* Lookahead Cache Engine & Teleprompter Master Panel */}
      {story && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Live Lookahead Pipeline & Voice Controls */}
          <div className="space-y-4">
            {/* 1. Lookahead Cache Pipeline Visualizer */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                    Lookahead Audio Cache
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/40">
                  {cachedCount}/{totalParagraphs} Cached ({cachePercent}%)
                </span>
              </div>

              {/* Cache Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-amber-500 transition-all duration-300 rounded-full"
                    style={{ width: `${cachePercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                  <span>Buffered in IndexedDB</span>
                  <span>{totalParagraphs - cachedCount} remaining</span>
                </div>
              </div>

              {/* Lookahead Ahead Window Depth */}
              <div className="pt-2 border-t border-stone-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-300 font-medium">Pre-Buffer Lookahead:</span>
                  <span className="font-mono text-amber-400 font-semibold">
                    {streamState.lookaheadCount} paragraphs ahead
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => storyStreamManager.setLookaheadCount(cnt)}
                      className={`flex-1 py-1 rounded-lg text-xs font-mono font-medium transition-all border ${
                        streamState.lookaheadCount === cnt
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                          : "bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200"
                      }`}
                    >
                      +{cnt}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-stone-400 leading-tight">
                  Automatically pre-synthesizes speech chunks ahead in background while current
                  paragraph is whispering.
                </p>
              </div>

              {/* Pre-Cache Entire Story Button */}
              <div className="pt-2 border-t border-stone-800/60">
                {streamState.isPreCachingAll ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-purple-300">
                      <span className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Caching Paragraph {streamState.preCacheProgress.current} /{" "}
                        {streamState.preCacheProgress.total}
                      </span>
                      <button
                        onClick={() => storyStreamManager.cancelPreCacheAll()}
                        className="text-[10px] text-red-400 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => storyStreamManager.preCacheEntireStory()}
                    disabled={cachePercent >= 100}
                    className="w-full py-2 px-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 disabled:opacity-40 border border-purple-800/40 text-purple-200 text-xs font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span>
                      {cachePercent >= 100
                        ? "All Paragraphs Pre-Cached"
                        : "Pre-Cache Entire Story (Offline Mode)"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* 2. Voice & Tone Configurations */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-300 font-semibold text-xs uppercase tracking-wider">
                  <Feather className="w-4 h-4 text-amber-400" />
                  <span>Story Voice Settings</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-950 text-amber-300 border border-stone-800">
                  {activePersona.name}
                </span>
              </div>

              {/* Voice Actor Selector */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-400">Voice Actor</span>
                  <span className="text-stone-400 font-mono text-[10px]">
                    Signature: <strong className="text-amber-300">{activePersona.defaultVoice}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["Kore", "Aoede", "Zephyr", "Puck", "Fenrir", "Charon"] as VoiceName[]).map(
                    (vName) => {
                      const isSelected = selectedVoice === vName;
                      const isPersonaDefault = activePersona.defaultVoice === vName;
                      return (
                        <button
                          key={vName}
                          onClick={() => onChangeVoice(vName)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all border relative ${
                            isSelected
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold"
                              : "bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200"
                          }`}
                        >
                          <span>{vName}</span>
                          {isPersonaDefault && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" title="Persona signature voice" />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Persona AI Directive Notice */}
              <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 text-[11px] text-stone-400 space-y-1">
                <div className="flex items-center justify-between text-stone-300">
                  <span className="font-semibold">Cadence Directive:</span>
                  <span className="text-[10px] font-mono text-amber-400">{activePersona.badge}</span>
                </div>
                <p className="line-clamp-2 text-stone-400 leading-snug">
                  {activePersona.promptDirective}
                </p>
              </div>

              {/* Respiration Rest Gap Slider */}
              <div className="pt-2 border-t border-stone-800/60 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">Inter-Paragraph Respiration Gap:</span>
                  <span className="font-mono text-amber-400 font-semibold">
                    {mixerState.intervalRestSec}s
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="1"
                  value={mixerState.intervalRestSec}
                  onChange={(e) => onUpdateMixer({ intervalRestSec: parseInt(e.target.value) })}
                  className="w-full accent-amber-400 h-1.5 bg-stone-950 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-stone-400 font-mono block">
                  Continuous colored noise & brainwave entrainment stay active during pauses.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Teleprompter Story Viewer (2 columns wide) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Story Viewer Header & Controls */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
                <div>
                  <h3 className="text-base font-semibold text-stone-100">{story.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-stone-400 font-mono mt-0.5 flex-wrap">
                    <span>{story.author || "Unknown"}</span>
                    <span>•</span>
                    <span>{story.totalWords} words</span>
                    <span>•</span>
                    <span>{story.paragraphs.length} paragraphs</span>
                    <span>•</span>
                    <span className="text-amber-400 font-semibold">{activePersona.name}</span>
                  </div>
                </div>

                {/* Primary Streaming & Cinema Video Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Awake Replay vs Sleep Mode Pill */}
                  <div className="flex items-center p-0.5 rounded-lg bg-stone-950 border border-stone-800 text-xs">
                    <button
                      type="button"
                      onClick={() => storyStreamManager.setVideoPlaybackMode("day_audible")}
                      className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                        streamState.videoPlaybackMode === "day_audible"
                          ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 shadow-sm"
                          : "text-stone-400 hover:text-stone-200"
                      }`}
                      title="Awake Replay: 100% audible voice clarity"
                    >
                      <Sun className="w-3 h-3 text-amber-400" />
                      <span>Awake Mode</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => storyStreamManager.setVideoPlaybackMode("night_subliminal")}
                      className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                        streamState.videoPlaybackMode === "night_subliminal"
                          ? "bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30 shadow-sm"
                          : "text-stone-400 hover:text-stone-200"
                      }`}
                      title="Sleep Conditioning: Timed whisper-down ramp"
                    >
                      <Moon className="w-3 h-3 text-purple-400" />
                      <span>Sleep Ramp</span>
                    </button>
                  </div>

                  {/* Cinema Video Launcher */}
                  <button
                    type="button"
                    onClick={() => setIsCinemaModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-purple-950/50 flex items-center gap-1.5 cursor-pointer"
                    title="Watch entire story animated as a full video"
                  >
                    <Film className="w-3.5 h-3.5 text-amber-300" />
                    <span>Watch Video</span>
                  </button>

                  <button
                    onClick={() => storyStreamManager.prevParagraph()}
                    disabled={currentIdx <= 0}
                    className="p-2 rounded-xl bg-stone-950 hover:bg-stone-800 disabled:opacity-30 border border-stone-800 text-stone-300 cursor-pointer"
                    title="Previous Paragraph"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleTogglePlay}
                    className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
                      streamState.isPlaying
                        ? "bg-amber-400 text-stone-950 hover:bg-amber-300"
                        : "bg-amber-500 text-stone-950 hover:bg-amber-400"
                    }`}
                  >
                    {streamState.isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Stream</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => storyStreamManager.nextParagraph()}
                    disabled={currentIdx >= story.paragraphs.length - 1}
                    className="p-2 rounded-xl bg-stone-950 hover:bg-stone-800 disabled:opacity-30 border border-stone-800 text-stone-300 cursor-pointer"
                    title="Next Paragraph"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Live Status Bar */}
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {streamState.isPlaying ? (
                    streamState.isRestingBetweenParagraphs ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                    )
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-600" />
                  )}
                  <span className="font-mono text-stone-300">{streamState.statusMessage}</span>
                </div>

                <span className="text-[11px] font-mono text-amber-400/90 font-semibold">
                  Paragraph {currentIdx + 1} / {totalParagraphs}
                </span>
              </div>

              {/* Scrollable Teleprompter Paragraph List */}
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
                {story.paragraphs.map((p, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isLookahead =
                    idx > currentIdx && idx <= currentIdx + streamState.lookaheadCount;
                  const isCached = p.status === "cached" || !!p.audioBase64;
                  const isCaching = p.status === "caching";
                  const isPlayingThis = isCurrent && streamState.isPlaying;

                  return (
                    <div
                      key={p.id}
                      ref={isCurrent ? activeParagraphRef : null}
                      onClick={() => storyStreamManager.jumpToParagraph(idx)}
                      className={`p-4 rounded-xl transition-all border cursor-pointer group relative ${
                        isPlayingThis
                          ? "bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/40"
                          : isCurrent
                          ? "bg-stone-950 border-amber-500/30 ring-1 ring-amber-500/20"
                          : isLookahead
                          ? "bg-purple-950/10 border-purple-900/30 hover:border-purple-800/50"
                          : "bg-stone-950/40 border-stone-800/70 hover:border-stone-700 hover:bg-stone-900/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                              isCurrent
                                ? "bg-amber-400 text-stone-950"
                                : "bg-stone-900 text-stone-400 border border-stone-800"
                            }`}
                          >
                            § {idx + 1}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400">
                            {p.wordCount} words
                          </span>

                          {/* Multi-Character Speaker Tag */}
                          {story.isMultiCharacterEnabled && story.characters && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1"
                            >
                              <select
                                value={p.characterId || story.characters[0]?.id}
                                onChange={(e) => storyStreamManager.assignCharacterToParagraph(idx, e.target.value)}
                                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-indigo-300 border border-indigo-500/40 font-mono font-medium focus:outline-none cursor-pointer"
                              >
                                {story.characters.map((c) => (
                                  <option key={c.id} value={c.id} className="bg-slate-950 text-slate-200">
                                    {c.name} ({c.voiceName})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5">
                          {isPlayingThis ? (
                            <span className="flex items-center gap-1 text-[10px] font-mono font-medium text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                              <Volume2 className="w-3 h-3 animate-pulse text-amber-400" />
                              <span>
                                {story.isMultiCharacterEnabled && p.speakerName
                                  ? `[${p.speakerName}] Speaking`
                                  : `[${activePersona.name}] Whispering`}
                              </span>
                            </span>
                          ) : isCaching ? (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-800/40">
                              <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                              <span>Buffering...</span>
                            </span>
                          ) : isCached ? (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-green-300 bg-green-950/60 px-2 py-0.5 rounded-full border border-green-800/40">
                              <CheckCircle2 className="w-3 h-3 text-green-400" />
                              <span>In Cache</span>
                            </span>
                          ) : isLookahead ? (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-purple-400/80 bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-900/30">
                              <Zap className="w-3 h-3" />
                              <span>Lookahead</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-stone-400">Queued</span>
                          )}

                          {/* Quick trigger fetch button */}
                          {!isCached && !isCaching && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                storyStreamManager.fetchParagraphAudio(idx);
                              }}
                              className="p-1 rounded text-stone-400 hover:text-amber-300 hover:bg-stone-900"
                              title="Pre-synthesize this paragraph now"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Paragraph Text */}
                      <p
                        className={`text-sm leading-relaxed ${
                          isPlayingThis
                            ? "text-stone-100 font-medium"
                            : isCurrent
                            ? "text-stone-200 font-normal"
                            : "text-stone-400 group-hover:text-stone-300"
                        }`}
                      >
                        {p.text}
                      </p>

                      {/* Scene Mood & Cinema Quick-Play Tag */}
                      {p.sceneMood && (
                        <div className="mt-2.5 pt-2 border-t border-stone-800/50 flex items-center justify-between text-[10px] text-stone-400">
                          <span className="flex items-center gap-1 text-purple-300/90 font-mono">
                            <Film className="w-3 h-3 text-purple-400" />
                            <span>Scene: {p.sceneMood}</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              storyStreamManager.jumpToParagraph(idx);
                              setIsCinemaModalOpen(true);
                            }}
                            className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <span>Watch Scene</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Sleep Story Bible & Ramp Generator Modal */}
      <StoryBibleGeneratorModal
        isOpen={isBibleModalOpen}
        onClose={() => setIsBibleModalOpen(false)}
        onStoryGenerated={() => {
          setIsBibleModalOpen(false);
        }}
      />

      {/* Full Cinematic Video Player & Exporter Modal */}
      <StoryCinemaVideoPlayer
        isOpen={isCinemaModalOpen}
        onClose={() => setIsCinemaModalOpen(false)}
      />

      {/* Step-by-Step App Guidebook Modal */}
      <AppGuideBookModal
        isOpen={isGuideBookOpen}
        onClose={() => setIsGuideBookOpen(false)}
      />
    </div>
  );
}
