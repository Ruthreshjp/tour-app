import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaCamera, FaClock, FaPhone, FaGlobe, FaCheck } from 'react-icons/fa';
import MongoImageUploadManager from '../components/MongoImageUploadManager';
import MongoMenuManager from '../components/MongoMenuManager';
import BusinessLocationPicker from './BusinessLocationPicker';
import { updateBusiness } from '../../redux/business/businessSlice';

const BusinessSetupWizard = () => {
  const { currentBusiness } = useSelector((state) => state.business || {});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle case when currentBusiness is not loaded
  if (!currentBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business data...</p>
        </div>
      </div>
    );
  }

  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [setupData, setSetupData] = useState({
    // Basic Info - Initialize with empty strings to prevent controlled/uncontrolled warnings
    businessDescription: '',
    contactPhone: '',
    website: '',
    googleMapsLink: '', // Add Google Maps link field
    upiId: '', // Add UPI ID field
    
    // Location
    location: {
      latitude: null,
      longitude: null,
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    
    // Images
    mainImage: null,
    additionalImages: [],
    
    // Operating Hours (Default: 24/7 for hotels, 9-6 for others)
    operatingHours: {
      monday: { open: '00:00', close: '23:59', closed: false },
      tuesday: { open: '00:00', close: '23:59', closed: false },
      wednesday: { open: '00:00', close: '23:59', closed: false },
      thursday: { open: '00:00', close: '23:59', closed: false },
      friday: { open: '00:00', close: '23:59', closed: false },
      saturday: { open: '00:00', close: '23:59', closed: false },
      sunday: { open: '00:00', close: '23:59', closed: false }
    },
    
    // Business Specific Data
    businessSpecific: {},
    
    // Menu Data (for restaurants and cafes)
    menu: {
      menuCardImages: [],
      items: []
    }
  });

  const [loading, setLoading] = useState(false);

  const businessTypes = {
    hotel: {
      title: 'Hotel Setup',
      fields: [
        { key: 'totalRooms', label: 'Total Rooms', type: 'number', required: true },
        { key: 'amenities', label: 'Amenities (comma separated)', type: 'textarea', required: false },
        { key: 'starRating', label: 'Star Rating', type: 'select', options: [1,2,3,4,5], required: true }
      ]
    },
    restaurant: {
      title: 'Restaurant Setup',
      fields: [
        { key: 'totalTables', label: 'Total Tables', type: 'number', required: true },
        { key: 'cuisineType', label: 'Cuisine Type', type: 'text', required: true },
        { key: 'seatingCapacity', label: 'Total Seating Capacity', type: 'number', required: true },
        { key: 'specialties', label: 'Specialties (comma separated)', type: 'textarea', required: false },
        { key: 'avgCostPerPerson', label: 'Average Cost Per Person', type: 'number', required: true }
      ]
    },
    cab: {
      title: 'Cab Service Setup',
      fields: [
        { key: 'totalVehicles', label: 'Total Vehicles', type: 'number', required: true },
        { key: 'serviceArea', label: 'Service Area (cities)', type: 'textarea', required: true },
        { key: 'vehicleTypes', label: 'Vehicle Types Available', type: 'text', required: true },
        { key: 'baseRate', label: 'Base Rate per KM', type: 'number', required: true },
        { key: 'driverCount', label: 'Number of Drivers', type: 'number', required: true }
      ]
    },
    cafe: {
      title: 'Cafe Setup',
      fields: [
        { key: 'totalSeats', label: 'Total Seating', type: 'number', required: true },
        { key: 'specialtyDrinks', label: 'Specialty Drinks', type: 'textarea', required: false },
        { key: 'wifiAvailable', label: 'WiFi Available', type: 'checkbox', required: false },
        { key: 'workFriendly', label: 'Work-Friendly Environment', type: 'checkbox', required: false },
        { key: 'avgBillAmount', label: 'Average Bill Amount', type: 'number', required: true }
      ]
    },
    shopping: {
      title: 'Shopping Setup',
      fields: [
        { key: 'storeType', label: 'Store Type', type: 'text', required: true },
        { key: 'productCategories', label: 'Product Categories', type: 'textarea', required: true },
        { key: 'storeSize', label: 'Store Size (sq ft)', type: 'number', required: false },
        { key: 'brands', label: 'Brands Available', type: 'textarea', required: false },
        { key: 'paymentMethods', label: 'Payment Methods', type: 'text', required: true }
      ]
    }
  };

  const currentBusinessType = businessTypes[currentBusiness?.businessType] || businessTypes.hotel;

  // Load existing business data if already set up
  useEffect(() => {
    if (currentBusiness) {
      // Check if setup is completed
      if (currentBusiness.setupCompleted) {
        setIsEditMode(true);
        setCurrentStep(7); // Go to summary/edit step
      } else {
        setIsEditMode(false);
        setCurrentStep(1);
      }
      
      // Load existing data regardless of setup status - use || '' to prevent undefined values
      setSetupData({
        businessDescription: currentBusiness.description || '',
        contactPhone: currentBusiness.phone || '',
        website: currentBusiness.website || '',
        googleMapsLink: currentBusiness.googleMapsLink || '',
        upiId: currentBusiness.upiId || '',
        location: {
          latitude: currentBusiness.location?.coordinates?.[1] || null,
          longitude: currentBusiness.location?.coordinates?.[0] || null,
          address: currentBusiness.address || '',
          city: currentBusiness.city || '',
          state: currentBusiness.state || '',
          pincode: currentBusiness.pincode || ''
        },
        mainImage: currentBusiness.profileImage || currentBusiness.mainImage || null,
        additionalImages: currentBusiness.businessImages || currentBusiness.additionalImages || [],
        operatingHours: currentBusiness.businessHours || currentBusiness.operatingHours || {
          monday: { open: '00:00', close: '23:59', closed: false },
          tuesday: { open: '00:00', close: '23:59', closed: false },
          wednesday: { open: '00:00', close: '23:59', closed: false },
          thursday: { open: '00:00', close: '23:59', closed: false },
          friday: { open: '00:00', close: '23:59', closed: false },
          saturday: { open: '00:00', close: '23:59', closed: false },
          sunday: { open: '00:00', close: '23:59', closed: false }
        },
        businessSpecific: currentBusiness.businessSpecific || {},
        menu: currentBusiness.menu || { menuCardImages: [], items: [] }
      });
    }
  }, [currentBusiness]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSetupData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSetupData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleBusinessSpecificChange = (field, value) => {
    setSetupData(prev => ({
      ...prev,
      businessSpecific: {
        ...prev.businessSpecific,
        [field]: value
      }
    }));
  };

  const handleImageUpload = (type, images) => {
    if (type === 'main') {
      setSetupData(prev => ({ ...prev, mainImage: images[0] }));
    } else {
      setSetupData(prev => ({ ...prev, additionalImages: images }));
    }
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setSetupData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleLocationConfirm = (locationData) => {
    console.log('Location confirmed:', locationData);
    setSetupData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        address: locationData.address,
        city: locationData.city || prev.location.city,
        state: locationData.state || prev.location.state,
        pincode: locationData.pincode || prev.location.pincode,
        latitude: locationData.lat,
        longitude: locationData.lng
      },
      googleMapsLink: locationData.googleMapsLink
    }));
    setShowLocationPicker(false);
    toast.success('Location details updated successfully!');
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return setupData.businessDescription.trim() && setupData.contactPhone.trim();
      case 2:
        return setupData.location.address.trim() && 
               setupData.location.city.trim() && 
               setupData.location.state.trim() && 
               setupData.location.pincode.trim() &&
               setupData.googleMapsLink.trim();
      case 3:
        return setupData.mainImage;
      case 4:
        return true; // Operating hours are optional
      case 5:
        const requiredFields = currentBusinessType.fields.filter(field => field.required);
        return requiredFields.every(field => 
          setupData.businessSpecific[field.key] && 
          setupData.businessSpecific[field.key].toString().trim()
        );
      case 6:
        // Menu step is optional for restaurants and cafes
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const businessType = currentBusiness?.businessType;
      const isRestaurantOrCafe = businessType === 'restaurant' || businessType === 'cafe';
      
      if (currentStep === 5 && !isRestaurantOrCafe) {
        // Skip menu step for non-restaurant/cafe businesses
        setCurrentStep(7);
      } else {
        setCurrentStep(prev => Math.min(prev + 1, isRestaurantOrCafe ? 7 : 6));
      }
    } else {
      toast.error('Please fill all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Submitting setup data:', setupData);
      
      const response = await fetch('/api/business/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          businessId: currentBusiness._id,
          setupData
        })
      });

      const data = await response.json();
      console.log('📥 Setup response:', data);
      
      if (data.success) {
        toast.success(isEditMode ? 'Business updated successfully!' : 'Business setup completed successfully!');
        
        // Update Redux state with new business data
        if (data.business) {
          console.log('🔄 Updating Redux and localStorage with new business data');
          
          // Update Redux
          dispatch(updateBusiness(data.business));
          
          // Update localStorage
          localStorage.setItem('businessData', JSON.stringify(data.business));
          
          // Dispatch event to update other components
          window.dispatchEvent(new Event('storage'));
          
          console.log('✅ Redux and localStorage updated');
        }
        
        // Navigate to dashboard
        setTimeout(() => {
          navigate('/business/dashboard');
        }, 500);
      } else {
        toast.error(data.message || 'Setup failed');
      }
    } catch (error) {
      console.error('❌ Setup error:', error);
      toast.error('Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description *
              </label>
              <textarea
                value={setupData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                rows="4"
                placeholder="Describe your business..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone *
              </label>
              <input
                type="tel"
                value={setupData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="+91 9876543210"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website (Optional)
              </label>
              <input
                type="url"
                value={setupData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="https://yourbusiness.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID for Payments (Optional)
              </label>
              <input
                type="text"
                value={setupData.upiId}
                onChange={(e) => handleInputChange('upiId', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="yourname@paytm / yourname@phonepe"
              />
              <p className="text-xs text-gray-500 mt-1">
                Customers will use this UPI ID to make payments for bookings
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Location Setup</h3>
            <p className="text-gray-600">Provide your business location details</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address *
                </label>
                <textarea
                  value={setupData.location.address || ''}
                  onChange={(e) => handleInputChange('location.address', e.target.value)}
                  placeholder="Enter complete business address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="3"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps Link *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={setupData.googleMapsLink || ''}
                    onChange={(e) => handleInputChange('googleMapsLink', e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center gap-2 whitespace-nowrap"
                  >
                    <FaMapMarkerAlt />
                    Pin on Map
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Click "Pin on Map" to select your location interactively, or paste a Google Maps link
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={setupData.location.city || ''}
                  onChange={(e) => handleInputChange('location.city', e.target.value)}
                  placeholder="Enter city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={setupData.location.state || ''}
                  onChange={(e) => handleInputChange('location.state', e.target.value)}
                  placeholder="Enter state"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={setupData.location.pincode || ''}
                  onChange={(e) => handleInputChange('location.pincode', e.target.value)}
                  placeholder="Enter pincode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Business Images</h3>
            <div>
              <h4 className="text-lg font-medium text-gray-700 mb-3">Main Business Image *</h4>
              <MongoImageUploadManager
                maxImages={1}
                onImagesChange={(images) => handleImageUpload('main', images)}
                existingImages={setupData.mainImage ? [setupData.mainImage] : []}
              />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-700 mb-3">Additional Images (Optional)</h4>
              <MongoImageUploadManager
                maxImages={10}
                onImagesChange={(images) => handleImageUpload('additional', images)}
                existingImages={setupData.additionalImages}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Operating Hours</h3>
            <div className="space-y-4">
              {Object.entries(setupData.operatingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-24 font-medium capitalize">{day}</div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) => handleOperatingHoursChange(day, 'closed', e.target.checked)}
                      className="mr-2"
                    />
                    Closed
                  </label>
                  {!hours.closed && (
                    <>
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                        className="p-2 border border-gray-300 rounded"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                        className="p-2 border border-gray-300 rounded"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">{currentBusinessType.title}</h3>
            <div className="space-y-4">
              {currentBusinessType.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} {field.required && '*'}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={setupData.businessSpecific[field.key] || ''}
                      onChange={(e) => handleBusinessSpecificChange(field.key, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      required={field.required}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={setupData.businessSpecific[field.key] || ''}
                      onChange={(e) => handleBusinessSpecificChange(field.key, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      rows="3"
                      required={field.required}
                    />
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={setupData.businessSpecific[field.key] || false}
                        onChange={(e) => handleBusinessSpecificChange(field.key, e.target.checked)}
                        className="mr-2"
                      />
                      Yes
                    </label>
                  ) : (
                    <input
                      type={field.type}
                      value={setupData.businessSpecific[field.key] || ''}
                      onChange={(e) => handleBusinessSpecificChange(field.key, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        // Menu Management Step (only for restaurants and cafes)
        const businessType = currentBusiness?.businessType;
        const isRestaurantOrCafe = businessType === 'restaurant' || businessType === 'cafe';
        
        if (!isRestaurantOrCafe) {
          // Skip to completion for non-restaurant/cafe businesses
          return renderStepContent(7);
        }
        
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Menu Management</h3>
            <p className="text-gray-600">
              Add your menu card images and menu items to help customers know what you offer.
            </p>
            
            <MongoMenuManager
              businessId={currentBusiness?._id}
              businessType={businessType}
              onMenuChange={(menuData) => {
                setSetupData(prev => ({
                  ...prev,
                  menu: menuData
                }));
              }}
              initialMenu={setupData.menu}
            />
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-blue-700 text-sm">
                💡 <strong>Tip:</strong> You can skip this step and add menu items later from your business dashboard.
              </p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {isEditMode ? 'Business Setup - Edit Mode' : 'Setup Complete!'}
              </h3>
              <p className="text-gray-600 mt-2">
                {isEditMode 
                  ? 'Review and update your business information' 
                  : 'Review your information and complete the setup'}
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4">
              {/* Basic Information */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <FaPhone className="mr-2 text-orange-500" />
                    Basic Information
                  </h4>
                  {isEditMode && (
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-sm px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Business:</strong> {currentBusiness?.businessName}</p>
                  <p><strong>Type:</strong> {currentBusiness?.businessType?.toUpperCase()}</p>
                  <p><strong>Description:</strong> {setupData.businessDescription || 'Not provided'}</p>
                  <p><strong>Phone:</strong> {setupData.contactPhone || 'Not provided'}</p>
                  <p><strong>Website:</strong> {setupData.website || 'Not provided'}</p>
                  <p><strong>UPI ID:</strong> {setupData.upiId || 'Not configured'}</p>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-orange-500" />
                    Location
                  </h4>
                  {isEditMode && (
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-sm px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Address:</strong> {setupData.location.address || 'Not provided'}</p>
                  <p><strong>City:</strong> {setupData.location.city || 'Not provided'}</p>
                  <p><strong>State:</strong> {setupData.location.state || 'Not provided'}</p>
                  <p><strong>Pincode:</strong> {setupData.location.pincode || 'Not provided'}</p>
                  <p><strong>Google Maps:</strong> {setupData.googleMapsLink ? 'Configured' : 'Not provided'}</p>
                </div>
              </div>

              {/* Images */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <FaCamera className="mr-2 text-orange-500" />
                    Images
                  </h4>
                  {isEditMode && (
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="text-sm px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Main Image:</strong> {setupData.mainImage ? '✓ Uploaded' : '✗ Not uploaded'}</p>
                  <p><strong>Additional Images:</strong> {setupData.additionalImages?.length || 0} images</p>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <FaClock className="mr-2 text-orange-500" />
                    Operating Hours
                  </h4>
                  {isEditMode && (
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="text-sm px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  {Object.entries(setupData.operatingHours).map(([day, hours]) => (
                    <p key={day}>
                      <strong className="capitalize">{day}:</strong>{' '}
                      {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                    </p>
                  ))}
                </div>
              </div>

              {/* Business Specific Details */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800">
                    {currentBusinessType.title}
                  </h4>
                  {isEditMode && (
                    <button
                      onClick={() => setCurrentStep(5)}
                      className="text-sm px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  {currentBusinessType.fields.map(field => (
                    <p key={field.key}>
                      <strong>{field.label}:</strong>{' '}
                      {setupData.businessSpecific[field.key] || 'Not provided'}
                    </p>
                  ))}
                </div>
              </div>

              {/* Menu (for restaurants and cafes) */}
              {(currentBusiness?.businessType === 'restaurant' || currentBusiness?.businessType === 'cafe') && (
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-800">Menu</h4>
                    {isEditMode && (
                      <button
                        onClick={() => setCurrentStep(6)}
                        className="text-sm px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Menu Card Images:</strong> {setupData.menu?.menuCardImages?.length || 0} images</p>
                    <p><strong>Menu Items:</strong> {setupData.menu?.items?.length || 0} items</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditMode && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => navigate('/business/dashboard')}
                  className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Business'}
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {(() => {
              const businessType = currentBusiness?.businessType;
              const isRestaurantOrCafe = businessType === 'restaurant' || businessType === 'cafe';
              const totalSteps = isRestaurantOrCafe ? 7 : 6;
              const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
              
              return steps.map((step) => (
                <div
                  key={step}
                  onClick={() => isEditMode && setCurrentStep(step)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  } ${isEditMode ? 'cursor-pointer hover:bg-orange-600 hover:scale-110 transition-all' : ''}`}
                  title={isEditMode ? `Go to step ${step}` : ''}
                >
                  {step}
                </div>
              ));
            })()}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(currentStep / (currentBusiness?.businessType === 'restaurant' || currentBusiness?.businessType === 'cafe' ? 7 : 6)) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          {/* Hide navigation buttons in edit mode when on summary step (step 7) */}
          {!(isEditMode && currentStep === 7) && (
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {(() => {
                const businessType = currentBusiness?.businessType;
                const isRestaurantOrCafe = businessType === 'restaurant' || businessType === 'cafe';
                const finalStep = isRestaurantOrCafe ? 7 : 6;
                
                return currentStep < finalStep ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Next
                  </button>
                ) : (
                  // Only show Complete Setup button for first-time setup (not in edit mode)
                  !isEditMode && (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      {loading ? 'Setting up...' : 'Complete Setup'}
                    </button>
                  )
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Business Location Picker Modal */}
      <BusinessLocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onConfirm={handleLocationConfirm}
        initialLocation={setupData.location}
      />
    </div>
  );
};

export default BusinessSetupWizard;
