import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Helper to extract token from request
const getTokenFromRequest = (req) => {
  console.log('🔐 Auth Middleware: Extracting token from request...');
  console.log('🔐 Auth Middleware: req.cookies =', req.cookies);
  console.log('🔐 Auth Middleware: Authorization header =', req.headers?.authorization);
  
  // Check Authorization header first
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log('🔐 Auth Middleware: Found token in Authorization header');
    return token;
  }
  
  // Then check for cookie
  const cookieToken = req.cookies?.X_TTMS_access_token;
  if (cookieToken) {
    console.log('🔐 Auth Middleware: Found token in X_TTMS_access_token cookie');
  } else {
    console.log('🔐 Auth Middleware: NO token found in cookies or headers');
  }
  
  return cookieToken;
};

// Verify JWT token and require sign in
export const requireSignIn = async (req, res, next) => {
  return verifyToken(req, res, next);
};

export const verifyToken = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token || typeof token !== "string" || token.trim() === "") {
      console.log('🔐 Auth Middleware: No valid token found - returning 401');
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    console.log('🔐 Auth Middleware: Token found, verifying with JWT_SECRET');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "bfuiwrht7895t5uith");
    console.log('🔐 Auth Middleware: Token verified successfully, user ID:', decoded.id);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('🔐 Auth Middleware: Token verification error:', error.message);
    console.error('🔐 Auth Middleware: JWT_SECRET exists?', !!process.env.JWT_SECRET);
    
    // Specific error messages for different JWT errors
    if (error.name === 'TokenExpiredError') {
      console.log('🔐 Auth Middleware: Token expired');
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      console.log('🔐 Auth Middleware: Invalid token signature or format');
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