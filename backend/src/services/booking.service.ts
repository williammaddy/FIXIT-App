import mongoose from 'mongoose';
import { Booking, BookingStatus } from '../models/Booking';
import { WorkerProfile } from '../models/WorkerProfile';
import { Service } from '../models/Service';
import { User, IUser } from '../models/User';
import { Notification } from '../models/Notification';
import { ApiError } from '../utils/ApiError';

export interface CreateBookingDTO {
  workerId: string;
  serviceId: string;
  description: string;
  image?: string;
  latitude: number;
  longitude: number;
  address: string;
  scheduledDate: string;
  scheduledTime: string;
}

const generateUniqueBookingCode = async (): Promise<string> => {
  let attempts = 0;
  while (attempts < 10) {
    const code = 'F' + Math.floor(10000 + Math.random() * 90000).toString();
    const existing = await Booking.findOne({ bookingCode: code });
    if (!existing) return code;
    attempts++;
  }
  return 'F' + Date.now().toString().slice(-5);
};

export const createBooking = async (customer: IUser, data: CreateBookingDTO) => {
  const workerUser = await User.findById(data.workerId);
  if (!workerUser || workerUser.role !== 'worker') {
    throw new ApiError(404, 'Worker not found');
  }

  const workerProfile = await WorkerProfile.findOne({ user: data.workerId });
  if (!workerProfile) {
    throw new ApiError(404, 'Worker profile not found');
  }

  if (!workerProfile.isAvailable) {
    throw new ApiError(400, 'Worker is currently not available for bookings');
  }

  const service = await Service.findById(data.serviceId);
  if (!service || !service.isActive) {
    throw new ApiError(404, 'Service not found');
  }

  const offersService = workerProfile.services.some(
    (sId) => sId.toString() === service._id.toString()
  );
  if (!offersService) {
    throw new ApiError(400, 'Worker does not provide this service');
  }

  const bookingCode = await generateUniqueBookingCode();

  const booking = await Booking.create({
    customer: customer._id,
    worker: workerUser._id,
    workerProfile: workerProfile._id,
    service: service._id,
    description: data.description,
    image: data.image || '',
    location: {
      type: 'Point',
      coordinates: [data.longitude, data.latitude],
    },
    address: data.address,
    scheduledDate: data.scheduledDate,
    scheduledTime: data.scheduledTime,
    price: workerProfile.startingPrice,
    status: 'PENDING',
    bookingCode,
  });

  // Notify worker
  await Notification.create({
    user: workerUser._id,
    title: 'New Booking Request',
    message: `${customer.name} sent a new booking request for ${service.name}.`,
    type: 'BOOKING_CREATED',
  });

  return Booking.findById(booking._id)
    .populate('customer', 'name phone profileImage')
    .populate('worker', 'name phone profileImage')
    .populate('service', 'name icon');
};

export const getBookings = async (user: IUser, statusFilter?: string) => {
  const query: any = {};

  if (user.role === 'customer') {
    query.customer = user._id;
  } else if (user.role === 'worker') {
    query.worker = user._id;
  }

  if (statusFilter) {
    query.status = statusFilter.toUpperCase();
  }

  return Booking.find(query)
    .populate('customer', 'name phone profileImage')
    .populate('worker', 'name phone profileImage')
    .populate('service', 'name icon')
    .sort({ createdAt: -1 });
};

export const getBookingById = async (user: IUser, bookingId: string) => {
  const booking = await Booking.findById(bookingId)
    .populate('customer', 'name phone profileImage email')
    .populate('worker', 'name phone profileImage email')
    .populate('service', 'name icon description')
    .populate('workerProfile');

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  const isCustomer = booking.customer._id.toString() === user._id.toString();
  const isWorker = booking.worker._id.toString() === user._id.toString();

  if (!isCustomer && !isWorker) {
    throw new ApiError(403, 'Forbidden: You do not have access to this booking');
  }

  return booking;
};

export const updateBookingStatus = async (
  user: IUser,
  bookingId: string,
  action: 'cancel' | 'accept' | 'reject' | 'start' | 'complete'
) => {
  const booking = await Booking.findById(bookingId)
    .populate('customer', 'name phone profileImage')
    .populate('worker', 'name phone profileImage')
    .populate('service', 'name icon');

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  const isCustomer = booking.customer._id.toString() === user._id.toString();
  const isWorker = booking.worker._id.toString() === user._id.toString();

  // Validate ownership by action
  if (action === 'cancel') {
    if (!isCustomer) {
      throw new ApiError(403, 'Only customer can cancel the booking');
    }
  } else if (['accept', 'reject', 'start', 'complete'].includes(action)) {
    if (!isWorker) {
      throw new ApiError(403, `Only assigned worker can ${action} the booking`);
    }
  }

  // State Transition Map Validation
  // PENDING → ACCEPTED | REJECTED | CANCELLED
  // ACCEPTED → STARTED | CANCELLED
  // STARTED → COMPLETED
  const validTransitions: Record<string, Record<string, BookingStatus>> = {
    PENDING: {
      accept: 'ACCEPTED',
      reject: 'REJECTED',
      cancel: 'CANCELLED',
    },
    ACCEPTED: {
      start: 'STARTED',
      cancel: 'CANCELLED',
    },
    STARTED: {
      complete: 'COMPLETED',
    },
  };

  const nextStatus = validTransitions[booking.status]?.[action];
  if (!nextStatus) {
    throw new ApiError(
      400,
      `Invalid status transition: cannot '${action}' a booking with status '${booking.status}'`
    );
  }

  booking.status = nextStatus;
  await booking.save();

  // If completed -> increment worker completedJobs
  if (nextStatus === 'COMPLETED') {
    await WorkerProfile.findOneAndUpdate(
      { user: booking.worker._id },
      { $inc: { completedJobs: 1 } }
    );
  }

  // Create Notifications
  const serviceName = (booking.service as any)?.name || 'service';
  const workerName = (booking.worker as any)?.name || 'Worker';
  const customerName = (booking.customer as any)?.name || 'Customer';

  if (action === 'cancel') {
    await Notification.create({
      user: booking.worker._id,
      title: 'Booking Cancelled',
      message: `${customerName} cancelled the booking for ${serviceName}.`,
      type: 'BOOKING_CANCELLED',
    });
  } else {
    let title = '';
    let message = '';
    if (action === 'accept') {
      title = 'Booking Accepted';
      message = `${workerName} accepted your booking for ${serviceName}.`;
    } else if (action === 'reject') {
      title = 'Booking Rejected';
      message = `${workerName} rejected your booking request.`;
    } else if (action === 'start') {
      title = 'Service Started';
      message = `${workerName} has started your ${serviceName} service.`;
    } else if (action === 'complete') {
      title = 'Service Completed';
      message = `${workerName} has completed your ${serviceName} service.`;
    }

    await Notification.create({
      user: booking.customer._id,
      title,
      message,
      type: `BOOKING_${action.toUpperCase()}`,
    });
  }

  return booking;
};
