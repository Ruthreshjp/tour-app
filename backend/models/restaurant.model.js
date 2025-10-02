// backend/models/restaurant.model.js
import mongoose from 'mongoose';
import { baseLocationSchema, addLocationIndex } from './schemas/baseSchema.js';
import { tableSchema } from './schemas/tableSchema.js';

const restaurantSchema = new mongoose.Schema({
  ...baseLocationSchema,
  cuisine: [{
    type: String,
    required: true
  }],
  tables: [tableSchema],
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
      description: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      isAvailable: {
        type: Boolean,
        default: true
      }
    }]
  }],
  features: [{
    type: String
  }],
  dineInOnly: {
    type: Boolean,
    default: false
  }
});

addLocationIndex(restaurantSchema);
export default mongoose.model('Restaurant', restaurantSchema);