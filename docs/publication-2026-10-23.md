# Publicação e validação por clonagem

Data: 23/10/2026. O proprietário autorizou explicitamente publicar o projeto em [JuliozXz/GOAT-Tweaks-V2](https://github.com/JuliozXz/GOAT-Tweaks-V2). Branch: `main`. Repositório público preexistente, inicialmente vazio. Nenhuma release foi criada.

## Conteúdo e transporte

Foram publicados 409 arquivos de fontes, configuração, dependências fixadas, testes, documentação, ícone técnico e avisos de licença antes deste relatório. A conta conectada e as permissões foram conferidas. O Git do terminal não possuía credenciais para push; o envio foi concluído pela conexão GitHub autenticada do chat. Leituras públicas, fetch e clone funcionaram pelo Git do terminal. Esses são mecanismos de autenticação separados.

O commit local de preparação usou noreply. Os commits remotos da API usam os metadados da conta GitHub conectada, conforme sua configuração; o conector não expôs parâmetros de autoria. Nenhuma configuração global de Git foi modificada. O commit local original foi preservado numa branch local de segurança; o checkout foi alinhado ao remoto somente após comparar árvores idênticas, sem sobrescrever arquivos de trabalho.

Caches, node_modules, builds, auditoria local, inventários de cliente, certificados/chaves e arquivos .env ficaram fora da seleção. Treze skills com licença/proveniência acompanham as fontes. A skill Vercel React foi preservada apenas localmente por aviso integral de licença ainda não localizado. A revisão estática e a busca limitada de credenciais não constituem garantia absoluta de ausência de segredos.

## Commits verificados

- Fontes completas: `b470a6d7ae687a188c157fedafdd2b6eef54e488`.
- Árvore comparada com o Git local: `64d258d6a6e7df16234d1ec78e46ca484e3d0e7a`, idêntica antes da atualização de documentação/quebras de linha.
- Versão clonada e validada após a correção: `40be2e7e8b2a93c31a89237f2f7cf41034ccfc8a`.

O relatório e as instruções finais são uma atualização de documentação posterior a esses commits; não alteram a aplicação testada.

## Testes no clone real

Git clone executado pela URL HTTPS pública para uma pasta nova com espaços, sem copiar node_modules. Node 24.22.1 e pnpm 11.25.0 disponíveis no PATH do ambiente de teste.

| Verificação | Resultado |
| --- | --- |
| pnpm install --frozen-lockfile --ignore-scripts | Passou; 56 pacotes baixados, zero reutilizados, store/cache próprios |
| typecheck, lint, format:check | Passaram |
| Vitest | 20 testes / 4 arquivos passaram |
| Build Vite | Passou; artefatos web gerados |
| Iniciador PowerShell 5.1 | 14 assertions passaram, incluindo HTTP real, módulo de entrada, bloqueio da pasta privada, duplicação, colisão de porta e liberação |
| Coletor isolado PowerShell 5.1 | 27 assertions passaram, com consultas simuladas; nenhuma nova coleta de hardware |
| Desktop -Check | Bloqueio esperado confirmado: Cargo/rustc/MSVC/SDK ausentes |
| Workflow GitHub | API pública retornou state=active para .github/workflows/windows.yml |

A primeira clonagem revelou conversão automática para CRLF em TypeScript/CSS, reprovando a formatação. `.gitattributes` foi corrigido para LF por padrão e CRLF somente em PowerShell. Uma segunda clonagem nova passou pelo procedimento completo sem alterar configurações globais ou dispensar checks.

Os 14 E2E já aprovados antes da publicação não foram reexecutados neste clone; o código da aplicação permaneceu igual. Os testes desta tabela não validam outro computador, execução Rust, WebView2, instalação NSIS ou um atendimento real.

## Uso imediato e limites

Com Git, Node 24 e pnpm 11.25.0 instalados:

```powershell
git clone https://github.com/JuliozXz/GOAT-Tweaks-V2.git
Set-Location .\GOAT-Tweaks-V2
pnpm.cmd install --frozen-lockfile --ignore-scripts
if ($LASTEXITCODE -ne 0) { throw 'Falha nas dependencias' }
.\GOAT-HUB.ps1 -Mode Web
```

Abrir `http://127.0.0.1:1420`; manter o terminal aberto; Ctrl+C para encerrar. Esse é o frontend de desenvolvimento no navegador. Para desktop nativo, seguir [windows-setup.md](windows-setup.md), preparar toolchain, gerar/revisar Cargo.lock, compilar e testar. Nenhum binário/instalador nativo ou ganho de desempenho foi certificado nesta publicação.

O workflow pode ser iniciado manualmente pelo proprietário em Actions, com bootstrap_cargo_lock na primeira resolução. Não foi disparado nesta entrega. Antes de adotar o lock candidato ou distribuir um instalador, revisar dependências e executar os testes nativos documentados.
