// backend/models/shopping.model.js
import mongoose from 'mongoose';
import { baseLocationSchema, addLocationIndex } from './schemas/baseSchema.js';
import { shoppingSchema as detailsSchema } from './schemas/shoppingSchema.js';

const shoppingSchema = new mongoose.Schema({
  ...baseLocationSchema,
  ...detailsSchema.obj,
  isViewOnly: {
    type: Boolean,
    default: true
  },
  facilities: [{
    type: String
  }],
  paymentMethods: [{
    type: String,
    required: true
  }],
  returns: {
    type: String,
    required: true
  }
});

addLocationIndex(shoppingSchema);
export default mongoose.model('Shopping', shoppingSchema);