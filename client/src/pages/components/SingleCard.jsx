import React from "react";
import { Link } from "react-router-dom";
import { FaClock } from "react-icons/fa";
import { Rating } from "@mui/material";
import { motion } from "framer-motion";

const SingleCard = ({ packageData }) => {
  // Fallback image if packageImages[0] fails to load
  const imageUrl = packageData?.packageImages?.[0]
    ? `http://localhost:8000/images/${packageData.packageImages[0]}`
    : "/fallback-image.jpg"; // Replace with your fallback image path

  // Format duration
  const duration = [];
  if (packageData?.packageDays > 0) {
    duration.push(
      `${packageData.packageDays} ${packageData.packageDays > 1 ? "Days" : "Day"}`
    );
  }
  if (packageData?.packageNights > 0) {
    duration.push(
      `${packageData.packageNights} ${packageData.packageNights > 1 ? "Nights" : "Night"}`
    );
  }
  const formattedDuration = duration.join(" - ") || "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-[260px] h-[360px] mx-auto flex flex-col rounded-lg overflow-hidden shadow-md bg-white hover:scale-105 transition-transform duration-300"
    >
      {/* Top Image Section */}
      <Link
        to={`/package/${packageData?._id || "#"}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <img
          src={imageUrl}
          alt={packageData?.packageName || "Travel Package"}
          className="w-full h-[140px] object-cover"
          onError={(e) => (e.target.src = "/fallback-image.jpg")} // Fallback on error
        />
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col items-start gap-1 flex-1">
        <p className="text-sm text-gray-500">
          {packageData?.packageDestination || "Unknown Destination"}
        </p>

        <h2 className="text-lg font-semibold text-[#05073C]">
          {packageData?.packageName || "Unnamed Package"}
        </h2>

        <p className="text-sm text-gray-500">
          {packageData?.packageDuration || formattedDuration}
        </p>

        {/* Duration */}
        {(packageData?.packageDays > 0 || packageData?.packageNights > 0) && (
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <FaClock />
            {formattedDuration}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between gap-2 w-full mt-1 text-sm">
          <span className="text-gray-600">From</span>
          {packageData?.packageOffer && packageData?.packageDiscountPrice ? (
            <span className="flex gap-2 items-center">
              <span className="line-through text-gray-500">
                Rs. {packageData.packagePrice}
              </span>
              <span className="font-semibold text-emerald-500">
                Rs. {packageData.packageDiscountPrice}
              </span>
            </span>
          ) : (
            <span className="font-semibold text-emerald-500">
              Rs. {packageData?.packagePrice || "N/A"}
            </span>
          )}
        </div>

        {/* Ratings */}
        {packageData?.packageTotalRatings > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <Rating
              value={packageData?.packageRating || 0}
              size="small"
              readOnly
              precision={0.1}
            />
            <span className="text-sm text-gray-500">
              ({packageData.packageTotalRatings})
            </span>
          </div>
        )}

        {/* Details Button */}
        <Link
          to={`/package/${packageData?._id || "#"}`}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-auto w-full px-4 py-2 bg-[#EB662B] text-white text-sm font-medium rounded hover:bg-[#d15525] transition-colors text-center"
        >
          Details
        </Link>
      </div>
    </motion.div>
  );
};

export default SingleCard;