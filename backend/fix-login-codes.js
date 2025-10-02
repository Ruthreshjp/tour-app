import mongoose from 'mongoose';
import Business from './models/business.model.js';

async function fixLoginCodes() {
  try {
    console.log('🔧 Fixing Business Login Codes...\n');
    
    await mongoose.connect('mongodb://localhost:27017/travel-tourism');
    console.log('✅ Connected to MongoDB\n');
    
    // Find all businesses
    const allBusinesses = await Business.find({});
    console.log(`📊 Found ${allBusinesses.length} total businesses\n`);
    
    if (allBusinesses.length === 0) {
      console.log('❌ No businesses found in database');
      await mongoose.connection.close();
      return;
    }
    
    let fixedCount = 0;
    let alreadyHaveCode = 0;
    let notVerified = 0;
    
    console.log('🔍 Checking each business...\n');
    
    for (let i = 0; i < allBusinesses.length; i++) {
      const business = allBusinesses[i];
      console.log(`🏢 Business ${i + 1}: ${business.businessName}`);
      console.log(`   Email: ${business.email}`);
      console.log(`   Verified: ${business.isVerified ? '✅' : '❌'}`);
      console.log(`   Active: ${business.isActive ? '✅' : '❌'}`);
      console.log(`   Login Code: ${business.loginCode ? '✅ EXISTS' : '❌ MISSING'}`);
      
      if (!business.isVerified) {
        console.log('   🔧 Action: Setting as verified and active');
        business.isVerified = true;
        business.isActive = true;
        business.emailVerified = true;
      }
      
      if (!business.loginCode) {
        const loginCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`   🔧 Action: Assigning login code: ${loginCode}`);
        business.loginCode = loginCode;
        business.loginCodeExpiry = null; // Make it permanent
        fixedCount++;
      } else {
        console.log(`   ✅ Already has login code: ${business.loginCode}`);
        alreadyHaveCode++;
      }
      
      // Save the business
      await business.save();
      console.log(`   💾 Business updated successfully\n`);
    }
    
    console.log('📋 SUMMARY:');
    console.log(`✅ Total businesses processed: ${allBusinesses.length}`);
    console.log(`🔧 Login codes assigned: ${fixedCount}`);
    console.log(`✅ Already had codes: ${alreadyHaveCode}`);
    console.log(`🔐 All businesses are now verified and active\n`);
    
    // Display final status
    console.log('🎯 FINAL BUSINESS STATUS:');
    const updatedBusinesses = await Business.find({});
    updatedBusinesses.forEach((business, index) => {
      console.log(`\n🏢 Business ${index + 1} - READY FOR LOGIN:`);
      console.log(`   📧 Email: ${business.email}`);
      console.log(`   🏷️  Name: ${business.businessName}`);
      console.log(`   🔑 Login Code: ${business.loginCode}`);
      console.log(`   ✅ Verified: ${business.isVerified}`);
      console.log(`   ✅ Active: ${business.isActive}`);
      console.log(`\n   🚀 LOGIN STEPS:`);
      console.log(`   1. Go to: http://localhost:5175/business/login`);
      console.log(`   2. Enter email: ${business.email}`);
      console.log(`   3. Enter login code: ${business.loginCode}`);
      console.log(`   4. Enter your password`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('🎉 All businesses now have login codes and can login successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing login codes:', error.message);
    console.error(error);
  }
}

fixLoginCodes();
