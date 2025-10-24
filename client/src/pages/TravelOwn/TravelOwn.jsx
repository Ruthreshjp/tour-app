import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

const TravelOwn = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Trim spaces; children will react to query via Outlet context
    setSearchQuery((q) => q.trim());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow">
          <nav className="space-y-2">
            <Link
              to="/travel-own/hotels"
              className="block px-4 py-2 text-gray-700 hover:bg-orange-100 rounded-md transition-all"
            >
              🏨 Hotels
            </Link>
            <Link
              to="/travel-own/restaurants"
              className="block px-4 py-2 text-gray-700 hover:bg-orange-100 rounded-md transition-all"
            >
              🍽️ Restaurants
            </Link>
            <Link
              to="/travel-own/shopping"
              className="block px-4 py-2 text-gray-700 hover:bg-orange-100 rounded-md transition-all"
            >
              🛍️ Shopping
            </Link>
            <Link
              to="/travel-own/cab"
              className="block px-4 py-2 text-gray-700 hover:bg-orange-100 rounded-md transition-all"
            >
              🚗 Cab Services
            </Link>
            <Link
              to="/travel-own/cafe"
              className="block px-4 py-2 text-gray-700 hover:bg-orange-100 rounded-md transition-all"
            >
              ☕ Cafes
            </Link>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3 bg-white p-4 rounded-lg shadow">
          {/* Global Search */}
          <form onSubmit={handleSubmit} className="mb-4 flex gap-2 flex-wrap items-center">
            <input
              type="text"
              placeholder="Search a place (e.g., Chennai)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 flex-1 min-w-[220px]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Search
            </button>
          </form>

          <Outlet context={{ searchQuery }} />
        </div>
      </div>
    </div>
  );
};

export default TravelOwn;