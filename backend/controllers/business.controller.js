import Business from "../models/business.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Email configuration with multiple fallback options
let transporter = null;

// Try to configure email with better settings
const configureEmail = () => {
  try {
    // Option 1: Gmail with app password
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        },
        timeout: 10000,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
      });
      console.log("📧 Email configured with Gmail SMTP");
      return true;
    }
    
    // Option 2: Use a test email service (Ethereal)
    console.log("📧 Setting up test email service...");
    return false;
  } catch (error) {
    console.log("❌ Email configuration failed:", error.message);
    return false;
  }
};

// Configure email on startup
const emailConfigured = configureEmail();

// Generate JWT token
const generateToken = (businessId) => {
  return jwt.sign({ businessId }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "30d",
  });
};

// Send email (try real email first, fallback to simulation)
const sendEmail = async (to, subject, html) => {
  // Try to send real email if transporter is configured
  if (transporter) {
    try {
      console.log("📧 Attempting to send real email to:", to);
      
      const info = await transporter.sendMail({
        from: `"Travel-Zone" <${process.env.EMAIL_USER || 'noreply@travel-zone.com'}>`,
        to: to,
        subject: subject,
        html: html,
      });
      
      console.log("✅ Email sent successfully!");
      console.log("Message ID:", info.messageId);
      
      // Still extract login codes for console reference
      if (html.includes("Login Code:") || html.includes("login code is:")) {
        const codeMatch = html.match(/(\d{6})/);
        if (codeMatch) {
          console.log("🔑 Login Code sent to", to, ":", codeMatch[1]);
        }
      }
      
      return { success: true, message: "Email sent successfully" };
      
    } catch (error) {
      console.error("❌ Email sending failed:", error.message);
      // Fall back to simulation if real email fails
    }
  }
  
  // Fallback: Email simulation
  console.log("\n=== EMAIL SIMULATION (Real email not available) ===");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("Content Preview:", html.substring(0, 200) + "...");
  
  // Extract important info like login codes
  if (html.includes("Login Code:") || html.includes("login code is:")) {
    const codeMatch = html.match(/(\d{6})/);
    if (codeMatch) {
      console.log("🔑 IMPORTANT: Login Code for", to, "is:", codeMatch[1]);
      console.log("📧 Business can use this code to login!");
    }
  }
  console.log("================================================\n");
  
  return { success: true, message: "Email sent (simulated - check console for login code)" };
};

