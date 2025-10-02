// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  logOutStart,
  logOutSuccess,
  logOutFailure,
  deleteUserAccountStart,
  deleteUserAccountSuccess,
  deleteUserAccountFailure,
} from "../../redux/user/userSlice";
import axios from 'axios';
import AllBookings from "./AllBookings";
import AdminUpdateProfile from "./AdminUpdateProfile";
import AddPackages from "./AddPackages";
import AllPackages from "./AllPackages";
import AllUsers from "./AllUsers";
import Payments from "./Payments";
import RatingsReviews from "./RatingsReviews";
import History from "./History";
import BusinessApprovals from "./BusinessApprovals";
import BusinessManagement from "./BusinessManagement";
import "./styles/DashboardStyle.css";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [profilePhoto, setProfilePhoto] = useState(undefined);
  const [photoPercentage, setPhotoPercentage] = useState(0);
  const [activePanelId, setActivePanelId] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    address: "",
    phone: "",
    avatar: null,
  });

  useEffect(() => {
    if (currentUser !== null) {
      setFormData({
        username: currentUser.username,
        email: currentUser.email,
        address: currentUser.address,
        phone: currentUser.phone,
        avatar: currentUser.avatar,
      });
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      dispatch(logOutStart());
      const res = await fetch("/api/auth/logout");
      const data = await res.json();
      if (data?.success !== true) {
        dispatch(logOutFailure(data?.message));
        return;
      }
      dispatch(logOutSuccess());
      navigate("/login");
      toast.success(data?.message);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    const CONFIRM = confirm(
      "Are you sure ? the account will be permanently deleted!"
    );
    if (CONFIRM) {
      try {
        dispatch(deleteUserAccountStart());
        const res = await fetch(`/api/user/delete/${currentUser._id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data?.success === false) {
          dispatch(deleteUserAccountFailure(data?.message));
          toast.error("Something went wrong!");
          return;
        }
        dispatch(deleteUserAccountSuccess());
        toast.success(data?.message);
      } catch (error) {}
    }
  };

  return (
    <div className="flex w-full flex-wrap max-sm:flex-col gap-16 p-2">
      {currentUser ? (
        <>
          <div className="w-[25%] p-3 max-sm:w-full">
            <div className="flex flex-col items-center gap-4 p-3 rounded-lg shadow-lg">
              <div className="w-full flex flex-col items-center relative">
                <img
                  src={
                    `http://localhost:8000/images/${formData.avatar}` ||
                    formData.avatar
                  }
                  alt="Profile photo"
                  className="w-37 h-37 object-cover rounded-full"
                />
              </div>
              <p
                style={{
                  width: "100%",
                  borderBottom: "1px solid black",
                  lineHeight: "0.1em",
                  margin: "10px",
                }}
              >
                <span className="font-semibold" style={{ background: "#fff" }}>
                  Logged in user Information
                </span>
              </p>
              <div className="w-full flex justify-between px-1">
                <button
                  onClick={() => setActivePanelId(10)}
                  className="px-8 bg-[#EB662B] text-white text-base font-semibold flex items-center justify-center my-3 border p-1 rounded-lg hover:text-white"
                >
                  Edit Profile
                </button>
              </div>
              <div className="w-full flex flex-col gap-3 shadow-2xl rounded-lg p-3 break-all">
                <p>Name</p>
                <p className="text-base font-semibold py-2 border border-gray-300 px-3">
                  {currentUser.username}
                </p>
                <p>Email</p>
                <p className="text-base font-semibold py-2 border border-gray-300 px-3">
                  {currentUser.email}
                </p>
                <p>Phone</p>
                <p className="text-base font-semibold py-2 border border-gray-300 px-3">
                  {currentUser.phone}
                </p>
                <p>Address</p>
                <p className="text-base font-semibold py-2 border border-gray-300 px-3">
                  {currentUser.address}
                </p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleLogout}
                    className="px-4 bg-[#6358DC] text-white text-sm font-semibold flex items-center justify-center my-3 border p-1 rounded-lg hover:text-white"
                  >
                    Logout
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-1 bg-[#EB662B] text-white text-sm font-semibold flex items-center justify-center my-3 border p-1 rounded-lg hover:text-white"
                  >
                    Delete account
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="w-[65%] max-sm:w-full">
            <div className="main-div">
              <nav className="w-full border-[#EB662B] border-b-4 py-3 overflow-x-auto navbar">
                <div className="w-full flex gap-2">
                  <button
                    className={
                      activePanelId === 1
                        ? "p-1 rounded-t transition-all duration-300 text-nowrap bg-[#EB662B] text-white"
                        : "p-1 rounded-t transition-all duration-300 text-nowrap"
                    }
                    id="bookings"
                    onClick={() => setActivePanelId(1)}
                  >
                    Bookings
                  </button>
                  <button
                    className={
                      activePanelId === 2
                        ? "p-1 rounded-t transition-all duration-300 text-nowrap bg-[#EB662B] text-white"
                        : "p-1 rounded-t transition-all duration-300 text-nowrap"
                    }
                    id="add-packages"
                    onClick={() => setActivePanelId(2)}
                  >
                    Add Packages
                  </button>
                  <button
                    className={
                      activePanelId === 3
                        ? "p-1 rounded-t transition-all duration-300 text-nowrap bg-[#EB662B] text-white"
                        : "p-1 rounded-t transition-all duration-300 text-nowrap"
                    }
                    id="all-packages"
                    onClick={() => setActivePanelId(3)}
                  >
                    All Packages
                  </button>
                  <button
                    className={
                      activePanelId === 4
                        ? "p-1 rounded-t transition-all duration-300 text-nowrap bg-[#EB662B] text-white"
                        : "p-1 rounded-t transition-all duration-300 text-nowrap"
                    }
                    id="users"
                    onClick={() => setActivePanelId(4)}
                  >
                    Users
                  </button>
                  <button
                    className={
                      activePanelId === 5
                        ? "p-1 rounded-t transition-all duration-300 text-nowrap bg-[#EB662B] text-white"
                        : "p-1 rounded-t transition-all duration-300 text-nowrap"
                    }
                    id="payments"
                    onClick={() => setActivePanelId(5)}
                  >
                    Payments
                  </button>
                  <button
                    className={
                      activePanelId === 6
                        ? "p-1 rounded-t transition-all duration-300 text-nowrap bg-[#EB662B] text-white"
                        : "p-1 rounded-t transition-all duration-300 text-nowrap"
                    }
                    id="ratings"
                    onClick={() => setActivePanelId(6)}
                  >
                    Ratings/Reviews
                  </button>
                  <button
                    className={
                      activePanelId === 7
                        ? "p-1 rounded-t transition-all duration-300 text-nowrap bg-[#EB662B] text-white"
                        : "p-1 rounded-t transition-all duration-300 text-nowrap"
                    }
                    id="history"
                    onClick={() => setActivePanelId(7)}
                  >
                    History
                  </button>
                  <button
                    className={
                      activePanelId === 8
                        ? "p-1 rounded-t transition-all duration-300 text-nowrap bg-[#EB662B] text-white"
                        : "p-1 rounded-t transition-all duration-300 text-nowrap"
                    }
                    id="business-approvals"
                    onClick={() => setActivePanelId(8)}
                  >
                    Business Approvals
                  </button>
                  <button
                    className={
                      activePanelId === 9
                        ? "p-1 rounded-t transition-all duration-300 text-nowrap bg-[#EB662B] text-white"
                        : "p-1 rounded-t transition-all duration-300 text-nowrap"
                    }
                    id="business-management"
                    onClick={() => setActivePanelId(9)}
                  >
                    Manage Businesses
                  </button>
                  <button
                    className={
                      activePanelId === 10
                        ? "p-1 rounded-t transition-all duration-300 text-nowrap bg-[#EB662B] text-white"
                        : "p-1 rounded-t transition-all duration-300 text-nowrap"
                    }
                    id="update-profile"
                    onClick={() => setActivePanelId(10)}
                  >
                    Update Profile
                  </button>
                </div>
              </nav>
              <div className="content-div flex flex-wrap my-5">
                {activePanelId === 1 ? (
                  <AllBookings />
                ) : activePanelId === 2 ? (
                  <AddPackages />
                ) : activePanelId === 3 ? (
                  <AllPackages />
                ) : activePanelId === 4 ? (
                  <AllUsers />
                ) : activePanelId === 5 ? (
                  <Payments />
                ) : activePanelId === 6 ? (
                  <RatingsReviews />
                ) : activePanelId === 7 ? (
                  <History />
                ) : activePanelId === 8 ? (
                  <BusinessApprovals />
                ) : activePanelId === 9 ? (
                  <BusinessManagement />
                ) : activePanelId === 10 ? (
                  <AdminUpdateProfile />
                ) : (
                  <div>Page Not Found!</div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div>
          <p className="text-red-700">Login First</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;