import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaEye, FaClock, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';

const BookingManagement = () => {
  const { currentBusiness } = useSelector((state) => state.business);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/business/bookings/${currentBusiness._id}?status=${filter}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action, reason = '') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/business/bookings/${bookingId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          businessId: currentBusiness._id,
          reason: reason
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Booking ${action}ed successfully`);
        if (action === 'accept') {
          setVerificationCode(data.verificationCode);
        }
        fetchBookings();
        setShowModal(false);
        setSelectedBooking(null);
      } else {
        toast.error(data.message || `Failed to ${action} booking`);
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      toast.error(`Failed to ${action} booking`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBookingTypeDetails = (booking) => {
    switch (currentBusiness.businessType) {
      case 'hotel':
        return {
          title: `Room Booking - ${booking.roomType || 'Standard'}`,
          details: [
            `Check-in: ${formatDate(booking.checkIn)}`,
            `Check-out: ${formatDate(booking.checkOut)}`,
            `Guests: ${booking.guests || booking.persons}`,
            `Room Type: ${booking.roomType || 'Standard'}`,
            `Duration: ${booking.duration || 'TBD'}`
          ]
        };
      case 'restaurant':
        return {
          title: `Table Reservation - Table ${booking.tableNumber || 'TBD'}`,
          details: [
            `Date: ${formatDate(booking.reservationDate || booking.date)}`,
            `Time: ${booking.reservationTime || 'TBD'}`,
            `Guests: ${booking.guests || booking.persons}`,
            `Table Type: ${booking.tableType || 'Regular'}`,
            `Occasion: ${booking.occasion || 'General'}`
          ]
        };
      case 'cab':
        return {
          title: `Cab Booking - ${booking.vehicleType || 'Standard'}`,
          details: [
            `Pickup: ${formatDate(booking.pickupDate || booking.date)}`,
            `From: ${booking.pickupLocation || 'TBD'}`,
            `To: ${booking.dropLocation || 'TBD'}`,
            `Passengers: ${booking.passengers || booking.persons}`,
            `Trip Type: ${booking.tripType || 'One Way'}`
          ]
        };
      case 'cafe':
        return {
          title: `Cafe Reservation`,
          details: [
            `Date: ${formatDate(booking.date)}`,
            `Time: ${booking.time || 'TBD'}`,
            `Guests: ${booking.persons}`,
            `Seating: ${booking.seatingPreference || 'Any'}`
          ]
        };
      case 'shopping':
        return {
          title: `Shopping Appointment`,
          details: [
            `Date: ${formatDate(booking.date)}`,
            `Time: ${booking.time || 'TBD'}`,
            `Service: ${booking.serviceType || 'General Shopping'}`,
            `Category: ${booking.category || 'General'}`
          ]
        };
      default:
        return {
          title: 'Service Booking',
          details: [
            `Date: ${formatDate(booking.date)}`,
            `Persons: ${booking.persons}`,
            `Service: ${booking.serviceType || 'General'}`
          ]
        };
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Booking Management</h2>
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="pending">Pending Bookings</option>
            <option value="accepted">Accepted Bookings</option>
            <option value="declined">Declined Bookings</option>
            <option value="completed">Completed Bookings</option>
            <option value="all">All Bookings</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No bookings found for the selected filter.</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const bookingDetails = getBookingTypeDetails(booking);
            return (
              <div key={booking._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{bookingDetails.title}</h3>
                    <p className="text-sm text-gray-600">Booking ID: {booking._id.slice(-8)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* Customer Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Customer Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center">
                        <FaUser className="w-4 h-4 mr-2" />
                        {booking.customerName || booking.buyer?.name || 'N/A'}
                      </p>
                      <p className="flex items-center">
                        <FaPhone className="w-4 h-4 mr-2" />
                        {booking.customerPhone || booking.buyer?.phone || 'N/A'}
                      </p>
                      <p className="flex items-center">
                        <FaEnvelope className="w-4 h-4 mr-2" />
                        {booking.customerEmail || booking.buyer?.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Booking Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {bookingDetails.details.map((detail, index) => (
                        <p key={index}>{detail}</p>
                      ))}
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Booking Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Booking ID:</strong> {booking._id.slice(-8)}</p>
                      <p><strong>Booked On:</strong> {formatDate(booking.createdAt)}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Special Requests</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {booking.specialRequests}
                    </p>
                  </div>
                )}

                {/* Verification Code Display */}
                {booking.status === 'accepted' && booking.verificationCode && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Verification Code</h4>
                    <p className="text-2xl font-bold text-green-600 tracking-wider">
                      {booking.verificationCode}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Share this code with the customer for entry verification
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowModal(true);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <FaEye className="w-4 h-4 mr-2" />
                    View Details
                  </button>

                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleBookingAction(booking._id, 'accept')}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                      >
                        <FaCheck className="w-4 h-4 mr-2" />
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Please provide a reason for declining (optional):');
                          handleBookingAction(booking._id, 'decline', reason);
                        }}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                      >
                        <FaTimes className="w-4 h-4 mr-2" />
                        Decline
                      </button>
                    </>
                  )}

                  {booking.status === 'accepted' && (
                    <button
                      onClick={() => handleBookingAction(booking._id, 'complete')}
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      <FaCheck className="w-4 h-4 mr-2" />
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Booking Details</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBooking(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Complete booking details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedBooking.customerName || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedBooking.customerPhone || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedBooking.customerEmail || 'N/A'}</p>
                    <p><strong>Address:</strong> {selectedBooking.customerAddress || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Booking Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                    </p>
                    <p><strong>Booking ID:</strong> {selectedBooking._id.slice(-8)}</p>
                    <p><strong>Booked On:</strong> {formatDate(selectedBooking.createdAt)}</p>
                  </div>
                </div>
              </div>

              {selectedBooking.specialRequests && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Special Requests</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">
                    {selectedBooking.specialRequests}
                  </p>
                </div>
              )}

              {selectedBooking.status === 'accepted' && selectedBooking.verificationCode && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Verification Code</h4>
                  <p className="text-3xl font-bold text-green-600 tracking-wider text-center">
                    {selectedBooking.verificationCode}
                  </p>
                  <p className="text-sm text-green-600 mt-2 text-center">
                    Customer should present this code for entry verification
                  </p>
                </div>
              )}

              {selectedBooking.status === 'declined' && selectedBooking.declineReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Decline Reason</h4>
                  <p className="text-sm text-red-600">{selectedBooking.declineReason}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Code Display Modal */}
      {verificationCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Booking Accepted!</h3>
              <p className="text-gray-600 mb-4">Verification code generated for customer entry:</p>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <p className="text-3xl font-bold text-green-600 tracking-wider">
                  {verificationCode}
                </p>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                This code has been sent to the customer via email and SMS.
              </p>
              
              <button
                onClick={() => setVerificationCode('')}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
