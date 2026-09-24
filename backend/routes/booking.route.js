import express from "express";
import {
  bookPackage,
  cancelBooking,
  deleteBookingHistory,
  getAllBookings,
  getAllUserBookings,
  getCurrentBookings,
  getUserCurrentBookings,
  createBooking,
  getUserBookings,
  getBusinessBookings,
  updateBookingStatus,
  updatePaymentStatus,
  verifyPayment,
  getBookingById
} from "../controllers/booking.controller.js";
import { isAdmin, requireSignIn, verifyToken } from "../middlewares/authMiddleware.js";
import businessAuth from "../middlewares/businessAuth.js";

const router = express.Router();

// Package booking routes
router.post("/book-package/:packageId", requireSignIn, bookPackage);
router.get("/get-currentBookings", requireSignIn, isAdmin, getCurrentBookings);
router.get("/get-allBookings", requireSignIn, isAdmin, getAllBookings);
router.get("/get-UserCurrentBookings/:id", requireSignIn, getUserCurrentBookings);
router.get("/get-allUserBookings/:id", requireSignIn, getAllUserBookings);
router.delete("/delete-booking-history/:id/:userId", requireSignIn, deleteBookingHistory);
router.post("/cancel-booking/:id/:userId", requireSignIn, cancelBooking);

// Business & Service booking routes
router.post('/create', verifyToken, createBooking);
router.get('/user', verifyToken, getUserBookings);
router.get('/business', businessAuth, getBusinessBookings);
router.patch('/:bookingId/cancel', verifyToken, cancelBooking);
router.patch('/:bookingId/status', businessAuth, updateBookingStatus);
router.patch('/:bookingId/payment', verifyToken, updatePaymentStatus);
router.patch('/:bookingId/verify-payment', businessAuth, verifyPayment);
router.get('/:bookingId', verifyToken, getBookingById);

export default router;
