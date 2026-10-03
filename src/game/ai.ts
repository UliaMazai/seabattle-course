import type { Board, Ship } from "../types";
import { BOARD_SIZE } from "./constants";
import { processShot } from "./logic";

interface Target {
  firstHit: { x: number; y: number };
  direction: "horizontal" | "vertical" | null;
  nextStep: -1 | 1;
}

export interface AIState {
  mode: "hunt" | "target";
  triedCells: Set<string>;
  targets: Target[];
}

export function createAIState(): AIState {
  return {
    mode: "hunt",
    triedCells: new Set(),
    targets: [],
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

// Обновить ИИ после выстрела.
// sunkShipCells — массив клеток потопленного корабля (если sunk === true)
export function updateAIAfterShot(
  state: AIState,
  x: number,
  y: number,
  hit: boolean,
  sunk: boolean,
  sunkShipCells?: { x: number; y: number }[]
) {
  markTried(state, x, y);

  if (sunk) {
    // Удаляем из списка целей те, чей firstHit лежит внутри потопленного корабля
    if (sunkShipCells && sunkShipCells.length > 0) {
      state.targets = state.targets.filter(
        (t) =>
          !sunkShipCells.some(
            (c) => c.x === t.firstHit.x && c.y === t.firstHit.y
          )
      );
    } else {
      // Подстраховка: если не передали клетки — удаляем последнюю цель
      state.targets.pop();
    }
    if (state.targets.length === 0) state.mode = "hunt";
    return;
  }

  if (!hit) {
    // Промах. Обрабатываем последнюю цель.
    const target = state.targets[state.targets.length - 1];
    if (!target) {
      state.mode = "hunt";
      return;
    }

    if (target.direction === null) {
      // Первое «щупание» промахнулось — пробуем другую сторону
      if (target.nextStep === -1) {
        target.nextStep = 1;
      } else {
        // Обе стороны пусты — цель ложная, удаляем
        state.targets.pop();
        if (state.targets.length === 0) state.mode = "hunt";
      }
    } else {
      // Направление известно, промах в текущую сторону — переключаемся
      if (target.nextStep === -1) {
        target.nextStep = 1;
      } else {
        // Обе стороны пройдены — цель добита, удаляем
        state.targets.pop();
        if (state.targets.length === 0) state.mode = "hunt";
      }
    }
    return;
  }

  // Попадание
  // 1. Проверяем: попадание в клетку с уже существующей целью?
  const exactTarget = state.targets.find(
    (t) => t.firstHit.x === x && t.firstHit.y === y
  );
  if (exactTarget) return;

  // 2. Проверяем: попадание рядом с существующей целью (определяем направление)?
  const relatedTarget = state.targets.find((t) => {
    const dx = Math.abs(t.firstHit.x - x);
    const dy = Math.abs(t.firstHit.y - y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  });

  if (relatedTarget && relatedTarget.direction === null) {
    if (relatedTarget.firstHit.y === y) relatedTarget.direction = "horizontal";
    else relatedTarget.direction = "vertical";
    relatedTarget.nextStep = -1;
    return;
  }

  // 3. Новая цель — попадание в новый корабль
  state.mode = "target";
  state.targets.push({
    firstHit: { x, y },
    direction: null,
    nextStep: -1,
  });
}

export function getAIShot(
  board: Board,
  state: AIState
): { x: number; y: number } | null {
  // 1. Режим добивания
  if (state.mode === "target" && state.targets.length > 0) {
    const target = state.targets[state.targets.length - 1];
    const { x: fx, y: fy } = target.firstHit;

    // Направление не определено — стреляем в соседей firstHit
    if (target.direction === null) {
      const dirs = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
      ];
      const ordered = target.nextStep === -1 ? dirs : [...dirs].reverse();
      for (const { dx, dy } of ordered) {
        const nx = fx + dx;
        const ny = fy + dy;
        if (!inBounds(nx, ny)) continue;
        if (isTried(state, nx, ny)) continue;
        if (!isCellAvailable(board, nx, ny)) continue;
        return { x: nx, y: ny };
      }
      // Не нашли соседа — удаляем цель
      state.targets.pop();
      if (state.targets.length === 0) state.mode = "hunt";
    } else {
      // Направление известно. Идём по линии от firstHit,
      // пропуская tried-клетки, пока не найдём доступную.
      const dirs: { x: number; y: number }[] = [];

      if (target.direction === "horizontal") {
        // Влево
        for (let nx = fx - 1; nx >= 0; nx--) {
          dirs.push({ x: nx, y: fy });
        }
        // Вправо
        for (let nx = fx + 1; nx < BOARD_SIZE; nx++) {
          dirs.push({ x: nx, y: fy });
        }
      } else {
        // Вверх
        for (let ny = fy - 1; ny >= 0; ny--) {
          dirs.push({ x: fx, y: ny });
        }
        // Вниз
        for (let ny = fy + 1; ny < BOARD_SIZE; ny++) {
          dirs.push({ x: fx, y: ny });
        }
      }

      // Ищем первую доступную клетку в линии
      for (const cell of dirs) {
        if (!inBounds(cell.x, cell.y)) continue;
        if (isTried(state, cell.x, cell.y)) continue;
        if (!isCellAvailable(board, cell.x, cell.y)) continue;
        return { x: cell.x, y: cell.y };
      }

      // Всё в линии tried — цель добита (или не найдена), удаляем
      state.targets.pop();
      if (state.targets.length === 0) state.mode = "hunt";
    }

    // Если цели ещё есть — рекурсивно выбираем
    if (state.targets.length > 0) {
      return getAIShot(board, state);
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

  // Определяем клетки потопленного корабля
  let sunkShipCells: { x: number; y: number }[] | undefined;
  if (outcome.result.sunk && outcome.result.shipId) {
    const sunkShip = outcome.newShips.find((s) => s.id === outcome.result.shipId);
    sunkShipCells = sunkShip?.cells;
  }

  updateAIAfterShot(
    state,
    shot.x,
    shot.y,
    outcome.result.hit,
    outcome.result.sunk,
    sunkShipCells
  );

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