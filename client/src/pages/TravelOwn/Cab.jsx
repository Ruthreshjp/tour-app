import React, { useState } from 'react';
import BusinessList from '../components/BusinessList';
import { FaTaxi, FaCar, FaUsers, FaSnowflake, FaRupeeSign } from 'react-icons/fa';

const Cab = () => {
  const [vehicleType, setVehicleType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [isAC, setIsAC] = useState('');

  const renderCabInfo = (cab) => {
    // Use new pricing structure first, fallback to old
    const vehicles = cab.pricing?.vehicles || (Array.isArray(cab.vehicles) ? cab.vehicles : []);
    
    if (vehicles.length === 0) {
      return (
        <div className="space-y-2 text-gray-700">
          <div className="flex items-center gap-2">
            <FaTaxi />
            <span>No vehicle information available</span>
          </div>
        </div>
      );
    }

    const minPerKm = Math.min(...vehicles.map(v => Number(v.pricing?.perKm || v.pricePerKm || Infinity)).filter(p => Number.isFinite(p)));
    const types = [...new Set(vehicles.map(v => v.vehicleType || v.type))];
    
    return (
      <div className="space-y-3 text-gray-700">
        <div className="flex items-center gap-2">
          <FaTaxi className="text-yellow-500" />
          <span>Types: {types.length ? types.join(', ') : '—'}</span>
        </div>
        
        {Number.isFinite(minPerKm) && (
          <div className="flex items-center gap-2">
            <FaRupeeSign className="text-green-500" />
            <span className="text-sm text-gray-500">Starting from</span>
            <span className="font-semibold text-orange-600">₹{minPerKm}/km</span>
          </div>
        )}

        {/* Enhanced Vehicle Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {vehicles.slice(0, 4).map((vehicle, idx) => (
            <div key={idx} className="p-2 bg-gray-50 rounded border">
              <div className="flex justify-between items-center mb-1">
                <div className="flex gap-1 flex-wrap">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {vehicle.vehicleType || vehicle.type}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    {vehicle.capacity} seater
                  </span>
                  {vehicle.isAC && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">AC</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                {(vehicle.pricing?.perKm || vehicle.pricePerKm) && (
                  <div>₹{vehicle.pricing?.perKm || vehicle.pricePerKm}/km</div>
                )}
                {vehicle.pricing?.baseFare && (
                  <div>Base: ₹{vehicle.pricing.baseFare}</div>
                )}
                {vehicle.pricing?.waitingCharges && (
                  <div>Waiting: ₹{vehicle.pricing.waitingCharges}/hr</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced filter function
  const enhancedFilter = (cab) => {
    let matches = true;
    const vehicles = cab.pricing?.vehicles || (Array.isArray(cab.vehicles) ? cab.vehicles : []);
    
    if (vehicles.length === 0) return false;
    
    // Vehicle type filter
    if (vehicleType && matches) {
      matches = vehicles.some(v => (v.vehicleType || v.type) === vehicleType);
    }
    
    // Capacity filter
    if (capacity && matches) {
      const requiredCapacity = Number(capacity);
      matches = vehicles.some(v => v.capacity >= requiredCapacity);
    }
    
    // AC filter
    if (isAC && matches) {
      const acRequired = isAC === 'true';
      matches = vehicles.some(v => v.isAC === acRequired);
    }
    
    return matches;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Filters */}
      <div className="flex justify-end mb-4 gap-4 flex-wrap">
        <select
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
        >
          <option value="">Vehicle Type</option>
          <option value="hatchback">Hatchback</option>
          <option value="sedan">Sedan</option>
          <option value="suv">SUV</option>
          <option value="luxury">Luxury</option>
          <option value="tempo">Tempo Traveller</option>
        </select>
        
        <select
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        >
          <option value="">Capacity</option>
          <option value="4">4+ Seater</option>
          <option value="6">6+ Seater</option>
          <option value="7">7+ Seater</option>
          <option value="8">8+ Seater</option>
          <option value="12">12+ Seater</option>
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
        businessType="cab"
        title="Nearby Cab Services"
        renderAdditionalInfo={renderCabInfo}
        searchPlaceholder="Search cabs by name, area..."
        extraFilter={enhancedFilter}
      />
    </div>
  );
};

export default Cab;
