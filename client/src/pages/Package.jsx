import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import Rating from "@mui/material/Rating";
import { useSelector } from "react-redux";
import RatingCard from "./RatingCard";
import { toast } from "react-toastify";
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
  const [ratingsData, setRatingsData] = useState({
    rating: 0,
    review: "",
    packageId: params?.id,
    userRef: currentUser?._id,
    username: currentUser?.username,
    userProfileImg: currentUser?.avatar,
  });
  const [packageRatings, setPackageRatings] = useState([]);
  const [ratingGiven, setRatingGiven] = useState(false);

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

  const giveRating = async () => {
    checkRatingGiven();
    if (ratingGiven) {
      toast.error("You already submittd your rating!");
      return;
    }
    if (ratingsData.rating === 0 && ratingsData.review === "") {
      toast.error("Atleast 1 field is required!");
      return;
    }
    if (
      ratingsData.rating === 0 &&
      ratingsData.review === "" &&
      !ratingsData.userRef
    ) {
      toast.error("All fields are required!");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/rating/give-rating", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ratingsData),
      });
      const data = await res.json();
      if (data?.success) {
        setLoading(false);
        toast.success(data?.message);
        getPackageData();
        getRatings();
        checkRatingGiven();
      } else {
        setLoading(false);
        toast.error(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getRatings = async () => {
    try {
      const res = await fetch(`/api/rating/get-ratings/${params.id}/4`);
      const data = await res.json();
      if (data) {
        setPackageRatings(data);
      } else {
        setPackageRatings("No ratings yet!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkRatingGiven = async () => {
    try {
      const res = await fetch(
        `/api/rating/rating-given/${currentUser?._id}/${params?.id}`
      );
      const data = await res.json();
      setRatingGiven(data?.given);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (params.id) {
      getPackageData();
      getRatings();
    }
    if (currentUser) {
      checkRatingGiven();
    }
  }, [params.id, currentUser]);
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
              <div className="flex items-center justify-center my-2">
                <Rating
                  value={packageData?.packageRating || 0}
                  readOnly
                  precision={0.1}
                />
                <p>({packageData?.packageTotalRatings})</p>
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
      {/* give rating/review */}
      <div className="w-full flex flex-col py-16 items-center">
        {packageRatings && (
          <>
            <h4 className="text-xl">Rating/Reviews:</h4>
            <div
              className={`w-full sm:max-w-[640px] gap-2 ${
                !currentUser || ratingGiven
                  ? "hidden"
                  : "flex flex-col items-center"
              } `}
            >
              <Rating
                name="simple-controlled"
                className="w-max"
                value={ratingsData?.rating}
                onChange={(e, newValue) => {
                  setRatingsData({
                    ...ratingsData,
                    rating: newValue,
                  });
                }}
              />
              <textarea
                className="w-full resize-none p-3 border border-black rounded"
                rows={3}
                placeholder="Review"
                value={ratingsData?.review}
                onChange={(e) => {
                  setRatingsData({
                    ...ratingsData,
                    review: e.target.value,
                  });
                }}
              ></textarea>
              <button
                disabled={
                  (ratingsData.rating === 0 && ratingsData.review === "") ||
                  loading
                }
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  giveRating();
                }}
                className="w-full p-2 bg-[#EB662B] text-white rounded disabled:opacity-80 hover:opacity-95"
              >
                {loading ? "Loading..." : "Submit"}
              </button>
              <hr />
            </div>

            <div className="mt-3 w-full gap-2 grid 2xl:grid-cols-6 xl:grid-cols-5 xlplus:grid-cols-4 lg:grid-cols-3 md:grid-cols-2">
              <RatingCard packageRatings={packageRatings} />
              {packageData.packageTotalRatings > 4 && (
                <button
                  onClick={() => navigate(`/package/ratings/${params?.id}`)}
                  className="flex items-center justify-center text-lg gap-2 p-2 rounded border hover:bg-slate-500 hover:text-white"
                >
                  View All <FaArrowRight />
                </button>
              )}
            </div>
          </>
        )}
        {(!currentUser || currentUser === null) && (
          <button
            onClick={() => {
              navigate("/login");
            }}
            className="p-2 rounded text-white bg-green-700"
          >
            Rate Package
          </button>
        )}
      </div>

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
