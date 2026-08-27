const site = new URL('../docs/', import.meta.url);
const files: URL[] = [];

async function walk(directory: URL) {
  for await (const entry of Deno.readDir(directory)) {
    const path = new URL(entry.name + (entry.isDirectory ? '/' : ''), directory);
    if (entry.isDirectory) await walk(path);
    else files.push(path);
  }
}
await walk(site);

const htmlFiles = files.filter((file) => file.pathname.endsWith('.html'));
const failures: string[] = [];
for (const file of htmlFiles) {
  const html = await Deno.readTextFile(file);
  const label = decodeURIComponent(file.href.slice(site.href.length));
  const required = [/<html lang="pt-BR">/, /<title>[^<]+<\/title>/, /name="description"/, /rel="canonical"/, /<h1[ >]/, /application\/ld\+json/];
  for (const pattern of required) if (!pattern.test(html)) failures.push(`${label}: ausente ${pattern}`);
  if ((html.match(/<h1[ >]/g) || []).length !== 1) failures.push(`${label}: deve conter exatamente um h1`);
  for (const match of html.matchAll(/href="([^"#]+)"/g)) {
    const href = match[1];
    if (/^(https?:|mailto:|tel:|javascript:)/.test(href) || href.startsWith('/')) continue;
    const target = new URL(href, file);
    const indexTarget = new URL(`${target.href}${target.href.endsWith('/') ? '' : '/'}index.html`);
    if (!files.some((candidate) => candidate.href === target.href || candidate.href === indexTarget.href)) failures.push(`${label}: link local quebrado ${href}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  Deno.exit(1);
}
console.log(`Validação concluída: ${htmlFiles.length} páginas, metadados e links locais verificados.`);
