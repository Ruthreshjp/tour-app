// backend/models/hotel.model.js
import mongoose from 'mongoose';
import { baseLocationSchema, addLocationIndex } from './schemas/baseSchema.js';
import { roomSchema } from './schemas/roomSchema.js';

const hotelSchema = new mongoose.Schema({
  ...baseLocationSchema,
  rooms: [roomSchema],
  amenities: [{
    type: String
  }],
  policies: {
    cancellation: {
      type: String,
      required: true
    }
  }
});

addLocationIndex(hotelSchema);
export default mongoose.model('Hotel', hotelSchema);