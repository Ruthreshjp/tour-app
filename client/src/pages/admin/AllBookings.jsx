import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Chart from "../components/Chart";
import axios from "axios";

const axiosWithCredentials = axios.create({
  withCredentials: true
});

const AllBookings = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [currentBookings, setCurrentBookings] = useState([]);
  const [packageBookings, setPackageBookings] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getAllBookings = async () => {
    setCurrentBookings([]);
    try {
      setLoading(true);
      const res = await fetch(
        `/api/booking/get-currentBookings?searchTerm=${searchTerm}`
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

  const getPackageBookings = async () => {
    try {
      console.log('📦 Fetching package bookings for admin...');
      const query = paymentFilter !== 'all' ? `?paymentStatus=${paymentFilter}` : '';
      const response = await axiosWithCredentials.get(`/api/package-booking/admin/all${query}`);
      console.log('✅ Package bookings response:', response.data);
      if (response.data.success) {
        setPackageBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('❌ Error fetching package bookings:', error);
    }
  };

  useEffect(() => {
    getAllBookings();
    getPackageBookings();
  }, [searchTerm, paymentFilter]);

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
        alert(data?.message);
        getAllBookings();
      } else {
        setLoading(false);
        alert(data?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-[95%] shadow-xl rounded-lg p-3 px-1 flex flex-col gap-2">
        {loading && <h1 className="text-center text-2xl">Loading...</h1>}
        {error && <h1 className="text-center text-2xl">{error}</h1>}
        <div className="w-full border-b-4 p-3">
          <div className="flex gap-4 mb-4 flex-wrap">
            <input
              className="border rounded-lg p-2 flex-1 min-w-[200px]"
              type="text"
              placeholder="Search Username or Email"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
            <select
              className="border rounded-lg p-2"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          {currentBookings.length > 0 && <Chart data={currentBookings} />}
        </div>

        {/* Package Bookings Section */}
        {!loading && packageBookings && packageBookings.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-3 text-purple-600 px-3">Package Bookings ({packageBookings.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="border p-2 text-left">Package</th>
                    <th className="border p-2 text-left">Customer</th>
                    <th className="border p-2 text-left">Travel Date</th>
                    <th className="border p-2 text-left">People</th>
                    <th className="border p-2 text-left">Amount</th>
                    <th className="border p-2 text-left">Payment</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-left">Transaction ID</th>
                    <th className="border p-2 text-left">Booked On</th>
                  </tr>
                </thead>
                <tbody>
                  {packageBookings.map((booking, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border p-2">
                        <div className="flex items-center gap-2">
                          <img
                            className="w-12 h-12 rounded object-cover"
                            src={`http://localhost:8000/images/${booking?.packageId?.packageImages[0]}`}
                            alt="Package"
                            onError={(e) => (e.target.src = 'https://placehold.co/48x48/e2e8f0/64748b?text=Pkg')}
                          />
                          <div>
                            <p className="font-semibold text-sm">{booking?.packageId?.packageName}</p>
                            <p className="text-xs text-gray-600">{booking?.packageId?.packageDestination}</p>
                          </div>
                        </div>
                      </td>
                      <td className="border p-2">
                        <p className="text-sm font-medium">{booking?.contactName}</p>
                        <p className="text-xs text-gray-600">{booking?.contactEmail}</p>
                        <p className="text-xs text-gray-600">{booking?.contactPhone}</p>
                      </td>
                      <td className="border p-2 text-sm">
                        {new Date(booking.travelDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="border p-2 text-center font-semibold">
                        {booking.numberOfPeople}
                      </td>
                      <td className="border p-2 font-semibold text-green-600">
                        ₹{booking.totalAmount}
                      </td>
                      <td className="border p-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          booking.paymentStatus === 'paid' ? 'bg-green-200 text-green-800' : 
                          booking.paymentStatus === 'failed' ? 'bg-red-200 text-red-800' : 
                          'bg-yellow-200 text-yellow-800'
                        }`}>
                          {booking.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="border p-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          booking.bookingStatus === 'confirmed' ? 'bg-green-200 text-green-800' : 
                          booking.bookingStatus === 'cancelled' ? 'bg-red-200 text-red-800' : 
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {booking.bookingStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="border p-2 text-xs font-mono">
                        {booking.transactionId || '-'}
                      </td>
                      <td className="border p-2 text-sm">
                        {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legacy Package Bookings Section */}
        <h2 className="text-xl font-bold mb-2 text-blue-600 px-3">Legacy Package Bookings</h2>
        {!loading &&
          currentBookings &&
          currentBookings.map((booking, i) => {
            return (
              <div
                className="w-full border-y-2 p-3 flex flex-wrap overflow-auto gap-3 items-center justify-between"
                key={i}
              >
                <Link to={`/package/${booking?.packageDetails?._id}`}>
                  <img
                    className="w-12 h-12"
                    src={`http://localhost:8000/images/${booking?.packageDetails?.packageImages[0]}`}
                    alt="Package Image"
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
                  onClick={() => {
                    handleCancel(booking._id);
                  }}
                  className="p-2 rounded bg-red-600 text-white hover:opacity-95"
                >
                  Cancel
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default AllBookings;
