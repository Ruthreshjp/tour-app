import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaPlus, FaEdit, FaTrash, FaTable, FaUtensils, FaEye, FaTh, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import MongoImageUploadManager from '../../components/MongoImageUploadManager';
import { Image } from '../../../components/Image';

const RestaurantListingManager = () => {
  const { currentBusiness } = useSelector((state) => state.business);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [activeTab, setActiveTab] = useState('tables');

  const [tableData, setTableData] = useState({
    tableNumber: '',
    tableType: 'regular',
    capacity: 2,
    isAC: true,
    location: 'indoor',
    pricing: {
      perPerson: 0,
      tableCharge: 0
    },
    availability: true,
    description: ''
  });

  const [menuItemData, setMenuItemData] = useState({
    itemNumber: '',
    name: '',
    category: 'appetizer',
    price: 0,
    description: '',
    isVeg: true,
    isAvailable: true,
    ingredients: '',
    allergens: '',
    images: []
  });

  const tableTypes = ['regular', 'premium', 'VIP', 'family', 'couple'];
  const locations = ['indoor', 'outdoor', 'terrace', 'garden', 'rooftop'];
  const menuCategories = [
    'appetizer', 'main-course', 'dessert', 'beverages', 'breakfast', 
    'lunch', 'dinner', 'snacks', 'special'
  ];

  useEffect(() => {
    fetchTables();
    fetchMenuItems();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/business/tables/${currentBusiness._id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setTables(data.tables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`/api/business/menu-items/${currentBusiness._id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.menuItems);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to fetch menu items');
    }
  };

  const handleTableInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setTableData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setTableData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleMenuInputChange = (field, value) => {
    setMenuItemData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMenuImageUpload = (images) => {
    setMenuItemData(prev => ({
      ...prev,
      images: images
    }));
  };

  const handleTableSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = editingTable 
        ? `/api/business/tables/${editingTable._id}`
        : `/api/business/tables`;
      
      const method = editingTable ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...tableData,
          businessId: currentBusiness._id
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingTable ? 'Table updated successfully' : 'Table added successfully');
        fetchTables();
        resetTableForm();
        setShowTableModal(false);
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving table:', error);
      toast.error('Failed to save table');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = editingMenuItem 
        ? `/api/business/menu-items/${editingMenuItem._id}`
        : `/api/business/menu-items`;
      
      const method = editingMenuItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...menuItemData,
          businessId: currentBusiness._id
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingMenuItem ? 'Menu item updated successfully' : 'Menu item added successfully');
        fetchMenuItems();
        resetMenuForm();
        setShowMenuModal(false);
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setTableData(table);
    setShowTableModal(true);
  };

  const handleEditMenuItem = (item) => {
    setEditingMenuItem(item);
    setMenuItemData(item);
    setShowMenuModal(true);
  };

  const handleDeleteTable = async (tableId) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/business/tables/${tableId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Table deleted successfully');
        fetchTables();
      } else {
        toast.error(data.message || 'Failed to delete table');
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      toast.error('Failed to delete table');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/business/menu-items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Menu item deleted successfully');
        fetchMenuItems();
      } else {
        toast.error(data.message || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  const resetTableForm = () => {
    setTableData({
      tableNumber: '',
      tableType: 'regular',
      capacity: 2,
      isAC: true,
      location: 'indoor',
      pricing: {
        perPerson: 0,
        tableCharge: 0
      },
      availability: true,
      description: ''
    });
    setEditingTable(null);
  };

  const resetMenuForm = () => {
    setMenuItemData({
      itemNumber: '',
      name: '',
      category: 'appetizer',
      price: 0,
      description: '',
      isVeg: true,
      isAvailable: true,
      ingredients: '',
      allergens: '',
      images: []
    });
    setEditingMenuItem(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Restaurant Management</h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('tables')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'tables'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tables Management
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'menu'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Menu Management
        </button>
      </div>

      {/* Tables Tab */}
      {activeTab === 'tables' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Tables</h3>
            <button
              onClick={() => setShowTableModal(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Table
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <div key={table._id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold">Table {table.tableNumber}</h4>
                    <p className="text-sm text-gray-600 capitalize">{table.tableType}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditTable(table)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteTable(table._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p><FaUsers className="inline mr-2" />{table.capacity} people</p>
                  <p><strong>Location:</strong> {table.location}</p>
                  <p><strong>AC:</strong> {table.isAC ? 'Yes' : 'No'}</p>
                  <p><strong>Per Person:</strong> ₹{table.pricing.perPerson}</p>
                  <p><strong>Table Charge:</strong> ₹{table.pricing.tableCharge}</p>
                </div>

                <div className="mt-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    table.availability 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {table.availability ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Menu Items</h3>
            <button
              onClick={() => setShowMenuModal(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Menu Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {item.images && item.images.length > 0 && (
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-semibold">{item.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditMenuItem(item)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Price:</strong> ₹{item.price}</p>
                    <p><strong>Type:</strong> {item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</p>
                    {item.description && (
                      <p className="text-xs">{item.description.substring(0, 100)}...</p>
                    )}
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.isVeg 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isVeg ? 'VEG' : 'NON-VEG'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.isAvailable 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h3>
              <button
                onClick={() => {
                  setShowTableModal(false);
                  resetTableForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTableSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Table Number
                  </label>
                  <input
                    type="text"
                    value={tableData.tableNumber}
                    onChange={(e) => handleTableInputChange('tableNumber', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Table Type
                  </label>
                  <select
                    value={tableData.tableType}
                    onChange={(e) => handleTableInputChange('tableType', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {tableTypes.map(type => (
                      <option key={type} value={type} className="capitalize">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={tableData.capacity}
                    onChange={(e) => handleTableInputChange('capacity', e.target.value ? parseInt(e.target.value) : 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    min="1"
                    max="20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={tableData.location}
                    onChange={(e) => handleTableInputChange('location', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {locations.map(location => (
                      <option key={location} value={location} className="capitalize">
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={tableData.isAC}
                    onChange={(e) => handleTableInputChange('isAC', e.target.checked)}
                    className="mr-2"
                  />
                  Air Conditioned
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Per Person (₹)</label>
                    <input
                      type="number"
                      value={tableData.pricing.perPerson}
                      onChange={(e) => handleTableInputChange('pricing.perPerson', e.target.value ? parseFloat(e.target.value) : 0)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Table Charge (₹)</label>
                    <input
                      type="number"
                      value={tableData.pricing.tableCharge}
                      onChange={(e) => handleTableInputChange('pricing.tableCharge', e.target.value ? parseFloat(e.target.value) : 0)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={tableData.description}
                  onChange={(e) => handleTableInputChange('description', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={tableData.availability}
                    onChange={(e) => handleTableInputChange('availability', e.target.checked)}
                    className="mr-2"
                  />
                  Available for booking
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTableModal(false);
                    resetTableForm();
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
                  {loading ? 'Saving...' : (editingTable ? 'Update Table' : 'Add Table')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Item Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => {
                  setShowMenuModal(false);
                  resetMenuForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMenuSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Number
                  </label>
                  <input
                    type="text"
                    value={menuItemData.itemNumber}
                    onChange={(e) => handleMenuInputChange('itemNumber', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={menuItemData.name}
                    onChange={(e) => handleMenuInputChange('name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={menuItemData.category}
                    onChange={(e) => handleMenuInputChange('category', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {menuCategories.map(category => (
                      <option key={category} value={category} className="capitalize">
                        {category.replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={menuItemData.price}
                    onChange={(e) => handleMenuInputChange('price', e.target.value ? parseFloat(e.target.value) : 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={menuItemData.isVeg}
                    onChange={(e) => handleMenuInputChange('isVeg', e.target.checked)}
                    className="mr-2"
                  />
                  Vegetarian
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={menuItemData.isAvailable}
                    onChange={(e) => handleMenuInputChange('isAvailable', e.target.checked)}
                    className="mr-2"
                  />
                  Available
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={menuItemData.description}
                  onChange={(e) => handleMenuInputChange('description', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredients
                  </label>
                  <textarea
                    value={menuItemData.ingredients}
                    onChange={(e) => handleMenuInputChange('ingredients', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows="2"
                    placeholder="Comma separated ingredients"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergens
                  </label>
                  <textarea
                    value={menuItemData.allergens}
                    onChange={(e) => handleMenuInputChange('allergens', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows="2"
                    placeholder="Comma separated allergens"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Images
                </label>
                <MongoImageUploadManager
                  maxImages={3}
                  onImagesChange={handleMenuImageUpload}
                  existingImages={menuItemData.images}
                  category="menu"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenuModal(false);
                    resetMenuForm();
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
                  {loading ? 'Saving...' : (editingMenuItem ? 'Update Item' : 'Add Item')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantListingManager;
