import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Chart from "../components/Chart";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE } from "../../utils/apiBase";

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
  const [reviewAction, setReviewAction] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const getAllBookings = async () => {
    setCurrentBookings([]);
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/api/booking/get-currentBookings?searchTerm=${searchTerm}`,
        { credentials: 'include' }
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
      const response = await axiosWithCredentials.get(`${API_BASE}/api/package-booking/admin/all${query}`);
      console.log('✅ Package bookings response:', response.data);
      if (response.data.success) {
        setPackageBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('❌ Error fetching package bookings:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch package bookings');
    }
  };

  const handlePaymentReview = async (bookingId, received, paymentAmountType) => {
    try {
      setReviewAction(`${bookingId}-${received}`);
      const payload = { received };
      if (paymentAmountType) {
        payload.paymentAmountType = paymentAmountType;
      }

      const response = await axiosWithCredentials.patch(`/api/package-booking/admin/${bookingId}/payment`, payload);

      if (response.data.success) {
        toast.success(received ? 'Payment marked as received.' : 'Payment marked as pending.');
        getPackageBookings();
      } else {
        toast.error(response.data.message || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('❌ Error reviewing payment:', error);
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    } finally {
      setReviewAction(null);
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
                    <th className="border p-2 text-left">Payment Details</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-left">Booked On</th>
                    <th className="border p-2 text-left">Verify Payment</th>
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
                        <div className="space-y-1 text-xs">
                          <div>
                            <strong>Type:</strong> {booking.paymentAmountType ? booking.paymentAmountType.toUpperCase() : 'FULL'}
                          </div>
                          <div>
                            <strong>Status:</strong>{' '}
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              (booking.paymentStatus === 'paid' || booking.transactionId) ? 'bg-green-200 text-green-800' : 
                              booking.paymentStatus === 'failed' ? 'bg-red-200 text-red-800' : 
                              'bg-orange-200 text-orange-800'
                            }`}>
                              {(booking.paymentStatus === 'paid' || booking.transactionId) ? 'PAID' : (booking.paymentStatus ? booking.paymentStatus.toUpperCase() : 'PENDING')}
                            </span>
                          </div>
                          {booking.transactionId && (
                            <div className="text-emerald-700 font-mono">
                              <strong>Txn ID:</strong> {booking.transactionId}
                            </div>
                          )}
                          <div className="text-gray-500">
                            <strong>Gateway:</strong> Razorpay Standard
                          </div>
                          <button
                            onClick={() => setSelectedTransaction(booking)}
                            className="mt-1 text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold px-2 py-1 rounded border border-purple-200 transition-colors flex items-center gap-1"
                          >
                            💳 View Transaction Details
                          </button>
                        </div>
                      </td>
                      <td className="border p-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          (booking.bookingStatus === 'confirmed' || booking.paymentStatus === 'paid' || booking.transactionId) ? 'bg-green-200 text-green-800' : 
                          booking.bookingStatus === 'cancelled' ? 'bg-red-200 text-red-800' : 
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {(booking.bookingStatus === 'confirmed' || booking.paymentStatus === 'paid' || booking.transactionId) ? 'CONFIRMED' : booking.bookingStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="border p-2 text-sm">
                        {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="border p-2">
                        {(booking.paymentStatus === 'paid' || booking.transactionId) ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-800 text-xs font-bold border border-green-300">
                            <span>⚡</span> Auto Verified (Razorpay)
                          </div>
                        ) : (
                          <span className="px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-800 text-xs font-bold">
                            ⏳ Awaiting Payment
                          </span>
                        )}
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

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 relative">
            <button
              onClick={() => setSelectedTransaction(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl font-bold">
                💳
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Transaction & Payment Details</h3>
                <p className="text-xs text-gray-500 font-mono">Booking ID: {selectedTransaction._id}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-medium">Payment Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    (selectedTransaction.paymentStatus === 'paid' || selectedTransaction.transactionId) ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800'
                  }`}>
                    {(selectedTransaction.paymentStatus === 'paid' || selectedTransaction.transactionId) ? 'PAID & CONFIRMED ✅' : 'PENDING PAYMENT ⏳'}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-medium">Payment Type:</span>
                  <span className="font-bold text-purple-700">
                    {selectedTransaction.paymentAmountType === 'advance' ? 'Advance Payment (Partial)' : 'Full Payment'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total Amount:</span>
                  <span className="text-xl font-extrabold text-green-600">₹{selectedTransaction.totalAmount}</span>
                </div>
              </div>

              <div className="space-y-2 border-t pt-3">
                <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wider">Gateway Details</h4>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Transaction ID:</span>
                  <span className="font-mono text-emerald-700 font-semibold">{selectedTransaction.transactionId || 'N/A (Pending)'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Payment Gateway:</span>
                  <span className="font-medium text-gray-800">Razorpay Checkout Standard</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Booking Date:</span>
                  <span className="font-medium text-gray-800">{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2 border-t pt-3">
                <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wider">Customer & Package Details</h4>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Package Name:</span>
                  <span className="font-semibold text-gray-800">{selectedTransaction.packageId?.packageName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Customer Name:</span>
                  <span className="font-medium text-gray-800">{selectedTransaction.contactName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Customer Email:</span>
                  <span className="font-medium text-gray-800">{selectedTransaction.contactEmail}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Customer Phone:</span>
                  <span className="font-medium text-gray-800">{selectedTransaction.contactPhone}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-md"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBookings;
