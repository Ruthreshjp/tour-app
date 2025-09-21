import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const BusinessApprovals = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPendingBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No admin token found. Please log in again.");
      }
      console.log("Sending request with token:", token.substring(0, 20) + "..."); // Debug log (partial token for security)
      const response = await axios.get("/api/business/admin/businesses?status=pending", {
        withCredentials: true,
      });
      console.log("Raw API response:", response.data); // Debug log
      console.log("Businesses received:", response.data.businesses); // Debug log
      if (response.data.success) {
        const pendingBusinesses = response.data.businesses || [];
        setBusinesses(pendingBusinesses);
        if (pendingBusinesses.length === 0) {
          console.log("No pending businesses in response.");
        }
      } else {
        setError(response.data.message || "Failed to fetch businesses");
        toast.error(response.data.message || "Failed to fetch businesses");
      }
    } catch (error) {
      console.error("Fetch pending businesses error:", error);
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

  const handleApproval = async (id, status) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No admin token found. Please log in again.");
      }
      const response = await axios.put(
        `/api/business/admin/business/${id}/status`,
        { status },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(`Business ${status === "approved" ? "approved" : "rejected"}`);
        fetchPendingBusinesses();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Update business status error:", error);
      const message = error.response?.data?.message || "Error updating business status";
      toast.error(message);
      if (message.includes("token") || error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("adminToken");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchPendingBusinesses();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Business Approvals</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : !Array.isArray(businesses) || businesses.length === 0 ? (
        <p>No pending business approvals.</p>
      ) : (
        <div className="space-y-4">
          {businesses.map((business) => (
            <div key={business._id} className="border p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold">{business.organization_name}</h3>
              <p>Type: {business.business_type}</p>
              <p>Email: {business.email}</p>
              <p>Phone: {business.phone}</p>
              <p>Address: {business.address}</p>
              <p>Description: {business.description}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleApproval(business._id, "approved")}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Admit
                </button>
                <button
                  onClick={() => handleApproval(business._id, "rejected")}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessApprovals;