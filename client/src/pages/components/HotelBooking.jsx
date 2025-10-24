// client/src/pages/components/HotelBooking.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaBed, FaCalendarAlt, FaUsers, FaDollarSign, FaImage, FaExclamationTriangle, FaSignInAlt } from 'react-icons/fa';
import UPIPayment from './UPIPayment';
import { Image } from '../../components/Image';

const HotelBooking = ({ hotel, onBookingSuccess }) => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  const [bookingData, setBookingData] = useState({
    roomType: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: '',
    paymentOption: 'advance' // 'advance' or 'full'
  });
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  // Check if user is logged in
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center bg-blue-50 rounded-lg p-8">
          <FaSignInAlt className="mx-auto text-4xl text-blue-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Login Required</h3>
          <p className="text-gray-600 mb-6">
            Please login to your account to book a room at {hotel?.businessName || hotel?.name}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Login to Book Room
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
    console.log('💰 Calculate Amount Debug:');
    console.log('- Room Type:', bookingData.roomType);
    console.log('- Check In:', bookingData.checkIn);
    console.log('- Check Out:', bookingData.checkOut);
    console.log('- Hotel Rooms:', hotel.rooms);
    console.log('- Hotel Pricing:', hotel.pricing);
    
    if (!bookingData.roomType || !bookingData.checkIn || !bookingData.checkOut) {
      console.log('❌ Missing required fields for calculation');
      return 0;
    }

    // Try to find room in hotel.rooms first
    let room = hotel.rooms?.find(r => r.roomType === bookingData.roomType);
    console.log('🏠 Found room in hotel.rooms:', room);
    
    // Fallback to hotel.pricing.rooms if not found
    if (!room && hotel.pricing?.rooms) {
      room = hotel.pricing.rooms.find(r => r.roomType === bookingData.roomType);
      console.log('🏠 Found room in hotel.pricing.rooms:', room);
    }
    
    if (!room) {
      console.log('❌ No room found for type:', bookingData.roomType);
      return 0;
    }

    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    
    // Calculate days (duration of stay)
    const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    console.log('📅 Days of stay:', days);
    console.log('📅 Check-in:', checkInDate.toDateString());
    console.log('📅 Check-out:', checkOutDate.toDateString());
    console.log('💵 Room pricing:', room.pricing);
    
    // Get pricing - prefer dayRate for day-based calculation
    let dayRate = room.pricing?.dayRate || room.pricing?.day || 0;
    let nightRate = room.pricing?.nightRate || room.pricing?.night || 0;
    
    // Use dayRate if available, otherwise nightRate, otherwise fallback
    let ratePerDay = dayRate || nightRate || room.dayRate || room.nightRate || room.rate || 1500;
    
    // If no pricing in room.pricing, try direct on room
    if (!ratePerDay) {
      ratePerDay = room.dayRate || room.nightRate || room.rate || 1500; // Default fallback
    }
    
    console.log('💰 Rate per day:', ratePerDay);
    console.log('💰 Using rate type:', dayRate ? 'Day Rate' : nightRate ? 'Night Rate' : 'Fallback Rate');
    
    const total = ratePerDay * days;
    console.log('💰 Total amount (₹' + ratePerDay + ' × ' + days + ' days):', total);
    
    return total;
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
      const totalAmount = calculateAmount();
      const advanceAmount = Math.ceil(totalAmount * 0.1); // 10% advance
      const paymentAmount = bookingData.paymentOption === 'advance' ? advanceAmount : totalAmount;
      
      console.log('🚀 Starting booking process...');
      console.log('💰 Total Amount:', totalAmount);
      console.log('💰 Advance Amount (10%):', advanceAmount);
      console.log('💰 Payment Amount:', paymentAmount);
      console.log('💳 Payment Option:', bookingData.paymentOption);
      
      const response = await axios.post('/api/booking/create', {
        businessId: hotel._id,
        businessType: 'hotel',
        bookingDetails: {
          roomType: bookingData.roomType,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: parseInt(bookingData.guests)
        },
        amount: paymentAmount,
        totalAmount: totalAmount,
        paymentOption: bookingData.paymentOption,
        specialRequests: bookingData.specialRequests || 
          (bookingData.paymentOption === 'advance' ? 
            `Advance payment of ₹${advanceAmount} (10%). Remaining ₹${totalAmount - advanceAmount} to be paid on spot.` : 
            `Full payment of ₹${totalAmount} made.`)
      }, {
        withCredentials: true
      });

      console.log('📡 API Response:', response.data);

      if (response.data.success) {
        // Check if business has UPI ID configured
        if (!hotel.upiId && !hotel.paymentDetails?.upiId) {
          toast.error('❌ Booking no longer available. Business payment details not configured.');
          return;
        }
        
        setCurrentBooking(response.data.booking);
        // Show payment modal immediately
        setShowPayment(true);
        toast.success('🎉 Booking created! Please complete the payment to confirm.');
      } else {
        toast.error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('❌ Booking error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error('Please log in to make a booking');
      } else {
        toast.error(error.response?.data?.message || 'Booking failed. Please try again.');
      }
    } finally {
      setLoading(false);
      console.log('✅ Booking process completed');
    }
  };

  const handlePaymentComplete = (updatedBooking) => {
    toast.success('✅ Payment completed successfully! Your booking is confirmed.');
    onBookingSuccess && onBookingSuccess(updatedBooking);
    setShowPayment(false);
    setCurrentBooking(null);
    // Reset form
    setBookingData({
      roomType: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      specialRequests: '',
      paymentOption: 'advance'
    });
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
        Book a Room
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <FaBed className="inline mr-1" />
            Select Room Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotel.rooms?.filter(room => room.availability).map((room, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  bookingData.roomType === room.roomType
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setBookingData(prev => ({ ...prev, roomType: room.roomType }))}
              >
                {/* Room Image */}
                {room.images && room.images.length > 0 && (
                  <div className="mb-3">
                    <Image
                      src={room.images[0]}
                      alt={`${room.roomType} room`}
                      className="w-full h-32 object-cover rounded-lg"
                      placeholder="https://placehold.co/300x200/e2e8f0/64748b?text=Room+Image"
                    />
                  </div>
                )}
                
                {/* Room Details */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg capitalize">{room.roomType}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><FaBed className="inline mr-1" /> {room.bedType} bed</p>
                    <p><FaUsers className="inline mr-1" /> Up to {room.maxOccupancy} guests</p>
                    <p>{room.isAC ? '❄️ AC' : '🌡️ Non-AC'}</p>
                    {room.roomSize && <p>📐 {room.roomSize}</p>}
                  </div>
                  
                  {/* Amenities */}
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="text-xs text-gray-500">
                      <p className="font-medium">Amenities:</p>
                      <p>{room.amenities.join(', ')}</p>
                    </div>
                  )}
                  {/* Pricing */}
                  <div className="text-lg font-bold text-blue-600">
                    ₹{room.pricing?.dayRate || room.pricing?.nightRate || 0}/day
                  </div>
                  
                  {/* Selection Indicator */}
                  {bookingData.roomType === room.roomType && (
                    <div className="text-blue-600 text-sm font-medium">
                      ✓ Selected
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {(!hotel.rooms || hotel.rooms.filter(room => room.availability).length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <FaBed className="mx-auto text-4xl mb-2" />
              <p>No rooms available at the moment</p>
            </div>
          )}
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

        {/* Payment Option Selection */}
        {calculateAmount() > 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                💳 Payment Option *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 10% Advance Option */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    bookingData.paymentOption === 'advance'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setBookingData(prev => ({ ...prev, paymentOption: 'advance' }))}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-lg">10% Advance</h4>
                    {bookingData.paymentOption === 'advance' && (
                      <span className="text-green-600 font-bold">✓</span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    ₹{Math.ceil(calculateAmount() * 0.1)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Pay 10% now, remaining ₹{calculateAmount() - Math.ceil(calculateAmount() * 0.1)} on spot
                  </p>
                  <div className="mt-2 text-xs text-gray-500 bg-white rounded px-2 py-1">
                    Recommended for flexible payment
                  </div>
                </div>

                {/* Full Payment Option */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    bookingData.paymentOption === 'full'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setBookingData(prev => ({ ...prev, paymentOption: 'full' }))}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-lg">Full Payment</h4>
                    {bookingData.paymentOption === 'full' && (
                      <span className="text-blue-600 font-bold">✓</span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mb-2">
                    ₹{calculateAmount()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Pay complete amount now, nothing to pay on spot
                  </p>
                  <div className="mt-2 text-xs text-gray-500 bg-white rounded px-2 py-1">
                    Hassle-free, no payment on arrival
                  </div>
                </div>
              </div>
            </div>

            {/* Total Amount Display */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Total Booking Amount:</span>
                <span className="text-xl font-bold text-gray-800">₹{calculateAmount()}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold">
                <span className="text-gray-900">Amount to Pay Now:</span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{bookingData.paymentOption === 'advance' ? Math.ceil(calculateAmount() * 0.1) : calculateAmount()}
                </span>
              </div>
              {bookingData.paymentOption === 'advance' && (
                <p className="text-xs text-gray-600 mt-2">
                  Remaining ₹{calculateAmount() - Math.ceil(calculateAmount() * 0.1)} to be paid at the hotel
                </p>
              )}
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
              <p className="text-sm text-yellow-900 font-medium flex items-center gap-2">
                <FaExclamationTriangle className="text-yellow-600" />
                Payment must be completed to confirm your booking
              </p>
            </div>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-yellow-600 mr-2" />
              <div>
                <p className="text-yellow-800 font-medium">Login Required</p>
                <p className="text-yellow-700 text-sm">Please log in to make a booking.</p>
                <a 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                >
                  Go to Login →
                </a>
              </div>
            </div>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Submit Booking Request'}
        </button>
        
        {/* Debug info */}
        <div className="mt-2 text-xs text-gray-500">
          Debug: Auth={isAuthenticated.toString()}, User={!!currentUser}, Token={!!userToken}, Amount={calculateAmount()}
        </div>
      </form>
    </div>
    </>
  );
};

export default HotelBooking;
