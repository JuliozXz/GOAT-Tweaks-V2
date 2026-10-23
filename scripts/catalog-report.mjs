import { createHash } from "node:crypto";
import fs from "node:fs";

const records = JSON.parse(fs.readFileSync("src/data/catalog.json", "utf8"));
const categories = [...new Set(records.map((record) => record.category))];
const coverage = categories.flatMap((category) => ["basic", "general", "advanced"].map((level) => {
  const group = records.filter((record) => record.category === category && record.level === level);
  return {
    category, level, researched: group.length,
    approvedForExecution: 0, implementedActions: 0, testedActions: 0,
    rejected: group.filter((record) => record.disposition === "rejected").length,
    pending: group.filter((record) => record.disposition !== "rejected").length,
  };
}));
const manifest = {
  schemaVersion: 1,
  catalogVersion: "0.1.0",
  builtAt: new Date().toISOString(),
  sourceFile: "src/data/catalog.json",
  sha256: createHash("sha256").update(fs.readFileSync("src/data/catalog.json")).digest("hex"),
  recordCount: records.length,
  sourceCount: new Set(records.flatMap((record) => record.sources.map((source) => source.url))).size,
  meaning: "Metadados de pesquisa. Não comprova benefício, integração ou execução.",
  coverage,
};
fs.mkdirSync("docs/validation", { recursive: true });
fs.writeFileSync("docs/validation/catalog-manifest.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`${manifest.recordCount} registros; ${manifest.sourceCount} fontes; ${coverage.length} células de cobertura. SHA-256 ${manifest.sha256}`);
