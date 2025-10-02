import mongoose from 'mongoose';

export const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['single', 'double', 'suite', 'family']
  },
  bedType: {
    type: String,
    required: true,
    enum: ['single', 'double', 'triple', 'quad']
  },
  isAC: {
    type: Boolean,
    default: false
  },
  floor: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available'
  },
  pricing: {
    day: { type: Number, required: true, min: 0 },
    night: { type: Number, required: true, min: 0 },
    dayAndNight: { type: Number, required: true, min: 0 }
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  amenities: [{
    type: String
  }],
  maintenanceHistory: [{
    startDate: Date,
    endDate: Date,
    description: String,
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed']
    }
  }],
  lastCleaned: {
    type: Date,
    default: Date.now
  }
});