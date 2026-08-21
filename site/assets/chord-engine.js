export const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
export const SHARP_NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
export const FLAT_NOTE_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

// Da 6ª (mais grave) para a 1ª (mais aguda).
export const DADGAD_TUNING = [
  { note: 'D', pitch: 2, midi: 38 },
  { note: 'A', pitch: 9, midi: 45 },
  { note: 'D', pitch: 2, midi: 50 },
  { note: 'G', pitch: 7, midi: 55 },
  { note: 'A', pitch: 9, midi: 57 },
  { note: 'D', pitch: 2, midi: 62 }
];

export const QUALITY = {
  major: { label: 'Maior', suffix: '', intervals: [0, 4, 7] },
  minor: { label: 'Menor', suffix: 'm', intervals: [0, 3, 7] },
  diminished: { label: 'Diminuto', suffix: '°', intervals: [0, 3, 6] },
  halfDiminished: { label: 'Meio-diminuto', suffix: 'ø7', intervals: [0, 3, 6, 10] },
  inversion: { label: 'Inversão', suffix: '', intervals: [0, 4, 7] }
};

export const mod = (number) => ((number % 12) + 12) % 12;
export const noteName = (pitch) => NOTE_NAMES[mod(pitch)];
export const spelledNoteName = (pitch, rootName) => (rootName.includes('♭') ? FLAT_NOTE_NAMES : SHARP_NOTE_NAMES)[mod(pitch)];

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
