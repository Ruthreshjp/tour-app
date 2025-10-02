import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const BusinessApprovals = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No admin token found. Please log in again.");
      }

      const response = await axios.get("/api/business/admin/businesses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.data.success) {
        setBusinesses(response.data.businesses || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch businesses");
      }
    } catch (error) {
      console.error("Fetch businesses error:", error);
      const message = error.response?.data?.message || error.message || "Error fetching businesses";
      setError(message);
      toast.error(message);
      if (message.includes("token") || error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("adminToken");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (businessId, action) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No admin token found. Please log in again.");
      }

      const response = await axios.put(
        `/api/business/admin/businesses/${businessId}/status`,
        { 
          isVerified: action === 'approve',
          isActive: action === 'approve'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success(`Business ${action === 'approve' ? 'approved' : 'declined'} successfully`);
        fetchBusinesses(); // Refresh the list
      } else {
        throw new Error(response.data.message || `Failed to ${action} business`);
      }
    } catch (error) {
      console.error(`Business ${action} error:`, error);
      const message = error.response?.data?.message || error.message || `Error ${action}ing business`;
      setError(message);
      toast.error(message);
      if (message.includes("token") || error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("adminToken");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (businessId, action) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No admin token found. Please log in again.");
      }

      const response = await axios.put(
        `/api/business/admin/businesses/${businessId}/status`,
        { 
          isActive: action === 'reactivate'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success(`Business ${action}d successfully`);
        fetchBusinesses(); // Refresh the list
      } else {
        throw new Error(response.data.message || `Failed to ${action} business`);
      }
    } catch (error) {
      console.error(`Business status toggle error:`, error);
      const message = error.response?.data?.message || error.message || `Error updating business status`;
      setError(message);
      toast.error(message);
      if (message.includes("token") || error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("adminToken");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (businessId, businessName) => {
    if (!window.confirm(`Are you sure you want to delete "${businessName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No admin token found. Please log in again.");
      }

      const response = await axios.delete(
        `/api/business/admin/businesses/${businessId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Business deleted successfully");
        fetchBusinesses(); // Refresh the list
      } else {
        throw new Error(response.data.message || "Failed to delete business");
      }
    } catch (error) {
      console.error("Business delete error:", error);
      const message = error.response?.data?.message || error.message || "Error deleting business";
      setError(message);
      toast.error(message);
      if (message.includes("token") || error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("adminToken");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Business Management</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          <h3 className="text-xl font-semibold mb-3">Pending Approvals</h3>
          <div className="grid gap-4 mb-8">
            {businesses.filter(business => !business.isVerified).map((business) => (
              <div key={business._id} className="border p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-lg">{business.businessName}</h4>
                  <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                    {business.businessType}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  <p><strong>Email:</strong> {business.email}</p>
                  <p><strong>Phone:</strong> {business.phone}</p>
                  <p><strong>City:</strong> {business.city}, {business.state}</p>
                  <p><strong>Pincode:</strong> {business.pincode}</p>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>Address:</strong> {business.address}
                </p>
                {business.description && (
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Description:</strong> {business.description}
                  </p>
                )}
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <span>Registered: {new Date(business.createdAt).toLocaleDateString()}</span>
                  <span className="ml-4">Email Verified: {business.emailVerified ? '✅' : '❌'}</span>
                </div>
                <div className="mt-4 space-x-2">
                  <button
                    onClick={() => handleApproval(business._id, 'approve')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                    disabled={loading}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(business._id, 'decline')}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                    disabled={loading}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
            {businesses.filter(business => !business.isVerified).length === 0 && (
              <p className="text-gray-500 text-center py-8">No pending business approvals.</p>
            )}
          </div>

          <h3 className="text-xl font-semibold mb-3">Approved Businesses</h3>
          <div className="grid gap-4">
            {businesses.filter(business => business.isVerified).map((business) => (
              <div key={business._id} className="border p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-lg">{business.businessName}</h4>
                  <div className="flex gap-2">
                    <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {business.businessType}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      business.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {business.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  <p><strong>Email:</strong> {business.email}</p>
                  <p><strong>Phone:</strong> {business.phone}</p>
                  <p><strong>Location:</strong> {business.city}, {business.state}</p>
                  <p><strong>Total Bookings:</strong> {business.totalBookings || 0}</p>
                </div>
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <span>Approved: {new Date(business.updatedAt).toLocaleDateString()}</span>
                  <span className="ml-4">Rating: {business.rating || 0}/5 ({business.totalReviews || 0} reviews)</span>
                </div>
                <div className="mt-4 space-x-2">
                  <button
                    onClick={() => handleStatusToggle(business._id, business.isActive ? 'suspend' : 'reactivate')}
                    className={`${
                      business.isActive 
                        ? 'bg-yellow-500 hover:bg-yellow-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white px-4 py-2 rounded disabled:opacity-50`}
                    disabled={loading}
                  >
                    {business.isActive ? 'Suspend' : 'Reactivate'}
                  </button>
                  <button
                    onClick={() => handleDelete(business._id, business.businessName)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {businesses.filter(business => business.isVerified).length === 0 && (
              <p className="text-gray-500 text-center py-8">No approved businesses.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessApprovals;