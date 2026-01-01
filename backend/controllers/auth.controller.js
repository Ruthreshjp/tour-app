// backend/controllers/auth.controller.js
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// Test controller
export const test = (req, res) => {
  return res.send("Hello From Test!");
};

// Signup controller
export const signupController = async (req, res) => {
  try {
    const { username, email, password, address, phone } = req.body;

    if (!username || !email || !password || !address || !phone) {
      return res.status(400).send({
        success: false,
        message: "All fields are required!",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).send({
        success: false,
        message: "User already exists please login",
      });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      address,
      phone,
      user_role: 0, // Default to user
    });

    await newUser.save();

    return res.status(201).send({
      message: "User Created Successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in server!",
    });
  }
};

// Login controller
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "All fields are required!",
      });
    }

    const validUser = await User.findOne({ email });
    if (!validUser) {
      return res.status(404).send({
        success: false,
        message: "User not found!",
      });
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return res.status(400).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: validUser._id, user_role: validUser.user_role },
      process.env.JWT_SECRET || "bfuiwrht7895t5uith",
      { expiresIn: "4d" }
    );
    const { password: pass, ...rest } = validUser._doc;
    
    // Set cookie with proper CORS settings
    // IMPORTANT: Use sameSite=none for cross-origin cookie transmission
    // (even in development when frontend is on different domain)
    const cookieOptions = {
      httpOnly: true,
      maxAge: 4 * 24 * 60 * 60 * 1000, // 4 days
      sameSite: "none", // Required for cross-origin cookies (Vercel frontend to Render backend)
    };
    
    console.log('🔑 Login: NODE_ENV =', process.env.NODE_ENV);
    
    if (process.env.NODE_ENV === "production") {
      cookieOptions.secure = true;
      console.log('🔑 Login: Setting production cookies - secure=true, sameSite=none');
    } else {
      // Even in development, use secure=true if we're behind a proxy (Render/Vercel)
      // Use secure=false only for true localhost development
      const isLocalhost = process.env.BACKEND_URL?.includes('localhost');
      cookieOptions.secure = !isLocalhost;
      console.log('🔑 Login: Setting cookies - secure=' + cookieOptions.secure + ', sameSite=none (cross-origin support)');
    }
    
    console.log('🔑 Login: Final cookie options:', cookieOptions);
    
    res
      .cookie("X_TTMS_access_token", token, cookieOptions)
      .status(200)
      .send({
        success: true,
        message: "Login Success",
        user: rest,
        token, // Include token in response
      });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send({
      success: false,
      message: "Error logging in",
    });
  }
};

// Logout controller
export const logOutController = (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      sameSite: "none", // Match the login cookie settings
    };
    
    if (process.env.NODE_ENV === "production") {
      cookieOptions.secure = true;
    } else {
      const isLocalhost = process.env.BACKEND_URL?.includes('localhost');
      cookieOptions.secure = !isLocalhost;
    }
    
    res
      .clearCookie("X_TTMS_access_token", cookieOptions)
      .status(200)
      .send({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).send({
      success: false,
      message: "Error logging out",
    });
  }
};