// backend/models/schemas/shoppingSchema.js
import mongoose from 'mongoose';

export const shoppingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['mall', 'market', 'boutique', 'supermarket', 'specialty']
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  features: [{
    type: String
  }],
  shopCategories: [{
    type: String
  }],
  amenities: [{
    type: String
  }],
  paymentMethods: [{
    type: String,
    enum: ['cash', 'credit-card', 'debit-card', 'upi', 'digital-wallet']
  }]
});