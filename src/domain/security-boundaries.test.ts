import fs from "node:fs";
import { expect, it } from "vitest";

it("mantém o shell sem privilégios de sistema ou origens remotas", () => {
  const config = JSON.parse(fs.readFileSync("src-tauri/tauri.conf.json", "utf8"));
  const capability = JSON.parse(fs.readFileSync("src-tauri/capabilities/main.json", "utf8"));
  expect(config.app.windows.map((window: { label: string }) => window.label)).toEqual(["main"]);
  expect(config.app.security.capabilities).toEqual([capability.identifier]);
  expect(capability.windows).toEqual(["main"]);
  expect(capability.remote).toBeUndefined();
  expect(capability.permissions).toEqual([]);
  expect(config.app.windows[0].fullscreen).toBe(false);
  const csp = config.app.security.csp as string;
  expect(csp).not.toMatch(/unsafe-inline|unsafe-eval|\*/);
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("frame-src 'none'");
  expect(config.bundle.active).toBe(false);
});

it("fixa versões diretas e bloqueia scripts de instalação", () => {
  const manifest = JSON.parse(fs.readFileSync("package.json", "utf8"));
  for (const version of Object.values({ ...manifest.dependencies, ...manifest.devDependencies })) {
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  }
  expect(fs.readFileSync("pnpm-workspace.yaml", "utf8")).toContain("ignoreScripts: true");
});
