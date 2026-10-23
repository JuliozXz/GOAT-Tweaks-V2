# GOAT HUB Service — entrega do primeiro marco

Data: **23/10/2026**. Versão: **0.1.0**. Estado: **fundação web funcional e validada; shell desktop preparado, build nativo bloqueado**. O produto completo não está concluído. Nenhuma categoria de otimização está concluída e nenhuma alteração do Windows foi implementada ou executada.

## O que funciona

| Recurso | Implementação / evidência | Limite |
| --- | --- | --- |
| Identidade escura grafite/âmbar, navegação por 18 categorias | `src/components/`, `src/styles.css`; E2E navega nas 54 combinações categoria/nível | Ícone GH provisório, sem asset oficial da marca |
| Basic/General/Advanced dentro de cada categoria | Roteamento por fragmento de URL; histórico voltar/avançar testado | Níveis sem candidatos mostram estado vazio; não foram preenchidos artificialmente |
| Catálogo real de pesquisa | 41 registros, 49 fontes primárias, schema estrito e IDs únicos | 17 orientações manuais, 12 integrações pendentes, 6 pesquisas e 6 rejeitados; **zero ajustes implementados** |
| Busca global e abertura na categoria original | Busca por ID/texto/tags, insensível a acentos; teste de rota/foco/histórico | Não há ranking de recomendação por hardware |
| Filtros, ordenação, contagens e painel de detalhes | Lista e detalhe respeitam filtros; regressão corrigida e testada | Compatibilidade desconhecida sem inventário; não há filtro por risco quantitativo inventado |
| Seleção para revisão | IDs únicos, rejeitados impedidos, remoção/persistência testadas | Seleção não autoriza execução nem significa recomendação |
| Preferências versionadas | `src/platform/preferences.ts`; erros, cota e corrupção testados | localStorage somente para UI; não é banco de atendimentos ou trilha auditável |
| Exportação JSON | Download real lido e validado pelo E2E | Plano de revisão, sem inventário, alterações aplicadas, resultados ou ganhos; exportação nativa ainda não comprovada |
| Tratamento de erros e log técnico | Error boundary, mensagens de persistência/fullscreen/exportação, até 50 eventos em memória | Sem log persistente de atendimento, redaction de futuros coletores ou recovery transacional |
| Teclado e acessibilidade automatizada | Skip control, Ctrl+K, Tab/Shift+Tab, diálogo/Escape/restauração; axe página e diálogo | Não equivale a certificação WCAG, teste com leitor de tela ou controle físico |
| Layout | Capturas em 1920×1080, 2560×1440, 3840×2160, 960×540 e 390×844, sem overflow horizontal detectado | Viewport CSS não comprova DPI Windows em monitor físico; capturas não são baseline de regressão visual aprovado |
| Shell Tauri 2 | `src-tauri/`: fullscreen, CSP, duas permissões de janela, nenhum comando próprio/plugin privilegiado | Não compilado, iniciado ou empacotado; ACL/CSP nativos não testados |

O marco usa um **modo de consulta verdadeiro**, sem fixture de hardware nem benchmark demonstrativo. Um modo de demonstração com dados sintéticos, dashboard com inventário e controle/gamepad ainda não foi implementado. O aplicativo informa a ausência desses dados; não apresenta sensores zerados como se fossem leituras.

## Pesquisa e decisões

As diretrizes dos três anexos foram incorporadas à [especificação](specification.md), [arquitetura](architecture.md), [matriz de riscos](risk-compatibility.md), [protocolo de contribuição](catalog-contribution.md) e `AGENTS.md`. Subagentes nativos dividiram pesquisa de ferramentas, arquitetura, catálogo, revisão independente e autoria de testes. Nenhuma configuração de agentes de outra plataforma foi importada.

EXM foi examinado pelas páginas oficiais públicas, sem descompilação ou cópia de código. Ultimate e WinSux tiveram licenças, commits e amostra de código inspecionados; foram identificados scripts de remoção de WebView2, timer persistente e mudanças amplas incompatíveis com adoção automática. WinUtil forneceu um caso concreto de regressão em serviço Xbox. Esses programas não foram instalados nem executados. [Relatório e fontes fixadas](research/reference-tools.md).

PresentMon permanece referência técnica, não skill nem integração concluída. Foram comparadas rotas CSV, biblioteca ETW e serviço/API, com limites de permissão, população de quadros, HAGS, compatibilidade de DLL e licenças de terceiros. A matriz de cobertura registra 0 aprovados para execução, 0 implementados e 0 testados em hardware em todas as categorias. [Catálogo, fontes e lacunas](research/catalog-findings.md).

## Verificações executadas

