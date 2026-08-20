const root = new URL('../', import.meta.url);
const source = new URL('site/', root);
const output = new URL('dist/', root);

try { await Deno.remove(output, { recursive: true }); } catch (error) {
  if (!(error instanceof Deno.errors.NotFound)) throw error;
}
await Deno.mkdir(output, { recursive: true });

async function copyDirectory(from: URL, to: URL) {
  for await (const entry of Deno.readDir(from)) {
    const sourcePath = new URL(entry.name + (entry.isDirectory ? '/' : ''), from);
    const outputPath = new URL(entry.name + (entry.isDirectory ? '/' : ''), to);
    if (entry.isDirectory) {
      await Deno.mkdir(outputPath, { recursive: true });
      await copyDirectory(sourcePath, outputPath);
    } else {
      await Deno.copyFile(sourcePath, outputPath);
    }
  }
}

await copyDirectory(source, output);
console.log('Build estático concluído em dist/.');
