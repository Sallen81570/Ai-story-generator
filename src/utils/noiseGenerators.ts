/**
 * Web Audio Buffer Synthesizers for Acoustic Beds, Colored Noises & Subliminal Soundscapes
 */

export function createBrownNoiseBuffer(
  ctx: BaseAudioContext,
  durationSec: number = 10,
  sampleRate: number = 44100
): AudioBuffer {
  const length = Math.floor(durationSec * sampleRate);
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let lastOut = 0.0;
    
    // Leaky Brownian integrator to prevent DC drift (-6 dB/octave)
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5; // Gain compensation
    }

    // Smooth boundary loop wrap
    const fadeSamples = Math.min(2048, Math.floor(length * 0.05));
    for (let i = 0; i < fadeSamples; i++) {
      const alpha = i / fadeSamples;
      data[i] = data[i] * alpha + data[length - 1 - (fadeSamples - i)] * (1 - alpha);
    }
  }

  return buffer;
}

export function createPinkNoiseBuffer(
  ctx: BaseAudioContext,
  durationSec: number = 10,
  sampleRate: number = 44100
): AudioBuffer {
  const length = Math.floor(durationSec * sampleRate);
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    // Paul Kellet 6-pole filter network (-3 dB/octave)
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    // Smooth loop boundary
    const fadeSamples = Math.min(2048, Math.floor(length * 0.05));
    for (let i = 0; i < fadeSamples; i++) {
      const alpha = i / fadeSamples;
      data[i] = data[i] * alpha + data[length - 1 - (fadeSamples - i)] * (1 - alpha);
    }
  }

  return buffer;
}

export function createWhiteNoiseBuffer(
  ctx: BaseAudioContext,
  durationSec: number = 10,
  sampleRate: number = 44100
): AudioBuffer {
  const length = Math.floor(durationSec * sampleRate);
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    // Flat spectral density (0 dB/octave)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.22;
    }

    const fadeSamples = Math.min(2048, Math.floor(length * 0.05));
    for (let i = 0; i < fadeSamples; i++) {
      const alpha = i / fadeSamples;
      data[i] = data[i] * alpha + data[length - 1 - (fadeSamples - i)] * (1 - alpha);
    }
  }

  return buffer;
}

export function createBlueNoiseBuffer(
  ctx: BaseAudioContext,
  durationSec: number = 10,
  sampleRate: number = 44100
): AudioBuffer {
  const length = Math.floor(durationSec * sampleRate);
  const buffer = ctx.createBuffer(2, length, sampleRate);

  // Blue Noise (Azure Noise): +3 dB/octave increase in power with frequency.
  // Differencing pink noise yields exact f (+3 dB/octave) spectral response.
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastPink = 0;

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;

      const blue = (pink - lastPink) * 4.2;
      lastPink = pink;
      data[i] = blue * 0.42;
    }

    const fadeSamples = Math.min(2048, Math.floor(length * 0.05));
    for (let i = 0; i < fadeSamples; i++) {
      const alpha = i / fadeSamples;
      data[i] = data[i] * alpha + data[length - 1 - (fadeSamples - i)] * (1 - alpha);
    }
  }

  return buffer;
}

export function createVioletNoiseBuffer(
  ctx: BaseAudioContext,
  durationSec: number = 10,
  sampleRate: number = 44100
): AudioBuffer {
  const length = Math.floor(durationSec * sampleRate);
  const buffer = ctx.createBuffer(2, length, sampleRate);

  // Violet / Purple Noise: +6 dB/octave increase in power (proportional to f²).
  // First derivative of flat white noise.
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let lastWhite = 0;

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      const violet = (white - lastWhite) * 0.5;
      lastWhite = white;
      data[i] = violet * 0.3;
    }

    const fadeSamples = Math.min(2048, Math.floor(length * 0.05));
    for (let i = 0; i < fadeSamples; i++) {
      const alpha = i / fadeSamples;
      data[i] = data[i] * alpha + data[length - 1 - (fadeSamples - i)] * (1 - alpha);
    }
  }

  return buffer;
}

export function createGreyNoiseBuffer(
  ctx: BaseAudioContext,
  durationSec: number = 10,
  sampleRate: number = 44100
): AudioBuffer {
  const length = Math.floor(durationSec * sampleRate);
  const buffer = ctx.createBuffer(2, length, sampleRate);

  // Grey Noise: Inverted Equal-Loudness (Fletcher-Munson / ISO 226) psychoacoustic curve.
  // Boosted sub-bass + boosted high treble with scooped midrange so it sounds equally loud across all frequencies.
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let bassInt = 0;
    let lastW = 0;

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      bassInt = (bassInt + 0.035 * white) / 1.035; // Sub-bass low shelf
      const treble = (white - lastW) * 0.42; // Upper treble air
      lastW = white;

      const grey = (bassInt * 2.2 + treble * 0.55 + white * 0.06) * 0.45;
      data[i] = grey;
    }

    const fadeSamples = Math.min(2048, Math.floor(length * 0.05));
    for (let i = 0; i < fadeSamples; i++) {
      const alpha = i / fadeSamples;
      data[i] = data[i] * alpha + data[length - 1 - (fadeSamples - i)] * (1 - alpha);
    }
  }

  return buffer;
}

