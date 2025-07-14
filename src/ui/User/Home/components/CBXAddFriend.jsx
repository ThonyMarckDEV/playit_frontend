import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, UserPlus, Check, X, Loader2, Clock } from 'lucide-react';
import { handleSendFriendRequest, searchUsers } from '../services/Services';

const CBXAddFriend = ({ onFriendAdded }) => {
  const [friendCode, setFriendCode] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (friendCode.length < 3) {
      setSearchError('Ingresa al menos 3 caracteres para buscar');
      return;
    }

    setIsSearching(true);
    try {
      setSearchError(null);
      const data = await searchUsers(friendCode);
      setSearchResults(data.users || [data.user].filter(Boolean));
      setIsDropdownOpen(true);
    } catch (error) {
      setSearchError(error.message || 'Error al buscar usuario');
      setSearchResults([]);
      setIsDropdownOpen(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user) => {
    setFriendCode(user.user_code);
    setIsDropdownOpen(false);
    setSearchError(null);
  };

  const handleSendRequest = async (userId) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      setRequestStatus(null);
      await handleSendFriendRequest(userId);
      setRequestStatus({ type: 'success', message: 'Solicitud de amistad enviada con éxito' });
      
      // Llamar a la función onFriendAdded para actualizar la lista de solicitudes
      if (onFriendAdded) onFriendAdded();
      
      // Limpiar después de 3 segundos
      setTimeout(() => {
        setRequestStatus(null);
      }, 3000);
    } catch (error) {
      setRequestStatus({ 
        type: 'error', 
        message: error.message || 'Error al enviar solicitud' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setFriendCode(value);
    setSearchError(null);
    setRequestStatus(null);
  };

  const clearInput = () => {
    setFriendCode('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    setSearchError(null);
    setRequestStatus(null);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
        <UserPlus className="w-6 h-6 mr-3 text-blue-400" />
        Agregar Amigo
      </h3>
      
      {/* Contenedor principal con overflow hidden para contener el dropdown */}
      <div className="relative overflow-hidden" ref={dropdownRef}>
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar por código de usuario (ej. PLAYITUSER#00001)"
              value={friendCode}
              onChange={handleInputChange}
              className="w-full px-6 py-4 pr-16 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            
            {/* Indicador de búsqueda */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              {isSearching && (
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              )}
              {friendCode && (
                <button
                  onClick={clearInput}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={handleSearch}
            disabled={friendCode.length < 3 || isSearching}
            className={`px-8 py-4 rounded-xl flex items-center justify-center transition-all font-medium min-w-[180px] text-lg ${
              friendCode.length >= 3 && !isSearching
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
            }`}
          >
            {isSearching ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-6 h-6 mr-3" />
                Buscar
              </>
            )}
          </button>
        </div>

        {/* Dropdown de resultados */}
        {isDropdownOpen && searchResults.length > 0 && (
          <div className="w-full bg-white/20 backdrop-blur-xl rounded-xl mt-2 border border-white/30 max-h-60 overflow-y-auto shadow-2xl">
            {searchResults.map((user) => (
              <div
                key={user.idUsuario}
                className="px-6 py-4 hover:bg-blue-500/20 flex items-center space-x-4 transition-all duration-200"
              >
                {user.perfil ? (
                  <img
                    src={user.perfil}
                    alt={`Perfil de ${user.nombre}`}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-400/50"
                    onError={(e) => (e.target.src = '/default-profile.png')}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-lg font-bold">
                    {user.nombre.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-white font-semibold text-lg">{user.nombre}</p>
                  <p className="text-gray-300 text-sm">{user.user_code}</p>
                </div>
                {user.friendshipStatus?.isFriend ? (
                  <div className="flex items-center px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 font-medium">
                    <Users className="w-4 h-4 mr-2" />
                    Amigos
                  </div>
                ) : user.friendshipStatus && user.friendshipStatus.status === '0' && user.friendshipStatus.isSender ? (
                  <div className="flex items-center px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-medium">
                    <Clock className="w-4 h-4 mr-2" />
                    Ya enviada
                  </div>
                ) : (
                  <button
                    onClick={() => handleSendRequest(user.idUsuario)}
                    disabled={isLoading || user.friendshipStatus?.isFriend || (user.friendshipStatus?.status === '0' && user.friendshipStatus?.isSender)}
                    className={`px-4 py-2 rounded-lg flex items-center transition-all font-medium ${
                      !isLoading && !user.friendshipStatus?.isFriend && !(user.friendshipStatus?.status === '0' && user.friendshipStatus?.isSender)
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                    }`}
                    aria-label={`Agregar a ${user.nombre} como amigo`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Agregar
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Estado de búsqueda vacía */}
        {isDropdownOpen && !isSearching && searchResults.length === 0 && friendCode.length >= 3 && (
          <div className="w-full bg-white/15 backdrop-blur-xl rounded-xl mt-2 border border-white/30 p-6">
            <p className="text-gray-300 text-center text-lg">No se encontraron usuarios</p>
          </div>
        )}
      </div>

      {/* Mensajes de error */}
      {searchError && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center">
          <X className="w-6 h-6 text-red-400 mr-3" />
          <p className="text-red-400 text-lg">{searchError}</p>
        </div>
      )}

      {/* Mensajes de estado */}
      {requestStatus && (
        <div className={`mt-4 p-4 rounded-xl flex items-center ${
          requestStatus.type === 'success' 
            ? 'bg-green-500/20 border border-green-500/30' 
            : 'bg-red-500/20 border border-red-500/30'
        }`}>
          {requestStatus.type === 'success' ? (
            <Check className="w-6 h-6 text-green-400 mr-3" />
          ) : (
            <X className="w-6 h-6 text-red-400 mr-3" />
          )}
          <p className={`text-lg ${requestStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {requestStatus.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default CBXAddFriend;