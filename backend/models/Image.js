import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  data: {
    type: Buffer,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous uploads for business registration
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: false
  },
  category: {
    type: String,
    enum: [
      'main', 
      'additional', 
      'menu-card', 
      'menu-item',
      'room',           // For hotel rooms
      'table',          // For restaurant/cafe tables
      'vehicle',        // For cab vehicles
      'product',        // For shopping products
      'category'        // For shopping categories
    ],
    default: 'additional'
  },
  alt: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for faster queries
imageSchema.index({ businessId: 1, category: 1 });
imageSchema.index({ filename: 1 });

// Virtual for image URL
imageSchema.virtual('url').get(function() {
  return `/api/images/${this._id}`;
});

// Ensure virtual fields are serialized
imageSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.data; // Don't send binary data in JSON responses
    return ret;
  }
});

export default mongoose.model('Image', imageSchema);
