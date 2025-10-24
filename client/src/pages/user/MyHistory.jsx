import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Image } from "../../components/Image";

// Configure axios with credentials
const axiosWithCredentials = axios.create({
  withCredentials: true
});

const MyHistory = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [allBookings, setAllBookings] = useState([]);
  const [travelHistory, setTravelHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const getAllBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/booking/get-allUserBookings/${currentUser?._id}?searchTerm=${search}`
      );
      const data = await res.json();
      if (data?.success) {
        setAllBookings(data?.bookings);
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

  const getTravelHistory = async () => {
    try {
      console.log('📜 Fetching travel history...');
      const response = await axiosWithCredentials.get('/api/booking/user');
      console.log('✅ Travel history response:', response.data);
      if (response.data.success) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter past confirmed bookings, cancelled, and declined bookings
        const history = response.data.bookings.filter(b => {
          // Check if this is a business booking (has bookingDetails)
          if (!b.bookingDetails || !b.bookingDetails.checkIn) {
            return false; // Skip non-business bookings
          }
          
          if (b.status === 'cancelled' || b.status === 'declined') {
            return true; // Show all cancelled and declined
          }
          if (b.status === 'confirmed') {
            // Show confirmed bookings with past check-in dates
            const checkInDate = new Date(b.bookingDetails.checkIn);
            checkInDate.setHours(0, 0, 0, 0);
            return checkInDate < today;
          }
          return false;
        });
        console.log('📊 History bookings:', history);
        setTravelHistory(history);
      }
    } catch (error) {
      console.error('❌ Error fetching travel history:', error);
      console.error('❌ Error details:', error.response?.data);
    }
  };

  useEffect(() => {
    getAllBookings();
    getTravelHistory();
  }, [search]);

  const handleHistoryDelete = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/booking/delete-booking-history/${id}/${currentUser._id}`,
        {
          method: "DELETE",
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-200 text-green-800';
      case 'cancelled': return 'bg-red-200 text-red-800';
      case 'declined': return 'bg-gray-200 text-gray-800';
      default: return 'bg-blue-200 text-blue-800';
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-[95%] shadow-xl rounded-lg p-3 flex flex-col gap-2">
        <h1 className="text-center text-2xl">History</h1>
        {loading && <h1 className="text-center text-2xl">Loading...</h1>}
        {error && <h1 className="text-center text-2xl">{error}</h1>}
        <div className="w-full border-b-4">
          <input
            className="border rounded-lg p-2 mb-2"
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </div>

        {/* Travel Booking History */}
        {!loading && travelHistory && travelHistory.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2 text-orange-600">Travel Booking History</h2>
            {travelHistory.map((booking, i) => (
              <div
                className="w-full border-2 border-gray-200 rounded-lg p-4 mb-3 flex flex-wrap gap-3 items-center justify-between"
                key={`travel-history-${i}`}
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
                    {booking.roomNumber && <p className="text-sm text-green-600">Room #: {booking.roomNumber}</p>}
                  </div>
                </div>
                <div className="text-sm">
                  <p><strong>Check-in:</strong> {booking.bookingDetails?.checkIn ? new Date(booking.bookingDetails.checkIn).toLocaleDateString('en-IN') : 'N/A'}</p>
                  <p><strong>Check-out:</strong> {booking.bookingDetails?.checkOut ? new Date(booking.bookingDetails.checkOut).toLocaleDateString('en-IN') : 'N/A'}</p>
                  <p><strong>Guests:</strong> {booking.bookingDetails?.guests || 'N/A'}</p>
                </div>
                <div className="text-sm">
                  <p><strong>Amount:</strong> ₹{booking.amount || 0}</p>
                  <p className="text-sm">
                    <strong>Payment:</strong> 
                    <span className={`ml-1 px-2 py-1 rounded ${
                      booking.paymentStatus === 'paid' ? 'bg-green-200 text-green-800' : 
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </p>
                  <p className="text-sm">
                    <strong>Status:</strong> 
                    <span className={`ml-1 px-2 py-1 rounded ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </p>
                  {booking.transactionId && (
                    <p className="text-xs text-gray-600">TXN: {booking.transactionId}</p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  <p>Booked: {new Date(booking.createdAt).toLocaleDateString()}</p>
                  {booking.status === 'cancelled' && (
                    <p className="text-xs text-red-600 mt-1">Cancelled bookings cannot be modified</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Package Booking History */}
        {!loading && allBookings && allBookings.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-2 text-blue-600">Package Booking History</h2>
            {allBookings.map((booking, i) => (
              <div
                className="w-full border-y-2 p-3 flex flex-wrap overflow-auto gap-3 items-center justify-between"
                key={`package-history-${i}`}
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
                <div className="text-sm">
                  <p className={`px-2 py-1 rounded inline-block ${
                    booking?.status === "Cancelled" ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {booking?.status || 'Completed'}
                  </p>
                  {(new Date(booking?.date).getTime() < new Date().getTime() ||
                    booking?.status === "Cancelled") && (
                    <button
                      onClick={() => handleHistoryDelete(booking._id)}
                      className="ml-2 p-2 rounded bg-red-600 text-white hover:opacity-95"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && allBookings.length === 0 && travelHistory.length === 0 && (
          <p className="text-center text-gray-500 py-8">No booking history found</p>
        )}
      </div>
    </div>
  );
};

export default MyHistory;
