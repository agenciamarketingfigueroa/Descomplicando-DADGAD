import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';

const site = resolve(import.meta.dirname, '..', 'docs');
const files = [];
const walk = (dir) => readdirSync(dir).forEach((name) => {
  const path = join(dir, name);
  statSync(path).isDirectory() ? walk(path) : files.push(path);
});
walk(site);

const htmlFiles = files.filter((file) => extname(file) === '.html');
const failures = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const label = relative(site, file);
  const required = [/<html lang="pt-BR">/, /<title>[^<]+<\/title>/, /name="description"/, /rel="canonical"/, /<h1[ >]/, /application\/ld\+json/];
  required.forEach((pattern) => {
    if (!pattern.test(html)) failures.push(`${label}: ausente ${pattern}`);
  });
  if ((html.match(/<h1[ >]/g) || []).length !== 1) failures.push(`${label}: deve conter exatamente um h1`);
  for (const match of html.matchAll(/href="([^"#]+)"/g)) {
    const href = match[1];
    if (/^(https?:|mailto:|tel:|javascript:)/.test(href) || href.startsWith('/')) continue;
    const target = resolve(dirname(file), href);
    if (!files.includes(target) && !files.includes(join(target, 'index.html'))) failures.push(`${label}: link local quebrado ${href}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Validação concluída: ${htmlFiles.length} páginas, metadados e links locais verificados.`);
