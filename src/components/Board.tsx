import type { Board as BoardType } from "../types";
import { Cell } from "./Cell";

interface BoardProps {
  board: BoardType;
  title: string;
  onCellClick?: (x: number, y: number) => void;
  disabled?: boolean;
}

const ROW_LABELS = ["А", "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "К"];
const COL_LABELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

// Размеры ДОЛЖНЫ совпадать с Cell.tsx и Board gap!
const CELL_SIZE = "w-8 h-8 sm:w-9 sm:h-9";
const GAP_PX = "gap-1"; // 4px — столько же, сколько у поля

const LABEL_STYLE = `
  flex items-center justify-center
  ${CELL_SIZE}
  text-cyan-100 font-bold text-sm
  drop-shadow-[0_1px_2px_rgba(0,20,60,0.9)]
  select-none
`;

export function Board({ board, title, onCellClick, disabled }: BoardProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2
        className="
          text-xl font-extrabold uppercase tracking-widest
          text-cyan-100
          drop-shadow-[0_2px_0_rgba(0,40,80,0.9)]
          drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]
        "
      >
        {title}
      </h2>

      <div
        className="
          relative p-3 rounded-2xl
          bg-gradient-to-b from-cyan-300/40 to-blue-900/60
          border border-cyan-200/40
          shadow-[0_10px_30px_rgba(0,20,60,0.6),inset_0_1px_0_rgba(255,255,255,0.5)]
          backdrop-blur-sm
        "
      >
        {/* Верхняя шапка с цифрами */}
        <div className={`flex ${GAP_PX} mb-1`}>
          {/* Пустая ячейка в углу */}
          <div className={LABEL_STYLE}></div>
          {/* Цифры столбцов */}
          {COL_LABELS.map((label) => (
            <div key={label} className={LABEL_STYLE}>
              {label}
            </div>
          ))}
        </div>

        {/* Основная часть — буквы слева + поле */}
        <div className={`flex ${GAP_PX}`}>
          {/* Буквы строк */}
          <div className={`flex flex-col ${GAP_PX}`}>
            {ROW_LABELS.map((label) => (
              <div key={label} className={LABEL_STYLE}>
                {label}
              </div>
            ))}
          </div>

          {/* Поле */}
          <div className={`grid grid-cols-10 ${GAP_PX}`}>
            {board.map((row, y) =>
              row.map((cell, x) => (
                <Cell
                  key={`${x}-${y}`}
                  state={cell.state}
                  shipSize={cell.shipSize}
                  shipEdges={cell.shipEdges}
                  disabled={disabled}
                  onClick={() => onCellClick?.(x, y)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}