import React, { useEffect, useRef, useState } from 'react';
import { FaMapMarkerAlt, FaSearch, FaCrosshairs, FaCheck } from 'react-icons/fa';

const LeafletLocationPicker = ({ 
  onLocationSelect,
  initialLocation = null,
  height = '400px'
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Load Leaflet JS
        if (!window.L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        setMapLoaded(true);
      } catch (error) {
        console.error('Error loading Leaflet:', error);
      }
    };

    loadLeaflet();
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([location.lat, location.lng], 15);
            updateMarker(location, 'Current Location');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Chennai if geolocation fails
          const defaultLocation = { lat: 13.0827, lng: 80.2707 };
          setCurrentLocation(defaultLocation);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([defaultLocation.lat, defaultLocation.lng], 13);
          }
        }
      );
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      // Initialize map
      const initialCenter = initialLocation || currentLocation || { lat: 13.0827, lng: 80.2707 };
      const map = window.L.map(mapRef.current).setView([initialCenter.lat, initialCenter.lng], 13);

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Add click handler
      map.on('click', (e) => {
        const location = {
          lat: e.latlng.lat,
          lng: e.latlng.lng
        };
        updateMarker(location, 'Selected Location');
        reverseGeocode(location);
      });

      mapInstanceRef.current = map;

      // Get current location if not provided
      if (!initialLocation) {
        getCurrentLocation();
      } else {
        updateMarker(initialLocation, initialLocation.address || 'Selected Location');
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapLoaded, initialLocation]);

  // Update marker on map
  const updateMarker = (location, popupText = 'Selected Location') => {
    if (!mapInstanceRef.current || !window.L) return;

    // Remove existing marker
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    // Create custom marker icon
    const customIcon = window.L.divIcon({
      html: `<div style="background: #ef4444; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); transform: rotate(-45deg); display: flex; align-items: center; justify-content: center;">
               <div style="color: white; font-size: 12px; transform: rotate(45deg);">📍</div>
             </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      className: 'location-marker'
    });

    // Add new marker
    const marker = window.L.marker([location.lat, location.lng], { icon: customIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup(popupText)
      .openPopup();

    markerRef.current = marker;
    setSelectedLocation(location);
  };

  // Reverse geocoding using Nominatim (OpenStreetMap)
  const reverseGeocode = async (location) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      const locationWithAddress = {
        ...location,
        address: data.display_name || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
      };
      
      setSelectedLocation(locationWithAddress);
      
      if (onLocationSelect) {
        onLocationSelect(locationWithAddress);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      const locationWithCoords = {
        ...location,
        address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
      };
      setSelectedLocation(locationWithCoords);
      
      if (onLocationSelect) {
        onLocationSelect(locationWithCoords);
      }
    }
  };

  // Search for location using Nominatim
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const location = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          address: result.display_name
        };
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([location.lat, location.lng], 15);
          updateMarker(location, location.address);
        }
        
        if (onLocationSelect) {
          onLocationSelect(location);
        }
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Error searching for location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  if (!mapLoaded) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            placeholder="Search for a location..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <button
          onClick={searchLocation}
          disabled={isSearching || !searchQuery.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <FaSearch />
          )}
          Search
        </button>
        <button
          onClick={getCurrentLocation}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          title="Use current location"
        >
          <FaCrosshairs />
        </button>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full rounded-lg border border-gray-300"
          style={{ height }}
        />
        
        {/* Instructions */}
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 p-2 rounded text-xs text-gray-600 max-w-xs">
          Click on the map to select a location
        </div>
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-gray-800">Selected Location:</p>
              <p className="text-sm text-gray-600">{selectedLocation.address}</p>
              <p className="text-xs text-gray-500">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
            <FaCheck className="text-green-500 mt-1" />
          </div>
        </div>
      )}
    </div>
  );
};

export default LeafletLocationPicker;
