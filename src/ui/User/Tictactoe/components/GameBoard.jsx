import React from 'react';
import { X, Circle } from 'lucide-react';

const GameBoard = ({ board, gameStatus, ws, handleClick }) => {
  const renderSquare = (index) => (
    <button
      key={index}
      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 bg-blue-800 text-white text-2xl sm:text-3xl md:text-4xl font-bold flex items-center justify-center border-2 border-blue-600 hover:bg-blue-700 transition disabled:opacity-50 rounded-lg"
      onClick={() => handleClick(index)}
      disabled={gameStatus !== 'playing' || !ws || ws.readyState !== WebSocket.OPEN}
    >
      {board[index] === 'X' && <X className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16" />}
      {board[index] === 'O' && <Circle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16" />}
    </button>
  );

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
      {board.map((_, index) => renderSquare(index))}
    </div>
  );
};

export default GameBoard;