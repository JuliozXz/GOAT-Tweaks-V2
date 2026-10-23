# Build Windows no GitHub Actions

Preparado em 23/10/2026. O workflow `.github/workflows/windows.yml` foi publicado e reconhecido como ativo pela API GitHub. **Não foi executado no GitHub, não gerou um instalador nesta sessão e não publicou release**. O envio das fontes não dispara este workflow: a configuração aceita PR e execução manual. Não há credenciais ou certificado de assinatura no projeto.

## Fluxo previsto

O workflow roda em pull requests e por `workflow_dispatch`, usando `windows-2025` x64 hospedado pelo GitHub. Ele instala dependências frontend com lockfile congelado e scripts de instalação desativados, executa TypeScript/lint/formato/unidade/build/E2E, prepara Rust, verifica formato/Clippy/testes Rust e compila NSIS. O navegador de E2E pertence ao projeto; não é instalação de Chrome/Edge no computador do usuário.

O runner hospedado contém MSVC e Windows SDK; isso resolve a preparação de uma máquina de CI, não demonstra que o computador local tem a toolchain. A imagem do runner recebe atualizações do GitHub mesmo usando `windows-2025`. Consulte o log **Set up job** para a versão exata da imagem de cada execução. Não se promete build byte a byte idêntico.

O workflow usa somente `contents: read`, não persiste credenciais Git e não recebe segredos de assinatura. Não usa `pull_request_target`, releases, push, deploy, serviço instalado ou elevação local. As ações oficiais são fixadas por commit; caches de pacotes não são compartilhados entre execuções nesta primeira configuração.

## Primeiro Cargo.lock

Na preparação desta configuração, `src-tauri/Cargo.lock` não existia. Um lockfile não foi inventado. Execuções normais falham explicitamente nesse caso.

1. Quando o repositório estiver no GitHub e o workflow na branch padrão, abra **Actions → Windows validation and installer → Run workflow**.
2. Na primeira execução, marque `bootstrap_cargo_lock`. A opção só gera o arquivo quando ausente, nunca atualiza um lock existente.
3. Baixe o artefato `cargo-lock-<run>-<attempt>` e revise dependências transitivas, checksums, licenças, MSRV e advisories. O upload ocorre antes dos testes/build Rust, de modo que uma falha posterior não perde a resolução.
4. Adicione o lock revisado em `src-tauri/Cargo.lock`, faça commit e execute novamente sem bootstrap. Este passo não é automático.

A resolução inicial usa rede e pode escolher versões transitivas disponíveis naquele dia. Todos os checks/builds seguintes na mesma execução usam `--locked`. O primeiro artefato continua candidato de engenharia até a revisão e validação; sucesso do Cargo não aprova suas dependências. O workflow não afirma ter executado auditoria RustSec. Depois de adotar o lock, uma atualização precisa ser deliberada, revisada e testada.

## Artefato e instalação de avaliação

O overlay temporário ativa apenas NSIS e `currentUser`, sem alterar `src-tauri/tauri.conf.json`. A CLI instalada confirma suporte a `--config`, `--target`, `--bundles nsis`, `--no-sign` e argumentos Cargo após `--`. O executável é deliberadamente **sem assinatura**, sem updater, acompanhado de `SHA256SUMS.txt` e retido por 14 dias nos artefatos da execução. Não há criação de release ou URL pública de download permanente.

O instalador não instala WebView2 automaticamente (`webviewInstallMode: skip`); o runtime Evergreen precisa existir na máquina de teste. Isso evita uma instalação adicional implícita. Use a distribuição oficial da Microsoft quando necessário e autorizado. A instalação por usuário não é uma autorização para modificar configurações Windows. Arquivos sem assinatura podem receber alertas SmartScreen; não desative essa proteção. O ícone continua provisório até receber o asset oficial.

