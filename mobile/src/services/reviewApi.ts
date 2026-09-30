import { api } from './api';
import { ApiResponse, Review } from '../types';

export const reviewApi = {
  create: async (payload: {
    bookingId: string;
    rating: number;
    comment?: string;
  }): Promise<ApiResponse<Review>> => {
    const res = await api.post('/reviews', payload);
    return res.data;
  },
};
