import React, { useState, useEffect } from 'react';
import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SimpleLocationPicker = ({ isOpen, onClose, onSelectLocation, initialLocation, title = "Select Location" }) => {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialLocation) {
      setAddress(initialLocation);
    }
  }, [isOpen, initialLocation]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates(`${latitude}, ${longitude}`);
          
          // Get address from coordinates
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              {
                headers: {
                  'Accept': 'application/json',
                  'User-Agent': 'TourApp/1.0'
                }
              }
            );
            const data = await response.json();
            if (data && data.display_name) {
              setAddress(data.display_name);
              toast.success('Location detected!');
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            setAddress(`${latitude}, ${longitude}`);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Unable to get location. Please enter manually.');
          setLoading(false);
        }
      );
    } else {
      toast.error('Geolocation not supported by your browser');
    }
  };

  const handleConfirm = () => {
    if (!address || address.trim() === '') {
      toast.error('Please enter a location or use current location');
      return;
    }

    // Parse coordinates if available
    let lat = null;
    let lng = null;
    if (coordinates) {
      const [latStr, lngStr] = coordinates.split(',').map(s => s.trim());
      lat = parseFloat(latStr);
      lng = parseFloat(lngStr);
    }

    onSelectLocation({
      address: address.trim(),
      coordinates: coordinates || address,
      lat: lat,
      lng: lng
    });
    onClose();
  };

  const handleOpenGoogleMaps = () => {
    // Open Google Maps at current location or default location
    let mapsUrl;
    if (coordinates) {
      const [lat, lng] = coordinates.split(',').map(s => s.trim());
      mapsUrl = `https://www.google.com/maps/@${lat},${lng},15z`;
    } else {
      mapsUrl = 'https://www.google.com/maps';
    }
    window.open(mapsUrl, '_blank');
    toast.info('Right-click on Google Maps to drop a pin, then copy the coordinates or address');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <FaMapMarkerAlt className="inline mr-2" />
              Use your current location or enter an address manually. You can also open Google Maps to find the exact location.
            </p>
          </div>

          {/* Manual Address Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Location Address:
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter full address (e.g., 123 Main Street, City, State, Pincode)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Coordinates Display */}
          {coordinates && (
            <div className="mb-6 bg-gray-100 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">GPS Coordinates:</p>
              <p className="text-sm font-mono text-gray-800">{coordinates}</p>
            </div>
          )}

          {/* Selected Location Preview */}
          {address && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Location:
              </label>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900">{address}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUseCurrentLocation}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Detecting Location...
                </>
              ) : (
                <>
                  <FaMapMarkerAlt />
                  Use My Current Location
                </>
              )}
            </button>

            <button
              onClick={handleOpenGoogleMaps}
              className="w-full px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center gap-2"
            >
              🗺️ Open Google Maps to Find Location
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                disabled={!address || loading}
                className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Confirm Location
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              <strong>📍 How to use Google Maps:</strong>
            </p>
            <ol className="text-xs text-yellow-800 space-y-1 ml-4 list-decimal">
              <li>Click "Open Google Maps" button above</li>
              <li>Right-click on your desired location on the map</li>
              <li>Click on the coordinates that appear (e.g., "19.0760, 72.8777")</li>
              <li>The coordinates will be copied automatically</li>
              <li>Come back here and paste in the address box</li>
              <li>Or copy the full address from the left panel in Google Maps</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLocationPicker;
