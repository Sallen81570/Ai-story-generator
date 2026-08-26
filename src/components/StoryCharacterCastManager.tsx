import React, { useState } from "react";
import {
  Users,
  Sparkles,
  UserPlus,
  Play,
  Square,
  Edit3,
  Trash2,
  Check,
  Volume2,
  BookOpen,
  Brain,
  Feather,
  Heart,
  Flame,
  Moon,
  Shield,
  Layers,
  Wand2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { StoryVoiceCharacter, VoiceName } from "../types";
import { storyStreamManager } from "../utils/storyStreamManager";
import { studioAudioEngine } from "../utils/audioEngine";
import { safeFetchJson } from "../utils/api";

interface StoryCharacterCastManagerProps {
  characters: StoryVoiceCharacter[];
  isMultiCharacterEnabled: boolean;
  totalParagraphs: number;
  paragraphAssignments: { index: number; characterId?: string; speakerName?: string; textSnippet: string }[];
  isAnalyzingCast: boolean;
}

const AVAILABLE_VOICES: { name: VoiceName; gender: string; description: string }[] = [
  { name: "Aoede", gender: "Female Alto", description: "Clear, grounded, classical storyteller" },
  { name: "Kore", gender: "Female Mezzo", description: "Warm, soothing, empathetic compassion" },
  { name: "Zephyr", gender: "Androgynous", description: "Airy, breathy ASMR & intimate whisper" },
  { name: "Fenrir", gender: "Male Baritone", description: "Deep, resonant, reverent ancient sage" },
  { name: "Puck", gender: "Male Tenor", description: "Dynamic, rhythmic, uplifting vitality" },
  { name: "Charon", gender: "Male Bass", description: "Somber, low, hypnotic sleep trance" },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  amber: { bg: "bg-amber-950/30", border: "border-amber-500/40", text: "text-amber-300", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  purple: { bg: "bg-purple-950/30", border: "border-purple-500/40", text: "text-purple-300", badge: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  emerald: { bg: "bg-emerald-950/30", border: "border-emerald-500/40", text: "text-emerald-300", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  rose: { bg: "bg-rose-950/30", border: "border-rose-500/40", text: "text-rose-300", badge: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  cyan: { bg: "bg-cyan-950/30", border: "border-cyan-500/40", text: "text-cyan-300", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  indigo: { bg: "bg-indigo-950/30", border: "border-indigo-500/40", text: "text-indigo-300", badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  orange: { bg: "bg-orange-950/30", border: "border-orange-500/40", text: "text-orange-300", badge: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  blue: { bg: "bg-blue-950/30", border: "border-blue-500/40", text: "text-blue-300", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
};

function renderAvatarIcon(icon: string, className = "w-4 h-4") {
  switch (icon) {
    case "sparkles":
      return <Sparkles className={className} />;
    case "brain":
      return <Brain className={className} />;
    case "heart":
      return <Heart className={className} />;
    case "feather":
      return <Feather className={className} />;
    case "flame":
      return <Flame className={className} />;
    case "moon":
      return <Moon className={className} />;
    case "shield":
      return <Shield className={className} />;
    case "book":
    default:
      return <BookOpen className={className} />;
  }
}

export const StoryCharacterCastManager: React.FC<StoryCharacterCastManagerProps> = ({
  characters,
  isMultiCharacterEnabled,
  totalParagraphs,
  paragraphAssignments,
  isAnalyzingCast,
}) => {
  const [editingCharacter, setEditingCharacter] = useState<StoryVoiceCharacter | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const [testingCharId, setTestingCharId] = useState<string | null>(null);

  // New character form state
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState<StoryVoiceCharacter["role"]>("protagonist");
  const [formVoice, setFormVoice] = useState<VoiceName>("Aoede");
  const [formDirective, setFormDirective] = useState("Speak gently and calmly with natural pauses");
  const [formDescription, setFormDescription] = useState("");
  const [formColor, setFormColor] = useState<StoryVoiceCharacter["colorTag"]>("purple");
  const [formIcon, setFormIcon] = useState("sparkles");

  const handleOpenEdit = (char: StoryVoiceCharacter) => {
    setEditingCharacter(char);
    setFormName(char.name);
    setFormRole(char.role);
    setFormVoice(char.voiceName);
    setFormDirective(char.customDirective);
    setFormDescription(char.description);
    setFormColor(char.colorTag || "purple");
    setFormIcon(char.avatarIcon || "sparkles");
    setIsCreatingNew(false);
  };

  const handleOpenCreate = () => {
    setIsCreatingNew(true);
    setEditingCharacter(null);
    setFormName("New Character");
    setFormRole("protagonist");
    setFormVoice("Zephyr");
    setFormDirective("Speak in an intimate, soft, breathy whisper with soothing warmth");
    setFormDescription("A newly cast voice character in the story");
    setFormColor("emerald");
    setFormIcon("feather");
  };

  const handleSaveCharacter = () => {
    if (!formName.trim()) return;

    if (isCreatingNew) {
      const newChar: StoryVoiceCharacter = {
        id: `char_custom_${Date.now()}`,
        name: formName.trim(),
        role: formRole,
        voiceName: formVoice,
        customDirective: formDirective.trim(),
        description: formDescription.trim() || `${formName} voice delivery`,
        colorTag: formColor,
        avatarIcon: formIcon,
      };
      storyStreamManager.addCharacter(newChar);
      setIsCreatingNew(false);
    } else if (editingCharacter) {
      const updatedChar: StoryVoiceCharacter = {
        ...editingCharacter,
        name: formName.trim(),
        role: formRole,
        voiceName: formVoice,
        customDirective: formDirective.trim(),
        description: formDescription.trim(),
        colorTag: formColor,
        avatarIcon: formIcon,
      };
      storyStreamManager.updateCharacter(updatedChar);
      setEditingCharacter(null);
    }
  };

  const handleTestVoice = async (char: StoryVoiceCharacter) => {
    if (testingCharId) return;
    setTestingCharId(char.id);

    try {
      const sampleText = `Greetings. I am ${char.name}. I will be speaking in this story with this exact vocal cadence.`;
      const res = await safeFetchJson<{ audioBase64: string }>("/api/synthesize-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sampleText,
          voiceName: char.voiceName,
          customDirective: char.customDirective,
        }),
      });

      if (res.ok && res.data?.audioBase64) {
        await studioAudioEngine.playVoiceChunk(`test_char_${char.id}`, res.data.audioBase64, () => {
          setTestingCharId(null);
        });
      } else {
        setTestingCharId(null);
      }
    } catch {
      setTestingCharId(null);
    }
  };

  // Count paragraphs for each character
  const charParagraphCounts: Record<string, number> = {};
  paragraphAssignments.forEach((p) => {
    const cid = p.characterId || characters[0]?.id || "char_narrator";
    charParagraphCounts[cid] = (charParagraphCounts[cid] || 0) + 1;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl p-5 backdrop-blur-md shadow-2xl space-y-5">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-100">AI Story Voice Cast & Dynamic Characters</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Multi-Voice Synthesis
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Assign distinct Gemini AI voice actors & customized delivery directives to story characters on the fly
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle Multi-Character Mode */}
          <button
            onClick={() => storyStreamManager.toggleMultiCharacterMode()}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isMultiCharacterEnabled
                ? "bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isMultiCharacterEnabled ? "Multi-Character Mode: ON" : "Multi-Character Mode: OFF"}</span>
          </button>

          {/* AI Auto-Cast Button */}
          <button
            onClick={() => storyStreamManager.autoCastStoryCharacters()}
            disabled={isAnalyzingCast}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20 border border-purple-400/30 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isAnalyzingCast ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI Casting Voices...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>AI Auto-Cast Story</span>
              </>
            )}
          </button>

          {/* Add Character Button */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Custom</span>
          </button>
        </div>
      </div>

      {/* Cast Roster Cards Grid */}
      {isMultiCharacterEnabled && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Active Story Cast ({characters.length} Voice Characters)</span>
            <button
              onClick={() => setShowMatrix(!showMatrix)}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
            >
              <span>{showMatrix ? "Hide Paragraph Assignment Matrix" : "View / Reassign Paragraphs"}</span>
              {showMatrix ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {characters.map((char) => {
              const colors = COLOR_MAP[char.colorTag] || COLOR_MAP.purple;
              const count = charParagraphCounts[char.id] || 0;
              const isTesting = testingCharId === char.id;

              return (
                <div
                  key={char.id}
                  className={`relative p-4 rounded-xl border ${colors.border} ${colors.bg} backdrop-blur-sm flex flex-col justify-between gap-3 transition-all hover:shadow-lg`}
                >
                  {/* Top row: Avatar, Name, Archetype */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg border ${colors.border} flex items-center justify-center ${colors.text} bg-slate-900/60`}>
                        {renderAvatarIcon(char.avatarIcon, "w-4 h-4")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-100">{char.name}</h4>
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${colors.badge}`}>
                            {char.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{char.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Middle row: Voice actor & Directive */}
                  <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 text-[11px]">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Base Voice Actor:</span>
                      <span className="font-mono font-semibold text-indigo-300">{char.voiceName}</span>
                    </div>
                    <div className="text-slate-400 italic line-clamp-2">
                      &ldquo;{char.customDirective}&rdquo;
                    </div>
                  </div>

                  {/* Bottom row: Paragraph count & actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {count} {count === 1 ? "paragraph" : "paragraphs"} ({Math.round((count / (totalParagraphs || 1)) * 100)}%)
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Test Voice Button */}
                      <button
                        onClick={() => handleTestVoice(char)}
                        disabled={isTesting}
                        title="Audition voice cadence"
                        className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isTesting ? <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <Play className="w-3.5 h-3.5" />}
                      </button>

                      {/* Edit Character */}
                      <button
                        onClick={() => handleOpenEdit(char)}
                        title="Edit character voice & directives"
                        className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Character */}
                      {characters.length > 1 && (
                        <button
                          onClick={() => storyStreamManager.deleteCharacter(char.id)}
                          title="Remove character"
                          className="p-1.5 rounded-md bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Paragraph Assignment Matrix (Collapsible) */}
      {isMultiCharacterEnabled && showMatrix && (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 pb-2 border-b border-slate-800">
            <span className="font-semibold">Paragraph Voice Character Assignments</span>
            <span className="text-slate-400">Click any paragraph to reassign speaker</span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {paragraphAssignments.map((p) => {
              const currentChar = characters.find((c) => c.id === p.characterId) || characters[0];
              const colors = COLOR_MAP[currentChar?.colorTag || "amber"] || COLOR_MAP.amber;

              return (
                <div
                  key={p.index}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="font-mono text-slate-400 w-6 shrink-0">§{p.index + 1}</span>
                    <span className="text-slate-300 truncate max-w-md">{p.textSnippet}</span>
                  </div>

                  {/* Character Selector Dropdown */}
                  <select
                    value={currentChar?.id}
                    onChange={(e) => storyStreamManager.assignCharacterToParagraph(p.index, e.target.value)}
                    aria-label={`Assign speaker for paragraph ${p.index + 1}`}
                    className={`text-xs px-2.5 py-1 rounded-md border ${colors.border} ${colors.bg} ${colors.text} font-medium bg-slate-900 focus:outline-none cursor-pointer`}
                  >
                    {characters.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                        {c.name} ({c.voiceName})
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit / Create Character Modal */}
      {(editingCharacter || isCreatingNew) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-slate-100">
                {isCreatingNew ? "Add Voice Character to Cast" : `Edit Voice Character: ${editingCharacter?.name}`}
              </h3>
              <button
                onClick={() => {
                  setEditingCharacter(null);
                  setIsCreatingNew(false);
                }}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Character Name & Role */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Character Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Master Eldrin, Subconscious Voice"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Story Role / Archetype</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="narrator">Narrator (Grounding Storyteller)</option>
                    <option value="sage">Sage / Mentor (Deep Wisdom)</option>
                    <option value="inner_voice">Inner Voice (ASMR Subconscious)</option>
                    <option value="protagonist">Protagonist (Hero / Lead)</option>
                    <option value="companion">Companion (Warm Caregiver)</option>
                    <option value="elder">Elder (Ancient Reverence)</option>
                    <option value="ethereal">Ethereal Spirit (Hypnotic)</option>
                    <option value="custom">Custom Character</option>
                  </select>
                </div>
              </div>

              {/* Base Gemini Voice Actor */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Gemini TTS Base Voice Actor</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_VOICES.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setFormVoice(v.name)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        formVoice === v.name
                          ? "bg-indigo-600/30 border-indigo-400 text-indigo-200"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="font-semibold text-xs text-slate-200">{v.name}</div>
                      <div className="text-[10px] text-slate-400">{v.gender}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt Directive */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Gemini TTS Acoustic Directive (Prompt Instruction)</label>
                <textarea
                  rows={3}
                  value={formDirective}
                  onChange={(e) => setFormDirective(e.target.value)}
                  placeholder="e.g. Speak with reverent, spacious, meditative serenity and timeless wisdom..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400">
                  This custom instruction steers the emotional timbre, breath pacing, and presence of this character on the fly.
                </p>
              </div>

              {/* Color & Icon Theme */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Color Theme</label>
                  <select
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="amber">Amber Gold</option>
                    <option value="purple">Mystic Purple</option>
                    <option value="emerald">Emerald Forest</option>
                    <option value="rose">Rose Compassion</option>
                    <option value="cyan">Cyan Third-Eye</option>
                    <option value="indigo">Indigo Midnight</option>
                    <option value="blue">Celestial Blue</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Avatar Icon</label>
                  <select
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="book">Book (Storyteller)</option>
                    <option value="sparkles">Sparkles (Cosmic / Magic)</option>
                    <option value="brain">Brain (Sage / Wisdom)</option>
                    <option value="heart">Heart (Healing / Care)</option>
                    <option value="feather">Feather (Airy / ASMR)</option>
                    <option value="moon">Moon (Night / Sleep)</option>
                    <option value="shield">Shield (Stoic / Guard)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setEditingCharacter(null);
                  setIsCreatingNew(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCharacter}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Character</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
