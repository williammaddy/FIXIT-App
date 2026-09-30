import { api } from './api';
import { ApiResponse, Worker, Review } from '../types';

export const workerApi = {
  getNearby: async (params: {
    service: string;
    latitude: number;
    longitude: number;
    radius?: number;
    sort?: string;
  }): Promise<ApiResponse<Worker[]>> => {
    const res = await api.get('/workers/nearby', { params });
    return res.data;
  },

  getProfile: async (id: string): Promise<ApiResponse<Worker>> => {
    const res = await api.get(`/workers/${id}`);
    return res.data;
  },

  getMyProfile: async (): Promise<ApiResponse<Worker>> => {
    const res = await api.get('/workers/me/profile');
    return res.data;
  },

  updateMyProfile: async (payload: any): Promise<ApiResponse<Worker>> => {
    const res = await api.put('/workers/me/profile', payload);
    return res.data;
  },

  updateAvailability: async (isAvailable: boolean): Promise<ApiResponse<Worker>> => {
    const res = await api.patch('/workers/me/availability', { isAvailable });
    return res.data;
  },

  getReviews: async (id: string): Promise<ApiResponse<Review[]>> => {
    const res = await api.get(`/workers/${id}/reviews`);
    return res.data;
  },

  getStats: async (): Promise<ApiResponse<{
    pendingRequests: number;
    todaysJobs: number;
    completedJobs: number;
    rating: number;
  }>> => {
    const res = await api.get('/workers/me/stats');
    return res.data;
  },
};
