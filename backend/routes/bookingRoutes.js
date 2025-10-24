import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import businessAuth from '../middleware/businessAuth.js';
import {
  createBooking,
  getUserBookings,
  getBusinessBookings,
  updateBookingStatus,
  updatePaymentStatus,
  verifyPayment,
  getBookingById,
  cancelBooking
} from '../controllers/booking.controller.js';

const router = express.Router();

// User booking routes
router.post('/create', verifyToken, createBooking);
router.get('/user', verifyToken, getUserBookings);

// Business booking routes (specific routes must be before /:bookingId)
router.get('/business', businessAuth, getBusinessBookings);

// Specific action routes (must be before /:bookingId to avoid route conflict)
router.patch('/:bookingId/cancel', verifyToken, cancelBooking); // Customer cancels their booking
router.patch('/:bookingId/status', businessAuth, updateBookingStatus);
router.patch('/:bookingId/payment', verifyToken, updatePaymentStatus);
router.patch('/:bookingId/verify-payment', businessAuth, verifyPayment);

// Get single booking (must be LAST to avoid catching other routes)
router.get('/:bookingId', verifyToken, getBookingById);

export default router;
