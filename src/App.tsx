import { useState, useRef, useEffect } from "react";
import { Board } from "./components/Board";
import { RulesModal } from "./components/RulesModal";
import { ControlPanel } from "./components/ControlPanel";
import { generateFleet, processShot, isFleetDestroyed } from "./game/logic";
import { createAIState, makeAITurn, type AIState } from "./game/ai";
import type { Board as BoardType, Ship, CellState, Player } from "./types";

function hideShips(board: BoardType): BoardType {
  return board.map((row) =>
    row.map((cell) => ({
      x: cell.x,
      y: cell.y,
      state: (cell.state === "ship" ? "unknown" : cell.state) as CellState,
    }))
  );
}

function App() {
  const [playerBoard, setPlayerBoard] = useState<BoardType>(() => generateFleet().board);
  const [enemyBoard, setEnemyBoard] = useState<BoardType>(() => generateFleet().board);
  const [playerShips, setPlayerShips] = useState<Ship[]>([]);
  const [enemyShips, setEnemyShips] = useState<Ship[]>([]);
  const [turn, setTurn] = useState<Player>("human");
  const [message, setMessage] = useState<string>("Сделайте выстрел по полю противника");
  const [gameOver, setGameOver] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  const aiStateRef = useRef<AIState>(createAIState());

  function newGame() {
    const player = generateFleet();
    const enemy = generateFleet();
    setPlayerBoard(player.board);
    setPlayerShips(player.ships);
    setEnemyBoard(enemy.board);
    setEnemyShips(enemy.ships);
    setTurn("human");
    setMessage("Сделайте выстрел по полю противника");
    setGameOver(false);
    aiStateRef.current = createAIState();
  }

  function autoPlace() {
    const player = generateFleet();
    setPlayerBoard(player.board);
    setPlayerShips(player.ships);
    setMessage("Корабли расставлены автоматически. Стреляйте!");
  }

  useEffect(() => {
    if (playerShips.length === 0) newGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runAITurn(currentPlayerBoard: BoardType, currentPlayerShips: Ship[]) {
    const aiTurn = makeAITurn(currentPlayerBoard, currentPlayerShips, aiStateRef.current);
    if (!aiTurn) return;

    setPlayerBoard(aiTurn.newBoard);
    setPlayerShips(aiTurn.newShips);

    if (isFleetDestroyed(aiTurn.newShips)) {
      setMessage("💀 Вы проиграли. Весь ваш флот уничтожен.");
      setGameOver(true);
      return;
    }

    if (aiTurn.hit) {
      setMessage(
        aiTurn.sunk
          ? "🔥 Противник потопил ваш корабль. Его ход."
          : "💥 Противник попал. Его ход."
      );
      // ИИ попал — продолжаем серию
      setTimeout(
        () => runAITurn(aiTurn.newBoard, aiTurn.newShips),
        700
      );
    } else {
      setMessage("💧 Противник промахнулся. Ваш ход.");
      setTurn("human");
    }
  }

  function handleEnemyBoardClick(x: number, y: number) {
    if (turn !== "human" || gameOver) return;

    const outcome = processShot(enemyBoard, enemyShips, x, y);
    if (!outcome) return;

    setEnemyBoard(outcome.newBoard);
    setEnemyShips(outcome.newShips);

    if (isFleetDestroyed(outcome.newShips)) {
      setMessage("🏆 Вы победили! Весь флот противника уничтожен.");
      setGameOver(true);
      return;
    }

    if (outcome.result.hit) {
      setMessage(
        outcome.result.sunk
          ? "🔥 Корабль потоплен! Ваш ход снова."
          : "💥 Попадание! Ваш ход снова."
      );
    } else {
      setMessage("💧 Промах. Ход противника...");
      setTurn("ai");
    }
  }

  useEffect(() => {
    if (turn !== "ai" || gameOver) return;
    const timer = setTimeout(() => {
      runAITurn(playerBoard, playerShips);
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, gameOver]);

  return (
    <div className="min-h-screen flex flex-col items-center p-6 pt-10 pb-10">
      {/* Заголовок — прописью */}
      <h1
        className="
          text-6xl sm:text-7xl text-blue-900 italic font-['Caveat_Brush']
          mb-6
          drop-shadow-[2px_2px_0_rgba(30,58,138,0.2)]
        "
      >
        Морской бой
      </h1>

      <ControlPanel
        onNewGame={newGame}
        onAutoPlace={autoPlace}
        onShowRules={() => setRulesOpen(true)}
      />

      <p className="text-2xl text-blue-900 italic mb-6 font-['Caveat']">
        {message}
      </p>

      {/* Игровые поля */}
      <div className="flex flex-wrap justify-center gap-16">
        <Board board={playerBoard} title="мой флот" disabled />
        <Board
          board={hideShips(enemyBoard)}
          title="флот противника"
          onCellClick={handleEnemyBoardClick}
          disabled={turn !== "human" || gameOver}
        />
      </div>

      <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}

export default App;