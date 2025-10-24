import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import Rating from "@mui/material/Rating";
import { useSelector } from "react-redux";
import MapModal from "./components/MapModal";
import { Autoplay } from "swiper/modules";
import { FaClock } from "react-icons/fa";
const Package = () => {
  const [showMap, setShowMap] = useState(false);
  SwiperCore.use([Navigation]);
  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState({
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
    packageRating: 0,
    packageTotalRatings: 0,
    packageImages: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const getPackageData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/package/get-package-data/${params?.id}`);
      const data = await res.json();
      if (data?.success) {
        setPackageData({
          packageName: data?.packageData?.packageName,
          packageDescription: data?.packageData?.packageDescription,
          packageDestination: data?.packageData?.packageDestination,
          packageDays: data?.packageData?.packageDays,
          packageNights: data?.packageData?.packageNights,
          packageAccommodation: data?.packageData?.packageAccommodation,
          packageTransportation: data?.packageData?.packageTransportation,
          packageMeals: data?.packageData?.packageMeals,
          packageActivities: data?.packageData?.packageActivities,
          packagePrice: data?.packageData?.packagePrice,
          packageDiscountPrice: data?.packageData?.packageDiscountPrice,
          packageOffer: data?.packageData?.packageOffer,
          packageRating: data?.packageData?.packageRating,
          packageTotalRatings: data?.packageData?.packageTotalRatings,
          packageImages: data?.packageData?.packageImages,
        });
        setLoading(false);
      } else {
        setError(data?.message || "Something went wrong!");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (params.id) {
      getPackageData();
    }
  }, [params.id]);
  return (
    <div className="w-full">
      {loading && (
        <p className="text-center font-semibold" id="loading">
          Loading...
        </p>
      )}

      {packageData && !loading && !error && (
        <div className="w-full max-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* left div */}
          <div className="w-full md:w-1/2 flex flex-col items-center ">
            <h1 className="text-[#05073C] text-lg md:text-3xl text-center md:text-start font-semibold">
              {packageData.packageName}
            </h1>
            <div className="flex items-center justify-between gap-10 my-3">
              <p className="text-[#05073C] text-lg font-semibold">
                {packageData.packageDestination}
              </p>
              <p className="text-[#05073C] text-lg font-semibold">
                Rs. {packageData.packagePrice}
              </p>
            </div>

            {/* days & nights */}
            {(+packageData?.packageDays > 0 ||
              +packageData?.packageNights > 0) && (
              <p className="flex items-center gap-2">
                <FaClock />
                {+packageData?.packageDays > 0 &&
                  (+packageData?.packageDays > 1
                    ? packageData?.packageDays + " Days"
                    : packageData?.packageDays + " Day")}
                {+packageData?.packageDays > 0 &&
                  +packageData?.packageNights > 0 &&
                  " - "}
                {+packageData?.packageNights > 0 &&
                  (+packageData?.packageNights > 1
                    ? packageData?.packageNights + " Nights"
                    : packageData?.packageNights + " Night")}
              </p>
            )}
            {/* rating */}
            {packageData?.packageTotalRatings > 0 && (
              <div className="flex items-center justify-center gap-2 my-2">
                <Rating
                  value={packageData?.packageRating || 0}
                  readOnly
                  precision={0.1}
                />
                <span className="text-sm text-gray-600">{packageData?.packageRating?.toFixed?.(1) || packageData?.packageRating || 0}</span>
                <span className="text-sm text-gray-500">({packageData?.packageTotalRatings})</span>
              </div>
            )}

            <div className="flex flex-col my-6">
              <div className="flex gap-5 items-center my-2">
                <h4 className="text-gray-800 text-xl font-semibold">
                  Activities:
                </h4>
                <p>{packageData?.packageActivities}</p>
              </div>
              <div className="flex gap-5 items-center my-2">
                <h4 className="text-gray-800 text-xl font-semibold">Meals:</h4>
                <p>{packageData?.packageMeals}</p>
              </div>
              <div className="flex gap-5 items-center my-2">
                <h4 className="text-gray-800 text-xl font-semibold">
                  Transportation:
                </h4>
                <p>{packageData?.packageTransportation}</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <Swiper
              modules={[Autoplay]}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              loop={packageData.packageImages && packageData.packageImages.length > 1}
              className="w-full h-[300px] md:h-[400px]"
            >
              {packageData.packageImages.map((img, i) => (
                <SwiperSlide key={i}>
                  <img
                    src={`http://localhost:8000/images/${img}`}
                    alt={`slide-${i}`}
                    className="w-full h-full object-cover rounded-xl" // rounded-xl for smooth rounded corners
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 py-16 px-4">
        {/* Left div */}
        <div className="w-full md:w-1/2 flex flex-col items-start gap-6 mt-12">
          <p className="text-gray-800 text-2xl font-semibold">Description</p>
          <p className="text-gray-700 leading-relaxed">
            {packageData?.packageDescription.length > 280 ? (
              <>
                <span id="desc">
                  {packageData?.packageDescription.substring(0, 150)}...
                </span>
              </>
            ) : (
              <>{packageData?.packageDescription}</>
            )}
          </p>

          <button
            type="button"
            onClick={() => {
              if (currentUser) {
                navigate(`/package/${params?.id}/book`);
              } else {
                navigate("/login");
              }
            }}
            className="w-[200px] bg-[#EB662B] text-white rounded p-3 hover:opacity-95 transition"
          >
            Book
          </button>
        </div>

        {/* Right div */}
        <div className="w-full md:w-1/2 text-gray-700 leading-relaxed  mb-6 flex flex-col gap-4">
          <h4 className="text-gray-800 text-2xl font-semibold">
            Accommodation
          </h4>
          <p>{packageData?.packageAccommodation}</p>
        </div>
      </div>
      <hr className="border border-[#EB662B]" />
      {showMap && (
        <MapModal
          location={packageData.packageDestination}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  );
};

export default Package;
