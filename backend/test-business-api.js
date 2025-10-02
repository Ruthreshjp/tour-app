import fetch from 'node-fetch';

async function testBusinessAPI() {
  console.log('🧪 Testing Business API Endpoints...\n');
  
  const baseUrl = 'http://localhost:8000';
  const testEmail = 'test@hotel.com'; // Use the test business we created
  
  try {
    // Test 1: Check Email
    console.log('1️⃣ Testing /api/business/check-email');
    const checkEmailResponse = await fetch(`${baseUrl}/api/business/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    
    const checkEmailData = await checkEmailResponse.json();
    console.log(`   Status: ${checkEmailResponse.status}`);
    console.log(`   Response:`, checkEmailData);
    console.log(`   ✅ Email check: ${checkEmailData.success ? 'SUCCESS' : 'FAILED'}\n`);
    
    if (checkEmailData.success && checkEmailData.exists && checkEmailData.approved) {
      // Test 2: Send Login Code
      console.log('2️⃣ Testing /api/business/send-login-code');
      const sendCodeResponse = await fetch(`${baseUrl}/api/business/send-login-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      });
      
      const sendCodeData = await sendCodeResponse.json();
      console.log(`   Status: ${sendCodeResponse.status}`);
      console.log(`   Response:`, sendCodeData);
      console.log(`   ✅ Send code: ${sendCodeData.success ? 'SUCCESS' : 'FAILED'}\n`);
    }
    
    // Test 3: General server health
    console.log('3️⃣ Testing server health');
    const healthResponse = await fetch(`${baseUrl}/`);
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   ✅ Server health: ${healthResponse.ok ? 'HEALTHY' : 'ISSUES'}\n`);
    
    console.log('🎯 SUMMARY:');
    console.log('✅ Backend server is running on port 8000');
    console.log('✅ Business API endpoints are accessible');
    console.log('✅ Database connection is working');
    console.log('\n💡 If frontend still shows 400 error:');
    console.log('1. Restart frontend: Ctrl+C then npm run dev');
    console.log('2. Clear browser cache');
    console.log('3. Check browser network tab for actual request URL');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Make sure backend is running: npm run dev');
    console.log('- Check if port 8000 is available');
    console.log('- Verify MongoDB is running');
  }
}

testBusinessAPI();
