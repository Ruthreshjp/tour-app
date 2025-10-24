// src/pages/admin/BusinessManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BusinessManagement = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessStats, setBusinessStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchApprovedBusinesses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/business/admin/businesses", {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
        withCredentials: true
      });
      if (response.data.success) {
        setBusinesses(response.data.businesses);
      } else {
        toast.error(response.data.message || "Failed to fetch businesses");
      }
    } catch (error) {
      console.error("Fetch approved businesses error:", error);
      toast.error("Error fetching businesses");
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessStats = async (businessId) => {
    try {
      setStatsLoading(true);
      const response = await axios.get(`/api/business/admin/businesses/${businessId}/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
        withCredentials: true
      });
      if (response.data.success) {
        setBusinessStats(response.data.stats);
      } else {
        toast.error(response.data.message || "Failed to fetch business stats");
      }
    } catch (error) {
      console.error("Fetch business stats error:", error);
      toast.error("Error fetching business statistics");
    } finally {
      setStatsLoading(false);
    }
  };

  const handleBusinessClick = (business) => {
    setSelectedBusiness(business);
    fetchBusinessStats(business._id);
  };

  const closeModal = () => {
    setSelectedBusiness(null);
    setBusinessStats(null);
  };

  const handleSuspend = async (id) => {
    if (window.confirm("Are you sure you want to suspend this business temporarily?\n\nThe business will be hidden from all listings but data will be preserved.")) {
      try {
        const response = await axios.put(
          `/api/business/admin/businesses/${id}/status`,
          { isActive: false },
          { 
            headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
            withCredentials: true
          }
        );
        if (response.data.success) {
          toast.success("Business suspended successfully");
          fetchApprovedBusinesses();
          closeModal();
        } else {
          toast.error(response.data.message || "Failed to suspend business");
        }
      } catch (error) {
        console.error("Suspend business error:", error);
        toast.error(error.response?.data?.message || "Error suspending business");
      }
    }
  };

  const handleReactivate = async (id) => {
    if (window.confirm("Are you sure you want to reactivate this business?\n\nThe business will be visible in all listings again.")) {
      try {
        const response = await axios.put(
          `/api/business/admin/businesses/${id}/status`,
          { isActive: true },
          { 
            headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
            withCredentials: true
          }
        );
        if (response.data.success) {
          toast.success("Business reactivated successfully");
          fetchApprovedBusinesses();
          closeModal();
        } else {
          toast.error(response.data.message || "Failed to reactivate business");
        }
      } catch (error) {
        console.error("Reactivate business error:", error);
        toast.error(error.response?.data?.message || "Error reactivating business");
      }
    }
  };

  const handlePermanentDelete = async (id) => {
    const confirmMessage = "⚠️ PERMANENT ACTION ⚠️\n\nAre you absolutely sure you want to PERMANENTLY DELETE this business?\n\nThis will:\n- Remove all business data\n- Delete all bookings\n- Remove from all listings\n- Cannot be undone\n\nType 'DELETE' to confirm:";
    
    const userInput = window.prompt(confirmMessage);
    
    if (userInput === "DELETE") {
      try {
        const response = await axios.delete(`/api/business/admin/businesses/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
          withCredentials: true
        });
        if (response.data.success) {
          toast.success("Business permanently deleted");
          fetchApprovedBusinesses();
          closeModal();
        } else {
          toast.error(response.data.message || "Failed to delete business");
        }
      } catch (error) {
        console.error("Delete business error:", error);
        toast.error(error.response?.data?.message || "Error deleting business");
      }
    } else if (userInput !== null) {
      toast.error("Deletion cancelled. You must type 'DELETE' to confirm.");
    }
  };

  useEffect(() => {
    fetchApprovedBusinesses();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Businesses</h2>
      {loading ? (
        <p className="text-center py-8">Loading businesses...</p>
      ) : businesses.length === 0 ? (
        <p className="text-center py-8 text-gray-500">No businesses found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((business) => (
            <div 
              key={business._id} 
              className="border-2 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer hover:border-blue-500"
              onClick={() => handleBusinessClick(business)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-blue-600">{business.businessName}</h3>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  business.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {business.isActive ? 'Active' : 'Suspended'}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <p><strong>Type:</strong> {business.businessType}</p>
                <p><strong>Email:</strong> {business.email}</p>
                <p><strong>Phone:</strong> {business.phone || 'N/A'}</p>
                <p><strong>Location:</strong> {business.city}, {business.state}</p>
                <p className="text-xs text-gray-500 mt-2">📊 Click to view business overview</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-600">{selectedBusiness.businessName}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Business Type</p>
                    <p className="font-semibold">{selectedBusiness.businessType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`font-semibold ${selectedBusiness.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedBusiness.isActive ? '✓ Active' : '✗ Suspended'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{selectedBusiness.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{selectedBusiness.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold">{selectedBusiness.city}, {selectedBusiness.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Registered Date</p>
                    <p className="font-semibold">{new Date(selectedBusiness.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {statsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2">Loading statistics...</p>
                </div>
              ) : businessStats ? (
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Business Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-100 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 font-semibold">Total Bookings</p>
                      <p className="text-3xl font-bold text-blue-600">{businessStats.totalBookings || 0}</p>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg">
                      <p className="text-sm text-green-800 font-semibold">Total Revenue</p>
                      <p className="text-3xl font-bold text-green-600">₹{(businessStats.totalRevenue || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-purple-100 p-4 rounded-lg">
                      <p className="text-sm text-purple-800 font-semibold">Pending Payments</p>
                      <p className="text-3xl font-bold text-purple-600">₹{(businessStats.pendingPayments || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3">Booking Status</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                        <p className="text-xs text-yellow-800">Pending</p>
                        <p className="text-xl font-bold text-yellow-600">{businessStats.pendingBookings || 0}</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 p-3 rounded">
                        <p className="text-xs text-green-800">Confirmed</p>
                        <p className="text-xl font-bold text-green-600">{businessStats.confirmedBookings || 0}</p>
                      </div>
                      <div className="bg-red-50 border border-red-200 p-3 rounded">
                        <p className="text-xs text-red-800">Cancelled</p>
                        <p className="text-xl font-bold text-red-600">{businessStats.cancelledBookings || 0}</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 p-3 rounded">
                        <p className="text-xs text-gray-800">Completed</p>
                        <p className="text-xl font-bold text-gray-600">{businessStats.completedBookings || 0}</p>
                      </div>
                    </div>
                  </div>
                  {businessStats.recentBookings && businessStats.recentBookings.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Recent Bookings</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="p-2 text-left">Customer</th>
                              <th className="p-2 text-left">Date</th>
                              <th className="p-2 text-left">Amount</th>
                              <th className="p-2 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {businessStats.recentBookings.map((booking, i) => (
                              <tr key={i} className="border-b">
                                <td className="p-2">{booking.customerName}</td>
                                <td className="p-2">{new Date(booking.date).toLocaleDateString('en-IN')}</td>
                                <td className="p-2 font-semibold">₹{booking.amount.toLocaleString('en-IN')}</td>
                                <td className="p-2">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No statistics available</p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t">
                <h4 className="text-lg font-semibold mb-3 text-gray-800">Admin Actions</h4>
                <div className="flex gap-3 flex-wrap">
                  {selectedBusiness.isActive ? (
                    <button
                      onClick={() => handleSuspend(selectedBusiness._id)}
                      className="flex-1 min-w-[200px] px-6 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition-colors shadow-md hover:shadow-lg"
                    >
                      ⏸️ Suspend Business
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivate(selectedBusiness._id)}
                      className="flex-1 min-w-[200px] px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors shadow-md hover:shadow-lg"
                    >
                      ▶️ Reactivate Business
                    </button>
                  )}
                  <button
                    onClick={() => handlePermanentDelete(selectedBusiness._id)}
                    className="flex-1 min-w-[200px] px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors shadow-md hover:shadow-lg"
                  >
                    🗑️ Delete Permanently
                  </button>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  {selectedBusiness.isActive ? (
                    <p className="text-xs text-gray-600">
                      <strong>Suspend Business:</strong> Temporarily pause this business. It will be hidden from all listings but all data will be preserved. You can reactivate it anytime in the future.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-600">
                      <strong>Reactivate Business:</strong> Resume this suspended business. It will become visible in all listings again and can receive new bookings.
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    <strong>Delete Permanently:</strong> Irreversible action. All business data, bookings, and listings will be permanently removed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessManagement;