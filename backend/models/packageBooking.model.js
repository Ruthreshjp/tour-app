import mongoose from "mongoose";

const packageBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    travelDate: {
      type: Date,
      required: true,
    },
    numberOfPeople: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentAmountType: {
      type: String,
      enum: ["advance", "full"],
      default: "full",
    },
    transactionId: {
      type: String,
      default: null,
    },
    paymentReceived: {
      type: Boolean,
      default: false,
    },
    paymentReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    paymentReviewedAt: {
      type: Date,
      default: null,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    specialRequests: {
      type: String,
      default: "",
    },
    contactName: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const PackageBooking = mongoose.model("PackageBooking", packageBookingSchema);

export default PackageBooking;
