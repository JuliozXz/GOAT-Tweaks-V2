# Inventário somente leitura e preparação nativa

Revisão: 23/10/2026. Coletor próprio `goat-hub-cim` 0.1.0, schema 1. Skills consultadas: `windows-telemetry-analysis`, sua referência `collection.md` e `tauri-testing`. Não foi incorporado código de terceiros nem instalada dependência.

## Decisão e limites

O primeiro adaptador usa PowerShell 5.1+ / CIM local. Alternativas: integração COM/WMI em Rust exigiria compilação nativa ainda indisponível; `Get-ComputerInfo` coleta dados excessivos; sensores LibreHardwareMonitor e PresentMon resolvem outras medições e acrescentariam runtimes/serviços. O adaptador atual produz JSON importável, com schema limitado; não há integração IPC implícita, serviço, execução automática de ajustes nem medição de sensores/FPS.

`scripts/inventory/Inventory.psm1` permite somente nove classes CIM e propriedades explicitamente selecionadas. `Get-CimInstance` sem `ComputerName`/`CimSession` usa WMI local via COM. Não abre sessão remota nem invoca métodos CIM. A seleção `-Property` pode trazer propriedades-chave adicionais do provedor: por isso o serializador copia somente a allowlist, sem exportar instâncias brutas. [Documentação oficial Get-CimInstance](https://learn.microsoft.com/en-us/powershell/module/cimcmdlets/get-ciminstance?view=powershell-7.5).

| Seção | Classe / recorte | Limitação relevante |
| --- | --- | --- |
| CPU | Win32_Processor | Cores e máximo informado pelo provedor; não é clock medido sob carga |
| RAM | Win32_PhysicalMemory | Capacidade e clock configurado; não prova estabilidade ou velocidade efetiva |
| GPU | Win32_VideoController | Identificação/driver; AdapterRAM omitido porque uint32 não representa corretamente capacidades modernas acima de 4 GiB |
| Placa-mãe | Win32_BaseBoard | Fabricante/modelo/versão; sem serial |
| BIOS | Win32_BIOS | Versão/data; não determina modo de boot UEFI nem configura firmware |
| Windows | Win32_OperatingSystem | Versão/build/arquitetura/memória; snapshot, não perfil temporal |
| Discos | Win32_DiskDrive | Modelo/interface/capacidade/estado informado; não é teste SMART nem diagnóstico de saúde |
| Rede | Win32_NetworkAdapter, PhysicalAdapter=TRUE | Modelo/tipo/velocidade nominal/estado; não mede banda, latência ou conectividade |
| Drivers | Win32_PnPSignedDriver, DISPLAY/NET/MEDIA | Recorte deliberado; não verifica assinatura criptograficamente nem identifica todos os drivers do sistema |

Zero de clock configurado representa desconhecido conforme [Win32_PhysicalMemory](https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-physicalmemory); é convertido em null. Zero de capacidade, cores, velocidade nominal e tipo SMBIOS também não vira observação útil. Já `FreePhysicalMemory=0` e `NetEnabled=false` são valores significativos preservados. `ConfiguredClockSpeed` mantém a unidade MHz declarada pela API, sem inferir frequência de barramento ou taxa DDR. As limitações de hardware não WDDM e os tipos GPU vêm da [documentação Win32_VideoController](https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-videocontroller). Memória visível/livre do SO usa KiB, conforme semântica da propriedade em [Win32_OperatingSystem](https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-operatingsystem).

Não são consultados/exportados serial, identificador PNP, UUID de máquina, nome de usuário/host, MAC, IP, caminhos de processo, listas de processos ou chaves de licença. Modelos/versões de hardware ainda identificam características do equipamento; trate o arquivo exportado como dado do atendimento e não publique automaticamente.

## Execução e contrato

Execute de um PowerShell normal, com pasta de destino já existente:

```powershell
.\scripts\inventory\Collect-Inventory.ps1 -OutputPath .\inventario-cliente.json
```

Não há `ExecutionPolicy Bypass`, alteração de política, instalação, `RunAs` ou elevação solicitada pelo script. Se a política da organização impedir scripts, siga o processo de assinatura/aprovação da organização; não desative a proteção. Um caminho existente é recusado sem sobrescrever. O exportador grava UTF-8 em temporário exclusivo no mesmo diretório e renomeia para o nome final; limpa somente seu próprio temporário se falhar. Não cria pastas e não modifica configuração do Windows. Após uso, a retenção/remoção do JSON fica a cargo do técnico.

Código de saída: 0 = arquivo exportado (pode conter resultados parciais); 1 = falha de execução/exportação; 2 = arquivo exportado, mas todas as consultas falharam. Verifique sempre os estados, não apenas o código. `OperationTimeoutSec` padrão 8, permitido 1–30, repassado em cada consulta. É timeout do provedor CIM, não um watchdog absoluto de todo o processo. Não há garantia de duração total, nem cancelamento de provedor travado; Ctrl+C interrompe a sessão. Esse limite deve ser resolvido por subprocesso controlado antes de integrar coleta automática ao aplicativo.

Schema 1:

```text
root = { schemaVersion: 1, collector: { name, version, powershellVersion }, collectedAt, sections[] }
section = { id, label, source, collectedAt, status, confidence, records[], error }
record = { index, fields[] }
field = { key, label, value, unit, status, confidence }
```

IDs fixos: `cpu`, `memory`, `gpu`, `baseboard`, `bios`, `os`, `storage`, `network`, `drivers`. Fonte e horário de **cada campo** são herdados explicitamente da sua seção, não do horário de importação. `collectedAt` de seção é o início da consulta, UTC ISO 8601; o horário raiz é o término da coleta. `reported` significa informado pelo provedor, não medido/confirmado independentemente. Confiança é `reported|unknown`; status de campo `reported|unavailable`; status de seção `available|partial|unavailable|error`. `unavailable` sem registros significa nenhuma instância retornada, não ausência comprovada de hardware. `partial` inclui campos faltantes ou truncamento de registros. Erros têm código estável `query-failed` e mensagem genérica sem expor mensagens privadas do provedor. Se uma consulta falha, as demais continuam.

Valor é string, número, boolean ou null. Strings limitadas a 256 caracteres e sem controles. Inteiros além de Number.MAX_SAFE_INTEGER viram strings decimais para evitar perda silenciosa no frontend. Cada seção limita a exportação a 128 registros; a consulta CIM em si pode retornar mais registros antes do limite. A lista de propriedades no módulo é a fonte normativa das chaves, com unidades explícitas. Datas nativas DateTime viram UTC ISO; datas que o provedor entrega como string permanecem informadas, sem inventar conversão.

## Verificações reais desta etapa

- Testes isolados sem hardware/rede ou Pester: 27 assertions em Windows PowerShell **5.1.19041.6456** e PowerShell **7.6.5**. Cobrem allowlist, privacidade, filtro, timeout, null/zero/false, capacidade de 64 bits, precisão JSON, falha isolada, fonte/tempo, limites de string/registros, round-trip, exportação e recusa de sobrescrita.
- A primeira coleta real no sandbox, token **não elevado**, retornou nove seções `error`. Consulta diagnóstica limitada confirmou `CimException`, `PermissionDenied`, HRESULT **0x80041003**; nenhuma informação de hardware foi inventada.
- Uma repetição autorizada pela revisão automática fora do sandbox consultou as nove classes: CPU 1, módulos RAM 2, GPU 1, placa-mãe 1, BIOS 1, Windows 1, discos 2, rede física 1, drivers selecionados 15. Todas as seções tiveram status `available`. Apenas estados/contagens foram exibidos; o inventário completo não foi persistido.
- **Limitação de validação:** a inspeção do token nessa repetição revelou `Elevated=true`, embora o comando não tenha usado RunAs nem solicitado administrador. Portanto, essa execução comprova acesso às classes no executor externo, mas **não comprova funcionamento de coleta em usuário normal fora do sandbox**. Não foi repetida coleta elevada. Ainda é necessário teste manual em terminal normal. O código não depende explicitamente de privilégios, mas permissões WMI variam por ambiente.
- Nenhum benchmark, ajuste, sensor, integração PresentMon, ACL Tauri, Rust/WebView2 ou assinatura foi validado por esses testes.

Frontend implementado em `src/domain/inventory.ts` e `src/components/InventoryPanel.tsx`: importação local manual, limite de 2 MiB, schema Zod estrito, nove seções únicas, allowlist de chaves/fontes, índices/estados coerentes e tipos escalares limitados. Dados ficam apenas na memória da sessão, com remoção explícita; erro de nova importação preserva o relatório anterior. Todas as strings são renderizadas como texto React. Fonte/horário herdados são apresentados junto às tabelas. O schema comprova estrutura, não autenticidade do arquivo.

As primeiras regras bloqueiam uso de relatório futuro (tolerância de cinco minutos) ou com mais de 24 horas para avaliar o estado atual. Windows e fabricante GPU informados permanecem `requires-evidence`/`unknown`; nenhum registro é aprovado para execução. Esses limites de idade são política inicial conservadora do produto, não evidência de que um snapshot recente ainda corresponda à máquina. Executor fica explicitamente bloqueado.

Validação adicional realizada: sete testes Vitest específicos de contrato/regras passaram; `pnpm typecheck` e Biome check dos três arquivos novos passaram. Um objeto produzido pelo módulo PowerShell, com consultas simuladas e exportação JSON real, foi lido pelo `parseInventory` TypeScript/Zod: nove seções e coletor 0.1.0 aceitos. O arquivo temporário foi removido. Essa interoperabilidade não utilizou hardware nem comprova integração IPC. O teste E2E do painel e regressões gerais pertencem à validação consolidada da etapa.

Comandos reproduzíveis de testes (sem coleta física):

```powershell
powershell.exe -NoProfile -File tests\powershell\inventory.tests.ps1
pwsh.exe -NoProfile -File tests\powershell\inventory.tests.ps1
```

## Toolchain nativa: auditoria e preparação manual

Nova inspeção somente leitura em 23/10/2026: `rustc`, `cargo`, `rustup`, `cl`, `link` e `vswhere` não encontrados no PATH. Não encontrados Rust/Cargo em `%USERPROFILE%\.cargo\bin`, `vswhere.exe` no Visual Studio Installer, diretório usual `C:\Program Files\Microsoft Visual Studio` ou `C:\Program Files (x86)\Windows Kits\10`. Isso não é varredura de todos os discos; toolchain personalizada continua possível. O bloqueio do marco anterior persiste nos caminhos examinados. `src-tauri/Cargo.toml` declara Rust mínimo **1.90**, tauri **=2.12.5**, tauri-build **=2.7.4**. Nenhuma instalação nem modificação global foi realizada.

Rota documentada para o responsável preparar uma máquina de build:

1. Pelo [site oficial Microsoft](https://visualstudio.microsoft.com/visual-cpp-build-tools/), baixar/revisar o instalador Build Tools e instalar a carga **Desktop development with C++**, incluindo toolset MSVC e Windows SDK correspondentes ao host/alvo. Essa instalação é deliberada e pode exigir administrador; não foi executada aqui. Os [pré-requisitos oficiais Tauri](https://v2.tauri.app/start/prerequisites/) confirmam C++ Build Tools e WebView2 no Windows.
2. Pelo [instalador oficial Rust](https://rust-lang.org/tools/install/), escolher a arquitetura correta e toolchain MSVC. Registrar a versão concreta instalada; exigir `rustc >=1.90`, sem inventar uma versão estável atual nem mudar o mínimo do projeto. Não usar curl/irm seguido de execução remota. Não habilitar GNU como substituição silenciosa ao alvo MSVC.
3. Verificar WebView2 existente; o marco anterior detectou 155.0.4283.62, mas isso não foi revalidado nesta subetapa. Instalar o runtime oficial apenas se estiver ausente. Não habilitar VBScript preventivamente: a documentação o relaciona a empacotamento MSI, que não é necessário para `--no-bundle`.
4. Em novo terminal de desenvolvimento, conferir `rustc -Vv`, `cargo -V`, `rustup show active-toolchain`; verificar MSVC/SDK com Visual Studio Installer/vswhere. CLI no PATH não prova que linker e SDK estejam corretos; a compilação seguinte é obrigatória.
5. Na raiz, executar instalação frontend reproduzível conforme política existente (`pnpm install --frozen-lockfile --ignore-scripts`), então `cargo generate-lockfile --manifest-path src-tauri/Cargo.toml`. Revisar versões, fontes, licenças e advisories das dependências resolvidas antes de promover o lockfile. Esse comando acessa registry e escreve Cargo.lock; ainda não foi executado sem Cargo.
6. Executar `cargo check --manifest-path src-tauri/Cargo.toml --locked`, `cargo test --manifest-path src-tauri/Cargo.toml --locked`, `pnpm tauri build --no-bundle`. Guardar saídas/falhas reais. Abrir o executável como usuário normal e validar janela, recursos e encerramento. Só depois tratar instalador/assinatura e testes WebDriver nativos.

Alternativa: usar máquina Windows de build já preparada com mesma arquitetura e checkout/lockfiles revisados. Artefato vindo dessa máquina requer origem/hash e teste no destino. Build web não substitui build nativo. Não alterar configurações globais da máquina de atendimento apenas para contornar a ausência de toolchain.
