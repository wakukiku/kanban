import { useLanguage } from "../context/LanguageContext";
import { useRef } from "react";
import { LABELS } from "../context/board";
import Icon from "./Icon";

export default function Toolbar({
  query,
  setQuery,
  label,
  setLabel,
  theme,
  toggleTheme,
  onExport,
  onImport,
  onAdd,
}) {
  const { t } = useLanguage();
  const fileRef = useRef(null);
  return (
    <div className="toolbar">
      <label className="search">
        <Icon name="search" />
        <span className="sr-only">{t("Search cards")}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("Search cards")}
        />
      </label>
      <label className="filter">
        <span className="sr-only">{t("Filter by label")}</span>
        <select
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        >
          <option value="all">{t("All labels")}</option>
          {Object.entries(LABELS).map(([value, text]) => (
            <option key={value} value={value}>
              {t(text)}
            </option>
          ))}
        </select>
      </label>
      <div className="toolbar-actions">
        <button
          type="button"
          onClick={onExport}
          aria-label={t("Export board as JSON")}
        >
          <Icon name="download" />
          <span>{t("Export")}</span>
        </button>
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          aria-label={t("Import board from JSON")}
        >
          <Icon name="upload" />
          <span>{t("Import")}</span>
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={toggleTheme}
          aria-label={t(
            theme === "light"
              ? "Switch to dark theme"
              : "Switch to light theme",
          )}
        >
          <Icon name={theme === "light" ? "moon" : "sun"} />
        </button>
        <button
          id="add-column"
          type="button"
          className="primary"
          onClick={onAdd}
          aria-label={t("Add column")}
        >
          <Icon name="plus" />
          {t("Column")}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        className="sr-only"
        tabIndex={-1}
        accept="application/json,.json"
        aria-label={t("Choose a board JSON file")}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onImport(file);
        }}
      />
    </div>
  );
}
