import { Job, JobStatus, CreateJobInput } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
  } catch {
    throw new ApiError(0, 'Network error. Please check backend connection.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMsg = (data && data.message) || (Array.isArray(data?.message) ? data.message.join(', ') : 'Error');
    throw new ApiError(response.status, errorMsg);
  }
  return data as T;
}

export const api = {
  getJobs: (status?: JobStatus | 'all'): Promise<Job[]> => {
    const query = status && status !== 'all' ? `?status=${status}` : '';
    return request<Job[]>(`/jobs${query}`);
  },
  createJob: (input: CreateJobInput): Promise<Job> =>
    request<Job>('/jobs', { method: 'POST', body: JSON.stringify(input) }),
  updateJobStatus: (id: string, status: JobStatus): Promise<Job> =>
    request<Job>(`/jobs/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteJob: (id: string): Promise<{ success: boolean; message: string }> =>
    request(`/jobs/${id}`, { method: 'DELETE' }),
};
