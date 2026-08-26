import React, { useEffect, useRef } from "react";
import { studioAudioEngine } from "../utils/audioEngine";
import { AudioMixerState, AffirmationItem } from "../types";
import { resolveBinauralBeat } from "../data/binauralBeats";
import { Headphones, ShieldCheck, Waves, VolumeX, Sparkles, Activity, Atom } from "lucide-react";

interface VisualizerProps {
  mixerState: AudioMixerState;
  activePhraseIndex: number;
  affirmations: AffirmationItem[];
}

export const Visualizer: React.FC<VisualizerProps> = ({
  mixerState,
  activePhraseIndex,
  affirmations,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const binCount = studioAudioEngine.getFrequencyBinCount();
    const dataArray = new Uint8Array(binCount);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark background trail
      ctx.fillStyle = "rgba(12, 10, 9, 0.4)";
      ctx.fillRect(0, 0, width, height);

      if (mixerState.isPlaying) {
        studioAudioEngine.getAnalyserData(dataArray);

        // Draw frequency bars
        const barCount = 48;
        const barSpacing = 4;
        const totalSpacing = (barCount - 1) * barSpacing;
        const barWidth = (width - 40 - totalSpacing) / barCount;

        const startX = 20;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * (binCount * 0.75));
          const value = dataArray[dataIndex] || 0;
          const percent = value / 255;
          const barHeight = Math.max(4, percent * (height - 30));

          const x = startX + i * (barWidth + barSpacing);
          const y = height - barHeight - 12;

          // Color gradient from warm brown to amber/gold
          const grad = ctx.createLinearGradient(0, height, 0, y);
          if (mixerState.voiceSoloTest) {
            grad.addColorStop(0, "rgba(245, 158, 11, 0.2)");
            grad.addColorStop(1, "rgba(251, 191, 36, 0.9)");
          } else {
            grad.addColorStop(0, "rgba(180, 83, 9, 0.2)");
            grad.addColorStop(0.5, "rgba(217, 119, 6, 0.6)");
            grad.addColorStop(1, "rgba(245, 158, 11, 0.85)");
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
          ctx.fill();
        }

        // Draw glowing frequency curve overlay
        ctx.beginPath();
        ctx.strokeStyle = mixerState.voiceSoloTest
          ? "rgba(251, 191, 36, 0.7)"
          : "rgba(217, 119, 6, 0.45)";
        ctx.lineWidth = 2;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * (binCount * 0.75));
          const value = dataArray[dataIndex] || 0;
          const percent = value / 255;
          const x = startX + i * (barWidth + barSpacing) + barWidth / 2;
          const y = height - Math.max(6, percent * (height - 30)) - 14;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      } else {
        // Idle gentle breathing sine wave
        const time = Date.now() * 0.002;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(120, 113, 108, 0.35)";
        ctx.lineWidth = 1.5;

        for (let x = 20; x < width - 20; x += 4) {
          const normX = (x - 20) / (width - 40);
          const y =
            height / 2 +
            Math.sin(normX * Math.PI * 4 + time) * 12 * Math.sin(normX * Math.PI);
          if (x === 20) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        ctx.fillStyle = "rgba(168, 162, 158, 0.5)";
        ctx.font = "12px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Studio Standby • Press Live Audition to start audio stream", width / 2, height / 2 + 30);
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [mixerState.isPlaying, mixerState.voiceSoloTest]);

  // Handle high-DPI canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width && height) {
          canvas.width = width * window.devicePixelRatio;
          canvas.height = height * window.devicePixelRatio;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
          }
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const activePhrase =
    activePhraseIndex >= 0 && activePhraseIndex < affirmations.length
      ? affirmations[activePhraseIndex]
      : null;

  return (
    <div className="relative w-full rounded-2xl bg-stone-900/80 border border-stone-800 overflow-hidden shadow-xl">
      {/* Top Status Bar over visualizer */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              mixerState.isPlaying
                ? mixerState.voiceSoloTest
                  ? "bg-amber-400 animate-ping"
                  : "bg-emerald-400 animate-pulse"
                : "bg-stone-600"
            }`}
          />
          <span className="text-xs font-mono tracking-wider text-stone-300">
            {mixerState.isPlaying
              ? mixerState.voiceSoloTest
                ? "RAW WHISPER AUDITION"
                : "SUBLIMINAL MASK ACTIVE"
              : "STANDBY"}
          </span>
        </div>

        {/* Acoustic & Entrainment Status Badge */}
        <div className="flex items-center gap-2">
          {!mixerState.brainwaveMute && mixerState.brainwaveType !== "none" && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-800/80 text-purple-300">
              <Activity className="w-3 h-3 text-purple-400" />
              {resolveBinauralBeat(mixerState.brainwaveType).badge}
            </span>
          )}
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-stone-950/80 border border-stone-800 text-stone-400">
            LPF: {mixerState.voiceLowPassHz}Hz
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-stone-950/80 border border-stone-800 text-amber-400/90">
            Mask: {mixerState.subliminalAttenuationDb}dB
          </span>
        </div>
      </div>

      {/* Canvas Spectrum Display */}
      <div className="w-full h-36 sm:h-44">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Subliminal Whispered Phrase Bar */}
      <div className="border-t border-stone-800/80 bg-stone-950/90 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-1.5 rounded-lg shrink-0 ${
              activePhrase
                ? mixerState.voiceSoloTest
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-amber-500/10 text-amber-400"
                : "bg-stone-800/50 text-stone-500"
            }`}
          >
            {mixerState.voiceMute ? (
              <VolumeX className="w-4 h-4" />
            ) : mixerState.voiceSoloTest ? (
              <Headphones className="w-4 h-4" />
            ) : (
              <Waves className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0">
            <div className="text-[10px] font-mono tracking-wider text-stone-400 uppercase flex items-center gap-1.5">
              <span>Subliminal Subconscious Layer</span>
              {activePhrase && (
                <span className="text-amber-400/80">• Whispering Now</span>
              )}
            </div>
            <p className="text-stone-200 text-xs sm:text-sm font-medium truncate mt-0.5">
              {activePhrase ? (
                `"${activePhrase.text}"`
              ) : mixerState.isPlaying ? (
                <span className="text-stone-500 italic">
                  Resting gap between affirmations ({mixerState.intervalRestSec}s rhythm)...
                </span>
              ) : (
                <span className="text-stone-500 italic">No affirmations currently playing</span>
              )}
            </p>
          </div>
        </div>

        {/* Acoustic Mode Tag */}
        <div className="shrink-0 hidden md:flex items-center gap-1.5 text-xs text-stone-400 bg-stone-900 border border-stone-800 px-2.5 py-1 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Non-arousing Sleep Formants</span>
        </div>
      </div>
    </div>
  );
};
