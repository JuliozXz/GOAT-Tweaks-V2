import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test as base } from "@playwright/test";
import rawCatalog from "../src/data/catalog.json" with { type: "json" };

// Real, read-only research fixture. No domain implementation is imported to calculate outcomes.
type CatalogEntry = Readonly<{
  id: string;
  title: string;
  category: string;
  level: string;
  disposition: string;
}>;
const catalog: readonly CatalogEntry[] = rawCatalog;
const storageKey = "goat-hub.preferences.v1";
const cpuTitle = "Diagnóstico de saturação e espera da CPU";
const presentMonTitle = "Frametimes reais com PresentMon";
const rejectedTimerTitle = "Forçar resolução de timer globalmente";

const categoryJourneys = [
  ["cpu", "CPU"],
  ["ram", "RAM"],
  ["gpu", "Placa de vídeo"],
  ["storage", "Armazenamento"],
  ["input", "Input"],
  ["latency", "Latência"],
  ["network", "Rede"],
  ["windows", "Windows"],
  ["bios", "BIOS"],
  ["power", "Energia"],
  ["drivers", "Drivers"],
  ["processes", "Processos e serviços"],
  ["games", "Jogos e aplicativos"],
  ["peripherals", "Periféricos"],
  ["audio", "Áudio"],
  ["security", "Segurança"],
  ["maintenance", "Manutenção"],
  ["repair", "Diagnóstico e reparação"],
] as const;
const levelJourneys = [
  ["basic", "Basic"],
  ["general", "General"],
  ["advanced", "Advanced"],
] as const;

const test = base.extend<{ app: Page }>({
  app: async ({ page }, use) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "CPU", exact: true })).toBeVisible();
    await use(page);
  },
});

function details(page: Page) {
  return page.getByRole("complementary", { name: "Detalhes do registro", exact: true });
}

test("navega pelas 18 categorias e pelos três níveis com contagens reais", async ({ app }) => {
  const navigation = app.getByRole("navigation", { name: "Categorias", exact: true });
  await expect(navigation.getByRole("link")).toHaveCount(18);

  for (const [categoryId, categoryName] of categoryJourneys) {
    await test.step(categoryName, async () => {
      await navigation.getByRole("link", { name: new RegExp(`^${categoryName}\\s*\\d+$`) }).click();
      await expect(app.getByRole("heading", { level: 1 })).toHaveText(categoryName);
      for (const [levelId, levelName] of levelJourneys) {
        const expected = catalog.filter(
          (item) => item.category === categoryId && item.level === levelId,
        );
        const tab = app
          .getByRole("navigation", { name: "Níveis da categoria", exact: true })
          .getByRole("button", { name: new RegExp(`^${levelName}\\s*${expected.length}$`) });
        await tab.click();
        await expect(tab).toHaveAttribute("aria-pressed", "true");
        await expect(app).toHaveURL(new RegExp(`#/${categoryId}/${levelId}$`));
        const visible = expected.filter((item) => item.disposition !== "rejected");
        await expect(
          app
            .getByRole("region", { name: "Registros do catálogo" })
            .getByRole("button", { name: /^Ver detalhes:/ }),
        ).toHaveCount(visible.length);
        if (visible.length === 0) {
          await expect(
            app.getByRole("heading", { name: "Nenhum registro neste recorte" }),
          ).toBeVisible();
          await expect(
            details(app).getByRole("heading", { name: "Selecione um registro" }),
          ).toBeVisible();
        }
      }
    });
  }
});

