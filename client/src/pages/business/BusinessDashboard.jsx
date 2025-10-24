import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { logout as businessLogout } from "../../redux/business/businessSlice";

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalBookings: 0,
    totalReviews: 0,
    averageRating: 0
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

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
        // Fetch analytics after business data is loaded
        fetchAnalytics();
        if (data.business?.businessType !== 'shopping') {
          fetchNotifications();
        } else {
          setNotifications([]);
        }
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

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const token = localStorage.getItem("businessToken");
      const res = await fetch("/api/analytics/business/analytics", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (data?.success) {
        setAnalytics(data.analytics);
      } else {
        console.error("Failed to fetch analytics:", data?.message);
        // Keep default values if fetch fails
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Keep default values if fetch fails
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("businessToken");
      const res = await fetch("/api/business/notifications", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (data?.success) {
        // Get only the 3 most recent notifications for dashboard
        setNotifications(data.notifications.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleLogout = () => {
    // Clear Redux business state
    dispatch(businessLogout());
    
    // Clear localStorage
    localStorage.removeItem("businessToken");
    localStorage.removeItem("businessData");
    
    // Trigger custom event for Header component to update
    window.dispatchEvent(new Event('businessLogout'));
    
    toast.success("Logged out successfully");
    
    // Navigate to login and force reload to ensure clean state
    navigate("/business/login");
    setTimeout(() => {
      window.location.reload();
    }, 100);
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

  const isShoppingBusiness = businessData?.businessType === 'shopping';

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
            <div className={`grid grid-cols-1 ${businessData.businessType === 'shopping' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => handleNavigation('/business/analytics/views')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Views</p>
                    <p className="text-2xl font-bold">{analyticsLoading ? '...' : analytics.totalViews.toLocaleString()}</p>
                  </div>
                  <div className="text-3xl opacity-80">👁️</div>
                </div>
                <p className="text-blue-100 text-sm mt-2">Click to view who viewed your business</p>
              </div>
              
              {businessData.businessType !== 'shopping' && (
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => handleNavigation('/business/analytics/bookings')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Total Bookings</p>
                      <p className="text-2xl font-bold">{analyticsLoading ? '...' : analytics.totalBookings.toLocaleString()}</p>
                    </div>
                    <div className="text-3xl opacity-80">📅</div>
                  </div>
                  <p className="text-green-100 text-sm mt-2">Click to view booking details</p>
                </div>
              )}
              
              <div 
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => handleNavigation('/business/analytics/ratings')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100">Rating</p>
                    <div className="flex items-center gap-1 mt-1">
                      <p className="text-2xl font-bold">{analyticsLoading ? '...' : analytics.averageRating.toFixed(1)}</p>
                      <div className="flex text-yellow-200">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= analytics.averageRating ? "text-yellow-200" : "text-yellow-300/50"}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-3xl opacity-80">⭐</div>
                </div>
                <p className="text-yellow-100 text-sm mt-2">Based on {analyticsLoading ? '...' : analytics.totalReviews} reviews</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`grid grid-cols-1 ${isShoppingBusiness ? 'md:grid-cols-1' : 'md:grid-cols-3'} gap-6`}>
              {!isShoppingBusiness && (
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
              )}

              {!isShoppingBusiness && (
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
              )}

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
            {!isShoppingBusiness && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Recent Activity</h3>
                  <button 
                    onClick={() => handleNavigation('/business/notifications')}
                    className="text-[#EB662B] hover:text-[#d55a24] text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>
                
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🔔</div>
                      <p className="text-gray-600 text-sm">No notifications yet</p>
                      <p className="text-gray-500 text-xs mt-1">New bookings and updates will appear here</p>
                    </div>
                  ) : (
                    notifications.map((notification, index) => {
                      const getIcon = (type) => {
                        const icons = {
                          booking: "🔔",
                          review: "⭐",
                          view: "👁️",
                          payment: "💳",
                          cancellation: "❌",
                        };
                        return icons[type] || "📢";
                      };

                      const formatTimeAgo = (date) => {
                        const now = new Date();
                        const notificationDate = new Date(date);
                        const diffInMs = now - notificationDate;
                        const diffInMinutes = Math.floor(diffInMs / 60000);
                        const diffInHours = Math.floor(diffInMinutes / 60);
                        const diffInDays = Math.floor(diffInHours / 24);

                        if (diffInMinutes < 1) return "Just now";
                        if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
                        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
                        if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
                        return notificationDate.toLocaleDateString();
                      };

                      return (
                        <div key={notification._id || index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="text-2xl mr-3">{getIcon(notification.type)}</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                            <p className="text-xs text-gray-500">{formatTimeAgo(notification.createdAt)}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  
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
            )}
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
