import { useRef, useState } from "react";
import {
  assessInventory,
  type Inventory,
  inventoryMaxBytes,
  parseInventory,
} from "../domain/inventory";

const statuses = {
  available: "Informado",
  partial: "Parcial",
  unavailable: "Indisponível",
  error: "Erro",
};
export function InventoryPanel() {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const request = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  async function importFile(file: File | undefined) {
    if (!file) return;
    const current = ++request.current;
    setBusy(true);
    setError("");
    try {
      if (file.size > inventoryMaxBytes) throw new Error("Arquivo excede 2 MiB.");
      const parsed = parseInventory(await file.text());
      if (current === request.current) setInventory(parsed);
    } catch (failure) {
      if (current === request.current)
        setError(failure instanceof Error ? failure.message : "Não foi possível ler o arquivo.");
    } finally {
      if (current === request.current) {
        setBusy(false);
        if (input.current) input.current.value = "";
      }
    }
  }
  function clear() {
    request.current++;
    setInventory(null);
    setError("");
    setBusy(false);
    if (input.current) input.current.value = "";
  }
  return (
    <section className="inventory-panel" aria-labelledby="inventory-heading">
      <h2 id="inventory-heading">
        Inventário somente leitura ·{" "}
        {inventory ? "relatório importado" : "nenhum relatório importado"}
      </h2>
      <p>
        Importe o JSON gerado por scripts/inventory/Collect-Inventory.ps1. Os dados ficam apenas
        nesta sessão; não são enviados nem persistidos. A importação não coleta dados
        automaticamente.
      </p>
      <label htmlFor="inventory-file">Importar inventário JSON (até 2 MiB)</label>{" "}
      <input
        ref={input}
        id="inventory-file"
        aria-label="Importar inventário JSON"
        type="file"
        accept=".json,application/json"
        disabled={busy}
        onChange={(event) => void importFile(event.target.files?.[0])}
      />
      <button type="button" onClick={clear} disabled={!inventory && !busy && !error}>
        Remover relatório da sessão
      </button>
      <p role="status">
        {busy
          ? "Validando arquivo…"
          : inventory
            ? "Relatório disponível para consulta. Nenhuma alteração aplicada."
            : "Inventário não disponível nesta sessão."}
      </p>
      {error && (
        <p role="alert">
          {error} {inventory && "O relatório anterior foi preservado."}
        </p>
      )}
      {inventory && (
        <>
          <p>
            Coletor {inventory.collector.name} {inventory.collector.version} · fim da coleta{" "}
            {new Date(inventory.collectedAt).toLocaleString("pt-BR")} · PowerShell{" "}
            {inventory.collector.powershellVersion}. A data e a origem são declarações do arquivo.
          </p>
          <h3>Triagem de compatibilidade</h3>
          <ul>
            {assessInventory(inventory).map((rule) => (
              <li key={rule.id}>
                <strong>
                  {rule.status === "blocked"
                    ? "Bloqueado"
                    : rule.status === "unknown"
                      ? "Desconhecido"
                      : "Requer evidência"}
                  :
                </strong>{" "}
                {rule.message}
              </li>
            ))}
          </ul>
          {inventory.sections.map((section) => (
            <details key={section.id}>
              <summary>
                {section.label} · {statuses[section.status]} · {section.records.length} registros
              </summary>
              <p>
                Fonte de todos os campos: {section.source}. Coleta:{" "}
                {new Date(section.collectedAt).toLocaleString("pt-BR")}. Confiabilidade:{" "}
                {section.confidence === "reported"
                  ? "informada pelo provedor, sem confirmação independente"
                  : "desconhecida"}
                .
              </p>
              {section.error && <p>{section.error.message}</p>}
              {section.status === "partial" && (
                <p>
                  Campos indisponíveis ou limite de 128 registros atingido. Ausência não equivale a
                  zero.
                </p>
              )}
              {section.records.map((record) => (
                <table key={record.index}>
                  <caption>
                    {section.label} · registro {record.index + 1}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Informação</th>
                      <th scope="col">Valor</th>
                      <th scope="col">Confiabilidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.fields.map((field) => (
                      <tr key={field.key}>
                        <th scope="row">{field.label}</th>
                        <td>
                          {field.value === null
                            ? "Indisponível"
                            : typeof field.value === "boolean"
                              ? field.value
                                ? "Sim"
                                : "Não"
                              : String(field.value)}
                          {field.value !== null && field.unit ? ` ${field.unit}` : ""}
                        </td>
                        <td>
                          {field.confidence === "reported"
                            ? "Informada pelo provedor"
                            : "Desconhecida"}
                          ; fonte e horário da seção
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
            </details>
          ))}
        </>
      )}
    </section>
  );
}
