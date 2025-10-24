import PackageBooking from "../models/packageBooking.model.js";
import Package from "../models/package.model.js";
import User from "../models/user.model.js";

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

    // Customer submission keeps payment pending until admin review
    booking.paymentStatus = "pending";
    booking.paymentReceived = false;
    booking.paymentReviewedBy = null;
    booking.paymentReviewedAt = null;

    await booking.save();

    const updatedBooking = await PackageBooking.findById(bookingId)
      .populate("packageId")
      .populate("userId", "username email")
      .populate("paymentReviewedBy", "username email");

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
