import { Router } from 'express';
import { createReview } from '../controllers/review.controller';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../middleware/validate';
import { createReviewSchema } from '../utils/validators';

const router = Router();

router.post('/', auth, requireRole('customer'), validate(createReviewSchema), createReview);

export default router;
