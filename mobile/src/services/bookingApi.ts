import { api } from './api';
import { ApiResponse, Booking } from '../types';

export const bookingApi = {
  create: async (payload: {
    workerId: string;
    serviceId: string;
    description: string;
    image?: string;
    latitude: number;
    longitude: number;
    address: string;
    scheduledDate: string;
    scheduledTime: string;
  }): Promise<ApiResponse<Booking>> => {
    const res = await api.post('/bookings', payload);
    return res.data;
  },

  getAll: async (status?: string): Promise<ApiResponse<Booking[]>> => {
    const res = await api.get('/bookings', { params: { status } });
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<Booking>> => {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  updateStatus: async (id: string, action: 'cancel' | 'accept' | 'reject' | 'start' | 'complete'): Promise<ApiResponse<Booking>> => {
    const res = await api.patch(`/bookings/${id}/${action}`);
    return res.data;
  },
};
