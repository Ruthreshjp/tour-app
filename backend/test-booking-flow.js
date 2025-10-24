import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './models/booking.model.js';
import Business from './models/business.model.js';

dotenv.config();

const testBookingFlow = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all bookings
    const allBookings = await Booking.find({})
      .populate('userId', 'username email')
      .populate('businessId', 'businessName businessType')
      .sort({ createdAt: -1 });

    console.log('\n📋 ALL BOOKINGS IN DATABASE:');
    console.log('Total bookings:', allBookings.length);
    console.log('='.repeat(80));

    allBookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. Booking ID: ${booking._id}`);
      console.log(`   Business: ${booking.businessId?.businessName || 'N/A'} (ID: ${booking.businessId?._id || booking.businessId})`);
      console.log(`   User: ${booking.userId?.username || 'N/A'} (${booking.userId?.email || 'N/A'})`);
      console.log(`   Type: ${booking.businessType || 'N/A'}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Payment: ${booking.paymentStatus}`);
      console.log(`   Amount: ₹${booking.amount || 0}`);
      console.log(`   Created: ${booking.createdAt}`);
      
      if (booking.bookingDetails) {
        console.log(`   Details:`, JSON.stringify(booking.bookingDetails, null, 2));
      }
    });

    // Find all businesses
    console.log('\n\n🏢 ALL BUSINESSES IN DATABASE:');
    const allBusinesses = await Business.find({})
      .select('businessName businessType email _id')
      .sort({ createdAt: -1 });
    
    console.log('Total businesses:', allBusinesses.length);
    console.log('='.repeat(80));

    allBusinesses.forEach((business, index) => {
      console.log(`${index + 1}. ${business.businessName} (${business.businessType})`);
      console.log(`   ID: ${business._id}`);
      console.log(`   Email: ${business.email}`);
      
      // Count bookings for this business
      const businessBookings = allBookings.filter(b => 
        b.businessId && b.businessId._id && b.businessId._id.toString() === business._id.toString()
      );
      console.log(`   Bookings: ${businessBookings.length}`);
    });

    // Check for orphaned bookings (businessId doesn't match any business)
    console.log('\n\n🔍 CHECKING FOR ORPHANED BOOKINGS:');
    const businessIds = allBusinesses.map(b => b._id.toString());
    const orphanedBookings = allBookings.filter(b => {
      if (!b.businessId) return true;
      const bookingBusinessId = b.businessId._id ? b.businessId._id.toString() : b.businessId.toString();
      return !businessIds.includes(bookingBusinessId);
    });

    if (orphanedBookings.length > 0) {
      console.log(`⚠️ Found ${orphanedBookings.length} orphaned bookings:`);
      orphanedBookings.forEach(b => {
        console.log(`   - Booking ${b._id} references businessId: ${b.businessId}`);
      });
    } else {
      console.log('✅ No orphaned bookings found');
    }

    await mongoose.connection.close();
    console.log('\n✅ Test completed');
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
};

testBookingFlow();
