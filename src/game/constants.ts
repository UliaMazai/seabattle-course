export const BOARD_SIZE = 10;

export const FLEET: number[] = [
  4,
  3, 3,
  2, 2, 2,
  1, 1, 1, 1,
];

// Цвета в стиле рукописной тетради
export const COLORS = {
  // Вода — как бумага, чуть голубее
  water: "bg-transparent hover:bg-blue-100/50",
  // Свой корабль — тёмно-синий контур
  ship: "bg-blue-900/10 border-2 border-blue-900",
  // Свой корабль — цельный блок (без разделителей)
  shipCell: "bg-blue-900/10 border border-blue-900",
  // Попадание — красный крест
  hit: "text-red-600",
  // Промах — синяя точка
  miss: "text-blue-800",
  // Убитый корабль — заливка
  sunk: "bg-blue-900",
};

// Размер клетки в пикселях
export const CELL_SIZE = 32; // 32px
export const CELL_GAP = 2;   // 2px между клетками