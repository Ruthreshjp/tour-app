// src/App.jsx
import { useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Header from "./pages/components/Header";
import Profile from "./pages/Profile";
import About from "./pages/About";
import PrivateRoute from "./pages/Routes/PrivateRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UpdatePackage from "./pages/admin/UpdatePackage";
import Package from "./pages/Package";
import RatingsPage from "./pages/RatingsPage";
import Booking from "./pages/user/Booking";
import Search from "./pages/Search";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./pages/components/Footer";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import "leaflet/dist/leaflet.css";
import { FaRobot } from "react-icons/fa";
import BusinessSignup from "./pages/business/BusinessSignup";
import BusinessLogin from "./pages/business/BusinessLogin";
import TravelOwn from "./pages/TravelOwn/TravelOwn";
import Hotels from "./pages/TravelOwn/Hotels";
import Restaurants from "./pages/TravelOwn/Restaurants";
import Shopping from "./pages/TravelOwn/Shopping";
import Cab from "./pages/TravelOwn/Cab";
import CabBooking from "./pages/TravelOwn/CabBooking";
import Cafe from "./pages/TravelOwn/Cafe";

const App = () => {
  const [showModal, setShowModal] = useState(false);
  const [aiReply, setAIReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [defaultPrompt, setDefaultPrompt] = useState("");
  const handleAsk = async (question) => {
    setLoading(true);
    try {
      const res = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`,
        method: "post",
        data: {
          contents: [
            {
              parts: [{ text: question }],
            },
          ],
        },
      });
      const response = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
      setAIReply(response || "No answer from AI.");
    } catch (error) {
      console.log(error);
      setAIReply("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <BrowserRouter>
        <Header />
        <div className="min-h-screen pt-[100px]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/search" element={<Search />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/business-login" element={<BusinessLogin />} />
            <Route path="/business/signup" element={<BusinessSignup />} />
            <Route path="/travel-own/*" element={<TravelOwn />}>
              <Route index element={<Hotels />} />
              <Route path="hotels" element={<Hotels />} />
              <Route path="restaurants" element={<Restaurants />} />
              <Route path="shopping" element={<Shopping />} />
              <Route path="cab" element={<Cab />} />
              <Route path="cab/:id/book" element={<CabBooking />} />
              <Route path="cafe" element={<Cafe />} />
            </Route>
            <Route path="/profile" element={<PrivateRoute />}>
              <Route path="user" element={<Profile />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
            <Route path="/profile/admin/update-package/:id" element={<PrivateRoute />}>
              <Route path="" element={<UpdatePackage />} />
            </Route>
            <Route path="/about" element={<About />} />
            <Route path="/package/:id" element={<Package />} />
            <Route path="/package/ratings/:id" element={<RatingsPage />} />
            <Route path="/booking" element={<PrivateRoute />}>
              <Route path=":packageId" element={<Booking />} />
            </Route>
          </Routes>
        </div>
        <ToastContainer />
        <Footer />
      </BrowserRouter>
    </>
  );
};

export default App;