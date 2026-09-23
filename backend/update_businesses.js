import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tour-app";

async function updateBusinesses() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const result = await mongoose.connection.collection("businesses").updateMany(
      {},
      {
        $set: {
          setupCompleted: true,
          isVerified: true,
          isActive: true,
          status: "approved",
          loginCode: "123456"
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} business accounts with setupCompleted: true, isVerified: true, status: approved.`);
    process.exit(0);
  } catch (error) {
    console.error("Error updating businesses:", error);
    process.exit(1);
  }
}

updateBusinesses();
