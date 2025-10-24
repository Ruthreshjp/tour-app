import React, { useEffect, useRef, useState } from 'react';
import { FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BusinessLocationPicker = ({ isOpen, onClose, onConfirm, initialLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [tempLocation, setTempLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load Leaflet when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      loadLeafletMap();
    }
    
    // Cleanup on close
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.log('Map cleanup');
        }
        mapInstanceRef.current = null;
      }
      setMapLoaded(false);
      setIsLoading(false);
    };
  }, [isOpen]);

  const loadLeafletMap = async () => {
    // Don't reload if already loaded
    if (mapInstanceRef.current) return;
    
    try {
      console.log('Loading Leaflet...');
      
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
        console.log('Leaflet CSS loaded');
      }

      // Load Leaflet JS
      if (!window.L) {
        console.log('Loading Leaflet JS...');
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          script.onload = () => {
            console.log('Leaflet JS loaded successfully');
            resolve();
          };
          script.onerror = (error) => {
            console.error('Failed to load Leaflet JS', error);
            reject(error);
          };
          document.head.appendChild(script);
        });
      }

      console.log('Setting map loaded to true');
      setMapLoaded(true);
      setIsLoading(false);
      
      // Wait for DOM to be ready and initialize
      setTimeout(() => {
        console.log('Attempting to initialize map, mapRef.current:', mapRef.current);
        if (mapRef.current && !mapInstanceRef.current) {
          initializeMap();
        }
      }, 300);
    } catch (error) {
      console.error('Error loading map:', error);
      setIsLoading(false);
      toast.error('Failed to load map. Please try again.');
    }
  };

  const initializeMap = () => {
    console.log('initializeMap called', {
      hasL: !!window.L,
      hasMapRef: !!mapRef.current,
      hasMapInstance: !!mapInstanceRef.current
    });
    
    if (!window.L || !mapRef.current || mapInstanceRef.current) {
      console.log('Skipping map initialization');
      return;
    }

    console.log('Getting current location...');
    // Get current location or use default
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Got current location:', position.coords);
          const center = [position.coords.latitude, position.coords.longitude];
          createMap(center, true); // true = has current location
        },
        (error) => {
          console.log('Geolocation error, using default:', error);
          // Default to India center
          const center = [20.5937, 78.9629];
          createMap(center, false);
        },
        { timeout: 5000 }
      );
    } else {
      console.log('Geolocation not supported, using default');
      const center = [20.5937, 78.9629];
      createMap(center, false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    toast.info('🔍 Getting your current location...', { autoClose: 2000 });
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latlng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        console.log('GPS Location obtained:', {
          latitude: latlng.lat,
          longitude: latlng.lng,
          accuracy: position.coords.accuracy + ' meters'
        });
        
        // Center map on current location with higher zoom
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latlng.lat, latlng.lng], 16);
        }
        
        // Place marker at current location
        await placeMarker(latlng);
        
        toast.success(`✓ Current location detected (±${Math.round(position.coords.accuracy)}m accuracy)`, {
          autoClose: 3000
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get your current location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Please pin manually on the map.';
        }
        
        toast.error(errorMessage, { autoClose: 5000 });
      },
      { 
        timeout: 15000, 
        enableHighAccuracy: true,
        maximumAge: 0 // Don't use cached location
      }
    );
  };

  const createMap = (center) => {
    console.log('createMap called with center:', center);
    
    if (!mapRef.current) {
      console.error('mapRef.current is null!');
      return;
    }
    
    if (mapInstanceRef.current) {
      console.log('Map already exists');
      return;
    }
    
    try {
      console.log('Creating Leaflet map...');
      const map = window.L.map(mapRef.current, {
        center: center,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true
      });

      console.log('Map created, adding tiles...');
      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
      console.log('Map instance saved');

      // Add click listener
      map.on('click', async (e) => {
        console.log('Map clicked at:', e.latlng);
        placeMarker(e.latlng);
      });

      // Disable scroll wheel zoom when mouse leaves the map container
      if (mapRef.current) {
        mapRef.current.addEventListener('mouseenter', () => {
          map.scrollWheelZoom.enable();
        });
        mapRef.current.addEventListener('mouseleave', () => {
          map.scrollWheelZoom.disable();
        });
      }
      
      // Force map to resize properly
      setTimeout(() => {
        console.log('Invalidating map size');
        map.invalidateSize();
      }, 100);
      
      console.log('Map initialization complete!');
    } catch (error) {
      console.error('Error creating map:', error);
      toast.error('Failed to create map: ' + error.message);
    }
  };

  const placeMarker = async (latlng) => {
    if (!mapInstanceRef.current) return;

    console.log('Placing marker at:', latlng);

    // Remove existing marker
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    // Create new marker with custom icon
    const marker = window.L.marker([latlng.lat, latlng.lng], {
      draggable: false,
      icon: window.L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(mapInstanceRef.current);

    markerRef.current = marker;

    // Get address from coordinates
    try {
      console.log('Fetching address for coordinates:', latlng.lat, latlng.lng);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TourApp/1.0'
          }
        }
      );
      const data = await response.json();
      
      console.log('Geocoding response:', data);
      
      if (data && data.address) {
        // Format a more readable address
        const addr = data.address;
        const parts = [];
        
        if (addr.house_number) parts.push(addr.house_number);
        if (addr.road) parts.push(addr.road);
        if (addr.suburb) parts.push(addr.suburb);
        if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
        if (addr.state) parts.push(addr.state);
        if (addr.postcode) parts.push(addr.postcode);
        if (addr.country) parts.push(addr.country);
        
        const formattedAddress = parts.length > 0 ? parts.join(', ') : data.display_name;
        
        // Generate Google Maps link from coordinates
        const googleMapsLink = `https://www.google.com/maps?q=${latlng.lat},${latlng.lng}`;
        
        setTempLocation({
          address: formattedAddress,
          lat: latlng.lat,
          lng: latlng.lng,
          fullAddress: data.display_name,
          googleMapsLink: googleMapsLink,
          city: addr.city || addr.town || addr.village || '',
          state: addr.state || '',
          pincode: addr.postcode || ''
        });
        toast.success('📍 Location pinned! Review the details below.');
      } else if (data && data.display_name) {
        const googleMapsLink = `https://www.google.com/maps?q=${latlng.lat},${latlng.lng}`;
        setTempLocation({
          address: data.display_name,
          lat: latlng.lat,
          lng: latlng.lng,
          googleMapsLink: googleMapsLink,
          city: '',
          state: '',
          pincode: ''
        });
        toast.success('📍 Location pinned! Review the details below.');
      } else {
        throw new Error('No address found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback to coordinates
      const googleMapsLink = `https://www.google.com/maps?q=${latlng.lat},${latlng.lng}`;
      setTempLocation({
        address: `Lat: ${latlng.lat.toFixed(6)}, Lng: ${latlng.lng.toFixed(6)}`,
        lat: latlng.lat,
        lng: latlng.lng,
        googleMapsLink: googleMapsLink,
        city: '',
        state: '',
        pincode: ''
      });
      toast.warning('Location pinned with coordinates. Address detection failed.');
    }
  };

  const handleConfirm = () => {
    if (!tempLocation) {
      toast.error('Please select a location on the map by clicking');
      return;
    }

    onConfirm(tempLocation);
    handleClose();
  };

  const handleClose = () => {
    setTempLocation(null);
    setMapLoaded(false);
    if (markerRef.current && mapInstanceRef.current) {
      try {
        mapInstanceRef.current.removeLayer(markerRef.current);
      } catch (e) {
        console.log('Marker already removed');
      }
      markerRef.current = null;
    }
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        console.log('Map already removed');
      }
      mapInstanceRef.current = null;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-4 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">📍 Pin Your Business Location</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <p className="text-sm text-blue-800 font-medium mb-2">
            <FaMapMarkerAlt className="inline mr-2" />
            How to pin your business location:
          </p>
          <ol className="text-sm text-blue-700 ml-6 list-decimal space-y-1">
            <li><strong>Click "Use Current Location"</strong> button to pin your current location, OR</li>
            <li><strong>Click anywhere on the map</strong> to manually drop a pin at your business location</li>
            <li>The address will be automatically detected and displayed below</li>
            <li>Google Maps link will be generated automatically</li>
            <li>Review all details and click "Confirm Location" when ready</li>
          </ol>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-gray-200 min-h-[400px]">
          <div 
            ref={mapRef} 
            id="business-location-map" 
            className="w-full h-[400px] relative"
            style={{ minHeight: '400px', background: '#e5e7eb' }}
          ></div>
          
          {/* Current Location Button - Floating on map */}
          {mapLoaded && !isLoading && (
            <button
              onClick={useCurrentLocation}
              className="absolute top-4 right-4 z-[1000] bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg shadow-lg border border-gray-300 flex items-center gap-2 font-medium transition-all hover:shadow-xl"
              title="Pin my current location"
            >
              <FaMapMarkerAlt className="text-green-500" />
              <span>Use Current Location</span>
            </button>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-[1000]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading interactive map...</p>
                <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
              </div>
            </div>
          )}
        </div>

        {/* Selected Location Display */}
        {tempLocation && (
          <div className="p-4 bg-green-50 border-t border-green-200">
            <p className="text-sm font-medium text-green-900 mb-2 flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span>Selected Business Location:</span>
            </p>
            <div className="bg-white rounded-lg p-3 border border-green-200 space-y-2">
              <div>
                <p className="text-xs text-gray-500">Address:</p>
                <p className="text-sm text-gray-800 font-medium">{tempLocation.address}</p>
              </div>
              {tempLocation.city && (
                <div>
                  <p className="text-xs text-gray-500">City:</p>
                  <p className="text-sm text-gray-800">{tempLocation.city}</p>
                </div>
              )}
              {tempLocation.state && (
                <div>
                  <p className="text-xs text-gray-500">State:</p>
                  <p className="text-sm text-gray-800">{tempLocation.state}</p>
                </div>
              )}
              {tempLocation.pincode && (
                <div>
                  <p className="text-xs text-gray-500">Pincode:</p>
                  <p className="text-sm text-gray-800">{tempLocation.pincode}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Google Maps Link:</p>
                <p className="text-xs text-blue-600 font-mono break-all">{tempLocation.googleMapsLink}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">GPS Coordinates:</p>
                <p className="text-xs text-gray-600 font-mono">
                  📌 {tempLocation.lat.toFixed(6)}, {tempLocation.lng.toFixed(6)}
                </p>
              </div>
            </div>
            <p className="text-xs text-green-700 mt-2 italic">
              ✓ Review the details above. You can click elsewhere on the map to change the location.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!tempLocation}
            className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            ✓ Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessLocationPicker;
