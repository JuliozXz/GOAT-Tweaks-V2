# Catálogo pesquisado — primeiro marco

Revisão: 23/10/2026. Escopo: pesquisa editorial e critérios de validação; nenhum ajuste do Windows, firmware, driver ou jogo foi aplicado nesta tarefa.

O arquivo [catalog.json](../../src/data/catalog.json) contém **41 registros originais em 18 categorias**: **17 orientações manuais**, **12 integrações pendentes**, **6 pesquisas** e **6 propostas rejeitadas**. Há **49 URLs primárias**. Essas contagens representam registros pesquisados, não recursos executáveis nem compatibilidade confirmada. Não houve benchmark de hardware, captura de jogo, teste de sensor, teste de estabilidade, instalação de coletor ou comprovação de ganho.

## Evidência e estado

| Classe | Significado no catálogo | Registros |
| --- | --- | ---: |
| 1 | Benefício reproduzido no hardware alvo | 0 |
| 2 | Mecanismo documentado, resultado condicional | 12 |
| 3 | Diagnóstico, prevenção ou correção; sem promessa de FPS | 20 |
| 4 | Experimento ainda sem evidência suficiente | 3 |
| 5 | Proposta genérica rejeitada | 6 |

Classe de evidência e estado de implementação são eixos diferentes. Os experimentos são AMD PBO/Curve Optimizer, controles Intel XTU e comparação HAGS. EPP, RSS/moderação e buffers de áudio também continuam em pesquisa, apesar de mecanismo documentado. `manual` significa orientação sujeita a requisitos e revisão, não aprovação de execução. `integration-pending` não significa que a ferramenta esteja instalada. Todos os campos `validation` descrevem verificações futuras, **não testes já realizados**.

O schema deste marco é um índice editorial tipado. Antes de habilitar um executor, cada candidato precisa migrar para o contrato completo com versão de implementação, detecção, parâmetros validados, estado anterior/desejado, permissões, conflitos, reinício, operações exatas, falhas e recuperação. O catálogo atual não deve ser executado por interpretação livre de seus textos.

## Cobertura real

Abaixo, B/G/A significam Basic/General/Advanced. As colunas aprovadas, implementadas e testadas se referem a **execução de uma otimização no GOAT HUB**, não a aprovação editorial do texto. Nenhuma categoria está concluída. Níveis sem candidatos permanecem vazios por falta de pesquisa/validação suficiente; não devem receber registros artificiais.

| Categoria | B | G | A | Pesquisados | Aprovados para execução | Implementados | Testados em hardware | Rejeitados | Pendentes não rejeitados |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| CPU | 1 | 1 | 2 | 4 | 0 | 0 | 0 | 0 | 4 |
| RAM | 1 | 0 | 2 | 3 | 0 | 0 | 0 | 1 | 2 |
| Placa de vídeo | 0 | 2 | 1 | 3 | 0 | 0 | 0 | 0 | 3 |
| Armazenamento | 1 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 2 |
| Input | 1 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 2 |
| Latência | 0 | 0 | 2 | 2 | 0 | 0 | 0 | 1 | 1 |
| Rede | 1 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 2 |
| Windows | 1 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 2 |
| BIOS | 0 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 2 |
| Energia | 1 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 2 |
| Drivers | 1 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 2 |
| Processos e serviços | 0 | 1 | 1 | 2 | 0 | 0 | 0 | 1 | 1 |
| Jogos e aplicativos | 1 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 2 |
| Periféricos | 1 | 0 | 1 | 2 | 0 | 0 | 0 | 1 | 1 |
| Áudio | 1 | 0 | 1 | 2 | 0 | 0 | 0 | 0 | 2 |
| Segurança | 1 | 0 | 2 | 3 | 0 | 0 | 0 | 1 | 2 |
| Manutenção | 1 | 0 | 1 | 2 | 0 | 0 | 0 | 1 | 1 |
| Diagnóstico e reparação | 1 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 2 |

## Decisões que orientam implementação

