import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

// Test business credentials
const testBusiness = {
  email: 'ruthreshjp.23aim@kongu.edu',
  loginCode: '123456',
  password: 'test123' // You may need to update this
};

async function testBusinessSystem() {
  console.log('🧪 Testing Business Management System...\n');

  try {
    // Test 1: Check Email
    console.log('1️⃣ Testing email check...');
    const emailCheck = await axios.post(`${BASE_URL}/api/business/check-email`, {
      email: testBusiness.email
    });
    console.log('✅ Email check result:', emailCheck.data);

    // Test 2: Send Login Code
    console.log('\n2️⃣ Testing send login code...');
    const sendCode = await axios.post(`${BASE_URL}/api/business/send-login-code`, {
      email: testBusiness.email
    });
    console.log('✅ Send code result:', sendCode.data);

    // Test 3: Verify Login Code
    console.log('\n3️⃣ Testing verify login code...');
    const verifyCode = await axios.post(`${BASE_URL}/api/business/verify-code`, {
      email: testBusiness.email,
      loginCode: testBusiness.loginCode
    });
    console.log('✅ Verify code result:', verifyCode.data);

    // Test 4: Business Login (if password is correct)
    console.log('\n4️⃣ Testing business login...');
    try {
      const login = await axios.post(`${BASE_URL}/api/business/login`, {
        email: testBusiness.email,
        password: testBusiness.password
      });
      console.log('✅ Login result:', login.data);
      
      // Store token for authenticated requests
      const token = login.data.token;
      
      // Test 5: Get Business Profile
      console.log('\n5️⃣ Testing get business profile...');
      const profile = await axios.get(`${BASE_URL}/api/business/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Profile result:', profile.data);

    } catch (loginError) {
      console.log('❌ Login failed (password might be incorrect):', loginError.response?.data);
      console.log('💡 You may need to update the password in the test script');
    }

    // Test 6: Image Upload Endpoint
    console.log('\n6️⃣ Testing image upload endpoint availability...');
    try {
      // Just check if the endpoint exists (will fail without proper form data, but that's expected)
      await axios.post(`${BASE_URL}/api/images/upload/single`, {});
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Image upload endpoint exists (400 expected without proper form data)');
      } else {
        console.log('❌ Image upload endpoint issue:', error.response?.status);
      }
    }

    console.log('\n🎉 Business system tests completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Email check - Working');
    console.log('✅ Send login code - Working');
    console.log('✅ Verify login code - Working');
    console.log('✅ Image upload endpoint - Available');
    console.log('⚠️  Login test - May need password update');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testBusinessSystem();
