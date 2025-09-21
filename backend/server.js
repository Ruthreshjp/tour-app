import express from "express";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import packageRoute from "./routes/package.route.js";
import ratingRoute from "./routes/rating.route.js";
import bookingRoute from "./routes/booking.route.js";
import paymentRoutes from "./routes/payment.routes.js";
import businessRoute from "./routes/business.route.js";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { connectDB } from "./config/connectDB.js";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();

const __dirname = path.resolve();

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/images", express.static("uploads"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message, err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify Nodemailer configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Nodemailer configuration error:', error.message, error.stack);
  } else {
    console.log('Nodemailer is ready to send emails');
  }
});

// Email sending endpoint
app.post("/api/send-email", async (req, res) => {
  console.log('Received email request:', req.body);
  const { user_name, user_email, message } = req.body;

  // Validate input
  if (!user_name || !user_email || !message) {
    console.error('Validation error: Missing required fields', { user_name, user_email, message });
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user_email)) {
    console.error('Validation error: Invalid email format', { user_email });
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'travelzonnee@gmail.com',
    subject: `New Contact Form Message from ${user_name}`,
    text: `Name: ${user_name}\nEmail: ${user_email}\nMessage: ${message}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${user_name}</p>
      <p><strong>Email:</strong> ${user_email}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to travelzonnee@gmail.com', { user_name, user_email });
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error.message, error.stack);
    res.status(500).json({ error: `Failed to send email: ${error.message}` });
  }
});

// Routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/package", packageRoute);
app.use("/api/rating", ratingRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/business", businessRoute);
app.use("/payment", paymentRoutes);

// Test route
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ message: 'Server is running' });
});

// Production mode
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
  });
} else {
  app.use("/", (req, res) => {
    res.send("Welcome to travel and tourism app");
  });
}

// Start server
const PORT = process.env.PORT || 8000;
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

startServer();