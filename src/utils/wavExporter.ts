import { AffirmationItem, AudioMixerState, ExportSettings } from "../types";
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

/**
 * Encodes an AudioBuffer into standard 16-bit PCM WAV format ArrayBuffer
 */
export function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const numSamples = buffer.length;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // Helper to write ASCII strings
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF chunk descriptor
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");

  // "fmt " sub-chunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // "data" sub-chunk
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // Interleave channels & write 16-bit PCM samples
  let offset = 44;
  const channelData: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channelData.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channelData[c][i];
      // Hard clamp
      sample = Math.max(-1, Math.min(1, sample));
      // Convert float [-1, 1] to 16-bit signed integer [-32768, 32767]
      const intSample = sample < 0 ? sample * 32768 : sample * 32767;
      view.setInt16(offset, Math.floor(intSample), true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

/**
 * Renders the master subliminal track offline using Web Audio's OfflineAudioContext
 */
export async function renderMasterSubliminalTrack(
  mixerState: AudioMixerState,
  affirmations: AffirmationItem[],
  settings: ExportSettings,
  onProgress?: (pct: number, stage: string) => void
): Promise<Blob> {
  const sampleRate = settings.sampleRate || 44100;
  const targetDurationSec = Math.max(10, settings.targetMinutes * 60);
  const totalSamples = Math.floor(targetDurationSec * sampleRate);

  onProgress?.(5, "Initializing Offline DSP Audio Context...");

  const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

  // 1. Master Channel with Master Low-Pass Filter (e.g. 3500 Hz smoothing)
  const masterFilter = offlineCtx.createBiquadFilter();
  masterFilter.type = "lowpass";
  masterFilter.frequency.value = mixerState.masterLowPassHz || 3500;
  masterFilter.Q.value = 0.707;

  const masterGain = offlineCtx.createGain();
  masterGain.gain.value = mixerState.masterVolume;

  masterFilter.connect(masterGain);
  masterGain.connect(offlineCtx.destination);

  // 2. Decode ready affirmation voice clips
  onProgress?.(15, "Decoding synthesized subliminal voice tracks...");
  const decodedVoiceBuffers: AudioBuffer[] = [];

  const readyItems = affirmations.filter((a) => a.status === "ready" && a.audioBase64);

  for (const item of readyItems) {
    if (!item.audioBase64) continue;
    try {
      const cleanBase64 = item.audioBase64.replace(/^data:.*?;base64,/i, "").replace(/\s/g, "");
      const binaryString = atob(cleanBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBuffer = await offlineCtx.decodeAudioData(bytes.buffer.slice(0));
      decodedVoiceBuffers.push(audioBuffer);
    } catch (e) {
      console.warn("Failed to decode audio base64 for export:", item.text, e);
    }
  }

  // 3. Setup Voice Channel with Low-Pass filter (2200 Hz) & Subliminal Attenuation (-26 dB)
  if (decodedVoiceBuffers.length > 0 && !mixerState.voiceMute && mixerState.voiceVolume > 0) {
    onProgress?.(25, "Arranging subliminal voice sequence & applying acoustic softening filter...");

    const voiceFilter = offlineCtx.createBiquadFilter();
    voiceFilter.type = "lowpass";
    voiceFilter.frequency.value = mixerState.voiceLowPassHz || 2200;
    voiceFilter.Q.value = 0.707;

    const voiceGain = offlineCtx.createGain();
    // Subliminal dB calculation: 10^(dB / 20)
    const attenuationDb = mixerState.voiceSoloTest ? 0 : mixerState.subliminalAttenuationDb;
    const attenuationLinear = Math.pow(10, attenuationDb / 20);
    voiceGain.gain.value = mixerState.voiceVolume * attenuationLinear;

    voiceFilter.connect(voiceGain);
    voiceGain.connect(masterFilter);

    // Schedule looping voices across target duration with spacing
    let currentTime = 1.0; // 1 second initial silence
    const restInterval = Math.max(1, mixerState.intervalRestSec || 6);

    while (currentTime < targetDurationSec) {
      for (const buffer of decodedVoiceBuffers) {
        if (currentTime >= targetDurationSec) break;

        const source = offlineCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(voiceFilter);
        source.start(currentTime);

        currentTime += buffer.duration + restInterval;
      }
    }
  }

  // 4. Setup Noise Bed Channel (Brown / Pink / White / Blue / Violet / Grey / Green / Black / Ocean / Rain)
  if (!mixerState.noiseMute && mixerState.noiseVolume > 0) {
    onProgress?.(45, `Synthesizing ${mixerState.noiseType.toUpperCase()} noise acoustic bed...`);

    let noiseBuffer: AudioBuffer;
    const noiseChunkSec = 15; // 15s seamless loop

    switch (mixerState.noiseType) {
      case "brown":
        noiseBuffer = createBrownNoiseBuffer(offlineCtx, noiseChunkSec, sampleRate);
        break;
      case "pink":
        noiseBuffer = createPinkNoiseBuffer(offlineCtx, noiseChunkSec, sampleRate);
        break;
      case "white":
        noiseBuffer = createWhiteNoiseBuffer(offlineCtx, noiseChunkSec, sampleRate);
        break;
      case "blue":
        noiseBuffer = createBlueNoiseBuffer(offlineCtx, noiseChunkSec, sampleRate);
        break;
      case "violet":
        noiseBuffer = createVioletNoiseBuffer(offlineCtx, noiseChunkSec, sampleRate);
        break;
      case "grey":
        noiseBuffer = createGreyNoiseBuffer(offlineCtx, noiseChunkSec, sampleRate);
        break;
      case "green":
        noiseBuffer = createGreenNoiseBuffer(offlineCtx, noiseChunkSec, sampleRate);
        break;
      case "black":
        noiseBuffer = createBlackNoiseBuffer(offlineCtx, noiseChunkSec, sampleRate);
        break;
      case "ocean":
        noiseBuffer = createOceanWavesBuffer(offlineCtx, 20, sampleRate);
        break;
      case "rain":
        noiseBuffer = createRainBuffer(offlineCtx, 15, sampleRate);
        break;
      default:
        noiseBuffer = createBrownNoiseBuffer(offlineCtx, noiseChunkSec, sampleRate);
        break;
    }

    const noiseGain = offlineCtx.createGain();
    noiseGain.gain.value = mixerState.noiseVolume * 0.85;
    noiseGain.connect(masterFilter);

    // Loop noise buffer across the entire duration
    const noiseSource = offlineCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    noiseSource.connect(noiseGain);
    noiseSource.start(0);
  }

  // 5. Setup Brainwave & DMT Frequency Entrainment (Binaural beats / Solfeggio / DMT Pineal)
  if (!mixerState.brainwaveMute && mixerState.brainwaveVolume > 0 && mixerState.brainwaveType !== "none") {
    onProgress?.(60, "Modulating brainwave & DMT entrainment frequencies...");

    const brainwaveGain = offlineCtx.createGain();
    brainwaveGain.gain.value = mixerState.brainwaveVolume * 0.18; // gentle background presence
    brainwaveGain.connect(masterFilter);

    const beatDef = resolveBinauralBeat(mixerState.brainwaveType);
    const baseFreq = beatDef.baseFreq;
    const beatOffset = beatDef.beatFreq;
    const waveform = beatDef.waveform || "sine";

    // Create Stereo Merger for precise Left/Right binaural separation
    const merger = offlineCtx.createChannelMerger(2);

    const oscLeft = offlineCtx.createOscillator();
    oscLeft.type = waveform;
    oscLeft.frequency.value = baseFreq;

    const oscRight = offlineCtx.createOscillator();
    oscRight.type = waveform;
    oscRight.frequency.value = baseFreq + beatOffset;

    oscLeft.connect(merger, 0, 0); // Left ear
    oscRight.connect(merger, 0, 1); // Right ear

    merger.connect(brainwaveGain);

    oscLeft.start(0);
    oscRight.start(0);
  }

  // 6. Start offline multi-threaded rendering
  onProgress?.(75, "Rendering multi-track master audio offline...");
  const renderedBuffer = await offlineCtx.startRendering();

  // 7. Encode to WAV
  onProgress?.(90, "Encoding studio-quality 16-bit PCM RIFF WAV...");
  const wavArrayBuffer = audioBufferToWav(renderedBuffer);

  onProgress?.(100, "Master sleep track export complete!");

  return new Blob([wavArrayBuffer], { type: "audio/wav" });
}
