import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";
import {
  getPendingRefunds,
  completeRefund
} from "../controllers/admin.refund.controller.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", getPendingRefunds);
router.post("/:id/complete", completeRefund);

export default router;
