import React from 'react';
import { MessageCircle, ChevronDown } from 'lucide-react';

const MobileChat = ({ isChatExpanded, toggleChat, unreadMessages, messages, newMessage, setNewMessage, sendMessage, gameStatus, connectionStatus, idUsuario }) => (
  <>
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
    {isChatExpanded && (
      <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleChat}>
        <div className="absolute bottom-0 left-0 right-0 bg-blue-900 rounded-t-lg shadow-lg max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-blue-700">
            <h3 className="text-white text-lg font-bold">Chat en Tiempo Real</h3>
            <button onClick={toggleChat} className="text-white hover:text-blue-300 transition">
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
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
  </>
);

export default MobileChat;