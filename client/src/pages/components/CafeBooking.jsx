import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaClock, FaCommentDots, FaSignInAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const DEFAULT_CAFE_TABLE_OPTIONS = [
  { value: 'window', label: 'Window Seat' },
  { value: 'corner', label: 'Corner Table' },
  { value: 'work-friendly', label: 'Work-Friendly (with charging)' },
  { value: 'cozy', label: 'Cozy Booth' },
  { value: 'regular', label: 'Regular Table' }
];

const formatTableTypeLabel = (value) =>
  value
    ? value
        .toString()
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : '';

const CafeBooking = ({ cafe, onBookingSuccess }) => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [bookingData, setBookingData] = useState({
    tableType: '',
    visitDate: '',
    visitTime: '',
    partySize: 1,
    specialRequests: ''
  });

  const businessTables = useMemo(() => {
    if (!cafe) return [];
    return Array.isArray(cafe.tables)
      ? cafe.tables
      : Array.isArray(cafe.pricing?.tables)
        ? cafe.pricing.tables
        : [];
  }, [cafe]);

  const availableTableOptions = useMemo(() => {
    if (businessTables.length > 0) {
      return businessTables
        .filter((table) => table.availability !== false)
        .map((table) => ({
          value: table.tableType,
          label: `${formatTableTypeLabel(table.tableType)} (Capacity: ${table.capacity || 'N/A'})`,
          capacity: table.capacity,
          pricing: table.pricing || {}
        }));
    }

    return DEFAULT_CAFE_TABLE_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
      capacity: undefined,
      pricing: {}
    }));
  }, [businessTables]);

  useEffect(() => {
    if (availableTableOptions.length === 1 && !bookingData.tableType) {
      setBookingData((prev) => ({ ...prev, tableType: availableTableOptions[0].value }));
    }
  }, [availableTableOptions, bookingData.tableType]);

  const [loading, setLoading] = useState(false);

  const ADVANCE_AMOUNT = 50; // Lower advance for cafes

  // Check if user is logged in
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center bg-blue-50 rounded-lg p-8">
          <FaSignInAlt className="mx-auto text-4xl text-blue-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Login Required</h3>
          <p className="text-gray-600 mb-6">
            Please login to your account to book a table at {cafe.businessName || cafe.name}
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateAmount = () => {
    if (!bookingData.tableType) return 0;

    const selectedTable = availableTableOptions.find((option) => option.value === bookingData.tableType);
    if (selectedTable && selectedTable.pricing) {
      const perPerson = Number(selectedTable.pricing.perPerson) || 0;
      const tableCharge = Number(selectedTable.pricing.tableCharge) || 0;
      return (perPerson * bookingData.partySize) + tableCharge;
    }

    const baseAmount = 200;
    const perPersonExtra = 50;
    return baseAmount + Math.max(0, bookingData.partySize - 1) * perPersonExtra;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('Please login to make a booking');
      return;
    }

    try {
      setLoading(true);

      const bookingPayload = {
        businessId: cafe._id,
        businessType: 'cafe',
        bookingDetails: {
          tableType: bookingData.tableType,
          visitDate: bookingData.visitDate,
          visitTime: bookingData.visitTime,
          numberOfGuests: bookingData.partySize,
          checkIn: bookingData.visitDate,
          checkOut: bookingData.visitDate, // Same day for cafe visits
          guests: bookingData.partySize,
          estimatedBill: calculateAmount() // Store estimated bill for reference
        },
        amount: ADVANCE_AMOUNT, // Only advance, not full amount
        advanceAmount: ADVANCE_AMOUNT,
        specialRequests: bookingData.specialRequests,
        status: 'pending' // Cafe bookings require approval like others
      };

      const response = await axios.post('/api/booking/create', bookingPayload);

      if (response.data.success) {
        toast.success('🎉 Booking request submitted! Please wait for cafe approval before making payment.');
        onBookingSuccess && onBookingSuccess(response.data.booking);
        // Reset form
        setBookingData({
          tableType: '',
          visitDate: '',
          visitTime: '',
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

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Table Preference *
          </label>
          <select
            name="tableType"
            value={bookingData.tableType}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          >
            <option value="">Select Table Type</option>
            {availableTableOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-1" />
              Visit Date *
            </label>
            <input
              type="date"
              name="visitDate"
              value={bookingData.visitDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaClock className="inline mr-1" />
              Visit Time *
            </label>
            <input
              type="time"
              name="visitTime"
              value={bookingData.visitTime}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
            max="12"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaCommentDots className="inline mr-1" />
            Special Requests
          </label>
          <textarea
            name="specialRequests"
            value={bookingData.specialRequests}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Dietary preferences, special occasions, ambiance requests..."
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
              <h4 className="text-sm font-semibold text-blue-900 mb-1">☕ Booking Approval Process</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Your booking request will be submitted to the cafe</p>
                <p>• <strong>Wait for cafe approval</strong> (you'll be notified)</p>
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
            💡 Pay only ₹{ADVANCE_AMOUNT} advance after approval. Remaining bill will be paid at the cafe.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {loading ? 'Submitting Request...' : '📤 Submit Booking Request (No Payment Yet)'}
        </button>
      </form>
    </div>
  );
};

export default CafeBooking;
