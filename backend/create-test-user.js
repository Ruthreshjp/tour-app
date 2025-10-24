import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/user.model.js';
import { connectDB } from './config/connectDB.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestUser = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'testuser@example.com' });
    if (existingUser) {
      console.log('✅ Test user already exists:');
      console.log('📧 Email: testuser@example.com');
      console.log('🔑 Password: testpassword123');
      console.log('🆔 User ID:', existingUser._id);
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    const testUser = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: hashedPassword,
      phone: '9876543210',
      address: 'Test Address, Test City, Test State',
      user_role: 0, // Regular user
      isVerified: true
    });

    await testUser.save();
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: testuser@example.com');
    console.log('🔑 Password: testpassword123');
    console.log('🆔 User ID:', testUser._id);
    console.log('\n🚀 You can now use these credentials to test the booking functionality');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestUser();
