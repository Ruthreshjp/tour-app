import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { logOutSuccess } from "../../redux/user/userSlice";

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("businessToken");
    if (!token) {
      navigate("/business/login");
      return;
    }
    fetchBusinessData();
  }, [navigate]);

  const fetchBusinessData = async () => {
    try {
      const token = localStorage.getItem("businessToken");
      const res = await fetch("/api/business/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (data?.success) {
        setBusinessData(data.business);
      } else {
        toast.error("Failed to fetch business data");
        if (data?.message === "Unauthorized") {
          handleLogout();
        }
      }
    } catch (error) {
      console.error("Error fetching business data:", error);
      toast.error("Server error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("businessToken");
    localStorage.removeItem("businessData");
    dispatch(logOutSuccess());
    
    // Trigger custom event for Header component to update
    window.dispatchEvent(new Event('businessLogout'));
    
    toast.success("Logged out successfully");
    navigate("/business/login");
  };

  const handleNavigation = (route) => {
    navigate(route);
  };

  const getBusinessTypeIcon = (type) => {
    const icons = {
      hotel: "🏨",
      restaurant: "🍽️",
      cafe: "☕",
      cab: "🚗",
      shopping: "🛍️",
    };
    return icons[type] || "🏢";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF1DA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EB662B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF1DA]">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                <span className="text-[#6358DC]">Travel-Zone</span> Business
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Welcome, {businessData?.businessName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-[#EB662B] text-white px-4 py-2 rounded-md hover:bg-[#d55a24] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {businessData ? (
          <div className="space-y-6">
            {/* Business Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-4">
                  {getBusinessTypeIcon(businessData.businessType)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {businessData.businessName}
                  </h2>
                  <p className="text-gray-600 capitalize">
                    {businessData.businessType} Business
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{businessData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{businessData.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    businessData.isVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {businessData.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">
                  {businessData.address}, {businessData.city}, {businessData.state} - {businessData.pincode}
                </p>
              </div>
              
              {businessData.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700">{businessData.description}</p>
                </div>
              )}
            </div>

            {/* Business Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Views</p>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                  <div className="text-3xl opacity-80">👁️</div>
                </div>
                <p className="text-blue-100 text-sm mt-2">+12% from last month</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Total Bookings</p>
                    <p className="text-2xl font-bold">89</p>
                  </div>
                  <div className="text-3xl opacity-80">📅</div>
                </div>
                <p className="text-green-100 text-sm mt-2">+8% from last month</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Revenue</p>
                    <p className="text-2xl font-bold">₹45,678</p>
                  </div>
                  <div className="text-3xl opacity-80">💰</div>
                </div>
                <p className="text-purple-100 text-sm mt-2">+15% from last month</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="font-semibold text-gray-800 text-lg">Manage Listings</h3>
                <p className="text-sm text-gray-600 mt-2">Update business information and details</p>
                <button 
                  onClick={() => handleNavigation('/business/listings')}
                  className="mt-4 bg-[#EB662B] text-white px-6 py-3 rounded-md text-sm hover:bg-[#d55a24] hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                >
                  Manage Listings
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="font-semibold text-gray-800 text-lg">Bookings</h3>
                <p className="text-sm text-gray-600 mt-2">View and manage customer bookings</p>
                <button 
                  onClick={() => handleNavigation('/business/bookings')}
                  className="mt-4 bg-[#EB662B] text-white px-6 py-3 rounded-md text-sm hover:bg-[#d55a24] hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                >
                  View Bookings
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">🔧</div>
                <h3 className="font-semibold text-gray-800 text-lg">Business Setup</h3>
                <p className="text-sm text-gray-600 mt-2">Configure business details and settings</p>
                <button 
                  onClick={() => handleNavigation('/business/setup')}
                  className="mt-4 bg-[#EB662B] text-white px-6 py-3 rounded-md text-sm hover:bg-[#d55a24] hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                >
                  Business Setup
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Recent Activity</h3>
                <button 
                  onClick={() => handleNavigation('/business/activity')}
                  className="text-[#EB662B] hover:text-[#d55a24] text-sm font-medium"
                >
                  View All →
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mr-3">🔔</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">New booking received</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mr-3">👁️</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Your listing was viewed 15 times</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mr-3">⭐</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">New review received (4.5 stars)</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                
                <div className="text-center pt-4">
                  <button 
                    onClick={() => handleNavigation('/business/notifications')}
                    className="text-[#EB662B] hover:text-[#d55a24] text-sm font-medium"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Unable to load business data
            </h2>
            <p className="text-gray-600 mb-4">
              There was an error loading your business information.
            </p>
            <button
              onClick={fetchBusinessData}
              className="bg-[#EB662B] text-white px-6 py-2 rounded-md hover:bg-[#d55a24] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard;
