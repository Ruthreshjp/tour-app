import { Link } from "react-router-dom";

const TravelOwn = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 pt-20">
      <div className="max-w-7xl mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold text-[#EB662B] mb-6">
          Plan your trip by own without any cost and find..!
        </h1>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            to="/travel-own/hotels"
            className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
          >
            Hotels
          </Link>
          <Link
            to="/travel-own/restaurants"
            className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
          >
            Restaurants
          </Link>
          <Link
            to="/travel-own/shopping"
            className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
          >
            Shopping
          </Link>
          <Link
            to="/travel-own/cabs"
            className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
          >
            Cabs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TravelOwn;