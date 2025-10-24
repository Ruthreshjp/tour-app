import React, { useState, useEffect } from 'react';
import { FaTimes, FaBed, FaUsers, FaSnowflake, FaUtensils, FaStar, FaMapMarkerAlt, FaPhone, FaWifi, FaSwimmingPool } from 'react-icons/fa';
import { Image } from '../../components/Image';
import HotelBooking from './HotelBooking';
import axios from 'axios';
import { toast } from 'react-toastify';

const HotelDetailsModal = ({ hotel, isOpen, onClose, onBookingSuccess }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    if (isOpen && hotel && activeTab === 'menu') {
      fetchMenuItems();
    }
  }, [isOpen, hotel, activeTab]);

  const fetchMenuItems = async () => {
    try {
      setLoadingMenu(true);
      const response = await axios.get(`/api/business/menu-items/${hotel._id}`);
      if (response.data.success) {
        setMenuItems(response.data.menuItems || []);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoadingMenu(false);
    }
  };

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    setShowBooking(true);
  };

  const handleBookingSuccess = (booking) => {
    setShowBooking(false);
    setSelectedRoom(null);
    onBookingSuccess && onBookingSuccess(booking);
  };

  if (!isOpen || !hotel) return null;

  const rooms = hotel.rooms || hotel.pricing?.rooms || [];
  const hasMenu = hotel.businessType === 'hotel' && (hotel.menu || menuItems.length > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative flex-shrink-0">
          <Image
            src={
              hotel.profileImage || 
              hotel.mainImage || 
              (hotel.businessImages && hotel.businessImages.length > 0 && hotel.businessImages[0]) ||
              (hotel.images && hotel.images.length > 0 && hotel.images[0]) || 
              null
            }
            alt={hotel.businessName || hotel.name}
            className="w-full h-64 object-cover"
            placeholder="https://placehold.co/800x300/e2e8f0/64748b?text=Hotel+Image"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-2 hover:bg-opacity-100 transition-all"
          >
            <FaTimes className="text-gray-600" />
          </button>
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="flex items-center">
              <FaStar className="text-yellow-500 mr-1" />
              <span className="font-semibold text-gray-800">{(hotel.rating || 0).toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Hotel Info */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{hotel.businessName || hotel.name}</h2>
            <div className="flex items-center text-gray-600 mb-2">
              <FaMapMarkerAlt className="mr-2" />
              <span>{hotel.address}, {hotel.city}, {hotel.state}</span>
            </div>
            <div className="flex items-center text-gray-600 mb-4">
              <FaPhone className="mr-2" />
              <span>{hotel.phone || hotel.contactInfo?.phone || 'N/A'}</span>
            </div>
            {hotel.description && (
              <p className="text-gray-700 mb-4">{hotel.description}</p>
            )}
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-full px-3 py-1">
              <FaWifi className="mr-1" />
              WiFi
            </div>
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-full px-3 py-1">
              <FaSwimmingPool className="mr-1" />
              Pool
            </div>
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-full px-3 py-1">
              <FaBed className="mr-1" />
              {rooms.length} Rooms
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'overview'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Rooms & Booking
            </button>
            {hasMenu && (
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'menu'
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Restaurant Menu
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Rooms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rooms.map((room, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 capitalize">{room.roomType}</h4>
                          <p className="text-sm text-gray-600 capitalize">{room.bedType} bed</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            ₹{room.pricing?.nightRate || room.pricing?.dayRate || room.pricing?.night || room.pricing?.day || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">per night</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <FaUsers className="mr-1" />
                          <span>{room.maxOccupancy || 2} guests</span>
                        </div>
                        {room.isAC && (
                          <div className="flex items-center">
                            <FaSnowflake className="mr-1" />
                            <span>AC</span>
                          </div>
                        )}
                      </div>

                      {room.amenities && room.amenities.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.slice(0, 3).map((amenity, idx) => (
                              <span key={idx} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                                {amenity}
                              </span>
                            ))}
                            {room.amenities.length > 3 && (
                              <span className="text-xs text-gray-500">+{room.amenities.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => handleBookRoom(room)}
                        disabled={room.availability === false}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          room.availability === false
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                      >
                        {room.availability === false ? 'Not Available' : 'Book This Room'}
                      </button>
                    </div>
                  ))}
                </div>
                {rooms.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FaBed className="mx-auto text-4xl mb-2" />
                    <p>No rooms available at the moment</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'menu' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Restaurant Menu</h3>
                {loadingMenu ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading menu...</p>
                  </div>
                ) : menuItems.length > 0 ? (
                  <div className="space-y-4">
                    {menuItems.map((item) => (
                      <div key={item._id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{item.name}</h4>
                              <span className={`text-xs px-2 py-1 rounded ${
                                item.isVeg 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.isVeg ? 'VEG' : 'NON-VEG'}
                              </span>
                              {!item.isAvailable && (
                                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                                  Not Available
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 capitalize mb-1">{item.category}</p>
                            {item.description && (
                              <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                            )}
                            {item.ingredients && (
                              <p className="text-xs text-gray-500">
                                <strong>Ingredients:</strong> {item.ingredients}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold text-green-600">₹{item.price}</div>
                          </div>
                        </div>
                        {item.images && item.images.length > 0 && (
                          <div className="mt-3">
                            <Image
                              src={item.images[0]}
                              alt={item.name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaUtensils className="mx-auto text-4xl mb-2" />
                    <p>No menu items available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Book {selectedRoom.roomType} Room</h2>
                <button
                  onClick={() => {
                    setShowBooking(false);
                    setSelectedRoom(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <HotelBooking 
                hotel={hotel} 
                selectedRoom={selectedRoom}
                onBookingSuccess={handleBookingSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetailsModal;
