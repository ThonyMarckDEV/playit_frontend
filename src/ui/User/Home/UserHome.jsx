import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Trophy, Users, Zap } from 'lucide-react';
import jwtUtils from '../../../utilities/jwtUtils';
import Header from '../../Reutilizables/Header';
import WelcomeSection from './components/WelcomeSection';
import StatCard from './components/StatCard';
import GameCard from './components/GameCard';
import RecentActivity from './components/RecentActivity';
import Section from './components/Section';

const UserHome = () => {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState(null);

  // Get user info from access token
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();
  const name = refresh_token ? jwtUtils.getName(refresh_token) || 'Usuario' : 'Usuario';
  const email = refresh_token ? jwtUtils.getEmail(refresh_token) || 'No email' : 'No email';
  const profilePicture = refresh_token ? jwtUtils.getProfilePicture(refresh_token) : null;
  const userCode = refresh_token ? jwtUtils.getUserCode(refresh_token) || 'No code' : 'No code';

  const games = [
    { id: 1, name: 'Triki', icon: '⚡', players: '1-2', difficulty: 'Fácil', color: 'from-blue-500 to-cyan-600', route: '/usuario/game/tictactoe' },
    { id: 2, name: 'Memoria', icon: '🧠', players: '1', difficulty: 'Medio', color: 'from-blue-600 to-blue-800', route: '/memory' },
    { id: 3, name: 'Conecta 4', icon: '🔴', players: '2', difficulty: 'Medio', color: 'from-blue-500 to-indigo-600', route: '/connect4' },
    { id: 4, name: 'Puzzle', icon: '🧩', players: '1', difficulty: 'Difícil', color: 'from-blue-500 to-blue-700', route: '/puzzle' },
    { id: 5, name: 'Palabras', icon: '📝', players: '1-4', difficulty: 'Medio', color: 'from-blue-400 to-cyan-500', route: '/words' },
    { id: 6, name: 'Matemáticas', icon: '🔢', players: '1', difficulty: 'Fácil', color: 'from-blue-500 to-teal-600', route: '/math' },
  ];

  const stats = [
    { label: 'Juegos Jugados', value: '47', icon: Play },
    { label: 'Victorias', value: '32', icon: Trophy },
    { label: 'Amigos Online', value: '8', icon: Users },
  ];

  // Handle game selection and navigation
  const handleGameClick = (game) => {
    setActiveGame(game.id);
    navigate(game.route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <WelcomeSection name={name} email={email} profilePicture={profilePicture} userCode={userCode} />
        
        {/* Friend Requests Section */}
        <Section />
        
        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>
        
        {/* Juegos disponibles */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Zap className="w-6 h-6 mr-2 text-blue-400" />
              Juegos Disponibles
            </h2>
            <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
              Ver todos
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} onClick={() => handleGameClick(game)} />
            ))}
          </div>
        </div>
        
        {/* Actividad reciente */}
        <RecentActivity />
      </div>
    </div>
  );
};

export default UserHome;