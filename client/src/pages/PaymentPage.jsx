import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import UPIPayment from './components/UPIPayment';
import { FaHotel, FaCalendarAlt, FaUsers, FaDollarSign, FaCheckCircle } from 'react-icons/fa';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/booking/${bookingId}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setBooking(response.data.booking);
      } else {
        toast.error('Booking not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to load booking details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = (updatedBooking) => {
    setBooking(updatedBooking);
    setShowPayment(false);
    toast.success('🎉 Payment completed successfully!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">The booking you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Payment Page</h1>
                <p className="text-blue-100">Complete your booking payment</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100">Booking ID</p>
                <p className="font-mono text-lg">{booking._id.slice(-8)}</p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Business Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaHotel className="mr-2 text-blue-500" />
                  Business Details
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-800">{booking.businessId?.businessName}</p>
                  <p className="text-gray-600">{booking.businessId?.address}</p>
                  <p className="text-gray-600">{booking.businessId?.city}, {booking.businessId?.state}</p>
                  <p className="text-gray-600">📞 {booking.businessId?.phone}</p>
                </div>
              </div>

              {/* Booking Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaCalendarAlt className="mr-2 text-green-500" />
                  Booking Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">{formatDate(booking.bookingDetails.checkIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">{formatDate(booking.bookingDetails.checkOut)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Type:</span>
                    <span className="font-medium capitalize">{booking.bookingDetails.roomType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium flex items-center">
                      <FaUsers className="mr-1" />
                      {booking.bookingDetails.guests}
                    </span>
                  </div>
                  {booking.roomNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Number:</span>
                      <span className="font-medium text-green-600">#{booking.roomNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaDollarSign className="text-blue-600 mr-2" />
                  <div>
                    <p className="font-semibold text-blue-800">Total Amount: ₹{booking.amount}</p>
                    <p className="text-sm text-blue-600">
                      Status: <span className="capitalize font-medium">{booking.paymentStatus}</span>
                    </p>
                  </div>
                </div>
                {booking.paymentStatus === 'paid' && (
                  <FaCheckCircle className="text-green-500 text-2xl" />
                )}
              </div>
            </div>

            {/* Payment Actions */}
            {booking.paymentStatus === 'pending' ? (
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Payment Method</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    💳 Pay with UPI
                  </button>
                  <p className="text-gray-500 text-sm">
                    or you can pay cash directly at the hotel during check-in
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <FaCheckCircle className="text-green-500 text-3xl mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-green-800">Payment Completed!</h3>
                  <p className="text-green-600">
                    Transaction ID: {booking.transactionId}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  Back to Home
                </button>
              </div>
            )}

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Special Requests</h4>
                <p className="text-yellow-700">{booking.specialRequests}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UPI Payment Modal */}
      {showPayment && (
        <UPIPayment
          booking={booking}
          onPaymentComplete={handlePaymentComplete}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};

export default PaymentPage;
