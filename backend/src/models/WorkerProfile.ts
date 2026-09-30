import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkerProfile extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  bio: string;
  services: mongoose.Types.ObjectId[];
  experienceYears: number;
  startingPrice: number;
  serviceRadius: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  isAvailable: boolean;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  createdAt: Date;
  updatedAt: Date;
}

const workerProfileSchema = new Schema<IWorkerProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, default: '' },
    services: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    experienceYears: { type: Number, default: 0 },
    startingPrice: { type: Number, default: 0 },
    serviceRadius: { type: Number, default: 10 },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [77.3411, 11.1085], // [lng, lat]
      },
    },
    address: { type: String, default: '' },
    isAvailable: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

workerProfileSchema.index({ location: '2dsphere' });

export const WorkerProfile = mongoose.model<IWorkerProfile>('WorkerProfile', workerProfileSchema);
