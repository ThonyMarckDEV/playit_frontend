import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import jwtUtils from '../../../utilities/jwtUtils';
import HeaderGame from '../../Reutilizables/HeaderGame';
import FetchWithGif from '../../Reutilizables/FetchWithGif';
import { API_BASE_URL_GAME_TRIKI, WEBSOCKET_TRIKI_URL } from '../../../js/trikiHelper';
import GameBoard from './components/GameBoard';
import PlayerInfo from './components/PlayerInfo';
import GameStatus from './components/GameStatus';
import ChatSection from './components/ChatSection';
import MobileChat from './components/MobileChat';
import ConnectionStatus from './components/ConnectionStatus';

const TicTacToe = () => {
  const navigate = useNavigate();
  const { idPartida } = useParams();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState(null);
  const [player1, setPlayer1] = useState({ id: null, name: 'Player 1', picture: 'https://static.vecteezy.com/system/resources/previews/014/767/688/non_2x/poeple-or-user-profile-icon-on-white-background-illustration-eps-10-vector.jpg' });
  const [player2, setPlayer2] = useState({ id: null, name: 'Opponent', picture: 'https://static.vecteezy.com/system/resources/previews/014/767/688/non_2x/poeple-or-user-profile-icon-on-white-background-illustration-eps-10-vector.jpg' });
  const [gameStatus, setGameStatus] = useState('waiting');
  const [currentUserData, setCurrentUserData] = useState(null);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [error, setError] = useState(null);
  const [actualGameId, setActualGameId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showLoadingForPlayer2, setShowLoadingForPlayer2] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioContextRef = useRef(null);
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

  const getDisplayPlayers = () => {
    return isCurrentUserPlayer1
      ? { firstPlayer: player1, secondPlayer: player2, firstSymbol: 'X', secondSymbol: 'O' }
      : { firstPlayer: player2, secondPlayer: player1, firstSymbol: 'O', secondSymbol: 'X' };
  };

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const audioContext = initAudioContext();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      if (type === 'move') {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } else if (type === 'win') {
        const frequencies = [523, 659, 784, 1047];
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.2);
          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + index * 0.2);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.2 + 0.4);
          oscillator.start(audioContext.currentTime + index * 0.2);
          oscillator.stop(audioContext.currentTime + index * 0.2 + 0.4);
        });
      } else if (type === 'lose') {
        const frequencies = [400, 350, 300, 200, 150];
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15);
          gainNode.gain.setValueAtTime(0.12, audioContext.currentTime + index * 0.15);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.15 + 0.3);
          oscillator.start(audioContext.currentTime + index * 0.15);
          oscillator.stop(audioContext.currentTime + index * 0.15 + 0.3);
        });
      } else if (type === 'notification') {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }
    } catch (error) {
      console.log(`Error playing ${type} sound:`, error);
    }
  };

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

  const handleWebSocketMessage = useCallback(
    (event) => {
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
          playSound('notification');
        }

        if (data.type === 'move') {
          setBoard(data.board);
          setIsXNext(data.isXNext);
          playSound('move');
        }

        if (data.type === 'chat') {
          if (data.message && data.message.text && data.message.user && data.message.userId && data.message.picture && data.message.timestamp) {
            setMessages((prev) => [...prev, data.message]);
            if (!isChatExpanded && window.innerWidth < 768) {
              setUnreadMessages((prev) => prev + 1);
            }
            playSound('notification');
          }
        }

        if (data.type === 'gameOver') {
          setWinner(data.winner);
          setGameStatus('finished');
          setShowLoadingForPlayer2(false);
          if (data.winner) {
            const winnerIsCurrentUser = (data.winner === 'X' && isCurrentUserPlayer1) || (data.winner === 'O' && !isCurrentUserPlayer1);
            if (winnerIsCurrentUser) {
              playSound('win');
            } else {
              playSound('lose');
            }
          } else {
            playSound('notification');
          }
          if (data.reason === 'opponent_left') {
            alert('¡Ganaste! Tu oponente ha abandonado la partida.');
            playSound('win');
          }
        }

        if (data.type === 'reconnect') {
          setBoard(data.board);
          setIsXNext(data.isXNext);
          setGameStatus(data.status);
          setShowLoadingForPlayer2(false);
          playSound('notification');
        }
      } catch (error) {
        setError('Error processing game data');
      }
    },
    [idUsuario, navigate, isChatExpanded, isCurrentUserPlayer1, soundEnabled]
  );

  const connectWebSocket = useCallback(
    (gameId) => {
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
        websocket.send(JSON.stringify({ type: 'join', idPartida: parseInt(gameId), idUsuario: parseInt(idUsuario) }));
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
    },
    [idUsuario, isConnecting, gameStatus, handleWebSocketMessage]
  );

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
        idUsuario: parseInt(idUsuario),
      }));
    } else {
      setError('Connection lost. Attempting to reconnect...');
      connectWebSocket(currentGameId);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && wsRef.current && wsRef.current.readyState === WebSocket.OPEN && currentUserData) {
      const currentGameId = actualGameId || idPartida;
      const message = {
        text: newMessage,
        user: currentUserData.name,
        userId: currentUserData.id,
        picture: currentUserData.picture,
        timestamp: new Date().toISOString(),
      };
      wsRef.current.send(JSON.stringify({ type: 'chat', idPartida: parseInt(currentGameId), message }));
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

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      playSound('notification');
    }
  };

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

  const displayPlayers = getDisplayPlayers();
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
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl bg-blue-800 rounded-lg shadow-lg p-4 sm:p-6">
            <ConnectionStatus connectionStatus={connectionStatus} soundEnabled={soundEnabled} toggleSound={toggleSound} />
            {error && <div className="mb-4 p-3 bg-red-500 text-white rounded-lg text-center">{error}</div>}
            <PlayerInfo displayPlayers={displayPlayers} gameStatus={gameStatus} currentUserSymbol={currentUserSymbol} />
            <GameBoard board={board} gameStatus={gameStatus} ws={ws} handleClick={handleClick} />
            <GameStatus gameStatus={gameStatus} winner={winner} currentTurn={currentTurn} getWinnerName={getWinnerName} />
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
        <ChatSection
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          gameStatus={gameStatus}
          connectionStatus={connectionStatus}
          idUsuario={idUsuario}
        />
        <MobileChat
          isChatExpanded={isChatExpanded}
          toggleChat={toggleChat}
          unreadMessages={unreadMessages}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          gameStatus={gameStatus}
          connectionStatus={connectionStatus}
          idUsuario={idUsuario}
        />
      </div>
    </div>
  );
};

export default TicTacToe;