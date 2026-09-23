import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, loginSuccess, setError, clearError } from "../../redux/business/businessSlice.js";
import { logOutSuccess } from "../../redux/user/userSlice.js";
import { Image } from '../../components/Image';
import { API_BASE } from "../../utils/apiBase";

const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const BusinessLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.business);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Email and password are required!");
      return;
    }

    try {
      dispatch(setLoading(true));
      
      // Clear any existing customer session before business login
      dispatch(logOutSuccess());
      localStorage.removeItem("userToken");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("persist:root");
      
      const res = await fetch(`${API_BASE}/api/business/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const data = await res.json();
      
      if (data?.success) {
        dispatch(loginSuccess(data?.business));
        localStorage.setItem("businessToken", data.token);
        localStorage.setItem("businessData", JSON.stringify(data.business));
        toast.success("Business login successful!");
        navigate("/business/dashboard");
      } else {
        dispatch(setError(data?.message));
        toast.error(data?.message || "Login failed");
      }
    } catch (error) {
      console.error("Business Login error:", error);
      dispatch(setError("Server error occurred"));
      toast.error("Server error occurred. Please try again later.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="w-full mx-auto min-h-screen flex justify-center items-center bg-[#FFF1DA] p-4">
      <div className="rounded-2xl w-full max-w-4xl bg-white shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Banner */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#6358DC] to-[#4A3EBE] p-8 flex flex-col items-center justify-center text-white text-center">
          <Image src="/images/login.png" alt="Business Login" className="max-h-[220px] mb-6 object-contain" />
          <h2 className="text-2xl font-bold mb-2">Partner Portal</h2>
          <p className="text-indigo-100 text-sm max-w-xs">
            Manage your listings, bookings, inventory, and analytics in one place.
          </p>
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Business Login</h1>
          <p className="text-sm text-gray-500 mb-6">Enter your email and password to access your dashboard</p>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold text-sm mb-1">Business Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 outline-none focus:border-[#EB662B] focus:bg-white transition-all text-sm"
                placeholder="hotel@tourapp.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold text-sm mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 outline-none focus:border-[#EB662B] focus:bg-white transition-all text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit"
              className={`w-full py-3.5 mt-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center text-white shadow-md ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-[#EB662B] hover:bg-[#d55a24] hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span>Logging In...</span>
                </>
              ) : (
                "Login to Dashboard"
              )}
            </button>

            <div className="text-center pt-2 text-sm text-gray-600">
              Don't have a business account?{" "}
              <Link to="/business/register" className="text-[#EB662B] font-bold hover:underline">
                Register Business
              </Link>
            </div>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-gray-500 hover:text-[#EB662B] transition-colors">
                ← Back to Customer Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessLogin;
