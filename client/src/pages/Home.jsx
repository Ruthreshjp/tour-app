import React, { useCallback, useEffect, useState } from "react";
import "./styles/Home.css";
import { FaCalendar, FaSearch, FaStar } from "react-icons/fa";
import { FaRankingStar } from "react-icons/fa6";
import { LuBadgePercent } from "react-icons/lu";
import { useNavigate } from "react-router";
import Services from "./components/Services";
import Top from "./components/Top";
import Booking from "./components/Booking";
import HeroImage from "./components/HeroImage";
import Offers from "./components/Offers";
import SingleCard from "./components/SingleCard";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [topPackages, setTopPackages] = useState([]);
  const [latestPackages, setLatestPackages] = useState([]);
  const [offerPackages, setOfferPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const getTopPackages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "/api/package/get-packages?sort=packageRating&limit=8"
      );
      const data = await res.json();
      if (data?.success) {
        setTopPackages(data?.packages);
        setLoading(false);
      } else {
        setLoading(false);
        alert(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
    }
  }, [topPackages]);

  const getLatestPackages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "/api/package/get-packages?sort=createdAt&limit=8"
      );
      const data = await res.json();
      if (data?.success) {
        setLatestPackages(data?.packages);
        setLoading(false);
      } else {
        setLoading(false);
        alert(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
    }
  }, [latestPackages]);

  const getOfferPackages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "/api/package/get-packages?sort=createdAt&offer=true&limit=6"
      );
      const data = await res.json();
      if (data?.success) {
        setOfferPackages(data?.packages);
        setLoading(false);
      } else {
        setLoading(false);
        alert(data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
    }
  }, [offerPackages]);

  useEffect(() => {
    getTopPackages();
    getLatestPackages();
    getOfferPackages();
  }, []);

  return (
    <div className="main w-full">
      <HeroImage />

      <Services />
      <Top />
      <Booking />
      <div className="w-full flex flex-col">
        <div className="backaground_image w-full flex flex-col">
          <h2 className="hidden lg:block text-3xl md:text-4xl font-bold text-yellow-500 mt-16 ml-4">
            Find Your Perfect Trip
          </h2>
          <p className=" hidden lg:block text-white text-lg max-w-md mt-3 ml-4">
            Explore top-rated destinations, discover the best travel offers, and
            stay up to date with the latest trips. We make booking your next
            adventure simple and fast.
          </p>
        </div>
        <div className="top-part w-full mx-auto gap-2 flex flex-col items-center justify-center ">
          <h1 className="text-white text-4xl text-center font-bold underline mb-2">
            Discover the World, One Journey at a Time
          </h1>
          <h1 className="text-white text-sm text-center xsm:text-lg font-semibold">
            Make Your Travel Dream Come True With Trevo
          </h1>
          <div className="w-full flex justify-center items-center gap-2 mt-8">
            <input
              type="text"
              className="rounded-lg outline-none w-[230px] sm:w-2/5 p-2 border border-black bg-opacity-40 bg-white text-white placeholder:text-white font-semibold"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            <button
              onClick={() => {
                navigate(`/search?searchTerm=${search}`);
              }}
              className="bg-white w-10 h-10 flex justify-center items-center text-xl font-semibold rounded-full hover:scale-95"
            >
              Go
              {/* <FaSearch className="" /> */}
            </button>
          </div>

          <div className="w-[90%] max-w-xl flex justify-center mt-10">
            <button
              onClick={() => {
                navigate("/search?offer=true");
              }}
              className="flex items-center justify-around gap-x-1 bg-slate-400 text-white p-2 py-1 text-[8px] xxsm:text-sm sm:text-lg border-e border-white rounded-s-full flex-1 hover:scale-105 transition-all duration-150"
            >
              Special Offers
              <LuBadgePercent className="text-2xl" />
            </button>
            <button
              onClick={() => {
                navigate("/search?sort=packageRating");
              }}
              className="flex items-center justify-around gap-x-1 bg-slate-400 text-white p-2 py-1 text-[8px] xxsm:text-sm sm:text-lg border-x border-white flex-1 hover:scale-105 transition-all duration-150"
            >
              Top Rated
              <FaStar className="text-2xl" />
            </button>
            <button
              onClick={() => {
                navigate("/search?sort=createdAt");
              }}
              className="flex items-center justify-around gap-x-1 bg-slate-400 text-white p-2 py-1 text-[8px] xxsm:text-sm sm:text-lg border-x border-white flex-1 hover:scale-105 transition-all duration-150"
            >
              Latest
              <FaCalendar className="text-lg" />
            </button>
            <button
              onClick={() => {
                navigate("/search?sort=packageTotalRatings");
              }}
              className="flex items-center justify-around gap-x-1 bg-slate-400 text-white p-2 py-1 text-[8px] xxsm:text-sm sm:text-lg border-s border-white rounded-e-full flex-1 hover:scale-105 transition-all duration-150"
            >
              Most Rated
              <FaRankingStar className="text-2xl" />
            </button>
          </div>
        </div>
        {/* main page */}
        <div className="main p-6 flex flex-col gap-5">
          {loading && <h1 className="text-center text-2xl">Loading...</h1>}
          {!loading &&
            topPackages.length === 0 &&
            latestPackages.length === 0 &&
            offerPackages.length === 0 && (
              <h1 className="text-center text-2xl">No Packages Yet!</h1>
            )}
          {/* Top Rated */}
          {!loading && topPackages.length > 0 && (
            <>
              <h1 className="text-2xl font-semibold">Top Packages</h1>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.1, // delay between cards
                    },
                  },
                }}
              >
                {topPackages.map((packageData, i) => {
                  return <SingleCard key={i} packageData={packageData} />;
                })}
              </motion.div>
              <div className="bg-[#EB662B] w-full h-[162px] flex flex-col md:flex-row items-center justify-around rounded-md">
                <h2 className="text-white text-base md:text-lg font-semibold">
                  Early Booking Discounts Up To 50%!
                </h2>
                <Link
                  to="/search?offer=true"
                  className="text-[#EB662B] bg-white px-6 py-2 rounded-md"
                >
                  Book Now
                </Link>
              </div>
            </>
          )}
          {/* Top Rated */}
          {/* latest */}
          {!loading && latestPackages.length > 0 && (
            <>
              <h1 className="text-2xl font-semibold">Latest Packages</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 my-1">
                {latestPackages.map((packageData, i) => {
                  return <SingleCard key={i} packageData={packageData} />;
                })}
              </div>
              <div className="bg-[#EB662B] w-full h-[162px] flex flex-col md:flex-row items-center justify-around rounded-md px-1">
                <h2 className="text-white text-base md:text-lg font-semibold">
                  Check our latest packages and book now
                </h2>
                <Link
                  to={"/search"}
                  className="text-[#EB662B] bg-white px-6 py-2 rounded-md"
                >
                  Book Now
                </Link>
              </div>
            </>
          )}
          {/* latest */}
          {/* offer */}
          {!loading && offerPackages.length > 0 && (
            <>
              <h1 className="text-2xl text-[#05073C] font-semibold">
                Special Offers
              </h1>
              <div className="grid gird-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 my-3">
                {offerPackages.map((packageData, i) => {
                  return <Offers key={i} packageData={packageData} />;
                })}
              </div>
            </>
          )}
          {/* offer */}
        </div>
      </div>
    </div>
  );
};

export default Home;
