const ALLOWED_HOSTS = ['cifraclub.com.br', 'cifras.com.br'];
const MAX_PAGE_BYTES = 2_000_000;
const MAX_CHORDS = 64;

const CHORD_PATTERN = /(^|[^A-Za-zÀ-ÿ])([A-Ga-g](?:#|b|♯|♭)?(?:maj9|maj7|M7|7M|9M|7\+|9\+|m7b5|m\(add9\)|madd9|m9|m7|m6|m|dim7?|°|ø7?|sus2|sus4|sus|add9|aug|[+]|9|7|6|5|4|2)?(?:\/[A-Ga-g](?:#|b|♯|♭)?)?)(?=$|[^A-Za-zÀ-ÿ])/g;

function json(data, status = 200, headers = {}) {
  return Response.json(data, {
    status,
    headers: {
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...headers
    }
  });
}

function hostIsAllowed(hostname) {
  const host = hostname.toLowerCase().replace(/^www\./, '');
  return ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

function validateSourceUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Cole um link completo do Cifra Club ou Cifras.com.br.');
  }
  if (url.protocol !== 'https:' || !hostIsAllowed(url.hostname)) {
    throw new Error('Por enquanto, a importação aceita links do Cifra Club e Cifras.com.br.');
  }
  url.hash = '';
  return url;
}

function decodeEntities(value = '') {
  const named = {
    amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ',
    Aacute: 'Á', aacute: 'á', Eacute: 'É', eacute: 'é', Iacute: 'Í', iacute: 'í',
    Oacute: 'Ó', oacute: 'ó', Uacute: 'Ú', uacute: 'ú', Ccedil: 'Ç', ccedil: 'ç',
    Atilde: 'Ã', atilde: 'ã', Otilde: 'Õ', otilde: 'õ'
  };
  return value
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([\da-f]+);/gi, (_, number) => String.fromCodePoint(Number.parseInt(number, 16)))
    .replace(/&([a-z]+);/gi, (entity, name) => named[name] ?? entity);
}

function cleanText(value = '') {
  return decodeEntities(value)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMeta(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, 'i')
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return cleanText(match[1]);
  }
  return '';
}

function extractFirstTag(html, tag) {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i'));
  return match ? cleanText(match[1]) : '';
}

function findMusicJsonLd(html) {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const nodes = [];
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    nodes.push(value);
    Object.values(value).forEach((child) => {
      if (Array.isArray(child)) child.forEach(visit);
      else visit(child);
    });
  };
  scripts.forEach(([, source]) => {
    try { visit(JSON.parse(decodeEntities(source))); } catch { /* JSON-LD opcional */ }
  });
  return nodes.find((node) => {
    const type = Array.isArray(node['@type']) ? node['@type'].join(' ') : node['@type'];
    return /MusicComposition|MusicRecording|Song/i.test(type || '');
  }) || null;
}

function personName(value) {
  if (!value) return '';
  if (typeof value === 'string') return cleanText(value);
  if (Array.isArray(value)) return personName(value[0]);
  return cleanText(value.name || '');
}

function titleAndArtist(html, url) {
  const musicData = findMusicJsonLd(html);
  let title = cleanText(musicData?.name || extractFirstTag(html, 'h1'));
  let artist = personName(musicData?.byArtist || musicData?.author || musicData?.creator);

  const headingCandidates = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map(([, value]) => cleanText(value))
    .filter(Boolean);
  if (!artist) artist = headingCandidates.find((value) => !/acorde|menu|versão|instrumento|comentário/i.test(value)) || '';

  const ogTitle = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title') || extractFirstTag(html, 'title');
  const portalFree = ogTitle.replace(/\s*[|–-]\s*(Cifra Club|CIFRAS).*$/i, '').trim();
  const titleParts = portalFree.split(/\s+[–-]\s+/).map((part) => part.trim()).filter(Boolean);
  if (!title && titleParts.length) title = titleParts[0];
  if (!artist && titleParts.length > 1) artist = titleParts.at(-1);

  const slugs = url.pathname.split('/').filter(Boolean).map((slug) => decodeURIComponent(slug));
  const prettify = (slug = '') => slug.replace(/-ver-\d+$/i, '').replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  if (!title) title = prettify(slugs.at(-1));
  if (!artist) artist = prettify(slugs.at(-2));
  return { title: title.slice(0, 140), artist: artist.slice(0, 140) };
}

