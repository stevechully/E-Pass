import express from 'express';
import {
  requestRefund,
  getPendingRefunds,
  processRefund,
  cancelPoojaBooking,
  cancelEpass,
  cancelFood,
  cancelAccommodation
} from '../controllers/refund.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// User Routes
router.post("/request", requireAuth, requestRefund);
router.post("/cancel-pooja", requireAuth, cancelPoojaBooking);
router.post("/cancel-epass", requireAuth, cancelEpass);
router.post("/cancel-food", requireAuth, cancelFood);
router.post("/cancel-accommodation", requireAuth, cancelAccommodation);

// Admin Routes
router.get("/admin/pending", requireAuth, getPendingRefunds);
router.post("/admin/process", requireAuth, processRefund);

export default router;