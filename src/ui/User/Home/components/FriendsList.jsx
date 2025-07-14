import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { FriendshipContext } from '../context/FriendshipContext';
import { toast } from 'react-toastify';

const FriendsList = ({ onRefresh }) => {
  const { getFriends, friendCount } = useContext(FriendshipContext);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageLoading, setImageLoading] = useState({});
  const friendsPerPage = 4;

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getFriends();
      setFriends(response.friends || []);
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar la lista de amigos';
      setError(errorMessage);
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  }, [getFriends]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const currentFriends = useMemo(() => {
    const indexOfLastFriend = currentPage * friendsPerPage;
    const indexOfFirstFriend = indexOfLastFriend - friendsPerPage;
    return friends.slice(indexOfFirstFriend, indexOfLastFriend);
  }, [friends, currentPage]);

  const totalPages = Math.ceil(friends.length / friendsPerPage);

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    document.getElementById('friends-list-container')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isValidUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-transparent border border-blue-400/30 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Users className="w-6 h-6 mr-2 text-blue-400" />
          Mis Amigos ({friendCount})
        </h2>
        <button
          onClick={() => {
            fetchFriends();
            if (onRefresh) onRefresh();
          }}
          className={`flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200 px-4 py-2 rounded-lg bg-blue-900/20 border border-blue-400/50 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          <Loader2 className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : 'hidden'}`} />
          Actualizar
        </button>
      </div>

      {error && (
        <p className="text-red-400 bg-red-900/20 p-3 rounded-lg mb-4 border border-red-400/50">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : friends.length === 0 ? (
        <p className="text-gray-300 bg-blue-900/10 p-4 rounded-lg border border-blue-400/30">
          No tienes amigos en tu lista.
        </p>
      ) : (
        <>
          <div
            id="friends-list-container"
            className="max-h-96 overflow-y-auto space-y-4 pr-2"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#60A5FA #1E3A8A' }}
          >
            {currentFriends.map((friend) => (
              <div
                key={friend.idUsuario}
                className="flex items-center justify-between bg-blue-900/50 p-4 rounded-lg border border-blue-400/30 shadow-sm hover:shadow-md hover:bg-blue-900/70 transition-all duration-200"
              >
                <div className="flex items-center">
                  {friend.perfil && isValidUrl(friend.perfil) ? (
                    <div className="relative w-12 h-12 mr-4">
                      {imageLoading[friend.idUsuario] !== false && (
                        <div className="absolute w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center text-white text-lg font-semibold border-2 border-blue-400/50">
                          {friend.nombre.charAt(0)}
                        </div>
                      )}
                      <img
                        src={friend.perfil}
                        alt={`Perfil de ${friend.nombre}`}
                        className={`w-12 h-12 rounded-full border-2 border-blue-400/50 ${
                          imageLoading[friend.idUsuario] === false ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setImageLoading((prev) => ({ ...prev, [friend.idUsuario]: false }))}
                        onError={(e) => {
                          e.target.src = '/default-profile.png';
                          e.target.onerror = null;
                          setImageLoading((prev) => ({ ...prev, [friend.idUsuario]: false }));
                        }}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-900/30 mr-4 flex items-center justify-center text-white text-lg font-semibold border-2 border-blue-400/50">
                      {friend.nombre.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{friend.nombre}</p>
                    <p className="text-gray-300 text-sm">{friend.user_code}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  Amigo desde {new Date(friend.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg text-white font-medium ${
                  currentPage === 1 ? 'bg-gray-500/50 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 rounded-lg text-white font-medium ${
                    currentPage === index + 1 ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg text-white font-medium ${
                  currentPage === totalPages ? 'bg-gray-500/50 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FriendsList;