const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const getToken = () => {
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
};

const getHeaders = (customHeaders = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
      window.location.href = '/login';
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }

    try {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.detail || `Error ${response.status}`);
    } catch (e) {
      if (e.message.includes('Sesión expirada')) {
        throw e;
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const config = {
    ...options,
    headers: getHeaders(options.headers),
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    throw error;
  }
};

export const usuariosService = {
  getAll: async () => {
    return await apiRequest('/gestion-usuarios', {
      method: 'GET',
    });
  },

  getById: async (id) => {
    return await apiRequest(`/gestion-usuarios/${id}`, {
      method: 'GET',
    });
  },

  create: async (data) => {
    return await apiRequest('/gestion-usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return await apiRequest(`/gestion-usuarios/${id}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id, data) => {
    return await apiRequest(`/gestion-usuarios/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (id, data) => {
    return await apiRequest(`/gestion-usuarios/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export const authService = {
  login: async (credentials) => {
    return await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  loginFormData: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    return await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    }).then(handleResponse);
  },

  logout: async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  verifyToken: async () => {
    return await apiRequest('/auth/profile', {
      method: 'GET',
    });
  },

  refreshToken: async () => {
    return await apiRequest('/auth/refresh', {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    return await apiRequest('/auth/profile', {
      method: 'GET',
    });
  },
};

export const eventosService = {
  getAll: async () => {
    return await apiRequest('/eventos', {
      method: 'GET',
    });
  },

  getById: async (id) => {
    return await apiRequest(`/eventos/${id}`, {
      method: 'GET',
    });
  },

  create: async (data) => {
    return await apiRequest('/eventos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return await apiRequest(`/eventos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return await apiRequest(`/eventos/${id}`, {
      method: 'DELETE',
    });
  },
};

export const ponentesService = {
  getAll: async () => {
    return await apiRequest('/ponente-actividad/ponentes', { method: 'GET' });
  },

  getByPonente: async (ponenteId) => {
    return await apiRequest(`/ponente-actividad/ponente/${ponenteId}`, { method: 'GET' });
  },

  getByActividad: async (actividadId) => {
    return await apiRequest(`/ponente-actividad/actividad/${actividadId}`, { method: 'GET' });
  },

  asignar: async (data) => {
    return await apiRequest('/ponente-actividad', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const apiUtils = {
  getToken,
  getHeaders,
  API_URL,
};

export default {
  usuarios: usuariosService,
  auth: authService,
  eventos: eventosService,
  ponentes: ponentesService,
  utils: apiUtils,
};