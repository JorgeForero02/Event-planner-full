import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isOrganizador, getRedirectPath } from '../utils/roleUtils';

const OrganizadorRoute = ({ children }) => {
  const { isAuthenticated, user, initialized } = useAuth();

  if (!initialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Verificando autenticación...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isOrganizador(user)) {
    return <Navigate to={getRedirectPath(user)} replace />;
  }

  return children;
};

export default OrganizadorRoute;
