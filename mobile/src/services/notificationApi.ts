import { api } from './api';
import { ApiResponse, Notification } from '../types';

export const notificationApi = {
  getAll: async (): Promise<ApiResponse<Notification[]>> => {
    const res = await api.get('/notifications');
    return res.data;
  },

  markRead: async (id: string): Promise<ApiResponse<Notification>> => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllRead: async (): Promise<ApiResponse<Notification[]>> => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
};
