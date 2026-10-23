import { useEffect, useMemo, useRef, useState } from "react";
import {
  type CatalogRecord,
  canSelect,
  categories,
  createReviewPlan,
  dispositionLabels,
  evidenceLabels,
  levelLabels,
  levels,
  parseRoute,
  type Route,
  routeHash,
  sanitizeSelection,
  searchRecords,
} from "../domain/catalog";
import { getLogs, logEvent } from "../platform/log";
import {
  browserStorage,
  loadPreferences,
  type Preferences,
  savePreferences,
} from "../platform/preferences";
import { isNative } from "../platform/window";
import { Icon } from "./Icon";
import { InventoryPanel } from "./InventoryPanel";

type DialogKind = "review" | "about" | null;
export function App({ records }: { records: CatalogRecord[] }) {
  const [loaded] = useState(() => loadPreferences(browserStorage));
  const [preferences, setPreferences] = useState<Preferences>(() => ({
    ...loaded.value,
    selected: sanitizeSelection(loaded.value.selected, records),
  }));
  const [warning, setWarning] = useState(loaded.warning);
  const [notice, setNotice] = useState("");
  const [route, setRoute] = useState(() => parseRoute(location.hash, records));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("name");
  const [onlySelected, setOnlySelected] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    logEvent("app-ready");
    if (loaded.warning) logEvent("preferences-unavailable", "error");
    const handleHash = () => setRoute(parseRoute(location.hash, records));
    const shortcuts = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k" &&
        !dialogRef.current?.open
      ) {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("hashchange", handleHash);
    window.addEventListener("keydown", shortcuts);
    return () => {
      window.removeEventListener("hashchange", handleHash);
      window.removeEventListener("keydown", shortcuts);
    };
  }, [records, loaded.warning]);

  useEffect(() => {
    if (dialog) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [dialog]);

  function updatePreferences(next: Preferences) {
    setPreferences(next);
    if (loaded.writable) {
      const error = savePreferences(browserStorage, next);
      setWarning(error);
      if (error) logEvent("preferences-unavailable", "error");
    }
  }
  function navigate(next: Route) {
    location.hash = routeHash(next);
    setRoute(next);
    setQuery("");
    setFilter("all");
    setOnlySelected(false);
  }
  function openRecord(record: CatalogRecord) {
    navigate({ category: record.category, level: record.level, recordId: record.id });
    requestAnimationFrame(() => detailHeading.current?.focus());
  }
  function toggleSelection(record: CatalogRecord) {
    if (!canSelect(record)) return;
    const selected = preferences.selected.includes(record.id)
      ? preferences.selected.filter((id) => id !== record.id)
      : [...preferences.selected, record.id];
    updatePreferences({ ...preferences, selected });
  }
  function exportPlan() {
    try {
      const plan = createReviewPlan(records, preferences.selected, new Date());
      const blob = new Blob([JSON.stringify(plan, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `goat-hub-revisao-${plan.createdAt.slice(0, 10)}.json`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      logEvent("export-requested");
      setNotice("Download do plano solicitado. Confirme o arquivo na pasta de downloads.");
    } catch {
      setNotice("Não foi possível preparar a exportação. Sua seleção foi preservada.");
    }
  }

  const category = categories.find((item) => item.id === route.category) ?? categories[0];
  const selectedRecords = records.filter((record) => preferences.selected.includes(record.id));
  const searching = query.trim().length > 0;
  const visibleRecords = useMemo(() => {
    const source = searching
      ? searchRecords(records, query)
      : records.filter(
          (record) => record.category === route.category && record.level === route.level,
        );
    return source
      .filter(
        (record) =>
          (preferences.showRejected || record.disposition !== "rejected") &&
          (filter === "all" || record.disposition === filter) &&
          (!onlySelected || preferences.selected.includes(record.id)),
      )
      .sort((a, b) =>
        sort === "evidence"
          ? a.evidence - b.evidence || a.title.localeCompare(b.title, "pt-BR")
          : a.title.localeCompare(b.title, "pt-BR"),
      );
  }, [records, searching, query, route, preferences, filter, onlySelected, sort]);
  const current =
    visibleRecords.find((record) => record.id === route.recordId) ?? visibleRecords[0];
  const categoryRecords = records.filter((record) => record.category === route.category);
  const totalCandidates = records.filter(canSelect).length;
  const excludedCount = records.filter((record) => !canSelect(record)).length;
  return (
    <div className={`app ${preferences.compact ? "compact" : ""}`}>
      <button
        type="button"
        className="skip-link"
        onClick={() => document.getElementById("workspace")?.focus()}
      >
        Pular para o conteúdo
      </button>
      <aside className="sidebar">
        <div className="brand">
          <div>
            <strong>
              GOAT HUB<span className="brand-dot">.</span>
            </strong>
            <small>GOAT TWEAKS / SERVICE</small>
          </div>
        </div>
        <div className="nav-label">
          ÁREAS DE TRABALHO <span>{categories.length}</span>
        </div>
        <nav aria-label="Categorias" className="category-nav">
          {categories.map((item) => (
            <a
              key={item.id}
              href={routeHash({ category: item.id, level: "basic" })}
              aria-current={route.category === item.id && !searching ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                navigate({ category: item.id, level: "basic" });
              }}
            >
              <Icon name={item.glyph} />
              <span>{item.name}</span>
              <small>{records.filter((record) => record.category === item.id).length}</small>
            </a>
          ))}
        </nav>
        <button type="button" className="sidebar-about" onClick={() => setDialog("about")}>
          <Icon name="layers" />
          <span>
            Sobre esta versão<small>Desenvolvimento · 0.1.0</small>
          </span>
          <span aria-hidden="true">↗</span>
        </button>
      </aside>

      <div className="shell">
        <header className="topbar">
          <div className="workspace-label">
            <span className="status-dot" />
            ESPAÇO DO TÉCNICO<span className="separator">/</span>
            <span>Consulta</span>
          </div>
          <label className="search-box">
            <Icon name="search" />
            <input
              ref={searchRef}
              type="search"
              aria-label="Buscar em todo o catálogo"
              placeholder="Buscar ajuste, sintoma ou componente…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <kbd>Ctrl K</kbd>
          </label>
        </header>

        <section className="mode-banner" aria-label="Modo de operação">
          <Icon name="shield" size={16} />
          <span>
            <strong>Modo de consulta</strong> · Inventário por importação. Nenhum ajuste executável
            ou alteração aplicada ao computador.
          </span>
          <span className="environment">{isNative() ? "DESKTOP" : "NAVEGADOR"}</span>
        </section>
        {warning && (
          <div role="alert" className="warning-banner">
            {warning}
          </div>
        )}
        <div className="work-columns">
          <main id="workspace" tabIndex={-1}>
            <section className="page-heading">
              <p className="eyebrow">
                {searching
                  ? "DESCOBERTA / TODAS AS CATEGORIAS"
                  : `CATÁLOGO TÉCNICO / ${category.id.toUpperCase()}`}
              </p>
              <div className="heading-line">
                <h1>{searching ? "Busca no catálogo" : category.name}</h1>
                <span className="outline-tag">
                  {searching ? visibleRecords.length : categoryRecords.length} registros
                </span>
              </div>
              <p>
                {searching
                  ? "Encontre a referência e abra o registro na categoria original."
                  : `${category.subtitle}. Entenda a evidência antes de planejar qualquer intervenção.`}
              </p>
            </section>

            <InventoryPanel />

            {!searching && (
              <nav className="level-tabs" aria-label="Níveis da categoria">
                {levels.map((level) => (
                  <button
                    type="button"
                    key={level}
                    aria-pressed={route.level === level}
                    onClick={() => navigate({ category: route.category, level })}
                  >
                    {levelLabels[level]}
                    <span>{categoryRecords.filter((record) => record.level === level).length}</span>
                  </button>
                ))}
              </nav>
            )}

            <div className="filters">
              <label>
                Status
                <select
                  aria-label="Filtrar por status"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  <option value="all">Todos os status</option>
                  {Object.entries(dispositionLabels).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Ordenar
                <select
                  aria-label="Ordenar registros"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="name">Nome A–Z</option>
                  <option value="evidence">Classe de evidência</option>
                </select>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={onlySelected}
                  onChange={(event) => setOnlySelected(event.target.checked)}
                />
                Só selecionados
              </label>
            </div>
            <div className="results-heading">
              <span>
                {visibleRecords.length}{" "}
                {visibleRecords.length === 1 ? "registro encontrado" : "registros encontrados"}
              </span>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.showRejected}
                  onChange={(event) =>
                    updatePreferences({ ...preferences, showRejected: event.target.checked })
                  }
                />
                Incluir rejeitados
              </label>
            </div>
            <section className="record-list" aria-label="Registros do catálogo">
              {visibleRecords.map((record) => (
                <article
                  key={record.id}
                  className={`record-row ${record.id === current?.id ? "active" : ""}`}
                >
                  <input
                    type="checkbox"
                    aria-label={`Selecionar ${record.title}`}
                    disabled={!canSelect(record)}
                    checked={preferences.selected.includes(record.id)}
                    onChange={() => toggleSelection(record)}
                  />
                  <div className="record-content">
                    <span className="record-kicker">
                      {searching
                        ? `${categories.find((c) => c.id === record.category)?.name} / ${levelLabels[record.level]}`
                        : record.id}
                    </span>
                    <button
                      type="button"
                      className="record-open"
                      onClick={() => openRecord(record)}
                    >
                      <span className="sr-only">Ver detalhes: </span>
                      <strong>{record.title}</strong>
                    </button>
                    <span className="record-summary">{record.summary}</span>
                    <span className="record-meta">
                      <span className={`badge status-${record.disposition}`}>
                        {dispositionLabels[record.disposition]}
                      </span>
                      <span>Compatibilidade desconhecida</span>
                    </span>
                  </div>
                  <Icon name="arrow" size={16} />
                </article>
              ))}
              {visibleRecords.length === 0 && (
                <div className="empty-state">
                  <Icon name="search" size={32} />
                  <h2>Nenhum registro neste recorte</h2>
                  <p>
                    Este nível pode estar em pesquisa ou os filtros podem ter ocultado os registros.
                  </p>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                      setOnlySelected(false);
                    }}
                  >
                    Limpar busca e filtros
                  </button>
                </div>
              )}
            </section>
            <div className="research-note">
              <Icon name="layers" />
              <p>
                <strong>Um catálogo em revisão contínua.</strong> São {totalCandidates} candidatos e{" "}
                {excludedCount} itens rejeitados. A documentação sustenta a investigação; o
                benefício nesta máquina ainda precisa ser medido.
              </p>
            </div>
          </main>

          <aside className="detail-panel" aria-label="Detalhes do registro">
            {current ? (
              <>
                <div className="detail-top">
                  <span className="eyebrow">LEITURA TÉCNICA</span>
                  <span className="small-code">v0.1 / pesquisa</span>
                </div>
                <span className={`badge status-${current.disposition}`}>
                  {dispositionLabels[current.disposition]}
                </span>
                <h2 ref={detailHeading} tabIndex={-1}>
                  {current.title}
                </h2>
                <p className="detail-summary">{current.summary}</p>
                <div className="evidence-box">
                  <Icon name="shield" />
                  <div>
                    <strong>{evidenceLabels[current.evidence]}</strong>
                    <p>Compatibilidade não verificada. Nenhum ganho medido neste equipamento.</p>
                  </div>
                </div>
                <section>
                  <h3>Como funciona</h3>
                  <p>{current.mechanism}</p>
                </section>
                <section>
                  <h3>Aplicabilidade</h3>
                  <p>{current.applicability}</p>
                  <ul>
                    {current.prerequisites.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3>Riscos e limites</h3>
                  <ul>
                    {current.risks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3>Como validar</h3>
                  <ol>
                    {current.validation.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </section>
                <section>
                  <h3>Restauração prevista</h3>
                  <p>{current.rollback}</p>
                  <p className="quiet-note">
                    Procedimento de pesquisa; nenhuma reversão foi executada ou validada por esta
                    versão.
                  </p>
                </section>
                <section>
                  <h3>Fontes técnicas</h3>
                  <ul className="sources">
                    {current.sources.map((source) => (
                      <li key={source.url}>
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                          {source.title}
                          <span aria-hidden="true"> ↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="quiet-note">
                    Revisão documental: {current.reviewedAt}. ID: {current.id}.
                  </p>
                </section>
                <div className="detail-action">
                  <button
                    type="button"
                    className={
                      preferences.selected.includes(current.id)
                        ? "secondary-button"
                        : "primary-button"
                    }
                    disabled={!canSelect(current)}
                    onClick={() => toggleSelection(current)}
                  >
                    {!canSelect(current)
                      ? "Item rejeitado para aplicação"
                      : preferences.selected.includes(current.id)
                        ? "Remover da revisão"
                        : "Adicionar à revisão"}
                    <Icon name={preferences.selected.includes(current.id) ? "check" : "arrow"} />
                  </button>
                  <small>Selecionar não executa nem recomenda o ajuste.</small>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <Icon name="layers" size={32} />
                <h2>Selecione um registro</h2>
                <p>Fontes, riscos e critérios de validação ficam reunidos aqui.</p>
              </div>
            )}
          </aside>
        </div>

        <footer className="bottom-bar">
          <div className="selection-total">
            <span>{preferences.selected.length.toString().padStart(2, "0")}</span>
            <div>
              <strong>registros em revisão</strong>
              <small>Nenhuma execução autorizada</small>
            </div>
          </div>
          <label className="checkbox-label density-toggle">
            <input
              type="checkbox"
              checked={preferences.compact}
              onChange={(event) =>
                updatePreferences({ ...preferences, compact: event.target.checked })
              }
            />
            Modo compacto
          </label>
          <span className="footer-note">
            <Icon name="shield" size={15} />
            Dados locais · sem telemetria
          </span>
          <button type="button" className="primary-button" onClick={() => setDialog("review")}>
            Revisar seleção
            <Icon name="arrow" />
          </button>
        </footer>
      </div>

      <div role="status" className={notice ? "notice" : "sr-only"}>
        {notice}
        {notice && (
          <button type="button" aria-label="Fechar mensagem" onClick={() => setNotice("")}>
            <Icon name="close" size={16} />
          </button>
        )}
      </div>
      <dialog
        ref={dialogRef}
        aria-labelledby="dialog-heading"
        onClose={() => setDialog(null)}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = [
            ...event.currentTarget.querySelectorAll<HTMLElement>(
              'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          ].filter((element) => element.getClientRects().length > 0 && element.tabIndex >= 0);
          const first = controls[0];
          const last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="dialog-header">
          <p className="eyebrow">GOAT HUB SERVICE</p>
          <button
            type="button"
            className="icon-button"
            aria-label="Fechar diálogo"
            onClick={() => setDialog(null)}
          >
            <Icon name="close" />
          </button>
        </div>
        {dialog === "review" ? (
          <>
            <h2 id="dialog-heading">Revisão do plano</h2>
            <p>
              Confirme o que merece investigação. Este plano não executa ajustes, não comprova
              compatibilidade e não contém resultados de benchmark.
            </p>
            <div className="review-summary">
              <strong>{selectedRecords.length} selecionados</strong>
              <span>0 implementações de ajustes</span>
              <span>Restauração ainda não testada</span>
            </div>
            <ul className="review-list">
              {selectedRecords.map((record) => (
                <li key={record.id}>
                  <div>
                    <strong>{record.title}</strong>
                    <small>
                      {dispositionLabels[record.disposition]} · {levelLabels[record.level]}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => toggleSelection(record)}
                    aria-label={`Remover ${record.title}`}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
            {selectedRecords.length === 0 && (
              <p className="empty-hint">
                Selecione registros no catálogo para preparar uma revisão.
              </p>
            )}
            <div className="dialog-footer">
              <button type="button" className="secondary-button" onClick={() => setDialog(null)}>
                Continuar pesquisando
              </button>
              <button
                type="button"
                className="primary-button"
                disabled={selectedRecords.length === 0}
                onClick={exportPlan}
              >
                Exportar plano JSON
                <Icon name="arrow" />
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="dialog-heading">Fundação em desenvolvimento</h2>
            <p>GOAT HUB Service 0.1.0 · GOAT Tweaks</p>
            <p>
              Disponíveis: catálogo de pesquisa, busca, filtros, seleção e exportação de plano.
              Inventário por importação de JSON e triagem inicial estão disponíveis. Coleta
              integrada, sensores, execução, rollback, benchmark e relatórios de atendimento
              pertencem às próximas fases.
            </p>
            <p>
              As preferências ficam neste dispositivo. O coletor PowerShell é executado
              separadamente pelo técnico; os relatórios importados ficam apenas na memória desta
              sessão. Nenhuma telemetria é enviada. Os links de referência abrem fontes externas
              somente por sua ação.
            </p>
            <h3>Registro desta sessão de interface</h3>
            <ul className="session-log">
              {getLogs().map((entry) => (
                <li key={entry.id}>
                  <code>{entry.time}</code>
                  <span>{entry.event}</span>
                </li>
              ))}
            </ul>
            <p className="quiet-note">
              Log temporário, limitado a 50 eventos técnicos. Não é histórico de atendimento.
            </p>
          </>
        )}
      </dialog>
    </div>
  );
}
