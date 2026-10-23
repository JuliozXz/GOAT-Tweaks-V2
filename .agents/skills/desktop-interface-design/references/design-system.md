# Design system and typography

Adapted locally on 2026-10-23 from Impeccable's Operate, typeset, layout and extract guidance. This is a synthesis for Windows desktop tools, not the upstream detector or its absolute stylistic bans.

Inspect existing tokens and component APIs before introducing more. Define semantic roles for surfaces, text, borders, spacing, radius, elevation, status and motion. Reuse a small consistent scale; do not add a new component library for an isolated control. Separate theme tokens from component state. Keep disabled, hover, pressed, focus-visible, loading, empty, stale and error states distinct.

Build hierarchy around actual tasks: navigation, work area, filters, primary measurements, details. Keep a unit next to each metric; distinguish per-process from system-wide data, RAM from VRAM and missing values from zero. Use stable numeric columns and tabular numerals where available. Make charts readable through labels and equivalent text or tables; do not rely solely on color or hover tooltips. Never invent real product measurements or claims.

Use a restrained, licensed font stack appropriate to an installed Windows tool. Native system fonts are a valid choice. Verify glyph coverage, locale, fallback and rendering at Windows scaling levels. Check real labels, long paths, negative values, large numbers and localization rather than lorem ipsum. Let text resize without clipping controls. Dense layouts need clear grouping and contrast, not uniformly small text.

For accessibility use current WCAG/WAI sources, not an aesthetic preference as a compliance rule. Validate contrast in actual states, visible focus, forced colors and zoom. A polished screenshot does not establish accessibility.

Primary references: https://github.com/pbakaus/impeccable/tree/e3818550d291a5157f309124dc1872d96ec81bf2/skill/reference ; https://www.w3.org/WAI/ARIA/apg/ ; https://www.w3.org/TR/WCAG22/
