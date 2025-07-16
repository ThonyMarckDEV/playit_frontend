import React from 'react';

const ChatSection = ({ messages, newMessage, setNewMessage, sendMessage, gameStatus, connectionStatus, idUsuario }) => (
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
);

export default ChatSection;