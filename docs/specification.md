# GOAT HUB Service — especificação executável

Marca: GOAT Tweaks. Data: 2026-10-23. Fontes de requisitos: os três documentos fornecidos pelo usuário nesta conversa. O workspace inicial continha apenas AGENTS.md, 14 skills e a auditoria delas; nenhum aplicativo ou repositório Git. Os arquivos existentes serão preservados.

## Fundação preservada e incremento atual

Diretriz atual: desktop Windows profissional, mouse e teclado, menus laterais, filtros e tabelas. Sem Big Picture, navegação por controle ou fullscreen obrigatório. Logo oficial pendente; tokens provisórios centralizados. O incremento seguinte acrescenta iniciador portátil, preparação GitHub/CI, coletor PowerShell separado e importação de inventário com triagem. Consulte `STATUS.md` para resultados atuais. Os parágrafos de fundação abaixo descrevem o marco original, não substituem o estado atual.

Implementar React/TypeScript/Vite estático, estrutura Tauri 2, identidade escura grafite/âmbar, navegação pelas 18 categorias solicitadas, níveis Basic/General/Advanced por categoria, catálogo de pesquisa com fontes, busca global que abre o registro original, filtros, ordenação, detalhes, seleção para revisão, preferências locais versionadas e exportação do plano de revisão. A seleção não significa recomendação nem autorização para executar. Sem inventário, toda compatibilidade permanece desconhecida. Sem benchmark, nenhum ganho será exibido.

Pesquisa e implementação são estados separados. Registros manuais, em pesquisa, integrações pendentes e rejeitados terão identificação explícita. Não criar executor de Windows nesta fase. Não expor botões que simulem uma operação. A interface informa honestamente ausência de inventário, sensores, sessão de execução e mecanismos de restauração. Não usar dados fictícios de hardware. Um catálogo real de investigação não é um inventário do computador.

## Contratos e módulos

- `src/domain`: validação do catálogo, categorias, pesquisa, seleção, estado versionado, exportação.
- `src/data`: registros originais sintetizados de fontes públicas; nenhum script de terceiros.
- `src/platform`: armazenamento e capacidades de janela; sem shell, registro, serviços, rede externa ou coletor.
- `src/components`: interface sem lógica de compatibilidade privilegiada.
- `src-tauri`: shell desktop, CSP e capacidades mínimas. Build nativo exige toolchain Windows que ainda não está disponível nos caminhos examinados.
- `docs/research`: fontes, classificação, decisões de adoção e lacunas.

Armazenamento de preferências/seleção no marco 1: localStorage com schema, erro visível e preservação de conteúdo inválido. Não usar como histórico transacional de execução. O banco de atendimentos e o executor exigirão SQLite/migrações/backup nas fases posteriores.

## Aceitação verificável do marco

1. Catálogo validado: IDs únicos, categorias/níveis válidos, fonte HTTPS, conteúdo não executável, rejeitados não selecionáveis.
2. Busca por nome/ID/descrição/sinônimos; filtros consistentes e estados vazios reais. Contagens derivadas dos registros.
3. Abertura de registro pela busca respeita categoria/nível. Navegação por URL fragment e histórico do navegador.
4. Seleção persistente sem duplicação; revisão em diálogo acessível; exportação estruturada rotulada como plano, sem alegar alterações ou ganhos.
5. Erros de armazenamento, dados corrompidos e catálogo inválido não produzem sucesso falso nem apagamento silencioso.
6. Teclado, foco, Escape, zoom, resoluções e movimento reduzido verificados em navegador. Testes de unidade, E2E, análise automatizada de acessibilidade, TypeScript, lint e build. Evidência de navegador não comprova WebView2 nativo.
7. Janela nativa normal e redimensionável declarada em Tauri, com mouse e teclado. Sem afirmar que build/instalação nativa passou até executar.

## Fases seguintes

2. Inventário somente leitura com origem/data/confiabilidade por campo e tratamento de indisponibilidade.
3. Expandir schema de otimização executável: parâmetros, pré/pós-condições, conflitos, dependências, permissões, alterações exatas, auditoria e testes.
4. Executor restrito, estado anterior, plano verificado, confirmação, idempotência, cancelamento, recuperação e rollback testado.
5. Telemetria real e comparações controladas, sem confundir PresentMon com sensor físico de input lag.
6. Integrações externas após licença/hash/assinatura, diagnóstico de ausência e suporte de versão.
7. Recursos específicos por hardware, firmware manual, rede, perfis por jogo e retomada após reboot.
8. Estabilização Windows, assinatura, pacote, atualização, recuperação e documentação de suporte.

Nenhuma categoria é considerada concluída por possuir uma página. O próximo recurso deve passar por pesquisa, decisão registrada, implementação isolada, testes de falha e validação antes de ser promovido. Não haverá pesquisa ou atualização autônoma fora de uma sessão de trabalho sem automação explicitamente solicitada.
