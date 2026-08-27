import { parseChordSymbol, parseChordText } from '../docs/assets/song-chords.js';
import { parseSongPage } from '../api/importar-cifra.js';

const failures: string[] = [];
const expect = (condition: boolean, message: string) => { if (!condition) failures.push(message); };

const manual = parseChordText('D  Bm, G | A7\nC7M G4/B F#m7b5') as Array<{ symbol: string }>;
expect(
  manual.map(({ symbol }) => symbol).join(' ') === 'D Bm G A7 C7+ Gsus4/B F♯ø7',
  `Leitura manual incorreta: ${manual.map(({ symbol }) => symbol).join(' ')}`
);

const add9 = parseChordSymbol('Em(add9)') as { quality: string; intervals: number[] } | null;
expect(add9?.quality === 'minorAdd9', 'Em(add9) deveria ser reconhecido como menor com nona.');
expect(add9?.intervals.join(',') === '0,2,3,7', 'Intervalos de Em(add9) incorretos.');

const fixture = `<!doctype html><html><head><meta property="og:title" content="Tempo Perdido - Legião Urbana - Cifra Club"></head><body><h1>Tempo Perdido</h1><h2>Legião Urbana</h2><pre>[Intro] C7M  Am7  Bm7  Em\nC  Am7  Bm  Em</pre></body></html>`;
const imported = parseSongPage(fixture, 'https://www.cifraclub.com.br/legiao-urbana/tempo-perdido/');
expect(imported.title === 'Tempo Perdido', `Título importado incorreto: ${imported.title}`);
expect(imported.artist === 'Legião Urbana', `Artista importado incorreto: ${imported.artist}`);
expect(imported.chords.join(' ') === 'C7+ Am7 Bm7 Em C Bm', `Acordes importados incorretos: ${imported.chords.join(' ')}`);

const cifrasFixture = `<!doctype html><html><head><title>Tempo Perdido - Legião Urbana | CIFRAS</title></head><body><h1>Tempo Perdido</h1><h2>Legião Urbana</h2><div class="cifra"><b>G4/B</b> <b>Am</b> <b>Bm</b> <b>Em</b></div></body></html>`;
const cifrasSong = parseSongPage(cifrasFixture, 'https://www.cifras.com.br/cifra/legiao-urbana/tempo-perdido');
expect(cifrasSong.chords.join(' ') === 'G4/B Am Bm Em', `Leitura do Cifras incorreta: ${cifrasSong.chords.join(' ')}`);

const currentCifraClubFixture = `<!doctype html><html><head><script type="application/ld+json">{"@type":"MusicComposition","name":"Legião Urbana - Tempo Perdido","byArtist":{"name":"Legião Urbana"}}</script></head><body><h1>Tempo Perdido</h1><pre><b data-chord-name="C">C</b> <b data-chord-name="Am7">Am7</b>\nA tempestade chega\nE fica</pre></body></html>`;
const currentCifraClubSong = parseSongPage(currentCifraClubFixture, 'https://www.cifraclub.com.br/legiao-urbana/tempo-perdido/');
expect(currentCifraClubSong.title === 'Tempo Perdido', `H1 deveria prevalecer no título: ${currentCifraClubSong.title}`);
expect(currentCifraClubSong.chords.join(' ') === 'C Am7', `Acordes estruturados incorretos: ${currentCifraClubSong.chords.join(' ')}`);

if (failures.length) {
  console.error(failures.join('\n'));
  Deno.exit(1);
}

console.log('Ferramenta de músicas validada: entrada manual, metadados e importação de cifras.');
