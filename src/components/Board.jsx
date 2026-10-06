import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useBoard } from "../context/BoardContext";
import Column from "./Column";

function keyboardCoordinates(event, args) {
  const containers = args.context.droppableContainers;
  const type = args.context.active?.data.current?.type;
  return sortableKeyboardCoordinates(event, {
    ...args,
    context: {
      ...args.context,
      droppableContainers: {
        get: (id) => containers.get(id),
        getEnabled: () =>
          containers
            .getEnabled()
            .filter(
              (c) => type !== "column" || c.data.current?.type === "column",
            ),
      },
    },
  });
}

function collisions(args) {
  const type = args.active.data.current?.type;
  const available = args.droppableContainers.filter(
    (c) => type !== "column" || c.data.current?.type === "column",
  );
  const options = { ...args, droppableContainers: available };
  const hits = pointerWithin(options);
  if (hits.length) {
    const cardHits = hits.filter(
      (hit) =>
        available.find((c) => c.id === hit.id)?.data.current?.type === "card",
    );
    return cardHits.length ? cardHits : hits;
  }
  return args.pointerCoordinates ? [] : closestCorners(options);
}

export default function Board({ query, label, ...actions }) {
  const { t } = useLanguage();
  const { board, dispatch } = useBoard();
  const [active, setActive] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: keyboardCoordinates }),
  );
  const name = (item) => item?.data.current?.title || t("item");
  const announcements = {
    onDragStart: ({ active: item }) =>
      t(
        "Picked up {title}. Use arrow keys to move, space to drop, Escape to cancel.",
        { title: name(item) },
      ),
    onDragOver: ({ over }) =>
      over
        ? t("Over {title}.", { title: name(over) })
        : t("Outside a drop area."),
    onDragEnd: ({ active: item, over }) =>
      over
        ? t("Dropped {title} at {target}.", {
            title: name(item),
            target: name(over),
          })
        : t("Move cancelled."),
    onDragCancel: () => t("Move cancelled."),
  };
  function finish({ active: item, over }) {
    setActive(null);
    if (!over || item.id === over.id) return;
    if (item.data.current.type === "column")
      dispatch({ type: "MOVE_COLUMN", id: item.id, overId: over.id });
    else
      dispatch({
        type: "MOVE_CARD",
        id: item.id,
        columnId:
          over.data.current.type === "column"
            ? over.id
            : over.data.current.columnId,
        overId: over.data.current.type === "card" ? over.id : null,
      });
  }
  const search = query.trim().toLocaleLowerCase();
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisions}
      onDragStart={({ active: item }) =>
        setActive({ title: name(item), type: item.data.current.type })
      }
      onDragCancel={() => setActive(null)}
      onDragEnd={finish}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable: t(
            "To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel.",
          ),
        },
      }}
    >
      <SortableContext
        items={board.columns.map((c) => c.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="board" aria-label={t("Kanban columns")} tabIndex={0}>
          {board.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              cards={column.cards.filter(
                (card) =>
                  (label === "all" || card.label === label) &&
                  `${card.title} ${card.description}`
                    .toLocaleLowerCase()
                    .includes(search),
              )}
              {...actions}
            />
          ))}
          {!board.columns.length && (
            <div className="empty-board">
              <p>{t("No columns")}</p>
            </div>
          )}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {active && (
          <div className={`drag-preview ${active.type}`}>
            <h3>{active.title}</h3>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
