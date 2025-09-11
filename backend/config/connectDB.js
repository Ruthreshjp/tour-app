import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/tour");
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("error to connect DB", error);
    process.exit(1);
  }
};
