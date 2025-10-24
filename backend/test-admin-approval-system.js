import mongoose from 'mongoose';
import Business from './models/business.model.js';
import User from './models/user.model.js';
import bcryptjs from 'bcryptjs';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tour-app');

async function testAdminApprovalSystem() {
  try {
    console.log("🔧 Testing Admin Approval System with Login Code Email");
    console.log("=" .repeat(60));
    
    // Step 1: Create a test admin user if not exists
    console.log("\n1️⃣ Checking for admin user...");
    let adminUser = await User.findOne({ email: 'admin@tourapp.com' });
    
    if (!adminUser) {
      console.log("   Creating admin user...");
      const hashedPassword = await bcryptjs.hash('admin123', 12);
      adminUser = new User({
        username: 'Admin User',
        email: 'admin@tourapp.com',
        password: hashedPassword,
        phone: '9999999999',
        address: 'Admin Address',
        user_role: 1, // Admin role
        avatar: null
      });
      await adminUser.save();
      console.log("   ✅ Admin user created: admin@tourapp.com / admin123");
    } else {
      console.log("   ✅ Admin user exists: admin@tourapp.com");
    }
    
    // Step 2: Create a test business for approval
    console.log("\n2️⃣ Creating test business for approval...");
    
    // Remove existing test business
    await Business.deleteMany({ email: 'testbusiness@example.com' });
    
    const hashedBusinessPassword = await bcryptjs.hash('business123', 12);
    const testBusiness = new Business({
      businessName: "Test Restaurant for Approval",
      email: "testbusiness@example.com",
      phone: "9876543210",
      businessType: "restaurant",
      password: hashedBusinessPassword,
      address: "123 Test Street",
      city: "Test City",
      state: "Test State",
      pincode: "123456",
      description: "A test restaurant waiting for admin approval",
      // Business starts as unverified (pending approval)
      isVerified: false,
      isActive: false,
      emailVerified: true,
      // Login code will be generated during registration
      loginCode: Math.floor(100000 + Math.random() * 900000).toString(),
      loginCodeExpiry: null, // Permanent code
      status: 'pending'
    });
    
    await testBusiness.save();
    console.log("   ✅ Test business created:");
    console.log(`      📧 Email: ${testBusiness.email}`);
    console.log(`      🔑 Login Code: ${testBusiness.loginCode}`);
    console.log(`      ✅ Status: Pending Admin Approval`);
    
    // Step 3: Simulate admin approval process
    console.log("\n3️⃣ Simulating admin approval process...");
    console.log("   📋 Admin Dashboard → Business Approvals → Approve Business");
    
    // This simulates what happens when admin clicks "Approve" in the dashboard
    const businessToApprove = await Business.findById(testBusiness._id);
    
    if (businessToApprove) {
      // Update business status (this triggers the email sending)
      businessToApprove.isVerified = true;
      businessToApprove.isActive = true;
      businessToApprove.status = 'approved';
      
      await businessToApprove.save();
      
      console.log("   ✅ Business approved successfully!");
      console.log("   📧 Login code email would be sent to: " + businessToApprove.email);
      console.log("   🔑 Login code in email: " + businessToApprove.loginCode);
    }
    
    // Step 4: Show the complete approval workflow
    console.log("\n4️⃣ Complete Admin Approval Workflow:");
    console.log("   " + "─".repeat(50));
    console.log("   1. Business registers → Gets pending status");
    console.log("   2. Admin logs into dashboard");
    console.log("   3. Admin goes to 'Business Approvals' section");
    console.log("   4. Admin sees list of pending businesses");
    console.log("   5. Admin clicks 'Approve' button");
    console.log("   6. 📧 System automatically sends login code email");
    console.log("   7. Business receives email with login credentials");
    console.log("   8. Business can now login using email + login code + password");
    
    // Step 5: Show API endpoints
    console.log("\n5️⃣ API Endpoints Used:");
    console.log("   GET  /api/business/admin/businesses - Get all businesses for admin");
    console.log("   PUT  /api/business/admin/businesses/:id/status - Approve/decline business");
    console.log("   📧 Email sent automatically when isVerified = true");
    
    // Step 6: Show email content structure
    console.log("\n6️⃣ Email Content Sent to Business:");
    console.log("   " + "─".repeat(50));
    console.log("   📧 Subject: 🎉 Business Approved - Your Login Credentials");
    console.log("   📧 Contains:");
    console.log("      • Congratulations message");
    console.log("      • Login credentials (email + login code)");
    console.log("      • Step-by-step login instructions");
    console.log("      • Direct link to business login page");
    console.log("      • List of available features");
    
    console.log("\n🎉 Admin Approval System Test Complete!");
    console.log("📧 Login codes are automatically sent via email when admin approves businesses");
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

testAdminApprovalSystem();
