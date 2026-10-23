# Visual verification

Adapted locally on 2026-10-23 from Impeccable's rendered-review principle. Inspect the shipped surface at its real sizes and Windows scale factors. Check a batch of related states before making another inspection pass.

Freeze clock, telemetry fixtures, random IDs and network data for visual comparisons. Wait for fonts and the relevant semantic ready state. Preserve expected, actual and diff artifacts. Review intentional baseline changes; do not increase thresholds merely to silence an unexplained diff. Keep OS, WebView/browser, fonts, scaling and rendering backend stable. Windows packaged screenshots need Windows baselines.

A browser harness can verify the frontend with a mock IPC adapter. It does not prove native window chrome, capabilities, resources, sidecars, notifications, updater behavior or native input in the packaged app. For actual Windows Tauri automation consult https://v2.tauri.app/develop/tests/webdriver/ and match msedgedriver to the installed Edge/WebView2 environment. Report which surface was exercised.

Capture keyboard focus, empty/loading/error/stale states, long content, reduced motion and high contrast as appropriate to the change. Screenshots alone do not establish screen-reader usability, latency or frame pacing. Record checks performed and remaining manual review.
