import React from 'react';
import { Crown } from 'lucide-react';

const WelcomeSection = ({ name, email, profilePicture, userCode }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 mb-8">
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Perfil"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-blue-400/50"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white/20"></div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            ¡Bienvenido de vuelta, {name}!
          </h1>
          <p className="text-gray-300 mb-2">{email}</p>
          <p className="text-gray-300 mb-4">{userCode}</p>
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <Crown className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-semibold">Nivel 12</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-300">1,250 XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;