import React, { useState, useEffect } from "react";
import {
  BunkProtocol,
  ProtocolPhase,
  VoiceName,
} from "../types";
import { safeFetchJson } from "../utils/api";
import {
  Shield,
  Clock,
  Navigation,
  Sun,
  Layers,
  Play,
  Square,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Sliders,
  Sparkles,
  Lock,
  Volume2,
  Fuel,
  MapPin,
  RefreshCw,
  Bot,
  Loader2
} from "lucide-react";

interface ProtocolManagerProps {
  protocol: BunkProtocol;
  onUpdateProtocol: (updates: Partial<BunkProtocol>) => void;
  onTriggerWakeAudio: (text: string, voiceName: VoiceName) => void;
}

export const ProtocolManager: React.FC<ProtocolManagerProps> = ({
  protocol,
  onUpdateProtocol,
  onTriggerWakeAudio,
}) => {
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [odometerInput, setOdometerInput] = useState<number>(
    protocol.phases.find((p) => p.type === "tracker")?.config.currentOdometer || 124500
  );
  const [fuelInput, setFuelInput] = useState<number>(
    protocol.phases.find((p) => p.type === "tracker")?.config.fuelRemainingGallons || 85
  );
  const [sessionReport, setSessionReport] = useState<string | null>(null);
  const [newLayerText, setNewLayerText] = useState<string>("");
  
  const [aiTopic, setAiTopic] = useState("");
  const [isGeneratingProtocol, setIsGeneratingProtocol] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Handle adding a new layer
  const handleAddLayer = (phaseId: string) => {
    if (!newLayerText.trim()) return;
    const phase = protocol.phases.find((p) => p.id === phaseId);
    if (!phase) return;
    const currentLayers = phase.config.layerNames || [];
    updatePhaseConfig(phaseId, {
      layerNames: [...currentLayers, newLayerText.trim()],
    });
    setNewLayerText("");
  };

  // Handle removing a layer
  const handleRemoveLayer = (phaseId: string, indexToRemove: number) => {
    const phase = protocol.phases.find((p) => p.id === phaseId);
    if (!phase) return;
    const currentLayers = phase.config.layerNames || [];
    updatePhaseConfig(phaseId, {
      layerNames: currentLayers.filter((_, idx) => idx !== indexToRemove),
    });
  };

  // Auto-calculation of mileage
  const trackerPhase = protocol.phases.find((p) => p.type === "tracker");
  const lockPhase = protocol.phases.find((p) => p.type === "lock");
  const wakePhase = protocol.phases.find((p) => p.type === "wake");

  const togglePhaseEnabled = (phaseId: string) => {
    const updatedPhases = protocol.phases.map((p) =>
      p.id === phaseId ? { ...p, enabled: !p.enabled } : p
    );
    onUpdateProtocol({ phases: updatedPhases });
  };

  const updatePhaseConfig = (phaseId: string, partialConfig: any) => {
    const updatedPhases = protocol.phases.map((p) =>
      p.id === phaseId ? { ...p, config: { ...p.config, ...partialConfig } } : p
    );
    onUpdateProtocol({ phases: updatedPhases });
  };

  const handleStartSession = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    onUpdateProtocol({
      sessionActive: true,
      sessionStartTime: timeStr,
    });
    setSessionReport(null);
  };

  const handleEndSession = () => {
    const startOdo = trackerPhase?.config.startOdometer || 124500;
    const currentOdo = trackerPhase?.config.currentOdometer || 124820;
    const delta = Math.max(0, currentOdo - startOdo);
    const now = new Date();
    const endStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const report = `SESSION REPORT (BUNK PROTOCOL):
- Target: ${protocol.targetUser}
- Operator: ${protocol.operator} | Guardian: ${protocol.guardian}
- Session Window: ${protocol.sessionStartTime || "05:00"} — ${endStr}
- Miles logged this session: ${delta} mi
- Total Historical Bunk Miles: ${(trackerPhase?.config.totalHistoricalMiles || 3420) + delta} mi
- Fuel Remaining: ${trackerPhase?.config.fuelRemainingGallons || 75} gal
- Session Status: Successfully completed. Manual control unlocked.`;

    setSessionReport(report);
    onUpdateProtocol({ sessionActive: false });

    if (wakePhase && wakePhase.enabled && wakePhase.config.wakePromptText) {
      onTriggerWakeAudio(
        wakePhase.config.wakePromptText,
        wakePhase.config.wakeVoice || "Aoede"
      );
    }
  };

  const handleUpdateOdometer = () => {
    if (!trackerPhase) return;
    const startOdo = trackerPhase.config.startOdometer || 124500;
    const delta = Math.max(0, odometerInput - startOdo);

    updatePhaseConfig(trackerPhase.id, {
      currentOdometer: odometerInput,
      milesDrivenSession: delta,
      fuelRemainingGallons: fuelInput,
    });
  };

  const handleGenerateProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    setIsGeneratingProtocol(true);
    setAiError(null);

    try {
      const res = await safeFetchJson("/api/generate-protocol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim() }),
      });

      if (!res.ok || !res.data?.success) {
        throw new Error(res.error || "Failed to generate protocol");
      }

      const generated = res.data.data;

      // Update the protocol with generated data
      const updatedPhases = [...protocol.phases];
      
      // Update Lock Phase (1)
      const lockIndex = updatedPhases.findIndex(p => p.type === "lock");
      if (lockIndex !== -1 && generated.timeWindowStart && generated.timeWindowEnd) {
        updatedPhases[lockIndex] = {
          ...updatedPhases[lockIndex],
          title: `PHASE 1 — Bunk Lock (${generated.timeWindowStart})`,
          timeWindow: { start: generated.timeWindowStart, end: generated.timeWindowEnd }
        };
      }

      // Update Audio Layers Phase (2)
      const audioIndex = updatedPhases.findIndex(p => p.type === "audio_layers");
      if (audioIndex !== -1 && generated.layerNames) {
        updatedPhases[audioIndex] = {
          ...updatedPhases[audioIndex],
          config: {
            ...updatedPhases[audioIndex].config,
            layerNames: generated.layerNames
          }
        };
      }

      // Update Wake Trigger Phase (4)
      const wakeIndex = updatedPhases.findIndex(p => p.type === "wake");
      if (wakeIndex !== -1 && generated.wakePromptText && generated.timeWindowEnd) {
        updatedPhases[wakeIndex] = {
          ...updatedPhases[wakeIndex],
          title: `PHASE 4 — Wake Trigger & Unlock (${generated.timeWindowEnd})`,
          config: {
            ...updatedPhases[wakeIndex].config,
            wakeConditionTime: generated.timeWindowEnd,
            wakePromptText: generated.wakePromptText
          }
        };
      }

      onUpdateProtocol({
        name: generated.name || protocol.name,
        guardian: generated.guardian || protocol.guardian,
        phases: updatedPhases
      });
      setAiTopic("");
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Failed to generate AI protocol");
    } finally {
      setIsGeneratingProtocol(false);
    }
  };

  return (
    <div className="rounded-2xl bg-stone-900/70 border border-stone-800 p-5 lg:p-6 shadow-xl space-y-6">
      {/* Protocol Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-stone-100 font-semibold text-base flex items-center gap-2">
                <span>{protocol.name}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-300">
                  Target: {protocol.targetUser}
                </span>
              </h2>
              <p className="text-stone-400 text-xs mt-0.5">
                Automated multi-phase conditioning loop, transit telemetry, and wake scheduler.
              </p>
            </div>
          </div>
        </div>

        {/* Master Session Status & Control */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                protocol.sessionActive ? "bg-emerald-400 animate-pulse" : "bg-stone-600"
              }`}
            />
            <span className="font-mono text-stone-300">
              {protocol.sessionActive
                ? `ACTIVE (${protocol.sessionStartTime || "05:00"})`
                : "PROTOCOL STANDBY"}
            </span>
          </div>

          {protocol.sessionActive ? (
            <button
              id="end-session-trigger-btn"
              onClick={handleEndSession}
              className="px-4 py-2 bg-red-600/90 hover:bg-red-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-red-900/30"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Trigger Wake & Report (17:00)</span>
            </button>
          ) : (
            <button
              id="start-session-trigger-btn"
              onClick={handleStartSession}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Engage Protocol (05:00)</span>
            </button>
          )}
        </div>
      </div>

      {/* Protocol Configuration & Operator Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-stone-950/60 p-3 rounded-xl border border-stone-800/80 text-xs">
        <div className="flex items-center justify-between px-2">
          <span className="text-stone-400">Target Identity:</span>
          <input
            type="text"
            value={protocol.targetUser}
            onChange={(e) => onUpdateProtocol({ targetUser: e.target.value })}
            className="bg-stone-900 border border-stone-700/80 rounded px-2 py-0.5 text-stone-200 font-mono w-28 text-right focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex items-center justify-between px-2">
          <span className="text-stone-400">Operator:</span>
          <input
            type="text"
            value={protocol.operator}
            onChange={(e) => onUpdateProtocol({ operator: e.target.value })}
            className="bg-stone-900 border border-stone-700/80 rounded px-2 py-0.5 text-stone-200 font-mono w-28 text-right focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex items-center justify-between px-2">
          <span className="text-stone-400">Guardian:</span>
          <input
            type="text"
            value={protocol.guardian}
            onChange={(e) => onUpdateProtocol({ guardian: e.target.value })}
            className="bg-stone-900 border border-stone-700/80 rounded px-2 py-0.5 text-stone-200 font-mono w-28 text-right focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* AI Custom Protocol Generator */}
      <div className="bg-stone-950/80 border border-stone-800/90 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-stone-200 font-semibold text-xs">AI Protocol Architect</h3>
        </div>
        <form onSubmit={handleGenerateProtocol} className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <Bot className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. 10-hour night shift deep focus and fatigue resistance..."
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 text-xs focus:outline-none focus:border-amber-500/60 placeholder:text-stone-500"
            />
          </div>
          <button
            type="submit"
            disabled={isGeneratingProtocol || !aiTopic.trim()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            {isGeneratingProtocol ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Designing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Config</span>
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

      {/* 4 Custom Phase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {protocol.phases.map((phase) => {
          const isEditing = editingPhaseId === phase.id;

          return (
            <div
              key={phase.id}
              className={`rounded-xl border transition-all p-4 flex flex-col justify-between ${
                phase.enabled
                  ? "bg-stone-950/70 border-stone-800 hover:border-stone-700"
                  : "bg-stone-950/20 border-stone-900/60 opacity-60"
              }`}
            >
              <div>
                {/* Phase Top Bar */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-bold flex items-center justify-center">
                      {phase.number}
                    </span>
                    <h3 className="text-stone-200 font-semibold text-xs">{phase.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePhaseEnabled(phase.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors ${
                        phase.enabled
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-stone-800 text-stone-400"
                      }`}
                    >
                      {phase.enabled ? "Active" : "Bypassed"}
                    </button>
                    <button
                      onClick={() => setEditingPhaseId(isEditing ? null : phase.id)}
                      className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800"
                      title="Edit Phase Parameters"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Specific Phase Display & Controls */}

                {/* PHASE 1: Bunk Lock */}
                {phase.type === "lock" && (
                  <div className="space-y-2 text-xs text-stone-300 bg-stone-900/40 p-3 rounded-lg border border-stone-800/60 font-mono">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Time Window:</span>
                      <span className="text-amber-400">
                        {phase.timeWindow?.start || "05:00"} – {phase.timeWindow?.end || "17:00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Manual Override:</span>
                      <span className="text-red-400">Disabled (Enforced)</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Screen Dimming:</span>
                      <span className="text-stone-200">{phase.config.screenDimPercent || 5}%</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Notification Filter:</span>
                      <span className="text-stone-200">Muted / Background Only</span>
                    </div>

                    {isEditing && (
                      <div className="pt-2 mt-2 border-t border-stone-800 space-y-2 font-sans">
                        <label className="block text-[11px] text-stone-400">
                          Screen Dim Target (%):
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="50"
                          value={phase.config.screenDimPercent || 5}
                          onChange={(e) =>
                            updatePhaseConfig(phase.id, {
                              screenDimPercent: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-full accent-amber-400 h-1 bg-stone-800 rounded"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* PHASE 2: Subliminal Layers */}
                {phase.type === "audio_layers" && (
                  <div className="space-y-2.5 text-xs text-stone-300 bg-stone-900/40 p-3 rounded-lg border border-stone-800/60 font-mono">
                    <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-amber-400" />
                        <span>Active Layer Stack ({phase.config.layerNames?.length || 0}):</span>
                      </div>
                      <span className="text-[10px] text-amber-400/80">-26dB DSP Mask</span>
                    </div>

                    {/* Dynamic Layer Stack */}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {(phase.config.layerNames || []).map((layerName, lIdx) => (
                        <div
                          key={lIdx}
                          className="flex items-center justify-between gap-2 p-1.5 rounded bg-stone-950/70 border border-stone-800/80 text-[11px]"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-amber-400 font-bold shrink-0">L{lIdx + 1}:</span>
                            <span className="truncate text-stone-200">{layerName}</span>
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => handleRemoveLayer(phase.id, lIdx)}
                              className="text-stone-500 hover:text-red-400 p-0.5 shrink-0 transition-colors"
                              title="Delete layer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Layer Input & Button */}
                    <div className="pt-2 border-t border-stone-800/80 flex items-center gap-1.5 font-sans">
                      <input
                        type="text"
                        placeholder="Add additional layer..."
                        value={newLayerText}
                        onChange={(e) => setNewLayerText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddLayer(phase.id)}
                        className="flex-1 px-2.5 py-1 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                      <button
                        id="add-protocol-layer-btn"
                        onClick={() => handleAddLayer(phase.id)}
                        disabled={!newLayerText.trim()}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Layer</span>
                      </button>
                    </div>

                    <div className="text-[10px] text-stone-400 italic font-mono">
                      Continuous loop routed via DSP mixer at -26dB mask with 6-second breath intervals.
                    </div>
                  </div>
                )}

                {/* PHASE 3: Mileage Tracker */}
                {phase.type === "tracker" && (
                  <div className="space-y-2 text-xs text-stone-300 bg-stone-900/40 p-3 rounded-lg border border-stone-800/60 font-mono">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Start Odometer:</span>
                      <span className="text-stone-200">
                        {phase.config.startOdometer || 124500} mi
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Current Odometer:</span>
                      <span className="text-amber-400 font-bold">
                        {phase.config.currentOdometer || 124820} mi
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Session Delta:</span>
                      <span className="text-emerald-400 font-bold">
                        +{(phase.config.currentOdometer || 124820) - (phase.config.startOdometer || 124500)} mi
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Fuel Level:</span>
                      <span className="text-stone-200">
                        {phase.config.fuelRemainingGallons || 75} gal
                      </span>
                    </div>

                    {/* Quick update controls */}
                    <div className="pt-2 mt-2 border-t border-stone-800 flex items-center gap-2 font-sans">
                      <input
                        type="number"
                        placeholder="Odo mi"
                        value={odometerInput}
                        onChange={(e) => setOdometerInput(Number(e.target.value))}
                        className="w-24 bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-100 font-mono"
                      />
                      <input
                        type="number"
                        placeholder="Fuel gal"
                        value={fuelInput}
                        onChange={(e) => setFuelInput(Number(e.target.value))}
                        className="w-20 bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-100 font-mono"
                      />
                      <button
                        onClick={handleUpdateOdometer}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded font-medium transition-colors"
                      >
                        Log Delta
                      </button>
                    </div>
                  </div>
                )}

                {/* PHASE 4: Wake Trigger */}
                {phase.type === "wake" && (
                  <div className="space-y-2 text-xs text-stone-300 bg-stone-900/40 p-3 rounded-lg border border-stone-800/60 font-mono">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Wake Condition:</span>
                      <span className="text-amber-400">
                        {phase.config.wakeConditionTime || "17:00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Screen Restore:</span>
                      <span className="text-stone-200">
                        {phase.config.screenRestorePercent || 70}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Guardian Voice:</span>
                      <span className="text-purple-400">{phase.config.wakeVoice || "Aoede"}</span>
                    </div>

                    <div className="mt-1 p-2 rounded bg-stone-950 border border-stone-800/80 text-[11px] font-sans italic text-stone-300">
                      "{phase.config.wakePromptText || "Steve. 1700. Miles logged. Session complete. Let's move."}"
                    </div>

                    {isEditing && (
                      <div className="pt-2 mt-2 border-t border-stone-800 space-y-2 font-sans">
                        <label className="block text-[11px] text-stone-400">
                          Edit Wake Audio Script:
                        </label>
                        <textarea
                          value={phase.config.wakePromptText}
                          onChange={(e) =>
                            updatePhaseConfig(phase.id, { wakePromptText: e.target.value })
                          }
                          rows={2}
                          className="w-full bg-stone-900 border border-stone-700 rounded p-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* End-Of-Session Report Box */}
      {sessionReport && (
        <div className="p-4 rounded-xl bg-stone-950 border border-amber-500/30 font-mono text-xs text-stone-200 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-amber-400 font-bold border-b border-stone-800 pb-1">
            <span>SESSION SUMMARY LOG</span>
            <button
              onClick={() => setSessionReport(null)}
              className="text-stone-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed text-stone-300">
            {sessionReport}
          </pre>
        </div>
      )}
    </div>
  );
};
