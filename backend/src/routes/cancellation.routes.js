import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { cancelBooking } from '../controllers/cancellation.controller.js';

const router = Router();

router.post('/', requireAuth, cancelBooking);

export default router;
