import React, { useState } from 'react';
import { useJobs } from './hooks/useJobs';
import { MetricsCards } from './components/MetricsCards';
import { StatusFilter } from './components/StatusFilter';
import { JobTable } from './components/JobTable';
import { CreateJobModal } from './components/CreateJobModal';
import { ErrorBanner } from './components/ErrorBanner';
import { Plus, RefreshCw, Cpu } from 'lucide-react';

export const App: React.FC = () => {
  const {
    jobs,
    activeFilter,
    setActiveFilter,
    loading,
    error,
    clearError,
    counts,
    actionInProgress,
    handleCreateJob,
    handleUpdateStatus,
    handleDeleteJob,
    refresh,
  } = useJobs();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="h-6 w-6 text-indigo-600" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Job Queue Dashboard</h1>
            </div>
            <p className="text-xs text-slate-500">Atomic state transitions & concurrency control</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => refresh()} className="p-2 text-slate-500 bg-white border border-slate-200 rounded-lg">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> New Job
            </button>
          </div>
        </header>

        {error && <ErrorBanner message={error} onClose={clearError} />}
        <MetricsCards counts={counts} />

        <div className="flex items-center justify-between mb-4">
          <StatusFilter active={activeFilter} onChange={setActiveFilter} />
          <div className="text-xs text-slate-400">Auto-syncs every 5s</div>
        </div>

        <JobTable
          jobs={jobs}
          loading={loading}
          actionInProgress={actionInProgress}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteJob}
        />

        <CreateJobModal
          isOpen={isModalOpen}
          isSubmitting={actionInProgress === 'create'}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateJob}
        />
      </div>
    </main>
  );
};
export default App;
