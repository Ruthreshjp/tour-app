import Booking from "../models/booking.model.js";
import Package from "../models/package.model.js";
import Business from "../models/business.model.js";
import { ObjectId } from "mongodb";
import nodemailer from 'nodemailer';

//book package
export const bookPackage = async (req, res) => {
  try {
    const { packageDetails, buyer, totalPrice, persons, date } = req.body;

    if (req.user.id !== buyer) {
      return res.status(401).send({
        success: false,
        message: "You can only buy on your account!",
      });
    }

    if (!packageDetails || !buyer || !totalPrice || !persons || !date) {
      return res.status(200).send({
        success: false,
        message: "All fields are required!",
      });
    }

    const validPackage = await Package.findById(packageDetails);

    if (!validPackage) {
      return res.status(404).send({
        success: false,
        message: "Package Not Found!",
      });
    }

    const newBooking = await Booking.create(req.body);

    if (newBooking) {
      return res.status(201).send({
        success: true,
        message: "Package Booked!",
      });
    } else {
      return res.status(500).send({
        success: false,
        message: "Something went wrong!",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//get current bookings for admin
export const getCurrentBookings = async (req, res) => {
  try {
    const searchTerm = req?.query?.searchTerm || "";
    const bookings = await Booking.find({
      date: { $gt: new Date().toISOString() },
      status: "Booked",
    })
      .populate("packageDetails")
      // .populate("buyer", "username email")
      .populate({
        path: "buyer",
        match: {
          $or: [
            { username: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
          ],
        },
      })
      .sort({ createdAt: "asc" });
    let bookingsFilterd = [];
    bookings.map((booking) => {
      if (booking.buyer !== null) {
        bookingsFilterd.push(booking);
      }
    });
    if (bookingsFilterd.length) {
      return res.status(200).send({
        success: true,
        bookings: bookingsFilterd,
      });
    } else {
      return res.status(200).send({
        success: false,
        message: "No Bookings Available",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//get all bookings admin
export const getAllBookings = async (req, res) => {
  try {
    const searchTerm = req?.query?.searchTerm || "";
    const bookings = await Booking.find({})
      .populate("packageDetails")
      // .populate("buyer", "username email")
      .populate({
        path: "buyer",
        match: {
          $or: [
            { username: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
          ],
        },
      })
      .sort({ createdAt: "asc" });
    let bookingsFilterd = [];
    bookings.map((booking) => {
      if (booking.buyer !== null) {
        bookingsFilterd.push(booking);
      }
    });
    if (bookingsFilterd.length) {
      return res.status(200).send({
        success: true,
        bookings: bookingsFilterd,
      });
    } else {
      return res.status(200).send({
        success: false,
        message: "No Bookings Available",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//get current bookings for user by id
export const getUserCurrentBookings = async (req, res) => {
  try {
    if (req?.user?.id !== req?.params?.id) {
      return res.status(401).send({
        success: false,
        message: "You can only get your own bookings!!",
      });
    }
    const searchTerm = req?.query?.searchTerm || "";
    const bookings = await Booking.find({
      buyer: new ObjectId(req?.params?.id),
      date: { $gt: new Date().toISOString() },
      status: "Booked",
    })
      // .populate("packageDetails")
      .populate({
        path: "packageDetails",
        match: {
          packageName: { $regex: searchTerm, $options: "i" },
        },
      })
      .populate("buyer", "username email")
      .sort({ createdAt: "asc" });
    let bookingsFilterd = [];
    bookings.map((booking) => {
      if (booking.packageDetails !== null) {
        bookingsFilterd.push(booking);
      }
    });
    if (bookingsFilterd.length) {
      return res.status(200).send({
        success: true,
        bookings: bookingsFilterd,
      });
    } else {
      return res.status(200).send({
        success: false,
        message: "No Bookings Available",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//get all bookings by user id
export const getAllUserBookings = async (req, res) => {
  try {
    if (req?.user?.id !== req?.params?.id) {
      return res.status(401).send({
        success: false,
        message: "You can only get your own bookings!!",
      });
    }
    const searchTerm = req?.query?.searchTerm || "";
    const bookings = await Booking.find({
      buyer: new ObjectId(req?.params?.id),
    })
      // .populate("packageDetails")
      .populate({
        path: "packageDetails",
        match: {
          packageName: { $regex: searchTerm, $options: "i" },
        },
      })
      .populate("buyer", "username email")
      .sort({ createdAt: "asc" });
    let bookingsFilterd = [];
    bookings.map((booking) => {
      if (booking.packageDetails !== null) {
        bookingsFilterd.push(booking);
      }
    });
    if (bookingsFilterd.length) {
      return res.status(200).send({
        success: true,
        bookings: bookingsFilterd,
      });
    } else {
      return res.status(200).send({
        success: false,
        message: "No Bookings Available",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//delete booking history
export const deleteBookingHistory = async (req, res) => {
  try {
    if (req?.user?.id !== req?.params?.userId) {
      return res.status(401).send({
        success: false,
        message: "You can only delete your booking history!",
      });
    }
    const deleteHistory = await Booking.findByIdAndDelete(req?.params?.id);
    if (deleteHistory) {
      return res.status(200).send({
        success: true,
        message: "Booking History Deleted!",
      });
    } else {
      return res.status(500).send({
        success: false,
        message: "Something went wrong while deleting booking history!",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// Business booking functions
export const createBooking = async (req, res) => {
  try {
    const { businessId, businessType, bookingDetails, amount, advanceAmount, specialRequests, status } = req.body;
    const userId = req.user.id;

    console.log("🎫 CREATE BOOKING REQUEST:");
    console.log("   Business ID:", businessId);
    console.log("   Business ID type:", typeof businessId);
    console.log("   User ID:", userId);
    console.log("   Business Type:", businessType);
    console.log("   Booking Details:", bookingDetails);
    console.log("   Amount:", amount);
    console.log("   Advance Amount:", advanceAmount);
    console.log("   Status:", status);

    // Validate business exists
    const business = await Business.findById(businessId);
    if (!business) {
      console.log("❌ Business not found with ID:", businessId);
      return res.status(404).json({
        success: false,
        message: "Business not found"
      });
    }

    console.log("✅ Business found:", business.businessName, "(", business._id, ")");

    // Create booking
    const newBooking = new Booking({
      businessId,
      userId,
      businessType,
      bookingDetails,
      amount,
      advanceAmount: advanceAmount || amount, // Use advanceAmount if provided, otherwise use amount
      specialRequests,
      status: status || 'pending_approval', // Use provided status or default to 'pending_approval'
      paymentStatus: 'pending',
      createdAt: new Date()
    });

    await newBooking.save();

    // Increment business booking count
    await Business.findByIdAndUpdate(businessId, {
      $inc: { totalBookings: 1 }
    });

    console.log("✅ Booking created successfully:");
    console.log("   Booking ID:", newBooking._id);
    console.log("   Stored businessId:", newBooking.businessId);
    console.log("   Stored businessId type:", typeof newBooking.businessId);
    console.log("   Status:", newBooking.status);

    res.status(201).json({
      success: true,
      message: "Booking request submitted successfully",
      booking: newBooking
    });
  } catch (error) {
    console.error("❌ Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred"
    });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const bookings = await Booking.find({ userId })
      .populate('businessId', 'businessName businessType contactPhone location profileImage mainImage businessImages address city state upiId')
      .populate('userId', 'username email phone')
      .sort({ createdAt: -1 });

    console.log(`📋 Found ${bookings.length} bookings for user ${userId}`);
    if (bookings.length > 0) {
      console.log('📸 Sample business image data:', {
        profileImage: bookings[0].businessId?.profileImage,
        mainImage: bookings[0].businessId?.mainImage,
        businessImages: bookings[0].businessId?.businessImages
      });
    }

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred"
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    
    const booking = await Booking.findOne({ _id: bookingId, userId })
      .populate('businessId', 'businessName businessType phone email address city state upiId')
      .populate('userId', 'username email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error("Get booking by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred"
    });
  }
};

export const getBusinessBookings = async (req, res) => {
  try {
    console.log("📋 Get business bookings request received");
    console.log("🏢 Business ID from middleware:", req.businessId);
    console.log("🏢 Business ID type:", typeof req.businessId);
    
    const businessId = req.businessId;
    
    if (!businessId) {
      console.log("❌ No business ID found in request");
      return res.status(400).json({
        success: false,
        message: "Business ID not found"
      });
    }
    
    console.log("🔍 Searching for bookings with businessId:", businessId);
    
    // Debug: Check all bookings first
    const allBookings = await Booking.find({}).select('businessId businessType status');
    console.log(`📊 Total bookings in database: ${allBookings.length}`);
    console.log("📊 All booking businessIds:", allBookings.map(b => ({
      id: b._id.toString(),
      businessId: b.businessId ? b.businessId.toString() : 'null',
      type: b.businessType,
      status: b.status
    })));
    
    const bookings = await Booking.find({ businessId })
      .populate('userId', 'username email phone')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${bookings.length} bookings for business ${businessId}`);
    
    // If no bookings found, check if there are any bookings with similar IDs
    if (bookings.length === 0) {
      const businessIdStr = businessId.toString();
      const similarBookings = allBookings.filter(b => 
        b.businessId && b.businessId.toString().includes(businessIdStr.substring(0, 10))
      );
      if (similarBookings.length > 0) {
        console.log("⚠️ Found bookings with similar businessId:", similarBookings);
      }
    }
    
    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error("❌ Get business bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred"
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, roomNumber } = req.body;
    const businessId = req.businessId;

    const booking = await Booking.findOne({ _id: bookingId, businessId })
      .populate('userId', 'username email phone')
      .populate('businessId', 'businessName email upiId');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    booking.status = status;
    if (roomNumber) {
      booking.roomNumber = roomNumber;
    }
    booking.updatedAt = new Date();

    await booking.save();

    // Send email notification when booking is accepted (before payment)
    if (status === 'confirmed') {
      try {
        await sendBookingAcceptanceEmail(booking);
      } catch (emailError) {
        console.error('Acceptance email notification failed:', emailError);
        // Don't fail the booking update if email fails
      }
    }

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred"
    });
  }
};

// Email notification function
const sendBookingAcceptanceEmail = async (booking) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const paymentPageUrl = `${process.env.CLIENT_URL || 'http://localhost:5177'}/payment/${booking._id}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: booking.userId.email,
    subject: `✅ Booking Accepted - ${booking.businessId.businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF9800;">✅ Your Booking Request is Accepted!</h2>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Booking Details:</h3>
          <p><strong>Business:</strong> ${booking.businessId.businessName}</p>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
          ${getBookingDetailsHTML(booking)}
          <p><strong>Advance Amount:</strong> ₹${booking.amount}</p>
        </div>

        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #4CAF50;">💳 Next Step: Complete Your Payment</h3>
          <p>Your booking is now accepted! To confirm your booking, please complete the advance payment:</p>

          <div style="margin: 15px 0;">
            <a href="${paymentPageUrl}"
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
              💳 Pay ₹${booking.amount} Advance
            </a>
          </div>

          ${booking.businessId.upiId ? `
            <div style="margin-top: 15px; padding: 10px; background-color: white; border-radius: 5px;">
              <p><strong>UPI ID:</strong> ${booking.businessId.upiId}</p>
              <p style="font-size: 12px; color: #666;">You can also pay directly using this UPI ID</p>
            </div>
          ` : ''}
        </div>

        <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #f57c00;">⚠️ Important:</h4>
          <ul style="color: #666;">
            <li><strong>Payment is required to confirm your booking</strong></li>
            <li>You have 24 hours to complete the payment</li>
            <li>Advance amount will be adjusted in your final bill</li>
            <li>No refund policy applies after payment</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Thank you for choosing ${booking.businessId.businessName}!<br>
            We look forward to serving you! ${getBusinessEmoji(booking.businessType)}
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log('📧 Booking acceptance email sent to:', booking.userId.email);
};

// Email notification function
const sendBookingConfirmationEmail = async (booking) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const paymentPageUrl = `${process.env.CLIENT_URL || 'http://localhost:5177'}/payment/${booking._id}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: booking.userId.email,
    subject: `🎉 Booking Confirmed - ${booking.businessId.businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">🎉 Your Booking is Confirmed!</h2>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Booking Details:</h3>
          <p><strong>Business:</strong> ${booking.businessId.businessName}</p>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
          ${getBookingDetailsHTML(booking)}
          <p><strong>Advance Paid:</strong> ₹${booking.amount}</p>
          <p><strong>Payment Status:</strong> ✅ Verified</p>
        </div>

        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #4CAF50;">✅ Payment Successfully Verified</h3>
          <p>Your advance payment has been verified by ${booking.businessId.businessName}.</p>
          <p><strong>Transaction ID:</strong> ${booking.transactionId}</p>
        </div>

        <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #f57c00;">📋 Important Notes:</h4>
          <ul style="color: #666;">
            <li>Your booking is now fully confirmed</li>
            <li>Please arrive on time for your ${getServiceName(booking.businessType)}</li>
            <li>Advance amount will be adjusted in your final bill</li>
            <li>Contact the business directly for any special requests</li>
            <li>Keep this email for your records</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Thank you for choosing ${booking.businessId.businessName}!<br>
            ${getServiceMessage(booking.businessType)}
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log('📧 Booking confirmation email sent to:', booking.userId.email);
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { transactionId, paymentMethod } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // UPI or other online payment - set as pending verification
    booking.paymentStatus = 'pending_verification';
    booking.transactionId = transactionId;
    booking.paymentSubmittedAt = new Date();
    booking.updatedAt = new Date();

    await booking.save();

    res.json({
      success: true,
      message: "Payment submitted successfully. Waiting for business verification.",
      booking
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred"
    });
  }
};

// Business verifies payment
export const verifyPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentReceived } = req.body; // true or false
    const businessId = req.businessId;

    const booking = await Booking.findOne({ _id: bookingId, businessId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (paymentReceived === true) {
      booking.paymentStatus = 'paid';
      booking.paymentVerifiedAt = new Date();
      booking.updatedAt = new Date();

      await booking.save();

      // Send booking confirmation email after payment verification
      try {
        await sendBookingConfirmationEmail(booking);
      } catch (emailError) {
        console.error('Payment confirmation email failed:', emailError);
        // Don't fail the payment verification if email fails
      }

      res.json({
        success: true,
        message: "Payment verified and confirmed",
        booking
      });
    } else {
      booking.paymentStatus = 'pending';
      booking.transactionId = null;
      booking.paymentSubmittedAt = null;
      booking.updatedAt = new Date();
      
      await booking.save();

      res.json({
        success: true,
        message: "Payment rejected. Customer needs to submit correct transaction ID.",
        booking
      });
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred"
    });
  }
};

// Customer cancels their own booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({ _id: bookingId, userId });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled"
      });
    }

    // Update booking status to cancelled
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.updatedAt = new Date();

    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully. No refund will be processed.",
      booking
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred"
    });
  }
};

// Helper function for booking details in emails
const getBookingDetailsHTML = (booking) => {
  switch (booking.businessType) {
    case 'hotel':
      return `
        <p><strong>Check-in:</strong> ${new Date(booking.bookingDetails.checkIn).toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${new Date(booking.bookingDetails.checkOut).toLocaleDateString()}</p>
        <p><strong>Room Type:</strong> ${booking.bookingDetails.roomType}</p>
        <p><strong>Guests:</strong> ${booking.bookingDetails.guests}</p>
        ${booking.roomNumber ? `<p><strong>Room Number:</strong> ${booking.roomNumber}</p>` : ''}
      `;

    case 'cafe':
      return `
        <p><strong>Visit Date:</strong> ${new Date(booking.bookingDetails.visitDate).toLocaleDateString()}</p>
        <p><strong>Visit Time:</strong> ${booking.bookingDetails.visitTime}</p>
        <p><strong>Table Preference:</strong> ${booking.bookingDetails.tableType}</p>
        <p><strong>Party Size:</strong> ${booking.bookingDetails.numberOfGuests} guests</p>
        <p><strong>Estimated Bill:</strong> ₹${booking.bookingDetails.estimatedBill || 'N/A'}</p>
      `;

    case 'cab':
      return `
        <p><strong>Pickup Location:</strong> ${booking.bookingDetails.pickupLocation}</p>
        <p><strong>Drop Location:</strong> ${booking.bookingDetails.dropLocation}</p>
        <p><strong>Pickup Time:</strong> ${new Date(booking.bookingDetails.pickupTime).toLocaleString()}</p>
        <p><strong>Passengers:</strong> ${booking.bookingDetails.passengers}</p>
        ${booking.bookingDetails.vehicleType ? `<p><strong>Vehicle:</strong> ${booking.bookingDetails.vehicleType}${booking.bookingDetails.isAC !== undefined ? ` (${booking.bookingDetails.isAC ? 'AC' : 'Non-AC'})` : ''}</p>` : ''}
      `;

    default:
      return `
        <p><strong>Service Type:</strong> ${booking.businessType}</p>
        <p><strong>Details:</strong> ${JSON.stringify(booking.bookingDetails)}</p>
      `;
  }
};

// Helper function for business type emoji
const getBusinessEmoji = (businessType) => {
  switch (businessType) {
    case 'hotel': return '🏨';
    case 'restaurant': return '🍽️';
    case 'cafe': return '☕';
    case 'cab': return '🚗';
    case 'shopping': return '🛍️';
    default: return '📅';
  }
};

// Helper function for service name in emails
const getServiceName = (businessType) => {
  switch (businessType) {
    case 'hotel': return 'check-in';
    case 'restaurant': return 'reservation';
    case 'cafe': return 'visit';
    case 'cab': return 'pickup';
    case 'shopping': return 'appointment';
    default: return 'service';
  }
};

// Helper function for service message in emails
const getServiceMessage = (businessType) => {
  switch (businessType) {
    case 'hotel': return 'Have a wonderful stay! 🏨';
    case 'restaurant': return 'Enjoy your meal! 🍽️';
    case 'cafe': return 'Enjoy your time! ☕';
    case 'cab': return 'Have a safe journey! 🚗';
    case 'shopping': return 'Happy shopping! 🛍️';
    default: return 'We look forward to serving you! 📅';
  }
};
