import mongoose from 'mongoose';

export const cabSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['sedan', 'suv', 'luxury', 'van', 'mini']
  },
  model: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['available', 'on-trip', 'maintenance', 'reserved'],
    default: 'available'
  },
  features: [{
    type: String
  }],
  driverDetails: {
    name: String,
    licenseNumber: String,
    phone: String,
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    }
  },
  pricing: {
    basePrice: { type: Number, required: true, min: 0 },
    perKmPrice: { type: Number, required: true, min: 0 },
    waitingChargePerHour: { type: Number, required: true, min: 0 }
  },
  currentBooking: {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessBooking'
    },
    startTime: Date,
    endTime: Date,
    pickupLocation: String,
    dropLocation: String
  },
  maintenanceHistory: [{
    date: Date,
    description: String,
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed']
    },
    cost: Number
  }],
  lastService: {
    date: Date,
    mileage: Number
  }
});