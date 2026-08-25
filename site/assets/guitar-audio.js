const AudioContextClass = window.AudioContext || window.webkitAudioContext;

export function createAudioContext() {
  if (!AudioContextClass) throw new Error('Web Audio API não é suportada neste navegador.');
  return new AudioContextClass();
}

function createPluckedStringBuffer(context, frequency, duration) {
  const sampleRate = context.sampleRate;
  const length = Math.ceil(sampleRate * duration);
  const delay = Math.max(2, Math.round((sampleRate / frequency) - .5));
  const damping = .9964 + Math.min(frequency / 140000, .0022);
  const buffer = context.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  let previousNoise = 0;

  for (let index = 0; index < delay && index < length; index += 1) {
    const noise = (Math.random() * 2) - 1;
    previousNoise = (noise * .72) + (previousNoise * .28);
    const pickEnvelope = Math.sin(Math.PI * (index / delay));
    data[index] = previousNoise * (.65 + (pickEnvelope * .35));
  }

  for (let index = delay; index < length; index += 1) {
    const first = data[index - delay];
    const second = data[index - delay + 1] ?? first;
    data[index] = damping * .5 * (first + second);
  }

  return buffer;
}

export function playGuitarString(context, frequency, options = {}) {
  const {
    when = context.currentTime,
    duration = 3.4,
    level = .5,
    pan = 0,
    output = context.destination
  } = options;
  const source = context.createBufferSource();
  const highpass = context.createBiquadFilter();
  const warmth = context.createBiquadFilter();
  const presence = context.createBiquadFilter();
  const lowpass = context.createBiquadFilter();
  const gain = context.createGain();
  const panner = typeof context.createStereoPanner === 'function' ? context.createStereoPanner() : null;

  source.buffer = createPluckedStringBuffer(context, frequency, duration);
  source.playbackRate.setValueAtTime(1 + ((Math.random() - .5) * .0012), when);

  highpass.type = 'highpass';
  highpass.frequency.value = 42;
  highpass.Q.value = .5;
  warmth.type = 'peaking';
  warmth.frequency.value = 118;
  warmth.Q.value = 1.1;
  warmth.gain.value = 3.2;
  presence.type = 'peaking';
  presence.frequency.value = 235;
  presence.Q.value = .9;
  presence.gain.value = 1.8;
  lowpass.type = 'lowpass';
  lowpass.frequency.value = Math.min(6200, 3300 + (frequency * 5));
  lowpass.Q.value = .45;

  gain.gain.setValueAtTime(.0001, when);
  gain.gain.linearRampToValueAtTime(level, when + .008);
  gain.gain.exponentialRampToValueAtTime(.0001, when + duration);

  source.connect(highpass).connect(warmth).connect(presence).connect(lowpass);
  if (panner) {
    panner.pan.value = pan;
    lowpass.connect(panner).connect(gain);
  } else {
    lowpass.connect(gain);
  }
  gain.connect(output);
  source.start(when);
  source.stop(when + duration + .05);

  return {
    source,
    gain,
    stop(at = context.currentTime) {
      if (typeof gain.gain.cancelAndHoldAtTime === 'function') gain.gain.cancelAndHoldAtTime(at);
      else gain.gain.cancelScheduledValues(at);
      gain.gain.exponentialRampToValueAtTime(.0001, at + .05);
      try { source.stop(at + .06); } catch {}
    }
  };
}
