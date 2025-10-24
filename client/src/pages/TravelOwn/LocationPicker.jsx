import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to recenter map when center changes
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

const LocationPicker = ({ isOpen, onClose, onSelectLocation, initialLocation, title = "Select Location" }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]); // Default: Mumbai
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMapReady(false);
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        setMapReady(true);
      }, 100);

      // Get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setMapCenter([latitude, longitude]);
            if (!initialLocation) {
              setPosition({ lat: latitude, lng: longitude });
              reverseGeocode(latitude, longitude);
            }
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }

      // If initial location is provided, use it
      if (initialLocation) {
        // Try to parse coordinates from initialLocation string
        const coordMatch = initialLocation.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
        if (coordMatch) {
          const lat = parseFloat(coordMatch[1]);
          const lng = parseFloat(coordMatch[2]);
          setPosition({ lat, lng });
          setMapCenter([lat, lng]);
          setAddress(initialLocation);
        } else {
          setAddress(initialLocation);
        }
      }
    } else {
      setMapReady(false);
    }
  }, [isOpen, initialLocation]);

  const reverseGeocode = async (lat, lng) => {
    try {
      setLoading(true);
      // Using Nominatim for reverse geocoding (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TourApp/1.0' // Nominatim requires a user agent
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (position) {
      reverseGeocode(position.lat, position.lng);
    }
  }, [position]);

  const handleConfirm = () => {
    if (position && address) {
      // Return both coordinates and address
      onSelectLocation({
        address: address,
        coordinates: `${position.lat}, ${position.lng}`,
        lat: position.lat,
        lng: position.lng
      });
      onClose();
    } else {
      toast.error('Please select a location on the map first');
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ lat: latitude, lng: longitude });
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get current location. Please enable location services.');
        }
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <p className="text-sm text-blue-800">
            <FaMapMarkerAlt className="inline mr-2" />
            Click anywhere on the map to select a location, or use the button below to use your current location.
          </p>
        </div>

        {/* Map */}
        <div className="flex-1 relative bg-gray-200" style={{ minHeight: '500px', height: '500px' }}>
          {!mapReady ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', width: '100%', position: 'relative' }}>
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ 
                  height: '100%', 
                  width: '100%', 
                  zIndex: 1
                }}
                scrollWheelZoom={true}
                ref={mapRef}
                whenCreated={(mapInstance) => {
                  console.log('Map created:', mapInstance);
                  setTimeout(() => {
                    mapInstance.invalidateSize();
                    console.log('Map size invalidated');
                  }, 100);
                }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={19}
                  errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                />
                <RecenterMap center={mapCenter} />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
          )}
        </div>

        {/* Selected Location Display */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Location:
            </label>
            {loading ? (
              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded border border-blue-200">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <p className="text-sm text-blue-700">Loading address...</p>
              </div>
            ) : address ? (
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="text-sm font-medium text-green-900">{address}</p>
              </div>
            ) : (
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="text-sm text-yellow-800">👆 Click on the map above to select a location</p>
              </div>
            )}
          </div>

          {position && (
            <div className="bg-gray-100 p-2 rounded mb-3">
              <p className="text-xs text-gray-600">
                📍 Coordinates: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleUseCurrentLocation}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <FaMapMarkerAlt />
              Use Current Location
            </button>
            <button
              onClick={handleConfirm}
              disabled={!position || !address || loading}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Location
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
