import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRedirectPath } from '../utils/roleUtils';
import { useAuth } from '../contexts/AuthContext';

export const useLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setError('');
    setLoading(true);

    try {
      const selectedRole = localStorage.getItem('selected_role');

      const result = await login(email, password, selectedRole);

      if (!result.success) {
        throw new Error(result.error || 'Error durante el inicio de sesión');
      }

      const redirectPath = result.redirectPath || getRedirectPath(localStorage.getItem('selected_role'));
      navigate(redirectPath);

    } catch (err) {

      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else if (err.message.includes('ETIMEDOUT') || err.message.includes('timeout')) {
        setError('El servidor no responde. Por favor, intenta más tarde.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleNavigateToForgotPassword = () => {
    navigate('/forgotpassword');
  };

  const handleNavigateToRegister = () => {
    window.location.href = '/register';
  };

  return {
    email,
    password,
    showPassword,
    error,
    loading,

    setEmail,
    setPassword,

    handleLogin,
    togglePasswordVisibility,
    handleNavigateToForgotPassword,
    handleNavigateToRegister
  };
};