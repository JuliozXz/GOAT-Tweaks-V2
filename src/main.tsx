import { Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import rawCatalog from "./data/catalog.json";
import { catalogSchema } from "./domain/catalog";
import { logEvent } from "./platform/log";
import "./styles.css";

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    logEvent("render-failed", "error");
  }
  render() {
    if (this.state.failed)
      return (
        <main className="startup-error">
          <h1>Não foi possível abrir o GOAT HUB</h1>
          <p>
            Seus dados locais foram preservados. Reabra o aplicativo e consulte o registro técnico
            se a falha persistir.
          </p>
          <button type="button" onClick={() => location.reload()}>
            Tentar novamente
          </button>
        </main>
      );
    return this.props.children;
  }
}
function ValidatedApp() {
  const records = catalogSchema.parse(rawCatalog);
  return <App records={records} />;
}
const root = document.getElementById("root");
if (!root) throw new Error("Elemento de inicialização ausente");
createRoot(root).render(
  <ErrorBoundary>
    <ValidatedApp />
  </ErrorBoundary>,
);
