import React from 'react';

const PlayerInfo = ({ displayPlayers, gameStatus, currentUserSymbol }) => (
  <>
    <div className="flex justify-between items-center mb-4 gap-2">
      <div className="flex items-center gap-2 sm:gap-3 bg-blue-700 rounded-lg p-2 sm:p-3 flex-1">
        <img src={displayPlayers.firstPlayer.picture} alt="First Player" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full" />
        <div className="flex flex-col min-w-0">
          <span className="text-white font-bold text-sm sm:text-base truncate">{displayPlayers.firstPlayer.name}</span>
          <span className="text-white text-xs sm:text-sm">{displayPlayers.firstSymbol}</span>
        </div>
      </div>
      <span className="text-white text-sm sm:text-lg font-bold px-2">VS</span>
      <div className="flex items-center gap-2 sm:gap-3 bg-blue-700 rounded-lg p-2 sm:p-3 flex-1">
        <img src={displayPlayers.secondPlayer.picture} alt="Second Player" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full" />
        <div className="flex flex-col min-w-0">
          <span className="text-white font-bold text-sm sm:text-base truncate">{displayPlayers.secondPlayer.name}</span>
          <span className="text-white text-xs sm:text-sm">{displayPlayers.secondSymbol}</span>
        </div>
      </div>
    </div>
    {gameStatus === 'playing' && (
      <div className="text-center mb-4 bg-blue-700 rounded-lg p-3">
        <div className="flex items-center justify-center gap-2 text-white">
          <span className="text-sm sm:text-lg">Tú juegas con:</span>
          <span className="text-lg sm:text-xl font-bold">{currentUserSymbol}</span>
        </div>
      </div>
    )}
  </>
);

export default PlayerInfo;