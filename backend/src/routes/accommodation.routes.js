import { Router } from "express";
import {
  getAccommodations,
  createAccommodationBooking,
  getMyAccommodationBookings,
  cancelAccommodationBooking,
  confirmAccommodationPayment // ✅ Imported new function
} from "../controllers/accommodation.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getAccommodations);
router.post("/book", requireAuth, createAccommodationBooking);
router.get("/my", requireAuth, getMyAccommodationBookings);
router.post("/cancel/:id", requireAuth, cancelAccommodationBooking);

// ✅ ADDED: The central confirmation endpoint
router.post("/confirm-payment", requireAuth, confirmAccommodationPayment);

export default router;