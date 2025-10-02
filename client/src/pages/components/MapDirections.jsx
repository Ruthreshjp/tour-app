import React from 'react';
import { FaDirections } from 'react-icons/fa';

const MapDirections = ({ destination, currentLocation }) => {
  const handleGetDirections = () => {
    // Format coordinates for Google Maps URL
    const origin = currentLocation ? `${currentLocation.lat},${currentLocation.lng}` : '';
    const dest = destination?.coordinates ? `${destination.coordinates[1]},${destination.coordinates[0]}` : destination?.address;
    
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