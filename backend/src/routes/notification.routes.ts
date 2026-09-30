import { Router } from 'express';
import { getNotifications, markRead, markAllRead } from '../controllers/notification.controller';
import { auth } from '../middleware/auth';
import { validateObjectId } from '../middleware/validateObjectId';

const router = Router();

router.use(auth);

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', validateObjectId('id'), markRead);

export default router;
