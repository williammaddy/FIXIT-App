import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

interface JwtPayload {
  id: string;
  role: string;
}

export const auth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication failed: No token provided');
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'Authentication failed: User no longer exists');
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Authentication failed: Invalid or expired token');
  }
});
