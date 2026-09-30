import { Review } from '../models/Review';
import { Booking } from '../models/Booking';
import { WorkerProfile } from '../models/WorkerProfile';
import { IUser } from '../models/User';
import { ApiError } from '../utils/ApiError';

export interface CreateReviewDTO {
  bookingId: string;
  rating: number;
  comment?: string;
}

export const createReview = async (customer: IUser, data: CreateReviewDTO) => {
  if (customer.role !== 'customer') {
    throw new ApiError(403, 'Only customers can leave reviews');
  }

  const booking = await Booking.findById(data.bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.customer.toString() !== customer._id.toString()) {
    throw new ApiError(403, 'You can only review your own bookings');
  }

  if (booking.status !== 'COMPLETED') {
    throw new ApiError(400, 'Can only review completed bookings');
  }

  const existingReview = await Review.findOne({ booking: booking._id });
  if (existingReview) {
    throw new ApiError(409, 'Review already exists for this booking');
  }

  const review = await Review.create({
    booking: booking._id,
    customer: customer._id,
    worker: booking.worker,
    rating: data.rating,
    comment: data.comment || '',
  });

  // Recalculate worker rating & reviewCount
  const allReviews = await Review.find({ worker: booking.worker });
  const reviewCount = allReviews.length;
  const sumRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
  const avgRating = Math.round((sumRating / reviewCount) * 10) / 10;

  await WorkerProfile.findOneAndUpdate(
    { user: booking.worker },
    { rating: avgRating, reviewCount }
  );

  return review;
};
