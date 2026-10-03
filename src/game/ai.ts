import type { Board, Ship } from "../types";
import { BOARD_SIZE } from "./constants";
import { processShot } from "./logic";

export interface AIState {
  mode: "hunt" | "target";
  triedCells: Set<string>;
  firstHit: { x: number; y: number } | null;
  direction: "horizontal" | "vertical" | null;
  // Куда двигаться в следующий раз:
  // -1 = в сторону уменьшения (влево/вверх)
  // +1 = в сторону увеличения (вправо/вниз)
  // null = линия ещё не определена
  nextStep: -1 | 1 | null;
}

export function createAIState(): AIState {
  return {
    mode: "hunt",
    triedCells: new Set(),
    firstHit: null,
    direction: null,
    nextStep: null,
  };
}

function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

function isTried(state: AIState, x: number, y: number): boolean {
  return state.triedCells.has(cellKey(x, y));
}

function markTried(state: AIState, x: number, y: number) {
  state.triedCells.add(cellKey(x, y));
}

function inBounds(x: number, y: number): boolean {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

function isCellAvailable(board: Board, x: number, y: number): boolean {
  if (!inBounds(x, y)) return false;
  const s = board[y][x].state;
  return s === "empty" || s === "unknown" || s === "ship";
}

// ===== Пометить окружение потопленного корабля как "не стрелять" =====
export function markSunkSurroundings(
  state: AIState,
  ships: Ship[],
  sunkShipId: string
) {
  const ship = ships.find((s) => s.id === sunkShipId);
  if (!ship) return;

  for (const cell of ship.cells) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = cell.x + dx;
        const ny = cell.y + dy;
        if (!inBounds(nx, ny)) continue;
        markTried(state, nx, ny);
      }
    }
  }
}

// ===== Обновить состояние ИИ после выстрела =====
export function updateAIAfterShot(
  state: AIState,
  x: number,
  y: number,
  hit: boolean,
  sunk: boolean
) {
  markTried(state, x, y);

  // Корабль потоплен — сбрасываем всё
  if (sunk) {
    state.mode = "hunt";
    state.firstHit = null;
    state.direction = null;
    state.nextStep = null;
    return;
  }

  // Первое попадание
  if (hit && state.firstHit === null) {
    state.firstHit = { x, y };
    state.mode = "target";
    state.direction = null;
    state.nextStep = -1; // начинаем искать влево/вверх
    return;
  }

  if (!hit) {
    // Промах. Если направление ещё не определено — значит,
    // это был первый «щуп» от firstHit. Меняем сторону.
    if (state.direction === null) {
      state.nextStep = 1; // пробуем вправо/вниз
      return;
    }
    // Направление определено, промах в текущем направлении.
    // Значит, в эту сторону корабля больше нет — переключаемся.
    if (state.nextStep === -1) {
      state.nextStep = 1;
    } else {
      // Мы прошли в обе стороны и не потопили — значит, корабль
      // не найден. Сбрасываемся в поиск.
      state.mode = "hunt";
      state.firstHit = null;
      state.direction = null;
      state.nextStep = null;
    }
    return;
  }
}

// ===== Выбрать следующий выстрел =====
export function getAIShot(
  board: Board,
  state: AIState
): { x: number; y: number } | null {
  // 1. Режим добивания
  if (state.mode === "target" && state.firstHit) {
    const { x: fx, y: fy } = state.firstHit;

    // Если направление ещё не определено — стреляем в одного из 4 соседей
    if (state.direction === null) {
      const dirs = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
      ];
      // Пробуем в порядке приоритета nextStep
      const ordered = state.nextStep === -1
        ? dirs
        : [...dirs].reverse();
      for (const { dx, dy } of ordered) {
        const nx = fx + dx;
        const ny = fy + dy;
        if (!inBounds(nx, ny)) continue;
        if (isTried(state, nx, ny)) continue;
        if (!isCellAvailable(board, nx, ny)) continue;
        return { x: nx, y: ny };
      }
      // Не нашли — сбрасываемся
      state.mode = "hunt";
      state.firstHit = null;
      state.nextStep = null;
      return null;
    }

    // Направление определено — идём в текущую сторону
    if (state.nextStep === -1) {
      // Влево/вверх
      const nx = state.direction === "horizontal" ? fx - 1 : fx;
      const ny = state.direction === "vertical" ? fy - 1 : fy;
      if (inBounds(nx, ny) && !isTried(state, nx, ny) && isCellAvailable(board, nx, ny)) {
        return { x: nx, y: ny };
      }
      // Уперлись — переключаемся на другую сторону
      state.nextStep = 1;
    }
    if (state.nextStep === 1) {
      // Вправо/вниз
      const nx = state.direction === "horizontal" ? fx + 1 : fx;
      const ny = state.direction === "vertical" ? fy + 1 : fy;
      if (inBounds(nx, ny) && !isTried(state, nx, ny) && isCellAvailable(board, nx, ny)) {
        return { x: nx, y: ny };
      }
      // И там пусто — сбрасываемся в поиск
      state.mode = "hunt";
      state.firstHit = null;
      state.direction = null;
      state.nextStep = null;
    }
  }

  // 2. Режим поиска — шахматный порядок
  const candidates: { x: number; y: number }[] = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if ((x + y) % 2 !== 0) continue;
      if (!isCellAvailable(board, x, y)) continue;
      if (isTried(state, x, y)) continue;
      candidates.push({ x, y });
    }
  }
  if (candidates.length === 0) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if ((x + y) % 2 === 0) continue;
        if (!isCellAvailable(board, x, y)) continue;
        if (isTried(state, x, y)) continue;
        candidates.push({ x, y });
      }
    }
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ===== Полный ход ИИ =====
export function makeAITurn(
  board: Board,
  ships: Ship[],
  state: AIState
): {
  newBoard: Board;
  newShips: Ship[];
  x: number;
  y: number;
  hit: boolean;
  sunk: boolean;
} | null {
  const shot = getAIShot(board, state);
  if (!shot) return null;

  const outcome = processShot(board, ships, shot.x, shot.y);
  if (!outcome) return null;

  // Определяем направление, если попадание второе по счёту
  if (
    outcome.result.hit &&
    state.firstHit &&
    state.direction === null &&
    (shot.x !== state.firstHit.x || shot.y !== state.firstHit.y)
  ) {
    if (shot.y === state.firstHit.y) {
      state.direction = "horizontal";
    } else if (shot.x === state.firstHit.x) {
      state.direction = "vertical";
    }
    // Сбрасываем nextStep, чтобы пойти в сторону первой попытки
    state.nextStep = -1;
  }

  updateAIAfterShot(state, shot.x, shot.y, outcome.result.hit, outcome.result.sunk);

  // Помечаем окружение потопленного корабля
  if (outcome.result.sunk && outcome.result.shipId) {
    markSunkSurroundings(state, outcome.newShips, outcome.result.shipId);
  }

  return {
    newBoard: outcome.newBoard,
    newShips: outcome.newShips,
    x: shot.x,
    y: shot.y,
    hit: outcome.result.hit,
    sunk: outcome.result.sunk,
  };
}