import React, { useState } from 'react';
import { FaCoffee, FaClock, FaWifi, FaTable, FaPlug } from 'react-icons/fa';
import BusinessList from '../components/BusinessList';
import CafeDetailsModal from '../components/CafeDetailsModal';
import CafeBooking from '../components/CafeBooking';
import { toast } from 'react-toastify';

const Cafe = () => {
  const [tableType, setTableType] = useState('');
  const [hasWifi, setHasWifi] = useState('');

  const handleBookingSuccess = (booking) => {
    toast.success('Table booked successfully!');
  };

  // Function to render cafe-specific information
  const renderCafeInfo = (cafe) => (
    <div className="space-y-3">
      <div className="flex items-center text-gray-600">
        <FaCoffee className="mr-2" />
        <span>Specialties: {cafe.specialties?.join(', ') || 'Coffee & Beverages'}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <FaClock className="mr-2" />
        <span>Hours: {cafe.businessHours?.monday?.openTime || '8:00'} - {cafe.businessHours?.monday?.closeTime || '22:00'}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <FaWifi className="mr-2" />
        <span>Wi-Fi: {cafe.amenities?.includes('WiFi') ? 'Available' : 'Not Available'}</span>
      </div>
      
      {/* Enhanced Table Display */}
      {cafe.tables && cafe.tables.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <FaTable className="text-green-500" />
            Table Options
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {cafe.tables.slice(0, 4).map((table, idx) => (
              <div key={idx} className="p-2 bg-gray-50 rounded border">
                <div className="flex justify-between items-center">
                  <div className="flex gap-1 flex-wrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {table.tableType} - {table.capacity} seats
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      table.isAC ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {table.isAC ? 'AC' : 'Non-AC'}
                    </span>
                    {table.tableType === 'work-friendly' && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        <FaPlug className="inline mr-1" />Power
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  {table.pricing?.perPerson > 0 && (
                    <span>₹{table.pricing.perPerson}/person</span>
                  )}
                  {table.pricing?.tableCharge > 0 && (
                    <span className="ml-2">Table: ₹{table.pricing.tableCharge}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Enhanced filter function for cafes
  const enhancedFilter = (cafe) => {
    let matches = true;
    
    if (tableType && cafe.tables) {
      matches = matches && cafe.tables.some(table => 
        table.tableType === tableType && table.availability
      );
    }
    
    if (hasWifi !== '') {
      const hasWifiAmenity = cafe.amenities?.includes('WiFi') || false;
      matches = matches && (hasWifi === 'true' ? hasWifiAmenity : !hasWifiAmenity);
    }
    
    return matches;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end mb-4 gap-4 flex-wrap">
        <select
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={tableType}
          onChange={(e) => setTableType(e.target.value)}
        >
          <option value="">Table Type</option>
          <option value="work-friendly">Work-Friendly</option>
          <option value="cozy">Cozy</option>
          <option value="couple">Couple</option>
          <option value="regular">Regular</option>
        </select>

        <select
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={hasWifi}
          onChange={(e) => setHasWifi(e.target.value)}
        >
          <option value="">WiFi Preference</option>
          <option value="true">WiFi Available</option>
          <option value="false">No WiFi Needed</option>
        </select>
      </div>

      <BusinessList
        businessType="cafe"
        title="Nearby Cafes"
        renderAdditionalInfo={renderCafeInfo}
        searchPlaceholder="Search cafes by name, specialty..."
        extraFilter={enhancedFilter}
        DetailsModal={CafeDetailsModal}
        BookingModal={CafeBooking}
        onBookingSuccess={handleBookingSuccess}
      />

    </div>
  );
};

export default Cafe;