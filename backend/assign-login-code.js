import mongoose from 'mongoose';
import Business from './models/business.model.js';

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node assign-login-code.js <business-email>');
  console.log('Example: node assign-login-code.js business@example.com');
  process.exit(1);
}

async function assignLoginCode() {
  try {
    console.log(`🔧 Assigning login code to: ${email}\n`);
    
    await mongoose.connect('mongodb://localhost:27017/travel-tourism');
    console.log('✅ Connected to MongoDB\n');
    
    // Find the business
    const business = await Business.findOne({ email: email.toLowerCase() });
    
    if (!business) {
      console.log(`❌ Business not found with email: ${email}`);
      console.log('Available businesses:');
      const allBusinesses = await Business.find({}).select('email businessName');
      allBusinesses.forEach((b, index) => {
        console.log(`   ${index + 1}. ${b.email} (${b.businessName})`);
      });
      await mongoose.connection.close();
      return;
    }
    
    console.log(`🏢 Found business: ${business.businessName}`);
    console.log(`📧 Email: ${business.email}`);
    console.log(`✅ Verified: ${business.isVerified}`);
    console.log(`✅ Active: ${business.isActive}`);
    console.log(`🔑 Current Login Code: ${business.loginCode || 'NOT SET'}\n`);
    
    // Set business as verified and active if not already
    let updated = false;
    if (!business.isVerified) {
      business.isVerified = true;
      updated = true;
      console.log('🔧 Setting business as verified');
    }
    
    if (!business.isActive) {
      business.isActive = true;
      updated = true;
      console.log('🔧 Setting business as active');
    }
    
    if (!business.emailVerified) {
      business.emailVerified = true;
      updated = true;
      console.log('🔧 Setting email as verified');
    }
    
    // Generate new login code (or keep existing one)
    let loginCode = business.loginCode;
    if (!loginCode) {
      loginCode = Math.floor(100000 + Math.random() * 900000).toString();
      business.loginCode = loginCode;
      business.loginCodeExpiry = null; // Make it permanent
      updated = true;
      console.log(`🔧 Generated new login code: ${loginCode}`);
    } else {
      console.log(`✅ Using existing login code: ${loginCode}`);
    }
    
    if (updated) {
      await business.save();
      console.log('💾 Business updated successfully\n');
    } else {
      console.log('✅ Business already properly configured\n');
    }
    
    console.log('🎯 BUSINESS LOGIN DETAILS:');
    console.log(`📧 Email: ${business.email}`);
    console.log(`🔑 Login Code: ${loginCode}`);
    console.log(`🏷️  Business Name: ${business.businessName}`);
    console.log(`🏢 Business Type: ${business.businessType}`);
    
    console.log('\n🚀 LOGIN INSTRUCTIONS:');
    console.log('1. Go to: http://localhost:5175/business/login');
    console.log(`2. Enter email: ${business.email}`);
    console.log(`3. Enter login code: ${loginCode}`);
    console.log('4. Enter your password');
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('🎉 Business is now ready for login!');
    
  } catch (error) {
    console.error('❌ Error assigning login code:', error.message);
    console.error(error);
  }
}

assignLoginCode();
