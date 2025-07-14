// components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from './services/Services';
import jwtUtils from '../../utilities/jwtUtils';
import FetchWithGif from '../Reutilizables/FetchWithGif';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async (response) => {
    setIsLoading(true); // Mostrar pantalla de carga
    try {
      const { credential } = response;
      const result = await loginWithGoogle(credential);

      const access_token = result.access_token;
      const refresh_token = result.refresh_token;
      const idRefreshToken = result.idRefreshToken;

      // Set cookies with 7-day expiration
      const expiration = `; expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()}; path=/; Secure; SameSite=Strict`;
      document.cookie = `access_token=${access_token}${expiration}`;
      document.cookie = `refresh_token=${refresh_token}${expiration}`;
      document.cookie = `refresh_token_id=${idRefreshToken}${expiration}`;

      const rol = jwtUtils.getUserRole(access_token);

      // Redirigir según el rol
      navigate(rol === 'admin' ? '/admin/home' : '/usuario/home');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false); // Quitar pantalla de carga
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900">
      {isLoading && <FetchWithGif />}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white/20 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white text-center mb-6">PLAY .IT</h1>
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              setError('Error en la autenticación con Google');
              setIsLoading(false);
            }}
            theme="filled_blue"
            text="signin_with"
            shape="pill"
            logo_alignment="center"
            width="300"
          >
            Iniciar Sesión con Google Safe Me
          </GoogleLogin>
        </div>
      </div>
    </div>
  );
};

export default Login;