import { api } from './api';
import { ApiResponse, Service } from '../types';

export const serviceApi = {
  getServices: async (): Promise<ApiResponse<Service[]>> => {
    const res = await api.get('/services');
    return res.data;
  },
};
