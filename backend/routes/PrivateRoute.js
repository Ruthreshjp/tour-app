// src/pages/Routes/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/profile/admin");
  const adminToken = localStorage.getItem("adminToken");
  const isAuthenticated = !!user;
  const isAdmin = isAuthenticated && user.user_role === 1 && adminToken;

  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdminRoute && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default PrivateRoute;