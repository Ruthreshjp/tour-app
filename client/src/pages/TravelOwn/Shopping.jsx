import React from 'react';
import { FaShoppingBag, FaClock, FaCreditCard } from 'react-icons/fa';
import BusinessList from '../components/BusinessList';

const Shopping = () => {
  // Function to render shopping-specific information
  const renderShoppingInfo = (shop) => (
    <div className="space-y-2">
      <div className="flex items-center text-gray-600">
        <FaShoppingBag className="mr-2" />
        <span>Type: {shop.type || 'Mall'}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <FaClock className="mr-2" />
        <span>Hours: {shop.hours?.open || '10:00 AM'} - {shop.hours?.close || '10:00 PM'}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <FaCreditCard className="mr-2" />
        <span>Payment Methods: {shop.paymentMethods?.join(', ') || 'All major cards accepted'}</span>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <BusinessList
        businessType="shopping"
        title="Nearby Shopping"
        renderAdditionalInfo={renderShoppingInfo}
        searchPlaceholder="Search shopping centers by name, type..."
      />
    </div>
  );
};

export default Shopping;