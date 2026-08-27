# Descomplicando o DADGAD

Reconstrução estática, responsiva e sem dependências de runtime do portal brasileiro sobre afinação DADGAD.

## Executar localmente

```bash
deno task dev
```

Abra `http://localhost:4173`.

Com Node.js, o comando equivalente é:

```bash
npm run dev
```

O servidor de desenvolvimento também mantém disponível a função experimental `/api/importar-cifra`. A opção de importação por link está temporariamente oculta e desativada na interface pública.

### VS Code Live Server

O Live Server serve somente os arquivos estáticos e pode ser usado para conferir as páginas.

## Validar e gerar produção

```bash
deno task lint
deno task test
deno task build
```

Há também scripts equivalentes no `package.json` para ambientes com Node/npm.

O build é copiado para `dist/`. A publicação oficial usa o conteúdo estático de `site/` no GitHub Pages; a entrada manual de acordes continua funcionando normalmente.

## Publicar no GitHub Pages

O workflow `.github/workflows/pages.yml` publica automaticamente o conteúdo de `site/` quando a branch `main` recebe um push. No GitHub, em **Settings → Pages**, a origem da publicação deve estar definida como **GitHub Actions**.

O domínio personalizado é preservado pelo arquivo `site/CNAME`.

## Estrutura

- `site/`: páginas e assets publicados;
- `site/assets/chords.js`: motor de acordes, diagramas e áudio;
- `site/assets/tuner.js`: referências sonoras do afinador;
- `scripts/`: build e validações sem dependências;
- `SEO-STRATEGY.md`: arquitetura, migração e roadmap editorial.

Nenhum ID de analytics, preço ou depoimento foi inventado. Pontos que dependem de confirmação do proprietário estão listados na estratégia.
