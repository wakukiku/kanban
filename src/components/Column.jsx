import { useLanguage } from "../context/LanguageContext";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { transformStyle } from "../context/board";
import Card from "./Card";
import Icon from "./Icon";

export default function Column({
  column,
  cards,
  onEdit,
  onAdd,
  onRename,
  onDelete,
}) {
  const { t } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: column.id,
    data: { type: "column", title: column.title },
  });
  return (
    <section
      ref={setNodeRef}
      aria-label={column.title}
      className={`column ${isDragging ? "drag-source" : ""} ${isOver ? "drop-target" : ""}`}
      style={{ transform: transformStyle(transform), transition }}
    >
      <header className="column-header">
        <h2>{column.title}</h2>
        <span
          className="count"
          aria-label={t("{count} cards", { count: column.cards.length })}
        >
          {column.cards.length}
        </span>
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="icon-button drag-handle"
          {...attributes}
          {...listeners}
          aria-roledescription={t("Sortable item")}
          aria-label={t("Move column: {title}", { title: column.title })}
        >
          <Icon name="grip" />
        </button>
      </header>
      <div className="column-actions">
        <button
          type="button"
          onClick={() => onRename(column)}
          aria-label={t("Rename {title}", { title: column.title })}
        >
          <Icon name="edit" />
          {t("Rename")}
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => onDelete(column)}
          aria-label={t("Delete column: {title}", { title: column.title })}
        >
          <Icon name="trash" />
        </button>
      </div>
      <SortableContext
        items={cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="card-list">
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              columnId={column.id}
              onEdit={onEdit}
            />
          ))}
          {!cards.length && (
            <div className="empty-column">
              <p>{t(column.cards.length ? "No results" : "No cards")}</p>
            </div>
          )}
        </div>
      </SortableContext>
      <button
        type="button"
        className="add-card"
        onClick={() => onAdd(column.id)}
        aria-label={t("Add card to {title}", { title: column.title })}
      >
        <Icon name="plus" />
        {t("Add a card")}
      </button>
    </section>
  );
}
