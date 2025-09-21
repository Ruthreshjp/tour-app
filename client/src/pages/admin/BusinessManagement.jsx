// src/pages/admin/BusinessManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BusinessManagement = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchApprovedBusinesses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/business/admin/businesses?status=approved", {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
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

  const handleSuspension = async (id, isSuspended) => {
    try {
      const response = await axios.put(
        `/api/business/admin/business/${id}/status`,
        { isSuspended },
        { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } }
      );
      if (response.data.success) {
        toast.success(`Business ${isSuspended ? "suspended" : "re-enabled"}`);
        fetchApprovedBusinesses();
      } else {
        toast.error(response.data.message || "Failed to update business");
      }
    } catch (error) {
      console.error("Update business error:", error);
      toast.error("Error updating business");
    }
  };

  const handlePermanentDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this business?")) {
      try {
        const response = await axios.delete(`/api/business/admin/business/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
        });
        if (response.data.success) {
          toast.success("Business permanently deleted");
          fetchApprovedBusinesses();
        } else {
          toast.error(response.data.message || "Failed to delete business");
        }
      } catch (error) {
        console.error("Delete business error:", error);
        toast.error("Error deleting business");
      }
    }
  };

  useEffect(() => {
    fetchApprovedBusinesses();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Businesses</h2>
      {loading ? (
        <p>Loading...</p>
      ) : businesses.length === 0 ? (
        <p>No approved businesses.</p>
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
              <p>Login Code: {business.loginCode}</p>
              <p>Status: {business.isSuspended ? "Suspended" : "Active"}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleSuspension(business._id, !business.isSuspended)}
                  className={`px-4 py-2 ${
                    business.isSuspended ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"
                  } text-white rounded-md`}
                >
                  {business.isSuspended ? "Allow" : "Stop Temporarily"}
                </button>
                <button
                  onClick={() => handlePermanentDelete(business._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Decline Permanently
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessManagement;