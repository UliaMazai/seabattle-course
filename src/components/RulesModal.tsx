interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="
          bg-[#f8fbff] rounded-lg p-8 max-w-lg w-full
          border-2 border-blue-900
          shadow-2xl
          font-['Caveat']
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl text-blue-900 mb-4 font-bold">
          Правила игры
        </h2>

        <div className="text-xl text-blue-900 space-y-3 leading-relaxed">
          <p>🎯 Цель — потопить весь флот противника.</p>
          <p>🚢 У каждого игрока 10 кораблей:</p>
          <ul className="list-disc list-inside ml-4">
            <li>1 × четырёхпалубный</li>
            <li>2 × трёхпалубных</li>
            <li>3 × двухпалубных</li>
            <li>4 × однопалубных</li>
          </ul>
          <p>⛔ Корабли не могут касаться друг друга даже углами.</p>
          <p>💥 Попал — стреляй ещё раз. Промахнулся — ход соперника.</p>
          <p>✕ Попадание. • Промах. Закрашенный — потоплен.</p>
          <p className="italic text-blue-700 mt-4">
            Особенности: игра против умного бота, который добивает корабли.
          </p>
        </div>

        <button
          onClick={onClose}
          className="
            mt-6 w-full py-2 rounded
            bg-blue-900 text-white
            text-xl font-['Caveat']
            hover:bg-blue-800 transition-colors
          "
        >
          Понятно
        </button>
      </div>
    </div>
  );
}