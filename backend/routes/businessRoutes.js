import express from "express";
import businessAuth from "../middleware/businessAuth.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";
import {
  registerBusiness,
  checkEmail,
  sendLoginCode,
  verifyLoginCode,
  loginBusiness,
  quickLoginBusiness,
  getBusinessProfile,
  checkAuth,
  logoutBusiness,
  getAllBusinessesForAdmin,
  updateBusinessStatus,
  deleteBusinessForAdmin,
  setupBusiness,
  getRooms,
  createRoom,
  updateRoom,
  toggleRoomAvailability,
  deleteRoom,
  getTables,
  createTable,
  updateTable,
  deleteTable,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllHotels
} from "../controllers/business.controller.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", registerBusiness);
router.post("/check-email", checkEmail);
router.post("/send-login-code", sendLoginCode);
router.post("/verify-code", verifyLoginCode);
router.post("/login", loginBusiness);
router.post("/quick-login", quickLoginBusiness);

// Admin routes (require admin authentication)
router.get("/admin/businesses", verifyToken, isAdmin, getAllBusinessesForAdmin);
router.put("/admin/businesses/:businessId/status", verifyToken, isAdmin, updateBusinessStatus);
router.delete("/admin/businesses/:businessId", verifyToken, isAdmin, deleteBusinessForAdmin);

// Protected business routes (business authentication required)
router.get("/profile", businessAuth, getBusinessProfile);
router.get("/check-auth", businessAuth, checkAuth);
router.post("/logout", businessAuth, logoutBusiness);
router.post("/setup", businessAuth, setupBusiness);

// Room management routes
router.get("/rooms/:businessId", businessAuth, getRooms);
router.post("/rooms", businessAuth, createRoom);
router.put("/rooms/:roomId", businessAuth, updateRoom);
router.patch("/rooms/:roomId/availability", businessAuth, toggleRoomAvailability);
router.delete("/rooms/:roomId", businessAuth, deleteRoom);

// Table management routes (for restaurants and cafes)
router.get("/tables/:businessId", businessAuth, getTables);
router.post("/tables", businessAuth, createTable);
router.put("/tables/:tableId", businessAuth, updateTable);
router.delete("/tables/:tableId", businessAuth, deleteTable);

// Menu item management routes
router.get("/menu-items/:businessId", businessAuth, getMenuItems);
router.post("/menu-items", businessAuth, createMenuItem);
router.put("/menu-items/:menuItemId", businessAuth, updateMenuItem);
router.delete("/menu-items/:menuItemId", businessAuth, deleteMenuItem);

// Product management routes (for shopping)
router.get("/products/:businessId", businessAuth, getProducts);
router.post("/products", businessAuth, createProduct);
router.put("/products/:productId", businessAuth, updateProduct);
router.delete("/products/:productId", businessAuth, deleteProduct);

// Category management routes (for shopping)
router.get("/categories/:businessId", businessAuth, getCategories);
router.post("/categories", businessAuth, createCategory);
router.put("/categories/:categoryId", businessAuth, updateCategory);
router.delete("/categories/:categoryId", businessAuth, deleteCategory);

// Public route to get all approved hotels for travel components
router.get("/all", getAllHotels);

export default router;
