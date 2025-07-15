import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Circle, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import jwtUtils from '../../../utilities/jwtUtils';
import HeaderGame from '../../Reutilizables/HeaderGame';
import FetchWithGif from '../../Reutilizables/FetchWithGif';
import { API_BASE_URL_GAME_TRIKI, WEBSOCKET_TRIKI_URL } from '../../../js/trikiHelper';

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
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [error, setError] = useState(null);
  const [actualGameId, setActualGameId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showLoadingForPlayer2, setShowLoadingForPlayer2] = useState(false);
  
  // New state for mobile chat
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const gameInitialized = useRef(false);
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  const refresh_token = jwtUtils.getRefreshTokenFromCookie();
  const idUsuario = refresh_token ? jwtUtils.getUserID(refresh_token) : null;

  const isCurrentUserPlayer1 = idUsuario === player1.id;
  const currentUserSymbol = isCurrentUserPlayer1 ? 'X' : 'O';

  // Create a new game
  const createGame = async () => {
    try {
      setIsCreatingGame(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL_GAME_TRIKI}/api/create-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsuario }),
      });
      const data = await response.json();
      if (response.ok) {
        return data.idPartida;
      } else {
        setError(data.error || 'Failed to create game');
        return null;
      }
    } catch (error) {
      setError('Error connecting to server');
      return null;
    } finally {
      setIsCreatingGame(false);
    }
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);

      if (data.type === 'error') {
        setError(data.message);
        if (data.message === 'Game not found') {
          navigate('/usuario/home');
        }
        return;
      }

      if (data.type === 'playerData') {
        setPlayer1(data.player1);
        setPlayer2(data.player2);
        if (idUsuario === data.player1.id) {
          setCurrentUserData(data.player1);
        } else if (idUsuario === data.player2.id) {
          setCurrentUserData(data.player2);
          setShowLoadingForPlayer2(false);
        }
      }

      if (data.type === 'start') {
        setBoard(data.board);
        setIsXNext(data.isXNext);
        setGameStatus('playing');
        setError(null);
        setShowLoadingForPlayer2(false);
      }

      if (data.type === 'move') {
        setBoard(data.board);
        setIsXNext(data.isXNext);
      }

      if (data.type === 'chat') {
        if (data.message && data.message.text && data.message.user && data.message.userId && data.message.picture && data.message.timestamp) {
          setMessages((prev) => [...prev, data.message]);
          // Increment unread messages if chat is not expanded on mobile
          if (!isChatExpanded && window.innerWidth < 768) {
            setUnreadMessages(prev => prev + 1);
          }
        }
      }

      if (data.type === 'gameOver') {
        setWinner(data.winner);
        setGameStatus('finished');
        setShowLoadingForPlayer2(false);
        if (data.reason === 'opponent_left') {
          alert('¡Ganaste! Tu oponente ha abandonado la partida.');
        }
      }

      if (data.type === 'reconnect') {
        setBoard(data.board);
        setIsXNext(data.isXNext);
        setGameStatus(data.status);
        setShowLoadingForPlayer2(false);
      }
    } catch (error) {
      setError('Error processing game data');
    }
  }, [idUsuario, navigate, isChatExpanded]);

  // Connect to WebSocket with retry logic
  const connectWebSocket = useCallback((gameId) => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (isConnecting || (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    setIsConnecting(true);
    const websocket = new WebSocket(WEBSOCKET_TRIKI_URL);
    wsRef.current = websocket;
    setWs(websocket);

    websocket.onopen = () => {
      setIsConnecting(false);
      setError(null);
      reconnectAttempts.current = 0;
      websocket.send(JSON.stringify({ 
        type: 'join', 
        idPartida: parseInt(gameId), 
        idUsuario: parseInt(idUsuario) 
      }));

      heartbeatIntervalRef.current = setInterval(() => {
        if (websocket.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 30000);
    };

    websocket.onmessage = handleWebSocketMessage;

    websocket.onerror = () => {
      setIsConnecting(false);
      setError('Error connecting to game server');
    };

    websocket.onclose = () => {
      setIsConnecting(false);
      if (wsRef.current === websocket) {
        wsRef.current = null;
        setWs(null);
      }

      if (gameStatus !== 'finished' && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket(gameId);
        }, 2000 * reconnectAttempts.current);
      } else if (reconnectAttempts.current >= maxReconnectAttempts) {
        setError('Connection lost. Please try again.');
      }
    };
  }, [idUsuario, isConnecting, gameStatus, handleWebSocketMessage]);

  // Initialize game
  useEffect(() => {
    if (gameInitialized.current) return;
    if (!idUsuario) {
      setError('Please log in to play');
      navigate('/usuario/home');
      return;
    }

    const initializeGame = async () => {
      gameInitialized.current = true;
      let gameId = idPartida;

      if (!gameId) {
        gameId = await createGame();
        if (!gameId) {
          navigate('/usuario/home');
          return;
        }
        window.history.replaceState({}, '', `/usuario/game/tictactoe/${gameId}`);
      } else {
        setShowLoadingForPlayer2(true);
      }

      setActualGameId(gameId);
      connectWebSocket(gameId);
    };

    initializeGame();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [idPartida, idUsuario, navigate, createGame, connectWebSocket]);

  // Handle explicit leave action
  const handleLeaveGame = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'leave',
        idPartida: parseInt(actualGameId || idPartida),
        idUsuario: parseInt(idUsuario),
      }));
    }
    navigate('/usuario/home');
  };

  const handleClick = (index) => {
    if (board[index] || winner || gameStatus !== 'playing') return;
    if ((isXNext && idUsuario !== player1.id) || (!isXNext && idUsuario !== player2.id)) return;

    const currentGameId = actualGameId || idPartida;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
        type: 'move', 
        idPartida: parseInt(currentGameId), 
        index, 
        idUsuario: parseInt(idUsuario) 
      }));
    } else {
      setError('Connection lost. Attempting to reconnect...');
      connectWebSocket(currentGameId);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (
      newMessage.trim() &&
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN &&
      currentUserData
    ) {
      const currentGameId = actualGameId || idPartida;
      const message = {
        text: newMessage,
        user: currentUserData.name,
        userId: currentUserData.id,
        picture: currentUserData.picture,
        timestamp: new Date().toISOString(),
      };
      wsRef.current.send(JSON.stringify({ 
        type: 'chat', 
        idPartida: parseInt(currentGameId), 
        message 
      }));
      setNewMessage('');
    } else {
      setError('Connection lost. Please try again.');
      connectWebSocket(actualGameId || idPartida);
    }
  };

  const toggleChat = () => {
    setIsChatExpanded(!isChatExpanded);
    if (!isChatExpanded) {
      setUnreadMessages(0);
    }
  };

  const renderSquare = (index) => (
    <button
      key={index}
      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 bg-blue-800 text-white text-2xl sm:text-3xl md:text-4xl font-bold flex items-center justify-center border-2 border-blue-600 hover:bg-blue-700 transition disabled:opacity-50 rounded-lg"
      onClick={() => handleClick(index)}
      disabled={gameStatus !== 'playing' || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN}
    >
      {board[index] === 'X' && <X className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16" />}
      {board[index] === 'O' && <Circle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16" />}
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

  const getConnectionStatus = () => {
    if (isConnecting) return 'Conectando...';
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return 'Desconectado';
    return 'Conectado';
  };

  const currentTurn = getCurrentTurnInfo();
  const currentGameId = actualGameId || idPartida;
  const connectionStatus = getConnectionStatus();

  if (isCreatingGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Creando partida...</div>
      </div>
    );
  }

  if (showLoadingForPlayer2 && idPartida && gameStatus === 'waiting') {
    return <FetchWithGif />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex flex-col">
      <HeaderGame />
      
      <div className="flex-1 flex flex-col md:flex-row p-4 mt-16 md:mt-20 gap-4">
        {/* Game Section */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl bg-blue-800 rounded-lg shadow-lg p-4 sm:p-6">
            {/* Connection Status */}
            <div className="text-center mb-4">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                connectionStatus === 'Conectado' ? 'bg-green-500 text-white' : 
                connectionStatus === 'Conectando...' ? 'bg-yellow-500 text-white' : 
                'bg-red-500 text-white'
              }`}>
                {connectionStatus}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500 text-white rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Players Info */}
            <div className="flex justify-between items-center mb-4 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 bg-blue-700 rounded-lg p-2 sm:p-3 flex-1">
                <img src={player1.picture} alt="Player 1" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full" />
                <div className="flex flex-col min-w-0">
                  <span className="text-white font-bold text-sm sm:text-base truncate">{player1.name}</span>
                  <span className="text-white text-xs sm:text-sm">X</span>
                </div>
              </div>
              
              <span className="text-white text-sm sm:text-lg font-bold px-2">VS</span>
              
              <div className="flex items-center gap-2 sm:gap-3 bg-blue-700 rounded-lg p-2 sm:p-3 flex-1">
                <img src={player2.picture} alt="Player 2" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full" />
                <div className="flex flex-col min-w-0">
                  <span className="text-white font-bold text-sm sm:text-base truncate">{player2.name}</span>
                  <span className="text-white text-xs sm:text-sm">O</span>
                </div>
              </div>
            </div>

            {/* User Symbol Info */}
            {gameStatus === 'playing' && (
              <div className="text-center mb-4 bg-blue-700 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-white">
                  <span className="text-sm sm:text-lg">Tú juegas con:</span>
                  <span className="text-lg sm:text-xl font-bold">{currentUserSymbol}</span>
                </div>
              </div>
            )}

            {/* Game Board */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
              {board.map((_, index) => renderSquare(index))}
            </div>

            {/* Game Status */}
            <div className="text-center text-white text-sm sm:text-lg md:text-xl mb-4">
              {gameStatus === 'waiting' && 'Esperando a que un amigo se una...'}
              {gameStatus === 'playing' && !winner && currentTurn && (
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
                  {winner === 'X' ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Circle className="w-5 h-5 sm:w-6 sm:h-6" />}
                </div>
              )}
              {gameStatus === 'finished' && !winner && '¡Empate!'}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-400 transition text-sm sm:text-base"
                onClick={handleLeaveGame}
              >
                Abandonar Partida
              </button>
              {connectionStatus === 'Desconectado' && (
                <button
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-400 transition text-sm sm:text-base"
                  onClick={() => connectWebSocket(currentGameId)}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Conectando...' : 'Reconectar'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Section - Desktop */}
        <div className="hidden md:flex w-80 lg:w-96 xl:w-[400px] bg-blue-900 rounded-lg shadow-lg p-4 flex-col">
          <h3 className="text-white text-lg font-bold mb-4">Chat en Tiempo Real</h3>
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto mb-4 space-y-3" style={{ maxHeight: '400px' }}>
              {messages.map((msg, index) => {
                if (!msg || !msg.text || !msg.user || !msg.userId || !msg.picture || !msg.timestamp) {
                  return null;
                }
                const isMyMessage = msg.userId === parseInt(idUsuario);
                return (
                  <div key={index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start gap-2 max-w-[80%] ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                      <img src={msg.picture} alt={msg.user} className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                        <span className="text-blue-300 text-xs mb-1">{msg.user}</span>
                        <div className={`rounded-lg px-3 py-2 ${isMyMessage ? 'bg-blue-600 text-white' : 'bg-blue-800 text-white'}`}>
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
                className="flex-1 bg-blue-700 text-white rounded p-2 focus:outline-none placeholder-blue-300 text-sm"
                placeholder="Escribe un mensaje..."
                disabled={gameStatus !== 'playing' || connectionStatus !== 'Conectado'}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 transition disabled:opacity-50 text-sm"
                disabled={gameStatus !== 'playing' || !newMessage.trim() || connectionStatus !== 'Conectado'}
              >
                Enviar
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Chat Toggle Button */}
        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <button
            onClick={toggleChat}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-500 transition relative"
          >
            <MessageCircle className="w-6 h-6" />
            {unreadMessages > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Chat Modal */}
        {isChatExpanded && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleChat}>
            <div className="absolute bottom-0 left-0 right-0 bg-blue-900 rounded-t-lg shadow-lg max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-blue-700">
                <h3 className="text-white text-lg font-bold">Chat en Tiempo Real</h3>
                <button
                  onClick={toggleChat}
                  className="text-white hover:text-blue-300 transition"
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, index) => {
                  if (!msg || !msg.text || !msg.user || !msg.userId || !msg.picture || !msg.timestamp) {
                    return null;
                  }
                  const isMyMessage = msg.userId === parseInt(idUsuario);
                  return (
                    <div key={index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start gap-2 max-w-[80%] ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                        <img src={msg.picture} alt={msg.user} className="w-8 h-8 rounded-full flex-shrink-0" />
                        <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                          <span className="text-blue-300 text-xs mb-1">{msg.user}</span>
                          <div className={`rounded-lg px-3 py-2 ${isMyMessage ? 'bg-blue-600 text-white' : 'bg-blue-800 text-white'}`}>
                            <p className="text-sm">{msg.text}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Chat Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-blue-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-blue-700 text-white rounded p-2 focus:outline-none placeholder-blue-300 text-sm"
                    placeholder="Escribe un mensaje..."
                    disabled={gameStatus !== 'playing' || connectionStatus !== 'Conectado'}
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 transition disabled:opacity-50 text-sm"
                    disabled={gameStatus !== 'playing' || !newMessage.trim() || connectionStatus !== 'Conectado'}
                  >
                    Enviar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicTacToe;