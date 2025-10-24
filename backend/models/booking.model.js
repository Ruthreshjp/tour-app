import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // Package booking fields (existing)
    packageDetails: {
      type: mongoose.ObjectId,
      ref: "Package",
    },
    buyer: {
      type: mongoose.ObjectId,
      ref: "User",
    },
    totalPrice: {
      type: Number,
    },
    persons: {
      type: Number,
    },
    date: {
      type: String,
    },
    
    // Business booking fields (new)
    businessId: {
      type: mongoose.ObjectId,
      ref: "Business",
    },
    userId: {
      type: mongoose.ObjectId,
      ref: "User",
    },
    businessType: {
      type: String,
      enum: ['hotel', 'restaurant', 'cafe', 'cab', 'shopping'],
    },
    bookingDetails: {
      type: mongoose.Schema.Types.Mixed, // Flexible object for different booking types
    },
    amount: {
      type: Number,
    },
    specialRequests: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'pending_verification', 'paid', 'failed'],
      default: 'pending',
    },
    paymentSubmittedAt: {
      type: Date,
    },
    paymentVerifiedAt: {
      type: Date,
    },
    transactionId: {
      type: String,
    },
    roomNumber: {
      type: String, // For hotel bookings
    },
    
    // Common status field
    status: {
      type: String,
      enum: ['pending', 'pending_approval', 'approved', 'pending_payment', 'confirmed', 'cancelled', 'Booked'], // Keep 'Booked' for backward compatibility
      default: "pending_approval", // Wait for business approval first
    },
    
    // Approval workflow fields
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.ObjectId,
      ref: "Business",
    },
    advanceAmount: {
      type: Number,
      default: 100, // Fixed advance amount
    },
    advancePaid: {
      type: Boolean,
      default: false,
    },
    advanceTransactionId: {
      type: String,
    },
    advancePaidAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
