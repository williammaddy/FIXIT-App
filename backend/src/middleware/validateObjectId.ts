import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError';

export const validateObjectId = (paramName = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, `Invalid ID format for parameter: ${paramName}`));
    }
    next();
  };
};
