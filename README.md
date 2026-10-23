# GOAT HUB Service

Ambiente desktop profissional GOAT Tweaks para diagnóstico e otimização Windows, em desenvolvimento por fases, orientado a mouse e teclado. **Consulta, revisão e importação de inventário funcionais; nenhuma alteração de Windows executável nesta versão.**

Funcional: catálogo pesquisado, 18 categorias com níveis Basic/General/Advanced, busca global, filtros, detalhes com fontes/riscos, seleção persistente, revisão e exportação JSON de plano. São 41 registros de pesquisa, não 41 otimizações implementadas. Há coletor CIM PowerShell separado, importação validada e triagem conservadora. Coleta integrada ao Tauri, sensores, executor, rollback e benchmarks ainda não estão disponíveis.

## Clonar e iniciar pelo PowerShell

Prepare Git, Node 24 e pnpm 11.25.0 conforme o [guia completo Windows](docs/windows-setup.md). O repositório não depende do Codex nem de caminhos do computador original.

```powershell
git clone https://github.com/JuliozXz/GOAT-Tweaks-V2.git
if ($LASTEXITCODE -ne 0) { throw 'Falha no clone' }
Set-Location -LiteralPath .\GOAT-Tweaks-V2
pnpm.cmd install --frozen-lockfile --ignore-scripts
if ($LASTEXITCODE -ne 0) { throw 'Falha nas dependencias' }
.\GOAT-HUB.ps1 -Mode Web
```

O comando acima inicia o **frontend web de desenvolvimento**; abra `http://127.0.0.1:1420` no navegador e mantenha o terminal aberto. Encerre com Ctrl+C. Instalação, build web e iniciador foram validados numa clonagem real do GitHub: [relatório de publicação](docs/publication-2026-10-23.md).

Para desenvolver a janela nativa, `Desktop` exige Rust/MSVC/SDK/WebView2. O build nativo ainda está bloqueado neste ambiente:

```powershell
.\GOAT-HUB.ps1 -Mode Desktop -Check
.\GOAT-HUB.ps1 -Mode Desktop
```

`Production` só aceita o executável release local existente; veja o guia antes de compilar. Não há instalador nativo homologado nesta entrega.

O repositório oficial é [JuliozXz/GOAT-Tweaks-V2](https://github.com/JuliozXz/GOAT-Tweaks-V2). O workflow [Windows](.github/workflows/windows.yml) prepara checks e instalador NSIS sem assinatura, sem publicar release. [Limitações e primeiro Cargo.lock](docs/windows-ci.md): **a execução remota ainda não foi realizada**. A publicação das fontes não certifica a compilação ou o funcionamento do desktop nativo.

## Desenvolvimento

Node 24 e pnpm 11.25.0, conforme manifests. No ambiente Codex atual ambos estão no runtime disponibilizado pelo aplicativo; um terminal externo pode precisar desses pré-requisitos no PATH.

```powershell
pnpm install --frozen-lockfile --ignore-scripts
pnpm dev
```

Abrir `http://127.0.0.1:1420`. O servidor escuta apenas no loopback. O frontend usa React/TypeScript/Vite, sem servidor remoto ou coleta automática de hardware. As gravações da interface são preferências locais e exportação solicitada pelo técnico; inventários importados ficam apenas na memória da sessão. O coletor separado grava JSON no caminho escolhido explicitamente.

```powershell
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm test:e2e
pnpm catalog:report
```

E2E usa Chromium Headless Shell fixado pelo Playwright, com sandbox e contextos isolados. Prepare com `pnpm test:browser:install`: baixa somente o navegador de teste e auxiliares para `.playwright/`, sem instalar Edge globalmente. Gera resultados em `test-results/` e `playwright-report/`. As capturas são evidência de revisão; não são uma comparação de pixels contra baseline aprovado. Nenhum teste aplica ajustes reais.

## Aplicativo nativo

`src-tauri/` contém uma janela Tauri 2 normal, redimensionável, sem permissões IPC privilegiadas. **A compilação está bloqueada pela ausência de Cargo/Rust/MSVC/SDK detectáveis neste ambiente.** O diagnóstico reproduzível é `.\GOAT-HUB.ps1 -Mode Desktop -Check`. Não há instalador ou binário nativo validado.

Siga [pré-requisitos e verificações nativas](src-tauri/README.md) em uma etapa deliberada. O teste web não valida IPC, CSP/ACL em runtime ou WebView2. O ícone de build é temporário; a marca oficial não foi fornecida como asset. A interface usa texto da marca, sem logo inventada, e tokens provisórios centralizados.

## Documentação e continuidade

- [Estado real e próximos passos](docs/STATUS.md)
- [Especificação e aceitação](docs/specification.md)
- [Arquitetura e decisões](docs/architecture.md)
- [Riscos, compatibilidade e bloqueios](docs/risk-compatibility.md)
- [Referências EXM/Ultimate/WinSux e alternativas](docs/research/reference-tools.md)
- [Cobertura do catálogo e lacunas](docs/research/catalog-findings.md)
- [Como adicionar e promover registros](docs/catalog-contribution.md)
- [Dependências, manutenção e reversão desta etapa](docs/maintenance.md)

Não executar os textos do catálogo como scripts. Um candidato só poderá ser promovido após implementação própria, contrato completo, inventário, validação, testes de falha e restauração. Este projeto não estabelece licença pública para o código original do produto; referências e dependências preservam suas próprias licenças.
