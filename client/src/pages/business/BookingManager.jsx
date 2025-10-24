import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaBed, FaCar, FaMapMarkerAlt, FaClock, FaUsers, FaUtensils, FaStickyNote } from 'react-icons/fa';
import axios from 'axios';

const BookingManager = () => {
  const { currentBusiness } = useSelector((state) => state.business);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [roomNumber, setRoomNumber] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching business bookings...');
      
      const response = await axios.get('/api/booking/business', {
        withCredentials: true
      });
      
      console.log('📡 Booking response:', response.data);
      
      if (response.data.success) {
        setBookings(response.data.bookings);
        console.log(`✅ Loaded ${response.data.bookings.length} bookings`);
      } else {
        console.log('❌ API returned success: false');
        toast.error(response.data.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      console.error('❌ Error details:', error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check if you have any bookings or try again later.');
      } else {
        toast.error('Failed to fetch bookings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, status, roomNum = null) => {
    try {
      const response = await axios.patch(`/api/booking/${bookingId}/status`, {
        status,
        roomNumber: roomNum
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(`Booking ${status} successfully`);
        fetchBookings();
        setShowRoomModal(false);
        setSelectedBooking(null);
        setRoomNumber('');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const handleAcceptBooking = (booking) => {
    if (currentBusiness?.businessType === 'hotel') {
      setSelectedBooking(booking);
      setShowRoomModal(true);
    } else {
      handleStatusUpdate(booking._id, 'confirmed');
    }
  };

  const handleRoomAssignment = () => {
    if (!roomNumber.trim()) {
      toast.error('Please enter a room number');
      return;
    }
    handleStatusUpdate(selectedBooking._id, 'confirmed', roomNumber);
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'pending_verification': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleVerifyPayment = async (bookingId, paymentReceived) => {
    try {
      const response = await axios.patch(`/api/booking/${bookingId}/verify-payment`, {
        paymentReceived
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(paymentReceived ? 'Payment verified successfully!' : 'Payment rejected');
        fetchBookings();
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    }
  };

  const renderBookingCard = (booking) => {
    const isApprovalPending = booking.status === 'pending' || booking.status === 'pending_approval';

    return (
      <div key={booking._id} className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <FaUser className="text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {booking.userId?.username || 'Guest'}
              </h3>
              <div className="flex items-center text-gray-600 text-sm">
                <FaEnvelope className="mr-1" />
                {booking.userId?.email}
              </div>
              {booking.userId?.phone && (
                <div className="flex items-center text-gray-600 text-sm">
                  <FaPhone className="mr-1" />
                  {booking.userId.phone}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
            {booking.status === 'confirmed' && (
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                  {booking.paymentStatus}
                </span>
                {booking.paymentStatus === 'paid' && booking.transactionId && (
                  <div className="text-xs text-gray-600 mt-1">
                    TXN: {booking.transactionId}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Booking Details by Business Type */}
        {booking.businessType === 'cab' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-start text-gray-600">
              <FaMapMarkerAlt className="mr-2 mt-1 text-green-600" />
              <div className="flex-1">
                <div className="text-xs text-gray-500">Pickup Location</div>
                <div className="text-sm font-medium mb-1">{booking.bookingDetails?.pickupLocation || 'Not provided'}</div>
                {booking.bookingDetails?.currentLocation && (
                  <a
                    href={`https://www.google.com/maps?q=${booking.bookingDetails.currentLocation.lat},${booking.bookingDetails.currentLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    <FaMapMarkerAlt className="text-xs" />
                    Open in Google Maps
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-start text-gray-600">
              <FaMapMarkerAlt className="mr-2 mt-1 text-red-600" />
              <div className="flex-1">
                <div className="text-xs text-gray-500">Drop Location</div>
                <div className="text-sm font-medium mb-1">{booking.bookingDetails?.dropLocation || 'Not provided'}</div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.bookingDetails?.dropLocation || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  <FaMapMarkerAlt className="text-xs" />
                  Search in Google Maps
                </a>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <FaClock className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Pickup Time</div>
                <div className="text-sm font-medium">
                  {booking.bookingDetails?.pickupTime ? new Date(booking.bookingDetails.pickupTime).toLocaleString() : 'Not provided'}
                </div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <FaUsers className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Passengers</div>
                <div className="text-sm font-medium">{booking.bookingDetails?.passengers ?? 'Not provided'}</div>
              </div>
            </div>
            {booking.bookingDetails?.vehicleType && (
              <div className="flex items-center text-gray-600">
                <FaCar className="mr-2" />
                <div>
                  <div className="text-xs text-gray-500">Vehicle Type</div>
                  <div className="text-sm font-medium capitalize">
                    {booking.bookingDetails.vehicleType}
                    {booking.bookingDetails.isAC !== undefined && ` (${booking.bookingDetails.isAC ? 'AC' : 'Non-AC'})`}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <FaMoneyBillWave className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Advance Payment</div>
                <div className="text-lg font-semibold text-orange-600">₹{booking.amount}</div>
                <div className="text-xs text-gray-500">Final fare settled after trip completion</div>
              </div>
            </div>
          </div>
        )}
        {booking.businessType === 'restaurant' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <FaCalendarAlt className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Reservation Date</div>
                <div className="text-sm font-medium">
                  {booking.bookingDetails?.reservationDate ? new Date(booking.bookingDetails.reservationDate).toLocaleDateString() : 'Not provided'}
                </div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <FaClock className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Reservation Time</div>
                <div className="text-sm font-medium">{booking.bookingDetails?.reservationTime || 'Not provided'}</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <FaUtensils className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Table Type</div>
                <div className="text-sm font-medium capitalize">{booking.bookingDetails?.tableType || 'Not provided'}</div>
                <div className="text-xs text-gray-500">Party of {booking.bookingDetails?.numberOfGuests ?? 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <FaMoneyBillWave className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Estimated Bill</div>
                <div className="text-sm font-medium">₹{booking.bookingDetails?.estimatedBill ?? 'N/A'}</div>
                <div className="text-xs text-orange-600">Advance: ₹{booking.amount}</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600 col-span-full">
              <FaStickyNote className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Booking Note</div>
                <div className="text-sm">
                  Table reservation for {booking.bookingDetails?.numberOfGuests ?? 'N/A'} guests at {booking.bookingDetails?.reservationTime || 'Not provided'}
                </div>
              </div>
            </div>
          </div>
        )}
        {booking.businessType === 'cafe' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <FaCalendarAlt className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Visit Date</div>
                <div className="text-sm font-medium">
                  {booking.bookingDetails?.visitDate ? new Date(booking.bookingDetails.visitDate).toLocaleDateString() : 'Not provided'}
                </div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <FaClock className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Visit Time</div>
                <div className="text-sm font-medium">{booking.bookingDetails?.visitTime || 'Not provided'}</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <FaUtensils className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Table Preference</div>
                <div className="text-sm font-medium capitalize">{booking.bookingDetails?.tableType || 'Not provided'}</div>
                <div className="text-xs text-gray-500">Party of {booking.bookingDetails?.numberOfGuests ?? 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <FaMoneyBillWave className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Estimated Bill</div>
                <div className="text-sm font-medium">₹{booking.bookingDetails?.estimatedBill ?? 'N/A'}</div>
                <div className="text-xs text-orange-600">Advance: ₹{booking.amount}</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600 col-span-full">
              <FaStickyNote className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Booking Note</div>
                <div className="text-sm">
                  Table reservation for {booking.bookingDetails?.numberOfGuests ?? 'N/A'} guests at {booking.bookingDetails?.visitTime || 'Not provided'}
                </div>
              </div>
            </div>
          </div>
        )}
        {booking.businessType === 'hotel' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <FaCalendarAlt className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Check-in Date</div>
                <div className="text-sm font-medium">
                  {booking.bookingDetails?.checkInDate ? new Date(booking.bookingDetails.checkInDate).toLocaleDateString() : 'Not provided'}
                </div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <FaClock className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Check-in Time</div>
                  <div className="text-sm font-medium">{booking.bookingDetails?.checkInTime || 'Not provided'}</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <FaCalendarAlt className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Check-out Date</div>
                <div className="text-sm font-medium">
                  {booking.bookingDetails?.checkOutDate ? new Date(booking.bookingDetails.checkOutDate).toLocaleDateString() : 'Not provided'}
                </div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <FaClock className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Check-out Time</div>
                <div className="text-sm font-medium">{booking.bookingDetails?.checkOutTime || 'Not provided'}</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <FaBed className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Room Type</div>
                <div className="text-sm font-medium capitalize">{booking.bookingDetails?.roomType || 'Not provided'}</div>
                <div className="text-xs text-gray-500">Guests: {booking.bookingDetails?.numberOfGuests ?? 'N/A'}</div>
                {booking.roomNumber && (
                  <div className="text-xs text-green-600 font-semibold mt-1">Assigned Room: #{booking.roomNumber}</div>
                )}
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <FaMoneyBillWave className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Total Bill</div>
                <div className="text-sm font-medium">₹{booking.bookingDetails?.totalBill ?? booking.amount ?? 'N/A'}</div>
                <div className="text-xs text-orange-600">Advance: ₹{booking.amount}</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600 col-span-full">
              <FaStickyNote className="mr-2" />
              <div>
                <div className="text-xs text-gray-500">Booking Note</div>
                <div className="text-sm">
                  Room booking for {booking.bookingDetails?.numberOfGuests ?? 'N/A'} guests from {booking.bookingDetails?.checkInDate || 'N/A'} to {booking.bookingDetails?.checkOutDate || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Cab navigation helper */}
        {booking.businessType === 'cab' && booking.bookingDetails?.currentLocation && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">🗺️ Navigation</h4>
                <p className="text-xs text-blue-700">Get directions to pickup location</p>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${booking.bookingDetails.currentLocation.lat},${booking.bookingDetails.currentLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <FaMapMarkerAlt />
                Get Directions
              </a>
            </div>
          </div>
        )}

        {/* Special requests */}
        {booking.specialRequests && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Special Requests:</h4>
            <p className="text-sm text-gray-600">{booking.specialRequests}</p>
          </div>
        )}

        {/* Payment verification */}
        {booking.paymentStatus === 'pending_verification' && booking.transactionId && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
            <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              💳 Payment Verification Required
            </h4>
            <p className="text-sm text-yellow-800 mb-2">
              Customer has submitted payment with Transaction ID: <span className="font-mono font-bold">{booking.transactionId}</span>
            </p>
            <p className="text-xs text-yellow-700 mb-3">
              Please check your UPI account and verify if you received the payment of ₹{booking.amount}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleVerifyPayment(booking._id, true)}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 flex items-center justify-center font-medium"
              >
                <FaCheckCircle className="mr-2" />
                Yes, Payment Received
              </button>
              <button
                onClick={() => handleVerifyPayment(booking._id, false)}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 flex items-center justify-center font-medium"
              >
                <FaTimesCircle className="mr-2" />
                No, Not Received
              </button>
            </div>
          </div>
        )}

        {/* Approval controls */}
        {isApprovalPending && (
          <div className="flex space-x-3">
            <button
              onClick={() => handleAcceptBooking(booking)}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 flex items-center justify-center"
            >
              <FaCheckCircle className="mr-2" />
              Accept Booking
            </button>
            <button
              onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 flex items-center justify-center"
            >
              <FaTimesCircle className="mr-2" />
              Decline Booking
            </button>
          </div>
        )}

        {booking.status === 'confirmed' && booking.businessType === 'restaurant' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              ✅ Restaurant booking automatically confirmed. Customer can now pay advance.
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          Booking created: {new Date(booking.createdAt).toLocaleString()}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading bookings...</h3>
        <p className="text-gray-500">Please wait a moment.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Booking Management</h2>
        <div className="flex space-x-2">
          {['all', 'pending', 'confirmed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings found</h3>
          <p className="text-gray-500">
            {filter === 'all' ? 'No bookings yet.' : `No ${filter} bookings.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBookings.map((booking) => renderBookingCard(booking))}
        </div>
      )}

      {/* Room Assignment Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Assign Room Number</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Number *
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Enter room number (e.g., 101, A-205)"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRoomModal(false);
                  setSelectedBooking(null);
                  setRoomNumber('');
                }}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleRoomAssignment}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManager;
