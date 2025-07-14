import React from 'react';
import { Trophy } from 'lucide-react';

const RecentActivity = () => {
  const activities = [
    { action: 'Ganaste una partida de Triki', time: 'hace 2 horas', icon: '🏆' },
    { action: 'Nuevo récord en Memoria', time: 'hace 5 horas', icon: '⭐' },
    { action: 'Partida multijugador completada', time: 'hace 1 día', icon: '🎮' },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <Trophy className="w-5 h-5 mr-2 text-blue-400" />
        Actividad Reciente
      </h3>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
            <span className="text-xl">{activity.icon}</span>
            <div className="flex-1">
              <p className="text-white text-sm">{activity.action}</p>
              <p className="text-gray-400 text-xs">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;