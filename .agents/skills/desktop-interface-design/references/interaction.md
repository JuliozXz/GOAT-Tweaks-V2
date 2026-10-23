# Motion and interaction

Adapted locally on 2026-10-23 from Impeccable's animate and Operate guidance, with Windows input verification added.

Give animation a purpose: explain state, continuity, hierarchy or action feedback. Use the existing animation stack. Prefer cheap isolated transitions and measure the result; transforms are not a performance guarantee. Support interruption and repeated actions. Stop nonessential work when hidden and respect prefers-reduced-motion. Do not animate every telemetry sample or announce every sensor tick through live regions.

Use semantic buttons, inputs, dialogs and established composite-widget patterns. Define focus entry, visible focus, arrow behavior, Escape, selection, dialog containment and return to the invoker. Check focus after route changes, dynamic lists, errors and disconnected devices. Do not introduce positive tabindex to repair an incorrect DOM order.

Controller navigation is a separate behavior contract. Choose browser Gamepad API, XInput or GameInput only after checking device support, WebView2 behavior, library licensing and deployment requirements. Define directional focus, dead zones, repeat timing, confirm/back, connection loss and switching between pointer/keyboard/controller. Windows App SDK automatic mappings are not proof that a Tauri webview has those mappings. Test with a real supported controller; keyboard emulation proves only that emulation path.

Primary references: https://www.w3.org/WAI/ARIA/apg/ ; https://learn.microsoft.com/en-us/gaming/gdk/docs/features/common/input/overviews/input-overview ; https://learn.microsoft.com/en-us/windows/apps/develop/input/gamepad-and-remote-interactions
