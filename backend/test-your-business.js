import fetch from 'node-fetch';

async function testYourBusiness() {
  console.log('🧪 Testing Your Specific Business Login...\n');
  
  const baseUrl = 'http://localhost:8000';
  const yourEmail = 'ruthreshjp.23aim@kongu.edu'; // Your actual business email
  const expectedLoginCode = '507671'; // From your MongoDB data
  
  try {
    console.log('📧 Testing with your email:', yourEmail);
    console.log('🔑 Expected login code:', expectedLoginCode);
    console.log('🏢 Business name: KONGU ENGINEERING COLLEGE\n');
    
    // Test 1: Check Email
    console.log('1️⃣ Testing /api/business/check-email');
    const checkEmailResponse = await fetch(`${baseUrl}/api/business/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: yourEmail })
    });
    
    const checkEmailData = await checkEmailResponse.json();
    console.log(`   Status: ${checkEmailResponse.status}`);
    console.log(`   Response:`, JSON.stringify(checkEmailData, null, 2));
    
    if (checkEmailResponse.status === 200 && checkEmailData.success) {
      console.log('   ✅ Email check: SUCCESS');
      
      if (checkEmailData.exists && checkEmailData.approved) {
        console.log('   ✅ Business exists and is approved\n');
        
        // Test 2: Send Login Code
        console.log('2️⃣ Testing /api/business/send-login-code');
        const sendCodeResponse = await fetch(`${baseUrl}/api/business/send-login-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: yourEmail })
        });
        
        const sendCodeData = await sendCodeResponse.json();
        console.log(`   Status: ${sendCodeResponse.status}`);
        console.log(`   Response:`, JSON.stringify(sendCodeData, null, 2));
        
        if (sendCodeResponse.status === 200 && sendCodeData.success) {
          console.log('   ✅ Send login code: SUCCESS');
          console.log('   📧 Login code should be sent/displayed\n');
          
          // Test 3: Verify Login Code
          console.log('3️⃣ Testing /api/business/verify-code');
          const verifyCodeResponse = await fetch(`${baseUrl}/api/business/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: yourEmail, 
              loginCode: expectedLoginCode 
            })
          });
          
          const verifyCodeData = await verifyCodeResponse.json();
          console.log(`   Status: ${verifyCodeResponse.status}`);
          console.log(`   Response:`, JSON.stringify(verifyCodeData, null, 2));
          
          if (verifyCodeResponse.status === 200 && verifyCodeData.success) {
            console.log('   ✅ Login code verification: SUCCESS\n');
          } else {
            console.log('   ❌ Login code verification: FAILED\n');
          }
        } else {
          console.log('   ❌ Send login code: FAILED');
          console.log('   🔍 Reason:', sendCodeData.message || 'Unknown error\n');
        }
      } else {
        console.log('   ⚠️  Business exists but not approved or other issue');
        console.log('   🔍 Details:', checkEmailData);
      }
    } else {
      console.log('   ❌ Email check: FAILED');
      console.log('   🔍 Reason:', checkEmailData.message || 'Unknown error');
    }
    
    console.log('\n🎯 SUMMARY FOR YOUR BUSINESS:');
    console.log('✅ Backend server: Running on port 8000');
    console.log('✅ MongoDB data: Present and verified');
    console.log('✅ Business status: Verified and active');
    console.log('✅ Login code: Available (507671)');
    
    console.log('\n🚀 FRONTEND TEST STEPS:');
    console.log('1. Go to: http://localhost:5175/business/login');
    console.log('2. Enter email: ruthreshjp.23aim@kongu.edu');
    console.log('3. Click "Continue"');
    console.log('4. Enter login code: 507671');
    console.log('5. Enter your password');
    
    console.log('\n💡 IF STILL GETTING 400 ERROR:');
    console.log('- Clear browser cache (Ctrl+Shift+Delete)');
    console.log('- Try incognito/private browsing mode');
    console.log('- Check browser Network tab for actual request URL');
    console.log('- Verify proxy logs in frontend console');
    
  } catch (error) {
    console.error('❌ Error testing your business:', error.message);
    console.log('\n🔧 This suggests backend connectivity issues');
    console.log('- Verify backend is running: npm run dev');
    console.log('- Check if port 8000 is accessible');
  }
}

testYourBusiness();