test("busca global abre a categoria original e preserva histórico de navegação", async ({
  app,
}) => {
  const search = app.getByRole("searchbox", { name: "Buscar em todo o catálogo" });
  await search.fill("PRESENTMON");
  await expect(app.getByRole("heading", { level: 1 })).toHaveText("Busca no catálogo");
  await app.getByRole("button", { name: `Ver detalhes: ${presentMonTitle}`, exact: true }).click();
  await expect(app).toHaveURL(/#\/games\/general\/games-presentmon-capture$/);
  await expect(app.getByRole("heading", { level: 1 })).toHaveText("Jogos e aplicativos");
  await expect(search).toHaveValue("");
  await expect(
    details(app).getByRole("heading", { name: presentMonTitle, exact: true }),
  ).toBeFocused();

  await app
    .getByRole("navigation", { name: "Categorias", exact: true })
    .getByRole("link", { name: /^CPU\s*\d+$/ })
    .click();
  await expect(app.getByRole("heading", { level: 1 })).toHaveText("CPU");
  await app.goBack();
  await expect(app.getByRole("heading", { level: 1 })).toHaveText("Jogos e aplicativos");
  await expect(
    details(app).getByRole("heading", { name: presentMonTitle, exact: true }),
  ).toBeVisible();
  await app.goForward();
  await expect(app.getByRole("heading", { level: 1 })).toHaveText("CPU");
});

test("busca e filtros vazios removem o detalhe anterior e sua ação", async ({ app }) => {
  await app.getByRole("button", { name: `Ver detalhes: ${cpuTitle}`, exact: true }).click();
  await expect(details(app).getByRole("heading", { name: cpuTitle, exact: true })).toBeVisible();
  const search = app.getByRole("searchbox", { name: "Buscar em todo o catálogo" });
  await search.fill("nenhum-registro-para-esta-consulta-7391");
  await expect(app.getByRole("heading", { name: "Nenhum registro neste recorte" })).toBeVisible();
  await expect(details(app).getByRole("heading", { name: "Selecione um registro" })).toBeVisible();
  await expect(details(app).getByRole("button", { name: "Adicionar à revisão" })).toHaveCount(0);

  await search.clear();
  await app
    .getByRole("combobox", { name: "Filtrar por status" })
    .selectOption({ label: "Em pesquisa" });
  await expect(details(app).getByRole("heading", { name: "Selecione um registro" })).toBeVisible();
  await app
    .getByRole("combobox", { name: "Filtrar por status" })
    .selectOption({ label: "Todos os status" });
  await expect(details(app).getByRole("heading", { name: cpuTitle, exact: true })).toBeVisible();
  await app.getByRole("checkbox", { name: "Só selecionados", exact: true }).check();
  await expect(details(app).getByRole("heading", { name: "Selecione um registro" })).toBeVisible();
});

test("itens rejeitados não são selecionáveis e desaparecem também do detalhe", async ({ app }) => {
  await app.goto("/#/latency/advanced");
  const rejected = app.getByRole("checkbox", {
    name: `Selecionar ${rejectedTimerTitle}`,
    exact: true,
  });
  await expect(rejected).toHaveCount(0);
  await app.getByRole("checkbox", { name: "Incluir rejeitados", exact: true }).check();
  await expect(rejected).toBeDisabled();
  await app
    .getByRole("button", { name: `Ver detalhes: ${rejectedTimerTitle}`, exact: true })
    .click();
  await expect(
    details(app).getByRole("button", { name: "Item rejeitado para aplicação", exact: true }),
  ).toBeDisabled();
  await app.getByRole("checkbox", { name: "Incluir rejeitados", exact: true }).uncheck();
  await expect(rejected).toHaveCount(0);
  await expect(
    details(app).getByRole("heading", { name: rejectedTimerTitle, exact: true }),
  ).toHaveCount(0);
  await app.getByRole("button", { name: "Revisar seleção", exact: true }).click();
  const dialog = app.getByRole("dialog", { name: "Revisão do plano" });
  await expect(dialog.getByText("0 selecionados", { exact: true })).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Exportar plano JSON", exact: true }),
  ).toBeDisabled();
});

