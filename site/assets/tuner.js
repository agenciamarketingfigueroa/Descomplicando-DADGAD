const strings = [...document.querySelectorAll('[data-frequency]')];
let context;
let active = null;

function stop() {
  if (!active) return;
  active.gain.gain.exponentialRampToValueAtTime(.001, active.context.currentTime + .08);
  active.oscillator.stop(active.context.currentTime + .1);
  active.button.classList.remove('is-playing');
  active.button.setAttribute('aria-pressed', 'false');
  active = null;
}

strings.forEach((button) => button.addEventListener('click', () => {
  const wasActive = active?.button === button;
  stop();
  if (wasActive) return;
  context ||= new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.value = Number(button.dataset.frequency);
  gain.gain.setValueAtTime(.001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.17, context.currentTime + .04);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  button.classList.add('is-playing');
  button.setAttribute('aria-pressed', 'true');
  active = { oscillator, gain, context, button };
}));

document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
