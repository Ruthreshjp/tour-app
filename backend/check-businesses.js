import mongoose from 'mongoose';
import Business from './models/business.model.js';

async function checkBusinesses() {
  try {
    await mongoose.connect('mongodb://localhost:27017/travel-tourism');
    console.log('✅ Connected to MongoDB');
    
    const businesses = await Business.find({});
    console.log(`\n📊 Total businesses found: ${businesses.length}\n`);
    
    if (businesses.length === 0) {
      console.log('❌ No businesses found in database');
      console.log('💡 This explains why login shows "business not registered"');
    } else {
      businesses.forEach((business, index) => {
        console.log(`🏢 Business ${index + 1}:`);
        console.log(`   Email: ${business.email}`);
        console.log(`   Name: ${business.businessName}`);
        console.log(`   Type: ${business.businessType}`);
        console.log(`   Verified: ${business.isVerified ? '✅' : '❌'}`);
        console.log(`   Active: ${business.isActive ? '✅' : '❌'}`);
        console.log(`   Login Code: ${business.loginCode ? '✅ EXISTS' : '❌ NOT SET'}`);
        console.log(`   Email Verified: ${business.emailVerified ? '✅' : '❌'}`);
        console.log(`   Created: ${business.createdAt}`);
        console.log('');
      });
    }
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBusinesses();
