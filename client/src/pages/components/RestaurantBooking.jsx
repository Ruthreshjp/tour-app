// client/src/pages/components/RestaurantBooking.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUtensils, FaCalendarAlt, FaUsers, FaClock, FaTable, FaWifi, FaDollarSign, FaSignInAlt } from 'react-icons/fa';
import { Image } from '../../components/Image';
import AdvancePaymentModal from './AdvancePaymentModal';

const RestaurantBooking = ({ restaurant, onBookingSuccess }) => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  const [bookingData, setBookingData] = useState({
    tableType: '',
    reservationDate: '',
    reservationTime: '',
    partySize: 1,
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);

  const ADVANCE_AMOUNT = 100;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateAmount = () => {
    if (!restaurant || !bookingData.tableType || !bookingData.reservationDate || !bookingData.reservationTime) {
      return 0;
    }

    const tables = restaurant.tables || restaurant.pricing?.tables || [];
    const table = tables.find(t => t.tableType === bookingData.tableType);
    if (!table) return 0;

    // Calculate based on party size and table pricing
    const perPersonCharge = table.pricing?.perPerson || 0;
    const tableCharge = table.pricing?.tableCharge || 0;
    
    return (perPersonCharge * bookingData.partySize) + tableCharge;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.tableType || !bookingData.reservationDate || !bookingData.reservationTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const bookingPayload = {
        businessId: restaurant._id,
        businessType: 'restaurant',
        bookingDetails: {
          tableType: bookingData.tableType,
          reservationDate: bookingData.reservationDate,
          reservationTime: bookingData.reservationTime,
          numberOfGuests: bookingData.partySize,
          checkIn: bookingData.reservationDate,
          checkOut: bookingData.reservationDate,
          guests: bookingData.partySize,
          estimatedBill: calculateAmount() // Store estimated bill for reference
        },
        amount: ADVANCE_AMOUNT, // Only ₹100 advance, not full table amount
        advanceAmount: ADVANCE_AMOUNT,
        specialRequests: bookingData.specialRequests,
        status: 'pending' // Restaurant bookings require approval like others
      };

      const response = await axios.post('/api/booking/create', bookingPayload);
      
      if (response.data.success) {
        toast.success('🎉 Booking request submitted! Please wait for restaurant approval before making payment.');
        onBookingSuccess && onBookingSuccess(response.data.booking);
        // Reset form
        setBookingData({
          tableType: '',
          reservationDate: '',
          reservationTime: '',
          partySize: 1,
          specialRequests: ''
        });
      } else {
        throw new Error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center text-gray-500">
          <p>Restaurant information not available</p>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center bg-blue-50 rounded-lg p-8">
          <FaSignInAlt className="mx-auto text-4xl text-blue-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Login Required</h3>
          <p className="text-gray-600 mb-6">
            Please login to your account to make a table reservation at {restaurant.businessName || restaurant.name}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Login to Book Table
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Create New Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Table *
          </label>
          <select
            name="tableType"
            value={bookingData.tableType}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">Select Table Type</option>
            {restaurant && (restaurant.tables || restaurant.pricing?.tables || []).filter(table => table.availability !== false).map((table, index) => (
              <option key={index} value={table.tableType}>
                {table.tableType} Table (Capacity: {table.capacity})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-1" />
              Reservation Date *
            </label>
            <input
              type="date"
              name="reservationDate"
              value={bookingData.reservationDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaClock className="inline mr-1" />
              Reservation Time *
            </label>
            <input
              type="time"
              name="reservationTime"
              value={bookingData.reservationTime}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaUsers className="inline mr-1" />
            Party Size *
          </label>
          <input
            type="number"
            name="partySize"
            value={bookingData.partySize}
            onChange={handleChange}
            min="1"
            max="20"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requests
          </label>
          <textarea
            name="specialRequests"
            value={bookingData.specialRequests}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Dietary restrictions, special occasions, etc..."
          />
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">📋 Booking Approval Process</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Your booking request will be submitted to the restaurant</p>
                <p>• <strong>Wait for restaurant approval</strong> (you'll be notified)</p>
                <p>• After approval, pay ₹{ADVANCE_AMOUNT} advance via UPI</p>
                <p>• Advance amount will be adjusted in your final bill</p>
                <p>• <strong className="text-red-600">Booking is confirmed only after paying the advance</strong></p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Estimated bill (for reference):</span>
            <span className="font-semibold">₹{calculateAmount()}</span>
          </div>
          <div className="border-t border-gray-300 my-2"></div>
          <div className="flex items-center justify-between text-lg font-bold text-orange-600">
            <span>Advance to pay (after approval):</span>
            <span>₹{ADVANCE_AMOUNT}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">
            💡 Pay only ₹{ADVANCE_AMOUNT} advance after approval. Remaining bill will be paid at the restaurant.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {loading ? 'Submitting Request...' : '📤 Submit Booking Request (No Payment Yet)'}
        </button>
      </form>
    </div>
  );
};

export default RestaurantBooking;
