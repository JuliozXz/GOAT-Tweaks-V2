import { spawn } from "node:child_process";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const cli = require.resolve("@playwright/test/cli");
// Isolated project browser binaries; no global Edge/Chrome installation or OS dependencies.
const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: path.resolve(".playwright") },
  stdio: "inherit",
  windowsHide: true,
});
child.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });
