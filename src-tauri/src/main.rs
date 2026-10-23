#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() -> Result<(), tauri::Error> {
    // The foundation exposes only the explicit window permissions in capabilities/main.json.
    // No custom commands, external processes, collectors, or privileged plugins are registered.
    tauri::Builder::default().run(tauri::generate_context!())
}
