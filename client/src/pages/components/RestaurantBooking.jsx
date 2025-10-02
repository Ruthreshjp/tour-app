// client/src/pages/components/RestaurantBooking.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUtensils, FaCalendarAlt, FaUsers, FaClock } from 'react-icons/fa';

const RestaurantBooking = ({ restaurant, onBookingSuccess }) => {
  const [bookingData, setBookingData] = useState({
    tableNumber: '',
    reservationDate: '',
    reservationTime: '',
    partySize: 1,
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.tableNumber || !bookingData.reservationDate || !bookingData.reservationTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const reservationDateTime = new Date(`${bookingData.reservationDate}T${bookingData.reservationTime}`);
    const now = new Date();
    
    if (reservationDateTime <= now) {
      toast.error('Reservation time must be in the future');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post('/api/business-booking/create', {
        businessId: restaurant._id,
        businessType: 'restaurant',
        bookingDetails: {
          tableNumber: bookingData.tableNumber,
          reservationDate: reservationDateTime,
          partySize: parseInt(bookingData.partySize)
        },
        amount: 0, // Restaurant bookings are typically free
        specialRequests: bookingData.specialRequests
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('Table reservation submitted successfully!');
        onBookingSuccess && onBookingSuccess(response.data.booking);
        // Reset form
        setBookingData({
          tableNumber: '',
          reservationDate: '',
          reservationTime: '',
          partySize: 1,
          specialRequests: ''
        });
      } else {
        toast.error(response.data.message || 'Reservation failed');
      }
    } catch (error) {
      console.error('Reservation error:', error);
      toast.error(error.response?.data?.message || 'Reservation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <FaUtensils className="mr-2 text-red-500" />
        Make a Reservation
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Table *
          </label>
          <select
            name="tableNumber"
            value={bookingData.tableNumber}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="">Select Table</option>
            {restaurant.details?.tables?.filter(table => table.isAvailable).map((table, index) => (
              <option key={index} value={table.number}>
                Table {table.number} (Capacity: {table.capacity})
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

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Reservation Fee:</span>
            <span className="text-2xl font-bold text-red-600">Free</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Make Reservation'}
        </button>
      </form>
    </div>
  );
};

export default RestaurantBooking;
