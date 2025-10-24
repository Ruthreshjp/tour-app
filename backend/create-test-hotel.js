import mongoose from 'mongoose';
import Business from './models/business.model.js';
import { connectDB } from './config/connectDB.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestHotel = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if test hotel already exists
    const existingHotel = await Business.findOne({ 
      businessName: 'Test Hotel for Booking',
      businessType: 'hotel'
    });
    
    if (existingHotel) {
      console.log('✅ Test hotel already exists:', existingHotel.businessName);
      console.log('🆔 Hotel ID:', existingHotel._id);
      return;
    }

    // Create test hotel with proper room structure
    const testHotel = new Business({
      businessName: 'Test Hotel for Booking',
      email: 'testhotel@example.com',
      password: 'testpassword123', // Required field
      businessType: 'hotel',
      description: 'A test hotel for booking functionality testing',
      phone: '9876543210',
      website: 'https://testhotel.com',
      googleMapsLink: 'https://maps.google.com',
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716] // Bangalore coordinates
      },
      address: '123 Test Street',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      
      // Room structure for booking
      rooms: [
        {
          roomType: 'standard',
          bedType: 'double',
          isAC: true,
          maxOccupancy: 2,
          roomSize: '200 sq ft',
          amenities: ['WiFi', 'TV', 'Bathroom'],
          pricing: {
            dayRate: 1500,
            nightRate: 2000,
            weekendRate: 2500
          },
          availability: true,
          description: 'Comfortable standard room with all basic amenities'
        },
        {
          roomType: 'deluxe',
          bedType: 'queen',
          isAC: true,
          maxOccupancy: 3,
          roomSize: '300 sq ft',
          amenities: ['WiFi', 'TV', 'Bathroom', 'Mini Bar'],
          pricing: {
            dayRate: 2500,
            nightRate: 3000,
            weekendRate: 3500
          },
          availability: true,
          description: 'Spacious deluxe room with premium amenities'
        },
        {
          roomType: 'suite',
          bedType: 'king',
          isAC: true,
          maxOccupancy: 4,
          roomSize: '500 sq ft',
          amenities: ['WiFi', 'TV', 'Bathroom', 'Mini Bar', 'Balcony'],
          pricing: {
            dayRate: 4000,
            nightRate: 5000,
            weekendRate: 6000
          },
          availability: true,
          description: 'Luxury suite with separate living area'
        }
      ],
      
      // Business status
      isVerified: true,
      isActive: true,
      setupCompleted: true,
      status: 'approved',
      rating: 4.5
    });

    await testHotel.save();
    
    console.log('✅ Test hotel created successfully!');
    console.log('🏨 Hotel Name:', testHotel.businessName);
    console.log('🆔 Hotel ID:', testHotel._id);
    console.log('🏠 Rooms created:', testHotel.rooms.length);
    console.log('\n💰 Room Pricing:');
    testHotel.rooms.forEach(room => {
      console.log(`- ${room.roomType}: ₹${room.pricing.nightRate}/night`);
    });
    console.log('\n🚀 You can now test booking with this hotel');
    
  } catch (error) {
    console.error('❌ Error creating test hotel:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestHotel();
