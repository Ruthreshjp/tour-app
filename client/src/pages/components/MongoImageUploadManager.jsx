import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUpload, FaTrash, FaImage, FaPlus, FaEye } from 'react-icons/fa';

const MongoImageUploadManager = ({ 
  mainImage, 
  additionalImages = [], 
  onMainImageChange, 
  onAdditionalImagesChange,
  maxAdditionalImages = 10,
  businessName = "Business",
  businessId = null,
  // New interface for listing managers
  maxImages = 10,
  onImagesChange,
  existingImages = [],
  category = 'additional'
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  
  // Determine which interface is being used
  const isNewInterface = !!onImagesChange;
  const currentImages = isNewInterface ? existingImages : additionalImages;
  const maxImageCount = isNewInterface ? maxImages : maxAdditionalImages;

  // Validate image file - Allow all image types
  const validateImage = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    // Check if it's any image type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('Image size should be less than 10MB');
      return false;
    }

    return true;
  };

  // Upload single image to MongoDB
  const uploadImageToMongoDB = async (file, category = 'additional') => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', category);
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
      console.error('Upload error:', error);
      throw error;
    }
  };

  // Upload multiple images to MongoDB
  const uploadMultipleImagesToMongoDB = async (files, category = 'additional') => {
    try {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('images', file);
      });
      
      formData.append('category', category);
      if (businessId) {
        formData.append('businessId', businessId);
      }

      const response = await axios.post('/api/images/upload/multiple', formData, {
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
        return response.data.images.map(img => img.url);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Multiple upload error:', error);
      throw error;
    }
  };

  // Handle main image upload
  const handleMainImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !validateImage(file)) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      
      const imageUrl = await uploadImageToMongoDB(file, 'main');
      
      if (onMainImageChange) {
        onMainImageChange(imageUrl);
      }
      
      toast.success('Main image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading main image:', error);
      toast.error('Failed to upload main image: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle additional images upload (works with both interfaces)
  const handleAdditionalImagesUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate all files
    const validFiles = files.filter(validateImage);
    if (validFiles.length === 0) return;

    // Check if adding these files would exceed the limit
    if (currentImages.length + validFiles.length > maxImageCount) {
      toast.error(`You can only upload up to ${maxImageCount} images`);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      
      const imageUrls = await uploadMultipleImagesToMongoDB(validFiles, category);
      
      const newImages = [...currentImages, ...imageUrls];
      
      if (isNewInterface && onImagesChange) {
        onImagesChange(newImages);
      } else if (onAdditionalImagesChange) {
        onAdditionalImagesChange(newImages);
      }
      
      toast.success(`${imageUrls.length} images uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Clear the input
      event.target.value = '';
    }
  };

  // Remove image (works with both interfaces)
  const removeAdditionalImage = (indexToRemove) => {
    const updatedImages = currentImages.filter((_, index) => index !== indexToRemove);
    
    if (isNewInterface && onImagesChange) {
      onImagesChange(updatedImages);
    } else if (onAdditionalImagesChange) {
      onAdditionalImagesChange(updatedImages);
    }
  };

  // Remove main image
  const removeMainImage = () => {
    if (onMainImageChange) {
      onMainImageChange('');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <FaImage className="text-blue-500" />
        Business Images
      </h3>

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Uploading...</span>
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

      {/* Main Image Section - Only show for old interface */}
      {!isNewInterface && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-700 mb-4">Main Business Image *</h4>
          
          {mainImage ? (
            <div className="relative inline-block">
              <img
                src={mainImage}
                alt="Main business"
                className="w-48 h-32 object-cover rounded-lg border"
              />
              <button
                onClick={removeMainImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                type="button"
              >
                <FaTrash className="w-3 h-3" />
              </button>
              <button
                onClick={() => setPreviewImage(mainImage)}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                type="button"
              >
                <FaEye className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  className="hidden"
                  id="main-image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="main-image-upload"
                  className={`cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Choose Main Image
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Upload a high-quality image that represents your {businessName.toLowerCase()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Images Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-gray-700">
            {isNewInterface ? 'Images' : 'Additional Images'} ({currentImages.length}/{maxImageCount})
          </h4>
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesUpload}
              className="hidden"
              id="additional-images-upload"
              disabled={uploading || currentImages.length >= maxImageCount}
            />
            <label
              htmlFor="additional-images-upload"
              className={`cursor-pointer bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 ${
                uploading || currentImages.length >= maxImageCount
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              <FaPlus className="w-4 h-4" />
              Add Images
            </label>
          </div>
        </div>

        {currentImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Additional ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <button
                  onClick={() => removeAdditionalImage(index)}
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
              No additional images uploaded yet. Add some to showcase your {businessName.toLowerCase()}!
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
              alt="Preview" 
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

export default MongoImageUploadManager;
