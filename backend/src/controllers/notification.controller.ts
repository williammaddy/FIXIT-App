import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/sendSuccess';
import * as notificationService from '../services/notification.service';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await notificationService.getUserNotifications(req.user!);
  return sendSuccess(res, 200, 'Notifications retrieved successfully', notifications);
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await notificationService.markAsRead(req.user!, req.params.id);
  return sendSuccess(res, 200, 'Notification marked as read', notification);
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await notificationService.markAllAsRead(req.user!);
  return sendSuccess(res, 200, 'All notifications marked as read', notifications);
});
