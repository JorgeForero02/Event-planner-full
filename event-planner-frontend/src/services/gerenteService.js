import { BaseService } from '../services/api/baseService';
import { organizersAPI } from '../services/api/organizersAPI';
import { locationsAPI } from '../services/api/locationsAPI';
import { placesAPI } from '../services/api/placesAPI';
import { eventsAPI } from '../services/api/eventsAPI';

class GerenteService extends BaseService {
  constructor() {
    super();
    this.getTeam = this.getTeam.bind(this);
    this.getDashboardStats = this.getDashboardStats.bind(this);
  }

  getTeam = async (empresaId) => {
    try {
      const response = await this.fetch(`/empresas/${empresaId}/equipo`);
      return (response.success && response.data) ? response.data : [];
    } catch {
      return [];
    }
  }

  getDashboardStats = async (empresaId) => {
    try {
      const [team, events] = await Promise.all([
        this.getTeam(empresaId),
        eventsAPI.getEventsByEmpresa(empresaId)
      ]);

      return {
        totalEmpleados: team.length,
        totalEventos: events.length
      };
    } catch (error) {
      return {
        totalEmpleados: 0,
        totalEventos: 0
      };
    }
  }
}

export { organizersAPI, locationsAPI, placesAPI, eventsAPI };
export const gerenteService = new GerenteService();