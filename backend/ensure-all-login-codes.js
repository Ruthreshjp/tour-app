import mongoose from 'mongoose';
import Business from './models/business.model.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tour-app');

async function ensureAllLoginCodes() {
  try {
    console.log("🔍 Checking all businesses for login codes...");
    
    // Find all businesses
    const businesses = await Business.find({});
    console.log(`📊 Found ${businesses.length} businesses`);
    
    let fixedCount = 0;
    
    for (const business of businesses) {
      console.log(`\n📋 Business: ${business.businessName} (${business.email})`);
      console.log(`   Verified: ${business.isVerified}, Active: ${business.isActive}`);
      
      if (!business.loginCode) {
        console.log(`   ❌ Missing login code - Generating...`);
        business.loginCode = Math.floor(100000 + Math.random() * 900000).toString();
        business.loginCodeExpiry = null; // Permanent code
        await business.save();
        console.log(`   ✅ Login code set: ${business.loginCode}`);
        fixedCount++;
      } else {
        console.log(`   ✅ Login code exists: ${business.loginCode}`);
      }
    }
    
    console.log(`\n🎉 Summary:`);
    console.log(`   Total businesses: ${businesses.length}`);
    console.log(`   Fixed missing codes: ${fixedCount}`);
    console.log(`   All businesses now have login codes!`);
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

ensureAllLoginCodes();
