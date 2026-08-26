import React, { useState } from "react";
import {
  AffirmationItem,
  AudioMixerState,
  ExportProgress,
  ExportSettings,
} from "../types";
import { renderMasterSubliminalTrack } from "../utils/wavExporter";
import { resolveBinauralBeat } from "../data/binauralBeats";
import {
  X,
  Download,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileAudio,
} from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mixerState: AudioMixerState;
  affirmations: AffirmationItem[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  mixerState,
  affirmations,
}) => {
  const [targetMinutes, setTargetMinutes] = useState(15);
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    isExporting: false,
    progressPercent: 0,
    statusMessage: "",
    downloadUrl: null,
    downloadFilename: null,
  });

  if (!isOpen) return null;

  const readyVoices = affirmations.filter((a) => a.status === "ready" && a.audioBase64);

  const durationOptions = [
    { label: "5 Minutes", minutes: 5, desc: "Quick power rest / habit priming" },
    { label: "15 Minutes (Default)", minutes: 15, desc: "Standard bedtime sleep induction" },
    { label: "30 Minutes", minutes: 30, desc: "Deep sleep transition cycle" },
    { label: "60 Minutes", minutes: 60, desc: "Full slow-wave sleep conditioning" },
  ];

  const handleStartExport = async () => {
    setExportProgress({
      isExporting: true,
      progressPercent: 5,
      statusMessage: "Initializing master rendering pipeline...",
      downloadUrl: null,
      downloadFilename: null,
    });

    try {
      const settings: ExportSettings = {
        targetMinutes,
        sampleRate: 44100,
        format: "wav",
      };

      const wavBlob = await renderMasterSubliminalTrack(
        mixerState,
        affirmations,
        settings,
        (pct, stage) => {
          setExportProgress((prev) => ({
            ...prev,
            progressPercent: pct,
            statusMessage: stage,
          }));
        }
      );

      const url = URL.createObjectURL(wavBlob);
      const filename = `subliminal_ai_sleep_${targetMinutes}min.wav`;

      setExportProgress({
        isExporting: false,
        progressPercent: 100,
        statusMessage: "Master track render complete! Ready for download.",
        downloadUrl: url,
        downloadFilename: filename,
      });

      // Auto trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("Export error:", err);
      setExportProgress({
        isExporting: false,
        progressPercent: 0,
        statusMessage: `Export failed: ${err.message || "Unknown error"}`,
        downloadUrl: null,
        downloadFilename: null,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-stone-100 font-semibold text-sm">Export Master Subliminal WAV</h3>
              <p className="text-stone-400 text-xs">Studio 16-Bit PCM 44.1kHz Audio File</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Warning if no voices synthesized yet */}
          {readyVoices.length === 0 && (
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-200">No synthesized voices ready</strong>
                Click "Synthesize All Phrases" in the studio first, or the exported file will only contain the noise bed.
              </div>
            </div>
          )}

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Master Length</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {durationOptions.map((opt) => (
                <button
                  key={opt.minutes}
                  onClick={() => setTargetMinutes(opt.minutes)}
                  disabled={exportProgress.isExporting}
                  className={`p-3 rounded-xl text-left border text-xs transition-all ${
                    targetMinutes === opt.minutes
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-100 shadow-sm"
                      : "bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
                  }`}
                >
                  <div className="font-bold text-stone-100">{opt.label}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* DSP Specifications Manifest */}
          <div className="bg-stone-950/80 border border-stone-800/80 rounded-xl p-3.5 space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
              Master DSP Chain Configuration
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between border-b border-stone-800/60 pb-1">
                <span className="text-stone-400">Noise Bed:</span>
                <span className="font-mono text-stone-200 uppercase">{mixerState.noiseType}</span>
              </div>
              <div className="flex justify-between border-b border-stone-800/60 pb-1">
                <span className="text-stone-400">Subliminal Mask:</span>
                <span className="font-mono text-amber-400">{mixerState.subliminalAttenuationDb} dB</span>
              </div>
              <div className="flex justify-between border-b border-stone-800/60 pb-1">
                <span className="text-stone-400">Voice Softening:</span>
                <span className="font-mono text-stone-200">{mixerState.voiceLowPassHz} Hz</span>
              </div>
              <div className="flex justify-between border-b border-stone-800/60 pb-1">
                <span className="text-stone-400">Master Filter:</span>
                <span className="font-mono text-stone-200">{mixerState.masterLowPassHz} Hz</span>
              </div>
              <div className="flex justify-between border-b border-stone-800/60 pb-1">
                <span className="text-stone-400">Entrainment / DMT:</span>
                <span className="font-mono text-purple-300 text-right">
                  {mixerState.brainwaveType === "none"
                    ? "Disabled"
                    : `${resolveBinauralBeat(mixerState.brainwaveType).name} (${resolveBinauralBeat(mixerState.brainwaveType).badge})`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Voice Phrases:</span>
                <span className="font-mono text-emerald-400">{readyVoices.length} Loop Clips</span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Status */}
          {exportProgress.isExporting && (
            <div className="space-y-2 bg-stone-950/90 p-4 rounded-xl border border-stone-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400 font-medium flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {exportProgress.statusMessage}
                </span>
                <span className="font-mono text-stone-300">{exportProgress.progressPercent}%</span>
              </div>
              <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${exportProgress.progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Download ready button */}
          {exportProgress.downloadUrl && (
            <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-200 font-medium">
                  {exportProgress.downloadFilename}
                </span>
              </div>
              <a
                href={exportProgress.downloadUrl}
                download={exportProgress.downloadFilename!}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save WAV</span>
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-800 bg-stone-950/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-medium"
          >
            Close
          </button>

          <button
            id="start-export-wav-btn"
            onClick={handleStartExport}
            disabled={exportProgress.isExporting}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
          >
            {exportProgress.isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Rendering Audio...</span>
              </>
            ) : (
              <>
                <FileAudio className="w-3.5 h-3.5" />
                <span>Render & Download Master WAV</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
