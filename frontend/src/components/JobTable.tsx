import React from 'react';
import { Job, JobStatus } from '../types';
import { JobRow } from './JobRow';

export const JobTable: React.FC<{
  jobs: Job[];
  loading: boolean;
  actionInProgress: string | null;
  onUpdateStatus: (id: string, status: JobStatus) => void;
  onDelete: (id: string) => void;
}> = ({ jobs, loading, actionInProgress, onUpdateStatus, onDelete }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading && jobs.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-10 text-slate-400 text-sm">Loading jobs...</td></tr>
          ) : jobs.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-10 text-slate-400 text-sm">No jobs found.</td></tr>
          ) : (
            jobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                isActionLoading={actionInProgress === job.id}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);
