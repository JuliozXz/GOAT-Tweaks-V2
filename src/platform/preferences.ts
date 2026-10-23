import { z } from "zod";

export const storageKey = "goat-hub.preferences.v1";
const preferencesSchema = z.strictObject({
  version: z.literal(1),
  compact: z.boolean(),
  selected: z.array(z.string()).max(1000),
  showRejected: z.boolean(),
});
export type Preferences = z.infer<typeof preferencesSchema>;
export const defaultPreferences: Preferences = {
  version: 1,
  compact: false,
  selected: [],
  showRejected: false,
};
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export function loadPreferences(storage: StoragePort): {
  value: Preferences;
  writable: boolean;
  warning?: string;
} {
  try {
    const raw = storage.getItem(storageKey);
    if (raw === null) return { value: { ...defaultPreferences, selected: [] }, writable: true };
    const result = preferencesSchema.safeParse(JSON.parse(raw));
    if (!result.success) throw new Error("invalid preferences");
    return { value: result.data, writable: true };
  } catch {
    return {
      value: { ...defaultPreferences, selected: [] },
      writable: false,
      warning:
        "Preferências indisponíveis ou incompatíveis. O conteúdo original foi preservado; esta sessão será temporária.",
    };
  }
}
export function savePreferences(storage: StoragePort, value: Preferences): string | undefined {
  try {
    storage.setItem(storageKey, JSON.stringify(preferencesSchema.parse(value)));
  } catch {
    return "Não foi possível salvar. Suas escolhas permanecem apenas nesta sessão; exporte a revisão para preservá-las.";
  }
}

// Access is deferred because the browser can deny even the localStorage getter.
export const browserStorage: StoragePort = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
};
