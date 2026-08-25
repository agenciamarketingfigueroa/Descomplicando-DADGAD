export const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
export const SHARP_NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
export const FLAT_NOTE_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

// Da 6ª (mais grave) para a 1ª (mais aguda).
export const DADGAD_TUNING = Object.freeze([
  { note: 'D', pitch: 2, midi: 38 },
  { note: 'A', pitch: 9, midi: 45 },
  { note: 'D', pitch: 2, midi: 50 },
  { note: 'G', pitch: 7, midi: 55 },
  { note: 'A', pitch: 9, midi: 57 },
  { note: 'D', pitch: 2, midi: 62 }
].map(Object.freeze));

export const DADGAD_LABEL = DADGAD_TUNING.map(({ note }) => note).join(' · ');

export const QUALITY = {
  major: { label: 'Maior', suffix: '', intervals: [0, 4, 7] },
  minor: { label: 'Menor', suffix: 'm', intervals: [0, 3, 7] },
  dominant7: { label: 'Com 7ª', suffix: '7', intervals: [0, 4, 7, 10] },
  major7: { label: 'Com 7+', suffix: '7+', intervals: [0, 4, 7, 11] },
  diminished: { label: 'Diminuto', suffix: '°', intervals: [0, 3, 6] },
  halfDiminished: { label: 'Meio-diminuto', suffix: 'ø7', intervals: [0, 3, 6, 10] },
  inversion: { label: 'Inversão', suffix: '', intervals: [0, 4, 7] }
};

// Digitações ensinadas no Workbook Descomplicando o DADGAD (páginas 11–20).
// Elas ficam separadas do gerador porque vários desenhos usam os bordões abertos
// como cor musical, mesmo quando isso acrescenta extensões ao acorde-base.
const COURSE_VOICINGS = Object.freeze({
  '0:major': [
    { frets: [0, 3, 2, 0, 3, 2], label: 'Forma raiz' },
    { frets: [0, 3, 2, 0, 3, 0], label: 'Forma aberta' },
    { frets: [0, 3, 2, 0, 0, 0], label: 'Alternativo 1' },
    { frets: [0, 2, 4, 0, 0, 0], label: 'Alternativo 2' },
    { frets: [10, 10, 10, 9, 0, 0], label: 'Alternativo 3' },
    { frets: [10, 10, 0, 9, 0, 0], label: 'Alternativo 4' },
    { frets: [10, 0, 0, 9, 0, 0], label: 'Alternativo 5' }
  ],
  '2:major': [
    { frets: [0, 0, 0, 2, 5, 4], label: 'Forma raiz' },
    { frets: [0, 0, 0, 2, 0, 0], label: 'Forma aberta' },
    { frets: [0, 5, 4, 0, 0, 0], label: 'Alternativo 1' },
    { frets: [0, 9, 7, 0, 0, 0], label: 'Alternativo 2' },
    { frets: [0, 6, 8, 0, 0, 0], label: 'Alternativo 3' },
    { frets: [0, 9, 0, 7, 0, 0], label: 'Alternativo 4' },
    { frets: [0, 9, 0, 9, 0, 0], label: 'Alternativo 5' },
    { frets: [12, 12, 12, 11, 0, 0], label: 'Alternativo 6' },
    { frets: [12, 12, 0, 11, 0, 0], label: 'Alternativo 7' },
    { frets: [0, 0, 0, 11, 0, 0], label: 'Alternativo 8' },
    { frets: [0, 0, 0, 0, 0, 0], label: 'Alternativo 9' }
  ],
  '4:major': [{ frets: [2, 2, 2, 4, 2, 2] }],
  '5:major': [
    { frets: [3, 3, 3, 5, 0, 0] },
    { frets: [3, 3, 2, 0, 0, 0], label: 'Alternativo 1' },
    { frets: [3, 0, 3, 2, 0, 0], label: 'Alternativo 2' },
    { frets: [2, 2, 2, 4, 0, 0], label: 'Alternativo 3' }
  ],
  '7:major': [
    { frets: [4, 0, 0, 0, 4, 4] },
    { frets: [0, 0, 0, 0, 5, 5], label: 'Alternativo 1' },
    { frets: [0, 5, 0, 4, 0, 0], label: 'Alternativo 2' },
    { frets: [5, 5, 0, 4, 0, 0], label: 'Alternativo 3' },
    { frets: [5, 0, 0, 4, 0, 0], label: 'Alternativo 4' },
    { frets: [5, 0, 0, 0, 0, 0], label: 'Alternativo 5' },
    { frets: [0, 5, 5, 0, 0, 0], label: 'Alternativo 6' }
  ],
  '9:major': [
    { frets: [0, 0, 2, 2, 4, 2] },
    { frets: [0, 7, 7, 6, 0, 0], label: 'Alternativo 1' },
    { frets: [7, 7, 0, 6, 0, 0], label: 'Alternativo 2' },
    { frets: [0, 0, 0, 6, 0, 0], label: 'Alternativo 3' },
    { frets: [0, 0, 2, 2, 0, 0], label: 'Alternativo 4' }
  ],
  '11:major': [{ frets: [0, 2, 3, 3, 5, 0] }],

  '0:minor': [{ frets: [0, 3, 1, 0, 3, 0] }],
  '2:minor': [
    { frets: [0, 0, 0, 2, 5, 3], label: 'Forma raiz' },
    { frets: [0, 0, 0, 2, 0, 0], label: 'Forma aberta' }
  ],
  '4:minor': [
    { frets: [2, 2, 5, 4, 2, 2] },
    { frets: [2, 2, 0, 0, 0, 0], label: 'Alternativo 1' }
  ],
  '5:minor': [{ frets: [3, 3, 6, 5, 3, 3] }],
  '7:minor': [{ frets: [5, 5, 8, 7, 5, 5] }],
  '9:minor': [{ frets: [0, 0, 2, 2, 3, 2] }],
  '11:minor': [
    { frets: [0, 1, 3, 3, 4, 0], label: 'Forma raiz' },
    { frets: [0, 2, 0, 2, 0, 0], label: 'Forma aberta' },
    { frets: [9, 9, 9, 7, 0, 0], label: 'Alternativo 1' },
    { frets: [9, 9, 0, 7, 0, 0], label: 'Alternativo 2' },
    { frets: [9, 0, 0, 7, 0, 0], label: 'Alternativo 3' }
  ],

  '0:dominant7': [{ frets: [0, 3, 2, 3, 3, 0] }],
  '2:dominant7': [{ frets: [0, 0, 0, 2, 3, 0] }],
  '4:dominant7': [
    { frets: [0, 0, 0, 1, 0, 0], label: 'Forma aberta' },
    { frets: [2, 2, 0, 1, 2, 0], label: 'Forma completa' }
  ],
  '5:dominant7': [{ frets: [0, 0, 3, 2, 3, 1] }],
  '7:dominant7': [
    { frets: [0, 0, 5, 4, 5, 0], label: '2ª região' },
    { frets: [5, 0, 0, 4, 5, 3], label: '3ª região' }
  ],
  '9:dominant7': [{ frets: [0, 0, 0, 0, 4, 0] }],
  '11:dominant7': [{ frets: [0, 0, 4, 4, 0, 4] }],

  '0:major7': [{ frets: [0, 3, 2, 0, 2, 0] }],
  '2:major7': [{ frets: [0, 0, 0, 2, 4, 4] }],
  '4:major7': [{ frets: [2, 0, 1, 1, 2, 0] }],
  '5:major7': [{ frets: [3, 0, 2, 2, 3, 0] }],
  '7:major7': [{ frets: [3, 0, 0, 0, 3, 2] }],
  '9:major7': [{ frets: [0, 0, 2, 1, 4, 0] }],
  '11:major7': [{ frets: [0, 2, 4, 3, 1, 1] }],

  '0:diminished': [{ frets: [0, 3, 0, 2, 3, 0] }],
  '2:diminished': [{ frets: [0, 0, 0, 1, 0, 3] }],
  '4:diminished': [{ frets: [0, 0, 2, 3, 4, 5] }],
  '5:diminished': [
    { frets: [0, 0, 3, 4, 5, 6], label: '3ª região' },
    { frets: [4, 3, 0, 2, 3, 0], label: '2ª região' }
  ],
  '7:diminished': [{ frets: [0, 0, 5, 3, 4, 2] }],
  '9:diminished': [{ frets: [0, 0, 7, 5, 6, 4] }],
  '11:diminished': [{ frets: [0, 2, 0, 1, 2, 3] }],

  '0:inversion': [{ frets: [3, 5, 3, 0, 5, 0], name: 'C/E' }],
  '2:inversion': [{ frets: [4, 0, 0, 2, 0, 0], name: 'D/F♯' }],
  '4:inversion': [{ frets: [6, 7, 0, 5, 7, 0], name: 'E/G♯' }],
  '5:inversion': [
    { frets: [0, 0, 2, 4, 0, 0], name: 'F/A', label: 'Opção 1' },
    { frets: [8, 0, 5, 6, 5, 5], name: 'F/A', label: 'Opção 2' }
  ],
  '7:inversion': [{ frets: [0, 2, 0, 0, 5, 5], name: 'G/B' }],
  '9:inversion': [{ frets: [0, 5, 3, 3, 3, 3], name: 'A/C♯' }],
  '11:inversion': [{ frets: [0, 7, 5, 5, 5, 5], name: 'B/D♯' }]
});

