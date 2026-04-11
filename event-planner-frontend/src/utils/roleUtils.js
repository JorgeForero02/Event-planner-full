
/**
 * Obtiene el rol normalizado del usuario
 * @param {Object} user - Objeto usuario del localStorage
 * @returns {string} - Rol del usuario en minúsculas
 */
const getRol = (user) => {
  if (!user) return '';
  const rol = user.rol || user.role || '';
  return typeof rol === 'string' ? rol.toLowerCase() : '';
};

/**
 * Verifica si un usuario es administrador
 */
export const isAdmin = (user) => {
  const rol = getRol(user);
  return rol === 'administrador' || rol === 'admin';
};

/**
 * Verifica si un usuario es asistente
 */
export const isAsistente = (user) => {
  return getRol(user) === 'asistente';
};

/**
 * Verifica si un usuario es gerente
 */
export const isGerente = (user) => {
  return getRol(user) === 'gerente';
};

/**
 * Verifica si un usuario es organizador
 */
export const isOrganizador = (user) => {
  return getRol(user) === 'organizador';
};

/**
 * Verifica si un usuario es ponente
 */
export const isPonente = (user) => {
  return getRol(user) === 'ponente';
};

/**
 * Obtiene la ruta de redirección según el rol del usuario
 * @param {Object} user - Objeto usuario del localStorage
 * @returns {string} - Ruta de redirección
 */
export const getRedirectPath = (user) => {
  if (isAdmin(user)) return '/admin';
  if (isOrganizador(user)) return '/organizador';
  if (isGerente(user)) return '/gerente';
  if (isAsistente(user)) return '/asistente';
  if (isPonente(user)) return '/ponente';
  return '/dashboard';
};

/**
 * Obtiene el nombre del rol formateado
 * @param {Object} user - Objeto usuario del localStorage
 * @returns {string} - Nombre del rol
 */
export const getRoleName = (user) => {
  if (!user) return 'Sin rol';

  const rolMap = {
    administrador: 'Administrador',
    admin: 'Administrador',
    gerente: 'Gerente',
    organizador: 'Organizador',
    asistente: 'Asistente',
    ponente: 'Ponente'
  };

  const rol = getRol(user);
  return rolMap[rol] || rol.charAt(0).toUpperCase() + rol.slice(1);
};