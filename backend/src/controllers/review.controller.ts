import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/sendSuccess';
import * as reviewService from '../services/review.service';

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.createReview(req.user!, req.body);
  return sendSuccess(res, 201, 'Review submitted successfully', review);
});
