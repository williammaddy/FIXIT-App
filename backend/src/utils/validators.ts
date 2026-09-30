import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['customer', 'worker'], {
      required_error: 'Role must be either customer or worker',
    }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const nearbyWorkersSchema = z.object({
  query: z.object({
    service: z.string().min(1, 'Service name is required'),
    latitude: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= -90 && parseFloat(val) <= 90, {
      message: 'Latitude must be a valid number between -90 and 90',
    }),
    longitude: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= -180 && parseFloat(val) <= 180, {
      message: 'Longitude must be a valid number between -180 and 180',
    }),
    radius: z.string().optional(),
    sort: z.enum(['nearest', 'rating', 'price', 'experience']).optional(),
  }),
});

export const updateAvailabilitySchema = z.object({
  body: z.object({
    isAvailable: z.boolean({ required_error: 'isAvailable is required' }),
  }),
});

export const createBookingSchema = z.object({
  body: z.object({
    workerId: z.string().min(1, 'workerId is required'),
    serviceId: z.string().min(1, 'serviceId is required'),
    description: z.string().min(1, 'description is required'),
    image: z.string().optional(),
    latitude: z.number({ required_error: 'latitude is required' }),
    longitude: z.number({ required_error: 'longitude is required' }),
    address: z.string().min(1, 'address is required'),
    scheduledDate: z.string().min(1, 'scheduledDate is required'),
    scheduledTime: z.string().min(1, 'scheduledTime is required'),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'bookingId is required'),
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    comment: z.string().optional(),
  }),
});



