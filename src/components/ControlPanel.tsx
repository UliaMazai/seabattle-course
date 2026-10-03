interface ControlPanelProps {
  onNewGame: () => void;
  onAutoPlace: () => void;
  onShowRules: () => void;
}

export function ControlPanel({
  onNewGame,
  onAutoPlace,
  onShowRules,
}: ControlPanelProps) {
  const btnClass = `
    px-4 py-2 rounded
    bg-[#f8fbff] border-2 border-blue-900
    text-blue-900 text-xl font-['Caveat'] font-bold
    hover:bg-blue-50 active:scale-95
    transition-all
    shadow-[2px_2px_0_rgba(30,58,138,0.6)]
  `;

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-6">
      <button onClick={onShowRules} className={btnClass}>
        📖 Правила
      </button>
      <button onClick={onNewGame} className={btnClass}>
        🔄 Новая игра
      </button>
      <button onClick={onAutoPlace} className={btnClass}>
        🎲 Авторасстановка
      </button>
    </div>
  );
}