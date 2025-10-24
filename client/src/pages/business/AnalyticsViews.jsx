import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft, FaEye, FaUser, FaEnvelope, FaCalendarAlt, FaSearch } from "react-icons/fa";

const AnalyticsViews = () => {
  const navigate = useNavigate();
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalViews, setTotalViews] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchViews();
  }, [currentPage, searchTerm]);

  const fetchViews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("businessToken");
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm })
      });

      const res = await fetch(`/api/analytics/business/views?${params}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();

      if (data?.success) {
        setViews(data.views);
        setTotalPages(data.pagination.totalPages);
        setTotalViews(data.pagination.totalViews);
        setHasMore(data.pagination.hasMore);
      } else {
        toast.error("Failed to fetch views data");
        if (data?.message === "Unauthorized") {
          navigate("/business/login");
        }
      }
    } catch (error) {
      console.error("Error fetching views:", error);
      toast.error("Server error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchViews();
  };

  const getSourceIcon = (source) => {
    const icons = {
      search: "🔍",
      nearby: "📍",
      category: "📂",
      direct: "🔗"
    };
    return icons[source] || "👁️";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#FFF1DA]">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/business/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FaArrowLeft />
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                <span className="text-[#6358DC]">Business Views Analytics</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FaEye className="text-2xl text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">Views Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{totalViews.toLocaleString()}</p>
              <p className="text-sm text-blue-700">Total Views</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{views.length}</p>
              <p className="text-sm text-green-700">Views This Page</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{currentPage}</p>
              <p className="text-sm text-purple-700">Current Page</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {/* Views List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent Views</h3>
            <p className="text-sm text-gray-600 mt-1">People who viewed your business listing</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading views...</p>
            </div>
          ) : views.length === 0 ? (
            <div className="p-8 text-center">
              <FaEye className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500">No views found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm ? "Try adjusting your search terms" : "Views will appear here when customers visit your business"}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {views.map((view, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{view.userName}</h4>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {getSourceIcon(view.source)} {view.source}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <FaEnvelope className="text-xs" />
                              <span>{view.userEmail}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <FaCalendarAlt className="text-xs" />
                              <span>{formatDate(view.viewedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages} ({totalViews} total views)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={!hasMore}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsViews;
