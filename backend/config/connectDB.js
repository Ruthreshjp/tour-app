import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const MONGO_URI =
      process.env.MONGO_URI ||
      "mongodb+srv://Ruthresh:rhwKOIbwt76jBcYX@travelapp.6ejy1ox.mongodb.net/?appName=travelapp";
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};
