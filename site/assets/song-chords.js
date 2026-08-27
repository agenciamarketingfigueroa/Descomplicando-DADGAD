import {
  DADGAD_LABEL,
  DADGAD_TUNING,
  QUALITY,
  generateVoicingsForIntervals,
  getCourseVoicings,
  mod
} from './chord-engine.js';
import { createAudioContext, playGuitarString } from './guitar-audio.js';

const ROOT_PITCHES = Object.freeze({
  C: 0, 'C♯': 1, 'D♭': 1, D: 2, 'D♯': 3, 'E♭': 3, E: 4, F: 5,
  'F♯': 6, 'G♭': 6, G: 7, 'G♯': 8, 'A♭': 8, A: 9, 'A♯': 10, 'B♭': 10, B: 11
});

const SONG_QUALITIES = Object.freeze({
  major: { suffix: '', label: 'Maior', intervals: [0, 4, 7], engineQuality: 'major', family: 'major' },
  minor: { suffix: 'm', label: 'Menor', intervals: [0, 3, 7], engineQuality: 'minor', family: 'minor' },
  dominant7: { suffix: '7', label: 'Sétima', intervals: [0, 4, 7, 10], engineQuality: 'dominant7', family: 'major' },
  major7: { suffix: '7+', label: 'Sétima maior', intervals: [0, 4, 7, 11], engineQuality: 'major7', family: 'major' },
  minor7: { suffix: 'm7', label: 'Menor com sétima', intervals: [0, 3, 7, 10], family: 'minor' },
  diminished: { suffix: '°', label: 'Diminuto', intervals: [0, 3, 6], engineQuality: 'diminished', family: 'diminished' },
  halfDiminished: { suffix: 'ø7', label: 'Meio-diminuto', intervals: [0, 3, 6, 10], engineQuality: 'halfDiminished', family: 'diminished' },
  sus2: { suffix: 'sus2', label: 'Suspenso 2', intervals: [0, 2, 7], family: 'major' },
  sus4: { suffix: 'sus4', label: 'Suspenso 4', intervals: [0, 5, 7], family: 'major' },
  add9: { suffix: 'add9', label: 'Com nona adicionada', intervals: [0, 2, 4, 7], family: 'major' },
  minorAdd9: { suffix: 'm(add9)', label: 'Menor com nona', intervals: [0, 2, 3, 7], family: 'minor' },
  dominant9: { suffix: '9', label: 'Nona dominante', intervals: [0, 2, 4, 7, 10], family: 'major' },
  major9: { suffix: '9+', label: 'Nona maior', intervals: [0, 2, 4, 7, 11], family: 'major' },
  minor9: { suffix: 'm9', label: 'Menor com nona', intervals: [0, 2, 3, 7, 10], family: 'minor' },
  sixth: { suffix: '6', label: 'Sexta', intervals: [0, 4, 7, 9], family: 'major' },
  minor6: { suffix: 'm6', label: 'Menor com sexta', intervals: [0, 3, 7, 9], family: 'minor' },
  power: { suffix: '5', label: 'Power chord', intervals: [0, 7], family: 'major' },
  augmented: { suffix: '+', label: 'Aumentado', intervals: [0, 4, 8], family: 'major' }
});

const pageDocument = globalThis.document;
const mainForm = pageDocument?.querySelector('[data-song-form]');
const songTitleInput = pageDocument?.querySelector('[data-song-title]');
const artistInput = pageDocument?.querySelector('[data-song-artist]');
const chordInput = pageDocument?.querySelector('[data-song-chords]');
const exportButton = pageDocument?.querySelector('[data-export-song]');
const exampleButton = pageDocument?.querySelector('[data-song-example]');
const statusNode = pageDocument?.querySelector('[data-song-status]');
const output = pageDocument?.querySelector('[data-song-output]');
const mainGrid = pageDocument?.querySelector('[data-main-chords]');
const colorGrid = pageDocument?.querySelector('[data-color-chords]');
const exactList = pageDocument?.querySelector('[data-exact-chords]');
const resultSong = [...(pageDocument?.querySelectorAll('[data-result-song]') || [])];
const resultArtist = [...(pageDocument?.querySelectorAll('[data-result-artist]') || [])];

const normalizeAccidental = (value = '') => value.replace('#', '♯').replace('b', '♭');

