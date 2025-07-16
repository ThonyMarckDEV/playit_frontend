import React from 'react';

const ConnectionStatus = ({ connectionStatus, soundEnabled, toggleSound }) => (
  <div className="flex justify-center items-center gap-4 mb-4">
    <div
      className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
        connectionStatus === 'Conectado'
          ? 'bg-green-500 text-white'
          : connectionStatus === 'Conectando...'
          ? 'bg-yellow-500 text-white'
          : 'bg-red-500 text-white'
      }`}
    >
      {connectionStatus}
    </div>
    <button
      onClick={toggleSound}
      className={`px-3 py-1 rounded-full text-sm font-bold transition ${
        soundEnabled ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
      }`}
    >
      {soundEnabled ? '🔊 Sonido' : '🔇 Silencio'}
    </button>
  </div>
);

export default ConnectionStatus;