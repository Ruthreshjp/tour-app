import mongoose from 'mongoose';

export const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true,
    enum: ['indoor', 'outdoor', 'rooftop', 'private']
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  isVIP: {
    type: Boolean,
    default: false
  },
  features: [{
    type: String
  }],
  currentBooking: {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessBooking'
    },
    startTime: Date,
    endTime: Date
  },
  maintenanceHistory: [{
    date: Date,
    description: String,
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed']
    }
  }]
});