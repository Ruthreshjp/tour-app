import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaUpload, 
  FaImage, 
  FaEye,
  FaUtensils,
  FaCoffee
} from 'react-icons/fa';

const MongoMenuManager = ({ businessType, initialMenu = {}, onMenuChange, businessId = null }) => {
  const [menu, setMenu] = useState(initialMenu);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    setMenu(initialMenu);
  }, [initialMenu]);

  const handleMenuUpdate = (newMenu) => {
    setMenu(newMenu);
    if (onMenuChange) {
      onMenuChange(newMenu);
    }
  };

  // Upload menu card image to MongoDB
  const uploadMenuCardImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', 'menu-card');
      if (businessId) {
        formData.append('businessId', businessId);
      }

      const response = await axios.post('/api/images/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        return response.data.image.url;
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Menu card upload error:', error);
      throw error;
    }
  };

  // Handle menu card image upload
  const handleMenuCardUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate image file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Image size should be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      
      const imageUrl = await uploadMenuCardImage(file);
      
      const updatedMenu = {
        ...menu,
        menuCardImages: [...(menu.menuCardImages || []), imageUrl]
      };
      
      handleMenuUpdate(updatedMenu);
      toast.success('Menu card image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading menu card:', error);
      toast.error('Failed to upload menu card: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Clear the input
      event.target.value = '';
    }
  };

  // Remove menu card image
  const removeMenuCardImage = (indexToRemove) => {
    const updatedImages = menu.menuCardImages.filter((_, index) => index !== indexToRemove);
    const updatedMenu = {
      ...menu,
      menuCardImages: updatedImages
    };
    handleMenuUpdate(updatedMenu);
  };

  // Add new menu item
  const addMenuItem = () => {
    const newItem = {
      id: Date.now(),
      itemNo: (menu.items?.length || 0) + 1,
      name: '',
      description: '',
      category: 'main-course',
      price: '0',
      isVeg: true,
      isAvailable: true,
      ingredients: '',
      allergens: ''
    };
    
    const updatedMenu = {
      ...menu,
      items: [...(menu.items || []), newItem]
    };
    
    handleMenuUpdate(updatedMenu);
    setEditingItem(newItem.id);
  };

  // Update menu item
  const updateMenuItem = (itemId, field, value) => {
    const updatedItems = menu.items.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    );
    
    const updatedMenu = {
      ...menu,
      items: updatedItems
    };
    
    handleMenuUpdate(updatedMenu);
  };

  // Delete menu item
  const deleteMenuItem = (itemId) => {
    const updatedItems = menu.items.filter(item => item.id !== itemId);
    const updatedMenu = {
      ...menu,
      items: updatedItems
    };
    handleMenuUpdate(updatedMenu);
  };

  // Save editing item
  const saveEditingItem = () => {
    setEditingItem(null);
    toast.success('Menu item saved!');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingItem(null);
  };

  const categories = [
    'appetizer', 'main-course', 'dessert', 'beverages', 
    'snacks', 'breakfast', 'lunch', 'dinner', 'special'
  ];

  // Only show for restaurants and cafes
  const normalizedBusinessType = businessType?.toLowerCase();
  if (!['restaurant', 'cafe'].includes(normalizedBusinessType)) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        {normalizedBusinessType === 'restaurant' ? <FaUtensils className="text-orange-500" /> : <FaCoffee className="text-brown-500" />}
        Menu Management
      </h3>

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Uploading menu card...</span>
            <span className="text-sm font-medium text-blue-700">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Menu Card Images Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-gray-700">
            Menu Card Images ({menu.menuCardImages?.length || 0}/5)
          </h4>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleMenuCardUpload}
              className="hidden"
              id="menu-card-upload"
              disabled={uploading || (menu.menuCardImages?.length || 0) >= 5}
            />
            <label
              htmlFor="menu-card-upload"
              className={`cursor-pointer bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 ${
                uploading || (menu.menuCardImages?.length || 0) >= 5
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              <FaUpload className="w-4 h-4" />
              Add Menu Card
            </label>
          </div>
        </div>

        {menu.menuCardImages && menu.menuCardImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {menu.menuCardImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Menu card ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  onClick={() => removeMenuCardImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  type="button"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setPreviewImage(image)}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity"
                  type="button"
                >
                  <FaEye className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaImage className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              No menu card images uploaded yet. Add some to showcase your menu!
            </p>
          </div>
        )}
      </div>

      {/* Menu Items Section */}
      <div className="border border-gray-300 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-gray-700">
            Menu Items ({menu.items?.length || 0})
          </h4>
          <button
            onClick={addMenuItem}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            type="button"
          >
            <FaPlus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {menu.items && menu.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item No</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {menu.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{item.itemNo}</td>
                    <td className="px-4 py-2">
                      {editingItem === item.id ? (
                        <input
                          type="text"
                          value={item.name || ''}
                          onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)}
                          className="w-full p-1 border rounded text-sm"
                          placeholder="Item name"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">{item.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingItem === item.id ? (
                        <select
                          value={item.category || 'main-course'}
                          onChange={(e) => updateMenuItem(item.id, 'category', e.target.value)}
                          className="w-full p-1 border rounded text-sm"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-gray-600 capitalize">
                          {item.category.replace('-', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingItem === item.id ? (
                        <input
                          type="number"
                          value={item.price || '0'}
                          onChange={(e) => updateMenuItem(item.id, 'price', e.target.value)}
                          className="w-full p-1 border rounded text-sm"
                          placeholder="Price"
                        />
                      ) : (
                        <span className="text-sm text-gray-900">₹{item.price}</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingItem === item.id ? (
                        <select
                          value={item.isVeg !== undefined ? item.isVeg : true}
                          onChange={(e) => updateMenuItem(item.id, 'isVeg', e.target.value === 'true')}
                          className="w-full p-1 border rounded text-sm"
                        >
                          <option value="true">Veg</option>
                          <option value="false">Non-Veg</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.isVeg 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isVeg ? 'Veg' : 'Non-Veg'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editingItem === item.id ? (
                        <select
                          value={item.isAvailable !== undefined ? item.isAvailable : true}
                          onChange={(e) => updateMenuItem(item.id, 'isAvailable', e.target.value === 'true')}
                          className="w-full p-1 border rounded text-sm"
                        >
                          <option value="true">Available</option>
                          <option value="false">Not Available</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.isAvailable ? 'Available' : 'Not Available'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center space-x-2">
                        {editingItem === item.id ? (
                          <>
                            <button
                              onClick={saveEditingItem}
                              className="text-green-600 hover:text-green-800"
                              type="button"
                            >
                              <FaSave className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-gray-600 hover:text-gray-800"
                              type="button"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingItem(item.id)}
                              className="text-blue-600 hover:text-blue-800"
                              type="button"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteMenuItem(item.id)}
                              className="text-red-600 hover:text-red-800"
                              type="button"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FaUtensils className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              No menu items added yet. Click "Add Item" to start building your menu!
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl max-h-4xl relative">
            <img 
              src={previewImage} 
              alt="Menu card preview" 
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MongoMenuManager;
