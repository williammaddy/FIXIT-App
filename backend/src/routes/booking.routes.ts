import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
} from '../controllers/booking.controller';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { validateObjectId } from '../middleware/validateObjectId';
import { createBookingSchema } from '../utils/validators';

const router = Router();

router.use(auth);

router.post('/', validate(createBookingSchema), createBooking);
router.get('/', getBookings);
router.get('/:id', validateObjectId('id'), getBookingById);

router.patch('/:id/:action', validateObjectId('id'), updateBookingStatus);

export default router;
