import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";

const Payments = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const getAllBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/package-booking/admin/all', {
        withCredentials: true
      });
      
      if (response.data?.success) {
        setAllBookings(response.data?.bookings);
        setLoading(false);
        setError(false);
      } else {
        setLoading(false);
        setError(response.data?.message);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
      setError('Failed to fetch bookings');
    }
  };

  useEffect(() => {
    getAllBookings();
  }, []);

  // Filter bookings based on search and payment status
  const filteredBookings = allBookings.filter(booking => {
    const matchesSearch = search === "" || 
      booking.userId?.username?.toLowerCase().includes(search.toLowerCase()) ||
      booking.userId?.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || booking.paymentStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Calculate total paid amount
  const totalPaidAmount = allBookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const totalPendingAmount = allBookings
    .filter(b => b.paymentStatus === 'pending')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="w-full flex justify-center">
      <div className="w-[95%] shadow-xl rounded-lg p-4 flex flex-col gap-4">
        <h1 className="text-center text-2xl font-bold">Package Booking Payments</h1>
        {loading && <h1 className="text-center text-2xl">Loading...</h1>}
        {error && <h1 className="text-center text-2xl text-red-600">{error}</h1>}
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Total Paid</h3>
            <p className="text-2xl font-bold text-green-600">₹{totalPaidAmount.toLocaleString('en-IN')}</p>
            <p className="text-sm text-gray-600">{allBookings.filter(b => b.paymentStatus === 'paid').length} bookings</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800">Total Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">₹{totalPendingAmount.toLocaleString('en-IN')}</p>
            <p className="text-sm text-gray-600">{allBookings.filter(b => b.paymentStatus === 'pending').length} bookings</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Total Bookings</h3>
            <p className="text-2xl font-bold text-blue-600">{allBookings.length}</p>
            <p className="text-sm text-gray-600">All package bookings</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            className="border rounded-lg p-2 flex-1 min-w-[200px]"
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border rounded-lg p-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Package</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Travel Date</th>
                <th className="p-3 text-left">People</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Payment Status</th>
                <th className="p-3 text-left">Transaction ID</th>
                <th className="p-3 text-left">Booking Date</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredBookings && filteredBookings.length > 0 ? (
                filteredBookings.map((booking, i) => (
                  <tr
                    className="border-b hover:bg-gray-50"
                    key={i}
                  >
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3">
                      <Link to={`/package/${booking?.packageId?._id}`} className="hover:underline">
                        <div className="flex items-center gap-2">
                          <img
                            className="w-12 h-12 rounded object-cover"
                            src={`http://localhost:8000/images/${booking?.packageId?.packageImages?.[0]}`}
                            alt="Package"
                            onError={(e) => (e.target.src = 'https://placehold.co/48x48/e2e8f0/64748b?text=Package')}
                          />
                          <span className="font-semibold">{booking?.packageId?.packageName}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-semibold">{booking?.userId?.username}</p>
                        <p className="text-sm text-gray-600">{booking?.userId?.email}</p>
                        <p className="text-xs text-gray-500">{booking?.userId?.phone}</p>
                      </div>
                    </td>
                    <td className="p-3">{new Date(booking.travelDate).toLocaleDateString('en-IN')}</td>
                    <td className="p-3">{booking.numberOfPeople}</td>
                    <td className="p-3 font-bold text-lg">₹{booking.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        booking.paymentStatus === 'paid' ? 'bg-green-200 text-green-800' :
                        booking.paymentStatus === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-red-200 text-red-800'
                      }`}>
                        {booking.paymentStatus === 'paid' ? '✓ Paid' : 
                         booking.paymentStatus === 'pending' ? '⏳ Pending' : '✗ Failed'}
                      </span>
                    </td>
                    <td className="p-3">
                      {booking.transactionId ? (
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {booking.transactionId}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="p-3 text-sm">{new Date(booking.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No bookings found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
