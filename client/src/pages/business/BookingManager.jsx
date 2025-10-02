import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaBed } from 'react-icons/fa';
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
      const response = await axios.get('/api/booking/business', {
        withCredentials: true
      });
      
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
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
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md p-6">
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
                  <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-2" />
                  <div>
                    <div className="text-sm">Check-in: {new Date(booking.bookingDetails.checkIn).toLocaleDateString()}</div>
                    <div className="text-sm">Check-out: {new Date(booking.bookingDetails.checkOut).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaBed className="mr-2" />
                  <div>
                    <div className="text-sm">Room: {booking.bookingDetails.roomType}</div>
                    <div className="text-sm">Guests: {booking.bookingDetails.guests}</div>
                    {booking.roomNumber && (
                      <div className="text-sm font-medium text-green-600">Room #{booking.roomNumber}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaMoneyBillWave className="mr-2" />
                  <div>
                    <div className="text-lg font-semibold">₹{booking.amount}</div>
                    {booking.paymentStatus === 'paid' && booking.transactionId && (
                      <div className="text-xs text-green-600">TXN: {booking.transactionId}</div>
                    )}
                  </div>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Special Requests:</h4>
                  <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                </div>
              )}

              {booking.status === 'pending' && (
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

              <div className="text-xs text-gray-500 mt-4">
                Booking created: {new Date(booking.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
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
