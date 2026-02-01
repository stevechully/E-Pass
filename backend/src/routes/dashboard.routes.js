import express from 'express';
import {
  getDashboardOverview,
  getAllBookings,
  getPaymentsAndRefunds,
  getBookingDetails
} from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ✅ This protects all dashboard routes below it
router.use(authenticate);

/**
 * GET /api/dashboard/overview
 * Fetches booking counts, financial totals, upcoming visit, and eco-fee status
 */
router.get('/overview', getDashboardOverview);

/**
 * GET /api/dashboard/bookings
 * Fetches a combined list of all module bookings (EPASS, FOOD, ACCOMMODATION)
 */
router.get('/bookings', getAllBookings);

/**
 * GET /api/dashboard/payments
 * Fetches transaction history including associated refunds
 */
router.get('/payments', getPaymentsAndRefunds);

/**
 * GET /api/dashboard/booking/:module/:id
 * Fetches deep-dive details for a specific booking, its payment, and any cancellation info
 */
router.get('/booking/:module/:id', getBookingDetails);

export default router;