| Comando/verificação | Resultado efetivo |
| --- | --- |
| `pnpm install --offline --frozen-lockfile --ignore-scripts` | Passou na instalação final com store local; lockfile reproduzido sem rede/scripts |
| `pnpm typecheck` | Passou, TypeScript 7.0.2 |
| `pnpm lint` | Passou, Biome 2.6.2; política documentada em maintenance.md |
| `pnpm format:check` | Passou |
| `pnpm test` | **13/13** testes em 3 arquivos: catálogo, preferências e invariantes de segurança estáticos |
| `pnpm build` | Passou; ativos de produção gerados pelo Vite 8.3.5 |
| `pnpm test:e2e` | **12/12**, 0 skipped, 0 flaky, 0 inesperados na execução final (15,3 s) |
| Axe 4.14.0 | 0 violações detectadas na página e no diálogo dos cenários testados; não silenciadas regras |
| Build de produção em `pnpm preview` | Aberto no navegador integrado; CPU Basic → General → Basic verificado pela árvore de acessibilidade |
| Revisão visual | Capturas 1080p e 390 px inspecionadas; outras três capturas preservadas e geometria testada |
| `pnpm audit --json` | Nenhum advisory retornado na consulta; não é garantia de ausência de vulnerabilidades |
| Licenças/instalação | 56 entradas de pacote instaladas inventariadas; não encontrados scripts preinstall/install/postinstall nos manifests instalados |
| `pnpm catalog:report` | 41 registros, 49 fontes, 54 células, hash SHA-256 do catálogo registrado |
| `pnpm tauri build --no-bundle` | **Falhou com exit 1** antes da compilação: `cargo metadata` não encontrado |
| Configuração nativa | JSON/TOML parseados e permissões/CSP inspecionadas; ICO decodificado; sem validação integral do schema gerado nem runtime |

Ferramentas: Node 24.22.1, pnpm 11.25.0, React 19.3.1, Playwright 1.64.1 com Chromium Headless Shell 156.0.8078.4/revisão 1248. Dependências completas e integridades estão nos manifests/lockfile e em `validation/installed-dependencies.json`.

Falhas intermediárias foram investigadas: ausência do Edge inicialmente configurado; queda do Chromium no sandbox do executor; import JSON sem atributo em Node 24; detalhes que não respeitavam filtros; nomes acessíveis/landmarks; ciclo de foco no diálogo. As três falhas de UI foram corrigidas e cobertas pela execução final. O navegador de teste manteve seu próprio sandbox habilitado; a execução precisou sair apenas do sandbox restrito do executor. Nenhum teste exigiu desligar proteção do Windows.

O comando `tauri info` forneceu diagnóstico de ambiente, mas sua parte final não encerrou e foi interrompida; não foi contado como check completo aprovado. WebView2 155.0.4283.62 foi detectado. Rust/Cargo/rustup e MSVC/SDK não foram encontrados pelo diagnóstico nem nos caminhos usuais examinados. Isso não prova ausência em todos os discos.

## Artefatos e alterações

- Aplicação e domínio: `src/`; shell nativo: `src-tauri/`.
- Configurações novas na raiz: package/lockfile, TypeScript, Vite, Biome, Playwright, pnpm e Git ignore. Git local inicializado, sem remoto ou publicação. Não foi criado commit: a identidade Git não está configurada e não foi inventado nome/e-mail. Os arquivos permanecem não commitados; hashes do marco estão em `validation/source-manifest.json`.
- Scripts locais: relatório do catálogo e runner de Playwright com cache isolado; nenhum script de alteração do Windows.
- Documentação: `docs/`, README e avisos de terceiros. `AGENTS.md` atualizado com regras do GOAT HUB; original preservado em `docs/AGENTS.before-goat-hub.md`.
- Evidências duráveis: `docs/validation/e2e-final.json`, cinco capturas PNG, audit npm, licenças, dependências, manifest do catálogo e log da falha nativa. Relatório interativo atual em `playwright-report/index.html`.
- Gerados: `dist/`, `node_modules/`, stores locais, navegador de teste portátil. O backup da primeira instalação foi removido após validação. O cache padrão inicialmente criado em `D:\.pnpm-store` foi preservado; ver [manutenção](maintenance.md).
- As 14 skills locais, skills globais e auditoria anterior foram preservadas. Nenhuma nova skill foi instalada neste marco. Nenhuma configuração global do Windows foi alterada.

## Bloqueios e continuação

**Próximo passo:** preparar deliberadamente a toolchain oficial Rust/MSVC/Windows SDK ou usar uma máquina de build já preparada, gerar Cargo.lock real, revisar dependências Rust e validar o shell WebView2. A instalação desses pré-requisitos de sistema não foi realizada para respeitar a restrição de mudanças globais. Depois, iniciar inventário somente leitura, com fonte/tempo/confiabilidade por campo, antes de recomendar ajustes.

Ainda não implementados: inventário real, SQLite/migrações/backups de atendimentos, regras de compatibilidade por hardware, schema executável completo, execução e rollback, broker elevado, sensores/telemetria/benchmark, integração de ferramentas, perfis por jogo, retomada após reboot, relatórios HTML/PDF antes/depois, updater/assinatura/instalador e navegação com controle físico. Não há otimização aplicada nem ganho de FPS a relatar.

O usuário não precisa intervir para usar a consulta web. Build nativo exige uma etapa de preparação do ambiente; assets oficiais da marca e identidade de assinatura serão necessários antes da distribuição. Para criar commits, falta definir a identidade Git local escolhida pelo usuário. A manutenção futura tem procedimento manual em `maintenance.md`; não há tarefas agendadas ou pesquisa automática fora das sessões de desenvolvimento.
