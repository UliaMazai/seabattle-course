import type { CellState } from "../types";
import { COLORS } from "../game/constants";

interface CellProps {
  state: CellState;
  onClick?: () => void;
  disabled?: boolean;
}

const stateStyles: Record<CellState, string> = {
  empty: `${COLORS.water} hover:brightness-125`,
  ship:  `${COLORS.ship}  hover:brightness-110`,
  hit:   `${COLORS.hit}   aqua-pulse`,
  miss:  `${COLORS.miss}  opacity-80`,
  sunk:  `${COLORS.sunk}  aqua-sink`,
};

export function Cell({ state, onClick, disabled }: CellProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative
        w-8 h-8 sm:w-9 sm:h-9
        rounded-md
        border border-blue-950/60
        transition-all duration-150
        shadow-[var(--aqua-shadow)]
        before:content-[''] before:absolute before:top-0 before:left-[5%]
        before:w-[90%] before:h-[40%] before:rounded-full
        before:bg-gradient-to-b before:from-white/75 before:to-white/5
        before:pointer-events-none
        ${stateStyles[state]}
        ${disabled ? "cursor-not-allowed" : "cursor-pointer active:scale-95"}
      `}
    />
  );
}