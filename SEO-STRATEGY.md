# Estratégia SEO — Descomplicando o DADGAD

## 1. Arquitetura adotada

A arquitetura separa intenção educacional, uso de ferramenta, exploração editorial e intenção comercial.

```text
/
├── aprenda/
│   ├── o-que-e-dadgad/
│   └── como-afinar-em-dadgad/
├── encontre-seu-acorde/
├── universo/
│   └── historias-e-bicicletas-oficina-g3-dadgad/
├── curso/
├── ebook-dadgad/
├── sobre/
├── contato/
└── privacidade/
```

- **Home:** porta de entrada por intenção; não é uma landing page de venda.
- **Aprenda:** hub para iniciantes e página-pilar educacional.
- **Dicionário:** ferramenta principal de aquisição, retorno e compartilhamento.
- **Universo:** central editorial escalável para repertório, artistas, técnica e história.
- **Curso:** intenção comercial explícita, separada dos guias informacionais.
- **Sobre:** entidade autoral e experiência de Felipe Figueroa.

A base é HTML estático com conteúdo essencial disponível sem JavaScript. O JavaScript entra apenas para navegação mobile, áudio e ferramenta de acordes. Isso reduz bundle, favorece rastreamento e evita layout dependente de hidratação.

## 2. Keywords e Search Intent

| Cluster | Consulta principal | Intenção | Página |
|---|---|---|---|
| Fundamentos | o que é DADGAD | informacional introdutória | `/aprenda/o-que-e-dadgad/` |
| Afinação | como afinar em DADGAD | tarefa / ferramenta | `/aprenda/como-afinar-em-dadgad/` |
| Acordes | acordes DADGAD, dicionário de acordes DADGAD | ferramenta / consulta recorrente | `/encontre-seu-acorde/` |
| Aprendizado | aprender DADGAD | informacional ampla | `/aprenda/` |
| Formação | curso DADGAD | comercial | `/curso/` |
| Material | ebook DADGAD | comercial / navegacional | `/ebook-dadgad/` |
| Repertório | Oficina G3 DADGAD, Histórias e Bicicletas afinação | informacional / fandom | artigo em `/universo/` |
| Autor | Felipe Figueroa DADGAD | navegacional / entidade | `/sobre/` |

Decisão de canibalização: “acordes maiores”, “acordes menores”, “diminutos” e “inversões” permanecem na mesma ferramenta enquanto o conteúdo textual de cada classe não tiver profundidade própria. Não foram criadas páginas finas para cada raiz ou acorde.

## 3. Topic Clusters

### Pilar: Aprenda DADGAD

- O que é DADGAD;
- como afinar;
- futuro: primeiros acordes;
- futuro: DADGAD x afinação padrão;
- futuro: capotraste e encordoamento.

### Pilar: Acordes DADGAD

- Dicionário interativo;
- futuro: formação de acordes;
- futuro: inversões e condução de baixo;
- futuro: progressões em Ré, Sol e Lá;
- futuro: campo harmônico aplicado.

### Pilar: Universo DADGAD

- Oficina G3 e “Histórias e Bicicletas”;
- futuro: artistas que usam DADGAD;
- futuro: repertório brasileiro;
- futuro: fingerstyle;
- futuro: worship sem clichês harmônicos.

### Pilar: Escalas e criação (futuro)

- mapa interativo de escalas;
- pentatônica;
- modos gregos;
- improvisação e composição.

## 4. URL Mapping

Inventário baseado nas URLs rastreáveis encontradas na busca e na navegação do site WordPress em 20/08/2026.

| URL antiga | URL nova | Ação |
|---|---|---|
| `/` | `/` | mantida e reconstruída |
| `/curso/` | `/curso/` | mantida e reconstruída |
| `/ebook-dadgad/` | `/ebook-dadgad/` | mantida; oferta antiga removida até confirmação |
| `/cursos/` | `/curso/` | 301 direto |
| `/dicas/` | `/universo/` | 301 direto |
| `/sobre/` | `/sobre/` | mantida e reconstruída |
| `/contato/` | `/contato/` | mantida e reconstruída |
| `/dadgad-ii-2024/` | `/curso/` | 301; campanha datada incorporada à oferta principal |
| `/2022/10/27/a-historia-da-afinacao-dadgad-e-seu-impacto-no-disco-historias-e-bicicletas-do-oficina-g3/` | `/universo/historias-e-bicicletas-oficina-g3-dadgad/` | 301; conteúdo revisado e URL simplificada |
| `/politica-de-privacidade/` | `/privacidade/` | 301 |

