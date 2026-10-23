# GOAT HUB Service — riscos, compatibilidade e evidências

Revisão: 23/10/2026. Esta matriz define controles e limitações. Ela não constitui pentest, validação nativa ou autorização para alterar o Windows. A auditoria de ambiente descrita abaixo foi somente leitura.

## Evidência do ambiente inicial

| Item | Observação realizada | Limite da conclusão |
| --- | --- | --- |
| Workspace | Inicialmente apenas `AGENTS.md`, `.agents` e `skill-audit-2026-10-23` | Não havia aplicação/manifests/lockfiles identificados |
| Sistema | `RuntimeInformation.OSDescription`: Microsoft Windows 10.0.19045; arquitetura X64 | Edição, revisão acumulativa, estado ESU e suporte contratado não foram identificados |
| Node | `node --version`: 24.22.1 | Runtime disponibilizado pelo Codex, não instalação global confirmada |
| pnpm | `pnpm --version`: 11.25.0 | Shim do runtime Codex; compatibilidade das dependências depende do install/build |
| Git | `git --version`: 2.53.0.windows.3 | Ferramenta disponível; workspace inicialmente sem checkout Git identificado |
| PowerShell | 7.6.5 | Nenhum script de otimização executado |
| Rust | `rustc`, `cargo` e `rustup` não encontrados no PATH; `.cargo/bin/rustc.exe` e `cargo.exe` não encontrados no caminho usual do usuário | Não foi feita busca em todos os discos; não afirmar ausência global absoluta |
| MSVC/SDK | `cl` e `link` não encontrados; `VS Installer/vswhere.exe` e `Windows Kits/10` ausentes nos caminhos usuais | Bloqueia a validação nativa nesta sessão até uma instalação válida ser localizada/preparada |
| WebView2 | Diretório `C:\Program Files (x86)\Microsoft\EdgeWebView\Application\155.0.4283.62` encontrado | Presença do diretório não comprova registro, integridade ou lançamento; runtime não foi iniciado nesta auditoria |
| .NET | `dotnet` não encontrado no PATH | Não instalar runtime para eventual sensor antes de selecionar a integração |
| WPR | `C:\Windows\system32\wpr.exe` encontrado | Nenhuma captura iniciada; disponibilidade de provider/permissão não testada |
| WebDriver | `tauri-driver` e `msedgedriver` não encontrados no PATH | Há rota alternativa embedded; toda validação nativa depende primeiro do binário Tauri |

Os pré-requisitos oficiais Windows são Rust com target MSVC, ferramentas C++ e WebView2. A instalação de build tools/SDK não foi realizada como efeito colateral. Fonte: [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/). Para continuar a validação nativa, localizar ou instalar deliberadamente esses componentes oficiais, registrar versões e executar os testes do projeto; não mudar PATH global, políticas ou proteções para contornar falhas.

