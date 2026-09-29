export const BOARD_SIZE = 10;

// Классический флот: 1×4, 2×3, 3×2, 4×1
export const FLEET: number[] = [
  4,
  3, 3,
  2, 2, 2,
  1, 1, 1, 1,
];

export const COLORS = {
  water: 'bg-sky-900',
  ship: 'bg-slate-400',
  hit: 'bg-red-500',
  miss: 'bg-sky-700',
  sunk: 'bg-red-800',
  hover: 'bg-sky-700',
};