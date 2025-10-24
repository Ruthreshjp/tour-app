import mongoose from 'mongoose';
import Booking from './models/booking.model.js';
import Business from './models/business.model.js';
import User from './models/user.model.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tour-app');

async function createSimpleBooking() {
  try {
    console.log("🎯 Creating a simple test booking...");
    
    // Find any hotel business
    const hotel = await Business.findOne({ businessType: 'hotel' });
    if (!hotel) {
      console.log("❌ No hotel found. Please create a hotel business first.");
      return;
    }
    
    console.log("✅ Found hotel:", hotel.businessName);
    
    // Find or create a simple user
    let user = await User.findOne();
    if (!user) {
      user = new User({
        username: 'Test Customer',
        email: 'customer@test.com',
        password: 'hashedpassword',
        phone: '9876543210'
      });
      await user.save();
      console.log("✅ Created test user");
    } else {
      console.log("✅ Found user:", user.username);
    }
    
    // Create simple booking
    const booking = new Booking({
      businessId: hotel._id,
      userId: user._id,
      businessType: 'hotel',
      bookingDetails: {
        roomType: 'deluxe',
        checkIn: '2024-10-06',
        checkOut: '2024-10-08',
        guests: 2
      },
      amount: 3000,
      specialRequests: 'Test booking for demonstration',
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    await booking.save();
    
    console.log("🎉 Test booking created successfully!");
    console.log("📋 Booking ID:", booking._id);
    console.log("🏨 Hotel:", hotel.businessName);
    console.log("👤 Customer:", user.username);
    
    // Verify it can be retrieved
    const retrieved = await Booking.findById(booking._id)
      .populate('userId', 'username email phone')
      .populate('businessId', 'businessName');
    
    console.log("\n✅ Booking retrieval test:");
    console.log("   Business:", retrieved.businessId.businessName);
    console.log("   Customer:", retrieved.userId.username);
    console.log("   Status:", retrieved.status);
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

createSimpleBooking();