Windows 10 22H2 exige distinguir execução técnica de suporte de segurança: o ciclo regular terminou em 14/10/2025; elegibilidade/adesão ESU precisam de verificação específica. A Microsoft informa continuidade de atualizações de Edge/WebView2 no Windows 10 22H2 até pelo menos outubro de 2028. Isso não comprova atualização do host nem substitui suporte do sistema. Fontes: [Windows 10 release information](https://learn.microsoft.com/en-us/windows/release-health/release-information) e [Edge supported operating systems](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-supported-operating-systems). Nenhuma atualização ou política foi alterada.

## Política de compatibilidade

O alvo inicial de engenharia é Windows x64, com Windows 11 como matriz principal futura e Windows 10 22H2 como cenário explícito de compatibilidade a validar. Nenhuma combinação de SO/CPU/GPU foi certificada neste marco. ARM64, versões antigas, VMs, acesso remoto, notebooks híbridos e drivers de fabricantes diferentes exigem testes próprios. Não traduzir a faixa suportada pelo Tauri em suporte automaticamente demonstrado pelo GOAT HUB.

| Estado | Significado operacional | Pode executar ajuste? |
| --- | --- | --- |
| Confirmado | Evidência suficiente satisfaz requisitos da implementação e da versão do registro | Somente após outras condições, autorização e verificações |
| Provável | Fonte parcial sugere suporte, mas falta confirmação | Não enquanto faltar requisito de segurança |
| Incompatível | Um requisito obrigatório falha | Não |
| Requer verificação | Depende de inspeção, fonte adicional ou ferramenta | Não automaticamente |
| Desconhecido | Não houve dados suficientes | Não; oferecer diagnóstico/consulta |

Evidência científica, disponibilidade da implementação, confiança da observação e compatibilidade são campos distintos. Um ajuste pode estar bem documentado e não implementado. Um sensor pode estar indisponível mesmo com hardware saudável. Zero é um valor, não um substituto para desconhecido. A classificação Basic/General/Advanced não sobrepõe risco ou autorização.

## Matriz de riscos

| Risco | Impacto plausível | Controle exigido | Evidência antes de liberar |
| --- | --- | --- | --- |
| Comando arbitrário vindo da UI/catálogo | Execução indevida com acesso ao usuário/sistema | Lista fechada de operações, parâmetros tipados, nenhum script remoto ou shell livre | Testes de payload inválido, IDs inexistentes e rejeição de campos extras relevantes |
| ACL incompleta em comandos Tauri próprios | Webview inesperada alcança função nativa | AppManifest, capability por janela, validação Rust e controle de origem | Teste nativo positivo e negativo; inspeção de build/capabilities sozinha é insuficiente |
| Conteúdo remoto, XSS ou links importados | Acesso indevido a IPC, exfiltração | CSP explícita, texto seguro, protocolos/origens permitidos, sem autoridade para páginas externas | Testes de entradas hostis e navegação no runtime |
| Catálogo editado ou atualização silenciosa | Substituição de operação/evidência em atendimento | Versão, hash, revisão, histórico e ausência de execução no carregamento | Importação inválida rejeitada; registro antigo continua interpretável |
| Compatibilidade calculada com inventário antigo | Aplicação em dispositivo/driver diferente | Observações com validade, fingerprint mínimo e revalidação antes da ação | Teste de mudança do inventário entre plano e execução |
| Clique duplo, retry ou retomada após crash | Aplicação duplicada de ação não idempotente | ID de operação e transição persistida atômica | Testes concorrentes e de reinício em cada fronteira crítica |
| Rollback sobre estado alterado externamente | Apaga mudança legítima feita por outro aplicativo/técnico | Comparar estado atual ao último aplicado; parar na divergência | Falha intencional e revisão manual demonstradas |
| Cancelamento tardio | Estado parcial ou corrupção | Pontos seguros, fase não cancelável explícita, timeout com resultado indeterminado | Fault injection em adaptador isolado e recuperação |
| Elevação permanente | Aumento da superfície de ataque | Processo normal; broker futuro mínimo e sob demanda | Modelo de ameaça, autenticação IPC e testes antes de distribuir |
| Drivers/sensores de kernel | Vulnerabilidade, BSOD ou bloqueio por anticheat | Nenhum driver na fundação; proveniência/licença/assinatura e suporte verificados | Integração aprovada em ambiente controlado, com remoção e recuperação |
| Firmware, tensão, OC e memória | Instabilidade, perda de boot ou dano | Orientação específica; sem receita universal ou lote automático | Documentação por modelo, consentimento e recuperação fora da máquina de produção |
| Desativação de proteções | Exposição do cliente | Não recomendar Defender/firewall/VBS/HVCI/TPM/Secure Boot desativados genericamente | Evidência de cenário e operação separada, se algum caso futuro for aprovado |
| Rede/driver em atendimento remoto | Perda de sessão/conectividade | Identificar dependência e preparar recuperação antes da ação | Teste controlado e confirmação contextual |
| Limpeza de arquivos | Perda de dados e histórico | Manifesto de propriedade do próprio aplicativo, prévia e retenção | Testes de path traversal/symlink/arquivo não pertencente; nenhum wildcard destrutivo |
| Dados pessoais nos logs/exportação | Divulgação sem consentimento | Minimização, redaction e destino escolhido | Testes de serialização, exportação e ausência de segredos |
| Ganho medido incorretamente | Recomendação falsa ou prejudicial | Cenários equivalentes, repetições, variabilidade e resultados inconclusivos | Artefatos brutos e metodologia reproduzível, nunca números aleatórios |
| Plugin de teste distribuído em release | Interface de depuração com acesso ao backend | Dependência/feature de teste isolada e removida da release | Inspeção do binário/manifest release e ausência do servidor |
| Dependência comprometida/incompatível | Código malicioso ou build quebrado | Lockfile, revisão de scripts, licença, advisories e origem; atualizações deliberadas | Install/build/auditoria da versão fixa registrados |
| Armazenamento visual tratado como auditoria | Histórico facilmente perdido/manipulado | Preferências separadas de transações do backend | Recuperação e migrations antes de habilitar execução |

Os controles acima são requisitos de liberação, não uma lista de proteções já verificadas no aplicativo. A fundação reduz a exposição ao não oferecer operações de mutação do Windows; isso não dispensa a futura revisão das funções nativas.

## Cobertura de plataforma por módulo

| Área | Fonte/interface candidata | Limite a preservar |
| --- | --- | --- |
| CPU/RAM | APIs Windows, contadores, WMI/CIM conforme campo | Uso, comprometimento e capacidade não medem temperatura nem comprovam gargalo isoladamente |
| GPU/VRAM | DXGI e APIs de fabricante com versão auditada | Memória de processo não equivale a VRAM total ou consumo de outro jogo; GPU híbrida exige identificação |
| Energia | APIs/powercfg documentados | Leitura antes de escrita; plano mais agressivo não é ganho universal |
| Discos | APIs Windows/SMART quando exposto | Ausência de atributo não significa saúde; evitar operações destrutivas |
| Rede | Interfaces/contadores e teste com destino explícito | Ping não é latência de input; resultados dependem de caminho e servidor |
| Input/áudio/periféricos | APIs por classe/dispositivo | Polling e processamento não medem latência física completa |
| BIOS/firmware | SMBIOS, informação detectável e manual do modelo | Não prometer escrita universal de firmware por Windows |
| Frames | PresentMon, integração a selecionar | Apresentação não equivale a fótons na tela; suporte/permissões/limitações por API devem aparecer |
| Sensores | APIs de fabricante/LibreHardwareMonitor após auditoria | Dependência, licença, runtime, driver e permissões não presumidos |
| UI | React/Vite em navegador; depois WebView2 real | Browser tests não validam IPC, pacote, DPI ou janela nativa |

Essas interfaces são candidatas arquiteturais, não integrações instaladas. Detalhes técnicos e fontes por ajuste devem ficar no catálogo de pesquisa correspondente. As skills existentes em `.agents/skills/windows-telemetry-analysis` ajudam a revisar a metodologia, mas não fornecem um coletor executável.

## Bloqueios e próximos passos verificáveis

1. **Build Rust/Tauri:** ferramentas não encontradas no PATH e caminhos usuais. Preparar toolchain oficial, registrar versões, compilar e testar comandos/ACL. Não afirmar que o código Rust compila antes desse resultado.
2. **Validação nativa:** precisa de binário real e rota WebDriver auditada. A documentação atual admite `@wdio/tauri-service` embedded; a rota direta exige `tauri-driver` e Edge compatível. Não incluir endpoints de teste na release. [Fonte oficial](https://v2.tauri.app/develop/tests/webdriver/).
3. **Inventário e telemetria:** fontes/versões/campos/permissões ainda precisam de integração real; mostrar indisponível no frontend até coletar. Não reutilizar dados de fixture como estado atual do cliente.
4. **Execução/rollback:** intencionalmente fora da fundação. Necessita persistência transacional, testes de falha, confirmação específica e validação em ambiente controlado.
5. **DPI/instalador/assinatura:** não comprovados com testes web; requerem hardware/runtime/pacote e identidade de assinatura apropriados. Não gerar sucesso substituto.
6. **Catálogo completo:** cada categoria precisa de pesquisa, evidência e metadados próprios. Um registro manual/recomendação não conta como ajuste automático implementado ou teste de ganho.

## Evidência que deve acompanhar cada entrega

Registrar comando, versão, instante, exit code, relatório/artefato, escopo e resultado. Distinguir **executado e aprovado**, **executado e falhou**, **não executado**, **bloqueado pelo ambiente** e **fora da fase**. Os arquivos de testes existentes não comprovam execução. Imagens e dados de demonstração precisam de identificação explícita. Avaliações de risco são hipóteses até haver falha reproduzida ou teste do controle.

Antes de atualizar dependências, revisar changelog, breaking changes, advisories, scripts e licença; comparar lockfiles e executar checks pertinentes. Antes de promover uma otimização, rever fonte, versão/plataforma, mecanismo, reversão e método de medição. Não atualizar tudo automaticamente nem aplicar otimizações do catálogo no computador de desenvolvimento.
