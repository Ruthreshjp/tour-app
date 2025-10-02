// client/src/pages/components/LocationPicker.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { toast } from 'react-toastify';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

const LocationPicker = ({ onLocationSelect, initialLocation = null }) => {
  const [position, setPosition] = useState(initialLocation || [28.6139, 77.2090]); // Default to Delhi
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation);
      reverseGeocode(initialLocation[0], initialLocation[1]);
    }
  }, [initialLocation]);

  const reverseGeocode = async (lat, lng) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/geocode/reverse', {
        params: { lat, lng }
      });

      if (response.data.success) {
        setAddress(response.data.address);
        onLocationSelect && onLocationSelect({
          lat,
          lng,
          address: response.data.address
        });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      toast.error('Could not get address for selected location');
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (lat, lng) => {
    setPosition([lat, lng]);
    reverseGeocode(lat, lng);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get current location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 space-y-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={getCurrentLocation}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
          >
            📍 Use Current Location
          </button>
        </div>
        {address && (
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Selected Address:</strong> {address}
            </p>
          </div>
        )}
        {loading && (
          <p className="text-sm text-blue-600">Getting address...</p>
        )}
      </div>

      <div className="h-64 w-full rounded-lg overflow-hidden border">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <div>
                <p><strong>Selected Location</strong></p>
                <p>Lat: {position[0].toFixed(6)}</p>
                <p>Lng: {position[1].toFixed(6)}</p>
                {address && <p>Address: {address}</p>}
              </div>
            </Popup>
          </Marker>
          <MapClickHandler onLocationSelect={handleMapClick} />
        </MapContainer>
      </div>
      
      <p className="text-sm text-gray-500 mt-2">
        Click anywhere on the map to select a location, or use the current location button.
      </p>
    </div>
  );
};

export default LocationPicker;
