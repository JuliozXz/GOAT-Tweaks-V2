# GOAT HUB Service — estado atual

Atualizado em **23/10/2026**. Versão de desenvolvimento **0.1.0**, sem release nativa homologada. Fundação preservada; incremento de portabilidade, inicialização e inventário implementado. O [relatório original](history/milestone-0.1.0.md) foi preservado como histórico, inclusive suas limitações daquele momento.

## Entrega deste incremento

| Recurso | Estado comprovado | Limitação |
| --- | --- | --- |
| `GOAT-HUB.ps1` e módulo/auxiliar locais | Implementados; Web real iniciado, HTTP/módulo verificados; pasta privada nega HTTP; testes de duplicação, porta ocupada e encerramento | Desktop/Production preparados, não iniciados: falta toolchain/binário |
| Repositório portátil | Publicado em JuliozXz/GOAT-Tweaks-V2/main; clonagem real, instalação dos 56 pacotes, checks, build e iniciador passaram em pasta com espaços | Desktop nativo ainda não homologado; veja publication-2026-10-23.md |
| GitHub Actions Windows | Workflow publicado e reconhecido como ativo pela API GitHub; PR/manual, permissões somente leitura, Actions fixadas por SHA, checks, bootstrap Cargo explícito e NSIS candidato sem assinatura | Sem execução remota nesta entrega; nenhum instalador gerado |
| Interface técnica | Janela Tauri normal; removidos fullscreen, sua API/permissões e monograma GH da UI; mouse/teclado, sidebar/filtros/tabelas; tokens centralizados | Logo oficial pendente; ícone técnico de build antigo ainda provisório |
| Inventário real separado | Coletor CIM de nove seções, allowlist, fonte/tempo/qualidade, unknown/null, exportação sem sobrescrita; nenhum ajuste | Não integrado por IPC. Coleta no sandbox comum foi negada; fora dele houve dados reais, mas token herdado elevado. Usuário comum fora do sandbox não validado |
| Inventário na interface | Importação JSON até 2 MiB, schema estrito, tabelas, remoção, erro preserva anterior; somente memória; testes unitários/E2E | Origem declarada no arquivo, sem autenticação criptográfica; não usar para aprovar execução |
| Triagem inicial | Regras de tempo/futuro, Windows, identificação relatada de fabricante GPU e bloqueio do executor | Não é recomendação individual de tweaks nem diagnóstico de gargalo |
| Pesquisa ampliada | 26 registros na matriz de referências, 505 arquivos listados em três repositórios; 20 lidos integralmente e 7 parcialmente; EXM público e fontes oficiais | Matriz não foi promovida ao catálogo executável; nenhum script externo executado |

## Números reais

Catálogo permanece com **41 registros de pesquisa**, **49 URLs de fonte**, **18 categorias / 54 combinações categoria-nível**: 17 orientações manuais, 12 integrações pendentes, 6 pesquisas e 6 rejeitados. **Zero tweaks implementados, zero aprovados, zero alterações de Windows aplicadas, zero ganhos de desempenho medidos.** O coletor é uma funcionalidade de diagnóstico; não é uma otimização. PresentMon/LibreHardwareMonitor/ferramentas de terceiros não estão integrados.

Não houve aumento artificial do catálogo para contabilizar a pesquisa. A expansão com schema completo, compatibilidade por ajuste, executor e persistência profissional permanece como próxima fase.

## Validação realizada

- TypeScript, Biome lint/formato e build web: passaram após integração.
- Vitest: **20 testes / 4 arquivos passaram**.
- Playwright Windows Chromium: **14 testes passaram** na execução final (15,8 s), incluindo navegação das 54 combinações, teclado/foco, plano JSON real, armazenamento/falhas, cinco viewports e inventário importado. Axe não encontrou violações nos estados testados. Não equivale a certificação WCAG ou WebView2.
- Iniciador: **14 assertions passaram no PowerShell 5.1 e 7.6.5**; início real de Vite em porta temporária, colisão sem matar processo alheio, trava exclusiva, liberação e caminho de outra pasta.
- Coletor: **27 assertions passaram no PowerShell 5.1 e 7.6.5**; interoperabilidade JSON PowerShell → validador TypeScript confirmada com fixtures, sem dados de cliente.
- Portabilidade: seleção inicial de 483 arquivos publicáveis copiada sem node_modules para pasta com espaços; na validação final, o comando padrão pnpm install --frozen-lockfile --ignore-scripts baixou os 56 pacotes fixados (zero reutilizados), com store/cache próprios da cópia e scripts desativados. Não foi uma instalação em outra máquina. Build web, 20 testes unitários e 14 assertions do iniciador passaram também na cópia final.
- Workflow: PyYAML 6.0.3 Python puro/BaseLoader validou sintaxe e estrutura básica; 13 steps; parser PowerShell verificou oito blocos; três Actions oficiais por SHA. Não houve actionlint ou execução remota.
- Preparação Git: arquivos necessários encontrados na seleção; nenhum cache, node_modules, artefato privado ou certificado privado selecionado pelos padrões examinados. Busca limitada por padrões de credenciais não encontrou correspondências; isso não é garantia de ausência de segredos. Nenhum caminho local original encontrado nos scripts/fontes/configuração de execução examinados.

