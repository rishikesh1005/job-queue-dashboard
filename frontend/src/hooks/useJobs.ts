import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Job, JobStatus, StatusCounts, CreateJobInput } from '../types';
import { api, ApiError } from '../services/api';

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeFilter, setActiveFilter] = useState<JobStatus | 'all'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const filterRef = useRef(activeFilter);
  useEffect(() => { filterRef.current = activeFilter; }, [activeFilter]);

  const fetchJobs = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const data = await api.getJobs(filterRef.current);
      setJobs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to fetch jobs.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(false); }, [activeFilter, fetchJobs]);

  useEffect(() => {
    const interval = setInterval(() => fetchJobs(true), 5000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const counts: StatusCounts = useMemo(() => {
    return jobs.reduce(
      (acc, job) => {
        acc.all += 1;
        if (job.status === 'pending') acc.pending += 1;
        if (job.status === 'running') acc.running += 1;
        if (job.status === 'completed') acc.completed += 1;
        if (job.status === 'failed') acc.failed += 1;
        return acc;
      },
      { all: 0, pending: 0, running: 0, completed: 0, failed: 0 },
    );
  }, [jobs]);

  const handleCreateJob = async (input: CreateJobInput) => {
    setActionInProgress('create');
    try {
      await api.createJob(input);
      await fetchJobs(true);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create job.');
      return false;
    } finally {
      setActionInProgress(null);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: JobStatus) => {
    setActionInProgress(id);
    try {
      await api.updateJobStatus(id, newStatus);
      await fetchJobs(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Conflict: This job was already modified in another tab/request. Resyncing...');
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to update job.');
      }
      await fetchJobs(true);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteJob = async (id: string) => {
    setActionInProgress(id);
    try {
      await api.deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete job.');
      await fetchJobs(true);
    } finally {
      setActionInProgress(null);
    }
  };

  return {
    jobs,
    activeFilter,
    setActiveFilter,
    loading,
    error,
    clearError: () => setError(null),
    counts,
    actionInProgress,
    handleCreateJob,
    handleUpdateStatus,
    handleDeleteJob,
    refresh: () => fetchJobs(false),
  };
}
