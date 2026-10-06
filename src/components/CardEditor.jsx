import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";
import { useBoard } from "../context/BoardContext";
import { isValidDate, LABELS, uid } from "../context/board";
import Modal from "./Modal";
import Icon from "./Icon";

export default function CardEditor({ card, columnId, onClose, onDelete }) {
  const { t } = useLanguage();
  const { board, dispatch } = useBoard();
  const [draft, setDraft] = useState(
    card || { title: "", description: "", label: "none", deadline: "" },
  );
  const [destination, setDestination] = useState(columnId);
  const [error, setError] = useState("");
  const update = (event) => {
    const { name, value } = event.target;
    setDraft((previous) => ({ ...previous, [name]: value }));
  };
  function save(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = {
      title: form.get("title").trim(),
      description: form.get("description"),
      label: form.get("label"),
      deadline: form.get("deadline"),
    };
    if (!values.title) return setError("Give this card a title.");
    if (!isValidDate(values.deadline))
      return setError("Choose a valid deadline.");
    if (
      !card &&
      board.columns.reduce((sum, c) => sum + c.cards.length, 0) >= 5000
    )
      return setError("The board limit is 5,000 cards.");
    dispatch({
      type: "SAVE_CARD",
      columnId: destination,
      card: { ...values, id: card?.id || uid() },
    });
    onClose();
  }
  return (
    <Modal title={t(card ? "Edit card" : "New card")} onClose={onClose}>
      <form onSubmit={save} className="editor">
        <label>
          {t("Title")}
          <input
            data-autofocus
            required
            maxLength={120}
            name="title"
            value={draft.title}
            onChange={update}
          />
        </label>
        <label>
          {t("Description")}
          <textarea
            rows={4}
            maxLength={5000}
            name="description"
            value={draft.description}
            onChange={update}
          />
        </label>
        <div className="form-row">
          <label>
            {t("Label")}
            <select name="label" value={draft.label} onChange={update}>
              {Object.entries(LABELS).map(([value, text]) => (
                <option key={value} value={value}>
                  {t(text)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("Deadline")}
            <input
              type="date"
              min="0001-01-01"
              max="9999-12-31"
              name="deadline"
              value={draft.deadline}
              onChange={update}
            />
          </label>
        </div>
        <label>
          {t("Column")}
          <select
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          >
            {board.columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.title}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <p role="alert" className="form-error">
            {t(error)}
          </p>
        )}
        <footer className="form-footer">
          {card && (
            <button
              type="button"
              className="icon-button danger"
              onClick={() => onDelete(card)}
              aria-label={t("Delete card: {title}", { title: card.title })}
            >
              <Icon name="trash" />
            </button>
          )}
          <button type="button" onClick={onClose}>
            {t("Cancel")}
          </button>
          <button className="primary" type="submit">
            {t(card ? "Save changes" : "Add card")}
            <Icon name="arrow" />
          </button>
        </footer>
      </form>
    </Modal>
  );
}
