import PackageBooking from "../models/packageBooking.model.js";
import Package from "../models/package.model.js";
import User from "../models/user.model.js";
import nodemailer from "nodemailer";

// Helper to send package booking email confirmation
const sendPackageBookingEmail = async (booking, packageData, isConfirmed = false) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false }
    });

    const recipientEmail = booking.contactEmail || (booking.userId && booking.userId.email);
    if (!recipientEmail) return;

    const formattedDate = booking.travelDate ? new Date(booking.travelDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : "N/A";
    
    const pkgName = (packageData && packageData.packageName) || (booking.packageId && booking.packageId.packageName) || "Travel Package";
    const paymentTypeLabel = booking.paymentAmountType === "advance" ? "Advance Payment" : "Full Payment";
    const bookingConfirmed = booking.bookingStatus === "confirmed" || booking.paymentStatus === "paid" || isConfirmed;

    const mailOptions = {
      from: `TravelZone <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: bookingConfirmed 
        ? `✅ Booking Confirmed & Successfully Booked - ${pkgName}` 
        : `🎉 Package Booking Received - ${pkgName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: ${bookingConfirmed ? '#10B981' : '#EB662B'}; color: white; padding: 24px; text-align: center;">
            <h2 style="margin: 0; font-size: 22px;">
              ${bookingConfirmed ? '✅ Package Successfully Booked & Confirmed!' : '🎉 Package Booking Received'}
            </h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${bookingConfirmed ? 'Your travel package is officially confirmed' : 'Please complete your payment to finalize booking'}</p>
          </div>

          <div style="padding: 24px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #1e293b;">Hi <strong>${booking.contactName || 'Valued Customer'}</strong>,</p>
            <p style="color: #475569; line-height: 1.5;">
              ${bookingConfirmed 
                ? `Great news! Your package booking for <strong>${pkgName}</strong> has been successfully processed and confirmed.`
                : `Thank you for choosing TravelZone! We have received your booking request for <strong>${pkgName}</strong>.`}
            </p>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0f172a; margin-top: 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">📦 Booking & Payment Details</h3>
              <p style="margin: 8px 0;"><strong>Package Name:</strong> ${pkgName}</p>
              <p style="margin: 8px 0;"><strong>Booking ID:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${booking._id}</span></p>
              <p style="margin: 8px 0;"><strong>Travel Date:</strong> ${formattedDate}</p>
              <p style="margin: 8px 0;"><strong>Travelers:</strong> ${booking.numberOfPeople} Person(s)</p>
              <p style="margin: 8px 0;"><strong>Payment Type:</strong> <span style="color: #2563eb; font-weight: bold;">${paymentTypeLabel}</span></p>
              <p style="margin: 8px 0;"><strong>Total Amount:</strong> <strong style="color: #16a34a; font-size: 18px;">₹${booking.totalAmount}</strong></p>
              ${booking.transactionId ? `<p style="margin: 8px 0;"><strong>Transaction ID:</strong> <span style="font-family: monospace; color: #0284c7;">${booking.transactionId}</span></p>` : ''}
              <p style="margin: 8px 0;"><strong>Booking Status:</strong> <span style="color: ${bookingConfirmed ? '#16a34a' : '#d97706'}; font-weight: bold;">${bookingConfirmed ? 'CONFIRMED ✅' : 'PENDING PAYMENT ⏳'}</span></p>
            </div>

            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                💡 <strong>Tip:</strong> Keep this email for your records. You can view your complete itinerary anytime in your account dashboard.
              </p>
            </div>

            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              If you have any questions, feel free to contact us.<br>
              Safe Travels!<br>
              <strong>The TravelZone Team</strong>
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Package booking confirmation email sent to:", recipientEmail);
  } catch (error) {
    console.error("❌ Error sending package booking email:", error);
  }
};

// Create package booking
export const createPackageBooking = async (req, res) => {
  try {
    const {
      packageId,
      travelDate,
      numberOfPeople,
      contactName,
      contactPhone,
      contactEmail,
      specialRequests,
      paymentAmountType = "full",
    } = req.body;

    const userId = req.user.id;

    // Validate package exists
    const packageData = await Package.findById(packageId);
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    // Calculate total amount
    const pricePerPerson = packageData.packageOffer
      ? packageData.packageDiscountPrice
      : packageData.packagePrice;
    const totalAmount = pricePerPerson * numberOfPeople;

    // Create booking
    const booking = await PackageBooking.create({
      userId,
      packageId,
      travelDate,
      numberOfPeople,
      totalAmount,
      contactName,
      contactPhone,
      contactEmail,
      specialRequests,
      paymentStatus: "pending",
      bookingStatus: "pending",
      paymentAmountType,
    });

    const populatedBooking = await PackageBooking.findById(booking._id)
      .populate("packageId")
      .populate("userId", "username email");

    // Send confirmation email
    sendPackageBookingEmail(populatedBooking, packageData);

    res.status(201).json({
      success: true,
      message: "Booking created successfully. Please complete payment.",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("❌ Create package booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message,
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { transactionId, paymentAmountType } = req.body;

    const booking = await PackageBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (transactionId) {
      booking.transactionId = transactionId;
    }

    if (paymentAmountType && ["advance", "full"].includes(paymentAmountType)) {
      booking.paymentAmountType = paymentAmountType;
    }

    // Automatic payment confirmation upon Razorpay transaction completion
    booking.paymentStatus = "paid";
    booking.paymentReceived = true;
    booking.bookingStatus = "confirmed";

    await booking.save();

    const updatedBooking = await PackageBooking.findById(bookingId)
      .populate("packageId")
      .populate("userId", "username email")
      .populate("paymentReviewedBy", "username email");

    // Send payment confirmation email
    sendPackageBookingEmail(updatedBooking, updatedBooking.packageId);

    res.json({
      success: true,
      message: "Payment submitted for review",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("❌ Update payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message,
    });
  }
};

export const reviewPaymentStatus = async (req, res) => {
  try {
    if (!req.user || !(req.user.role === "admin" || req.user.user_role === 1)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { bookingId } = req.params;
    const { received, paymentAmountType } = req.body;

    const booking = await PackageBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (typeof received === "boolean") {
      if (received) {
        booking.paymentStatus = "paid";
        booking.bookingStatus = "confirmed";
        booking.paymentReceived = true;
      } else {
        booking.paymentStatus = "pending";
        booking.bookingStatus = "pending";
        booking.paymentReceived = false;
      }
      booking.paymentReviewedBy = req.user.id;
      booking.paymentReviewedAt = new Date();
    }

    if (paymentAmountType && ["advance", "full"].includes(paymentAmountType)) {
      booking.paymentAmountType = paymentAmountType;
    }

    await booking.save();

    const updatedBooking = await PackageBooking.findById(bookingId)
      .populate("packageId")
      .populate("userId", "username email")
      .populate("paymentReviewedBy", "username email");

    res.json({
      success: true,
      message: "Payment review updated",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("❌ Review payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message,
    });
  }
};

// Get user bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await PackageBooking.find({ userId })
      .populate("packageId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("❌ Get user bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message,
    });
  }
};

// Get all bookings (Admin only)
export const getAllBookings = async (req, res) => {
  try {
    const { paymentStatus, bookingStatus } = req.query;

    const filter = {};
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (bookingStatus) filter.bookingStatus = bookingStatus;

    const bookings = await PackageBooking.find(filter)
      .populate("packageId")
      .populate("userId", "username email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("❌ Get all bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message,
    });
  }
};

// Get admin UPI ID
export const getAdminUPI = async (req, res) => {
  try {
    // Find admin user (user_role = 1)
    const admin = await User.findOne({ user_role: 1 }).select("upiId username");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      upiId: admin.upiId,
      adminName: admin.username,
    });
  } catch (error) {
    console.error("❌ Get admin UPI error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message,
    });
  }
};
