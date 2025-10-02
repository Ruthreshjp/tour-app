// backend/models/cab.model.js
import mongoose from 'mongoose';
import { baseLocationSchema } from './schemas/baseSchema.js';
import { cabSchema as vehicleSchema } from './schemas/cabSchema.js';

const cabSchema = new mongoose.Schema({
  ...baseLocationSchema,
  vehicles: [vehicleSchema],
  serviceAreas: [{
    type: String,
    required: true
  }],
  features: [{
    type: String
  }]
});

// No location index for cabs since they're mobile
export default mongoose.model('Cab', cabSchema);