export type UserRole = 'customer' | 'worker';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
}

export interface Worker {
  id: string;
  workerProfileId?: string;
  name: string;
  email?: string;
  phone: string;
  profileImage?: string;
  bio?: string;
  services: string[] | Service[];
  rating: number;
  reviewCount: number;
  experienceYears: number;
  startingPrice: number;
  serviceRadius?: number;
  distance?: number;
  isAvailable: boolean;
  isVerified: boolean;
  completedJobs?: number;
  address?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  recentReviews?: Review[];
}

export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'STARTED' | 'COMPLETED';

export interface Booking {
  _id: string;
  customer: User;
  worker: User;
  workerProfile?: string | Worker;
  service: Service;
  description: string;
  image?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  price: number;
  status: BookingStatus;
  bookingCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  booking: string | Booking;
  customer: User;
  worker: string | User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
