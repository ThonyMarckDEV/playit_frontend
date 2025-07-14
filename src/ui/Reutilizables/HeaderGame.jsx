import React from 'react';
import { Gamepad2, Settings, LogOut } from 'lucide-react';
import { logout } from '../../js/logout';

const Header = () => {
  return (
    <div className="fixed top-0 left-0 w-full bg-blue-900/20 backdrop-blur-sm border-b border-white/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">PLAY .IT</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* <button className="p-2 text-gray-300 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={logout}
              className="p-2 text-gray-300 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;