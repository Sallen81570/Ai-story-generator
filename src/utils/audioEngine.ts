import { AffirmationItem, AudioMixerState } from "../types";
import { resolveBinauralBeat } from "../data/binauralBeats";
import {
  createBrownNoiseBuffer,
  createPinkNoiseBuffer,
  createWhiteNoiseBuffer,
  createBlueNoiseBuffer,
  createVioletNoiseBuffer,
  createGreyNoiseBuffer,
  createGreenNoiseBuffer,
  createBlackNoiseBuffer,
  createOceanWavesBuffer,
  createRainBuffer,
} from "./noiseGenerators";

export class StudioAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  // Master Nodes
  private masterGain: GainNode | null = null;
  private masterFilter: BiquadFilterNode | null = null;

  // Voice Nodes
  private voiceGain: GainNode | null = null;
  private voiceFilter: BiquadFilterNode | null = null;
  private currentVoiceSource: AudioBufferSourceNode | null = null;
  private voiceLoopTimeout: number | null = null;
  private decodedVoiceCache: Map<string, AudioBuffer> = new Map();

  // Noise Nodes
  private noiseGain: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private currentNoiseType: string | null = null;

  // Brainwave Nodes
  private brainwaveGain: GainNode | null = null;
  private oscLeft: OscillatorNode | null = null;
  private oscRight: OscillatorNode | null = null;
  private mergerNode: ChannelMergerNode | null = null;
  private currentBrainwaveType: string | null = null;

  // State & Callbacks
  private isPlaying: boolean = false;
  private activePhraseIndex: number = -1;
  private affirmations: AffirmationItem[] = [];
  private mixerState: AudioMixerState | null = null;
  private onPhraseChangeCallback?: (index: number) => void;

  // Sleep Conditioning Ramp State
  private rampConfig: {
    enabled: boolean;
    rampDurationMinutes: number;
    initialVoiceVolumeDb: number;
    targetSubliminalDb: number;
    sessionStartTimestamp: number;
    allNightLoopMode: boolean;
  } | null = null;

  public setSleepRampConfig(config: {
    enabled: boolean;
    rampDurationMinutes: number;
    initialVoiceVolumeDb?: number;
    targetSubliminalDb?: number;
    allNightLoopMode?: boolean;
  } | null) {
    if (!config || !config.enabled) {
      this.rampConfig = null;
    } else {
      this.rampConfig = {
        enabled: true,
        rampDurationMinutes: Math.max(1, config.rampDurationMinutes || 30),
        initialVoiceVolumeDb: config.initialVoiceVolumeDb ?? 0,
        targetSubliminalDb: config.targetSubliminalDb ?? -26,
        sessionStartTimestamp: Date.now(),
        allNightLoopMode: config.allNightLoopMode ?? true,
      };
    }
    if (this.mixerState) {
      this.updateParameters(this.mixerState);
    }
  }

  public getSleepRampProgress(): {
    active: boolean;
    elapsedMinutes: number;
    totalMinutes: number;
    currentDb: number;
    percentComplete: number;
    stage: "audible_story" | "whisper_ramp" | "subconscious_subliminal" | "all_night_delta";
  } {
    if (!this.rampConfig || !this.rampConfig.enabled) {
      return {
        active: false,
        elapsedMinutes: 0,
        totalMinutes: 30,
        currentDb: this.mixerState ? (this.mixerState.voiceSoloTest ? 0 : this.mixerState.subliminalAttenuationDb) : -26,
        percentComplete: 100,
        stage: "subconscious_subliminal",
      };
    }

    const elapsedMs = Date.now() - this.rampConfig.sessionStartTimestamp;
    const elapsedMinutes = elapsedMs / (60 * 1000);
    const totalMinutes = this.rampConfig.rampDurationMinutes;
    const progressFraction = Math.min(1, Math.max(0, elapsedMinutes / totalMinutes));

    const initialDb = this.rampConfig.initialVoiceVolumeDb;
    const targetDb = this.rampConfig.targetSubliminalDb;
    const currentDb = initialDb + (targetDb - initialDb) * progressFraction;

    let stage: "audible_story" | "whisper_ramp" | "subconscious_subliminal" | "all_night_delta" = "audible_story";
    if (progressFraction >= 1) {
      stage = this.rampConfig.allNightLoopMode ? "all_night_delta" : "subconscious_subliminal";
    } else if (progressFraction > 0.6) {
      stage = "subconscious_subliminal";
    } else if (progressFraction > 0.15) {
      stage = "whisper_ramp";
    } else {
      stage = "audible_story";
    }

    return {
      active: true,
      elapsedMinutes: Math.round(elapsedMinutes * 10) / 10,
      totalMinutes,
      currentDb: Math.round(currentDb * 10) / 10,
      percentComplete: Math.round(progressFraction * 100),
      stage,
    };
  }

  public init() {
    if (this.ctx && this.ctx.state !== "closed") return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Create Analyser for real-time oscilloscope / spectrum
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.85;

    // Master Filter (3500 Hz smoothing)
    this.masterFilter = this.ctx.createBiquadFilter();
    this.masterFilter.type = "lowpass";
    this.masterFilter.frequency.value = 3500;
    this.masterFilter.Q.value = 0.707;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;

    // Route: MasterFilter -> MasterGain -> Analyser -> Destination
    this.masterFilter.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Voice Channel
    this.voiceFilter = this.ctx.createBiquadFilter();
    this.voiceFilter.type = "lowpass";
    this.voiceFilter.frequency.value = 2200;
    this.voiceFilter.Q.value = 0.707;

    this.voiceGain = this.ctx.createGain();
    this.voiceGain.gain.value = 0.5;

    this.voiceFilter.connect(this.voiceGain);
    this.voiceGain.connect(this.masterFilter);

    // Noise Bed Channel
    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = 0.75;
    this.noiseGain.connect(this.masterFilter);

    // Brainwave Channel
    this.brainwaveGain = this.ctx.createGain();
    this.brainwaveGain.gain.value = 0.0;
    this.brainwaveGain.connect(this.masterFilter);
  }

  public setOnPhraseChange(cb: (index: number) => void) {
    this.onPhraseChangeCallback = cb;
  }

  public async decodeAudioBase64(id: string, base64: string): Promise<AudioBuffer | null> {
    if (!this.ctx) this.init();
    if (!this.ctx) return null;

    if (this.decodedVoiceCache.has(id)) {
      return this.decodedVoiceCache.get(id)!;
    }

    try {
      const cleanBase64 = base64.replace(/^data:.*?;base64,/i, "").replace(/\s/g, "");
      const binaryString = atob(cleanBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const buffer = await this.ctx.decodeAudioData(bytes.buffer.slice(0));
      this.decodedVoiceCache.set(id, buffer);
      return buffer;
    } catch (e) {
      console.error("Failed to decode audio base64:", e);
      return null;
    }
  }

  public async play(state: AudioMixerState, affirmations: AffirmationItem[]) {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    this.affirmations = affirmations;
    this.mixerState = state;
    this.isPlaying = true;

    // Apply mixer parameters
    this.updateParameters(state);

    // Start noise bed
    this.startNoiseBed(state);

    // Start brainwave entrainment
    this.startBrainwave(state);

    // Start voice phrase loop
    this.startVoiceSequence();
  }

  public pause() {
    this.isPlaying = false;
    this.stopVoiceSequence();
    this.stopNoiseBed();
    this.stopBrainwave();
  }

  public updateParameters(state: AudioMixerState) {
    this.mixerState = state;
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Master Volume
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(state.masterVolume, now, 0.05);
    }

    // Master Low Pass
    if (this.masterFilter) {
      this.masterFilter.frequency.setTargetAtTime(state.masterLowPassHz || 3500, now, 0.05);
    }

    // Voice Filter Low Pass
    if (this.voiceFilter) {
      this.voiceFilter.frequency.setTargetAtTime(state.voiceLowPassHz || 2200, now, 0.05);
    }

    // Voice Gain (with Subliminal Attenuation in dB and Dynamic Sleep Ramp)
    if (this.voiceGain) {
      const isMuted = state.voiceMute;
      if (isMuted || state.voiceVolume <= 0) {
        this.voiceGain.gain.setTargetAtTime(0, now, 0.05);
      } else {
        let attenuationDb = state.voiceSoloTest ? 0 : state.subliminalAttenuationDb;

        // Apply Sleep Conditioning Ramp if active
        if (!state.voiceSoloTest && this.rampConfig && this.rampConfig.enabled) {
          const elapsedMs = Date.now() - this.rampConfig.sessionStartTimestamp;
          const elapsedMinutes = elapsedMs / (60 * 1000);
          const fraction = Math.min(1, Math.max(0, elapsedMinutes / this.rampConfig.rampDurationMinutes));
          attenuationDb = this.rampConfig.initialVoiceVolumeDb + (this.rampConfig.targetSubliminalDb - this.rampConfig.initialVoiceVolumeDb) * fraction;
        }

        const linearGain = Math.pow(10, attenuationDb / 20) * state.voiceVolume;
        this.voiceGain.gain.setTargetAtTime(linearGain, now, 0.05);
      }
    }

    // Noise Gain
    if (this.noiseGain) {
      const isMuted = state.noiseMute || state.voiceSoloTest; // silence noise during voice solo test
      const targetGain = isMuted ? 0 : state.noiseVolume * 0.85;
      this.noiseGain.gain.setTargetAtTime(targetGain, now, 0.05);
    }

    // Live switch noise bed if type changed while playing
    if (this.isPlaying && state.noiseType !== this.currentNoiseType) {
      this.startNoiseBed(state);
    }

    // Live switch brainwave if type changed while playing
    if (this.isPlaying && state.brainwaveType !== this.currentBrainwaveType) {
      this.startBrainwave(state);
    }

    // Brainwave Gain & Frequencies
    if (this.brainwaveGain) {
      const isMuted = state.brainwaveMute || state.brainwaveType === "none" || state.voiceSoloTest;
      const targetGain = isMuted ? 0 : state.brainwaveVolume * 0.2;
      this.brainwaveGain.gain.setTargetAtTime(targetGain, now, 0.05);
    }
  }

  private startNoiseBed(state: AudioMixerState) {
    if (!this.ctx || !this.noiseGain) return;
    this.stopNoiseBed();

    this.currentNoiseType = state.noiseType;
    let buffer: AudioBuffer;
    const duration = 10;
    const rate = this.ctx.sampleRate;

    switch (state.noiseType) {
      case "brown":
        buffer = createBrownNoiseBuffer(this.ctx, duration, rate);
        break;
      case "pink":
        buffer = createPinkNoiseBuffer(this.ctx, duration, rate);
        break;
      case "white":
        buffer = createWhiteNoiseBuffer(this.ctx, duration, rate);
        break;
      case "blue":
        buffer = createBlueNoiseBuffer(this.ctx, duration, rate);
        break;
      case "violet":
        buffer = createVioletNoiseBuffer(this.ctx, duration, rate);
        break;
      case "grey":
        buffer = createGreyNoiseBuffer(this.ctx, duration, rate);
        break;
      case "green":
        buffer = createGreenNoiseBuffer(this.ctx, duration, rate);
        break;
      case "black":
        buffer = createBlackNoiseBuffer(this.ctx, duration, rate);
        break;
      case "ocean":
        buffer = createOceanWavesBuffer(this.ctx, 20, rate);
        break;
      case "rain":
        buffer = createRainBuffer(this.ctx, 15, rate);
        break;
      default:
        buffer = createBrownNoiseBuffer(this.ctx, duration, rate);
        break;
    }

    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = buffer;
    this.noiseSource.loop = true;
    this.noiseSource.connect(this.noiseGain);
    this.noiseSource.start(0);
  }

  private stopNoiseBed() {
    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
      } catch (e) {
        // ignore already stopped
      }
      this.noiseSource = null;
    }
    this.currentNoiseType = null;
  }

  private startBrainwave(state: AudioMixerState) {
    if (!this.ctx || !this.brainwaveGain || state.brainwaveType === "none") {
      this.stopBrainwave();
      return;
    }
    this.stopBrainwave();
    this.currentBrainwaveType = state.brainwaveType;

    const beatDef = resolveBinauralBeat(state.brainwaveType);
    const baseFreq = beatDef.baseFreq;
    const beatOffset = beatDef.beatFreq;
    const waveform = beatDef.waveform || "sine";

    this.mergerNode = this.ctx.createChannelMerger(2);

    this.oscLeft = this.ctx.createOscillator();
    this.oscLeft.type = waveform;
    this.oscLeft.frequency.value = baseFreq;

    this.oscRight = this.ctx.createOscillator();
    this.oscRight.type = waveform;
    this.oscRight.frequency.value = baseFreq + beatOffset;

    this.oscLeft.connect(this.mergerNode, 0, 0);
    this.oscRight.connect(this.mergerNode, 0, 1);
    this.mergerNode.connect(this.brainwaveGain);

    this.oscLeft.start(0);
    this.oscRight.start(0);
  }

  private stopBrainwave() {
    if (this.oscLeft) {
      try {
        this.oscLeft.stop();
        this.oscLeft.disconnect();
      } catch (e) {}
      this.oscLeft = null;
    }
    if (this.oscRight) {
      try {
        this.oscRight.stop();
        this.oscRight.disconnect();
      } catch (e) {}
      this.oscRight = null;
    }
    if (this.mergerNode) {
      try {
        this.mergerNode.disconnect();
      } catch (e) {}
      this.mergerNode = null;
    }
  }

  private async startVoiceSequence() {
    this.stopVoiceSequence();
    if (!this.isPlaying || !this.ctx || !this.voiceFilter) return;

    const readyItems = this.affirmations.filter((a) => a.status === "ready" && a.audioBase64);
    if (readyItems.length === 0) {
      this.activePhraseIndex = -1;
      this.onPhraseChangeCallback?.(-1);
      return;
    }

    let currentIndex = 0;

    const playNext = async () => {
      if (!this.isPlaying || !this.ctx || !this.voiceFilter) return;

      const item = readyItems[currentIndex % readyItems.length];
      const realIndex = this.affirmations.findIndex((a) => a.id === item.id);
      this.activePhraseIndex = realIndex;
      this.onPhraseChangeCallback?.(realIndex);

      let buffer = this.decodedVoiceCache.get(item.id);
      if (!buffer && item.audioBase64) {
        buffer = (await this.decodeAudioBase64(item.id, item.audioBase64)) || undefined;
      }

      if (buffer) {
        this.currentVoiceSource = this.ctx.createBufferSource();
        this.currentVoiceSource.buffer = buffer;
        this.currentVoiceSource.connect(this.voiceFilter);

        this.currentVoiceSource.onended = () => {
          if (!this.isPlaying) return;
          const restTimeMs = (this.mixerState?.intervalRestSec || 6) * 1000;
          this.activePhraseIndex = -1;
          this.onPhraseChangeCallback?.(-1);

          this.voiceLoopTimeout = window.setTimeout(() => {
            currentIndex++;
            playNext();
          }, restTimeMs);
        };

        this.currentVoiceSource.start(0);
      } else {
        // Skip if decode failed
        currentIndex++;
        this.voiceLoopTimeout = window.setTimeout(playNext, 1000);
      }
    };

    playNext();
  }

  private stopVoiceSequence() {
    if (this.voiceLoopTimeout !== null) {
      window.clearTimeout(this.voiceLoopTimeout);
      this.voiceLoopTimeout = null;
    }
    if (this.currentVoiceSource) {
      try {
        this.currentVoiceSource.stop();
        this.currentVoiceSource.disconnect();
      } catch (e) {}
      this.currentVoiceSource = null;
    }
    this.activePhraseIndex = -1;
    this.onPhraseChangeCallback?.(-1);
  }

  public getAnalyserData(dataArray: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(dataArray);
    }
  }

  public getFrequencyBinCount(): number {
    return this.analyser ? this.analyser.frequencyBinCount : 128;
  }

  // Start or ensure background bed is active
  public startBackgroundBedOnly(state: AudioMixerState) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    this.mixerState = state;
    this.isPlaying = true;
    this.updateParameters(state);
    this.startNoiseBed(state);
    this.startBrainwave(state);
  }

  // Play a specific speech buffer immediately through the DSP chain
  public async playVoiceChunk(id: string, base64: string, onEnded?: () => void): Promise<boolean> {
    this.init();
    if (!this.ctx || !this.voiceFilter) return false;

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    if (this.currentVoiceSource) {
      try {
        this.currentVoiceSource.stop();
        this.currentVoiceSource.disconnect();
      } catch (e) {}
      this.currentVoiceSource = null;
    }

    const buffer = await this.decodeAudioBase64(id, base64);
    if (!buffer) return false;

    this.currentVoiceSource = this.ctx.createBufferSource();
    this.currentVoiceSource.buffer = buffer;
    this.currentVoiceSource.connect(this.voiceFilter);

    this.currentVoiceSource.onended = () => {
      this.currentVoiceSource = null;
      onEnded?.();
    };

    this.currentVoiceSource.start(0);
    return true;
  }

  public stopVoiceChunk() {
    if (this.currentVoiceSource) {
      try {
        this.currentVoiceSource.stop();
        this.currentVoiceSource.disconnect();
      } catch (e) {}
      this.currentVoiceSource = null;
    }
  }

  public cleanup() {
    this.pause();
    this.stopVoiceChunk();
    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.close();
    }
    this.decodedVoiceCache.clear();
  }
}

export const studioAudioEngine = new StudioAudioEngine();
