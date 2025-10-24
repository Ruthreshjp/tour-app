import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';
import { Image } from '../../components/Image';
import GoogleMapsPickupPicker from './GoogleMapsPickupPicker';

const CabBooking = ({ business, vehicle, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    pickupLocation: '',
    dropLocation: '',
    dateTime: '',
    passengers: 1,
    currentLocation: null
  });
  const [showPickupMap, setShowPickupMap] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePickupLocationConfirm = (locationData) => {
    setBookingData(prev => ({
      ...prev,
      pickupLocation: locationData.address,
      currentLocation: { lat: locationData.lat, lng: locationData.lng }
    }));
    toast.success('Pickup location confirmed!');
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setBookingData(prev => ({
            ...prev,
            currentLocation: { lat: latitude, lng: longitude },
            pickupLocation: `${latitude}, ${longitude}`
          }));
          toast.success('Current location detected!');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get current location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.pickupLocation || !bookingData.dropLocation || !bookingData.dateTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Fixed advance payment amount (to be paid after confirmation)
      const advanceAmount = 100;

      // Create booking without payment - wait for business confirmation
      const bookingResponse = await axios.post('/api/booking/create', {
        businessId: cabService._id,
        businessType: 'cab',
        bookingDetails: {
          pickupLocation: bookingData.pickupLocation,
          dropLocation: bookingData.dropLocation,
          pickupTime: new Date(bookingData.dateTime),
          passengers: parseInt(bookingData.passengers),
          vehicleType: vehicle ? (vehicle.vehicleType || vehicle.type) : 'sedan',
          vehicleCapacity: vehicle ? vehicle.capacity : null,
          isAC: vehicle ? vehicle.isAC : null,
          currentLocation: bookingData.currentLocation
        },
        amount: advanceAmount,
        specialRequests: 'Advance payment of ₹100 required after booking confirmation. Final fare to be calculated based on actual distance.'
      }, {
        withCredentials: true
      });

      if (bookingResponse.data.success) {
        toast.success('Cab booking request submitted successfully! You will receive payment details once the business confirms your booking.');
        // Close the modal after successful booking
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast.error(bookingResponse.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Cab booking error:', error);
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const cabService = business;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Book {cabService?.businessName || 'Cab'}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Vehicle Information Card */}
          {vehicle && (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Selected Vehicle</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Vehicle Type</p>
                  <p className="font-semibold text-gray-800 capitalize">{vehicle.vehicleType || vehicle.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Capacity</p>
                  <p className="font-semibold text-gray-800">{vehicle.capacity} Seater</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">AC Type</p>
                  <p className="font-semibold text-gray-800">{vehicle.isAC ? 'AC' : 'Non-AC'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rate</p>
                  <p className="font-semibold text-orange-600">₹{vehicle.pricing?.perKm || vehicle.pricePerKm}/km</p>
                </div>
              </div>
              {vehicle.pricing?.baseFare && (
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <p className="text-sm text-gray-600">Base Fare: <span className="font-semibold text-gray-800">₹{vehicle.pricing.baseFare}</span></p>
                  {vehicle.pricing?.waitingCharges && (
                    <p className="text-sm text-gray-600 mt-1">Waiting Charges: <span className="font-semibold text-gray-800">₹{vehicle.pricing.waitingCharges}/hr</span></p>
                  )}
                </div>
              )}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Pickup Location *</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  name="pickupLocation"
                  value={bookingData.pickupLocation}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  placeholder="Click map icon to pin exact location"
                  required
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setShowPickupMap(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center gap-2 whitespace-nowrap"
                  title="Pin Location on Map"
                >
                  📍 Pin on Map
                </button>
              </div>
              <p className="text-sm text-blue-600 mt-1 font-medium">
                ✓ Click "Pin on Map" to select your exact pickup location
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Drop Location *</label>
              <input
                type="text"
                name="dropLocation"
                value={bookingData.dropLocation}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                placeholder="Enter your destination (e.g., Airport, City name, Area)"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the general area or place where you want to be dropped off
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Pickup Date & Time</label>
              <input
                type="datetime-local"
                name="dateTime"
                value={bookingData.dateTime}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Passengers</label>
              <input
                type="number"
                name="passengers"
                min="1"
                max="6"
                value={bookingData.passengers}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>

            {/* Booking Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <FaMoneyBillWave className="text-blue-600" />
                Booking Process
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Submit your booking request</li>
                <li>• Business will review and confirm your booking</li>
                <li>• Pay <span className="font-semibold">₹100 advance</span> after confirmation</li>
                <li>• Final fare calculated based on actual distance</li>
                <li>• Pay remaining amount to driver after trip</li>
              </ul>
            </div>

            {/* Important Notice */}
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                ⚠️ Important Notice
              </h4>
              <p className="text-sm text-red-800 font-medium">
                Service will be provided only after the advance payment of ₹100 is completed. 
                Please ensure payment is made promptly after booking confirmation to avoid cancellation.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Booking Request'}
            </button>
          </form>
        </div>
      </div>

      {/* Google Maps Pickup Location Picker */}
      <GoogleMapsPickupPicker
        isOpen={showPickupMap}
        onClose={() => setShowPickupMap(false)}
        onConfirm={handlePickupLocationConfirm}
      />
    </div>
  );
};

export default CabBooking;