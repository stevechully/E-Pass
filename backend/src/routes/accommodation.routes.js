import { Router } from "express";
import {
  getAccommodations,
  createAccommodationBooking,
  getMyAccommodationBookings,
  cancelAccommodationBooking
} from "../controllers/accommodation.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getAccommodations);
router.post("/book", requireAuth, createAccommodationBooking);
router.get("/my", requireAuth, getMyAccommodationBookings);
router.post("/cancel/:id", requireAuth, cancelAccommodationBooking);

export default router;
