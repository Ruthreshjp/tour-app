import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Helper to extract token from request
const getTokenFromRequest = (req) => {
  // Check Authorization header first
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Then check for cookie
  return req.cookies?.X_TTMS_access_token;
};

// Verify JWT token and require sign in
export const requireSignIn = async (req, res, next) => {
  return verifyToken(req, res, next);
};

export const verifyToken = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token || typeof token !== "string" || token.trim() === "") {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    // Specific error messages for different JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Verify admin role
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const user = await User.findById(req.user.id)
      .select('role user_role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Support both role and user_role for backward compatibility
    if (user.role === 'admin' || user.user_role === 1) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying admin access'
    });
  }
};