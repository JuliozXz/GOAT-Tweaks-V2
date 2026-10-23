# Shell nativo da fundação

Este diretório prepara uma janela Tauri 2 para o frontend do GOAT HUB Service. **Não foi compilado nem executado nesta sessão:** Rust, MSVC e Windows SDK não foram encontrados no PATH/caminhos usuais auditados. Não há coletor, executor, comandos próprios, plugins de sistema ou serviço elevado.

## Versões e origem

Consulta somente leitura ao registry oficial crates.io em 23/10/2026:

| Crate | Versão exata | MSRV declarado | Licença | SHA-256 do pacote publicado |
| --- | --- | --- | --- | --- |
| `tauri` | 2.12.5 | 1.90 | Apache-2.0 OR MIT | `5fb0244332cfb9cee7e2a568bf5da29a36ed8fdbd717f6f47a66b6b7b358c072` |
| `tauri-build` | 2.7.4 | 1.90 | Apache-2.0 OR MIT | `adddb0e648752aaac5da9c3c3c6a68e1e87cab55e3b757b18a9441ef8c3ac614` |

Os pacotes não estavam yanked na consulta. Fontes: [tauri](https://crates.io/api/v1/crates/tauri), [tauri-build](https://crates.io/api/v1/crates/tauri-build). O frontend fixa API/CLI 2.12.4; o crate Rust 2.12.5 é um patch da mesma linha minor. Essa relação ainda precisa de resolução, compilação e teste real. Não foi criado `Cargo.lock` fictício. O MSRV das dependências transitivas precisa ser confirmado quando o lockfile for gerado.

## Segurança e interface

Somente a janela local `main`, no Windows, possui uma capability, com lista de permissões vazia. Não há `core:default`, shell, filesystem, HTTP, processo, updater ou origens remotas. A CSP de produção permite conteúdo local e IPC; WebSocket local e estilos de HMR aparecem somente em `devCsp`. O endpoint de desenvolvimento está alinhado ao Vite em `127.0.0.1:1420`.

O app declara janela normal, com bordas e redimensionamento; fullscreen e navegação por controle foram removidos do escopo. Ao adicionar comandos próprios futuramente, aplicar `AppManifest::commands` e testes de ACL, conforme [documentação](https://v2.tauri.app/security/capabilities/). O coletor PowerShell atual é separado, sem ponte IPC privilegiada.

`bundle.active` permanece `false`: não há instalador publicado, certificado de assinatura, updater ou promessa de suporte nativo. O identificador `com.goattweaks.goathubservice` é uma identificação local inicial; revisar sua titularidade e política de distribuição antes de publicar.

## Ícone técnico temporário

O build Windows do Tauri exige um arquivo ICO mesmo com o empacotamento desabilitado. Essa condição foi confirmada no [código oficial tauri-build 2.7.4](https://raw.githubusercontent.com/tauri-apps/tauri/tauri-build-v2.7.4/crates/tauri-build/src/lib.rs). `icons/icon.ico` e seu fonte `icons/icon.svg` são um quadrado âmbar com as letras GH, criado especificamente para viabilizar o build; **não representam o logo oficial GOAT Tweaks**. O gerador local `icons/generate-icon.mjs` usa apenas Node e grava esses dois arquivos no próprio diretório. Ele não é executado automaticamente por install/build. Substituir pelo asset oficial autorizado antes da distribuição.

## Validação pendente

Verificações já executadas: JSON da configuração/capability parseado; TOML do manifest parseado com `tomllib`; ícone decodificado pelo Pillow como ICO RGBA de 64 × 64. O SHA-256 do ICO gerado é `c9a2a26e91b14adc9ff90de8a07e7434d3549330b4d25c79dcf48cd6d9ecb2c1`. Isso confirma sintaxe estrutural básica e leitura do asset, **não** schema gerado pelo Tauri, resolução Cargo, compilação Rust, ACL em runtime ou funcionamento da janela. O schema local em `gen/schemas` será gerado pelo primeiro build; não foi fabricado.

Após preparar deliberadamente os [pré-requisitos oficiais Windows](https://v2.tauri.app/start/prerequisites/), executar na raiz do projeto:

```powershell
pnpm build
cargo generate-lockfile --manifest-path src-tauri/Cargo.toml
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo check --manifest-path src-tauri/Cargo.toml --locked
pnpm tauri build --no-bundle -- --locked
```

O primeiro comando não certifica os seguintes. Revisar o novo lockfile antes de adotar a resolução. Testar depois o lançamento, fechamento, redimensionamento, navegação, armazenamento, CSP e negação de APIs que não receberam permissão. Não usar `--locked` antes de existir um lockfile real. Não executar coletores ou alterar o Windows como parte desses smoke tests. Ver [iniciador portátil](../docs/windows-setup.md) e [CI/instalador candidato](../docs/windows-ci.md).
