import express from 'express';
import mongoose from 'mongoose';
import Business from './models/business.model.js';

async function checkServerStatus() {
  try {
    console.log('🔍 Checking Server Status...\n');
    
    // Check MongoDB connection
    try {
      await mongoose.connect('mongodb://localhost:27017/travel-tourism');
      console.log('✅ MongoDB: Connected successfully');
      
      // Check if businesses exist
      const businessCount = await Business.countDocuments();
      console.log(`📊 Businesses in database: ${businessCount}`);
      
      if (businessCount > 0) {
        const sampleBusiness = await Business.findOne({});
        console.log(`📧 Sample business email: ${sampleBusiness.email}`);
        console.log(`🔑 Has login code: ${sampleBusiness.loginCode ? 'YES' : 'NO'}`);
        console.log(`✅ Is verified: ${sampleBusiness.isVerified ? 'YES' : 'NO'}`);
      }
      
      await mongoose.connection.close();
    } catch (error) {
      console.log('❌ MongoDB: Connection failed -', error.message);
    }
    
    // Check if backend server is running
    console.log('\n🌐 Checking Backend Server...');
    try {
      const response = await fetch('http://localhost:8000/api/business/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' })
      });
      
      if (response.ok || response.status === 404) {
        console.log('✅ Backend Server: Running on port 8000');
        console.log(`📡 API Response Status: ${response.status}`);
      } else {
        console.log(`⚠️  Backend Server: Responding but with status ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Backend Server: Not running or not accessible');
      console.log('   Error:', error.message);
      console.log('   💡 Make sure to start backend with: npm start');
    }
    
    // Check business routes specifically
    console.log('\n🏢 Checking Business Routes...');
    try {
      const routes = [
        '/api/business/check-email',
        '/api/business/send-login-code',
        '/api/business/verify-code',
        '/api/business/login'
      ];
      
      for (const route of routes) {
        try {
          const response = await fetch(`http://localhost:8000${route}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com' })
          });
          console.log(`✅ ${route}: Available (Status: ${response.status})`);
        } catch (error) {
          console.log(`❌ ${route}: Not accessible`);
        }
      }
    } catch (error) {
      console.log('❌ Could not check business routes');
    }
    
    console.log('\n📋 RECOMMENDATIONS:');
    console.log('1. ✅ Make sure backend is running: cd backend && npm start');
    console.log('2. ✅ Make sure frontend is running: cd client && npm run dev');
    console.log('3. ✅ Check if frontend is on port 5175 (not 5173)');
    console.log('4. ✅ Verify proxy configuration in vite.config.js');
    console.log('\n🎯 If backend is running, the business login should work!');
    
  } catch (error) {
    console.error('❌ Error during status check:', error.message);
  }
}

checkServerStatus();
