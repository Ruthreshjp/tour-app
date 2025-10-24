import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Image } from "../../components/Image";
import UPIPayment from "../components/UPIPayment";
import PackagePayment from "../components/PackagePayment";
import RatingsModal from "../../pages/components/RatingsModal";

// Configure axios with credentials
const axiosWithCredentials = axios.create({
  withCredentials: true
});

const MyBookings = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [currentBookings, setCurrentBookings] = useState([]);
  const [travelBookings, setTravelBookings] = useState([]);
  const [packageBookings, setPackageBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showPackagePayment, setShowPackagePayment] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedPackageBooking, setSelectedPackageBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, hotel, restaurant, cafe, cab, package
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);

  const getAllBookings = async () => {
    setCurrentBookings([]);
    try {
      setLoading(true);
      const res = await fetch(
        `/api/booking/get-UserCurrentBookings/${currentUser?._id}?searchTerm=${searchTerm}`
      );
      const data = await res.json();
      if (data?.success) {
        setCurrentBookings(data?.bookings);
        setLoading(false);
        setError(false);
      } else {
        setLoading(false);
        setError(data?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTravelBookings = async () => {
    try {
      console.log('📋 Fetching travel bookings...');
      const response = await axiosWithCredentials.get('/api/booking/user');
      console.log('✅ Travel bookings response:', response.data);
      if (response.data.success) {
        // Log image data for debugging
        if (response.data.bookings.length > 0) {
          console.log('📸 Sample booking business data:', {
            businessName: response.data.bookings[0].businessId?.businessName,
            profileImage: response.data.bookings[0].businessId?.profileImage,
            mainImage: response.data.bookings[0].businessId?.mainImage,
            businessImages: response.data.bookings[0].businessId?.businessImages
          });
        }
        
        // Filter active bookings
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const activeBookings = response.data.bookings.filter(b => {
          // Check if this is a business booking (has bookingDetails)
          if (!b.bookingDetails) {
            return false;
          }
          
          // Show pending, confirmed, or Booked status
          const isActiveStatus = b.status === 'pending' || b.status === 'confirmed' || b.status === 'Booked';
          
          // For cab bookings, check pickupTime instead of checkIn
          if (b.businessType === 'cab' && b.bookingDetails.pickupTime) {
            const pickupDate = new Date(b.bookingDetails.pickupTime);
            pickupDate.setHours(0, 0, 0, 0);
            const isUpcoming = pickupDate >= today;
            console.log(`Cab Booking ${b._id}: status=${b.status}, pickupTime=${b.bookingDetails.pickupTime}, isUpcoming=${isUpcoming}`);
            return isActiveStatus && isUpcoming;
          }
          
          // For hotel/restaurant bookings, check checkIn date
          if (b.bookingDetails.checkIn) {
            const checkInDate = new Date(b.bookingDetails.checkIn);
            checkInDate.setHours(0, 0, 0, 0);
            const isUpcoming = checkInDate >= today;
            console.log(`Booking ${b._id}: status=${b.status}, checkIn=${b.bookingDetails.checkIn}, isUpcoming=${isUpcoming}`);
            return isActiveStatus && isUpcoming;
          }
          
          return false;
        });
        console.log('📊 Active confirmed bookings:', activeBookings);
        setTravelBookings(activeBookings);
      }
    } catch (error) {
      console.error('❌ Error fetching travel bookings:', error);
      console.error('❌ Error details:', error.response?.data);
    }
  };

  const getPackageBookings = async () => {
    try {
      console.log('📦 Fetching package bookings...');
      const response = await axiosWithCredentials.get('/api/package-booking/user');
      console.log('✅ Package bookings response:', response.data);
      if (response.data.success) {
        // Show all bookings that are not cancelled or completed
        const activeBookings = response.data.bookings.filter(b => 
          b.bookingStatus !== 'cancelled' && b.bookingStatus !== 'completed'
        );
        setPackageBookings(activeBookings);
      }
    } catch (error) {
      console.error('❌ Error fetching package bookings:', error);
    }
  };

  useEffect(() => {
    getAllBookings();
    getTravelBookings();
    getPackageBookings();
  }, [searchTerm]);

  const handleCancel = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/booking/cancel-booking/${id}/${currentUser._id}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (data?.success) {
        setLoading(false);
        toast.success(data?.message);
        getAllBookings();
      } else {
        setLoading(false);
        toast.error(data?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleTravelBookingCancel = async (bookingId) => {
    // Show confirmation dialog with no-refund warning
    const confirmCancel = window.confirm(
      '⚠️ Cancel Booking?\n\n' +
      '• Your booking will be cancelled immediately\n' +
      '• NO ADVANCE AMOUNT WILL BE REFUNDED\n' +
      '• This action cannot be undone\n\n' +
      'Are you sure you want to cancel this booking?'
    );
    
    if (!confirmCancel) {
      return; // User clicked "Cancel" in the dialog
    }
    
    try {
      setLoading(true);
      const response = await axiosWithCredentials.patch(`/api/booking/${bookingId}/cancel`);
      
      if (response.data.success) {
        toast.success('✅ Booking cancelled successfully. No refund will be processed.');
        getTravelBookings();
      } else {
        toast.error(response.data.message || 'Failed to cancel booking');
      }
      setLoading(false);
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
      setLoading(false);
    }
  };

  const handlePayNow = (booking) => {
    // Check if business has UPI ID configured
    if (!booking.businessId?.upiId) {
      toast.error('❌ Booking no longer available. Business payment details not configured.');
      return;
    }
    
    setSelectedBooking(booking);
    setShowPayment(true);
  };

  const handlePaymentComplete = (updatedBooking) => {
    // Refresh bookings after payment
    getTravelBookings();
    setShowPayment(false);
    setSelectedBooking(null);
  };

  const handlePackagePayNow = (booking) => {
    setSelectedPackageBooking(booking);
    setShowPackagePayment(true);
  };

  const handlePackagePaymentComplete = (updatedBooking) => {
    // Refresh package bookings after payment
    getPackageBookings();
    setShowPackagePayment(false);
    setSelectedPackageBooking(null);
  };

  const handleRateUs = (booking) => {
    setSelectedBookingForRating(booking);
    setShowRatingsModal(true);
  };

  const handleRatingSubmitted = (rating) => {
    // Refresh bookings to update the rating status
    getTravelBookings();
    setShowRatingsModal(false);
    setSelectedBookingForRating(null);
  };

  // Filter bookings by tab
  const filteredTravelBookings = activeTab === 'all' ? travelBookings : 
    travelBookings.filter(b => b.businessType === activeTab);
  
  const showPackageTab = activeTab === 'all' || activeTab === 'package';

  return (
    <div className="w-full flex justify-center">
      <div className="w-[95%] shadow-xl rounded-lg p-3 flex flex-col gap-2">
        {loading && <h1 className="text-center text-2xl">Loading...</h1>}
        {error && <h1 className="text-center text-2xl">{error}</h1>}
        
        {/* Search Bar */}
        <div className="w-full border-b-4 pb-3">
          <input
            className="border rounded-lg p-2 mb-2 w-full"
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Bookings', icon: '📋' },
            { id: 'hotel', label: 'Hotels', icon: '🏨' },
            { id: 'restaurant', label: 'Restaurants', icon: '🍽️' },
            { id: 'cafe', label: 'Cafes', icon: '☕' },
            { id: 'cab', label: 'Cabs', icon: '🚗' },
            { id: 'package', label: 'Packages', icon: '📦' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Travel Bookings (Hotels, Restaurants, Cafes, Cabs) */}
        {!loading && filteredTravelBookings && filteredTravelBookings.length > 0 && (
          <div className="mb-4">
            {filteredTravelBookings.map((booking, i) => (
              <div
                className="w-full border-2 border-orange-200 rounded-lg p-4 mb-3 flex flex-wrap gap-3 items-center justify-between bg-orange-50"
                key={`travel-${i}`}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      booking.businessId?.profileImage || 
                      booking.businessId?.mainImage || 
                      (booking.businessId?.businessImages && booking.businessId.businessImages.length > 0 ? booking.businessId.businessImages[0] : null)
                    }
                    alt={booking.businessId?.businessName || 'Business'}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold text-lg">{booking.businessId?.businessName}</p>
                    <p className="text-sm text-gray-600">{booking.businessType?.toUpperCase()}</p>
                    {booking.bookingDetails?.roomType && <p className="text-sm">Room: {booking.bookingDetails.roomType}</p>}
                  </div>
                </div>
                
                {/* Cab Booking Details */}
                {booking.businessType === 'cab' ? (
                  <div className="text-sm flex-1">
                    <p><strong>🟢 Pickup:</strong> {booking.bookingDetails?.pickupLocation || 'N/A'}</p>
                    <p><strong>🔴 Drop:</strong> {booking.bookingDetails?.dropLocation || 'N/A'}</p>
                    <p><strong>🕐 Pickup Time:</strong> {booking.bookingDetails?.pickupTime ? new Date(booking.bookingDetails.pickupTime).toLocaleString('en-IN') : 'N/A'}</p>
                    <p><strong>👥 Passengers:</strong> {booking.bookingDetails?.passengers || 'N/A'}</p>
                  </div>
                ) : (
                  /* Hotel/Restaurant/Cafe Booking Details */
                  <div className="text-sm">
                    <p><strong>Check-in:</strong> {booking.bookingDetails?.checkIn ? new Date(booking.bookingDetails.checkIn).toLocaleDateString('en-IN') : 'N/A'}</p>
                    <p><strong>Check-out:</strong> {booking.bookingDetails?.checkOut ? new Date(booking.bookingDetails.checkOut).toLocaleDateString('en-IN') : 'N/A'}</p>
                    <p><strong>Guests:</strong> {booking.bookingDetails?.guests || 'N/A'}</p>
                  </div>
                )}
                <div className="text-sm">
                  <p><strong>Amount Paid:</strong> ₹{booking.amount || 0}</p>
                  {booking.businessType === 'cab' && (
                    <p className="text-xs text-blue-600 italic">Advance payment (Final fare after trip)</p>
                  )}
                  {booking.businessType === 'hotel' && booking.totalAmount && (
                    <>
                      <p className="text-xs text-gray-600">Total: ₹{booking.totalAmount}</p>
                      {booking.paymentOption === 'advance' && (
                        <p className="text-xs text-orange-600 font-medium">
                          Remaining ₹{booking.totalAmount - booking.amount} to pay on spot
                        </p>
                      )}
                      {booking.paymentOption === 'full' && (
                        <p className="text-xs text-green-600 font-medium">✓ Full payment completed</p>
                      )}
                    </>
                  )}
                  <p className="text-sm">
                    <strong>Payment:</strong> 
                    <span className={`ml-1 px-2 py-1 rounded ${
                      booking.paymentStatus === 'paid' ? 'bg-green-200 text-green-800' : 
                      booking.paymentStatus === 'pending_verification' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-orange-200 text-orange-800'
                    }`}>
                      {booking.paymentStatus === 'pending_verification' ? 'Pending Verification' : booking.paymentStatus}
                    </span>
                  </p>
                  {booking.paymentStatus === 'pending_verification' && (
                    <p className="text-xs text-yellow-700 mt-1 italic">
                      ⏳ Business is verifying your payment. Please wait...
                    </p>
                  )}
                  <p className="text-sm">
                    <strong>Status:</strong> 
                    <span className={`ml-1 px-2 py-1 rounded ${booking.status === 'confirmed' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>
                      {booking.status}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {/* For cab bookings, only show Pay Now if status is confirmed and payment is pending */}
                  {booking.businessType === 'cab' ? (
                    <>
                      {booking.status === 'confirmed' && booking.paymentStatus !== 'paid' && (
                        <>
                          <button
                            onClick={() => handlePayNow(booking)}
                            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-semibold"
                          >
                            💳 Pay Advance (₹{booking.amount})
                          </button>
                          <p className="text-xs text-red-600 font-semibold bg-red-50 px-3 py-2 rounded border border-red-200">
                            ⚠️ Service will be provided only after advance payment is completed
                          </p>
                        </>
                      )}
                      {booking.status === 'pending' && (
                        <span className="px-4 py-2 rounded bg-blue-100 text-blue-800 text-sm font-medium">
                          ⏳ Waiting for confirmation
                        </span>
                      )}
                      {/* Add Rate Us button for completed cab bookings */}
                      {booking.status === 'confirmed' && booking.paymentStatus === 'paid' && (
                        <button
                          onClick={() => handleRateUs(booking)}
                          className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 font-semibold"
                        >
                          ⭐ Rate Your Experience
                        </button>
                      )}
                    </>
                  ) : (
                    /* For other bookings, show Pay Now if not paid */
                    booking.paymentStatus !== 'paid' && (
                      <button
                        onClick={() => handlePayNow(booking)}
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                      >
                        Pay Now
                      </button>
                    )
                  )}
                  {/* Add Rate Us button for completed non-cab bookings */}
                  {booking.businessType !== 'cab' && booking.status === 'confirmed' && booking.paymentStatus === 'paid' && (
                    <button
                      onClick={() => handleRateUs(booking)}
                      className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 font-semibold"
                    >
                      ⭐ Rate Your Experience
                    </button>
                  )}
                  <button
                    onClick={() => handleTravelBookingCancel(booking._id)}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Package Bookings (New system with payment) */}
        {!loading && showPackageTab && packageBookings && packageBookings.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2 text-purple-600">Package Bookings</h2>
            {packageBookings.map((booking, i) => (
              <div
                className="w-full border-2 border-purple-200 rounded-lg p-4 mb-3 flex flex-wrap gap-3 items-center justify-between bg-purple-50"
                key={`pkg-${i}`}
              >
                <div className="flex items-center gap-3">
                  <Link to={`/package/${booking?.packageId?._id}`}>
                    <img
                      className="w-16 h-16 rounded-lg object-cover"
                      src={`http://localhost:8000/images/${booking?.packageId?.packageImages[0]}`}
                      alt="Package"
                      onError={(e) => (e.target.src = 'https://placehold.co/64x64/e2e8f0/64748b?text=Package')}
                    />
                  </Link>
                  <div>
                    <Link to={`/package/${booking?.packageId?._id}`}>
                      <p className="font-semibold text-lg hover:underline">
                        {booking?.packageId?.packageName}
                      </p>
                    </Link>
                    <p className="text-sm text-gray-600">{booking?.packageId?.packageDestination}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p><strong>Travel Date:</strong> {new Date(booking.travelDate).toLocaleDateString('en-IN')}</p>
                  <p><strong>People:</strong> {booking.numberOfPeople}</p>
                  <p><strong>Booking Date:</strong> {new Date(booking.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-sm">
                  <p><strong>Amount:</strong> ₹{booking.totalAmount}</p>
                  <p className="text-sm">
                    <strong>Payment:</strong> 
                    <span className={`ml-1 px-2 py-1 rounded ${
                      booking.paymentStatus === 'paid' ? 'bg-green-200 text-green-800' : 
                      booking.paymentStatus === 'failed' ? 'bg-red-200 text-red-800' : 
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {booking.paymentStatus.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-sm">
                    <strong>Status:</strong> 
                    <span className={`ml-1 px-2 py-1 rounded ${
                      booking.bookingStatus === 'confirmed' ? 'bg-green-200 text-green-800' : 
                      booking.bookingStatus === 'cancelled' ? 'bg-red-200 text-red-800' : 
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {booking.bookingStatus.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {booking.paymentStatus === 'pending' && (
                    <button
                      onClick={() => handlePackagePayNow(booking)}
                      className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-semibold"
                    >
                      💳 Pay Now
                    </button>
                  )}
                  {booking.transactionId && (
                    <p className="text-xs text-gray-600">
                      Txn: {booking.transactionId}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Package Bookings (Old system) */}
        {!loading && currentBookings && currentBookings.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-2 text-blue-600">Legacy Package Bookings</h2>
            {currentBookings.map((booking, i) => (
              <div
                className="w-full border-y-2 p-3 flex flex-wrap overflow-auto gap-3 items-center justify-between"
                key={`package-${i}`}
              >
                <Link to={`/package/${booking?.packageDetails?._id}`}>
                  <img
                    className="w-12 h-12 rounded"
                    src={`http://localhost:8000/images/${booking?.packageDetails?.packageImages[0]}`}
                    alt="Package Image"
                    onError={(e) => (e.target.src = 'https://placehold.co/48x48/e2e8f0/64748b?text=Package')}
                  />
                </Link>
                <Link to={`/package/${booking?.packageDetails?._id}`}>
                  <p className="hover:underline">
                    {booking?.packageDetails?.packageName}
                  </p>
                </Link>
                <p>{booking?.buyer?.username}</p>
                <p>{booking?.buyer?.email}</p>
                <p>{booking?.date}</p>
                <button
                  onClick={() => handleCancel(booking._id)}
                  className="p-2 rounded bg-red-600 text-white hover:opacity-95"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}

        {/* No Bookings Message */}
        {!loading && (
          <>
            {activeTab === 'all' && currentBookings.length === 0 && travelBookings.length === 0 && packageBookings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
                <p className="text-gray-500">You don't have any active bookings yet.</p>
              </div>
            )}
            {activeTab === 'hotel' && filteredTravelBookings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏨</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Hotel Bookings</h3>
                <p className="text-gray-500">You don't have any hotel bookings.</p>
              </div>
            )}
            {activeTab === 'restaurant' && filteredTravelBookings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Restaurant Bookings</h3>
                <p className="text-gray-500">You don't have any restaurant bookings.</p>
              </div>
            )}
            {activeTab === 'cafe' && filteredTravelBookings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">☕</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Cafe Bookings</h3>
                <p className="text-gray-500">You don't have any cafe bookings.</p>
              </div>
            )}
            {activeTab === 'cab' && filteredTravelBookings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Cab Bookings</h3>
                <p className="text-gray-500">You don't have any cab bookings.</p>
              </div>
            )}
            {activeTab === 'package' && packageBookings.length === 0 && currentBookings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Package Bookings</h3>
                <p className="text-gray-500">You don't have any package bookings.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* UPI Payment Modal for Travel Bookings */}
      {showPayment && selectedBooking && (
        <UPIPayment
          booking={selectedBooking}
          onPaymentComplete={handlePaymentComplete}
          onClose={() => {
            setShowPayment(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {/* Ratings Modal */}
      {showRatingsModal && selectedBookingForRating && (
        <RatingsModal
          isOpen={showRatingsModal}
          onClose={() => {
            setShowRatingsModal(false);
            setSelectedBookingForRating(null);
          }}
          booking={selectedBookingForRating}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  );
};

export default MyBookings;
