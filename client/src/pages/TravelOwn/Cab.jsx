import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaStar, FaTaxi } from 'react-icons/fa';

const Cab = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Cab Services</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search cab services..."
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="">Filter by Type</option>
            <option value="luxury">Luxury</option>
            <option value="standard">Standard</option>
            <option value="shared">Shared</option>
          </select>
        </div>
      </div>

      {/* Cab Service List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sample Cab Service Card */}
        <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <img
            src="https://placehold.co/600x400"
            alt="Cab Service"
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold">Cab Service Name</h3>
              <div className="flex items-center">
                <FaStar className="text-yellow-400" />
                <span className="ml-1">4.5</span>
              </div>
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-gray-600">
                <FaTaxi className="mr-2" />
                <span>Luxury Cars Available</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="mr-2" />
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-orange-500"
                >
                  Service Area
                </a>
              </div>
              <div className="flex items-center text-gray-600">
                <FaPhone className="mr-2" />
                <span>+1234567890</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-600">Starting from</p>
              <p className="text-2xl font-bold text-orange-500">₹500/km</p>
            </div>
            <Link
              to={`/travel-own/cab/${business._id}/book`}
              className="mt-4 block w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors text-center"
            >
              Book Cab
            </Link>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button className="px-4 py-2 border rounded-md hover:bg-orange-50">Previous</button>
        <button className="px-4 py-2 bg-orange-500 text-white rounded-md">1</button>
        <button className="px-4 py-2 border rounded-md hover:bg-orange-50">2</button>
        <button className="px-4 py-2 border rounded-md hover:bg-orange-50">3</button>
        <button className="px-4 py-2 border rounded-md hover:bg-orange-50">Next</button>
      </div>
    </div>
  );
};

export default Cab;