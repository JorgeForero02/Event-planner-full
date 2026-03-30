import React, { useState, useEffect } from 'react';
import { useEmpresas } from '../../../../hooks/useEmpresas';
import EmpresaCard from '../sections/EmpresaCard';
import { Search, Building } from 'lucide-react';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';

const AfiliacionesAprobadasSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { empresas, loading, error, fetchEmpresas } = useEmpresas();

  useEffect(() => {
    fetchEmpresas('empresas/aprobadas');
  }, [fetchEmpresas]);

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.nit?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Empresas Aprobadas</h1>
        <p className="text-slate-500">Listado de empresas con afiliación activa</p>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          type="text"
          placeholder="Buscar por nombre o NIT"
          className="pl-9 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border-rose-200 text-rose-800 rounded-lg flex items-center justify-between">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchEmpresas('empresas/aprobadas')} className="bg-white">Reintentar</Button>
        </div>
      )}

      {loading && (
        <div className="h-32 flex items-center justify-center text-slate-500">Cargando empresas...</div>
      )}

      {!loading && filteredEmpresas.length === 0 && (
        <div className="h-48 bg-white border border-dashed rounded-lg flex flex-col items-center justify-center text-slate-500 space-y-3">
          <Building className="w-8 h-8 text-slate-400" />
          <p>{searchTerm ? 'No se encontraron empresas con ese criterio' : 'No hay empresas aprobadas'}</p>
        </div>
      )}

      {!loading && filteredEmpresas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmpresas.map((empresa) => (
            <EmpresaCard
              key={empresa.id}
              empresa={empresa}
              status="aprobada"
              showActions={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AfiliacionesAprobadasSection;
