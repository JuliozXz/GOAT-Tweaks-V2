# Orientação do workspace

Este workspace usa skills locais em `.agents/skills/`. Escolha pela descrição da tarefa e leia somente a skill e as referências pertinentes. A instalação não autoriza executar scripts, instalar dependências ou ampliar o escopo do pedido.

## Seleção por contexto

| Trabalho | Skills pertinentes |
| --- | --- |
| Limites de processos, contratos e estado Tauri 2 | `tauri-architecture` |
| React/TypeScript/Vite e integração IPC | `tauri-frontend`, `vercel-react-best-practices` |
| Rust, concorrência, erros, FFI e observabilidade | `rust-skills` |
| Permissões, capabilities, CSP e plugins privilegiados | `tauri-security` |
| Testes unitários, integração, IPC e pacote nativo | `tauri-testing` |
| Testes E2E do frontend e regressão visual | `playwright-automation`, `visual-testing` |
| UI, design system, tipografia, movimento e controle | `desktop-interface-design` |
| Jornadas de teclado e foco | `keyboard-navigation-review` |
| Segurança de JavaScript/TypeScript, quando solicitada | `security-best-practices` |
| Modelagem de ameaças, quando solicitada | `security-threat-model` |
| Builds, assinatura, instaladores e atualização | `tauri-release` |
| Sensores, APIs Windows, profiling e frametimes | `windows-telemetry-analysis` |

Skills relacionadas citadas por terceiros podem não estar instaladas; não instale coleções inteiras para resolver uma referência. Consulte documentação primária quando faltar uma especialidade.

## Compatibilidade e decisões técnicas

- Inspecione manifests, lockfiles, toolchain/MSRV e comandos existentes antes de escolher APIs ou dependências. Esta configuração não fixa versões do futuro aplicativo.
- Use somente regras React aplicáveis à versão instalada. Em Tauri com Vite estático, não introduza Next.js, RSC, server actions, SSR ou `next/dynamic` a partir de exemplos Vercel. Prefira APIs equivalentes da stack existente.
- Mantenha fronteiras explícitas entre frontend não confiável e Rust privilegiado. Capabilities não substituem validação Rust. Verifique separadamente o enquadramento ACL de comandos próprios; não suponha que todo `generate_handler!` cria restrições automaticamente.
- Benchmarks e perfis precedem otimizações. Não adicione caches, bibliotecas, flags globais, novos runtimes ou permissões só porque uma regra os menciona. Miri não comprova integração com Win32 nem ausência de bugs em caminhos não executados.
- Playwright no navegador com IPC simulado verifica o frontend. Para Tauri empacotado no Windows, consulte a rota oficial de `tauri-driver`/WebDriver e requisitos do Edge Driver; execute testes nativos separados. Uma captura Linux não valida renderização Windows/WebView2.
- Preserve origem, licença, avisos e alterações locais das skills. Consulte a auditoria em `skill-audit-2026-10-23/`; não execute automaticamente arquivos obtidos para pesquisa.

## Engenharia e evidência

Para trabalho complexo, mapeie pontos de entrada e dependências, registre hipóteses e um plano com critérios verificáveis. Use arquivos de plano apenas quando ajudarem a manter continuidade. Não sobrescreva planos de outro trabalho.

Em depuração, reproduza, examine mudanças recentes e logs sem segredos, formule uma hipótese e teste a menor correção. Em refatoração, preserve comportamento e separe alterações funcionais quando isso ajudar a revisão. Documente contratos, decisões relevantes e limitações reais.

Revise correção, concorrência, segurança, acessibilidade e testes proporcionais ao risco. Relate achados com arquivo/linha e consequência reproduzível; diferencie hipótese de falha confirmada. Preserve alterações alheias, evite comandos Git destrutivos e não publique/mescle alterações sem autorização correspondente.

Use o gerenciador de pacotes e os checks já definidos. Revise diffs de lockfiles, avisos de segurança e licenças antes de atualizar dependências. Não use atualização em massa nem corrija avisos com opções de força sem avaliar impacto.

O ambiente atual fornece subagentes nativos. Quando o usuário solicitar delegação, use papéis limitados de investigação, segurança ou testes, com escopo e saída claros; herde o modelo atual, coordene arquivos e consolide evidências. Não importe agentes Claude/Copilot, hooks ou arquivos de configuração de outra plataforma como se fossem nativos.

Declare exatamente o que foi executado, aprovado, ignorado ou ficou bloqueado. Skills de instruções não equivalem a ferramentas instaladas nem a testes aprovados. Não altere configurações globais do Windows ou execute coletores privilegiados como efeito colateral de desenvolvimento.
