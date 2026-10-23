import { z } from "zod";

export const categories = [
  { id: "cpu", name: "CPU", subtitle: "Processador e agendamento", glyph: "chip" },
  { id: "ram", name: "RAM", subtitle: "Memória e estabilidade", glyph: "memory" },
  { id: "gpu", name: "Placa de vídeo", subtitle: "Renderização e apresentação", glyph: "gpu" },
  { id: "storage", name: "Armazenamento", subtitle: "Unidades e integridade", glyph: "drive" },
  { id: "input", name: "Input", subtitle: "Dispositivos de entrada", glyph: "mouse" },
  { id: "latency", name: "Latência", subtitle: "Frametime e responsividade", glyph: "pulse" },
  { id: "network", name: "Rede", subtitle: "Conectividade e diagnóstico", glyph: "network" },
  { id: "windows", name: "Windows", subtitle: "Sistema e compatibilidade", glyph: "window" },
  { id: "bios", name: "BIOS", subtitle: "Firmware e plataforma", glyph: "chip" },
  { id: "power", name: "Energia", subtitle: "Consumo e comportamento térmico", glyph: "bolt" },
  { id: "drivers", name: "Drivers", subtitle: "Dispositivos e versões", glyph: "layers" },
  {
    id: "processes",
    name: "Processos e serviços",
    subtitle: "Atividade em segundo plano",
    glyph: "activity",
  },
  {
    id: "games",
    name: "Jogos e aplicativos",
    subtitle: "Perfis e condições de teste",
    glyph: "game",
  },
  { id: "peripherals", name: "Periféricos", subtitle: "Conexões e compatibilidade", glyph: "plug" },
  { id: "audio", name: "Áudio", subtitle: "Dispositivos e reprodução", glyph: "audio" },
  { id: "security", name: "Segurança", subtitle: "Proteção e integridade", glyph: "shield" },
  { id: "maintenance", name: "Manutenção", subtitle: "Conservação e verificação", glyph: "tool" },
  {
    id: "repair",
    name: "Diagnóstico e reparação",
    subtitle: "Sintomas, causas e recuperação",
    glyph: "search",
  },
] as const;

export type CategoryId = (typeof categories)[number]["id"];
export const categoryIds = categories.map((category) => category.id) as [
  CategoryId,
  ...CategoryId[],
];
export const levels = ["basic", "general", "advanced"] as const;
export type Level = (typeof levels)[number];
export const levelLabels = { basic: "Basic", general: "General", advanced: "Advanced" };
export const evidenceLabels = {
  2: "Documentação · efeito condicional",
  3: "Diagnóstico · sem promessa de FPS",
  4: "Experimental · evidência insuficiente",
  5: "Rejeitado · não recomendado",
};
export const dispositionLabels = {
  manual: "Orientação manual",
  "integration-pending": "Integração pendente",
  research: "Em pesquisa",
  rejected: "Rejeitado",
};
const text = z.string().trim().min(1);
const httpsUrl = z.url().refine((url) => new URL(url).protocol === "https:", "Fonte exige HTTPS");
export const recordSchema = z.strictObject({
  id: text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: text,
  category: z.enum(categoryIds),
  level: z.enum(levels),
  summary: text,
  mechanism: text,
  prerequisites: z.array(text).min(1),
  risks: z.array(text).min(1),
  validation: z.array(text).min(1),
  rollback: text,
  evidence: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  disposition: z.enum(["manual", "integration-pending", "research", "rejected"]),
  applicability: text,
  sources: z.array(z.strictObject({ title: text, url: httpsUrl })).min(1),
  reviewedAt: z.iso.date(),
  tags: z.array(text),
});
export type CatalogRecord = z.infer<typeof recordSchema>;
export const catalogSchema = z
  .array(recordSchema)
  .min(1)
  .superRefine((records, ctx) => {
    const ids = new Set<string>();
    records.forEach((record, index) => {
      if (ids.has(record.id))
        ctx.addIssue({ code: "custom", path: [index, "id"], message: "ID duplicado" });
      ids.add(record.id);
      if ((record.evidence === 5) !== (record.disposition === "rejected")) {
        ctx.addIssue({
          code: "custom",
          path: [index, "disposition"],
          message: "Rejeição deve corresponder à evidência",
        });
      }
    });
  });

export const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
export function searchRecords(records: CatalogRecord[], query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return records.filter((record) => {
    const haystack = normalize(
      [
        record.id,
        record.title,
        record.summary,
        record.mechanism,
        record.applicability,
        ...record.tags,
      ].join(" "),
    );
    return terms.every((term) => haystack.includes(term));
  });
}

export interface Route {
  category: CategoryId;
  level: Level;
  recordId?: string;
}
export function parseRoute(hash: string, records: CatalogRecord[]): Route {
  const parts = hash.replace(/^#\/?/, "").split("/");
  const category = categoryIds.includes(parts[0] as CategoryId) ? (parts[0] as CategoryId) : "cpu";
  const level = levels.includes(parts[1] as Level) ? (parts[1] as Level) : "basic";
  const record = records.find(
    (item) => item.id === parts[2] && item.category === category && item.level === level,
  );
  return { category, level, recordId: record?.id };
}
export function routeHash(route: Route) {
  return `#/${route.category}/${route.level}${route.recordId ? `/${route.recordId}` : ""}`;
}
export function canSelect(record: CatalogRecord) {
  return record.disposition !== "rejected";
}
export function sanitizeSelection(ids: string[], records: CatalogRecord[]) {
  const allowed = new Set(records.filter(canSelect).map((record) => record.id));
  return [...new Set(ids)].filter((id) => allowed.has(id));
}
export function createReviewPlan(records: CatalogRecord[], ids: string[], now: Date) {
  const selected = new Set(sanitizeSelection(ids, records));
  return {
    schemaVersion: 1,
    documentType: "research-review-plan",
    app: "GOAT HUB Service",
    appVersion: "0.1.0",
    createdAt: now.toISOString(),
    purpose: "Plano de revisão. Não autoriza execução nem comprova compatibilidade ou benefício.",
    machineInventory: null,
    appliedChanges: [],
    measuredResults: [],
    records: records
      .filter((record) => selected.has(record.id))
      .map((record) => ({
        ...record,
        compatibility: "unknown",
        execution: "not-implemented",
        implementationVersion: null,
      })),
  };
}
