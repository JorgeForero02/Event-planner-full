import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[240px] gap-4 p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center">
        <AlertTriangle size={28} className="text-rose-600" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">Ocurrió un error</h3>
        <p className="text-sm text-slate-500 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <RefreshCw size={14} />
          Reintentar
        </button>
      )}
    </div>
  );
};

export default ErrorState;