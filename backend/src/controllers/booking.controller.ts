import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/sendSuccess';
import * as bookingService from '../services/booking.service';

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.createBooking(req.user!, req.body);
  return sendSuccess(res, 201, 'Booking created successfully', booking);
});

export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  const statusFilter = req.query.status as string | undefined;
  const bookings = await bookingService.getBookings(req.user!, statusFilter);
  return sendSuccess(res, 200, 'Bookings retrieved successfully', bookings);
});

export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.getBookingById(req.user!, req.params.id);
  return sendSuccess(res, 200, 'Booking details retrieved successfully', booking);
});

export const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  const action = req.params.action as 'cancel' | 'accept' | 'reject' | 'start' | 'complete';
  const booking = await bookingService.updateBookingStatus(req.user!, req.params.id, action);
  return sendSuccess(res, 200, `Booking status updated to ${booking.status}`, booking);
});
