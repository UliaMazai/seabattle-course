// Состояние одной клетки
export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';

// Клетка поля
export interface Cell {
  x: number;
  y: number;
  state: CellState;
}

// Поле 10x10
export type Board = Cell[][];

// Ориентация корабля
export type Orientation = 'horizontal' | 'vertical';

// Описание корабля
export interface Ship {
  id: string;
  size: number;          // 1, 2, 3 или 4
  cells: { x: number; y: number }[];
  orientation: Orientation;
  sunk: boolean;
}

// Фаза игры
export type GamePhase = 'placing' | 'playing' | 'finished';

// Кто ходит
export type Player = 'human' | 'ai';

// Результат выстрела
export interface ShotResult {
  hit: boolean;
  sunk: boolean;
  shipId?: string;
}