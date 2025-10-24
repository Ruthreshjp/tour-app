import express from "express";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import packageRoute from "./routes/package.route.js";
import ratingRoute from "./routes/rating.route.js";
import bookingRoute from "./routes/booking.route.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import locationRoute from "./routes/location.route.js";
import geocodeRoute from "./routes/geocode.route.js";
import paymentRoutes from "./routes/payment.routes.js";
import imageRoutes from "./routes/imageRoutes.js";
import businessRoutes from "./routes/businessRoutes.js";
import packageBookingRoutes from "./routes/packageBooking.route.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { connectDB } from "./config/connectDB.js";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

dotenv.config();

// ES module dirname configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve client public images (override the uploads route for /images)
app.use("/images", express.static(path.join(__dirname, "../client/public/images")));

// Handle Firebase Storage URLs
app.get('/api/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).send('No image URL provided');
    }

    if (!imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
      // For local images, serve from uploads
      return res.redirect(`/images/${path.basename(imageUrl)}`);
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

// Nodemailer setup - make it optional to prevent server hanging
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify Nodemailer configuration (non-blocking)
    transporter.verify((error, success) => {
      if (error) {
        console.error('Nodemailer configuration error:', error);
        transporter = null; // Disable email if verification fails
      } else {
        console.log('Nodemailer is ready to send emails');
      }
    });
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    transporter = null;
  }
} else {
  console.log('Email configuration not found - email functionality disabled');
}

// Email sending endpoint
app.post("/api/send-email", async (req, res) => {
  try {
    const { user_name, user_email, message } = req.body;
    
    // Simulate email sending if no transporter configured
    if (!transporter) {
      console.log('📧 EMAIL SIMULATION - Contact Form Message:');
      console.log('From:', user_name, '(' + user_email + ')');
      console.log('Message:', message);
      console.log('='.repeat(50));
      return res.status(200).json({ 
        message: 'Message received successfully! (Email simulation - check server console)' 
      });
    }
    
    if (!user_name || !user_email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'travelzonnee@gmail.com',
      subject: `New Contact Form Message from ${user_name}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${user_name}</p>
        <p><strong>Email:</strong> ${user_email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Static file serving for uploads and images
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('uploads')); // Serve uploads directory as /images for compatibility

// API routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/package", packageRoute);
app.use("/api/rating", ratingRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/booking", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/location", locationRoute);
app.use("/api/geocode", geocodeRoute);
app.use("/api/images", imageRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/package-booking", packageBookingRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 Error handler
app.use((req, res, next) => {
  // Only log non-favicon 404s to reduce noise
  if (!req.url.includes('favicon')) {
    console.log(`404 - ${req.method} ${req.url}`);
  }
  
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
    error: 'Not Found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  // Only log actual errors, not 404s
  if (err.status !== 404) {
    console.error('Server Error:', err.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Production configuration
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

const PORT = process.env.PORT || 8000;

// Start server with DB connection
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
      console.log(`📧 Email system: SIMULATION MODE (check console for login codes)`);
      console.log(`🏢 Business registration and approval system: READY`);
      console.log(`👨‍💼 Admin panel: Available for business management`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();