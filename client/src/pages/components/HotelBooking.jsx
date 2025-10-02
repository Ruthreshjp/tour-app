// client/src/pages/components/HotelBooking.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaBed, FaCalendarAlt, FaUsers, FaDollarSign } from 'react-icons/fa';
import UPIPayment from './UPIPayment';

const HotelBooking = ({ hotel, onBookingSuccess }) => {
  const [bookingData, setBookingData] = useState({
    roomType: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateAmount = () => {
    if (!bookingData.roomType || !bookingData.checkIn || !bookingData.checkOut) {
      return 0;
    }

    const room = hotel.rooms?.find(r => r.roomType === bookingData.roomType);
    if (!room) return 0;

    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    // Use night rate for calculation
    return room.pricing?.nightRate * nights || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.roomType || !bookingData.checkIn || !bookingData.checkOut) {
      toast.error('Please fill in all required fields');
      return;
    }

    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    
    if (checkOutDate <= checkInDate) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post('/api/booking/create', {
        businessId: hotel._id,
        businessType: 'hotel',
        bookingDetails: {
          roomType: bookingData.roomType,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: parseInt(bookingData.guests)
        },
        amount: calculateAmount(),
        specialRequests: bookingData.specialRequests
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('Booking request submitted successfully!');
        setCurrentBooking(response.data.booking);
        setShowPayment(true);
        // Reset form
        setBookingData({
          roomType: '',
          checkIn: '',
          checkOut: '',
          guests: 1,
          specialRequests: ''
        });
      } else {
        toast.error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = (updatedBooking) => {
    onBookingSuccess && onBookingSuccess(updatedBooking);
    setShowPayment(false);
    setCurrentBooking(null);
  };

  const handlePaymentClose = () => {
    setShowPayment(false);
    setCurrentBooking(null);
  };

  return (
    <>
      {showPayment && currentBooking && (
        <UPIPayment
          booking={currentBooking}
          onPaymentComplete={handlePaymentComplete}
          onClose={handlePaymentClose}
        />
      )}
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <FaBed className="mr-2 text-blue-500" />
        Book a Room
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Type *
          </label>
          <select
            name="roomType"
            value={bookingData.roomType}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Room Type</option>
            {hotel.rooms?.filter(room => room.availability).map((room, index) => (
              <option key={index} value={room.roomType}>
                {room.roomType} - ₹{room.pricing?.nightRate}/night ({room.bedType} bed, {room.maxOccupancy} guests, {room.isAC ? 'AC' : 'Non-AC'})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-1" />
              Check-in Date *
            </label>
            <input
              type="date"
              name="checkIn"
              value={bookingData.checkIn}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-1" />
              Check-out Date *
            </label>
            <input
              type="date"
              name="checkOut"
              value={bookingData.checkOut}
              onChange={handleChange}
              min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaUsers className="inline mr-1" />
            Number of Guests *
          </label>
          <input
            type="number"
            name="guests"
            value={bookingData.guests}
            onChange={handleChange}
            min="1"
            max="10"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any special requests or preferences..."
          />
        </div>

        {calculateAmount() > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600 flex items-center">
                <FaDollarSign className="mr-1" />
                {calculateAmount()}
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || calculateAmount() === 0}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Submit Booking Request'}
        </button>
      </form>
    </div>
    </>
  );
};

export default HotelBooking;
