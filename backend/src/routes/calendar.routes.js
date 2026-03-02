import express from 'express';
import { 
  getCalendarByYear, 
  getSpecialPoojaDates, 
  createCalendarEntry, 
  updateCalendarEntry, 
  deleteCalendarEntry 
} from '../controllers/calendar.controller.js';

import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * 🔓 PUBLIC ROUTES
 */
// 1. Informational: Get all events for the year view
router.get('/:year', getCalendarByYear);

// 2. Functional: Get specific dates + enriched slots for a special pooja booking flow
router.get('/special-dates/:service_id/:year', getSpecialPoojaDates);

/**
 * 🔐 ADMIN ROUTES
 */
router.post('/', requireAuth, requireAdmin, createCalendarEntry);
router.put('/:id', requireAuth, requireAdmin, updateCalendarEntry);
router.delete('/:id', requireAuth, requireAdmin, deleteCalendarEntry);

export default router;