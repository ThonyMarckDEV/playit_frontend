// jwtUtils.jsx
import { jwtDecode } from "jwt-decode";


// Función para obtener el username de usuario
//export const getUsername = (token) => decodeToken(token)?.sub ?? null;

export const getUsername = (token) => jwtDecode(token)?.username ?? null;

// Función para obtener el nombre de usuario
export const getName = (token) => jwtDecode(token)?.nombre ?? null;

// Función para obtener el rol del usuario
export const getUserRole = (token) => jwtDecode(token)?.rol ?? null;

export const getUserRoleRefreshToken = (token) => jwtDecode(token)?.rol ?? null;

// Función para obtener el rol del usuario
  export const getEmail= (token) => jwtDecode(token)?.email ?? null;

// Función para obtener la imagen de perfil del usuario
export const getProfilePicture = (token) => jwtDecode(token)?.perfil ?? null;

// Función para obtener la imagen de perfil del usuario
export const getUserCode = (token) => jwtDecode(token)?.user_code ?? null;

// Función para obtener el rol del usuario
export const getUserID = (token) => jwtDecode(token)?.sub ?? null;


// // Función para verificar si el token está expirado
export const isTokenExpired = (token) => {
  const decodedToken = jwtDecode(token);
  if (decodedToken?.exp) {
    const currentTime = Date.now() / 1000; // Tiempo actual en segundos
    return decodedToken.exp < currentTime;
  }
  return true; // Si no hay exp, considera el token como expirado
};

// Función para verificar el token de manera general
export const verifyToken = (token) => {
  if (!token) {
    return { valid: false, message: "Token no proporcionado" };
  }
  
  if (isTokenExpired(token)) {
    return { valid: false, message: "Token expirado" };
  }
  
  return { valid: true, message: "Token válido" };
};

// Función para obtener el valor de una cookie por su nombre
const getCookie = (name) => {
  const cookieString = document.cookie;
  const cookies = cookieString.split(';').map(cookie => cookie.trim());

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue); // Decodifica el valor de la cookie
    }
  }

  return null; // Si no se encuentra la cookie, devuelve null
};

// // Función para obtener el token JWT de la cookie
export const getAccessTokenFromCookie = () => {
  const access_token = 'access_token'; // Nombre de la cookie donde se almacena el token
  return getCookie(access_token);
};

// // Función para obtener el token JWT de la cookie
export const getRefreshTokenFromCookie = () => {
  const refresh_token = 'refresh_token'; // Nombre de la cookie donde se almacena el token
  return getCookie(refresh_token);
};

// // Función para obtener el token JWT de la cookie
export const getRefreshTokenIDFromCookie = () => {
  const refresh_token_id = 'refresh_token_id'; // Nombre de la cookie donde se almacena el token
  return getCookie(refresh_token_id);
};

export const removeTokensFromCookie = () => {
  // Elimina el token de la cookie
  document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refresh_token_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

export const setAccessTokenInCookie = (token) => {
  if (!token) return;

  // Configurar opciones de cookies según "Recordarme"
  const cookieOptions = '; Path=/; Secure; SameSite=Strict';

  // Establecer la cookie con el token
  document.cookie = `access_token=${token}${cookieOptions}`;
};


export default {
  getUsername,
  getName,
  getUserRole,
  isTokenExpired,
  verifyToken,
  removeTokensFromCookie,
  getEmail,
  getAccessTokenFromCookie,
  getRefreshTokenFromCookie,
  getRefreshTokenIDFromCookie,
  getUserID,
  getUserRoleRefreshToken,
  setAccessTokenInCookie,
  getProfilePicture,
  getUserCode
};
