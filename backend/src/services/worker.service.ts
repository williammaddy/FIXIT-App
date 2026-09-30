import mongoose from 'mongoose';
import { WorkerProfile } from '../models/WorkerProfile';
import { Service } from '../models/Service';
import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { Review } from '../models/Review';
import { ApiError } from '../utils/ApiError';

export interface NearbyQuery {
  service: string;
  latitude: number;
  longitude: number;
  radius?: number;
  sort?: 'nearest' | 'rating' | 'price' | 'experience';
}

export const getNearbyWorkers = async (query: NearbyQuery) => {
  const { service: serviceName, latitude, longitude, radius = 10000, sort = 'nearest' } = query;

  const foundService = await Service.findOne({
    name: { $regex: new RegExp(`^${serviceName}$`, 'i') },
    isActive: true,
  });

  if (!foundService) {
    throw new ApiError(404, `Service '${serviceName}' not found`);
  }

  let sortStage: any = { distanceMeters: 1 };
  if (sort === 'rating') sortStage = { rating: -1, distanceMeters: 1 };
  else if (sort === 'price') sortStage = { startingPrice: 1, distanceMeters: 1 };
  else if (sort === 'experience') sortStage = { experienceYears: -1, distanceMeters: 1 };

  const pipeline: any[] = [
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [longitude, latitude], // [lng, lat]
        },
        spherical: true,
        distanceField: 'distanceMeters',
        distanceMultiplier: 0.001, // convert meters to kilometers
        maxDistance: radius,
        query: {
          isAvailable: true,
          services: foundService._id,
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDoc',
      },
    },
    { $unwind: '$userDoc' },
    {
      $lookup: {
        from: 'services',
        localField: 'services',
        foreignField: '_id',
        as: 'serviceDocs',
      },
    },
    { $sort: sortStage },
    {
      $project: {
        _id: 0,
        id: '$userDoc._id',
        workerProfileId: '$_id',
        name: '$userDoc.name',
        profileImage: '$userDoc.profileImage',
        phone: '$userDoc.phone',
        services: '$serviceDocs.name',
        rating: '$rating',
        reviewCount: '$reviewCount',
        experienceYears: '$experienceYears',
        startingPrice: '$startingPrice',
        distance: { $round: ['$distanceMeters', 1] },
        isAvailable: '$isAvailable',
        isVerified: '$isVerified',
      },
    },
  ];

  const workers = await WorkerProfile.aggregate(pipeline);
  return workers;
};

export const getWorkerPublicProfile = async (workerId: string) => {
  let profile = await WorkerProfile.findOne({
    $or: [{ _id: mongoose.Types.ObjectId.isValid(workerId) ? workerId : null }, { user: workerId }],
  })
    .populate('user', 'name email phone profileImage role')
    .populate('services', 'name description icon');

  if (!profile) {
    throw new ApiError(404, 'Worker profile not found');
  }

  const recentReviews = await Review.find({ worker: profile.user._id })
    .populate('customer', 'name profileImage')
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    id: (profile.user as any)._id,
    workerProfileId: profile._id,
    name: (profile.user as any).name,
    email: (profile.user as any).email,
    phone: (profile.user as any).phone,
    profileImage: (profile.user as any).profileImage,
    bio: profile.bio,
    services: profile.services,
    experienceYears: profile.experienceYears,
    startingPrice: profile.startingPrice,
    serviceRadius: profile.serviceRadius,
    location: profile.location,
    address: profile.address,
    isAvailable: profile.isAvailable,
    isVerified: profile.isVerified,
    rating: profile.rating,
    reviewCount: profile.reviewCount,
    completedJobs: profile.completedJobs,
    recentReviews,
  };
};

export const getWorkerProfileMe = async (userId: string) => {
  const profile = await WorkerProfile.findOne({ user: userId })
    .populate('user', 'name email phone profileImage role')
    .populate('services', 'name description icon');

  if (!profile) {
    throw new ApiError(404, 'Worker profile not found');
  }

  return profile;
};

export const updateWorkerProfileMe = async (userId: string, data: any) => {
  let profile = await WorkerProfile.findOne({ user: userId });
  if (!profile) {
    throw new ApiError(404, 'Worker profile not found');
  }

  if (data.bio !== undefined) profile.bio = data.bio;
  if (data.services !== undefined) {
    // If array of service names or IDs
    if (Array.isArray(data.services) && data.services.length > 0) {
      if (mongoose.Types.ObjectId.isValid(data.services[0])) {
        profile.services = data.services;
      } else {
        const found = await Service.find({ name: { $in: data.services } });
        profile.services = found.map((s) => s._id);
      }
    } else {
      profile.services = [];
    }
  }
  if (data.experienceYears !== undefined) profile.experienceYears = data.experienceYears;
  if (data.startingPrice !== undefined) profile.startingPrice = data.startingPrice;
  if (data.serviceRadius !== undefined) profile.serviceRadius = data.serviceRadius;
  if (data.location !== undefined) profile.location = data.location;
  if (data.address !== undefined) profile.address = data.address;
  if (data.isAvailable !== undefined) profile.isAvailable = data.isAvailable;

  await profile.save();
  return getWorkerProfileMe(userId);
};

export const updateWorkerAvailabilityMe = async (userId: string, isAvailable: boolean) => {
  const profile = await WorkerProfile.findOneAndUpdate(
    { user: userId },
    { isAvailable },
    { new: true }
  ).populate('services', 'name icon');

  if (!profile) {
    throw new ApiError(404, 'Worker profile not found');
  }

  return profile;
};

export const getWorkerReviews = async (workerId: string) => {
  const reviews = await Review.find({
    $or: [{ worker: workerId }, { workerProfile: workerId }],
  })
    .populate('customer', 'name profileImage')
    .sort({ createdAt: -1 });

  return reviews;
};

export const getWorkerStats = async (userId: string) => {
  const profile = await WorkerProfile.findOne({ user: userId });
  if (!profile) {
    throw new ApiError(404, 'Worker profile not found');
  }

  const pendingRequests = await Booking.countDocuments({
    worker: userId,
    status: 'PENDING',
  });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todaysJobs = await Booking.countDocuments({
    worker: userId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  return {
    pendingRequests,
    todaysJobs,
    completedJobs: profile.completedJobs,
    rating: profile.rating,
  };
};