Depois de uma execução remota aprovada: baixe o artefato autenticado, extraia, compare `Get-FileHash -Algorithm SHA256` com o arquivo de checksums e teste em VM/Windows de avaliação. Verifique instalação, abertura da janela, mouse/teclado, encerramento, reabertura, ausência de UAC inesperado e desinstalação. Testes do frontend em Chromium não validam WebView2, permissões IPC nativas ou instalador. O pipeline não executa o instalador no runner e não promove automaticamente o resultado para uso em clientes.

## Versões e fontes inspecionadas

| Componente | Pin / origem verificada |
| --- | --- |
| Node | 24.22.1, alinhado à versão de desenvolvimento e engines do projeto |
| pnpm | 11.25.0; instalado com npm sem lifecycle scripts em diretório temporário do runner; política existente de `pnpm-workspace.yaml` preservada |
| Rust | 1.99.1-x86_64-pc-windows-msvc, [estável anunciado em 15/10/2026](https://blog.rust-lang.org/2026/10/15/Rust-1.99.1/) e listado na imagem Windows2025 20261021.299.1 |
| MSRV do manifest | 1.90; usar Rust 1.99.1 não comprova suporte ao mínimo 1.90 nem à resolução transitiva ainda ausente |
| checkout | [v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1), `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| setup-node | [v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0), `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| upload-artifact | [v7.0.2](https://github.com/actions/upload-artifact/releases/tag/v7.0.2), `cf430e030ddbb5b0abf93d22962f4752f3646cd9` |

As tags/SHAs foram resolvidas pela API oficial GitHub e os `action.yml` desses commits foram lidos. Foram examinados seus inputs, runtimes Node24, notas de release e comportamento documentado; isso não equivale a auditoria integral do bundle JavaScript de cada ação. Os três projetos são ações oficiais do GitHub, não skills. O setup Rust usa `rustup` já disponível no runner; não executa script remoto via pipe.

Fontes consultadas em 23/10/2026: [Tauri — pipelines GitHub](https://v2.tauri.app/distribute/pipelines/github/), [Tauri — configuração NSIS](https://v2.tauri.app/reference/config/#nsisconfig), [Tauri — CLI](https://v2.tauri.app/reference/cli/), [GitHub — uso seguro de Actions](https://docs.github.com/en/actions/reference/security/secure-use), [imagem Windows2025](https://github.com/actions/runner-images/blob/main/images/windows/Windows2025-Readme.md), [blog oficial Rust](https://blog.rust-lang.org/), [WebView2 oficial](https://developer.microsoft.com/en-us/microsoft-edge/webview2/).

Foi preferida a CLI Tauri já fixada no projeto a uma ação extra de release: ela permite gerar o pacote sem adicionar lógica de publicação. Atualize pins somente após revisar release notes, diff, permissões e compatibilidade; repita os checks e o teste manual do instalador. Não use atualização automática em massa.

## Verificações locais desta preparação

- Os oito blocos PowerShell de `run` passaram pelo parser nativo, sem executar seus comandos de instalação/build remoto.
- As cinco referências `uses` usam SHAs completos; os três commits distintos foram confirmados nos repositórios oficiais.
- A ajuda da CLI Tauri 2.12.4 instalada foi executada; as opções NSIS/currentUser, WebView2/skip e updater foram conferidas no `config.schema.json` dessa instalação. Isso é inspeção de opções, não validação integral do overlay com um validador JSON Schema.
- Na revisão final foi localizado o wheel PyYAML 6.0.3 preservado na auditoria local anterior. O parser Python puro foi carregado diretamente do wheel, sem instalação, usando BaseLoader (sem construção de objetos arbitrários): YAML parseado, 13 steps, triggers PR/manual e `contents: read` verificados. Isso não valida expressões Actions nem substitui actionlint ou uma execução do serviço GitHub.
- O build web passou durante a preparação do tema. Não houve execução de MSVC, Rust, NSIS, upload de artefato ou instalação de pacote Windows nesta subtarefa.
