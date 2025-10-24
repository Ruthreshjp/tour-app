import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft, FaCalendarAlt, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaRupeeSign, FaCreditCard, FaCheckCircle, FaClock, FaTimesCircle, FaSearch } from "react-icons/fa";

const AnalyticsBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [currentPage, searchTerm]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("businessToken");
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm })
      });

      const res = await fetch(`/api/analytics/business/bookings-detailed?${params}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();

      if (data?.success) {
        setBookings(data.bookings);
        setTotalPages(data.pagination.totalPages);
        setTotalBookings(data.pagination.totalBookings);
        setHasMore(data.pagination.hasMore);
      } else {
        toast.error("Failed to fetch bookings data");
        if (data?.message === "Unauthorized") {
          navigate("/business/login");
        }
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Server error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBookings();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending_approval':
        return <FaClock className="text-yellow-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaCalendarAlt className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatBookingDetails = (booking) => {
    const details = booking.bookingDetails;
    switch (booking.businessType) {
      case 'hotel':
        return `${details.roomType} room for ${details.guests} guests (${formatDate(details.checkIn)} - ${formatDate(details.checkOut)})`;
      case 'restaurant':
        return `Table for ${details.numberOfGuests} guests on ${formatDate(details.reservationDate)} at ${details.reservationTime}`;
      case 'cafe':
        return `Table for ${details.partySize} guests on ${formatDate(details.visitDate)} at ${details.visitTime}`;
      case 'cab':
        return `Ride from ${details.pickupLocation} to ${details.dropLocation} on ${formatDate(details.pickupTime)}`;
      default:
        return 'Booking details';
    }
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
                <span className="text-[#6358DC]">Booking Analytics</span>
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
            <FaCalendarAlt className="text-2xl text-green-500" />
            <h2 className="text-xl font-semibold text-gray-800">Bookings Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{totalBookings.toLocaleString()}</p>
              <p className="text-sm text-green-700">Total Bookings</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
              <p className="text-sm text-blue-700">Bookings This Page</p>
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Customer Bookings</h3>
            <p className="text-sm text-gray-600 mt-1">Detailed view of all customer bookings</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center">
              <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500">No bookings found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm ? "Try adjusting your search terms" : "Bookings will appear here when customers make reservations"}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {bookings.map((booking, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Customer Info */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{booking.userId?.username || 'Unknown User'}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <FaEnvelope className="text-xs" />
                                <span>{booking.userId?.email || booking.userId?.username}</span>
                              </div>
                              {booking.userId?.phone && (
                                <div className="flex items-center gap-1">
                                  <FaPhone className="text-xs" />
                                  <span>{booking.userId.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Booking Details */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-700">Booking Details:</span>
                          </div>
                          <p className="text-sm text-gray-600">{formatBookingDetails(booking)}</p>
                        </div>

                        {/* Payment & Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <FaRupeeSign className="text-green-600" />
                              <span className="font-semibold text-green-600">₹{booking.amount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaCreditCard className="text-blue-600" />
                              <span className="text-sm text-blue-600">
                                {booking.paymentStatus === 'paid' ? 'Paid' : booking.paymentStatus === 'pending' ? 'Pending' : 'Not Paid'}
                              </span>
                            </div>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span>{booking.status.replace('_', ' ').toUpperCase()}</span>
                          </div>
                        </div>

                        {/* Transaction ID */}
                        {booking.transactionId && (
                          <div className="mt-2 text-xs text-gray-500">
                            Transaction ID: {booking.transactionId}
                          </div>
                        )}

                        {/* Booking Date */}
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <FaCalendarAlt />
                          <span>Booked on {formatDate(booking.createdAt)}</span>
                        </div>
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
                      Page {currentPage} of {totalPages} ({totalBookings} total bookings)
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

export default AnalyticsBookings;
