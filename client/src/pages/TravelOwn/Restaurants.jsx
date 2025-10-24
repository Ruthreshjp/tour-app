import React, { useState } from 'react';
import { FaUtensils, FaClock, FaDollarSign, FaTable } from 'react-icons/fa';
import BusinessList from '../components/BusinessList';
import RestaurantDetailsModal from '../components/RestaurantDetailsModal';
import RestaurantBooking from '../components/RestaurantBooking';
import { toast } from 'react-toastify';

const Restaurants = () => {
  const [tableSize, setTableSize] = useState('');
  const [isAC, setIsAC] = useState('');

  const handleBookingSuccess = (booking) => {
    toast.success('Table booked successfully!');
  };
  
  // Function to render restaurant-specific information
  const renderRestaurantInfo = (restaurant) => (
    <div className="space-y-3">
      <div className="flex items-center text-gray-600">
        <FaUtensils className="mr-2" />
        <span>Cuisine: {restaurant.cuisine?.join(', ') || 'Various'}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <FaClock className="mr-2" />
        <span>Hours: {restaurant.hours?.open || '9:00 AM'} - {restaurant.hours?.close || '10:00 PM'}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <FaDollarSign className="mr-2" />
        <span>Average cost for two: ₹{restaurant.averageCost || 1000}</span>
      </div>
      
      {/* Enhanced Table Pricing Display */}
      {((restaurant.tables && restaurant.tables.length > 0) || (restaurant.pricing?.tables && restaurant.pricing.tables.length > 0)) && (
        <div className="mt-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <FaTable className="text-green-500" />
            Table Options
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {(restaurant.tables || restaurant.pricing?.tables || []).slice(0, 4).map((table, idx) => (
              <div key={idx} className="p-2 bg-gray-50 rounded border">
                <div className="flex justify-between items-center">
                  <div className="flex gap-1 flex-wrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {table.capacity} seats
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      table.isAC ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {table.isAC ? 'AC' : 'Non-AC'}
                    </span>
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  {table.pricing.perPerson > 0 && (
                    <span>₹{table.pricing.perPerson}/person</span>
                  )}
                  {table.pricing.tableCharge > 0 && (
                    <span className="ml-2">+ ₹{table.pricing.tableCharge} table</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Popular Menu Items */}
      {restaurant.menu?.items && restaurant.menu.items.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Popular Items</h4>
          <div className="space-y-1">
            {restaurant.menu.items
              .filter(item => item.isAvailable)
              .slice(0, 3)
              .map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {item.name}
                  </span>
                  <span className="font-semibold">₹{item.price}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  // Enhanced filter function for new pricing structure
  const enhancedFilter = (restaurant) => {
    let matches = true;
    
    // Table size filter
    if (tableSize) {
      const num = Number(tableSize);
      if (restaurant.pricing?.tables) {
        matches = restaurant.pricing.tables.some(t => t.capacity === num);
      } else if (Array.isArray(restaurant.tables)) {
        matches = restaurant.tables.some(t => t.capacity === num);
      } else {
        matches = false;
      }
    }
    
    // AC filter
    if (isAC && matches) {
      const acRequired = isAC === 'true';
      if (restaurant.pricing?.tables) {
        matches = restaurant.pricing.tables.some(t => t.isAC === acRequired);
      } else if (Array.isArray(restaurant.tables)) {
        matches = restaurant.tables.some(t => t.isAC === acRequired);
      } else {
        matches = false;
      }
    }
    
    return matches;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end mb-4 gap-4">
        <select
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={tableSize}
          onChange={(e) => setTableSize(e.target.value)}
        >
          <option value="">Table size</option>
          <option value="2">2 People</option>
          <option value="4">4 People</option>
          <option value="6">6 People</option>
          <option value="8">8 People</option>
          <option value="10">10 People</option>
          <option value="12">12 People</option>
        </select>
        
        <select
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={isAC}
          onChange={(e) => setIsAC(e.target.value)}
        >
          <option value="">AC Preference</option>
          <option value="true">AC Only</option>
          <option value="false">Non-AC Only</option>
        </select>
      </div>
      
      <BusinessList
        businessType="restaurant"
        title="Nearby Restaurants"
        renderAdditionalInfo={renderRestaurantInfo}
        searchPlaceholder="Search restaurants by name, cuisine..."
        extraFilter={enhancedFilter}
        DetailsModal={RestaurantDetailsModal}
        BookingModal={RestaurantBooking}
        onBookingSuccess={handleBookingSuccess}
      />

    </div>
  );
};

export default Restaurants;
