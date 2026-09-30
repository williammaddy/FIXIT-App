import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/sendSuccess';
import * as serviceService from '../services/service.service';

export const getServices = asyncHandler(async (req: Request, res: Response) => {
  const services = await serviceService.getActiveServices();
  return sendSuccess(res, 200, 'Services retrieved successfully', services);
});
