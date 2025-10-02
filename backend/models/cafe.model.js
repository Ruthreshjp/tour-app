// backend/models/cafe.model.js
import mongoose from 'mongoose';
import { baseLocationSchema, addLocationIndex } from './schemas/baseSchema.js';
import { cafeSchema as detailsSchema } from './schemas/cafeSchema.js';

const cafeSchema = new mongoose.Schema({
  ...baseLocationSchema,
  ...detailsSchema.obj,
  isViewOnly: {
    type: Boolean,
    default: true
  },
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
  seating: {
    indoor: {
      type: Number,
      required: true,
      min: 0
    },
    outdoor: {
      type: Number,
      default: 0
    }
  },
  features: [{
    type: String
  }],
  specialties: [{
    type: String
  }]
});

addLocationIndex(cafeSchema);
export default mongoose.model('Cafe', cafeSchema);