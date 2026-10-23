import { describe, expect, it } from "vitest";
import raw from "../data/catalog.json";
import {
  canSelect,
  catalogSchema,
  categories,
  createReviewPlan,
  parseRoute,
  sanitizeSelection,
  searchRecords,
} from "./catalog";

const records = catalogSchema.parse(raw);
describe("catálogo de pesquisa", () => {
  it("cobre as categorias com IDs únicos e evidência declarada", () => {
    expect(new Set(records.map((record) => record.id)).size).toBe(records.length);
    for (const category of categories)
      expect(records.some((record) => record.category === category.id)).toBe(true);
  });
  it("rejeita duplicação, execução injetada e fonte insegura", () => {
    const first = records[0];
    expect(catalogSchema.safeParse([first, first]).success).toBe(false);
    expect(catalogSchema.safeParse([{ ...first, command: "powershell" }]).success).toBe(false);
    expect(
      catalogSchema.safeParse([
        { ...first, sources: [{ title: "insegura", url: "javascript:alert(1)" }] },
      ]).success,
    ).toBe(false);
  });
  it("pesquisa sem acentos por termos, ID e sinônimos", () => {
    const fixture = [
      { ...records[0], id: "latencia-medida", title: "Medição de latência", tags: ["frametime"] },
    ];
    const checked = catalogSchema.parse(fixture);
    expect(searchRecords(checked, "medicao LATENCIA")).toHaveLength(1);
    expect(searchRecords(checked, "frametime")).toHaveLength(1);
    expect(searchRecords(checked, "latencia-medida")).toHaveLength(1);
    expect(searchRecords(checked, "nenhum resultado")).toHaveLength(0);
  });
  it("bloqueia rejeitados e ignora IDs removidos/duplicados", () => {
    const allowed = records.find(canSelect);
    if (!allowed) throw new Error("Catálogo sem candidato");
    const rejected = records.find((record) => !canSelect(record));
    expect(
      sanitizeSelection([allowed.id, allowed.id, "missing", rejected?.id ?? "missing"], records),
    ).toEqual([allowed.id]);
  });
  it("exporta plano sem alegar hardware, execução ou resultados", () => {
    const plan = createReviewPlan(
      records,
      records.map((record) => record.id),
      new Date("2026-10-23T12:00:00Z"),
    );
    expect(plan.appliedChanges).toEqual([]);
    expect(plan.machineInventory).toBeNull();
    expect(plan.measuredResults).toEqual([]);
    expect(
      plan.records.every(
        (record) =>
          record.compatibility === "unknown" &&
          record.execution === "not-implemented" &&
          record.evidence !== 5,
      ),
    ).toBe(true);
  });
  it("rotas inválidas não selecionam registros de outras categorias", () => {
    expect(parseRoute("#/invalid/invalid", records)).toEqual({
      category: "cpu",
      level: "basic",
      recordId: undefined,
    });
    expect(parseRoute("#/cpu/basic/inexistente", records).recordId).toBeUndefined();
  });
});
