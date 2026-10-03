import { useState } from "react";
import { Board } from "./components/Board";
import { generateFleet } from "./game/logic";
import type { Board as BoardType, Ship, CellState } from "./types";

// Скрывает корабли на поле (для отображения противника)
function hideShips(board: BoardType): BoardType {
  return board.map((row) =>
    row.map((cell) => ({
      ...cell,
      state: (cell.state === "ship" ? "unknown" : cell.state) as CellState,
    }))
  );
}

function App() {
  const [playerBoard, setPlayerBoard] = useState<BoardType>(() => generateFleet().board);
  const [enemyBoard, setEnemyBoard] = useState<BoardType>(() => generateFleet().board);
  const [playerShips, setPlayerShips] = useState<Ship[]>([]);
  const [enemyShips, setEnemyShips] = useState<Ship[]>([]);

  function newGame() {
    const player = generateFleet();
    const enemy = generateFleet();
    setPlayerBoard(player.board);
    setPlayerShips(player.ships);
    setEnemyBoard(enemy.board);
    setEnemyShips(enemy.ships);
    console.log("Флот игрока:", player.ships);
    console.log("Флот противника:", enemy.ships);
  }

  return (
    <div
      className="
        min-h-screen p-6
        bg-gradient-to-b from-cyan-400 via-blue-700 to-blue-950
        relative overflow-hidden
      "
    >
      <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

      <h1
        className="
          relative z-10 text-center text-5xl font-black italic
          text-transparent bg-clip-text
          bg-gradient-to-b from-white via-cyan-200 to-cyan-500
          drop-shadow-[0_3px_0_rgba(0,40,80,0.9)]
          drop-shadow-[0_0_18px_rgba(103,232,249,0.8)]
          mb-6
        "
      >
        Морской бой
      </h1>

      <div className="relative z-10 flex justify-center mb-8">
        <button
          onClick={newGame}
          className="
            px-6 py-3 rounded-full font-bold uppercase tracking-wider
            text-white
            bg-gradient-to-b from-cyan-300 to-blue-700
            border border-cyan-100/60
            shadow-[0_6px_16px_rgba(0,20,60,0.6),inset_0_1px_0_rgba(255,255,255,0.8)]
            hover:brightness-110 active:scale-95
            transition-all
          "
        >
          Новая игра
        </button>
      </div>

      <div className="relative z-10 flex flex-wrap justify-center gap-12">
        <Board board={playerBoard} title="Ваше поле" disabled />
        <Board board={hideShips(enemyBoard)} title="Поле противника" />
      </div>
    </div>
  );
}

export default App;