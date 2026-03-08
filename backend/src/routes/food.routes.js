import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  createFoodBooking,
  getMyFoodBookings,
  cancelFoodBooking,
  confirmFoodPayment // ✅ Ensure this is imported
} from '../controllers/food.controller.js';

const router = Router();

router.post('/book', requireAuth, createFoodBooking);
router.get('/my', requireAuth, getMyFoodBookings);
router.post('/cancel/:id', requireAuth, cancelFoodBooking);

// ✅ FIX: Explicitly define the confirmation route to solve the 404 error
router.post('/confirm-payment', requireAuth, confirmFoodPayment);

export default router;