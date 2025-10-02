import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, loginSuccess, setError, clearError } from "../../redux/business/businessSlice.js";
// Using public directory path instead of asset import
import { Image } from '../../components/Image';

// Loading Spinner Component
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
    loginCode: "",
    password: "",
  });
  
  const [step, setStep] = useState(1); // 1: Email, 2: Login Code, 3: Password

  // Clear any persistent loading state on component mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Email is required!");
      return;
    }

    try {
      dispatch(setLoading(true));
      const res = await fetch("http://localhost:8000/api/business/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email: formData.email }),
      });
      
      const data = await res.json();
      
      if (data?.success) {
        if (data.exists) {
          if (data.approved) {
            // Business exists and is approved, send login code
            const codeRes = await fetch("http://localhost:8000/api/business/send-login-code", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ email: formData.email }),
            });
            
            const codeData = await codeRes.json();
            if (codeData?.success) {
              toast.success("Login code sent to your email!");
              setStep(2);
            } else {
              toast.error(codeData?.message || "Failed to send login code");
            }
          } else {
            // Business exists but not approved yet
            toast.warning("Your business registration is under review. Please wait for admin approval.");
          }
        } else {
          // Business doesn't exist, redirect to registration
          toast.info("Business not registered. Please register first.");
          navigate("/business/register", { state: { email: formData.email } });
        }
      } else {
        toast.error(data?.message || "Failed to check email");
      }
    } catch (error) {
      console.error("Email check error:", error);
      toast.error("Server error occurred. Please try again later.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (!formData.loginCode) {
      toast.error("Login code is required!");
      return;
    }

    try {
      dispatch(setLoading(true));
      const res = await fetch("http://localhost:8000/api/business/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          email: formData.email, 
          loginCode: formData.loginCode 
        }),
      });
      
      const data = await res.json();
      
      if (data?.success) {
        toast.success("Code verified! Please enter your password.");
        setStep(3);
      } else {
        toast.error(data?.message || "Invalid login code");
      }
    } catch (error) {
      console.error("Code verification error:", error);
      toast.error("Server error occurred. Please try again later.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password) {
      toast.error("Password is required!");
      return;
    }

    try {
      dispatch(setLoading(true));
      const res = await fetch("http://localhost:8000/api/business/login", {
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
      console.error("Login error:", error);
      dispatch(setError("Server error occurred"));
      toast.error("Server error occurred. Please try again later.");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleEmailSubmit} className="w-full md:w-1/2 px-4">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Business Login</h2>
              <p className="text-gray-600 text-sm">Enter your business email to continue</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Business Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-2 p-3 border rounded-md bg-gray-50 outline-none focus:border-[#EB662B] focus:bg-white transition-colors"
                placeholder="your-business@example.com"
                required
              />
            </div>
            <button 
              type="submit"
              className={`w-full p-3 mt-6 rounded-md transition-all duration-300 flex items-center justify-center font-medium ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-[#EB662B] hover:bg-[#d55a24] hover:shadow-lg transform hover:scale-[1.02]"
              } text-white`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span>Checking Email...</span>
                </>
              ) : (
                "Continue"
              )}
            </button>
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Don't have a business account?{" "}
                <Link to="/business/register" className="text-[#EB662B] hover:underline font-medium">
                  Register Business
                </Link>
              </p>
            </div>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleCodeSubmit} className="w-full md:w-1/2 px-4">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Enter Login Code</h2>
              <p className="text-gray-600 text-sm mb-2">
                Enter the permanent login code provided by admin when your business was approved.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                <p className="text-blue-700 text-xs">
                  💡 <strong>Note:</strong> This is the same code you received via email when your business was approved by admin. Use this code for all future logins.
                </p>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Login Code</label>
              <input
                type="text"
                name="loginCode"
                value={formData.loginCode}
                onChange={handleChange}
                className="w-full mt-2 p-3 border rounded-md bg-gray-50 outline-none focus:border-[#EB662B] focus:bg-white transition-colors text-center text-lg tracking-widest"
                placeholder="Enter 6-digit code"
                maxLength="6"
                required
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-500 text-white p-3 rounded-md hover:bg-gray-600 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 font-medium"
              >
                ← Back
              </button>
              <button 
                type="submit"
                className={`flex-1 p-3 rounded-md transition-all duration-300 flex items-center justify-center font-medium ${
                  loading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-[#EB662B] hover:bg-[#d55a24] hover:shadow-lg transform hover:scale-[1.02]"
                } text-white`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  "Verify Code"
                )}
              </button>
            </div>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handlePasswordSubmit} className="w-full md:w-1/2 px-4">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Enter Password</h2>
              <p className="text-gray-600 text-sm">
                Please enter your business account password
              </p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full mt-2 p-3 border rounded-md bg-gray-50 outline-none focus:border-[#EB662B] focus:bg-white transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-500 text-white p-3 rounded-md hover:bg-gray-600 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 font-medium"
              >
                ← Back
              </button>
              <button 
                type="submit"
                className={`flex-1 p-3 rounded-md transition-all duration-300 flex items-center justify-center font-medium ${
                  loading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-[#EB662B] hover:bg-[#d55a24] hover:shadow-lg transform hover:scale-[1.02]"
                } text-white`}
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
            </div>
            <div className="mt-4 text-center">
              <Link to="/business/forgot-password" className="text-[#EB662B] hover:underline text-sm">
                Forgot Password?
              </Link>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full mx-auto h-screen flex justify-center items-center bg-[#FFF1DA]">
      <div className="w-full min-h-screen flex items-center justify-center bg-[#FFF1DA]">
        <div className="rounded-md w-[85%] bg-white md:w-[50%] lg:w-[40%] mx-auto flex flex-col gap-6">
          <h1 className="text-center text-lg mt-6 font-medium md:text-3xl md:font-bold text-gray-800">
            Welcome to <span className="text-[#6358DC]">Travel-Zone</span>
          </h1>
          
          {/* Progress indicator */}
          <div className="px-6">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-[#EB662B] text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step > stepNumber ? 'bg-[#EB662B]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
              <span>Email</span>
              <span>Code</span>
              <span>Password</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-5 h-auto md:h-[450px] rounded-md items-center justify-center p-4">
            <div className="w-full md:w-1/2 flex justify-center">
              <Image src="/images/login.png" alt="Business Login" className="max-h-[300px]" />
            </div>
            {renderStepContent()}
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

export default BusinessLogin;
