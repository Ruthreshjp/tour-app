import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaPlus, FaEdit, FaTrash, FaCar, FaEye, FaTh, FaUsers, FaGasPump } from 'react-icons/fa';
import { toast } from 'react-toastify';
import MongoImageUploadManager from '../../components/MongoImageUploadManager';
import { Image } from '../../../components/Image';

const CabListingManager = () => {
  const { currentBusiness } = useSelector((state) => state.business);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [vehicleData, setVehicleData] = useState({
    vehicleNumber: '',
    vehicleType: 'hatchback',
    model: '',
    year: new Date().getFullYear(),
    capacity: 4,
    isAC: true,
    fuelType: 'petrol',
    features: [],
    images: [],
    pricing: {
      perKm: 0,
      baseFare: 0,
      waitingCharges: 0,
      nightCharges: 0
    },
    availability: true,
    driverName: '',
    driverPhone: '',
    licenseNumber: '',
    insuranceExpiry: '',
    description: ''
  });

  const vehicleTypes = [
    { value: 'hatchback', label: 'Hatchback', capacity: [4, 5] },
    { value: 'sedan', label: 'Sedan', capacity: [4, 5] },
    { value: 'suv', label: 'SUV', capacity: [6, 7, 8] },
    { value: 'luxury', label: 'Luxury', capacity: [4, 5] },
    { value: 'tempo-traveller', label: 'Tempo Traveller', capacity: [9, 12, 15, 17] },
    { value: 'bus', label: 'Bus', capacity: [20, 25, 30, 35, 40] }
  ];

  const fuelTypes = ['petrol', 'diesel', 'cng', 'electric', 'hybrid'];
  const availableFeatures = [
    'GPS Navigation', 'Music System', 'Phone Charger', 'WiFi', 
    'First Aid Kit', 'Water Bottles', 'Tissues', 'Sanitizer',
    'Child Seat', 'Wheelchair Accessible', 'Pet Friendly'
  ];

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/business/vehicles/${currentBusiness._id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setVehicles(data.vehicles);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setVehicleData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setVehicleData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFeatureToggle = (feature) => {
    setVehicleData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleImageUpload = (images) => {
    setVehicleData(prev => ({
      ...prev,
      images: images
    }));
  };

  const handleVehicleTypeChange = (type) => {
    const selectedType = vehicleTypes.find(vt => vt.value === type);
    setVehicleData(prev => ({
      ...prev,
      vehicleType: type,
      capacity: selectedType ? selectedType.capacity[0] : 4
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = editingVehicle 
        ? `/api/business/vehicles/${editingVehicle._id}`
        : `/api/business/vehicles`;
      
      const method = editingVehicle ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...vehicleData,
          businessId: currentBusiness._id
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingVehicle ? 'Vehicle updated successfully' : 'Vehicle added successfully');
        fetchVehicles();
        resetForm();
        setShowModal(false);
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error('Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleData(vehicle);
    setShowModal(true);
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/business/vehicles/${vehicleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Vehicle deleted successfully');
        fetchVehicles();
      } else {
        toast.error(data.message || 'Failed to delete vehicle');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setVehicleData({
      vehicleNumber: '',
      vehicleType: 'hatchback',
      model: '',
      year: new Date().getFullYear(),
      capacity: 4,
      isAC: true,
      fuelType: 'petrol',
      features: [],
      images: [],
      pricing: {
        perKm: 0,
        baseFare: 0,
        waitingCharges: 0,
        nightCharges: 0
      },
      availability: true,
      driverName: '',
      driverPhone: '',
      licenseNumber: '',
      insuranceExpiry: '',
      description: ''
    });
    setEditingVehicle(null);
  };

  const getCapacityOptions = (vehicleType) => {
    const type = vehicleTypes.find(vt => vt.value === vehicleType);
    return type ? type.capacity : [4];
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Vehicle Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add Vehicle
        </button>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {vehicle.images && vehicle.images.length > 0 && (
              <Image
                src={vehicle.images[0]}
                alt={vehicle.model}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{vehicle.model}</h3>
                  <p className="text-sm text-gray-600">{vehicle.vehicleNumber}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p><FaCar className="inline mr-2" />{vehicle.vehicleType} ({vehicle.year})</p>
                <p><FaUsers className="inline mr-2" />{vehicle.capacity} seater</p>
                <p><FaGasPump className="inline mr-2" />{vehicle.fuelType}</p>
                <p><strong>AC:</strong> {vehicle.isAC ? 'Yes' : 'No'}</p>
                <p><strong>Per KM:</strong> ₹{vehicle.pricing.perKm}</p>
                <p><strong>Base Fare:</strong> ₹{vehicle.pricing.baseFare}</p>
              </div>

              {vehicle.features && vehicle.features.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {vehicle.features.slice(0, 2).map((feature) => (
                      <span
                        key={feature}
                        className="bg-gray-100 text-xs px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                    {vehicle.features.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{vehicle.features.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-3 flex justify-between items-center">
                <span className={`px-2 py-1 rounded text-xs ${
                  vehicle.availability 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {vehicle.availability ? 'Available' : 'Not Available'}
                </span>
                {vehicle.driverName && (
                  <span className="text-xs text-gray-500">
                    Driver: {vehicle.driverName}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    value={vehicleData.vehicleNumber}
                    onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., TN01AB1234"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type *
                  </label>
                  <select
                    value={vehicleData.vehicleType}
                    onChange={(e) => handleVehicleTypeChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {vehicleTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={vehicleData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Maruti Swift"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={vehicleData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    min="2000"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seating Capacity
                  </label>
                  <select
                    value={vehicleData.capacity}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {getCapacityOptions(vehicleData.vehicleType).map(capacity => (
                      <option key={capacity} value={capacity}>
                        {capacity} seater
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type
                  </label>
                  <select
                    value={vehicleData.fuelType}
                    onChange={(e) => handleInputChange('fuelType', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {fuelTypes.map(fuel => (
                      <option key={fuel} value={fuel} className="capitalize">
                        {fuel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={vehicleData.isAC}
                    onChange={(e) => handleInputChange('isAC', e.target.checked)}
                    className="mr-2"
                  />
                  Air Conditioned
                </label>
              </div>

              {/* Pricing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing
                </label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Per KM (₹)</label>
                    <input
                      type="number"
                      value={vehicleData.pricing.perKm}
                      onChange={(e) => handleInputChange('pricing.perKm', parseFloat(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Base Fare (₹)</label>
                    <input
                      type="number"
                      value={vehicleData.pricing.baseFare}
                      onChange={(e) => handleInputChange('pricing.baseFare', parseFloat(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Waiting Charges (₹/hr)</label>
                    <input
                      type="number"
                      value={vehicleData.pricing.waitingCharges}
                      onChange={(e) => handleInputChange('pricing.waitingCharges', parseFloat(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Night Charges (₹/km)</label>
                    <input
                      type="number"
                      value={vehicleData.pricing.nightCharges}
                      onChange={(e) => handleInputChange('pricing.nightCharges', parseFloat(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableFeatures.map((feature) => (
                    <label key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={vehicleData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="mr-2"
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Driver Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-700 mb-3">Driver Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver Name
                    </label>
                    <input
                      type="text"
                      value={vehicleData.driverName}
                      onChange={(e) => handleInputChange('driverName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver Phone
                    </label>
                    <input
                      type="tel"
                      value={vehicleData.driverPhone}
                      onChange={(e) => handleInputChange('driverPhone', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      value={vehicleData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance Expiry
                    </label>
                    <input
                      type="date"
                      value={vehicleData.insuranceExpiry}
                      onChange={(e) => handleInputChange('insuranceExpiry', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Images
                </label>
                <MongoImageUploadManager
                  maxImages={5}
                  onImagesChange={handleImageUpload}
                  existingImages={vehicleData.images}
                  category="vehicle"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={vehicleData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows="3"
                  placeholder="Additional vehicle details..."
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={vehicleData.availability}
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
                    setShowModal(false);
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
                  {loading ? 'Saving...' : (editingVehicle ? 'Update Vehicle' : 'Add Vehicle')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CabListingManager;
