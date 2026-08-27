import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'docs');
const output = resolve(root, 'dist');

if (!existsSync(source)) throw new Error('Diretório docs/ não encontrado.');
if (existsSync(output)) rmSync(output, { recursive: true });
mkdirSync(output, { recursive: true });
cpSync(source, output, { recursive: true });
console.log('Build estático concluído em dist/.');
