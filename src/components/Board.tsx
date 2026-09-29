import type { Board as BoardType } from "../types";
import { Cell } from "./Cell";

interface BoardProps {
  board: BoardType;
  title: string;
  onCellClick?: (x: number, y: number) => void;
  disabled?: boolean;
}

export function Board({ board, title, onCellClick, disabled }: BoardProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Заголовок доски — объёмный, с обводкой */}
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

      {/* Стеклянная панель вокруг поля */}
      <div
        className="
          relative
          p-3 rounded-2xl
          bg-gradient-to-b from-cyan-300/40 to-blue-900/60
          border border-cyan-200/40
          shadow-[0_10px_30px_rgba(0,20,60,0.6),inset_0_1px_0_rgba(255,255,255,0.5)]
          backdrop-blur-sm
        "
      >
        <div className="grid grid-cols-10 gap-1">
          {board.map((row, y) =>
            row.map((cell, x) => (
              <Cell
                key={`${x}-${y}`}
                state={cell.state}
                disabled={disabled}
                onClick={() => onCellClick?.(x, y)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}