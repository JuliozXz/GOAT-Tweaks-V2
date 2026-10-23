import { z } from "zod";

export const inventoryMaxBytes = 2 * 1024 * 1024;
export const inventorySections = {
  cpu: {
    className: "Win32_Processor",
    keys: ["Name", "Manufacturer", "NumberOfCores", "NumberOfLogicalProcessors", "MaxClockSpeed"],
  },
  memory: {
    className: "Win32_PhysicalMemory",
    keys: ["Manufacturer", "Capacity", "ConfiguredClockSpeed", "SMBIOSMemoryType"],
  },
  gpu: {
    className: "Win32_VideoController",
    keys: ["Name", "AdapterCompatibility", "VideoProcessor", "DriverVersion"],
  },
  baseboard: { className: "Win32_BaseBoard", keys: ["Manufacturer", "Product", "Version"] },
  bios: { className: "Win32_BIOS", keys: ["Manufacturer", "SMBIOSBIOSVersion", "ReleaseDate"] },
  os: {
    className: "Win32_OperatingSystem",
    keys: [
      "Caption",
      "Version",
      "BuildNumber",
      "OSArchitecture",
      "TotalVisibleMemorySize",
      "FreePhysicalMemory",
    ],
  },
  storage: {
    className: "Win32_DiskDrive",
    keys: ["Model", "MediaType", "InterfaceType", "Size", "Status"],
  },
  network: {
    className: "Win32_NetworkAdapter",
    keys: ["Name", "Manufacturer", "AdapterType", "Speed", "NetEnabled"],
  },
  drivers: {
    className: "Win32_PnPSignedDriver",
    keys: ["DeviceName", "DeviceClass", "Manufacturer", "DriverVersion", "DriverDate", "IsSigned"],
  },
} as const;
type SectionId = keyof typeof inventorySections;
const ids = Object.keys(inventorySections) as [SectionId, ...SectionId[]];
const text = z
  .string()
  .min(1)
  .max(256)
  .refine(
    (value) =>
      [...value].every(
        (character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127,
      ),
    "Caractere de controle inesperado",
  );
const confidence = z.enum(["reported", "unknown"]);
const field = z
  .strictObject({
    key: text,
    label: text,
    value: z.union([
      text,
      z.number().finite().min(-Number.MAX_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER),
      z.boolean(),
      z.null(),
    ]),
    unit: text.nullable(),
    status: z.enum(["reported", "unavailable"]),
    confidence,
  })
  .refine(
    (item) =>
      item.value === null
        ? item.status === "unavailable" && item.confidence === "unknown"
        : item.status === "reported" && item.confidence === "reported",
    "Estado de campo inconsistente",
  );
const section = z
  .strictObject({
    id: z.enum(ids),
    label: text,
    source: text,
    collectedAt: z.iso.datetime(),
    status: z.enum(["available", "partial", "unavailable", "error"]),
    confidence,
    records: z
      .array(
        z.strictObject({
          index: z.number().int().min(0).max(127),
          fields: z.array(field).min(1).max(16),
        }),
      )
      .max(128),
    error: z.strictObject({ code: z.literal("query-failed"), message: text }).nullable(),
  })
  .superRefine((item, ctx) => {
    const definition = inventorySections[item.id];
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });
    if (item.source !== `CIM root/cimv2 ${definition.className}`) fail("Fonte inesperada");
    if ((item.status === "error") !== (item.error !== null)) fail("Erro inconsistente");
    if ((item.status === "error" || item.status === "unavailable") !== (item.records.length === 0))
      fail("Registros inconsistentes");
    const reported = item.records
      .flatMap((record) => record.fields)
      .some((entry) => entry.status === "reported");
    if (item.confidence !== (reported ? "reported" : "unknown"))
      fail("Confiabilidade inconsistente");
    item.records.forEach((record, index) => {
      if (record.index !== index) fail("Índice inconsistente");
      if (new Set(record.fields.map((entry) => entry.key)).size !== record.fields.length)
        fail("Campo duplicado");
      if (
        record.fields.length !== definition.keys.length ||
        record.fields.some((entry) => !(definition.keys as readonly string[]).includes(entry.key))
      )
        fail("Campos fora do contrato");
      if (item.status === "available" && record.fields.some((entry) => entry.status !== "reported"))
        fail("Disponibilidade inconsistente");
    });
  });
