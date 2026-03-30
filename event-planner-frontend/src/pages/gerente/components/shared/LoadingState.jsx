import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = 'Cargando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[240px] gap-3 text-slate-500">
      <Loader2 size={36} className="animate-spin text-brand-500" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default LoadingState;