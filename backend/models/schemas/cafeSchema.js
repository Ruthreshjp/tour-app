// backend/models/schemas/cafeSchema.js
import mongoose from 'mongoose';

export const cafeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  cuisine: [{
    type: String
  }],
  specialities: [{
    type: String
  }],
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  atmosphere: [{
    type: String,
    enum: ['cozy', 'modern', 'vintage', 'outdoor', 'rooftop', 'garden']
  }],
  amenities: [{
    type: String
  }],
  menu: [{
    category: {
      type: String,
      required: true
    },
    items: [{
      name: {
        type: String,
        required: true
      },
      description: String,
      price: {
        type: Number,
        required: true
      },
      isAvailable: {
        type: Boolean,
        default: true
      }
    }]
  }]
});