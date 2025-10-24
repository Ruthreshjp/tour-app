import express from "express";
import {
  createPackageBooking,
  updatePaymentStatus,
  reviewPaymentStatus,
  getUserBookings,
  getAllBookings,
  getAdminUPI,
} from "../controllers/packageBooking.controller.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/create", verifyToken, createPackageBooking);
router.patch("/admin/:bookingId/payment", verifyToken, isAdmin, reviewPaymentStatus);
router.patch("/:bookingId/payment", verifyToken, updatePaymentStatus);
router.get("/user", verifyToken, getUserBookings);

// Admin routes
router.get("/admin/all", verifyToken, isAdmin, getAllBookings);
router.get("/admin/upi", getAdminUPI);

export default router;