function qualityFromTail(rawTail) {
  const tail = rawTail.replaceAll(' ', '');
  const lower = tail.toLowerCase();
  if (/^(m7b5|ø7?|min7b5)/i.test(tail)) return 'halfDiminished';
  if (/^(maj9|9\+|9M)$/i.test(tail)) return 'major9';
  if (/^(maj7|7\+|7M|M7)$/i.test(tail)) return 'major7';
  if (/^(m\(add9\)|madd9)$/i.test(tail)) return 'minorAdd9';
  if (/^m9$/i.test(tail)) return 'minor9';
  if (/^m7$/i.test(tail)) return 'minor7';
  if (/^m6$/i.test(tail)) return 'minor6';
  if (/^(dim|dim7|°)$/i.test(tail)) return 'diminished';
  if (/^(sus2|2)$/i.test(tail)) return 'sus2';
  if (/^(sus4|sus|4)$/i.test(tail)) return 'sus4';
  if (/^add9$/i.test(tail)) return 'add9';
  if (/^9$/i.test(tail)) return 'dominant9';
  if (/^7$/i.test(tail)) return 'dominant7';
  if (/^6$/i.test(tail)) return 'sixth';
  if (/^5$/i.test(tail)) return 'power';
  if (/^(aug|\+)$/i.test(tail)) return 'augmented';
  if (lower.startsWith('m')) return 'minor';
  return 'major';
}

