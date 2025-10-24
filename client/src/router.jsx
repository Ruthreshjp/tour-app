import { 
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate
} from "react-router-dom";
import ErrorBoundary from "./pages/components/ErrorBoundary";
import NotFound from "./pages/components/NotFound";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import About from "./pages/About";
import PrivateRoute from "./pages/Routes/PrivateRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UpdatePackage from "./pages/admin/UpdatePackage";
import Search from "./pages/Search";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import RatingsPage from "./pages/RatingsPage";
import TravelOwn from "./pages/TravelOwn/TravelOwn";
import Hotels from "./pages/TravelOwn/Hotels";
import Restaurants from "./pages/TravelOwn/Restaurants";
import Cafe from "./pages/TravelOwn/Cafe";
import Shopping from "./pages/TravelOwn/Shopping";
import Cab from "./pages/TravelOwn/Cab";
import CabBooking from "./pages/TravelOwn/CabBooking";
import Package from "./pages/Package";
import Booking from "./pages/user/Booking";
import BookingInfo from "./pages/components/Booking";
import PaymentPage from "./pages/PaymentPage";
import RootLayout from "./pages/components/RootLayout";
import BusinessLayout from "./pages/components/BusinessLayout";
import BusinessLogin from "./pages/business/BusinessLogin";
import BusinessRegister from "./pages/business/BusinessRegister";
import BusinessDashboard from "./pages/business/BusinessDashboard";
import BusinessListings from "./pages/business/BusinessListings";
import BusinessBookings from "./pages/business/BusinessBookings";
import BusinessSetupWizard from "./pages/business/BusinessSetupWizard";
import BusinessNotifications from "./pages/business/BusinessNotifications";
import AnalyticsViews from "./pages/business/AnalyticsViews";
import AnalyticsBookings from "./pages/business/AnalyticsBookings";
import AnalyticsRatings from "./pages/business/AnalyticsRatings";
import BusinessPrivateRoute from "./pages/Routes/BusinessPrivateRoute";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />} errorElement={<ErrorBoundary />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="contact" element={<Contact />} />
      <Route path="blog" element={<Blog />} />
      <Route path="ratings" element={<RatingsPage />} />
      <Route path="payment/:bookingId" element={<PaymentPage />} />
      <Route path="booking" element={<BookingInfo />} />
      <Route path="search" element={<Search />} />
      <Route path="about" element={<About />} />
      
      {/* Business routes - separate layout without navbar */}
      <Route path="business" element={<BusinessLayout />} errorElement={<ErrorBoundary />}>
        <Route path="login" element={<BusinessLogin />} />
        <Route path="register" element={<BusinessRegister />} />
        <Route element={<BusinessPrivateRoute />} errorElement={<ErrorBoundary />}>
          <Route path="dashboard" element={<BusinessDashboard />} />
          <Route path="listings" element={<BusinessListings />} />
          <Route path="bookings" element={<BusinessBookings />} />
          <Route path="setup" element={<BusinessSetupWizard />} />
          <Route path="notifications" element={<BusinessNotifications />} />
          <Route path="analytics/views" element={<AnalyticsViews />} />
          <Route path="analytics/bookings" element={<AnalyticsBookings />} />
          <Route path="analytics/ratings" element={<AnalyticsRatings />} />
        </Route>
      </Route>
      
      {/* Travel routes */}
      <Route path="travel-own" element={<TravelOwn />} errorElement={<ErrorBoundary />}>
        <Route index element={<Hotels />} />
        <Route path="hotels" element={<Hotels />} />
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="shopping" element={<Shopping />} />
        <Route path="cab" element={<Cab />} />
        <Route path="cab/:id/book" element={<CabBooking />} />
        <Route path="cafe" element={<Cafe />} />
      </Route>

      {/* Profile routes */}
      <Route element={<PrivateRoute />} errorElement={<ErrorBoundary />}>
        <Route path="profile/user" element={<Profile />} />
        <Route path="profile/admin" element={<AdminDashboard />} />
        <Route path="profile/admin/update-package/:id" element={<UpdatePackage />} />
      </Route>

      {/* Package routes */}
      <Route path="package" errorElement={<ErrorBoundary />}>
        <Route path=":id" element={<Package />} />
        <Route path=":id/ratings" element={<RatingsPage />} />
        <Route element={<PrivateRoute />}>
          <Route path=":id/book" element={<Booking />} />
        </Route>
      </Route>

      {/* 404 and Redirect routes */}
      <Route path="404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_normalizeFormMethod: true
    }
  }
);