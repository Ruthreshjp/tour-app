import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure, clearLoading } from "../../redux/user/userSlice.js";
// Using public directory path instead of asset import
import { Image } from '../../components/Image';

const BusinessRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((state) => state.user);
  
  // Clear any persistent loading state on component mount
  useEffect(() => {
    dispatch(clearLoading());
  }, [dispatch]);
  
  const [formData, setFormData] = useState({
    businessName: "",
    email: location.state?.email || "",
    phone: "",
    businessType: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    description: "",
  });

  const businessTypes = [
    { value: "hotel", label: "Hotel", icon: "🏨" },
    { value: "restaurant", label: "Restaurant", icon: "🍽️" },
    { value: "cafe", label: "Cafe", icon: "☕" },
    { value: "cab", label: "Cab Service", icon: "🚗" },
    { value: "shopping", label: "Shopping", icon: "🛍️" },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBusinessTypeSelect = (type) => {
    setFormData({
      ...formData,
      businessType: type,
    });
  };

  const validateForm = () => {
    if (!formData.businessName.trim()) {
      toast.error("Business name is required!");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required!");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required!");
      return false;
    }
    if (!formData.businessType) {
      toast.error("Please select a business type!");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required!");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("Address is required!");
      return false;
    }
    if (!formData.city.trim()) {
      toast.error("City is required!");
      return false;
    }
    if (!formData.state.trim()) {
      toast.error("State is required!");
      return false;
    }
    if (!formData.pincode.trim()) {
      toast.error("Pincode is required!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      dispatch(loginStart());
      const res = await fetch("/api/business/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (data?.success) {
        toast.success("Business registered successfully! Please check your email for verification.");
        // Redirect to login page
        navigate("/business/login");
      } else {
        dispatch(loginFailure(data?.message));
        toast.error(data?.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      dispatch(loginFailure("Server error occurred"));
      toast.error("Server error occurred. Please try again later.");
    }
  };

  return (
    <div className="w-full mx-auto min-h-screen flex justify-center items-center bg-[#FFF1DA] py-8">
      <div className="w-full flex items-center justify-center bg-[#FFF1DA]">
        <div className="rounded-md w-[95%] bg-white md:w-[80%] lg:w-[70%] mx-auto flex flex-col gap-6">
          <h1 className="text-center text-lg mt-6 font-medium md:text-3xl md:font-bold text-gray-800">
            Register Your Business with <span className="text-[#6358DC]">Travel-Zone</span>
          </h1>
          
          <div className="flex flex-col lg:flex-row gap-8 rounded-md items-start justify-center p-6">
            <div className="w-full lg:w-1/3 flex justify-center">
              <Image src="/images/login.png" alt="Business Registration" className="max-h-[300px]" />
            </div>
            
            <form onSubmit={handleSubmit} className="w-full lg:w-2/3 space-y-6">
              {/* Business Type Selection */}
              <div>
                <label className="block text-gray-700 font-medium mb-3">Select Business Type *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {businessTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleBusinessTypeSelect(type.value)}
                      className={`p-4 border-2 rounded-lg text-center transition-all hover:shadow-md ${
                        formData.businessType === type.value
                          ? 'border-[#EB662B] bg-[#EB662B] text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-[#EB662B]'
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-medium text-sm">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Business Name *</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md bg-gray-50 outline-none focus:border-[#EB662B] focus:bg-white transition-colors"
                    placeholder="Your Business Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Business Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md bg-gray-50 outline-none focus:border-[#EB662B] focus:bg-white transition-colors"
                    placeholder="business@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-md bg-gray-50 outline-none focus:border-[#EB662B] focus:bg-white transition-colors"
                  placeholder="+91 9876543210"
                  required
                />
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md bg-gray-50 outline-none focus:border-[#EB662B] focus:bg-white transition-colors"
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md bg-gray-50 outline-none focus:border-[#EB662B] focus:bg-white transition-colors"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              {/* Address Information */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Business Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-3 border rounded-md bg-gray-50 outline-none focus:border-[#EB662B] focus:bg-white transition-colors resize-none"
                  placeholder="Complete business address"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md bg-gray-50 outline-none focus:border-[#EB662B] focus:bg-white transition-colors"
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md bg-gray-50 outline-none focus:border-[#EB662B] focus:bg-white transition-colors"
                    placeholder="State"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-md bg-gray-50 outline-none focus:border-[#EB662B] focus:bg-white transition-colors"
                    placeholder="123456"
                    required
                  />
                </div>
              </div>

              {/* Business Description */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Business Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 border rounded-md bg-gray-50 outline-none focus:border-[#EB662B] focus:bg-white transition-colors resize-none"
                  placeholder="Tell us about your business (optional)"
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                className="w-full bg-[#EB662B] text-white p-4 rounded-md hover:bg-[#d55a24] transition-colors font-medium text-lg"
                disabled={loading}
              >
                {loading ? "Registering Business..." : "Register Business"}
              </button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  Already have a business account?{" "}
                  <Link to="/business/login" className="text-[#EB662B] hover:underline font-medium">
                    Login Here
                  </Link>
                </p>
              </div>
            </form>
          </div>
          
          <div className="text-center pb-6">
            <Link to="/login" className="text-gray-600 hover:text-[#EB662B] text-sm">
              ← Back to Customer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessRegister;
