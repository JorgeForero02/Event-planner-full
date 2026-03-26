import React, { useState, useEffect } from 'react';
import styles from './roles.module.css';


const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const rolesDelSistema = [
    {
      id: 1,
      nombre: 'Administrador',
      tipo: 'administrador',
      descripcion: 'Control total del sistema',
      activo: true
    },
    {
      id: 2,
      nombre: 'Gerente',
      tipo: 'gerente',
      descripcion: 'Control en la organización',
      activo: true
    },
    {
      id: 3,
      nombre: 'Organizador',
      tipo: 'organizador',
      descripcion: 'Gestión de eventos empresariales',
      activo: true
    },
    {
      id: 4,
      nombre: 'Ponente',
      tipo: 'ponente',
      descripcion: 'Experto quien dirige la charla',
      activo: true
    },
    {
      id: 5,
      nombre: 'Asistente',
      tipo: 'asistente',
      descripcion: 'Participante de eventos',
      activo: true
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setRoles(rolesDelSistema);
      setLoading(false);
    }, 500);
  }, []);

  const handleToggleStatus = (rolId) => {
    setRoles(prevRoles =>
      prevRoles.map(rol =>
        rol.id === rolId ? { ...rol, activo: !rol.activo } : rol
      )
    );

    console.log(`Toggle status for role ${rolId}`);
  };

  const filteredRoles = roles.filter(rol =>
    rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titule}>Gestión de Roles</div>
        <div className={styles.subtitule}>Listado de Roles</div>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchBox}>
        <img src={require('../../assets/search.png')} alt="Busqueda" />
          <input
            type="text"
            placeholder="Buscar por descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Rol</th>
              <th>Estado</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.map(rol => (
              <tr key={rol.id}>
                <td className={styles.rolName}>{rol.nombre}</td>
                <td>
                  <span className={`${styles.badge} ${rol.activo ? styles.badgeActive : styles.badgeInactive}`}>
                    {rol.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className={styles.description}>{rol.descripcion}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleToggleStatus(rol.id)}
                      title={rol.activo ? 'Desactivar rol' : 'Activar rol'}
                    >
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRoles.length === 0 && (
          <div className={styles.noResults}>
            No se encontraron roles que coincidan con la búsqueda
          </div>
        )}
      </div>

      <div className={styles.infoNote}>
        <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>Los roles del sistema no pueden ser eliminados, solo activados o desactivados.</span>
      </div>
    </div>
  );
};

export default Roles;