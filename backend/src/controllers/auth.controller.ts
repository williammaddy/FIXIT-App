import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/sendSuccess';
import * as authService from '../services/auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  return sendSuccess(res, 201, 'User registered successfully', result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  return sendSuccess(res, 200, 'Login successful', result);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getCurrentUser(req.user!);
  return sendSuccess(res, 200, 'Current user profile', result);
});
