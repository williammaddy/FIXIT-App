import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/sendSuccess';
import { ApiError } from '../utils/ApiError';
import { storageService } from '../services/storage.service';

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const fileUrl = await storageService.saveFile(req.file);
  return sendSuccess(res, 200, 'File uploaded successfully', { url: fileUrl });
});
