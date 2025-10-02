import mongoose from 'mongoose';
import Business from './models/business.model.js';

async function fixSpecificBusiness() {
  try {
    console.log('🔧 Fixing Your Specific Business Login Code...\n');
    
    await mongoose.connect('mongodb://localhost:27017/travel-tourism');
    console.log('✅ Connected to MongoDB\n');
    
    const yourEmail = 'ruthreshjp.23aim@kongu.edu';
    
    // Find and update your business
    const business = await Business.findOne({ email: yourEmail });
    
    if (!business) {
      console.log('❌ Business not found with email:', yourEmail);
      await mongoose.connection.close();
      return;
    }
    
    console.log('🏢 FOUND BUSINESS:');
    console.log('📧 Email:', business.email);
    console.log('🏷️  Name:', business.businessName);
    console.log('🔑 Current Login Code:', business.loginCode);
    console.log('✅ Is Verified:', business.isVerified);
    console.log('✅ Is Active:', business.isActive);
    console.log('');
    
    // Force update the business with proper settings
    const newLoginCode = '123456'; // Simple, easy to remember code
    
    business.isVerified = true;
    business.isActive = true;
    business.emailVerified = true;
    business.loginCode = newLoginCode;
    business.loginCodeExpiry = null; // Make it permanent
    
    // Clear any login attempts or locks
    business.loginAttempts = 0;
    business.lockUntil = null;
    
    await business.save();
    
    console.log('🔧 BUSINESS UPDATED:');
    console.log('✅ Set as verified: true');
    console.log('✅ Set as active: true');
    console.log('✅ Email verified: true');
    console.log('🔑 New login code: ' + newLoginCode);
    console.log('⏰ Code expiry: PERMANENT');
    console.log('🔓 Cleared any locks or failed attempts');
    console.log('');
    
    // Verify the update
    const updatedBusiness = await Business.findOne({ email: yourEmail });
    
    console.log('✅ VERIFICATION - Updated Business:');
    console.log('📧 Email:', updatedBusiness.email);
    console.log('🔑 Login Code:', updatedBusiness.loginCode);
    console.log('✅ Verified:', updatedBusiness.isVerified);
    console.log('✅ Active:', updatedBusiness.isActive);
    console.log('📧 Email Verified:', updatedBusiness.emailVerified);
    console.log('🔓 Login Attempts:', updatedBusiness.loginAttempts);
    console.log('');
    
    console.log('🎯 YOUR LOGIN CREDENTIALS:');
    console.log('📧 Email: ruthreshjp.23aim@kongu.edu');
    console.log('🔑 Login Code: 123456');
    console.log('🔒 Password: [Your registration password]');
    console.log('');
    
    console.log('🚀 TESTING STEPS:');
    console.log('1. Go to: http://localhost:5175/business/login');
    console.log('2. Enter email: ruthreshjp.23aim@kongu.edu');
    console.log('3. Click "Continue"');
    console.log('4. Enter login code: 123456');
    console.log('5. Enter your password');
    console.log('');
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    console.log('🎉 Your business is now ready for login with the new code!');
    
  } catch (error) {
    console.error('❌ Error fixing business:', error.message);
    console.error(error);
  }
}

fixSpecificBusiness();
