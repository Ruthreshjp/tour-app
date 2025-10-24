import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BusinessNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, bookings, reviews, views

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("businessToken");
      if (!token) {
        navigate("/business/login");
        return;
      }

      const res = await fetch("/api/business/notifications", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();

      if (data?.success) {
        setNotifications(data.notifications || []);
      } else {
        toast.error(data?.message || "Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Server error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      booking: "🔔",
      review: "⭐",
      view: "👁️",
      payment: "💳",
      cancellation: "❌",
    };
    return icons[type] || "📢";
  };

  const getNotificationColor = (type) => {
    const colors = {
      booking: "bg-blue-50 border-blue-200",
      review: "bg-yellow-50 border-yellow-200",
      view: "bg-green-50 border-green-200",
      payment: "bg-purple-50 border-purple-200",
      cancellation: "bg-red-50 border-red-200",
    };
    return colors[type] || "bg-gray-50 border-gray-200";
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

  const handleNotificationClick = (notification) => {
    if (notification.type === "booking" && notification.bookingId) {
      navigate("/business/bookings");
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true;
    return notif.type === filter || (filter === "bookings" && notif.type === "booking");
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF1DA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EB662B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/business/dashboard")}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                Notifications
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchNotifications}
                className="bg-[#EB662B] text-white px-4 py-2 rounded-md hover:bg-[#d55a24] transition-colors text-sm"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-[#EB662B] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("booking")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "booking"
                  ? "bg-[#EB662B] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Bookings ({notifications.filter((n) => n.type === "booking").length})
            </button>
            <button
              onClick={() => setFilter("review")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "review"
                  ? "bg-[#EB662B] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Reviews ({notifications.filter((n) => n.type === "review").length})
            </button>
            <button
              onClick={() => setFilter("payment")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "payment"
                  ? "bg-[#EB662B] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Payments ({notifications.filter((n) => n.type === "payment").length})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-md">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔔</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No Notifications
              </h2>
              <p className="text-gray-600">
                {filter === "all"
                  ? "You don't have any notifications yet. New bookings and updates will appear here."
                  : `No ${filter} notifications found.`}
              </p>
              <button
                onClick={() => navigate("/business/dashboard")}
                className="mt-6 bg-[#EB662B] text-white px-6 py-3 rounded-md hover:bg-[#d55a24] transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification, index) => (
                <div
                  key={notification._id || index}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-l-4 transition-all duration-200 ${getNotificationColor(
                    notification.type
                  )} ${
                    notification.type === "booking"
                      ? "cursor-pointer hover:shadow-md"
                      : ""
                  }`}
                >
                  <div className="flex items-start">
                    <div className="text-3xl mr-4 flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800 mb-1">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          {notification.details && (
                            <div className="text-xs text-gray-500 space-y-1">
                              {notification.details.customerName && (
                                <p>
                                  <span className="font-medium">Customer:</span>{" "}
                                  {notification.details.customerName}
                                </p>
                              )}
                              {notification.details.amount && (
                                <p>
                                  <span className="font-medium">Amount:</span> ₹
                                  {notification.details.amount}
                                </p>
                              )}
                              {notification.details.roomType && (
                                <p>
                                  <span className="font-medium">Room:</span>{" "}
                                  {notification.details.roomType}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      {notification.type === "booking" && (
                        <div className="mt-2">
                          <button className="text-xs text-[#EB662B] hover:text-[#d55a24] font-medium">
                            View Booking →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessNotifications;
