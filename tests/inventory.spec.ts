import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Synthetic contract fixture, never a claim about this computer's hardware.
const sections = [
  ["cpu", "Win32_Processor"],
  ["memory", "Win32_PhysicalMemory"],
  ["gpu", "Win32_VideoController"],
  ["baseboard", "Win32_BaseBoard"],
  ["bios", "Win32_BIOS"],
  ["os", "Win32_OperatingSystem"],
  ["storage", "Win32_DiskDrive"],
  ["network", "Win32_NetworkAdapter"],
  ["drivers", "Win32_PnPSignedDriver"],
];
const fixture = {
  schemaVersion: 1,
  collector: { name: "goat-hub-cim", version: "0.1.0", powershellVersion: "5.1.0" },
  collectedAt: "2026-10-23T12:00:00Z",
  sections: sections.map(([id, className]) => ({
    id,
    label: `Fixture ${id}`,
    source: `CIM root/cimv2 ${className}`,
    collectedAt: "2026-10-23T12:00:00Z",
    status: "unavailable",
    confidence: "unknown",
    records: [],
    error: null,
  })),
};

test("importação validada, indisponibilidade, remoção e ausência de persistência", async ({
  page,
}) => {
  await page.goto("/");
  const panel = page.getByRole("region", { name: /Inventário somente leitura/ });
  await page.getByLabel("Importar inventário JSON").setInputFiles({
    name: "fixture-inventory.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(fixture)),
  });
  await expect(panel.getByRole("heading", { level: 2 })).toContainText("relatório importado");
  await expect(panel.locator("details")).toHaveCount(9);
  await panel.locator("summary").first().click();
  await expect(panel).toContainText("CIM root/cimv2 Win32_Processor");
  await expect(panel).toContainText("Indisponível · 0 registros");
  await expect(panel).toContainText("Bloqueado");
  const audit = await new AxeBuilder({ page }).include(".inventory-panel").analyze();
  expect(audit.violations).toEqual([]);
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 2, name: /Inventário somente leitura/ }),
  ).toContainText("nenhum relatório importado");
});

test("arquivo inválido não substitui relatório válido e remoção é efetiva", async ({ page }) => {
  await page.goto("/");
  const input = page.getByLabel("Importar inventário JSON");
  await input.setInputFiles({
    name: "fixture.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(fixture)),
  });
  await input.setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"command":"never execute"}'),
  });
  await expect(page.getByRole("alert")).toContainText("relatório anterior foi preservado");
  await expect(page.locator(".inventory-panel details")).toHaveCount(9);
  await page.getByRole("button", { name: "Remover relatório da sessão" }).click();
  await expect(page.locator(".inventory-panel details")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { level: 2, name: /Inventário somente leitura/ }),
  ).toContainText("nenhum relatório importado");
});