test("persiste adição, remoção e preferências imediatamente após cada alteração", async ({
  app,
}) => {
  const selection = app.getByRole("checkbox", { name: `Selecionar ${cpuTitle}`, exact: true });
  await selection.check();
  await app.reload();
  await expect(selection).toBeChecked();
  await selection.uncheck();
  await app.reload();
  await expect(selection).not.toBeChecked();

  await app.getByRole("checkbox", { name: "Modo compacto", exact: true }).check();
  await app.reload();
  await expect(app.getByRole("checkbox", { name: "Modo compacto", exact: true })).toBeChecked();
  await app.getByRole("checkbox", { name: "Incluir rejeitados", exact: true }).check();
  await app.reload();
  await expect(
    app.getByRole("checkbox", { name: "Incluir rejeitados", exact: true }),
  ).toBeChecked();

  await selection.check();
  await app.getByRole("button", { name: "Revisar seleção", exact: true }).click();
  await app
    .getByRole("dialog", { name: "Revisão do plano" })
    .getByRole("button", { name: `Remover ${cpuTitle}`, exact: true })
    .click();
  await app.reload();
  await expect(selection).not.toBeChecked();
  await app.getByRole("checkbox", { name: "Só selecionados", exact: true }).check();
  await expect(app.getByRole("heading", { name: "Nenhum registro neste recorte" })).toBeVisible();
});

