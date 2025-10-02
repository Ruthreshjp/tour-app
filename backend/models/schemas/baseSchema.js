// backend/models/schemas/baseSchema.js
import mongoose from 'mongoose';

// Base schema for location-based entities
export const baseLocationSchema = {
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  mainImage: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  ratings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating'
  }],
  avgRating: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
};

// Function to add location index to a schema
export const addLocationIndex = (schema) => {
  schema.index({ location: '2dsphere' });
};