// src/pages/business/BusinessSignup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const businessTypes = [
  { value: "hotel", label: "Hotel" },
  { value: "restaurant", label: "Restaurant" },
  { value: "shopping", label: "Shopping Center" },
  { value: "cab", label: "Cab Service" },
  { value: "cafe", label: "Cafe" },
];

const BusinessSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organization_name: "",
    business_type: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.organization_name || formData.organization_name.length < 2) {
      newErrors.organization_name = "Organization name must be at least 2 characters long";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (!formData.address || formData.address.length < 5) {
      newErrors.address = "Address must be at least 5 characters long";
    }
    if (!formData.business_type) {
      newErrors.business_type = "Please select a business type";
    }
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    setErrors({});
    if (!validateForm()) {
      console.log("Validation errors:", errors);
      toast.error("Please fix the validation errors before submitting");
      return;
    }
    try {
      setLoading(true);
      console.log("Sending request to /api/business/signup");
      const response = await axios.post("/api/business/signup", formData);
      console.log("Response:", response.data);
      if (response.data.success) {
        setSubmitted(true);
        toast.success("Business registration submitted for approval. Please check your email.");
      } else {
        toast.error(response.data.message || "Registration failed");
        if (response.data.errors) {
          setErrors(response.data.errors);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || "Registration failed";
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full min-h-screen py-8 px-4 bg-[#FFF1DA] flex items-center justify-center">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Registration Submitted</h2>
          <p className="text-lg text-gray-600">
            Waiting for the admin to admit your business. You will receive an email with a login code once approved.
          </p>
          <Link
            to="/business-login"
            className="mt-4 inline-block px-8 py-3 bg-[#EB662B] text-white rounded-md hover:opacity-90"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-8 px-4 bg-[#FFF1DA]">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Business Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Organization Name</label>
              <input
                type="text"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 ${
                  errors.organization_name ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.organization_name && (
                <p className="mt-1 text-sm text-red-500">{errors.organization_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Type</label>
              <select
                name="business_type"
                value={formData.business_type}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 ${
                  errors.business_type ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="">Select Type</option>
                {businessTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.business_type && (
                <p className="mt-1 text-sm text-red-500">{errors.business_type}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Business Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-[#EB662B] text-white rounded-md hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register Business"}
            </button>
            <p className="text-gray-600">
              Already have a business account?{" "}
              <Link to="/business-login" className="text-[#EB662B] hover:opacity-90">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessSignup;