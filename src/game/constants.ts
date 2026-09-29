export const BOARD_SIZE = 10;

// Классический флот: 1×4, 2×3, 3×2, 4×1
export const FLEET: number[] = [
  4,
  3, 3,
  2, 2, 2,
  1, 1, 1, 1,
];

export const COLORS = {
  water: "bg-gradient-to-b from-cyan-500 to-blue-800",
  ship: "bg-gradient-to-b from-slate-100 to-slate-400",
  hit: "bg-gradient-to-b from-red-400 to-red-800",
  miss: "bg-gradient-to-b from-sky-900 to-slate-900",
  sunk: "bg-gradient-to-b from-red-900 to-slate-900",
};