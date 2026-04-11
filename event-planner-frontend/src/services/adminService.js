import { BaseService } from '../services/api/baseService';
import { authService } from './api/authService';

export class AdminService extends BaseService {
  async getDashboardData() {
    const [afiliaciones, auditoria] = await Promise.all([
      this.getAfiliaciones(),
      this.getAuditoria()
    ]);

    return {
      afiliaciones: this.processAfiliacionesData(afiliaciones),
      auditoria: this.processAuditoriaData(auditoria)
    };
  }

  async getAfiliaciones() {
    return this.request('/empresas?incluir_pendientes=true');
  }

  async getAuditoria() {
    return this.request('/auditoria');
  }

  async getUsuarios() {
    return this.request('/gestion-usuarios');
  }

  async promoverAGerente(idUsuario, idEmpresa) {
    return authService.promoverGerente(idUsuario, idEmpresa);
  }

  async aprobarEmpresaYPromover(id, data) {
    const aprobarResp = await this.request(`/empresas/${id}/aprobar`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });

    const payload = aprobarResp?.data || {};
    const requesterId = payload?.creador?.id || payload?.creador_id || payload?.id_creador || payload?.usuario?.id || payload?.usuario_id || null;

    let promoteResult = null;
    if (requesterId) {
      promoteResult = await authService.promoverGerente(String(requesterId), String(id));
    } else {
    }

    return { aprobar: aprobarResp, promote: promoteResult };
  }

  async getRoles() {
    return this.request('/admin/roles');
  }

  async toggleRolEstado(tipoRol) {
    return this.request(`/admin/roles/${tipoRol}/toggle-estado`, { method: 'PATCH' });
  }

  async exportUsuariosCSV() {
    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/gestion-usuarios/export/csv`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al exportar usuarios');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async exportEventosCSV() {
    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/eventos/export/csv`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al exportar eventos');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eventos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  processAfiliacionesData(data) {
    if (!data?.data) return { pendientes: 0, aprobadas: 0, rechazadas: 0 };

    let empresasData = Array.isArray(data.data) ? data.data : [data.data];

    const pendientes = empresasData.filter(e =>
      e.estado === 0 || e.estado === '0' || e.estado === 'pendiente'
    ).length;

    const aprobadas = empresasData.filter(e =>
      e.estado === 1 || e.estado === '1' || e.estado === 'aprobado'
    ).length;

    const rechazadas = empresasData.filter(e =>
      e.estado === 2 || e.estado === '2' || e.estado === 'rechazado'
    ).length;

    return { pendientes, aprobadas, rechazadas };
  }

  processAuditoriaData(data) {
    if (!data?.data) return [];

    let auditoriaData = Array.isArray(data.data) ? data.data : [data.data];
    return auditoriaData.sort((a, b) => b.id - a.id);
  }
}

export const adminService = new AdminService();