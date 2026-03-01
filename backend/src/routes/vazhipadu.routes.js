import express from "express";
import {
  checkAvailability,
  createBooking,
  getMyVazhipaduBookings,
  cancelVazhipaduBooking,
  verifyVazhipaduQR,
  getAllVazhipaduServices, // ✅ FIX: Change this name
  getVazhipaduAddons
} from "../controllers/vazhipadu.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 🔓 Public Routes
// ✅ FIX: Change the handler name here too
router.get("/services", getAllVazhipaduServices); 
router.get("/addons", getVazhipaduAddons);
router.post("/check-availability", checkAvailability);

// 🔐 Protected Routes
router.post("/create-booking", requireAuth, createBooking);
router.get("/my", requireAuth, getMyVazhipaduBookings);
router.post("/cancel/:id", requireAuth, cancelVazhipaduBooking);

// 🛡️ Admin Routes
router.post("/verify", verifyVazhipaduQR);

export default router;