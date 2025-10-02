import { FaClock } from "react-icons/fa";
import { Link } from "react-router-dom";

const Offers = ({ packageData }) => {
  return (
    <div>
      <div>
        <Link
          to={`/package/${packageData._id}`}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            className="rounded-full w-20 h-20"
            src={`http://localhost:8000/images/${packageData.packageImages[0]}`}
            alt=""
            onError={(e) => (e.target.src = 'https://placehold.co/80x80/e2e8f0/64748b?text=Offer')}
          />
        </Link>
      </div>
      <div className="text-sm">
        {packageData.offer && packageData.packageDiscountPrice ? (
          <span>
            <span className="line-through text-gray-700">
              Rs. {packageData.packagePrice}
            </span>
            {" - "}
            <span>Rs. {packageData.packageDiscountPrice}</span>
          </span>
        ) : (
          <span>Rs. {packageData.packagePrice}</span>
        )}
      </div>
      <div>
        <h1 className="text-[#EB662B]">{packageData.packageName}</h1>
        <p className="text-center">{packageData.packageDestination}</p>
      </div>
      <div className="flex text-sm items-center gap-2 text-[#EB662B]">
        {(packageData.packageDays > 0 || packageData.packageNights > 0) && (
          <>
            <FaClock />
            {packageData.packageDays > 0 &&
              (packageData.packageDays > 1
                ? `${packageData.packageDays} Days`
                : `${packageData.packageDays} Day`)}
            {packageData.packageDays > 0 &&
              packageData.packageNights > 0 &&
              " - "}
            {packageData.packageNights > 0 &&
              (packageData.packageNights > 1
                ? `${packageData.packageNights} Nights`
                : `${packageData.packageNights} Night`)}
          </>
        )}
      </div>
    </div>
  );
};

export default Offers;