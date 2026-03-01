import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";
import {
  getAllUsers,
  createEntrySlot,
  toggleEntrySlot,
  createFoodSlot,
  toggleFoodSlot
} from "../controllers/admin.controller.js";

// ✅ 1. Import the new refund controllers
import {
  getPendingRefunds,
  processRefund
} from "../controllers/admin.refund.controller.js";

const router = Router();

// ⭐ All routes below require both a valid token AND admin email status
router.use(requireAuth, requireAdmin);

/**
 * User Management
 */
router.get("/users", getAllUsers);

/**
 * Entry Slot Management
 */
router.post("/entry-slots", createEntrySlot);
router.patch("/entry-slots/:id/toggle", toggleEntrySlot);

/**
 * Food Slot Management
 */
router.post("/food-slots", createFoodSlot);
router.patch("/food-slots/:id/toggle", toggleFoodSlot);

/**
 * 💰 Refund Management
 */
// ✅ 2. Add the refund routes
router.get("/refunds", getPendingRefunds);
router.post("/refunds/:id/process", processRefund);

export default router;