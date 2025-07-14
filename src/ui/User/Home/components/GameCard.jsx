import React from 'react';

const GameCard = ({ game, onClick }) => {
  // Map original game colors to blue-based or complementary colors
  const colorMap = {
    'from-emerald-500 to-teal-600': 'from-blue-500 to-cyan-600',
    'from-purple-500 to-indigo-600': 'from-blue-600 to-blue-800',
    'from-red-500 to-pink-600': 'from-blue-500 to-indigo-600',
    'from-orange-500 to-red-600': 'from-blue-500 to-blue-700',
    'from-blue-500 to-cyan-600': 'from-blue-400 to-cyan-500',
    'from-green-500 to-emerald-600': 'from-blue-500 to-teal-600',
  };

  const gradient = colorMap[game.color] || 'from-blue-500 to-blue-700';

  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-blue-900/20 group-hover:bg-blue-900/10 transition-colors"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-4xl">{game.icon}</span>
          <div className="text-white/80 text-sm">{game.players} jugadores</div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm">{game.difficulty}</span>
          <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-sm transition-colors">
            Jugar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;