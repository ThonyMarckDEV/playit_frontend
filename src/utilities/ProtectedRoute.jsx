import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtUtils from '../utilities/jwtUtils'; // Utility for decoding JWT tokens

const ProtectedRoute = ({ element, requiredRole }) => {
  // Get the JWT refresh token from cookies
  const refresh_token = jwtUtils.getRefreshTokenFromCookie();

  // If no token exists, redirect to unauthorized page
  if (!refresh_token) {
    return <Navigate to="/401" />;
  }

  // Get the user role from the refresh token
  const rol = jwtUtils.getUserRoleRefreshToken(refresh_token);

  // If the user role doesn't match the required role, redirect to unauthorized page
  if (rol !== requiredRole) {
    return <Navigate to="/401" />;
  }

  // If token exists and role matches, render the original element
  return element;
};

export default ProtectedRoute;