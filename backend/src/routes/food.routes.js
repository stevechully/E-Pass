import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  createFoodBooking,
  getMyFoodBookings,
  cancelFoodBooking
} from '../controllers/food.controller.js';

const router = Router();

router.post('/book', requireAuth, createFoodBooking);
router.get('/my', requireAuth, getMyFoodBookings);
router.post('/cancel/:id', requireAuth, cancelFoodBooking);

export default router;
