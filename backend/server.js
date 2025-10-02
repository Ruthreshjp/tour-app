import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import packageRoute from "./routes/package.route.js";
import ratingRoute from "./routes/rating.route.js";
import bookingRoute from "./routes/booking.route.js";
import paymentRoutes from "./routes/payment.routes.js";
import businessRoute from "./routes/business.route.js";
import businessTypeRoute from "./routes/businessType.route.js";
import locationRoute from "./routes/location.route.js";
import businessBookingRoute from "./routes/businessBooking.route.js";
import businessViewRoute from "./routes/businessView.route.js";
import businessRatingRoute from "./routes/businessRating.route.js";
import businessInventoryRoute from "./routes/businessInventory.route.js";
import businessViewTrackingRoute from "./routes/businessViewTracking.route.js";
import geocodeRoute from "./routes/geocode.route.js";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { connectDB } from "./config/connectDB.js";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";
import { fileURLToPath } from 'url';

dotenv.config();

// ES module dirname configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Configure CORS with more permissive settings for development
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',  // Vite default
      'http://localhost:5174',  // Alternative Vite port
      'http://localhost:3000',  // Common React port
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cookie'
  ],
  exposedHeaders: ['Set-Cookie']
}));

// Security middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie'
  );
  next();
});

// Request parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images", express.static(path.join(__dirname, "uploads")));

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io instance available to the routes
app.set('io', io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A client connected");

  // Listen for business-dashboard updates
  socket.on("join-business-room", (businessId) => {
    socket.join(`business-${businessId}`);
    console.log(`Client joined business room: business-${businessId}`);
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

// Handle Firebase Storage URLs
app.get('/api/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).send('No image URL provided');
    }

    if (!imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
      return res.status(400).send('Invalid Firebase Storage URL');
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch image');
    }

    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    res.setHeader('Content-Type', contentType);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    response.body.pipe(res);
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).send('Error fetching image');
  }
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

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/package", packageRoute);
app.use("/api/rating", ratingRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/payment", paymentRoutes);
// Main business routes
app.use("/api/business", businessRoute);

// Business-related routes
app.use("/api/business-types", businessTypeRoute);
app.use("/api/locations", locationRoute);
app.use("/api/business/bookings", businessBookingRoute);
app.use("/api/business/views", businessViewRoute);
app.use("/api/business/ratings", businessRatingRoute);
app.use("/api/business/inventory", businessInventoryRoute);
app.use("/api/business/analytics", businessViewTrackingRoute);
app.use("/api/geocode", geocodeRoute);

// Test route
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message, err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// Production mode setup
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Welcome to travel and tourism app");
  });
}

// Start server
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected successfully");
    httpServer.listen(PORT, () => {
      console.log(`Server listening on port ${PORT} with Socket.IO support`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

startServer();