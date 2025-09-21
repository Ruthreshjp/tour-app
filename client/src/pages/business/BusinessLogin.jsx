// src/pages/business/BusinessLogin.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const BusinessLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    loginCode: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post("/api/business/login", formData, {
        withCredentials: true,
      });
      if (response.data.success) {
        toast.success("Business login successful");
        navigate("/"); // Changed from /business/dashboard
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Business login error:", error);
      toast.error(error.response?.data?.message || "Business login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-3xl font-bold text-center mb-8">Business Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Login Code</label>
          <input
            type="text"
            name="loginCode"
            value={formData.loginCode}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            required
          />
        </div>
        <div className="flex flex-col items-center gap-4 mt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/business/signup" className="text-orange-500 hover:text-orange-600">
              Sign up here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default BusinessLogin;