- Começar por inventário e diagnóstico de leitura, com estados indisponível, desconhecido e erro separados. Metadados ou simples presença de uma CPU/GPU não confirmam suporte a uma operação.
- Preferir configurações documentadas por dispositivo/aplicativo a presets genéricos. Não desligar paginação, suspensão USB, proteções ou usar prioridade Realtime como promessa de FPS.
- Não tratar disponibilidade de um controle como garantia de benefício. Comparar estabilidade, consumo, temperatura e distribuição temporal dos frames, além de médias.
- Critérios de recuperação fazem parte da elegibilidade. TRIM, remoção de arquivos, reparo de componentes e firmware não têm um “desfazer” universal; a interface deve dizer isso antes de qualquer aprovação.
- Nenhum resultado de marketing foi convertido em ganho previsto para este computador. Notas de benchmark de fabricante são cenários específicos, sem replicação local.

Há uma divergência relevante em [instruções AMD de instalação de chipset](https://www.amd.com/en/resources/support-articles/faqs/CHIPSET-INSTALL.html): a página sugere desativação temporária de antivírus. O GOAT HUB **não adota essa instrução**. Um conflito de instalação exige diagnóstico, assinatura e caminho suportado, preservando as proteções. Esse exemplo demonstra por que fontes oficiais também precisam de avaliação contextual.

## PresentMon e interfaces de sensores

O [PresentMon](https://github.com/GameTechDev/PresentMon) é software de coleta/análise, não skill. Referência fixa: `9db97248df5322a0aa1581d9141d1de6b058085b`, auditada em 23/10/2026. A licença principal é MIT e exige preservação de aviso; os componentes adicionais têm termos em `THIRD_PARTY.txt`. Não há binário incorporado ou release de produção selecionada.

Foram relidos o snapshot local da [licença](../../skill-audit-2026-10-23/sources/GameTechDev__PresentMon/files/LICENSE.txt), [README principal](../../skill-audit-2026-10-23/sources/GameTechDev__PresentMon/files/README.md), [serviço](../../skill-audit-2026-10-23/sources/GameTechDev__PresentMon/files/README-Service.md), trechos do [console](../../skill-audit-2026-10-23/sources/GameTechDev__PresentMon/files/README-ConsoleApplication.md) e o início dos avisos de terceiros. A origem e os hashes constam de [audit.json](../../skill-audit-2026-10-23/sources/GameTechDev__PresentMon/audit.json).

As opções futuras são importação de CSV, aplicação de console com execução delimitada, biblioteca de análise ETW ou API C do serviço. A importação offline evita instalar um serviço no primeiro marco. Na rota do serviço, desde 2.3.1 a documentação orienta carregar a DLL instalada pelo próprio serviço; uma cópia arbitrária não garante compatibilidade. Reinício do serviço invalida a sessão, exigindo tratamento explícito pelo cliente. Ver [README-Service.md no commit](https://github.com/GameTechDev/PresentMon/blob/9db97248df5322a0aa1581d9141d1de6b058085b/README-Service.md).

Captura depende de permissões ETW; não modificar grupos nem elevar a UI automaticamente. O snapshot registra instrumentação reduzida em caminhos OpenGL/Vulkan classificados como Runtime Other e limitações de precisão de execução da GPU com HAGS. Não desligar HAGS como efeito colateral do coletor. Separar quadros apresentados, exibidos e gerados; medição física de input depende de instrumentação adicional e não pode ser inferida de FPS. Ver [README no commit](https://github.com/GameTechDev/PresentMon/blob/9db97248df5322a0aa1581d9141d1de6b058085b/README.md).

Para sensores, manter adaptadores por API e suporte por métrica: [NVML](https://docs.nvidia.com/deploy/nvml-api/latest/api/group__nvmlDeviceQueries.html) para consultas NVIDIA, [ADLX](https://gpuopen.com/manuals/adlx/adlx-sdk-references/adlx-interfaces/performance-monitoring/iadlxgpumetricssupport/) para suporte AMD e [DXGI](https://learn.microsoft.com/en-us/windows/win32/api/dxgi1_4/ns-dxgi1_4-dxgi_query_video_memory_info) para informações cujo escopo seja corretamente identificado. Adoção exige revisão separada da licença SDK/redistribuição e da versão. Não foi instalado nem testado nenhum SDK nesta etapa.

## Limitações da pesquisa

As URLs do catálogo retornaram conteúdo por busca ou abertura na ferramenta web em 23/10/2026. Isso verifica sua existência e conteúdo disponível, não a disponibilidade permanente nem a compatibilidade com o hardware alvo. Algumas páginas de arquitetura são antigas e continuam úteis para explicar o mecanismo, mas não certificam listas atuais de dispositivos. Páginas dinâmicas não foram arquivadas integralmente nesta tarefa.

A abertura web dos arquivos PresentMon no SHA fixo retornou “Cache miss”; a página principal abriu e os arquivos versionados foram consultados do snapshot local já auditado. Não declarar que esses endpoints fixos foram baixados novamente com sucesso. Uma URL antiga sobre política Microsoft de limpadores de registro também falhou; ela **não foi usada como evidência**. A rejeição de limpeza genérica é uma decisão do catálogo apoiada na falta de parâmetro/benefício específico e no risco documentado de edição incorreta.

A versão documentada do [Process Explorer](https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer) era **17.2, publicada em 15/10/2026**, com Windows 11 ou superior na lista de clientes suportados. Não instalar uma versão antiga para forçar suporte e não extrapolar a compatibilidade para Windows 10. Nenhum utilitário externo foi redistribuído. Textos do catálogo foram escritos originalmente a partir das referências, sem copiar código ou scripts.

## Próximas investigações por categoria

| Categoria | Lacuna e próxima ação |
| --- | --- |
| CPU | Sensores térmicos/energéticos por família, políticas híbridas Intel, chipset e cenários AMD X3D; validar contadores e telemetria sincronizada. |
| RAM | Inventário de módulos/canais e testes de estabilidade; não inferir canais apenas pelo número de DIMMs. Auditar ferramenta e hardware reais. |
| Placa de vídeo | Adaptadores NVML/ADLX, perfis AMD por jogo, VRR e shader cache; consultar suporte por métrica e licença da versão escolhida. |
| Armazenamento | Controladores RAID/USB e diagnóstico específico do fabricante; validar campos ausentes e evitar teste de escrita em dados do cliente. |
| Input | Teclados e controles, USB/Bluetooth e medição física de latência; não tratar frequência de eventos da UI como polling do dispositivo. |
| Latência | Tracing e sincronização com quadro/sensores; falta captura controlada que permita atribuição causal e medições físicas de input. |
| Rede | Diagnóstico de Wi-Fi, driver OEM, saturação e QoS do roteador; exige rede de teste e documentação do modelo. |
| Windows | Game Mode, atualizações e tarefas específicas; revisar build alvo antes de adaptar configurações e políticas. |
| BIOS | Manuais e release notes por placa/revisão; nenhuma lista universal de tensões, timings, C-States ou parâmetros PCIe. |
| Energia | Comparação de eficiência térmica e repouso por notebook; energia medida precisa de origem explícita, sem inferência a partir de utilização. |
| Drivers | Catálogo de pacotes por hardware ID e versões; validar assinatura e rollback disponível antes de implementar instalação. |
| Processos e serviços | Mapeamento de dependências de serviços e QoS; não importar listas universais de serviços desabilitados. |
| Jogos e aplicativos | Adaptadores para outros launchers, perfis específicos e manifestos versionados; validar atualizações e anticheat sem injeção. |
| Periféricos | Firmware de mouse/controle, transportes e compatibilidade de monitor; aquisição de hardware para testes físicos. |
| Áudio | Dispositivos Bluetooth/USB e captura de roundtrip; não fixar sample rate ou buffer universal. |
| Segurança | Inventário seguro sem alteração de proteções; validar estados solicitado/em execução e políticas corporativas. |
| Manutenção | Retenção e backup verificável por atendimento; exclusão definitiva requer consentimento e escopo de arquivos. |
| Diagnóstico e reparação | Leitura estruturada de logs, falhas de API e condições de reparo; validar em VM controlada antes de oferecer execução. |

## Validação executada nesta entrega

Um script Node local em memória leu e fez parse do JSON, conferiu campos exigidos, tipos, arrays não vazios, IDs em kebab-case sem duplicação, enums, data e URLs HTTPS. Confirmou invariantes: classe 5 somente rejeitada; classe 4 somente pesquisa. Resultado: **PASS; 41 registros, 41 IDs únicos, 18 categorias, 49 fontes distintas**. Essa é validação estática de conteúdo; não comprova funcionamento de qualquer otimização, coletor, driver, fonte remota em tempo de execução ou interface nativa.

Não houve comandos de alteração do sistema, benchmark de hardware, medição de FPS, testes de reversão ou instalação de ferramentas. Esses valores permanecem zero na matriz. Testes de UI e domínio da aplicação são relatados separadamente pelo responsável pelo marco.

## Fontes primárias do catálogo

Os links também ficam junto de cada registro e devem ser revisados antes de sua implementação ou atualização. Documentação oficial não concede automaticamente direito de redistribuir SDKs, imagens, firmware ou instaladores.

- [Microsoft — CPU Analysis](https://learn.microsoft.com/en-us/windows-hardware/test/wpt/cpu-analysis)
- [Microsoft — PerfEnergyPreference](https://learn.microsoft.com/en-us/windows-hardware/customize/power-settings/options-for-perf-state-engine-perfenergypreference)
- [Microsoft — Processor power management](https://learn.microsoft.com/en-us/windows-hardware/customize/power-settings/configure-processor-power-management-options)
- [AMD — Ryzen Master](https://www.amd.com/en/products/software/ryzen-master.html)
- [Intel — requisitos do XTU](https://www.intel.com/content/www/us/en/support/articles/000006636/processors/processor-utilities-and-programs.html)
- [Microsoft — dimensionamento do arquivo de paginação](https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/how-to-determine-the-appropriate-page-file-size-for-64-bit-versions-of-windows)
- [Intel — Extreme Memory Profile](https://www.intel.com/content/www/us/en/gaming/extreme-memory-profile-xmp.html?wapkw=XMP)
- [AMD — EXPO](https://www.amd.com/en/products/processors/technologies/expo.html)
- [NVIDIA — Reflex e latência do sistema](https://www.nvidia.com/en-gb/geforce/guides/system-latency-optimization-guide/)
- [NVIDIA — produtos compatíveis com Reflex](https://www.nvidia.com/en-us/geforce/technologies/reflex/supported-products/)
- [Microsoft DirectX — Hardware Accelerated GPU Scheduling](https://devblogs.microsoft.com/directx/hardware-accelerated-gpu-scheduling/)
- [Microsoft DirectX — opções gráficas do Windows](https://devblogs.microsoft.com/directx/navigating-the-redesigned-graphics-settings-page/)
- [Intel GameTechDev — PresentMon](https://github.com/GameTechDev/PresentMon)
- [NVIDIA — NVML Device Queries](https://docs.nvidia.com/deploy/nvml-api/latest/api/group__nvmlDeviceQueries.html)
- [AMD GPUOpen — IADLXGPUMetricsSupport](https://gpuopen.com/manuals/adlx/adlx-sdk-references/adlx-interfaces/performance-monitoring/iadlxgpumetricssupport/)
- [Microsoft — DXGI_QUERY_VIDEO_MEMORY_INFO](https://learn.microsoft.com/en-us/windows/win32/api/dxgi1_4/ns-dxgi1_4-dxgi_query_video_memory_info)
- [Microsoft — MSFT_StorageReliabilityCounter](https://learn.microsoft.com/en-us/windows-hardware/drivers/storage/msft-storagereliabilitycounter)
- [Microsoft — Optimize-Volume](https://learn.microsoft.com/en-us/powershell/module/storage/optimize-volume?view=windowsserver2025-ps)
- [Microsoft — RAWMOUSE](https://learn.microsoft.com/en-us/windows/win32/api/winuser/ns-winuser-rawmouse)
- [Razer — quedas de desempenho com polling elevado](https://mysupport.razer.com/app/answers/detail/a_id/14640/kw/Which%20games%20are%20supported)
- [Microsoft — eventos DPC e ISR](https://learn.microsoft.com/en-us/windows/desktop/ETW/dpc)
- [Microsoft — timeBeginPeriod](https://learn.microsoft.com/en-us/windows/win32/api/timeapi/nf-timeapi-timebeginperiod)
- [Microsoft — pathping](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/pathping)
- [Microsoft — configuração de processadores RSS](https://learn.microsoft.com/en-us/windows-hardware/drivers/network/setting-the-number-of-rss-processors)
- [Microsoft — Interrupt moderation](https://learn.microsoft.com/en-us/windows-hardware/drivers/network/interrupt-moderation)
- [Microsoft — aplicativos de inicialização](https://support.microsoft.com/en-US/Windows/Experience/Startup-Boot/configure-startup-applications-in-windows)
- [Microsoft — otimizações para jogos em janela](https://support.microsoft.com/en-us/windows/hardware/display-graphics/optimizations-for-windowed-games-in-windows-11)
- [NVIDIA — requisitos e limites de Resizable BAR na RTX 30](https://www.nvidia.com/en-gb/geforce/news/geforce-rtx-30-series-resizable-bar-support/)
- [ASUS — atualização e possibilidade de downgrade de BIOS](https://www.asus.com/in/support/faq/1044348/)
- [Microsoft — BitLocker FAQ e firmware](https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/faq)
- [Microsoft — modo de energia](https://support.microsoft.com/en-us/windows/change-the-power-mode-for-your-windows-pc-c2aff038-22c9-f46d-5ca0-78696fdf2de8)
- [Microsoft — opções do powercfg](https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/powercfg-command-line-options)
- [Microsoft — atualização e reversão de drivers](https://support.microsoft.com/en-us/windows/update-drivers-through-device-manager-in-windows-ec62f46c-ff14-c91d-eead-d7126dc1f7b6)
- [AMD — instalação de drivers de chipset](https://www.amd.com/en/resources/support-articles/faqs/CHIPSET-INSTALL.html)
- [Microsoft — diagnóstico de cintilação e reversão de driver](https://support.microsoft.com/en-us/windows/hardware/display-graphics/troubleshoot-screen-flickering-in-windows)
- [Microsoft Sysinternals — Process Explorer](https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer)
- [Microsoft — Scheduling Priorities](https://learn.microsoft.com/en-us/windows/win32/procthread/scheduling-priorities)
- [Valve — verificação de integridade de jogos](https://help.steampowered.com/en/faqs/view/0C48-FCBD-DA71-93EB)
- [Microsoft — taxa de atualização do monitor](https://support.microsoft.com/en-gb/windows/hardware/display-graphics/change-the-refresh-rate-on-your-monitor-in-windows?nochrome=true)
- [Microsoft — USB selective suspend](https://learn.microsoft.com/en-us/windows-hardware/drivers/usbcon/usb-selective-suspend)
- [Microsoft — suspensão seletiva em HID USB](https://learn.microsoft.com/en-us/windows-hardware/drivers/hid/selective-suspend-for-hid-over-usb-devices)
- [Microsoft — diagnóstico de áudio](https://support.microsoft.com/en-US/Windows/Hardware/Audio/fix-sound-or-audio-problems-in-windows)
- [Microsoft — Low Latency Audio](https://learn.microsoft.com/en-us/windows-hardware/drivers/audio/low-latency-audio)
- [Microsoft — integridade de memória e VBS](https://learn.microsoft.com/en-us/windows/security/hardware-security/enable-virtualization-based-protection-of-code-integrity)
- [Microsoft — Defender Performance Analyzer](https://learn.microsoft.com/en-us/defender-endpoint/performance-analyzer-reference)
- [Microsoft — Storage Sense](https://support.microsoft.com/en-us/windows/experience/storage-filemanagement/manage-drive-space-with-storage-sense)
- [Microsoft — ferramentas de configuração e riscos do registro](https://support.microsoft.com/en-us/windows/experience/system-configuration-tools-in-windows?tw_p=twt)
- [Microsoft — reparo de arquivos do sistema](https://support.microsoft.com/en-us/windows/experience/backup-recovery/use-the-system-file-checker-tool-to-repair-missing-or-corrupted-system-files)
- [Microsoft — WHEA Hardware Error Events](https://learn.microsoft.com/en-us/windows-hardware/drivers/whea/whea-hardware-error-events)
