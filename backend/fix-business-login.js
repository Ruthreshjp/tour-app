import mongoose from 'mongoose';
import Business from './models/business.model.js';
import bcrypt from 'bcryptjs';

async function fixBusinessLogin() {
  try {
    console.log('🔧 Starting Business Login Fix...\n');
    
    await mongoose.connect('mongodb://localhost:27017/travel-tourism');
    console.log('✅ Connected to MongoDB\n');
    
    // Check existing businesses
    const businesses = await Business.find({});
    console.log(`📊 Found ${businesses.length} businesses in database\n`);
    
    if (businesses.length === 0) {
      console.log('❌ No businesses found! Creating test business...\n');
      
      // Create a test business
      const testBusiness = new Business({
        businessName: "Test Hotel",
        email: "test@hotel.com",
        phone: "1234567890",
        businessType: "hotel",
        password: await bcrypt.hash("password123", 12),
        address: "123 Test Street",
        city: "Test City",
        state: "Test State",
        pincode: "123456",
        description: "Test hotel for login testing",
        isVerified: true, // Pre-approved
        isActive: true,
        emailVerified: true,
        loginCode: "123456" // Set permanent login code
      });
      
      await testBusiness.save();
      console.log('✅ Test business created:');
      console.log('   Email: test@hotel.com');
      console.log('   Password: password123');
      console.log('   Login Code: 123456');
      console.log('   Status: Verified & Active\n');
    } else {
      console.log('🔍 Checking existing businesses:\n');
      
      for (let i = 0; i < businesses.length; i++) {
        const business = businesses[i];
        console.log(`🏢 Business ${i + 1}:`);
        console.log(`   Email: ${business.email}`);
        console.log(`   Name: ${business.businessName}`);
        console.log(`   Verified: ${business.isVerified ? '✅' : '❌'}`);
        console.log(`   Active: ${business.isActive ? '✅' : '❌'}`);
        console.log(`   Login Code: ${business.loginCode || 'NOT SET'}`);
        
        // Fix issues
        let needsUpdate = false;
        
        if (!business.isVerified) {
          console.log('   🔧 Fixing: Setting as verified');
          business.isVerified = true;
          needsUpdate = true;
        }
        
        if (!business.isActive) {
          console.log('   🔧 Fixing: Setting as active');
          business.isActive = true;
          needsUpdate = true;
        }
        
        if (!business.loginCode) {
          const loginCode = Math.floor(100000 + Math.random() * 900000).toString();
          console.log(`   🔧 Fixing: Setting login code to ${loginCode}`);
          business.loginCode = loginCode;
          business.loginCodeExpiry = null; // Make it permanent
          needsUpdate = true;
        }
        
        if (!business.emailVerified) {
          console.log('   🔧 Fixing: Setting email as verified');
          business.emailVerified = true;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await business.save();
          console.log('   ✅ Business updated successfully');
        } else {
          console.log('   ✅ Business is already properly configured');
        }
        
        console.log('');
      }
    }
    
    // Final verification
    console.log('\n📋 FINAL BUSINESS STATUS:');
    const finalBusinesses = await Business.find({});
    finalBusinesses.forEach((business, index) => {
      console.log(`\n🏢 Business ${index + 1} - READY FOR LOGIN:`);
      console.log(`   📧 Email: ${business.email}`);
      console.log(`   🏷️  Name: ${business.businessName}`);
      console.log(`   🔑 Login Code: ${business.loginCode}`);
      console.log(`   ✅ Verified: ${business.isVerified}`);
      console.log(`   ✅ Active: ${business.isActive}`);
      console.log(`\n   🚀 LOGIN STEPS:`);
      console.log(`   1. Go to business login page`);
      console.log(`   2. Enter email: ${business.email}`);
      console.log(`   3. Enter login code: ${business.loginCode}`);
      console.log(`   4. Enter your password`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('🎉 Business login fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

fixBusinessLogin();
