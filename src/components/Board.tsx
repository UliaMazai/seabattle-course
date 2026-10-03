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

const CELL_SIZE = "w-8 h-8 sm:w-9 sm:h-9";
const GAP = "gap-[2px]";

const LABEL_STYLE = `
  flex items-center justify-center
  ${CELL_SIZE}
  text-blue-900 font-bold text-lg
  select-none
  font-['Caveat']
`;

export function Board({ board, title, onCellClick, disabled }: BoardProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-3xl text-blue-900 font-['Caveat'] italic">
        {title}
      </h2>

      {/* Белая подложка — чтобы тетрадь не просвечивала через поле */}
      <div className="bg-white rounded-lg p-3 shadow-[0_0_0_2px_rgba(30,58,138,0.9)]">
        {/* Верхняя шапка с цифрами */}
        <div className={`flex ${GAP} mb-1`}>
          <div className={LABEL_STYLE}></div>
          {COL_LABELS.map((label) => (
            <div key={label} className={LABEL_STYLE}>
              {label}
            </div>
          ))}
        </div>

        {/* Буквы слева + поле */}
        <div className={`flex ${GAP}`}>
          <div className={`flex flex-col ${GAP}`}>
            {ROW_LABELS.map((label) => (
              <div key={label} className={LABEL_STYLE}>
                {label}
              </div>
            ))}
          </div>

          <div className={`grid grid-cols-10 ${GAP}`}>
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