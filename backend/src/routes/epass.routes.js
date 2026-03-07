import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  createEpassBooking,
  confirmEpassPayment,
  getMyEpassBookings,
  cancelEpassBooking
} from '../controllers/epass.controller.js';

const router = Router();

// New 2-step booking flow
router.post('/create-booking', requireAuth, createEpassBooking);
router.post('/confirm-payment', requireAuth, confirmEpassPayment);

router.get('/my', requireAuth, getMyEpassBookings);
router.post('/cancel/:id', requireAuth, cancelEpassBooking);

export default router;