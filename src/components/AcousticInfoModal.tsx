import React from "react";
import { X, ShieldCheck, Waves, Brain, Sparkles, Volume2, Code2, Database, Moon, Users, Film } from "lucide-react";

interface AcousticInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcousticInfoModal: React.FC<AcousticInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-stone-100 font-semibold text-sm">
                Acoustic Science & Subliminal Masking
              </h3>
              <p className="text-stone-400 text-xs">The DSP Architecture Behind Sleep Conditioning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-stone-300 leading-relaxed">
          {/* Section 1: Acoustic Softening */}
          <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <h4>1. Acoustic Softening (Low-Pass Filter at 2200 Hz)</h4>
            </div>
            <p>
              Human speech contains sharp, transient high frequencies in sibilant consonants like <em>/s/, /t/, /k/, /ch/</em> (typically vibrating between 3,500 Hz and 8,000 Hz). In light NREM sleep, these sharp transients trigger the brain's <strong>K-complex arousal reflex</strong>, disrupting sleep.
            </p>
            <p className="text-stone-400">
              By applying a 2nd-order Butterworth low-pass filter at <strong>2200 Hz</strong>, all jarring consonants are eliminated while preserving the warm fundamental vocal formants (100 Hz – 1,800 Hz). The voice becomes a gentle harmonic murmur.
            </p>
          </div>

          {/* Section 2: Subliminal Attenuation */}
          <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <Volume2 className="w-4 h-4" />
              <h4>2. Psychoacoustic Subliminal Masking (-26 dB Under Noise Floor)</h4>
            </div>
            <p>
              Subconscious suggestibility occurs when sensory input is presented just below the <strong>absolute threshold of conscious auditory discrimination</strong>.
            </p>
            <p className="text-stone-400">
              At <strong>-26 dB</strong> attenuation relative to the continuous noise bed, the conscious mind perceives only uniform, relaxing noise, preventing critical mental debate or analytical resistance. However, the subconscious auditory cortex continues to decode the acoustic phonetic envelope without waking the sleeper.
            </p>
          </div>

          {/* Section 3: Deep Brown Noise Bed */}
          <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <Waves className="w-4 h-4" />
              <h4>3. The Full Spectrum of Colored Noises & Acoustic Beds</h4>
            </div>
            <p>
              Different acoustic colors possess distinct mathematical power spectral density (PSD) slopes and psychoacoustic properties:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-[11px]">
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-amber-900/30">
                <strong className="text-amber-300 block">🌋 Deep Brown (1/f² / -6 dB/oct)</strong>
                <span className="text-stone-400">Deep, warm, low-frequency rumble mimicking waterfalls and intrauterine resonance. Ideal for sleep & masking.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-pink-900/30">
                <strong className="text-pink-300 block">🌸 Pink Noise (1/f / -3 dB/oct)</strong>
                <span className="text-stone-400">Equal energy per octave. Balanced, natural soundscape matching brainwave rhythms and nocturnal memory consolidation.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-stone-700/40">
                <strong className="text-stone-200 block">⚡ White Noise (0 dB/oct Flat)</strong>
                <span className="text-stone-400">Equal power across all frequencies. Strongest clinical acoustic masking against sudden sharp erratic noises.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-sky-900/30">
                <strong className="text-sky-300 block">🔷 Blue Noise (+3 dB/oct Azure)</strong>
                <span className="text-stone-400">Power rises with frequency. Crisp high-frequency clarity that boosts daytime alertness, focus, and precision.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-purple-900/30">
                <strong className="text-purple-300 block">🔮 Violet / Purple (+6 dB/oct)</strong>
                <span className="text-stone-400">Differentiated white noise. High-frequency sheen frequently utilized for tinnitus masking and auditory stimulation.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-slate-700/40">
                <strong className="text-slate-300 block">🔘 Grey Noise (Equal Loudness)</strong>
                <span className="text-stone-400">Inverted Fletcher-Munson psychoacoustic curve; human ears perceive all frequencies at exactly identical loudness.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-emerald-900/30">
                <strong className="text-emerald-300 block">🍃 Green Noise (500–2200 Hz)</strong>
                <span className="text-stone-400">Mid-range natural frequency center. Emulates ambient wilderness, forest wind, and soothing foliage rustle.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-indigo-950/60">
                <strong className="text-indigo-300 block">🌌 Black Noise (&lt;100 Hz Sub-Bass)</strong>
                <span className="text-stone-400">Infra-acoustic deep planetary rumble and quiet void. Removes all high frequencies for heavy soothing stillness.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-cyan-900/30 sm:col-span-2">
                <strong className="text-cyan-300 block">🌊 Ocean Tides & 🌧️ Rainstorm (Natural Soundscapes)</strong>
                <span className="text-stone-400">Dynamic phase-modulated acoustic waves and stochastic water droplet textures designed to relax cardiac rhythm.</span>
              </div>
            </div>
          </div>

          {/* Section 4: Binaural Entrainment & DMT Pineal Science */}
          <div className="bg-stone-950/60 border border-purple-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
              <Brain className="w-4 h-4" />
              <h4>4. Binaural Beats, DMT Pineal Resonance & Frequency Entrainment</h4>
            </div>
            <p>
              When two coherent sine waves of slightly different frequencies are delivered into each ear via stereo headphones (e.g. 200 Hz Left, 205.5 Hz Right), the superior olivary complex inside the brainstem computes the phase differential, generating an internal <strong>neurological beat frequency (5.5 Hz Theta)</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-purple-900/30">
                <strong className="text-purple-300 block">🌌 DMT Pineal Resonance (963 Hz + 40 Hz)</strong>
                <span className="text-stone-400">High crown carrier combined with 40 Hz gamma flash to elicit endogenous pineal gland piezoelectric stimulation and transcendent lucid awareness.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-indigo-900/30">
                <strong className="text-indigo-300 block">🌙 Delta Entrainment (0.5 – 4 Hz)</strong>
                <span className="text-stone-400">Slow wave sleep (SWS), human growth hormone release, cellular restoration, and somatic grounding.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-cyan-900/30">
                <strong className="text-cyan-300 block">🌀 Theta Waves & Schumann (4 – 8 Hz)</strong>
                <span className="text-stone-400">The gateway to the subconscious mind, hyper-suggestibility, hypnagogic vivid imagery, and Earth 7.83 Hz alignment.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-amber-900/30">
                <strong className="text-amber-300 block">✨ Solfeggio & Pyramidal Harmonics</strong>
                <span className="text-stone-400">Sacred tuning scales (432 Hz, 528 Hz, 639 Hz, 741 Hz, 852 Hz, 963 Hz) resonating with mathematical Fibonacci symmetry.</span>
              </div>
            </div>
          </div>

          {/* Section 5: Rhythm & 6-Second Intervals */}
          <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <h4>5. Respiration Sync & 6-Second Interval Gaps</h4>
            </div>
            <p>
              Continuous non-stop talking creates cognitive overload. The studio inserts a <strong>6-second silent rest</strong> between each synthesized affirmation. This rhythm synchronizes with <strong>Respiratory Sinus Arrhythmia (RSA)</strong> at ~6 breaths per minute, stimulating vagus nerve activation and promoting Delta brainwaves.
            </p>
          </div>

          {/* Section 6: Lookahead Paragraph Audio Cache Architecture */}
          <div className="bg-stone-950/60 border border-amber-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
              <Database className="w-4 h-4" />
              <h4>6. Ebook / PDF Lookahead Paragraph Audio Cache (Zero-Buffer Streaming)</h4>
            </div>
            <p>
              For long-form sleep books, PDFs, and meditation chapters, synthesizing an entire 100-paragraph book at once creates long wait times. The studio uses a rolling <strong>2–3 paragraph lookahead background worker</strong>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-stone-800">
                <strong className="text-amber-300 block">▶️ Instant Paragraph 1 Start</strong>
                <span className="text-stone-400">Begins whispering the first paragraph immediately with colored noise and brainwaves.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-purple-900/30">
                <strong className="text-purple-300 block">⚡ Background Lookahead Worker</strong>
                <span className="text-stone-400">Pre-fetches and saves paragraphs 2, 3, and 4 into browser IndexedDB cache while paragraph 1 plays.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-emerald-900/30">
                <strong className="text-emerald-300 block">🍃 Gapless Respiration Rest</strong>
                <span className="text-stone-400">Smooth transition with zero buffering and continuous acoustic masking bed.</span>
              </div>
            </div>
          </div>

          {/* Section 7: AI Whisper Personas & Delivery Styles */}
          <div className="bg-stone-950/60 border border-purple-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <h4>7. AI Whisper Personas & Psychoacoustic Cadences</h4>
            </div>
            <p>
              Gemini TTS supports specialized prompt directives that tailor phonetic tone, delivery speed, and emotional presence:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-amber-900/30">
                <strong className="text-amber-300 block">📖 Calm Narrator</strong>
                <span className="text-stone-400">Even cadence, warm low register, soothing bedtime pacing for classic stories.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-purple-900/30">
                <strong className="text-purple-300 block">🎧 Binaural Whisperer</strong>
                <span className="text-stone-400">Ultra-soft close-mic ASMR breathy murmuring directly for subconscious suggestibility.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-amber-500/30">
                <strong className="text-amber-400 block">⚡ Energetic Affirmator</strong>
                <span className="text-stone-400">Uplifting, clear, self-affirming vocal momentum paired with Beta/Gamma focus waves.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-indigo-900/30">
                <strong className="text-indigo-300 block">🌙 Hypnotic Somnambulist</strong>
                <span className="text-stone-400">Deep, elongated pauses with rhythmic down-glides for profound NREM-3 sleep induction.</span>
              </div>
            </div>
          </div>

          {/* Section 8: Dynamic Multi-Speaker Story Casting */}
          <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <h4>8. Dynamic Multi-Speaker Story Voice Casting</h4>
            </div>
            <p>
              How many distinct voice characters can AI Studio generate on the fly?
            </p>
            <p className="text-stone-400">
              The Gemini TTS engine supports <strong>6 distinct base voice actors</strong> (<em>Aoede, Kore, Zephyr, Puck, Fenrir, Charon</em>) ranging across baritones, mezzos, tenors, altos, and androgynous breath timbres. When paired with custom prompt directives (e.g., <em>&ldquo;reverent ancient sage&rdquo;</em> vs. <em>&ldquo;playful trickster spirit&rdquo;</em>), the system can synthesize an <strong>infinite variety of unique character roles</strong> on the fly.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
                <span className="font-semibold text-indigo-300 block">⚡ AI Cast Detection</span>
                <span className="text-stone-400">Gemini analyzes narrative text, extracts speaking characters, assigns archetypes, and maps each paragraph to the appropriate character.</span>
              </div>
              <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
                <span className="font-semibold text-indigo-300 block">🎭 Custom Character Overrides</span>
                <span className="text-stone-400">Add custom characters, fine-tune voice actors, audition 2-second voice samples, and reassign paragraphs in 1 click.</span>
              </div>
            </div>
          </div>

          {/* Section 9: AI Sleep Conditioning Story Bible & Timed Subliminal Ramp Engine */}
          <div className="bg-stone-950/60 border border-purple-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
              <Moon className="w-4 h-4" />
              <h4>9. AI Sleep Conditioning Story Bible & Timed Whisper-Down Ramp</h4>
            </div>
            <p>
              How does the All-Night Generated Sleep Conditioning Story work?
            </p>
            <p className="text-stone-400">
              You provide any plot, theme, or narrative concept. AI generates a full <strong>Story Bible</strong> structuring lore, character voice actors, and 4 sleep conditioning stages mapped to target brainwaves (Alpha, Theta, Delta).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-amber-900/30">
                <strong className="text-amber-300 block">📉 Timed Volume Ramp Descent</strong>
                <span className="text-stone-400">Begins at audible clarity (0 dB) to engage the conscious mind, gradually softens into a whisper (-12 dB), and locks into subliminal threshold (-26 dB) at your chosen minute.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-indigo-900/30">
                <strong className="text-indigo-300 block">🌌 All-Night Subconscious Loop</strong>
                <span className="text-stone-400">Once in deep sleep, late chapters and embedded affirmations loop continuously beneath the colored noise bed for 8 hours of restorative conditioning.</span>
              </div>
            </div>
          </div>

          {/* Section 10: Full Cinematic Video Studio & Awake Story Replay */}
          <div className="bg-stone-950/60 border border-amber-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
              <Film className="w-4 h-4" />
              <h4>10. AI Full Story Video Studio & Awake Replay Mode</h4>
            </div>
            <p>
              Can you watch the entire story come to life as a video or replay it normally when awake?
            </p>
            <p className="text-stone-400">
              Yes! The studio gives you two distinct playback and visual experiences for every story:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-amber-900/30">
                <strong className="text-amber-300 block">🎬 Full Cinematic Video Studio</strong>
                <span className="text-stone-400">Watch the story come to life with AI-generated visual scene storyboards, smooth Ken Burns slow-motion camera pan/zooms, live starlight particle fields, synchronized kinetic captions, and 1-click MP4/WebM video export.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-900/80 border border-indigo-900/30">
                <strong className="text-indigo-300 block">☀️ Daytime Awake Replay Mode</strong>
                <span className="text-stone-400">After waking up, switch instantly from night subliminal descent to 100% audible voice clarity (0 dB) to enjoy the story as a rich multi-cast audiobook at full volume.</span>
              </div>
            </div>
          </div>

          {/* Section 11: Python Script Comparison */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-stone-300 font-semibold text-sm">
              <Code2 className="w-4 h-4 text-amber-400" />
              <h4>Equivalence to Python `pydub` Script</h4>
            </div>
            <p className="text-stone-400">
              This application reproduces the exact DSP sequence:
            </p>
            <div className="bg-stone-950 p-2.5 rounded-lg font-mono text-[11px] text-amber-300/90 border border-stone-800">
              1. Gemini Voice (Kore) whisper prompt<br />
              2. voice_sequence.low_pass_filter(2200)<br />
              3. soft_voice.apply_gain(-26)<br />
              4. noise_bed.overlay(full_voice)<br />
              5. brainwave_entrainment.stereo_phase_modulate(carrier, beat)<br />
              6. lookahead_cache.stream_paragraph_rolling()<br />
              7. final_output.low_pass_filter(3500)
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-800 bg-stone-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
