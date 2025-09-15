import express from "express";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import packageRoute from "./routes/package.route.js";
import ratingRoute from "./routes/rating.route.js";
import bookingRoute from "./routes/booking.route.js";
import paymentRoutes from "./routes/payment.routes.js";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { connectDB } from "./config/connectDB.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

const __dirname = path.resolve();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your frontend URL
    credentials: true, // Allow cookies to be sent and received
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this for form data
app.use(cookieParser());
app.use("/images", express.static("uploads"));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/package", packageRoute);
app.use("/api/rating", ratingRoute);
app.use("/api/booking", bookingRoute);
app.use("/payment", paymentRoutes);

// Production mode (serve static files from client build)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
  });
} else {
  // Development mode - welcome message
  app.use("/", (req, res) => {
    res.send("Welcome to travel and tourism app");
  });
}

// Start server only after DB connection
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB(); // Wait for DB connection
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1); // Exit if DB connection fails
  }
};

startServer();