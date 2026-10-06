import { useEffect, useState } from "react";
import { useBoard } from "./context/BoardContext";
import { parseBoard, uid } from "./context/board";
import Board from "./components/Board";
import CardEditor from "./components/CardEditor";
import Modal from "./components/Modal";
import Toolbar from "./components/Toolbar";
import LanguageSwitch from "./components/LanguageSwitch";
import AuthorMark from "./components/AuthorMark";
import { useLanguage } from "./context/LanguageContext";

function readTheme() {
  try {
    const saved = localStorage.getItem("kanban-press:theme");
    if (["light", "dark"].includes(saved)) return saved;
  } catch {
    /* Если сохранённой темы нет, используем системную. */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function App() {
  const { t } = useLanguage();
  const { board, rawBoard, dispatch, storageError, resumeSaving } = useBoard();
  const [query, setQuery] = useState("");
  const [label, setLabel] = useState("all");
  const [theme, setTheme] = useState(readTheme);
  const [modal, setModal] = useState(null);
  const [columnTitle, setColumnTitle] = useState("");
  const [notice, setNotice] = useState("");
  const total = board.columns.reduce(
    (sum, column) => sum + column.cards.length,
    0,
  );
  const close = () => setModal(null);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content =
      theme === "light" ? "#f3efe5" : "#20221e";
    try {
      localStorage.setItem("kanban-press:theme", theme);
    } catch {
      setNotice(
        "Theme changed for this session; browser storage is unavailable.",
      );
    }
  }, [theme]);
  function editColumn(column) {
    if (!column && board.columns.length >= 100)
      return setNotice("The board limit is 100 columns.");
    setColumnTitle(column?.title || "");
    setModal({ type: "column", column });
  }
  function exportBoard() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(rawBoard, null, 2)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `kanban-press-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("JSON export downloaded.");
  }
  async function importBoard(file) {
    try {
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Choose a JSON file smaller than 5 MB.");
      const imported = parseBoard(await file.text());
      setModal({
        type: "confirm",
        title: "Replace the current board?",
        message:
          "Import {columns} columns and {cards} cards. Export the current board first if you want to keep it.",
        values: {
          columns: imported.columns.length,
          cards: imported.columns.reduce((sum, c) => sum + c.cards.length, 0),
        },
        confirm: "Replace board",
        action: () => {
          dispatch({ type: "IMPORT", board: imported });
          resumeSaving();
          setQuery("");
          setLabel("all");
          setNotice("Board imported.");
        },
      });
    } catch (error) {
      setNotice({
        error:
          error instanceof SyntaxError
            ? "This file is not valid JSON."
            : error.name === "Error"
              ? error.message
              : "Could not read this file.",
      });
    }
  }
  function confirmDelete(kind, item) {
    setModal({
      type: "confirm",
      title: kind === "column" ? "Delete this column?" : "Delete this card?",
      message:
        kind === "column"
          ? "“{title}” and its {count} cards will be removed permanently."
          : "“{title}” will be removed permanently.",
      values: { title: item.title, count: item.cards?.length },
      confirm: "Delete",
      action: () =>
        dispatch({
          type: kind === "column" ? "DELETE_COLUMN" : "DELETE_CARD",
          id: item.id,
        }),
    });
  }
  return (
    <>
      <a href="#workspace" className="skip-link">
        {t("Skip to board")}
      </a>
      <header className="masthead">
        <h1 className="app-title">{t("Kanban")}</h1>
        <LanguageSwitch />
      </header>
      <main id="workspace">
        <Toolbar
          query={query}
          setQuery={setQuery}
          label={label}
          setLabel={setLabel}
          theme={theme}
          toggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
          onExport={exportBoard}
          onImport={importBoard}
          onAdd={() => editColumn(null)}
        />
        <div className="status" role="status" aria-live="polite">
          {notice && (
            <span>
              {typeof notice === "string"
                ? t(notice)
                : `${t("Import failed.")} ${t(notice.error)}`}
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label={t("Dismiss notification")}
              >
                {t("Dismiss")}
              </button>
            </span>
          )}
        </div>
        {storageError && (
          <p className="storage-error" role="alert">
            {t(storageError)}
          </p>
        )}
        <Board
          query={query}
          label={label}
          onEdit={(card, columnId) =>
            setModal({ type: "card", card, columnId })
          }
          onAdd={(columnId) => setModal({ type: "card", columnId })}
          onRename={editColumn}
          onDelete={(column) => confirmDelete("column", column)}
        />
        <footer className="board-footer">
          <span>
            {t("COLUMNS")}: {board.columns.length} / {t("CARDS")}: {total}
          </span>
        </footer>
      </main>
      <AuthorMark />
      {modal?.type === "card" && (
        <CardEditor
          card={modal.card}
          columnId={modal.columnId}
          onClose={close}
          onDelete={(card) => confirmDelete("card", card)}
        />
      )}
      {modal?.type === "column" && (
        <Modal
          title={t(modal.column ? "Rename column" : "New column")}
          onClose={close}
        >
          <form
            className="editor"
            onSubmit={(event) => {
              event.preventDefault();
              if (!columnTitle.trim()) return;
              dispatch({
                type: modal.column ? "RENAME_COLUMN" : "ADD_COLUMN",
                id: modal.column?.id || uid(),
                title: columnTitle.trim(),
              });
              close();
            }}
          >
            <label>
              {t("Column name")}
              <input
                data-autofocus
                required
                maxLength={60}
                value={columnTitle}
                onChange={(event) => setColumnTitle(event.target.value)}
              />
            </label>
            <footer className="form-footer">
              <button type="button" onClick={close}>
                {t("Cancel")}
              </button>
              <button
                type="submit"
                className="primary"
                disabled={!columnTitle.trim()}
              >
                {t("Save column")}
              </button>
            </footer>
          </form>
        </Modal>
      )}
      {modal?.type === "confirm" && (
        <Modal title={t(modal.title)} onClose={close}>
          <div className="editor">
            <p>{t(modal.message, modal.values)}</p>
            <footer className="form-footer">
              <button type="button" data-autofocus onClick={close}>
                {t("Keep current")}
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => {
                  modal.action();
                  close();
                }}
              >
                {t(modal.confirm)}
              </button>
            </footer>
          </div>
        </Modal>
      )}
    </>
  );
}
