import React, { useState, useEffect, useRef } from "react";
import { BinauralBeatDefinition } from "../types";
import { saveCustomBeat } from "../data/binauralBeats";
import {
  X,
  Plus,
  Radio,
  Sparkles,
  Volume2,
  VolumeX,
  Sliders,
  Flame,
  Atom,
  Check,
} from "lucide-react";

interface CustomFrequencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFrequencyCreated: (newBeat: BinauralBeatDefinition) => void;
  initialMode?: "binaural" | "dmt";
}

export const CustomFrequencyModal: React.FC<CustomFrequencyModalProps> = ({
  isOpen,
  onClose,
  onFrequencyCreated,
  initialMode = "binaural",
}) => {
  const [creatorTab, setCreatorTab] = useState<"binaural" | "dmt">(initialMode);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState<BinauralBeatDefinition["category"]>("theta");
  const [baseFreq, setBaseFreq] = useState<number>(220);
  const [beatFreq, setBeatFreq] = useState<number>(6.0);
  const [waveform, setWaveform] = useState<"sine" | "triangle">("sine");
  const [description, setDescription] = useState("");
  const [targetState, setTargetState] = useState("");

  // Live Test State
  const [isAuditioning, setIsAuditioning] = useState(false);
  const testAudioCtxRef = useRef<AudioContext | null>(null);
  const oscLeftRef = useRef<OscillatorNode | null>(null);
  const oscRightRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (initialMode === "dmt") {
      setCreatorTab("dmt");
      setDmtDefaults();
    } else {
      setCreatorTab("binaural");
      setBinauralDefaults();
    }
  }, [initialMode, isOpen]);

  const setBinauralDefaults = () => {
    setName("Custom Theta Trance 6.0 Hz");
    setCategory("theta");
    setBaseFreq(200);
    setBeatFreq(6.0);
    setWaveform("sine");
    setDescription("Custom programmed binaural frequency for deep hypnagogic meditation and memory recall.");
    setTargetState("Deep Hypnagogic Meditation");
  };

  const setDmtDefaults = () => {
    setName("DMT Pineal Hyper-Sync 40 Hz");
    setCategory("dmt_sacred");
    setBaseFreq(963);
    setBeatFreq(40.0);
    setWaveform("sine");
    setDescription("High-frequency 963 Hz crown carrier with 40 Hz gamma flash for endogenous pineal resonance.");
    setTargetState("Pineal Third-Eye Activation & Gamma Burst");
  };

  // Stop audition when modal unmounts or closes
  useEffect(() => {
    return () => {
      stopAudition();
    };
  }, []);

  const stopAudition = () => {
    if (oscLeftRef.current) {
      try {
        oscLeftRef.current.stop();
        oscLeftRef.current.disconnect();
      } catch (e) {}
      oscLeftRef.current = null;
    }
    if (oscRightRef.current) {
      try {
        oscRightRef.current.stop();
        oscRightRef.current.disconnect();
      } catch (e) {}
      oscRightRef.current = null;
    }
    if (testAudioCtxRef.current && testAudioCtxRef.current.state !== "closed") {
      testAudioCtxRef.current.close().catch(() => {});
      testAudioCtxRef.current = null;
    }
    setIsAuditioning(false);
  };

  const toggleAudition = async () => {
    if (isAuditioning) {
      stopAudition();
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      testAudioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.connect(ctx.destination);
      gainRef.current = gain;

      const merger = ctx.createChannelMerger(2);

      const oscL = ctx.createOscillator();
      oscL.type = waveform;
      oscL.frequency.value = baseFreq;

      const oscR = ctx.createOscillator();
      oscR.type = waveform;
      oscR.frequency.value = baseFreq + beatFreq;

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(gain);

      oscL.start();
      oscR.start();

      oscLeftRef.current = oscL;
      oscRightRef.current = oscR;
      setIsAuditioning(true);
    } catch (e) {
      console.error("Error auditioning tone:", e);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    stopAudition();

    const isDmt = creatorTab === "dmt" || category === "dmt_sacred";
    const newId = `custom_${isDmt ? "dmt" : "beat"}_${Date.now()}`;
    const badgeText = beatFreq > 0 ? `${baseFreq}Hz + ${beatFreq}Hz` : `${baseFreq}Hz Pure`;

    const newBeat: BinauralBeatDefinition = {
      id: newId,
      name: name.trim() || (isDmt ? "Custom DMT Frequency" : "Custom Binaural Beat"),
      category: isDmt ? "dmt_sacred" : category,
      baseFreq: Number(baseFreq),
      beatFreq: Number(beatFreq),
      waveform,
      badge: badgeText,
      description: description.trim() || (isDmt ? "User-defined sacred pineal resonance." : "User-defined binaural beat frequency."),
      targetState: targetState.trim() || (isDmt ? "Pineal Entrainment" : "Binaural Focus"),
      isDmt,
      isCustom: true,
      createdAt: Date.now(),
    };

    saveCustomBeat(newBeat);
    onFrequencyCreated(newBeat);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${creatorTab === "dmt" ? "bg-purple-500/15 border-purple-500/30 text-purple-300" : "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"}`}>
              {creatorTab === "dmt" ? <Atom className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-100 flex items-center gap-2">
                {creatorTab === "dmt" ? "Create DMT & Pineal Frequency" : "Create Custom Binaural Beat"}
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${creatorTab === "dmt" ? "bg-purple-950/80 text-purple-300 border-purple-800" : "bg-cyan-950/80 text-cyan-300 border-cyan-800"}`}>
                  {creatorTab === "dmt" ? "Sacred Mode" : "Entrainment"}
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Synthesize custom carrier harmonics & stereo binaural phase offsets
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopAudition();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-3 bg-stone-950/50 border-b border-stone-800/80 gap-2">
          <button
            type="button"
            onClick={() => {
              stopAudition();
              setCreatorTab("binaural");
              setBinauralDefaults();
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
              creatorTab === "binaural"
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-200 shadow-sm"
                : "bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Standard Binaural Beat
          </button>
          <button
            type="button"
            onClick={() => {
              stopAudition();
              setCreatorTab("dmt");
              setDmtDefaults();
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
              creatorTab === "dmt"
                ? "bg-purple-500/20 border-purple-500/40 text-purple-200 shadow-sm shadow-purple-900/30"
                : "bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200"
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            DMT & Pineal Entrainment
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Quick Preset Fillers */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-1.5">
              {creatorTab === "dmt" ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setName("DMT 963Hz + 40Hz Gamma Burst");
                      setBaseFreq(963);
                      setBeatFreq(40.0);
                      setCategory("dmt_sacred");
                      setDescription("Pineal third eye crown carrier with 40 Hz gamma insight synchronization.");
                      setTargetState("Pineal Awakening");
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 hover:border-purple-500/50 hover:text-purple-300"
                  >
                    🌌 963Hz + 40Hz Pineal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setName("DMT Pyramid 432Hz + 33Hz Kundalini");
                      setBaseFreq(432);
                      setBeatFreq(33.0);
                      setCategory("dmt_sacred");
                      setDescription("Pyramidal sacred geometry with 33 Hz spinal Kundalini resonance.");
                      setTargetState("Kundalini Elevation");
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 hover:border-purple-500/50 hover:text-purple-300"
                  >
                    ⚡ 432Hz + 33Hz Pyramid
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setName("DMT 108Hz OM + 4.5Hz Ayahuasca Trance");
                      setBaseFreq(108);
                      setBeatFreq(4.5);
                      setCategory("dmt_sacred");
                      setDescription("Sacred 108 OM frequency with shamanic 4.5 Hz theta dream trance.");
                      setTargetState("Shamanic Ego Softening");
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 hover:border-purple-500/50 hover:text-purple-300"
                  >
                    🌿 108Hz + 4.5Hz Shamanic
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setName("DMT 888Hz Cosmic + 7.83Hz Schumann");
                      setBaseFreq(888);
                      setBeatFreq(7.83);
                      setCategory("dmt_sacred");
                      setDescription("High cosmic 888 Hz harmonic linked to the 7.83 Hz Earth ionosphere pulse.");
                      setTargetState("Cosmic Grounding");
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 hover:border-purple-500/50 hover:text-purple-300"
                  >
                    👁️ 888Hz + 7.83Hz Earth
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setName("Deep Sleep Delta 2.0 Hz");
                      setBaseFreq(150);
                      setBeatFreq(2.0);
                      setCategory("delta");
                      setDescription("Slow restorative delta waves for somnolence and physical regeneration.");
                      setTargetState("Stage 4 Slow Wave Sleep");
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 hover:border-cyan-500/50 hover:text-cyan-300"
                  >
                    🌙 2.0Hz Deep Sleep
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setName("Hypnagogic Theta 5.0 Hz");
                      setBaseFreq(180);
                      setBeatFreq(5.0);
                      setCategory("theta");
                      setDescription("5 Hz theta entrainment facilitating deep suggestibility and subconscious absorption.");
                      setTargetState("Subconscious Priming");
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 hover:border-cyan-500/50 hover:text-cyan-300"
                  >
                    🌀 5.0Hz Subconscious
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setName("Schumann Resonance 7.83 Hz");
                      setBaseFreq(256);
                      setBeatFreq(7.83);
                      setCategory("theta");
                      setDescription("Earth natural 7.83 Hz ionosphere frequency for parasympathetic alignment.");
                      setTargetState("Earth Grounding");
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 hover:border-cyan-500/50 hover:text-cyan-300"
                  >
                    🌍 7.83Hz Schumann
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setName("Alpha Flow State 10.5 Hz");
                      setBaseFreq(220);
                      setBeatFreq(10.5);
                      setCategory("alpha");
                      setDescription("Centered alpha rhythm promoting effortless attention and calm poise.");
                      setTargetState("Cognitive Flow");
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 hover:border-cyan-500/50 hover:text-cyan-300"
                  >
                    🧘 10.5Hz Alpha Flow
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setName("Gamma Insight 40.0 Hz");
                      setBaseFreq(432);
                      setBeatFreq(40.0);
                      setCategory("gamma");
                      setDescription("40 Hz gamma neural synchrony for rapid binding and cognitive agility.");
                      setTargetState("Peak Information Binding");
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 hover:border-cyan-500/50 hover:text-cyan-300"
                  >
                    ⚡ 40.0Hz Gamma Sync
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Frequency Title & Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pineal Hyper-Sync 40Hz"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Carrier & Beat Frequency Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-950/60 p-4 rounded-xl border border-stone-800/80">
            {/* Carrier Frequency */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-stone-300">Carrier Frequency</span>
                <span className="font-mono text-cyan-400 font-bold">{baseFreq} Hz</span>
              </div>
              <input
                type="range"
                min="40"
                max="1000"
                step="1"
                value={baseFreq}
                onChange={(e) => setBaseFreq(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono mt-1">
                <span>40 Hz (Bass)</span>
                <span>432 / 528 Hz</span>
                <span>1000 Hz</span>
              </div>

              {/* Carrier Presets */}
              <div className="flex flex-wrap gap-1 mt-2">
                {[108, 144, 216, 432, 528, 888, 963].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setBaseFreq(f)}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                      baseFreq === f
                        ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/40"
                        : "bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200"
                    }`}
                  >
                    {f}Hz
                  </button>
                ))}
              </div>
            </div>

            {/* Beat / Modulation Frequency */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-stone-300">Binaural Beat Offset</span>
                <span className="font-mono text-amber-400 font-bold">{beatFreq} Hz</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="0.1"
                value={beatFreq}
                onChange={(e) => setBeatFreq(parseFloat(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono mt-1">
                <span>0 Hz (Pure)</span>
                <span>7.83 Hz</span>
                <span>40 Hz (Gamma)</span>
              </div>

              {/* Beat Presets */}
              <div className="flex flex-wrap gap-1 mt-2">
                {[0.5, 2.5, 4.5, 5.5, 7.83, 10.0, 14.0, 33.0, 40.0].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBeatFreq(b)}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                      beatFreq === b
                        ? "bg-amber-500/20 text-amber-200 border-amber-500/40"
                        : "bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200"
                    }`}
                  >
                    {b}Hz
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Left vs Right Ear Channel Stereo Map */}
          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800/80 flex items-center justify-around text-center text-xs">
            <div className="flex flex-col items-center">
              <span className="text-stone-400 text-[10px] uppercase font-mono">Left Ear Channel</span>
              <span className="text-stone-100 font-mono font-bold text-sm">{baseFreq.toFixed(1)} Hz</span>
            </div>
            <div className="flex flex-col items-center px-3 border-x border-stone-800">
              <span className="text-amber-400 text-[10px] uppercase font-mono">Binaural Interference</span>
              <span className="text-amber-300 font-mono font-bold text-sm">Δ {beatFreq.toFixed(1)} Hz</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-stone-400 text-[10px] uppercase font-mono">Right Ear Channel</span>
              <span className="text-stone-100 font-mono font-bold text-sm">{(baseFreq + beatFreq).toFixed(1)} Hz</span>
            </div>
          </div>

          {/* Category & Waveform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BinauralBeatDefinition["category"])}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="dmt_sacred">🌌 DMT & Pineal Sacred</option>
                <option value="delta">🌙 Delta (0.5 – 4 Hz Sleep)</option>
                <option value="theta">🌀 Theta (4 – 8 Hz Meditation)</option>
                <option value="alpha">🧘 Alpha (8 – 13 Hz Calm)</option>
                <option value="beta">⚡ Beta (13 – 30 Hz Focus)</option>
                <option value="gamma">🔥 Gamma (30 – 100 Hz Sync)</option>
                <option value="epsilon_lambda">🪐 Epsilon & Lambda</option>
                <option value="solfeggio">✨ Solfeggio Scale</option>
                <option value="custom">🛠️ Custom User</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Oscillator Waveform
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWaveform("sine")}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                    waveform === "sine"
                      ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-200"
                      : "bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Sine (Pure Tone)
                </button>
                <button
                  type="button"
                  onClick={() => setWaveform("triangle")}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                    waveform === "triangle"
                      ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-200"
                      : "bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Triangle (Harmonic)
                </button>
              </div>
            </div>
          </div>

          {/* Description & Target State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Target Psychological State
              </label>
              <input
                type="text"
                value={targetState}
                onChange={(e) => setTargetState(e.target.value)}
                placeholder="e.g. Pineal Third-Eye Activation"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Acoustic Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Stimulates pineal third eye with gamma synchrony..."
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-3">
            {/* Audition Button */}
            <button
              type="button"
              onClick={toggleAudition}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                isAuditioning
                  ? "bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20 animate-pulse"
                  : "bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700 hover:text-stone-100"
              }`}
            >
              {isAuditioning ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isAuditioning ? "Stop Stereo Audition" : "Test Stereo Beat Live"}
            </button>

            {/* Save & Apply */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  stopAudition();
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg flex items-center gap-2 transition-all ${
                  creatorTab === "dmt"
                    ? "bg-purple-600 hover:bg-purple-500 shadow-purple-600/30"
                    : "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30"
                }`}
              >
                <Plus className="w-4 h-4" />
                Save & Apply to Studio
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
