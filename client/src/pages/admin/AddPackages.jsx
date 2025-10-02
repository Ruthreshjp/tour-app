import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const AddPackages = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const initialFormData = {
    packageName: "",
    packageDescription: "",
    packageDestination: "",
    packageDays: 1,
    packageNights: 1,
    packageAccommodation: "",
    packageTransportation: "",
    packageMeals: "",
    packageActivities: "",
    packagePrice: 500,
    packageDiscountPrice: 0,
    packageOffer: false,
    packageImages: [],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      formData.packageImages.forEach((file) => URL.revokeObjectURL(file));
    };
  }, [formData.packageImages]);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.id]: value }));
  };

  const handleFile = (e) => {
    setUploading(true);
    const files = e.target.files;
    setFormData((prevData) => ({
      ...prevData,
      packageImages: Array.from(files),
    }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.packageName || !formData.packageDestination) {
      toast.error("Package name and destination are required!");
      return;
    }
    if (formData.packagePrice < 0) {
      toast.error("Price cannot be negative!");
      return;
    }
    if (
      formData.packageOffer &&
      parseFloat(formData.packagePrice) < parseFloat(formData.packageDiscountPrice)
    ) {
      toast.error("Discount price must be less than regular price!");
      return;
    }

    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "packageImages") {
        formData.packageImages.forEach((file) => {
          data.append("packageImages", file);
        });
      } else {
        data.append(key, formData[key]);
      }
    });

    console.log("Submitting FormData:");
    for (let [key, value] of data.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const method = id ? "put" : "post";
      const endpoint = id
        ? `/api/package/update-package/${id}`
        : `/api/package/add-package`;

      console.log(`Sending ${method.toUpperCase()} request to: ${endpoint}`);

      const res = await axios[method](endpoint, data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message || "Package saved successfully!");
        setFormData(initialFormData);
        navigate("/search");
      } else {
        console.error("Backend error response:", res.data);
        toast.error(res.data.message || "Failed to save package!");
      }
    } catch (err) {
      console.error("Submit error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error(
        err.response?.data?.message ||
          "Failed to submit package. Check console for details!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 w-full min-h-screen flex items-center justify-center bg-[#EB662B] text-white rounded-lg">
      <div className="w-[95%] md:w-[90%] lg:w-[80%] mx-auto flex flex-col gap-6 rounded-xl shadow-xl py-8">
        <h1 className="text-center text-lg font-semibold md:text-3xl md:font-bold text-white">
          {id ? "Update" : "Add"} <span className="">Package</span>
        </h1>
        <div className="flex flex-col md:flex-row gap-5 items-center justify-center px-4">
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="flex flex-col">
              <label>Name:</label>
              <input
                type="text"
                id="packageName"
                value={formData.packageName}
                onChange={handleChange}
                className="p-2 border rounded bg-gray-200 text-gray-800 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label>Description:</label>
              <textarea
                id="packageDescription"
                value={formData.packageDescription}
                onChange={handleChange}
                className="p-2 border rounded bg-gray-200 text-gray-800 outline-none resize-none"
              />
            </div>
            <div className="flex flex-col">
              <label>Destination:</label>
              <input
                type="text"
                id="packageDestination"
                value={formData.packageDestination}
                onChange={handleChange}
                className="p-2 border rounded bg-gray-200 text-gray-800 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col w-full">
                <label>Days:</label>
                <input
                  type="number"
                  id="packageDays"
                  value={formData.packageDays}
                  onChange={handleChange}
                  className="p-2 border rounded bg-gray-200 text-gray-800 outline-none"
                />
              </div>
              <div className="flex flex-col w-full">
                <label>Nights:</label>
                <input
                  type="number"
                  id="packageNights"
                  value={formData.packageNights}
                  onChange={handleChange}
                  className="p-2 border rounded bg-gray-200 text-gray-800 outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label>Accommodation:</label>
              <textarea
                id="packageAccommodation"
                value={formData.packageAccommodation}
                onChange={handleChange}
                className="p-2 border rounded bg-gray-200 text-gray-800 outline-none resize-none"
              />
            </div>
            <div className="flex flex-col">
              <label>Transportation:</label>
              <select
                id="packageTransportation"
                value={formData.packageTransportation}
                onChange={handleChange}
                className="p-2 border rounded bg-gray-200 text-gray-800 outline-none"
              >
                <option value="">Select</option>
                <option value="Flight">Flight</option>
                <option value="Train">Train</option>
                <option value="Boat">Boat</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label>Meals:</label>
              <textarea
                id="packageMeals"
                value={formData.packageMeals}
                onChange={handleChange}
                className="p-2 border rounded bg-gray-200 text-gray-800 outline-none resize-none"
              />
            </div>
            <div className="flex flex-col">
              <label>Activities:</label>
              <textarea
                id="packageActivities"
                value={formData.packageActivities}
                onChange={handleChange}
                className="p-2 border rounded bg-gray-200 text-gray-800 outline-none resize-none"
              />
            </div>
            <div className="flex flex-col">
              <label>Price:</label>
              <input
                type="number"
                id="packagePrice"
                value={formData.packagePrice}
                onChange={handleChange}
                className="p-2 border rounded bg-gray-200 text-gray-800 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="packageOffer">Offer:</label>
              <input
                type="checkbox"
                id="packageOffer"
                checked={formData.packageOffer}
                onChange={handleChange}
                className="w-4 h-4"
              />
            </div>
            {formData.packageOffer && (
              <div className="flex flex-col">
                <label>Discount Price:</label>
                <input
                  type="number"
                  id="packageDiscountPrice"
                  value={formData.packageDiscountPrice}
                  onChange={handleChange}
                  className="p-2 border rounded bg-gray-200 text-gray-800 outline-none"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2">Upload Images</label>
              <div className="relative flex items-center justify-center w-full cursor-pointer bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFile}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="text-gray-500">Click to select images</span>
              </div>
              {formData.packageImages.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {formData.packageImages.map((file, index) => {
                    const imageUrl = URL.createObjectURL(file);
                    return (
                      <div
                        key={index}
                        className="relative w-full aspect-square border border-gray-300 rounded overflow-hidden"
                      >
                        <img
                          src={imageUrl}
                          alt={`Preview ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={uploading || loading}
              className="text-white p-3 rounded bg-black hover:opacity-95 disabled:opacity-70 mt-2"
            >
              {loading
                ? "Saving..."
                : id
                ? "Update Package"
                : "Create New Package"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPackages;