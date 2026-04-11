
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene el token de autenticación del localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * Headers comunes para las peticiones
 */
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Crea un nuevo organizador
 * @param {Object} organizadorData - Datos del organizador
 * @param {string} organizadorData.nombre - Nombre completo
 * @param {string} organizadorData.cedula - Número de cédula
 * @param {string} organizadorData.telefono - Teléfono (opcional)
 * @param {string} organizadorData.correo - Correo electrónico
 * @param {string} organizadorData.contraseña - Contraseña temporal
 * @param {number} organizadorData.id_empresa - ID de la empresa
 * @returns {Promise<Object>} Respuesta con los datos del organizador creado
 */

export const crearOrganizador = async (organizadorData) => {
  try {
    const response = await fetch(`${API_URL}/auth/crear-organizador`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(organizadorData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al crear organizador');
    }

    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene el equipo de una empresa
 * @param {number} idEmpresa - ID de la empresa
 * @returns {Promise<Array>} Lista de miembros del equipo
 */
export const obtenerEquipo = async (idEmpresa) => {
  try {
    const response = await fetch(`${API_URL}/empresas/${idEmpresa}/equipo`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      throw new Error('Sesión expirada');
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener el equipo');

    return { success: true, data: data.data || [] };
  } catch (error) {
    throw error;
  }
};

/**
 * Valida los datos del organizador antes de enviar
 * @param {Object} data - Datos a validar
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validarDatosOrganizador = (data) => {
  const errors = {};

  if (!data.nombre || data.nombre.trim().length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres';
  }

  if (!data.cedula || data.cedula.trim().length < 6) {
    errors.cedula = 'La cédula debe tener al menos 6 caracteres';
  }

  if (!data.correo || !data.correo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.correo = 'El correo electrónico no es válido';
  }

  if (!data.contraseña || data.contraseña.length < 6) {
    errors.contraseña = 'La contraseña debe tener al menos 6 caracteres';
  }

  if (!data.id_empresa) {
    errors.id_empresa = 'ID de empresa es requerido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Actualiza un organizador (puedes expandir esto según necesites)
 * @param {number} id - ID del organizador
 * @param {Object} datosActualizados - Datos a actualizar
 * @returns {Promise<Object>}
 */
export const actualizarOrganizador = async (id, datosActualizados) => {
  try {
    const response = await fetch(`${API_URL}/gestion-usuarios/${id}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(datosActualizados)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar organizador');
    }

    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Elimina un organizador
 * @param {number} id - ID del organizador
 * @returns {Promise<Object>}
 */
export const eliminarOrganizador = async (id) => {
  try {
    const response = await fetch(`${API_URL}/gestion-usuarios/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ activo: 0 })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al eliminar organizador');
    }

    return {
      success: true,
      message: data.message
    };
  } catch (error) {
    throw error;
  }
};

export default {
  crearOrganizador,
  obtenerEquipo,
  validarDatosOrganizador,
  actualizarOrganizador,
  eliminarOrganizador
};
