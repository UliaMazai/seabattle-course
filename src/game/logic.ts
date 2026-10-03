import type { Board, Ship, Orientation, CellState } from "../types";
import { BOARD_SIZE, FLEET } from "./constants";

// ===== Создание пустого поля =====
export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, (_, y) =>
    Array.from({ length: BOARD_SIZE }, (_, x) => ({
      x,
      y,
      state: "empty" as CellState,
    }))
  );
}

// ===== Проверка: можно ли поставить корабль =====
function canPlaceShip(
  board: Board,
  x: number,
  y: number,
  size: number,
  orientation: Orientation
): boolean {
  // 1. Проверка границ
  if (orientation === "horizontal" && x + size > BOARD_SIZE) return false;
  if (orientation === "vertical" && y + size > BOARD_SIZE) return false;

  // 2. Проверка клеток корабля и клеток вокруг него (правило касания)
  for (let i = 0; i < size; i++) {
    const cx = orientation === "horizontal" ? x + i : x;
    const cy = orientation === "vertical" ? y + i : y;

    // Проверяем квадрат 3×3 вокруг клетки корабля
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) continue;
        if (board[ny][nx].state === "ship") return false;
      }
    }
  }
  return true;
}

// ===== Поставить корабль на поле =====
function placeShip(
  board: Board,
  x: number,
  y: number,
  size: number,
  orientation: Orientation,
  shipId: string
): Ship {
  const cells: { x: number; y: number }[] = [];

  for (let i = 0; i < size; i++) {
    const cx = orientation === "horizontal" ? x + i : x;
    const cy = orientation === "vertical" ? y + i : y;
    board[cy][cx].state = "ship";
    cells.push({ x: cx, y: cy });
  }

  return { id: shipId, size, cells, orientation, sunk: false };
}

// ===== Попытка расставить весь флот один раз =====
function tryPlaceFleet(): { board: Board; ships: Ship[] } | null {
  const board = createEmptyBoard();
  const ships: Ship[] = [];

  for (let i = 0; i < FLEET.length; i++) {
    const size = FLEET[i];
    const shipId = `ship-${i}`;
    let placed = false;

    // 100 попыток на каждый корабль
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const orientation: Orientation =
        Math.random() < 0.5 ? "horizontal" : "vertical";
      const x = Math.floor(Math.random() * BOARD_SIZE);
      const y = Math.floor(Math.random() * BOARD_SIZE);

      if (canPlaceShip(board, x, y, size, orientation)) {
        ships.push(placeShip(board, x, y, size, orientation, shipId));
        placed = true;
      }
    }

    // Не смогли поставить — сигнал перезапустить
    if (!placed) return null;
  }

  return { board, ships };
}

// ===== Публичная функция: расставить флот (с повторами) =====
export function generateFleet(): { board: Board; ships: Ship[] } {
  while (true) {
    const result = tryPlaceFleet();
    if (result) return result;
    // Не получилось — пробуем заново (в редких случаях)
  }
}