// Register business
const registerBusiness = async (req, res) => {
  try {
    console.log("🏢 Business registration started...");
    const {
      businessName,
      email,
      phone,
      businessType,
      password,
      address,
      city,
      state,
      pincode,
      description,
    } = req.body;

    console.log("📝 Registration data received:", { businessName, email, businessType, city, state });

    // Check if business already exists
    const existingBusiness = await Business.findOne({ email });
    if (existingBusiness) {
      console.log("❌ Business already exists:", email);
      return res.status(400).json({
        success: false,
        message: "Business with this email already exists",
      });
    }

    console.log("🔐 Hashing password...");
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log("💾 Creating business document...");
    
    // Create business without login code - will be generated after admin approval
    const business = new Business({
      businessName,
      email,
      phone,
      businessType,
      password: hashedPassword,
      address,
      city,
      state,
      pincode,
      description,
      loginCode: null, // No login code until approved
      loginCodeExpiry: null,
    });

    // Generate email verification token
    const verificationToken = jwt.sign(
      { businessId: business._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );
    business.emailVerificationToken = verificationToken;

    console.log("💾 Saving business to MongoDB...");
    await business.save();
    console.log("✅ Business saved successfully with ID:", business._id);

    // Send registration confirmation email without login code
    const registrationEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EB662B;">Registration Received - Travel-Zone</h2>
        <p>Hello ${businessName},</p>
        <p>Thank you for registering your business with Travel-Zone. Your registration has been submitted successfully and is now under review.</p>
        
        <p><strong>Business Details:</strong></p>
        <ul>
          <li>Business Name: ${businessName}</li>
          <li>Business Type: ${businessType}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${phone}</li>
          <li>Location: ${city}, ${state}</li>
        </ul>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #EB662B; margin-top: 0;">What's Next?</h3>
          <p>📋 Our admin team will review your business registration</p>
          <p>✅ Once approved, you'll receive your login credentials via email</p>
          <p>🚀 You can then access your business dashboard and start managing your listings</p>
        </div>
        <p>We'll notify you via email once the review is complete. This usually takes 1-2 business days.</p>
        <p>Thank you for choosing Travel-Zone!</p>
      </div>
    `;

    console.log("📧 Sending registration confirmation email...");
    await sendEmail(email, "Business Registration Received - Under Review", registrationEmailHtml);

    console.log("✅ Registration completed successfully!");
    res.status(201).json({
      success: true,
      message: "Business registered successfully! Please check your email for verification.",
      business: {
        id: business._id,
        businessName: business.businessName,
        email: business.email,
        businessType: business.businessType,
      },
    });
  } catch (error) {
    console.error("❌ Business registration error:", error);
    console.error("Error details:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error occurred during registration",
    });
  }
};

// Check if email exists and is approved
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const business = await Business.findOne({ email });
    
    if (!business) {
      return res.json({
        success: true,
        exists: false,
        message: "Business not found. Please register first.",
      });
    }

    if (!business.isVerified) {
      return res.json({
        success: true,
        exists: true,
        approved: false,
        message: "Your business registration is still under review. Please wait for admin approval.",
      });
    }

    res.json({
      success: true,
      exists: true,
      approved: true,
      message: "Business found and approved. You can proceed to login.",
    });
  } catch (error) {
    console.error("Email check error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

// Send login code (use existing code from approval)
const sendLoginCode = async (req, res) => {
  try {
    console.log("🔑 Send login code request received");
    console.log("Request body:", req.body);
    
    const { email } = req.body;
    
    if (!email) {
      console.log("❌ No email provided in request");
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    
    console.log("📧 Looking for business with email:", email);
    const business = await Business.findOne({ email });
    if (!business) {
      console.log("❌ Business not found for email:", email);
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    console.log("✅ Business found:", business.businessName);
    console.log("📊 Business status - Verified:", business.isVerified, "Active:", business.isActive);

    if (!business.isVerified) {
      console.log("❌ Business not verified yet");
      return res.status(403).json({
        success: false,
        message: "Business not approved yet. Please wait for admin approval.",
      });
    }

    // Check if account is locked
    if (business.isLocked) {
      return res.status(423).json({
        success: false,
        message: "Account is temporarily locked due to multiple failed attempts. Please try again later.",
      });
    }

    // Generate a new random login code each time
    const loginCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (15 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 15);
    
    // Update business with new temporary code using findByIdAndUpdate to avoid validation
    await Business.findByIdAndUpdate(
      business._id,
      { 
        loginCode: loginCode,
        loginCodeExpiry: expiryTime
      },
      { runValidators: false }
    );
    
    console.log(`🔑 Generated new login code: ${loginCode} (expires at ${expiryTime.toLocaleTimeString()})`);

    // Send login code via email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EB662B;">Your Login Code - Travel-Zone Business</h2>
        <p>Hello ${business.businessName},</p>
        <p>Your temporary login code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f8f9fa; border: 2px solid #EB662B; padding: 20px; border-radius: 10px; display: inline-block;">
            <h1 style="color: #EB662B; margin: 0; font-size: 36px; letter-spacing: 5px;">${loginCode}</h1>
          </div>
        </div>
        <p><strong>This code expires in 15 minutes</strong> and can only be used once.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          For security reasons, never share this code with anyone. This code expires at ${expiryTime.toLocaleString()}.
        </p>
      </div>
    `;

    await sendEmail(email, "Your Permanent Login Code - Travel-Zone Business", emailHtml);

    res.json({
      success: true,
      message: "Login code sent to your email",
    });
  } catch (error) {
    console.error("Send login code error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

// Verify login code
const verifyLoginCode = async (req, res) => {
  try {
    const { email, loginCode } = req.body;

    console.log("🔍 Verifying login code for:", email, "Code:", loginCode);

    const business = await Business.findOne({ email });
    if (!business) {
      console.log("❌ Business not found for email:", email);
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    console.log("✅ Business found:", business.businessName);
    console.log("📊 Business status - Verified:", business.isVerified, "Active:", business.isActive);
    console.log("🔑 Business login code:", business.loginCode ? "EXISTS" : "NOT SET");

    // Check if business is approved
    if (!business.isVerified) {
      console.log("❌ Business not approved yet");
      return res.status(403).json({
        success: false,
        message: "Business not approved yet. Please wait for admin approval.",
      });
    }

    // Check if business has login code (should be set after approval)
    if (!business.loginCode) {
      console.log("❌ Business has no login code - this shouldn't happen for approved businesses");
      return res.status(400).json({
        success: false,
        message: "Login code not available. Please contact support.",
      });
    }

    // Check if account is locked
    if (business.isLocked) {
      console.log("❌ Account is locked");
      return res.status(423).json({
        success: false,
        message: "Account is temporarily locked due to multiple failed attempts. Please try again later.",
      });
    }

    // Verify login code
    console.log("🔍 Comparing codes - Provided:", loginCode, "Stored:", business.loginCode);
    if (!business.verifyLoginCode(loginCode)) {
      console.log("❌ Login code verification failed");
      await business.incLoginAttempts();
      return res.status(400).json({
        success: false,
        message: "Invalid or expired login code",
      });
    }

    console.log("✅ Login code verified successfully");

    // Only clear temporary login codes (ones with expiry)
    // Permanent codes (approved businesses) should be kept
    if (business.loginCodeExpiry) {
      console.log("🗑️ Clearing temporary login code");
      await Business.findByIdAndUpdate(
        business._id,
        { 
          $unset: { loginCode: 1, loginCodeExpiry: 1 }
        },
        { runValidators: false }
      );
      console.log(`✅ Temporary login code cleared for: ${business.email}`);
    } else {
      console.log("🔒 Keeping permanent login code for approved business");
    }

    res.json({
      success: true,
      message: "Login code verified successfully",
    });
  } catch (error) {
    console.error("Verify login code error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

// Business login with email + login code + password
const loginBusiness = async (req, res) => {
  try {
    const { email, loginCode, password } = req.body;

    console.log(`🔐 Business login attempt: ${email}`);

    const business = await Business.findOne({ email });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Check if account is locked
    if (business.isLocked) {
      return res.status(423).json({
        success: false,
        message: "Account is temporarily locked due to multiple failed attempts. Please try again later.",
      });
    }

    // Check if business is verified
    if (!business.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Business not approved yet. Please wait for admin approval.",
      });
    }

    // Verify login code (if provided)
    if (loginCode) {
      if (!business.verifyLoginCode(loginCode)) {
        await business.incLoginAttempts();
        return res.status(400).json({
          success: false,
          message: "Invalid or expired login code",
        });
      }
      console.log(`✅ Login code verified for: ${email}`);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, business.password);
    if (!isPasswordValid) {
      await business.incLoginAttempts();
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Reset login attempts on successful login
    if (business.loginAttempts > 0) {
      await business.resetLoginAttempts();
    }

    // Clear login code after successful login
    // Update last login time and clear login code if used
    const updateData = { lastLoginAt: new Date() };
    if (loginCode) {
      updateData.$unset = { loginCode: 1, loginCodeExpiry: 1 };
    }
    
    await Business.findByIdAndUpdate(
      business._id,
      updateData,
      { runValidators: false }
    );

    console.log(`✅ Business login successful: ${business.businessName}`);

    // Generate token
    const token = generateToken(business._id);

    // Set cookie
    res.cookie("businessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      business: {
        id: business._id,
        businessName: business.businessName,
        email: business.email,
        businessType: business.businessType,
        isVerified: business.isVerified,
        emailVerified: business.emailVerified,
      },
    });
  } catch (error) {
    console.error("Business login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

// Quick login with stored credentials (email + password only)
const quickLoginBusiness = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`⚡ Quick business login attempt: ${email}`);

    const business = await Business.findOne({ email });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Check if account is locked
    if (business.isLocked) {
      return res.status(423).json({
        success: false,
        message: "Account is temporarily locked due to multiple failed attempts. Please try again later.",
      });
    }

    // Check if business is verified
    if (!business.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Business not approved yet. Please wait for admin approval.",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, business.password);
    if (!isPasswordValid) {
      await business.incLoginAttempts();
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Reset login attempts on successful login
    if (business.loginAttempts > 0) {
      await business.resetLoginAttempts();
    }

    // Update last login time without validation
    await Business.findByIdAndUpdate(
      business._id,
      { lastLoginAt: new Date() },
      { runValidators: false }
    );

    console.log(`✅ Quick login successful: ${business.businessName}`);

    // Generate token
    const token = generateToken(business._id);

    // Set cookie
    res.cookie("businessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      success: true,
      message: "Quick login successful",
      token,
      business: {
        id: business._id,
        businessName: business.businessName,
        email: business.email,
        businessType: business.businessType,
        isVerified: business.isVerified,
        emailVerified: business.emailVerified,
      },
    });
  } catch (error) {
    console.error("Quick login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

// Get business profile
const getBusinessProfile = async (req, res) => {
  try {
    const business = await Business.findById(req.businessId).select("-password -loginCode -emailVerificationToken -resetPasswordToken");
    
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.json({
      success: true,
      business,
    });
  } catch (error) {
    console.error("Get business profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

// Check authentication
const checkAuth = async (req, res) => {
  try {
    const business = await Business.findById(req.businessId).select("businessName email businessType isVerified setupCompleted description phone website googleMapsLink location address city state pincode profileImage businessImages businessHours businessSpecific menu");
    
    if (!business) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.json({
      success: true,
      business,
    });
  } catch (error) {
    console.error("Check auth error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

// Business logout
const logoutBusiness = async (req, res) => {
  try {
    res.clearCookie("businessToken");
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Business logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

// Admin functions for business management
const getAllBusinessesForAdmin = async (req, res) => {
  try {
    const businesses = await Business.find({})
      .select("-password -loginCode -emailVerificationToken -resetPasswordToken")
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      businesses,
      count: businesses.length,
    });
  } catch (error) {
    console.error("Get all businesses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const updateBusinessStatus = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { isVerified, isActive } = req.body;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Update business status
    if (typeof isVerified !== 'undefined') {
      business.isVerified = isVerified;
    }
    if (typeof isActive !== 'undefined') {
      business.isActive = isActive;
    }

    await business.save();

    // Generate and send login code when business is approved for the first time
    if (isVerified && business.email && !business.loginCode) {
      console.log('🔑 Generating login code for newly approved business');
      // Generate permanent login code for approved business
      const loginCode = Math.floor(100000 + Math.random() * 900000).toString();
      business.loginCode = loginCode;
      business.loginCodeExpiry = null; // Permanent code
      await business.save();
      console.log('✅ Login code generated and saved:', loginCode);

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EB662B;">🎉 Business Approved - Travel-Zone</h2>
          <p>Hello ${business.businessName},</p>
          <p>Congratulations! Your business has been approved and is now live on Travel-Zone.</p>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #2d5a2d; margin-top: 0;">Your Login Credentials</h3>
            <p><strong>Email:</strong> ${business.email}</p>
            <p><strong>Permanent Login Code:</strong> <span style="font-size: 24px; font-weight: bold; color: #EB662B; background: white; padding: 8px 16px; border-radius: 4px; display: inline-block;">${business.loginCode}</span></p>
            <p style="color: #666; font-size: 14px;">This is your permanent login code - keep it safe!</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #EB662B; margin-top: 0;">How to Login:</h3>
            <ol>
              <li>Go to the business login page</li>
              <li>Enter your email address: <strong>${business.email}</strong></li>
              <li>Enter the login code: <strong>${business.loginCode}</strong></li>
              <li>Enter your password (the one you set during registration)</li>
            </ol>
          </div>

          <p><strong>What you can do now:</strong></p>
          <ul>
            <li>✅ Access your business dashboard</li>
            <li>📝 Manage your business listings</li>
            <li>📊 View booking statistics</li>
            <li>💰 Receive bookings from customers</li>
            <li>⚙️ Update your business information</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/business/login" style="background-color: #EB662B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Login to Dashboard
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            <strong>Important:</strong> This is your <strong>permanent login code</strong>. Keep it secure and use it for all future logins along with your password.
          </p>
          
          <p>Welcome to the Travel-Zone business community!</p>
        </div>
      `;

      await sendEmail(business.email, "🎉 Business Approved - Your Login Credentials", emailHtml);
    }

    res.json({
      success: true,
      message: `Business ${isVerified ? 'approved' : 'status updated'} successfully`,
      business: {
        id: business._id,
        businessName: business.businessName,
        email: business.email,
        businessType: business.businessType,
        isVerified: business.isVerified,
        isActive: business.isActive,
      },
    });
  } catch (error) {
    console.error("Update business status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const deleteBusinessForAdmin = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    await Business.findByIdAndDelete(businessId);

    res.json({
      success: true,
      message: "Business deleted successfully",
    });
  } catch (error) {
    console.error("Delete business error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

// Business setup
const setupBusiness = async (req, res) => {
  try {
    const { businessId, setupData } = req.body;

    console.log('🔧 Business setup request received');
    console.log('📋 Business ID:', businessId);
    console.log('📋 Setup data keys:', Object.keys(setupData));

    if (!businessId || !setupData) {
      return res.status(400).json({
        success: false,
        message: "Business ID and setup data are required",
      });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Prepare update data
    const updateData = {
      description: setupData.businessDescription,
      phone: setupData.contactPhone,
      website: setupData.website,
      googleMapsLink: setupData.googleMapsLink,
      upiId: setupData.upiId,
      address: setupData.location?.address,
      city: setupData.location?.city,
      state: setupData.location?.state,
      pincode: setupData.location?.pincode,
      profileImage: setupData.mainImage,
      businessImages: setupData.additionalImages,
      businessHours: setupData.operatingHours,
      businessSpecific: setupData.businessSpecific,
      menu: setupData.menu,
      setupCompleted: true,
    };

    // Only update location coordinates if they exist
    if (setupData.location?.longitude && setupData.location?.latitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [setupData.location.longitude, setupData.location.latitude]
      };
    }

    console.log('💾 Updating business with data:', {
      description: updateData.description,
      phone: updateData.phone,
      website: updateData.website,
      upiId: updateData.upiId,
      city: updateData.city,
      state: updateData.state,
      pincode: updateData.pincode,
      hasLocation: !!updateData.location,
      hasBusinessHours: !!updateData.businessHours,
      hasBusinessSpecific: !!updateData.businessSpecific,
      businessSpecific: updateData.businessSpecific
    });

    // Update business with setup data
    const updatedBusiness = await Business.findByIdAndUpdate(
      businessId,
      { $set: updateData },
      { new: true }
    );

    console.log('✅ Business updated successfully');
    console.log('📊 Updated fields:', {
      description: updatedBusiness.description,
      phone: updatedBusiness.phone,
      website: updatedBusiness.website,
      upiId: updatedBusiness.upiId,
      city: updatedBusiness.city,
      state: updatedBusiness.state,
      pincode: updatedBusiness.pincode,
      businessSpecific: updatedBusiness.businessSpecific
    });

    res.json({
      success: true,
      message: "Business setup completed successfully",
      business: updatedBusiness,
    });
  } catch (error) {
    console.error("❌ Business setup error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message
    });
  }
};

// Room management
const getRooms = async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const business = await Business.findById(businessId).select('rooms');
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.json({
      success: true,
      rooms: business.rooms || [],
    });
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const createRoom = async (req, res) => {
  try {
    const roomData = req.body;
    const businessId = req.businessId; // Get from middleware instead of request body

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const newRoom = {
      ...roomData,
      createdAt: new Date(),
    };

    // Use findByIdAndUpdate to avoid validation on entire document
    const updatedBusiness = await Business.findByIdAndUpdate(
      businessId,
      { $push: { rooms: newRoom } },
      { new: true, runValidators: false }
    );

    res.json({
      success: true,
      message: "Room created successfully",
      room: newRoom,
    });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const roomData = req.body;

    const business = await Business.findOne({ "rooms._id": roomId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const roomIndex = business.rooms.findIndex(room => room._id === roomId);
    if (roomIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Use findOneAndUpdate to avoid validation on entire document
    const updatedBusiness = await Business.findOneAndUpdate(
      { "rooms._id": roomId },
      { $set: { "rooms.$": { ...business.rooms[roomIndex]._doc, ...roomData } } },
      { new: true, runValidators: false }
    );

    const updatedRoom = updatedBusiness.rooms.find(room => room._id.toString() === roomId);
    
    res.json({
      success: true,
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.error("Update room error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { availability } = req.body;

    const business = await Business.findOne({ "rooms._id": roomId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const room = business.rooms.id(roomId);
    room.availability = availability;
    await business.save();

    res.json({
      success: true,
      message: "Room availability updated successfully",
      room
    });
  } catch (error) {
    console.error("Toggle room availability error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const business = await Business.findOne({ "rooms._id": roomId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    business.rooms = business.rooms.filter(room => room._id !== roomId);
    await business.save();

    res.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Delete room error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

// Table management functions
const getTables = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }
    res.json({
      success: true,
      tables: business.tables || [],
    });
  } catch (error) {
    console.error("Get tables error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const createTable = async (req, res) => {
  try {
    const tableData = req.body;
    const businessId = req.businessId; // Get from middleware
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const newTable = {
      ...tableData,
      createdAt: new Date(),
    };

    // Use findByIdAndUpdate to avoid validation on entire document
    const updatedBusiness = await Business.findByIdAndUpdate(
      businessId,
      { $push: { tables: newTable } },
      { new: true, runValidators: false }
    );

    res.json({
      success: true,
      message: "Table created successfully",
      table: newTable,
    });
  } catch (error) {
    console.error("Create table error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const updateTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const tableData = req.body;

    const business = await Business.findOne({ "tables._id": tableId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    const tableIndex = business.tables.findIndex(table => table._id === tableId);
    business.tables[tableIndex] = { ...business.tables[tableIndex], ...tableData };
    await business.save();

    res.json({
      success: true,
      message: "Table updated successfully",
      table: business.tables[tableIndex],
    });
  } catch (error) {
    console.error("Update table error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const deleteTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const business = await Business.findOne({ "tables._id": tableId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    business.tables = business.tables.filter(table => table._id !== tableId);
    await business.save();

    res.json({
      success: true,
      message: "Table deleted successfully",
    });
  } catch (error) {
    console.error("Delete table error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

// Menu item management functions
const getMenuItems = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }
    res.json({
      success: true,
      menuItems: business.menuItems || [],
    });
  } catch (error) {
    console.error("Get menu items error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const { businessId, ...menuItemData } = req.body;
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const newMenuItem = {
      ...menuItemData,
      createdAt: new Date(),
    };

    business.menuItems = business.menuItems || [];
    business.menuItems.push(newMenuItem);
    await business.save();

    res.json({
      success: true,
      message: "Menu item created successfully",
      menuItem: newMenuItem,
    });
  } catch (error) {
    console.error("Create menu item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const menuItemData = req.body;

    const business = await Business.findOne({ "menuItems._id": menuItemId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    const menuItemIndex = business.menuItems.findIndex(item => item._id === menuItemId);
    business.menuItems[menuItemIndex] = { ...business.menuItems[menuItemIndex], ...menuItemData };
    await business.save();

    res.json({
      success: true,
      message: "Menu item updated successfully",
      menuItem: business.menuItems[menuItemIndex],
    });
  } catch (error) {
    console.error("Update menu item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const business = await Business.findOne({ "menuItems._id": menuItemId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    business.menuItems = business.menuItems.filter(item => item._id !== menuItemId);
    await business.save();

    res.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("Delete menu item error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

// Product management functions
const getProducts = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }
    res.json({
      success: true,
      products: business.products || [],
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { businessId, ...productData } = req.body;
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const newProduct = {
      ...productData,
      createdAt: new Date(),
    };

    business.products = business.products || [];
    business.products.push(newProduct);
    await business.save();

    res.json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const productData = req.body;

    const business = await Business.findOne({ "products._id": productId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const productIndex = business.products.findIndex(product => product._id === productId);
    business.products[productIndex] = { ...business.products[productIndex], ...productData };
    await business.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      product: business.products[productIndex],
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const business = await Business.findOne({ "products._id": productId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    business.products = business.products.filter(product => product._id !== productId);
    await business.save();

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

// Category management functions
const getCategories = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }
    res.json({
      success: true,
      categories: business.categories || [],
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { businessId, ...categoryData } = req.body;
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const newCategory = {
      ...categoryData,
      createdAt: new Date(),
    };

    business.categories = business.categories || [];
    business.categories.push(newCategory);
    await business.save();

    res.json({
      success: true,
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const categoryData = req.body;

    const business = await Business.findOne({ "categories._id": categoryId });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const categoryIndex = business.categories.findIndex(category => category._id === categoryId);
    business.categories[categoryIndex] = { ...business.categories[categoryIndex], ...categoryData };
    await business.save();

    res.json({
      success: true,
      message: "Category updated successfully",
      category: business.categories[categoryIndex],
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const hotels = await Business.find({
      businessType: 'hotel',
      isVerified: true,
      isActive: true,
      setupCompleted: true,
      status: 'approved'
    }).select('-password -loginCode -__v');

    res.json({
      success: true,
      businesses: hotels,
      count: hotels.length
    });
  } catch (error) {
    console.error('Get all hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
};

// Get all approved hotels for travel component
const getAllHotels = async (req, res) => {
  try {
    const hotels = await Business.find({
      businessType: 'hotel',
      isVerified: true,
      isActive: true,
      setupCompleted: true,
      status: 'approved'
    }).select('-password -loginCode -__v');

    res.json({
      success: true,
      businesses: hotels,
      count: hotels.length
    });
  } catch (error) {
    console.error('Get all hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
};

// Get business statistics for admin
const getBusinessStats = async (req, res) => {
  try {
    const { businessId } = req.params;
    
    // Import Booking model
    const Booking = (await import('../models/booking.model.js')).default;
    
    // Get business details
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Get all bookings for this business
    const bookings = await Booking.find({ businessId })
      .populate('userId', 'username email phone')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalBookings = bookings.length;
    
    const totalRevenue = bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.amount || 0), 0);
    
    const pendingPayments = bookings
      .filter(b => b.paymentStatus === 'pending')
      .reduce((sum, b) => sum + (b.amount || 0), 0);
    
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'Booked').length;

    // Get recent bookings (last 10)
    const recentBookings = bookings.slice(0, 10).map(booking => ({
      customerName: booking.userId?.username || 'Unknown',
      date: booking.bookingDetails?.checkIn || booking.createdAt,
      amount: booking.amount || 0,
      status: booking.status
    }));

    res.json({
      success: true,
      stats: {
        totalBookings,
        totalRevenue,
        pendingPayments,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        recentBookings
      }
    });
  } catch (error) {
    console.error('Get business stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred',
      error: error.message
    });
  }
};

// Get business notifications
const getBusinessNotifications = async (req, res) => {
  try {
    const businessId = req.businessId;

    if (!businessId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Import Booking model
    const Booking = (await import("../models/booking.model.js")).default;

    // Fetch recent bookings for this business
    const recentBookings = await Booking.find({ businessId })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(50);

    // Transform bookings into notifications
    const notifications = recentBookings.map(booking => {
      let title = '';
      let message = '';
      let type = 'booking';

      if (booking.status === 'pending') {
        title = 'New Booking Received';
        message = `New booking from ${booking.userId?.username || 'Customer'}`;
        type = 'booking';
      } else if (booking.status === 'confirmed') {
        title = 'Booking Confirmed';
        message = `Booking confirmed for ${booking.userId?.username || 'Customer'}`;
        type = 'booking';
      } else if (booking.status === 'cancelled') {
        title = 'Booking Cancelled';
        message = `Booking cancelled by ${booking.userId?.username || 'Customer'}`;
        type = 'cancellation';
      }

      if (booking.paymentStatus === 'paid' && booking.status === 'pending') {
        title = 'Payment Received';
        message = `Payment received from ${booking.userId?.username || 'Customer'}`;
        type = 'payment';
      }

      return {
        _id: booking._id,
        type,
        title,
        message,
        bookingId: booking._id,
        details: {
          customerName: booking.userId?.username || 'Unknown',
          amount: booking.amount,
          roomType: booking.bookingDetails?.roomType,
          checkIn: booking.bookingDetails?.checkIn,
          checkOut: booking.bookingDetails?.checkOut,
        },
        createdAt: booking.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// Vehicle Management (for Cab businesses)
const getVehicles = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.status(200).json({
      success: true,
      vehicles: business.vehicles || [],
    });
  } catch (error) {
    console.error("Get vehicles error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message,
    });
  }
};

const createVehicle = async (req, res) => {
  try {
    const businessId = req.businessId;
    const vehicleData = req.body;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    if (!business.vehicles) {
      business.vehicles = [];
    }

    business.vehicles.push(vehicleData);
    await business.save();

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      vehicle: business.vehicles[business.vehicles.length - 1],
    });
  } catch (error) {
    console.error("Create vehicle error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message,
    });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const businessId = req.businessId;
    const vehicleData = req.body;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const vehicleIndex = business.vehicles.findIndex(
      (v) => v._id.toString() === vehicleId
    );

    if (vehicleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    business.vehicles[vehicleIndex] = {
      ...business.vehicles[vehicleIndex].toObject(),
      ...vehicleData,
      _id: business.vehicles[vehicleIndex]._id,
    };

    await business.save();

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle: business.vehicles[vehicleIndex],
    });
  } catch (error) {
    console.error("Update vehicle error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message,
    });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const businessId = req.businessId;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    business.vehicles = business.vehicles.filter(
      (v) => v._id.toString() !== vehicleId
    );

    await business.save();

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("Delete vehicle error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message,
    });
  }
};

export {
  registerBusiness,
  checkEmail,
  sendLoginCode,
  verifyLoginCode,
  loginBusiness,
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
  getAllHotels,
  getBusinessStats,
  getBusinessNotifications,
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
