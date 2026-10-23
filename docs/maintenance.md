# Dependências, manutenção e reversão

## Estado de instalação

Dependências diretas exatas em `package.json`; resolução e integridade em `pnpm-lock.yaml`. Registry oficial npm consultado em 23/10/2026. Node 24.22.1 e pnpm 11.25.0 já existiam no runtime Codex. Nenhum Rust, MSVC, SDK, driver, serviço ou coletor foi instalado nesta etapa.

Scripts de instalação estão desativados por `ignoreScripts: true` em `pnpm-workspace.yaml`, além do argumento explícito usado na instalação. A leitura de manifests instalados não encontrou scripts preinstall/install/postinstall. Isso é uma inspeção de metadados, não auditoria integral do código transitivo. Build e testes executam os pacotes de desenvolvimento fixados. `minimumReleaseAge: 1440` evita adoção imediata de publicações recentes; não prova segurança.

O pnpm 11 ignorou as antigas opções de `.npmrc` na primeira instalação e usou o store padrão `D:\.pnpm-store\v11`. A política foi corrigida no YAML, e a instalação seguinte foi comprovadamente vinculada a `D:\gpt\.pnpm-store\v11`. O store inicial foi preservado para não remover cache potencialmente compartilhado. Não houve mudança global de configuração. O backup temporário `node_modules.initial-cache`, criado nesta etapa, foi removido após a suíte passar e depois de confirmar seu caminho absoluto dentro do workspace.

Também foi instalado Chromium Headless Shell 156.0.8078.4 (revisão Playwright 1248), FFmpeg 1013 e Winldd 1007 em `.playwright/`, pelo instalador oficial auditado do Playwright, sem `--with-deps` e com `--no-remove`. Não se instalou Edge/Chrome globalmente. A primeira tentativa usou um Edge inexistente; a configuração foi corrigida. O navegador portátil caiu ao criar página no sandbox restrito do executor; a mesma suíte passou fora desse sandbox, mantendo `chromiumSandbox: true`. Isso não alterou mecanismos de segurança do Windows.

Os inventários completos de versões/licenças e o resultado do audit estão em `docs/validation/`. Nenhuma vulnerabilidade conhecida foi retornada pelo registry no instante da consulta. Isso não detecta todo código malicioso ou falha ainda não publicada. Licenças de runtime React/ReactDOM/Zod são MIT; API Tauri é Apache-2.0 OR MIT. As dependências de teste/build incluem MIT, Apache, MPL-2.0 e outras permissivas conforme inventário. Não foram modificados fontes de terceiros. MPL em ferramentas de desenvolvimento não torna automaticamente o aplicativo inteiro MPL; revisar obrigações por arquivo/artefato antes de redistribuir componentes modificados.

As crates Rust diretas foram fixadas por versão e checksum documentado, mas ainda não há resolução transitiva, Cargo.lock ou auditoria Cargo. Não declarar o backend reproduzível antes desses passos. A licença do código original GOAT HUB não foi escolhida/publicada em nome do usuário.

## Verificação periódica manual

Durante trabalho ativo, verificar semanalmente ou antes de cada release:

```powershell
pnpm outdated
pnpm audit --json
pnpm licenses list --json
```

Consultar avisos oficiais das dependências em uso, release notes de Tauri/WebView2/React/Vite e advisories Rust após existir Cargo.lock. Comparar changelog, API, licença, scripts e lockfile antes de alterar uma versão. Atualizar uma dependência ou conjunto tecnicamente acoplado por vez; executar unidade, TypeScript, lint, formato, build, E2E e testes nativos correspondentes. Não usar `audit fix --force`, atualização indiscriminada ou branches flutuantes.

Revisar referências do catálogo por categoria: registrar última consulta, fonte/commit, evidência nova, obsolescência e motivo para manter/rejeitar. A página continuar online não confirma a utilidade do ajuste. O procedimento das skills permanece na auditoria anterior; nenhuma skill foi atualizada ou adicionada durante a fundação. Não há automação agendada nem atualização silenciosa.

## Reversão do trabalho deste marco

`docs/AGENTS.before-goat-hub.md` preserva as instruções anteriores. Para desfazer somente a orientação nova, comparar esse backup com `AGENTS.md`, preservando qualquer edição posterior. Nenhum arquivo das skills ou da auditoria anterior foi substituído.

Antes de remover o projeto, interromper o servidor de desenvolvimento e guardar catálogos/documentação/exportações desejados. Os novos fontes ficam em `src/`, `src-tauri/`, `tests/`, `scripts/`, `docs/` e nos manifests/configurações da raiz; `dist/`, `node_modules/`, `.pnpm-store/`, `.pnpm-cache/`, `test-results/` e `playwright-report/` são gerados. Conferir caminhos absolutos dentro de `D:\gpt` e propriedade dos arquivos antes de apagar. Nunca executar limpeza genérica fora do workspace ou remover a auditoria de skills existente.

O aplicativo grava somente `goat-hub.preferences.v1` no armazenamento da sua própria origem. Conteúdo inválido é preservado e a sessão vira temporária; não existe botão que apague dados do cliente. Um futuro reset exige exportar/revisar antes de remover apenas essa chave. Exportações JSON são planos de revisão, não backups do Windows ou relatórios de ganhos.

## Política de lint

Biome usa preset recomendado. Apenas `style/noDescendingSpecificity` foi desativado: os componentes CSS têm árvores separadas, e o comparador por seletor produzia avisos entre descendentes que não se sobrepõem. Acessibilidade, segurança e demais regras permanecem habilitadas. Não se silenciaram violações axe para aprovar o teste.
