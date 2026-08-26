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

O servidor de desenvolvimento entrega tanto os arquivos do site quanto `/api/importar-cifra`, necessário para a importação por link.

### VS Code Live Server

O Live Server serve somente os arquivos estáticos. Ele pode ser usado para conferir as páginas, mas a importação por link não funciona nele porque a rota `/api/importar-cifra` não é executada. Para testar a ferramenta completa, use `deno task dev` ou `npm run dev`.

## Validar e gerar produção

```bash
deno task lint
deno task test
deno task build
```

Há também scripts equivalentes no `package.json` para ambientes com Node/npm.

O build é copiado para `dist/`. As páginas podem ser publicadas em qualquer host estático, mas a importação por link exige também a função `api/importar-cifra.js`. A configuração deste repositório está pronta para a Vercel. Em uma hospedagem exclusivamente estática, a entrada manual continua funcionando, mas a importação por link fica indisponível.

## Estrutura

- `site/`: páginas e assets publicados;
- `site/assets/chords.js`: motor de acordes, diagramas e áudio;
- `site/assets/tuner.js`: referências sonoras do afinador;
- `scripts/`: build e validações sem dependências;
- `SEO-STRATEGY.md`: arquitetura, migração e roadmap editorial.

Nenhum ID de analytics, preço ou depoimento foi inventado. Pontos que dependem de confirmação do proprietário estão listados na estratégia.
