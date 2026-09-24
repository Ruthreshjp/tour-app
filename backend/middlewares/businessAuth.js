import jwt from "jsonwebtoken";
import Business from "../models/business.model.js";

const businessAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Check for token in cookies
    else if (req.cookies.businessToken) {
      token = req.cookies.businessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
      console.log("🔐 Business auth - Token decoded, businessId:", decoded.businessId);
      
      // Check if business exists and is active - use lean() to avoid validation
      const business = await Business.findById(decoded.businessId)
        .select("-password")
        .lean(); // Use lean() to get plain object without validation
      console.log("🏢 Business auth - Business found:", business ? business.businessName : "Not found");
      
      if (!business) {
        return res.status(401).json({
          success: false,
          message: "Invalid token. Business not found.",
        });
      }

      if (!business.isActive) {
        return res.status(401).json({
          success: false,
          message: "Business account is deactivated.",
        });
      }

      // Add business info to request
      req.businessId = business._id;
      req.business = business;
      
      next();
    } catch (tokenError) {
      console.error("Token verification error:", tokenError);
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }
  } catch (error) {
    console.error("Business auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error in authentication.",
    });
  }
};

export default businessAuth;
