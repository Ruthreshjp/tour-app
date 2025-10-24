import mongoose from 'mongoose';
import Booking from './models/booking.model.js';
import Business from './models/business.model.js';
import User from './models/user.model.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tour-app');

async function addTestBooking() {
  try {
    console.log("🎯 Adding test booking for business dashboard...");
    
    // Find any hotel business
    const hotel = await Business.findOne({ 
      businessType: 'hotel',
      isVerified: true,
      isActive: true 
    });
    
    if (!hotel) {
      console.log("❌ No active hotel found. Please create and approve a hotel first.");
      return;
    }
    
    console.log("✅ Found hotel:", hotel.businessName, "ID:", hotel._id);
    
    // Find or create a test user
    let user = await User.findOne({ email: 'testcustomer@example.com' });
    
    if (!user) {
      user = new User({
        username: 'Test Customer',
        email: 'testcustomer@example.com',
        password: '$2a$12$dummyhashedpassword',
        phone: '9876543210',
        address: 'Test Address, Test City'
      });
      await user.save();
      console.log("✅ Created test user:", user.username);
    } else {
      console.log("✅ Found test user:", user.username);
    }
    
    // Create test booking
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);
    
    const testBooking = new Booking({
      businessId: hotel._id,
      userId: user._id,
      businessType: 'hotel',
      bookingDetails: {
        roomType: 'deluxe',
        checkIn: tomorrow.toISOString().split('T')[0],
        checkOut: dayAfterTomorrow.toISOString().split('T')[0],
        guests: 2
      },
      amount: 4500, // 1500 per day × 3 days
      specialRequests: 'Non-smoking room preferred. Late check-in around 8 PM.',
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date()
    });
    
    await testBooking.save();
    
    console.log("🎉 Test booking created successfully!");
    console.log("📋 Details:");
    console.log("   Booking ID:", testBooking._id);
    console.log("   Hotel:", hotel.businessName);
    console.log("   Customer:", user.username, "(" + user.email + ")");
    console.log("   Check-in:", testBooking.bookingDetails.checkIn);
    console.log("   Check-out:", testBooking.bookingDetails.checkOut);
    console.log("   Room Type:", testBooking.bookingDetails.roomType);
    console.log("   Guests:", testBooking.bookingDetails.guests);
    console.log("   Amount: ₹" + testBooking.amount);
    console.log("   Status:", testBooking.status);
    console.log("   Payment:", testBooking.paymentStatus);
    
    // Create another booking with payment completed
    const paidBooking = new Booking({
      businessId: hotel._id,
      userId: user._id,
      businessType: 'hotel',
      bookingDetails: {
        roomType: 'suite',
        checkIn: tomorrow.toISOString().split('T')[0],
        checkOut: dayAfterTomorrow.toISOString().split('T')[0],
        guests: 4
      },
      amount: 7500, // 2500 per day × 3 days
      specialRequests: 'Airport pickup required. Anniversary celebration.',
      status: 'pending',
      paymentStatus: 'paid',
      transactionId: 'UPI' + Date.now(),
      createdAt: new Date()
    });
    
    await paidBooking.save();
    
    console.log("\n💳 Paid booking created:");
    console.log("   Booking ID:", paidBooking._id);
    console.log("   Room Type:", paidBooking.bookingDetails.roomType);
    console.log("   Amount: ₹" + paidBooking.amount);
    console.log("   Payment Status:", paidBooking.paymentStatus);
    console.log("   Transaction ID:", paidBooking.transactionId);
    
    console.log("\n🎯 Summary:");
    console.log("   ✅ 2 test bookings created for", hotel.businessName);
    console.log("   📱 Business can now see these in their booking dashboard");
    console.log("   🔗 Access at: /business/bookings");
    
  } catch (error) {
    console.error("❌ Error creating test booking:", error);
  } finally {
    mongoose.connection.close();
  }
}

addTestBooking();
