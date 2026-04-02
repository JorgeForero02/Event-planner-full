import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { gerenteService } from '../../../services/gerenteService';
import { useNotifications } from './useNotifications';

export const useEquipo = () => {
  const { user } = useAuth();
  const { showNotification, closeNotification, notifications } = useNotifications();

  const [equipo, setEquipo] = useState([]);
  const [filteredEquipo, setFilteredEquipo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const empresaId = user?.rolData?.empresa?.id || user?.rolData?.id_empresa;

  const cargarEquipo = useCallback(async () => {
    if (!empresaId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await gerenteService.getTeam(empresaId);
      const lista = Array.isArray(data) ? data : (data?.data || []);
      setEquipo(lista);
      setFilteredEquipo(lista);
    } catch (error) {
      showNotification('error', 'Error', 'No se pudo cargar el equipo de organizadores');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId]);

  useEffect(() => {
    cargarEquipo();
  }, [cargarEquipo]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEquipo(equipo);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredEquipo(
        equipo.filter(m =>
          (m.nombre || m.name || '').toLowerCase().includes(term) ||
          (m.correo || m.email || '').toLowerCase().includes(term) ||
          (m.cedula || '').toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, equipo]);

  const handleSearchChange = (value) => setSearchTerm(value);
  const handleSidebarToggle = (collapsed) => setSidebarCollapsed(collapsed);

  return {
    equipo,
    filteredEquipo,
    loading,
    searchTerm,
    sidebarCollapsed,
    notifications,
    empresaId,
    handleSearchChange,
    handleSidebarToggle,
    closeNotification,
    refetch: cargarEquipo,
  };
};
