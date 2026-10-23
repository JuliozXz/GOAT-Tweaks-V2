import { describe, expect, it } from "vitest";
import { assessInventory, inventorySchema, inventorySections, parseInventory } from "./inventory";

function at<T>(items: readonly T[], index = 0): T {
  const value = items[index];
  if (value === undefined) throw new Error("Fixture ausente");
  return value;
}

function fixture() {
  return {
    schemaVersion: 1,
    collector: { name: "goat-hub-cim", version: "0.1.0", powershellVersion: "5.1.19041.6456" },
    collectedAt: "2026-10-23T12:00:00.0000000Z",
    sections: Object.entries(inventorySections).map(([id, definition]) => ({
      id,
      label: id,
      source: `CIM root/cimv2 ${definition.className}`,
      collectedAt: "2026-10-23T11:59:59.0000000Z",
      status: "available",
      confidence: "reported",
      error: null,
      records: [
        {
          index: 0,
          fields: definition.keys.map((key) => ({
            key,
            label: key,
            value:
              key === "Caption"
                ? "Microsoft Windows 11 Pro"
                : key === "FreePhysicalMemory"
                  ? 0
                  : key === "NetEnabled"
                    ? false
                    : "fixture",
            unit: null,
            status: "reported",
            confidence: "reported",
          })),
        },
      ],
    })),
  };
}
const now = new Date("2026-10-23T12:01:00Z");
describe("inventário importado", () => {
  it("valida contrato PowerShell com timestamps de sete casas e zero/false reais", () => {
    const parsed = parseInventory(JSON.stringify(fixture()));
    expect(parsed.sections).toHaveLength(9);
    expect(
      parsed.sections
        .find((item) => item.id === "os")
        ?.records[0]?.fields.find((item) => item.key === "FreePhysicalMemory")?.value,
    ).toBe(0);
    expect(
      parsed.sections
        .find((item) => item.id === "network")
        ?.records[0]?.fields.find((item) => item.key === "NetEnabled")?.value,
    ).toBe(false);
  });
  it("rejeita JSON inválido, grande, versão desconhecida e campos extras", () => {
    expect(() => parseInventory("{")).toThrow();
    expect(() => parseInventory(" ".repeat(2 * 1024 * 1024 + 1))).toThrow(/2 MiB/);
    expect(inventorySchema.safeParse({ ...fixture(), schemaVersion: 2 }).success).toBe(false);
    expect(inventorySchema.safeParse({ ...fixture(), command: "powershell" }).success).toBe(false);
  });
  it("rejeita seções/campos duplicados e fonte forjada fora do contrato", () => {
    const duplicate = fixture();
    duplicate.sections[1] = at(duplicate.sections);
    expect(inventorySchema.safeParse(duplicate).success).toBe(false);
    const fields = fixture();
    const firstFields = at(at(fields.sections).records).fields;
    firstFields[1] = at(firstFields);
    expect(inventorySchema.safeParse(fields).success).toBe(false);
    const source = fixture();
    at(source.sections).source = "remote telemetry";
    expect(inventorySchema.safeParse(source).success).toBe(false);
  });
  it("não aceita inconsistência de estado nem número não finito/inseguro", () => {
    const invalid = fixture();
    at(invalid.sections).confidence = "unknown";
    expect(inventorySchema.safeParse(invalid).success).toBe(false);
    for (const value of [Number.NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      const unsafe = fixture();
      at(at(at(unsafe.sections).records).fields).value = value;
      expect(inventorySchema.safeParse(unsafe).success).toBe(false);
    }
  });
  it("preserva desconhecido como null, separado de zero e dos erros", () => {
    const unknown = fixture() as unknown as Record<string, unknown>;
    const sections = unknown.sections as {
      status: string;
      records: { fields: { value: unknown; status: string; confidence: string }[] }[];
    }[];
    at(sections).status = "partial";
    Object.assign(at(at(at(sections).records).fields), {
      value: null,
      status: "unavailable",
      confidence: "unknown",
    });
    const parsed = inventorySchema.parse(unknown);
    expect(at(at(at(parsed.sections).records).fields).value).toBeNull();
    expect(at(parsed.sections).status).toBe("partial");
  });
  it("bloqueia relatório obsoleto e futuro sem aprovar execução de relatório recente", () => {
    const parsed = inventorySchema.parse(fixture());
    expect(assessInventory(parsed, new Date("2026-10-25T12:00:00Z"))).toContainEqual(
      expect.objectContaining({ id: "stale", status: "blocked" }),
    );
    expect(assessInventory(parsed, new Date("2026-10-20T12:00:00Z"))).toContainEqual(
      expect.objectContaining({ id: "future", status: "blocked" }),
    );
    const current = assessInventory(parsed, now);
    expect(current).toContainEqual(
      expect.objectContaining({ id: "windows", status: "requires-evidence" }),
    );
    expect(current).toContainEqual(expect.objectContaining({ id: "execution", status: "blocked" }));
  });
  it("limita diagnóstico GPU à evidência do fabricante, não autorização", () => {
    const raw = fixture();
    const gpu = raw.sections.find((item) => item.id === "gpu");
    if (!gpu) throw new Error("fixture");
    at(at(gpu.records).fields).value = "NVIDIA GeForce fixture";
    expect(assessInventory(inventorySchema.parse(raw), now)).toContainEqual(
      expect.objectContaining({
        id: "gpu",
        status: "requires-evidence",
        message: expect.stringContaining("NVIDIA"),
      }),
    );
    expect(assessInventory(inventorySchema.parse(fixture()), now)).toContainEqual(
      expect.objectContaining({ id: "gpu", status: "unknown" }),
    );
  });
});
