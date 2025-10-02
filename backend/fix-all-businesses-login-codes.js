import mongoose from 'mongoose';
import Business from './models/business.model.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tour-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixAllBusinesses() {
  try {
    console.log('🔍 Finding all businesses without login codes...');
    
    // Find all businesses without login codes
    const businessesWithoutCodes = await Business.find({
      $or: [
        { loginCode: { $exists: false } },
        { loginCode: null },
        { loginCode: '' }
      ]
    });

    console.log(`📊 Found ${businessesWithoutCodes.length} businesses without login codes`);

    if (businessesWithoutCodes.length === 0) {
      console.log('✅ All businesses already have login codes!');
      return;
    }

    // Update each business with a permanent login code
    for (const business of businessesWithoutCodes) {
      const permanentLoginCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      await Business.findByIdAndUpdate(business._id, {
        loginCode: permanentLoginCode,
        loginCodeExpiry: null, // Permanent code
        isVerified: true, // Auto-approve for testing
        isActive: true,
        emailVerified: true,
        isLocked: false,
        loginAttempts: 0
      });

      console.log(`✅ Updated ${business.businessName} (${business.email}) with login code: ${permanentLoginCode}`);
    }

    console.log('🎉 All businesses have been updated with permanent login codes!');
    
    // Show all businesses with their login codes
    console.log('\n📋 All Business Login Codes:');
    const allBusinesses = await Business.find({}, 'businessName email loginCode isVerified');
    allBusinesses.forEach(business => {
      console.log(`- ${business.businessName} (${business.email}): ${business.loginCode} [${business.isVerified ? 'VERIFIED' : 'PENDING'}]`);
    });

  } catch (error) {
    console.error('❌ Error fixing businesses:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixAllBusinesses();
