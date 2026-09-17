import React from 'react';
import { JobStatus } from '../types';

export const StatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
  const styles: Record<JobStatus, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-300',
    running: 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    failed: 'bg-rose-100 text-rose-800 border-rose-300',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status.toUpperCase()}
    </span>
  );
};
