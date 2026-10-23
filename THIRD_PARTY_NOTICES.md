# Avisos de terceiros

O GOAT HUB Service usa dependências com licenças próprias. As cópias integrais de licença das bibliotecas de runtime frontend estão em `third_party/licenses/`: React, ReactDOM, Scheduler, Zod e API Tauri. As versões correspondentes estão fixadas em `pnpm-lock.yaml`; não foi modificado código dessas bibliotecas.

O inventário de todas as dependências instaladas, incluindo ferramentas de build/teste, está em `docs/validation/dependency-licenses.json`. Esse inventário foi gerado do pacote instalado; validar obrigações e incluir avisos adequados no artefato de distribuição efetivo. As crates Rust e dependências transitivas precisam de auditoria após geração do Cargo.lock. Não há release distribuída neste marco.

Os textos do catálogo são sínteses originais com referências. Nenhum código ou binário de EXM Tweaks, Ultimate, WinSux, WinUtil, PresentMon, LibreHardwareMonitor, Sysinternals ou SDKs de fabricantes foi incorporado. A existência de um link não transfere licença nem certifica a ferramenta. O uso de imagens/fontes/logos oficiais não foi presumido; o produto usa fontes locais do sistema e ícones geométricos próprios, com monograma GH provisório.

As skills instaladas anteriormente mantêm avisos/licenças/proveniência em `.agents/skills/` e auditoria em `skill-audit-2026-10-23/`. Elas são instruções do ambiente de desenvolvimento, não dependências executadas ou distribuídas pelo aplicativo.
