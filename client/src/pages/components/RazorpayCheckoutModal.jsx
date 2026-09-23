import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { loadRazorpayScript } from '../../utils/loadRazorpay';
import { FaShieldAlt, FaLock } from 'react-icons/fa';

const RazorpayCheckoutModal = ({ booking, onClose, onPaymentSuccess, amountOverride }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const amountToPay = amountOverride || booking?.totalAmount || booking?.amount || 1000;
  const merchantName = booking?.businessId?.businessName || booking?.packageId?.packageName || "Travel-Zone Luxury Tours";
  const bookingDescription = `Payment for ${booking?.packageId?.packageName || booking?.businessId?.businessName || 'Travel Booking'}`;

  useEffect(() => {
    openRazorpayCheckout();
  }, []);

  const openRazorpayCheckout = async () => {
    setLoading(true);
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
      setError(true);
      setLoading(false);
      return;
    }

    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SPnkx43FsWVffJ",
        amount: Math.round(amountToPay * 100), // Amount in paise
        currency: "INR",
        name: "Travel-Zone",
        description: bookingDescription,
        image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=200&q=80",
        handler: async function (response) {
          const paymentId = response.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 12)}`;
          toast.success(`🎉 Payment Successful! Razorpay Payment ID: ${paymentId}`);
          
          try {
            const token = localStorage.getItem("userToken") || localStorage.getItem("adminToken");
            let patchUrl = `/api/package-booking/${booking._id}/payment`;
            let bodyData = {
              transactionId: paymentId,
              paymentAmountType: booking?.paymentAmountType || booking?.paymentOption || 'full',
              paymentMethod: 'razorpay',
            };

            if (booking?.businessId) {
              patchUrl = `/api/booking/${booking._id}/payment`;
            }

            const res = await fetch(patchUrl, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
              },
              credentials: 'include',
              body: JSON.stringify(bodyData),
            });

            const data = await res.json();
            if (onPaymentSuccess) {
              onPaymentSuccess(data.booking || booking, paymentId);
            }
          } catch (err) {
            console.error("Payment update error:", err);
            if (onPaymentSuccess) {
              onPaymentSuccess(booking, paymentId);
            }
          } finally {
            if (onClose) onClose();
          }
        },
        prefill: {
          name: booking?.contactName || "Demo User",
          email: booking?.contactEmail || "user@tourapp.com",
          contact: booking?.contactPhone || "9876543210",
        },
        notes: {
          booking_id: booking?._id || "demo_booking",
        },
        theme: {
          color: "#EB662B",
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled.");
            if (onClose) onClose();
          },
        },
      };

      setLoading(false);
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay Checkout Error:", err);
      toast.error("Failed to open Razorpay Checkout modal.");
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center border border-gray-100">
        {loading ? (
          <div className="py-8 space-y-4">
            <div className="w-12 h-12 border-4 border-[#EB662B] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="text-lg font-bold text-gray-800">Opening Razorpay Standard Checkout...</h3>
            <p className="text-xs text-gray-500">Connecting to official Razorpay Test Payment Gateway</p>
          </div>
        ) : error ? (
          <div className="py-6 space-y-4">
            <div className="text-red-500 text-4xl">⚠️</div>
            <h3 className="text-lg font-bold text-gray-800">Razorpay Initialization Failed</h3>
            <p className="text-xs text-gray-500">Could not launch Razorpay Checkout window.</p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={openRazorpayCheckout}
                className="px-4 py-2 bg-[#EB662B] text-white text-xs font-bold rounded-lg hover:bg-[#d55a24]"
              >
                Retry Razorpay
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-semibold">
              <FaShieldAlt className="text-base" />
              <span>Razorpay Checkout Active</span>
            </div>
            <p className="text-xs text-gray-500">
              Complete the payment in the Razorpay popup window.
            </p>
            <button
              onClick={openRazorpayCheckout}
              className="px-6 py-2.5 bg-[#EB662B] text-white text-xs font-bold rounded-xl shadow hover:bg-[#d55a24] transition-all"
            >
              Re-open Razorpay Popup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RazorpayCheckoutModal;
