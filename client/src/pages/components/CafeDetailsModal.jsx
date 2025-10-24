import React, { useState, useEffect } from 'react';
import { FaTimes, FaUsers, FaSnowflake, FaUtensils, FaStar, FaMapMarkerAlt, FaPhone, FaWifi, FaPlug, FaTable } from 'react-icons/fa';
import { Image } from '../../components/Image';
import TableBooking from './TableBooking';
import axios from 'axios';
import { toast } from 'react-toastify';

const CafeDetailsModal = ({ cafe, isOpen, onClose, onBookingSuccess }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    if (isOpen && cafe) {
      if (activeTab === 'menu') {
        fetchMenuItems();
      } else if (activeTab === 'overview') {
        fetchTables();
      }
    }
  }, [isOpen, cafe, activeTab]);

  const fetchMenuItems = async () => {
    try {
      const businessToken = localStorage.getItem('businessToken');
      if (!businessToken) {
        setMenuItems(cafe.menu?.items || []);
        return;
      }

      setLoadingMenu(true);
      const response = await axios.get(`/api/business/menu-items/${cafe._id}`, {
        headers: {
          Authorization: `Bearer ${businessToken}`
        },
        withCredentials: true
      });
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

  const fetchTables = async () => {
    try {
      const businessToken = localStorage.getItem('businessToken');
      if (!businessToken) {
        setTables(cafe.tables || []);
        return;
      }

      setLoadingTables(true);
      const response = await axios.get(`/api/business/tables/${cafe._id}`, {
        headers: {
          Authorization: `Bearer ${businessToken}`
        },
        withCredentials: true
      });
      if (response.data.success) {
        setTables(response.data.tables || []);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      // Fallback to cafe.tables if API fails
      setTables(cafe.tables || []);
    } finally {
      setLoadingTables(false);
    }
  };

  const handleBookTable = (table) => {
    setSelectedTable(table);
    setShowBooking(true);
  };

  const handleBookingSuccess = (booking) => {
    setShowBooking(false);
    setSelectedTable(null);
    onBookingSuccess && onBookingSuccess(booking);
  };

  if (!isOpen || !cafe) return null;

  const getTableTypeIcon = (tableType) => {
    switch (tableType) {
      case 'work-friendly':
        return <FaPlug className="text-blue-500" />;
      case 'cozy':
        return <FaUtensils className="text-orange-500" />;
      case 'couple':
        return <FaUsers className="text-pink-500" />;
      default:
        return <FaTable className="text-gray-500" />;
    }
  };

  const getTableTypeColor = (tableType) => {
    switch (tableType) {
      case 'work-friendly':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cozy':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'couple':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative flex-shrink-0">
          <Image
            src={
              cafe.profileImage || 
              cafe.mainImage || 
              (cafe.businessImages && cafe.businessImages.length > 0 && cafe.businessImages[0]) ||
              (cafe.images && cafe.images.length > 0 && cafe.images[0]) || 
              null
            }
            alt={cafe.businessName || cafe.name}
            className="w-full h-64 object-cover"
            placeholder="https://placehold.co/800x300/e2e8f0/64748b?text=Cafe+Image"
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
              <span className="font-semibold text-gray-800">{(cafe.rating || 0).toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Cafe Info */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{cafe.businessName || cafe.name}</h2>
            <div className="flex items-center text-gray-600 mb-2">
              <FaMapMarkerAlt className="mr-2" />
              <span>{cafe.address}, {cafe.city}, {cafe.state}</span>
            </div>
            <div className="flex items-center text-gray-600 mb-4">
              <FaPhone className="mr-2" />
              <span>{cafe.phone || cafe.contactInfo?.phone || 'N/A'}</span>
            </div>
            {cafe.description && (
              <p className="text-gray-700 mb-4">{cafe.description}</p>
            )}
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-full px-3 py-1">
              <FaWifi className="mr-1" />
              WiFi Available
            </div>
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-full px-3 py-1">
              <FaPlug className="mr-1" />
              Power Outlets
            </div>
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-full px-3 py-1">
              <FaTable className="mr-1" />
              {tables.length} Tables
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
              Tables & Booking
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'menu'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Menu
            </button>
          </div>

          {/* Tab Content */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Tables</h3>
                {loadingTables ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading tables...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tables.map((table, index) => (
                      <div key={table._id || index} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getTableTypeColor(table.tableType)}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {getTableTypeIcon(table.tableType)}
                              <h4 className="font-semibold text-gray-900 capitalize">
                                {table.tableNumber ? `Table ${table.tableNumber}` : `${table.tableType} Table`}
                              </h4>
                            </div>
                            <p className="text-sm text-gray-600 capitalize">{table.tableType}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              ₹{table.pricing?.perPerson || 0}
                            </div>
                            <div className="text-xs text-gray-500">per person</div>
                            {table.pricing?.tableCharge > 0 && (
                              <div className="text-sm text-gray-600">
                                +₹{table.pricing.tableCharge} table charge
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <FaUsers className="mr-1" />
                            <span>{table.capacity} seats</span>
                          </div>
                          {table.isAC && (
                            <div className="flex items-center">
                              <FaSnowflake className="mr-1" />
                              <span>AC</span>
                            </div>
                          )}
                          {table.location && (
                            <div className="flex items-center">
                              <span className="capitalize">{table.location}</span>
                            </div>
                          )}
                        </div>

                        {table.amenities && table.amenities.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {table.amenities.slice(0, 3).map((amenity, idx) => (
                                <span key={idx} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                                  {amenity}
                                </span>
                              ))}
                              {table.amenities.length > 3 && (
                                <span className="text-xs text-gray-500">+{table.amenities.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleBookTable(table)}
                          disabled={table.availability === false}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                            table.availability === false
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-orange-500 hover:bg-orange-600 text-white'
                          }`}
                        >
                          {table.availability === false ? 'Not Available' : 'Book This Table'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {tables.length === 0 && !loadingTables && (
                  <div className="text-center py-8 text-gray-500">
                    <FaTable className="mx-auto text-4xl mb-2" />
                    <p>No tables available at the moment</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'menu' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Cafe Menu</h3>
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

      {/* Table Booking Modal */}
      {showBooking && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Book {selectedTable.tableType} Table</h2>
                <button
                  onClick={() => {
                    setShowBooking(false);
                    setSelectedTable(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <TableBooking 
                cafe={cafe} 
                selectedTable={selectedTable}
                onBookingSuccess={handleBookingSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeDetailsModal;
