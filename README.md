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

O build é copiado para `dist/`. A publicação oficial usa o conteúdo estático de `docs/` no GitHub Pages; a entrada manual de acordes continua funcionando normalmente.

## Publicar no GitHub Pages

O GitHub Pages publica diretamente a pasta `docs/` da branch `main`. No GitHub, em **Settings → Pages**, selecione **Deploy from a branch**, branch **main** e pasta **/docs**.

O domínio personalizado é preservado pelo arquivo `docs/CNAME`.

## Ofertas após a compra do curso

- `/obrigado/`: três cards abaixo da hero, com os checkouts do Pack Violão, Pack Completo e Guia de Bolso do Timbre.
- `/bem-vindo-dadgad/`: cópia da página `/violao-II/` da M-Vave, com o widget do funil abaixo do preço do Pack Violão (R$ 29,90). O botão flutuante leva à oferta; o card do Pack Completo mantém o checkout original.
- `/ultima-chance/`: cópia da página `/guia/` da M-Vave, com o widget abaixo do preço do guia (R$ 37).

Os estilos e as imagens das referências foram copiados para `docs/assets/funil/`, sem alterar o projeto M-Vave. As cópias não carregam os pixels publicitários da referência. Os preços e checkouts refletem as páginas publicadas em 01/10/2026; futuras mudanças de oferta devem atualizar também estas cópias e os cards de obrigado.

O código fornecido pela Hotmart aparece uma vez em cada página do funil. Os parâmetros recebidos na URL são preservados para o widget identificar a compra. Ao abrir a URL diretamente, sem uma compra em andamento, a Hotmart pode informar que o formulário precisa dessa sessão. O teste completo de aceite, recusa e próxima etapa deve ser feito pelo fluxo da Hotmart após a publicação.

## Estrutura

- `docs/`: páginas e assets publicados;
- `docs/assets/chords.js`: motor de acordes, diagramas e áudio;
- `docs/assets/tuner.js`: referências sonoras do afinador;
- `scripts/`: build e validações sem dependências;
- `SEO-STRATEGY.md`: arquitetura, migração e roadmap editorial.

Nenhum ID de analytics, preço ou depoimento foi inventado. Pontos que dependem de confirmação do proprietário estão listados na estratégia.
