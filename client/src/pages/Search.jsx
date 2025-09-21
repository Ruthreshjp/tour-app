import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SingleCard from "./components/SingleCard";

const Search = () => {
  const navigate = useNavigate();
  const [sideBarSearchData, setSideBarSearchData] = useState({
    searchTerm: "",
    offer: false,
    sort: "created_at",
    order: "desc",
  });
  const [loading, setLoading] = useState(false);
  const [allPackages, setAllPackages] = useState([]);
  const [showMoreBtn, setShowMoreBtn] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const offerFromUrl = urlParams.get("offer");
    const sortFromUrl = urlParams.get("sort");
    const orderFromUrl = urlParams.get("order");

    if (searchTermFromUrl || offerFromUrl || sortFromUrl || orderFromUrl) {
      setSideBarSearchData({
        searchTerm: searchTermFromUrl || "",
        offer: offerFromUrl === "true" ? true : false,
        sort: sortFromUrl || "created_at",
        order: orderFromUrl || "desc",
      });
    }

    const fetchAllPackages = async () => {
      setLoading(true);
      setShowMoreBtn(false);
      try {
        const searchQuery = urlParams.toString();
        const res = await fetch(`/api/package/get-packages?${searchQuery}`);
        const data = await res.json();
        setLoading(false);
        setAllPackages(data?.packages);
        if (data?.packages?.length > 8) {
          setShowMoreBtn(true);
        } else {
          setShowMoreBtn(false);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllPackages();
  }, [location.search]);

  const handleChange = (e) => {
    if (e.target.id === "searchTerm") {
      setSideBarSearchData({
        ...sideBarSearchData,
        searchTerm: e.target.value,
      });
    }
    if (e.target.id === "offer") {
      setSideBarSearchData({
        ...sideBarSearchData,
        [e.target.id]:
          e.target.checked || e.target.checked === "true" ? true : false,
      });
    }
    if (e.target.id === "sort_order") {
      const sort = e.target.value.split("_")[0] || "created_at";
      const order = e.target.value.split("_")[1] || "desc";
      setSideBarSearchData({ ...sideBarSearchData, sort, order });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set("searchTerm", sideBarSearchData.searchTerm);
    urlParams.set("offer", sideBarSearchData.offer);
    urlParams.set("sort", sideBarSearchData.sort);
    urlParams.set("order", sideBarSearchData.order);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreSClick = async () => {
    const numberOfPackages = allPackages.length;
    const startIndex = numberOfPackages;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`/api/package/get-packages?${searchQuery}`);
    const data = await res.json();
    if (data?.packages?.length < 9) {
      setShowMoreBtn(false);
    }
    setAllPackages([...allPackages, ...data?.packages]);
  };

  return (
    <div className="w-full">
      <div className="max-w-[1080px] w-[90%] mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-[300px] md:min-w-[300px] bg-white rounded-lg shadow-md p-6">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Search:</label>
                <input
                  type="text"
                  id="searchTerm"
                  placeholder="Search packages..."
                  className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-[#EB662B] focus:border-transparent"
                  value={sideBarSearchData.searchTerm}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="font-semibold">Special Offers Only:</label>
                <input
                  type="checkbox"
                  id="offer"
                  className="w-5 h-5 accent-[#EB662B]"
                  checked={sideBarSearchData.offer}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Sort By:</label>
                <select
                  onChange={handleChange}
                  defaultValue={"created_at_desc"}
                  id="sort_order"
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-[#EB662B] focus:border-transparent"
                >
                  <option value="packagePrice_desc">Price high to low</option>
                  <option value="packagePrice_asc">Price low to high</option>
                  <option value="packageRating_desc">Top Rated</option>
                  <option value="packageTotalRatings_desc">Most Rated</option>
                  <option value="createdAt_desc">Latest</option>
                  <option value="createdAt_asc">Oldest</option>
                </select>
              </div>
              <button className="bg-[#EB662B] rounded-lg text-white p-3 uppercase hover:opacity-95 font-semibold transition-all duration-300 hover:shadow-lg">
                Search Packages
              </button>
            </form>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
              Search Results
            </h1>
            
            {loading ? (
              <div className="w-full flex justify-center">
                <p className="text-xl text-gray-600">Loading...</p>
              </div>
            ) : allPackages.length === 0 ? (
              <div className="w-full flex justify-center">
                <p className="text-xl text-gray-600">No Packages Found!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allPackages.map((packageData, i) => (
                  <SingleCard key={i} packageData={packageData} />
                ))}
              </div>
            )}

            {showMoreBtn && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={onShowMoreSClick}
                  className="bg-[#EB662B] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all duration-300"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;