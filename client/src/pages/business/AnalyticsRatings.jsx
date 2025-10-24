import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft, FaStar, FaUser, FaEnvelope, FaCalendarAlt, FaCommentDots, FaSearch } from "react-icons/fa";

const AnalyticsRatings = () => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchRatings();
  }, [currentPage, searchTerm]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("businessToken");
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm })
      });

      const res = await fetch(`/api/analytics/business/ratings?${params}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();

      if (data?.success) {
        setRatings(data.ratings);
        setTotalPages(data.pagination.totalPages);
        setTotalRatings(data.pagination.totalRatings);
        setHasMore(data.pagination.hasMore);
      } else {
        toast.error("Failed to fetch ratings data");
        if (data?.message === "Unauthorized") {
          navigate("/business/login");
        }
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
      toast.error("Server error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRatings();
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatBookingDetails = (booking) => {
    if (!booking) return 'N/A';

    const details = booking.bookingDetails;
    // This would need to be adjusted based on your booking structure
    return `Booking #${booking._id?.toString().slice(-8)}`;
  };

  return (
    <div className="min-h-screen bg-[#FFF1DA]">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/business/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FaArrowLeft />
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                <span className="text-[#6358DC]">Ratings & Reviews Analytics</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FaStar className="text-2xl text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-800">Reviews Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{totalRatings.toLocaleString()}</p>
              <p className="text-sm text-yellow-700">Total Reviews</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{ratings.length}</p>
              <p className="text-sm text-blue-700">Reviews This Page</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{currentPage}</p>
              <p className="text-sm text-purple-700">Current Page</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {/* Ratings List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Customer Reviews</h3>
            <p className="text-sm text-gray-600 mt-1">Detailed view of all customer ratings and feedback</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading reviews...</p>
            </div>
          ) : ratings.length === 0 ? (
            <div className="p-8 text-center">
              <FaStar className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500">No reviews found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm ? "Try adjusting your search terms" : "Reviews will appear here when customers rate their experience"}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {ratings.map((rating, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Customer Avatar */}
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaUser className="text-yellow-600" />
                      </div>

                      {/* Review Content */}
                      <div className="flex-1 min-w-0">
                        {/* Customer Info */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium text-gray-900">{rating.userId?.username || 'Anonymous'}</h4>
                            <div className="flex items-center gap-1">
                              {renderStars(rating.rating)}
                              <span className="text-sm text-gray-600 ml-1">({rating.rating}/5)</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <FaCalendarAlt className="text-xs" />
                            <span>{formatDate(rating.createdAt)}</span>
                          </div>
                        </div>

                        {/* Customer Contact */}
                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FaEnvelope className="text-xs" />
                            <span>{rating.userId?.email || 'N/A'}</span>
                          </div>
                          <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Verified Review
                          </div>
                        </div>

                        {/* Booking Reference */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Booking:</span> {formatBookingDetails(rating.bookingId)}
                          </p>
                        </div>

                        {/* Review Text */}
                        {rating.review && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <FaCommentDots className="text-blue-600 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-blue-900 mb-1">Customer Feedback</p>
                                <p className="text-sm text-blue-800 leading-relaxed">{rating.review}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Review without text */}
                        {!rating.review && (
                          <div className="text-sm text-gray-500 italic">
                            Rated {rating.rating} star{rating.rating !== 1 ? 's' : ''} without additional comments
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages} ({totalRatings} total reviews)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={!hasMore}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsRatings;
