import React, { useState, useEffect } from 'react';
import { X, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jwtUtils from '../../../utilities/jwtUtils';
import HeaderGame from '../../Reutilizables/HeaderGame';

const TicTacToe = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState(null);

  // Mock user data from JWT
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();
  const player1Name = refresh_token ? jwtUtils.getName(refresh_token) || 'Player 1' : 'Player 1';
  const player1Picture = refresh_token ? jwtUtils.getProfilePicture(refresh_token) || 'https://via.placeholder.com/50' : 'https://via.placeholder.com/50';
  const player2Name = 'Opponent'; // Mock opponent
  const player2Picture = 'https://via.placeholder.com/50'; // Mock opponent picture

  // WebSocket setup for real-time chat
  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8080'); // Replace with actual WebSocket URL
    setWs(websocket);

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    return () => websocket.close();
  }, []);

  // Handle sending chat messages
  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && ws) {
      const message = {
        user: player1Name,
        text: newMessage,
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(message));
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    }
  };

  // Handle Tic-Tac-Toe moves
  const handleClick = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else if (!newBoard.includes(null)) {
      setWinner('Draw');
    }
  };

  // Calculate winner
  const calculateWinner = (board) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6], // Diagonals
    ];
    for (let [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  // Render square
  const renderSquare = (index) => (
    <button
      className="w-20 h-20 sm:w-24 sm:h-24 md:w-40 md:h-40 bg-blue-800 text-white text-4xl font-bold flex items-center justify-center border-2 border-blue-600 hover:bg-blue-700 transition"
      onClick={() => handleClick(index)}
    >
      {board[index] === 'X' && <X className="w-10 h-10 sm:w-12 sm:h-12 md:w-20 md:h-20" />}
      {board[index] === 'O' && <Circle className="w-10 h-10 sm:w-12 sm:h-12 md:w-20 md:h-20" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex flex-col items-center justify-center p-4">
      <HeaderGame />
      <div className="w-full max-w-5xl mx-auto mt-20 bg-blue-800 rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-6">
        {/* Game Board Section */}
        <div className="flex-1 max-w-md mx-auto md:max-w-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <img src={player1Picture} alt="Player 1" className="w-12 h-12 rounded-full" />
              <span className="text-white font-bold">{player1Name}</span>
            </div>
            <span className="text-white text-lg">vs</span>
            <div className="flex items-center gap-2">
              <img src={player2Picture} alt="Player 2" className="w-12 h-12 rounded-full" />
              <span className="text-white font-bold">{player2Name}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4 w-full max-w-[240px] sm:max-w-[288px] md:max-w-[480px] mx-auto">
            {board.map((_, index) => renderSquare(index))}
          </div>
          <div className="text-center text-white text-xl mb-4">
            {winner
              ? winner === 'Draw'
                ? '¡Empate!'
                : `¡Ganador: ${winner === 'X' ? player1Name : player2Name}!`
              : `Turno de: ${isXNext ? player1Name : player2Name}`}
          </div>
          <button
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-400 transition"
            onClick={resetGame}
          >
            Reiniciar Juego
          </button>
          <button
            className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-400 transition mt-2"
            onClick={() => navigate('/')}
          >
            Volver al Inicio
          </button>
        </div>

        {/* Chat Section */}
        <div className="w-full md:w-80 bg-blue-900 rounded-lg p-4 flex flex-col max-h-80 md:min-h-[400px] md:max-h-[480px]">
          <h3 className="text-white text-lg font-bold mb-4">Chat en Tiempo Real</h3>
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto mb-4 bg-blue-800 rounded p-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    msg.user === player1Name ? 'text-right' : 'text-left'
                  }`}
                >
                  <span className="text-blue-300 text-sm">{msg.user}</span>
                  <p className="text-white bg-blue-700 rounded p-2 inline-block">{msg.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 mt-auto">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-blue-700 text-white rounded p-2 focus:outline-none"
                placeholder="Escribe un mensaje..."
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 transition"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;