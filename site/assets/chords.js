const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const SHARP_NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const FLAT_NOTE_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const ROOT_OPTIONS = [
  ['C', 0], ['C♯', 1], ['D♭', 1], ['D', 2], ['E♭', 3], ['E', 4], ['F', 5],
  ['F♯', 6], ['G♭', 6], ['G', 7], ['A♭', 8], ['A', 9], ['B♭', 10], ['B', 11]
];
const TUNING = [2, 9, 2, 7, 9, 2];
const QUALITY = {
  major: { label: 'Maior', suffix: '', intervals: [0, 4, 7] },
  minor: { label: 'Menor', suffix: 'm', intervals: [0, 3, 7] },
  diminished: { label: 'Diminuto', suffix: '°', intervals: [0, 3, 6] },
  halfDiminished: { label: 'Meio-diminuto', suffix: 'ø7', intervals: [0, 3, 6, 10] },
  inversion: { label: 'Inversão', suffix: '', intervals: [0, 4, 7] }
};

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

const mod = (n) => ((n % 12) + 12) % 12;
const noteName = (pitch) => NOTE_NAMES[mod(pitch)];
const spelledNoteName = (pitch, rootName) => (rootName.includes('♭') ? FLAT_NOTE_NAMES : SHARP_NOTE_NAMES)[mod(pitch)];

function chordPitches(root, quality) {
  return QUALITY[quality].intervals.map((interval) => mod(root + interval));
}

function candidatesForString(openPitch, pitches) {
  const candidates = [-1];
  for (let fret = 0; fret <= 12; fret += 1) {
    if (pitches.includes(mod(openPitch + fret))) candidates.push(fret);
  }
  return candidates;
}

function generateVoicings(root, quality) {
  const pitches = chordPitches(root, quality);
  const bassTarget = quality === 'inversion' ? pitches[1] : root;
  const candidates = TUNING.map((open) => candidatesForString(open, pitches));
  const collected = [];

  function visit(stringIndex, frets) {
    if (stringIndex === 6) {
      const sounding = frets.map((fret, index) => fret < 0 ? null : mod(TUNING[index] + fret));
      const soundingPitches = sounding.filter((pitch) => pitch !== null);
      if (soundingPitches.length < 4) return;
      if (!pitches.every((pitch) => soundingPitches.includes(pitch))) return;
      if (soundingPitches[0] !== bassTarget) return;
      const first = frets.findIndex((fret) => fret >= 0);
      const last = frets.findLastIndex((fret) => fret >= 0);
      if (frets.slice(first, last + 1).includes(-1)) return;
      const pressed = frets.filter((fret) => fret > 0);
      const min = pressed.length ? Math.min(...pressed) : 0;
      const max = pressed.length ? Math.max(...pressed) : 0;
      if (max - min > 4 || new Set(pressed).size > 4) return;
      const muted = frets.filter((fret) => fret < 0).length;
      const opens = frets.filter((fret) => fret === 0).length;
      const score = (max * 1.7) + ((max - min) * 2.8) + (pressed.length * .4) + (muted * 4) - (opens * 1.8) - (soundingPitches.length * .3);
      collected.push({ frets: [...frets], score, notes: sounding });
      return;
    }
    for (const fret of candidates[stringIndex]) visit(stringIndex + 1, [...frets, fret]);
  }

  visit(0, []);
  const seen = new Set();
  return collected
    .sort((a, b) => a.score - b.score)
    .filter(({ frets }) => {
      const shape = frets.join('-');
      if (seen.has(shape)) return false;
      seen.add(shape);
      return true;
    })
    .slice(0, 9);
}

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
    const midi = [38, 45, 50, 55, 57, 62][index] + fret;
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
    card.innerHTML = `<div class="chord-head"><div><h3 class="chord-name">${name}</h3><span class="chord-type">${QUALITY[state.quality].label} · posição ${index + 1}</span></div><button class="play-chord" type="button" aria-label="Ouvir ${name}, posição ${index + 1}" aria-pressed="false">▶</button></div>${diagramSvg(voicing, name)}<div class="chord-notes" aria-label="Notas por corda">${labels.map((label) => `<span>${label}</span>`).join('')}</div><div class="chord-shape">${voicing.frets.map((fret) => fret < 0 ? 'x' : fret).join(' · ')}</div>`;
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
