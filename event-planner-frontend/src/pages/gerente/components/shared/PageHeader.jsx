import React from 'react';
import { Plus } from 'lucide-react';

const PageHeader = ({ title, subtitle, actionButton }) => {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      {actionButton && (
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 shrink-0"
          onClick={actionButton.onClick}
          disabled={actionButton.disabled}
          type="button"
        >
          {actionButton.icon
            ? <span className="shrink-0">{actionButton.icon}</span>
            : <Plus size={16} className="shrink-0" />}
          {actionButton.label}
        </button>
      )}
    </div>
  );
};

export default PageHeader;