import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaCamera, FaClock, FaPhone, FaGlobe, FaCheck } from 'react-icons/fa';
import LeafletLocationPicker from '../components/LeafletLocationPicker';
import MongoImageUploadManager from '../components/MongoImageUploadManager';
import MongoMenuManager from '../components/MongoMenuManager';

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
  const [setupData, setSetupData] = useState({
    // Basic Info
    businessDescription: '',
    contactPhone: '',
    website: '',
    
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
    
    // Operating Hours
    operatingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: true }
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
        { key: 'checkInTime', label: 'Check-in Time', type: 'time', required: true },
        { key: 'checkOutTime', label: 'Check-out Time', type: 'time', required: true },
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

  const handleLocationSelect = (locationData) => {
    setSetupData(prev => ({
      ...prev,
      location: {
        latitude: locationData.lat,
        longitude: locationData.lng,
        address: locationData.address || '',
        city: locationData.city || '',
        state: locationData.state || '',
        pincode: locationData.pincode || ''
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

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return setupData.businessDescription.trim() && setupData.contactPhone.trim();
      case 2:
        return setupData.location.latitude && setupData.location.longitude;
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
      if (data.success) {
        toast.success('Business setup completed successfully!');
        navigate('/business/dashboard');
      } else {
        toast.error(data.message || 'Setup failed');
      }
    } catch (error) {
      console.error('Setup error:', error);
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Location Setup</h3>
            <p className="text-gray-600">Select your business location on the map</p>
            <LeafletLocationPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={setupData.location.latitude && setupData.location.longitude ? {
                lat: setupData.location.latitude,
                lng: setupData.location.longitude,
                address: setupData.location.address
              } : null}
              height="400px"
            />
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
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <FaCheck className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Setup Complete!</h3>
            <p className="text-gray-600">
              Review your information and complete the setup to start managing your business.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <h4 className="font-medium mb-2">Setup Summary:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✓ Basic information completed</li>
                <li>✓ Location set</li>
                <li>✓ Images uploaded</li>
                <li>✓ Operating hours configured</li>
                <li>✓ Business-specific details added</li>
              </ul>
            </div>
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
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
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </button>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSetupWizard;
