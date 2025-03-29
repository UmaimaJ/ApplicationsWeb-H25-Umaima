import { SQUARES } from "chess.js";

export const pieceMap = {
  "wP": "p",
  "wB": "b",
  "wN": "n",
  "wR": "r",
  "wQ": "q",
  "wK": "k",
  "bP": "p",
  "bB": "b",
  "bN": "n",
  "bR": "r",
  "bQ": "q",
  "bK": "k"
}

export function toDests(chess) {
    const dests = new Map();
    if(chess)
      SQUARES.forEach((s) => {
        const ms = chess.moves({ square: s, verbose: true });
        if (ms.length)
          dests.set(
            s,
            ms.map((m) => m.to),
          );
      });
    return dests;
}