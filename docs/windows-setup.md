# Clonar e executar no Windows

Revisão: 23/10/2026. Suporte de build pretendido: Windows x64 com MSVC. O frontend foi testado no Windows; o aplicativo Tauri ainda aguarda compilação e teste nativos. Repositório oficial autorizado pelo proprietário: [JuliozXz/GOAT-Tweaks-V2](https://github.com/JuliozXz/GOAT-Tweaks-V2).

## Pré-requisitos em outro computador

Instale deliberadamente a partir das fontes oficiais e abra um novo PowerShell após instalação:

- [Git for Windows](https://git-scm.com/downloads/win), com `git` no PATH.
- [Node.js 24](https://nodejs.org/en/download), versão usada localmente 24.22.1. Não é necessário instalar o Codex ou utilizar seus diretórios. Verifique `node --version` e `npm --version`.
- pnpm **11.25.0**, conforme `packageManager`. Com Node disponível: `npm.cmd install --global pnpm@11.25.0 --ignore-scripts`. Esse comando é uma instalação explícita no prefixo npm; o iniciador nunca a executa. Se esse prefixo exigir privilégios, escolha a instalação de usuário permitida pela organização; não abra o aplicativo como administrador para contornar o problema. Verifique `pnpm.cmd --version`. Não use `latest` nem atualize o lockfile para resolver um problema de ambiente.
- PowerShell 5.1 ou 7. A política de execução da organização deve permitir os scripts locais ou sua versão assinada. Não use bypass nem modifique a política global.

Somente para **desktop nativo**: siga os [pré-requisitos oficiais Tauri](https://v2.tauri.app/start/prerequisites/#windows): Microsoft C++ Build Tools com Desktop development with C++, ferramentas MSVC x64/x86 e Windows SDK; [WebView2 Evergreen](https://developer.microsoft.com/en-us/microsoft-edge/webview2/); [Rust pelo instalador oficial rustup](https://www.rust-lang.org/tools/install), host `x86_64-pc-windows-msvc`. Revise procedência/assinatura dos instaladores; não execute download por pipe. Build Tools pode solicitar elevação para sua instalação, que é uma operação separada do aplicativo.

`rust-version = 1.90` é o mínimo declarado pelo projeto, não a certificação das dependências transitivas. O workflow fixa uma toolchain e a documenta em [windows-ci.md](windows-ci.md). Depois da instalação, verifique `cargo --version`, `rustc --version` e `rustup show`. As ferramentas C++ podem estar fora do PATH do terminal comum; o iniciador consulta `vswhere` e os headers do SDK no local padrão. Instalações personalizadas exigem revisão do diagnóstico, não remoção das verificações.

## Clonagem e dependências

Com Git, Node 24 e pnpm 11.25.0 disponíveis, execute em uma pasta de trabalho. Use uma pasta de destino nova; preserve clones que já contenham alterações:

```powershell
git clone https://github.com/JuliozXz/GOAT-Tweaks-V2.git
if ($LASTEXITCODE -ne 0) { throw 'Falha no git clone' }
Set-Location -LiteralPath .\GOAT-Tweaks-V2
pnpm.cmd install --frozen-lockfile --ignore-scripts
if ($LASTEXITCODE -ne 0) { throw 'Falha ao instalar dependencias' }
```

Um repositório privado requer autenticação Git pelo fluxo oficial da sua conta. Não coloque tokens na URL, em scripts ou arquivos versionados. A instalação requer rede para pacotes ausentes. O lockfile fixa versões/integridades; `pnpm-workspace.yaml` mantém scripts de instalação desativados e caches na pasta do projeto. Não copie `node_modules` de outro computador.

## Escolher o modo

```powershell
# Verificações somente leitura; exit 0 = pré-requisitos detectados, não janela testada.
.\GOAT-HUB.ps1 -Mode Desktop -Check

# Compila Rust e abre a JANELA NATIVA Tauri em desenvolvimento quando houver toolchain.
.\GOAT-HUB.ps1 -Mode Desktop
```

Se a toolchain estiver ausente, o comando falha com a lista de bloqueios. Não muda automaticamente para navegador.

```powershell
# Alternativa explícita: apenas FRONTEND WEB em desenvolvimento.
.\GOAT-HUB.ps1 -Mode Web -Check
.\GOAT-HUB.ps1 -Mode Web
# Abra manualmente http://127.0.0.1:1420 no navegador.
```

O terminal deve permanecer aberto; encerre com Ctrl+C. Não há browser aberto automaticamente ou daemon oculto. A trava impede dois iniciadores no mesmo checkout/porta; a porta estrita detecta conflitos com outros processos. Nenhum processo externo é encerrado. Chamadas diretas a `pnpm dev`/`pnpm tauri dev` não usam a trava do iniciador. Em caso de interrupção abrupta, confira processos/porta antes de repetir; o script não mata processos por nome.

O script usa `$PSScriptRoot`, e o auxiliar Node usa `import.meta.url`; podem ser chamados por caminho de outra pasta, inclusive com espaços. Nenhum caminho do computador original é necessário. `-Check` não cria `.runtime`; a execução cria uma trava local nessa pasta ignorada pelo Git. Arquivo de trava remanescente não bloqueia se não houver um processo segurando o handle.

```powershell
# Teste limitado: inicia, verifica HTTP + módulo de entrada e encerra; não testa renderização.
.\GOAT-HUB.ps1 -Mode Web -SmokeTest -Port 1437
pnpm.cmd test:launcher
pnpm.cmd test:inventory
pnpm.cmd typecheck
pnpm.cmd lint
pnpm.cmd format:check
pnpm.cmd test
pnpm.cmd build
pnpm.cmd test:browser:install
pnpm.cmd test:e2e
```

O Playwright baixa um navegador isolado em `.playwright`, sem modificar Edge/WebView2. Web não valida IPC, compilação, permissões ou instalador nativos.

## Primeiro build nativo e produção

O repositório ainda não possui `src-tauri/Cargo.lock` resolvido: Cargo não está instalado na máquina atual. Não foi fabricado um lockfile. Na máquina preparada, execute **uma vez**, revise e inclua o lockfile resultante no repositório antes de adotar essa resolução:

```powershell
# Instalação deliberada da mesma toolchain usada no CI; não muda o default global.
rustup toolchain install 1.99.1-x86_64-pc-windows-msvc --profile minimal --component rustfmt --component clippy
if ($LASTEXITCODE -ne 0) { throw 'Falha na toolchain' }
$env:RUSTUP_TOOLCHAIN = '1.99.1-x86_64-pc-windows-msvc' # apenas este terminal
cargo generate-lockfile --manifest-path src-tauri/Cargo.toml
if ($LASTEXITCODE -ne 0) { throw 'Falha ao resolver Cargo.lock' }
# Revisar dependências, licenças, advisories e diff de src-tauri/Cargo.lock.
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo check --manifest-path src-tauri/Cargo.toml --locked
cargo test --manifest-path src-tauri/Cargo.toml --locked
pnpm.cmd tauri build --no-bundle -- --locked
if ($LASTEXITCODE -ne 0) { throw 'Build nativo falhou' }
.\GOAT-HUB.ps1 -Mode Production
```

`Production` só executa `src-tauri/target/release/goat-hub-service.exe` existente, nunca o servidor Vite. O nome deriva do pacote Cargo atual; se o nome/target mudar, revise iniciador e testes. O check de existência não verifica procedência nem homologa o binário. O artefato local será sem assinatura até configurar certificado legítimo. A produção ainda não está validada, e a aplicação continua sem executor de tweaks. Para instalador NSIS e coleta de artefatos no GitHub, consulte [windows-ci.md](windows-ci.md). Artefato de CI não é release publicada nem certificado de testes em máquina de cliente.

## Inventário separado, somente leitura

```powershell
New-Item -ItemType Directory -Force .\.runtime | Out-Null
.\scripts\inventory\Collect-Inventory.ps1 -OutputPath .\.runtime\inventario-cliente.json
```

Importe o JSON pela interface. O coletor não instala dependências, não solicita admin e não aplica ajustes. O arquivo não deve ser publicado: `.runtime` é ignorado pelo Git e bloqueado pelo servidor de desenvolvimento. Escolha nome novo para cada coleta; não sobrescreve arquivo existente. Consulte [contrato e limitações](research/inventory-native.md), inclusive validação ainda pendente em token comum fora do sandbox. A importação manual não autentica a origem de um JSON e não substitui um coletor integrado ao Tauri.

## Preparação para publicação

O `origin` aponta para `https://github.com/JuliozXz/GOAT-Tweaks-V2.git`. A configuração anterior do workspace original, sem remotes, foi preservada localmente em `.runtime/git-config-before-origin-2026-10-23.bak`; para desfazer somente esse vínculo use `git remote remove origin`. O proprietário autorizou a publicação inicial das fontes nesse repositório público. A identidade foi conferida na conta GitHub conectada; o commit usa o login e o endereço noreply para preservar o e-mail pessoal, sem alterar configurações globais. A licença pública do produto não foi inventada. Para novas publicações, revise `git status --short`, os arquivos novos e `git diff --cached`; o iniciador não faz push automático. Preserve os avisos em `THIRD_PARTY_NOTICES.md`, `third_party/` e licenças/proveniência em `.agents/skills/`.

Versionar: fontes web/Rust, manifests, `pnpm-lock.yaml`, configuração de instalação, launcher/coletores/testes, ícones técnicos, docs e workflow. Versionar `Cargo.lock` quando realmente gerado/revisado. Não versionar `node_modules`, caches, `.playwright`, `target`, instaladores, relatórios de clientes, `.env`, chaves/certificados privados ou tokens. `.gitignore` não remove arquivos já rastreados; confira `git ls-files` antes de publicar.

Treze skills com proveniência/licença acompanham o clone como instruções auxiliares de desenvolvimento. A skill local `vercel-react-best-practices` foi preservada no computador original e excluída do envio: há declaração MIT upstream, mas o aviso integral não foi localizado. A ausência dessa skill não bloqueia instalação, build ou execução. Não reproduzir aviso de copyright presumido; verificar a licença antes de redistribuí-la futuramente.

A auditoria histórica `skill-audit-2026-10-23/` e `docs/validation/` permanecem no computador original e foram excluídas da seleção de publicação: contêm evidência específica da máquina, caminhos locais e material de pesquisa desnecessário ao build. As skills mantêm suas próprias licenças e PROVENANCE.md portáteis. Links históricos para esses relatórios podem não existir num clone; os resumos novos de validação e as instruções necessárias estão versionados em `docs/`.

Antes de atualizar dependências, revise versões oficiais, diff do lockfile, licenças e advisories (`pnpm audit`; auditoria Cargo em máquina preparada). Atualizações são deliberadas, seguidas dos testes e validação nativa; nenhum script atualiza tudo automaticamente.
