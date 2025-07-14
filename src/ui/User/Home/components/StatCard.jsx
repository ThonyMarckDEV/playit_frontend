import React from 'react';

const StatCard = ({ stat }) => {
  const Icon = stat.icon;
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
          <p className="text-2xl font-bold text-white">{stat.value}</p>
        </div>
        <Icon className="w-8 h-8 text-blue-400" />
      </div>
    </div>
  );
};

export default StatCard;