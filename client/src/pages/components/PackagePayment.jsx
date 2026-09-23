import React from 'react';
import RazorpayCheckoutModal from './RazorpayCheckoutModal';

const PackagePayment = ({ booking, onClose, onPaymentComplete }) => {
  return (
    <RazorpayCheckoutModal
      booking={booking}
      onClose={onClose}
      onPaymentSuccess={(updatedBooking, transactionId) => {
        if (onPaymentComplete) {
          onPaymentComplete(updatedBooking, transactionId);
        }
      }}
    />
  );
};

export default PackagePayment;
