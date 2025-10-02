import mongoose from 'mongoose';
import Business from './models/business.model.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tour-app');

async function approveTestBusiness() {
  try {
    console.log("🔍 Looking for businesses to approve...");
    
    // Find all businesses
    const businesses = await Business.find({});
    console.log(`📊 Found ${businesses.length} businesses`);
    
    if (businesses.length === 0) {
      console.log("📝 Creating a test business...");
      
      // Create a test business
      const testBusiness = new Business({
        businessName: "Test Hotel",
        email: "test@hotel.com",
        phone: "9876543210",
        businessType: "hotel",
        password: "$2a$12$abcdefghijklmnopqrstuvwxyz", // dummy hash
        address: "Test Address",
        city: "Test City",
        state: "Test State",
        pincode: "123456",
        description: "Test hotel for development",
        loginCode: "123456", // Test login code
        loginCodeExpiry: null,
        isVerified: true,
        isActive: true,
        emailVerified: true
      });
      
      await testBusiness.save();
      console.log("✅ Test business created and approved!");
      console.log("📧 Email: test@hotel.com");
      console.log("🔑 Login Code: 123456");
    } else {
      // Approve all existing businesses
      for (const business of businesses) {
        console.log(`\n📋 Business: ${business.businessName} (${business.email})`);
        console.log(`   Current status - Verified: ${business.isVerified}, Active: ${business.isActive}`);
        
        if (!business.isVerified) {
          business.isVerified = true;
          business.isActive = true;
          business.emailVerified = true;
          
          // Ensure login code exists
          if (!business.loginCode) {
            business.loginCode = Math.floor(100000 + Math.random() * 900000).toString();
            console.log(`   🔑 Generated login code: ${business.loginCode}`);
          } else {
            console.log(`   🔑 Existing login code: ${business.loginCode}`);
          }
          
          await business.save();
          console.log("   ✅ Business approved!");
        } else {
          console.log("   ✅ Already approved");
          if (business.loginCode) {
            console.log(`   🔑 Login code: ${business.loginCode}`);
          }
        }
      }
    }
    
    console.log("\n🎉 All businesses are now approved and ready for login!");
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

approveTestBusiness();
