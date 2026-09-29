import type { Board } from "../types";
import { BOARD_SIZE } from "./constants";

// Создаёт пустое поле 10x10
export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, (_, y) =>
    Array.from({ length: BOARD_SIZE }, (_, x) => ({
      x,
      y,
      state: "empty" as const,
    }))
  );
}