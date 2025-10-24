import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      trim: true,
      maxlength: 500
    },
    isVerified: {
      type: Boolean,
      default: true // All ratings from completed bookings are verified
    },
    businessType: {
      type: String,
      enum: ['hotel', 'restaurant', 'cafe', 'cab', 'shopping'],
      default: null
    },
    source: {
      type: String,
      enum: ['booking', 'direct'],
      default: 'booking'
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
ratingSchema.index({ businessId: 1, createdAt: -1 });
ratingSchema.index({ userId: 1, businessId: 1 });

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;
