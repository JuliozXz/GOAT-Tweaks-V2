import { describe, expect, it } from "vitest";
import { defaultPreferences, loadPreferences, savePreferences, storageKey } from "./preferences";

describe("preferências", () => {
  it("persiste seleção e preferências tipadas", () => {
    const data = new Map<string, string>();
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        data.set(key, value);
      },
    };
    const value = { ...defaultPreferences, compact: true, selected: ["cpu-power"] };
    expect(savePreferences(storage, value)).toBeUndefined();
    expect(loadPreferences(storage).value).toEqual(value);
    expect(data.has(storageKey)).toBe(true);
  });
  it.each([
    "{broken",
    '{"version":99}',
    '{"version":1,"compact":"false","selected":[],"showRejected":false}',
  ])("preserva estado inválido: %s", (raw) => {
    let writes = 0;
    const result = loadPreferences({
      getItem: () => raw,
      setItem: () => {
        writes++;
      },
    });
    expect(result.writable).toBe(false);
    expect(result.warning).toBeTruthy();
    expect(writes).toBe(0);
  });
  it("reporta falha de acesso e cota sem declarar sucesso", () => {
    const blocked = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(loadPreferences(blocked).writable).toBe(false);
    expect(savePreferences(blocked, defaultPreferences)).toContain("Não foi possível salvar");
  });
});
