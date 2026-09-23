import mongoose from "mongoose";
import dns from "dns";

// Fix for querySrv ETIMEOUT issues with MongoDB Atlas
// This sets the DNS servers to Google's public DNS
if (typeof dns.setServers === 'function') {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

export const connectDB = async () => {
  try {
    const MONGO_URI =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      "mongodb+srv://Ruthresh:rhwKOIbwt76jBcYX@travelapp.6ejy1ox.mongodb.net/?appName=travelapp";
    
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    if (error.code === 'ETIMEOUT') {
      console.error("DNS Resolution Error: Failed to resolve MongoDB SRV record. Check your internet connection or use a different DNS server.");
    }
    process.exit(1);
  }
};
