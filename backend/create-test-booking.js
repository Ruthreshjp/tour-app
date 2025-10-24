import mongoose from 'mongoose';
import Booking from './models/booking.model.js';
import Business from './models/business.model.js';
import User from './models/user.model.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tour-app');

async function createTestBooking() {
  try {
    console.log("🎯 Creating test booking to verify booking system...");
    
    // Step 1: Find or create a test user
    console.log("\n1️⃣ Finding test user...");
    let testUser = await User.findOne({ email: 'testuser@example.com' });
    
    if (!testUser) {
      console.log("   Creating test user...");
      testUser = new User({
        username: 'Test User',
        email: 'testuser@example.com',
        password: '$2a$12$dummyhashedpassword', // dummy hash
        phone: '9876543210',
        address: 'Test Address'
      });
      await testUser.save();
      console.log("   ✅ Test user created:", testUser.email);
    } else {
      console.log("   ✅ Test user found:", testUser.email);
    }
    
    // Step 2: Find an approved business (hotel)
    console.log("\n2️⃣ Finding approved hotel business...");
    const hotel = await Business.findOne({ 
      businessType: 'hotel',
      isVerified: true,
      isActive: true 
    });
    
    if (!hotel) {
      console.log("   ❌ No approved hotel found. Please create a hotel business first.");
      return;
    }
    
    console.log("   ✅ Hotel found:", hotel.businessName);
    console.log("   📍 Hotel ID:", hotel._id);
    
    // Step 3: Create test booking
    console.log("\n3️⃣ Creating test booking...");
    
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 1); // Tomorrow
    
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 3); // Day after tomorrow
    
    const testBooking = new Booking({
      businessId: hotel._id,
      userId: testUser._id,
      businessType: 'hotel',
      bookingDetails: {
        roomType: 'deluxe',
        checkIn: checkInDate.toISOString().split('T')[0],
        checkOut: checkOutDate.toISOString().split('T')[0],
        guests: 2
      },
      amount: 2500,
      specialRequests: 'Late check-in preferred, non-smoking room',
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date()
    });
    
    await testBooking.save();
    
    console.log("   ✅ Test booking created successfully!");
    console.log("   📋 Booking ID:", testBooking._id);
    console.log("   🏨 Hotel:", hotel.businessName);
    console.log("   👤 Customer:", testUser.username);
    console.log("   📅 Check-in:", testBooking.bookingDetails.checkIn);
    console.log("   📅 Check-out:", testBooking.bookingDetails.checkOut);
    console.log("   💰 Amount:", testBooking.amount);
    console.log("   📝 Status:", testBooking.status);
    
    // Step 4: Create another booking with payment completed
    console.log("\n4️⃣ Creating second booking with payment...");
    
    const paidBooking = new Booking({
      businessId: hotel._id,
      userId: testUser._id,
      businessType: 'hotel',
      bookingDetails: {
        roomType: 'suite',
        checkIn: checkInDate.toISOString().split('T')[0],
        checkOut: checkOutDate.toISOString().split('T')[0],
        guests: 4
      },
      amount: 4500,
      specialRequests: 'Airport pickup required',
      status: 'pending',
      paymentStatus: 'paid',
      transactionId: 'TXN' + Date.now(),
      createdAt: new Date()
    });
    
    await paidBooking.save();
    
    console.log("   ✅ Paid booking created successfully!");
    console.log("   📋 Booking ID:", paidBooking._id);
    console.log("   💳 Transaction ID:", paidBooking.transactionId);
    console.log("   💰 Amount:", paidBooking.amount);
    console.log("   💸 Payment Status:", paidBooking.paymentStatus);
    
    // Step 5: Verify bookings can be fetched
    console.log("\n5️⃣ Verifying booking retrieval...");
    
    const businessBookings = await Booking.find({ businessId: hotel._id })
      .populate('userId', 'username email phone')
      .sort({ createdAt: -1 });
    
    console.log(`   ✅ Found ${businessBookings.length} bookings for this business`);
    
    businessBookings.forEach((booking, index) => {
      console.log(`   📋 Booking ${index + 1}:`);
      console.log(`      - Customer: ${booking.userId.username} (${booking.userId.email})`);
      console.log(`      - Room: ${booking.bookingDetails.roomType}`);
      console.log(`      - Amount: ₹${booking.amount}`);
      console.log(`      - Status: ${booking.status}`);
      console.log(`      - Payment: ${booking.paymentStatus}`);
    });
    
    console.log("\n🎉 Test bookings created successfully!");
    console.log("📱 Business owners can now see these bookings in their dashboard");
    console.log("🔗 Access bookings at: /business/bookings");
    
  } catch (error) {
    console.error("❌ Error creating test booking:", error);
  } finally {
    mongoose.connection.close();
  }
}

createTestBooking();
