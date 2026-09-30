import { Notification } from '../models/Notification';
import { IUser } from '../models/User';
import { ApiError } from '../utils/ApiError';

export const getUserNotifications = async (user: IUser) => {
  return Notification.find({ user: user._id }).sort({ createdAt: -1 });
};

export const markAsRead = async (user: IUser, notificationId: string) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  return notification;
};

export const markAllAsRead = async (user: IUser) => {
  await Notification.updateMany({ user: user._id, isRead: false }, { isRead: true });
  return getUserNotifications(user);
};
