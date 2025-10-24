import mongoose from 'mongoose';
import Business from './models/business.model.js';
import Booking from './models/booking.model.js';
import User from './models/user.model.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tour-app');

async function testBookingAPI() {
  try {
    console.log("🧪 Testing booking API components...");
    
    // Test 1: Check if businesses exist
    console.log("\n1️⃣ Checking businesses...");
    const businesses = await Business.find({ businessType: 'hotel' }).limit(3);
    console.log(`   Found ${businesses.length} hotels`);
    
    businesses.forEach((business, index) => {
      console.log(`   ${index + 1}. ${business.businessName} (ID: ${business._id})`);
      console.log(`      Status: ${business.isVerified ? 'Verified' : 'Not Verified'}, ${business.isActive ? 'Active' : 'Inactive'}`);
      console.log(`      Location: ${business.city || 'No city'}, ${business.state || 'No state'}`);
    });
    
    // Test 2: Check if users exist
    console.log("\n2️⃣ Checking users...");
    const users = await User.find().limit(3);
    console.log(`   Found ${users.length} users`);
    
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (${user.email})`);
    });
    
    // Test 3: Check existing bookings
    console.log("\n3️⃣ Checking existing bookings...");
    const bookings = await Booking.find()
      .populate('businessId', 'businessName')
      .populate('userId', 'username email')
      .limit(5);
    
    console.log(`   Found ${bookings.length} existing bookings`);
    
    if (bookings.length === 0) {
      console.log("   📝 No bookings found. Creating a test booking...");
      
      if (businesses.length > 0 && users.length > 0) {
        const testBooking = new Booking({
          businessId: businesses[0]._id,
          userId: users[0]._id,
          businessType: 'hotel',
          bookingDetails: {
            roomType: 'deluxe',
            checkIn: '2024-10-06',
            checkOut: '2024-10-08',
            guests: 2
          },
          amount: 3000,
          specialRequests: 'Test booking for API verification',
          status: 'pending',
          paymentStatus: 'pending'
        });
        
        await testBooking.save();
        console.log("   ✅ Test booking created successfully!");
        console.log(`   📋 Booking ID: ${testBooking._id}`);
      } else {
        console.log("   ❌ Cannot create test booking - missing business or user");
      }
    } else {
      bookings.forEach((booking, index) => {
        console.log(`   ${index + 1}. Booking ${booking._id}`);
        console.log(`      Business: ${booking.businessId?.businessName || 'Unknown'}`);
        console.log(`      Customer: ${booking.userId?.username || 'Unknown'}`);
        console.log(`      Status: ${booking.status} / Payment: ${booking.paymentStatus}`);
      });
    }
    
    // Test 4: Test business query for bookings
    console.log("\n4️⃣ Testing business booking query...");
    if (businesses.length > 0) {
      const businessId = businesses[0]._id;
      const businessBookings = await Booking.find({ businessId })
        .populate('userId', 'username email phone')
        .sort({ createdAt: -1 });
      
      console.log(`   Business: ${businesses[0].businessName}`);
      console.log(`   Bookings for this business: ${businessBookings.length}`);
      
      if (businessBookings.length === 0) {
        console.log("   📝 No bookings for this business. This explains the empty booking manager.");
      } else {
        businessBookings.forEach((booking, index) => {
          console.log(`   ${index + 1}. ${booking.userId?.username} - ₹${booking.amount} - ${booking.status}`);
        });
      }
    }
    
    console.log("\n🎯 API Test Summary:");
    console.log(`   - Hotels: ${businesses.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Total Bookings: ${bookings.length}`);
    console.log(`   - Business Bookings: ${businesses.length > 0 ? await Booking.countDocuments({ businessId: businesses[0]._id }) : 0}`);
    
  } catch (error) {
    console.error("❌ Test error:", error);
  } finally {
    mongoose.connection.close();
  }
}

testBookingAPI();
