import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const requireSignIn = (req, res, next) => {
  try {
    const token = req.cookies?.X_TTMS_access_token;
    console.log("Token extracted:", token ? "Present" : "Missing");
    if (!token || typeof token !== "string" || token.trim() === "") {
      console.log("Invalid token format:", token);
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token not provided or invalid!",
      });
    }
    const decoded = jwt.verify(token, "bfuiwrht7895t5uith");
    console.log("Token decoded:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(403).json({
      success: false,
      message: "Forbidden: Invalid or expired token",
    });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    console.log("Checking admin for user ID:", req.user?.id);
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user ID in token",
      });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    console.log("User role:", user.user_role);
    if (user.user_role === 1) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
    }
  } catch (error) {
    console.error("Admin middleware error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error in admin middleware",
    });
  }
};