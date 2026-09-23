import { FaClock, FaTag } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/getImageUrl";

const Offers = ({ packageData }) => {
  const imageUrl = getImageUrl(packageData?.packageImages?.[0], 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80');

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-amber-100 flex items-center gap-4 hover:shadow-xl transition-all duration-300">
      <Link
        to={`/package/${packageData._id}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="flex-shrink-0 relative"
      >
        <img
          className="w-20 h-20 rounded-full object-cover border-2 border-[#EB662B]"
          src={imageUrl}
          alt={packageData?.packageName || "Offer Package"}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80';
          }}
        />
        <span className="absolute -bottom-1 -right-1 bg-[#EB662B] text-white p-1 rounded-full text-xs">
          <FaTag />
        </span>
      </Link>

      <div className="flex flex-col gap-1 flex-1 overflow-hidden">
        <Link
          to={`/package/${packageData._id}`}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <h3 className="font-bold text-[#05073C] text-sm truncate hover:text-[#EB662B] transition-colors">
            {packageData?.packageName}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 truncate">{packageData?.packageDestination}</p>
        
        <div className="flex items-center gap-2 text-xs font-semibold mt-1">
          {packageData.offer && packageData.packageDiscountPrice ? (
            <div className="flex items-center gap-1.5">
              <span className="line-through text-gray-400 text-[11px]">
                Rs. {packageData.packagePrice}
              </span>
              <span className="text-[#EB662B] text-sm font-extrabold">
                Rs. {packageData.packageDiscountPrice}
              </span>
            </div>
          ) : (
            <span className="text-[#EB662B] text-sm font-extrabold">Rs. {packageData.packagePrice}</span>
          )}
        </div>

        {(packageData.packageDays > 0 || packageData.packageNights > 0) && (
          <div className="flex text-[11px] items-center gap-1 text-gray-400">
            <FaClock />
            <span>
              {packageData.packageDays > 0 && `${packageData.packageDays}D`}
              {packageData.packageDays > 0 && packageData.packageNights > 0 && "/"}
              {packageData.packageNights > 0 && `${packageData.packageNights}N`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;