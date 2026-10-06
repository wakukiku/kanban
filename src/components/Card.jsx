import { useLanguage } from "../context/LanguageContext";
import { useSortable } from "@dnd-kit/sortable";
import { LABELS, transformStyle } from "../context/board";
import Icon from "./Icon";

export default function Card({ card, columnId, onEdit }) {
  const { t, language } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", columnId, title: card.title },
  });
  const overdue =
    card.deadline && new Date(`${card.deadline}T23:59:59`) < new Date();
  return (
    <article
      ref={setNodeRef}
      className={`card ${isDragging ? "drag-source" : ""}`}
      style={{ transform: transformStyle(transform), transition }}
    >
      <div className="card-top">
        <span className={`tag tag-${card.label}`}>{t(LABELS[card.label])}</span>
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="icon-button drag-handle"
          {...attributes}
          {...listeners}
          aria-roledescription={t("Sortable item")}
          aria-label={t("Move card: {title}", { title: card.title })}
        >
          <Icon name="grip" />
        </button>
      </div>
      <button
        type="button"
        className="card-open"
        onClick={() => onEdit(card, columnId)}
        aria-label={t("Edit card: {title}", { title: card.title })}
      >
        <h3>{card.title}</h3>
        {card.description && <p>{card.description}</p>}
      </button>
      {card.deadline && (
        <div className={`deadline ${overdue ? "overdue" : ""}`}>
          <Icon name="calendar" />
          <time dateTime={card.deadline}>
            {new Intl.DateTimeFormat(language, {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(`${card.deadline}T12:00:00`))}
          </time>
          {overdue && <span>{t("Overdue")}</span>}
        </div>
      )}
    </article>
  );
}
