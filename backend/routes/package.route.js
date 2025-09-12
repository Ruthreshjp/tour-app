import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createPackage,
  deletePackage,
  getPackageData,
  getPackages,
  updatePackage,
} from "../controllers/package.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Create package
router.post(
  "/add-package",
  requireSignIn,
  isAdmin,
  upload.array("packageImages", 10),
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