export function parseChordSymbol(value) {
  const clean = value.trim().replace(/[()[\],;:]/g, '').replaceAll('♯', '#').replaceAll('♭', 'b');
  const match = clean.match(/^([A-Ga-g])([#b]?)([^/]*)?(?:\/([A-Ga-g])([#b]?))?$/);
  if (!match) return null;
  const root = `${match[1].toUpperCase()}${normalizeAccidental(match[2])}`;
  const bass = match[4] ? `${match[4].toUpperCase()}${normalizeAccidental(match[5])}` : '';
  if (!(root in ROOT_PITCHES) || (bass && !(bass in ROOT_PITCHES))) return null;
  const quality = qualityFromTail(match[3] || '');
  const definition = SONG_QUALITIES[quality];
  const symbol = `${root}${definition.suffix}${bass ? `/${bass}` : ''}`;
  return {
    symbol,
    root,
    rootPitch: ROOT_PITCHES[root],
    bass,
    bassPitch: bass ? ROOT_PITCHES[bass] : null,
    quality,
    ...definition
  };
}

export function parseChordText(value) {
  const pattern = /(^|[^A-Za-zÀ-ÿ])([A-Ga-g](?:#|b|♯|♭)?(?:maj9|maj7|M7|7M|9M|7\+|9\+|m7b5|m\(add9\)|madd9|m9|m7|m6|m|dim7?|°|ø7?|sus2|sus4|sus|add9|aug|[+]|9|7|6|5|4|2)?(?:\/[A-Ga-g](?:#|b|♯|♭)?)?)(?=$|[^A-Za-zÀ-ÿ])/g;
  const seen = new Set();
  const chords = [];
  for (const match of value.matchAll(pattern)) {
    const chord = parseChordSymbol(match[2]);
    if (!chord || seen.has(chord.symbol)) continue;
    seen.add(chord.symbol);
    chords.push(chord);
  }
  return chords;
}

function mainChordFor(chord) {
  if (chord.family === 'minor') return parseChordSymbol(`${chord.root}m`);
  if (chord.family === 'diminished') return parseChordSymbol(`${chord.root}°`);
  return parseChordSymbol(chord.root);
}

function suggestedColors(mainChord, actualChords) {
  const suggestions = mainChord.family === 'minor'
    ? [`${mainChord.root}m7`, `${mainChord.root}m(add9)`]
    : mainChord.family === 'major'
      ? [`${mainChord.root}7+`, `${mainChord.root}add9`]
      : [];
  const combined = [
    ...actualChords.filter((chord) => chord.symbol !== mainChord.symbol),
    ...suggestions.map(parseChordSymbol).filter(Boolean)
  ];
  const seen = new Set();
  return combined.filter((chord) => {
    if (!chord || seen.has(chord.symbol)) return false;
    seen.add(chord.symbol);
    return true;
  }).slice(0, 2);
}

function buildStudy(chords) {
  const groups = new Map();
  chords.forEach((chord) => {
    const main = mainChordFor(chord);
    const key = main.symbol;
    if (!groups.has(key)) groups.set(key, { main, actual: [] });
    groups.get(key).actual.push(chord);
  });
  return [...groups.values()].map((group) => ({
    ...group,
    colors: suggestedColors(group.main, group.actual)
  }));
}

function bestVoicing(chord) {
  const course = chord.engineQuality
    ? getCourseVoicings(chord.rootPitch, chord.engineQuality)[0]
    : null;
  if (course && chord.bassPitch === null) return { ...course, fromCourse: true };
  const generated = generateVoicingsForIntervals(chord.rootPitch, chord.intervals, {
    bassTarget: chord.bassPitch ?? chord.rootPitch
  })[0];
  return generated || null;
}

function diagramSvg(voicing, chordName) {
  if (!voicing) return '<div class="song-no-shape">Use a forma principal como base e experimente a dissonância pelo ouvido.</div>';
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
  return `<svg class="song-chord-diagram" viewBox="0 0 164 174" role="img" aria-label="Diagrama do acorde ${chordName}">
    <g fill="none" stroke="currentColor" stroke-width="1" opacity=".62">${horizontal}${vertical}</g>
    ${startFret > 1 ? `<text x="4" y="54" font-size="10">${startFret}ª</text>` : '<line x1="22" y1="38" x2="142" y2="38" stroke="currentColor" stroke-width="4"/>'}
    <g fill="currentColor">${marks}</g>
  </svg>`;
}

let audioContext;
function playVoicing(voicing, button) {
  if (!voicing) return;
  audioContext ||= createAudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();
  const start = audioContext.currentTime + .025;
  const soundingStrings = voicing.frets.filter((fret) => fret >= 0).length;
  const master = audioContext.createGain();
  master.gain.value = .82 / Math.sqrt(soundingStrings);
  master.connect(audioContext.destination);
  button.setAttribute('aria-pressed', 'true');
  voicing.frets.forEach((fret, index) => {
    if (fret < 0) return;
    const midi = DADGAD_TUNING[index].midi + fret;
    const frequency = 440 * (2 ** ((midi - 69) / 12));
    playGuitarString(audioContext, frequency, {
      when: start + (index * .055), duration: 3.5, level: .58,
      pan: ((index / 5) * .34) - .17, output: master
    });
  });
  setTimeout(() => {
    button.setAttribute('aria-pressed', 'false');
    master.disconnect();
  }, 4000);
}

function chordCard(chord, kind) {
  const voicing = bestVoicing(chord);
  const article = document.createElement('article');
  article.className = `song-chord-card ${kind === 'main' ? 'is-main' : 'is-color'}`;
  const badge = kind === 'main'
    ? (voicing?.fromCourse ? 'Sugestão do curso' : 'Forma principal')
    : 'Opção com cor';
  article.innerHTML = `<div class="song-chord-card-head"><div><span class="song-chord-badge">${badge}</span><h4>${chord.symbol}</h4><p>${chord.label}</p></div><button class="play-chord screen-only" type="button" aria-label="Ouvir ${chord.symbol}" aria-pressed="false" ${voicing ? '' : 'disabled'}>▶</button></div><div class="song-card-tuning">${DADGAD_LABEL}</div>${diagramSvg(voicing, chord.symbol)}`;
  article.querySelector('button')?.addEventListener('click', (event) => playVoicing(voicing, event.currentTarget));
  return article;
}

function setStatus(message = '', type = '') {
  if (!statusNode) return;
  statusNode.textContent = message;
  statusNode.dataset.type = type;
}

function renderSong({ title, artist, chords }) {
  if (!chords.length) {
    setStatus('Não encontrei acordes válidos. Tente algo como D, Bm, G, A7 ou C7+.', 'error');
    return;
  }
  const study = buildStudy(chords);
  resultSong.forEach((node) => { node.textContent = title || 'Minha música'; });
  resultArtist.forEach((node) => { node.textContent = artist || 'Artista não informado'; });
  exactList.replaceChildren(...chords.map((chord) => {
    const item = document.createElement('span');
    item.textContent = chord.symbol;
    return item;
  }));
  mainGrid.replaceChildren(...study.map(({ main }) => chordCard(main, 'main')));
  const colors = study.flatMap(({ colors: groupColors }) => groupColors);
  colorGrid.replaceChildren(...colors.map((chord) => chordCard(chord, 'color')));
  pageDocument.querySelector('[data-color-section]').hidden = colors.length === 0;
  output.hidden = false;
  exportButton.disabled = false;
  setStatus(`${chords.length} ${chords.length === 1 ? 'acorde identificado' : 'acordes identificados'} e organizados para estudar.`, 'success');
  output.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function readManualForm() {
  const chords = parseChordText(chordInput.value);
  renderSong({ title: songTitleInput.value.trim(), artist: artistInput.value.trim(), chords });
}

mainForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  readManualForm();
});

exampleButton?.addEventListener('click', () => {
  songTitleInput.value = 'Caminho aberto';
  artistInput.value = 'Exemplo DADGAD';
  chordInput.value = 'D  Bm  G  A7';
  readManualForm();
});

exportButton?.addEventListener('click', () => {
  const originalTitle = document.title;
  document.title = `${songTitleInput.value.trim() || 'Minha música'} — Acordes em DADGAD`;
  window.print();
  setTimeout(() => { document.title = originalTitle; }, 500);
});
