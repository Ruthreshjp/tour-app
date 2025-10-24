import mongoose from 'mongoose';
import Booking from './models/booking.model.js';
import Business from './models/business.model.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tour-app');

async function checkBookings() {
  try {
    console.log("🔍 Checking bookings in database...");
    
    // Check total bookings
    const totalBookings = await Booking.countDocuments();
    console.log(`📊 Total bookings in database: ${totalBookings}`);
    
    if (totalBookings === 0) {
      console.log("📝 No bookings found. This explains why the business booking page is empty.");
      
      // Check if there are any businesses
      const totalBusinesses = await Business.countDocuments({ businessType: 'hotel' });
      console.log(`🏨 Total hotels in database: ${totalBusinesses}`);
      
      if (totalBusinesses > 0) {
        console.log("\n💡 Solution: Create test bookings to see them in the business dashboard");
        console.log("   You can:");
        console.log("   1. Use the hotel booking form in the frontend");
        console.log("   2. Run the create-test-booking.js script");
        console.log("   3. Manually create bookings via API");
      }
    } else {
      console.log("\n📋 Existing bookings:");
      
      const bookings = await Booking.find()
        .populate('userId', 'username email')
        .populate('businessId', 'businessName')
        .sort({ createdAt: -1 });
      
      bookings.forEach((booking, index) => {
        console.log(`\n${index + 1}. Booking ID: ${booking._id}`);
        console.log(`   Business: ${booking.businessId?.businessName || 'Unknown'}`);
        console.log(`   Customer: ${booking.userId?.username || 'Unknown'} (${booking.userId?.email || 'Unknown'})`);
        console.log(`   Type: ${booking.businessType}`);
        console.log(`   Amount: ₹${booking.amount}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Payment: ${booking.paymentStatus}`);
        console.log(`   Created: ${booking.createdAt}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Error checking bookings:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkBookings();
