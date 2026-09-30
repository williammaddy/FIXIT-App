import { api } from './api';
import { ApiResponse, User } from '../types';

export const authApi = {
  register: async (payload: any): Promise<ApiResponse<{ token: string; user: User }>> => {
    const res = await api.post('/auth/register', payload);
    return res.data;
  },

  login: async (payload: any): Promise<ApiResponse<{ token: string; user: User }>> => {
    const res = await api.post('/auth/login', payload);
    return res.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
