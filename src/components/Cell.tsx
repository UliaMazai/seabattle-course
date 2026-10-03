import type { CellState } from "../types";
import { COLORS } from "../game/constants";

interface CellProps {
  state: CellState;
  onClick?: () => void;
  disabled?: boolean;
  shipSize?: number;
  shipOrientation?: "horizontal" | "vertical";
  shipEdges?: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
}

const stateStyles: Record<CellState, string> = {
  empty:   `${COLORS.water} hover:brightness-125`,
  unknown: `${COLORS.water} hover:brightness-125`,
  ship:    `${COLORS.ship}  hover:brightness-110`,
  hit:     `${COLORS.hit}   aqua-pulse`,
  miss:    `${COLORS.miss}  opacity-80`,
  sunk:    `${COLORS.sunk}  aqua-sink`,
};

// Цвета кораблей в зависимости от размера (от маленького к большому)
const SHIP_COLORS: Record<number, string> = {
  1: "bg-gradient-to-b from-cyan-100  to-cyan-400",
  2: "bg-gradient-to-b from-slate-100 to-slate-400",
  3: "bg-gradient-to-b from-blue-100  to-blue-500",
  4: "bg-gradient-to-b from-indigo-100 to-indigo-600",
};

export function Cell({
  state,
  onClick,
  disabled,
  shipSize,
  shipEdges,
}: CellProps) {
  // Выбираем цвет корабля по размеру
  const shipColor =
    state === "ship" && shipSize ? SHIP_COLORS[shipSize] : null;

  // Скругления для цельного корабля
  const radius = "rounded-md";
  const roundedStyles = shipEdges
    ? {
        borderTopLeftRadius:     shipEdges.top && shipEdges.left    ? "8px" : "2px",
        borderTopRightRadius:    shipEdges.top && shipEdges.right   ? "8px" : "2px",
        borderBottomLeftRadius:  shipEdges.bottom && shipEdges.left ? "8px" : "2px",
        borderBottomRightRadius: shipEdges.bottom && shipEdges.right? "8px" : "2px",
      }
    : {};

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={state === "ship" ? roundedStyles : undefined}
      className={`
        relative
        w-8 h-8 sm:w-9 sm:h-9
        ${state === "ship" && shipEdges ? "" : radius}
        border border-blue-950/60
        transition-all duration-150
        shadow-[var(--aqua-shadow)]
        before:content-[''] before:absolute before:top-0 before:left-[5%]
        before:w-[90%] before:h-[40%] before:rounded-full
        before:bg-gradient-to-b before:from-white/75 before:to-white/5
        before:pointer-events-none
        ${state === "ship" && shipColor ? shipColor : stateStyles[state]}
        ${disabled ? "cursor-not-allowed" : "cursor-pointer active:scale-95"}
      `}
    />
  );
}