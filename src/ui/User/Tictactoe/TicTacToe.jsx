import React, { useState, useEffect } from 'react';
import { X, Circle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import jwtUtils from '../../../utilities/jwtUtils';
import HeaderGame from '../../Reutilizables/HeaderGame';

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
  const [currentUserData, setCurrentUserData] = useState(null);
  const [isCreatingGame, setIsCreatingGame] = useState(!idPartida);
  const [error, setError] = useState(null);

  const refresh_token = jwtUtils.getRefreshTokenFromCookie();
  const idUsuario = refresh_token ? jwtUtils.getUserID(refresh_token) : null;

  const isCurrentUserPlayer1 = idUsuario === player1.id;
  const currentUserSymbol = isCurrentUserPlayer1 ? 'X' : 'O';

  // Function to create a new game
  const createGame = async () => {
    try {
      setIsCreatingGame(true);
      setError(null);
      const response = await fetch('http://localhost:3001/api/create-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idUsuario }),
      });

      const data = await response.json();
      if (response.ok) {
        navigate(`/usuario/game/tictactoe/${data.idPartida}`);
        return data.idPartida;
      } else {
        setError(data.error || 'Failed to create game');
        navigate('/usuario/home');
        return null;
      }
    } catch (error) {
      console.error('Error creating game:', error);
      setError('Error connecting to server');
      navigate('/usuario/home');
      return null;
    } finally {
      setIsCreatingGame(false);
    }
  };

  useEffect(() => {
    if (!idUsuario) {
      setError('Please log in to play');
      navigate('/usuario/home');
      return;
    }

    const initializeGame = async () => {
      let gameId = idPartida;

      if (!gameId) {
        gameId = await createGame();
        if (!gameId) return;
      }

      const numericGameId = parseInt(gameId);
      const websocket = new WebSocket('ws://localhost:3002');
      setWs(websocket);

      websocket.onopen = () => {
        websocket.send(JSON.stringify({ 
          type: 'join', 
          idPartida: numericGameId, 
          idUsuario: parseInt(idUsuario) 
        }));
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);

          if (data.type === 'error') {
            console.error('WebSocket error:', data.message);
            setError(data.message);
            navigate('/usuario/home');
            return;
          }

          if (data.type === 'playerData') {
            setPlayer1(data.player1);
            setPlayer2(data.player2);
            if (idUsuario === data.player1.id) {
              setCurrentUserData(data.player1);
            } else if (idUsuario === data.player2.id) {
              setCurrentUserData(data.player2);
            }
          }

          if (data.type === 'start') {
            setBoard(data.board);
            setIsXNext(data.isXNext);
            setGameStatus('playing');
          }

          if (data.type === 'move') {
            setBoard(data.board);
            setIsXNext(data.isXNext);
          }

          if (data.type === 'chat') {
            if (
              data.message &&
              typeof data.message === 'object' &&
              data.message.text &&
              data.message.user &&
              data.message.userId &&
              data.message.picture &&
              data.message.timestamp
            ) {
              setMessages((prev) => [...prev, data.message]);
            }
          }

          if (data.type === 'gameOver') {
            setWinner(data.winner);
            setGameStatus('finished');
            if (data.reason === 'opponent_disconnected') {
              alert('¡Ganaste! Tu oponente se ha desconectado.');
            }
          }
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
          setError('Error processing game data');
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Error connecting to game server');
      };

      websocket.onclose = () => {
        console.log('WebSocket connection closed');
      };

      return () => {
        if (websocket) websocket.close();
      };
    };

    initializeGame();
  }, [idPartida, idUsuario, navigate]);

  const handleClick = (index) => {
    if (board[index] || winner || gameStatus !== 'playing') return;
    if ((isXNext && idUsuario !== player1.id) || (!isXNext && idUsuario !== player2.id)) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ 
        type: 'move', 
        idPartida: parseInt(idPartida), 
        index, 
        idUsuario: parseInt(idUsuario) 
      }));
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (
      newMessage.trim() &&
      ws &&
      ws.readyState === WebSocket.OPEN &&
      currentUserData &&
      currentUserData.id &&
      currentUserData.name &&
      currentUserData.picture
    ) {
      const message = {
        text: newMessage,
        user: currentUserData.name,
        userId: currentUserData.id,
        picture: currentUserData.picture,
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify({ 
        type: 'chat', 
        idPartida: parseInt(idPartida), 
        message 
      }));
      setNewMessage('');
    }
  };

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

  const getWinnerName = () => {
    if (!winner) return null;
    return winner === 'X' ? player1.name : player2.name;
  };

  const getCurrentTurnInfo = () => {
    if (gameStatus !== 'playing') return null;
    const currentPlayer = isXNext ? player1 : player2;
    const currentSymbol = isXNext ? 'X' : 'O';
    return { player: currentPlayer, symbol: currentSymbol };
  };

  const currentTurn = getCurrentTurnInfo();

  if (isCreatingGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Creando partida...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex flex-col items-center justify-center p-4">
      <HeaderGame />
      <div className="w-full max-w-5xl mx-auto mt-20 bg-blue-800 rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-6">
        {/* Game Board Section */}
        <div className="flex-1 max-w-md mx-auto md:max-w-lg">
          {/* Players Info with Symbols */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3 bg-blue-700 rounded-lg p-3">
              <img src={player1.picture} alt="Player 1" className="w-12 h-12 rounded-full" />
              <div className="flex flex-col">
                <span className="text-white font-bold">{player1.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm">X</span>
                </div>
              </div>
            </div>
            <span className="text-white text-lg font-bold">VS</span>
            <div className="flex items-center gap-3 bg-blue-700 rounded-lg p-3">
              <img src={player2.picture} alt="Player 2" className="w-12 h-12 rounded-full" />
              <div className="flex flex-col">
                <span className="text-white font-bold">{player2.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm">O</span>
                </div>
              </div>
            </div>
          </div>

          {/* Game ID Display */}
          <div className="text-center mb-4 bg-blue-700 rounded-lg p-3">
            <div className="text-white text-sm">
              ID de Partida: <span className="font-bold">{idPartida}</span>
            </div>
          </div>

          {/* Current User Symbol Display */}
          {gameStatus === 'playing' && (
            <div className="text-center mb-4 bg-blue-700 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 text-white">
                <span className="text-lg">Tú juegas con:</span>
                <span className="text-lg font-bold">{currentUserSymbol}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mb-4 w-full max-w-[240px] sm:max-w-[288px] md:max-w-[480px] mx-auto">
            {board.map((_, index) => renderSquare(index))}
          </div>

          {/* Game Status */}
          <div className="text-center text-white text-xl mb-4">
            {gameStatus === 'waiting' && 'Esperando a que un amigo se una...'}
            {gameStatus === 'playing' && !winner && currentTurn && (
              <div className="flex items-center justify-center gap-2">
                <span>Turno de:</span>
                <span className="font-bold">{currentTurn.player.name}</span>
                {currentTurn.symbol === 'X' ? <X className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
              </div>
            )}
            {gameStatus === 'finished' && winner && (
              <div className="flex items-center justify-center gap-2">
                <span>¡Ganador:</span>
                <span className="font-bold">{getWinnerName()}!</span>
                {winner === 'X' ? <X className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
              </div>
            )}
            {gameStatus === 'finished' && !winner && '¡Empate!'}
          </div>

          <div className="flex gap-2">
            <button
              className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-400 transition"
              onClick={() => navigate('/usuario/home')}
            >
              Volver al Inicio
            </button>
          </div>
        </div>

        {/* Chat Section */}
        <div className="w-full md:w-80 bg-blue-900 rounded-lg p-4 flex flex-col max-h-80 md:min-h-[400px] md:max-h-[480px]">
          <h3 className="text-white text-lg font-bold mb-4">Chat en Tiempo Real</h3>
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto mb-4 space-y-3">
              {messages.map((msg, index) => {
                if (
                  !msg ||
                  typeof msg !== 'object' ||
                  !msg.text ||
                  !msg.user ||
                  !msg.userId ||
                  !msg.picture ||
                  !msg.timestamp
                ) {
                  console.warn('Skipping invalid message:', msg);
                  return null;
                }

                const isMyMessage = msg.userId === parseInt(idUsuario);
                return (
                  <div
                    key={index}
                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[80%] ${
                        isMyMessage ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <img
                        src={msg.picture}
                        alt={msg.user}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div
                        className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-blue-300 text-xs mb-1">{msg.user}</span>
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            isMyMessage ? 'bg-blue-600 text-white' : 'bg-blue-800 text-white'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 mt-auto">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-blue-700 text-white rounded p-2 focus:outline-none placeholder-blue-300"
                placeholder="Escribe un mensaje..."
                disabled={gameStatus !== 'playing'}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 transition disabled:opacity-50"
                disabled={gameStatus !== 'playing' || !newMessage.trim()}
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