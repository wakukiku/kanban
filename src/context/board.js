export const STORAGE_KEY = "kanban-press:v1";
export const LABELS = {
  none: "No label",
  orange: "Priority",
  green: "Build",
  yellow: "Idea",
};
export const uid = () => crypto.randomUUID();
export const transformStyle = (value) =>
  value
    ? `translate3d(${value.x}px, ${value.y}px, 0) scaleX(${value.scaleX ?? 1}) scaleY(${value.scaleY ?? 1})`
    : undefined;

export function initialBoard() {
  return {
    version: 1,
    columns: [
      {
        id: "col-inbox",
        title: "On the radar",
        cards: [
          {
            id: "card-1",
            title: "Make something worth shipping",
            description:
              "Start small. Name the next useful thing, then move it forward.",
            label: "orange",
            deadline: "",
          },
          {
            id: "card-2",
            title: "A corner for the wild ideas",
            description:
              "Keep the rough sketches. One of them might be the whole point.",
            label: "yellow",
            deadline: "",
          },
        ],
      },
      {
        id: "col-work",
        title: "On the bench",
        cards: [
          {
            id: "card-3",
            title: "Give the details some attention",
            description:
              "Focus states, empty states, and the last five percent.",
            label: "green",
            deadline: "",
          },
        ],
      },
      { id: "col-done", title: "Out the door", cards: [] },
    ],
  };
}

export function isValidDate(value) {
  if (value === "") return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "0001-01-01") return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
}

export function parseBoard(text) {
  const data = JSON.parse(text);
  const ids = new Set();
  const validId = (id) => {
    if (typeof id !== "string" || !id.trim() || id.length > 100 || ids.has(id))
      return false;
    ids.add(id);
    return true;
  };
  const validText = (value, max, required = false) =>
    typeof value === "string" &&
    value.length <= max &&
    (!required || value.trim().length > 0);
  if (
    !data ||
    data.version !== 1 ||
    !Array.isArray(data.columns) ||
    data.columns.length > 100
  ) {
    throw new Error("Use a Kanban Press version 1 export (up to 100 columns).");
  }
  let total = 0;
  const columns = data.columns.map((column) => {
    if (
      !column ||
      !validId(column.id) ||
      !validText(column.title, 60, true) ||
      !Array.isArray(column.cards)
    ) {
      throw new Error("A column has an invalid name, ID, or card list.");
    }
    total += column.cards.length;
    if (total > 5000) throw new Error("The board limit is 5,000 cards.");
    const cards = column.cards.map((card) => {
      if (
        !card ||
        !validId(card.id) ||
        !validText(card.title, 120, true) ||
        !validText(card.description, 5000) ||
        !Object.hasOwn(LABELS, card.label) ||
        typeof card.deadline !== "string" ||
        !isValidDate(card.deadline)
      ) {
        throw new Error(
          "A card has invalid fields, a duplicate ID, or an invalid date.",
        );
      }
      return {
        id: card.id,
        title: card.title.trim(),
        description: card.description,
        label: card.label,
        deadline: card.deadline,
      };
    });
    return { id: column.id, title: column.title.trim(), cards };
  });
  return { version: 1, columns };
}

export function boardReducer(state, action) {
  const { columns } = state;
  switch (action.type) {
    case "IMPORT":
      return action.board;
    case "ADD_COLUMN":
      return {
        ...state,
        columns: [
          ...columns,
          { id: action.id, title: action.title, cards: [] },
        ],
      };
    case "RENAME_COLUMN":
      return {
        ...state,
        columns: columns.map((c) =>
          c.id === action.id ? { ...c, title: action.title } : c,
        ),
      };
    case "DELETE_COLUMN":
      return { ...state, columns: columns.filter((c) => c.id !== action.id) };
    case "MOVE_COLUMN": {
      const from = columns.findIndex((c) => c.id === action.id);
      const to = columns.findIndex((c) => c.id === action.overId);
      if (from < 0 || to < 0 || from === to) return state;
      const next = [...columns];
      next.splice(to, 0, next.splice(from, 1)[0]);
      return { ...state, columns: next };
    }
    case "SAVE_CARD": {
      if (!columns.some((c) => c.id === action.columnId)) return state;
      return {
        ...state,
        columns: columns.map((column) => {
          const existing = column.cards.findIndex(
            (c) => c.id === action.card.id,
          );
          const cards = column.cards.filter((c) => c.id !== action.card.id);
          if (column.id === action.columnId)
            cards.splice(
              existing < 0 ? cards.length : existing,
              0,
              action.card,
            );
          return { ...column, cards };
        }),
      };
    }
    case "DELETE_CARD":
      return {
        ...state,
        columns: columns.map((c) => ({
          ...c,
          cards: c.cards.filter((card) => card.id !== action.id),
        })),
      };
    case "MOVE_CARD": {
      const source = columns.find((c) =>
        c.cards.some((card) => card.id === action.id),
      );
      const target = columns.find((c) => c.id === action.columnId);
      if (!source || !target || action.id === action.overId) return state;
      const card = source.cards.find((c) => c.id === action.id);
      const index = target.cards.findIndex((c) => c.id === action.overId);
      return {
        ...state,
        columns: columns.map((column) => {
          if (column.id !== source.id && column.id !== target.id) return column;
          const cards = column.cards.filter((c) => c.id !== action.id);
          if (column.id === target.id)
            cards.splice(index < 0 ? cards.length : index, 0, card);
          return { ...column, cards };
        }),
      };
    }
    default:
      return state;
  }
}
