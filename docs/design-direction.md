# Direção visual do GOAT HUB

Revisão: 23/10/2026. Diretriz atual: aplicativo desktop Windows profissional para atendimento técnico, com mouse e teclado. Big Picture, navegação por controle/gamepad, composição de console e fullscreen obrigatório estão fora do produto. Referências de ferramentas de otimização ajudam a investigar funcionalidades; não autorizam copiar sua identidade visual.

## Organização e uso

Preservar navegação lateral por categoria, Basic/General/Advanced dentro da categoria, busca, filtros, ordenação, lista de registros, detalhes e revisão. Usar tabelas quando os dados realmente precisarem de comparação por colunas. A hierarquia deve deixar explícitos a fonte, o estado de implementação, a disponibilidade e os limites de cada ação. Seleção visual não significa execução.

A densidade compacta é uma preferência do técnico e permanece acessível em janelas estreitas. Ela reduz espaçamento e oculta somente o resumo repetido da linha; o conteúdo completo continua no painel de detalhes. Dimensionar pelo espaço útil da janela, sem presumir resolução física ou fullscreen. Acessibilidade por teclado, foco visível, atalhos e rolagem comum fazem parte do fluxo normal; não há navegação espacial, prompts de botões de controle nem UI alternativa para console.

## Identidade provisória e tokens

A logo oficial ainda não foi fornecida. Grafite/âmbar conserva a aparência existente como **paleta provisória**, sem afirmar que suas cores vieram da marca. Não criar uma logo substituta. O nome GOAT Tweaks pode ser usado como texto enquanto o asset oficial está pendente.

`src/styles.css` importa `./theme/tokens.css`; o ponto de entrada existente continua importando apenas `styles.css`. `src/theme/tokens.css` centraliza cores semânticas, fontes, raios de controles/painéis/diálogos, movimento, foco, overlay e sombra. Componentes devem consultar `var(--token)`; não adicionar cores hexadecimais nos seletores.

| Papel | Tokens principais |
| --- | --- |
| Superfícies e estrutura | `--surface-app`, `--surface-sidebar`, `--surface-panel`, `--surface-detail`, `--surface-dialog` |
| Hierarquia de leitura | `--text-primary`, `--text-strong`, `--text-secondary`, `--text-muted` |
| Controles | `--surface-control`, `--border-control`, `--surface-button`, `--surface-button-hover` |
| Marca provisória e interação | `--accent`, `--accent-hover`, `--accent-link`, `--focus-ring` |
| Estados independentes | pares `--surface-*` / `--text-*` para `manual`, `integration-pending`, `research`, `rejected`, `warning` |
| Evidência e revisão | grupos `--*-evidence`, `--*-review`, `--*-notice` |
| Tipografia e feedback | `--font-interface`, `--font-code`, `--motion-feedback`, `--motion-easing` |

Quando a logo chegar: inspecionar o arquivo e sua transparência, preservar proporções, documentar as cores efetivamente observadas e atualizar os tokens após verificar contraste em estados normal, hover, foco, seleção e desabilitado. Cores de evidência/risco não devem se tornar indistinguíveis só para combinar com a marca. Nenhuma imagem foi analisada nesta etapa.

## Decisões, alternativas e validação

Custom properties CSS reutilizam a stack instalada e permitem trocar a paleta em um arquivo; uma biblioteca de temas ou de componentes acrescentaria dependências sem necessidade para esta alteração. Mantêm-se fontes locais do Windows, sem download, CDN ou nova licença de fonte. As transições existentes são discretas e respeitam `prefers-reduced-motion`; `forced-colors` continua usando cores do sistema. Estado e significado precisam de texto, não apenas de cor.

Fontes consultadas em 23/10/2026: [MDN — CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties), [W3C — WCAG 2.2, foco visível](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) e [Microsoft — interação por teclado](https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions). As recomendações de teclado são aplicadas ao DOM/React existente; exemplos WinUI não são uma dependência deste projeto. A skill local `desktop-interface-design` foi consultada somente para tokens, hierarquia e verificação; menções genéricas a gamepad na skill não ampliam o escopo.

Verificar formato/lint e resolução dos tokens no build web. Depois, inspecionar telas nas larguras já cobertas, densidade normal/compacta, seleção, diálogo, avisos e foco por teclado. O build web e os testes em Chromium não comprovam WebView2, DPI real, Narrator nem conformidade WCAG completa. Os resultados efetivamente executados devem constar no relatório do marco; este documento define a direção e os limites, sem certificar testes futuros.

Na extração do tema foram executados Biome lint e formato nos dois arquivos CSS (aprovados), verificação estática de 80 tokens definidos/referenciados, zero referências indefinidas e zero cores literais no CSS de componentes, além de `pnpm build` com TypeScript/Vite (aprovado). A barra inferior permite quebra de linha em janelas estreitas para manter a escolha de densidade visível. Esses checks não substituem a revisão visual e os testes E2E do conjunto final.
