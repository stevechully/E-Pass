import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { confirmMockPayment } from '../controllers/payment.controller.js';

const router = Router();

router.post('/confirm', requireAuth, confirmMockPayment);

export default router;
