import express from "express";
import {
  checkAvailability,
  createBooking,
  getMyVazhipaduBookings,
  cancelVazhipaduBooking,
  verifyVazhipaduQR,
  getAllVazhipaduServices,
  getVazhipaduAddons,
  getYearlyCalendar // ✅ 1. Added the new calendar import
} from "../controllers/vazhipadu.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 🔓 Public Routes
router.get("/services", getAllVazhipaduServices); 
router.get("/addons", getVazhipaduAddons);
router.post("/check-availability", checkAvailability);
router.get("/calendar/:year", getYearlyCalendar); // ✅ 2. Registered the yearly calendar route

// 🔐 Protected Routes
router.post("/create-booking", requireAuth, createBooking);
router.get("/my", requireAuth, getMyVazhipaduBookings);
router.post("/cancel/:id", requireAuth, cancelVazhipaduBooking);

// 🛡️ Admin Routes
router.post("/verify", verifyVazhipaduQR);

export default router;