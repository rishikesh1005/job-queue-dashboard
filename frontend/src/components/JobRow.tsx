import React from 'react';
import { Job, JobStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { Play, Check, X, Trash2 } from 'lucide-react';

export const JobRow: React.FC<{
  job: Job;
  isActionLoading: boolean;
  onUpdateStatus: (id: string, status: JobStatus) => void;
  onDelete: (id: string) => void;
}> = ({ job, isActionLoading, onUpdateStatus, onDelete }) => (
  <tr className="hover:bg-slate-50 transition border-b border-slate-100 text-sm">
    <td className="px-4 py-3 font-mono text-xs text-slate-500">{job.id.substring(0, 8)}...</td>
    <td className="px-4 py-3 font-medium text-slate-800">{job.title}</td>
    <td className="px-4 py-3 text-slate-600">
      <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-xs">{job.type}</span>
    </td>
    <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(job.createdAt).toLocaleTimeString()}</td>
    <td className="px-4 py-3 text-right">
      <div className="flex items-center justify-end gap-1.5">
        {job.status === 'pending' && (
          <button
            onClick={() => onUpdateStatus(job.id, 'running')}
            disabled={isActionLoading}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 border border-blue-200"
          >
            <Play className="h-3 w-3 fill-current" /> Run
          </button>
        )}
        {job.status === 'running' && (
          <>
            <button
              onClick={() => onUpdateStatus(job.id, 'completed')}
              disabled={isActionLoading}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 border border-emerald-200"
            >
              <Check className="h-3 w-3" /> Complete
            </button>
            <button
              onClick={() => onUpdateStatus(job.id, 'failed')}
              disabled={isActionLoading}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50 border border-rose-200"
            >
              <X className="h-3 w-3" /> Fail
            </button>
          </>
        )}
        <button onClick={() => onDelete(job.id)} disabled={isActionLoading} className="p-1 text-slate-400 hover:text-rose-600 ml-1">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </td>
  </tr>
);
