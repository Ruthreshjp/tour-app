// backend/routes/business.route.js
import express from "express";
import {
  createBusiness,
  getBusinesses,
  updateBusinessStatus,
  loginBusiness,
  deleteBusiness,
} from "../controllers/business.controller.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Business registration and login routes
router.post("/signup", createBusiness);
router.post("/login", loginBusiness);

// Admin routes for business management
router.get("/admin/businesses", requireSignIn, isAdmin, getBusinesses);
router.put("/admin/business/:id/status", requireSignIn, isAdmin, updateBusinessStatus);
router.delete("/admin/business/:id", requireSignIn, isAdmin, deleteBusiness);

export default router;