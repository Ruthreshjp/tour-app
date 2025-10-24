import React, { useState } from 'react';
import { FaQrcode, FaCopy, FaCheckCircle, FaRupeeSign } from 'react-icons/fa';

const AdvancePaymentModal = ({ isOpen, onClose, businessName, businessType, upiId, amount = 100, bookingId }) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const handleCopy = () => {
    if (!upiId || !navigator?.clipboard?.writeText) return;
    navigator.clipboard.writeText(upiId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopied(false);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Advance Payment Required</h3>
            <p className="text-sm text-orange-100">Reserve your {businessType || 'reservation'} by paying ₹{amount}</p>
          </div>
          <button onClick={onClose} className="text-white text-2xl leading-none hover:text-orange-200">×</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
            <h4 className="font-semibold text-orange-800 mb-2">Why pay in advance?</h4>
            <ul className="text-sm text-orange-700 space-y-1 list-disc list-inside">
              <li>₹{amount} blocks your table and guarantees the reservation.</li>
              <li>This amount will be adjusted in your final bill at the {businessType || 'venue'}.</li>
              <li>If you cancel in advance, the business can manage slots better.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pay to</p>
                <p className="font-semibold text-gray-900">{businessName || 'Business'}</p>
              </div>
              <div className="flex items-center gap-1 text-lg font-semibold text-green-600">
                <FaRupeeSign />
                <span>{amount}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-medium mb-1">UPI ID</p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="break-all">{upiId || 'UPI not configured'}</span>
                {upiId && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm"
                    type="button"
                  >
                    {copied ? <FaCheckCircle /> : <FaCopy />} {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              {!upiId && (
                <p className="text-xs text-red-500 mt-2">
                  Ask the business for their UPI ID to complete the advance payment.
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-medium mb-1">Reference Note</p>
              <p>Add this note while paying: <span className="font-semibold">Advance for booking {bookingId?.slice(-6) || ''}</span></p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2">How to pay</h4>
            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Open your preferred UPI app (GPay, PhonePe, Paytm, etc.).</li>
              <li>Select "Pay to UPI ID" and enter the UPI mentioned above.</li>
              <li>Enter the amount <strong>₹{amount}</strong> and add the reference note.</li>
              <li>Complete the payment and keep the transaction ID handy for verification.</li>
            </ol>
          </div>

          <div className="text-xs text-gray-500">
            <p>
              Please share the transaction details with the venue if asked. The advance is deducted from your total bill during checkout.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancePaymentModal;
