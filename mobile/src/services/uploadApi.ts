import { api } from './api';
import { ApiResponse } from '../types';

export const uploadApi = {
  uploadImage: async (uri: string): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    // @ts-ignore
    formData.append('image', { uri, name: filename, type });

    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
