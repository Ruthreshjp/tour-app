import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { API_BASE } from "../../utils/apiBase";

export default function AdminRoute() {
  const { currentUser } = useSelector((state) => state.user);
  const [ok, setOk] = useState(null); // null = loading, true = admin, false = not admin

  const authCheck = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/admin-auth`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      if (data?.check === true) {
        setOk(true);
      } else {
        setOk(false);
      }
    } catch (error) {
      console.error('Admin auth check failed:', error);
      setOk(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      authCheck();
    } else {
      setOk(false);
    }
  }, [currentUser]);

  // Loading state
  if (ok === null) return <Spinner />;
  
  // Not admin - redirect to home
  if (ok === false) return <Navigate to="/" />;
  
  // Is admin - show protected content
  return <Outlet />;
}
