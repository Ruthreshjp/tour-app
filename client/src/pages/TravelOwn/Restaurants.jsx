import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaStar, FaUtensils } from 'react-icons/fa';

const Restaurants = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Restaurants</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search restaurants..."
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="">Filter by Cuisine</option>
            <option value="indian">Indian</option>
            <option value="chinese">Chinese</option>
            <option value="italian">Italian</option>
          </select>
        </div>
      </div>

      {/* Restaurant List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sample Restaurant Card */}
        <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <img
            src="https://placehold.co/600x400"
            alt="Restaurant"
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold">Restaurant Name</h3>
              <div className="flex items-center">
                <FaStar className="text-yellow-400" />
                <span className="ml-1">4.5</span>
              </div>
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-gray-600">
                <FaUtensils className="mr-2" />
                <span>Indian Cuisine</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="mr-2" />
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-orange-500"
                >
                  View Location
                </a>
              </div>
              <div className="flex items-center text-gray-600">
                <FaPhone className="mr-2" />
                <span>+1234567890</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-600">Average cost for two</p>
              <p className="text-2xl font-bold text-orange-500">₹1,000</p>
            </div>
            <button className="mt-4 w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors">
              Book Table
            </button>
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

export default Restaurants;