// [FRONTEND-SYNC] F2: Guard de ruta para ponente
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isPonente } from '../utils/roleUtils';

const PonenteRoute = ({ children }) => {
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

  if (!isPonente(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PonenteRoute;
