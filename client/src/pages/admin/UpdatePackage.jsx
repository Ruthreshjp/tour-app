import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

const UpdatePackage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getPackageData = async () => {
    try {
      console.log("Fetching package data for ID:", params.id);
      const res = await fetch(`http://localhost:8000/api/package/get-package-data/${params?.id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        console.error("Response status:", res.status, res.statusText);
        throw new Error(`HTTP error: ${res.status}`);
      }
      const text = await res.text();
      console.log("Raw response:", text);
      const data = JSON.parse(text);
      if (data?.success) {
        setFormData({
          packageName: data?.packageData?.packageName || "",
          packageDescription: data?.packageData?.packageDescription || "",
          packageDestination: data?.packageData?.packageDestination || "",
          packageDays: data?.packageData?.packageDays || 1,
          packageNights: data?.packageData?.packageNights || 1,
          packageAccommodation: data?.packageData?.packageAccommodation || "",
          packageTransportation: data?.packageData?.packageTransportation || "",
          packageMeals: data?.packageData?.packageMeals || "",
          packageActivities: data?.packageData?.packageActivities || "",
          packagePrice: data?.packageData?.packagePrice || 500,
          packageDiscountPrice: data?.packageData?.packageDiscountPrice || 0,
          packageOffer: data?.packageData?.packageOffer || false,
          packageImages: data?.packageData?.packageImages || [],
        });
      } else {
        toast.error(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error fetching package:", error.message);
      toast.error("Failed to fetch package data: " + error.message);
    }
  };

  useEffect(() => {
    console.log("Package ID:", params.id);
    if (params.id) getPackageData();
  }, [params.id]);

  const handleChange = (e) => {
    if (e.target.type === "checkbox") {
      setFormData({ ...formData, [e.target.id]: e.target.checked });
    } else {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };

  const handleFile = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const totalImages = selectedFiles.length + images.length + formData.packageImages.length;

    if (totalImages > 10) {
      toast.error("You can only upload 10 images per package");
      return;
    }
    setImages((prev) => [...prev, ...selectedFiles]);
    setFormData((prev) => ({
      ...prev,
      packageImages: [...prev.packageImages, ...selectedFiles],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData);

    if (formData.packageImages.length === 0) {
      toast.error("You must upload at least 1 image");
      return;
    }

    if (
      formData.packageName === "" ||
      formData.packageDescription === "" ||
      formData.packageDestination === "" ||
      formData.packageAccommodation === "" ||
      formData.packageTransportation === "" ||
      formData.packageMeals === "" ||
      formData.packageActivities === "" ||
      formData.packagePrice === 0
    ) {
      toast.error("All fields are required!");
      return;
    }

    if (formData.packagePrice < 500) {
      toast.error("Price should be greater than 500!");
      return;
    }

    if (
      formData.packageOffer &&
      formData.packageDiscountPrice >= formData.packagePrice
    ) {
      toast.error("Regular Price should be greater than Discount Price!");
      return;
    }

    try {
      setLoading(true);
      setError(false);

      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "packageImages") {
          form.append(key, value);
        }
      });
      formData.packageImages.forEach((image) => {
        form.append("packageImages", image);
      });

      console.log("Sending request to update package...");
      const res = await fetch(`http://localhost:8000/api/package/update-package/${params?.id}`, {
        method: "PUT",
        credentials: "include",
        body: form,
      });

      if (!res.ok) {
        console.error("Response status:", res.status, res.statusText);
        throw new Error(`HTTP error: ${res.status}`);
      }

      const text = await res.text();
      console.log("Raw response:", text);
      const data = JSON.parse(text);

      console.log("Response:", data);
      if (data?.success === false) {
        setError(data?.message);
        toast.error(data?.message);
      } else {
        toast.success(data?.message || "Package updated successfully!");
        navigate(`/package/${params?.id}`);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error:", err.message);
      setLoading(false);
      setError("Something went wrong!");
      toast.error("Something went wrong: " + err.message);
    }
  };

  return (
    <div className="w-full flex flex-wrap justify-center gap-2 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full sm:w-[60%] space-y-4 shadow-md rounded-xl p-4 bg-white"
      >
        <h1 className="text-center text-2xl font-semibold">Update Package</h1>

        <div>
          <label className="font-medium">Name</label>
          <input
            type="text"
            id="packageName"
            value={formData.packageName}
            onChange={handleChange}
            className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
          />
        </div>

        <div>
          <label className="font-medium">Description</label>
          <textarea
            id="packageDescription"
            value={formData.packageDescription}
            onChange={handleChange}
            className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
          />
        </div>

        <div>
          <label className="font-medium">Destination</label>
          <input
            type="text"
            id="packageDestination"
            value={formData.packageDestination}
            onChange={handleChange}
            className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="font-medium">Days</label>
            <input
              type="number"
              id="packageDays"
              value={formData.packageDays}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="font-medium">Nights</label>
            <input
              type="number"
              id="packageNights"
              value={formData.packageNights}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="font-medium">Accommodation</label>
          <textarea
            id="packageAccommodation"
            value={formData.packageAccommodation}
            onChange={handleChange}
            className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
          />
        </div>

        <div>
          <label className="font-medium">
            Transportation (Selected: {formData?.packageTransportation})
          </label>
          <select
            id="packageTransportation"
            value={formData.packageTransportation}
            onChange={handleChange}
            className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
          >
            <option value="">Select</option>
            <option value="Flight">Flight</option>
            <option value="Train">Train</option>
            <option value="Boat">Boat</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="font-medium">Meals</label>
          <textarea
            id="packageMeals"
            value={formData.packageMeals}
            onChange={handleChange}
            className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none resize-none"
          />
        </div>

        <div>
          <label className="font-medium">Activities</label>
          <textarea
            id="packageActivities"
            value={formData.packageActivities}
            onChange={handleChange}
            className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none resize-none"
          />
        </div>

        <div>
          <label className="font-medium">Price</label>
          <input
            type="number"
            id="packagePrice"
            value={formData.packagePrice}
            onChange={handleChange}
            className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium" htmlFor="packageOffer">
            Offer
          </label>
          <input
            type="checkbox"
            id="packageOffer"
            checked={formData?.packageOffer}
            onChange={handleChange}
            className="w-5 h-5"
          />
        </div>

        {formData.packageOffer && (
          <div>
            <label className="font-medium">Discount Price</label>
            <input
              type="number"
              id="packageDiscountPrice"
              value={formData.packageDiscountPrice}
              onChange={handleChange}
              className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
            />
          </div>
        )}

        <div>
          <label className="font-medium" htmlFor="packageImages">
            Images:
            <span className="text-red-700 text-sm block">
              (images size should be less than 2MB and max 10 images)
            </span>
          </label>
          <input
            type="file"
            id="packageImages"
            multiple
            accept="image/*"
            onChange={handleFile}
            className="w-full mt-2 p-3 border rounded-md bg-gray-200 outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#EB662B] text-white p-3 rounded-md hover:opacity-90 disabled:opacity-80"
          disabled={loading}
        >
          {loading ? "Loading..." : "Update Package"}
        </button>
      </form>

      <div className="w-full sm:w-[30%] space-y-4 shadow-md rounded-xl p-4 bg-white">
        {formData?.packageImages?.length > 0 && (
          <div className="space-y-2">
            {formData.packageImages.map((image, i) => (
              <div
                key={i}
                className="shadow-md rounded-md p-2 flex justify-between items-center"
              >
                <img
                  src={typeof image === "string" ? `http://localhost:8000/images/${image}` : URL.createObjectURL(image)}
                  alt=""
                  className="h-20 w-20 rounded"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdatePackage;