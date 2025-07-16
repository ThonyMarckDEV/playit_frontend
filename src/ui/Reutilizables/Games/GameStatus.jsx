import React from 'react';
import { X, Circle } from 'lucide-react';

const GameStatus = ({ gameStatus, winner, currentTurn, getWinnerName, gameType }) => (
  <div className="text-center text-white text-sm sm:text-lg md:text-xl mb-4">
    {gameStatus === 'waiting' && 'Esperando a que un amigo se una...'}
    {gameStatus === 'playing' && !winner && gameType === 'pingpong' && (
      <span>Jugando...</span>
    )}
    {gameStatus === 'playing' && !winner && gameType === 'tictactoe' && currentTurn && (
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span>Turno de:</span>
        <span className="font-bold">{currentTurn.player.name}</span>
        {currentTurn.symbol === 'X' ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Circle className="w-5 h-5 sm:w-6 sm:h-6" />}
      </div>
    )}
    {gameStatus === 'finished' && winner && (
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span>¡Ganador:</span>
        <span className="font-bold">{getWinnerName()}!</span>
        {gameType === 'tictactoe' && (winner === 'X' ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Circle className="w-5 h-5 sm:w-6 sm:h-6" />)}
      </div>
    )}
    {gameStatus === 'finished' && !winner && '¡Empate!'}
  </div>
);

export default GameStatus;