import mongoose from "mongoose";

const viewTrackingSchema = new mongoose.Schema(
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
    userName: {
      type: String,
      required: true,
      trim: true
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      enum: ['search', 'nearby', 'category', 'direct'],
      default: 'direct'
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
viewTrackingSchema.index({ businessId: 1, viewedAt: -1 });
viewTrackingSchema.index({ userId: 1, businessId: 1 });

const ViewTracking = mongoose.model("ViewTracking", viewTrackingSchema);

export default ViewTracking;
