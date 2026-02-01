import { Router } from "express";
import {
  createAccommodation,
  toggleAccommodation
} from "../controllers/admin.accommodation.controller.js";
import {
  requireAuth,
  requireAdmin
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, requireAdmin, createAccommodation);
router.patch("/:id/toggle", requireAuth, requireAdmin, toggleAccommodation);

export default router;