Falhas investigadas: Chromium não funcionou dentro da restrição inicial e os E2E foram executados fora dela mantendo sandbox do navegador ativo. Um novo botão falhou contraste; corrigido com tokens e retestado. Instalação offline falhou por falta de metadados de política no cache novo; rede ao registry foi necessária. Uma cópia inicialmente colocada sob `.runtime` foi bloqueada corretamente pelo Vite; foi movida para pasta independente. O ensaio com store compartilhado gerou incompatibilidade de localização detectada pelo pnpm; essa instalação foi preservada à parte e uma instalação final totalmente nova, com a configuração padrão local, resolveu o problema. Nenhuma dessas tentativas é contabilizada como sucesso.

## Arquivos e publicação

Iniciador: `GOAT-HUB.ps1`, `scripts/launcher/Launcher.psm1`, `scripts/start.mjs`, `tests/powershell/launcher.tests.ps1` e scripts package.json. Inventário: `scripts/inventory/*`, `src/domain/inventory*`, `src/components/InventoryPanel.tsx`, seus testes PowerShell e `tests/inventory.spec.ts`. UI: App, estilos, tokens, plataforma de janela/log, teste de limites e E2E. Configurações: `.gitignore`, `.gitattributes`, Vite, Tauri/capability e AGENTS. Documentação: README, setup Windows, CI, design, arquitetura/especificação/riscos, pesquisa de inventário/matriz e este STATUS.

Fontes completas necessárias permanecem no projeto. Auditoria histórica de skills e evidências específicas da máquina continuam localmente, excluídas da publicação; licenças/PROVENANCE de skills continuam nos respectivos diretórios. Cópia de portabilidade está em `.portability-check/`, ignorada. Nenhum arquivo de usuário foi removido para preparar Git. A API GitHub confirmou JuliozXz/GOAT-Tweaks-V2 público e vazio antes da publicação inicial, com branch padrão main. O proprietário autorizou explicitamente enviar o projeto. `origin` local vinculado com backup da configuração em `.runtime/git-config-before-origin-2026-10-23.bak`. O commit local de preparação usou noreply; o Git do terminal não tinha credenciais de push, então os arquivos foram enviados pela conexão GitHub já autenticada. Os commits da API usam a identidade configurada nessa conta; não se afirma que a API preserva o noreply escolhido no commit local. Nenhuma configuração global de Git, release ou licença pública do produto foi inventada. O arquivo setup-validation-2026-10-23.json preserva o snapshot dos testes anterior à publicação; não é o estado corrente do remoto.

[Comandos exatos para clonar, instalar e iniciar](windows-setup.md). [Build remoto candidato e primeiro Cargo.lock](windows-ci.md). [Matriz de investigação ampliada](research/reference-matrix-02.md).

## Bloqueios e próximos passos

1. Preparar Rust/Cargo MSVC, C++ Build Tools e Windows SDK na máquina de build conforme fontes oficiais, ou executar o workflow autorizado no GitHub. WebView2 deve existir no destino. Não houve instalação global nesta etapa.
2. Gerar e revisar **Cargo.lock real**, compilar com `--locked`, testar janela/ACL/WebView2. O `-Check` atual detecta quatro ausências (Cargo, rustc, MSVC e SDK); não há binário nem instalador validado.
3. Publicação inicial e clonagem real concluídas; resultados/commit em publication-2026-10-23.md. Na primeira execução manual do workflow, usar bootstrap_cargo_lock somente para gerar candidato revisável. O workflow normal bloqueia lock ausente. Testar NSIS em Windows de avaliação; nenhum certificado foi configurado.
4. Testar coletor em PowerShell normal fora do sandbox, sem elevar automaticamente, e confirmar a logo oficial. Integrar coletor por IPC somente após backend compilável, contratos, permissões restritas e testes nativos.
5. Expandir catálogo/schema e implementar executor de baixo risco com pré-condições, confirmação, snapshot, pós-verificação, rollback e persistência transacional antes de aprovar qualquer alteração. Retomar as prioridades concretas da matriz; não aplicar scripts de referência.

Reversão deste incremento: o marco original permanece documentado em history; nenhuma configuração do Windows foi alterada. Reverter arquivos de código/configuração por revisão de versões/diffs e commits de reversão, preservando dados e mudanças posteriores. Não usar push forçado nem ativar novamente a direção de console em uma reversão incidental. Dependências não foram atualizadas; futuras atualizações exigem revisão de release/diff/licença/advisories e novos checks, nunca atualização automática em massa.
