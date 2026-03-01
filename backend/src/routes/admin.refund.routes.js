import express from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";
import {
  getPendingRefunds,
  processRefund // ✅ FIX: Changed from completeRefund to processRefund
} from "../controllers/admin.refund.controller.js";

const router = express.Router();

// Protect all refund routes
router.use(requireAuth, requireAdmin);

router.get("/", getPendingRefunds);

// ✅ FIX: Changed endpoint to /process and handler to processRefund
router.post("/:id/process", processRefund); 

export default router;