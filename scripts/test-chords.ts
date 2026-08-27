import { DADGAD_TUNING, QUALITY, chordPitches, generateVoicings, mod } from '../docs/assets/chord-engine.js';

const failures: string[] = [];
let checked = 0;

for (let root = 0; root < 12; root += 1) {
  for (const quality of Object.keys(QUALITY)) {
    const chord = chordPitches(root, quality) as number[];
    const bass = quality === 'inversion' ? chord[1] : root;
    const voicings = generateVoicings(root, quality) as Array<{ frets: number[]; notes: Array<number | null> }>;
    for (const voicing of voicings) {
      checked += 1;
      if (voicing.frets.length !== DADGAD_TUNING.length) failures.push(`${root}/${quality}: quantidade de cordas inválida`);
      const calculated = voicing.frets.map((fret, index) => fret < 0 ? null : mod(DADGAD_TUNING[index].pitch + fret));
      if (calculated.some((note, index) => note !== voicing.notes[index])) failures.push(`${root}/${quality}: nota não corresponde à corda DADGAD`);
      const sounding = calculated.filter((note): note is number => note !== null);
      if (!chord.every((note) => sounding.includes(note))) failures.push(`${root}/${quality}: acorde incompleto`);
      if (sounding[0] !== bass) failures.push(`${root}/${quality}: baixo incorreto`);
      if (voicing.frets.some((fret) => fret < -1 || fret > 12)) failures.push(`${root}/${quality}: casa fora do intervalo`);
    }
  }
}

if (DADGAD_TUNING.map(({ note }) => note).join('') !== 'DADGAD') failures.push('Afinação-base diferente de DADGAD');
if (failures.length) {
  console.error(failures.join('\n'));
  Deno.exit(1);
}

console.log(`Acordes validados: ${checked} posições, todas calculadas em D–A–D–G–A–D.`);
