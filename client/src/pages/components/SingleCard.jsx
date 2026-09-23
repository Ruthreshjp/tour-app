import React from "react";
import { Link } from "react-router-dom";
import { FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { Rating } from "@mui/material";
import { motion } from "framer-motion";
import { getImageUrl } from "../../utils/getImageUrl";

const SingleCard = ({ packageData }) => {
  const defaultPlaceholder = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
  const imageUrl = getImageUrl(packageData?.packageImages?.[0], defaultPlaceholder);

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-[320px] mx-auto h-[430px] flex flex-col rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
    >
      {/* Top Image Section */}
      <Link
        to={`/package/${packageData?._id || "#"}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="relative block w-full h-[180px] overflow-hidden bg-gray-100"
      >
        <img
          src={imageUrl}
          alt={packageData?.packageName || "Travel Package"}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultPlaceholder;
          }}
        />
        {packageData?.packageOffer && (
          <span className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            OFFER
          </span>
        )}
      </Link>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1">
            <FaMapMarkerAlt />
            <span className="truncate">{packageData?.packageDestination || "Destination"}</span>
          </div>

          <Link
            to={`/package/${packageData?._id || "#"}`}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <h2 className="text-base font-bold text-slate-800 hover:text-[#EB662B] transition-colors line-clamp-2 leading-snug h-[42px]">
              {packageData?.packageName || "Unnamed Package"}
            </h2>
          </Link>
        </div>

        <div className="space-y-2">
          {/* Duration */}
          <div className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
            <FaClock className="text-gray-400" />
            <span>{formattedDuration}</span>
          </div>

          {/* Ratings */}
          <div className="flex items-center gap-2">
            <Rating
              value={packageData?.packageRating || 4.5}
              size="small"
              readOnly
              precision={0.1}
            />
            <span className="text-xs font-semibold text-slate-700">
              {packageData?.packageRating?.toFixed?.(1) || packageData?.packageRating || 4.5}
            </span>
            <span className="text-xs text-gray-400">
              ({packageData?.packageTotalRatings || 12})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-semibold tracking-wider">Price From</span>
              {packageData?.packageOffer && packageData?.packageDiscountPrice ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs line-through text-gray-400">
                    Rs. {packageData.packagePrice}
                  </span>
                  <span className="text-base font-extrabold text-[#EB662B]">
                    Rs. {packageData.packageDiscountPrice}
                  </span>
                </div>
              ) : (
                <span className="text-base font-extrabold text-[#EB662B]">
                  Rs. {packageData?.packagePrice || "N/A"}
                </span>
              )}
            </div>

            <Link
              to={`/package/${packageData?._id || "#"}`}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-3 py-2 bg-[#EB662B] hover:bg-[#d15525] text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SingleCard;