// components/DashboardOrganizador.js
import { useState, useEffect } from 'react';
import { obtenerPerfil, obtenerEventos } from './eventosService';

export const useOrganizerDashboard = () => {
    const [activeSection, setActiveSection] = useState('inicio');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);


    const formatDate = (fecha) =>
        new Date(fecha).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

    const filterEventosDelMes = (eventos) => {
        const now = new Date();
        return eventos.filter(ev => {
            if (!ev.fecha_inicio) return false;
            const fecha = new Date(ev.fecha_inicio);
            return (
                fecha.getUTCMonth() === now.getMonth() &&
                fecha.getUTCFullYear() === now.getFullYear()
            );
        });
    };

    const getRecentEvents = (eventos) =>
        eventos
            .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))
            .slice(0, 5)
            .map(ev => ({
                name: ev.nombre || ev.titulo,
                date: formatDate(ev.fecha_inicio),
                status: ev.estado === 1 ? 'Publicado' : 'Borrador'
            }));

    const loadUserFromStorage = () => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) setUser(userData);
    };

    const fetchEventos = async () => {
        try {
            const perfil = await obtenerPerfil();
            const idCreador = perfil?.data?.usuario?.id;
            if (!idCreador) return;

            const data = await obtenerEventos();
            const eventos = Array.isArray(data?.data) ? data.data : [];

            const eventosDelCreador = eventos.filter(
                ev => String(ev.id_creador) === String(idCreador)
            );

            const eventosPublicados = eventosDelCreador.filter(ev => ev.estado === 1);
            const eventosMes = filterEventosDelMes(eventosDelCreador);

            setStats([
                { label: 'Eventos Activos', value: eventosPublicados.length, color: 'bg-blue' },
                { label: 'Eventos del Mes', value: eventosMes.length, color: 'bg-purple' }
            ]);

            setRecentEvents(getRecentEvents(eventosPublicados));
        } catch { }
    };

    useEffect(() => {
        loadUserFromStorage();
        fetchEventos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        activeSection,
        isSidebarOpen,
        user,
        stats,
        recentEvents,
        handleMenuClick: setActiveSection,
        toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
        fetchEventos
    };
};