export const mod = (number) => ((number % 12) + 12) % 12;
export const noteName = (pitch) => NOTE_NAMES[mod(pitch)];
export const spelledNoteName = (pitch, rootName) => (rootName.includes('♭') ? FLAT_NOTE_NAMES : SHARP_NOTE_NAMES)[mod(pitch)];

export function getCourseVoicings(root, quality) {
  const entries = COURSE_VOICINGS[`${mod(root)}:${quality}`] || [];
  return entries.map((entry) => ({
    ...entry,
    frets: [...entry.frets],
    notes: entry.frets.map((fret, index) => fret < 0 ? null : mod(DADGAD_TUNING[index].pitch + fret)),
    recommended: true
  }));
}

export function chordPitches(root, quality) {
  return QUALITY[quality].intervals.map((interval) => mod(root + interval));
}

function candidatesForString(openPitch, pitches) {
  const candidates = [-1];
  for (let fret = 0; fret <= 12; fret += 1) {
    if (pitches.includes(mod(openPitch + fret))) candidates.push(fret);
  }
  return candidates;
}

export function generateVoicings(root, quality) {
  const pitches = chordPitches(root, quality);
  const bassTarget = quality === 'inversion' ? pitches[1] : root;
  const candidates = DADGAD_TUNING.map(({ pitch }) => candidatesForString(pitch, pitches));
  const collected = [];

  function visit(stringIndex, frets) {
    if (stringIndex === DADGAD_TUNING.length) {
      const sounding = frets.map((fret, index) => fret < 0 ? null : mod(DADGAD_TUNING[index].pitch + fret));
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
