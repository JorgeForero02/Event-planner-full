// [FRONTEND-SYNC] F2: Guard de ruta para asistente (actualizado para usar useAuth)
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isAsistente } from '../utils/roleUtils';

const AsistenteRoute = ({ children }) => {
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

  if (!isAsistente(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AsistenteRoute;
