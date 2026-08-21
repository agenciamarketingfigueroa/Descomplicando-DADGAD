import { DADGAD_TUNING, QUALITY, generateVoicings, spelledNoteName } from './chord-engine.js';

const ROOT_OPTIONS = [
  ['C', 0], ['C♯', 1], ['D♭', 1], ['D', 2], ['E♭', 3], ['E', 4], ['F', 5],
  ['F♯', 6], ['G♭', 6], ['G', 7], ['A♭', 8], ['A', 9], ['B♭', 10], ['B', 11]
];

const rootSelect = document.querySelector('[data-root]');
const qualityButtons = [...document.querySelectorAll('[data-quality]')];
const searchInput = document.querySelector('[data-chord-search]');
const grid = document.querySelector('[data-chord-grid]');
const resultTitle = document.querySelector('[data-result-title]');
const resultCount = document.querySelector('[data-result-count]');

if (rootSelect && grid) {
  ROOT_OPTIONS.forEach(([name, value]) => {
    const option = document.createElement('option');
    option.value = `${value}:${name}`;
    option.textContent = name;
    option.selected = name === 'D';
    rootSelect.append(option);
  });
}

let state = { root: 2, rootName: 'D', quality: 'major' };

function diagramSvg(voicing, chordName) {
  const { frets } = voicing;
  const pressed = frets.filter((fret) => fret > 0);
  const minPressed = pressed.length ? Math.min(...pressed) : 1;
  const startFret = minPressed > 4 ? minPressed : 1;
  const x = (index) => 22 + (index * 24);
  const y = (fret) => 38 + ((fret - startFret + .5) * 25);
  let marks = '';
  frets.forEach((fret, index) => {
    if (fret < 0) marks += `<text x="${x(index)}" y="24" text-anchor="middle" font-size="12">×</text>`;
    else if (fret === 0) marks += `<circle cx="${x(index)}" cy="19" r="4" fill="none" stroke="currentColor"/>`;
    else marks += `<circle cx="${x(index)}" cy="${y(fret)}" r="7" fill="currentColor"/>`;
  });
  const horizontal = Array.from({ length: 6 }, (_, i) => `<line x1="22" y1="${38 + (i * 25)}" x2="142" y2="${38 + (i * 25)}"/>`).join('');
  const vertical = Array.from({ length: 6 }, (_, i) => `<line x1="${x(i)}" y1="38" x2="${x(i)}" y2="163"/>`).join('');
  return `<svg class="chord-diagram" viewBox="0 0 164 174" role="img" aria-label="Diagrama do acorde ${chordName}">
    <g fill="none" stroke="currentColor" stroke-width="1" opacity=".62">${horizontal}${vertical}</g>
    ${startFret > 1 ? `<text x="4" y="54" font-size="10">${startFret}ª</text>` : '<line x1="22" y1="38" x2="142" y2="38" stroke="currentColor" stroke-width="4"/>'}
    <g fill="currentColor">${marks}</g>
  </svg>`;
}

let audioContext;
function playVoicing(voicing, button) {
  audioContext ||= new AudioContext();
  const start = audioContext.currentTime;
  button.setAttribute('aria-pressed', 'true');
  voicing.frets.forEach((fret, index) => {
    if (fret < 0) return;
    const midi = DADGAD_TUNING[index].midi + fret;
    const frequency = 440 * (2 ** ((midi - 69) / 12));
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const at = start + (index * .075);
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(.12, at + .02);
    gain.gain.exponentialRampToValueAtTime(.001, at + 1.7);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(at);
    oscillator.stop(at + 1.8);
  });
  setTimeout(() => button.setAttribute('aria-pressed', 'false'), 1800);
}

function chordName(rootName, quality) {
  if (quality === 'inversion') return `${rootName}/${spelledNoteName(state.root + 4, rootName)}`;
  return `${rootName}${QUALITY[quality].suffix}`;
}

function render() {
  const name = chordName(state.rootName, state.quality);
  const voicings = generateVoicings(state.root, state.quality);
  resultTitle.textContent = name;
  resultCount.textContent = `${voicings.length} ${voicings.length === 1 ? 'posição encontrada' : 'posições encontradas'}`;
  grid.replaceChildren();

  if (!voicings.length) {
    grid.innerHTML = `<div class="empty-state"><strong>Nenhuma posição confortável nesta região.</strong><p>Tente outra classe ou nota fundamental.</p></div>`;
    return;
  }

  voicings.forEach((voicing, index) => {
    const card = document.createElement('article');
    card.className = 'chord-card';
    const labels = voicing.notes.map((note) => note === null ? '—' : spelledNoteName(note, state.rootName));
    card.innerHTML = `<div class="chord-head"><div><h3 class="chord-name">${name}</h3><span class="chord-type">${QUALITY[state.quality].label} · posição ${index + 1}</span></div><button class="play-chord" type="button" aria-label="Ouvir ${name}, posição ${index + 1}" aria-pressed="false">▶</button></div><div class="chord-tuning"><span>Afinação</span><strong>${DADGAD_TUNING.map(({ note }) => note).join(' · ')}</strong><small>6ª → 1ª</small></div>${diagramSvg(voicing, name)}<div class="chord-row-label">Notas resultantes</div><div class="chord-notes" aria-label="Notas resultantes por corda, da sexta para a primeira">${labels.map((label) => `<span>${label}</span>`).join('')}</div><div class="chord-row-label">Casas · 6ª → 1ª</div><div class="chord-shape">${voicing.frets.map((fret) => fret < 0 ? 'x' : fret).join(' · ')}</div>`;
    card.querySelector('button').addEventListener('click', (event) => playVoicing(voicing, event.currentTarget));
    grid.append(card);
  });
}

function setQuality(quality) {
  state.quality = quality;
  qualityButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.quality === quality)));
  render();
}

qualityButtons.forEach((button) => button.addEventListener('click', () => {
  searchInput.value = '';
  setQuality(button.dataset.quality);
}));

rootSelect?.addEventListener('change', () => {
  const [root, name] = rootSelect.value.split(':');
  state.root = Number(root);
  state.rootName = name;
  searchInput.value = '';
  render();
});

function parseSearch(value) {
  const clean = value.trim().replaceAll('♯', '#').replaceAll('♭', 'b').replaceAll(' ', '');
  const match = clean.match(/^([A-Ga-g])([#b]?)(.*)$/);
  if (!match) return false;
  const rawRoot = `${match[1].toUpperCase()}${match[2]}`;
  const rootMatch = ROOT_OPTIONS.find(([name]) => name.replace('♯', '#').replace('♭', 'b') === rawRoot);
  if (!rootMatch) return false;
  const tail = match[3].toLowerCase();
  let quality = 'major';
  if (tail.includes('/') || tail === 'inv') quality = 'inversion';
  else if (tail.includes('m7b5') || tail.includes('ø') || tail.includes('meio')) quality = 'halfDiminished';
  else if (tail.includes('dim') || tail.includes('°')) quality = 'diminished';
  else if (tail.startsWith('m') || tail.includes('menor')) quality = 'minor';
  state = { root: rootMatch[1], rootName: rootMatch[0], quality };
  rootSelect.value = `${rootMatch[1]}:${rootMatch[0]}`;
  qualityButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.quality === quality)));
  render();
  return true;
}

searchInput?.addEventListener('input', () => {
  if (!searchInput.value.trim()) return;
  parseSearch(searchInput.value);
});

const queryChord = new URLSearchParams(window.location.search).get('acorde');
if (queryChord) {
  searchInput.value = queryChord;
  if (!parseSearch(queryChord)) render();
} else {
  render();
}
