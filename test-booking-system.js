// Test script to verify booking system functionality
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

// Test booking creation
async function testBookingCreation() {
  try {
    console.log('🧪 Testing Booking System...\n');
    
    // Test 1: Check if booking routes are accessible
    console.log('1. Testing booking route accessibility...');
    
    const response = await axios.post(`${BASE_URL}/api/booking/create`, {
      businessId: '507f1f77bcf86cd799439011', // Test business ID
      businessType: 'hotel',
      bookingDetails: {
        roomType: 'standard',
        checkIn: '2024-01-15',
        checkOut: '2024-01-17',
        guests: 2
      },
      amount: 5000,
      specialRequests: 'Test booking request'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail auth, but we can see if route exists
      }
    });
    
    console.log('✅ Booking route is accessible');
    
  } catch (error) {
    if (error.response) {
      console.log(`📡 Route Status: ${error.response.status}`);
      console.log(`📝 Response: ${error.response.data.message || error.response.data}`);
      
      if (error.response.status === 401) {
        console.log('✅ Booking route exists (authentication required)');
      } else if (error.response.status === 404) {
        console.log('❌ Booking route not found');
      } else {
        console.log('⚠️  Unexpected response');
      }
    } else {
      console.log('❌ Server connection failed:', error.message);
    }
  }
}

// Test server connectivity
async function testServerConnection() {
  try {
    console.log('🔌 Testing server connection...');
    const response = await axios.get(`${BASE_URL}/`);
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('   Make sure backend server is running on port 8000');
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Booking System Test Suite\n');
  console.log('=' .repeat(50));
  
  const serverRunning = await testServerConnection();
  console.log('');
  
  if (serverRunning) {
    await testBookingCreation();
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 Test Summary:');
  console.log('   - Check if backend server is running');
  console.log('   - Verify booking routes are registered');
  console.log('   - Test authentication middleware');
  console.log('\n💡 Next steps:');
  console.log('   1. Ensure backend server is running: npm start');
  console.log('   2. Test with valid user authentication');
  console.log('   3. Check browser network tab for detailed errors');
}

// Run tests
runTests().catch(console.error);
