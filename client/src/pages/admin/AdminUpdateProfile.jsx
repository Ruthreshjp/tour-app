import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  updatePassStart,
  updatePassSuccess,
  updatePassFailure,
} from "../../redux/user/userSlice";
import { toast } from "react-toastify";
import axios from "axios";
import { FiUpload } from "react-icons/fi";

const AdminUpdateProfile = () => {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [updateProfileDetailsPanel, setUpdateProfileDetailsPanel] =
    useState(true);
  const [formData, setFormData] = useState({
    username: "",
    address: "",
    phone: "",
    upiId: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const [updatePassword, setUpdatePassword] = useState({
    oldpassword: "",
    newpassword: "",
  });

  useEffect(() => {
    if (currentUser !== null) {
      setFormData({
        username: currentUser.username,
        address: currentUser.address,
        phone: currentUser.phone,
        upiId: currentUser.upiId || "",
        avatar: currentUser.avatar,
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePass = (e) => {
    setUpdatePassword({
      ...updatePassword,
      [e.target.name]: e.target.value,
    });
  };

  const updateUserDetails = async (e) => {
    e.preventDefault();

    if (
      !avatarFile &&
      currentUser.username === formData.username &&
      currentUser.address === formData.address &&
      currentUser.phone === formData.phone &&
      (currentUser.upiId || "") === formData.upiId
    ) {
      toast.error("Change at least 1 field to update details");
      return;
    }

    try {
      dispatch(updateUserStart());

      const updatedForm = new FormData();
      updatedForm.append("username", formData.username);
      updatedForm.append("email", currentUser.email); // Include email
      updatedForm.append("address", formData.address);
      updatedForm.append("phone", formData.phone);
      updatedForm.append("upiId", formData.upiId || ""); // Ensure empty string if null
      if (avatarFile) {
        updatedForm.append("avatar", avatarFile);
      }

      console.log('Updating profile with UPI ID:', formData.upiId); // Debug log

      const res = await axios.post(
        `/api/user/update/${currentUser._id}`,
        updatedForm
      );

      const data = res.data;
      if (data.success) {
        toast.success(data.message);
        dispatch(updateUserSuccess(data.user));
      } else {
        dispatch(updateUserFailure(data.message));
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      dispatch(updateUserFailure("Something went wrong"));
      toast.error("Something went wrong");
    }
  };

  const updateUserPassword = async (e) => {
    e.preventDefault();
    if (
      updatePassword.oldpassword === "" ||
      updatePassword.newpassword === ""
    ) {
      toast.error("Enter a valid password");
      return;
    }
    if (updatePassword.oldpassword === updatePassword.newpassword) {
      toast.error("New password can't be same!");
      return;
    }
    try {
      dispatch(updatePassStart());
      const res = await fetch(`/api/user/update-password/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePassword),
      });
      const data = await res.json();
      if (data.success === false && res.status !== 201 && res.status !== 200) {
        dispatch(updateUserSuccess());
        dispatch(updatePassFailure(data?.message));
        toast.error("Session Ended! Please login again");
        navigate("/login");
        return;
      }
      dispatch(updatePassSuccess());
      toast(data?.message);
      setUpdatePassword({
        oldpassword: "",
        newpassword: "",
      });
      return;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full h-[90vh] flex items-center  bg-[#EB662B] rounded-md">
      <div className="w-[90%] bg-white md:w-[60%] mx-auto flex flex-col gap-6 rounded-md shadow-lg">
        <h1 className="text-center text-lg mt-6 font-medium md:text-3xl md:font-bold text-gray-800">
          {updateProfileDetailsPanel ? (
            <>
              Update <span className="text-[#EB662B]">Profile</span>
            </>
          ) : (
            <>
              Change <span className="text-[#6358DC]">Password</span>
            </>
          )}
        </h1>

        <div className="flex flex-col gap-5 p-6">
          {updateProfileDetailsPanel ? (
            <form className="w-full space-y-4">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="avatarUpload"
                  className="cursor-pointer flex items-center gap-2 text-blue-600"
                >
                  <FiUpload />
                  Upload Avatar
                </label>
                <input
                  type="file"
                  id="avatarUpload"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                {avatarPreview && (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-full border"
                  />
                )}
              </div>
              <div>
                <label className="font-medium">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
                  placeholder="Your Username"
                />
              </div>
              <div>
                <label className="font-medium">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  maxLength={200}
                  className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none resize-none"
                  placeholder="Your Address"
                />
              </div>
              <div>
                <label className="font-medium">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <label className="font-medium">UPI ID</label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleChange}
                  className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
                  placeholder="yourname@upi (e.g., admin@paytm, 9876543210@ybl)"
                />
                <p className="text-xs text-gray-500 mt-1">💡 This UPI ID will be used for package booking payments</p>
              </div>
              <button
                disabled={loading}
                onClick={updateUserDetails}
                type="button"
                className="w-full bg-[#EB662B] text-white p-3 rounded-md hover:opacity-90"
              >
                {loading ? "Loading..." : "Update"}
              </button>
              <button
                disabled={loading}
                type="button"
                onClick={() => setUpdateProfileDetailsPanel(false)}
                className="w-full bg-red-600 text-white p-3 rounded-md hover:opacity-90"
              >
                {loading ? "Loading..." : "Change Password"}
              </button>
            </form>
          ) : (
            <form className="w-full space-y-4">
              <div>
                <label className="font-medium">Old Password</label>
                <input
                  type="password"
                  name="oldpassword"
                  value={updatePassword.oldpassword}
                  onChange={handlePass}
                  className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
                  placeholder="Enter old password"
                />
              </div>
              <div>
                <label className="font-medium">New Password</label>
                <input
                  type="password"
                  name="newpassword"
                  value={updatePassword.newpassword}
                  onChange={handlePass}
                  className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
                  placeholder="Enter new password"
                />
              </div>
              <button
                disabled={loading}
                onClick={updateUserPassword}
                type="button"
                className="w-full bg-[#6358DC] text-white p-3 rounded-md hover:opacity-90"
              >
                {loading ? "Loading..." : "Update Password"}
              </button>
              <button
                disabled={loading}
                type="button"
                onClick={() => {
                  setUpdateProfileDetailsPanel(true);
                  setUpdatePassword({ oldpassword: "", newpassword: "" });
                }}
                className="w-full bg-red-600 text-white p-3 rounded-md hover:opacity-90"
              >
                {loading ? "Loading..." : "Back"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUpdateProfile;
