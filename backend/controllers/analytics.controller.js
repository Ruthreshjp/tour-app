import Rating from "../models/rating.model.js";
import ViewTracking from "../models/viewTracking.model.js";
import Business from "../models/business.model.js";
import Booking from "../models/booking.model.js";

// Track business view
export const trackBusinessView = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { source = 'direct' } = req.body;
    const userId = req.user?.id;
    const userName = req.user?.name || 'Anonymous';
    const userEmail = req.user?.email || '';

    // Find business
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found"
      });
    }

    // Increment total views
    business.totalViews += 1;

    // Add to views array (keep only last 1000 views for performance)
    business.views.unshift({
      userId,
      userName,
      userEmail,
      viewedAt: new Date(),
      source
    });

    // Keep only last 1000 views
    if (business.views.length > 1000) {
      business.views = business.views.slice(0, 1000);
    }

    await business.save();

    // Also track in separate collection for detailed analytics
    if (userId) {
      await ViewTracking.findOneAndUpdate(
        { businessId, userId },
        {
          businessId,
          userId,
          userName,
          userEmail,
          viewedAt: new Date(),
          source
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: "View tracked successfully"
    });
  } catch (error) {
    console.error("Track business view error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred"
    });
  }
};

// Create rating/review
export const createRating = async (req, res) => {
  try {
    const { bookingId, rating, review, businessId: inputBusinessId } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    let business = null;
    let ratingData = {
      userId,
      rating: parseInt(rating),
      review: review?.trim() || ''
    };

    if (bookingId) {
      const booking = await Booking.findOne({ _id: bookingId, userId })
        .populate('businessId', 'businessName businessType totalReviews rating');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found"
        });
      }

      if (booking.status !== 'confirmed' || booking.paymentStatus !== 'paid') {
        return res.status(400).json({
          success: false,
          message: "You can only rate completed bookings"
        });
      }

      const existingRating = await Rating.findOne({ bookingId, userId });
      if (existingRating) {
        return res.status(400).json({
          success: false,
          message: "You have already rated this booking"
        });
      }

      business = booking.businessId;
      ratingData = {
        ...ratingData,
        businessId: business._id,
        bookingId,
        businessType: booking.businessId.businessType,
        source: 'booking',
        isVerified: true
      };
    } else {
      if (!inputBusinessId) {
        return res.status(400).json({
          success: false,
          message: "businessId is required for direct ratings"
        });
      }

      business = await Business.findById(inputBusinessId).select('businessType');
      if (!business) {
        return res.status(404).json({
          success: false,
          message: "Business not found"
        });
      }

      const existingRating = await Rating.findOne({ businessId: inputBusinessId, userId, source: 'direct' });
      if (existingRating) {
        return res.status(400).json({
          success: false,
          message: "You have already rated this business"
        });
      }

      ratingData = {
        ...ratingData,
        businessId: inputBusinessId,
        businessType: business.businessType,
        source: 'direct',
        isVerified: false
      };
    }

    const newRating = new Rating(ratingData);
    await newRating.save();

    const aggregation = await Rating.aggregate([
      { $match: { businessId: newRating.businessId } },
      {
        $group: {
          _id: '$businessId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    let summary = null;
    if (aggregation.length > 0) {
      const { averageRating, totalReviews } = aggregation[0];
      await Business.findByIdAndUpdate(newRating.businessId, {
        rating: Math.round(averageRating * 10) / 10,
        totalReviews
      });
      summary = {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews
      };
    }

    res.json({
      success: true,
      message: "Rating submitted successfully",
      rating: newRating,
      summary
    });
  } catch (error) {
    console.error("Create rating error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred"
    });
  }
};

// Get business analytics
export const getBusinessAnalytics = async (req, res) => {
  try {
    const businessId = req.businessId;

    const business = await Business.findById(businessId)
      .select('totalViews totalBookings totalReviews rating businessName');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found"
      });
    }

    res.json({
      success: true,
      analytics: {
        totalViews: business.totalViews,
        totalBookings: business.totalBookings,
        totalReviews: business.totalReviews,
        averageRating: business.rating
      }
    });
  } catch (error) {
    console.error("Get business analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred"
    });
  }
};

// Get detailed views
export const getBusinessViews = async (req, res) => {
  try {
    const businessId = req.businessId;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const views = await ViewTracking.find({ businessId })
      .sort({ viewedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('userName userEmail viewedAt source');

    const totalViews = await ViewTracking.countDocuments({ businessId });

    res.json({
      success: true,
      views,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalViews / parseInt(limit)),
        totalViews,
        hasMore: skip + views.length < totalViews
      }
    });
  } catch (error) {
    console.error("Get business views error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred"
    });
  }
};

// Get detailed bookings
export const getBusinessBookingsDetailed = async (req, res) => {
  try {
    const businessId = req.businessId;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find({ businessId })
      .populate('userId', 'username email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('userId bookingDetails amount status paymentStatus createdAt transactionId');

    const totalBookings = await Booking.countDocuments({ businessId });

    res.json({
      success: true,
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBookings / parseInt(limit)),
        totalBookings,
        hasMore: skip + bookings.length < totalBookings
      }
    });
  } catch (error) {
    console.error("Get business bookings detailed error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred"
    });
  }
};

// Get detailed ratings/reviews
export const getBusinessRatings = async (req, res) => {
  try {
    const businessId = req.businessId;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const ratings = await Rating.find({ businessId })
      .populate('userId', 'username email')
      .populate('bookingId', 'bookingDetails amount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalRatings = await Rating.countDocuments({ businessId });

    res.json({
      success: true,
      ratings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRatings / parseInt(limit)),
        totalRatings,
        hasMore: skip + ratings.length < totalRatings
      }
    });
  } catch (error) {
    console.error("Get business ratings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred"
    });
  }
};
