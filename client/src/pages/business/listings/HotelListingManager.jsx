import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaPlus, FaEdit, FaTrash, FaBed, FaWifi, FaTv, FaSnowflake, FaEye, FaTable, FaTh } from 'react-icons/fa';
import { toast } from 'react-toastify';
import MongoImageUploadManager from '../../components/MongoImageUploadManager';
import { Image } from '../../../components/Image';

const HotelListingManager = () => {
  const { currentBusiness } = useSelector((state) => state.business);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomData, setRoomData] = useState({
    roomType: 'standard',
    bedType: 'single',
    isAC: true,
    maxOccupancy: 2,
    roomSize: '',
    amenities: [],
    images: [],
    pricing: {
      dayRate: 0,
      nightRate: 0,
      weekendRate: 0
    },
    availability: true,
    description: ''
  });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const roomTypes = ['standard', 'deluxe', 'suite', 'premium', 'executive'];
  const bedTypes = ['single', 'double', 'queen', 'king', 'twin'];
  const availableAmenities = [
    'WiFi', 'TV', 'AC', 'Heater', 'Mini Bar', 'Room Service', 
    'Balcony', 'City View', 'Sea View', 'Mountain View', 'Parking'
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const businessToken = localStorage.getItem('businessToken');
      const headers = {};
      
      if (businessToken) {
        headers.Authorization = `Bearer ${businessToken}`;
      }
      
      const response = await fetch(`/api/business/rooms/${currentBusiness._id}`, {
        headers,
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setRoomData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setRoomData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setRoomData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (images) => {
    setRoomData(prev => ({
      ...prev,
      images: images
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = editingRoom 
        ? `/api/business/rooms/${editingRoom._id}`
        : `/api/business/rooms`;
      
      const method = editingRoom ? 'PUT' : 'POST';
      
      const businessToken = localStorage.getItem('businessToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (businessToken) {
        headers.Authorization = `Bearer ${businessToken}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: JSON.stringify(roomData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingRoom ? 'Room updated successfully' : 'Room added successfully');
        fetchRooms();
        resetForm();
        setShowAddModal(false);
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error('Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setRoomData(room);
    setShowAddModal(true);
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/business/rooms/${roomId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Room deleted successfully');
        fetchRooms();
      } else {
        toast.error(data.message || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (roomId, currentAvailability) => {
    try {
      const response = await fetch(`/api/business/rooms/${roomId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ availability: !currentAvailability })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`Room ${!currentAvailability ? 'enabled' : 'disabled'} successfully`);
        fetchRooms();
      } else {
        toast.error(data.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const resetForm = () => {
    setRoomData({
      roomType: 'standard',
      bedType: 'single',
      isAC: true,
      maxOccupancy: 2,
      roomSize: '',
      amenities: [],
      images: [],
      pricing: {
        dayRate: 0,
        nightRate: 0,
        weekendRate: 0
      },
      availability: true,
      description: ''
    });
    setEditingRoom(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Room Management</h2>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'table' ? 'bg-white shadow' : ''}`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
            >
              Grid View
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Room
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amenities
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((room) => (
                <tr key={room._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {room.images && room.images.length > 0 && (
                        <Image
                          src={room.images[0]}
                          alt={room.roomType}
                          className="h-16 w-16 rounded-lg object-cover mr-4"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {room.roomType} Room
                        </div>
                        <div className="text-sm text-gray-500">
                          {room.bedType} bed • {room.maxOccupancy} guests • {room.isAC ? 'AC' : 'Non-AC'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>Day: ₹{room.pricing.dayRate}</div>
                    <div>Night: ₹{room.pricing.nightRate}</div>
                    {room.pricing.weekendRate > 0 && (
                      <div>Weekend: ₹{room.pricing.weekendRate}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {room.amenities?.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities?.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{room.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={room.availability}
                        onChange={() => toggleAvailability(room._id, room.availability)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className={`ml-2 text-sm ${room.availability ? 'text-green-600' : 'text-red-600'}`}>
                        {room.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(room)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(room._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rooms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No rooms added yet. Click "Add Room" to get started.
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {room.images && room.images.length > 0 && (
              <Image
                src={room.images[0]}
                alt={room.roomType}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold capitalize">
                  {room.roomType} Room
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(room)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(room._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Bed:</strong> {room.bedType}</p>
                <p><strong>Occupancy:</strong> {room.maxOccupancy} guests</p>
                <p><strong>AC:</strong> {room.isAC ? 'Yes' : 'No'}</p>
                <p><strong>Day Rate:</strong> ₹{room.pricing.dayRate}</p>
                <p><strong>Night Rate:</strong> ₹{room.pricing.nightRate}</p>
              </div>

              {room.amenities && room.amenities.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Amenities:</p>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="bg-gray-100 text-xs px-2 py-1 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{room.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-3 flex justify-between items-center">
                <span className={`px-2 py-1 rounded text-xs ${
                  room.availability 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {room.availability ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type
                  </label>
                  <select
                    value={roomData.roomType}
                    onChange={(e) => handleInputChange('roomType', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {roomTypes.map(type => (
                      <option key={type} value={type} className="capitalize">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bed Type
                  </label>
                  <select
                    value={roomData.bedType}
                    onChange={(e) => handleInputChange('bedType', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {bedTypes.map(type => (
                      <option key={type} value={type} className="capitalize">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Occupancy
                  </label>
                  <input
                    type="number"
                    value={roomData.maxOccupancy}
                    onChange={(e) => handleInputChange('maxOccupancy', parseInt(e.target.value) || 1)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Size (sq ft)
                  </label>
                  <input
                    type="text"
                    value={roomData.roomSize}
                    onChange={(e) => handleInputChange('roomSize', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., 300 sq ft"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={roomData.isAC}
                    onChange={(e) => handleInputChange('isAC', e.target.checked)}
                    className="mr-2"
                  />
                  Air Conditioned
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Day Rate (₹)</label>
                    <input
                      type="number"
                      value={roomData.pricing.dayRate}
                      onChange={(e) => handleInputChange('pricing.dayRate', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Night Rate (₹)</label>
                    <input
                      type="number"
                      value={roomData.pricing.nightRate}
                      onChange={(e) => handleInputChange('pricing.nightRate', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Weekend Rate (₹)</label>
                    <input
                      type="number"
                      value={roomData.pricing.weekendRate}
                      onChange={(e) => handleInputChange('pricing.weekendRate', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableAmenities.map((amenity) => (
                    <label key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={roomData.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="mr-2"
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Images
                </label>
                <MongoImageUploadManager
                  maxImages={5}
                  onImagesChange={handleImageUpload}
                  existingImages={roomData.images}
                  category="room"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={roomData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows="3"
                  placeholder="Describe the room features..."
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={roomData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.checked)}
                    className="mr-2"
                  />
                  Available for booking
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingRoom ? 'Update Room' : 'Add Room')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelListingManager;
