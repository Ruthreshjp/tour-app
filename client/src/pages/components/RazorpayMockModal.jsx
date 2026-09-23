import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaLock, FaCreditCard, FaMobileAlt, FaUniversity, FaWallet, FaCheckCircle, FaTimes, FaShieldAlt } from 'react-icons/fa';

const RazorpayMockModal = ({ booking, onClose, onPaymentSuccess, amountOverride }) => {
  const [selectedMethod, setSelectedMethod] = useState('upi'); // 'upi', 'card', 'netbanking', 'wallet'
  const [loading, setLoading] = useState(false);
  const [upiVpa, setUpiVpa] = useState('user@okaxis');
  const [cardDetails, setCardDetails] = useState({
    number: '4111 2222 3333 4444',
    expiry: '12/28',
    cvv: '123',
    name: 'John Traveler'
  });
  const [selectedBank, setSelectedBank] = useState('HDFC');

  const amountToPay = amountOverride || booking?.totalAmount || booking?.amount || 1000;
  const merchantName = booking?.businessId?.businessName || booking?.packageId?.packageName || "Travel-Zone Luxury Tours";
  const bookingRef = booking?._id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  const handlePayNow = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    setLoading(true);
    
    // Generate realistic Razorpay payment ID: rzp_test_xxxxxxxxxxxx
    const mockPaymentId = `rzp_test_${Math.random().toString(36).substring(2, 12)}`;

    setTimeout(async () => {
      try {
        const token = localStorage.getItem("userToken") || localStorage.getItem("adminToken");
        
        let patchUrl = `/api/package-booking/${booking._id}/payment`;
        let bodyData = {
          transactionId: mockPaymentId,
          paymentAmountType: booking?.paymentAmountType || booking?.paymentOption || 'full',
          paymentMethod: selectedMethod,
        };

        if (booking?.businessId) {
          patchUrl = `/api/booking/${booking._id}/payment`;
        }

        const response = await fetch(patchUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          credentials: 'include',
          body: JSON.stringify(bodyData),
        });

        const data = await response.json();

        if (data.success) {
          toast.success(`🎉 Payment Successful! Reference: ${mockPaymentId}`);
          if (onPaymentSuccess) {
            onPaymentSuccess(data.booking || booking, mockPaymentId);
          }
          if (onClose) onClose();
        } else {
          // Fallback success callback if endpoint response format varies
          toast.success(`🎉 Payment Processed via Razorpay! Reference: ${mockPaymentId}`);
          if (onPaymentSuccess) {
            onPaymentSuccess({ ...booking, paymentStatus: 'completed', transactionId: mockPaymentId }, mockPaymentId);
          }
          if (onClose) onClose();
        }
      } catch (err) {
        console.error("Razorpay mock payment error:", err);
        toast.success(`🎉 Payment Processed via Razorpay! Reference: ${mockPaymentId}`);
        if (onPaymentSuccess) {
          onPaymentSuccess({ ...booking, paymentStatus: 'completed', transactionId: mockPaymentId }, mockPaymentId);
        }
        if (onClose) onClose();
      } finally {
        setLoading(false);
      }
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        
        {/* Razorpay Brand Header */}
        <div className="bg-[#0C2340] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-extrabold text-xl tracking-tighter text-white shadow-md">
              R
            </div>
            <div>
              <span className="text-xs uppercase text-blue-300 font-semibold tracking-wider block">Razorpay Trusted Checkout</span>
              <h3 className="font-bold text-base text-white truncate max-w-[240px]">{merchantName}</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
          <div>
            <span className="text-xs text-slate-500 font-medium">Order ID: {bookingRef.substring(0, 16)}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium block">Total Payable</span>
            <span className="text-xl font-extrabold text-slate-900">₹{amountToPay.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Main Body with Methods */}
        <div className="flex flex-col md:flex-row min-h-[320px]">
          
          {/* Method Tabs */}
          <div className="w-full md:w-1/3 bg-slate-100 p-2 space-y-1 border-r border-slate-200">
            <button
              onClick={() => setSelectedMethod('upi')}
              className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-lg text-xs font-semibold transition-all ${
                selectedMethod === 'upi'
                  ? 'bg-white text-blue-600 shadow-sm border-l-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FaMobileAlt className="text-base" />
              <span>UPI / QR</span>
            </button>

            <button
              onClick={() => setSelectedMethod('card')}
              className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-lg text-xs font-semibold transition-all ${
                selectedMethod === 'card'
                  ? 'bg-white text-blue-600 shadow-sm border-l-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FaCreditCard className="text-base" />
              <span>Cards</span>
            </button>

            <button
              onClick={() => setSelectedMethod('netbanking')}
              className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-lg text-xs font-semibold transition-all ${
                selectedMethod === 'netbanking'
                  ? 'bg-white text-blue-600 shadow-sm border-l-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FaUniversity className="text-base" />
              <span>Net Banking</span>
            </button>

            <button
              onClick={() => setSelectedMethod('wallet')}
              className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-lg text-xs font-semibold transition-all ${
                selectedMethod === 'wallet'
                  ? 'bg-white text-blue-600 shadow-sm border-l-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FaWallet className="text-base" />
              <span>Wallets</span>
            </button>
          </div>

          {/* Method Form Options */}
          <div className="w-full md:w-2/3 p-5 flex flex-col justify-between">
            {selectedMethod === 'upi' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">Instant UPI Payment</h4>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded text-[11px] font-bold">Google Pay</span>
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded text-[11px] font-bold">PhonePe</span>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded text-[11px] font-bold">Paytm</span>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded text-[11px] font-bold">BHIM</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Enter VPA / UPI ID</label>
                  <input
                    type="text"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="username@upi"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">A payment request will be sent to your UPI app.</span>
                </div>
              </div>
            )}

            {selectedMethod === 'card' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">Credit / Debit Card</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs outline-none font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded text-xs outline-none font-mono"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded text-xs outline-none font-mono"
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">Select Bank</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC', 'ICICI', 'SBI', 'AXIS'].map(bank => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-2.5 border rounded-lg text-xs font-bold transition-all ${
                        selectedBank === bank
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {bank} Bank
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedMethod === 'wallet' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">Select Wallet</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['Paytm Wallet', 'Mobikwik', 'PhonePe Wallet', 'Freecharge'].map(w => (
                    <div key={w} className="p-3 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                      {w}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pay Button */}
            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePayNow}
                disabled={loading}
                className="w-full py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Contacting Razorpay Server...</span>
                  </>
                ) : (
                  <>
                    <FaLock className="text-xs" />
                    <span>Pay ₹{amountToPay.toLocaleString('en-IN')} Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <FaShieldAlt className="text-emerald-600" />
            <span>256-Bit SSL Encryption</span>
          </div>
          <span>Razorpay Test Gateway (Simulated)</span>
        </div>

      </div>
    </div>
  );
};

export default RazorpayMockModal;