Os redirects estão em `docs/_redirects` e `vercel.json`. Antes da migração, exportar a lista completa do WordPress/Search Console e complementar este mapa; a busca pública pode não revelar todas as URLs.

## 5. Structured Data

- **Home:** `WebSite` com busca e `Person`.
- **Guias:** `Article` e `BreadcrumbList`.
- **Como afinar:** `HowTo` e `BreadcrumbList`.
- **Dicionário:** `WebApplication` e `BreadcrumbList`.
- **Curso:** `Course`, sem preço, avaliação ou oferta não confirmados.
- **Sobre:** `Person` e `BreadcrumbList`.
- **Universo:** `CollectionPage`.
- **Ebook:** `CreativeWork`, sem `Offer` até confirmar disponibilidade.
- **Contato e páginas utilitárias:** `ContactPage` ou `WebPage`.

Toda marcação corresponde a conteúdo visível. Não há estrelas, avaliações, contagem de alunos ou preços no schema.

## 6. Internal Linking

O fluxo principal segue o momento do músico:

1. entender a afinação;
2. afinar o instrumento;
3. consultar e ouvir acordes;
4. aplicar em repertório;
5. conhecer o método completo.

Cada guia entrega primeiro a resposta procurada e só depois sugere o próximo passo. O curso aparece em contexto, sem blocos publicitários no meio da tarefa. Home, hubs e footer distribuem autoridade para as páginas pilares; artigos ligam para ferramentas relevantes.

## 7. Conteúdo futuro

### Prioridade 1

- Primeiros acordes em DADGAD, com exercícios e áudio;
- progressões em DADGAD por tonalidade;
- DADGAD x afinação padrão;
- como transpor uma música para DADGAD;
- repertório validado de Oficina G3 com tonalidade, dificuldade e aula relacionada;
- página editorial completa sobre acordes, apoiando a ferramenta.

### Prioridade 2

- Campo harmônico aplicado ao DADGAD;
- pentatônica com mapa do braço;
- fingerstyle: bordões, independência e arranjo;
- capotraste em DADGAD;
- artistas que usam a afinação, com fontes e exemplos;
- encordoamento e regulagem, revisado por luthier.

### Prioridade 3

- Modos gregos;
- improvisação;
- DADGAD para worship;
- biblioteca de músicas com filtros;
- entrevistas com alunos e músicos;
- estudos de arranjos autorais.

## 8. Oportunidades futuras

- Microfone no afinador com detecção de frequência e consentimento explícito;
- salvar/favoritar acordes localmente;
- gerar link compartilhável para acorde e posição específicos;
- exportar diagrama acessível em PNG/SVG;
- construtor de progressões com playback;
- mapa interativo de escalas;
- busca unificada de acordes, artigos, artistas e músicas;
- facade para vídeos e playlists, carregada somente após interação;
- newsletter contextual com material complementar real;
- conteúdo gerenciado por CMS headless apenas quando houver volume editorial.

## 9. Pendências manuais

- O PDF `Workbook Descomplicando o DADGAD.pdf` não estava no caminho informado nem no pacote de anexos; anexar novamente para revisão e incorporação das informações autorais.
- Inserir foto horizontal/vertical de Felipe e definir direitos de uso.
- Confirmar biografia, nomes de artistas e formulação aprovada.
- Confirmar disponibilidade, preço, garantia, acesso e URL atual do ebook.
- Confirmar condições vigentes do curso e checkout Hotmart.
- Selecionar depoimentos reais com autorização e transcrição acessível.
- Confirmar se o convite atual da comunidade WhatsApp deve permanecer público.
- Exportar URLs do WordPress, Search Console e backlinks para fechar o mapa de migração.
- Configurar Google Search Console e enviar o sitemap.
- Definir provedor de analytics, ID real, consentimento e política de retenção.
- Informar dados do controlador e canal de privacidade; realizar revisão jurídica.
- Definir imagem Open Graph autoral e exportá-la em 1200 × 630.
- Revisar a alegação histórica e técnica de cada artigo com Felipe antes da publicação.
- Configurar o servidor para retornar status HTTP 404 real usando `404.html`.
