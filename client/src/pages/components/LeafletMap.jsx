import React, { useEffect, useRef, useState } from 'react';
import { FaMapMarkerAlt, FaExpand, FaCompress } from 'react-icons/fa';

const LeafletMap = ({ 
  center = { lat: 13.0827, lng: 80.2707 }, // Default to Chennai
  zoom = 13,
  businesses = [],
  onBusinessClick,
  height = '400px',
  showControls = true
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

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

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      // Initialize map
      const map = window.L.map(mapRef.current).setView([center.lat, center.lng], zoom);

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Add user location marker
      const userIcon = window.L.divIcon({
        html: '<div style="background: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: 'user-location-marker'
      });

      window.L.marker([center.lat, center.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('Your Location')
        .openPopup();

      mapInstanceRef.current = map;
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapLoaded, center.lat, center.lng, zoom]);

  // Update business markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add business markers
    businesses.forEach((business) => {
      if (!business.location?.coordinates) return;

      const [lng, lat] = business.location.coordinates;
      
      // Create custom icon based on business type
      const getBusinessIcon = (type) => {
        const colors = {
          hotel: '#ef4444',
          restaurant: '#f97316', 
          cab: '#eab308',
          cafe: '#8b5cf6',
          shopping: '#ec4899'
        };
        
        const color = colors[type?.toLowerCase()] || '#6b7280';
        
        return window.L.divIcon({
          html: `<div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                   <div style="color: white; font-size: 10px; font-weight: bold;">${type?.charAt(0).toUpperCase() || 'B'}</div>
                 </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          className: 'business-marker'
        });
      };

      const marker = window.L.marker([lat, lng], { 
        icon: getBusinessIcon(business.business_type) 
      }).addTo(mapInstanceRef.current);

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${business.name || business.organization_name}</h3>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${business.description || ''}</p>
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
            <span style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: capitalize;">
              ${business.business_type || 'Business'}
            </span>
            ${business.rating ? `<span style="color: #f59e0b;">★ ${business.rating.toFixed(1)}</span>` : ''}
          </div>
          <button onclick="window.selectBusiness('${business._id}')" 
                  style="background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer;">
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      
      // Add click handler
      marker.on('click', () => {
        if (onBusinessClick) {
          onBusinessClick(business);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers if there are businesses
    if (businesses.length > 0 && markersRef.current.length > 0) {
      const group = new window.L.featureGroup([
        ...markersRef.current,
        window.L.marker([center.lat, center.lng]) // Include user location
      ]);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [businesses, onBusinessClick, center]);

  // Global function for popup buttons
  useEffect(() => {
    window.selectBusiness = (businessId) => {
      const business = businesses.find(b => b._id === businessId);
      if (business && onBusinessClick) {
        onBusinessClick(business);
      }
    };

    return () => {
      delete window.selectBusiness;
    };
  }, [businesses, onBusinessClick]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    // Invalidate map size after fullscreen toggle
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);
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
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div 
        ref={mapRef} 
        className="w-full rounded-lg"
        style={{ 
          height: isFullscreen ? '100vh' : height,
          zIndex: isFullscreen ? 1000 : 'auto'
        }}
      />
      
      {showControls && (
        <div className="absolute top-2 right-2 z-[1001] flex flex-col gap-2">
          <button
            onClick={toggleFullscreen}
            className="bg-white hover:bg-gray-50 p-2 rounded-lg shadow-md border"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-white p-2 rounded-lg shadow-md text-xs z-[1001]">
        <div className="flex items-center gap-1 mb-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Your Location</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { type: 'hotel', color: '#ef4444', label: 'Hotels' },
            { type: 'restaurant', color: '#f97316', label: 'Restaurants' },
            { type: 'cab', color: '#eab308', label: 'Cabs' },
            { type: 'cafe', color: '#8b5cf6', label: 'Cafes' },
            { type: 'shopping', color: '#ec4899', label: 'Shopping' }
          ].map(({ type, color, label }) => (
            <div key={type} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: color }}
              ></div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;
