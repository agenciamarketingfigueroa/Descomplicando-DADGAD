import { createAudioContext, playGuitarString } from './guitar-audio.js';

const strings = [...document.querySelectorAll('[data-frequency]')];
let context;
let active = null;

function stop() {
  if (!active) return;
  active.voice.stop();
  active.button.classList.remove('is-playing');
  active.button.setAttribute('aria-pressed', 'false');
  active = null;
}

strings.forEach((button) => button.addEventListener('click', () => {
  const wasActive = active?.button === button;
  stop();
  if (wasActive) return;
  context ||= createAudioContext();
  if (context.state === 'suspended') context.resume();
  const voice = playGuitarString(context, Number(button.dataset.frequency), { duration: 4.2, level: .62 });
  button.classList.add('is-playing');
  button.setAttribute('aria-pressed', 'true');
  active = { voice, button };
  setTimeout(() => {
    if (active?.voice !== voice) return;
    button.classList.remove('is-playing');
    button.setAttribute('aria-pressed', 'false');
    active = null;
  }, 4200);
}));

document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
