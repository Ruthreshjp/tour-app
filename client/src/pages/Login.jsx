// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginStart, loginSuccess, loginFailure, clearLoading } from "../redux/user/userSlice.js";
import { useDispatch, useSelector } from "react-redux";
// Using public directory path instead of asset import
import { Image } from '../components/Image';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Clear any persistent loading state on component mount
  useEffect(() => {
    dispatch(clearLoading());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("All fields are required!");
      return;
    }
    try {
      dispatch(loginStart());
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data?.success) {
        dispatch(loginSuccess(data?.user));
        if (data.user.user_role === 1) {
          localStorage.setItem("adminToken", data.token);
          toast.success("Admin login successful");
          navigate("/profile/admin");
        } else {
          localStorage.setItem("userToken", data.token);
          toast.success(data?.message);
          navigate("/");
        }
      } else {
        dispatch(loginFailure(data?.message));
        toast.error(data?.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      dispatch(loginFailure("Server error occurred"));
      toast.error("Server error occurred. Please try again later.");
    }
  };

  return (
    <div className="w-full mx-auto h-screen flex justify-center items-center bg-[#FFF1DA]">
      <div className="w-full min-h-screen flex items-center justify-center bg-[#FFF1DA]">
        <div className="rounded-md w-[85%] bg-white md:w-[50%] lg:w-[40%] mx-auto flex flex-col gap-6">
          <h1 className="text-center text-lg mt-6 font-medium md:text-3xl md:font-bold text-gray-800">
            Welcome to <span className="text-[#6358DC]">Travel-Zone</span>
          </h1>
          <div className="flex flex-col md:flex-row gap-5 h-auto md:h-[450px] rounded-md items-center justify-center p-4">
            <div className="w-full md:w-1/2 flex justify-center">
              <Image src="/images/login.png" alt="Login" className="max-h-[300px]" />
            </div>
            <form onSubmit={handleSubmit} className="w-full md:w-1/2 px-4">
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
                  placeholder="Your Email"
                />
              </div>
              <div className="mt-4">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
                  placeholder="Your Password"
                />
              </div>
              <button className="w-full bg-[#EB662B] text-white p-3 mt-4 rounded-md">
                {loading ? "Loading..." : "Login"}
              </button>
              <p className="my-4 text-center">
                Don't have an account?{" "}
                <span className="text-[#EB662B]">
                  <Link to="/signup">Signup</Link>
                </span>
              </p>
              <div className="border-t pt-4 mt-4">
                <p className="text-center mb-4 font-medium">Business Account</p>
                <div className="flex flex-col gap-2">
                  <Link to="/business/login" className="w-full bg-[#EB662B] text-white p-3 rounded-md text-center hover:opacity-90">
                    Business Login
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;