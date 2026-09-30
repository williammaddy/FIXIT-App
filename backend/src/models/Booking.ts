import mongoose, { Schema, Document } from 'mongoose';

export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'STARTED' | 'COMPLETED';

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  worker: mongoose.Types.ObjectId;
  workerProfile: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  description: string;
  image: string;
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
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workerProfile: { type: Schema.Types.ObjectId, ref: 'WorkerProfile', required: true },
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    address: { type: String, required: true },
    scheduledDate: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'STARTED', 'COMPLETED'],
      default: 'PENDING',
    },
    bookingCode: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

bookingSchema.index({ location: '2dsphere' });

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
