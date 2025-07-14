import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GOOGLE_CLIENT_ID from './js/googleHelper';

// AUTH UIS
import Login from './ui/Auth/Login';

// UIS USUARIO
import UserHome from './ui/User/Home/UserHome';

// Protector de ruta
import ProtectedRouteHome from './utilities/ProtectedRouteHome';
import ProtectedRoute from './utilities/ProtectedRoute';

// ERROR PAGES
import ErrorPage from './ui/Auth/components/ErrorPage404';
import Error401Page from './ui/Auth/components/ErrorPage401';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Router>
          <Routes>
            {/* Ruta por defecto */}
            <Route path="/" element={<ProtectedRouteHome element={<Login />} />} />

            {/* Rutas de Error */}
            <Route path="/*" element={<ErrorPage />} />
            <Route path="/401" element={<Error401Page />} />

            {/* Rutas para Usuario */}
            <Route
              path="/usuario/home"
              element={<ProtectedRoute requiredRole="usuario" element={<UserHome />} />}
            />
          </Routes>

          {/* ToastContainer global */}
          <ToastContainer position="top-right" autoClose={3000} />
        </Router>
    </GoogleOAuthProvider>
  );
}

export default App;