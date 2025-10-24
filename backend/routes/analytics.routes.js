import express from "express";
import {
  trackBusinessView,
  createRating,
  getBusinessAnalytics,
  getBusinessViews,
  getBusinessBookingsDetailed,
  getBusinessRatings
} from "../controllers/analytics.controller.js";
import { verifyToken as authenticateToken } from "../middlewares/authMiddleware.js";
import businessAuth from "../middleware/businessAuth.js";

const router = express.Router();

// Public route to track business views
router.post("/business/:businessId/view", authenticateToken, trackBusinessView);

// Customer routes
router.post("/rating", authenticateToken, createRating);

// Business routes (require business authentication)
router.get("/business/analytics", businessAuth, getBusinessAnalytics);
router.get("/business/views", businessAuth, getBusinessViews);
router.get("/business/bookings-detailed", businessAuth, getBusinessBookingsDetailed);
router.get("/business/ratings", businessAuth, getBusinessRatings);

export default router;
