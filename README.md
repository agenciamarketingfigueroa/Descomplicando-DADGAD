# Descomplicando o DADGAD

Reconstrução estática, responsiva e sem dependências de runtime do portal brasileiro sobre afinação DADGAD.

## Executar localmente

```bash
deno task dev
```

Abra `http://localhost:4173`.

### VS Code Live Server

O workspace já configura `site/` como raiz do Live Server. Feche qualquer sessão anterior e clique novamente em **Go Live**; o preview abrirá em `http://127.0.0.1:5500/`.

## Validar e gerar produção

```bash
deno task lint
deno task test
deno task build
```

Há também scripts equivalentes no `package.json` para ambientes com Node/npm.

O build é copiado para `dist/`. O diretório pode ser publicado em qualquer host estático. Para preservar redirects, configure o host usando `site/_redirects` (Netlify/Cloudflare Pages) ou `vercel.json` (Vercel).

## Estrutura

- `site/`: páginas e assets publicados;
- `site/assets/chords.js`: motor de acordes, diagramas e áudio;
- `site/assets/tuner.js`: referências sonoras do afinador;
- `scripts/`: build e validações sem dependências;
- `SEO-STRATEGY.md`: arquitetura, migração e roadmap editorial.

Nenhum ID de analytics, preço ou depoimento foi inventado. Pontos que dependem de confirmação do proprietário estão listados na estratégia.
