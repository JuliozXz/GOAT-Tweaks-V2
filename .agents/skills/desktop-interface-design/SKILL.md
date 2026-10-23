---
name: desktop-interface-design
description: Design or review React desktop interfaces, design tokens, typography, motion, dense dashboards, and gamepad navigation in Tauri on Windows. Use for product UI, design systems, microinteractions, and UX refinement.
license: Apache-2.0
metadata:
  version: "1.0.0-local"
  source: "pbakaus/impeccable@e3818550d291a5157f309124dc1872d96ec81bf2; see PROVENANCE.md"
---

# Desktop interface design

Local instruction-only adaptation of Impeccable's product-interface guidance. Read existing product context, design tokens, components and screenshots first. Preserve the requested visual identity and working interactions. Choose a clear direction when creating a new surface; do not replace an existing design system incidentally.

For desktop tools, prioritize task completion, legible data, recognizable controls and clear states. A premium interface comes from composition, type, density, hierarchy and precise feedback. Match Windows/WebView2 constraints and the actual target screen, scaling and input devices.

Load only the reference needed:

- [Design system and typography](references/design-system.md) for structure, tokens, fonts and data-heavy views.
- [Motion and interaction](references/interaction.md) for transitions, keyboard, controller input and accessibility.
- [Visual verification](references/verification.md) for rendered review and regression evidence.

Use installed keyboard-navigation-review for a concrete keyboard journey. This skill has no launcher, CLI, binary downloader, hooks or agent personas. References to Impeccable concepts do not invoke its commands. Implementation and validation remain bounded by the user's task and available tools.
