import React from 'react';
import { JobStatus } from '../types';

export const StatusFilter: React.FC<{ active: JobStatus | 'all'; onChange: (f: JobStatus | 'all') => void }> = ({ active, onChange }) => {
  const filters: { label: string; value: JobStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Running', value: 'running' },
    { label: 'Completed', value: 'completed' },
    { label: 'Failed', value: 'failed' },
  ];
  return (
    <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 gap-1">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
            active === f.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};
