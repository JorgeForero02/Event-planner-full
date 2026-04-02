// [FRONTEND-SYNC] F2: Guard de ruta para gerente
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isGerente } from '../utils/roleUtils';

const GerenteRoute = ({ children }) => {
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

  if (!isGerente(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!user?.rolData?.id_empresa) {
    return <Navigate to="/dashboard" replace state={{ error: 'Tu cuenta de gerente aún no tiene una empresa afiliada. Contacta al administrador.' }} />;
  }

  return children;
};

export default GerenteRoute;
