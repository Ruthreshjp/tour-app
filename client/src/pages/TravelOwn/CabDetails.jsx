import React, { useState } from 'react';
import { FaCar, FaUsers, FaSnowflake, FaRupeeSign, FaTimes } from 'react-icons/fa';
import { Image } from '../../components/Image';
import CabBooking from './CabBooking';

const CabDetails = ({ business, isOpen, onClose }) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showBooking, setShowBooking] = useState(false);

  if (!isOpen) return null;

  // Get vehicles from business data
  const vehicles = business?.pricing?.vehicles || business?.vehicles || [];

  const handleBookVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowBooking(true);
  };

  const handleCloseBooking = () => {
    setShowBooking(false);
    setSelectedVehicle(null);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  {business?.businessName || business?.name}
                </h2>
                <p className="text-gray-600 mt-2">{business?.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span>📍</span>
                    <span>{business?.address}, {business?.city}, {business?.state}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📞</span>
                    <span>{business?.phone || business?.contactInfo?.phone}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-3xl"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-2xl font-semibold mb-4">Available Vehicles</h3>
            
            {vehicles.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FaCar className="mx-auto text-6xl mb-4 text-gray-300" />
                <p className="text-lg">No vehicles available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Vehicle Image */}
                    <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-50">
                      {vehicle.image ? (
                        <Image
                          src={vehicle.image}
                          alt={vehicle.vehicleType || vehicle.type}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FaCar className="text-6xl text-orange-300" />
                        </div>
                      )}
                      {vehicle.isAC && (
                        <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <FaSnowflake /> AC
                        </span>
                      )}
                    </div>

                    {/* Vehicle Details */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 capitalize">
                            {vehicle.vehicleType || vehicle.type}
                          </h4>
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <FaUsers className="text-gray-400" />
                            {vehicle.capacity} Seater
                          </p>
                        </div>
                        {vehicle.availability !== false && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                            Available
                          </span>
                        )}
                      </div>

                      {/* Pricing Information */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
                        {(vehicle.pricing?.perKm || vehicle.pricePerKm) && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Per Kilometer</span>
                            <span className="font-semibold text-orange-600 flex items-center gap-1">
                              <FaRupeeSign className="text-xs" />
                              {vehicle.pricing?.perKm || vehicle.pricePerKm}
                            </span>
                          </div>
                        )}
                        {vehicle.pricing?.baseFare && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Base Fare</span>
                            <span className="font-semibold text-gray-700 flex items-center gap-1">
                              <FaRupeeSign className="text-xs" />
                              {vehicle.pricing.baseFare}
                            </span>
                          </div>
                        )}
                        {vehicle.pricing?.waitingCharges && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Waiting Charges</span>
                            <span className="font-semibold text-gray-700 flex items-center gap-1">
                              <FaRupeeSign className="text-xs" />
                              {vehicle.pricing.waitingCharges}/hr
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Features/Amenities */}
                      {vehicle.features && vehicle.features.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-2">Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {vehicle.features.slice(0, 3).map((feature, idx) => (
                              <span
                                key={idx}
                                className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {vehicle.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {vehicle.description}
                        </p>
                      )}

                      {/* Book Button */}
                      <button
                        onClick={() => handleBookVehicle(vehicle)}
                        disabled={vehicle.availability === false}
                        className={`w-full py-2 rounded-md font-medium transition-colors ${
                          vehicle.availability === false
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                      >
                        {vehicle.availability === false ? 'Not Available' : 'Book This Vehicle'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Business Information */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-xl font-semibold mb-4">About {business?.businessName || 'This Service'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>📞 {business?.phone || business?.contactInfo?.phone}</p>
                    {business?.website && (
                      <p>
                        🌐 <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                          {business.website}
                        </a>
                      </p>
                    )}
                    <p>📍 {business?.address}, {business?.city}, {business?.state} - {business?.pincode}</p>
                  </div>
                </div>
                
                {business?.businessHours && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Operating Hours</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {Object.entries(business.businessHours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize">{day}:</span>
                          <span>{hours.open} - {hours.close}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && selectedVehicle && (
        <CabBooking
          business={business}
          vehicle={selectedVehicle}
          isOpen={showBooking}
          onClose={handleCloseBooking}
        />
      )}
    </>
  );
};

export default CabDetails;
