import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Sliders,
  Moon,
  Sun,
  Waves,
  Sparkles,
  Volume2,
  Film,
  Download,
  Users,
  Brain,
  ShieldCheck,
  ChevronRight,
  Play,
  Layers,
  ArrowRight,
  HelpCircle,
  Clock,
} from "lucide-react";

interface AppGuideBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppGuideBookModal: React.FC<AppGuideBookModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "with_subliminal" | "without_subliminal" | "video_studio" | "faq">("overview");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-stone-100 font-semibold text-base">
                  Studio Guidebook & Master Manual
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Step-by-Step
                </span>
              </div>
              <p className="text-stone-400 text-xs">
                How to use every feature with subliminal sleep masking vs. without subliminals (regular listening & video)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-stone-800/80 bg-stone-950/50 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === "overview"
                ? "bg-stone-800 text-stone-100 border border-stone-700 shadow-sm"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1. Quick Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("with_subliminal")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === "with_subliminal"
                ? "bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm"
                : "text-stone-400 hover:text-purple-300"
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-purple-400" />
            <span>2. WITH Subliminal Sleep Masking</span>
          </button>

          <button
            onClick={() => setActiveTab("without_subliminal")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === "without_subliminal"
                ? "bg-amber-600/30 text-amber-200 border border-amber-500/40 shadow-sm"
                : "text-stone-400 hover:text-amber-300"
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>3. WITHOUT Subliminal (Regular Play & Audiobooks)</span>
          </button>

          <button
            onClick={() => setActiveTab("video_studio")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === "video_studio"
                ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm"
                : "text-stone-400 hover:text-indigo-300"
            }`}
          >
            <Film className="w-3.5 h-3.5 text-indigo-400" />
            <span>4. Cinematic Video & Storyboard</span>
          </button>

          <button
            onClick={() => setActiveTab("faq")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === "faq"
                ? "bg-stone-800 text-stone-100 border border-stone-700 shadow-sm"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>5. Pro Tips & FAQs</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto text-xs text-stone-300 leading-relaxed space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-5 space-y-3">
                <h3 className="text-stone-100 font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Welcome to the Subliminal AI Studio</span>
                </h3>
                <p>
                  This studio allows you to create, synthesize, customize, and experience both <strong>therapeutic sleep conditioning programs</strong> and <strong>cinematic story audiobooks & videos</strong> using state-of-the-art Web Audio DSP and Google Gemini AI.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-stone-900/80 border border-purple-500/20 space-y-1.5">
                    <strong className="text-purple-300 flex items-center gap-1.5 font-semibold text-xs">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <span>Story & Ebook Streamer</span>
                    </strong>
                    <p className="text-[11px] text-stone-400 leading-normal">
                      Stream full chapters, PDFs, or AI-generated Story Bibles with multi-character voice actors and timed sleep ramps.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-900/80 border border-amber-500/20 space-y-1.5">
                    <strong className="text-amber-300 flex items-center gap-1.5 font-semibold text-xs">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>Affirmation Matrix</span>
                    </strong>
                    <p className="text-[11px] text-stone-400 leading-normal">
                      Loop curated or custom positive affirmations with customizable colored noise beds and binaural Solfeggio tones.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-900/80 border border-indigo-500/20 space-y-1.5">
                    <strong className="text-indigo-300 flex items-center gap-1.5 font-semibold text-xs">
                      <Film className="w-4 h-4 text-indigo-400" />
                      <span>Cinema Video Studio</span>
                    </strong>
                    <p className="text-[11px] text-stone-400 leading-normal">
                      Watch your stories animated with AI-generated visual scene storyboards, Ken Burns slow-pan camera motion, and kinetic subtitles.
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Philosophy: With vs Without Subliminal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                    Mode A
                  </span>
                  <h4 className="text-sm font-semibold text-purple-200">With Subliminal Masking (For Sleep)</h4>
                  <p className="text-stone-300 text-[11px]">
                    The voice is acoustically filtered (low-pass 2,200 Hz to remove harsh consonants) and attenuated down to <strong>-26 dB</strong> beneath an acoustic noise bed (Brown/Pink noise + 432 Hz / 528 Hz binaural beats).
                  </p>
                  <ul className="space-y-1 text-[11px] text-stone-400 list-disc list-inside">
                    <li>Bypasses conscious critical faculties</li>
                    <li>Prevents sleep disruption and K-complex arousals</li>
                    <li>Loops conditioning affirmations or stories all night</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    Mode B
                  </span>
                  <h4 className="text-sm font-semibold text-amber-200">Without Subliminal (Regular / Awake Play)</h4>
                  <p className="text-stone-300 text-[11px]">
                    The voice is played at <strong>100% audible clarity (0 dB)</strong> with full acoustic dynamics, allowing you to listen like a regular multi-cast audiobook or cinematic movie.
                  </p>
                  <ul className="space-y-1 text-[11px] text-stone-400 list-disc list-inside">
                    <li>Audible storytelling, character dialogues, and acting</li>
                    <li>Daytime relaxation, meditation, or focus study</li>
                    <li>Cinematic video playback with synchronized captions</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WITH SUBLIMINAL */}
          {activeTab === "with_subliminal" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4 flex items-center gap-3">
                <Moon className="w-8 h-8 text-purple-400 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-purple-200">
                    Method 1: Step-by-Step Guide WITH Subliminal Sleep Masking
                  </h3>
                  <p className="text-[11px] text-purple-300/80">
                    Follow these 4 steps to set up all-night subconscious conditioning and sleep induction.
                  </p>
                </div>
              </div>

              {/* Step 1 */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-xs">
                    1
                  </span>
                  <h4>Generate Your Sleep Conditioning Story Bible (or Select Affirmations)</h4>
                </div>
                <p className="text-stone-300">
                  Click the <strong>"🌙 AI Sleep Bible & Ramp Studio"</strong> button in the Story panel (or select a preset in the Affirmations Matrix).
                </p>
                <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800 text-[11px] space-y-1 text-stone-400">
                  <p>• <strong>Plot / Lore Idea</strong>: Type any premise (e.g., <em>"A peaceful forest sanctuary with gentle rain and wise guardians"</em>).</p>
                  <p>• <strong>Subconscious Reprogramming Focus</strong>: Enter your target intent (e.g., <em>"deep cellular regeneration, releasing tension, confidence"</em>).</p>
                  <p>• Click <strong>"Generate Story Bible with AI"</strong> and then <strong>"Write Full Sleep Story"</strong>.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-xs">
                    2
                  </span>
                  <h4>Configure the Timed Whisper-Down Sleep Ramp</h4>
                </div>
                <p className="text-stone-300">
                  In the <strong>Sleep Ramp Control Bar</strong>, ensure the toggle is switched to <strong>"Sleep Ramp"</strong> (purple).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-stone-900/70 border border-stone-800">
                    <strong className="text-amber-300 block">Stage 1: Alpha State (Minutes 0–5)</strong>
                    <span className="text-stone-400">Voice starts at 0 dB (audible) to engage your conscious mind as you settle into bed.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-900/70 border border-stone-800">
                    <strong className="text-purple-300 block">Stage 2: Theta Whisper (Minutes 5–20)</strong>
                    <span className="text-stone-400">Voice volume ramps downward continuously into an intimate whisper (-12 dB).</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-900/70 border border-stone-800">
                    <strong className="text-indigo-300 block">Stage 3: Subconscious Masking (-26 dB)</strong>
                    <span className="text-stone-400">Voice locks safely beneath the brown noise floor so your conscious mind stops tracking words.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-900/70 border border-stone-800">
                    <strong className="text-emerald-300 block">Stage 4: Delta All-Night Loop</strong>
                    <span className="text-stone-400">Conditioning affirmations continue looping all night to reinforce neuroplastic learning.</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-xs">
                    3
                  </span>
                  <h4>Select Your Acoustic Masking Bed in the DSP Mixer</h4>
                </div>
                <p className="text-stone-300">
                  Open the <strong>Acoustic Mixer Console</strong> to fine-tune your background frequencies:
                </p>
                <ul className="space-y-1 text-[11px] text-stone-400 list-disc list-inside">
                  <li><strong>Colored Noise</strong>: Choose <strong>Deep Brown Noise</strong> (rumbling waterfall/fan) or <strong>Pink Noise</strong> (gentle rain). Set volume to ~80%.</li>
                  <li><strong>Brainwave / Solfeggio</strong>: Set to <strong>Theta (4.5 Hz – 6.0 Hz)</strong> or <strong>Delta (1.5 Hz – 2.5 Hz)</strong> with a 528 Hz or 432 Hz Solfeggio carrier frequency.</li>
                  <li><strong>Low-Pass Filter</strong>: Ensure it is set to <strong>2,200 Hz</strong> to eliminate harsh consonants.</li>
                </ul>
              </div>

              {/* Step 4 */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-xs">
                    4
                  </span>
                  <h4>Press "Stream Story" or "Live Audition" & Drift Off</h4>
                </div>
                <p className="text-stone-300">
                  Put on comfortable sleep headphones or place your device near your bed. Press <strong>Stream Story</strong>. The AI voice will smoothly guide you down into restorative sleep while your subconscious absorbs the conditioning affirmations all night.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: WITHOUT SUBLIMINAL */}
          {activeTab === "without_subliminal" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
                <Sun className="w-8 h-8 text-amber-400 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-200">
                    Method 2: Step-by-Step Guide WITHOUT Subliminals (Regular Audiobooks & Daytime Play)
                  </h3>
                  <p className="text-[11px] text-amber-300/80">
                    How to enjoy stories, uploaded PDFs, and multi-character voice casts at full audible clarity.
                  </p>
                </div>
              </div>

              {/* Step 1 */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-xs">
                    1
                  </span>
                  <h4>Switch Playback to "Awake Mode"</h4>
                </div>
                <p className="text-stone-300">
                  In the top playback controls of the Story Streamer or Cinema Player, click <strong>"☀️ Awake Mode"</strong>.
                </p>
                <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800 text-[11px] space-y-1 text-stone-400">
                  <p>• This automatically disables the subliminal attenuation down-ramp.</p>
                  <p>• Voices will play at <strong>100% full volume (0 dB)</strong> with clear articulation and natural dynamic range.</p>
                  <p>• Background noise and binaural beats can be lowered to 10–20% or muted completely according to your taste.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-xs">
                    2
                  </span>
                  <h4>Load Your Content (Preset, PDF, TXT, or Paste)</h4>
                </div>
                <p className="text-stone-300">
                  Choose how you want to bring in your book or script:
                </p>
                <ul className="space-y-1 text-[11px] text-stone-400 list-disc list-inside">
                  <li><strong>Preset Library</strong>: Pick classic long-form stories like <em>The Celestial Clockmaker</em> or <em>The Old Astronomer</em>.</li>
                  <li><strong>Upload PDF / TXT</strong>: Drag and drop any novel, research paper, or essay from your computer.</li>
                  <li><strong>Paste Text</strong>: Paste your custom script or story chapters directly into the box.</li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-xs">
                    3
                  </span>
                  <h4>Customize Multi-Character Voice Actors</h4>
                </div>
                <p className="text-stone-300">
                  The AI automatically detects characters in the story (e.g., <em>Narrator, Elder, Captain, Guide</em>) and assigns distinct Gemini AI voices (e.g., Puck, Aoede, Fenrir, Charon).
                </p>
                <p className="text-stone-400 text-[11px]">
                  You can click any character chip in the <strong>AI Voice Cast Manager</strong> to change their assigned actor, adjust gender tone, or write custom directorial prompts.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-xs">
                    4
                  </span>
                  <h4>Adjust Reading Speed & Respiration Pacing</h4>
                </div>
                <p className="text-stone-300">
                  Use the <strong>Whisper Persona Selector</strong> to choose your narration energy:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded bg-stone-900 border border-stone-800 text-center">
                    <strong className="text-amber-300 block">Calm Narrator</strong>
                    <span className="text-stone-400">Warm, balanced, classic</span>
                  </div>
                  <div className="p-2 rounded bg-stone-900 border border-stone-800 text-center">
                    <strong className="text-purple-300 block">Soft Intimate</strong>
                    <span className="text-stone-400">Close-mic, soothing</span>
                  </div>
                  <div className="p-2 rounded bg-stone-900 border border-stone-800 text-center">
                    <strong className="text-indigo-300 block">Deep Resonant</strong>
                    <span className="text-stone-400">Rich, cinematic bass</span>
                  </div>
                  <div className="p-2 rounded bg-stone-900 border border-stone-800 text-center">
                    <strong className="text-emerald-300 block">Ethereal Guide</strong>
                    <span className="text-stone-400">Floaty, gentle, airy</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VIDEO STUDIO */}
          {activeTab === "video_studio" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-4 flex items-center gap-3">
                <Film className="w-8 h-8 text-indigo-400 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-indigo-200">
                    Cinema Video Studio & Visual Storyboard Generation
                  </h3>
                  <p className="text-[11px] text-indigo-300/80">
                    Transform any story into a full-length cinematic visual video with synchronized multi-character audio.
                  </p>
                </div>
              </div>

              {/* Steps for Video */}
              <div className="space-y-3">
                <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>Launch the Cinema Player</span>
                  </h4>
                  <p className="text-stone-300">
                    Click the <strong>"🎬 Watch Video"</strong> button on the Story Streamer toolbar or click <strong>"Watch Scene"</strong> on any individual paragraph.
                  </p>
                </div>

                <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>Generate AI Visual Storyboard</span>
                  </h4>
                  <p className="text-stone-300">
                    In the video player's top bar, click <strong>"AI Storyboard"</strong>. Gemini AI analyzes each paragraph and generates cinematic concept art prompts, color atmospheres, and specific camera movement paths (e.g. <em>slow zoom in, smooth pan right, floating tilt</em>).
                  </p>
                </div>

                <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>Enjoy Interactive Playback</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                    <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                      <strong className="text-stone-200 block">Subtitles & Speaker Badges</strong>
                      <span className="text-stone-400">Toggle on-screen synchronized kinetic subtitles and speaker voice tags.</span>
                    </div>
                    <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                      <strong className="text-stone-200 block">Scene Filmstrip Carousel</strong>
                      <span className="text-stone-400">Jump directly to any chapter or scene thumbnail along the bottom bar.</span>
                    </div>
                    <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                      <strong className="text-stone-200 block">Awake vs Sleep Switcher</strong>
                      <span className="text-stone-400">Switch on-the-fly between full audible narration or sleep subliminal volume.</span>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-[10px]">
                      4
                    </span>
                    <span>Export Video File</span>
                  </h4>
                  <p className="text-stone-300">
                    Click <strong>"Export Video"</strong> to package and download your synchronized audiovisual story ready for offline viewing on TVs, phones, or sleep monitors.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAQ & PRO TIPS */}
          {activeTab === "faq" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-semibold text-amber-300">
                  Q: What headphones or speakers should I use for Subliminals?
                </h4>
                <p className="text-stone-300">
                  For subliminal sleep conditioning with binaural beats, <strong>stereo headphones or sleep headband speakers</strong> are recommended because binaural beats require separate frequency inputs into each ear (e.g. 216 Hz left ear, 222 Hz right ear to induce a 6 Hz Theta brainwave). For regular awake audiobook listening, room speakers or headphones work great.
                </p>
              </div>

              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-semibold text-amber-300">
                  Q: How do I test if the voice is playing if I can't hear it in subliminal mode?
                </h4>
                <p className="text-stone-300">
                  In the <strong>Acoustic Mixer Console</strong>, click the <strong>"Voice Solo (Audition)"</strong> toggle. This temporarily boosts the voice to 0 dB and mutes the background noise so you can verify the audio chunk is reciting properly before locking it back into subliminal masking.
                </p>
              </div>

              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-semibold text-amber-300">
                  Q: Can I export audio for offline listening?
                </h4>
                <p className="text-stone-300">
                  Yes! Click <strong>"Export Master WAV"</strong> in the top header. You can configure duration (15 min to 8 hours), target sleep stage, and master low-pass filters to render a high-fidelity 48kHz stereo WAV file.
                </p>
              </div>

              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-semibold text-amber-300">
                  Q: Can I write my own custom affirmations or upload my own books?
                </h4>
                <p className="text-stone-300">
                  Yes! In the <strong>Affirmation Matrix</strong>, type any phrase and press Enter or use the <strong>AI Protocol Generator</strong>. In the <strong>Story Streamer</strong>, use the <strong>Upload PDF / TXT</strong> or <strong>Paste Text</strong> tabs to load any text.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-800 bg-stone-950 flex items-center justify-between">
          <span className="text-[11px] text-stone-400">
            Tip: Switch tabs above for detailed step-by-step instructions.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition-colors cursor-pointer shadow-md shadow-amber-500/20"
          >
            Got It, Let&apos;s Build!
          </button>
        </div>
      </div>
    </div>
  );
};
