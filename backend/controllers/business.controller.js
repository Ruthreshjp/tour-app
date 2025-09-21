import Business from "../models/business.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Create new business account
const createBusiness = async (req, res) => {
  try {
    const { email, password, organization_name, business_type, phone, address, description } = req.body;

    // Validate required fields
    if (!email || !password || !organization_name || !business_type || !phone || !address || !description) {
      console.log("Missing fields:", { email, organization_name, business_type, phone, address, description });
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Check if business already exists
    const existingBusiness = await Business.findOne({ email });
    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        message: "Business with this email already exists",
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new business
    const newBusiness = new Business({
      organization_name,
      business_type,
      email,
      password: hashedPassword,
      phone,
      address,
      description,
      status: "pending", // Ensure lowercase
      isSuspended: false,
    });

    await newBusiness.save();
    console.log("New business saved:", newBusiness); // Debug log

    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Business Registration Confirmation",
      html: `
        <h1>Thank you for registering ${organization_name}</h1>
        <p>Your business registration is pending admin approval. We will notify you once your account is approved.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent to:", email);

    res.status(201).json({
      success: true,
      message: "Business registered successfully. Pending admin approval.",
    });
  } catch (error) {
    console.error("Business registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering business",
    });
  }
};

// Business login
const loginBusiness = async (req, res) => {
  try {
    const { email, loginCode } = req.body;

    // Validate input
    if (!email || !loginCode) {
      return res.status(400).json({
        success: false,
        message: "Email and login code are required",
      });
    }

    // Find business
    const business = await Business.findOne({ email });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Check status
    if (business.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your account is pending approval or has been rejected",
      });
    }

    // Check suspension
    if (business.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "Your account is temporarily suspended",
      });
    }

    // Verify login code
    if (business.loginCode !== loginCode) {
      return res.status(401).json({
        success: false,
        message: "Invalid login code",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: business._id, user_role: "business" },
      process.env.JWT_SECRET || "bfuiwrht7895t5uith",
      { expiresIn: "1d" }
    );

    res
      .cookie("X_TTMS_access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .status(200)
      .json({
        success: true,
        message: "Business login successful",
        business: {
          id: business._id,
          organization_name: business.organization_name,
          email: business.email,
          user_role: "business",
          business_type: business.business_type,
          status: business.status,
        },
        token,
      });
  } catch (error) {
    console.error("Business login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
};

// Get all businesses (for admin)
const getBusinesses = async (req, res) => {
  try {
    const { status, isSuspended } = req.query;
    const query = {};
    if (status) {
      query.status = status.toLowerCase();
    }
    if (isSuspended !== undefined) {
      query.isSuspended = isSuspended === "true";
    }
    console.log("Query parameters:", req.query);
    console.log("MongoDB query:", query);
    const allBusinesses = await Business.find().select("-password"); // Debug: fetch all
    console.log("All businesses in DB:", allBusinesses);
    const businesses = await Business.find(query).select("-password").sort({ createdAt: -1 });
    console.log("Fetched businesses:", businesses);
    console.log(`Total businesses found: ${businesses.length}`);
    res.status(200).json({
      success: true,
      businesses, // Return businesses array
    });
  } catch (error) {
    console.error("Get businesses error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching businesses",
    });
  }
};

// Update business status (for admin)
const updateBusinessStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isSuspended } = req.body;

    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (status) {
      business.status = status.toLowerCase();
    }
    if (typeof isSuspended !== "undefined") {
      business.isSuspended = isSuspended;
    }

    if (status === "approved" && !business.loginCode) {
      business.loginCode = crypto.randomBytes(8).toString("hex");
    }
    if (status === "rejected" || isSuspended) {
      business.loginCode = null; // Clear login code
    }

    await business.save();
    console.log(`Updated business ${id}:`, { status: business.status, loginCode: business.loginCode });

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: business.email,
      subject: `Business Status Update: ${business.organization_name}`,
      html: `
        <h1>Business Status Update</h1>
        <p>Dear ${business.organization_name},</p>
        ${
          status
            ? `
              <p>Your business registration has been ${status}.</p>
              ${
                status === "approved"
                  ? `<p>You can now log in to your business account using this login code: <strong>${business.loginCode}</strong></p>`
                  : "<p>Please contact support for more information.</p>"
              }
            `
            : ""
        }
        ${
          typeof isSuspended !== "undefined"
            ? `<p>Your account has been ${isSuspended ? "temporarily suspended" : "re-enabled"}.</p>`
            : ""
        }
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Status update email sent to:", business.email);

    res.status(200).json({
      success: true,
      message: "Business status updated",
      business,
    });
  } catch (error) {
    console.error("Update business status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating business status",
    });
  }
};

// Delete business (for admin)
const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    await Business.findByIdAndDelete(id);
    console.log("Deleted business:", id);

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: business.email,
      subject: `Business Account Terminated: ${business.organization_name}`,
      html: `
        <h1>Business Account Terminated</h1>
        <p>Dear ${business.organization_name},</p>
        <p>Your business account has been permanently terminated.</p>
        <p>Please contact support for more information.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Termination email sent to:", business.email);

    res.status(200).json({
      success: true,
      message: "Business permanently deleted",
    });
  } catch (error) {
    console.error("Delete business error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting business",
    });
  }
};

export { createBusiness, loginBusiness, getBusinesses, updateBusinessStatus, deleteBusiness };