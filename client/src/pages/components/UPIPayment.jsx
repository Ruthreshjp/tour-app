import React from 'react';
import RazorpayCheckoutModal from './RazorpayCheckoutModal';

const UPIPayment = ({ booking, onPaymentComplete, onClose }) => {
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

export default UPIPayment;
