import React, { useState, useContext } from 'react';
import { RefreshCw, Check, X } from 'lucide-react';
import CBXAddFriend from './CBXAddFriend';
import FriendsList from './FriendsList';
import { FriendshipContext } from '../context/FriendshipContext';
import { toast } from 'react-toastify';

const FriendsRequest = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [imageLoading, setImageLoading] = useState({});
  const { friendCount, pendingRequestCount, loading, error, fetchFriendshipData, getSentFriendRequests, getReceivedFriendRequests, acceptFriendRequest, rejectFriendRequest } = useContext(FriendshipContext);

  const fetchRequests = async () => {
    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        getSentFriendRequests(),
        getReceivedFriendRequests(),
      ]);
      setSentRequests(sentResponse.sentRequests || []);
      setReceivedRequests(receivedResponse.receivedRequests || []);
      fetchFriendshipData(); // Actualizar conteos después de cargar solicitudes
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar solicitudes';
      toast.error(errorMessage, { position: 'top-right' });
    }
  };

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
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b-2 border-blue-400/50">
        <button
          className={`flex-1 py-3 px-6 text-center text-white font-semibold transition-all duration-200 ${
            activeTab === 'search'
              ? 'border-b-4 border-blue-400 text-blue-400 bg-blue-900/20'
              : 'text-gray-300 hover:text-blue-300 hover:bg-blue-900/10'
          }`}
          onClick={() => setActiveTab('search')}
        >
          Buscar
        </button>
        <button
          className={`flex-1 py-3 px-6 text-center text-white font-semibold transition-all duration-200 relative ${
            activeTab === 'requests'
              ? 'border-b-4 border-blue-400 text-blue-400 bg-blue-900/20'
              : 'text-gray-300 hover:text-blue-300 hover:bg-blue-900/10'
          }`}
          onClick={() => {
            setActiveTab('requests');
            fetchRequests();
          }}
        >
          Solicitudes de Amistad
          {pendingRequestCount > 0 && (
            <span className="absolute top-0 right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
              {pendingRequestCount}
            </span>
          )}
        </button>
        <button
          className={`flex-1 py-3 px-6 text-center text-white font-semibold transition-all duration-200 relative ${
            activeTab === 'friends'
              ? 'border-b-4 border-blue-400 text-blue-400 bg-blue-900/20'
              : 'text-gray-300 hover:text-blue-300 hover:bg-blue-900/10'
          }`}
          onClick={() => setActiveTab('friends')}
        >
          Amigos
          {friendCount > 0 && (
            <span className="absolute top-0 right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full">
              {friendCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'search' ? (
        <div className="bg-transparent border border-blue-400/30 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">Buscar Amigos</h2>
          <CBXAddFriend onFriendAdded={fetchFriendshipData} />
        </div>
      ) : activeTab === 'requests' ? (
        <div className="bg-transparent border border-blue-400/30 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Solicitudes de Amistad</h2>
            <button
              onClick={fetchRequests}
              className={`flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200 px-4 py-2 rounded-lg bg-blue-900/20 border border-blue-400/50 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>

          {error && (
            <p className="text-red-400 bg-red-900/20 p-3 rounded-lg mb-4 border border-red-400/50">{error}</p>
          )}

          {/* Sent Requests */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">Solicitudes Enviadas</h3>
            {sentRequests.length === 0 ? (
              <p className="text-gray-300 bg-blue-900/10 p-4 rounded-lg border border-blue-400/30">
                No has enviado ninguna solicitud de amistad.
              </p>
            ) : (
              <div className="space-y-4">
                {sentRequests.map((request) => (
                  <div
                    key={request.idSolicitudAmistad}
                    className="flex items-center justify-between bg-blue-900/50 p-4 rounded-lg border border-blue-400/30 shadow-sm hover:shadow-md hover:bg-blue-900/70 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      {request.perfil && isValidUrl(request.perfil) ? (
                        <div className="relative w-12 h-12 mr-4">
                          {imageLoading[request.idSolicitudAmistad] !== false && (
                            <div className="absolute w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center text-white text-lg font-semibold border-2 border-blue-400/50">
                              {request.nombre.charAt(0)}
                            </div>
                          )}
                          <img
                            src={request.perfil}
                            alt={`Perfil de ${request.nombre}`}
                            className={`w-12 h-12 rounded-full border-2 border-blue-400/50 ${
                              imageLoading[request.idSolicitudAmistad] === false ? 'opacity-100' : 'opacity-0'
                            }`}
                            onLoad={() => setImageLoading((prev) => ({ ...prev, [request.idSolicitudAmistad]: false }))}
                            onError={(e) => {
                              e.target.src = '/default-profile.png';
                              e.target.onerror = null;
                              setImageLoading((prev) => ({ ...prev, [request.idSolicitudAmistad]: false }));
                            }}
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-900/30 mr-4 flex items-center justify-center text-white text-lg font-semibold border-2 border-blue-400/50">
                          {request.nombre.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{request.nombre}</p>
                        <p className="text-gray-300 text-sm">{request.user_code}</p>
                      </div>
                    </div>
                    <p className="text-yellow-400 font-medium bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-400/50">
                      Pendiente
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Received Requests */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Solicitudes Recibidas</h3>
            {receivedRequests.length === 0 ? (
              <p className="text-gray-300 bg-blue-900/10 p-4 rounded-lg border border-blue-400/30">
                No has recibido ninguna solicitud de amistad.
              </p>
            ) : (
              <div className="space-y-4">
                {receivedRequests.map((request) => (
                  <div
                    key={request.idSolicitudAmistad}
                    className="flex items-center justify-between bg-blue-900/40 p-4 rounded-lg border border-blue-400/30 shadow-sm hover:shadow-md hover:bg-blue-900/60 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      {request.perfil && isValidUrl(request.perfil) ? (
                        <div className="relative w-12 h-12 mr-4">
                          {imageLoading[request.idSolicitudAmistad] !== false && (
                            <div className="absolute w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center text-white text-lg font-semibold border-2 border-blue-400/50">
                              {request.nombre.charAt(0)}
                            </div>
                          )}
                          <img
                            src={request.perfil}
                            alt={`Perfil de ${request.nombre}`}
                            className={`w-12 h-12 rounded-full border-2 border-blue-400/50 ${
                              imageLoading[request.idSolicitudAmistad] === false ? 'opacity-100' : 'opacity-0'
                            }`}
                            onLoad={() => setImageLoading((prev) => ({ ...prev, [request.idSolicitudAmistad]: false }))}
                            onError={(e) => {
                              e.target.src = '/default-profile.png';
                              e.target.onerror = null;
                              setImageLoading((prev) => ({ ...prev, [request.idSolicitudAmistad]: false }));
                            }}
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-900/30 mr-4 flex items-center justify-center text-white text-lg font-semibold border-2 border-blue-400/50">
                          {request.nombre.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{request.nombre}</p>
                        <p className="text-gray-300 text-sm">{request.user_code}</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => acceptFriendRequest(request.idSolicitudAmistad)}
                        className="p-2 bg-green-600/80 rounded-full hover:bg-green-700/80 transition-colors duration-200 shadow-sm border border-green-400/50"
                        title="Aceptar"
                        aria-label={`Aceptar solicitud de amistad de ${request.nombre}`}
                      >
                        <Check className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => rejectFriendRequest(request.idSolicitudAmistad)}
                        className="p-2 bg-red-600/80 rounded-full hover:bg-red-700/80 transition-colors duration-200 shadow-sm border border-red-400/50"
                        title="Rechazar"
                        aria-label={`Rechazar solicitud de amistad de ${request.nombre}`}
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <FriendsList onRefresh={fetchFriendshipData} />
      )}
    </div>
  );
};

export default FriendsRequest;