test("preserva armazenamento corrompido e deixa explícita a sessão temporária", async ({ app }) => {
  const original = "{conteudo-original-invalido-que-nao-deve-ser-apagado";
  // Seed once, then reload. Re-seeding on every navigation would hide an accidental overwrite.
  await app.evaluate(({ key, value }) => localStorage.setItem(key, value), {
    key: storageKey,
    value: original,
  });
  await app.reload();
  await expect(app.getByRole("alert")).toContainText("O conteúdo original foi preservado");
  const selection = app.getByRole("checkbox", { name: `Selecionar ${cpuTitle}`, exact: true });
  await selection.check();
  await app.getByRole("checkbox", { name: "Modo compacto", exact: true }).check();
  await expect(selection).toBeChecked();
  expect(await app.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(original);
  await app.reload();
  await expect(selection).not.toBeChecked();
  await expect(app.getByRole("checkbox", { name: "Modo compacto", exact: true })).not.toBeChecked();
  expect(await app.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(original);
  await expect(app.getByRole("alert")).toContainText("esta sessão será temporária");
});

test("teclado alcança conteúdo e busca, mantém foco no diálogo e restaura ao fechar", async ({
  app,
}) => {
  await app.keyboard.press("Tab");
  await expect(
    app.getByRole("button", { name: "Pular para o conteúdo", exact: true }),
  ).toBeFocused();
  await app.keyboard.press("Enter");
  await expect(app.getByRole("main")).toBeFocused();
  await app.keyboard.press("Control+k");
  await expect(app.getByRole("searchbox", { name: "Buscar em todo o catálogo" })).toBeFocused();
  await app.keyboard.press("Tab");
  await expect(app.getByLabel("Importar inventário JSON")).toBeFocused();

  const review = app.getByRole("button", { name: "Revisar seleção", exact: true });
  // Bounded real Tab journey; the DOM read only observes focus, never moves it.
  for (let steps = 0; steps < 80; steps++) {
    if (await review.evaluate((element) => element === document.activeElement)) break;
    await app.keyboard.press("Tab");
  }
  await expect(review).toBeFocused();
  await app.keyboard.press("Enter");
  const dialog = app.getByRole("dialog", { name: "Revisão do plano" });
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole("button", { name: "Fechar diálogo", exact: true });
  const continueResearch = dialog.getByRole("button", {
    name: "Continuar pesquisando",
    exact: true,
  });
  await expect(close).toBeFocused();
  await app.keyboard.press("Shift+Tab");
  await expect(continueResearch).toBeFocused();
  await app.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await app.keyboard.press("Control+k");
  await expect(close).toBeFocused();
  await app.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(review).toBeFocused();
});

test("exporta arquivo JSON real com seleção e sem inventário, execução ou resultados", async ({
  app,
}, testInfo) => {
  await app.getByRole("checkbox", { name: `Selecionar ${cpuTitle}`, exact: true }).check();
  await app.getByRole("button", { name: "Revisar seleção", exact: true }).click();
  const downloadPromise = app.waitForEvent("download");
  await app
    .getByRole("dialog", { name: "Revisão do plano" })
    .getByRole("button", { name: "Exportar plano JSON", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^goat-hub-revisao-\d{4}-\d{2}-\d{2}\.json$/);
  const path = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(path);
  expect(await download.failure()).toBeNull();
  const exported = JSON.parse(await readFile(path, "utf8"));
  expect(exported.documentType).toBe("research-review-plan");
  expect(exported.schemaVersion).toBe(1);
  expect(exported.machineInventory).toBeNull();
  expect(exported.appliedChanges).toEqual([]);
  expect(exported.measuredResults).toEqual([]);
  expect(exported.records).toHaveLength(1);
  expect(exported.records[0]).toMatchObject({
    id: "cpu-baseline-investigation",
    title: cpuTitle,
    compatibility: "unknown",
    execution: "not-implemented",
    implementationVersion: null,
  });
  expect(exported.purpose).toContain("Não autoriza execução");
  await testInfo.attach("plano-exportado", { path, contentType: "application/json" });
});

test("análise axe da página principal sem violações detectadas", async ({ app }, testInfo) => {
  const results = await new AxeBuilder({ page: app }).analyze();
  await testInfo.attach("axe-principal", {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });
  expect(results.violations).toEqual([]);
});

test("análise axe com diálogo de revisão aberto sem violações detectadas", async ({
  app,
}, testInfo) => {
  await app.getByRole("checkbox", { name: `Selecionar ${cpuTitle}`, exact: true }).check();
  await app.getByRole("button", { name: "Revisar seleção", exact: true }).click();
  await expect(app.getByRole("dialog", { name: "Revisão do plano" })).toBeVisible();
  const results = await new AxeBuilder({ page: app }).analyze();
  await testInfo.attach("axe-dialogo", {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });
  expect(results.violations).toEqual([]);
});

test("layout sem overflow horizontal e capturas nas cinco resoluções", async ({
  app,
}, testInfo) => {
  const viewports = [
    { name: "1080p", width: 1920, height: 1080 },
    { name: "1440p", width: 2560, height: 1440 },
    { name: "4k", width: 3840, height: 2160 },
    { name: "compacto", width: 960, height: 540 },
    { name: "estreito", width: 390, height: 844 },
  ] as const;
  for (const viewport of viewports) {
    await test.step(`${viewport.name}: ${viewport.width}×${viewport.height}`, async () => {
      await app.setViewportSize({ width: viewport.width, height: viewport.height });
      await expect(app.getByRole("heading", { level: 1, name: "CPU", exact: true })).toBeVisible();
      await expect(app.getByRole("searchbox", { name: "Buscar em todo o catálogo" })).toBeVisible();
      await expect(app.getByRole("button", { name: "Revisar seleção", exact: true })).toBeVisible();
      // Geometry requires DOM measurement. Allow only rounding, not hidden horizontal overflow.
      await expect
        .poll(async () =>
          app.evaluate(
            () =>
              Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
              window.innerWidth,
          ),
        )
        .toBeLessThanOrEqual(1);
      const path = testInfo.outputPath(`fundacao-${viewport.width}x${viewport.height}.png`);
      await app.screenshot({ path, fullPage: true, animations: "disabled" });
      await testInfo.attach(`layout-${viewport.name}`, { path, contentType: "image/png" });
    });
  }
  // These captures are review evidence, not a pixel comparison against an approved baseline.
});

test("falha de cota de armazenamento informa que a seleção é temporária", async ({ app }) => {
  await app.addInitScript((key) => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (this: Storage, itemKey: string, value: string) {
      if (itemKey === key)
        throw new DOMException("Cota indisponível no teste", "QuotaExceededError");
      return original.call(this, itemKey, value);
    };
  }, storageKey);
  await app.reload();
  const selection = app.getByRole("checkbox", { name: `Selecionar ${cpuTitle}`, exact: true });
  await selection.check();
  await expect(selection).toBeChecked();
  await expect(app.getByRole("alert")).toContainText("Não foi possível salvar");
  await expect(app.getByRole("alert")).toContainText("apenas nesta sessão");
  await app.reload();
  await expect(selection).not.toBeChecked();
});
