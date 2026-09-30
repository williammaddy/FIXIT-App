import { Router } from 'express';
import {
  getNearby,
  getProfile,
  getMyProfile,
  updateMyProfile,
  updateAvailability,
  getReviews,
  getStats,
} from '../controllers/worker.controller';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../middleware/validate';
import { validateObjectId } from '../middleware/validateObjectId';
import { nearbyWorkersSchema, updateAvailabilitySchema } from '../utils/validators';

const router = Router();

// Public / auth endpoints
router.get('/nearby', auth, validate(nearbyWorkersSchema), getNearby);
router.get('/me/profile', auth, requireRole('worker'), getMyProfile);
router.put('/me/profile', auth, requireRole('worker'), updateMyProfile);
router.patch('/me/availability', auth, requireRole('worker'), validate(updateAvailabilitySchema), updateAvailability);
router.get('/me/stats', auth, requireRole('worker'), getStats);

router.get('/:id', validateObjectId('id'), getProfile);
router.get('/:id/reviews', validateObjectId('id'), getReviews);

export default router;
