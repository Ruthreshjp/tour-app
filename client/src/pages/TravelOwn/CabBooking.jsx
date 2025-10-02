import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';
import { Image } from '../../components/Image';

const CabBooking = ({ cabService }) => {
  const [bookingData, setBookingData] = useState({
    pickupLocation: '',
    dropLocation: '',
    dateTime: '',
    passengers: 1,
    currentLocation: null
  });
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [amount, setAmount] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleViewMap = (location) => {
    window.open(location, '_blank');
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

  const generateQRCode = async (amount) => {
    try {
      const response = await axios.post('/api/payments/generate-qr', { amount });
      setQrCode(response.data.qrCode);
      setAmount(amount);
      setShowQR(true);
    } catch (error) {
      toast.error('Failed to generate QR code');
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
      
      // Calculate estimated fare based on distance
      const response = await axios.post('/api/bookings/cab/estimate', bookingData);
      const estimatedFare = response.data.estimatedFare;

      // Create booking using new system
      const bookingResponse = await axios.post('/api/business-booking/create', {
        businessId: cabService._id,
        businessType: 'cab',
        bookingDetails: {
          pickupLocation: bookingData.pickupLocation,
          dropLocation: bookingData.dropLocation,
          pickupTime: new Date(bookingData.dateTime),
          passengers: parseInt(bookingData.passengers),
          vehicleType: 'sedan', // Default, can be enhanced
          currentLocation: bookingData.currentLocation
        },
        amount: estimatedFare,
        specialRequests: ''
      }, {
        withCredentials: true
      });

      if (bookingResponse.data.success) {
        // Generate QR code for payment
        await generateQRCode(estimatedFare);
        
        toast.success('Cab booking request submitted successfully!');
        setAmount(estimatedFare);
        setShowQR(true);
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Book a Cab</h2>
      
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
              placeholder="Enter pickup address or use current location"
              required
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              title="Use Current Location"
            >
              <FaMapMarkerAlt />
            </button>
            <button
              type="button"
              onClick={() => handleViewMap(bookingData.pickupLocation)}
              className="px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              title="View on Map"
            >
              📍
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Click the location icon to use your current location, or enter an address manually
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Drop Location</label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              name="dropLocation"
              value={bookingData.dropLocation}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              required
            />
            <button
              type="button"
              onClick={() => handleViewMap(bookingData.dropLocation)}
              className="px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              <FaMapMarkerAlt />
            </button>
          </div>
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

        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <FaMoneyBillWave className="mr-2" />
          Proceed to Payment
        </button>
      </form>

      {/* QR Code Payment Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Scan QR to Pay</h3>
            <div className="flex flex-col items-center">
              <p className="mb-4">Amount: ₹{amount}</p>
              <Image src={qrCode} alt="Payment QR Code" className="w-64 h-64 mb-4" />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQR(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CabBooking;