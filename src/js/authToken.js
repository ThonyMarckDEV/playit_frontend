import axios from 'axios';
import API_BASE_URL from './urlHelper';
import jwtUtils from '../utilities/jwtUtils';

async function validateRefreshTokenID() {
  try {
    const refresh_token = jwtUtils.getRefreshTokenFromCookie();
    const refresh_token_id = jwtUtils.getRefreshTokenIDFromCookie();
    const userID = jwtUtils.getUserID(refresh_token);
    
    if (!refresh_token_id || !userID) {
      console.log('[Token] No se encontró ID de refresh token o ID de usuario');
      return false;
    }
    
    const response = await axios.post(`${API_BASE_URL}/api/validate-refresh-token`, {
      refresh_token_id,
      userID
    });
    
    return response.data.valid;
  } catch (error) {
    console.error('[Token] Error al validar ID de refresh token:', error.message);
    return false;
  }
}

async function refreshAccessToken() {
  // console.log('[Token] Iniciando renovación del access token...');
  try {
    const refresh_token = jwtUtils.getRefreshTokenFromCookie();
    //console.log('[Token] Refresh token obtenido de cookies');
    
    const response = await axios.post(`${API_BASE_URL}/api/refresh`, { refresh_token });
    //console.log('[Token] Respuesta del servidor recibida');
    
    const newAccessToken = response.data.access_token;
    jwtUtils.setAccessTokenInCookie(newAccessToken);
    // console.log('[Token] Nuevo access token guardado en cookies');
    
    return newAccessToken;
  } catch (error) {
    //console.error('[Token] Error al refrescar el token:', error.message);
    //console.log('[Token] Ejecutando logout...');
    logout();
    throw error;
  }
}

function isTokenExpired(token) {
  if (!token) {
    // console.log('[Token] No se encontró token');
    return true;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiraEn = new Date(payload.exp * 1000).toLocaleTimeString();
    // console.log(`[Token] Expiración: ${expiraEn}`);
    
    const expirado = payload.exp * 1000 < Date.now();
    // if (expirado) console.log('[Token] Token expirado');
    // else console.log('[Token] Token aún válido');
    
    return expirado;
  } catch (error) {
    // console.error('[Token] Error al decodificar token:', error.message);
    return true;
  }
}

async function verificarYRenovarToken() {
  // console.log('[Token] Verificando estado del token...');
  
  // Primero verificar si el ID del refresh token sigue siendo válido
  const isValidRefreshTokenID = await validateRefreshTokenID();
  if (!isValidRefreshTokenID) {
    console.log('[Token] ID de refresh token no válido. Posible inicio de sesión en otro dispositivo.');
    logout();
    throw new Error('Sesión cerrada por inicio de sesión en otro dispositivo');
  }
  
  let access_token = jwtUtils.getAccessTokenFromCookie();
  
  if (isTokenExpired(access_token)) {
    // console.log('[Token] Access token expirado. Verificando refresh token...');
    const refresh_token = jwtUtils.getRefreshTokenFromCookie();
    
    if (isTokenExpired(refresh_token)) {
      // console.log('[Token] Refresh token también expirado. Sesión finalizada');
      logout();
      throw new Error('Sesión expirada');
    }
    
    // console.log('[Token] Refresh token válido. Solicitando nuevo access token...');
    access_token = await refreshAccessToken();
    // console.log('[Token] Nuevo access token recibido:', access_token?.substring(0, 15) + '...');
  } else {
    // console.log('[Token] Access token aún válido. No se requiere renovación');
  }
  
  return access_token;
}

  async function fetchWithAuth(url, options = {}) {
    //console.log(`[API] Solicitud a: ${url}`);
    const access_token = await verificarYRenovarToken();
    
    // console.log('[API] Enviando solicitud con token:', access_token?.substring(0, 15) + '...');
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${access_token}`
    };
    
    return fetch(url, { ...options, headers });
  }


function logout() {
  jwtUtils.removeTokensFromCookie();
  window.location.href = '/'; // Redirigir a la página de login
}

export { fetchWithAuth, verificarYRenovarToken, logout, validateRefreshTokenID };