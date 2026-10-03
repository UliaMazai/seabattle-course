import type { CellState } from "../types";

interface CellProps {
  state: CellState;
  onClick?: () => void;
  disabled?: boolean;
  shipSize?: number;
  shipEdges?: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
}

export function Cell({
  state,
  onClick,
  disabled,
  shipEdges,
}: CellProps) {
  // ===== Границы =====
  const borderStyle = (() => {
    // Корабль — жирная тёмно-синяя обводка
    if (state === "ship" || state === "sunk") {
      if (!shipEdges) return "border-2 border-blue-900";
      const t = shipEdges.top ? "border-t-2" : "border-t";
      const b = shipEdges.bottom ? "border-b-2" : "border-b";
      const l = shipEdges.left ? "border-l-2" : "border-l";
      const r = shipEdges.right ? "border-r-2" : "border-r";
      return `${t} ${b} ${l} ${r} border-blue-900`;
    }
    // Попадание — красноватая тонкая обводка
    if (state === "hit") {
      return "border border-red-400/70";
    }
    // Пусто / промах / unknown — обычная тонкая синяя сетка
    return "border border-blue-400/60";
  })();

  // ===== Фон =====
  const bg = (() => {
    switch (state) {
      case "ship":
        return "bg-blue-200";          // голубая плашка — корабль
      case "hit":
        return "bg-blue-200";          // попадание по кораблю — тот же фон
      case "sunk":
        return "bg-blue-900";          // потоплен — тёмный
      case "miss":
        return "bg-white";             // промах — белый
      default:
        return "bg-white hover:bg-blue-50"; // вода — белый, чуть голубеет при наведении
    }
  })();

  // ===== Скругления по краям корабля =====
  const rounded = (() => {
    if (!shipEdges || (state !== "ship" && state !== "sunk")) {
      return "rounded-[2px]";
    }
    const tl = shipEdges.top && shipEdges.left ? "rounded-tl-md" : "rounded-tl-none";
    const tr = shipEdges.top && shipEdges.right ? "rounded-tr-md" : "rounded-tr-none";
    const bl = shipEdges.bottom && shipEdges.left ? "rounded-bl-md" : "rounded-bl-none";
    const br = shipEdges.bottom && shipEdges.right ? "rounded-br-md" : "rounded-br-none";
    return `${tl} ${tr} ${bl} ${br}`;
  })();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative
        w-8 h-8 sm:w-9 sm:h-9
        flex items-center justify-center
        transition-colors duration-150
        ${bg}
        ${borderStyle}
        ${rounded}
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {/* Промах — синяя точка */}
      {state === "miss" && (
        <span className="ink-fade text-blue-800 text-2xl leading-none select-none">
          •
        </span>
      )}

      {/* Попадание — красный крест на голубом фоне */}
      {state === "hit" && (
        <span className="ink-fade text-red-600 text-3xl font-bold leading-none select-none">
          ✕
        </span>
      )}

      {/* Потоплен — бледный крестик на тёмном фоне */}
      {state === "sunk" && (
        <span className="text-blue-200 text-2xl font-bold leading-none select-none">
          ✕
        </span>
      )}
    </button>
  );
}