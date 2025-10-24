import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaClock, FaUsers } from 'react-icons/fa';

const SimpleBookingForm = ({ businessType, businessId, onBookingSuccess }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    date: '',
    time: '',
    persons: 1,
    specialRequests: '',
    // Business-specific fields
    roomType: '',
    tableType: '',
    vehicleType: '',
    pickupLocation: '',
    dropLocation: '',
    serviceType: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = {
        businessId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        date: formData.date,
        time: formData.time,
        persons: formData.persons,
        specialRequests: formData.specialRequests,
        status: 'pending',
        // Add business-specific fields based on type
        ...(businessType === 'hotel' && {
          checkIn: formData.date,
          checkOut: formData.date, // Can be extended for multi-day bookings
          roomType: formData.roomType,
          guests: formData.persons
        }),
        ...(businessType === 'restaurant' && {
          reservationDate: formData.date,
          reservationTime: formData.time,
          tableType: formData.tableType,
          guests: formData.persons
        }),
        ...(businessType === 'cab' && {
          pickupDate: formData.date,
          pickupTime: formData.time,
          vehicleType: formData.vehicleType,
          pickupLocation: formData.pickupLocation,
          dropLocation: formData.dropLocation,
          passengers: formData.persons
        }),
        ...(businessType === 'cafe' && {
          reservationDate: formData.date,
          reservationTime: formData.time,
          seatingPreference: formData.tableType
        }),
        ...(businessType === 'shopping' && {
          appointmentDate: formData.date,
          appointmentTime: formData.time,
          serviceType: formData.serviceType
        })
      };

      const response = await fetch('/api/business/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Booking request submitted successfully!');
        // Reset form
        setFormData({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          date: '',
          time: '',
          persons: 1,
          specialRequests: '',
          roomType: '',
          tableType: '',
          vehicleType: '',
          pickupLocation: '',
          dropLocation: '',
          serviceType: ''
        });
        if (onBookingSuccess) onBookingSuccess(data.booking);
      } else {
        toast.error(data.message || 'Failed to submit booking request');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to submit booking request');
    } finally {
      setLoading(false);
    }
  };

  const renderBusinessSpecificFields = () => {
    switch (businessType) {
      case 'hotel':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Type Preference
              </label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Any Room Type</option>
                <option value="standard">Standard</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>
        );

      case 'restaurant':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Type Preference
              </label>
              <select
                name="tableType"
                value={formData.tableType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Any Table</option>
                <option value="regular">Regular</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
                <option value="family">Family</option>
              </select>
            </div>
          </div>
        );

      case 'cab':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type Preference
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Any Vehicle</option>
                <option value="hatchback">Hatchback</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleInputChange}
                  placeholder="Enter pickup location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drop Location
                </label>
                <input
                  type="text"
                  name="dropLocation"
                  value={formData.dropLocation}
                  onChange={handleInputChange}
                  placeholder="Enter drop location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'cafe':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seating Preference
              </label>
              <select
                name="tableType"
                value={formData.tableType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Any Seating</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="terrace">Terrace</option>
                <option value="window">Window Side</option>
              </select>
            </div>
          </div>
        );

      case 'shopping':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">General Shopping</option>
                <option value="personal-shopping">Personal Shopping</option>
                <option value="consultation">Style Consultation</option>
                <option value="fitting">Fitting Session</option>
                <option value="custom-order">Custom Order</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Make a Booking</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Customer Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline w-4 h-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline w-4 h-4 mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaEnvelope className="inline w-4 h-4 mr-2" />
              Email Address
            </label>
            <input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Booking Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="inline w-4 h-4 mr-2" />
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaClock className="inline w-4 h-4 mr-2" />
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUsers className="inline w-4 h-4 mr-2" />
                Number of {businessType === 'cab' ? 'Passengers' : 'Persons'}
              </label>
              <input
                type="number"
                name="persons"
                value={formData.persons}
                onChange={handleInputChange}
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Business-Specific Fields */}
        {renderBusinessSpecificFields()}

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requests (Optional)
          </label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleInputChange}
            placeholder="Any special requirements or requests..."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Booking Request'}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is a booking request. The business will review and confirm your booking. 
          You will receive a confirmation with a verification code once approved.
        </p>
      </div>
    </div>
  );
};

export default SimpleBookingForm;
