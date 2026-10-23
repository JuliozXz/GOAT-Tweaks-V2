export interface LogEntry {
  id: number;
  time: string;
  event: string;
  severity: "info" | "error";
}
const entries: LogEntry[] = [];
let sequence = 0;
export function logEvent(
  event: "app-ready" | "preferences-unavailable" | "export-requested" | "render-failed",
  severity: LogEntry["severity"] = "info",
) {
  const entry = { id: ++sequence, time: new Date().toISOString(), event, severity };
  entries.push(entry);
  if (entries.length > 50) entries.shift();
  console.info(JSON.stringify({ application: "GOAT HUB Service", ...entry }));
}
export const getLogs = () => [...entries];
