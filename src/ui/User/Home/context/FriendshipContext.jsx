import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  getSentFriendRequests,
  getReceivedFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getPendingRequestsCount,
  getFriendsCount,
} from '../services/Services';

export const FriendshipContext = createContext();

export const FriendshipProvider = ({ children }) => {
  const [friendCount, setFriendCount] = useState(0);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFriendshipData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [requestsResponse, friendsResponse] = await Promise.all([
        getPendingRequestsCount(),
        getFriendsCount(),
      ]);

      setPendingRequestCount(requestsResponse.totalPendingRequests || 0);
      setFriendCount(friendsResponse.friendsCount || 0);
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar datos de notificaciones';
      setError(errorMessage);
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendshipData();
  }, []);

  const handleAccept = async (idSolicitudAmistad) => {
    if (!window.confirm('¿Estás seguro de que quieres aceptar esta solicitud?')) return;
    try {
      await acceptFriendRequest(idSolicitudAmistad);
      toast.success('Solicitud aceptada con éxito', { position: 'top-right' });
      fetchFriendshipData(); // Actualizar conteos
    } catch (err) {
      const errorMessage = err.message || 'Error al aceptar solicitud';
      setError(errorMessage);
      toast.error(errorMessage, { position: 'top-right' });
    }
  };

  const handleReject = async (idSolicitudAmistad) => {
    if (!window.confirm('¿Estás seguro de que quieres rechazar esta solicitud?')) return;
    try {
      await rejectFriendRequest(idSolicitudAmistad);
      toast.success('Solicitud rechazada con éxito', { position: 'top-right' });
      fetchFriendshipData(); // Actualizar conteos
    } catch (err) {
      const errorMessage = err.message || 'Error al rechazar solicitud';
      setError(errorMessage);
      toast.error(errorMessage, { position: 'top-right' });
    }
  };

  return (
    <FriendshipContext.Provider
      value={{
        friendCount,
        pendingRequestCount,
        loading,
        error,
        fetchFriendshipData,
        getSentFriendRequests,
        getReceivedFriendRequests,
        acceptFriendRequest: handleAccept,
        rejectFriendRequest: handleReject,
        getFriends,
      }}
    >
      {children}
    </FriendshipContext.Provider>
  );
};

export default FriendshipProvider;