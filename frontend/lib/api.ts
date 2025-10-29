/**
 * API client for communicating with the backend
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Run {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  steps: any[];
  metadata: any;
}

export interface Fork {
  id: string;
  parentServiceId: string;
  name: string;
  createdAt: string;
  connectionString?: string;
}

export interface Question {
  question: string;
  answer: string;
  sources: any[];
  method: string;
}

// Runs API
export const runsAPI = {
  list: () => api.get<{ success: boolean; data: Run[] }>('/runs'),
  get: (id: string) => api.get<{ success: boolean; data: Run }>(`/runs/${id}`),
  create: (data: { question?: string; serviceId?: string }) =>
    api.post<{ success: boolean; data: Run }>('/runs', data),
  delete: (id: string) => api.delete(`/runs/${id}`),
};

// Forks API
export const forksAPI = {
  listServices: () => api.get<{ success: boolean; data: any[] }>('/forks/services'),
  create: (data: { serviceId: string; name: string }) =>
    api.post<{ success: boolean; data: Fork }>('/forks', data),
  delete: (id: string) => api.delete(`/forks/${id}`),
  merge: (forkId: string, parentServiceId: string) =>
    api.post(`/forks/${forkId}/merge`, { parentServiceId }),
};

// Questions API
export const questionsAPI = {
  ask: (data: { question: string; method?: 'bm25' | 'vector' | 'hybrid' }) =>
    api.post<{ success: boolean; data: Question }>('/questions', data),
  index: (data: { title: string; content: string; metadata?: any }) =>
    api.post('/questions/index', data),
};

export default api;
