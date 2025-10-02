import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import HotelListingManager from "./listings/HotelListingManager";
import RestaurantListingManager from "./listings/RestaurantListingManager";
import CabListingManager from "./listings/CabListingManager";
import CafeListingManager from "./listings/CafeListingManager";
import ShoppingListingManager from "./listings/ShoppingListingManager";

const BusinessListings = () => {
  const navigate = useNavigate();
  const { currentBusiness } = useSelector((state) => state.business || {});
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("businessToken");
    if (!token) {
      navigate("/business/login");
      return;
    }
    
    // Use Redux data if available, otherwise fetch from API
    if (currentBusiness) {
      setBusinessData(currentBusiness);
      setLoading(false);
    } else {
      fetchBusinessData();
    }
  }, [navigate, currentBusiness]);

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
          navigate("/business/login");
        }
      }
    } catch (error) {
      console.error("Error fetching business data:", error);
      toast.error("Server error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEditListing = () => {
    navigate("/business/setup");
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
          <p className="mt-4 text-gray-600">Loading listings...</p>
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
              <button
                onClick={() => navigate("/business/dashboard")}
                className="mr-4 text-[#EB662B] hover:text-[#d55a24] font-medium"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                Manage Business Listings
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {businessData ? (
          <div>
            {/* Route to specific listing manager based on business type */}
            {businessData.businessType === 'hotel' && (
              <HotelListingManager businessData={businessData} />
            )}
            {businessData.businessType === 'restaurant' && (
              <RestaurantListingManager businessData={businessData} />
            )}
            {businessData.businessType === 'cafe' && (
              <CafeListingManager businessData={businessData} />
            )}
            {businessData.businessType === 'cab' && (
              <CabListingManager businessData={businessData} />
            )}
            {businessData.businessType === 'shopping' && (
              <ShoppingListingManager businessData={businessData} />
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

export default BusinessListings;
