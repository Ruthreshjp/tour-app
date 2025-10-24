import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaClock, FaUser, FaPhone, FaEnvelope, FaCommentDots, FaSignInAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import AdvancePaymentModal from './AdvancePaymentModal';

const TableBooking = ({ cafe, selectedTable, onBookingSuccess }) => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center bg-blue-50 rounded-lg p-8">
          <FaSignInAlt className="mx-auto text-4xl text-blue-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Login Required</h3>
          <p className="text-gray-600 mb-6">
            Please login to your account to book this table at {cafe?.businessName || cafe?.name}
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

  const [bookingData, setBookingData] = useState({
    customerName: currentUser?.name || '',
    customerEmail: currentUser?.email || '',
    customerPhone: '',
    bookingDate: '',
    bookingTime: '',
    numberOfGuests: selectedTable?.capacity || 2,
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceConfirmed, setAdvanceConfirmed] = useState(false);

  const ADVANCE_AMOUNT = 100;

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotalAmount = () => {
    const perPersonCharge = selectedTable?.pricing?.perPerson || 0;
    const tableCharge = selectedTable?.pricing?.tableCharge || 0;
    return (perPersonCharge * bookingData.numberOfGuests) + tableCharge;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('Please login to make a booking');
      return;
    }

    if (!selectedTable) {
      toast.error('Please select a table to book');
      return;
    }

    if (!advanceConfirmed) {
      toast.error('Please confirm that you have paid the ₹100 advance before submitting.');
      return;
    }

    try {
      setLoading(true);

      const bookingPayload = {
        businessId: cafe._id,
        businessType: 'cafe',
        bookingDetails: {
          tableId: selectedTable._id,
          tableNumber: selectedTable.tableNumber,
          tableType: selectedTable.tableType,
          capacity: selectedTable.capacity,
          isAC: selectedTable.isAC,
          location: selectedTable.location,
          bookingDate: bookingData.bookingDate,
          bookingTime: bookingData.bookingTime,
          numberOfGuests: bookingData.numberOfGuests,
          checkIn: bookingData.bookingDate,
          checkOut: bookingData.bookingDate,
          guests: bookingData.numberOfGuests,
          advancePayment: ADVANCE_AMOUNT,
          advancePaymentStatus: 'paid'
        },
        amount: calculateTotalAmount(),
        advanceAmount: ADVANCE_AMOUNT,
        specialRequests: bookingData.specialRequests
      };

      const response = await axios.post('/api/booking/create', bookingPayload);

      if (response.data.success) {
        toast.success('Table booking submitted successfully!');
        onBookingSuccess && onBookingSuccess(response.data.booking);
        setAdvanceConfirmed(false);
      } else {
        throw new Error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const availableGuestsOptions = () => {
    const capacity = selectedTable?.capacity || 10;
    return Array.from({ length: capacity }, (_, index) => index + 1);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Selected Table</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Table:</span>
            <span className="ml-2 font-medium capitalize">
              {selectedTable?.tableNumber ? `Table ${selectedTable.tableNumber}` : selectedTable?.tableType}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Capacity:</span>
            <span className="ml-2 font-medium">{selectedTable?.capacity} people</span>
          </div>
          <div>
            <span className="text-gray-600">Type:</span>
            <span className="ml-2 font-medium capitalize">{selectedTable?.tableType}</span>
          </div>
          <div>
            <span className="text-gray-600">AC:</span>
            <span className="ml-2 font-medium">{selectedTable?.isAC ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaUser className="inline mr-2" />
              Full Name *
            </label>
            <input
              type="text"
              value={bookingData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaPhone className="inline mr-2" />
              Phone Number *
            </label>
            <input
              type="tel"
              value={bookingData.customerPhone}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus-border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaEnvelope className="inline mr-2" />
            Email Address *
          </label>
          <input
            type="email"
            value={bookingData.customerEmail}
            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus-border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2" />
              Booking Date *
            </label>
            <input
              type="date"
              value={bookingData.bookingDate}
              onChange={(e) => handleInputChange('bookingDate', e.target.value)}
              min={today}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus-border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaClock className="inline mr-2" />
              Booking Time *
            </label>
            <select
              value={bookingData.bookingTime}
              onChange={(e) => handleInputChange('bookingTime', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus-border-transparent"
              required
            >
              <option value="">Select Time</option>
              {generateTimeSlots().map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaUsers className="inline mr-2" />
            Number of Guests *
          </label>
          <select
            value={bookingData.numberOfGuests}
            onChange={(e) => handleInputChange('numberOfGuests', parseInt(e.target.value, 10))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus-border-transparent"
            required
          >
            {availableGuestsOptions().map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaCommentDots className="inline mr-2" />
            Special Requests (Optional)
          </label>
          <textarea
            value={bookingData.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus-border-transparent"
            placeholder="Any special requirements or dietary preferences..."
          />
        </div>

        <div className="bg-red-50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount:</span>
            <span className="text-2xl font-bold text-red-600">₹{calculateTotalAmount()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-700">
            <span>Advance payable now:</span>
            <span className="font-semibold text-green-700">₹{ADVANCE_AMOUNT}</span>
          </div>
          <div className="flex justify-between text-base font-medium text-gray-800">
            <span>Estimated payable on visit:</span>
            <span>₹{Math.max(calculateTotalAmount() - ADVANCE_AMOUNT, 0)}</span>
          </div>
          <p className="text-sm text-gray-600">
            Pay ₹{ADVANCE_AMOUNT} now via UPI to confirm your reservation. This amount will be deducted from your final bill at the cafe.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowAdvanceModal(true)}
              className="sm:w-auto w-full bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              View payment instructions
            </button>
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={advanceConfirmed}
                onChange={(e) => setAdvanceConfirmed(e.target.checked)}
                className="mt-1"
                required
              />
              <span>
                I have transferred ₹{ADVANCE_AMOUNT} to the cafe via UPI and understand it will be adjusted in my bill.
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating Booking...
            </>
          ) : (
            <>
              Book Table - ₹{calculateTotalAmount()}
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        By booking, you agree to our terms and conditions. Remaining payment can be settled during your visit.
      </div>

      <AdvancePaymentModal
        isOpen={showAdvanceModal}
        onClose={() => setShowAdvanceModal(false)}
        businessName={cafe.businessName || cafe.name}
        businessType="cafe table reservation"
        upiId={cafe.upiId || cafe.paymentDetails?.upiId}
        amount={ADVANCE_AMOUNT}
      />
    </div>
  );
};

export default TableBooking;
