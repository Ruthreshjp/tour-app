// client/src/pages/components/BusinessList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaStar, FaDirections } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import BusinessMap from './BusinessMap';
import MapDirections from './MapDirections';
import { Image } from '../../components/Image';

const BusinessList = ({ 
  businessType,
  title,
  renderAdditionalInfo,
  searchPlaceholder = "Search businesses...",
  extraFilter,
  DetailsModal,
  BookingModal,
  onBookingSuccess,
  hideMaps = false,
  hideDirections = false
}) => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [searchMode, setSearchMode] = useState('all'); // 'all', 'nearby' or 'location'
  const [minRating, setMinRating] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  // Get global search query from TravelOwn parent
  const context = useOutletContext();
  const globalQuery = context?.searchQuery || '';

  const trackBusinessView = useCallback(async (business) => {
    if (!business?._id) return;

    const token = localStorage.getItem('userToken');
    try {
      const viewSource = (() => {
        if (searchMode === 'nearby') return 'nearby';
        if (searchMode === 'location' || (globalQuery && globalQuery.trim().length > 0)) return 'search';
        return 'category';
      })();

      await axios.post(
        `/api/analytics/business/${business._id}/view`,
        { source: viewSource },
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          withCredentials: true
        }
      );
    } catch (error) {
      console.error('Failed to track business view', error);
    }
  }, [globalQuery, searchMode]);
  const toggleBodyScroll = useCallback((shouldLock) => {
    if (typeof document === 'undefined') return;
    if (shouldLock) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }, []);

  useEffect(() => {
    toggleBodyScroll(showBooking);
    return () => toggleBodyScroll(false);
  }, [showBooking, toggleBodyScroll]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      let response;

      if (searchMode === 'location' && locationSearch.trim()) {
        // Search by location name
        response = await axios.get('/api/location/search', {
          params: { 
            location: locationSearch.trim(), 
            type: businessType, 
            status: 'approved' 
          }
        });
      } else if (globalQuery && globalQuery.trim().length > 0) {
        // Use global search query from TravelOwn
        try {
          // Try to geocode the global query first
          const geo = await axios.get('/api/location/geocode', { params: { address: globalQuery } });
          if (geo.data?.success) {
            const { latitude, longitude } = geo.data;
            setCurrentLocation({ lat: latitude, lng: longitude });
            response = await axios.get('/api/location/nearby', {
              params: {
                lat: latitude,
                lng: longitude,
                type: businessType,
                radius: 10000,
                status: 'approved'
              }
            });
          } else {
            // Fallback to location name search
            response = await axios.get('/api/location/search', {
              params: { 
                location: globalQuery.trim(), 
                type: businessType, 
                status: 'approved' 
              }
            });
          }
        } catch (geoError) {
          // If geocoding fails, try location name search
          response = await axios.get('/api/location/search', {
            params: { 
              location: globalQuery.trim(), 
              type: businessType, 
              status: 'approved' 
            }
          });
        }
      } else if (searchMode === 'nearby') {
        // Nearby search using current location
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });

        response = await axios.get('/api/location/nearby', {
          params: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            type: businessType,
            radius: 10000,
            status: 'approved'
          }
        });
      } else {
        // Default: Get all businesses without location filter
        response = await axios.get('/api/location/search', {
          params: { 
            type: businessType, 
            status: 'approved' 
          }
        });
      }

      if (response.data.success) {
        setBusinesses(response.data.businesses.filter(business => business.status === 'approved'));
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
        setError(error.message);
        toast.error(`Failed to load ${businessType}s`);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchBusinesses();
  }, [businessType, searchMode, locationSearch, globalQuery]);

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = (business.businessName || business.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (business.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = !minRating || business.rating >= parseFloat(minRating);
    const matchesExtra = typeof extraFilter === 'function' ? !!extraFilter(business) : true;
    return matchesSearch && matchesRating && matchesExtra;
  });

  if (loading) {
    return <div>Loading {businessType}s...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Search Mode Toggle */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Search by:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSearchMode('all')}
                className={`px-3 py-1 rounded text-sm ${
                  searchMode === 'all' ? 'bg-orange-500 text-white' : 'text-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSearchMode('nearby')}
                className={`px-3 py-1 rounded text-sm ${
                  searchMode === 'nearby' ? 'bg-orange-500 text-white' : 'text-gray-600'
                }`}
              >
                Nearby
              </button>
              <button
                onClick={() => setSearchMode('location')}
                className={`px-3 py-1 rounded text-sm ${
                  searchMode === 'location' ? 'bg-orange-500 text-white' : 'text-gray-600'
                }`}
              >
                Location
              </button>
            </div>
          </div>
          
          {searchMode === 'location' && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter city, area, or location..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-64"
              />
              <button
                onClick={fetchBusinesses}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Search
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex gap-2 flex-wrap">
          <select 
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          >
            <option value="">Filter by Rating</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
          </select>
          {!hideMaps && (
            <button
              onClick={() => setShowMap(!showMap)}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          )}
        </div>
      </div>

      {!hideMaps && showMap && (
        <div className="mb-6">
          <BusinessMap
            businessType={businessType}
            center={currentLocation}
            radius={5000}
          />
        </div>
      )}

      {!hideDirections && selectedBusiness && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Directions to {selectedBusiness.businessName || selectedBusiness.name}</h3>
          <MapDirections
            destination={selectedBusiness.address || selectedBusiness.location?.address}
            currentLocation={currentLocation}
          />
        </div>
      )}

      {/* Business List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBusinesses.map((business) => (
          <div key={business._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <Image
              src={
                business.profileImage || 
                business.mainImage || 
                (business.businessImages && business.businessImages.length > 0 && business.businessImages[0]) ||
                (business.images && business.images.length > 0 && business.images[0]) || 
                (business.additionalImages && business.additionalImages.length > 0 && business.additionalImages[0]) ||
                null
              }
              alt={business.businessName || business.name || 'Business'}
              className="w-full h-48 object-cover"
              placeholder="https://placehold.co/600x400/e2e8f0/64748b?text=Business+Image"
            />
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold">{business.businessName || business.name}</h3>
                <div className="flex items-center">
                  <FaStar className="text-yellow-400" />
                  <span className="ml-1">{(business.rating || 0).toFixed(1)}</span>
                </div>
              </div>
              <p className="mt-2 text-gray-600">{business.description}</p>
              <div className="mt-2 space-y-2">
                {!hideDirections && (
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2" />
                    <button
                      onClick={() => {
                        if (business.googleMapsLink) {
                          window.open(business.googleMapsLink, '_blank');
                        } else {
                          setSelectedBusiness(business);
                        }
                      }}
                      className="hover:text-orange-500"
                    >
                      {business.googleMapsLink ? 'Open in Google Maps' : 'Get Directions'}
                    </button>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <FaPhone className="mr-2" />
                  <a href={`tel:${business.phone || business.contactInfo?.phone}`}>{business.phone || business.contactInfo?.phone}</a>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{business.address}, {business.city}, {business.state}</span>
                </div>
                
                {/* Render additional business-specific information */}
                {renderAdditionalInfo && renderAdditionalInfo(business)}

                <div className={`mt-4 grid gap-2 ${hideDirections ? (BookingModal ? 'grid-cols-2' : 'grid-cols-1') : (BookingModal ? 'grid-cols-3' : 'grid-cols-2')}`}>
                  {DetailsModal && (
                    <button
                      onClick={() => {
                        setSelectedBusiness(business);
                        setShowDetails(true);
                        trackBusinessView(business);
                      }}
                      className="px-2 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium flex items-center justify-center"
                    >
                      View Details
                    </button>
                  )}
                  {BookingModal && (
                    <button
                      onClick={() => {
                        setSelectedBusiness(business);
                        setShowBooking(true);
                      }}
                      className="px-2 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm font-medium flex items-center justify-center"
                    >
                      Book Now
                    </button>
                  )}
                  {!hideDirections && (
                    <button
                      onClick={() => {
                        if (business.googleMapsLink) {
                          window.open(business.googleMapsLink, '_blank');
                        } else {
                          const coords = business.location?.coordinates;
                          if (coords && coords.length === 2) {
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`,
                              '_blank'
                            );
                          } else {
                            window.open(
                              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address + ', ' + business.city)}`,
                              '_blank'
                            );
                          }
                        }
                      }}
                      className="px-2 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium flex items-center justify-center"
                    >
                      Directions
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredBusinesses.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No {businessType}s found matching your criteria
          </div>
        )}
      </div>

      {/* Custom Details Modal */}
      {showDetails && selectedBusiness && DetailsModal && (
        <DetailsModal
          cafe={selectedBusiness}
          hotel={selectedBusiness}
          business={selectedBusiness}
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedBusiness(null);
          }}
          onBookingSuccess={onBookingSuccess}
        />
      )}

      {/* Custom Booking Modal */}
      {showBooking && selectedBusiness && BookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Book {selectedBusiness.businessName || selectedBusiness.name}</h2>
                <button
                  onClick={() => {
                    setShowBooking(false);
                    setSelectedBusiness(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <BookingModal 
                cafe={selectedBusiness}
                restaurant={selectedBusiness}
                business={selectedBusiness}
                onBookingSuccess={(booking) => {
                  setShowBooking(false);
                  setSelectedBusiness(null);
                  onBookingSuccess && onBookingSuccess(booking);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessList;4