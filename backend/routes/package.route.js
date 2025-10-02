import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createPackage,
  deletePackage,
  getPackageData,
  getPackages,
  updatePackage,
} from "../controllers/package.controller.js";
import { getBraintreeToken, processBraintreePayment } from "../controllers/payment.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Braintree payment routes
router.get("/braintree/token", getBraintreeToken);
router.post("/braintree/payment", requireSignIn, processBraintreePayment);

// Create package
router.post(
  "/add-package",
  requireSignIn,
  isAdmin,
  (req, res, next) => {
    upload.array("packageImages", 10)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({
            success: false,
            message: err.code === 'LIMIT_FILE_SIZE' 
              ? 'File is too large. Maximum size is 5MB'
              : err.code === 'LIMIT_FILE_COUNT'
              ? 'Too many files. Maximum is 10 files'
              : err.message
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  },
  createPackage
);

// Update package by id
router.put(
  "/update-package/:id",
  requireSignIn,
  isAdmin,
  upload.array("packageImages", 10),
  updatePackage
);

// Delete package by id
router.delete("/delete-package/:id", requireSignIn, isAdmin, deletePackage);

// Get all packages
router.get("/get-packages", getPackages);

// Get single package data by id
router.get("/get-package-data/:id", getPackageData);

export default router;