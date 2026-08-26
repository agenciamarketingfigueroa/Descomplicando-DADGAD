import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import importSongApi from '../api/importar-cifra.js';

const SITE_ROOT = resolve(import.meta.dirname, '..', 'site');
const DEFAULT_PORT = 4173;

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8'
};

function send(response, status, headers, body = '') {
  response.writeHead(status, headers);
  response.end(body);
}

async function toWebRequest(request) {
  const origin = `http://${request.headers.host || `localhost:${DEFAULT_PORT}`}`;
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  return new Request(new URL(request.url || '/', origin), {
    method: request.method,
    headers: request.headers,
    body
  });
}

async function serveApi(request, response) {
  const apiResponse = await importSongApi.fetch(await toWebRequest(request));
  const headers = Object.fromEntries(apiResponse.headers.entries());
  const body = Buffer.from(await apiResponse.arrayBuffer());
  send(response, apiResponse.status, headers, body);
}

export function resolveSiteFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const relativePath = decoded.replace(/^\/+/, '') || 'index.html';
  const requestedPath = resolve(SITE_ROOT, relativePath.endsWith('/') ? `${relativePath}index.html` : relativePath);
  if (requestedPath !== SITE_ROOT && !requestedPath.startsWith(`${SITE_ROOT}${sep}`)) return null;
  return requestedPath;
}

async function serveStatic(request, response, pathname) {
  if (!['GET', 'HEAD'].includes(request.method || 'GET')) {
    send(response, 405, { allow: 'GET, HEAD', 'content-type': 'text/plain; charset=utf-8' }, 'Método não permitido.');
    return;
  }

  let filePath = resolveSiteFile(pathname);
  if (!filePath) {
    send(response, 400, { 'content-type': 'text/plain; charset=utf-8' }, 'Caminho inválido.');
    return;
  }

  let statusCode = 200;
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = resolve(filePath, 'index.html');
  } catch {
    filePath = resolve(SITE_ROOT, '404.html');
    statusCode = 404;
  }

  try {
    const body = await readFile(filePath);
    const headers = {
      'content-type': CONTENT_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'x-content-type-options': 'nosniff'
    };
    send(response, statusCode, headers, request.method === 'HEAD' ? '' : body);
  } catch {
    send(response, 500, { 'content-type': 'text/plain; charset=utf-8' }, 'Não foi possível abrir o site.');
  }
}

export function createDevServer() {
  return createServer(async (request, response) => {
    try {
      const origin = `http://${request.headers.host || `localhost:${DEFAULT_PORT}`}`;
      const url = new URL(request.url || '/', origin);
      if (url.pathname === '/api/importar-cifra' || url.pathname === '/api/importar-cifra/') {
        await serveApi(request, response);
        return;
      }
      await serveStatic(request, response, url.pathname);
    } catch (error) {
      console.error(error);
      send(response, 500, { 'content-type': 'application/json; charset=utf-8' }, JSON.stringify({ message: 'Erro interno no servidor local.' }));
    }
  });
}

const runtimeProcess = Reflect.get(globalThis, 'process');
const runtimeDeno = Reflect.get(globalThis, 'Deno');
const isMainModule = import.meta.main === true
  || (runtimeProcess?.argv?.[1] && import.meta.url === pathToFileURL(resolve(runtimeProcess.argv[1])).href);
if (isMainModule) {
  const configuredPort = Number(runtimeProcess?.env?.DADGAD_DEV_PORT || runtimeDeno?.env?.get('DADGAD_DEV_PORT') || DEFAULT_PORT);
  const server = createDevServer();
  server.listen(configuredPort, '127.0.0.1', () => {
    console.log(`Descomplicando o DADGAD disponível em http://127.0.0.1:${configuredPort}`);
    console.log('A importação de cifras está ativa em /api/importar-cifra.');
  });
}
