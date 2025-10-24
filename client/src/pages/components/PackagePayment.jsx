import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaQrcode, FaCopy, FaCheckCircle } from 'react-icons/fa';

const PackagePayment = ({ booking, onClose, onPaymentComplete }) => {
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminUPI, setAdminUPI] = useState(null);
  const [qrCodeData, setQrCodeData] = useState('');

  useEffect(() => {
    fetchAdminUPI();
  }, []);

  useEffect(() => {
    if (adminUPI && booking) {
      // Generate UPI payment URL
      const upiUrl = `upi://pay?pa=${adminUPI.upiId}&pn=${encodeURIComponent(adminUPI.adminName)}&am=${booking.totalAmount}&cu=INR&tn=${encodeURIComponent('Package Booking ' + booking._id)}`;
      setQrCodeData(upiUrl);
    }
  }, [adminUPI, booking]);

  const fetchAdminUPI = async () => {
    try {
      const response = await fetch('/api/package-booking/admin/upi');
      const data = await response.json();
      
      if (data.success) {
        setAdminUPI(data);
      } else {
        toast.error('Failed to fetch payment details');
      }
    } catch (error) {
      console.error('Error fetching admin UPI:', error);
      toast.error('Failed to load payment information');
    }
  };

  const handleCopyUPI = () => {
    if (adminUPI?.upiId) {
      navigator.clipboard.writeText(adminUPI.upiId);
      toast.success('UPI ID copied to clipboard!');
    }
  };

  const handlePaymentSubmit = async () => {
    if (!transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/package-booking/${booking._id}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          transactionId: transactionId.trim(),
          paymentStatus: 'paid',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment submitted successfully!');
        onPaymentComplete && onPaymentComplete(data.booking);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        toast.error(data.message || 'Payment submission failed');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  if (!booking || !adminUPI) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <p className="text-center">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Complete Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">Booking Details</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Package:</span>
              <span className="font-medium">{booking.packageId?.packageName}</span>
            </div>
            <div className="flex justify-between">
              <span>People:</span>
              <span className="font-medium">{booking.numberOfPeople}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount to Pay:</span>
              <span className="font-bold text-green-600">₹{booking.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Booking ID:</span>
              <span className="font-mono text-xs">{booking._id}</span>
            </div>
          </div>
        </div>

        {/* No Refund Warning */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800 font-semibold mb-1">
            ⚠️ No Refund Policy
          </p>
          <p className="text-xs text-red-600">
            This payment is non-refundable. Cancellation will not result in any refund.
          </p>
        </div>

        {/* UPI Payment Section */}
        <div className="text-center mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <FaQrcode className="text-4xl text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-800 mb-2">Scan QR code with any UPI app</p>
            
            {/* QR Code */}
            <div className="bg-white border-2 border-solid border-blue-300 rounded-lg p-4 mb-3">
              {qrCodeData ? (
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`}
                  alt="UPI Payment QR Code"
                  className="mx-auto"
                  style={{ width: '200px', height: '200px' }}
                />
              ) : (
                <div className="text-6xl text-blue-400 mb-2">⬜</div>
              )}
              <p className="text-xs text-gray-500 mt-2">Scan to pay ₹{booking.totalAmount}</p>
            </div>
            
            <div className="text-xs text-blue-700">
              <p>Pay to: {adminUPI.adminName}</p>
              <div className="flex items-center justify-center mt-1">
                <span className="mr-2">UPI ID: {adminUPI.upiId}</span>
                <button
                  onClick={handleCopyUPI}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaCopy />
                </button>
              </div>
            </div>
          </div>

          {/* Manual Payment Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-left">
            <p className="text-xs text-yellow-800 font-semibold mb-1">
              Manual Payment Steps:
            </p>
            <ol className="text-xs text-yellow-700 list-decimal list-inside space-y-1">
              <li>Open your UPI app (GPay, PhonePe, Paytm, etc.)</li>
              <li>Scan the QR code or enter UPI ID manually</li>
              <li>Enter amount: ₹{booking.totalAmount}</li>
              <li>Complete the payment</li>
              <li>Copy the transaction ID and paste below</li>
            </ol>
          </div>
        </div>

        {/* Transaction ID Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction ID / UPI Reference Number
          </label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Enter transaction ID from your UPI app"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can find this in your UPI app's transaction history
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handlePaymentSubmit}
            disabled={loading || !transactionId.trim()}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <FaCheckCircle />
                Confirm Payment
              </>
            )}
          </button>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Your booking will be confirmed once the payment is verified by our team
        </p>
      </div>
    </div>
  );
};

export default PackagePayment;