function normalizeChord(token) {
  const value = cleanText(token).replace(/[()[\],;:]/g, '').replaceAll('♯', '#').replaceAll('♭', 'b');
  const match = value.match(/^([A-Ga-g])([#b]?)(.*)$/);
  if (!match) return '';
  const suffix = match[3]
    .replace(/^7M$/, '7+')
    .replace(/^M7$/, '7+')
    .replace(/^maj7$/i, '7+')
    .replace(/^maj9$/i, '9+')
    .replace(/^dim$/i, '°');
  return `${match[1].toUpperCase()}${match[2]}${suffix}`;
}

function collectChordTokens(text, output, seen) {
  for (const match of cleanText(text).matchAll(CHORD_PATTERN)) {
    const chord = normalizeChord(match[2]);
    if (!chord || seen.has(chord)) continue;
    seen.add(chord);
    output.push(chord);
    if (output.length >= MAX_CHORDS) return;
  }
}

export function extractChords(html) {
  const chords = [];
  const seen = new Set();
  const priorityRegions = [
    ...html.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/gi),
    ...html.matchAll(/<(?:div|section|article)[^>]+class=["'][^"']*(?:chord|acorde|cifra)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section|article)>/gi)
  ];
  priorityRegions.forEach((match) => collectChordTokens(match[1], chords, seen));

  for (const match of html.matchAll(/data-(?:chord|acorde)=["']([^"']+)["']/gi)) {
    collectChordTokens(match[1], chords, seen);
  }
  for (const match of html.matchAll(/["'](?:chord|acorde|chordName)["']\s*:\s*["']([^"']+)["']/gi)) {
    collectChordTokens(match[1], chords, seen);
  }

  if (chords.length < 2) {
    const smallTags = [...html.matchAll(/<(?:b|strong|span|i|a)[^>]*>([^<>]{1,24})<\/(?:b|strong|span|i|a)>/gi)];
    smallTags.forEach((match) => collectChordTokens(match[1], chords, seen));
  }
  return chords.slice(0, MAX_CHORDS);
}

export function parseSongPage(html, urlValue) {
  const source = validateSourceUrl(urlValue);
  return { ...titleAndArtist(html, source), chords: extractChords(html), source: source.href };
}

async function readLimited(response) {
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > MAX_PAGE_BYTES) throw new Error('A página é grande demais para importar.');
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_PAGE_BYTES) {
      await reader.cancel();
      throw new Error('A página é grande demais para importar.');
    }
    chunks.push(value);
  }
  const joined = new Uint8Array(total);
  let offset = 0;
  chunks.forEach((chunk) => { joined.set(chunk, offset); offset += chunk.byteLength; });
  return new TextDecoder().decode(joined);
}

async function fetchSongPage(initialUrl) {
  let current = initialUrl;
  for (let redirects = 0; redirects <= 2; redirects += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    let response;
    try {
      response = await fetch(current, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; DescomplicandoDADGAD/1.0; +https://descomplicandodadgad.com.br/)',
          accept: 'text/html,application/xhtml+xml',
          'accept-language': 'pt-BR,pt;q=0.9'
        }
      });
    } finally {
      clearTimeout(timeout);
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error('O portal redirecionou para uma página inválida.');
      current = validateSourceUrl(new URL(location, current).href);
      continue;
    }
    if (!response.ok) throw new Error('O portal de cifras não liberou a leitura desta página.');
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) throw new Error('O link não aponta para uma página de cifra.');
    return { html: await readLimited(response), finalUrl: current };
  }
  throw new Error('O link passou por redirecionamentos demais.');
}

export async function importSong(urlValue) {
  const sourceUrl = validateSourceUrl(urlValue);
  const { html, finalUrl } = await fetchSongPage(sourceUrl);
  const song = parseSongPage(html, finalUrl.href);
  if (!song.chords.length) throw new Error('Não encontrei acordes legíveis nessa página.');
  return song;
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return json({ message: 'Use uma requisição POST.' }, 405, { allow: 'POST' });
    }
    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ message: 'Envie um JSON válido.' }, 400);
    }
    try {
      return json(await importSong(payload?.url));
    } catch (error) {
      const status = /Cole um link|Por enquanto/.test(error.message) ? 400 : 422;
      return json({ message: error.message || 'Não foi possível importar a cifra.' }, status);
    }
  }
};