export const inventorySchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    collector: z.strictObject({
      name: z.literal("goat-hub-cim"),
      version: z.literal("0.1.0"),
      powershellVersion: z.string().regex(/^\d+\.\d+(?:\.\d+){0,2}$/),
    }),
    collectedAt: z.iso.datetime(),
    sections: z.array(section).length(9),
  })
  .refine(
    (value) => new Set(value.sections.map((item) => item.id)).size === 9,
    "Seções duplicadas ou ausentes",
  );
export type Inventory = z.infer<typeof inventorySchema>;

export function parseInventory(json: string): Inventory {
  if (new TextEncoder().encode(json).byteLength > inventoryMaxBytes)
    throw new Error("Inventário excede 2 MiB.");
  try {
    return inventorySchema.parse(JSON.parse(json));
  } catch {
    throw new Error(
      "JSON de inventário inválido ou versão não suportada. Gere um novo arquivo com o coletor GOAT HUB.",
    );
  }
}

export type InventoryRule = {
  id: string;
  status: "requires-evidence" | "blocked" | "unknown";
  message: string;
};
export function assessInventory(inventory: Inventory, now = new Date()): InventoryRule[] {
  const rules: InventoryRule[] = [];
  const times = [inventory.collectedAt, ...inventory.sections.map((item) => item.collectedAt)].map(
    Date.parse,
  );
  if (times.some((time) => time > now.getTime() + 5 * 60_000))
    rules.push({
      id: "future",
      status: "blocked",
      message:
        "Relatório com horário futuro: confira o relógio e recolha o inventário antes de avaliar compatibilidade.",
    });
  else if (times.some((time) => now.getTime() - time > 24 * 60 * 60_000))
    rules.push({
      id: "stale",
      status: "blocked",
      message:
        "Inventário com mais de 24 horas: atualize a coleta antes de avaliar o estado atual.",
    });
  else
    rules.push({
      id: "freshness",
      status: "requires-evidence",
      message:
        "Horário recente segundo o arquivo. A origem e a máquina ainda precisam ser conferidas pelo técnico.",
    });
  const os = inventory.sections.find((item) => item.id === "os");
  const caption = os?.records[0]?.fields.find((item) => item.key === "Caption")?.value;
  rules.push(
    typeof caption === "string" && /\bWindows\b/i.test(caption)
      ? {
          id: "windows",
          status: "requires-evidence",
          message:
            "O arquivo informa Windows. Versão/build, suporte do fabricante e pré-condições de cada ajuste ainda exigem validação.",
        }
      : {
          id: "windows",
          status: "unknown",
          message:
            "Windows não confirmado no inventário. Não determinar compatibilidade a partir deste relatório.",
        },
  );
  const gpu = inventory.sections.find((item) => item.id === "gpu");
  const gpuNames =
    gpu?.records
      .flatMap((record) =>
        record.fields
          .filter((item) => item.key === "Name" || item.key === "AdapterCompatibility")
          .map((item) => String(item.value ?? "")),
      )
      .join(" ") ?? "";
  const vendors = ["NVIDIA", "AMD", "Intel"].filter((vendor) =>
    new RegExp(`\\b${vendor}\\b`, "i").test(gpuNames),
  );
  rules.push({
    id: "gpu",
    status: vendors.length ? "requires-evidence" : "unknown",
    message: vendors.length
      ? `Identificação informada: ${vendors.join(", ")}. Conferir modelo, driver e suporte específico; não autoriza perfis ou alterações.`
      : "Fabricante GPU não confirmado. Não presumir suporte a APIs ou perfis específicos.",
  });
  rules.push({
    id: "execution",
    status: "blocked",
    message:
      "Inventário importado não é atestado de origem e não aprova execução. Executor, reversão e validação de ajustes continuam pendentes.",
  });
  return rules;
}
