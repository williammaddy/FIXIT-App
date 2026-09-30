import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/sendSuccess';
import * as workerService from '../services/worker.service';

export const getNearby = asyncHandler(async (req: Request, res: Response) => {
  const service = req.query.service as string;
  const latitude = parseFloat(req.query.latitude as string);
  const longitude = parseFloat(req.query.longitude as string);
  const radius = req.query.radius ? parseFloat(req.query.radius as string) : 10000;
  const sort = req.query.sort as 'nearest' | 'rating' | 'price' | 'experience' | undefined;

  const workers = await workerService.getNearbyWorkers({
    service,
    latitude,
    longitude,
    radius,
    sort,
  });

  return sendSuccess(res, 200, 'Nearby workers retrieved successfully', workers);
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await workerService.getWorkerPublicProfile(req.params.id);
  return sendSuccess(res, 200, 'Worker profile retrieved successfully', profile);
});

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await workerService.getWorkerProfileMe(req.user!._id.toString());
  return sendSuccess(res, 200, 'My worker profile retrieved successfully', profile);
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await workerService.updateWorkerProfileMe(req.user!._id.toString(), req.body);
  return sendSuccess(res, 200, 'Worker profile updated successfully', profile);
});

export const updateAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { isAvailable } = req.body;
  const profile = await workerService.updateWorkerAvailabilityMe(
    req.user!._id.toString(),
    Boolean(isAvailable)
  );
  return sendSuccess(res, 200, 'Worker availability updated successfully', profile);
});

export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await workerService.getWorkerReviews(req.params.id);
  return sendSuccess(res, 200, 'Worker reviews retrieved successfully', reviews);
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await workerService.getWorkerStats(req.user!._id.toString());
  return sendSuccess(res, 200, 'Worker stats retrieved successfully', stats);
});
