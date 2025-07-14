import React, { useState, useEffect } from 'react';
import { X, Circle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import jwtUtils from '../../../utilities/jwtUtils';
import HeaderGame from '../../Reutilizables/HeaderGame';
import { v4 as uuidv4 } from 'uuid';

const TicTacToe = () => {
  const navigate = useNavigate();
  const { idPartida } = useParams();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState(null);
  const [player1, setPlayer1] = useState({ id: null, name: 'Player 1', picture: 'https://placehold.co/50x50' });
  const [player2, setPlayer2] = useState({ id: null, name: 'Opponent', picture: 'https://placehold.co/50x50' });
  const [gameStatus, setGameStatus] = useState('waiting');
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);

  // User data from JWT
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();
  const idUsuario = refresh_token ? jwtUtils.getUserID(refresh_token) : null;

  // WebSocket setup
  useEffect(() => {
    if (!idUsuario) {
      navigate('/');
      return;
    }

    const newIdPartida = idPartida || uuidv4();
    if (!idPartida) {
      navigate(`/usuario/game/tictactoe/${newIdPartida}`);
    }

    const websocket = new WebSocket('ws://localhost:3002');
    setWs(websocket);

    websocket.onopen = () => {
      websocket.send(JSON.stringify({ type: 'join', idPartida: newIdPartida, idUsuario }));
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'playerData') {
        setPlayer1(data.player1);
        setPlayer2(data.player2);
      }

      if (data.type === 'start') {
        setBoard(data.board);
        setIsXNext(data.isXNext);
        setGameStatus('playing');
        setWaitingForOpponent(false);
      }

      if (data.type === 'move') {
        setBoard(data.board);
        setIsXNext(data.isXNext);
      }

      if (data.type === 'chat') {
        setMessages((prev) => [...prev, data.message]);
      }

      if (data.type === 'gameOver') {
        setWinner(data.winner);
        setGameStatus('finished');
        setWaitingForOpponent(false);
      }

      if (data.type === 'waiting') {
        setWaitingForOpponent(true);
      }

      if (data.type === 'newGame') {
        setBoard(data.board);
        setIsXNext(data.isXNext);
        setWinner(null);
        setGameStatus('playing');
        setWaitingForOpponent(false);
        navigate(`/usuario/game/tictactoe/${data.idPartida}`);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => websocket.close();
  }, [idPartida, idUsuario, navigate]);

  // Handle Tic-Tac-Toe moves
  const handleClick = (index) => {
    if (board[index] || winner || gameStatus !== 'playing') return;
    if ((isXNext && idUsuario !== player1.id) || (!isXNext && idUsuario !== player2.id)) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'move', idPartida, index, idUsuario }));
    }
  };

  // Handle sending chat messages
  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'chat', idPartida, message: newMessage, user: player1.name }));
      setNewMessage('');
    }
  };

  // Reset game
  const resetGame = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'reset', idPartida, idUsuario }));
      setWaitingForOpponent(true);
    }
  };

  // Accept reset
  const acceptReset = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'acceptReset', idPartida, idUsuario }));
    }
  };

  // Render square
  const renderSquare = (index) => (
    <button
      key={index}
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
              <img src={player1.picture} alt="Player 1" className="w-12 h-12 rounded-full" />
              <span className="text-white font-bold">{player1.name}</span>
            </div>
            <span className="text-white text-lg">vs</span>
            <div className="flex items-center gap-2">
              <img src={player2.picture} alt="Player 2" className="w-12 h-12 rounded-full" />
              <span className="text-white font-bold">{player2.name}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4 w-full max-w-[240px] sm:max-w-[288px] md:max-w-[480px] mx-auto">
            {board.map((_, index) => renderSquare(index))}
          </div>
          <div className="text-center text-white text-xl mb-4">
            {gameStatus === 'waiting' && 'Esperando a que un amigo se una...'}
            {gameStatus === 'playing' && !winner && `Turno de: ${isXNext ? player1.name : player2.name}`}
            {gameStatus === 'finished' && winner && `¡Ganador: ${winner === 'X' ? player1.name : player2.name}!`}
            {gameStatus === 'finished' && !winner && '¡Empate!'}
            {waitingForOpponent && 'Esperando a que el oponente acepte reiniciar...'}
          </div>
          <button
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-400 transition"
            onClick={resetGame}
            disabled={gameStatus === 'waiting' || waitingForOpponent}
          >
            Reiniciar Juego
          </button>
          {waitingForOpponent && gameStatus !== 'waiting' && (
            <button
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-400 transition mt-2"
              onClick={acceptReset}
            >
              Aceptar Reinicio
            </button>
          )}
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
                  className={`mb-2 ${msg.user === player1.name ? 'text-right' : 'text-left'}`}
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
                disabled={gameStatus !== 'playing'}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 transition"
                disabled={gameStatus !== 'playing'}
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