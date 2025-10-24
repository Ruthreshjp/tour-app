import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaStar, FaDirections, FaBed, FaWifi, FaSwimmingPool, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import BusinessMap from '../components/BusinessMap';
import MapDirections from '../components/MapDirections';
import HotelBooking from '../components/HotelBooking';
import HotelDetailsModal from '../components/HotelDetailsModal';
import BusinessRating from '../components/BusinessRating';
import BusinessViewTracker from '../components/BusinessViewTracker';
import { Image } from '../../components/Image';

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [searchMode, setSearchMode] = useState('all'); // 'all', 'nearby' or 'location'
  const [minRating, setMinRating] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [bedType, setBedType] = useState('');
  const [onlyAC, setOnlyAC] = useState(false);
  const [pricingMode, setPricingMode] = useState(''); // '', 'day', 'night', 'dayAndNight'
  const [numDays, setNumDays] = useState(1);

  const { searchQuery: globalQuery } = useOutletContext() || { searchQuery: '' };
  const fetchHotels = async () => {
    try {
      setLoading(true);
      let response;

      // Always try to get all hotels first, then apply filters
      try {
        if (searchMode === 'location' && locationSearch.trim()) {
          // Search by location name
          response = await axios.get('/api/location/search', {
            params: { 
              location: locationSearch.trim(), 
              type: 'hotel',
              status: 'approved'
            }
          });
        } else if (globalQuery && globalQuery.trim().length > 0) {
          // Use global query as location search
          response = await axios.get('/api/location/search', {
            params: { 
              location: globalQuery.trim(), 
              type: 'hotel',
              status: 'approved'
            }
          });
        } else if (searchMode === 'nearby') {
          // Try nearby search only when explicitly requested
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          
          response = await axios.get('/api/location/nearby', { 
            params: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              type: 'hotel',
              radius: 10000,
              status: 'approved'
            }
          });
        } else {
          // Default: Get all hotels without location filter
          response = await axios.get('/api/location/search', {
            params: { 
              type: 'hotel',
              status: 'approved'
            }
          });
        }
      } catch (apiError) {
        console.error('Primary API call failed, trying direct business API:', apiError);
        // Fallback: try to get all businesses directly
        response = await axios.get('/api/business/all', {
          params: { type: 'hotel' }
        });
      }

      if (response.data.success) {
        setHotels(response.data.businesses);
        setError(null);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setError(error.message);
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [globalQuery, searchMode, locationSearch]);

  const handleBookingSuccess = (booking) => {
    setShowBooking(false);
    toast.success('Booking submitted successfully!');
  };

  const handleRatingSubmit = (rating) => {
    setShowRating(false);
    toast.success('Rating submitted successfully!');
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = (hotel.businessName || hotel.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hotel.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = !minRating || hotel.rating >= parseFloat(minRating);
    
    // Enhanced room-level filtering using rooms field
    let matchesRooms = true;
    if ((bedType || onlyAC || pricingMode) && Array.isArray(hotel.rooms)) {
      // Use the rooms field from Business model
      matchesRooms = hotel.rooms.some((room) => {
        const bedOk = !bedType || room.bedType === bedType;
        const acOk = !onlyAC || room.isAC === true;
        const priceOk = !pricingMode || (room.pricing && typeof room.pricing[pricingMode] === 'number');
        return bedOk && acOk && priceOk;
      });
    } else if ((bedType || onlyAC || pricingMode) && hotel.pricing?.rooms) {
      // Fallback for old pricing structure
      matchesRooms = hotel.pricing.rooms.some((room) => {
        const bedOk = !bedType || room.bedType === bedType;
        const acOk = !onlyAC || room.isAC === true;
        const priceOk = !pricingMode || (room.pricing && typeof room.pricing[pricingMode] === 'number' && room.pricing[pricingMode] > 0);
        return bedOk && acOk && priceOk;
      });
    }
    return matchesSearch && matchesRating && matchesRooms;
  });

  if (loading) {
    return <div>Loading hotels...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Hotels</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search hotels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={fetchHotels}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Refresh Hotels
          </button>
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
                All Hotels
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
                onClick={fetchHotels}
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
          <select
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={bedType}
            onChange={(e) => setBedType(e.target.value)}
          >
            <option value="">Bed type</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
            <option value="quad">Four</option>
          </select>
          <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer">
            <input type="checkbox" checked={onlyAC} onChange={(e) => setOnlyAC(e.target.checked)} />
            <span>AC only</span>
          </label>
          <select
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={pricingMode}
            onChange={(e) => setPricingMode(e.target.value)}
          >
            <option value="">Pricing</option>
            <option value="day">Day</option>
            <option value="night">Night</option>
            <option value="dayAndNight">Day & Night</option>
          </select>
          {pricingMode === 'dayAndNight' && (
            <input
              type="number"
              min={1}
              value={numDays}
              onChange={(e) => setNumDays(Math.max(1, Number(e.target.value) || 1))}
              className="w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="# days"
            />
          )}
          <button
            onClick={() => setShowMap(!showMap)}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
      </div>

      {showMap && (
        <div className="mb-6">
          <BusinessMap
            businessType="hotel"
            center={currentLocation}
            radius={5000}
          />
        </div>
      )}

      {selectedHotel && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Directions to {selectedHotel.name}</h3>
          <MapDirections
            destination={selectedHotel.location}
            currentLocation={currentLocation}
          />
        </div>
      )}

      {/* Hotel List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((hotel) => (
          <div key={hotel._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
            <div className="relative">
              <Image
                src={
                  hotel.profileImage || 
                  hotel.mainImage || 
                  (hotel.businessImages && hotel.businessImages.length > 0 && hotel.businessImages[0]) ||
                  (hotel.images && hotel.images.length > 0 && hotel.images[0]) || 
                  (hotel.additionalImages && hotel.additionalImages.length > 0 && hotel.additionalImages[0]) ||
                  null
                }
                alt={hotel.businessName || hotel.name || 'Hotel'}
                className="w-full h-56 object-cover"
                placeholder="https://placehold.co/600x400/e2e8f0/64748b?text=Hotel+Image"
              />
              <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center shadow-sm">
                <FaStar className="text-yellow-500 text-sm mr-1" />
                <span className="text-sm font-semibold text-gray-800">{(hotel.rating || 0).toFixed(1)}</span>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-3">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{hotel.businessName || hotel.name}</h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <FaMapMarkerAlt className="mr-1" />
                  <span>{hotel.address}, {hotel.city}</span>
                </div>
              </div>
              
              {hotel.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hotel.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <FaPhone className="mr-1" />
                  <span>{hotel.phone || hotel.contactInfo?.phone || 'N/A'}</span>
                </div>
                {hotel.isVerified && (
                  <div className="flex items-center text-green-600">
                    <FaCheckCircle className="mr-1" />
                    <span className="text-xs">Verified</span>
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center text-xs text-gray-600 bg-gray-50 rounded-full px-3 py-1">
                  <FaWifi className="mr-1" />
                  WiFi
                </div>
                <div className="flex items-center text-xs text-gray-600 bg-gray-50 rounded-full px-3 py-1">
                  <FaSwimmingPool className="mr-1" />
                  Pool
                </div>
                <div className="flex items-center text-xs text-gray-600 bg-gray-50 rounded-full px-3 py-1">
                  <FaBed className="mr-1" />
                  {hotel.rooms?.length || hotel.pricing?.rooms?.length || 0} Rooms
                </div>
              </div>

              {/* Pricing Display */}
              {(hotel.rooms || hotel.pricing?.rooms) && (
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
                  <div className="text-sm text-gray-600 mb-1">Starting from</div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{Math.min(...(hotel.rooms || hotel.pricing?.rooms || []).map(r => 
                      r.pricing?.dayRate || r.pricing?.nightRate || r.pricing?.day || r.pricing?.night || 999
                    ).filter(p => p > 0)) || 999}
                    <span className="text-sm font-normal text-gray-500">/day</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setSelectedHotel(hotel);
                    setShowDetails(true);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center text-sm"
                >
                  <FaBed className="mr-1" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    setSelectedHotel(hotel);
                    setShowBooking(true);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center text-sm"
                >
                  <FaBed className="mr-1" />
                  Book Now
                </button>
                <button
                  onClick={() => {
                    if (hotel.location?.coordinates) {
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${hotel.location.coordinates[1]},${hotel.location.coordinates[0]}`,
                        '_blank'
                      );
                    } else {
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.address + ', ' + hotel.city)}`,
                        '_blank'
                      );
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-2 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm"
                >
                  <FaDirections className="mr-1" />
                  Directions
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredHotels.length === 0 && !loading && (
          <div className="col-span-full text-center py-8">
            <div className="text-4xl mb-4">🏨</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hotels found</h3>
            <p className="text-gray-500 mb-4">
              {hotels.length === 0 
                ? "No hotels are currently available. Please check back later or contact support."
                : "No hotels match your current search criteria. Try adjusting your filters."
              }
            </p>
            <button
              onClick={fetchHotels}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Refresh Hotels
            </button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Book {selectedHotel.name}</h2>
                <button
                  onClick={() => setShowBooking(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <HotelBooking 
                hotel={selectedHotel} 
                onBookingSuccess={handleBookingSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRating && selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Rate {selectedHotel.name}</h2>
                <button
                  onClick={() => setShowRating(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <BusinessRating 
                businessId={selectedHotel._id}
                businessType="hotel"
                onRatingSubmit={handleRatingSubmit}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hotel Details Modal */}
      {showDetails && selectedHotel && (
        <HotelDetailsModal
          hotel={selectedHotel}
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedHotel(null);
          }}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default Hotels;