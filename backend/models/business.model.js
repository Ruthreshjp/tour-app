import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    businessType: {
      type: String,
      required: true,
      enum: ["hotel", "restaurant", "cafe", "cab", "shopping"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    loginCode: {
      type: String,
      default: null,
    },
    loginCodeExpiry: {
      type: Date,
      default: null,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpiry: {
      type: Date,
      default: null,
    },
    businessLicense: {
      type: String, // File path or URL
      default: null,
    },
    profileImage: {
      type: String, // File path or URL
      default: null,
    },
    businessImages: [{
      type: String, // Array of file paths or URLs
    }],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    businessHours: {
      monday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "09:00" },
        closeTime: { type: String, default: "18:00" },
      },
      tuesday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "09:00" },
        closeTime: { type: String, default: "18:00" },
      },
      wednesday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "09:00" },
        closeTime: { type: String, default: "18:00" },
      },
      thursday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "09:00" },
        closeTime: { type: String, default: "18:00" },
      },
      friday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "09:00" },
        closeTime: { type: String, default: "18:00" },
      },
      saturday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "09:00" },
        closeTime: { type: String, default: "18:00" },
      },
      sunday: {
        isOpen: { type: Boolean, default: false },
        openTime: { type: String, default: "09:00" },
        closeTime: { type: String, default: "18:00" },
      },
    },
    amenities: [{
      type: String,
    }],
    pricing: {
      type: mongoose.Schema.Types.Mixed, // Flexible pricing structure based on business type
      default: {},
    },
    menu: {
      type: mongoose.Schema.Types.Mixed, // For restaurants and cafes
      default: {},
    },
    setupCompleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // Auto-approve for now, can be changed to 'pending' later
    },
    // Rooms for hotels
    rooms: [{
      roomType: {
        type: String,
        enum: ['standard', 'deluxe', 'suite', 'premium', 'executive'],
        default: 'standard'
      },
      bedType: {
        type: String,
        enum: ['single', 'double', 'queen', 'king', 'twin'],
        default: 'single'
      },
      isAC: {
        type: Boolean,
        default: true
      },
      maxOccupancy: {
        type: Number,
        default: 2,
        min: 1,
        max: 10
      },
      roomSize: {
        type: String,
        default: ''
      },
      amenities: [{
        type: String
      }],
      images: [{
        type: String
      }],
      pricing: {
        dayRate: {
          type: Number,
          default: 0,
          min: 0
        },
        nightRate: {
          type: Number,
          default: 0,
          min: 0
        },
        weekendRate: {
          type: Number,
          default: 0,
          min: 0
        }
      },
      availability: {
        type: Boolean,
        default: true
      },
      description: {
        type: String,
        default: ''
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Tables for restaurants and cafes
    tables: [{
      tableType: {
        type: String,
        enum: ['regular', 'premium', 'vip', 'family', 'work-friendly', 'cozy', 'couple'],
        default: 'regular'
      },
      capacity: {
        type: Number,
        required: true,
        min: 1,
        max: 20
      },
      isAC: {
        type: Boolean,
        default: true
      },
      location: {
        type: String,
        enum: ['indoor', 'outdoor', 'terrace', 'garden'],
        default: 'indoor'
      },
      amenities: [{
        type: String
      }],
      pricing: {
        perPerson: {
          type: Number,
          default: 0,
          min: 0
        },
        tableCharge: {
          type: Number,
          default: 0,
          min: 0
        }
      },
      availability: {
        type: Boolean,
        default: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Products for shopping
    products: [{
      name: {
        type: String,
        required: true
      },
      category: {
        type: String,
        required: true
      },
      brand: {
        type: String,
        default: ''
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      discountPrice: {
        type: Number,
        default: 0,
        min: 0
      },
      stock: {
        type: Number,
        default: 0,
        min: 0
      },
      images: [{
        type: String
      }],
      description: {
        type: String,
        default: ''
      },
      features: [{
        type: String
      }],
      specifications: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      tags: [{
        type: String
      }],
      isAvailable: {
        type: Boolean,
        default: true
      },
      isFeatured: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Categories for shopping
    categories: [{
      name: {
        type: String,
        required: true
      },
      description: {
        type: String,
        default: ''
      },
      image: {
        type: String,
        default: ''
      },
      sortOrder: {
        type: Number,
        default: 0
      },
      isActive: {
        type: Boolean,
        default: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    lastLoginAt: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for location-based queries
businessSchema.index({ location: "2dsphere" });

// Create index for business type and city for faster queries
businessSchema.index({ businessType: 1, city: 1 });

// Email index is already created by unique: true property

// Virtual for checking if account is locked
businessSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to increment login attempts
businessSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
businessSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to generate login code
businessSchema.methods.generateLoginCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  this.loginCode = code;
  this.loginCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return code;
};

// Method to verify login code
businessSchema.methods.verifyLoginCode = function(code) {
  if (!this.loginCode) {
    return false;
  }
  
  // Check if code has expiry (temporary codes)
  if (this.loginCodeExpiry && this.loginCodeExpiry < new Date()) {
    return false; // Code expired
  }
  
  // For permanent codes (approved businesses), loginCodeExpiry is null
  // For temporary codes, check expiry
  return this.loginCode === code;
};

// Method to clear login code
businessSchema.methods.clearLoginCode = function() {
  this.loginCode = null;
  this.loginCodeExpiry = null;
};

const Business = mongoose.model("Business", businessSchema);

export default Business;
