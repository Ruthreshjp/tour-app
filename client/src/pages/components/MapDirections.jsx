import React from 'react';
import { FaDirections } from 'react-icons/fa';

const MapDirections = ({ destination, currentLocation }) => {
  const handleGetDirections = () => {
    // Format coordinates for Google Maps URL
    const origin = currentLocation ? `${currentLocation.lat},${currentLocation.lng}` : '';
    
    // Handle different destination formats
    let dest;
    if (destination?.location?.coordinates && destination.location.coordinates.length >= 2) {
      // Business model format: location.coordinates [longitude, latitude]
      dest = `${destination.location.coordinates[1]},${destination.location.coordinates[0]}`;
    } else if (destination?.coordinates && destination.coordinates.length >= 2) {
      // Legacy format: coordinates [longitude, latitude]
      dest = `${destination.coordinates[1]},${destination.coordinates[0]}`;
    } else if (destination?.address) {
      // Fallback to address
      dest = destination.address;
    } else if (typeof destination === 'string') {
      // Direct address string
      dest = destination;
    } else {
      // Default fallback
      dest = 'Unknown Location';
    }
    
    // Create Google Maps directions URL
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ''}${dest ? `&destination=${encodeURIComponent(dest)}` : ''}`;
    
    // Open in new tab
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <button
      onClick={handleGetDirections}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
    >
      <FaDirections />
      Get Directions on Google Maps
    </button>
  );
};

export default MapDirections;