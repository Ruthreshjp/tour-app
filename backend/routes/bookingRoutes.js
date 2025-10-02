import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import businessAuth from '../middleware/businessAuth.js';
import {
  createBooking,
  getUserBookings,
  getBusinessBookings,
  updateBookingStatus,
  updatePaymentStatus
} from '../controllers/booking.controller.js';

const router = express.Router();

// User booking routes
router.post('/create', verifyToken, createBooking);
router.get('/user', verifyToken, getUserBookings);

// Business booking routes  
router.get('/business', businessAuth, getBusinessBookings);
router.patch('/:bookingId/status', businessAuth, updateBookingStatus);
router.patch('/:bookingId/payment', verifyToken, updatePaymentStatus);

export default router;
