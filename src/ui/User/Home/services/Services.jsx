import API_BASE_URL from '../../../../js/urlHelper';
import { fetchWithAuth } from '../../../../js/authToken';

// ENVIAR SOLICITUD DE AMISTAD
export const handleSendFriendRequest = async (friendId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/user/friend/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ friend_id: friendId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al enviar solicitud de amistad');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

// BUSCAR USUARIOS POR CODE_USER
export const searchUsers = async (userCode) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/user/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ user_code: userCode }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Usuario no encontrado');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// OBTENER SOLICITUDES DE AMISTAD ENVIADAS
export const getSentFriendRequests = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/friend/requests/sent`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener solicitudes enviadas');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching sent friend requests:', error);
    throw error;
  }
};

// OBTENER SOLICITUDES DE AMISTAD RECIBIDAS
export const getReceivedFriendRequests = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/friend/requests/received`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener solicitudes recibidas');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching received friend requests:', error);
    throw error;
  }
};

// ACEPTAR SOLICITUD DE AMISTAD
export const acceptFriendRequest = async (idSolicitudAmistad) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/friend/requests/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ idSolicitudAmistad }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al aceptar solicitud de amistad');
    }

    return await response.json();
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

// RECHAZAR SOLICITUD DE AMISTAD
export const rejectFriendRequest = async (idSolicitudAmistad) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/friend/requests/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ idSolicitudAmistad }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al rechazar solicitud de amistad');
    }

    return await response.json();
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
};

// OBTENER LISTA DE AMIGOS
export const getFriends = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/friends`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener la lista de amigos');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching friends list:', error);
    throw error;
  }
};

// OBTENER CONTEO DE SOLICITUDES PENDIENTES
export const getPendingRequestsCount = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/notifications/pending-requests-count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener conteo de solicitudes pendientes');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching pending requests count:', error);
    throw error;
  }
};

// OBTENER CONTEO DE AMIGOS
export const getFriendsCount = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/notifications/friends-count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener conteo de amigos');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching friends count:', error);
    throw error;
  }
};