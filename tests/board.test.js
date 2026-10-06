import test from "node:test";
import assert from "node:assert/strict";
import {
  boardReducer,
  initialBoard,
  parseBoard,
} from "../src/context/board.js";

test("export round-trips and empty boards are valid", () => {
  const board = initialBoard();
  assert.deepEqual(parseBoard(JSON.stringify(board)), board);
  assert.deepEqual(parseBoard('{"version":1,"columns":[]}'), {
    version: 1,
    columns: [],
  });
});

test("invalid imports are rejected before touching state", () => {
  for (const mutate of [
    (b) => {
      b.version = 2;
    },
    (b) => {
      b.columns[0].cards[0].id = b.columns[1].id;
    },
    (b) => {
      b.columns[0].cards[0].deadline = "2026-02-30";
    },
    (b) => {
      b.columns[0].cards[0].label = "unknown";
    },
    (b) => {
      b.columns[0].title = "   ";
    },
  ]) {
    const board = initialBoard();
    mutate(board);
    assert.throws(() => parseBoard(JSON.stringify(board)));
  }
});

test("card moves preserve data, order, and the original state", () => {
  const board = initialBoard();
  const snapshot = structuredClone(board);
  const reordered = boardReducer(board, {
    type: "MOVE_CARD",
    id: "card-1",
    columnId: "col-inbox",
    overId: "card-2",
  });
  assert.deepEqual(
    reordered.columns[0].cards.map((c) => c.id),
    ["card-2", "card-1"],
  );
  const moved = boardReducer(reordered, {
    type: "MOVE_CARD",
    id: "card-1",
    columnId: "col-done",
  });
  assert.deepEqual(moved.columns[2].cards[0], board.columns[0].cards[0]);
  assert.equal(moved.columns[0].cards.length, 1);
  assert.deepEqual(board, snapshot);
  assert.equal(
    boardReducer(board, {
      type: "MOVE_CARD",
      id: "card-1",
      columnId: "missing",
    }),
    board,
  );
});

test("editing a card can move it without duplicating it", () => {
  const board = initialBoard();
  const card = { ...board.columns[0].cards[0], title: "Updated" };
  const next = boardReducer(board, {
    type: "SAVE_CARD",
    columnId: "col-work",
    card,
  });
  assert.equal(
    next.columns.flatMap((c) => c.cards).filter((c) => c.id === card.id).length,
    1,
  );
  assert.equal(next.columns[1].cards[1].title, "Updated");
});

test("column CRUD and reordering retain their cards", () => {
  let board = initialBoard();
  board = boardReducer(board, {
    type: "MOVE_COLUMN",
    id: "col-inbox",
    overId: "col-done",
  });
  assert.equal(board.columns[2].cards.length, 2);
  board = boardReducer(board, {
    type: "ADD_COLUMN",
    id: "new-column",
    title: "New",
  });
  board = boardReducer(board, {
    type: "RENAME_COLUMN",
    id: "new-column",
    title: "Renamed",
  });
  assert.equal(board.columns[3].title, "Renamed");
  board = boardReducer(board, { type: "DELETE_COLUMN", id: "col-inbox" });
  assert.equal(board.columns.flatMap((c) => c.cards).length, 1);
});
