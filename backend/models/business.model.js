// backend/models/business.model.js
import mongoose from "mongoose";

const businessSchema = new mongoose.Schema({
  organization_name: {
    type: String,
    required: [true, "Organization name is required"],
    trim: true,
    minlength: [2, "Organization name must be at least 2 characters long"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    match: [/^[0-9+\-\s()]+$/, "Please enter a valid phone number"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
    minlength: [5, "Address must be at least 5 characters long"],
  },
  business_type: {
    type: String,
    required: [true, "Business type is required"],
    enum: {
      values: ["hotel", "restaurant", "shopping", "cab", "cafe"],
      message: "{VALUE} is not a supported business type",
    },
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    minlength: [10, "Description must be at least 10 characters long"],
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  loginCode: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Business", businessSchema);