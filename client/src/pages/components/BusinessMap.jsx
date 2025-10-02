// client/src/pages/components/BusinessMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { getLatLng } from '../../utils/geoCode';

// Custom pin icon
const pinIcon = new L.Icon({
  iconUrl: '/pin-orange.png',
  iconRetinaUrl: '/pin-orange@2x.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28],
  shadowUrl: '/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [13, 41]
});

const BusinessMap = ({ businessType = 'all', center, radius = 5000 }) => {
  const [businesses, setBusinesses] = useState([]);
  const [map, setMap] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        let coords;

        if (center) {
          // Use provided center coordinates or address
          if (typeof center === 'string') {
            coords = await getLatLng(center);
          } else {
            coords = center;
          }
        } else {
          // Use current location
          coords = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (position) => resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }),
              (err) => reject(new Error('Could not get current location'))
            );
          });
        }

        setLocation(coords);

        // Fetch nearby businesses
        const response = await axios.get(`/api/location/nearby`, {
          params: {
            lat: coords.lat,
            lng: coords.lng,
            type: businessType,
            radius
          }
        });

        if (response.data.success) {
          setBusinesses(response.data.businesses);
        } else {
          throw new Error(response.data.message || 'Error fetching businesses');
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [center, businessType, radius]);

  useEffect(() => {
    if (map && businesses.length > 0 && location) {
      // Create bounds to fit all markers
      const bounds = L.latLngBounds([
        [location.lat, location.lng],
        ...businesses.map(b => [b.location.coordinates[1], b.location.coordinates[0]])
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, businesses, location]);

  if (loading) {
    return <div>Loading map...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="w-full h-96 mt-4">
      <MapContainer
        center={location ? [location.lat, location.lng] : [20.5937, 78.9629]} // Default to center of India
        zoom={13}
        className="w-full h-full z-0"
        whenCreated={setMap}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Current location marker */}
        {location && (
          <Marker position={[location.lat, location.lng]} key="current" icon={pinIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Business markers */}
        {businesses.map(business => (
          <Marker
            key={business._id}
            position={[
              business.location.coordinates[1],
              business.location.coordinates[0]
            ]}
            icon={pinIcon}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-semibold">{business.name}</h3>
                <p>{business.description}</p>
                <p className="mt-2">
                  <button
                    onClick={() => window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${business.location.coordinates[1]},${business.location.coordinates[0]}`,
                      '_blank'
                    )}
                    className="text-blue-500 hover:underline"
                  >
                    Get Directions
                  </button>
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BusinessMap;