export function createGreenNoiseBuffer(
  ctx: BaseAudioContext,
  durationSec: number = 10,
  sampleRate: number = 44100
): AudioBuffer {
  const length = Math.floor(durationSec * sampleRate);
  const buffer = ctx.createBuffer(2, length, sampleRate);

  // Green Noise: Center-band natural spectrum (500 Hz – 2200 Hz).
  // Mimics natural ambient outdoor background, forest canopy, and foliage rustle.
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let lp1 = 0, lp2 = 0;
    let hp = 0;

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lp1 += (white - lp1) * 0.28;
      lp2 += (lp1 - lp2) * 0.28;
      hp += (lp2 - hp) * 0.055;
      const green = (lp2 - hp) * 1.65;
      data[i] = green * 0.45;
    }

    const fadeSamples = Math.min(2048, Math.floor(length * 0.05));
    for (let i = 0; i < fadeSamples; i++) {
      const alpha = i / fadeSamples;
      data[i] = data[i] * alpha + data[length - 1 - (fadeSamples - i)] * (1 - alpha);
    }
  }

  return buffer;
}

export function createBlackNoiseBuffer(
  ctx: BaseAudioContext,
  durationSec: number = 10,
  sampleRate: number = 44100
): AudioBuffer {
  const length = Math.floor(durationSec * sampleRate);
  const buffer = ctx.createBuffer(2, length, sampleRate);

  // Black Noise: Ultra-deep sub-bass infra-acoustic rumble (<100 Hz, 1/f³ to 1/f⁴ slope).
  // Deep planetary resonance and calming stillness.
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let int1 = 0, int2 = 0;

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      int1 = (int1 + 0.012 * white) / 1.012;
      int2 = (int2 + 0.014 * int1) / 1.014;
      data[i] = int2 * 11.0;
    }

    const fadeSamples = Math.min(2048, Math.floor(length * 0.05));
    for (let i = 0; i < fadeSamples; i++) {
      const alpha = i / fadeSamples;
      data[i] = data[i] * alpha + data[length - 1 - (fadeSamples - i)] * (1 - alpha);
    }
  }

  return buffer;
}

export function createOceanWavesBuffer(
  ctx: BaseAudioContext,
  durationSec: number = 20,
  sampleRate: number = 44100
): AudioBuffer {
  const length = Math.floor(durationSec * sampleRate);
  const buffer = ctx.createBuffer(2, length, sampleRate);

  // Generate modulated brown/pink noise that swells like rhythmic ocean tides
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let lastOut = 0;
    const wavePeriod = sampleRate * 7.5; // ~7.5s per wave cycle

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.025 * white) / 1.025;

      // Swell envelope with slight channel phase offset for wide stereo
      const phase = (i + channel * (sampleRate * 1.5)) / wavePeriod;
      const swell = Math.pow(Math.sin(phase * Math.PI * 2) * 0.5 + 0.5, 2.2);
      const spray = (Math.random() * 2 - 1) * 0.05 * Math.sin(phase * Math.PI * 2);

      data[i] = (lastOut * 2.8 * swell + spray) * 0.45;
    }

    const fadeSamples = Math.min(4096, Math.floor(length * 0.05));
    for (let i = 0; i < fadeSamples; i++) {
      const alpha = i / fadeSamples;
      data[i] = data[i] * alpha + data[length - 1 - (fadeSamples - i)] * (1 - alpha);
    }
  }

  return buffer;
}

export function createRainBuffer(
  ctx: BaseAudioContext,
  durationSec: number = 15,
  sampleRate: number = 44100
): AudioBuffer {
  const length = Math.floor(durationSec * sampleRate);
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.08;
      b1 = 0.95 * b1 + white * 0.15;
      b2 = 0.85 * b2 + white * 0.25;
      let rainNoise = (b0 + b1 + b2) * 0.12;

      // Occasional gentle drops
      if (Math.random() < 0.0015) {
        rainNoise += (Math.random() * 2 - 1) * 0.35;
      }

      data[i] = rainNoise * 0.4;
    }

    const fadeSamples = Math.min(2048, Math.floor(length * 0.05));
    for (let i = 0; i < fadeSamples; i++) {
      const alpha = i / fadeSamples;
      data[i] = data[i] * alpha + data[length - 1 - (fadeSamples - i)] * (1 - alpha);
    }
  }

  return buffer;
}
