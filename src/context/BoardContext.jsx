import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { boardReducer, initialBoard, parseBoard, STORAGE_KEY } from "./board";

import { useLanguage } from "./LanguageContext";

const BoardContext = createContext(null);
const demo = initialBoard();
const demoCards = demo.columns.flatMap((column) => column.cards);

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return { board: saved ? parseBoard(saved) : initialBoard(), error: "" };
  } catch {
    return {
      board: initialBoard(),
      error:
        "Saved data could not be read. Export your board before closing; automatic saving is paused.",
    };
  }
}

export function BoardProvider({ children }) {
  const { t } = useLanguage();
  const [loaded] = useState(load);
  const [board, dispatch] = useReducer(boardReducer, loaded.board);
  const [storageError, setStorageError] = useState(loaded.error);
  const [savingEnabled, setSavingEnabled] = useState(!loaded.error);
  useEffect(() => {
    if (!savingEnabled) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
      setStorageError("");
    } catch {
      setStorageError(
        "Browser storage is full or unavailable. Export JSON to keep your changes.",
      );
    }
  }, [board, savingEnabled]);
  const localizedBoard = useMemo(
    () => ({
      ...board,
      columns: board.columns.map((column) => {
        const original = demo.columns.find((item) => item.id === column.id);
        return {
          ...column,
          title:
            original?.title === column.title ? t(column.title) : column.title,
          cards: column.cards.map((card) => {
            const sample = demoCards.find((item) => item.id === card.id);
            return {
              ...card,
              title: sample?.title === card.title ? t(card.title) : card.title,
              description:
                sample?.description === card.description
                  ? t(card.description)
                  : card.description,
            };
          }),
        };
      }),
    }),
    [board, t],
  );
  return (
    <BoardContext.Provider
      value={{
        board: localizedBoard,
        rawBoard: board,
        dispatch,
        storageError,
        resumeSaving: () => setSavingEnabled(true),
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) throw new Error("useBoard requires BoardProvider.");
  return context;
}
