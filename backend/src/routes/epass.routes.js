import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  createEpassBooking,
  getMyEpassBookings,
  cancelEpassBooking
} from '../controllers/epass.controller.js';

const router = Router();

router.post('/book', requireAuth, createEpassBooking);
router.get('/my', requireAuth, getMyEpassBookings);
router.post('/cancel/:id', requireAuth, cancelEpassBooking);

export default router;
