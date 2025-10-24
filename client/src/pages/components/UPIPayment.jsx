import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaQrcode, FaCopy, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';

const UPIPayment = ({ booking, onPaymentComplete, onClose }) => {
  const [transactionId, setTransactionId] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    generateUPIQR();
    
    // Debug logging
    console.log('💳 UPI Payment Modal - Business Data:', {
      businessName: booking.businessId?.businessName,
      upiId: booking.businessId?.upiId,
      hasUpiId: !!booking.businessId?.upiId
    });
    
    // Show warning if UPI ID is missing
    if (!booking.businessId?.upiId) {
      toast.warning('⚠️ Business UPI ID not configured. Using placeholder. Please contact business to update their UPI ID.');
    }
  }, []);

  const generateUPIQR = () => {
    // Get business UPI ID from booking or use default
    const businessUPI = booking.businessId?.upiId || 'business@upi';
    const amount = booking.amount;
    const bookingId = booking._id;
    
    console.log('💳 Generating UPI QR for:', {
      upiId: businessUPI,
      amount: amount,
      businessName: booking.businessId?.businessName
    });
    
    // Generate UPI payment URL
    const upiUrl = `upi://pay?pa=${businessUPI}&pn=${booking.businessId?.businessName || 'Business'}&am=${amount}&cu=INR&tn=Booking Payment ${bookingId}`;
    
    setQrCodeData(upiUrl);
  };

  const handleCopyUPI = () => {
    const businessUPI = booking.businessId?.upiId || 'business@upi';
    navigator.clipboard.writeText(businessUPI);
    setCopied(true);
    toast.success('UPI ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };


  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await axios.patch(`/api/booking/${booking._id}/payment`, {
        transactionId: transactionId.trim(),
        paymentMethod: 'upi'
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('✅ Payment submitted! Waiting for business verification...');
        onPaymentComplete && onPaymentComplete(response.data.booking);
        onClose && onClose();
      }
    } catch (error) {
      console.error('Payment update error:', error);
      toast.error('Failed to update payment status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
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
              <span>Business:</span>
              <span className="font-medium">{booking.businessId?.businessName}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-bold text-green-600">₹{booking.amount}</span>
            </div>
            <div className="flex justify-between">
              <span>Booking ID:</span>
              <span className="font-mono text-xs">{booking._id}</span>
            </div>
          </div>
        </div>

        {/* UPI Payment Section */}
        <div className="text-center mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <FaQrcode className="text-4xl text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-800 mb-2">Scan QR code with any UPI app</p>
            
            {/* QR Code - Using external API */}
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
              <p className="text-xs text-gray-500 mt-2">Scan to pay ₹{booking.amount}</p>
            </div>
            
            <div className="text-xs text-blue-700">
              <p>Pay to: {booking.businessId?.businessName}</p>
              <div className="flex items-center justify-center mt-1">
                <span className="mr-2">UPI ID: {booking.businessId?.upiId || 'business@upi'}</span>
                <button
                  onClick={handleCopyUPI}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {copied ? <FaCheckCircle /> : <FaCopy />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Payment Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h5 className="font-semibold text-yellow-800 mb-2">Manual Payment Steps:</h5>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Open your UPI app (GPay, PhonePe, Paytm, etc.)</li>
            <li>Send ₹{booking.amount} to UPI ID: {booking.businessId?.upiId || 'business@upi'}</li>
            <li>Add note: "Booking {booking._id}"</li>
            <li>Complete the payment</li>
            <li>Enter transaction ID below</li>
          </ol>
        </div>

        {/* Transaction ID Form */}
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction ID *
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter UPI transaction ID"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              You can find this in your UPI app after payment completion
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={submitting || !transactionId.trim()}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {submitting ? 'Processing...' : '✓ Confirm Payment'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            ⏳ After submitting transaction ID, please wait for business to verify your payment
          </p>
        </div>
      </div>
    </div>
  );
};

export default UPIPayment;
